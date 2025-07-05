import { Head, Link } from '@inertiajs/react'
import { AppLayout } from '@/Layouts/AppLayout'
import { Button } from '@/Components/ui/button'
import { Card } from '@/Components/ui/card'
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select'
import { 
    Breadcrumb, 
    BreadcrumbItem, 
    BreadcrumbLink, 
    BreadcrumbList, 
    BreadcrumbPage, 
    BreadcrumbSeparator 
} from '@/Components/ui/breadcrumb'
import { ChevronLeft, ChevronRight, List, Eye, Home } from 'lucide-react'
import { ChapterReader, ChapterNavigation } from '@/Components/Chapter'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import { useAutoHideNavigation } from '@/hooks/useAutoHideNavigation'

export default function ChapterShow({ manga, chapter, previousChapter, nextChapter, allChapters, pages }) {
    const isNavVisible = useAutoHideNavigation(100)
    useKeyboardNavigation(previousChapter, nextChapter, manga.slug)

    const handleChapterSelect = (chapterId) => {
        if (chapterId && chapterId !== chapter.id.toString()) {
            window.location.href = route('manga.chapters.show', [manga.slug, chapterId])
        }
    }

    return (
        <AppLayout hideHeader={true}>
            <Head title={`${manga.name} - ${chapter.title}`} />
            
            {/* Sticky Navigation */}
            <ChapterNavigation 
                manga={manga}
                chapter={chapter}
                previousChapter={previousChapter}
                nextChapter={nextChapter}
                allChapters={allChapters}
                isNavVisible={isNavVisible}
            />

            {/* Content */}
            <div className="pt-16">
                {/* Chapter Header */}
                <div className="bg-muted/30 py-6">
                    <div className="container mx-auto px-4">
                        <Breadcrumb className="mb-4">
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link href="/">Trang chủ</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link href="/manga">Manga</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link href={route('manga.show', manga.slug)}>{manga.name}</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{chapter.title}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">{chapter.title}</h1>
                                <p className="text-muted-foreground mt-1">
                                    Chapter {chapter.chapter_number} • {pages.length} trang
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Eye className="h-4 w-4" />
                                {chapter.views.toLocaleString()} lượt xem
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pages Reader */}
                <ChapterReader pages={pages} />

                {/* Bottom Navigation */}
                <div className="bg-muted/30 py-8">
                    <div className="container mx-auto px-4">
                        <Card className="p-6">
                            <div className="flex flex-col gap-4">
                                <div className="text-center">
                                    <h3 className="font-semibold text-lg">{chapter.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Đã đọc xong {pages.length} trang
                                    </p>
                                </div>
                                
                                {/* Desktop Navigation */}
                                <div className="hidden md:flex items-center justify-center gap-4">
                                    <Button variant="outline" asChild>
                                        <Link href="/">
                                            <Home className="h-4 w-4 mr-2" />
                                            Trang chủ
                                        </Link>
                                    </Button>
                                    
                                    <Button variant="outline" asChild>
                                        <Link href={route('manga.show', manga.slug)}>
                                            <List className="h-4 w-4 mr-2" />
                                            Danh sách chương
                                        </Link>
                                    </Button>
                                    
                                    <Button 
                                        variant="outline" 
                                        disabled={!previousChapter}
                                        asChild={previousChapter}
                                    >
                                        {previousChapter ? (
                                            <Link href={route('manga.chapters.show', [manga.slug, previousChapter.id])}>
                                                <ChevronLeft className="h-4 w-4 mr-2" />
                                                Chương trước
                                            </Link>
                                        ) : (
                                            <>
                                                <ChevronLeft className="h-4 w-4 mr-2" />
                                                Chương trước
                                            </>
                                        )}
                                    </Button>
                                    
                                    <Select value={chapter.id.toString()} onValueChange={handleChapterSelect}>
                                        <SelectTrigger className="w-[250px]">
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
                                        disabled={!nextChapter}
                                        asChild={nextChapter}
                                    >
                                        {nextChapter ? (
                                            <Link href={route('manga.chapters.show', [manga.slug, nextChapter.id])}>
                                                Chương tiếp
                                                <ChevronRight className="h-4 w-4 ml-2" />
                                            </Link>
                                        ) : (
                                            <>
                                                Chương tiếp
                                                <ChevronRight className="h-4 w-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                                
                                {/* Mobile Navigation */}
                                <div className="md:hidden space-y-3">
                                    {/* Top Row: Home and List */}
                                    <div className="flex items-center justify-center gap-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href="/">
                                                <Home className="h-4 w-4 mr-2" />
                                                Trang chủ
                                            </Link>
                                        </Button>
                                        
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={route('manga.show', manga.slug)}>
                                                <List className="h-4 w-4 mr-2" />
                                                Danh sách
                                            </Link>
                                        </Button>
                                    </div>
                                    
                                    {/* Chapter Select */}
                                    <div className="flex justify-center">
                                        <Select value={chapter.id.toString()} onValueChange={handleChapterSelect}>
                                            <SelectTrigger className="w-full max-w-xs">
                                                <SelectValue placeholder="Chọn chương" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allChapters.map((chap) => (
                                                    <SelectItem key={chap.id} value={chap.id.toString()}>
                                                        Ch.{chap.chapter_number}: {chap.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    {/* Bottom Row: Prev/Next */}
                                    <div className="flex items-center justify-center gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            disabled={!previousChapter}
                                            asChild={previousChapter}
                                            className="flex-1"
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
                                        
                                        <Button 
                                            size="sm"
                                            disabled={!nextChapter}
                                            asChild={nextChapter}
                                            className="flex-1"
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
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    )
} 