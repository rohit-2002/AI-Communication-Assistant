// Application constants

export const EMAIL_STATUS = {
    PENDING: 'pending',
    RESPONDED: 'responded',
    RESOLVED: 'resolved'
};

export const EMAIL_PRIORITY = {
    URGENT: 'urgent',
    NORMAL: 'normal'
};

export const EMAIL_SENTIMENT = {
    POSITIVE: 'positive',
    NEGATIVE: 'negative',
    NEUTRAL: 'neutral'
};

export const EMAIL_CATEGORY = {
    SUPPORT: 'support',
    QUERY: 'query',
    REQUEST: 'request',
    HELP: 'help'
};

export const CHART_COLORS = {
    PRIMARY: '#3B82F6',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    DANGER: '#EF4444',
    INFO: '#6366F1',
    GRAY: '#6B7280'
};

export const API_ENDPOINTS = {
    EMAILS: '/emails',
    STATS: '/stats',
    AI: '/ai',
    HEALTH: '/health'
};

export const LOCAL_STORAGE_KEYS = {
    FILTERS: 'email_filters',
    VIEW_PREFERENCES: 'view_preferences',
    USER_SETTINGS: 'user_settings'
};

export const PAGINATION = {
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 100
};

export const REFRESH_INTERVALS = {
    DASHBOARD: 30000, // 30 seconds
    EMAIL_LIST: 60000, // 1 minute
    ANALYTICS: 300000 // 5 minutes
};

export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

export const DATE_FORMATS = {
    DISPLAY: 'MMM dd, yyyy',
    FULL: 'PPpp',
    TIME_ONLY: 'HH:mm',
    SHORT: 'MM/dd/yyyy'
};

export const URGENCY_KEYWORDS = [
    'urgent', 'critical', 'immediately', 'asap', 'emergency',
    'cannot access', 'down', 'broken', 'critical issue', 'production down',
    'losing money', 'business impact', 'escalate', 'priority', 'crisis'
];

export const POSITIVE_KEYWORDS = [
    'thank', 'thanks', 'grateful', 'appreciate', 'excellent', 'great',
    'outstanding', 'wonderful', 'amazing', 'perfect', 'love', 'happy'
];

export const NEGATIVE_KEYWORDS = [
    'problem', 'issue', 'error', 'bug', 'broken', 'failed', 'trouble',
    'frustrated', 'angry', 'disappointed', 'terrible', 'awful', 'hate'
];

export const PRODUCT_KEYWORDS = [
    'account', 'subscription', 'billing', 'payment', 'login', 'password',
    'api', 'integration', 'webhook', 'authentication', 'oauth', 'token',
    'database', 'server', 'service', 'platform', 'dashboard', 'analytics'
];

export const DEMO_MODE = {
    ENABLED: !import.meta.env.VITE_ENABLE_REAL_EMAIL,
    SAMPLE_EMAIL_COUNT: 5,
    REFRESH_INTERVAL: 10000 // 10 seconds
};

export const FEATURE_FLAGS = {
    AI_RESPONSES: import.meta.env.VITE_ENABLE_AI_FEATURES !== 'false',
    ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
    REAL_EMAIL: import.meta.env.VITE_ENABLE_REAL_EMAIL === 'true',
    DEBUG: import.meta.env.VITE_DEBUG === 'true'
};