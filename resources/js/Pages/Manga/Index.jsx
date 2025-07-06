import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { Button } from "@/Components/ui/button.jsx";
import { Card, CardContent } from "@/Components/ui/card.jsx";
import { Badge } from "@/Components/ui/badge.jsx";
import { Separator } from "@/Components/ui/separator.jsx";
import FilterSidebar from '@/Components/Sidebar/FilterSidebar';
import MobileFilterButton from '@/Components/Sidebar/MobileFilterButton';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Grid, List, Search, BookOpen, Eye, Star } from 'lucide-react';

export default function MangaIndex({ 
    manga, 
    filters = {},
    genres = [],
    statuses = []
}) {
    const [viewMode, setViewMode] = useState('grid');
    const isMobile = useIsMobile();

    const handleFiltersChange = (newFilters) => {
        // Sử dụng Inertia để navigate với filters
        router.get('/manga', newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const MangaCard = ({ manga }) => (
        <Link href={`/manga/${manga.slug}`}>
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardContent className="p-0">
                    <div className="aspect-[3/4] bg-muted rounded-t-lg overflow-hidden">
                        <img 
                            src={manga.cover || "/api/placeholder/200/280"} 
                            alt={manga.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                    <div className="p-4">
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {manga.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                                {manga.status_label}
                            </Badge>
                            <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="text-xs text-muted-foreground">
                                    {manga.rating && typeof manga.rating === 'number' ? manga.rating.toFixed(1) : 'N/A'}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                            {manga.taxonomy_terms?.filter(term => term.taxonomy && term.taxonomy.type === 'genre').slice(0, 2).map((genre, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {genre.name}
                                </Badge>
                            ))}
                            {manga.taxonomy_terms?.filter(term => term.taxonomy && term.taxonomy.type === 'genre').length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                    +{manga.taxonomy_terms.filter(term => term.taxonomy && term.taxonomy.type === 'genre').length - 2}
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{manga.chapters_count} chương</span>
                            <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{manga.views?.toLocaleString() || 0}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );

    const MangaListItem = ({ manga }) => (
        <Link href={`/manga/${manga.slug}`}>
            <Card className="group hover:shadow-md transition-all duration-300 cursor-pointer">
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <div className="w-16 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                            <img 
                                src={manga.cover || "/api/placeholder/80/100"} 
                                alt={manga.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                                {manga.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {manga.description || 'Chưa có mô tả'}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                    {manga.status_label}
                                </Badge>
                                <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                    <span className="text-xs text-muted-foreground">
                                        {manga.rating && typeof manga.rating === 'number' ? manga.rating.toFixed(1) : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    <span className="text-xs text-muted-foreground">
                                        {manga.views?.toLocaleString() || 0}
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {manga.chapters_count} chương
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {manga.taxonomy_terms?.filter(term => term.taxonomy && term.taxonomy.type === 'genre').slice(0, 3).map((genre, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                        {genre.name}
                                    </Badge>
                                ))}
                                {manga.taxonomy_terms?.filter(term => term.taxonomy && term.taxonomy.type === 'genre').length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{manga.taxonomy_terms.filter(term => term.taxonomy && term.taxonomy.type === 'genre').length - 3}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );

    // Breadcrumb items
    const breadcrumbItems = [
        { label: 'Manga', href: '/manga', icon: BookOpen }
    ];

    return (
        <AppLayout breadcrumbItems={breadcrumbItems}>
            <Head title="Danh sách manga" />
            
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Danh sách manga</h1>
                        <p className="text-muted-foreground">
                            Tìm thấy {manga?.total || 0} manga
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Mobile Filter Button */}
                        {isMobile && (
                            <MobileFilterButton
                                filters={filters}
                                onFiltersChange={handleFiltersChange}
                                genres={genres}
                                statuses={statuses}
                            />
                        )}
                        
                        {/* View Mode Toggle */}
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

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                    {/* Desktop Sidebar */}
                    {!isMobile && (
                        <aside className="hidden lg:block">
                            <FilterSidebar
                                filters={filters}
                                onFiltersChange={handleFiltersChange}
                                genres={genres}
                                statuses={statuses}
                                isMobile={false}
                                showFilterButton={false}
                            />
                        </aside>
                    )}

                    {/* Manga Grid/List */}
                    <main>
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {manga?.data?.map((item) => (
                                    <MangaCard key={item.id} manga={item} />
                                )) || []}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {manga?.data?.map((item) => (
                                    <MangaListItem key={item.id} manga={item} />
                                )) || []}
                            </div>
                        )}

                        {/* Empty State */}
                        {(!manga?.data || manga.data.length === 0) && (
                            <Card className="text-center py-12">
                                <CardContent>
                                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Không tìm thấy manga</h3>
                                    <p className="text-muted-foreground">
                                        Thử thay đổi bộ lọc để tìm thêm manga
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Pagination */}
                        {manga?.last_page > 1 && (
                            <div className="flex justify-center mt-8">
                                <div className="flex items-center gap-2">
                                    {manga?.links?.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, {}, {
                                                preserveState: true,
                                                preserveScroll: true
                                            })}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </AppLayout>
    );
} 