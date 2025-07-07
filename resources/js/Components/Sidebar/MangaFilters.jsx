import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Button } from "@/Components/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card.jsx";
import { Checkbox } from "@/Components/ui/checkbox.jsx";
import { Label } from "@/Components/ui/label.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select.jsx";
import { Slider } from "@/Components/ui/slider.jsx";
import { Badge } from "@/Components/ui/badge.jsx";
import { ScrollArea } from "@/Components/ui/scroll-area.jsx";
import { Separator } from "@/Components/ui/separator.jsx";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group.jsx";
import { X, Filter, RotateCcw } from 'lucide-react';


// Tối ưu GenreItem component
const GenreItem = ({ genre, isChecked, onToggle }) => {
    const handleToggle = useCallback(() => {
        onToggle(genre.id);
    }, [genre.id, onToggle]);

    return (
        <div className="flex items-center space-x-2">
            <Checkbox
                id={`genre-${genre.id}`}
                checked={isChecked}
                onCheckedChange={handleToggle}
            />
            <Label 
                htmlFor={`genre-${genre.id}`} 
                className="text-sm flex-1 flex items-center justify-between cursor-pointer"
            >
                <span>{genre.name}</span>
                <Badge variant="outline" className="text-xs">
                    {genre.mangas_count || 0}
                </Badge>
            </Label>
        </div>
    );
};

export default function MangaFilters({ 
    filters = {}, 
    onFiltersChange = () => {},
    genres = [],
    statuses = {},
    translations = {},
    className = ""
}) {
    const [localFilters, setLocalFilters] = useState({
        genres: filters.genres || [],
        status: filters.status || '',
        rating: filters.rating ? [filters.rating] : [0],
        sortBy: filters.sortBy || 'latest',
        ...filters
    });

    const t = translations.filters || {};

    // Tạo genre map để tối ưu lookup
    const genreMap = useMemo(() => {
        return genres.reduce((map, genre) => {
            map[genre.id] = genre;
            return map;
        }, {});
    }, [genres]);

    // Tính toán selected genres
    const selectedGenres = useMemo(() => {
        return localFilters.genres?.map(genreId => genreMap[genreId]).filter(Boolean) || [];
    }, [localFilters.genres, genreMap]);

    // Hook tự tạo cho lazy loading
    const useInView = (threshold = 0.1) => {
        const [inView, setInView] = useState(false);
        const ref = useRef(null);

        useEffect(() => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setInView(true);
                        observer.disconnect();
                    }
                },
                { threshold }
            );

            if (ref.current) {
                observer.observe(ref.current);
            }

            return () => observer.disconnect();
        }, [threshold]);

        return [ref, inView];
    };

    // Tự tạo debounce hook
    const useDebounce = (value, delay) => {
        const [debouncedValue, setDebouncedValue] = useState(value);
        
        useEffect(() => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);
            
            return () => {
                clearTimeout(handler);
            };
        }, [value, delay]);
        
        return debouncedValue;
    };

    // Sử dụng lazy loading cho genres
    const [genresRef, genresInView] = useInView();
    const [showAllGenres, setShowAllGenres] = useState(false);
    
    const visibleGenres = useMemo(() => {
        if (!genresInView && !showAllGenres) return genres.slice(0, 10);
        return showAllGenres ? genres : genres.slice(0, 20);
    }, [genres, genresInView, showAllGenres]);

    // Debounce filter changes
    const debouncedFilters = useDebounce(localFilters, 300);

    const sortOptions = [
        { value: 'latest', label: 'Mới nhất' },
        { value: 'oldest', label: 'Cũ nhất' },
        { value: 'views', label: 'Xem nhiều nhất' },
        { value: 'rating', label: 'Đánh giá cao nhất' },
        { value: 'name_asc', label: 'Tên A-Z' },
        { value: 'name_desc', label: 'Tên Z-A' },
    ];

    const handleFilterChange = useCallback((key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        // onFiltersChange sẽ được gọi qua debounced effect
    }, [localFilters]);

    // Effect để gọi onFiltersChange với debounce
    useEffect(() => {
        onFiltersChange(debouncedFilters);
    }, [debouncedFilters, onFiltersChange]);

    const handleGenreToggle = useCallback((genreId) => {
        const currentGenres = localFilters.genres || [];
        const newGenres = currentGenres.includes(genreId)
            ? currentGenres.filter(id => id !== genreId)
            : [...currentGenres, genreId];
        handleFilterChange('genres', newGenres);
    }, [localFilters.genres, handleFilterChange]);

    const clearFilters = useCallback(() => {
        const emptyFilters = {
            genres: [],
            status: '',
            rating: [0],
            sortBy: 'latest'
        };
        setLocalFilters(emptyFilters);
        // onFiltersChange sẽ được gọi qua debounced effect
    }, []);

    const hasActiveFilters = useMemo(() => {
        return (
            localFilters.genres?.length > 0 ||
            localFilters.status ||
            (localFilters.rating?.[0] > 0) ||
            localFilters.sortBy !== 'latest'
        );
    }, [localFilters]);

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        {t.title || 'Bộ lọc'}
                    </CardTitle>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-8 px-2"
                        >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            {t.reset || 'Reset'}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <ScrollArea className="h-[calc(100vh-200px)] pr-3">
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">{t.sort_by || 'Sắp xếp theo'}</Label>
                        <Select
                            value={localFilters.sortBy}
                            onValueChange={(value) => handleFilterChange('sortBy', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t.sort_placeholder || 'Chọn cách sắp xếp'} />
                            </SelectTrigger>
                            <SelectContent>
                                {sortOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-3">
                        <Label className="text-sm font-medium">{t.status || 'Trạng thái'}</Label>
                        <RadioGroup
                            value={localFilters.status || 'all'}
                            onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all" id="status-all" />
                                <Label htmlFor="status-all" className="text-sm">{t.all || 'Tất cả'}</Label>
                            </div>
                            {Object.entries(statuses).map(([value, label]) => (
                                <div key={value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={value} id={`status-${value}`} />
                                    <Label htmlFor={`status-${value}`} className="text-sm">
                                        {label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-3">
                        <Label className="text-sm font-medium">
                            {t.rating_min || 'Đánh giá tối thiểu'}: {localFilters.rating?.[0] || 0}/10
                        </Label>
                        <Slider
                            value={localFilters.rating || [0]}
                            onValueChange={(value) => handleFilterChange('rating', value)}
                            max={10}
                            min={0}
                            step={0.5}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0</span>
                            <span>5</span>
                            <span>10</span>
                        </div>
                    </div>


                    <Separator className="my-4" />

                    <div className="space-y-3">
                        <Label className="text-sm font-medium">
                            {t.genres || 'Thể loại'}
                            {localFilters.genres?.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {localFilters.genres.length}
                                </Badge>
                            )}
                        </Label>
                        <div className="space-y-2 max-h-48 overflow-y-auto" ref={genresRef}>
                            {visibleGenres.map((genre) => (
                                <GenreItem
                                    key={genre.id}
                                    genre={genre}
                                    isChecked={localFilters.genres?.includes(genre.id) || false}
                                    onToggle={handleGenreToggle}
                                />
                            ))}
                            {genres.length > 20 && !showAllGenres && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowAllGenres(true)}
                                    className="w-full text-xs"
                                >
                                    🔽 ({genres.length - 20})
                                </Button>
                            )}
                        </div>
                    </div>

                    {localFilters.genres?.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{t.selected || 'Đã chọn'}:</Label>
                            <div className="flex flex-wrap gap-1">
                                {selectedGenres.map((genre) => (
                                    <Badge
                                        key={genre.id}
                                        variant="secondary"
                                        className="text-xs cursor-pointer"
                                        onClick={() => handleGenreToggle(genre.id)}
                                    >
                                        {genre.name}
                                        <X className="h-3 w-3 ml-1" />
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}