import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CodeBlock as CodeBlockType } from '@/types';

interface CodeBlockProps {
  codeBlock: CodeBlockType;
}

const languageColors: Record<string, string> = {
  bash: 'text-green-400',
  shell: 'text-green-400',
  javascript: 'text-yellow-400',
  typescript: 'text-blue-400',
  python: 'text-blue-300',
  sql: 'text-orange-400',
  yaml: 'text-red-400',
  json: 'text-yellow-200',
  dockerfile: 'text-blue-400',
  html: 'text-orange-400',
  css: 'text-blue-300',
};

export function CodeBlockComponent({ codeBlock }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeBlock.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple syntax highlighting for bash
  const highlightCode = (code: string, language: string) => {
    if (language !== 'bash' && language !== 'shell') {
      return code;
    }

    return code.split('\n').map((line, i) => {
      // Comments
      if (line.trim().startsWith('#')) {
        return <span key={i} className="text-gray-500">{line}</span>;
      }
      
      // Commands and options
      const parts = line.split(/(\s+)/);
      return (
        <span key={i}>
          {parts.map((part, j) => {
            if (part.startsWith('-') || part.startsWith('--')) {
              return <span key={j} className="text-yellow-400">{part}</span>;
            }
            if (part.startsWith('$') || part.startsWith('sudo')) {
              return <span key={j} className="text-blue-400">{part}</span>;
            }
            if (part.startsWith('"') || part.startsWith("'")) {
              return <span key={j} className="text-green-400">{part}</span>;
            }
            return part;
          })}
        </span>
      );
    }).reduce((prev, curr, i) => (
      <>
        {prev}
        {i > 0 && <br />}
        {curr}
      </>
    ), <></>);
  };

  return (
    <div className="rounded-lg overflow-hidden bg-slate-950 border my-4">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs font-medium uppercase",
            languageColors[codeBlock.language] || 'text-gray-400'
          )}>
            {codeBlock.language}
          </span>
          {codeBlock.description && (
            <span className="text-xs text-muted-foreground">
              - {codeBlock.description}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copié!
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copier
            </>
          )}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-300">
        <code>{highlightCode(codeBlock.code, codeBlock.language)}</code>
      </pre>
    </div>
  );
}
