import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, ShieldCheck, Key, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginProps {
  onBackToPublic: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToPublic }) => {
  const { loginWithMasterPassword, loginWithSupabase, masterPasswordHint } = useAuth();
  const [activeTab, setActiveTab] = useState<'master' | 'supabase'>('master');
  const [masterPassword, setMasterPassword] = useState('');
  const [supabaseEmail, setSupabaseEmail] = useState('');
  const [supabasePassword, setSupabasePassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMasterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!masterPassword) {
      setErrorMsg('Por favor, informe a senha de acesso.');
      return;
    }

    const success = loginWithMasterPassword(masterPassword);
    if (!success) {
      setErrorMsg('Senha incorreta. Tente novamente ou use a senha padrão inicial "admin123".');
    }
  };

  const handleSupabaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!supabaseEmail || !supabasePassword) {
      setErrorMsg('Informe e-mail e senha cadastrados no Supabase.');
      return;
    }

    setIsLoading(true);
    const res = await loginWithSupabase(supabaseEmail, supabasePassword);
    setIsLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Falha ao autenticar com Supabase.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#121316] via-[#090a0c] to-[#040405] text-zinc-100 flex flex-col items-center justify-center p-4 selection:bg-purple-500/30">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back button */}
        <button
          onClick={onBackToPublic}
          className="mb-6 flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Voltar para a Página Pública</span>
        </button>

        {/* Card */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Painel Admin
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Privado
                </span>
              </h1>
              <p className="text-xs text-zinc-400">
                Gerencie todos os textos, botões e dados do site
              </p>
            </div>
          </div>

          {/* Tab selector */}
          <div className="grid grid-cols-2 p-1 bg-zinc-950/60 rounded-xl border border-zinc-800/60 mb-6 text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('master');
                setErrorMsg('');
              }}
              className={`py-2 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'master'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              Senha de Acesso
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('supabase');
                setErrorMsg('');
              }}
              className={`py-2 rounded-lg font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'supabase'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Supabase Auth
            </button>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {activeTab === 'master' ? (
            <form onSubmit={handleMasterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Senha do Administrador
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    placeholder="Digite sua senha de acesso"
                    autoFocus
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                  <Lock className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <div className="mt-2 text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>Dica: {masterPasswordHint}</span>
                  <span className="text-zinc-400">admin123</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 cursor-pointer"
              >
                Entrar no Painel
              </button>
            </form>
          ) : (
            <form onSubmit={handleSupabaseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  E-mail do Supabase
                </label>
                <input
                  type="email"
                  value={supabaseEmail}
                  onChange={(e) => setSupabaseEmail(e.target.value)}
                  placeholder="admin@empresa.com"
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Senha do Supabase
                </label>
                <input
                  type="password"
                  value={supabasePassword}
                  onChange={(e) => setSupabasePassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Conectando...' : 'Entrar via Supabase'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Rota Segura: /admin</span>
            <span>Pronto para Netlify & Supabase</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
