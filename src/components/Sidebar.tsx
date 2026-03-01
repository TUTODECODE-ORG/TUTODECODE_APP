import { cn } from '@/lib/utils';

interface SidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  activeLevel: string;
  onLevelChange: (level: string) => void;
  favorites: string[];
  completed: string[];
  isOpen: boolean;
  onClose: () => void;
  currentView?: 'home' | 'career' | 'lab' | 'honeypot';
  onViewChange?: (view: 'home' | 'career' | 'lab' | 'honeypot') => void;
}

export function Sidebar({
  isOpen,
  onClose,
  currentView,
  onViewChange,
  completed
}: SidebarProps) {

  const progressPercent = Math.min(100, Math.round((completed.length / 20) * 100)) || 0;

  const SidebarContent = () => (
    <aside className="w-64 border-r border-white/5 bg-[#050506] p-4 flex flex-col h-full font-mono">
      <div className="mb-8">
        <h3 className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-4">/root/navigation</h3>
        <nav className="space-y-1">
          <button
            onClick={() => { if (onViewChange) onViewChange('home'); onClose(); }}
            className={cn("w-full flex items-center gap-3 px-3 py-2 text-xs transition-all", (!currentView || currentView === 'home') ? "text-emerald-400 bg-emerald-500/5 border-l-2 border-emerald-500" : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border-l-2 border-transparent")}
          >
            <span className={(!currentView || currentView === 'home') ? "text-emerald-500" : ""}>&gt;</span> Dashboard.sh
          </button>
          <button
            onClick={() => { if (onViewChange) onViewChange('lab'); onClose(); }}
            className={cn("w-full flex items-center gap-3 px-3 py-2 text-xs transition-all", currentView === 'lab' ? "text-emerald-400 bg-emerald-500/5 border-l-2 border-emerald-500" : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border-l-2 border-transparent")}
          >
            <span className={currentView === 'lab' ? "text-emerald-500" : ""}>&gt;</span> Net_Explorer.exe
          </button>
          <button
            onClick={() => { if (onViewChange) onViewChange('honeypot'); onClose(); }}
            className={cn("w-full flex items-center gap-3 px-3 py-2 text-xs transition-all", currentView === 'honeypot' ? "text-emerald-400 bg-emerald-500/5 border-l-2 border-emerald-500" : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border-l-2 border-transparent")}
          >
            <span className={currentView === 'honeypot' ? "text-emerald-500" : ""}>&gt;</span> Training_Vault.db
          </button>
        </nav>
      </div>

      <div className="mt-auto p-4 bg-zinc-900/30 border border-white/5 rounded-lg space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] uppercase"><span>Progression</span><span className="text-emerald-500 text-xs font-bold">{progressPercent}%</span></div>
          <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full shadow-[0_0_10px_#10b981]" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
        <div className="text-[9px] font-mono leading-tight text-zinc-600">
          ID_TOKEN: TD-9928-X<br />
          HARDWARE: VIRTUAL_KVM<br />
          STATUS: READY_FOR_DEPLOY
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Off-canvas mode for mobile */}
      <div className={cn("fixed inset-0 z-40 lg:hidden", isOpen ? "block" : "hidden")}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="absolute left-0 top-0 bottom-0 shadow-2xl">
          <SidebarContent />
        </div>
      </div>

      {/* Desktop sticky sidebar */}
      <div className="hidden lg:block h-full">
        <SidebarContent />
      </div>
    </>
  );
}
