import { useState, useMemo, useCallback } from 'react';
import { Button } from "@/Components/ui/button.jsx";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/Components/ui/sheet.jsx";
import { ScrollArea } from "@/Components/ui/scroll-area.jsx";
import { Badge } from "@/Components/ui/badge.jsx";
import { Filter, SlidersHorizontal } from 'lucide-react';
import MangaFilters from './MangaFilters';

export default function FilterSidebar({ 
    filters = {}, 
    onFiltersChange = () => {},
    statuses = {},
    translations = {},
    className = "",
    showFilterButton = true,
    isMobile = false
}) {
    const [isOpen, setIsOpen] = useState(false);

    const hasActiveFilters = useMemo(() => {
        return filters.status ||
               (filters.sortBy && filters.sortBy !== 'latest');
    }, [filters]);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.status) count += 1;
        if (filters.sortBy && filters.sortBy !== 'latest') count += 1;
        return count;
    }, [filters]);

    const t = translations.filters || {};

    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    {showFilterButton && (
                        <Button variant="outline" className="relative">
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            {t.title || 'Bộ lọc'}
                            {hasActiveFilters && (
                                <Badge 
                                    variant="destructive" 
                                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                                >
                                    {activeFiltersCount}
                                </Badge>
                            )}
                        </Button>
                    )}
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] sm:w-[400px] p-0">
                    <SheetHeader className="p-6 pb-3">
                        <SheetTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            {t.title || 'Bộ lọc'} manga
                            {hasActiveFilters && (
                                <Badge variant="secondary">
                                    {activeFiltersCount} {t.applying || 'đang áp dụng'}
                                </Badge>
                            )}
                        </SheetTitle>
                    </SheetHeader>
                    
                    <div className="px-6 pb-6">
                        <MangaFilters
                            filters={filters}
                            onFiltersChange={onFiltersChange}
                            statuses={statuses}
                            translations={translations}
                            className="border-0 shadow-none"
                        />
                    </div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <div className={`w-full ${className}`}>
            <ScrollArea className="h-[calc(100vh-120px)]">
                <MangaFilters
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                    statuses={statuses}
                    translations={translations}
                />
            </ScrollArea>
        </div>
    );
}

 