import { useEffect } from 'react';


export function Search() {


    useEffect(() => {
        // Initialize Pagefind UI
        if (window.hasOwnProperty('PagefindUI')) {
            // @ts-ignore
            new PagefindUI({
                element: "#search-ui",
                showImages: false,
                translations: {
                    placeholder: "Rechercher dans 8 000+ cours...",
                    clear_search: "Effacer",
                    load_more: "Charger plus",
                    search_label: "Recherche",
                    filters_label: "Filtres",
                    zero_results: "Aucun résultat pour [SEARCH_TERM]",
                    many_results: "[COUNT] résultats pour [SEARCH_TERM]",
                    one_result: "[COUNT] résultat pour [SEARCH_TERM]",
                    alt_search: "Pas de résultats pour [SEARCH_TERM]. Affichage des résultats pour [DIFFERENT_TERM] à la place",
                    search_suggestion: "Pas de résultats pour [SEARCH_TERM]. Essayez l'un des termes suivants :",
                    searching: "Recherche de [SEARCH_TERM]..."
                }
            });
        }
    }, []);

    return (
        <div className="relative w-full max-w-xl">
            <div id="search-ui" className="pagefind-ui-custom"></div>
            <style>{`
                .pagefind-ui-custom {
                    --pagefind-ui-primary: #3b82f6;
                    --pagefind-ui-text: #f8fafc;
                    --pagefind-ui-background: #0f172a;
                    --pagefind-ui-border: #334155;
                    --pagefind-ui-tag: #1e293b;
                }
                .pagefind-ui__search-input {
                    background-color: transparent !important;
                    border-radius: 0.75rem !important;
                    font-size: 0.875rem !important;
                }
            `}</style>
        </div>
    );
}
