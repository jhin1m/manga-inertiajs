import React from 'react';
import { Link } from '@inertiajs/react';
import { MangaCard } from './MangaCard';
import { Card, CardContent } from '@/Components/ui/card';

export function MangaList({ 
    mangas = [], 
    variant = 'grid',
    columns = 'auto',
    className = '',
    showEmpty = true,
    emptyMessage = 'Không có manga nào để hiển thị'
}) {
    if (!mangas.length && showEmpty) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có manga</h3>
                <p className="text-gray-500 max-w-sm">{emptyMessage}</p>
            </div>
        );
    }

    // Grid columns configuration
    const getGridColumns = () => {
        if (columns !== 'auto') return columns;
        
        // Default responsive grid
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    };

    const getListVariant = () => {
        switch (variant) {
            case 'list':
                return 'space-y-4';
            case 'compact':
                return `grid ${getGridColumns()} gap-3`;
            case 'featured':
                return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
            default:
                return `grid ${getGridColumns()} gap-4`;
        }
    };

    // List item component for horizontal layout
    const MangaListItem = ({ manga }) => (
        <Link href={route('manga.show', manga.slug)}>
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
                            <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                                <span className="px-2 py-1 bg-secondary rounded text-xs">
                                    {manga.status_label}
                                </span>
                                <span>★ {manga.rating?.toFixed(1) || 'N/A'}</span>
                                <span>👁 {manga.views?.toLocaleString() || 0}</span>
                                <span>{manga.chapters_count || 0} chương</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {manga.taxonomy_terms?.filter(term => term.taxonomy && term.taxonomy.type === 'genre').slice(0, 3).map((genre, index) => (
                                    <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                        {genre.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );

    return (
        <div className={`${getListVariant()} ${className}`}>
            {mangas.map((manga) => (
                variant === 'list' ? (
                    <MangaListItem key={manga.id} manga={manga} />
                ) : (
                    <MangaCard
                        key={manga.id}
                        manga={manga}
                        variant={variant}
                        className={variant === 'featured' ? 'h-full' : ''}
                    />
                )
            ))}
        </div>
    );
} 