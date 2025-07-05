import { Link } from '@inertiajs/react'
import { Button } from '@/Components/ui/button'
import { Card, CardContent } from '@/Components/ui/card'
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/Components/ui/table'
import { 
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/Components/ui/pagination'
import { BookOpen, Calendar, Hash } from 'lucide-react'
import { formatDistanceToNow } from '@/lib/formatters'

export function ChapterList({ manga, chapters }) {
    const renderPagination = () => {
        if (!chapters.links || chapters.links.length <= 3) return null

        return (
            <Pagination className="mt-6">
                <PaginationContent>
                    {chapters.prev_page_url && (
                        <PaginationItem>
                            <PaginationPrevious href={chapters.prev_page_url} />
                        </PaginationItem>
                    )}
                    
                    {chapters.links.slice(1, -1).map((link, index) => (
                        <PaginationItem key={index}>
                            <PaginationLink 
                                href={link.url}
                                isActive={link.active}
                            >
                                {link.label}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    
                    {chapters.next_page_url && (
                        <PaginationItem>
                            <PaginationNext href={chapters.next_page_url} />
                        </PaginationItem>
                    )}
                </PaginationContent>
            </Pagination>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Danh sách chương ({manga.total_chapters || chapters.total})
                </h2>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Chương</TableHead>
                            <TableHead>Tiêu đề</TableHead>
                            <TableHead className="w-[140px]">Ngày cập nhật</TableHead>
                            <TableHead className="w-[100px] text-right">Đọc</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {chapters.data.map(chapter => (
                            <TableRow key={chapter.id} className="hover:bg-muted/50">
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <Hash className="w-4 h-4 text-muted-foreground" />
                                        {chapter.chapter_number}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Link 
                                        href={`/manga/${manga.slug}/chapters/${chapter.id}`}
                                        className="hover:text-primary hover:underline font-medium"
                                    >
                                        {chapter.title || `Chương ${chapter.chapter_number}`}
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
                                        <Link href={`/manga/${manga.slug}/chapters/${chapter.id}`}>
                                            Đọc
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
                {chapters.data.map(chapter => (
                    <Card key={chapter.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Hash className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                        <span className="font-medium text-sm">
                                            Ch.{chapter.chapter_number}
                                        </span>
                                    </div>
                                    <Link 
                                        href={`/manga/${manga.slug}/chapters/${chapter.id}`}
                                        className="block font-medium hover:text-primary hover:underline line-clamp-2"
                                    >
                                        {chapter.title || `Chương ${chapter.chapter_number}`}
                                    </Link>
                                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        {formatDistanceToNow(chapter.published_at || chapter.created_at)}
                                    </div>
                                </div>
                                <Button size="sm" asChild>
                                    <Link href={`/manga/${manga.slug}/chapters/${chapter.id}`}>
                                        <BookOpen className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pagination */}
            {renderPagination()}
        </div>
    )
} 