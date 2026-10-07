import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Instagram,
  Facebook,
  MessageCircle,
  Globe,
  QrCode,
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Users,
  Star,
  Briefcase,
  Award,
  MessageSquareQuote,
  CheckCircle2,
  Youtube,
} from 'lucide-react';
import QRCode from 'qrcode';

interface SocialButton {
  id: string;
  name: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  accentGlow: string;
  gradientRing: string;
  floatDelay: number;
  floatDuration: number;
}

interface BioItem {
  id: string;
  emoji: string;
  text: string;
}

interface ServiceOption {
  id: string;
  label: string;
  emoji: string;
  messageText: string;
}

interface CaseStudy {
  id: string;
  niche: string;
  highlightMetric: string;
  badgeColor: string;
  description: string;
  result: string;
}

interface Testimonial {
  id: string;
  name: string;
  company: string;
  text: string;
  stars: number;
  timeAgo: string;
}

const INITIAL_BIO_ITEMS: BioItem[] = [
  {
    id: 'growth',
    emoji: '🚀',
    text: 'Ajudo pequenos negócios a crescer no digital',
  },
  {
    id: 'content',
    emoji: '📲',
    text: 'Social Media • Conteúdo • Estratégia',
  },
  {
    id: 'leads',
    emoji: '🎯',
    text: 'Instagram que posiciona e gera oportunidades',
  },
];

const ROLES = [
  'Marketing & Social Media',
  'Social Media & Marketing',
];

// Option 1: WhatsApp Service Qualifier
const SERVICES: ServiceOption[] = [
  {
    id: 'management',
    label: 'Gestão de Redes',
    emoji: '🎯',
    messageText: 'Olá José! Gostaria de saber mais sobre a Gestão Completa de Redes Sociais para alavancar meu negócio.',
  },
  {
    id: 'strategy',
    label: 'Estratégia & Conteúdo',
    emoji: '📲',
    messageText: 'Olá José! Tenho interesse em Estratégia de Conteúdo e Posicionamento para transformar meu perfil.',
  },
  {
    id: 'diagnostic',
    label: 'Diagnóstico & Consultoria',
    emoji: '🔍',
    messageText: 'Olá José! Gostaria de agendar um Diagnóstico Estratégico para analisar meu Instagram.',
  },
];

// Option 2: Results & Case Studies
const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'retail',
    niche: 'Moda & Varejo Local',
    highlightMetric: '+2.800% no Alcance',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    description: 'De 2.100 para 62.000 contas alcançadas por mês através de Reels estratégicos e reestruturação da bio.',
    result: '+180 atendimentos de compra no Direct no 1º mês',
  },
  {
    id: 'health',
    niche: 'Clínica & Saúde Estética',
    highlightMetric: 'Agenda Lotada 60d',
    badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    description: 'Posicionamento de autoridade, conteúdo de quebra de objeções e anúncios focados no público local.',
    result: 'Faturamento recorde particular e zero dependência de convênios',
  },
  {
    id: 'b2b',
    niche: 'Consultoria & Serviços B2B',
    highlightMetric: '+45k Seguidores Reais',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    description: 'Linha editorial focada nas dores do cliente ideal aliada a funil de relacionamento nos Stories.',
    result: 'Contratos fechados semanalmente direto pelo direct',
  },
];

// Option 3: Real-Time Social Proof Testimonials
const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Mariana F.',
    company: 'Loja Bella Moda',
    text: 'O José transformou o Instagram da minha loja! Nossas vendas pelo Direct triplicaram em menos de 40 dias.',
    stars: 5,
    timeAgo: 'há 18 min',
  },
  {
    id: '2',
    name: 'Dr. Ricardo Santos',
    company: 'Odontologia Estética',
    text: 'Posicionamento impecável. Hoje os pacientes chegam no WhatsApp já decididos a fechar o tratamento.',
    stars: 5,
    timeAgo: 'há 42 min',
  },
  {
    id: '3',
    name: 'Lucas Mendes',
    company: 'Hamburgueria Artesanal',
    text: 'A estratégia de Reels e tráfego local que o José montou colocou fila na porta todo final de semana!',
    stars: 5,
    timeAgo: 'há 1h',
  },
];

const DEFAULT_BUTTONS: SocialButton[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://instagram.com',
    icon: Instagram,
    accentGlow: 'rgba(225, 48, 108, 0.4)',
    gradientRing: 'from-pink-500 via-purple-500 to-amber-500',
    floatDelay: 0,
    floatDuration: 4.2,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    url: 'https://facebook.com',
    icon: Facebook,
    accentGlow: 'rgba(24, 119, 242, 0.4)',
    gradientRing: 'from-blue-600 via-blue-500 to-sky-400',
    floatDelay: 0.6,
    floatDuration: 4.8,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    url: 'https://wa.me/?text=Ol%C3%A1%20Jos%C3%A9!%20Vi%20seu%20perfil%20e%20gostaria%20de%20saber%20mais%20sobre%20gest%C3%A3o%20de%20redes%20sociais%20e%20estrat%C3%A9gia.',
    icon: MessageCircle,
    accentGlow: 'rgba(37, 211, 102, 0.4)',
    gradientRing: 'from-emerald-500 via-green-500 to-teal-400',
    floatDelay: 1.2,
    floatDuration: 4.4,
  },
  {
    id: 'site',
    name: 'Website',
    url: 'https://google.com',
    icon: Globe,
    accentGlow: 'rgba(255, 255, 255, 0.35)',
    gradientRing: 'from-zinc-200 via-slate-400 to-zinc-500',
    floatDelay: 1.8,
    floatDuration: 5.0,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    url: 'https://youtube.com',
    icon: Youtube,
    accentGlow: 'rgba(239, 68, 68, 0.45)',
    gradientRing: 'from-red-600 via-rose-500 to-red-500',
    floatDelay: 2.4,
    floatDuration: 4.6,
  },
];

// Subtle, slow-moving atmospheric dust & particle motes for realistic cinematic depth
function DustParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface Particle {
      x: number;
      y: number;
      radius: number;
      baseAlpha: number;
      alpha: number;
      vx: number;
      vy: number;
      wobbleSpeed: number;
      wobbleAngle: number;
      depth: number;
    }

    const PARTICLE_COUNT = 52;
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => {
      const depth = Math.random();
      const baseAlpha = 0.08 + depth * 0.22;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.6 + depth * 1.5,
        baseAlpha,
        alpha: baseAlpha,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -(0.06 + depth * 0.16),
        wobbleSpeed: 0.006 + Math.random() * 0.012,
        wobbleAngle: Math.random() * Math.PI * 2,
        depth,
      };
    });

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.667, 2);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.wobbleAngle += p.wobbleSpeed * dt;
        p.x += (p.vx + Math.sin(p.wobbleAngle) * 0.12) * dt;
        p.y += p.vy * dt;

        p.alpha = p.baseAlpha + Math.sin(p.wobbleAngle * 1.4) * (p.baseAlpha * 0.28);

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        } else if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        }

        if (p.x < -10) p.x = width + 10;
        else if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        if (p.depth > 0.75) {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
          grad.addColorStop(0, `rgba(255, 255, 255, ${p.alpha})`);
          grad.addColorStop(0.5, `rgba(225, 230, 240, ${p.alpha * 0.5})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.fill();
        } else {
          ctx.fillStyle = `rgba(225, 230, 242, ${p.alpha})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
    />
  );
}

// Hook: Slow, gradual count up for Empresas starting from 5, stepping +2 up to 30 while user browses
function useCompaniesSlowCounter(start: number = 5, target: number = 30, step: number = 2, intervalMs: number = 2200) {
  const [count, setCount] = useState(start);
  const [isPulse, setIsPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev >= target) {
          clearInterval(interval);
          return target;
        }
        const next = Math.min(prev + step, target);
        setIsPulse(true);
        setTimeout(() => setIsPulse(false), 450);
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [start, target, step, intervalMs]);

  return { count, isPulse };
}

// Hook: Gradual counter for Alcance stepping de 200 em 200k up to 1.5M (+200k, +400k ... +1.5M)
function useReachStepCounter(intervalMs: number = 2200) {
  const REACH_STEPS = [
    '+200k',
    '+400k',
    '+600k',
    '+800k',
    '+1.0M',
    '+1.2M',
    '+1.4M',
    '+1.5M',
  ];

  const [stepIndex, setStepIndex] = useState(0);
  const [isPulse, setIsPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= REACH_STEPS.length - 1) {
          clearInterval(interval);
          return REACH_STEPS.length - 1;
        }
        setIsPulse(true);
        setTimeout(() => setIsPulse(false), 450);
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs, REACH_STEPS.length]);

  return {
    reachText: REACH_STEPS[stepIndex],
    isPulse,
  };
}

// Hook: Very slow live rating ticker simulating real-time reviews over ~25 seconds
function useLiveRatingTicker() {
  const [rating, setRating] = useState('4.7');
  const [isLivePulse, setIsLivePulse] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setRating('4.8');
      setIsLivePulse(true);
      setTimeout(() => setIsLivePulse(false), 1500);
    }, 5000);

    const t2 = setTimeout(() => {
      setRating('4.9');
      setIsLivePulse(true);
      setTimeout(() => setIsLivePulse(false), 1500);
    }, 14000);

    const t3 = setTimeout(() => {
      setRating('5.0');
      setIsLivePulse(true);
      setTimeout(() => setIsLivePulse(false), 2000);
    }, 24000);

    const interval = setInterval(() => {
      setIsLivePulse(true);
      setTimeout(() => setIsLivePulse(false), 2000);
    }, 16000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, []);

  return { rating, isLivePulse };
}

export default function App() {
  const [profileImage, setProfileImage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('void_profile_image') || '/profile.png';
    }
    return '/profile.png';
  });

  const [buttons] = useState<SocialButton[]>(DEFAULT_BUTTONS);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Animated metrics hooks calibrated for a ~25-second progression:
  // - Empresas: starts at 5, increases by 2 every 1.92s (13 steps * 1.92s ≈ 25s) up to 30
  // - Alcance: increases de 200 em 200k every 3.57s (7 steps * 3.57s ≈ 25s) up to +1.5M
  // - Avaliações: slow real-time ticker reaching 5.0 at 24s
  const { count: companiesCount, isPulse: isCompaniesPulse } = useCompaniesSlowCounter(5, 30, 2, 1920);
  const { reachText: reachDisplay, isPulse: isReachPulse } = useReachStepCounter(3570);
  const { rating, isLivePulse } = useLiveRatingTicker();

  // Alternates subtitle between "Marketing & Social Media" and "Social Media & Marketing"
  const [roleIndex, setRoleIndex] = useState(0);

  // Rotates the 3 bio bullet items smoothly and harmoniously (5.5s interval)
  const [bioItems, setBioItems] = useState<BioItem[]>(INITIAL_BIO_ITEMS);

  // Option 1: Selected service for WhatsApp qualifier
  const [selectedServiceId, setSelectedServiceId] = useState<string>('management');

  // Option 2: Cases & Results modal state
  const [showCasesModal, setShowCasesModal] = useState(false);

  // Option 3: Rotating testimonial toast state
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [showTestimonialToast, setShowTestimonialToast] = useState(false);

  // Digital business card & QR code modal state
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const roleTimer = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROLES.length);
    }, 3200);
    return () => clearInterval(roleTimer);
  }, []);

  useEffect(() => {
    const itemsTimer = setInterval(() => {
      setBioItems((prev) => {
        const [first, ...rest] = prev;
        return [...rest, first];
      });
    }, 5500);
    return () => clearInterval(itemsTimer);
  }, []);

  // Option 3 Timer: Periodic appearance of subtle social proof toast
  useEffect(() => {
    // Initial display after 4 seconds
    const initialTimer = setTimeout(() => {
      setShowTestimonialToast(true);
    }, 4000);

    // Rotation cycle: shows for 7s, hides for 9s (total 16s cycle)
    const cycleInterval = setInterval(() => {
      setShowTestimonialToast(false);
      setTimeout(() => {
        setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
        setShowTestimonialToast(true);
      }, 2000);
    }, 16000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(cycleInterval);
    };
  }, []);

  // Generate real QR Code of current page on demand
  useEffect(() => {
    if (showQrModal && typeof window !== 'undefined') {
      QRCode.toDataURL(window.location.href, {
        width: 320,
        margin: 1.5,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch(() => {});
    }
  }, [showQrModal]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setProfileImage(dataUrl);
          localStorage.setItem('void_profile_image', dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDownloadVCard = () => {
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    const vcardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'FN:José Pereira',
      'TITLE:Marketing & Social Media',
      'NOTE:Ajudo pequenos negócios a crescer no digital • Social Media • Conteúdo • Estratégia',
      `URL:${pageUrl}`,
      'END:VCARD',
    ].join('\r\n');

    const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Jose_Pereira_Marketing.vcf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Option 1: Selected service message
  const activeService =
    SERVICES.find((s) => s.id === selectedServiceId) || SERVICES[0];
  const dynamicWhatsAppUrl = `https://wa.me/?text=${encodeURIComponent(
    activeService.messageText
  )}`;

  const currentTestimonial = TESTIMONIALS[testimonialIndex];

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none cursor-default bg-gradient-to-br from-[#2a2d33] via-[#151619] to-[#040405]"
      style={{ perspective: '1200px' }}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Cinematic ambient background glow and floating dust motes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <DustParticles />

        <div className="absolute top-1/4 left-1/4 w-[650px] h-[650px] bg-white/[0.025] rounded-full blur-[150px]" />
        <div className="absolute -bottom-32 right-1/4 w-[750px] h-[750px] bg-white/[0.018] rounded-full blur-[170px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* MAIN CONTENT LAYER: Profile Photo + Bio beside it (Left & Center) and Floating Buttons (Right) */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="fixed inset-0 flex flex-col lg:flex-row items-center justify-between px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 z-20 pointer-events-none overflow-y-auto lg:overflow-visible py-8 lg:py-0"
      >
        {/* Left & Center: Floating Cutout Photo and Bio side by side */}
        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 lg:gap-10 xl:gap-14 pointer-events-auto my-auto max-w-full lg:max-w-[72vw]">
          {/* Floating Photo (Uncropped, zero background, zero frame) */}
          <motion.div
            animate={{
              y: [-6, 6, -6],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
            }}
            className="relative flex flex-col items-center shrink-0"
          >
            <motion.div
              whileHover={{
                scale: 1.025,
                z: 35,
                transition: {
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                },
              }}
              onClick={() => fileInputRef.current?.click()}
              className="group relative select-none cursor-pointer"
              title="Foto de perfil"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="relative bg-transparent">
                <img
                  src={profileImage}
                  alt="José Pereira"
                  className="max-h-[48vh] sm:max-h-[60vh] lg:max-h-[76vh] xl:max-h-[80vh] max-w-[75vw] sm:max-w-[45vw] lg:max-w-[32vw] w-auto h-auto object-contain select-none block transition-all duration-500"
                  style={{
                    filter: 'drop-shadow(0 25px 45px rgba(0, 0, 0, 0.85))',
                  }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Bio & Details placed beside the photo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col text-left select-none max-w-md lg:max-w-lg w-full"
          >
            {/* Top Status & Badge Line */}
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5 self-start">
              {/* Header Badge: Living letters moving/waving smoothly */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-md shadow-inner">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-zinc-200 font-semibold inline-flex items-center">
                  {'Perfil Profissional'.split('').map((char, i) => (
                    <motion.span
                      key={i}
                      animate={{
                        y: [0, -6, 0, 3, 0],
                        rotate: [0, -4, 0, 4, 0],
                        color: ['#cbd5e1', '#ffffff', '#34d399', '#ffffff', '#cbd5e1'],
                      }}
                      transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.07,
                      }}
                      className={char === ' ' ? 'w-1.5' : 'inline-block font-bold'}
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              </div>

              {/* Status: Real-time availability indicator */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[10px] sm:text-[11px] font-medium backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>Agenda Aberta</span>
              </div>
            </div>

            {/* Profile Name: Gentle heartbeat pulse */}
            <div className="origin-left">
              <motion.h1
                animate={{
                  scale: [1, 1.08, 1.015, 1.10, 1, 1],
                  filter: [
                    'drop-shadow(0 0 0px rgba(255,255,255,0))',
                    'drop-shadow(0 0 20px rgba(255,255,255,0.8))',
                    'drop-shadow(0 0 6px rgba(255,255,255,0.3))',
                    'drop-shadow(0 0 28px rgba(52,211,153,0.9))',
                    'drop-shadow(0 0 0px rgba(255,255,255,0))',
                    'drop-shadow(0 0 0px rgba(255,255,255,0))',
                  ],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  times: [0, 0.15, 0.28, 0.42, 0.58, 1],
                }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight inline-block origin-left"
              >
                José Pereira
              </motion.h1>
            </div>

            {/* Subtitle: Smoothly alternates between "Marketing & Social Media" and "Social Media & Marketing" */}
            <div className="h-6 sm:h-7 mt-0.5 mb-2.5 flex items-center overflow-hidden" style={{ perspective: 400 }}>
              <AnimatePresence mode="wait">
                <motion.p
                  key={ROLES[roleIndex]}
                  initial={{ opacity: 0, y: 14, rotateX: -60, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -14, rotateX: 60, filter: 'blur(3px)' }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                  className="text-sm sm:text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-zinc-100 to-teal-300 tracking-wide"
                >
                  {ROLES[roleIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Mini Social Proof Stats Strip with dynamic counters */}
            <div className="grid grid-cols-3 gap-2 p-2 rounded-2xl bg-[#121316]/60 border border-white/10 backdrop-blur-md mb-3.5 shadow-inner">
              <div className="flex flex-col items-center justify-center py-1 border-r border-white/10">
                <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-white font-mono">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  <motion.span
                    key={companiesCount}
                    animate={
                      isCompaniesPulse
                        ? { scale: [1, 1.25, 1], color: ['#ffffff', '#34d399', '#ffffff'] }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.35 }}
                  >
                    +{companiesCount}
                  </motion.span>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium tracking-tight mt-0.5">
                  Empresas
                </span>
              </div>

              <div className="flex flex-col items-center justify-center py-1 border-r border-white/10">
                <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-400 font-mono">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <motion.span
                    key={reachDisplay}
                    animate={
                      isReachPulse
                        ? { scale: [1, 1.25, 1], color: ['#34d399', '#ffffff', '#34d399'] }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.35 }}
                  >
                    {reachDisplay}
                  </motion.span>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium tracking-tight mt-0.5">
                  Alcance
                </span>
              </div>

              <div className="flex flex-col items-center justify-center py-1 relative">
                <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-amber-300 font-mono">
                  <motion.div
                    animate={
                      isLivePulse
                        ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] }
                        : { scale: 1 }
                    }
                    transition={{ duration: 0.6 }}
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  </motion.div>
                  <span>{rating}</span>
                  {isLivePulse && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  )}
                </div>
                <span className="text-[10px] text-zinc-400 font-medium tracking-tight mt-0.5 flex items-center gap-1">
                  <span>Avaliação</span>
                  {isLivePulse && (
                    <span className="text-[9px] text-emerald-400 font-semibold">• ao vivo</span>
                  )}
                </span>
              </div>
            </div>

            {/* Description Bullet Items: Smooth and harmonious transition without punch */}
            <div className="space-y-2 sm:space-y-2.5 mb-3.5">
              {bioItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  transition={{
                    layout: {
                      duration: 1.1,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  }}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-[#141519]/80 border border-white/10 hover:border-white/20 backdrop-blur-xl shadow-md transition-colors duration-300 cursor-default"
                >
                  <span className="text-base sm:text-lg shrink-0">
                    {item.emoji}
                  </span>
                  <span className="text-xs sm:text-sm text-zinc-100 font-normal leading-relaxed">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* OPTION 1: WhatsApp Service Qualifier Tag Bar */}
            <div className="mb-2.5">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block mb-1.5">
                Selecione o serviço de interesse:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {SERVICES.map((s) => {
                  const isSelected = selectedServiceId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedServiceId(s.id)}
                      className={`px-2 py-1.5 rounded-xl text-[10px] sm:text-[11px] font-medium transition-all text-center flex items-center justify-center gap-1 cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)] font-semibold scale-[1.02]'
                          : 'bg-white/[0.04] border-white/10 text-zinc-400 hover:text-zinc-200 hover:border-white/20'
                      }`}
                    >
                      <span className="text-xs">{s.emoji}</span>
                      <span className="truncate">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* HIGH-CONVERSION CTA & ACTIONS BAR */}
            <div className="flex items-center gap-2 pt-1">
              {/* Primary High-Impact WhatsApp CTA Button with Pre-filled message tailored to selected service */}
              <motion.a
                href={dynamicWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                animate={{
                  boxShadow: [
                    '0 10px 25px -5px rgba(16,185,129,0.35)',
                    '0 16px 35px -3px rgba(16,185,129,0.58)',
                    '0 10px 25px -5px rgba(16,185,129,0.35)',
                  ],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 group relative flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-semibold text-xs sm:text-sm shadow-[0_12px_30px_-5px_rgba(16,185,129,0.35)] transition-all overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" />
                <span className="truncate">Chamar no WhatsApp</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
              </motion.a>

              {/* OPTION 2: Case Studies / Results Modal Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCasesModal(true)}
                className="px-3 py-3 rounded-2xl bg-[#141519]/80 border border-white/15 hover:border-amber-400/40 text-amber-300 hover:text-amber-200 backdrop-blur-xl shadow-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0"
                title="Ver Cases de Sucesso & Resultados"
              >
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Resultados</span>
              </motion.button>

              {/* Digital Business Card / QR Code button */}
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQrModal(true)}
                className="p-3 rounded-2xl bg-[#141519]/80 border border-white/15 hover:border-white/35 text-zinc-300 hover:text-white backdrop-blur-xl shadow-lg transition-all cursor-pointer flex items-center justify-center shrink-0"
                title="Cartão de Visita Digital & QR Code"
              >
                <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* RIGHT SIDE: Floating Social Buttons */}
        <div
          className="flex flex-row lg:flex-col gap-4 sm:gap-5 lg:gap-6 xl:gap-7 pointer-events-auto shrink-0 my-auto py-4 lg:py-0 justify-center w-full lg:w-auto"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {buttons.map((btn) => {
            const Icon = btn.icon;
            const isHovered = hoveredId === btn.id;

            return (
              <div key={btn.id} className="relative flex items-center justify-end">
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: 0, scale: 0.85 }}
                      animate={{ opacity: 1, x: -26, scale: 1 }}
                      exit={{ opacity: 0, x: -10, scale: 0.9 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-full mr-2 pointer-events-none hidden lg:flex items-center z-40"
                    >
                      <div className="px-3.5 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-zinc-100 text-xs font-medium tracking-wide shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
                        <span className="text-[10px] text-zinc-400 font-mono">↖</span>
                        <span>{btn.name}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  animate={{
                    y: [-4, 4, -4],
                    rotate: [1, -1, 1],
                  }}
                  transition={{
                    duration: btn.floatDuration,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                    delay: btn.floatDelay,
                  }}
                >
                  <motion.a
                    href={btn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHoveredId(btn.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    whileHover={{
                      scale: 1.35,
                      x: -12,
                      z: 70,
                      transition: {
                        duration: 0.4,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    }}
                    whileTap={{
                      scale: 1.15,
                      transition: { duration: 0.15 },
                    }}
                    className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl cursor-pointer focus:outline-none"
                    style={{
                      transformStyle: 'preserve-3d',
                    }}
                    title={btn.name}
                  >
                    <motion.div
                      className={`absolute -inset-1.5 rounded-2xl bg-gradient-to-r ${btn.gradientRing} opacity-0 blur-md transition-opacity duration-500`}
                      animate={{
                        opacity: isHovered ? 0.7 : 0,
                      }}
                    />

                    <div
                      className="absolute inset-0 rounded-2xl transition-all duration-500"
                      style={{
                        boxShadow: isHovered
                          ? `0 25px 45px -8px rgba(0, 0, 0, 0.9), 0 0 35px ${btn.accentGlow}`
                          : '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
                      }}
                    />

                    <div className="relative z-10 flex items-center justify-center w-full h-full rounded-2xl bg-zinc-900/75 backdrop-blur-xl border border-white/10 group-hover:border-white/35 group-hover:bg-zinc-800/80 transition-colors duration-400 overflow-hidden shadow-inner">
                      <div className="absolute top-0 inset-x-0 h-[45%] bg-gradient-to-b from-white/15 to-transparent rounded-t-2xl pointer-events-none" />
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-zinc-300 group-hover:text-white transition-all duration-400 group-hover:scale-110 drop-shadow-md" />
                    </div>
                  </motion.a>
                </motion.div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* OPTION 3: ROTATING SOCIAL PROOF TESTIMONIAL TOAST (Bottom Left) */}
      <AnimatePresence>
        {showTestimonialToast && currentTestimonial && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.92 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-4 right-4 sm:right-6 lg:right-8 z-40 max-w-[320px] sm:max-w-sm rounded-2xl bg-[#141519]/90 border border-white/15 backdrop-blur-2xl p-3.5 shadow-2xl pointer-events-auto"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-xs font-bold text-emerald-300">
                  {currentTestimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white leading-none">
                      {currentTestimonial.name}
                    </span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  </div>
                  <span className="text-[10px] text-zinc-400 leading-none">
                    {currentTestimonial.company}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] text-amber-300">
                <span>★★★★★</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-300 leading-relaxed italic pl-1 mb-1">
              "{currentTestimonial.text}"
            </p>

            <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-1 border-t border-white/5">
              <span>Depoimento verificado</span>
              <span>{currentTestimonial.timeAgo}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OPTION 2: RESULTS & CASE STUDIES MODAL */}
      <AnimatePresence>
        {showCasesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg bg-[#131417]/95 border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl text-white backdrop-blur-2xl max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowCasesModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-[11px] font-semibold text-amber-300 mb-2.5">
                <Award className="w-3.5 h-3.5" />
                <span>Casos Reais & Métricas</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                Resultados & Transformações
              </h3>
              <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
                Alguns dos impactos gerados com posicionamento estratégico e gestão profissional de redes.
              </p>

              <div className="space-y-3 mb-6">
                {CASE_STUDIES.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all text-left"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-zinc-200">
                        {c.niche}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.badgeColor}`}
                      >
                        {c.highlightMetric}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed">
                      {c.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{c.result}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    'Olá José! Vi os cases no seu perfil e quero entender como alcançar resultados semelhantes no meu negócio.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-semibold text-xs sm:text-sm hover:opacity-95 transition-opacity shadow-lg cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Quero Resultados Semelhantes no Meu Negócio</span>
                </a>

                <button
                  onClick={() => setShowCasesModal(false)}
                  className="w-full py-2 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIGITAL BUSINESS CARD & QR CODE MODAL */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-sm bg-[#131417]/95 border border-white/20 rounded-3xl p-6 shadow-2xl text-white text-center backdrop-blur-2xl"
            >
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[11px] font-medium text-zinc-300 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cartão de Visita Digital</span>
              </div>

              <h3 className="text-xl font-bold text-white mb-0.5">José Pereira</h3>
              <p className="text-xs text-zinc-400 mb-5">Marketing & Social Media</p>

              <div className="p-4 rounded-2xl bg-white shadow-xl mx-auto w-fit mb-5">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="QR Code de José Pereira"
                    className="w-44 h-44 object-contain select-none"
                  />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-zinc-500 text-xs">
                    Gerando QR Code...
                  </div>
                )}
              </div>

              <p className="text-[11px] text-zinc-400 mb-5 leading-relaxed">
                Aponte a câmera do celular para abrir este perfil instantaneamente ou salve o contato direto na sua agenda.
              </p>

              <div className="space-y-2">
                <button
                  onClick={handleDownloadVCard}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Salvar na Agenda do Celular (.vcf)</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 hover:text-white font-medium text-xs transition-colors border border-white/10 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Link Copiado com Sucesso!' : 'Copiar Link da Página'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
