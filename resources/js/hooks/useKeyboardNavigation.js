import { useEffect } from 'react'

export function useKeyboardNavigation(previousChapter, nextChapter, mangaSlug) {
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Ignore if user is typing in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return
            }

            switch (e.key) {
                case 'ArrowLeft':
                case 'h':
                    if (previousChapter) {
                        window.location.href = route('manga.chapters.show', [mangaSlug, previousChapter.id])
                    }
                    break
                case 'ArrowRight':
                case 'l':
                    if (nextChapter) {
                        window.location.href = route('manga.chapters.show', [mangaSlug, nextChapter.id])
                    }
                    break
                case 'Escape':
                    window.location.href = route('manga.show', mangaSlug)
                    break
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [previousChapter, nextChapter, mangaSlug])
} 