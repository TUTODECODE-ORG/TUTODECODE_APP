// ============================================
// TutoDeCode - AI Chat Component
// Interface de discussion avec l'agent IA mentor
// ============================================

import { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Trash2,
  Minimize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { AIMessage } from '@/types';

interface AIChatProps {
  messages: AIMessage[];
  isAnalyzing: boolean;
  onSendMessage: (message: string) => void;
  onRequestHint: () => void;
  onClearChat: () => void;
  className?: string;
}

export function AIChat({ 
  messages, 
  isAnalyzing, 
  onSendMessage, 
  onRequestHint,
  onClearChat,
  className = '' 
}: AIChatProps) {
  const [input, setInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll automatique vers le bas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isAnalyzing) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const getMessageIcon = (message: AIMessage) => {
    if (message.role === 'user') return <User className="w-4 h-4" />;
    
    switch (message.metadata?.type) {
      case 'hint':
        return <Lightbulb className="w-4 h-4 text-[var(--td-accent-ai)]" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-[var(--td-success)]" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-[var(--td-error)]" />;
      default:
        return <Bot className="w-4 h-4 text-[var(--td-primary)]" />;
    }
  };

  if (isMinimized) {
    return (
      <div className={cn(
        "fixed bottom-4 right-4 z-50",
        className
      )}>
        <Button
          onClick={() => setIsMinimized(false)}
          className="btn-ai rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Assistant IA
          {messages.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {messages.length}
            </span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col bg-[var(--td-surface)] border border-[var(--td-border)] rounded-lg overflow-hidden",
      "w-96 h-[500px] shadow-2xl",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--td-border)] bg-gradient-to-r from-[var(--td-accent-ai-muted)] to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--td-accent-ai)]/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[var(--td-accent-ai)]" />
          </div>
          <div>
            <h3 className="font-medium text-sm text-[var(--td-text-primary)]">
              Agent IA Mentor
            </h3>
            <p className="text-xs text-[var(--td-text-secondary)]">
              {isAnalyzing ? 'Analyse en cours...' : 'Prêt à aider'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setIsMinimized(true)}
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onRequestHint}>
                <Lightbulb className="w-4 h-4 mr-2" />
                Demander un indice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onClearChat}>
                <Trash2 className="w-4 h-4 mr-2" />
                Effacer la conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--td-accent-ai-muted)] flex items-center justify-center">
                <Bot className="w-6 h-6 text-[var(--td-accent-ai)]" />
              </div>
              <p className="text-sm text-[var(--td-text-secondary)]">
                Je surveille ton terminal et te donnerai des indices si tu bloques.
              </p>
              <p className="text-xs text-[var(--td-text-tertiary)] mt-2">
                Je ne donne jamais la réponse directement !
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2",
                  message.role === 'user' ? 'flex-row-reverse' : ''
                )}
              >
                <Avatar className={cn(
                  "w-7 h-7",
                  message.role === 'user' 
                    ? 'bg-[var(--td-primary)]' 
                    : 'bg-[var(--td-accent-ai)]/20'
                )}>
                  <AvatarFallback className="text-xs">
                    {getMessageIcon(message)}
                  </AvatarFallback>
                </Avatar>
                
                <div className={cn(
                  "max-w-[80%] rounded-lg p-2.5 text-sm",
                  message.role === 'user'
                    ? 'bg-[var(--td-primary)] text-white'
                    : message.metadata?.type === 'hint'
                      ? 'ai-bubble'
                      : 'bg-[var(--td-surface-elevated)] border border-[var(--td-border)]'
                )}>
                  <p className={cn(
                    message.role === 'user' ? 'text-white' : 'text-[var(--td-text-primary)]'
                  )}>
                    {message.content}
                  </p>
                  <span className="text-[10px] opacity-60 mt-1 block">
                    {new Date(message.timestamp).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
          
          {isAnalyzing && (
            <div className="flex gap-2">
              <Avatar className="w-7 h-7 bg-[var(--td-accent-ai)]/20">
                <AvatarFallback className="text-xs">
                  <Bot className="w-4 h-4 text-[var(--td-accent-ai)]" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-[var(--td-surface-elevated)] border border-[var(--td-border)] rounded-lg p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[var(--td-accent-ai)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[var(--td-accent-ai)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[var(--td-accent-ai)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[var(--td-border)]">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pose une question..."
            className="input-td flex-1"
            disabled={isAnalyzing}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!input.trim() || isAnalyzing}
            className="btn-primary"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-[var(--td-text-tertiary)] mt-2 text-center">
          L'IA ne donne jamais la réponse directement - elle guide vers la solution
        </p>
      </form>
    </div>
  );
}
