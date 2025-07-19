import { useState, useMemo, useEffect } from 'react'
import { safeDecryptImageUrl } from '../../lib/crypto'

export function ChapterReader({ pages }) {
    const [imageStates, setImageStates] = useState({})
    const [isClient, setIsClient] = useState(false)

    // Detect if we're on the client side (not SSR)
    useEffect(() => {
        setIsClient(true)
    }, [])

    // Decrypt image URLs only on client side to avoid SSR issues
    const decryptedPages = useMemo(() => {
        // Check if we're in a browser environment
        const isBrowser = typeof window !== 'undefined'
        
        if (!isBrowser || !isClient) {
            // During SSR or before client hydration, use placeholder URLs
            return pages.map(page => ({
                ...page,
                image_url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', // Transparent 1x1 gif
                image_url_2: null
            }))
        }

        // On client side, decrypt the URLs
        return pages.map(page => ({
            ...page,
            image_url: safeDecryptImageUrl(page.image_url),
            image_url_2: page.image_url_2 ? safeDecryptImageUrl(page.image_url_2) : null
        }))
    }, [pages, isClient])

    const handleImageError = (pageId, page, e) => {
        const currentState = imageStates[pageId] || { failedUrls: [], showPlaceholder: false }
        const failedUrl = e.target.src
        
        if (!currentState.failedUrls.includes(failedUrl)) {
            const newFailedUrls = [...currentState.failedUrls, failedUrl]
            
            // Try alternative URL if available and not already failed
            if (page.image_url_2 && !newFailedUrls.includes(page.image_url_2)) {
                setImageStates(prev => ({
                    ...prev,
                    [pageId]: { ...currentState, failedUrls: newFailedUrls }
                }))
                e.target.src = page.image_url_2
                return
            }
            
            // Show placeholder component if all URLs failed
            setImageStates(prev => ({
                ...prev,
                [pageId]: { ...currentState, failedUrls: newFailedUrls, showPlaceholder: true }
            }))
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div>
                {decryptedPages.map((page, index) => {
                    const pageState = imageStates[page.id] || { showPlaceholder: false }
                    
                    return (
                        <div key={page.id} className="flex justify-center">
                            {pageState.showPlaceholder ? (
                                <div className="w-full max-w-md h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-sm flex flex-col items-center justify-center">
                                    <img src="/default.jpg" alt="Page failed to load" className="w-24 h-24 opacity-50" />
                                    <p className="mt-4 text-sm text-gray-500">
                                        Page {page.page_number}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Failed to load image. Sorry for the inconvenience.
                                    </p>
                                </div>
                            ) : (
                                <img
                                    src={page.image_url}
                                    alt={`Page ${page.page_number}`}
                                    className="max-w-full h-auto shadow-sm"
                                    loading={index < 3 ? 'eager' : 'lazy'}
                                    onError={(e) => handleImageError(page.id, page, e)}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
} 