import React from 'react';
import MangaCard from './MangaCard';

export default function MangaList({ 
    mangas = [], 
    variant = 'grid',
    columns = 'auto',
    className = '',
    showEmpty = true,
    emptyMessage = 'Không có manga nào để hiển thị'
}) {
    if (!mangas.length && showEmpty) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có manga</h3>
                <p className="text-gray-500 max-w-sm">{emptyMessage}</p>
            </div>
        );
    }

    // Grid columns configuration
    const getGridColumns = () => {
        if (columns !== 'auto') return columns;
        
        // Default responsive grid
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
    };

    const getListVariant = () => {
        switch (variant) {
            case 'list':
                return 'grid grid-cols-1 gap-4';
            case 'compact':
                return `grid ${getGridColumns()} gap-3`;
            case 'featured':
                return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
            default:
                return `grid ${getGridColumns()} gap-4`;
        }
    };

    return (
        <div className={`${getListVariant()} ${className}`}>
            {mangas.map((manga) => (
                <MangaCard
                    key={manga.id}
                    manga={manga}
                    variant={variant}
                    className={variant === 'featured' ? 'h-full' : ''}
                />
            ))}
        </div>
    );
} 