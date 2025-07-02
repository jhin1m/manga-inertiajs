import React from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { BookOpen, Calendar } from 'lucide-react';

export default function MangaCard({ manga, variant = 'default', className = '' }) {
    const {
        id,
        name,
        slug,
        cover,
        status,
        recent_chapters = [],
        created_at
    } = manga;

    const statusVariants = {
        'ongoing': { variant: 'default', text: 'Đang tiến hành' },
        'completed': { variant: 'secondary', text: 'Hoàn thành' },
        'hiatus': { variant: 'outline', text: 'Tạm dừng' },
        'dropped': { variant: 'destructive', text: 'Ngưng' }
    };

    const statusConfig = statusVariants[status] || { variant: 'outline', text: status };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    };

    return (
        <Card className={`${className}`}>
            {/* Cover Image */}
            <div className="relative overflow-hidden rounded-t-xl">
                <Link href={`/manga/${slug}`}>
                    <div className="aspect-[3/4] bg-gray-100">
                        {cover ? (
                            <img
                                src={cover}
                                alt={name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                <BookOpen className="w-12 h-12 text-gray-400" />
                            </div>
                        )}
                    </div>
                </Link>
                
                {/* Status Badge - Positioned on image */}
                <div className="absolute top-2 right-2">
                    <Badge variant={statusConfig.variant} className="text-xs">
                        {statusConfig.text}
                    </Badge>
                </div>
            </div>

            <CardContent className="p-3 sm:p-4">
                {/* Title */}
                <Link href={`/manga/${slug}`}>
                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-3">
                        {name}
                    </h3>
                </Link>

                {/* Recent Chapters */}
                {recent_chapters.length > 0 && (
                    <div className="space-y-2">
                        {recent_chapters.slice(0, 3).map((chapter, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                                {/* Chapter link - left side */}
                                <Link 
                                    href={`/manga/${slug}/chapter/${chapter.slug || chapter.chapter_number}`}
                                    className="text-primary hover:underline flex-1 truncate"
                                >
                                    Chapter {chapter.chapter_number}
                                    {chapter.title && `: ${chapter.title}`}
                                </Link>
                                
                                {/* Update time - right side */}
                                <div className="flex items-center gap-1 text-muted-foreground ml-2 flex-shrink-0">
                                    <Calendar className="w-3 h-3" />
                                    <span>{formatDate(chapter.updated_at || chapter.created_at)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* No chapters message */}
                {recent_chapters.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-2">
                        Chưa có chapter nào
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 