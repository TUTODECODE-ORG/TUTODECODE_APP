import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface ScrollToTopProps {
    threshold?: number; // Seuil de scroll en pixels (défaut: 300)
    className?: string;
}

/**
 * Bouton flottant pour remonter en haut de la page
 * Apparaît automatiquement après un certain scroll
 */
export function ScrollToTop({ threshold = 300, className }: ScrollToTopProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > threshold) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        // Vérifier au chargement
        toggleVisibility();

        // Écouter le scroll
        window.addEventListener('scroll', toggleVisibility, { passive: true });

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, [threshold]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (!isVisible) {
        return null;
    }

    return (
        <Button
            onClick={scrollToTop}
            size="icon"
            className={cn(
                "fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg",
                "transition-all duration-300 hover:scale-110",
                "bg-primary hover:bg-primary/90",
                className
            )}
            aria-label="Retour en haut"
        >
            <ArrowUp className="h-5 w-5" />
        </Button>
    );
}
