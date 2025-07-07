import { Link } from '@inertiajs/react'
import { Button } from '@/Components/ui/button'
import { Skeleton } from '@/Components/ui/skeleton'
import { ChevronLeft, ChevronRight, Home, List, Loader2 } from 'lucide-react'

export function ChapterNavigation({ 
    manga, 
    chapter, 
    previousChapter, 
    nextChapter, 
    isNavVisible,
    allChapters,
    className = ""
}) {
    const handleChapterSelect = (e) => {
        const chapterSlug = e.target.value
        if (chapterSlug && chapterSlug !== chapter.slug && allChapters) {
            window.location.href = route('manga.chapters.show', [manga.slug, chapterSlug])
        }
    }

    // Component for chapter select that handles loading state
    const ChapterSelectDropdown = ({ mobile = false }) => {
        if (allChapters === undefined) {
            return (
                <div className="flex items-center gap-1">
                    <Skeleton className={mobile ? "h-7 w-[100px]" : "h-9 w-[200px]"} />
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                </div>
            )
        }

        return (
            <select 
                value={chapter.slug} 
                onChange={handleChapterSelect}
                name="chapter"
                className={mobile 
                    ? "w-[100px] px-2 py-1 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    : "w-[200px] px-3 py-2 mx-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                }
            >
                {allChapters?.map((chap) => (
                    <option key={chap.id} value={chap.slug}>
                        {mobile 
                            ? `Ch.${chap.chapter_number}`
                            : `Chương ${chap.chapter_number}: ${chap.title}`
                        }
                    </option>
                ))}
            </select>
        )
    }

    return (
        <div className={`fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b transition-transform duration-300 ${
            isNavVisible ? 'translate-y-0' : '-translate-y-full'
        } ${className}`}>
            <div className="container mx-auto px-4 py-2">
                {/* Desktop Layout */}
                <div className="hidden md:flex items-center justify-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/">
                            <Home className="h-4 w-4" />
                        </Link>
                    </Button>
                    
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('manga.show', manga.slug)}>
                            <List className="h-4 w-4" />
                        </Link>
                    </Button>
                    
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={!previousChapter}
                        asChild={previousChapter}
                    >
                        {previousChapter ? (
                            <Link href={route('manga.chapters.show', [manga.slug, previousChapter.slug])}>
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        ) : (
                            <>
                                <ChevronLeft className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                    
                    <ChapterSelectDropdown mobile={false} />
                    
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={!nextChapter}
                        asChild={nextChapter}
                    >
                        {nextChapter ? (
                            <Link href={route('manga.chapters.show', [manga.slug, nextChapter.slug])}>
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <>
                                <ChevronRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden flex items-center justify-center bg-opacity-20">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/">
                            <Home className="h-4 w-4" />
                        </Link>
                    </Button>
                    
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('manga.show', manga.slug)}>
                            <List className="h-4 w-4" />
                        </Link>
                    </Button>
                    
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={!previousChapter}
                        asChild={previousChapter}
                    >
                        {previousChapter ? (
                            <Link href={route('manga.chapters.show', [manga.slug, previousChapter.slug])}>
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </Button>
                    
                    <ChapterSelectDropdown mobile={true} />
                    
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={!nextChapter}
                        asChild={nextChapter}
                    >
                        {nextChapter ? (
                            <Link href={route('manga.chapters.show', [manga.slug, nextChapter.slug])}>
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
} 