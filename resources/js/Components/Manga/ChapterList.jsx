import { Link } from '@inertiajs/react'
import { Button } from '@/Components/ui/button'
import { Card, CardContent } from '@/Components/ui/card'
import { Skeleton } from '@/Components/ui/skeleton'
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/Components/ui/table'
import { Paginator } from '@/Components/Common/Paginator'
import { BookOpen, Calendar, Hash, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from '@/lib/formatters'

export function ChapterList({ manga, chapters, translations = {} }) {
    const t = translations.chapter_list || {}
    
    // Helper function to get chapter URL
    const getChapterUrl = (chapter) => route('manga.chapters.show', [manga.slug, chapter.slug])

    // Loading state for deferred props
    if (chapters === undefined) {
        return (
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        {t.title || 'Chapters'} ({manga.total_chapters || 0})
                    </h2>
                </div>

                {/* Loading Skeleton - Desktop */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">{t.chapter_column || 'Ch.'}</TableHead>
                                <TableHead>{t.title_column || 'Chapter'}</TableHead>
                                <TableHead className="w-[140px]">{t.updated_column || 'Updated At'}</TableHead>
                                <TableHead className="w-[100px] text-right">{t.read_column || 'Read'}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 10 }).map((_, index) => (
                                <TableRow key={index}>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Loading Skeleton - Mobile */}
                <div className="md:hidden space-y-3">
                    {Array.from({ length: 10 }).map((_, index) => (
                        <Card key={index}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                    <Skeleton className="h-8 w-12" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Loading indicator */}
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-muted-foreground">...</span>
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {t.title || 'Chapters'} ({manga.total_chapters || chapters?.total || 0})
                </h2>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">{t.chapter_column || 'Ch.'}</TableHead>
                            <TableHead>{t.title_column || 'Chapter'}</TableHead>
                            <TableHead className="w-[140px]">{t.updated_column || 'Updated At'}</TableHead>
                            <TableHead className="w-[100px] text-right">{t.read_column || 'Read'}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {chapters?.data?.map(chapter => (
                            <TableRow key={chapter.id} className="hover:bg-muted/50">
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-muted-foreground" />
                                        {chapter.chapter_number}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Link 
                                        href={getChapterUrl(chapter)}
                                        className="hover:text-primary hover:underline font-medium"
                                    >
                                        {chapter.title || `${t.chapter_prefix || 'Chương'} ${chapter.chapter_number}`}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {formatDistanceToNow(chapter.published_at || chapter.created_at)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" asChild>
                                        <Link href={getChapterUrl(chapter)}>
                                            {t.read_button || 'Đọc'}
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {chapters?.data?.map(chapter => (
                    <Card key={chapter.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Hash className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <span className="font-medium text-sm">
                                            {t.chapter_short || 'Ch.'}{chapter.chapter_number}
                                        </span>
                                    </div>
                                    <Link 
                                        href={getChapterUrl(chapter)}
                                        className="block font-medium hover:text-primary hover:underline line-clamp-2"
                                    >
                                        {chapter.title || `${t.chapter_prefix || 'Chương'} ${chapter.chapter_number}`}
                                    </Link>
                                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        {formatDistanceToNow(chapter.published_at || chapter.created_at)}
                                    </div>
                                </div>
                                <Button size="sm" asChild>
                                    <Link href={getChapterUrl(chapter)}>
                                        <BookOpen className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* No chapters message */}
            {chapters?.data?.length === 0 && (
                <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No chapters yet</h3>
                    <p className="text-muted-foreground">This manga has no chapters released yet.</p>
                </div>
            )}

            {/* Pagination */}
            <Paginator paginator={chapters} translations={translations} preserveScroll />
        </div>
    )
} 