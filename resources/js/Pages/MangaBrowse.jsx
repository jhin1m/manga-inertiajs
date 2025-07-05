import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import FilterSidebar from '@/Components/Sidebar/FilterSidebar';
import MobileFilterButton from '@/Components/Sidebar/MobileFilterButton';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Grid, List, SlidersHorizontal, Search, BookOpen } from 'lucide-react';

export default function MangaBrowse({ 
    mangas = [], 
    genres = [], 
    statuses = [],
    authors = [],
    totalCount = 0,
    currentFilters = {}
}) {
    const [filters, setFilters] = useState(currentFilters);
    const [viewMode, setViewMode] = useState('grid'); // grid or list
    const isMobile = useIsMobile();

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
        // Ở đây sẽ gọi API hoặc Inertia visit để update data
        console.log('Filters changed:', newFilters);
    };

    const MangaCard = ({ manga }) => (
        <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <CardContent className="p-0">
                <div className="aspect-[3/4] bg-muted rounded-t-lg overflow-hidden">
                    <img 
                        src={manga.cover_image || "/placeholder-manga.jpg"} 
                        alt={manga.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {manga.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                            {manga.status_label || manga.status}
                        </Badge>
                        <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-xs text-muted-foreground">{manga.rating}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                        {manga.genres?.slice(0, 2).map((genre, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                                {genre}
                            </Badge>
                        ))}
                        {manga.genres?.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                                +{manga.genres.length - 2}
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {manga.total_chapters} chương
                    </p>
                </div>
            </CardContent>
        </Card>
    );

    const MangaListItem = ({ manga }) => (
        <Card className="group hover:shadow-md transition-all duration-300 cursor-pointer">
            <CardContent className="p-4">
                <div className="flex gap-4">
                    <div className="w-16 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                        <img 
                            src={manga.cover_image || "/placeholder-manga.jpg"} 
                            alt={manga.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                            {manga.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {manga.description}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                                {manga.status_label || manga.status}
                            </Badge>
                            <div className="flex items-center gap-1">
                                <span className="text-yellow-500">★</span>
                                <span className="text-xs text-muted-foreground">{manga.rating}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {manga.total_chapters} chương
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {manga.genres?.slice(0, 3).map((genre, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    {genre}
                                </Badge>
                            ))}
                            {manga.genres?.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{manga.genres.length - 3}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    // Breadcrumb items
    const breadcrumbItems = [
        { label: 'Duyệt manga', href: '/browse', icon: BookOpen }
    ];

    return (
        <AppLayout breadcrumbItems={breadcrumbItems}>
            <Head title="Duyệt manga" />
            
            <div className="container mx-auto px-4 py-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Duyệt manga</h1>
                        <p className="text-muted-foreground">
                            Tìm thấy {totalCount || sampleMangas.length} manga
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
                                authors={authors}
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
                                {mangas.map((manga) => (
                                    <MangaCard key={manga.id} manga={manga} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {mangas.map((manga) => (
                                    <MangaListItem key={manga.id} manga={manga} />
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {mangas.length === 0 && (
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
                    </main>
                </div>
            </div>
        </AppLayout>
    );
} 