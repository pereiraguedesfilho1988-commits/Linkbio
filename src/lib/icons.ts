import React from 'react';
import {
  Instagram,
  Facebook,
  MessageCircle,
  Globe,
  Youtube,
  Linkedin,
  Twitter,
  Send,
  Mail,
  Phone,
  Share2,
} from 'lucide-react';

export const AVAILABLE_ICONS = {
  Instagram: Instagram,
  Facebook: Facebook,
  MessageCircle: MessageCircle,
  Globe: Globe,
  Youtube: Youtube,
  Linkedin: Linkedin,
  Twitter: Twitter,
  Send: Send,
  Mail: Mail,
  Phone: Phone,
};

export type IconName = keyof typeof AVAILABLE_ICONS;

export function renderIcon(iconName: string, className?: string) {
  const IconComponent = AVAILABLE_ICONS[iconName as IconName] || Share2;
  return React.createElement(IconComponent, { className });
}
