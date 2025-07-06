import { useState } from 'react';
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

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

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
        year: filters.year || '',
        sortBy: filters.sortBy || 'latest',
        ...filters
    });

    const t = translations.filters || {};

    const sortOptions = [
        { value: 'latest', label: 'Mới nhất' },
        { value: 'oldest', label: 'Cũ nhất' },
        { value: 'views', label: 'Xem nhiều nhất' },
        { value: 'rating', label: 'Đánh giá cao nhất' },
        { value: 'name_asc', label: 'Tên A-Z' },
        { value: 'name_desc', label: 'Tên Z-A' },
    ];

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleGenreToggle = (genreId) => {
        const currentGenres = localFilters.genres || [];
        const newGenres = currentGenres.includes(genreId)
            ? currentGenres.filter(id => id !== genreId)
            : [...currentGenres, genreId];
        handleFilterChange('genres', newGenres);
    };

    const clearFilters = () => {
        const emptyFilters = {
            genres: [],
            status: '',
            rating: [0],
            year: '',
            sortBy: 'latest'
        };
        setLocalFilters(emptyFilters);
        onFiltersChange(emptyFilters);
    };

    const hasActiveFilters = () => {
        return (
            localFilters.genres?.length > 0 ||
            localFilters.status ||
            (localFilters.rating?.[0] > 0) ||
            localFilters.year ||
            localFilters.sortBy !== 'latest'
        );
    };

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        {t.title || 'Bộ lọc'}
                    </CardTitle>
                    {hasActiveFilters() && (
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
                        <Label className="text-sm font-medium">{t.year || 'Năm phát hành'}</Label>
                        <Select
                            value={localFilters.year || 'all'}
                            onValueChange={(value) => handleFilterChange('year', value === 'all' ? '' : value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t.year_placeholder || 'Chọn năm'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t.all || 'Tất cả'}</SelectItem>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
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
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {genres.map((genre) => (
                                <div key={genre.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`genre-${genre.id}`}
                                        checked={localFilters.genres?.includes(genre.id) || false}
                                        onCheckedChange={() => handleGenreToggle(genre.id)}
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
                            ))}
                        </div>
                    </div>

                    {localFilters.genres?.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">{t.selected || 'Đã chọn'}:</Label>
                            <div className="flex flex-wrap gap-1">
                                {localFilters.genres.map((genreId) => {
                                    const genre = genres.find(g => g.id === genreId);
                                    return genre ? (
                                        <Badge
                                            key={genreId}
                                            variant="secondary"
                                            className="text-xs cursor-pointer"
                                            onClick={() => handleGenreToggle(genreId)}
                                        >
                                            {genre.name}
                                            <X className="h-3 w-3 ml-1" />
                                        </Badge>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}