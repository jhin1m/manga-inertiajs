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

const sortOptions = [
    { value: 'latest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'views', label: 'Xem nhiều nhất' },
    { value: 'rating', label: 'Đánh giá cao nhất' },
    { value: 'name_asc', label: 'Tên A-Z' },
    { value: 'name_desc', label: 'Tên Z-A' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);


export default function MangaFilters({ 
    filters = {}, 
    onFiltersChange = () => {},
    genres = [],
    statuses = [],
    authors = [],
    className = ""
}) {
    const [localFilters, setLocalFilters] = useState({
        genres: filters.genres || [],
        status: filters.status || '',
        author: filters.author || '',
        rating: filters.rating || [0],
        year: filters.year || '',
        sortBy: filters.sortBy || 'latest',
        ...filters
    });

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const handleGenreToggle = (genreIdentifier) => {
        const currentGenres = localFilters.genres || [];
        const newGenres = currentGenres.includes(genreIdentifier)
            ? currentGenres.filter(id => id !== genreIdentifier)
            : [...currentGenres, genreIdentifier];
        handleFilterChange('genres', newGenres);
    };

    const clearFilters = () => {
        const emptyFilters = {
            genres: [],
            status: '',
            author: '',
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
            localFilters.author ||
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
                        Bộ lọc
                    </CardTitle>
                    {hasActiveFilters() && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-8 px-2"
                        >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Reset
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <ScrollArea className="h-[calc(100vh-200px)] pr-3">
                    {/* Sort By */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Sắp xếp theo</Label>
                        <Select
                            value={localFilters.sortBy}
                            onValueChange={(value) => handleFilterChange('sortBy', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn cách sắp xếp" />
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

                    {/* Status Filter */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Trạng thái</Label>
                        <RadioGroup
                            value={localFilters.status || 'all'}
                            onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="all" id="status-all" />
                                <Label htmlFor="status-all" className="text-sm">Tất cả</Label>
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

                    {/* Rating Filter */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">
                            Đánh giá tối thiểu: {localFilters.rating?.[0] || 0}/10
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

                    {/* Year Filter */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">Năm phát hành</Label>
                        <Select
                            value={localFilters.year || 'all'}
                            onValueChange={(value) => handleFilterChange('year', value === 'all' ? '' : value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn năm" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator className="my-4" />

                    {/* Genres Filter */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium">
                            Thể loại 
                            {localFilters.genres?.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {localFilters.genres.length}
                                </Badge>
                            )}
                        </Label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {genres.map((genre, index) => (
                                <div key={genre.id || genre.slug || index} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`genre-${genre.id || genre.slug || index}`}
                                        checked={localFilters.genres?.includes(genre.id || genre.slug) || false}
                                        onCheckedChange={() => handleGenreToggle(genre.id || genre.slug)}
                                    />
                                    <Label 
                                        htmlFor={`genre-${genre.id || genre.slug || index}`} 
                                        className="text-sm flex-1 flex items-center justify-between cursor-pointer"
                                    >
                                        <span>{genre.name}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {genre.count || 0}
                                        </Badge>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Selected Genres Display */}
                    {localFilters.genres?.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Đã chọn:</Label>
                            <div className="flex flex-wrap gap-1">
                                {localFilters.genres.map((genreId, index) => {
                                    const genre = genres.find(g => (g.id || g.slug) === genreId);
                                    return genre ? (
                                        <Badge
                                            key={genreId || index}
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