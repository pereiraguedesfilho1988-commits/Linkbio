import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SiteConfig } from '../types/siteConfig';
import { DEFAULT_SITE_CONFIG } from '../data/defaultConfig';
import {
  getLocalConfig,
  saveLocalConfig,
  loadFromIndexedDB,
  fetchSiteConfigFromSupabase,
  saveSiteConfigToSupabase,
  getSupabaseClient,
  isSupabaseConfigured,
} from '../lib/supabase';

interface SiteConfigContextType {
  config: SiteConfig;
  updateConfig: (updater: (prev: SiteConfig) => SiteConfig) => void;
  saveConfig: (newConfig?: SiteConfig) => Promise<{ success: boolean; error?: string }>;
  resetToDefaults: () => void;
  isSaving: boolean;
  lastSaved: Date | null;
  supabaseStatus: 'connected' | 'error' | 'unconfigured';
  refreshFromSupabase: () => Promise<void>;
  checkSupabaseHealth: () => Promise<void>;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>(() => {
    const local = getLocalConfig();
    if (!local) return DEFAULT_SITE_CONFIG;

    // Check if any of the requested principal networks are missing
    const hasTiktok = local.socialButtons?.some((b) => b.id === 'tiktok');
    const hasX = local.socialButtons?.some((b) => b.id === 'x');
    if (!hasTiktok || !hasX) {
      const mergedButtons = [...(local.socialButtons || [])];
      if (!hasTiktok) {
        const tiktokBtn = DEFAULT_SITE_CONFIG.socialButtons.find((b) => b.id === 'tiktok');
        if (tiktokBtn) mergedButtons.push(tiktokBtn);
      }
      if (!hasX) {
        const xBtn = DEFAULT_SITE_CONFIG.socialButtons.find((b) => b.id === 'x');
        if (xBtn) mergedButtons.push(xBtn);
      }
      return {
        ...local,
        socialButtons: mergedButtons,
      };
    }

    return local;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'error' | 'unconfigured'>(() =>
    isSupabaseConfigured() ? 'connected' : 'unconfigured'
  );

  const checkSupabaseHealth = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setSupabaseStatus('unconfigured');
      return;
    }
    const client = getSupabaseClient();
    if (!client) {
      setSupabaseStatus('error');
      return;
    }
    try {
      const { error } = await client.from('site_config').select('id').limit(1);
      if (error && error.code !== '42P01') {
        setSupabaseStatus('error');
      } else {
        setSupabaseStatus('connected');
      }
    } catch {
      setSupabaseStatus('error');
    }
  }, []);

  const refreshFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const remoteConfig = await fetchSiteConfigFromSupabase();
      if (remoteConfig) {
        setConfig((prev) => ({
          ...prev,
          ...remoteConfig,
        }));
        saveLocalConfig(remoteConfig);
      }
    } catch (err) {
      console.warn('Aviso: Não foi possível sincronizar dados do Supabase:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    loadFromIndexedDB().then((idbData) => {
      if (isMounted && idbData) {
        setConfig((prev) => ({
          ...prev,
          ...idbData,
        }));
      }
    }).catch(() => {});

    if (isSupabaseConfigured()) {
      checkSupabaseHealth();
      refreshFromSupabase();
    } else {
      setSupabaseStatus('unconfigured');
    }

    return () => {
      isMounted = false;
    };
  }, [checkSupabaseHealth, refreshFromSupabase]);

  const updateConfig = (updater: (prev: SiteConfig) => SiteConfig) => {
    setConfig((prev) => {
      const next = updater(prev);
      saveLocalConfig(next);
      return next;
    });
  };

  const saveConfig = async (newConfig?: SiteConfig): Promise<{ success: boolean; error?: string }> => {
    setIsSaving(true);
    const configToSave = newConfig || config;
    saveLocalConfig(configToSave);
    setLastSaved(new Date());

    if (isSupabaseConfigured()) {
      try {
        const { error } = await saveSiteConfigToSupabase(configToSave);
        setIsSaving(false);
        if (error) {
          return {
            success: true,
            error: 'Salvo localmente! Aviso do Supabase: ' + error,
          };
        }
        return { success: true };
      } catch (err: unknown) {
        setIsSaving(false);
        const errorMsg = err instanceof Error ? err.message : String(err);
        return {
          success: true,
          error: `Salvo offline! Erro ao enviar para Supabase: ${errorMsg}`,
        };
      }
    }

    setIsSaving(false);
    return { success: true };
  };

  const resetToDefaults = () => {
    setConfig(DEFAULT_SITE_CONFIG);
    saveLocalConfig(DEFAULT_SITE_CONFIG);
  };

  return (
    <SiteConfigContext.Provider
      value={{
        config,
        updateConfig,
        saveConfig,
        resetToDefaults,
        isSaving,
        lastSaved,
        supabaseStatus,
        refreshFromSupabase,
        checkSupabaseHealth,
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig deve ser usado dentro de um SiteConfigProvider');
  }
  return context;
};
