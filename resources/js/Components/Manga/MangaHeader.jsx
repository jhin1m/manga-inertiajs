import { Link } from '@inertiajs/react'
import { Button } from '@/Components/ui/button'
import { Badge } from '@/Components/ui/badge'
import { AspectRatio } from '@/Components/ui/aspect-ratio'
import { Card, CardContent } from '@/Components/ui/card'
import { BookOpen, Heart, Star, Eye, Calendar } from 'lucide-react'

export function MangaHeader({ manga, translations }) {
    const statusColors = {
        'ongoing': 'bg-green-500',
        'completed': 'bg-blue-500', 
        'hiatus': 'bg-yellow-500',
        'cancelled': 'bg-red-500'
    }

    const renderStars = (rating) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 !== 0
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                )
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <Star key={i} className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
                )
            } else {
                stars.push(
                    <Star key={i} className="w-4 h-4 text-gray-300" />
                )
            }
        }
        return stars
    }

    const formatNumber = (num) => {
        return new Intl.NumberFormat('vi-VN').format(num || 0)
    }

    return (
        <>
            {/* Cover Image */}
            <div className="w-full lg:w-[200px]">
                <AspectRatio ratio={2/3} className="bg-muted rounded-lg overflow-hidden">
                    <img 
                        src={manga.cover || '/api/placeholder/200/300'} 
                        alt={manga.name}
                        className="object-cover w-full h-full"
                    />
                </AspectRatio>
            </div>

            {/* Info Section */}
            <div className="space-y-4">
                {/* Title */}
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                        {manga.name}
                    </h1>
                    {manga.alternative_names && Array.isArray(manga.alternative_names) && manga.alternative_names.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                            {manga.alternative_names.join(', ')}
                        </p>
                    )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center">
                        {renderStars(manga.rating || 0)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                        {manga.rating ? `${manga.rating}/5` : translations.no_rating} 
                        {manga.total_rating > 0 && ` (${formatNumber(manga.total_rating)} ${translations.ratings_count})`}
                    </span>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {formatNumber(manga.views)} {translations.views_label}
                    </div>
                    <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {formatNumber(manga.total_chapters)} {translations.chapters_label}
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(manga.updated_at).toLocaleDateString('vi-VN')}
                    </div>
                </div>

                {/* Status & Taxonomy Info */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{translations.status_label}:</span>
                        <Badge variant="secondary" className={`${statusColors[manga.status]} text-white`}>
                            {manga.status_label || manga.status}
                        </Badge>
                    </div>
                    
                    {manga.authors && manga.authors.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{translations.author_label}:</span>
                            <div className="flex flex-wrap gap-1">
                                {manga.authors.map(author => (
                                    <Link 
                                        key={author.id} 
                                        href={route('taxonomies.terms', author.slug)}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        {author.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {manga.artists && manga.artists.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">{translations.artist_label}:</span>
                            <div className="flex flex-wrap gap-1">
                                {manga.artists.map(artist => (
                                    <Link 
                                        key={artist.id} 
                                        href={route('taxonomies.terms', artist.slug)}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        {artist.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                    {manga.first_chapter && (
                        <Button size="lg" asChild>
                            <Link href={route('manga.chapters.show', [manga.slug, manga.first_chapter.slug])}>
                                <BookOpen className="w-4 h-4 mr-2" />
                                {translations.read_first}
                            </Link>
                        </Button>
                    )}
                    
                    {manga.last_chapter && (
                        <Button variant="outline" size="lg" asChild>
                            <Link href={route('manga.chapters.show', [manga.slug, manga.last_chapter.slug])}>
                                <BookOpen className="w-4 h-4 mr-2" />
                                {translations.read_last}
                            </Link>
                        </Button>
                    )}
                    
                    <Button variant="outline" size="lg">
                        <Heart className="w-4 h-4 mr-2" />
                        {translations.favorite}
                    </Button>
                </div>
            </div>
        </>
    )
} 