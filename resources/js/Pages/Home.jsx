import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card.jsx";
import { Button } from "@/Components/ui/button.jsx";
import { Badge } from "@/Components/ui/badge.jsx";
import { MangaList } from '@/Components/Manga';
import { HotMangaSlider, RankingsCard, RecommendedCard } from '@/Components/Home';
import { 
    BookOpen, 
    TrendingUp, 
    Star, 
    Users, 
    Clock,
    ArrowRight,
    Search,
    Heart
} from 'lucide-react';

export default function Home({
    canLogin,
    canRegister,
    featuredManga = [],
    hotManga = [],
    latestUpdates = [],
    rankings = [],
    recentComments = [],
    recommended = [],
    translations
}) {
    // Demo data fallback nếu không có data từ backend
    const defaultManga = [
        {
            id: 1,
            name: "One Piece",
            slug: "one-piece",
            cover: "/api/placeholder/200/280",
            status: "ongoing",
            recent_chapters: [
                {
                    chapter_number: 1098,
                    title: "Adventure Continues",
                    slug: "1098",
                    updated_at: "2024-01-15"
                }
            ]
        },
        {
            id: 2,
            name: "Naruto",
            slug: "naruto",
            cover: "/api/placeholder/200/280",
            status: "completed",
            recent_chapters: [
                {
                    chapter_number: 700,
                    title: "The End",
                    slug: "700",
                    updated_at: "2023-12-01"
                }
            ]
        }
    ];

    const displayLatestUpdates = latestUpdates.length > 0 ? latestUpdates : defaultManga;
    
    // Debug log để kiểm tra dữ liệu
    console.log('Latest Updates Data:', displayLatestUpdates.slice(0, 2));

    const stats = [
        { label: "Manga", value: "10,000+", icon: BookOpen },
        { label: "Chapters", value: "500K+", icon: Clock },
        { label: "Users", value: "1M+", icon: Users },
        { label: "Rating", value: "4.8/5", icon: Star }
    ];

    return (
        <AppLayout>
            <Head title="Trang chủ - MangaReader" />

            {/* Hot Manga Slider */}
            <HotMangaSlider hotManga={hotManga} />

            {/* Main Content Grid (2fr + 1fr layout) */}
            <div className="container mx-auto px-4 py-16 bg-primary-100/10">
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                    {/* Main Content - Latest Updates */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-foreground mb-2">
                                    {translations.latest_updates_title}
                                </h2>
                            </div>
                            <Button variant="outline" asChild>
                                <a href="/manga?sort=latest">
                                    {translations.view_all}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                        </div>

                        <MangaList 
                            mangas={displayLatestUpdates}
                            variant="grid"
                            className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                        />
                    </section>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        <RankingsCard rankings={rankings} />
                        {/* <RecentCommentsCard comments={recentComments} /> */}
                        <RecommendedCard recommended={recommended} />
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
} 