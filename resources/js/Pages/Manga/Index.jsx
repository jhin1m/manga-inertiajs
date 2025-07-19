import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { Button } from "@/Components/ui/button.jsx";
import { Card, CardContent } from "@/Components/ui/card.jsx";
import { MangaList } from '@/Components/Manga/MangaList';
import FilterSidebar from '@/Components/Sidebar/FilterSidebar';
import MobileFilterButton from '@/Components/Sidebar/MobileFilterButton';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Paginator } from '@/Components/Common/Paginator';
import { BreadcrumbBuilder } from '@/Components/Layout/Breadcrumb';
import { Grid, List, Search } from 'lucide-react';

export default function MangaIndex({ 
    manga, 
    filters = {},
    genres = [],
    statuses = [],
    translations = {}
}) {
    const [viewMode, setViewMode] = useState('grid');
    const isMobile = useIsMobile();

    const handleFiltersChange = (newFilters) => {
        router.get(route('manga.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };



    const breadcrumbItems = new BreadcrumbBuilder()
        .addMangaList()
        .build();

    return (
        <AppLayout breadcrumbItems={breadcrumbItems}>
            <Head title={translations.title || 'Manga List'} />
            
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">{translations.title || 'Manga List'}</h1>
                        <p className="text-muted-foreground">
                            {translations.found_count?.replace(':count', manga?.total || 0) || `Found ${manga?.total || 0} manga`}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {isMobile && (
                            <MobileFilterButton
                                filters={filters}
                                onFiltersChange={handleFiltersChange}
                                genres={genres}
                                statuses={statuses}
                                translations={translations}
                            />
                        )}
                        
                        <div className="flex border rounded-lg">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className="rounded-r-none"
                            >
                                <Grid className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className="rounded-l-none"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                    {!isMobile && (
                        <aside className="hidden lg:block">
                            <FilterSidebar
                                filters={filters}
                                onFiltersChange={handleFiltersChange}
                                genres={genres}
                                statuses={statuses}
                                translations={translations}
                                isMobile={false}
                                showFilterButton={false}
                            />
                        </aside>
                    )}

                    <main>
                        <MangaList
                            mangas={manga?.data}
                            variant={viewMode}
                            columns={viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4' : 'auto'}
                            showEmpty={false}
                            translations={translations}
                            isLoading={manga === undefined}
                        />

                        {manga && manga.data.length === 0 && (
                            <Card className="text-center py-12">
                                <CardContent>
                                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">
                                        {translations.no_manga_found || 'No manga found'}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {translations.no_manga_message || 'Try changing the filters to find more manga'}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        <Paginator paginator={manga} translations={translations} className="mt-8" />
                    </main>
                </div>
            </div>
        </AppLayout>
    );
} 