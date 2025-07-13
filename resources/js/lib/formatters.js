import { formatDistanceStrict } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { usePage } from '@inertiajs/react';

/**
 * Format large numbers to readable format (1.2M, 1.5K, etc.)
 * @param {number} number - The number to format
 * @returns {string} Formatted string
 */
export const formatViews = (number) => {
    if (number === null || number === undefined || isNaN(number)) {
        return '0';
    }
    
    const num = Number(number);
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
};

/**
 * Format rating to display with star
 * @param {number} rating - Rating value
 * @returns {string} Formatted rating
 */
export const formatRating = (rating) => {
    if (rating === null || rating === undefined || isNaN(rating)) {
        return '0.0';
    }
    return Number(rating).toFixed(1);
};

// Map locale from Laravel to date-fns locale
const locales = {
    vi,
    en: enUS,
};

/**
 * Format date to relative time (e.g., 1 minute ago, 2 giờ trước)
 * using the app's current locale.
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
    const { props } = usePage();
    const locale = props.locale || 'en'; // Default to 'en' if not available

    const targetDate = new Date(date);
    const now = new Date();

    // Check for invalid date
    if (isNaN(targetDate.getTime())) {
        return ''; // Or some other default value
    }

    const formatted = formatDistanceStrict(targetDate, now, {
        locale: locales[locale] || enUS,
        addSuffix: false, // We will add suffix manually
    });

    // Manually add suffix based on locale
    if (locale === 'vi') {
        return `${formatted} trước`;
    } else {
        return `${formatted} ago`;
    }
};

// Alias for compatibility
export const formatDistanceToNow = formatRelativeTime;
