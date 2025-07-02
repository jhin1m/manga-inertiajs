import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import MangaFilters from './MangaFilters';

export default function MobileFilterButton({ 
    filters = {}, 
    onFiltersChange = () => {},
    genres = [],
    statuses = [],
    authors = [],
    buttonText = "Bộ lọc",
    buttonVariant = "outline",
    buttonSize = "default",
    className = ""
}) {
    const [isOpen, setIsOpen] = useState(false);

    const hasActiveFilters = () => {
        return filters.genres?.length > 0 ||
               filters.status ||
               filters.author ||
               filters.rating?.[0] > 0 ||
               filters.year ||
               (filters.sortBy && filters.sortBy !== 'latest');
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.genres?.length > 0) count += filters.genres.length;
        if (filters.status) count += 1;
        if (filters.author) count += 1;
        if (filters.rating?.[0] > 0) count += 1;
        if (filters.year) count += 1;
        if (filters.sortBy && filters.sortBy !== 'latest') count += 1;
        return count;
    };

    const clearAllFilters = () => {
        const emptyFilters = {
            genres: [],
            status: '',
            author: '',
            rating: [0],
            year: '',
            sortBy: 'latest'
        };
        onFiltersChange(emptyFilters);
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant={buttonVariant} size={buttonSize} className={`relative ${className}`}>
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    {buttonText}
                    {hasActiveFilters() && (
                        <Badge 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                            {getActiveFiltersCount()}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>
            
            <SheetContent side="left" className="w-[320px] sm:w-[400px] p-0 flex flex-col">
                <SheetHeader className="p-6 pb-3 border-b">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Bộ lọc manga
                            {hasActiveFilters() && (
                                <Badge variant="secondary">
                                    {getActiveFiltersCount()} đang áp dụng
                                </Badge>
                            )}
                        </SheetTitle>
                        {hasActiveFilters() && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAllFilters}
                                className="h-8 px-2"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Xóa tất cả
                            </Button>
                        )}
                    </div>
                </SheetHeader>
                
                <div className="flex-1 overflow-hidden">
                    <div className="h-full px-6 py-4">
                        <MangaFilters
                            filters={filters}
                            onFiltersChange={onFiltersChange}
                            genres={genres}
                            statuses={statuses}
                            authors={authors}
                            className="border-0 shadow-none h-full"
                        />
                    </div>
                </div>

                {/* Apply Button cho mobile */}
                <div className="p-6 border-t bg-background">
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setIsOpen(false)}
                        >
                            Đóng
                        </Button>
                        <Button 
                            className="flex-1"
                            onClick={() => setIsOpen(false)}
                            disabled={!hasActiveFilters()}
                        >
                            Áp dụng ({getActiveFiltersCount()})
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
} 