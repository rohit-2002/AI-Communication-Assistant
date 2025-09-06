// Utility helper functions

import { format, formatDistanceToNow, isValid } from 'date-fns';
import { EMAIL_STATUS, EMAIL_PRIORITY, EMAIL_SENTIMENT, DATE_FORMATS } from './constants';

/**
 * Format date for display
 */
export const formatDate = (date, formatType = 'DISPLAY') => {
    if (!date) return 'N/A';

    const dateObj = new Date(date);
    if (!isValid(dateObj)) return 'Invalid Date';

    const formatString = DATE_FORMATS[formatType] || DATE_FORMATS.DISPLAY;
    return format(dateObj, formatString);
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
    if (!date) return 'Unknown';

    const dateObj = new Date(date);
    if (!isValid(dateObj)) return 'Invalid Date';

    return formatDistanceToNow(dateObj, { addSuffix: true });
};

/**
 * Get CSS classes for email status
 */
export const getStatusClasses = (status) => {
    const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';

    switch (status) {
        case EMAIL_STATUS.PENDING:
            return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`;
        case EMAIL_STATUS.RESPONDED:
            return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`;
        case EMAIL_STATUS.RESOLVED:
            return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
        default:
            return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`;
    }
};

/**
 * Get CSS classes for email priority
 */
export const getPriorityClasses = (priority) => {
    const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border';

    switch (priority) {
        case EMAIL_PRIORITY.URGENT:
            return `${baseClasses} bg-red-100 text-red-800 border-red-200`;
        case EMAIL_PRIORITY.NORMAL:
            return `${baseClasses} bg-blue-100 text-blue-800 border-blue-200`;
        default:
            return `${baseClasses} bg-gray-100 text-gray-800 border-gray-200`;
    }
};

/**
 * Get CSS classes for email sentiment
 */
export const getSentimentClasses = (sentiment) => {
    const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';

    switch (sentiment) {
        case EMAIL_SENTIMENT.POSITIVE:
            return `${baseClasses} bg-green-100 text-green-800`;
        case EMAIL_SENTIMENT.NEGATIVE:
            return `${baseClasses} bg-red-100 text-red-800`;
        case EMAIL_SENTIMENT.NEUTRAL:
            return `${baseClasses} bg-gray-100 text-gray-800`;
        default:
            return `${baseClasses} bg-gray-100 text-gray-800`;
    }
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Extract email address from "Name <email@domain.com>" format
 */
export const extractEmail = (emailString) => {
    if (!emailString) return '';

    const emailMatch = emailString.match(/<(.+?)>/);
    return emailMatch ? emailMatch[1] : emailString;
};

/**
 * Get initials from email address
 */
export const getInitials = (email) => {
    if (!email) return '?';

    const cleanEmail = extractEmail(email);
    const parts = cleanEmail.split('@')[0].split('.');

    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return cleanEmail.substring(0, 2).toUpperCase();
};

/**
 * Validate email address
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
    if (typeof num !== 'number') return '0';
    return num.toLocaleString();
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
    if (!obj) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
};

/**
 * Generate random ID
 */
export const generateId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Sort array by multiple criteria
 */
export const multiSort = (array, sortBy) => {
    return array.sort((a, b) => {
        for (const { key, direction = 'asc' } of sortBy) {
            const aVal = a[key];
            const bVal = b[key];

            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        }
        return 0;
    });
};

/**
 * Group array by key
 */
export const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
        const group = item[key];
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
    }, {});
};

/**
 * Filter array by multiple criteria
 */
export const multiFilter = (array, filters) => {
    return array.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
            if (!value || value === '') return true;
            return item[key] === value;
        });
    });
};

/**
 * Search array by text
 */
export const searchArray = (array, searchTerm, searchFields) => {
    if (!searchTerm) return array;

    const term = searchTerm.toLowerCase();

    return array.filter(item => {
        return searchFields.some(field => {
            const value = item[field];
            return value && value.toString().toLowerCase().includes(term);
        });
    });
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
    }
};

/**
 * Download data as JSON file
 */
export const downloadJSON = (data, filename = 'data.json') => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Get color for chart based on index
 */
export const getChartColor = (index) => {
    const colors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
        '#6366F1', '#8B5CF6', '#EC4899', '#06B6D4'
    ];
    return colors[index % colors.length];
};

/**
 * Format bytes to human readable format
 */
export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};