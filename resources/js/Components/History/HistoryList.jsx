import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select'
import { Search, Trash2, History, X, BarChart3 } from 'lucide-react'
import { useHistory } from '@/hooks/useHistory'
import { MangaList } from '@/Components/Manga/MangaList'

/**
 * Simplified history list component using MangaList - By Manga view only
 */
export default function HistoryList({ translations = {} }) {
    const { 
        history, 
        clearHistory, 
        getStats, 
        isLoading 
    } = useHistory()
    
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('recent')

    // Get reading statistics
    const stats = useMemo(() => getStats(), [getStats])

    // Group history by manga and convert to manga format
    const processedMangas = useMemo(() => {
        const grouped = {}
        
        history.chapters.forEach(chapter => {
            if (!grouped[chapter.mangaId]) {
                grouped[chapter.mangaId] = {
                    id: chapter.mangaId,
                    name: chapter.mangaName,
                    slug: chapter.mangaSlug,
                    lastReadAt: chapter.lastReadAt,
                    totalChapters: 0,
                    // Use manga metadata from history
                    cover: chapter.cover,
                    status: chapter.mangaStatus,
                    views: chapter.mangaViews || 0,
                    rating: chapter.mangaRating || 0,
                    recent_chapters: chapter.recent_chapters || []
                }
            }
            
            grouped[chapter.mangaId].totalChapters++
            
            if (chapter.lastReadAt > grouped[chapter.mangaId].lastReadAt) {
                grouped[chapter.mangaId].lastReadAt = chapter.lastReadAt
                // Update with the most recent chapter's manga data
                grouped[chapter.mangaId].cover = chapter.cover || grouped[chapter.mangaId].cover
                grouped[chapter.mangaId].status = chapter.mangaStatus || grouped[chapter.mangaId].status
                grouped[chapter.mangaId].views = chapter.mangaViews || grouped[chapter.mangaId].views
                grouped[chapter.mangaId].rating = chapter.mangaRating || grouped[chapter.mangaId].rating
                grouped[chapter.mangaId].recent_chapters = chapter.recent_chapters || grouped[chapter.mangaId].recent_chapters
            }
        })

        let mangaList = Object.values(grouped)
        
        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            mangaList = mangaList.filter(manga =>
                manga.name.toLowerCase().includes(query)
            )
        }

        // Sort
        const sortFunctions = {
            recent: (a, b) => b.lastReadAt - a.lastReadAt,
            oldest: (a, b) => a.lastReadAt - b.lastReadAt,
            name: (a, b) => a.name.localeCompare(b.name),
            name_desc: (a, b) => b.name.localeCompare(a.name)
        }

        const sortFunction = sortFunctions[sortBy] || sortFunctions.recent
        return mangaList.sort(sortFunction)
    }, [history.chapters, searchQuery, sortBy])

    const handleClearHistory = () => {
        if (window.confirm(translations.confirm_clear_history || 'Are you sure you want to clear all reading history?')) {
            clearHistory()
        }
    }

    const totalHistory = history.chapters.length

    const StatsCard = () => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {translations.reading_stats || 'Reading Statistics'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{stats.totalManga}</div>
                        <div className="text-sm text-muted-foreground">
                            {translations.manga_read || 'Manga Read'}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{stats.totalChapters}</div>
                        <div className="text-sm text-muted-foreground">
                            {translations.total_chapters || 'Total Chapters'}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                        {translations.loading || 'Loading history...'}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            {totalHistory > 0 && <StatsCard />}

            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            {translations.reading_history || 'Reading History'} ({totalHistory})
                        </CardTitle>
                        {totalHistory > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearHistory}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {translations.clear_all || 'Clear All'}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                
                {totalHistory > 0 && (
                    <CardContent className="pt-0">
                        {/* Search and Sort */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={translations.search_history || 'Search history...'}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                                {searchQuery && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="recent">
                                        {translations.sort_recent || 'Most Recent'}
                                    </SelectItem>
                                    <SelectItem value="oldest">
                                        {translations.sort_oldest || 'Oldest First'}
                                    </SelectItem>
                                    <SelectItem value="name">
                                        {translations.sort_name || 'Name A-Z'}
                                    </SelectItem>
                                    <SelectItem value="name_desc">
                                        {translations.sort_name_desc || 'Name Z-A'}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Content */}
            {totalHistory === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            {translations.no_history || 'No reading history yet'}
                        </h3>
                        <p className="text-muted-foreground">
                            {translations.no_history_description || 'Start reading manga to build your reading history.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <MangaList
                    mangas={processedMangas}
                    variant="list"
                    isLoading={isLoading}
                    translations={translations}
                    emptyMessage={translations.no_history}
                />
            )}
        </div>
    )
}