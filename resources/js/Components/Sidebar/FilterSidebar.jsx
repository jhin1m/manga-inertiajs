import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Filter, SlidersHorizontal } from 'lucide-react';
import MangaFilters from './MangaFilters';

export default function FilterSidebar({ 
    filters = {}, 
    onFiltersChange = () => {},
    genres = [],
    statuses = [],
    authors = [],
    className = "",
    showFilterButton = true,
    isMobile = false
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

    // Mobile version với Sheet
    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    {showFilterButton && (
                        <Button variant="outline" className="relative">
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            Bộ lọc
                            {hasActiveFilters() && (
                                <Badge 
                                    variant="destructive" 
                                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                                >
                                    {getActiveFiltersCount()}
                                </Badge>
                            )}
                        </Button>
                    )}
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] sm:w-[400px] p-0">
                    <SheetHeader className="p-6 pb-3">
                        <SheetTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Bộ lọc manga
                            {hasActiveFilters() && (
                                <Badge variant="secondary">
                                    {getActiveFiltersCount()} đang áp dụng
                                </Badge>
                            )}
                        </SheetTitle>
                    </SheetHeader>
                    
                    <div className="px-6 pb-6">
                        <MangaFilters
                            filters={filters}
                            onFiltersChange={(newFilters) => {
                                onFiltersChange(newFilters);
                                // Auto close sau khi apply filters trên mobile
                                // setIsOpen(false);
                            }}
                            genres={genres}
                            statuses={statuses}
                            authors={authors}
                            className="border-0 shadow-none"
                        />
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    // Desktop version với ScrollArea
    return (
        <div className={`w-full ${className}`}>
            <ScrollArea className="h-[calc(100vh-120px)]">
                <MangaFilters
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                    genres={genres}
                    statuses={statuses}
                    authors={authors}
                />
            </ScrollArea>
        </div>
    );
}

 