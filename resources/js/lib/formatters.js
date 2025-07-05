/**
 * Format large numbers to readable format (1.2M, 1.5K, etc.)
 * @param {number} number - The number to format
 * @returns {string} Formatted string
 */
export const formatViews = (number) => {
    if (number >= 1000000) {
        return `${(number / 1000000).toFixed(1)}M`;
    } else if (number >= 1000) {
        return `${(number / 1000).toFixed(1)}K`;
    }
    return number.toString();
};

/**
 * Format rating to display with star
 * @param {number} rating - Rating value
 * @returns {string} Formatted rating
 */
export const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : '0.0';
};

/**
 * Format date to relative time (1 giây trước, 1 phút trước, 1 giờ trước, etc.)
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
    const now = new Date();
    const targetDate = new Date(date);
    const diffInMs = now - targetDate;
    
    // Tính toán các đơn vị thời gian
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30));
    const diffInYears = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 365));
    
    // Xử lý trường hợp trong tương lai hoặc vừa mới
    if (diffInMs < 0) return '1 giây trước';
    if (diffInSeconds < 60) {
        if (diffInSeconds <= 1) return '1 giây trước';
        return `${diffInSeconds} giây trước`;
    }
    
    // Phút
    if (diffInMinutes < 60) {
        return diffInMinutes === 1 ? '1 phút trước' : `${diffInMinutes} phút trước`;
    }
    
    // Giờ
    if (diffInHours < 24) {
        return diffInHours === 1 ? '1 giờ trước' : `${diffInHours} giờ trước`;
    }
    
    // Ngày
    if (diffInDays < 30) {
        return diffInDays === 1 ? '1 ngày trước' : `${diffInDays} ngày trước`;
    }
    
    // Tháng
    if (diffInMonths < 12) {
        return diffInMonths === 1 ? '1 tháng trước' : `${diffInMonths} tháng trước`;
    }
    
    // Năm
    return diffInYears === 1 ? '1 năm trước' : `${diffInYears} năm trước`;
};

// Alias for compatibility
export const formatDistanceToNow = formatRelativeTime;

 