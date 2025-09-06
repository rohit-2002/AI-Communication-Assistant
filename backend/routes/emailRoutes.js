import express from 'express';
import Email from '../models/Email.js';
import emailService from '../services/emailService.js';
import aiService from '../services/aiService.js';

const router = express.Router();

// GET /api/emails - Get all emails with optional filters
router.get('/', async (req, res) => {
    try {
        const {
            priority,
            sentiment,
            status,
            category,
            limit = 50,
            skip = 0,
            sortBy = 'receivedDate',
            sortOrder = 'desc'
        } = req.query;

        const filters = {
            priority,
            sentiment,
            status,
            category,
            limit: parseInt(limit),
            skip: parseInt(skip),
            sortBy,
            sortOrder
        };

        const emails = await emailService.getEmails(filters);

        res.json({
            success: true,
            data: emails,
            count: emails.length,
            filters: filters
        });
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch emails',
            message: error.message
        });
    }
});

// GET /api/emails/:id - Get specific email by ID
router.get('/:id', async (req, res) => {
    try {
        const email = await Email.findById(req.params.id);

        if (!email) {
            return res.status(404).json({
                success: false,
                error: 'Email not found'
            });
        }

        res.json({
            success: true,
            data: email
        });
    } catch (error) {
        console.error('Error fetching email:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch email',
            message: error.message
        });
    }
});

// POST /api/emails/fetch - Fetch new emails from server
router.post('/fetch', async (req, res) => {
    try {
        console.log('🔄 Starting email fetch process...');

        // Fetch emails from server (or create sample data)
        const rawEmails = await emailService.fetchEmailsFromServer();

        // Process and save emails
        const processedEmails = await emailService.processEmails(rawEmails);

        res.json({
            success: true,
            message: `Successfully processed ${processedEmails.length} new emails`,
            data: {
                processedCount: processedEmails.length,
                emails: processedEmails
            }
        });
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch emails',
            message: error.message
        });
    }
});

// POST /api/emails/:id/generate-response - Generate AI response for email
router.post('/:id/generate-response', async (req, res) => {
    try {
        const { customContext } = req.body;
        const email = await Email.findById(req.params.id);

        if (!email) {
            return res.status(404).json({
                success: false,
                error: 'Email not found'
            });
        }

        // Prepare email data for AI
        const emailData = {
            subject: email.subject,
            senderEmail: email.senderEmail,
            body: email.body,
            sentiment: email.sentiment,
            priority: email.priority,
            extractedInfo: email.extractedInfo || {}
        };

        // Generate AI response
        const aiResponse = await aiService.generateResponse(emailData, customContext);

        // Update email with AI response
        email.aiResponse = aiResponse;
        await email.save();

        res.json({
            success: true,
            data: {
                emailId: email._id,
                aiResponse: aiResponse
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

// PUT /api/emails/:id/status - Update email status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'responded', 'resolved'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be: pending, responded, or resolved'
            });
        }

        const email = await emailService.updateEmailStatus(req.params.id, status);

        res.json({
            success: true,
            data: email,
            message: `Email status updated to ${status}`
        });
    } catch (error) {
        console.error('Error updating email status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update email status',
            message: error.message
        });
    }
});

// GET /api/emails/urgent - Get urgent emails
router.get('/urgent', async (req, res) => {
    try {
        const urgentEmails = await Email.getPriorityEmails();

        res.json({
            success: true,
            data: urgentEmails,
            count: urgentEmails.length
        });
    } catch (error) {
        console.error('Error fetching urgent emails:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch urgent emails',
            message: error.message
        });
    }
});

// GET /api/emails/recent/:hours - Get recent emails
router.get('/recent/:hours', async (req, res) => {
    try {
        const hours = parseInt(req.params.hours) || 24;
        const recentEmails = await Email.getRecentEmails(hours);

        res.json({
            success: true,
            data: recentEmails,
            count: recentEmails.length,
            timeframe: `${hours} hours`
        });
    } catch (error) {
        console.error('Error fetching recent emails:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recent emails',
            message: error.message
        });
    }
});

// POST /api/emails/analyze - Analyze email content for insights
router.post('/analyze', async (req, res) => {
    try {
        const { emailIds } = req.body;

        let emails;
        if (emailIds && emailIds.length > 0) {
            emails = await Email.find({ _id: { $in: emailIds } });
        } else {
            // Analyze recent emails if no specific IDs provided
            emails = await Email.getRecentEmails(168); // Last week
        }

        const analysis = await aiService.analyzeEmailContent(emails);
        const summary = await aiService.generateBatchSummary(emails);

        res.json({
            success: true,
            data: {
                analysis,
                summary,
                emailCount: emails.length
            }
        });
    } catch (error) {
        console.error('Error analyzing emails:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze emails',
            message: error.message
        });
    }
});

// DELETE /api/emails/:id - Delete email (soft delete by marking as resolved)
router.delete('/:id', async (req, res) => {
    try {
        const email = await Email.findById(req.params.id);

        if (!email) {
            return res.status(404).json({
                success: false,
                error: 'Email not found'
            });
        }

        // Soft delete by marking as resolved
        email.status = 'resolved';
        await email.save();

        res.json({
            success: true,
            message: 'Email marked as resolved',
            data: email
        });
    } catch (error) {
        console.error('Error deleting email:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete email',
            message: error.message
        });
    }
});

// POST /api/emails/bulk/update-status - Bulk update email status
router.post('/bulk/update-status', async (req, res) => {
    try {
        const { emailIds, status } = req.body;

        if (!emailIds || !Array.isArray(emailIds) || emailIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'emailIds array is required'
            });
        }

        if (!['pending', 'responded', 'resolved'].includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status. Must be: pending, responded, or resolved'
            });
        }

        const result = await Email.updateMany(
            { _id: { $in: emailIds } },
            { status: status }
        );

        res.json({
            success: true,
            message: `Updated ${result.modifiedCount} emails to ${status}`,
            data: {
                modifiedCount: result.modifiedCount,
                matchedCount: result.matchedCount
            }
        });
    } catch (error) {
        console.error('Error bulk updating emails:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to bulk update emails',
            message: error.message
        });
    }
});

export default router;