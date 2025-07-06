import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { Button } from "@/Components/ui/button.jsx";
import { Card, CardContent } from "@/Components/ui/card.jsx";
import { MangaList } from '@/Components/Manga/MangaList';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Grid, List, Search, BookOpen, Tag, User, Palette, Hash } from 'lucide-react';

const getTypeIcon = (type) => {
    switch (type) {
        case 'genre':
            return Tag;
        case 'author':
            return User;
        case 'artist':
            return Palette;
        case 'tag':
            return Hash;
        default:
            return BookOpen;
    }
};

const getTypeLabel = (type) => {
    switch (type) {
        case 'genre':
            return 'Thể loại';
        case 'author':
            return 'Tác giả';
        case 'artist':
            return 'Họa sĩ';
        case 'tag':
            return 'Tag';
        default:
            return 'Taxonomy';
    }
};

export function TermsByType({ 
    term, 
    manga, 
    type = 'genre',
    translations = {}
}) {
    const [viewMode, setViewMode] = useState('grid');
    const isMobile = useIsMobile();
    
    const TypeIcon = getTypeIcon(type);
    const typeLabel = getTypeLabel(type);

    const breadcrumbItems = [
        { label: 'Manga', href: route('manga.index'), icon: BookOpen },
        { label: typeLabel, href: '#', icon: TypeIcon },
        { label: term.name, href: route(`${type}.show`, term.slug), icon: TypeIcon }
    ];

    const pageTitle = translations.title || `${typeLabel}: ${term.name}`;
    const pageDescription = translations.description || `Danh sách manga thuộc ${typeLabel.toLowerCase()} ${term.name}`;

    return (
        <AppLayout breadcrumbItems={breadcrumbItems}>
            <Head title={pageTitle} />
            
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <TypeIcon className="h-8 w-8 text-primary" />
                            <h1 className="text-2xl font-bold">{term.name}</h1>
                        </div>
                        <p className="text-muted-foreground">
                            {translations.found_count?.replace(':count', manga?.total || 0) || `Tìm thấy ${manga?.total || 0} manga`}
                        </p>
                        {term.description && (
                            <p className="text-sm text-muted-foreground mt-1">{term.description}</p>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2">
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

                <main>
                    <MangaList
                        mangas={manga?.data || []}
                        variant={viewMode}
                        columns={viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'auto'}
                        showEmpty={false}
                    />

                    {(!manga?.data || manga.data.length === 0) && (
                        <Card className="text-center py-12">
                            <CardContent>
                                <TypeIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    {translations.no_manga_found || 'Không tìm thấy manga'}
                                </h3>
                                <p className="text-muted-foreground">
                                    {translations.no_manga_message || `Chưa có manga nào thuộc ${typeLabel.toLowerCase()} ${term.name}`}
                                </p>
                            </CardContent>
                        </Card>
                    )}

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
        </AppLayout>
    );
}

export default TermsByType; 