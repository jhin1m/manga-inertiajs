/**
 * localStorage utilities for bookmark and history management
 */

const STORAGE_KEYS = {
    BOOKMARKS: 'manga_bookmarks',
    HISTORY: 'manga_history'
}

const STORAGE_VERSION = '1.0'

/**
 * Check if we're in a browser environment
 */
const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

/**
 * Safe localStorage access with SSR compatibility and error handling
 */
const safeLocalStorage = {
    getItem(key) {
        if (!isBrowser) {
            return null
        }
        try {
            return localStorage.getItem(key)
        } catch (error) {
            console.warn('localStorage getItem failed:', error)
            return null
        }
    },
    
    setItem(key, value) {
        if (!isBrowser) {
            return false
        }
        try {
            localStorage.setItem(key, value)
            return true
        } catch (error) {
            console.warn('localStorage setItem failed:', error)
            return false
        }
    },
    
    removeItem(key) {
        if (!isBrowser) {
            return false
        }
        try {
            localStorage.removeItem(key)
            return true
        } catch (error) {
            console.warn('localStorage removeItem failed:', error)
            return false
        }
    }
}

/**
 * Initialize storage with default structure
 */
function initializeStorage(key, defaultValue) {
    const existing = safeLocalStorage.getItem(key)
    if (!existing) {
        safeLocalStorage.setItem(key, JSON.stringify({
            version: STORAGE_VERSION,
            data: defaultValue,
            lastUpdated: Date.now()
        }))
    }
    return getStorageData(key)
}

/**
 * Get data from storage with validation
 */
function getStorageData(key) {
    try {
        const stored = safeLocalStorage.getItem(key)
        if (!stored) return null
        
        const parsed = JSON.parse(stored)
        
        // Validate structure
        if (!parsed.version || !parsed.data || !parsed.lastUpdated) {
            console.warn(`Invalid storage structure for ${key}`)
            return null
        }
        
        return parsed.data
    } catch (error) {
        console.warn(`Failed to parse storage data for ${key}:`, error)
        return null
    }
}

/**
 * Save data to storage
 */
function setStorageData(key, data) {
    return safeLocalStorage.setItem(key, JSON.stringify({
        version: STORAGE_VERSION,
        data,
        lastUpdated: Date.now()
    }))
}

/**
 * Bookmark Management
 */
export const bookmarkStorage = {
    /**
     * Get all bookmarks (manga only)
     */
    getBookmarks() {
        return initializeStorage(STORAGE_KEYS.BOOKMARKS, {
            manga: []
        })
    },

    /**
     * Add manga bookmark
     */
    addMangaBookmark(manga) {
        const bookmarks = this.getBookmarks()
        const bookmark = {
            id: manga.id,
            name: manga.name,
            slug: manga.slug,
            cover: manga.cover,
            status: manga.status,
            views: manga.views || 0,
            rating: manga.rating || 0,
            bookmarkedAt: Date.now(),
            type: 'manga',
            // Add recent chapters if available
            recent_chapters: manga.recent_chapters || manga.chapters?.slice(0, 3)?.map(chapter => ({
                chapter_number: chapter.chapter_number,
                title: chapter.title,
                slug: chapter.slug,
                updated_at: chapter.updated_at,
                created_at: chapter.created_at
            })) || []
        }
        
        // Remove existing bookmark if it exists
        bookmarks.manga = bookmarks.manga.filter(b => b.id !== manga.id)
        bookmarks.manga.unshift(bookmark)
        
        return setStorageData(STORAGE_KEYS.BOOKMARKS, bookmarks)
    },


    /**
     * Remove manga bookmark
     */
    removeMangaBookmark(mangaId) {
        const bookmarks = this.getBookmarks()
        bookmarks.manga = bookmarks.manga.filter(b => b.id !== mangaId)
        return setStorageData(STORAGE_KEYS.BOOKMARKS, bookmarks)
    },

    /**
     * Check if manga is bookmarked
     */
    isMangaBookmarked(mangaId) {
        const bookmarks = this.getBookmarks()
        return bookmarks?.manga?.some(b => b.id === mangaId) || false
    },

    /**
     * Get bookmarks count
     */
    getBookmarksCount() {
        const bookmarks = this.getBookmarks()
        return {
            manga: bookmarks?.manga?.length || 0,
            total: bookmarks?.manga?.length || 0
        }
    },

    /**
     * Clear all bookmarks
     */
    clearBookmarks() {
        return setStorageData(STORAGE_KEYS.BOOKMARKS, {
            manga: []
        })
    }
}

/**
 * History Management
 */
export const historyStorage = {
    /**
     * Get reading history
     */
    getHistory() {
        return initializeStorage(STORAGE_KEYS.HISTORY, {
            chapters: []
        })
    },

    /**
     * Add chapter to history (simplified - no progress tracking)
     */
    addToHistory(chapter, manga) {
        const history = this.getHistory()
        const historyItem = {
            id: chapter.id,
            mangaId: manga.id,
            mangaName: manga.name,
            mangaSlug: manga.slug,
            title: chapter.title,
            slug: chapter.slug,
            chapterNumber: chapter.chapter_number,
            lastReadAt: Date.now(),
            // Add manga metadata for history display
            cover: manga.cover,
            mangaStatus: manga.status,
            mangaViews: manga.views || 0,
            mangaRating: manga.rating || 0,
            recent_chapters: manga.recent_chapters || manga.chapters?.slice(0, 3)?.map(ch => ({
                chapter_number: ch.chapter_number,
                title: ch.title,
                slug: ch.slug,
                updated_at: ch.updated_at,
                created_at: ch.created_at
            })) || []
        }
        
        // Remove existing history item if it exists
        history.chapters = history.chapters.filter(h => h.id !== chapter.id)
        history.chapters.unshift(historyItem)
        
        // Keep only last 1000 items
        if (history.chapters.length > 1000) {
            history.chapters = history.chapters.slice(0, 1000)
        }
        
        return setStorageData(STORAGE_KEYS.HISTORY, history)
    },

    /**
     * Remove item from history
     */
    removeFromHistory(chapterId) {
        const history = this.getHistory()
        history.chapters = history.chapters.filter(h => h.id !== chapterId)
        return setStorageData(STORAGE_KEYS.HISTORY, history)
    },

    /**
     * Get history count
     */
    getHistoryCount() {
        const history = this.getHistory()
        return history?.chapters?.length || 0
    },

    /**
     * Clear all history
     */
    clearHistory() {
        return setStorageData(STORAGE_KEYS.HISTORY, {
            chapters: []
        })
    },

    /**
     * Get recent chapters (last 10)
     */
    getRecentChapters() {
        const history = this.getHistory()
        return history?.chapters?.slice(0, 10) || []
    },

    /**
     * Get reading statistics (simplified)
     */
    getStats() {
        const history = this.getHistory()
        const chapters = history?.chapters || []
        
        const uniqueManga = new Set(chapters.map(c => c.mangaId))
        const totalChapters = chapters.length
        
        return {
            totalManga: uniqueManga.size,
            totalChapters
        }
    }
}

/**
 * Data Export/Import
 */
export const dataManager = {
    /**
     * Export all data
     */
    exportData() {
        const bookmarks = bookmarkStorage.getBookmarks()
        const history = historyStorage.getHistory()
        
        return {
            version: STORAGE_VERSION,
            exportedAt: Date.now(),
            bookmarks,
            history
        }
    },

    /**
     * Import data
     */
    importData(data) {
        try {
            if (!data.version || !data.bookmarks || !data.history) {
                throw new Error('Invalid data format')
            }
            
            setStorageData(STORAGE_KEYS.BOOKMARKS, data.bookmarks)
            setStorageData(STORAGE_KEYS.HISTORY, data.history)
            
            return true
        } catch (error) {
            console.error('Failed to import data:', error)
            return false
        }
    },

    /**
     * Download data as JSON file
     */
    downloadData() {
        const data = this.exportData()
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        })
        
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `manga-data-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    },

    /**
     * Clear all data
     */
    clearAllData() {
        bookmarkStorage.clearBookmarks()
        historyStorage.clearHistory()
        return true
    }
}

export default {
    bookmarkStorage,
    historyStorage,
    dataManager
}