import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { MangaCard } from '../Manga/MangaCard';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';

export default function HotMangaSlider({ hotManga = [], title = "Manga Hot 🔥" }) {
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
            const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of visible width
            const newScrollLeft = direction === 'left' 
                ? container.scrollLeft - scrollAmount
                : container.scrollLeft + scrollAmount;
            
            container.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    // Check scroll buttons on mount and when hotManga changes
    useEffect(() => {
        if (hotManga.length > 0) {
            setTimeout(checkScrollButtons, 100); // Small delay to ensure DOM is ready
        }
    }, [hotManga]);

    // Fallback data chỉ khi thực sự cần thiết (development/testing)
    const fallbackData = process.env.NODE_ENV === 'development' ? [
        {
            id: 'fallback-1',
            name: "Loading Hot Manga...",
            slug: "loading",
            cover: "/api/placeholder/200/280",
            rating: 0,
            views: 0,
            status: "loading",
            total_chapters: 0,
            genres: [{ name: "Loading" }],
            latest_chapter: null
        }
    ] : [];

    // Ưu tiên dữ liệu từ backend
    const displayManga = hotManga.length > 0 ? hotManga : fallbackData;

    // Debug log chỉ trong development
    if (process.env.NODE_ENV === 'development') {
        console.log('🔥 Hot Manga Data:', {
            count: displayManga.length,
            source: hotManga.length > 0 ? 'backend' : 'fallback',
            sample: displayManga.slice(0, 2).map(m => ({ 
                name: m.name, 
                rating: m.rating, 
                views: m.views 
            }))
        });
    }

    // Không render nếu không có dữ liệu
    if (displayManga.length === 0) {
        return null;
    }

    return (
        <section className="py-8 bg-gradient-to-r from-red-50/50 via-orange-50/30 to-yellow-50/50">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Flame className="h-6 w-6 text-red-500" />
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                                {title}
                            </h2>
                        </div>
                        <div className="hidden sm:flex items-center gap-1 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            <Flame className="h-3 w-3" />
                            <span className="text-xs font-medium">
                                Trending
                            </span>
                        </div>
                    </div>
                    
                    {/* Navigation Buttons - Desktop Only */}
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

                {/* Slider Container */}
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
                        {displayManga.map((manga) => (
                            <div
                                key={manga.id}
                                className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)] xl:w-[calc(16.666%-14px)]"
                            >
                                <MangaCard 
                                    manga={manga} 
                                    priority={true} // Ưu tiên load ảnh cho hot manga
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Scroll Indicator */}
                <div className="flex justify-center mt-4 md:hidden">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ChevronLeft className="h-4 w-4" />
                        <span>Vuốt để xem thêm</span>
                        <ChevronRight className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </section>
    );
} 