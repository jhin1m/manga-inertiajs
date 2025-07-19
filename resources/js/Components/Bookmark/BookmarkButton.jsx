import { useState } from 'react'
import { Button } from '@/Components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useBookmarks } from '@/hooks/useBookmarks'

/**
 * Bookmark button component for manga only
 */
export default function BookmarkButton({ 
    item, // manga object (or chapter object from which we'll extract manga info)
    manga, // manga object when used in chapter context
    size = 'default', // 'sm', 'default', 'lg'
    variant = 'outline',
    showText = true,
    translations = {},
    className = '',
    onToggle = null // callback function
}) {
    const { 
        toggleMangaBookmark, 
        isMangaBookmarked 
    } = useBookmarks()
    
    const [isToggling, setIsToggling] = useState(false)

    // Always work with manga - if we're in a chapter context, use the manga prop
    const targetManga = manga || item
    const isBookmarked = isMangaBookmarked(targetManga.id)

    // Handle bookmark toggle
    const handleToggle = async () => {
        if (isToggling) return

        setIsToggling(true)
        
        try {
            const success = toggleMangaBookmark(targetManga)

            if (success && onToggle) {
                onToggle(!isBookmarked, targetManga)
            }
        } catch (error) {
            console.error('Failed to toggle bookmark:', error)
        } finally {
            setIsToggling(false)
        }
    }

    // Get tooltip text
    const getTooltipText = () => {
        return isBookmarked 
            ? translations.remove_manga_bookmark || 'Remove from bookmarks'
            : translations.add_manga_bookmark || 'Add to bookmarks'
    }

    // Get button text
    const getButtonText = () => {
        return isBookmarked 
            ? translations.bookmarked || 'Bookmarked'
            : translations.bookmark || 'Bookmark'
    }

    // Get icon
    const Icon = isBookmarked ? BookmarkCheck : Bookmark

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant={variant}
                        size={size}
                        onClick={handleToggle}
                        disabled={isToggling}
                        className={`
                            ${isBookmarked ? 'text-primary border-primary' : ''}
                            ${className}
                        `}
                    >
                        <Icon className={`
                            ${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}
                            ${showText ? 'mr-2' : ''}
                            ${isBookmarked ? 'fill-current' : ''}
                        `} />
                        {showText && getButtonText()}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{getTooltipText()}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}