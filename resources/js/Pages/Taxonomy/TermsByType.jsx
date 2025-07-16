import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { AppLayout } from '@/Layouts/AppLayout';
import { Button } from "@/Components/ui/button.jsx";
import { Card, CardContent } from "@/Components/ui/card.jsx";
import { MangaList } from '@/Components/Manga/MangaList';
import { Paginator } from '@/Components/Common/Paginator';
import { Grid, List, BookOpen, Tag, User, Palette, Hash } from 'lucide-react';

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

const getTypeLabel = (type, translations) => {
    const labels = {
        genre: translations.genre_label || 'Genre',
        author: translations.author_label || 'Author',
        artist: translations.artist_label || 'Artist',
        tag: translations.tag_label || 'Tag',
        status: translations.status_label || 'Status',
        year: translations.year_label || 'Year'
    };
    
    return labels[type] || 'Taxonomy';
};

export function TermsByType({ 
    term, 
    manga, 
    type = 'genre',
    translations = {}
}) {
    const [viewMode, setViewMode] = useState('grid');
    
    const TypeIcon = getTypeIcon(type);
    const typeLabel = getTypeLabel(type, translations);

    const breadcrumbItems = [
        { label: 'Manga', href: route('manga.index'), icon: BookOpen },
        { label: typeLabel, href: '#', icon: TypeIcon },
        { label: term.name, href: route(`${type}.show`, term.slug), icon: TypeIcon }
    ];

    const pageTitle = translations.title || `${typeLabel}: ${term.name}`;

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
                            {translations.found_count?.replace(':count', manga?.total || 0) || `Found ${manga?.total || 0} manga`}
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
                        mangas={manga?.data}
                        variant={viewMode}
                        columns={viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'auto'}
                        showEmpty={false}
                        translations={translations}
                        isLoading={manga === undefined}
                    />

                    {manga && manga.data.length === 0 && (
                        <Card className="text-center py-12">
                            <CardContent>
                                <TypeIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">
                                    {translations.no_manga_found || `No manga found`}
                                </h3>
                                <p className="text-muted-foreground">
                                    {translations.no_manga_message || `No manga found in ${typeLabel.toLowerCase()} ${term.name}`}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    <Paginator paginator={manga} translations={translations} className="mt-8" />
                </main>
            </div>
        </AppLayout>
    );
}

export default TermsByType; 