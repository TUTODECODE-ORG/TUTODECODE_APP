import { AlertCircle, CheckCircle, Info, Lightbulb, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InfoBox as InfoBoxType } from '@/types';

interface InfoBoxProps {
  infoBox: InfoBoxType;
}

const typeConfig = {
  tip: {
    icon: Lightbulb,
    className: 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300',
    iconClassName: 'text-blue-500',
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-300',
    iconClassName: 'text-yellow-500',
  },
  danger: {
    icon: AlertCircle,
    className: 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300',
    iconClassName: 'text-red-500',
  },
  success: {
    icon: CheckCircle,
    className: 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300',
    iconClassName: 'text-green-500',
  },
  info: {
    icon: Info,
    className: 'bg-slate-500/10 border-slate-500/30 text-slate-700 dark:text-slate-300',
    iconClassName: 'text-slate-500',
  },
};

export function InfoBoxComponent({ infoBox }: InfoBoxProps) {
  const config = typeConfig[infoBox.type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "rounded-lg border p-4 my-4",
      config.className
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.iconClassName)} />
        <div className="flex-1">
          <h4 className="font-semibold mb-2">{infoBox.title}</h4>
          <p className="text-sm opacity-90">{infoBox.content}</p>
          {infoBox.list && infoBox.list.length > 0 && (
            <ul className="mt-2 space-y-1">
              {infoBox.list.map((item, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-xs mt-1.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
