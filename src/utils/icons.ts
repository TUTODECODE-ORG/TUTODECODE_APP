import { Terminal, Code, Database, Shield, Cloud, Cpu, Lock, Globe, Server, Box, Layers, GraduationCap, Rocket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const icons: Record<string, LucideIcon> = {
    Terminal, Code, Database, Shield, Cloud, Cpu, Lock, Globe, Server, Box, Layers, GraduationCap, Rocket
};

export const getIcon = (name: string): LucideIcon => {
    return icons[name] || Code;
};
