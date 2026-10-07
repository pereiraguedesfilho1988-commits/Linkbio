import { SiteConfig } from '../types/siteConfig';

const LOCAL_STORAGE_KEY = 'void_site_config_v2';
const DB_NAME = 'void_local_db';
const STORE_NAME = 'site_config';
const DB_VERSION = 1;

/**
 * Open or create the IndexedDB instance
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não suportado'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error || new Error('Erro ao abrir IndexedDB'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Save configuration to IndexedDB (virtually unlimited quota for images & full data)
 */
export async function saveToIndexedDB(config: SiteConfig): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ id: 'main', data: config, updatedAt: new Date().toISOString() });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Não foi possível salvar no IndexedDB:', err);
  }
}

/**
 * Load configuration from IndexedDB
 */
export async function loadFromIndexedDB(): Promise<SiteConfig | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('main');

      req.onsuccess = () => {
        if (req.result && req.result.data) {
          resolve(req.result.data as SiteConfig);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Clean up obsolete or duplicate keys from localStorage to prevent quota exhaustion
 */
export function purgeObsoleteStorageKeys(): void {
  if (typeof window === 'undefined') return;
  const legacyKeys = [
    'void_profile_image',
    'void_about_data',
    'void_bg_image',
    'void_bg_opacity',
    'void_bg_blur',
    'void_site_config',
    'void_custom_bg_full',
  ];

  for (const k of legacyKeys) {
    try {
      localStorage.removeItem(k);
    } catch {
      // ignore
    }
  }
}

/**
 * Safely save configuration to localStorage without throwing QuotaExceededError.
 * Also triggers async save to IndexedDB.
 */
export function saveConfigToStorage(config: SiteConfig): void {
  if (typeof window === 'undefined') return;

  // 1. Asynchronously persist to IndexedDB (handles large images & data without quota limit)
  saveToIndexedDB(config).catch(() => {});

  // 2. Persist to localStorage safely
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
  } catch (err: unknown) {
    console.warn('Quota de localStorage atingida, limpando chaves legadas e otimizando armazenamento...');
    purgeObsoleteStorageKeys();

    try {
      // Try again after purging legacy duplicate keys
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    } catch {
      // If still exceeding (e.g. user has other items on domain), store a lightweight version in localStorage
      // while IndexedDB keeps the 100% full version
      try {
        const lightweightConfig: SiteConfig = {
          ...config,
          profile: {
            ...config.profile,
            // If photo is a giant data URL, omit from localStorage copy (IndexedDB has it)
            photoUrl: config.profile.photoUrl?.startsWith('data:') && config.profile.photoUrl.length > 50000
              ? ''
              : config.profile.photoUrl,
          },
          background: {
            ...config.background,
            customUrl: config.background.customUrl?.startsWith('data:') && config.background.customUrl.length > 50000
              ? ''
              : config.background.customUrl,
          },
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lightweightConfig));
      } catch {
        // If even that fails, do not throw; IndexedDB has saved the state
        console.warn('LocalStorage indisponível, dados salvos exclusivamente no IndexedDB.');
      }
    }
  }
}

/**
 * Synchronously load configuration from localStorage for fast initial render
 */
export function loadConfigFromLocalStorage(): SiteConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as SiteConfig;
    }
  } catch {
    // ignore
  }
  return null;
}
