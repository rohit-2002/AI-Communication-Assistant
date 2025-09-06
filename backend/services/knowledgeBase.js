// Knowledge Base Service for RAG (Retrieval-Augmented Generation)
class KnowledgeBaseService {
    constructor() {
        this.knowledgeBase = {
            // Account and Login Issues
            'account_access': {
                keywords: ['login', 'password', 'access', 'account', 'credentials', 'sign in'],
                context: `
                Common account access solutions:
                1. Password reset: Users can reset passwords via the "Forgot Password" link
                2. Account lockout: Accounts are temporarily locked after 5 failed attempts (unlocks after 30 minutes)
                3. Two-factor authentication: If enabled, users need both password and 2FA code
                4. Browser issues: Clear cache/cookies or try incognito mode
                5. Account suspension: Check if account is suspended for policy violations
                
                Escalation: For persistent issues, escalate to technical support team.
                `,
                solutions: [
                    'Try password reset using the "Forgot Password" link',
                    'Clear browser cache and cookies',
                    'Try accessing from an incognito/private browser window',
                    'Check if two-factor authentication is enabled',
                    'Wait 30 minutes if account is temporarily locked'
                ]
            },

            // API and Integration Issues
            'api_integration': {
                keywords: ['api', 'integration', 'webhook', 'authentication', 'oauth', 'token', 'endpoint'],
                context: `
                API Integration Support:
                1. Authentication: Use OAuth 2.0 with client credentials flow
                2. Rate limits: 1000 requests per hour for standard plans, 10000 for enterprise
                3. Webhook setup: Configure webhook URLs in dashboard settings
                4. API documentation: Available at https://docs.example.com/api
                5. Test environment: Use sandbox.example.com for testing
                
                Common issues:
                - Invalid API keys: Regenerate in dashboard
                - Rate limiting: Implement exponential backoff
                - Webhook failures: Check endpoint accessibility and SSL certificates
                `,
                solutions: [
                    'Verify API key is correct and active',
                    'Check rate limiting and implement proper backoff',
                    'Ensure webhook endpoints are accessible and use HTTPS',
                    'Review API documentation for correct request format',
                    'Test in sandbox environment first'
                ]
            },

            // Billing and Subscription
            'billing_subscription': {
                keywords: ['billing', 'payment', 'subscription', 'invoice', 'charge', 'plan', 'upgrade'],
                context: `
                Billing and Subscription Information:
                1. Billing cycles: Monthly or annual billing available
                2. Payment methods: Credit cards, PayPal, bank transfer (enterprise)
                3. Plan changes: Upgrades take effect immediately, downgrades at next billing cycle
                4. Refunds: Available within 30 days for annual plans
                5. Invoice access: Available in account dashboard under "Billing"
                
                Plan features:
                - Basic: 1000 API calls/month, email support
                - Pro: 10000 API calls/month, priority support, webhooks
                - Enterprise: Unlimited calls, dedicated support, SLA
                `,
                solutions: [
                    'Check billing section in account dashboard',
                    'Update payment method if card expired',
                    'Contact billing team for refund requests',
                    'Review plan features and upgrade if needed',
                    'Download invoices from dashboard for accounting'
                ]
            },

            // Technical Issues
            'technical_issues': {
                keywords: ['error', 'bug', 'broken', 'not working', 'issue', 'problem', 'down', 'outage'],
                context: `
                Technical Issue Resolution:
                1. System status: Check status.example.com for known issues
                2. Error codes: Reference error code documentation
                3. Logs: Enable debug logging for detailed error information
                4. Browser compatibility: Supports Chrome 90+, Firefox 88+, Safari 14+
                5. Mobile apps: Available for iOS 14+ and Android 10+
                
                Troubleshooting steps:
                - Check system status page
                - Review error logs and codes
                - Test with different browsers/devices
                - Clear application cache
                - Try basic connectivity tests
                `,
                solutions: [
                    'Check system status page for known issues',
                    'Clear browser cache and application data',
                    'Try accessing from different browser or device',
                    'Review error logs for specific error codes',
                    'Test basic connectivity and DNS resolution'
                ]
            },

            // General Support
            'general_support': {
                keywords: ['help', 'support', 'question', 'how to', 'guide', 'tutorial'],
                context: `
                General Support Resources:
                1. Documentation: Comprehensive guides at docs.example.com
                2. Video tutorials: Available on our YouTube channel
                3. Community forum: Connect with other users at community.example.com
                4. Support hours: Monday-Friday 9AM-6PM EST
                5. Response times: 24 hours standard, 4 hours priority, 1 hour enterprise
                
                Self-service options:
                - Knowledge base with 500+ articles
                - Interactive tutorials and walkthroughs
                - FAQ section covering common questions
                - Community-driven solutions and tips
                `,
                solutions: [
                    'Check our comprehensive documentation',
                    'Watch video tutorials for step-by-step guidance',
                    'Search the knowledge base for similar issues',
                    'Join our community forum for peer support',
                    'Contact support team for personalized assistance'
                ]
            }
        };
    }

    // Find relevant knowledge based on email content
    findRelevantKnowledge(subject, body) {
        const text = (subject + ' ' + body).toLowerCase();
        const relevantKnowledge = [];

        for (const [category, knowledge] of Object.entries(this.knowledgeBase)) {
            const matchScore = knowledge.keywords.reduce((score, keyword) => {
                const regex = new RegExp(keyword, 'gi');
                const matches = text.match(regex);
                return score + (matches ? matches.length : 0);
            }, 0);

            if (matchScore > 0) {
                relevantKnowledge.push({
                    category,
                    matchScore,
                    ...knowledge
                });
            }
        }

        // Sort by relevance (match score)
        return relevantKnowledge.sort((a, b) => b.matchScore - a.matchScore);
    }

    // Get context for AI response generation
    getContextForAI(subject, body) {
        const relevantKnowledge = this.findRelevantKnowledge(subject, body);

        if (relevantKnowledge.length === 0) {
            return this.knowledgeBase.general_support.context;
        }

        // Return the most relevant knowledge context
        const primaryKnowledge = relevantKnowledge[0];
        let context = primaryKnowledge.context;

        // Add solutions if available
        if (primaryKnowledge.solutions && primaryKnowledge.solutions.length > 0) {
            context += '\n\nSuggested solutions:\n';
            primaryKnowledge.solutions.forEach((solution, index) => {
                context += `${index + 1}. ${solution}\n`;
            });
        }

        return context;
    }

    // Get suggested solutions
    getSuggestedSolutions(subject, body) {
        const relevantKnowledge = this.findRelevantKnowledge(subject, body);

        if (relevantKnowledge.length === 0) {
            return this.knowledgeBase.general_support.solutions;
        }

        return relevantKnowledge[0].solutions || [];
    }

    // Add new knowledge to the base
    addKnowledge(category, keywords, context, solutions = []) {
        this.knowledgeBase[category] = {
            keywords,
            context,
            solutions
        };
    }

    // Update existing knowledge
    updateKnowledge(category, updates) {
        if (this.knowledgeBase[category]) {
            this.knowledgeBase[category] = {
                ...this.knowledgeBase[category],
                ...updates
            };
        }
    }

    // Get all categories
    getCategories() {
        return Object.keys(this.knowledgeBase);
    }

    // Search knowledge base
    searchKnowledge(query) {
        const results = [];
        const queryLower = query.toLowerCase();

        for (const [category, knowledge] of Object.entries(this.knowledgeBase)) {
            const contextMatch = knowledge.context.toLowerCase().includes(queryLower);
            const keywordMatch = knowledge.keywords.some(keyword =>
                keyword.toLowerCase().includes(queryLower) ||
                queryLower.includes(keyword.toLowerCase())
            );

            if (contextMatch || keywordMatch) {
                results.push({
                    category,
                    ...knowledge,
                    relevance: contextMatch ? 2 : 1
                });
            }
        }

        return results.sort((a, b) => b.relevance - a.relevance);
    }
}

export default new KnowledgeBaseService();