import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { BookOpen } from 'lucide-react';
import { formatRelativeTime } from '@/lib/formatters';

export function MangaCard({ 
    manga, 
    variant = 'default', 
    className = '', 
    priority = false 
}) {
    const {
        id,
        name,
        slug,
        cover,
        status,
        status_label,
        recent_chapters = [],
        latest_chapter,
        created_at
    } = manga;

    const statusVariants = {
        'ongoing': { variant: 'default' },
        'completed': { variant: 'secondary' },
        'hiatus': { variant: 'outline' },
        'dropped': { variant: 'destructive' },
        'loading': { variant: 'outline' }
    };

    const statusConfig = statusVariants[status] || { variant: 'outline' };



    // Sử dụng recent_chapters nếu có, nếu không thì dùng latest_chapter
    const chaptersToShow = recent_chapters.length > 0 ? recent_chapters : 
        (latest_chapter ? [latest_chapter] : []);

    return (
        <Card className={`group hover:shadow-lg transition-all duration-300 ${className}`}>
            {/* Cover Image */}
            <div className="relative overflow-hidden rounded-t-xl">
                <Link href={`/manga/${slug}`}>
                    <div className="aspect-[3/4] bg-gray-100">
                        {cover ? (
                            <img
                                src={cover}
                                alt={name}
                                className="w-full h-full object-cover"
                                loading={priority ? "eager" : "lazy"}
                                decoding={priority ? "sync" : "async"}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                <BookOpen className="w-12 h-12 text-gray-400" />
                            </div>
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
                <Link href={`/manga/${slug}`}>
                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-3 group-hover:text-primary transition-colors">
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
                                    href={`/manga/${slug}/chapter/${chapter.slug || chapter.chapter_number}`}
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
                    <div className="text-xs text-muted-foreground text-center py-2">
                        {status === 'loading' ? 'Đang tải...' : 'Chưa có chapter nào'}
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 