import { AppLayout } from '@/Layouts/AppLayout';
import { Button } from "@/Components/ui/button.jsx";
import { MangaList } from '@/Components/Manga';
import { HotMangaSlider, RankingsCard, RecommendedCard } from '@/Components/Home';
import SeoHead from '@/Components/SeoHead';
import { ArrowRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function Home({
    hotManga = [],
    latestUpdates,
    rankings = [],
    recommended = [],
    seo,
    translations
}) {
    return (
        <AppLayout>
            <SeoHead seo={seo} />

            {/* Hot Manga Slider */}
            <HotMangaSlider hotManga={hotManga} translations={translations} />

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
                                <Link href="/manga?sort=latest">
                                    {translations.view_all}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>

                        <MangaList 
                            mangas={latestUpdates}
                            variant="grid"
                            className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                            translations={translations}
                        />
                        
                        <div className="flex justify-center mt-8">
                            <Button variant="outline" asChild>
                                <Link href="/manga">
                                    {translations.view_all || 'View All'}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </section>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        <RankingsCard rankings={rankings} />
                        <RecommendedCard recommended={recommended} />
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
} 