import { Link } from '@inertiajs/react'
import { Button } from '@/Components/ui/button'
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select'
import { ChevronLeft, ChevronRight, Home, List } from 'lucide-react'

export function ChapterNavigation({ 
    manga, 
    chapter, 
    previousChapter, 
    nextChapter, 
    isNavVisible,
    allChapters = [],
    className = ""
}) {
    const handleChapterSelect = (chapterId) => {
        if (chapterId && chapterId !== chapter.id.toString()) {
            window.location.href = route('manga.chapters.show', [manga.slug, chapterId])
        }
    }

    return (
        <div className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b transition-transform duration-300 ${
            isNavVisible ? 'translate-y-0' : '-translate-y-full'
        } ${className}`}>
            <div className="container mx-auto px-4 py-3">
                {/* Desktop Layout */}
                <div className="hidden md:flex items-center justify-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/">
                            <Home className="h-4 w-4 mr-2" />
                            Trang chủ
                        </Link>
                    </Button>
                    
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={route('manga.show', manga.slug)}>
                            <List className="h-4 w-4 mr-2" />
                            Danh sách chương
                        </Link>
                    </Button>
                    
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={!previousChapter}
                        asChild={previousChapter}
                    >
                        {previousChapter ? (
                            <Link href={route('manga.chapters.show', [manga.slug, previousChapter.id])}>
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Trước
                            </Link>
                        ) : (
                            <>
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Trước
                            </>
                        )}
                    </Button>
                    
                    <Select value={chapter.id.toString()} onValueChange={handleChapterSelect}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Chọn chương" />
                        </SelectTrigger>
                        <SelectContent>
                            {allChapters.map((chap) => (
                                <SelectItem key={chap.id} value={chap.id.toString()}>
                                    Chương {chap.chapter_number}: {chap.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled={!nextChapter}
                        asChild={nextChapter}
                    >
                        {nextChapter ? (
                            <Link href={route('manga.chapters.show', [manga.slug, nextChapter.id])}>
                                Tiếp
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Link>
                        ) : (
                            <>
                                Tiếp
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </>
                        )}
                    </Button>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden">
                    {/* Top Row: Home and List buttons */}
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/">
                                <Home className="h-4 w-4" />
                                <span className="ml-1">Trang chủ</span>
                            </Link>
                        </Button>
                        
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('manga.show', manga.slug)}>
                                <List className="h-4 w-4" />
                                <span className="ml-1">Danh sách</span>
                            </Link>
                        </Button>
                    </div>
                    
                    {/* Bottom Row: Navigation controls */}
                    <div className="flex items-center justify-center gap-2">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={!previousChapter}
                            asChild={previousChapter}
                        >
                            {previousChapter ? (
                                <Link href={route('manga.chapters.show', [manga.slug, previousChapter.id])}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Link>
                            ) : (
                                <ChevronLeft className="h-4 w-4" />
                            )}
                        </Button>
                        
                        <Select value={chapter.id.toString()} onValueChange={handleChapterSelect}>
                            <SelectTrigger className="w-[140px] text-xs">
                                <SelectValue placeholder="Chọn chương" />
                            </SelectTrigger>
                            <SelectContent>
                                {allChapters.map((chap) => (
                                    <SelectItem key={chap.id} value={chap.id.toString()}>
                                        Ch.{chap.chapter_number}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={!nextChapter}
                            asChild={nextChapter}
                        >
                            {nextChapter ? (
                                <Link href={route('manga.chapters.show', [manga.slug, nextChapter.id])}>
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
} 