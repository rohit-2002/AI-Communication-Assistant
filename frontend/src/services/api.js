import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for logging
api.interceptors.request.use(
    (config) => {
        console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
    },
    (error) => {
        console.error('❌ API Response Error:', error.response?.data || error.message);

        // Handle specific error cases
        if (error.response?.status === 404) {
            console.warn('Resource not found');
        } else if (error.response?.status === 500) {
            console.error('Server error occurred');
        } else if (error.code === 'ECONNABORTED') {
            console.error('Request timeout');
        }

        return Promise.reject(error);
    }
);

// Email service
export const emailService = {
    // Get all emails with optional filters
    getEmails: (filters = {}) => {
        const params = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== '') {
                params.append(key, value);
            }
        });

        return api.get(`/emails?${params.toString()}`);
    },

    // Get specific email by ID
    getEmail: (id) => {
        return api.get(`/emails/${id}`);
    },

    // Fetch new emails from server
    fetchEmails: () => {
        return api.post('/emails/fetch');
    },

    // Generate AI response for email
    generateResponse: (emailId, customContext = null) => {
        return api.post(`/emails/${emailId}/generate-response`, {
            customContext
        });
    },

    // Update email status
    updateEmailStatus: (emailId, status) => {
        return api.put(`/emails/${emailId}/status`, { status });
    },

    // Get urgent emails
    getUrgentEmails: () => {
        return api.get('/emails/urgent');
    },

    // Get recent emails
    getRecentEmails: (hours = 24) => {
        return api.get(`/emails/recent/${hours}`);
    },

    // Analyze emails for insights
    analyzeEmails: (emailIds = []) => {
        return api.post('/emails/analyze', { emailIds });
    },

    // Bulk update email status
    bulkUpdateStatus: (emailIds, status) => {
        return api.post('/emails/bulk/update-status', {
            emailIds,
            status
        });
    },

    // Delete email (soft delete)
    deleteEmail: (emailId) => {
        return api.delete(`/emails/${emailId}`);
    }
};

// Stats service
export const statsService = {
    // Get comprehensive statistics
    getStats: () => {
        return api.get('/stats');
    },

    // Get overview statistics
    getOverview: () => {
        return api.get('/stats/overview');
    },

    // Get sentiment statistics
    getSentimentStats: () => {
        return api.get('/stats/sentiment');
    },

    // Get priority statistics
    getPriorityStats: () => {
        return api.get('/stats/priority');
    },

    // Get timeline statistics
    getTimelineStats: (period = 'week') => {
        return api.get(`/stats/timeline/${period}`);
    },

    // Get category statistics
    getCategoryStats: () => {
        return api.get('/stats/categories');
    },

    // Get performance metrics
    getPerformanceStats: () => {
        return api.get('/stats/performance');
    },

    // Get top senders
    getTopSenders: (limit = 10) => {
        return api.get(`/stats/top-senders?limit=${limit}`);
    }
};

// AI service
export const aiService = {
    // Analyze sentiment of text
    analyzeSentiment: (text) => {
        return api.post('/ai/analyze-sentiment', { text });
    },

    // Determine email priority
    determinePriority: (subject, body) => {
        return api.post('/ai/determine-priority', { subject, body });
    },

    // Extract information from email body
    extractInfo: (body) => {
        return api.post('/ai/extract-info', { body });
    },

    // Generate AI response
    generateResponse: (emailData, customContext = null) => {
        return api.post('/ai/generate-response', {
            emailData,
            customContext
        });
    },

    // Analyze batch of emails
    analyzeBatch: (emailIds = [], includeContent = false) => {
        return api.post('/ai/analyze-batch', {
            emailIds,
            includeContent
        });
    },

    // Generate summary for emails
    generateSummary: (emailIds, summaryType = 'general') => {
        return api.post('/ai/generate-summary', {
            emailIds,
            summaryType
        });
    },

    // Get AI capabilities
    getCapabilities: () => {
        return api.get('/ai/capabilities');
    },

    // Test AI functionality
    testAI: () => {
        return api.post('/ai/test');
    }
};

// Email sender service
export const emailSenderService = {
    // Send email response
    sendResponse: (emailId, responseText, customSubject = null) => {
        return api.post('/email-sender/send-response', {
            emailId,
            responseText,
            customSubject
        });
    },

    // Auto-respond to urgent emails
    autoRespondUrgent: () => {
        return api.post('/email-sender/auto-respond-urgent');
    },

    // Send bulk responses
    sendBulkResponses: (emailResponses) => {
        return api.post('/email-sender/bulk-send', {
            emailResponses
        });
    },

    // Test email configuration
    testConfig: () => {
        return api.get('/email-sender/test-config');
    },

    // Get queue status
    getQueueStatus: () => {
        return api.get('/email-sender/queue-status');
    },

    // Process urgent emails
    processUrgent: () => {
        return api.post('/email-sender/process-urgent');
    },

    // Get queue items
    getQueueItems: (limit = 50) => {
        return api.get(`/email-sender/queue-items?limit=${limit}`);
    },

    // Force process email
    forceProcess: (emailId) => {
        return api.post('/email-sender/force-process', { emailId });
    }
};

// Knowledge base service
export const knowledgeBaseService = {
    // Search knowledge base
    search: (query) => {
        return api.get(`/knowledge-base/search?query=${encodeURIComponent(query)}`);
    },

    // Get categories
    getCategories: () => {
        return api.get('/knowledge-base/categories');
    },

    // Find relevant knowledge
    findRelevant: (subject, body) => {
        return api.post('/knowledge-base/find-relevant', {
            subject,
            body
        });
    },

    // Add knowledge
    addKnowledge: (category, keywords, context, solutions = []) => {
        return api.post('/knowledge-base/add', {
            category,
            keywords,
            context,
            solutions
        });
    },

    // Update knowledge
    updateKnowledge: (category, updates) => {
        return api.put(`/knowledge-base/update/${category}`, updates);
    },

    // Get category knowledge
    getCategoryKnowledge: (category) => {
        return api.get(`/knowledge-base/category/${category}`);
    },

    // Get all knowledge
    getAllKnowledge: () => {
        return api.get('/knowledge-base/all');
    }
};

// Health check
export const healthService = {
    check: () => {
        return api.get('/health');
    }
};

// Export the main api instance for custom requests
export default api;