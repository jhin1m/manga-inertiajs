import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select'
import { Search, Trash2, Book, X } from 'lucide-react'
import { useBookmarks } from '@/hooks/useBookmarks'
import { MangaList } from '@/Components/Manga/MangaList'

/**
 * Simplified bookmark list component using MangaList
 */
export default function BookmarkList({ translations = {} }) {
    const { bookmarks, clearBookmarks, isLoading } = useBookmarks()
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState('newest')

    // Convert bookmarks to manga format and filter/sort
    const processedMangas = useMemo(() => {
        let mangaList = bookmarks.manga || []
        
        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            mangaList = mangaList.filter(manga =>
                manga.name.toLowerCase().includes(query)
            )
        }

        // Sort
        const sortFunctions = {
            newest: (a, b) => b.bookmarkedAt - a.bookmarkedAt,
            oldest: (a, b) => a.bookmarkedAt - b.bookmarkedAt,
            name: (a, b) => a.name.localeCompare(b.name),
            name_desc: (a, b) => b.name.localeCompare(a.name)
        }

        const sortFunction = sortFunctions[sortBy] || sortFunctions.newest
        return [...mangaList].sort(sortFunction)
    }, [bookmarks.manga, searchQuery, sortBy])

    const handleClearBookmarks = () => {
        if (window.confirm(translations.confirm_clear_bookmarks || 'Are you sure you want to clear all bookmarks?')) {
            clearBookmarks()
        }
    }

    const totalBookmarks = bookmarks.manga?.length || 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                            <Book className="h-5 w-5" />
                            {translations.bookmarks || 'Bookmarks'} ({totalBookmarks})
                        </CardTitle>
                        {totalBookmarks > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearBookmarks}
                                className="text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {translations.clear_all || 'Clear All'}
                            </Button>
                        )}
                    </div>
                </CardHeader>
                
                {totalBookmarks > 0 && (
                    <CardContent className="pt-0">
                        {/* Search and Sort */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={translations.search_bookmarks || 'Search bookmarks...'}
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
                                    <SelectItem value="newest">
                                        {translations.sort_newest || 'Newest First'}
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
            {totalBookmarks === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            {translations.no_bookmarks || 'No bookmarks yet'}
                        </h3>
                        <p className="text-muted-foreground">
                            {translations.no_bookmarks_description || 'Bookmark your favorite manga to find them easily later.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <MangaList
                    mangas={processedMangas}
                    variant="list"
                    isLoading={isLoading}
                    translations={translations}
                    emptyMessage={translations.no_bookmarks}
                />
            )}
        </div>
    )
}