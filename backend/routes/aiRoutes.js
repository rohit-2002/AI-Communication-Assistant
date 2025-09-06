import express from 'express';
import aiService from '../services/aiService.js';
import Email from '../models/Email.js';

const router = express.Router();

// POST /api/ai/analyze-sentiment - Analyze sentiment of text
router.post('/analyze-sentiment', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Text is required for sentiment analysis'
            });
        }

        const sentiment = await aiService.analyzeSentiment(text);

        res.json({
            success: true,
            data: {
                text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
                sentiment: sentiment
            }
        });
    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze sentiment',
            message: error.message
        });
    }
});

// POST /api/ai/determine-priority - Determine email priority
router.post('/determine-priority', async (req, res) => {
    try {
        const { subject, body } = req.body;

        if (!subject || !body) {
            return res.status(400).json({
                success: false,
                error: 'Subject and body are required for priority determination'
            });
        }

        const priority = aiService.determinePriority(subject, body);

        res.json({
            success: true,
            data: {
                subject,
                priority
            }
        });
    } catch (error) {
        console.error('Error determining priority:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to determine priority',
            message: error.message
        });
    }
});

// POST /api/ai/extract-info - Extract information from email body
router.post('/extract-info', async (req, res) => {
    try {
        const { body } = req.body;

        if (!body) {
            return res.status(400).json({
                success: false,
                error: 'Email body is required for information extraction'
            });
        }

        const extractedInfo = aiService.extractInformation(body);

        res.json({
            success: true,
            data: extractedInfo
        });
    } catch (error) {
        console.error('Error extracting information:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to extract information',
            message: error.message
        });
    }
});

// POST /api/ai/generate-response - Generate AI response for email data
router.post('/generate-response', async (req, res) => {
    try {
        const { emailData, customContext } = req.body;

        if (!emailData || !emailData.subject || !emailData.body) {
            return res.status(400).json({
                success: false,
                error: 'Email data with subject and body is required'
            });
        }

        const response = await aiService.generateResponse(emailData, customContext);

        res.json({
            success: true,
            data: {
                aiResponse: response,
                emailSubject: emailData.subject,
                customContext: customContext || null
            }
        });
    } catch (error) {
        console.error('Error generating response:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate response',
            message: error.message
        });
    }
});

// POST /api/ai/analyze-batch - Analyze a batch of emails for insights
router.post('/analyze-batch', async (req, res) => {
    try {
        const { emailIds, includeContent = false } = req.body;

        let emails;
        if (emailIds && emailIds.length > 0) {
            emails = await Email.find({ _id: { $in: emailIds } });
        } else {
            // Analyze recent emails if no specific IDs provided
            emails = await Email.find()
                .sort({ receivedDate: -1 })
                .limit(50);
        }

        if (emails.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No emails found for analysis'
            });
        }

        const analysis = await aiService.analyzeEmailContent(emails);
        const summary = await aiService.generateBatchSummary(emails);

        const responseData = {
            analysis,
            summary,
            emailCount: emails.length,
            analyzedAt: new Date().toISOString()
        };

        if (includeContent) {
            responseData.emails = emails.map(email => ({
                id: email._id,
                subject: email.subject,
                sender: email.senderEmail,
                sentiment: email.sentiment,
                priority: email.priority,
                status: email.status
            }));
        }

        res.json({
            success: true,
            data: responseData
        });
    } catch (error) {
        console.error('Error analyzing email batch:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze email batch',
            message: error.message
        });
    }
});

// POST /api/ai/generate-summary - Generate summary for specific emails
router.post('/generate-summary', async (req, res) => {
    try {
        const { emailIds, summaryType = 'general' } = req.body;

        if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Array of email IDs is required'
            });
        }

        const emails = await Email.find({ _id: { $in: emailIds } });

        if (emails.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No emails found with provided IDs'
            });
        }

        const summary = await aiService.generateBatchSummary(emails);

        res.json({
            success: true,
            data: {
                summary,
                summaryType,
                emailCount: emails.length,
                emailIds: emailIds,
                generatedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error generating summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate summary',
            message: error.message
        });
    }
});

// GET /api/ai/capabilities - Get AI service capabilities and status
router.get('/capabilities', async (req, res) => {
    try {
        const capabilities = {
            sentimentAnalysis: true,
            priorityDetection: true,
            informationExtraction: true,
            responseGeneration: !!process.env.OPENAI_API_KEY,
            batchAnalysis: true,
            summaryGeneration: !!process.env.OPENAI_API_KEY,
            openaiConfigured: !!process.env.OPENAI_API_KEY,
            features: {
                urgentKeywordDetection: true,
                productMentionExtraction: true,
                phoneNumberExtraction: true,
                emailAddressExtraction: true,
                customerRequirementExtraction: true,
                contextAwareResponses: !!process.env.OPENAI_API_KEY,
                multiLanguageSupport: false // Could be added later
            }
        };

        res.json({
            success: true,
            data: capabilities
        });
    } catch (error) {
        console.error('Error fetching AI capabilities:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch AI capabilities',
            message: error.message
        });
    }
});

// POST /api/ai/test - Test AI functionality with sample data
router.post('/test', async (req, res) => {
    try {
        const sampleEmail = {
            subject: 'Urgent: Cannot access my account',
            senderEmail: 'test@example.com',
            body: 'Hi, I am having trouble logging into my account. This is urgent as I need to access my billing information immediately. My phone number is 555-123-4567.',
            sentiment: 'negative',
            priority: 'urgent',
            extractedInfo: {}
        };

        // Test all AI functions
        const results = {
            sentimentAnalysis: await aiService.analyzeSentiment(sampleEmail.body),
            priorityDetection: aiService.determinePriority(sampleEmail.subject, sampleEmail.body),
            informationExtraction: aiService.extractInformation(sampleEmail.body),
            responseGeneration: null
        };

        // Test response generation if OpenAI is configured
        if (process.env.OPENAI_API_KEY) {
            try {
                results.responseGeneration = await aiService.generateResponse(sampleEmail);
            } catch (error) {
                results.responseGeneration = `Error: ${error.message}`;
            }
        } else {
            results.responseGeneration = 'OpenAI not configured - using fallback response';
            results.fallbackResponse = aiService.generateFallbackResponse(sampleEmail);
        }

        res.json({
            success: true,
            data: {
                testResults: results,
                sampleEmail: {
                    subject: sampleEmail.subject,
                    body: sampleEmail.body.substring(0, 100) + '...'
                },
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error testing AI functionality:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to test AI functionality',
            message: error.message
        });
    }
});

export default router;