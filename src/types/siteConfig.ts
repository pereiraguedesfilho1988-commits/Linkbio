export interface BioItem {
  id: string;
  emoji: string;
  text: string;
}

export interface Pillar {
  id: string;
  title: string;
  desc: string;
}

export interface AboutConfig {
  fullName: string;
  role: string;
  companyName: string;
  experienceYears: string;
  shortBio: string;
  fullBio: string;
  mission: string;
  focusAudience: string;
  pillars: Pillar[];
}

export interface SocialButtonConfig {
  id: string;
  name: string;
  url: string;
  iconName: 'Instagram' | 'Facebook' | 'MessageCircle' | 'Globe' | 'Youtube' | 'Linkedin' | 'Twitter' | 'Send' | 'Mail' | 'Phone';
  accentGlow: string;
  gradientRing: string;
  floatDelay: number;
  floatDuration: number;
  active: boolean;
}

export interface ServiceOptionConfig {
  id: string;
  label: string;
  emoji: string;
  messageText: string;
  active: boolean;
}

export interface CaseStudyConfig {
  id: string;
  niche: string;
  highlightMetric: string;
  badgeColor: string;
  description: string;
  result: string;
}

export interface TestimonialConfig {
  id: string;
  name: string;
  company: string;
  text: string;
  stars: number;
  timeAgo: string;
}

export interface MetricsConfig {
  companies: {
    start: number;
    target: number;
    step: number;
    intervalMs: number;
    label: string;
  };
  reach: {
    steps: string[];
    intervalMs: number;
    label: string;
  };
  rating: {
    score: string;
    label: string;
    reviewsCount: string;
  };
}

export interface BackgroundConfig {
  presetId: 'architecture' | 'silk' | 'studio' | 'none' | 'custom';
  customUrl: string;
  opacity: number;
  blur: number;
  showParticles: boolean;
}

export interface ProfileConfig {
  fullName: string;
  roles: string[];
  companyName: string;
  experienceYears: string;
  photoUrl: string;
  vCardPhone: string;
  vCardEmail: string;
}

export interface SiteConfig {
  profile: ProfileConfig;
  bioItems: BioItem[];
  about: AboutConfig;
  socialButtons: SocialButtonConfig[];
  services: ServiceOptionConfig[];
  whatsappNumber: string;
  caseStudies: CaseStudyConfig[];
  testimonials: TestimonialConfig[];
  metrics: MetricsConfig;
  background: BackgroundConfig;
}
