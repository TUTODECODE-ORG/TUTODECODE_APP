// ============================================
// TutoDeCode Pro - Course Creator with AI
// Permet à l'utilisateur de créer des cours personnalisés
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  BookOpen,
  Code2,
  FileText,
  CheckCircle2,
  Loader2,
  Download,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface CourseCreatorProps {
  model: string;
  onBack?: () => void;
}

export default function CourseCreator({ model, onBack }: CourseCreatorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Bonjour ! Je suis votre assistant IA (${model}). Je peux vous aider à créer un cours personnalisé.\n\nDites-moi quel sujet vous voulez apprendre et je générerai un cours complet avec :\n• Théorie détaillée\n• Exemples de code\n• Exercices pratiques\n• Quiz de validation\n\nQuel sujet vous intéresse ?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsGenerating(true);

    try {
      // Déterminer si c'est une demande de création de cours
      const isCourseRequest = userMessage.toLowerCase().includes('cours') || 
                              userMessage.toLowerCase().includes('apprendre') ||
                              userMessage.toLowerCase().includes('tutoriel') ||
                              messages.length <= 2;

      const systemPrompt = isCourseRequest 
        ? `Tu es un expert pédagogique. L'utilisateur veut créer un cours sur: "${userMessage}".
           Génère un cours complet au format suivant:
           
           # [Titre du Cours]
           
           ## Introduction
           [Présentation du sujet et objectifs]
           
           ## Partie 1: [Sous-titre]
           [Contenu théorique détaillé]
           
           ### Exemple de code
           \`\`\`[langage]
           [code exemple]
           \`\`\`
           
           ## Partie 2: [Sous-titre]
           [Suite du contenu]
           
           ## Exercice Pratique
           [Description de l'exercice]
           
           ## Quiz
           1. [Question 1]
              a) [Réponse a]
              b) [Réponse b]
              c) [Réponse c]
              Réponse: [lettre]
           
           Génère un cours complet et pédagogique.`
        : `Tu es un assistant pédagogique. Réponds de manière claire et utile.`;

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: model,
          prompt: `${systemPrompt}\n\nUtilisateur: ${userMessage}`,
          stream: false
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        
        // Si c'est un cours, le stocker
        if (isCourseRequest && data.response.includes('#')) {
          setGeneratedCourse({
            content: data.response,
            topic: userMessage,
            createdAt: new Date().toISOString()
          });
        }
      } else {
        throw new Error('Erreur de génération');
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Désolé, une erreur s'est produite. Vérifiez qu'Ollama est bien lancé avec le modèle sélectionné." 
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCourse = () => {
    if (generatedCourse) {
      navigator.clipboard.writeText(generatedCourse.content);
    }
  };

  const downloadCourse = () => {
    if (generatedCourse) {
      const blob = new Blob([generatedCourse.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cours-${generatedCourse.topic.slice(0, 20).replace(/\s/g, '-')}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--td-bg-primary)]">
      
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-[var(--td-border)] bg-[var(--td-surface)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-[var(--td-text-primary)]">Créateur de Cours IA</h1>
              <p className="text-xs text-[var(--td-text-secondary)]">
                Connecté à <Badge variant="outline" className="ml-1">{model}</Badge>
              </p>
            </div>
          </div>
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              Retour
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "flex gap-3",
              message.role === 'user' && "flex-row-reverse"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              message.role === 'assistant' 
                ? "bg-gradient-to-br from-purple-500 to-pink-500" 
                : "bg-[var(--td-primary)]"
            )}>
              {message.role === 'assistant' ? (
                <Bot className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className={cn(
              "max-w-[85%] rounded-2xl px-4 py-3",
              message.role === 'assistant'
                ? "bg-[var(--td-surface)] border border-[var(--td-border)]"
                : "bg-[var(--td-primary)] text-white"
            )}>
              <div className={cn(
                "text-sm whitespace-pre-wrap",
                message.role === 'assistant' ? "text-[var(--td-text-primary)]" : "text-white"
              )}>
                {message.content}
              </div>
            </div>
          </div>
        ))}
        
        {isGenerating && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[var(--td-surface)] border border-[var(--td-border)] rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-[var(--td-text-secondary)]">
                <Loader2 className="w-4 h-4 animate-spin" />
                Génération en cours...
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Generated Course Actions */}
      {generatedCourse && (
        <div className="flex-shrink-0 px-4 sm:px-6 py-3 border-t border-[var(--td-border)] bg-[var(--td-surface-elevated)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-[var(--td-text-primary)]">Cours généré !</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyCourse}>
                <Copy className="w-4 h-4 mr-1" />
                Copier
              </Button>
              <Button size="sm" onClick={downloadCourse}>
                <Download className="w-4 h-4 mr-1" />
                Télécharger .md
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-[var(--td-border)] bg-[var(--td-surface)]">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Décrivez le cours que vous voulez créer..."
            className="flex-1 px-4 py-3 rounded-xl bg-[var(--td-surface-elevated)] border border-[var(--td-border)] text-[var(--td-text-primary)] placeholder:text-[var(--td-text-tertiary)] focus:outline-none focus:border-[var(--td-primary)]"
            disabled={isGenerating}
          />
          <Button
            onClick={sendMessage}
            disabled={isGenerating || !input.trim()}
            className="px-4 h-12"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-xs text-[var(--td-text-tertiary)] mt-2 text-center">
          Exemples: "Crée un cours sur Docker", "Apprendre React Hooks", "Tutoriel API REST"
        </p>
      </div>
    </div>
  );
}
