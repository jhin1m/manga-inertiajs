import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { Button } from "@/Components/ui/button.jsx";
import { Card, CardContent } from "@/Components/ui/card.jsx";
import { Badge } from "@/Components/ui/badge.jsx";
import { Input } from "@/Components/ui/input.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select.jsx";
import { MangaCard } from "@/Components/Manga/MangaCard.jsx";
import { 
    Search, 
    BookOpen, 
    TrendingUp,
    Tag,
    Filter,
    X
} from 'lucide-react';

export default function SearchIndex({ 
    manga, 
    query = '', 
    filters = {}, 
    genres = [], 
    statuses = [],
    popularManga = [],
    translations = {}
}) {
    const [searchQuery, setSearchQuery] = useState(query);
    const [selectedGenres, setSelectedGenres] = useState(filters.genres || []);
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedSort, setSelectedSort] = useState(filters.sortBy || 'latest');
    const [minRating, setMinRating] = useState(filters.rating || 0);
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = () => {
        const params = new URLSearchParams();
        
        if (searchQuery.trim()) {
            params.set('q', searchQuery);
        }
        
        if (selectedGenres.length > 0) {
            selectedGenres.forEach(genre => params.append('genres[]', genre));
        }
        
        if (selectedStatus && selectedStatus !== 'all') {
            params.set('status', selectedStatus);
        }
        
        if (selectedSort && selectedSort !== 'latest') {
            params.set('sortBy', selectedSort);
        }
        
        if (minRating > 0) {
            params.set('rating', minRating);
        }

        router.visit(route('search') + '?' + params.toString());
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const clearFilters = () => {
        setSelectedGenres([]);
        setSelectedStatus('all');
        setSelectedSort('latest');
        setMinRating(0);
        router.visit(route('search', searchQuery ? { q: searchQuery } : {}));
    };

    const toggleGenre = (genreId) => {
        setSelectedGenres(prev => 
            prev.includes(genreId)
                ? prev.filter(id => id !== genreId)
                : [...prev, genreId]
        );
    };

    const hasFilters = selectedGenres.length > 0 || (selectedStatus && selectedStatus !== 'all') || selectedSort !== 'latest' || minRating > 0;

    return (
        <AppLayout>
            <Head title={`${translations.title || 'Search'}${query ? `: ${query}` : ''}`} />

            <div className="container mx-auto px-4 py-8">
                {/* Search Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-6">
                        {translations.title || 'Search'}
                    </h1>
                    
                    {/* Search Input */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={translations.placeholder || 'Search manga...'}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                {translations.advanced || 'Filters'}
                            </Button>
                            <Button onClick={handleSearch}>
                                <Search className="h-4 w-4 mr-2" />
                                {translations.button || 'Search'}
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <Card className="mb-6">
                            <CardContent className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Genres */}
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            {translations.categories || 'Categories'}
                                        </label>
                                        <div className="flex flex-wrap gap-1">
                                            {genres.map(genre => (
                                                <Button
                                                    key={genre.id}
                                                    variant={selectedGenres.includes(genre.id) ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => toggleGenre(genre.id)}
                                                >
                                                    {genre.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            {translations.status || 'Status'}
                                        </label>
                                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={translations.all_statuses || 'All Statuses'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">{translations.all_statuses || 'All Statuses'}</SelectItem>
                                                {Object.entries(statuses).map(([key, value]) => (
                                                    <SelectItem key={key} value={key}>{value}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Sort */}
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            {translations.sort_by || 'Sort by'}
                                        </label>
                                        <Select value={selectedSort} onValueChange={setSelectedSort}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="latest">{translations.sort_latest || 'Latest'}</SelectItem>
                                                <SelectItem value="popular">{translations.sort_popular || 'Popular'}</SelectItem>
                                                <SelectItem value="rating">{translations.sort_rating || 'Rating'}</SelectItem>
                                                <SelectItem value="alphabetical">{translations.sort_alphabetical || 'A-Z'}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Rating */}
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            {translations.min_rating || 'Min Rating'}
                                        </label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            value={minRating}
                                            onChange={(e) => setMinRating(parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                    <Button onClick={handleSearch}>
                                        {translations.button || 'Search'}
                                    </Button>
                                    {hasFilters && (
                                        <Button variant="outline" onClick={clearFilters}>
                                            <X className="h-4 w-4 mr-2" />
                                            {translations.clear || 'Clear'}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Search Results */}
                {query ? (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold mb-2">
                                {translations.search_for ? 
                                    translations.search_for.replace(':term', query) : 
                                    `Search results for "${query}"`
                                }
                            </h2>
                            {manga.data && manga.data.length > 0 && (
                                <p className="text-muted-foreground">
                                    {translations.found_count ? 
                                        translations.found_count.replace(':count', manga.total) : 
                                        `Found ${manga.total} manga`
                                    }
                                </p>
                            )}
                        </div>

                        {manga.data && manga.data.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {manga.data.map((item) => (
                                    <MangaCard key={item.id} manga={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">
                                    {translations.no_results || 'No results found'}
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    {translations.no_results_message || 'Try adjusting your search terms or browse our collection.'}
                                </p>
                                <Button asChild variant="outline">
                                    <Link href={route('home')}>
                                        {translations.back_to_home || 'Back to Home'}
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* No Search Query - Show Popular */
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                {translations.popular_manga || 'Popular Manga'}
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {popularManga.map((manga) => (
                                    <Button
                                        key={manga.id}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSearchQuery(manga.title);
                                            router.visit(route('search', { q: manga.title }));
                                        }}
                                    >
                                        <BookOpen className="h-3 w-3 mr-1" />
                                        {manga.title}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Tag className="h-5 w-5 text-primary" />
                                {translations.popular_genres || 'Popular Genres'}
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {genres.slice(0, 10).map((genre) => (
                                    <Button
                                        key={genre.id}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedGenres([genre.id]);
                                            router.visit(route('search') + `?genres[]=${genre.id}`);
                                        }}
                                    >
                                        <Tag className="h-3 w-3 mr-1" />
                                        {genre.name}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-2">
                                    💡 {translations.search_tips || 'Search Tips'}
                                </h3>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• {translations.tip_title || 'Search by manga title'}: "One Piece", "Naruto"</li>
                                    <li>• {translations.tip_author || 'Search by author'}: "Eiichiro Oda", "Masashi Kishimoto"</li>
                                    <li>• {translations.tip_genre || 'Search by genre'}: "Action", "Romance", "Comedy"</li>
                                    <li>• {translations.tip_hotkey || 'Use Ctrl/Cmd + K for quick search'}</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}