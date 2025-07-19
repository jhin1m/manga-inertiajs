import { useState, useEffect, useCallback } from 'react'
import { historyStorage } from '@/lib/localStorage'

/**
 * Hook for managing reading history
 */
export function useHistory() {
    const [history, setHistory] = useState({
        chapters: []
    })
    const [isLoading, setIsLoading] = useState(true)

    // Load history from localStorage
    const loadHistory = useCallback(() => {
        setIsLoading(true)
        try {
            const data = historyStorage.getHistory()
            setHistory(data || { chapters: [] })
        } catch (error) {
            console.error('Failed to load history:', error)
            setHistory({ chapters: [] })
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Initialize history on mount
    useEffect(() => {
        loadHistory()
    }, [loadHistory])

    // Add chapter to history (simplified)
    const addToHistory = useCallback((chapter, manga) => {
        try {
            const success = historyStorage.addToHistory(chapter, manga)
            if (success) {
                loadHistory() // Reload to get updated data
                return true
            }
        } catch (error) {
            console.error('Failed to add to history:', error)
        }
        return false
    }, [loadHistory])

    // Remove from history
    const removeFromHistory = useCallback((chapterId) => {
        try {
            const success = historyStorage.removeFromHistory(chapterId)
            if (success) {
                loadHistory() // Reload to get updated data
                return true
            }
        } catch (error) {
            console.error('Failed to remove from history:', error)
        }
        return false
    }, [loadHistory])

    // Clear all history
    const clearHistory = useCallback(() => {
        try {
            const success = historyStorage.clearHistory()
            if (success) {
                loadHistory()
                return true
            }
        } catch (error) {
            console.error('Failed to clear history:', error)
        }
        return false
    }, [loadHistory])

    // Get recent chapters
    const getRecentChapters = useCallback(() => {
        return historyStorage.getRecentChapters()
    }, [])

    // Get reading statistics
    const getStats = useCallback(() => {
        return historyStorage.getStats()
    }, [])

    // Get history count
    const getCount = useCallback(() => {
        return historyStorage.getHistoryCount()
    }, [])

    // Search history
    const searchHistory = useCallback((query) => {
        if (!query.trim()) {
            return history
        }

        const searchTerm = query.toLowerCase().trim()
        
        return {
            chapters: history.chapters.filter(chapter => 
                chapter.title.toLowerCase().includes(searchTerm) ||
                chapter.mangaName.toLowerCase().includes(searchTerm)
            )
        }
    }, [history])

    // Filter history by date range
    const filterByDateRange = useCallback((startDate, endDate) => {
        const start = startDate ? new Date(startDate).getTime() : 0
        const end = endDate ? new Date(endDate).getTime() : Date.now()
        
        return {
            chapters: history.chapters.filter(chapter => 
                chapter.lastReadAt >= start && chapter.lastReadAt <= end
            )
        }
    }, [history])


    // Sort history
    const sortHistory = useCallback((sortBy = 'recent') => {
        const sortFunctions = {
            recent: (a, b) => b.lastReadAt - a.lastReadAt,
            oldest: (a, b) => a.lastReadAt - b.lastReadAt,
            title: (a, b) => a.title.localeCompare(b.title),
            title_desc: (a, b) => b.title.localeCompare(a.title),
            manga: (a, b) => a.mangaName.localeCompare(b.mangaName),
            manga_desc: (a, b) => b.mangaName.localeCompare(a.mangaName),
            chapter_number: (a, b) => a.chapterNumber - b.chapterNumber,
            chapter_number_desc: (a, b) => b.chapterNumber - a.chapterNumber,
            progress: (a, b) => b.progress - a.progress,
            progress_asc: (a, b) => a.progress - b.progress
        }

        const sortFunction = sortFunctions[sortBy] || sortFunctions.recent

        return {
            chapters: [...history.chapters].sort(sortFunction)
        }
    }, [history])

    // Group history by manga
    const groupByManga = useCallback(() => {
        const grouped = {}
        
        history.chapters.forEach(chapter => {
            if (!grouped[chapter.mangaId]) {
                grouped[chapter.mangaId] = {
                    mangaId: chapter.mangaId,
                    mangaName: chapter.mangaName,
                    mangaSlug: chapter.mangaSlug,
                    chapters: []
                }
            }
            grouped[chapter.mangaId].chapters.push(chapter)
        })

        // Sort chapters within each manga by chapter number
        Object.values(grouped).forEach(manga => {
            manga.chapters.sort((a, b) => a.chapterNumber - b.chapterNumber)
        })

        return grouped
    }, [history])

    // Auto-track chapter reading (to be called from Chapter component)
    const trackChapterReading = useCallback((chapter, manga) => {
        // Only track if we're actually viewing the chapter
        if (typeof window !== 'undefined' && document.visibilityState === 'visible') {
            return addToHistory(chapter, manga)
        }
        return false
    }, [addToHistory])

    return {
        // State
        history,
        isLoading,
        
        // Actions
        addToHistory,
        removeFromHistory,
        clearHistory,
        trackChapterReading,
        
        // Utilities
        getRecentChapters,
        getStats,
        getCount,
        searchHistory,
        filterByDateRange,
        sortHistory,
        groupByManga,
        
        // Refresh
        loadHistory
    }
}