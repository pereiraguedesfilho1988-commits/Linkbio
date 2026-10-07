import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SiteConfig } from '../types/siteConfig';
import {
  saveConfigToStorage,
  loadConfigFromLocalStorage,
  loadFromIndexedDB,
  saveToIndexedDB,
} from './storage';

export { loadFromIndexedDB, saveToIndexedDB };

const SUPABASE_URL_KEY = 'void_supabase_url';
const SUPABASE_KEY_KEY = 'void_supabase_anon_key';

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  let url = '';
  let anonKey = '';

  if (typeof window !== 'undefined') {
    url = localStorage.getItem(SUPABASE_URL_KEY) || '';
    anonKey = localStorage.getItem(SUPABASE_KEY_KEY) || '';
  }

  // Fallback to environment variables (e.g. on Netlify or Vite env)
  if (!url && typeof import.meta !== 'undefined' && import.meta.env) {
    url = import.meta.env.VITE_SUPABASE_URL || '';
  }
  if (!anonKey && typeof import.meta !== 'undefined' && import.meta.env) {
    anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  }

  return { url: url.trim(), anonKey: anonKey.trim() };
}

export function isSupabaseConfigured(customUrl?: string, customKey?: string): boolean {
  const creds = customUrl !== undefined && customKey !== undefined
    ? { url: customUrl.trim(), anonKey: customKey.trim() }
    : getSupabaseCredentials();

  if (!creds.url || !creds.anonKey) return false;

  const urlLower = creds.url.toLowerCase();
  const keyLower = creds.anonKey.toLowerCase();

  // Guard against placeholders
  if (
    urlLower.includes('your-project') ||
    urlLower.includes('example.com') ||
    keyLower.includes('your-anon-public-key') ||
    creds.anonKey.length < 20
  ) {
    return false;
  }

  try {
    const parsed = new URL(creds.url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SUPABASE_URL_KEY, url.trim());
    localStorage.setItem(SUPABASE_KEY_KEY, anonKey.trim());
  }
}

export function clearSupabaseCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SUPABASE_URL_KEY);
    localStorage.removeItem(SUPABASE_KEY_KEY);
  }
}

let cachedClient: SupabaseClient | null = null;
let cachedCredentialsHash = '';

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const { url, anonKey } = getSupabaseCredentials();
  const hash = `${url}_${anonKey}`;
  if (cachedClient && cachedCredentialsHash === hash) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    cachedCredentialsHash = hash;
    return cachedClient;
  } catch (err) {
    console.warn('Não foi possível inicializar cliente Supabase:', err);
    return null;
  }
}

export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!url || !anonKey) {
      return { success: false, message: 'URL e Anon Key do Supabase são obrigatórios.' };
    }

    if (!isSupabaseConfigured(url, anonKey)) {
      return {
        success: false,
        message: 'A URL ou Chave informada parece ser um placeholder. Forneça as credenciais reais do seu painel Supabase (ex: https://seuprojeto.supabase.co).',
      };
    }

    const testClient = createClient(url.trim(), anonKey.trim());
    const { error } = await testClient.from('site_config').select('id').limit(1);

    if (error) {
      // If table doesn't exist yet, it's still connected to Supabase project
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('not found')) {
        return {
          success: true,
          message: 'Conectado com sucesso ao projeto Supabase! A tabela "site_config" ainda precisa ser criada (use o script SQL abaixo).',
        };
      }
      return {
        success: false,
        message: `Aviso do Supabase: ${error.message} (Código: ${error.code || 'N/A'})`,
      };
    }

    return {
      success: true,
      message: 'Conexão com o Supabase estabelecida com sucesso e tabela pronta para sincronizar!',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
      return {
        success: false,
        message: 'Falha ao conectar com o Supabase: Servidor inacessível ou URL incorreta. Verifique se o endereço do projeto está correto.',
      };
    }
    return {
      success: false,
      message: `Falha na conexão: ${errorMsg}`,
    };
  }
}

export async function fetchSiteConfigFromSupabase(): Promise<SiteConfig | null> {
  if (!isSupabaseConfigured()) return null;

  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('site_config')
      .select('data')
      .eq('id', 'main')
      .single();

    if (error) {
      return null;
    }

    if (data && data.data) {
      return data.data as SiteConfig;
    }
    return null;
  } catch (err) {
    console.warn('Aviso: Não foi possível sincronizar do Supabase no momento:', err);
    return null;
  }
}

export async function saveSiteConfigToSupabase(
  config: SiteConfig
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase não configurado' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Cliente Supabase não inicializado' };
  }

  try {
    const { error } = await client.from('site_config').upsert({
      id: 'main',
      data: config,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
      return {
        success: false,
        error: 'Servidor Supabase offline ou inacessível no momento. Seus dados foram salvos localmente com segurança!',
      };
    }
    return { success: false, error: errorMsg };
  }
}

export function getLocalConfig(): SiteConfig | null {
  return loadConfigFromLocalStorage();
}

export function saveLocalConfig(config: SiteConfig): void {
  saveConfigToStorage(config);
}

export function getSupabaseSqlInstructions(): string {
  return `-- EXECUTE ESTE SCRIPT NO "SQL EDITOR" DO SEU PAINEL SUPABASE:

-- 1. Cria a tabela para guardar as configurações da página pública
CREATE TABLE IF NOT EXISTS public.site_config (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Habilita Row Level Security (RLS)
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- 3. Permite que qualquer visitante LEIA a configuração pública do site
CREATE POLICY "Permitir leitura pública da configuração"
  ON public.site_config
  FOR SELECT
  USING (true);

-- 4. Permite gravação/atualização (Upsert)
CREATE POLICY "Permitir atualização de configuração"
  ON public.site_config
  FOR ALL
  USING (true)
  WITH CHECK (true);
`;
}
