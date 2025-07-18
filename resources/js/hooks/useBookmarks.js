import { useState, useEffect, useCallback } from 'react'
import { bookmarkStorage } from '@/lib/localStorage'

/**
 * Hook for managing bookmarks
 */
export function useBookmarks() {
    const [bookmarks, setBookmarks] = useState({
        manga: []
    })
    const [isLoading, setIsLoading] = useState(true)

    // Load bookmarks from localStorage (client-side only)
    const loadBookmarks = useCallback(() => {
        if (typeof window === 'undefined') {
            setBookmarks({ manga: [] })
            setIsLoading(false)
            return
        }
        
        setIsLoading(true)
        try {
            const data = bookmarkStorage.getBookmarks()
            setBookmarks(data || { manga: [] })
        } catch (error) {
            console.error('Failed to load bookmarks:', error)
            setBookmarks({ manga: [] })
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Initialize bookmarks on mount (client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            loadBookmarks()
        }
    }, [loadBookmarks])

    // Add manga bookmark
    const addMangaBookmark = useCallback((manga) => {
        if (typeof window === 'undefined') {
            return false
        }
        
        try {
            const success = bookmarkStorage.addMangaBookmark(manga)
            if (success) {
                loadBookmarks() // Reload to get updated data
                return true
            }
        } catch (error) {
            console.error('Failed to add manga bookmark:', error)
        }
        return false
    }, [loadBookmarks])

    // Remove manga bookmark
    const removeMangaBookmark = useCallback((mangaId) => {
        if (typeof window === 'undefined') {
            return false
        }
        
        try {
            const success = bookmarkStorage.removeMangaBookmark(mangaId)
            if (success) {
                loadBookmarks() // Reload to get updated data
                return true
            }
        } catch (error) {
            console.error('Failed to remove manga bookmark:', error)
        }
        return false
    }, [loadBookmarks])

    // Toggle manga bookmark
    const toggleMangaBookmark = useCallback((manga) => {
        if (typeof window === 'undefined') {
            return false
        }
        
        const isBookmarked = bookmarkStorage.isMangaBookmarked(manga.id)
        if (isBookmarked) {
            return removeMangaBookmark(manga.id)
        } else {
            return addMangaBookmark(manga)
        }
    }, [addMangaBookmark, removeMangaBookmark])

    // Check if manga is bookmarked
    const isMangaBookmarked = useCallback((mangaId) => {
        if (typeof window === 'undefined') {
            return false
        }
        return bookmarkStorage.isMangaBookmarked(mangaId)
    }, [])

    // Get bookmarks count
    const getCount = useCallback(() => {
        if (typeof window === 'undefined') {
            return { manga: 0, total: 0 }
        }
        return bookmarkStorage.getBookmarksCount()
    }, [])

    // Clear all bookmarks
    const clearBookmarks = useCallback(() => {
        if (typeof window === 'undefined') {
            return false
        }
        
        try {
            const success = bookmarkStorage.clearBookmarks()
            if (success) {
                loadBookmarks()
                return true
            }
        } catch (error) {
            console.error('Failed to clear bookmarks:', error)
        }
        return false
    }, [loadBookmarks])

    // Search bookmarks
    const searchBookmarks = useCallback((query) => {
        if (!query.trim()) {
            return bookmarks
        }

        const searchTerm = query.toLowerCase().trim()
        
        return {
            manga: bookmarks.manga.filter(manga => 
                manga.name.toLowerCase().includes(searchTerm)
            )
        }
    }, [bookmarks])

    // Sort bookmarks
    const sortBookmarks = useCallback((sortBy = 'newest') => {
        const sortFunctions = {
            newest: (a, b) => b.bookmarkedAt - a.bookmarkedAt,
            oldest: (a, b) => a.bookmarkedAt - b.bookmarkedAt,
            name: (a, b) => a.name.localeCompare(b.name),
            name_desc: (a, b) => b.name.localeCompare(a.name)
        }

        const sortFunction = sortFunctions[sortBy] || sortFunctions.newest

        return {
            manga: [...bookmarks.manga].sort(sortFunction)
        }
    }, [bookmarks])

    return {
        // State
        bookmarks,
        isLoading,
        
        // Actions
        addMangaBookmark,
        removeMangaBookmark,
        toggleMangaBookmark,
        clearBookmarks,
        
        // Utilities
        isMangaBookmarked,
        getCount,
        searchBookmarks,
        sortBookmarks,
        
        // Refresh
        loadBookmarks
    }
}