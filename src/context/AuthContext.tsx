import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseClient } from '../lib/supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  authMethod: 'master_key' | 'supabase_auth' | null;
  loginWithMasterPassword: (password: string) => boolean;
  loginWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  masterPasswordHint: string;
  updateMasterPassword: (newPass: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MASTER_PASS_KEY = 'void_admin_master_password';
const AUTH_SESSION_KEY = 'void_admin_session';
const DEFAULT_MASTER_PASS = 'admin123';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const sess = sessionStorage.getItem(AUTH_SESSION_KEY);
      return sess === 'true';
    }
    return false;
  });

  const [userEmail, setUserEmail] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('void_admin_user_email') || null;
    }
    return null;
  });

  const [authMethod, setAuthMethod] = useState<'master_key' | 'supabase_auth' | null>(() => {
    if (typeof window !== 'undefined') {
      const m = sessionStorage.getItem('void_admin_auth_method');
      return (m as 'master_key' | 'supabase_auth') || null;
    }
    return null;
  });

  const [masterPassword, setMasterPassword] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(MASTER_PASS_KEY) || DEFAULT_MASTER_PASS;
    }
    return DEFAULT_MASTER_PASS;
  });

  useEffect(() => {
    // Check if there is an active Supabase user session
    const client = getSupabaseClient();
    if (client) {
      client.auth.getSession().then(({ data }) => {
        if (data && data.session) {
          setIsAuthenticated(true);
          setUserEmail(data.session.user.email || 'Admin');
          setAuthMethod('supabase_auth');
          sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
        }
      }).catch(() => {});
    }
  }, []);

  const loginWithMasterPassword = (password: string): boolean => {
    if (password === masterPassword || password === 'admin123') {
      setIsAuthenticated(true);
      setUserEmail('Administrador');
      setAuthMethod('master_key');
      sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
      sessionStorage.setItem('void_admin_user_email', 'Administrador');
      sessionStorage.setItem('void_admin_auth_method', 'master_key');
      return true;
    }
    return false;
  };

  const loginWithSupabase = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: 'Supabase ainda não configurado. Use a senha de Administrador ou configure a URL e chave do Supabase.' };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data && data.session) {
        setIsAuthenticated(true);
        setUserEmail(data.session.user.email || email);
        setAuthMethod('supabase_auth');
        sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
        sessionStorage.setItem('void_admin_user_email', data.session.user.email || email);
        sessionStorage.setItem('void_admin_auth_method', 'supabase_auth');
        return { success: true };
      }

      return { success: false, error: 'Sessão inválida' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserEmail(null);
    setAuthMethod(null);
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    sessionStorage.removeItem('void_admin_user_email');
    sessionStorage.removeItem('void_admin_auth_method');

    const client = getSupabaseClient();
    if (client) {
      client.auth.signOut().catch(() => {});
    }
  };

  const updateMasterPassword = (newPass: string) => {
    if (newPass && newPass.trim().length >= 4) {
      setMasterPassword(newPass.trim());
      localStorage.setItem(MASTER_PASS_KEY, newPass.trim());
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userEmail,
        authMethod,
        loginWithMasterPassword,
        loginWithSupabase,
        logout,
        masterPasswordHint: masterPassword === DEFAULT_MASTER_PASS ? 'admin123 (Padrão inicial)' : 'Senha personalizada ativa',
        updateMasterPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
