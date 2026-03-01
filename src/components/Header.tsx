import { useState, useEffect } from 'react';

interface HeaderProps {
  onSearch: (query: string) => void;
  onMenuToggle: () => void;
  onSettingsClick?: () => void;
  searchQuery: string;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('fr-FR', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-12 border-b border-emerald-500/20 bg-black/60 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40 font-mono">
      <div className="flex items-center gap-8">
        <button className="lg:hidden text-emerald-500" onClick={onMenuToggle}>☰</button>
        <span className="text-emerald-500 font-black tracking-tighter text-lg">TUTODECODE_SYS</span>
        <div className="hidden md:flex gap-6 text-[10px] uppercase tracking-[0.2em]">
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Uptime: 99.9%</span>
          <span className="flex items-center gap-2 text-zinc-600"><span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span> Signal: Encrypted</span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-[10px]">
        <span className="hidden md:inline-block bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded">SESSION: GUEST_USER</span>
        <span className="text-zinc-500">{time}</span>
      </div>
    </header>
  );
}