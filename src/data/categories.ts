import { Terminal, Box, Shield, Code2 } from 'lucide-react';
import type { Category } from '@/types';

export const categories: Category[] = [
  // Les 4 Piliers TutoDecode
  { id: 'kernel', name: 'Kernel', icon: Terminal, description: 'Bases Systèmes et Linux', color: '#10b981' }, // emerald-500
  { id: 'ship', name: 'Ship', icon: Box, description: 'Docker, K8s, Git et DevOps', color: '#3b82f6' }, // blue-500
  { id: 'shield', name: 'Shield', icon: Shield, description: 'Cybersécurité et Pentesting', color: '#ef4444' }, // red-500
  { id: 'forge', name: 'Forge', icon: Code2, description: 'Développement Web et Logiciel', color: '#f59e0b' }, // amber-500
];
