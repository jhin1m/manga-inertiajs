import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X, Filter, RotateCcw } from 'lucide-react';

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
                            {genresData.map((genre) => (
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
                                {localFilters.genres.map((genreId) => {
                                    const genre = genresData.find(g => g.id === genreId);
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