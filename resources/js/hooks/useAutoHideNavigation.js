import { useState, useEffect } from 'react'

export function useAutoHideNavigation(threshold = 100) {
    const [isNavVisible, setIsNavVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            
            if (currentScrollY > lastScrollY && currentScrollY > threshold) {
                setIsNavVisible(false)
            } else {
                setIsNavVisible(true)
            }
            
            setLastScrollY(currentScrollY)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [lastScrollY, threshold])

    return isNavVisible
} 