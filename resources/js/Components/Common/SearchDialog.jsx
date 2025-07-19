import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { 
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/Components/ui/command.jsx";
import { 
    DialogTitle,
    DialogDescription,
} from "@/Components/ui/dialog.jsx";
import { VisuallyHidden } from "@/Components/ui/visually-hidden.jsx";
import { Badge } from "@/Components/ui/badge.jsx";
import { 
    Search, 
    Tag, 
    TrendingUp,
    Clock,
    Loader2
} from 'lucide-react';
import { useSearch } from '@/hooks/use-search';

export default function SearchDialog({ open, setOpen }) {
    const { layoutTranslations = {} } = usePage().props;
    const [query, setQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);
    const { suggestions, popular, loading, debouncedFetch, fetchPopular, clearSuggestions } = useSearch();

    // Load recent searches từ localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('manga-recent-searches');
            if (stored) {
                try {
                    setRecentSearches(JSON.parse(stored));
                } catch (e) {
                    console.error('Error parsing recent searches:', e);
                }
            }
        }
    }, []);

    // Load popular items when dialog opens
    useEffect(() => {
        if (open) {
            fetchPopular();
        }
    }, [open, fetchPopular]);

    // Trigger live search when query changes
    useEffect(() => {
        if (query.trim()) {
            debouncedFetch(query);
        } else {
            clearSuggestions();
        }
    }, [query, debouncedFetch, clearSuggestions]);

    const saveRecentSearch = (searchTerm) => {
        if (typeof window !== 'undefined') {
            const newRecentSearches = [
                searchTerm,
                ...recentSearches.filter(term => term !== searchTerm)
            ].slice(0, 5);

            setRecentSearches(newRecentSearches);
            localStorage.setItem('manga-recent-searches', JSON.stringify(newRecentSearches));
        }
    };

    const handleSearch = (searchTerm) => {
        if (!searchTerm.trim()) return;

        saveRecentSearch(searchTerm);
        setOpen(false);
        setQuery('');

        // Navigate to search page
        router.visit(`/search?q=${encodeURIComponent(searchTerm)}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && query.trim()) {
            e.preventDefault();
            handleSearch(query);
        }
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('manga-recent-searches');
        }
    };

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <VisuallyHidden>
                <DialogTitle>{layoutTranslations.search_dialog_title || 'Search Manga'}</DialogTitle>
                <DialogDescription>
                    {layoutTranslations.search_dialog_description || 'Search for manga, authors, genres, and more'}
                </DialogDescription>
            </VisuallyHidden>
            
            <Command className="rounded-lg border shadow-md">
                <CommandInput
                    placeholder={layoutTranslations.search_dialog_placeholder || 'Search for manga, authors, genres...'}
                    value={query}
                    onValueChange={setQuery}
                    onKeyDown={handleKeyDown}
                />
                
                <CommandList>
                    {!query && (
                        <>
                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <CommandGroup heading={layoutTranslations.recent_searches || 'Recent Searches'}>
                                    {recentSearches.map((term, index) => (
                                        <CommandItem
                                            key={`recent-${index}`}
                                            onSelect={() => handleSearch(term)}
                                        >
                                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {term}
                                        </CommandItem>
                                    ))}
                                    <CommandSeparator />
                                    <CommandItem
                                        onSelect={clearRecentSearches}
                                        className="text-xs text-muted-foreground justify-center"
                                    >
                                        {layoutTranslations.clear_history || 'Clear Search History'}
                                    </CommandItem>
                                </CommandGroup>
                            )}

                            {/* Dynamic Popular Manga */}
                            {popular.manga?.length > 0 && (
                                <CommandGroup heading={layoutTranslations.popular_manga || 'Popular Manga'}>
                                    {popular.manga.map((manga, index) => (
                                        <CommandItem
                                            key={`popular-manga-${index}`}
                                            onSelect={() => handleSearch(manga)}
                                        >
                                            <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                                            {manga}
                                            <Badge variant="secondary" className="ml-auto text-xs">
                                                {layoutTranslations.manga_badge || 'Manga'}
                                            </Badge>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}

                        </>
                    )}

                    {query && (
                        <>
                            {/* Loading indicator */}
                            {loading && (
                                <div className="flex items-center justify-center p-4">
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    <span className="text-sm text-muted-foreground">
                                        {layoutTranslations.searching || 'Searching...'}
                                    </span>
                                </div>
                            )}

                            {/* Live Search Results */}
                            {!loading && suggestions.manga?.length > 0 && (
                                <CommandGroup heading={layoutTranslations.manga || 'Manga'}>
                                    {suggestions.manga.map((manga, index) => (
                                        <CommandItem
                                            key={`suggestion-manga-${index}`}
                                            onSelect={() => handleSearch(manga)}
                                        >
                                            <Search className="mr-2 h-4 w-4" />
                                            {manga}
                                            <Badge variant="secondary" className="ml-auto text-xs">
                                                {layoutTranslations.manga_badge || 'Manga'}
                                            </Badge>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}

                            {!loading && suggestions.authors?.length > 0 && (
                                <CommandGroup heading={layoutTranslations.authors || 'Authors'}>
                                    {suggestions.authors.map((author, index) => (
                                        <CommandItem
                                            key={`suggestion-author-${index}`}
                                            onSelect={() => handleSearch(author)}
                                        >
                                            <TrendingUp className="mr-2 h-4 w-4" />
                                            {author}
                                            <Badge variant="outline" className="ml-auto text-xs">
                                                {layoutTranslations.author_badge || 'Author'}
                                            </Badge>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}

                            {!loading && suggestions.genres?.length > 0 && (
                                <CommandGroup heading={layoutTranslations.genres || 'Genres'}>
                                    {suggestions.genres.map((genre, index) => (
                                        <CommandItem
                                            key={`suggestion-genre-${index}`}
                                            onSelect={() => handleSearch(genre)}
                                        >
                                            <Tag className="mr-2 h-4 w-4" />
                                            {genre}
                                            <Badge variant="outline" className="ml-auto text-xs">
                                                {layoutTranslations.genre_badge || 'Genre'}
                                            </Badge>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}

                            {/* Search query option */}
                            <CommandGroup>
                                <CommandItem
                                    onSelect={() => handleSearch(query)}
                                    className="font-medium"
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    {layoutTranslations.search_for || 'Search for'} "{query}"
                                </CommandItem>
                            </CommandGroup>

                            {/* Empty state when no suggestions found */}
                            {!loading && (!suggestions.manga?.length && !suggestions.authors?.length && !suggestions.genres?.length) && (
                                <CommandEmpty>
                                    <div className="flex flex-col items-center gap-2 py-6">
                                        <Search className="h-8 w-8 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            {layoutTranslations.no_suggestions || 'No suggestions found'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {layoutTranslations.press_enter_to_search || 'Press Enter to search'} "{query}"
                                        </p>
                                    </div>
                                </CommandEmpty>
                            )}
                        </>
                    )}
                </CommandList>
            </Command>
        </CommandDialog>
    );
} 