import { useState } from 'react';
import { Button } from "@/Components/ui/button.jsx";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/Components/ui/sheet.jsx";
import { Badge } from "@/Components/ui/badge.jsx";
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import MangaFilters from './MangaFilters';

export default function MobileFilterButton({ 
    filters = {}, 
    onFiltersChange = () => {},
    genres = [],
    statuses = {},
    translations = {},
    buttonText = "Bộ lọc",
    buttonVariant = "outline",
    buttonSize = "default",
    className = ""
}) {
    const [isOpen, setIsOpen] = useState(false);

    const hasActiveFilters = () => {
        return filters.genres?.length > 0 ||
               filters.status ||
               (filters.rating > 0) ||
               (filters.sortBy && filters.sortBy !== 'latest');
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.genres?.length > 0) count += filters.genres.length;
        if (filters.status) count += 1;
        if (filters.rating > 0) count += 1;
        if (filters.sortBy && filters.sortBy !== 'latest') count += 1;
        return count;
    };

    const clearAllFilters = () => {
        const emptyFilters = {
            genres: [],
            status: '',
            rating: 0,
            sortBy: 'latest'
        };
        onFiltersChange(emptyFilters);
    };

    const t = translations.filters || {};

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant={buttonVariant} size={buttonSize} className={`relative ${className}`}>
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    {t.title || buttonText}
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
                        <div>
                            <SheetTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                {t.title || 'Bộ lọc'} manga
                                {hasActiveFilters() && (
                                    <Badge variant="secondary">
                                        {getActiveFiltersCount()} {t.applying || 'đang áp dụng'}
                                    </Badge>
                                )}
                            </SheetTitle>
                            <SheetDescription>
                                Lọc manga theo thể loại, trạng thái, đánh giá và các tiêu chí khác
                            </SheetDescription>
                        </div>
                        {hasActiveFilters() && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAllFilters}
                                className="h-8 px-2"
                            >
                                <X className="h-4 w-4 mr-1" />
                                {t.clear_all || 'Xóa tất cả'}
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
                            translations={translations}
                            className="border-0 shadow-none h-full"
                        />
                    </div>
                </div>

                <div className="p-6 border-t bg-background">
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setIsOpen(false)}
                        >
                            {t.close || 'Đóng'}
                        </Button>
                        <Button 
                            className="flex-1"
                            onClick={() => setIsOpen(false)}
                            disabled={!hasActiveFilters()}
                        >
                            {t.apply || 'Áp dụng'} ({getActiveFiltersCount()})
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
} 