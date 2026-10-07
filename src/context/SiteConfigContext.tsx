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

// Migrate legacy localStorage keys if present
function getMergedInitialConfig(): SiteConfig {
  const local = getLocalConfig();
  if (local) {
    return {
      ...DEFAULT_SITE_CONFIG,
      ...local,
      profile: { ...DEFAULT_SITE_CONFIG.profile, ...(local.profile || {}) },
      about: { ...DEFAULT_SITE_CONFIG.about, ...(local.about || {}) },
      metrics: {
        ...DEFAULT_SITE_CONFIG.metrics,
        ...(local.metrics || {}),
        companies: { ...DEFAULT_SITE_CONFIG.metrics.companies, ...(local.metrics?.companies || {}) },
        reach: { ...DEFAULT_SITE_CONFIG.metrics.reach, ...(local.metrics?.reach || {}) },
        rating: { ...DEFAULT_SITE_CONFIG.metrics.rating, ...(local.metrics?.rating || {}) },
      },
      background: { ...DEFAULT_SITE_CONFIG.background, ...(local.background || {}) },
    };
  }

  // Check legacy keys safely
  const config = JSON.parse(JSON.stringify(DEFAULT_SITE_CONFIG)) as SiteConfig;
  if (typeof window !== 'undefined') {
    try {
      const legacyPhoto = localStorage.getItem('void_profile_image');
      if (legacyPhoto) config.profile.photoUrl = legacyPhoto;

      const legacyAbout = localStorage.getItem('void_about_data');
      if (legacyAbout) {
        try {
          const parsed = JSON.parse(legacyAbout);
          config.about = { ...config.about, ...parsed };
        } catch {
          // ignore
        }
      }

      const legacyBg = localStorage.getItem('void_bg_image');
      if (legacyBg) {
        config.background.presetId = legacyBg.includes('/') || legacyBg.startsWith('data:') ? 'custom' : (legacyBg as any);
        if (legacyBg.includes('/') || legacyBg.startsWith('data:')) {
          config.background.customUrl = legacyBg;
        }
      }

      const legacyOpacity = localStorage.getItem('void_bg_opacity');
      if (legacyOpacity) {
        const val = parseFloat(legacyOpacity);
        if (!isNaN(val)) config.background.opacity = val;
      }

      const legacyBlur = localStorage.getItem('void_bg_blur');
      if (legacyBlur) {
        const val = parseInt(legacyBlur, 10);
        if (!isNaN(val)) config.background.blur = val;
      }
    } catch {
      // Ignore reading issues on restricted environments
    }
  }

  return config;
}

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>(getMergedInitialConfig);
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
      const remoteData = await fetchSiteConfigFromSupabase();
      if (remoteData) {
        setConfig((prev) => ({
          ...prev,
          ...remoteData,
        }));
        saveLocalConfig(remoteData);
      }
    } catch {
      // Ignore network errors during background refresh
    }
  }, []);

  // On mount, load any rich offline data from IndexedDB, and check Supabase if configured
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
    setConfig((prev) => updater(prev));
  };

  const saveConfig = async (newConfig?: SiteConfig): Promise<{ success: boolean; error?: string }> => {
    setIsSaving(true);
    const configToSave = newConfig || config;

    // 1. Save locally with IndexedDB + safe localStorage
    saveLocalConfig(configToSave);
    setLastSaved(new Date());

    // 2. Also update lightweight legacy keys safely without duplicating giant base64 strings
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('void_bg_opacity', String(configToSave.background.opacity));
        localStorage.setItem('void_bg_blur', String(configToSave.background.blur));
        if (configToSave.profile.photoUrl && !configToSave.profile.photoUrl.startsWith('data:')) {
          localStorage.setItem('void_profile_image', configToSave.profile.photoUrl);
        }
      } catch {
        // Silently handled: quota managed by IndexedDB engine
      }
    }

    // 3. Save to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const sbResult = await saveSiteConfigToSupabase(configToSave);
        setIsSaving(false);
        if (!sbResult.success) {
          return {
            success: true,
            error: `Salvo localmente! Aviso do Supabase: ${sbResult.error}`,
          };
        }
        setSupabaseStatus('connected');
        return { success: true };
      } catch (err: unknown) {
        setIsSaving(false);
        const errMsg = err instanceof Error ? err.message : String(err);
        return {
          success: true,
          error: `Salvo localmente com sucesso! (${errMsg})`,
        };
      }
    }

    setIsSaving(false);
    return { success: true };
  };

  const resetToDefaults = () => {
    setConfig(DEFAULT_SITE_CONFIG);
    saveLocalConfig(DEFAULT_SITE_CONFIG);
    setLastSaved(new Date());
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
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
};
