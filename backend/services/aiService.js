import OpenAI from 'openai';
import Sentiment from 'sentiment';
import natural from 'natural';
import knowledgeBase from './knowledgeBase.js';

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Initialize sentiment analyzer
const sentiment = new Sentiment();

// Initialize natural language processing tools
const { WordTokenizer, PorterStemmer } = natural;
const tokenizer = new WordTokenizer();

class AIService {
    constructor() {
        this.urgentKeywords = [
            'urgent', 'critical', 'immediately', 'asap', 'emergency',
            'cannot access', 'down', 'broken', 'critical issue', 'production down',
            'losing money', 'business impact', 'escalate', 'priority', 'crisis'
        ];

        this.productKeywords = [
            'account', 'subscription', 'billing', 'payment', 'login', 'password',
            'api', 'integration', 'webhook', 'authentication', 'oauth', 'token',
            'database', 'server', 'service', 'platform', 'dashboard', 'analytics'
        ];

        this.positiveWords = [
            'thank', 'thanks', 'grateful', 'appreciate', 'excellent', 'great',
            'outstanding', 'wonderful', 'amazing', 'perfect', 'love', 'happy'
        ];

        this.negativeWords = [
            'problem', 'issue', 'error', 'bug', 'broken', 'failed', 'trouble',
            'frustrated', 'angry', 'disappointed', 'terrible', 'awful', 'hate'
        ];
    }

    // Analyze sentiment using multiple approaches
    async analyzeSentiment(text) {
        try {
            // Use sentiment library for basic analysis
            const result = sentiment.analyze(text);

            // Enhanced analysis with custom keywords
            const words = tokenizer.tokenize(text.toLowerCase());
            let positiveScore = 0;
            let negativeScore = 0;

            words.forEach(word => {
                if (this.positiveWords.includes(word)) positiveScore++;
                if (this.negativeWords.includes(word)) negativeScore++;
            });

            // Combine scores
            const totalScore = result.score + (positiveScore * 2) - (negativeScore * 2);

            if (totalScore > 1) return 'positive';
            if (totalScore < -1) return 'negative';
            return 'neutral';
        } catch (error) {
            console.error('Error analyzing sentiment:', error);
            return 'neutral';
        }
    }

    // Determine email priority based on keywords and context
    determinePriority(subject, body) {
        const text = (subject + ' ' + body).toLowerCase();

        // Check for urgent keywords
        const hasUrgentKeywords = this.urgentKeywords.some(keyword =>
            text.includes(keyword)
        );

        // Check for time-sensitive phrases
        const timeSensitivePatterns = [
            /asap/i,
            /as soon as possible/i,
            /immediately/i,
            /right away/i,
            /urgent/i,
            /critical/i,
            /emergency/i,
            /production.*down/i,
            /cannot.*access/i,
            /system.*down/i
        ];

        const hasTimeSensitive = timeSensitivePatterns.some(pattern =>
            pattern.test(text)
        );

        return (hasUrgentKeywords || hasTimeSensitive) ? 'urgent' : 'normal';
    }

    // Extract key information from email body
    extractInformation(body) {
        const info = {
            phoneNumbers: [],
            emailAddresses: [],
            mentionedProducts: [],
            urgencyIndicators: [],
            customerRequirements: []
        };

        try {
            // Extract phone numbers
            const phonePattern = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
            const phoneMatches = body.match(phonePattern);
            if (phoneMatches) {
                info.phoneNumbers = [...new Set(phoneMatches)];
            }

            // Extract email addresses
            const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
            const emailMatches = body.match(emailPattern);
            if (emailMatches) {
                info.emailAddresses = [...new Set(emailMatches)];
            }

            // Extract mentioned products/services
            const bodyLower = body.toLowerCase();
            info.mentionedProducts = this.productKeywords.filter(keyword =>
                bodyLower.includes(keyword)
            );

            // Extract urgency indicators
            info.urgencyIndicators = this.urgentKeywords.filter(keyword =>
                bodyLower.includes(keyword)
            );

            // Extract customer requirements (simple approach)
            const requirementPatterns = [
                /need to/gi,
                /want to/gi,
                /would like to/gi,
                /can you/gi,
                /please/gi,
                /help me/gi,
                /assist with/gi
            ];

            const sentences = body.split(/[.!?]+/);
            info.customerRequirements = sentences
                .filter(sentence =>
                    requirementPatterns.some(pattern => pattern.test(sentence))
                )
                .map(sentence => sentence.trim())
                .filter(sentence => sentence.length > 10)
                .slice(0, 3); // Limit to top 3 requirements

        } catch (error) {
            console.error('Error extracting information:', error);
        }

        return info;
    }

    // Generate AI response using OpenAI with RAG
    async generateResponse(emailData, customContext = null) {
        try {
            if (!openai) {
                return this.generateFallbackResponse(emailData);
            }

            const { subject, senderEmail, body, sentiment, priority, extractedInfo } = emailData;

            // Get relevant knowledge from knowledge base (RAG)
            const relevantContext = knowledgeBase.getContextForAI(subject, body);
            const suggestedSolutions = knowledgeBase.getSuggestedSolutions(subject, body);

            // Build context for the AI
            const systemPrompt = `You are a professional customer support representative with access to a comprehensive knowledge base. Generate a helpful, empathetic response to customer emails using the provided knowledge base context.

Guidelines:
1. Be professional, friendly, and empathetic
2. Address the customer's specific concerns mentioned in their email
3. If the sentiment is negative, acknowledge their frustration with empathy
4. Use the knowledge base context to provide accurate, helpful information
5. Provide actionable next steps when possible
6. Keep responses concise but comprehensive (150-300 words)
7. Use a warm, helpful tone
8. Include relevant information based on extracted details
9. If urgent, acknowledge the priority and provide timeline expectations
10. Reference specific solutions from the knowledge base when applicable

Knowledge Base Context:
${relevantContext}

Available Solutions:
${suggestedSolutions.map((solution, index) => `${index + 1}. ${solution}`).join('\n')}`;

            const userPrompt = `Please generate a response to this customer email using the knowledge base context provided:

Email Details:
- From: ${senderEmail}
- Subject: ${subject}
- Priority: ${priority}
- Sentiment: ${sentiment}
- Body: ${body}

Extracted Information:
${extractedInfo.phoneNumbers?.length ? `- Phone Numbers: ${extractedInfo.phoneNumbers.join(', ')}` : ''}
${extractedInfo.mentionedProducts?.length ? `- Mentioned Products/Services: ${extractedInfo.mentionedProducts.join(', ')}` : ''}
${extractedInfo.urgencyIndicators?.length ? `- Urgency Indicators: ${extractedInfo.urgencyIndicators.join(', ')}` : ''}
${extractedInfo.customerRequirements?.length ? `- Customer Requirements: ${extractedInfo.customerRequirements.join('; ')}` : ''}

${customContext ? `Additional Context: ${customContext}` : ''}

Generate a professional, helpful response that addresses their concerns using the knowledge base information.`;

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                max_tokens: 500,
                temperature: 0.7,
                presence_penalty: 0.1,
                frequency_penalty: 0.1
            });

            return completion.choices[0].message.content.trim();
        } catch (error) {
            console.error('Error generating AI response:', error);
            return this.generateFallbackResponse(emailData);
        }
    }

    // Generate fallback response when AI is not available
    generateFallbackResponse(emailData) {
        const { sentiment, priority, senderEmail } = emailData;

        let response = `Dear ${senderEmail.split('@')[0]},\n\n`;

        if (sentiment === 'negative') {
            response += "Thank you for reaching out to us, and I sincerely apologize for any inconvenience you've experienced. ";
        } else if (sentiment === 'positive') {
            response += "Thank you so much for your kind words and for taking the time to contact us. ";
        } else {
            response += "Thank you for contacting our support team. ";
        }

        if (priority === 'urgent') {
            response += "I understand this is an urgent matter, and I want to assure you that we're treating it with the highest priority. ";
        }

        response += `We have received your message and our team is reviewing your request carefully. `;

        if (priority === 'urgent') {
            response += "Given the urgent nature of your inquiry, you can expect a detailed response within 2-4 hours. ";
        } else {
            response += "You can expect a detailed response within 24 hours. ";
        }

        response += `If you have any additional information that might help us assist you better, please don't hesitate to reply to this email.\n\n`;
        response += `Best regards,\nCustomer Support Team`;

        return response;
    }

    // Analyze email content for insights
    async analyzeEmailContent(emails) {
        try {
            const analysis = {
                commonIssues: {},
                sentimentTrends: {},
                urgencyPatterns: {},
                productMentions: {}
            };

            emails.forEach(email => {
                // Track common issues
                const words = tokenizer.tokenize(email.body.toLowerCase());
                words.forEach(word => {
                    if (this.negativeWords.includes(word) || this.urgentKeywords.includes(word)) {
                        analysis.commonIssues[word] = (analysis.commonIssues[word] || 0) + 1;
                    }
                });

                // Track sentiment trends
                analysis.sentimentTrends[email.sentiment] = (analysis.sentimentTrends[email.sentiment] || 0) + 1;

                // Track urgency patterns
                analysis.urgencyPatterns[email.priority] = (analysis.urgencyPatterns[email.priority] || 0) + 1;

                // Track product mentions
                if (email.extractedInfo?.mentionedProducts) {
                    email.extractedInfo.mentionedProducts.forEach(product => {
                        analysis.productMentions[product] = (analysis.productMentions[product] || 0) + 1;
                    });
                }
            });

            return analysis;
        } catch (error) {
            console.error('Error analyzing email content:', error);
            return null;
        }
    }

    // Generate summary of email batch
    async generateBatchSummary(emails) {
        try {
            if (!openai || emails.length === 0) {
                return "No emails to summarize or AI service unavailable.";
            }

            const emailSummaries = emails.slice(0, 10).map(email =>
                `Subject: ${email.subject} | Sender: ${email.senderEmail} | Priority: ${email.priority} | Sentiment: ${email.sentiment}`
            ).join('\n');

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are an AI assistant that summarizes customer support email batches. Provide a concise summary highlighting key trends, urgent issues, and overall sentiment."
                    },
                    {
                        role: "user",
                        content: `Please provide a summary of these customer support emails:\n\n${emailSummaries}\n\nFocus on: urgent issues, common themes, sentiment distribution, and any patterns you notice.`
                    }
                ],
                max_tokens: 300,
                temperature: 0.5
            });

            return completion.choices[0].message.content.trim();
        } catch (error) {
            console.error('Error generating batch summary:', error);
            return "Unable to generate summary at this time.";
        }
    }
}

// Export functions for use in other modules
export const analyzeSentiment = (text) => new AIService().analyzeSentiment(text);
export const determinePriority = (subject, body) => new AIService().determinePriority(subject, body);
export const extractInformation = (body) => new AIService().extractInformation(body);
export const generateResponse = (emailData, customContext) => new AIService().generateResponse(emailData, customContext);
export const analyzeEmailContent = (emails) => new AIService().analyzeEmailContent(emails);
export const generateBatchSummary = (emails) => new AIService().generateBatchSummary(emails);

export default new AIService();