import { Link } from '@inertiajs/react'
import { Button } from '@/Components/ui/button'
import { Badge } from '@/Components/ui/badge'
import { AspectRatio } from '@/Components/ui/aspect-ratio'
import { Card, CardContent } from '@/Components/ui/card'
import { BookOpen, Heart, Star } from 'lucide-react'

export function MangaHeader({ manga }) {
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
                        {manga.rating ? `${manga.rating}/5` : 'Chưa có đánh giá'} 
                        {manga.total_rating > 0 && ` (${manga.total_rating} lượt)`}
                    </span>
                </div>

                {/* Status & Author */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Trạng thái:</span>
                        <Badge variant="secondary" className={`${statusColors[manga.status]} text-white`}>
                            {manga.status_label || manga.status}
                        </Badge>
                    </div>
                    
                    {manga.authors && manga.authors.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Tác giả:</span>
                            <div className="flex flex-wrap gap-1">
                                {manga.authors.map(author => (
                                    <Link 
                                        key={author.id} 
                                        href={`/taxonomy/terms/${author.slug}`}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        {author.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                    <Button size="lg" asChild>
                        <Link href={manga.latest_chapter ? `/chapters/${manga.latest_chapter.id}` : '#'}>
                            <BookOpen className="w-4 h-4 mr-2" />
                            Đọc ngay
                        </Link>
                    </Button>
                    
                    <Button variant="outline" size="lg">
                        <Heart className="w-4 h-4 mr-2" />
                        Yêu thích
                    </Button>
                </div>
            </div>
        </>
    )
} 