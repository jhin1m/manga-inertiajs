import { BookOpen, Image } from 'lucide-react';

/**
 * Utility functions for handling manga cover images
 */

/**
 * Get default cover placeholder component
 * @param {string} size - Size variant: 'small', 'default', 'large', 'xl'
 * @param {string} type - Type of placeholder: 'book', 'image'
 * @returns {JSX.Element} Default cover component
 */
export const getDefaultCover = (size = 'default', type = 'book') => {
    const sizeClasses = {
        small: 'w-8 h-8',
        default: 'w-12 h-12', 
        large: 'w-16 h-16',
        xl: 'w-20 h-20'
    };

    const IconComponent = type === 'image' ? Image : BookOpen;
    
    return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-9">
            <IconComponent className={`${sizeClasses[size]} text-gray-400`} />
        </div>
    );
};

/**
 * Get default cover for different manga contexts
 * @param {string} context - Context: 'card', 'header', 'list', 'ranking'
 * @returns {JSX.Element} Contextual default cover
 */
export const getContextualDefaultCover = (context = 'card') => {
    const contextConfig = {
        card: { size: 'default', type: 'book' },
        header: { size: 'xl', type: 'book' },
        list: { size: 'default', type: 'book' },
        ranking: { size: 'small', type: 'book' },
        comment: { size: 'small', type: 'book' }
    };

    const config = contextConfig[context] || contextConfig.card;
    return getDefaultCover(config.size, config.type);
};

/**
 * Handle image loading errors
 * @param {Event} event - Image error event
 * @param {Function} setImageError - State setter for image error
 */
export const handleImageError = (event, setImageError) => {
    console.warn('Failed to load image:', event.target.src);
    setImageError(true);
};

/**
 * Check if cover URL is valid
 * @param {string} cover - Cover URL
 * @returns {boolean} Whether cover is valid
 */
export const isValidCover = (cover) => {
    return cover && 
           typeof cover === 'string' && 
           cover.trim() !== '' && 
           !cover.includes('/api/placeholder/');
};