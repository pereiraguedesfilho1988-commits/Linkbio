import React, { useState, useRef, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import {
  MessageCircle,
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
  Building2,
  Info,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useSiteConfig } from '../context/SiteConfigContext';
import { renderIcon } from '../lib/icons';
import bgArchitectureImg from '../assets/images/luxury_dark_bg_1791390268087.jpg';
import bgSilkImg from '../assets/images/dark_silk_bg_1791390286526.jpg';
import bgStudioImg from '../assets/images/dark_studio_bg_1791390886071.jpg';

interface PublicPageProps {
  onOpenAdmin: () => void;
}

const resolvePresetUrl = (presetId: string, customUrl: string) => {
  if (presetId === 'none') return 'none';
  if (presetId === 'architecture') return bgArchitectureImg;
  if (presetId === 'silk') return bgSilkImg;
  if (presetId === 'studio') return bgStudioImg;
  if (presetId === 'custom' && customUrl) return customUrl;
  return bgArchitectureImg;
};

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

// Hook: Slow, gradual count up for Empresas starting from start, stepping up to target
function useCompaniesSlowCounter(start: number = 5, target: number = 30, step: number = 2, intervalMs: number = 1920) {
  const [count, setCount] = useState(start);
  const [isPulse, setIsPulse] = useState(false);

  useEffect(() => {
    setCount(start);
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

// Hook: Gradual counter for Alcance stepping through configured steps
function useReachStepCounter(steps: string[] = ['+200k', '+400k', '+600k', '+800k', '+1.0M', '+1.2M', '+1.4M', '+1.5M'], intervalMs: number = 3570) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPulse, setIsPulse] = useState(false);

  useEffect(() => {
    setStepIndex(0);
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (!steps || steps.length === 0) return 0;
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          return steps.length - 1;
        }
        setIsPulse(true);
        setTimeout(() => setIsPulse(false), 450);
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [steps, intervalMs]);

  return {
    reachText: steps[stepIndex] || steps[0] || '+1.5M',
    isPulse,
  };
}

// Hook: Very slow live rating ticker simulating real-time reviews
function useLiveRatingTicker(targetScore: string = '5.0') {
  const [rating, setRating] = useState('4.8');
  const [isLivePulse, setIsLivePulse] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setRating('4.9');
      setIsLivePulse(true);
      setTimeout(() => setIsLivePulse(false), 1500);
    }, 6000);

    const t2 = setTimeout(() => {
      setRating(targetScore);
      setIsLivePulse(true);
      setTimeout(() => setIsLivePulse(false), 2000);
    }, 18000);

    const interval = setInterval(() => {
      setIsLivePulse(true);
      setTimeout(() => setIsLivePulse(false), 2000);
    }, 16000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(interval);
    };
  }, [targetScore]);

  return { rating, isLivePulse };
}

// Hook: 2.5D Cinematic Parallax tracking cursor on desktop and device orientation on mobile
function useParallax() {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springConfig = { stiffness: 55, damping: 20, mass: 0.6 };
  const smoothX = useSpring(rawX, springConfig);
  const smoothY = useSpring(rawY, springConfig);

  useEffect(() => {
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

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        const gammaClamped = Math.max(-28, Math.min(28, e.gamma || 0));
        const betaDiff = (e.beta || 45) - 45;
        const betaClamped = Math.max(-25, Math.min(25, betaDiff));

        rawX.set(gammaClamped / 28);
        rawY.set(betaClamped / 25);
      }
    };

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

export const PublicPage: React.FC<PublicPageProps> = ({ onOpenAdmin }) => {
  const { config } = useSiteConfig();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Parallax transforms
  const { smoothX, smoothY } = useParallax();

  const bgX = useTransform(smoothX, [-1, 1], [-22, 22]);
  const bgY = useTransform(smoothY, [-1, 1], [-18, 18]);

  const dustX = useTransform(smoothX, [-1, 1], [-12, 12]);
  const dustY = useTransform(smoothY, [-1, 1], [-10, 10]);

  const photoX = useTransform(smoothX, [-1, 1], [16, -16]);
  const photoY = useTransform(smoothY, [-1, 1], [12, -12]);
  const photoRotateY = useTransform(smoothX, [-1, 1], [-4.5, 4.5]);
  const photoRotateX = useTransform(smoothY, [-1, 1], [4, -4]);

  const aboutX = useTransform(smoothX, [-1, 1], [11, -11]);
  const aboutY = useTransform(smoothY, [-1, 1], [8, -8]);
  const aboutRotateY = useTransform(smoothX, [-1, 1], [-2.8, 2.8]);
  const aboutRotateX = useTransform(smoothY, [-1, 1], [2.4, -2.4]);

  const contentX = useTransform(smoothX, [-1, 1], [7, -7]);
  const contentY = useTransform(smoothY, [-1, 1], [5, -5]);
  const contentRotateY = useTransform(smoothX, [-1, 1], [-1.8, 1.8]);
  const contentRotateX = useTransform(smoothY, [-1, 1], [1.5, -1.5]);

  const socialX = useTransform(smoothX, [-1, 1], [13, -13]);
  const socialY = useTransform(smoothY, [-1, 1], [11, -11]);
  const socialRotateY = useTransform(smoothX, [-1, 1], [-3.2, 3.2]);

  const toastX = useTransform(smoothX, [-1, 1], [6, -6]);
  const toastY = useTransform(smoothY, [-1, 1], [5, -5]);

  // Animated counters
  const { count: companiesCount, isPulse: isCompaniesPulse } = useCompaniesSlowCounter(
    config.metrics.companies.start,
    config.metrics.companies.target,
    config.metrics.companies.step,
    config.metrics.companies.intervalMs
  );
  const { reachText: reachDisplay, isPulse: isReachPulse } = useReachStepCounter(
    config.metrics.reach.steps,
    config.metrics.reach.intervalMs
  );
  const { rating, isLivePulse } = useLiveRatingTicker(config.metrics.rating.score);

  // Subtitle roles cycle
  const [roleIndex, setRoleIndex] = useState(0);
  const rolesList = config.profile.roles && config.profile.roles.length > 0 ? config.profile.roles : ['Marketing & Social Media'];

  useEffect(() => {
    const roleTimer = setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % rolesList.length);
    }, 3200);
    return () => clearInterval(roleTimer);
  }, [rolesList.length]);

  // Bio items rotating carousel
  const [bioList, setBioList] = useState(config.bioItems);
  useEffect(() => {
    setBioList(config.bioItems);
  }, [config.bioItems]);

  useEffect(() => {
    const itemsTimer = setInterval(() => {
      setBioList((prev) => {
        if (!prev || prev.length <= 1) return prev;
        const [first, ...rest] = prev;
        return [...rest, first];
      });
    }, 5500);
    return () => clearInterval(itemsTimer);
  }, []);

  // WhatsApp active service selector
  const activeServices = config.services.filter((s) => s.active);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(() => {
    return activeServices[0]?.id || 'management';
  });

  const activeService =
    activeServices.find((s) => s.id === selectedServiceId) || activeServices[0] || {
      messageText: 'Olá! Gostaria de saber mais sobre seus serviços.',
    };

  const cleanPhone = (config.whatsappNumber || '').replace(/\D/g, '');
  const dynamicWhatsAppUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(activeService.messageText)}`
    : `https://wa.me/?text=${encodeURIComponent(activeService.messageText)}`;

  // Modals
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showCasesModal, setShowCasesModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Testimonials rotating toast
  const activeTestimonials = config.testimonials;
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [showTestimonialToast, setShowTestimonialToast] = useState(false);
  const [selectedTestimonialModal, setSelectedTestimonialModal] = useState<(typeof activeTestimonials)[0] | null>(null);

  useEffect(() => {
    if (!activeTestimonials || activeTestimonials.length === 0) return;

    const initialTimer = setTimeout(() => {
      setShowTestimonialToast(true);
    }, 4000);

    const cycleInterval = setInterval(() => {
      setShowTestimonialToast(false);
      setTimeout(() => {
        setTestimonialIndex((prev) => (prev + 1) % activeTestimonials.length);
        setShowTestimonialToast(true);
      }, 2000);
    }, 16000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(cycleInterval);
    };
  }, [activeTestimonials.length]);

  // QR Code generator
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
      `FN:${config.profile.fullName}`,
      `TITLE:${config.profile.roles[0] || 'Marketing & Social Media'}`,
      `ORG:${config.profile.companyName}`,
      `TEL;TYPE=CELL:${config.profile.vCardPhone || ''}`,
      `EMAIL:${config.profile.vCardEmail || ''}`,
      `NOTE:${config.about.shortBio}`,
      `URL:${pageUrl}`,
      'END:VCARD',
    ].join('\r\n');

    const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${config.profile.fullName.replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Keyboard shortcut Ctrl+Shift+A to open Admin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        onOpenAdmin();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenAdmin]);

  const resolvedBgImage = resolvePresetUrl(config.background.presetId, config.background.customUrl);
  const currentTestimonial = activeTestimonials[testimonialIndex] || activeTestimonials[0];
  const activeSocialButtons = config.socialButtons.filter((b) => b.active);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none cursor-default bg-gradient-to-br from-[#2a2d33] via-[#151619] to-[#040405]"
      style={{ perspective: '1200px' }}
    >
      {/* Background Layer with 2.5D optical parallax */}
      <motion.div
        style={{
          x: bgX,
          y: bgY,
          scale: 1.06,
        }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        {resolvedBgImage && resolvedBgImage !== 'none' && (
          <div
            className="absolute inset-0 transition-opacity duration-300 pointer-events-none select-none"
            style={{ opacity: config.background.opacity }}
          >
            <img
              src={resolvedBgImage}
              alt="Ambiente de Fundo"
              className="w-full h-full object-cover select-none pointer-events-none"
              style={{
                filter: `blur(${config.background.blur}px) contrast(1.08) brightness(0.96)`,
                transform: 'scale(1.06)',
              }}
            />
          </div>
        )}

        {/* Efeito Degradê Gradiente: Radial Vignette elegante */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 90% 85% at 50% 45%, rgba(14, 16, 20, 0.12) 0%, rgba(10, 11, 15, 0.42) 55%, rgba(4, 4, 6, 0.88) 100%)',
          }}
        />

        {/* Efeito Degradê Gradiente: Linear vertical suave */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(6, 7, 9, 0.52) 0%, rgba(6, 7, 9, 0.05) 30%, rgba(6, 7, 9, 0.15) 70%, rgba(4, 4, 6, 0.82) 100%)',
          }}
        />

        {/* Mid-background atmospheric dust motes */}
        {config.background.showParticles && (
          <motion.div
            style={{
              x: dustX,
              y: dustY,
            }}
            className="absolute inset-0 pointer-events-none"
          >
            <DustParticles />
          </motion.div>
        )}

        {/* Ambient subtle orbs */}
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

      {/* MAIN CONTENT LAYER: Profile Photo + Sobre Panel + Perfil Profissional (Left & Center) and Floating Buttons (Right) */}
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="fixed inset-0 flex flex-col xl:flex-row items-center justify-between px-3 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14 z-20 pointer-events-none overflow-y-auto xl:overflow-visible py-8 xl:py-0"
      >
        {/* Left & Center Columns */}
        <div className="flex flex-col xl:flex-row items-center xl:items-center gap-5 sm:gap-6 lg:gap-7 xl:gap-8 pointer-events-auto my-auto max-w-full xl:max-w-[92vw] 2xl:max-w-[88vw]">
          {/* COLUNA 1: Floating Photo (2.5D lens parallax) */}
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
                    src={config.profile.photoUrl}
                    alt={config.profile.fullName}
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
            {/* Bloco de Identificação: Acima do modal Sobre */}
            <div className="mb-2 sm:mb-2.5 px-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
                {config.about.fullName || config.profile.fullName}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-emerald-400 mt-0.5">
                {config.about.role || config.profile.roles[0]}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-400 mt-1">
                <span className="text-zinc-200 font-medium">{config.profile.companyName}</span>
                <span className="text-zinc-500">•</span>
                <span className="text-emerald-300 font-medium">
                  {config.profile.experienceYears.includes('mercado')
                    ? config.profile.experienceYears
                    : `${config.profile.experienceYears} no mercado`}
                </span>
              </div>
            </div>

            {/* Modal / Card Sobre Trajetória & Empresa (mesma largura do Perfil Profissional) */}
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

              {/* Trajetória & Apresentação Profissional */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-left">
                <h3 className="text-[10px] font-bold text-zinc-300 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Apresentação & Trajetória</span>
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                  {config.about.fullBio}
                </p>
              </div>

              {/* Missão da Empresa */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 text-left">
                <h3 className="text-[10px] font-bold text-zinc-300 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Missão da Empresa</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                  {config.about.mission}
                </p>
              </div>

              {/* Metodologia de Atuação • 4 Pilares */}
              <div className="text-left">
                <h3 className="text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Metodologia em 4 Pilares
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {config.about.pillars.slice(0, 4).map((pillar, idx) => (
                    <div
                      key={pillar.id || idx}
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
                  <strong className="text-zinc-200">Foco:</strong> {config.about.focusAudience}
                </span>
              </div>
            </div>
          </motion.div>

          {/* COLUNA 3: DEMAIS ELEMENTOS / PERFIL PROFISSIONAL */}
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
                {/* Header Badge: Living letters moving smoothly */}
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

                {/* Status Indicator */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[10px] sm:text-[11px] font-medium backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>Agenda Aberta</span>
                </div>
              </div>

              {/* Profile Name: Heartbeat pulse */}
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
                  {config.profile.fullName}
                </motion.h1>
              </div>

              {/* Subtitle Roles Cycle */}
              <div className="h-6 sm:h-7 mt-0.5 mb-2.5 flex items-center overflow-hidden" style={{ perspective: 400 }}>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={rolesList[roleIndex] || 'role'}
                    initial={{ opacity: 0, y: 14, rotateX: -60, filter: 'blur(3px)' }}
                    animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -14, rotateX: 60, filter: 'blur(3px)' }}
                    transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                    className="text-sm sm:text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-zinc-100 to-teal-300 tracking-wide"
                  >
                    {rolesList[roleIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Stats Strip with dynamic counters */}
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
                  <span className="text-[10px] text-zinc-400 font-medium tracking-tight mt-0.5 text-center">
                    {config.metrics.companies.label}
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
                  <span className="text-[10px] text-zinc-400 font-medium tracking-tight mt-0.5 text-center">
                    {config.metrics.reach.label}
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
                  <span className="text-[10px] text-zinc-400 font-medium tracking-tight mt-0.5 flex items-center gap-1 text-center">
                    <span>{config.metrics.rating.label}</span>
                    {isLivePulse && (
                      <span className="text-[9px] text-emerald-400 font-semibold">• ao vivo</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Description Bullet Items (Rotates every 5.5s) */}
              <div className="space-y-2 sm:space-y-2.5 mb-3.5">
                {bioList.map((item) => (
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
                    <span className="text-base sm:text-lg shrink-0">{item.emoji}</span>
                    <span className="text-xs sm:text-sm text-zinc-100 font-normal leading-relaxed">
                      {item.text}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* WhatsApp Service Qualifier Selector */}
              {activeServices.length > 0 && (
                <div className="mb-2.5">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block mb-1.5">
                    Selecione o serviço de interesse:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {activeServices.map((s) => {
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
              )}

              {/* HIGH-CONVERSION CTA & ACTIONS BAR */}
              <div className="flex items-center gap-2 pt-1">
                {/* Primary WhatsApp CTA Button */}
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

                {/* Case Studies / Results Modal Button */}
                {config.caseStudies.length > 0 && (
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
                )}

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

        {/* RIGHT SIDE: Floating Social Buttons (100% clickable everywhere) */}
        <motion.div
          style={{
            x: socialX,
            y: socialY,
            rotateY: socialRotateY,
            transformStyle: 'preserve-3d',
          }}
          className="flex flex-row xl:flex-col gap-3.5 sm:gap-4 xl:gap-5 2xl:gap-6 pointer-events-auto shrink-0 my-auto py-4 xl:py-0 justify-center w-full xl:w-auto relative z-30"
        >
          {activeSocialButtons.map((btn) => {
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
                    duration: btn.floatDuration || 4.5,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                    delay: btn.floatDelay || 0,
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
                    {/* Glow ring */}
                    <motion.div
                      className={`absolute -inset-2 rounded-2xl bg-gradient-to-r ${btn.gradientRing} opacity-0 blur-md transition-opacity duration-500 pointer-events-none`}
                      animate={{
                        opacity: isHovered ? 0.75 : 0,
                      }}
                    />

                    {/* Shadow */}
                    <div
                      className="absolute inset-0 rounded-2xl transition-all duration-500 pointer-events-none"
                      style={{
                        boxShadow: isHovered
                          ? `0 25px 45px -8px rgba(0, 0, 0, 0.9), 0 0 35px ${btn.accentGlow}`
                          : '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
                      }}
                    />

                    {/* Button Surface */}
                    <div className="relative z-10 flex items-center justify-center w-full h-full rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/15 group-hover:border-white/40 group-hover:bg-zinc-800/85 transition-colors duration-400 overflow-hidden shadow-inner pointer-events-none">
                      <div className="absolute top-0 inset-x-0 h-[45%] bg-gradient-to-b from-white/15 to-transparent rounded-t-2xl pointer-events-none" />
                      <div className="text-zinc-300 group-hover:text-white transition-all duration-400 group-hover:scale-110 drop-shadow-md pointer-events-none">
                        {renderIcon(btn.iconName, 'w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7')}
                      </div>
                    </div>
                  </motion.a>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </motion.div>

      {/* Discrete Admin Shortcut Link in Bottom-Left */}
      <div className="fixed bottom-3 left-3 z-30 pointer-events-auto">
        <button
          onClick={onOpenAdmin}
          className="opacity-20 hover:opacity-100 transition-opacity p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-black/60 text-[10px] flex items-center gap-1 cursor-pointer"
          title="Acessar Painel Administrativo (/admin ou Ctrl+Shift+A)"
        >
          <Lock className="w-3 h-3" />
          <span className="hidden sm:inline">Admin</span>
        </button>
      </div>

      {/* ROTATING COMPACT SOCIAL PROOF PILL */}
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
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-[11px] font-bold text-emerald-300 shrink-0 group-hover:scale-105 transition-transform">
                    {currentTestimonial.name.charAt(0)}
                  </div>

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

                <div className="flex flex-col items-end shrink-0 pl-1">
                  <span className="text-[10px] text-amber-300 tracking-wider">
                    {'★'.repeat(currentTestimonial.stars || 5)}
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

      {/* TESTIMONIAL DETAIL MODAL */}
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
                <span>{'★'.repeat(selectedTestimonialModal.stars || 5)}</span>
                <span className="text-[10px] text-zinc-400 ml-1">
                  (5.0 • Excelente)
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 mb-4">
                <p className="text-xs text-zinc-200 leading-relaxed italic">
                  &ldquo;{selectedTestimonialModal.text}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-5">
                <span>Depoimento real de cliente</span>
                <span>{selectedTestimonialModal.timeAgo}</span>
              </div>

              <div className="space-y-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Olá ${config.profile.fullName}! Vi o depoimento de ${selectedTestimonialModal.name} (${selectedTestimonialModal.company}) e gostaria de conversar sobre meu negócio também.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-semibold text-xs hover:opacity-95 transition-opacity shadow-lg cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Conversar no WhatsApp com o {config.profile.fullName.split(' ')[0]}</span>
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

      {/* RESULTS & CASE STUDIES MODAL */}
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
                {config.caseStudies.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all text-left"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-zinc-200">{c.niche}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${c.badgeColor}`}>
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
                    `Olá ${config.profile.fullName}! Vi os cases no seu perfil e quero entender como alcançar resultados semelhantes no meu negócio.`
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

              <h3 className="text-xl font-bold text-white mb-0.5">{config.profile.fullName}</h3>
              <p className="text-xs text-zinc-400 mb-5">{config.profile.roles[0] || 'Marketing & Social Media'}</p>

              <div className="p-4 rounded-2xl bg-white shadow-xl mx-auto w-fit mb-5">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt={`QR Code de ${config.profile.fullName}`}
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
                      {config.about.fullName || config.profile.fullName}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-emerald-400">
                      {config.about.role || config.profile.roles[0]}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {config.profile.companyName} • <span className="text-zinc-300 font-medium">{config.profile.experienceYears.includes('mercado') ? config.profile.experienceYears : `${config.profile.experienceYears} no mercado`}</span>
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
                    {config.about.fullBio}
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
                      {config.about.mission}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                    <h4 className="text-xs font-bold text-zinc-200 mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Público & Nichos</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {config.about.focusAudience}
                    </p>
                  </div>
                </div>

                {/* Metodologia de Trabalho */}
                <div className="mb-5 text-left">
                  <h4 className="text-xs font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                    Como Trabalhamos • 4 Pilares de Sucesso
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {config.about.pillars.map((pillar, idx) => (
                      <div
                        key={pillar.id || idx}
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
                      `Olá ${config.profile.fullName}! Li sobre sua trajetória e sobre a ${config.profile.companyName} e gostaria de agendar uma conversa sobre meu negócio.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white font-semibold text-xs sm:text-sm hover:opacity-95 transition-opacity shadow-lg cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Falar Diretamente com o {config.profile.fullName.split(' ')[0]} no WhatsApp</span>
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
};
