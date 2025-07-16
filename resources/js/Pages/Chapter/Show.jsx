import { Head, Link } from '@inertiajs/react'
import { AppLayout } from '@/Layouts/AppLayout'
import { Button } from '@/Components/ui/button'
import { Card } from '@/Components/ui/card'
import { Skeleton } from '@/Components/ui/skeleton'
import { BreadcrumbBuilder } from '@/Components/Layout/Breadcrumb'
import SeoHead from '@/Components/SeoHead'
import { ChevronLeft, ChevronRight, List, Eye, Home, Loader2 } from 'lucide-react'
import { ChapterReader, ChapterNavigation } from '@/Components/Chapter'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import { useAutoHideNavigation } from '@/hooks/useAutoHideNavigation'

export default function ChapterShow({ manga, chapter, previousChapter, nextChapter, allChapters, pages, seo, translations = {} }) {
    const isNavVisible = useAutoHideNavigation(100)
    useKeyboardNavigation(previousChapter, nextChapter, manga.slug)

    const handleChapterSelect = (e) => {
        const chapterSlug = e.target.value;
        if (chapterSlug && chapterSlug !== chapter.slug && allChapters) {
            window.location.href = route('manga.chapters.show', [manga.slug, chapterSlug]);
        }
    }

    // Component for chapter select - handles both loading and loaded states
    const ChapterSelect = ({ className = "", mobile = false }) => {
        if (allChapters === undefined) {
            return (
                <div className={`flex items-center gap-2 ${className}`}>
                    <Skeleton className="h-10 flex-1" />
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
            );
        }

        return (
            <select 
                value={chapter.slug} 
                onChange={handleChapterSelect}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            >
                {allChapters?.map((chap) => (
                    <option key={chap.id} value={chap.slug}>
                        {mobile 
                            ? `${chap.title}`
                            : `${chap.title}`
                        }
                    </option>
                ))}
            </select>
        );
    }

    // Sử dụng BreadcrumbBuilder để tạo breadcrumb
    const breadcrumbItems = new BreadcrumbBuilder()
        .addMangaList()
        .addManga(manga)
        .addChapter(chapter, manga)
        .build();

    return (
        <AppLayout hideHeader={true} breadcrumbItems={breadcrumbItems}>
            <SeoHead seo={seo} />
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
            <div className="pt-20">
                {/* Chapter Header */}
                <div className="bg-muted/30 py-6">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">{chapter.title}</h1>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Eye className="h-4 w-4" />
                                {chapter.views.toLocaleString()} {translations.views || 'Views'}
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
                                </div>
                                
                                {/* Desktop Navigation */}
                                <div className="hidden md:flex items-center justify-center gap-4">
                                    <Button variant="outline" asChild>
                                        <Link href={route('home')}>
                                            <Home className="h-4 w-4 mr-2" />
                                            {translations.home || 'Home'}
                                        </Link>
                                    </Button>
                                    
                                    <Button variant="outline" asChild>
                                        <Link href={route('manga.show', manga.slug)}>
                                            <List className="h-4 w-4 mr-2" />
                                            {translations.chapter_list || 'Chapter List'}
                                        </Link>
                                    </Button>
                                    
                                    <Button 
                                        variant="outline" 
                                        disabled={!previousChapter}
                                        asChild={previousChapter}
                                    >
                                        {previousChapter ? (
                                            <Link href={route('manga.chapters.show', [manga.slug, previousChapter.slug || previousChapter.chapter_number])}>
                                                <ChevronLeft className="h-4 w-4 mr-2" />
                                                {translations.previous_chapter || 'Previous Chapter'}
                                            </Link>
                                        ) : (
                                            <>
                                                <ChevronLeft className="h-4 w-4 mr-2" />
                                                {translations.previous_chapter || 'Previous Chapter'}
                                            </>
                                        )}
                                    </Button>
                                    
                                    <ChapterSelect className="w-[250px]" />
                                    
                                    <Button 
                                        disabled={!nextChapter}
                                        asChild={nextChapter}
                                    >
                                        {nextChapter ? (
                                            <Link href={route('manga.chapters.show', [manga.slug, nextChapter.slug || nextChapter.chapter_number])}>
                                                {translations.next_chapter || 'Next Chapter'}
                                                <ChevronRight className="h-4 w-4 ml-2" />
                                            </Link>
                                        ) : (
                                            <>
                                                {translations.next_chapter || 'Next Chapter'}
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
                                            <Link href={route('home')}>
                                                <Home className="h-4 w-4 mr-2" />
                                                {translations.home || 'Home'}
                                            </Link>
                                        </Button>
                                        
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={route('manga.show', manga.slug)}>
                                                <List className="h-4 w-4 mr-2" />
                                                {translations.chapter_list || 'Chapter List'}
                                            </Link>
                                        </Button>
                                    </div>
                                    {/* Chapter Select */}
                                    <ChapterSelect mobile={true} />
                                    
                                    {/* Navigation Buttons */}
                                    <div className="flex items-center justify-center gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            disabled={!previousChapter}
                                            asChild={previousChapter}
                                            className="flex-1"
                                        >
                                            {previousChapter ? (
                                                <Link href={route('manga.chapters.show', [manga.slug, previousChapter.slug || previousChapter.chapter_number])}>
                                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                                    {translations.previous_chapter || 'Previous'}
                                                </Link>
                                            ) : (
                                                <>
                                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                                    {translations.previous_chapter || 'Previous'}
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
                                                <Link href={route('manga.chapters.show', [manga.slug, nextChapter.slug || nextChapter.chapter_number])}>
                                                    {translations.next_chapter || 'Next'}
                                                    <ChevronRight className="h-4 w-4 ml-2" />
                                                </Link>
                                            ) : (
                                                <>
                                                    {translations.next_chapter || 'Next'}
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
    );
} 