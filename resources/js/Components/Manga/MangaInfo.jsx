import { useState } from 'react'
import { Link } from '@inertiajs/react'
import { Button } from '@/Components/ui/button'
import { Separator } from '@/Components/ui/separator'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function MangaInfo({ manga, translations }) {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
    const maxDescriptionLength = 200

    const shouldShowExpandButton = manga.description && manga.description.length > maxDescriptionLength

    const truncatedDescription = shouldShowExpandButton 
        ? manga.description.substring(0, maxDescriptionLength) + '...'
        : manga.description

    const remainingDescription = shouldShowExpandButton 
        ? manga.description.substring(maxDescriptionLength)
        : ''

    return (
        <div className="space-y-6 mb-8">
            <Separator />
            
            {/* Description */}
            {manga.description && (
                <div>
                    <h3 className="text-lg font-semibold mb-3">{translations.description_label}</h3>
                    <div className="text-muted-foreground leading-relaxed">
                        {shouldShowExpandButton ? (
                            <>
                                <p>{isDescriptionExpanded ? manga.description : truncatedDescription}</p>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="mt-2 p-0 h-auto text-primary hover:text-primary/80"
                                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                >
                                    {isDescriptionExpanded ? (
                                        <>
                                            {translations.collapse} <ChevronUp className="w-4 h-4 ml-1" />
                                        </>
                                    ) : (
                                        <>
                                            {translations.expand_more} <ChevronDown className="w-4 h-4 ml-1" />
                                        </>
                                    )}
                                </Button>
                            </>
                        ) : (
                            <p>{manga.description}</p>
                        )}
                    </div>
                </div>
            )}

            {/* Genres */}
            {manga.genres && manga.genres.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-3">{translations.genre_label}</h3>
                    <div className="flex flex-wrap gap-2">
                        {manga.genres.map(genre => (
                            <Link 
                                key={genre.id} 
                                href={route('genre.show', genre.slug)}
                                className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                            >
                                {genre.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <Separator />
        </div>
    )
} 