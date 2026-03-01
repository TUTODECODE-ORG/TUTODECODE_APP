import { useState } from 'react';
import { Search, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { CheatSheetItem } from '@/types';

interface CheatsheetProps {
  items: CheatSheetItem[];
  title?: string;
}

export function CheatsheetComponent({ items, title = 'Fiche de Référence Rapide' }: CheatsheetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const filteredItems = items.filter(item =>
    item.command?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = async (command: string, index: number) => {
    await navigator.clipboard.writeText(command);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
        </CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher une commande..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-1/3">Commande</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item, index) => (
                <TableRow key={index} className="group">
                  <TableCell className="font-mono text-sm">
                    <code className="bg-slate-950 text-slate-50 px-2 py-1 rounded">
                      {item.command}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.description}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => item.command && handleCopy(item.command, index)}
                    >
                      {copiedIndex === index ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Aucune commande trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
