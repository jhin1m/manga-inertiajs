import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import MangaCard from '../Manga/MangaCard';

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

    // Demo data nếu không có data từ backend
    const defaultHotManga = [
        {
            id: 1,
            name: "Jujutsu Kaisen",
            slug: "jujutsu-kaisen",
            cover: "/api/placeholder/200/280",
            rating: 4.9,
            views: 2500000,
            status: "ongoing",
            total_chapters: 245,
            genres: [
                { name: "Action" },
                { name: "Supernatural" },
                { name: "School" }
            ],
            latest_chapter: {
                chapter_number: 245,
                updated_at: "2024-01-20"
            }
        },
        {
            id: 2,
            name: "Demon Slayer",
            slug: "demon-slayer",
            cover: "/api/placeholder/200/280",
            rating: 4.8,
            views: 3200000,
            status: "completed",
            total_chapters: 205,
            genres: [
                { name: "Action" },
                { name: "Historical" },
                { name: "Supernatural" }
            ],
            latest_chapter: {
                chapter_number: 205,
                updated_at: "2024-01-18"
            }
        },
        {
            id: 3,
            name: "Chainsaw Man",
            slug: "chainsaw-man",
            cover: "/api/placeholder/200/280",
            rating: 4.7,
            views: 1800000,
            status: "ongoing",
            total_chapters: 158,
            genres: [
                { name: "Action" },
                { name: "Horror" },
                { name: "Supernatural" }
            ],
            latest_chapter: {
                chapter_number: 158,
                updated_at: "2024-01-19"
            }
        },
        {
            id: 4,
            name: "My Hero Academia",
            slug: "my-hero-academia",
            cover: "/api/placeholder/200/280",
            rating: 4.6,
            views: 2100000,
            status: "ongoing",
            total_chapters: 410,
            genres: [
                { name: "Action" },
                { name: "School" },
                { name: "Superhero" }
            ],
            latest_chapter: {
                chapter_number: 410,
                updated_at: "2024-01-21"
            }
        },
        {
            id: 5,
            name: "Tokyo Revengers",
            slug: "tokyo-revengers",
            cover: "/api/placeholder/200/280",
            rating: 4.5,
            views: 1500000,
            status: "completed",
            total_chapters: 278,
            genres: [
                { name: "Action" },
                { name: "Drama" },
                { name: "Delinquents" }
            ],
            latest_chapter: {
                chapter_number: 278,
                updated_at: "2024-01-15"
            }
        },
        {
            id: 6,
            name: "Spy x Family",
            slug: "spy-x-family",
            cover: "/api/placeholder/200/280",
            rating: 4.8,
            views: 2800000,
            status: "ongoing",
            total_chapters: 95,
            genres: [
                { name: "Comedy" },
                { name: "Action" },
                { name: "Family" }
            ],
            latest_chapter: {
                chapter_number: 95,
                updated_at: "2024-01-22"
            }
        }
    ];

    const displayManga = hotManga.length > 0 ? hotManga : defaultHotManga;

    if (displayManga.length === 0) {
        return null;
    }

    return (
        <section className="py-8 bg-gradient-to-r from-red-50/50 via-orange-50/30 to-yellow-50/50 dark:from-red-950/20 dark:via-orange-950/10 dark:to-yellow-950/20">
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
                            Trending
                        </div>
                    </div>
                    
                    {/* Navigation Buttons - Desktop Only */}
                    <div className="hidden md:flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className="h-8 w-8 p-0"
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
                                <MangaCard manga={manga} />
                            </div>
                        ))}
                    </div>

                    {/* Gradient Fade Effects */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
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

            {/* Custom Scrollbar Hide Styles */}
            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
} 