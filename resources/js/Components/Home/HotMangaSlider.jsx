import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { MangaCard } from '../Manga/MangaCard';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';

export function HotMangaSlider({ hotManga = [], translations = {} }) {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollButtons = () => {
        const container = scrollRef.current;
        if (container) {
            setCanScrollLeft(container.scrollLeft > 0);
            setCanScrollRight(
                container.scrollLeft < container.scrollWidth - container.clientWidth
            );
        }
    };

    const scroll = (direction) => {
        const container = scrollRef.current;
        if (container) {
            const scrollAmount = container.clientWidth * 0.8;
            const newScrollLeft = direction === 'left' 
                ? container.scrollLeft - scrollAmount
                : container.scrollLeft + scrollAmount;
            
            container.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        if (hotManga.length > 0) {
            setTimeout(checkScrollButtons, 100);
        }
    }, [hotManga]);

    if (hotManga.length === 0) {
        return null;
    }

    return (
        <section className="py-8 bg-gradient-to-r from-red-50/50 via-orange-50/30 to-yellow-50/50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Flame className="h-6 w-6 text-red-500" />
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                                {translations.hot_manga_title || 'Manga Hot'}
                            </h2>
                        </div>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className="h-8 w-8 p-0 hover:bg-red-50"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className="h-8 w-8 p-0 hover:bg-red-50"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="relative">
                    <div
                        ref={scrollRef}
                        onScroll={checkScrollButtons}
                        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                        }}
                    >
                        {hotManga.map((manga) => (
                            <div
                                key={manga.id}
                                className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)] xl:w-[calc(16.666%-14px)]"
                            >
                                <MangaCard 
                                    manga={manga} 
                                    priority={true}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-center mt-4 md:hidden">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ChevronLeft className="h-4 w-4" />
                        <span>{translations.scroll_hint || 'Vuốt để xem thêm'}</span>
                        <ChevronRight className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </section>
    );
} 