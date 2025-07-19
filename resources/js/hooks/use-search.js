import { useState, useCallback, useRef } from 'react';

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function useSearch() {
    const [suggestions, setSuggestions] = useState([]);
    const [popular, setPopular] = useState({ manga: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const abortControllerRef = useRef(null);

    const debouncedFetch = useCallback(
        debounce(async (query) => {
            if (query.length < 2) {
                setSuggestions([]);
                return;
            }

            // Cancel previous request if it exists
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Create new abort controller for this request
            abortControllerRef.current = new AbortController();

            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`, {
                    signal: abortControllerRef.current.signal
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch suggestions');
                }
                
                const data = await response.json();
                setSuggestions(data.suggestions);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err);
                    console.error('Search suggestions error:', err);
                }
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    const fetchPopular = useCallback(async () => {
        try {
            const response = await fetch('/api/search/popular');
            
            if (!response.ok) {
                throw new Error('Failed to fetch popular items');
            }
            
            const data = await response.json();
            setPopular(data);
        } catch (err) {
            setError(err);
            console.error('Popular items error:', err);
            // Set fallback empty data
            setPopular({ manga: [] });
        }
    }, []);

    const clearSuggestions = useCallback(() => {
        setSuggestions([]);
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    return { 
        suggestions, 
        popular, 
        loading, 
        error, 
        debouncedFetch, 
        fetchPopular,
        clearSuggestions
    };
}