import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
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
import { Badge } from "@/Components/ui/badge.jsx";
import { 
    Search, 
    BookOpen, 
    User, 
    Tag, 
    TrendingUp,
    Clock
} from 'lucide-react';

export default function SearchDialog({ open, setOpen }) {
    const [query, setQuery] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);

    // Load recent searches từ localStorage
    useEffect(() => {
        const stored = localStorage.getItem('manga-recent-searches');
        if (stored) {
            try {
                setRecentSearches(JSON.parse(stored));
            } catch (e) {
                console.error('Error parsing recent searches:', e);
            }
        }
    }, []);

    const saveRecentSearch = (searchTerm) => {
        const newRecentSearches = [
            searchTerm,
            ...recentSearches.filter(term => term !== searchTerm)
        ].slice(0, 5);

        setRecentSearches(newRecentSearches);
        localStorage.setItem('manga-recent-searches', JSON.stringify(newRecentSearches));
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
        localStorage.removeItem('manga-recent-searches');
    };

    // Sample popular searches (static for now)
    const popularManga = [
        'One Piece', 'Naruto', 'Attack on Titan', 'Demon Slayer', 'My Hero Academia'
    ];

    const popularGenres = [
        'Action', 'Romance', 'Comedy', 'Drama', 'Fantasy'
    ];

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <Command className="rounded-lg border shadow-md">
                <CommandInput
                    placeholder="Tìm kiếm manga, tác giả, thể loại..."
                    value={query}
                    onValueChange={setQuery}
                    onKeyDown={handleKeyDown}
                />
                
                <CommandList>
                    {!query && (
                        <>
                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <CommandGroup heading="Tìm kiếm gần đây">
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
                                        Xóa lịch sử tìm kiếm
                                    </CommandItem>
                                </CommandGroup>
                            )}

                            {/* Popular Manga */}
                            <CommandGroup heading="Manga phổ biến">
                                {popularManga.map((manga, index) => (
                                    <CommandItem
                                        key={`popular-manga-${index}`}
                                        onSelect={() => handleSearch(manga)}
                                    >
                                        <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                                        {manga}
                                        <Badge variant="secondary" className="ml-auto text-xs">
                                            Manga
                                        </Badge>
                                    </CommandItem>
                                ))}
                            </CommandGroup>

                            {/* Popular Genres */}
                            <CommandGroup heading="Thể loại phổ biến">
                                {popularGenres.map((genre, index) => (
                                    <CommandItem
                                        key={`popular-genre-${index}`}
                                        onSelect={() => handleSearch(genre)}
                                    >
                                        <Tag className="mr-2 h-4 w-4 text-green-500" />
                                        {genre}
                                        <Badge variant="outline" className="ml-auto text-xs">
                                            Thể loại
                                        </Badge>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </>
                    )}

                    {query && (
                        <>
                            <CommandGroup>
                                <CommandItem
                                    onSelect={() => handleSearch(query)}
                                    className="font-medium"
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    Tìm kiếm "{query}"
                                </CommandItem>
                            </CommandGroup>
                        </>
                    )}

                    {query && (
                        <CommandEmpty>
                            <div className="flex flex-col items-center gap-2 py-6">
                                <Search className="h-8 w-8 text-muted-foreground" />
                                <p>Nhấn Enter để tìm kiếm "{query}"</p>
                            </div>
                        </CommandEmpty>
                    )}
                </CommandList>
            </Command>
        </CommandDialog>
    );
} 