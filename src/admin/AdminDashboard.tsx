import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Users,
  Share2,
  MessageCircle,
  BookOpen,
  TrendingUp,
  Award,
  Palette,
  Database,
  Save,
  ExternalLink,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Download,
  RefreshCw,
  Copy,
  Check,
  Shield,
  BarChart2,
  Layout,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useAuth } from '../context/AuthContext';
import { SiteConfig, SocialButtonConfig, ServiceOptionConfig, CaseStudyConfig, TestimonialConfig } from '../types/siteConfig';
import { DEFAULT_SITE_CONFIG } from '../data/defaultConfig';
import { AVAILABLE_ICONS, IconName, renderIcon } from '../lib/icons';
import {
  saveSupabaseCredentials,
  getSupabaseCredentials,
  testSupabaseConnection,
  getSupabaseSqlInstructions,
} from '../lib/supabase';
import { compressImage } from '../lib/imageOptimizer';

interface AdminDashboardProps {
  onViewPublic: () => void;
}

type TabKey =
  | 'identity'
  | 'socials'
  | 'services'
  | 'about'
  | 'metrics'
  | 'cases'
  | 'background'
  | 'database';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onViewPublic }) => {
  const {
    config,
    updateConfig,
    saveConfig,
    resetToDefaults,
    isSaving,
    lastSaved,
    supabaseStatus,
    refreshFromSupabase,
    checkSupabaseHealth,
  } = useSiteConfig();
  const { logout, userEmail, updateMasterPassword } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>('identity');
  const [saveToast, setSaveToast] = useState<{ show: boolean; msg: string; isError?: boolean }>({ show: false, msg: '' });

  // Supabase settings state
  const creds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(creds.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(creds.anonKey);
  const [supabaseTesting, setSupabaseTesting] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isPushingToCloud, setIsPushingToCloud] = useState(false);

  // Security password state
  const [newMasterPass, setNewMasterPass] = useState('');
  const [passUpdatedMsg, setPassUpdatedMsg] = useState(false);

  // File input refs for image uploads
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const customBgInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (msg: string, isError = false) => {
    setSaveToast({ show: true, msg, isError });
    setTimeout(() => {
      setSaveToast({ show: false, msg: '', isError: false });
    }, 4000);
  };

  const handleSaveAll = async () => {
    const res = await saveConfig();
    if (res.success) {
      if (res.error) {
        showNotification(res.error, false);
      } else {
        showNotification('Todas as alterações foram salvas com sucesso!');
      }
    } else {
      showNotification(res.error || 'Erro ao salvar alterações.', true);
    }
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showNotification('Otimizando imagem de perfil...');
      const { dataUrl, originalSizeKb, compressedSizeKb } = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85,
      });

      updateConfig((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          photoUrl: dataUrl,
        },
      }));
      showNotification(`Foto de perfil atualizada (${originalSizeKb}KB → ${compressedSizeKb}KB otimizada)!`);
    } catch (err) {
      console.warn('Erro ao processar imagem de perfil:', err);
      showNotification('Falha ao processar imagem. Escolha um arquivo JPG, PNG ou WebP.', true);
    }
  };

  const handleCustomBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showNotification('Otimizando imagem de fundo...');
      const { dataUrl, originalSizeKb, compressedSizeKb } = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.80,
      });

      updateConfig((prev) => ({
        ...prev,
        background: {
          ...prev.background,
          presetId: 'custom',
          customUrl: dataUrl,
        },
      }));
      showNotification(`Imagem de fundo atualizada (${originalSizeKb}KB → ${compressedSizeKb}KB otimizada)!`);
    } catch (err) {
      console.warn('Erro ao processar imagem de fundo:', err);
      showNotification('Falha ao processar imagem de fundo.', true);
    }
  };

  const handleTestSupabase = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      showNotification('Preencha a URL e a Anon Key do Supabase antes de testar.', true);
      return;
    }
    setSupabaseTesting(true);
    setSupabaseTestResult(null);

    saveSupabaseCredentials(supabaseUrl, supabaseAnonKey);
    const result = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setSupabaseTesting(false);
    setSupabaseTestResult(result);

    if (result.success) {
      await checkSupabaseHealth();
      showNotification('Conexão com o Supabase testada com sucesso!');
    }
  };

  const handlePushToCloud = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      showNotification('Preencha a URL e a Anon Key do Supabase antes de enviar dados.', true);
      return;
    }
    setIsPushingToCloud(true);
    saveSupabaseCredentials(supabaseUrl, supabaseAnonKey);
    const res = await saveConfig();
    setIsPushingToCloud(false);
    if (res.success && !res.error) {
      await checkSupabaseHealth();
      showNotification('Todos os dados foram enviados e sincronizados com o Supabase!');
    } else {
      showNotification(res.error || 'Erro ao sincronizar com o Supabase.', true);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(getSupabaseSqlInstructions());
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterPass || newMasterPass.length < 4) {
      showNotification('A senha deve ter pelo menos 4 caracteres.', true);
      return;
    }
    updateMasterPassword(newMasterPass);
    setNewMasterPass('');
    setPassUpdatedMsg(true);
    setTimeout(() => setPassUpdatedMsg(false), 3000);
    showNotification('Senha mestra do painel atualizada!');
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_pagina_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.profile && parsed.about) {
          updateConfig(() => parsed as SiteConfig);
          showNotification('Backup importado com sucesso!');
        } else {
          showNotification('Arquivo JSON inválido ou incompatível.', true);
        }
      } catch (err) {
        showNotification('Erro ao interpretar o arquivo JSON.', true);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#090a0d] text-zinc-100 flex flex-col font-sans selection:bg-purple-500/30">
      {/* Toast Notification */}
      <AnimatePresence>
        {saveToast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              saveToast.isError
                ? 'bg-red-950/90 border-red-500/40 text-red-200'
                : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100'
            } backdrop-blur-xl`}
          >
            {saveToast.isError ? (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span className="text-xs font-medium">{saveToast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-white">Painel de Controle</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25">
                  Admin
                </span>
                {supabaseStatus === 'connected' ? (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Supabase Nuvem
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                    Modo Local
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                Logado como: <span className="text-zinc-300">{userEmail || 'Administrador'}</span>
                {lastSaved && ` • Salvo às ${lastSaved.toLocaleTimeString()}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onViewPublic}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Site Público</span>
            </button>

            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>

            <button
              onClick={logout}
              title="Sair do Painel"
              className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar Tabs + Content Area */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-2.5 sticky top-24 space-y-1">
            {[
              { id: 'identity', label: 'Identidade & Bio', icon: User },
              { id: 'socials', label: 'Links & Redes', icon: Share2 },
              { id: 'services', label: 'Serviços & Atendimento', icon: BookOpen },
              { id: 'about', label: 'Sobre Mim & Trajetória', icon: Award },
              { id: 'metrics', label: 'Métricas & Contadores', icon: TrendingUp },
              { id: 'cases', label: 'Cases & Depoimentos', icon: Layers },
              { id: 'background', label: 'Aparência & Background 2.5D', icon: Palette },
              { id: 'database', label: 'Supabase & Conexão', icon: Database },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabKey)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm font-semibold'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-zinc-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-zinc-950/60 border border-zinc-800/80 rounded-3xl p-5 sm:p-7 backdrop-blur-sm">

          {/* TAB 1: IDENTIDADE & BIO */}
          {activeTab === 'identity' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-400" />
                  Identidade & Foto de Perfil
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Configure o nome, foto, títulos alternados na animação e os destaques da bio.
                </p>
              </div>

              {/* Photo uploader */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-center gap-5">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-zinc-700 bg-zinc-950 shrink-0 shadow-lg">
                  <img
                    src={config.profile.photoUrl}
                    alt="Preview de Perfil"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <h3 className="text-sm font-semibold text-white">Foto de Apresentação (3D Cutout)</h3>
                  <p className="text-xs text-zinc-400">
                    A foto é exibida com física de paralaxe 2.5D na página pública. Para melhor resultado, use uma foto com fundo transparente ou escuro.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => profilePhotoInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Trocar Foto (Upload)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateConfig((prev) => ({
                          ...prev,
                          profile: { ...prev.profile, photoUrl: '/profile.png' },
                        }));
                        showNotification('Foto restaurada para a original!');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 cursor-pointer"
                    >
                      Restaurar Foto Padrão
                    </button>
                    <input
                      type="file"
                      ref={profilePhotoInputRef}
                      onChange={handleProfilePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Basic Profile Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Nome da Pessoa / Profissional
                  </label>
                  <input
                    type="text"
                    value={config.profile.fullName}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, fullName: e.target.value },
                      }))
                    }
                    placeholder="Ex: José Pereira"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Exibido no Perfil Profissional, vCard, WhatsApp e QR Code.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Nome da Empresa / Agência
                  </label>
                  <input
                    type="text"
                    value={config.profile.companyName}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, companyName: e.target.value },
                        about: { ...prev.about, companyName: e.target.value },
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Tempo de Mercado / Selo de Experiência
                  </label>
                  <input
                    type="text"
                    value={config.profile.experienceYears}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, experienceYears: e.target.value },
                        about: { ...prev.about, experienceYears: e.target.value },
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Telefone para Cartão Digital (vCard)
                  </label>
                  <input
                    type="text"
                    value={config.profile.vCardPhone}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, vCardPhone: e.target.value },
                      }))
                    }
                    placeholder="+55 11 99999-9999"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Roles Animation List */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-white">
                      Cargos Alternados na Animação (Subtítulo dinâmico)
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      O subtítulo da página pública transita suavemente entre estes cargos a cada 3.2 segundos.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateConfig((prev) => ({
                        ...prev,
                        profile: {
                          ...prev.profile,
                          roles: [...prev.profile.roles, 'Novo Cargo Estratégico'],
                        },
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>

                <div className="space-y-2">
                  {config.profile.roles.map((role, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 w-5">#{idx + 1}</span>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => {
                          const newRoles = [...config.profile.roles];
                          newRoles[idx] = e.target.value;
                          updateConfig((prev) => ({
                            ...prev,
                            profile: { ...prev.profile, roles: newRoles },
                            about: { ...prev.about, role: newRoles[0] || prev.about.role },
                          }));
                        }}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                      {config.profile.roles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newRoles = config.profile.roles.filter((_, i) => i !== idx);
                            updateConfig((prev) => ({
                              ...prev,
                              profile: { ...prev.profile, roles: newRoles },
                            }));
                          }}
                          className="p-2 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bio Short Text */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Bio Curta de Destaque
                </label>
                <textarea
                  rows={3}
                  value={config.about.shortBio}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      about: { ...prev.about, shortBio: e.target.value },
                    }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Animated Bio Bullet Points */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-white">
                      3 Destaques Animados da Bio (Carrossel rotativo)
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Itens que rotacionam harmoniosamente com física de transição a cada 5.5s.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateConfig((prev) => ({
                        ...prev,
                        bioItems: [
                          ...prev.bioItems,
                          {
                            id: `item-${Date.now()}`,
                            emoji: '⚡',
                            text: 'Novo destaque estratégico para sua marca',
                          },
                        ],
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Item
                  </button>
                </div>

                <div className="space-y-2.5">
                  {config.bioItems.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.emoji}
                        onChange={(e) => {
                          const updated = [...config.bioItems];
                          updated[idx] = { ...updated[idx], emoji: e.target.value };
                          updateConfig((prev) => ({ ...prev, bioItems: updated }));
                        }}
                        className="w-12 text-center bg-zinc-950 border border-zinc-800 rounded-xl py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                        title="Emoji do marcador"
                      />
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => {
                          const updated = [...config.bioItems];
                          updated[idx] = { ...updated[idx], text: e.target.value };
                          updateConfig((prev) => ({ ...prev, bioItems: updated }));
                        }}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                      {config.bioItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = config.bioItems.filter((_, i) => i !== idx);
                            updateConfig((prev) => ({ ...prev, bioItems: updated }));
                          }}
                          className="p-2 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LINKS & REDES SOCIAIS */}
          {activeTab === 'socials' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-purple-400" />
                    Botões das Principais Redes Sociais
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Redes oficiais com ícones vetoriais originais e cores autênticas de marca: Facebook, Instagram, WhatsApp, YouTube, TikTok, X e Site.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateConfig((prev) => ({
                        ...prev,
                        socialButtons: DEFAULT_SITE_CONFIG.socialButtons,
                      }));
                      showNotification('As 7 redes sociais oficiais foram restauradas com sucesso!');
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Restaura os botões oficiais na ordem: Facebook, Instagram, WhatsApp, YouTube, TikTok, X e Site"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Restaurar 7 Redes Oficiais</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const newBtn: SocialButtonConfig = {
                        id: `btn-${Date.now()}`,
                        name: 'Novo Link',
                        url: 'https://',
                        iconName: 'Site',
                        accentGlow: 'rgba(168, 85, 247, 0.4)',
                        gradientRing: 'from-purple-500 via-indigo-500 to-pink-500',
                        floatDelay: 0,
                        floatDuration: 4.5,
                        active: true,
                      };
                      updateConfig((prev) => ({
                        ...prev,
                        socialButtons: [...prev.socialButtons, newBtn],
                      }));
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/25"
                  >
                    <Plus className="w-4 h-4" /> Adicionar Botão
                  </button>
                </div>
              </div>

              {/* Quick platforms preview & toggles bar */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  As 7 Redes Principais com Ícones Originais:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {[
                    { id: 'facebook', name: 'Facebook', icon: 'Facebook', color: '#1877F2' },
                    { id: 'instagram', name: 'Instagram', icon: 'Instagram', color: '#E1306C' },
                    { id: 'whatsapp', name: 'WhatsApp', icon: 'WhatsApp', color: '#25D366' },
                    { id: 'youtube', name: 'YouTube', icon: 'YouTube', color: '#FF0000' },
                    { id: 'tiktok', name: 'TikTok', icon: 'TikTok', color: '#25F4EE' },
                    { id: 'x', name: 'X', icon: 'X', color: '#FFFFFF' },
                    { id: 'site', name: 'Site', icon: 'Site', color: '#A855F7' },
                  ].map((plat) => {
                    const existing = config.socialButtons.find(
                      (b) => b.id === plat.id || b.iconName.toLowerCase() === plat.id.toLowerCase()
                    );
                    const isActive = existing ? existing.active : false;

                    return (
                      <div
                        key={plat.id}
                        className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                          isActive
                            ? 'bg-zinc-950/80 border-zinc-700 shadow-sm'
                            : 'bg-zinc-950/30 border-zinc-900 opacity-50'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                          style={{
                            backgroundColor: '#14151a',
                            boxShadow: isActive ? `0 0 10px ${plat.color}40` : 'none',
                          }}
                        >
                          {renderIcon(plat.icon, 'w-4 h-4')}
                        </div>
                        <span className="text-[11px] font-bold text-white truncate w-full">
                          {plat.name}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {isActive ? 'Ativo' : 'Oculto'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* List of Configured Social Buttons */}
              <div className="space-y-3.5">
                {config.socialButtons.map((btn, idx) => {
                  const mainIcons: IconName[] = [
                    'Facebook',
                    'Instagram',
                    'WhatsApp',
                    'YouTube',
                    'TikTok',
                    'X',
                    'Site',
                  ];
                  const otherIcons: IconName[] = [
                    'Linkedin',
                    'Send',
                    'Mail',
                    'Phone',
                    'Video',
                    'Music2',
                    'FileText',
                    'Bookmark',
                    'Share2',
                  ];

                  return (
                    <div
                      key={btn.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        btn.active
                          ? 'bg-zinc-900/60 border-zinc-800'
                          : 'bg-zinc-950/40 border-zinc-900 opacity-60'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white border border-white/10"
                            style={{
                              backgroundColor: '#18191e',
                              boxShadow: `0 0 15px ${btn.accentGlow}`,
                            }}
                          >
                            {renderIcon(btn.iconName, 'w-5 h-5')}
                          </div>
                          <div>
                            <input
                              type="text"
                              value={btn.name}
                              onChange={(e) => {
                                const updated = [...config.socialButtons];
                                updated[idx] = { ...updated[idx], name: e.target.value };
                                updateConfig((prev) => ({ ...prev, socialButtons: updated }));
                              }}
                              className="font-bold text-sm bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-purple-500 text-white focus:outline-none"
                            />
                            <span className="text-[10px] text-zinc-400 block">ID: {btn.id}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={btn.active}
                              onChange={(e) => {
                                const updated = [...config.socialButtons];
                                updated[idx] = { ...updated[idx], active: e.target.checked };
                                updateConfig((prev) => ({ ...prev, socialButtons: updated }));
                              }}
                              className="rounded bg-zinc-900 border-zinc-700 text-purple-600 focus:ring-0"
                            />
                            <span>{btn.active ? 'Ativo' : 'Oculto'}</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = config.socialButtons.filter((_, i) => i !== idx);
                              updateConfig((prev) => ({ ...prev, socialButtons: updated }));
                            }}
                            className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                            title="Remover botão"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                            URL / Link de Destino
                          </label>
                          <input
                            type="text"
                            value={btn.url}
                            onChange={(e) => {
                              const updated = [...config.socialButtons];
                              updated[idx] = { ...updated[idx], url: e.target.value };
                              updateConfig((prev) => ({ ...prev, socialButtons: updated }));
                            }}
                            placeholder="https://..."
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                            Ícone Oficial
                          </label>
                          <select
                            value={btn.iconName}
                            onChange={(e) => {
                              const newIcon = e.target.value as IconName;
                              const updated = [...config.socialButtons];

                              // Brand default presets mapping
                              const brandDefaults: Record<string, { glow: string; ring: string }> = {
                                Facebook: { glow: 'rgba(24, 119, 242, 0.45)', ring: 'from-blue-600 via-blue-500 to-sky-400' },
                                Instagram: { glow: 'rgba(225, 48, 108, 0.45)', ring: 'from-pink-500 via-purple-500 to-amber-500' },
                                WhatsApp: { glow: 'rgba(37, 211, 102, 0.45)', ring: 'from-emerald-500 via-green-500 to-teal-400' },
                                Whatsapp: { glow: 'rgba(37, 211, 102, 0.45)', ring: 'from-emerald-500 via-green-500 to-teal-400' },
                                YouTube: { glow: 'rgba(239, 68, 68, 0.45)', ring: 'from-red-600 via-rose-500 to-red-500' },
                                Youtube: { glow: 'rgba(239, 68, 68, 0.45)', ring: 'from-red-600 via-rose-500 to-red-500' },
                                TikTok: { glow: 'rgba(37, 244, 238, 0.45)', ring: 'from-cyan-400 via-pink-500 to-rose-600' },
                                Tiktok: { glow: 'rgba(37, 244, 238, 0.45)', ring: 'from-cyan-400 via-pink-500 to-rose-600' },
                                X: { glow: 'rgba(255, 255, 255, 0.35)', ring: 'from-zinc-100 via-zinc-400 to-zinc-700' },
                                Twitter: { glow: 'rgba(255, 255, 255, 0.35)', ring: 'from-zinc-100 via-zinc-400 to-zinc-700' },
                                Site: { glow: 'rgba(168, 85, 247, 0.4)', ring: 'from-indigo-500 via-purple-500 to-pink-500' },
                                Globe: { glow: 'rgba(168, 85, 247, 0.4)', ring: 'from-indigo-500 via-purple-500 to-pink-500' },
                              };

                              const brandStyle = brandDefaults[newIcon];

                              updated[idx] = {
                                ...updated[idx],
                                iconName: newIcon,
                                ...(brandStyle ? { accentGlow: brandStyle.glow, gradientRing: brandStyle.ring } : {}),
                              };
                              updateConfig((prev) => ({ ...prev, socialButtons: updated }));
                            }}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                          >
                            <optgroup label="Principais Redes Oficiais">
                              {mainIcons.map((name) => (
                                <option key={name} value={name}>
                                  {name}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Outros Ícones">
                              {otherIcons.map((name) => (
                                <option key={name} value={name}>
                                  {name}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: WHATSAPP & SERVIÇOS */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  Conversão Rápida & Serviços WhatsApp
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Gerencie os 3 botões de qualificação de leads rápidos que preparam mensagens automáticas para o WhatsApp.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Número de WhatsApp Padrão para Redirecionamento (Opcional)
                </label>
                <input
                  type="text"
                  value={config.whatsappNumber}
                  onChange={(e) =>
                    updateConfig((prev) => ({ ...prev, whatsappNumber: e.target.value }))
                  }
                  placeholder="Ex: 5511999999999 (DDD + Número sem espaços)"
                  className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Se vazio, o link do WhatsApp abre o WhatsApp permitindo escolher o contato ou usa o link cadastrado no botão de rede social.
                </p>
              </div>

              <div className="space-y-3.5">
                <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                  Botões de Serviços Rápidos
                </h3>

                {config.services.map((srv, idx) => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={srv.emoji}
                          onChange={(e) => {
                            const updated = [...config.services];
                            updated[idx] = { ...updated[idx], emoji: e.target.value };
                            updateConfig((prev) => ({ ...prev, services: updated }));
                          }}
                          className="w-10 text-center bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 text-sm"
                        />
                        <input
                          type="text"
                          value={srv.label}
                          onChange={(e) => {
                            const updated = [...config.services];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            updateConfig((prev) => ({ ...prev, services: updated }));
                          }}
                          placeholder="Título do serviço"
                          className="font-semibold text-xs bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-white flex-1 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={srv.active}
                          onChange={(e) => {
                            const updated = [...config.services];
                            updated[idx] = { ...updated[idx], active: e.target.checked };
                            updateConfig((prev) => ({ ...prev, services: updated }));
                          }}
                          className="rounded bg-zinc-900 border-zinc-700 text-emerald-600 focus:ring-0"
                        />
                        <span>{srv.active ? 'Ativo' : 'Inativo'}</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Mensagem Pré-definida enviada no WhatsApp ao clicar
                      </label>
                      <textarea
                        rows={2}
                        value={srv.messageText}
                        onChange={(e) => {
                          const updated = [...config.services];
                          updated[idx] = { ...updated[idx], messageText: e.target.value };
                          updateConfig((prev) => ({ ...prev, services: updated }));
                        }}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SOBRE & TRAJETÓRIA */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  Modal Sobre Mim & Trajetória Institucional
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Edite todos os textos do bloco e modal institucional sobre trajetória, empresa e metodologia.
                </p>
              </div>

              {/* Título / Identificação do Bloco & Modal Sobre */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Nome / Título do Bloco & Modal Sobre
                  </label>
                  <input
                    type="text"
                    value={config.about.fullName}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        about: { ...prev.about, fullName: e.target.value },
                      }))
                    }
                    placeholder="Ex: Pereira Media & Growth Digital ou Nome Completo"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Aparece no topo do bloco Sobre (ao lado da foto) e no cabeçalho do Modal Sobre. Pode ser o nome da sua empresa ou seu nome.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Subtítulo / Especialidade no Sobre
                  </label>
                  <input
                    type="text"
                    value={config.about.role}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        about: { ...prev.about, role: e.target.value },
                      }))
                    }
                    placeholder="Ex: Marketing & Social Media"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Subtítulo verde exibido logo abaixo do título do Sobre.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Trajetória & História Completa
                </label>
                <textarea
                  rows={4}
                  value={config.about.fullBio}
                  onChange={(e) =>
                    updateConfig((prev) => ({
                      ...prev,
                      about: { ...prev.about, fullBio: e.target.value },
                    }))
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Missão Institucional
                  </label>
                  <textarea
                    rows={3}
                    value={config.about.mission}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        about: { ...prev.about, mission: e.target.value },
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Público-Alvo & Nicho de Atuação
                  </label>
                  <textarea
                    rows={3}
                    value={config.about.focusAudience}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        about: { ...prev.about, focusAudience: e.target.value },
                      }))
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* 4 Pillars */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-white">
                      Pilares Estratégicos de Metodologia
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Exibidos em cards de destaque no modal institucional.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateConfig((prev) => ({
                        ...prev,
                        about: {
                          ...prev.about,
                          pillars: [
                            ...prev.about.pillars,
                            {
                              id: `pillar-${Date.now()}`,
                              title: 'Novo Pilar Estratégico',
                              desc: 'Descrição clara e objetiva do diferencial.',
                            },
                          ],
                        },
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Pilar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {config.about.pillars.map((pillar, idx) => (
                    <div
                      key={pillar.id}
                      className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-purple-400">#{idx + 1}</span>
                        {config.about.pillars.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = config.about.pillars.filter((_, i) => i !== idx);
                              updateConfig((prev) => ({
                                ...prev,
                                about: { ...prev.about, pillars: updated },
                              }));
                            }}
                            className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={pillar.title}
                        onChange={(e) => {
                          const updated = [...config.about.pillars];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          updateConfig((prev) => ({
                            ...prev,
                            about: { ...prev.about, pillars: updated },
                          }));
                        }}
                        placeholder="Título do Pilar"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
                      />
                      <textarea
                        rows={2}
                        value={pillar.desc}
                        onChange={(e) => {
                          const updated = [...config.about.pillars];
                          updated[idx] = { ...updated[idx], desc: e.target.value };
                          updateConfig((prev) => ({
                            ...prev,
                            about: { ...prev.about, pillars: updated },
                          }));
                        }}
                        placeholder="Descrição detalhada"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MÉTRICAS ANIMADAS */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Métricas & Contadores Animados
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Ajuste a calibração dos 3 contadores que pulsam e sobem suavemente na tela pública.
                </p>
              </div>

              {/* Metric 1: Empresas */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <h3 className="text-xs font-semibold text-white">Métrica 1: Empresas Atendidas</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Início</label>
                    <input
                      type="number"
                      value={config.metrics.companies.start}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          metrics: {
                            ...prev.metrics,
                            companies: {
                              ...prev.metrics.companies,
                              start: parseInt(e.target.value, 10) || 0,
                            },
                          },
                        }))
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Meta Final</label>
                    <input
                      type="number"
                      value={config.metrics.companies.target}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          metrics: {
                            ...prev.metrics,
                            companies: {
                              ...prev.metrics.companies,
                              target: parseInt(e.target.value, 10) || 0,
                            },
                          },
                        }))
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Passo (+2)</label>
                    <input
                      type="number"
                      value={config.metrics.companies.step}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          metrics: {
                            ...prev.metrics,
                            companies: {
                              ...prev.metrics.companies,
                              step: parseInt(e.target.value, 10) || 1,
                            },
                          },
                        }))
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Legenda</label>
                    <input
                      type="text"
                      value={config.metrics.companies.label}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          metrics: {
                            ...prev.metrics,
                            companies: {
                              ...prev.metrics.companies,
                              label: e.target.value,
                            },
                          },
                        }))
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Metric 2: Alcance */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <h3 className="text-xs font-semibold text-white">Métrica 2: Alcance Total</h3>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">
                    Degraus do Contador (separados por vírgula)
                  </label>
                  <input
                    type="text"
                    value={config.metrics.reach.steps.join(', ')}
                    onChange={(e) => {
                      const steps = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                      updateConfig((prev) => ({
                        ...prev,
                        metrics: {
                          ...prev.metrics,
                          reach: {
                            ...prev.metrics.reach,
                            steps,
                          },
                        },
                      }));
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Legenda</label>
                  <input
                    type="text"
                    value={config.metrics.reach.label}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        metrics: {
                          ...prev.metrics,
                          reach: {
                            ...prev.metrics.reach,
                            label: e.target.value,
                          },
                        },
                      }))
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Metric 3: Avaliações */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <h3 className="text-xs font-semibold text-white">Métrica 3: Avaliações & Prova Social</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Nota (Ex: 5.0)</label>
                    <input
                      type="text"
                      value={config.metrics.rating.score}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          metrics: {
                            ...prev.metrics,
                            rating: {
                              ...prev.metrics.rating,
                              score: e.target.value,
                            },
                          },
                        }))
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Badge de Avaliações</label>
                    <input
                      type="text"
                      value={config.metrics.rating.reviewsCount}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          metrics: {
                            ...prev.metrics,
                            rating: {
                              ...prev.metrics.rating,
                              reviewsCount: e.target.value,
                            },
                          },
                        }))
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Legenda</label>
                    <input
                      type="text"
                      value={config.metrics.rating.label}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          metrics: {
                            ...prev.metrics,
                            rating: {
                              ...prev.metrics.rating,
                              label: e.target.value,
                            },
                          },
                        }))
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CASES & DEPOIMENTOS */}
          {activeTab === 'cases' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  Cases de Sucesso & Resultados Reais
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Configure exatamente o que aparece na página pública: o botão de ação na barra de contatos, o cabeçalho do modal e cada um dos cards de transformação.
                </p>
              </div>

              {/* Botão & Textos do Modal da Página Pública */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                  <div>
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Estrutura & Textos do Modal na Página Pública
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Personalize o botão que fica na barra ao lado do WhatsApp e todos os títulos do modal de resultados.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateConfig((prev) => ({
                        ...prev,
                        caseStudiesSection: DEFAULT_SITE_CONFIG.caseStudiesSection,
                        caseStudies: DEFAULT_SITE_CONFIG.caseStudies,
                      }));
                      showNotification('Cases e textos do modal restaurados para o padrão da página pública!');
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 cursor-pointer transition-colors self-start sm:self-auto"
                    title="Restaura os cases originais e remove textos antigos de templates anteriores"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Restaurar Cases Padrão</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Texto do Botão na Página (Barra ao lado do WhatsApp)
                    </label>
                    <input
                      type="text"
                      value={config.caseStudiesSection?.buttonLabel ?? 'Resultados'}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          caseStudiesSection: {
                            buttonLabel: e.target.value,
                            modalBadge: prev.caseStudiesSection?.modalBadge || DEFAULT_SITE_CONFIG.caseStudiesSection!.modalBadge,
                            modalTitle: prev.caseStudiesSection?.modalTitle || DEFAULT_SITE_CONFIG.caseStudiesSection!.modalTitle,
                            modalSubtitle: prev.caseStudiesSection?.modalSubtitle || DEFAULT_SITE_CONFIG.caseStudiesSection!.modalSubtitle,
                            ctaButtonText: prev.caseStudiesSection?.ctaButtonText || DEFAULT_SITE_CONFIG.caseStudiesSection!.ctaButtonText,
                            ctaMessage: prev.caseStudiesSection?.ctaMessage || DEFAULT_SITE_CONFIG.caseStudiesSection!.ctaMessage,
                          },
                        }))
                      }
                      placeholder="Ex: Resultados"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Aparece com ícone de medalha (Award) na barra de botões principais.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Selo / Tag no Topo do Modal
                    </label>
                    <input
                      type="text"
                      value={config.caseStudiesSection?.modalBadge ?? 'Casos Reais & Métricas'}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          caseStudiesSection: {
                            buttonLabel: prev.caseStudiesSection?.buttonLabel || DEFAULT_SITE_CONFIG.caseStudiesSection!.buttonLabel,
                            modalBadge: e.target.value,
                            modalTitle: prev.caseStudiesSection?.modalTitle || DEFAULT_SITE_CONFIG.caseStudiesSection!.modalTitle,
                            modalSubtitle: prev.caseStudiesSection?.modalSubtitle || DEFAULT_SITE_CONFIG.caseStudiesSection!.modalSubtitle,
                            ctaButtonText: prev.caseStudiesSection?.ctaButtonText || DEFAULT_SITE_CONFIG.caseStudiesSection!.ctaButtonText,
                            ctaMessage: prev.caseStudiesSection?.ctaMessage || DEFAULT_SITE_CONFIG.caseStudiesSection!.ctaMessage,
                          },
                        }))
                      }
                      placeholder="Ex: Casos Reais & Métricas"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Título Principal do Modal
                    </label>
                    <input
                      type="text"
                      value={config.caseStudiesSection?.modalTitle ?? 'Resultados & Transformações'}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          caseStudiesSection: {
                            buttonLabel: prev.caseStudiesSection?.buttonLabel || DEFAULT_SITE_CONFIG.caseStudiesSection!.buttonLabel,
                            modalBadge: prev.caseStudiesSection?.modalBadge || DEFAULT_SITE_CONFIG.caseStudiesSection!.modalBadge,
                            modalTitle: e.target.value,
                            modalSubtitle: prev.caseStudiesSection?.modalSubtitle || DEFAULT_SITE_CONFIG.caseStudiesSection!.modalSubtitle,
                            ctaButtonText: prev.caseStudiesSection?.ctaButtonText || DEFAULT_SITE_CONFIG.caseStudiesSection!.ctaButtonText,
                            ctaMessage: prev.caseStudiesSection?.ctaMessage || DEFAULT_SITE_CONFIG.caseStudiesSection!.ctaMessage,
                          },
                        }))
                      }
                      placeholder="Ex: Resultados & Transformações"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Texto do Botão de WhatsApp (Conversão no Rodapé do Modal)
                    </label>
                    <input
                      type="text"
                      value={config.caseStudiesSection?.ctaButtonText ?? 'Quero Resultados Semelhantes no Meu Negócio'}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          caseStudiesSection: {
                            buttonLabel: prev.caseStudiesSection?.buttonLabel || DEFAULT_SITE_CONFIG.caseStudiesSection!.buttonLabel,
                            modalBadge: prev.caseStudiesSection?.modalBadge || DEFAULT_SITE_CONFIG.caseStudiesSection!.modalBadge,
                            modalTitle: prev.caseStudiesSection?.modalTitle || DEFAULT_SITE_CONFIG.caseStudiesSection!.modalTitle,
                            modalSubtitle: prev.caseStudiesSection?.modalSubtitle || DEFAULT_SITE_CONFIG.caseStudiesSection!.modalSubtitle,
                            ctaButtonText: e.target.value,
                            ctaMessage: prev.caseStudiesSection?.ctaMessage || DEFAULT_SITE_CONFIG.caseStudiesSection!.ctaMessage,
                          },
                        }))
                      }
                      placeholder="Ex: Quero Resultados Semelhantes no Meu Negócio"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-emerald-300 font-medium focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Subtítulo / Descrição Introdutória do Modal
                    </label>
                    <textarea
                      rows={2}
                      value={
                        config.caseStudiesSection?.modalSubtitle ??
                        'Alguns dos impactos gerados com posicionamento estratégico e gestão profissional de redes.'
                      }
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          caseStudiesSection: {
                            buttonLabel: prev.caseStudiesSection?.buttonLabel || DEFAULT_SITE_CONFIG.caseStudiesSection!.buttonLabel,
                            modalBadge: prev.caseStudiesSection?.modalBadge || DEFAULT_SITE_CONFIG.caseStudiesSection!.modalBadge,
                            modalTitle: prev.caseStudiesSection?.modalTitle || DEFAULT_SITE_CONFIG.caseStudiesSection!.modalTitle,
                            modalSubtitle: e.target.value,
                            ctaButtonText: prev.caseStudiesSection?.ctaButtonText || DEFAULT_SITE_CONFIG.caseStudiesSection!.ctaButtonText,
                            ctaMessage: prev.caseStudiesSection?.ctaMessage || DEFAULT_SITE_CONFIG.caseStudiesSection!.ctaMessage,
                          },
                        }))
                      }
                      placeholder="Descrição introdutória do modal..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 leading-relaxed"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                      Mensagem Pré-configurada ao Iniciar Conversa no WhatsApp
                    </label>
                    <input
                      type="text"
                      value={
                        config.caseStudiesSection?.ctaMessage ??
                        'Olá {nome}! Vi os cases no seu perfil e quero entender como alcançar resultados semelhantes no meu negócio.'
                      }
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          caseStudiesSection: {
                            buttonLabel: prev.caseStudiesSection?.buttonLabel || DEFAULT_SITE_CONFIG.caseStudiesSection!.buttonLabel,
                            modalBadge: prev.caseStudiesSection?.modalBadge || DEFAULT_SITE_CONFIG.caseStudiesSection!.modalBadge,
                            modalTitle: prev.caseStudiesSection?.modalTitle || DEFAULT_SITE_CONFIG.caseStudiesSection!.modalTitle,
                            modalSubtitle: prev.caseStudiesSection?.modalSubtitle || DEFAULT_SITE_CONFIG.caseStudiesSection!.modalSubtitle,
                            ctaButtonText: prev.caseStudiesSection?.ctaButtonText || DEFAULT_SITE_CONFIG.caseStudiesSection!.ctaButtonText,
                            ctaMessage: e.target.value,
                          },
                        }))
                      }
                      placeholder="Ex: Olá {nome}! Vi os cases..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">
                      Use <code>&#123;nome&#125;</code> para preencher com o seu nome profissional automaticamente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Case Studies Cards List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      Cards Individuais de Cases ({config.caseStudies.length})
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Itens listados dentro do modal da página pública, com nicho, selo colorido, estratégia e resultado mensurável.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newCase: CaseStudyConfig = {
                        id: `case-${Date.now()}`,
                        niche: 'Novo Nicho / Segmento',
                        highlightMetric: '+2.500% no Alcance',
                        badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                        description: 'Descrição clara da estratégia implementada no projeto.',
                        result: 'Resultado real e mensurável alcançado.',
                      };
                      updateConfig((prev) => ({
                        ...prev,
                        caseStudies: [...prev.caseStudies, newCase],
                      }));
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Case
                  </button>
                </div>

                {config.caseStudies.map((cs, idx) => {
                  const badgeOptions = [
                    { label: 'Esmeralda', val: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
                    { label: 'Azul Sky', val: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
                    { label: 'Dourado', val: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
                    { label: 'Roxo Neon', val: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
                    { label: 'Rosa Rose', val: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
                  ];

                  return (
                    <div key={cs.id} className="p-4 sm:p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3.5">
                      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                        <span className="text-xs font-bold text-zinc-300">Case #{idx + 1}</span>
                        {config.caseStudies.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = config.caseStudies.filter((_, i) => i !== idx);
                              updateConfig((prev) => ({ ...prev, caseStudies: updated }));
                            }}
                            className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remover</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                            Nicho / Segmento do Cliente
                          </label>
                          <input
                            type="text"
                            value={cs.niche}
                            onChange={(e) => {
                              const updated = [...config.caseStudies];
                              updated[idx] = { ...updated[idx], niche: e.target.value };
                              updateConfig((prev) => ({ ...prev, caseStudies: updated }));
                            }}
                            placeholder="Ex: Moda & Varejo Local"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                            Métrica em Destaque no Selo
                          </label>
                          <input
                            type="text"
                            value={cs.highlightMetric}
                            onChange={(e) => {
                              const updated = [...config.caseStudies];
                              updated[idx] = { ...updated[idx], highlightMetric: e.target.value };
                              updateConfig((prev) => ({ ...prev, caseStudies: updated }));
                            }}
                            placeholder="Ex: +2.800% no Alcance"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>

                      {/* Badge color selector */}
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5">
                          Cor & Destaque do Selo:
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {badgeOptions.map((opt) => (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() => {
                                const updated = [...config.caseStudies];
                                updated[idx] = { ...updated[idx], badgeColor: opt.val };
                                updateConfig((prev) => ({ ...prev, caseStudies: updated }));
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${opt.val} ${
                                cs.badgeColor === opt.val ? 'ring-2 ring-white scale-105' : 'opacity-70 hover:opacity-100'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                          Descrição da Estratégia / Projeto
                        </label>
                        <textarea
                          rows={2}
                          value={cs.description}
                          onChange={(e) => {
                            const updated = [...config.caseStudies];
                            updated[idx] = { ...updated[idx], description: e.target.value };
                            updateConfig((prev) => ({ ...prev, caseStudies: updated }));
                          }}
                          placeholder="Descreva a estratégia implementada para alcançar os resultados..."
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 leading-relaxed"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                          Resultado Final Mensurável (com Selo Verde de Confirmação)
                        </label>
                        <input
                          type="text"
                          value={cs.result}
                          onChange={(e) => {
                            const updated = [...config.caseStudies];
                            updated[idx] = { ...updated[idx], result: e.target.value };
                            updateConfig((prev) => ({ ...prev, caseStudies: updated }));
                          }}
                          placeholder="Ex: +180 atendimentos de compra no Direct no 1º mês"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-emerald-300 font-medium focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {/* Visual Preview identical to PublicPage modal */}
                      <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                          Prévia deste Card (Exatamente como aparece na Página Pública):
                        </span>
                        <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-left">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs font-bold text-zinc-200">{cs.niche || 'Nicho do Case'}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cs.badgeColor}`}>
                              {cs.highlightMetric || '+0%'}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed">
                            {cs.description || 'Descrição da estratégia implementada.'}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>{cs.result || 'Resultado alcançado'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Full Modal Live Preview (1:1 with PublicPage) */}
              <div className="p-5 rounded-3xl bg-zinc-950 border border-amber-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    Prévia Completa do Modal (Visual 100% Idêntico à Página Pública)
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    Ao clicar no botão "{config.caseStudiesSection?.buttonLabel ?? 'Resultados'}"
                  </span>
                </div>

                <div className="max-w-md mx-auto p-5 sm:p-6 rounded-3xl bg-[#131417] border border-white/20 shadow-2xl text-white">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-[11px] font-semibold text-amber-300 mb-2.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>{config.caseStudiesSection?.modalBadge || 'Casos Reais & Métricas'}</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                    {config.caseStudiesSection?.modalTitle || 'Resultados & Transformações'}
                  </h3>
                  <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                    {config.caseStudiesSection?.modalSubtitle ||
                      'Alguns dos impactos gerados com posicionamento estratégico e gestão profissional de redes.'}
                  </p>

                  <div className="space-y-2.5 mb-5 max-h-64 overflow-y-auto pr-1">
                    {config.caseStudies.map((c) => (
                      <div
                        key={c.id}
                        className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-left"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-zinc-200">{c.niche}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.badgeColor}`}>
                            {c.highlightMetric}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed">
                          {c.description}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{c.result}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg">
                    <MessageCircle className="w-4 h-4" />
                    <span>{config.caseStudiesSection?.ctaButtonText || 'Quero Resultados Semelhantes no Meu Negócio'}</span>
                  </div>
                </div>
              </div>

              {/* Testimonials */}
              <div className="space-y-3 pt-4 border-t border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                    Depoimentos de Clientes (Toast Rotativo & Modal)
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const newTestimonial: TestimonialConfig = {
                        id: `test-${Date.now()}`,
                        name: 'Novo Cliente',
                        company: 'Empresa / Marca',
                        text: 'Depoimento impressionante sobre a transformação gerada.',
                        stars: 5,
                        timeAgo: 'há 10 min',
                      };
                      updateConfig((prev) => ({
                        ...prev,
                        testimonials: [...prev.testimonials, newTestimonial],
                      }));
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Depoimento
                  </button>
                </div>

                {config.testimonials.map((t, idx) => (
                  <div key={t.id} className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                        <input
                          type="text"
                          value={t.name}
                          onChange={(e) => {
                            const updated = [...config.testimonials];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            updateConfig((prev) => ({ ...prev, testimonials: updated }));
                          }}
                          placeholder="Nome do cliente"
                          className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-medium"
                        />
                        <input
                          type="text"
                          value={t.company}
                          onChange={(e) => {
                            const updated = [...config.testimonials];
                            updated[idx] = { ...updated[idx], company: e.target.value };
                            updateConfig((prev) => ({ ...prev, testimonials: updated }));
                          }}
                          placeholder="Empresa / Negócio"
                          className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300"
                        />
                        <input
                          type="text"
                          value={t.timeAgo}
                          onChange={(e) => {
                            const updated = [...config.testimonials];
                            updated[idx] = { ...updated[idx], timeAgo: e.target.value };
                            updateConfig((prev) => ({ ...prev, testimonials: updated }));
                          }}
                          placeholder="Ex: há 15 min"
                          className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-400"
                        />
                      </div>
                      {config.testimonials.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = config.testimonials.filter((_, i) => i !== idx);
                            updateConfig((prev) => ({ ...prev, testimonials: updated }));
                          }}
                          className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={t.text}
                      onChange={(e) => {
                        const updated = [...config.testimonials];
                        updated[idx] = { ...updated[idx], text: e.target.value };
                        updateConfig((prev) => ({ ...prev, testimonials: updated }));
                      }}
                      placeholder="Texto do depoimento"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: FUNDO & DESIGN */}
          {activeTab === 'background' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-400" />
                  Ambiente de Fundo & Efeito Degradê
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Controle a imagem de fundo sofisticada, opacidade, transparência e efeito de desfoque cinematográfico.
                </p>
              </div>

              {/* Presets */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-zinc-200">
                  Presets de Fundo Elegantes
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'architecture', name: 'Arquitetura Dark Minimalista', desc: 'Estúdio contemporâneo com sombras elegantes' },
                    { id: 'silk', name: 'Dark Silk & Linhas Tech', desc: 'Ondas de seda grafite sofisticadas' },
                    { id: 'studio', name: 'Estúdio Executivo Titanium', desc: 'Reflexos metálicos escuros com contraluz quente' },
                    { id: 'none', name: 'Gradiente Puro (Sem Imagem)', desc: 'Apenas degradê escuro obsidiana com nébula' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        updateConfig((prev) => ({
                          ...prev,
                          background: { ...prev.background, presetId: preset.id as any },
                        }))
                      }
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        config.background.presetId === preset.id
                          ? 'bg-purple-600/20 border-purple-500/40 text-purple-100 shadow-sm'
                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-white">{preset.name}</span>
                        {config.background.presetId === preset.id && (
                          <CheckCircle2 className="w-4 h-4 text-purple-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400">{preset.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom background upload */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-white">
                      Imagem de Fundo Personalizada (Upload ou URL)
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Você pode fazer upload de qualquer imagem para o fundo.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => customBgInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Imagem de Fundo
                  </button>
                  <input
                    type="file"
                    ref={customBgInputRef}
                    onChange={handleCustomBgUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Ou URL Externa</label>
                  <input
                    type="text"
                    value={config.background.customUrl}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        background: {
                          ...prev.background,
                          presetId: 'custom',
                          customUrl: e.target.value,
                        },
                      }))
                    }
                    placeholder="https://exemplo.com/sua-imagem.jpg"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Opacity & Blur Sliders */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-zinc-300">
                      Opacidade do Fundo ({Math.round(config.background.opacity * 100)}%)
                    </span>
                    <span className="text-zinc-500">Recomendado: 40% a 55%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.background.opacity}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        background: {
                          ...prev.background,
                          opacity: parseFloat(e.target.value),
                        },
                      }))
                    }
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-zinc-300">
                      Desfoque Cinematográfico ({config.background.blur}px)
                    </span>
                    <span className="text-zinc-500">Recomendado: 1px a 4px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={config.background.blur}
                    onChange={(e) =>
                      updateConfig((prev) => ({
                        ...prev,
                        background: {
                          ...prev.background,
                          blur: parseInt(e.target.value, 10),
                        },
                      }))
                    }
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.background.showParticles}
                      onChange={(e) =>
                        updateConfig((prev) => ({
                          ...prev,
                          background: {
                            ...prev.background,
                            showParticles: e.target.checked,
                          },
                        }))
                      }
                      className="rounded bg-zinc-900 border-zinc-700 text-purple-600 focus:ring-0"
                    />
                    <span>Ativar partículas atmosféricas de poeira cósmica 2.5D</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: BANCO SUPABASE & NETLIFY */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  Integração Supabase & Publicação Netlify
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Conecte seu banco de dados na nuvem Supabase para persistência multi-dispositivo e prepare seu deploy no Netlify.
                </p>
              </div>

              {/* Supabase Config Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Credenciais do Projeto Supabase
                  </h3>
                  {supabaseStatus === 'connected' ? (
                    <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Conectado com Sucesso
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                      Pendente de Conexão
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Project URL (Ex: https://xyzcompany.supabase.co)
                    </label>
                    <input
                      type="text"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="https://seuid.supabase.co"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Project API Anon Key (chave pública do Supabase)
                    </label>
                    <input
                      type="password"
                      value={supabaseAnonKey}
                      onChange={(e) => setSupabaseAnonKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleTestSupabase}
                      disabled={supabaseTesting}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${supabaseTesting ? 'animate-spin' : ''}`} />
                      <span>{supabaseTesting ? 'Testando Conexão...' : 'Testar & Salvar Conexão'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePushToCloud}
                      disabled={isPushingToCloud}
                      className="px-3.5 py-2 rounded-xl text-xs font-medium bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Upload className={`w-3.5 h-3.5 ${isPushingToCloud ? 'animate-spin' : ''}`} />
                      <span>{isPushingToCloud ? 'Enviando...' : 'Enviar Dados Atuais para a Nuvem'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        await refreshFromSupabase();
                        showNotification('Dados sincronizados do Supabase com sucesso!');
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Puxar Dados da Nuvem</span>
                    </button>
                  </div>

                  {supabaseTestResult && (
                    <div
                      className={`p-3 rounded-xl text-xs border ${
                        supabaseTestResult.success
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                          : 'bg-red-950/40 border-red-500/30 text-red-200'
                      }`}
                    >
                      {supabaseTestResult.message}
                    </div>
                  )}
                </div>
              </div>

              {/* SQL Instructions Script */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-white">
                      Script SQL para Criação da Tabela no Supabase
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Cole no menu <strong>SQL Editor</strong> do painel Supabase e clique em <strong>Run</strong> para sincronizar seu site.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const sql = getSupabaseSqlInstructions();
                      if (navigator?.clipboard) {
                        navigator.clipboard.writeText(sql);
                        setCopiedSql(true);
                        setTimeout(() => setCopiedSql(false), 2500);
                        showNotification('Script SQL copiado com sucesso!');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Copiado!' : 'Copiar SQL'}</span>
                  </button>
                </div>

                <pre className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-56">
                  {getSupabaseSqlInstructions()}
                </pre>
              </div>

              {/* Netlify Deployment Instructions */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  Publicação no Netlify (100% Configurado)
                </h3>
                <ul className="text-xs text-zinc-400 space-y-2 list-disc list-inside">
                  <li>
                    O arquivo de redirecionamento SPA (<code className="text-zinc-200 font-mono">public/_redirects</code>) já está criado no projeto para garantir que a rota <code className="text-zinc-200 font-mono">/admin</code> funcione sem erro 404 ao recarregar.
                  </li>
                  <li>
                    No Netlify, defina o comando de build como <code className="text-zinc-200 font-mono">npm run build</code> e a pasta de publicação como <code className="text-zinc-200 font-mono">dist</code>.
                  </li>
                  <li>
                    Em <strong>Site configuration &gt; Environment variables</strong> no Netlify, você pode opcionalmente adicionar:
                    <div className="pl-4 pt-1 font-mono text-[11px] text-zinc-300">
                      <div>VITE_SUPABASE_URL = sua-url</div>
                      <div>VITE_SUPABASE_ANON_KEY = sua-anon-key</div>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Security & Password */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <h3 className="text-xs font-semibold text-white">Alterar Senha de Acesso do Administrador</h3>
                <form onSubmit={handleUpdatePassword} className="flex flex-wrap items-center gap-2">
                  <input
                    type="password"
                    value={newMasterPass}
                    onChange={(e) => setNewMasterPass(e.target.value)}
                    placeholder="Nova senha (mínimo 4 caracteres)"
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white flex-1 min-w-[200px]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 cursor-pointer"
                  >
                    Salvar Nova Senha
                  </button>
                </form>
                {passUpdatedMsg && (
                  <p className="text-xs text-emerald-400">Senha do Administrador atualizada!</p>
                )}
              </div>

              {/* Backup & Factory Reset */}
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <h3 className="text-xs font-semibold text-white">Backup e Restauração</h3>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 cursor-pointer"
                  >
                    Exportar Backup JSON
                  </button>
                  <label className="px-3.5 py-2 rounded-xl text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 cursor-pointer">
                    Importar Backup JSON
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportJson}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja restaurar as configurações originais de fábrica?')) {
                        resetToDefaults();
                        showNotification('Configurações restauradas para o padrão de fábrica!');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-500/30 cursor-pointer"
                  >
                    Restaurar Padrão de Fábrica
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
