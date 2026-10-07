import React, { useState, useRef, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
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
  Award,
  CheckCircle2,
  Youtube,
  Building2,
  Info,
  ShieldCheck,
} from 'lucide-react';
import QRCode from 'qrcode';
import bgArchitectureImg from './assets/images/luxury_dark_bg_1791390268087.jpg';
import bgSilkImg from './assets/images/dark_silk_bg_1791390286526.jpg';
import bgStudioImg from './assets/images/dark_studio_bg_1791390886071.jpg';

interface BgPreset {
  id: string;
  name: string;
  description: string;
  url: string;
  previewUrl: string;
}

const resolvePresetUrl = (keyOrUrl: string) => {
  if (!keyOrUrl || keyOrUrl === 'none') return 'none';
  if (keyOrUrl === 'architecture' || keyOrUrl === '/bg-architecture.jpg') return bgArchitectureImg;
  if (keyOrUrl === 'silk' || keyOrUrl === '/bg-silk.jpg') return bgSilkImg;
  if (keyOrUrl === 'studio' || keyOrUrl === '/bg-studio.jpg') return bgStudioImg;
  return keyOrUrl;
};

const BG_PRESETS: BgPreset[] = [
  {
    id: 'architecture',
    name: 'Arquitetura Dark Minimalista',
    description: 'Estúdio contemporâneo com iluminação suave e sombras elegantes.',
    url: bgArchitectureImg,
    previewUrl: bgArchitectureImg,
  },
  {
    id: 'silk',
    name: 'Dark Silk & Linhas Tech',
    description: 'Ondas de seda grafite sofisticadas com sutis feixes de luz.',
    url: bgSilkImg,
    previewUrl: bgSilkImg,
  },
  {
    id: 'studio',
    name: 'Estúdio Executivo Titanium',
    description: 'Reflexos metálicos escuros com suave contraluz quente.',
    url: bgStudioImg,
    previewUrl: bgStudioImg,
  },
  {
    id: 'none',
    name: 'Gradiente Puro (Sem Imagem)',
    description: 'Apenas degradê escuro obsidiana com nébula suave e partículas.',
    url: 'none',
    previewUrl: '',
  },
];

interface AboutData {
  shortBio: string;
  fullName: string;
  role: string;
  companyName: string;
  experienceYears: string;
  fullBio: string;
  mission: string;
  focusAudience: string;
  pillars: Array<{
    title: string;
    desc: string;
  }>;
}

const DEFAULT_ABOUT_DATA: AboutData = {
  shortBio:
    'Especialista em posicionamento estratégico e crescimento de marcas no digital. Transformo perfis de pequenos negócios e profissionais em canais contínuos de autoridade e vendas reais pelo Direct e WhatsApp.',
  fullName: 'José Pereira',
  role: 'Marketing & Social Media',
  companyName: 'Pereira Media & Growth Digital',
  experienceYears: '+5 anos no mercado',
  fullBio:
    'Com mais de 5 anos de experiência prática no ecossistema digital, atuo diretamente no desenvolvimento e execução de estratégias de presença online, produção de conteúdo magnético e tráfego direcionado. Meu objetivo é eliminar a dependência exclusiva do boca a boca, estruturando um processo previsível de captação de clientes.',
  mission:
    'Capacitar pequenos negócios, clínicas e empresas locais a conquistarem relevância no digital e transformarem atenção em faturamento recorrente.',
  focusAudience:
    'Pequenos e médios negócios, clínicas e saúde, moda e varejo, consultorias e prestadores de serviços locais.',
  pillars: [
    {
      title: 'Diagnóstico & Posicionamento',
      desc: 'Análise de perfil, público-alvo e nicho para estruturar uma presença de alto valor e diferenciação imediata.',
    },
    {
      title: 'Conteúdo Estratégico',
      desc: 'Linha editorial pensada para quebrar objeções, gerar conexão genuína e despertar desejo de compra.',
    },
    {
      title: 'Tráfego Pago & Alcance Local',
      desc: 'Anúncios direcionados para colocar sua empresa na frente das pessoas certas que já compram na sua região.',
    },
    {
      title: 'Conversão & Fechamento',
      desc: 'Otimização de funil do Reels e Stories direto para o fechamento no Direct e WhatsApp.',
    },
  ],
};

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

// Hook: 2.5D Cinematic Parallax tracking cursor on desktop and device orientation on mobile
function useParallax() {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Soft springs with cinematic inertia: responsive yet silky smooth with zero jitter
  const springConfig = { stiffness: 55, damping: 20, mass: 0.6 };
  const smoothX = useSpring(rawX, springConfig);
  const smoothY = useSpring(rawY, springConfig);

  useEffect(() => {
    // Mouse movement handler
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const normX = (e.clientX / innerWidth) * 2 - 1;
      const normY = (e.clientY / innerHeight) * 2 - 1;
      rawX.set(normX);
      rawY.set(normY);
    };

    const handleMouseLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };

    // Mobile device tilt / gyroscope handler
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        // Gamma (tilt left/right): [-28 deg, +28 deg] mapped to [-1, 1]
        const gammaClamped = Math.max(-28, Math.min(28, e.gamma || 0));
        // Beta (tilt forward/backward): normal handheld angle is ~45 deg, allow [-25 deg, +25 deg] range
        const betaDiff = (e.beta || 45) - 45;
        const betaClamped = Math.max(-25, Math.min(25, betaDiff));

        rawX.set(gammaClamped / 28);
        rawY.set(betaClamped / 25);
      }
    };

    // Mobile touch tracking fallback (so touching or dragging also gives holographic response on mobile)
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        const { innerWidth, innerHeight } = window;
        const touch = e.touches[0];
        const normX = (touch.clientX / innerWidth) * 2 - 1;
        const normY = (touch.clientY / innerHeight) * 2 - 1;
        rawX.set(normX);
        rawY.set(normY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [rawX, rawY]);

  return { smoothX, smoothY };
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

  // 2.5D Cinematic Parallax Transforms
  const { smoothX, smoothY } = useParallax();

  // Background ambient orbs: slow opposite displacement for distant backplane
  const bgX = useTransform(smoothX, [-1, 1], [-22, 22]);
  const bgY = useTransform(smoothY, [-1, 1], [-18, 18]);

  // Mid-background atmospheric dust motes: gentle intermediate shift
  const dustX = useTransform(smoothX, [-1, 1], [-12, 12]);
  const dustY = useTransform(smoothY, [-1, 1], [-10, 10]);

  // Photo layer: primary foreground subject with realistic 2.5D lens tilt
  const photoX = useTransform(smoothX, [-1, 1], [16, -16]);
  const photoY = useTransform(smoothY, [-1, 1], [12, -12]);
  const photoRotateY = useTransform(smoothX, [-1, 1], [-4.5, 4.5]);
  const photoRotateX = useTransform(smoothY, [-1, 1], [4, -4]);

  // Sobre panel: intermediate 2.5D depth plane beside photo
  const aboutX = useTransform(smoothX, [-1, 1], [11, -11]);
  const aboutY = useTransform(smoothY, [-1, 1], [8, -8]);
  const aboutRotateY = useTransform(smoothX, [-1, 1], [-2.8, 2.8]);
  const aboutRotateX = useTransform(smoothY, [-1, 1], [2.4, -2.4]);

  // Center bio & texts stack: distinct mid-foreground depth layer
  const contentX = useTransform(smoothX, [-1, 1], [7, -7]);
  const contentY = useTransform(smoothY, [-1, 1], [5, -5]);
  const contentRotateY = useTransform(smoothX, [-1, 1], [-1.8, 1.8]);
  const contentRotateX = useTransform(smoothY, [-1, 1], [1.5, -1.5]);

  // Right social buttons: independent 3D foreground floating plane
  const socialX = useTransform(smoothX, [-1, 1], [13, -13]);
  const socialY = useTransform(smoothY, [-1, 1], [11, -11]);
  const socialRotateY = useTransform(smoothX, [-1, 1], [-3.2, 3.2]);

  // Bottom right testimonial toast: floating HUD layer
  const toastX = useTransform(smoothX, [-1, 1], [6, -6]);
  const toastY = useTransform(smoothY, [-1, 1], [5, -5]);

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
  const [selectedTestimonialModal, setSelectedTestimonialModal] = useState<Testimonial | null>(null);

  // Digital business card & QR code modal state
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Sobre Mim & Empresa State (with localStorage persistence)
  const [aboutData, setAboutData] = useState<AboutData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('void_about_data');
      if (saved) {
        try {
          return { ...DEFAULT_ABOUT_DATA, ...JSON.parse(saved) };
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_ABOUT_DATA;
  });

  const [showAboutModal, setShowAboutModal] = useState(false);

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

  // Option 4: Background Image with Gradient Overlay & Transparency
  const [bgImage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('void_bg_image');
      if (saved) return saved;
    }
    return bgArchitectureImg;
  });

  const [bgOpacity] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('void_bg_opacity');
      if (saved) {
        const val = parseFloat(saved);
        if (val <= 0.22) return 0.45;
        return val;
      }
    }
    return 0.45; // 45% perfeitamente visível, elegante e balanceado
  });

  const [bgBlur] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('void_bg_blur');
      if (saved) return parseInt(saved, 10);
    }
    return 2; // 2px desfoque cinematográfico sutil
  });

  const resolvedBgImage = resolvePresetUrl(bgImage);

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
      {/* Cinematic ambient background glow and floating dust motes with 2.5D optical parallax */}
      <motion.div
        style={{
          x: bgX,
          y: bgY,
          scale: 1.06,
        }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        {/* Background Image Layer (Opção 4): Perfeitamente visível e nítida com controle de transparência e desfoque */}
        {resolvedBgImage && resolvedBgImage !== 'none' && (
          <div
            className="absolute inset-0 transition-opacity duration-300 pointer-events-none select-none"
            style={{ opacity: bgOpacity }}
          >
            <img
              src={resolvedBgImage}
              alt="Ambiente de Fundo"
              className="w-full h-full object-cover select-none pointer-events-none"
              style={{
                filter: `blur(${bgBlur}px) contrast(1.08) brightness(0.96)`,
                transform: 'scale(1.06)',
              }}
            />
          </div>
        )}

        {/* Efeito Degradê Gradiente: Radial Vignette elegante que mantém o centro nítido e escurece suavemente as bordas */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 90% 85% at 50% 45%, rgba(14, 16, 20, 0.12) 0%, rgba(10, 11, 15, 0.42) 55%, rgba(4, 4, 6, 0.88) 100%)',
          }}
        />

        {/* Efeito Degradê Gradiente: Linear vertical suave (topo e rodapé escuros elegantes, centro livre para a imagem) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(6, 7, 9, 0.52) 0%, rgba(6, 7, 9, 0.05) 30%, rgba(6, 7, 9, 0.15) 70%, rgba(4, 4, 6, 0.82) 100%)',
          }}
        />

        {/* Mid-background atmospheric dust motes with 2.5D optical parallax */}
        <motion.div
          style={{
            x: dustX,
            y: dustY,
          }}
          className="absolute inset-0 pointer-events-none"
        >
          <DustParticles />
        </motion.div>

        {/* Subtle luminous ambient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[650px] h-[650px] bg-emerald-500/[0.025] rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute -bottom-32 right-1/4 w-[750px] h-[750px] bg-white/[0.018] rounded-full blur-[170px] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />
      </motion.div>

      {/* MAIN CONTENT LAYER: Profile Photo + Bio beside it (Left & Center) and Floating Buttons (Right) */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="fixed inset-0 flex flex-col xl:flex-row items-center justify-between px-3 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14 z-20 pointer-events-none overflow-y-auto xl:overflow-visible py-8 xl:py-0"
      >
        {/* Left & Center: Floating Cutout Photo + Full Sobre Panel beside Photo + Remaining Elements beside Sobre */}
        <div className="flex flex-col xl:flex-row items-center xl:items-center gap-5 sm:gap-6 lg:gap-7 xl:gap-8 pointer-events-auto my-auto max-w-full xl:max-w-[92vw] 2xl:max-w-[88vw]">
          {/* COLUNA 1: Floating Photo (Uncropped, zero background, zero frame) with 2.5D lens parallax */}
          <motion.div
            style={{
              x: photoX,
              y: photoY,
              rotateX: photoRotateX,
              rotateY: photoRotateY,
              transformStyle: 'preserve-3d',
            }}
            className="relative flex flex-col items-center shrink-0"
          >
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
                className="group relative select-none cursor-default"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="relative bg-transparent">
                  <img
                    src={profileImage}
                    alt="José Pereira"
                    className="max-h-[38vh] sm:max-h-[46vh] lg:max-h-[58vh] xl:max-h-[68vh] 2xl:max-h-[74vh] max-w-[65vw] sm:max-w-[38vw] lg:max-w-[22vw] xl:max-w-[18vw] 2xl:max-w-[20vw] w-auto h-auto object-contain select-none block transition-all duration-500"
                    style={{
                      filter: 'drop-shadow(0 25px 45px rgba(0, 0, 0, 0.85))',
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* COLUNA 2: SOBRE TRAJETÓRIA & EMPRESA (Ao lado da foto) */}
          <motion.div
            style={{
              x: aboutX,
              y: aboutY,
              rotateX: aboutRotateX,
              rotateY: aboutRotateY,
              transformStyle: 'preserve-3d',
            }}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="w-full sm:max-w-md lg:max-w-[360px] xl:max-w-[390px] 2xl:max-w-[420px] shrink-0 flex flex-col text-left pointer-events-auto"
          >
            {/* Bloco de Identificação: Posicionado ACIMA do modal/card Sobre (não dentro do modal) */}
            <div className="mb-2 sm:mb-2.5 px-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
                {aboutData.fullName}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-emerald-400 mt-0.5">
                {aboutData.role}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-400 mt-1">
                <span className="text-zinc-200 font-medium">{aboutData.companyName}</span>
                <span className="text-zinc-500">•</span>
                <span className="text-emerald-300 font-medium">
                  {aboutData.experienceYears.includes('mercado')
                    ? aboutData.experienceYears
                    : `${aboutData.experienceYears} no mercado`}
                </span>
              </div>
            </div>

            {/* Modal / Card Sobre Trajetória & Empresa (mais largo e com a mesma largura do Perfil Profissional) */}
            <div className="w-full p-4 sm:p-4.5 rounded-3xl bg-[#131417]/85 border border-white/12 hover:border-emerald-500/30 backdrop-blur-2xl shadow-2xl text-left transition-colors flex flex-col gap-2.5">
              {/* Header do Sobre */}
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[10px] sm:text-[11px] font-semibold text-emerald-300">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Sobre • Trajetória & Empresa</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAboutModal(true)}
                  className="text-[10px] text-zinc-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Conhecer detalhes da trajetória e empresa"
                >
                  <Info className="w-3 h-3" />
                  <span>Ver mais</span>
                </button>
              </div>

              {/* Trajetória & Apresentação Profissional (sem poluição) */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-left">
                <h3 className="text-[10px] font-bold text-zinc-300 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Apresentação & Trajetória</span>
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                  {aboutData.fullBio}
                </p>
              </div>

              {/* Missão da Empresa */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-left">
                <h3 className="text-[10px] font-bold text-zinc-300 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Missão da Empresa</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                  {aboutData.mission}
                </p>
              </div>

              {/* Metodologia de Atuação • 4 Pilares */}
              <div className="text-left">
                <h3 className="text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Metodologia em 4 Pilares
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {aboutData.pillars.map((pillar, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-[#16171a]/90 border border-white/10 hover:border-emerald-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-200 truncate">
                          {pillar.title}
                        </span>
                      </div>
                      <p className="text-[9px] text-zinc-400 leading-tight line-clamp-2">
                        {pillar.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Público & Nichos Atendidos */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/10 text-[10px] text-zinc-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="leading-tight">
                  <strong className="text-zinc-200">Foco:</strong> {aboutData.focusAudience}
                </span>
              </div>
            </div>
          </motion.div>

          {/* COLUNA 3: DEMAIS ELEMENTOS / PERFIL PROFISSIONAL (Ao lado do Sobre) */}
          <motion.div
            style={{
              x: contentX,
              y: contentY,
              rotateX: contentRotateX,
              rotateY: contentRotateY,
              transformStyle: 'preserve-3d',
            }}
            className="w-full sm:max-w-md lg:max-w-[360px] xl:max-w-[390px] 2xl:max-w-[420px] shrink-0 flex flex-col text-left select-none"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col text-left select-none w-full"
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
          </motion.div>
        </div>

        {/* RIGHT SIDE: Floating Social Buttons with 2.5D parallax plane */}
        <motion.div
          style={{
            x: socialX,
            y: socialY,
            rotateY: socialRotateY,
            transformStyle: 'preserve-3d',
          }}
          className="flex flex-row xl:flex-col gap-3.5 sm:gap-4 xl:gap-5 2xl:gap-6 pointer-events-auto shrink-0 my-auto py-4 xl:py-0 justify-center w-full xl:w-auto relative z-30"
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
                      className="absolute right-full mr-2 pointer-events-none hidden lg:flex items-center z-50"
                    >
                      <div className="px-3.5 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 text-zinc-100 text-xs font-medium tracking-wide shadow-2xl flex items-center gap-1.5 whitespace-nowrap pointer-events-none">
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
                  className="relative pointer-events-auto"
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
                    className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl cursor-pointer focus:outline-none select-none pointer-events-auto"
                    style={{
                      transformStyle: 'preserve-3d',
                    }}
                    title={btn.name}
                    aria-label={btn.name}
                  >
                    {/* Glow ring layer: pointer-events-none so click passes through to <a> */}
                    <motion.div
                      className={`absolute -inset-2 rounded-2xl bg-gradient-to-r ${btn.gradientRing} opacity-0 blur-md transition-opacity duration-500 pointer-events-none`}
                      animate={{
                        opacity: isHovered ? 0.75 : 0,
                      }}
                    />

                    {/* Shadow layer: pointer-events-none */}
                    <div
                      className="absolute inset-0 rounded-2xl transition-all duration-500 pointer-events-none"
                      style={{
                        boxShadow: isHovered
                          ? `0 25px 45px -8px rgba(0, 0, 0, 0.9), 0 0 35px ${btn.accentGlow}`
                          : '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
                      }}
                    />

                    {/* Button Surface & Border: pointer-events-none so entire bounding box & borders trigger the <a> */}
                    <div className="relative z-10 flex items-center justify-center w-full h-full rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/15 group-hover:border-white/40 group-hover:bg-zinc-800/85 transition-colors duration-400 overflow-hidden shadow-inner pointer-events-none">
                      <div className="absolute top-0 inset-x-0 h-[45%] bg-gradient-to-b from-white/15 to-transparent rounded-t-2xl pointer-events-none" />
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-zinc-300 group-hover:text-white transition-all duration-400 group-hover:scale-110 drop-shadow-md pointer-events-none" />
                    </div>
                  </motion.a>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* OPTION 3: ROTATING COMPACT SOCIAL PROOF PILL (Clean & Unobtrusive with 2.5D floating HUD depth) */}
      <AnimatePresence>
        {showTestimonialToast && currentTestimonial && (
          <motion.div
            style={{
              x: toastX,
              y: toastY,
            }}
            className="fixed bottom-3 right-3 sm:bottom-4 sm:right-6 lg:right-8 z-40 pointer-events-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.94 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setSelectedTestimonialModal(currentTestimonial)}
              className="max-w-[270px] sm:max-w-xs rounded-2xl bg-[#141519]/90 hover:bg-[#181a20]/95 border border-white/15 hover:border-emerald-400/40 backdrop-blur-2xl p-2 sm:p-2.5 shadow-2xl cursor-pointer group transition-all"
              title="Toque para ver o depoimento completo"
            >
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Avatar Initial with subtle glow */}
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-[11px] font-bold text-emerald-300 shrink-0 group-hover:scale-105 transition-transform">
                    {currentTestimonial.name.charAt(0)}
                  </div>

                  {/* Name + Verified + Company (clean & compact) */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white truncate leading-tight">
                        {currentTestimonial.name}
                      </span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    </div>
                    <span className="text-[10px] text-zinc-400 truncate block leading-tight">
                      {currentTestimonial.company}
                    </span>
                  </div>
                </div>

                {/* Stars + Tap indicator */}
                <div className="flex flex-col items-end shrink-0 pl-1">
                  <span className="text-[10px] text-amber-300 tracking-wider">
                    ★★★★★
                  </span>
                  <span className="text-[8px] text-zinc-500 group-hover:text-emerald-300 flex items-center gap-0.5 transition-colors font-medium">
                    <span>abrir</span>
                    <span className="font-mono text-[8px]">↗</span>
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TESTIMONIAL DETAIL MODAL (Opens on click of the clean pill) */}
      <AnimatePresence>
        {selectedTestimonialModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-sm bg-[#131417]/95 border border-white/20 rounded-3xl p-6 shadow-2xl text-white backdrop-blur-2xl text-left"
            >
              <button
                onClick={() => setSelectedTestimonialModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[11px] font-semibold text-emerald-300 mb-3.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Depoimento Verificado</span>
              </div>

              <div className="flex items-center gap-3 mb-3.5">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-sm font-bold text-emerald-300 shrink-0">
                  {selectedTestimonialModal.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-white">
                      {selectedTestimonialModal.name}
                    </h4>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                  <p className="text-xs text-zinc-400">
                    {selectedTestimonialModal.company}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-amber-300 mb-3">
                <span>★★★★★</span>
                <span className="text-[10px] text-zinc-400 ml-1">
                  (5.0 • Excelente)
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 mb-4">
                <p className="text-xs text-zinc-200 leading-relaxed italic">
                  "{selectedTestimonialModal.text}"
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-5">
                <span>Depoimento real de cliente</span>
                <span>{selectedTestimonialModal.timeAgo}</span>
              </div>

              <div className="space-y-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Olá José! Vi o depoimento de ${selectedTestimonialModal.name} (${selectedTestimonialModal.company}) e gostaria de conversar sobre meu negócio também.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-semibold text-xs hover:opacity-95 transition-opacity shadow-lg cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Conversar no WhatsApp com o José</span>
                </a>

                <button
                  onClick={() => setSelectedTestimonialModal(null)}
                  className="w-full py-2 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
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

      {/* ABOUT ME & COMPANY MODAL (View-Only Institutional Presentation) */}
      <AnimatePresence>
        {showAboutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xl bg-[#131417]/95 border border-white/20 rounded-3xl p-5 sm:p-7 shadow-2xl text-white backdrop-blur-2xl max-h-[92vh] overflow-y-auto text-left"
            >
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAboutModal(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[11px] font-semibold text-emerald-300 mb-3">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Perfil & Empresa</span>
                </div>

                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      {aboutData.fullName}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-emerald-400">
                      {aboutData.role}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {aboutData.companyName} • <span className="text-zinc-300 font-medium">{aboutData.experienceYears.includes('mercado') ? aboutData.experienceYears : `${aboutData.experienceYears} no mercado`}</span>
                    </p>
                  </div>
                </div>

                {/* Trajetória & Apresentação */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 mb-4 text-left">
                  <h4 className="text-xs font-bold text-zinc-200 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Trajetória & Posicionamento</span>
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {aboutData.fullBio}
                  </p>
                </div>

                {/* Missão e Público */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-left">
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                    <h4 className="text-xs font-bold text-zinc-200 mb-1 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-teal-400" />
                      <span>Missão da Empresa</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {aboutData.mission}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                    <h4 className="text-xs font-bold text-zinc-200 mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Público & Nichos</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {aboutData.focusAudience}
                    </p>
                  </div>
                </div>

                {/* Metodologia de Trabalho */}
                <div className="mb-5 text-left">
                  <h4 className="text-xs font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                    Como Trabalhamos • 4 Pilares de Sucesso
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {aboutData.pillars.map((pillar, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#16171b]/80 border border-white/10 hover:border-emerald-500/30 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-zinc-200">
                            {pillar.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          {pillar.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ações do Rodapé */}
                <div className="space-y-2 pt-1">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Olá José! Li sobre sua trajetória e sobre a ${aboutData.companyName} e gostaria de agendar uma conversa sobre meu negócio.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-semibold text-xs sm:text-sm hover:opacity-95 transition-opacity shadow-lg cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Falar Diretamente com o José no WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowAboutModal(false)}
                    className="w-full py-2.5 px-5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer border border-white/10 rounded-xl"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
