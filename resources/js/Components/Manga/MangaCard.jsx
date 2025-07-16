import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { formatRelativeTime } from '@/lib/formatters';
import { getContextualDefaultCover, isValidCover } from '@/lib/image-utils.jsx';

export function MangaCard({ 
    manga, 
    className = '', 
    priority = false,
    translations = {}
}) {
    const {
        name,
        slug,
        cover,
        status,
        status_label,
        recent_chapters = [],
    } = manga;

    const statusVariants = {
        'ongoing': { variant: 'default' },
        'completed': { variant: 'secondary' },
        'hiatus': { variant: 'outline' },
        'dropped': { variant: 'destructive' },
        'loading': { variant: 'outline' }
    };

    const statusConfig = statusVariants[status] || { variant: 'outline' };

    // Change this to only show recent chapters only if they exist
    const chaptersToShow = recent_chapters.length > 0 ? recent_chapters : [];

    return (
        <Card className={`group hover:shadow-lg transition-all duration-300 ${className}`}>
            {/* Cover Image */}
            <div className="relative overflow-hidden rounded-t-xl">
                <Link href={route('manga.show', slug)}>
                    <div className="aspect-[3/4] bg-gray-100">
                        {isValidCover(cover) ? (
                            <img
                                src={cover}
                                alt={name}
                                className="w-full h-full object-cover"
                                loading={priority ? "eager" : "lazy"}
                                decoding={priority ? "sync" : "async"}
                            />
                        ) : (
                            getContextualDefaultCover('card')
                        )}
                    </div>
                </Link>
                
                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                    <Badge variant={statusConfig.variant} className="text-xs">
                        {status_label || status}
                    </Badge>
                </div>
            </div>

            <CardContent className="p-3 sm:p-4">
                {/* Title */}
                <Link href={route('manga.show', slug)}>
                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-3 group-hover:text-primary transition-colors sm:h-11">
                        {name}
                    </h3>
                </Link>

                {/* Chapters Info */}
                {chaptersToShow.length > 0 && (
                    <div className="space-y-2">
                        {chaptersToShow.slice(0, 3).map((chapter, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                                {/* Chapter link - left side */}
                                <Link 
                                    href={chapter.slug ? route('manga.chapters.show', [slug, chapter.slug]) : route('manga.show', slug)}
                                    className="text-primary hover:underline flex-1 truncate"
                                >
                                    {chapter.title || `Chapter ${chapter.chapter_number}`}
                                </Link>
                                
                                {/* Update time - right side */}
                                <div className="flex items-center gap-1 text-muted-foreground ml-2 flex-shrink-0">
                                    <span className="text-xs">{formatRelativeTime(chapter.updated_at || chapter.created_at)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* No chapters message */}
                {chaptersToShow.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center">
                        {status === 'loading' ? (translations.loading || 'Loading...') : (translations.no_chapters || 'No chapters yet')}
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 