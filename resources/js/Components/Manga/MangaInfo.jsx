import { useState } from 'react'
import { Link } from '@inertiajs/react'
import { Badge } from '@/Components/ui/badge'
import { Button } from '@/Components/ui/button'
import { Separator } from '@/Components/ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/Components/ui/collapsible'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function MangaInfo({ manga }) {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
    const maxDescriptionLength = 200

    const shouldShowExpandButton = manga.description && manga.description.length > maxDescriptionLength

    const displayDescription = shouldShowExpandButton && !isDescriptionExpanded 
        ? manga.description.substring(0, maxDescriptionLength) + '...'
        : manga.description

    return (
        <div className="space-y-6 mb-8">
            <Separator />
            
            {/* Description */}
            {manga.description && (
                <div>
                    <h3 className="text-lg font-semibold mb-3">Mô tả</h3>
                    <Collapsible open={isDescriptionExpanded} onOpenChange={setIsDescriptionExpanded}>
                        <div className="text-muted-foreground leading-relaxed">
                            {shouldShowExpandButton ? (
                                <>
                                    <p>{displayDescription}</p>
                                    <CollapsibleTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="mt-2 p-0 h-auto text-primary hover:text-primary/80"
                                        >
                                            {isDescriptionExpanded ? (
                                                <>
                                                    Thu gọn <ChevronUp className="w-4 h-4 ml-1" />
                                                </>
                                            ) : (
                                                <>
                                                    Xem thêm <ChevronDown className="w-4 h-4 ml-1" />
                                                </>
                                            )}
                                        </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <p className="mt-2">
                                            {manga.description.substring(maxDescriptionLength)}
                                        </p>
                                    </CollapsibleContent>
                                </>
                            ) : (
                                <p>{manga.description}</p>
                            )}
                        </div>
                    </Collapsible>
                </div>
            )}

            {/* Genres */}
            {manga.genres && manga.genres.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-3">Thể loại</h3>
                    <div className="flex flex-wrap gap-2">
                        {manga.genres.map(genre => (
                            <Badge 
                                key={genre.id} 
                                variant="secondary" 
                                className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                                asChild
                            >
                                <Link href={`/taxonomy/terms/${genre.slug}`}>
                                    {genre.name}
                                </Link>
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <Separator />
        </div>
    )
} 