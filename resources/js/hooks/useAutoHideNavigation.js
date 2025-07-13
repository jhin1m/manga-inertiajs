import { useState, useEffect } from 'react'

export function useAutoHideNavigation(threshold = 100) {
    const [isNavVisible, setIsNavVisible] = useState(false) // Start hidden
    const [lastScrollY, setLastScrollY] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            
            // Get chapter header and reader elements
            const chapterHeader = document.querySelector('.bg-muted\\/30')
            const chapterReader = document.querySelector('.max-w-4xl.mx-auto.py-8')
            
            let shouldShowNav = true
            
            if (chapterHeader && chapterReader) {
                const headerRect = chapterHeader.getBoundingClientRect()
                const readerRect = chapterReader.getBoundingClientRect()
                
                // Hide navigation by default when at top, show when scrolling down to reader area
                if (currentScrollY < threshold) {
                    shouldShowNav = false // Hide at top of page
                } else if (readerRect.top <= 100) {
                    shouldShowNav = true // Show when reader is visible
                } else if (headerRect.bottom < 0 && readerRect.top > 100) {
                    shouldShowNav = false // Hide between header and reader
                } else {
                    // Fallback to scroll direction based behavior
                    shouldShowNav = !(currentScrollY > lastScrollY && currentScrollY > threshold)
                }
            } else {
                // Fallback: Hide at top, show when scrolling down
                if (currentScrollY < threshold) {
                    shouldShowNav = false
                } else {
                    shouldShowNav = !(currentScrollY > lastScrollY && currentScrollY > threshold)
                }
            }
            
            setIsNavVisible(shouldShowNav)
            setLastScrollY(currentScrollY)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [lastScrollY, threshold])

    return isNavVisible
} 