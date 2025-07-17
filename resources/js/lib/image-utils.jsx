export const getDefaultCover = (size = 'default') => {
    const sizeClasses = {
        default: 'w-24 h-12',
        small: 'w-16 h-8',
        xl: 'w-32 h-16',
    };

    return (
        <div className="w-full h-full flex items-center justify-center">
            <img
                src="/logo.svg"
                alt="Default Cover"
                className={sizeClasses[size] || sizeClasses.default}
            />
        </div>
    );
};
export const getContextualDefaultCover = (context = 'card') => {
    const contextConfig = {
        card: { size: 'default' },
        header: { size: 'xl' },
        list: { size: 'default' },
        ranking: { size: 'small' },
        comment: { size: 'small' },
    };

    const config = contextConfig[context] || contextConfig.card;
    return getDefaultCover(config.size);
};
export const handleImageError = (event, setImageError) => {
    console.warn('Failed to load image:', event.target.src);
    setImageError(true);
};
export const isValidCover = (cover) => {
    return (
        cover &&
        typeof cover === 'string' &&
        cover.trim() !== '' &&
        !cover.includes('/api/placeholder/')
    );
};