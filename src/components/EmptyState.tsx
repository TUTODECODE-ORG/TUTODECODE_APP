import { Search, Filter, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface EmptyStateProps {
    type?: 'search' | 'filter' | 'general';
    searchQuery?: string;
    onReset?: () => void;
}

/**
 * Composant pour afficher un état vide élégant
 * Utilisé quand aucun cours n'est trouvé
 */
export function EmptyState({ type = 'general', searchQuery, onReset }: EmptyStateProps) {
    const getContent = () => {
        switch (type) {
            case 'search':
                return {
                    icon: Search,
                    title: 'Aucun cours trouvé',
                    description: searchQuery
                        ? `Aucun résultat pour "${searchQuery}"`
                        : 'Essayez de modifier votre recherche',
                    action: onReset ? 'Effacer la recherche' : null
                };

            case 'filter':
                return {
                    icon: Filter,
                    title: 'Aucun cours ne correspond',
                    description: 'Essayez de modifier vos filtres pour voir plus de résultats',
                    action: onReset ? 'Réinitialiser les filtres' : null
                };

            default:
                return {
                    icon: BookOpen,
                    title: 'Aucun cours disponible',
                    description: 'Revenez plus tard pour découvrir de nouveaux contenus',
                    action: null
                };
        }
    };

    const content = getContent();
    const Icon = content.icon;

    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="mb-4 p-4 rounded-full bg-muted">
                    <Icon className="h-10 w-10 text-muted-foreground" />
                </div>

                <h3 className="text-lg font-semibold mb-2">
                    {content.title}
                </h3>

                <p className="text-muted-foreground mb-6 max-w-sm">
                    {content.description}
                </p>

                {content.action && onReset && (
                    <Button onClick={onReset} variant="outline">
                        {content.action}
                    </Button>
                )}

                <div className="mt-6 text-sm text-muted-foreground">
                    <p>💡 Astuce : Utilisez les filtres pour affiner votre recherche</p>
                </div>
            </CardContent>
        </Card>
    );
}
