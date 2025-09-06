import express from 'express';
import emailSender from '../services/emailSender.js';
import priorityQueue from '../services/priorityQueue.js';

const router = express.Router();

// POST /api/email-sender/send-response - Send email response
router.post('/send-response', async (req, res) => {
    try {
        const { emailId, responseText, customSubject } = req.body;

        if (!emailId || !responseText) {
            return res.status(400).json({
                success: false,
                error: 'emailId and responseText are required'
            });
        }

        const result = await emailSender.sendResponse(emailId, responseText, customSubject);

        res.json({
            success: true,
            data: result,
            message: 'Email response sent successfully'
        });
    } catch (error) {
        console.error('Error sending email response:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send email response',
            message: error.message
        });
    }
});

// POST /api/email-sender/auto-respond-urgent - Auto-respond to urgent emails
router.post('/auto-respond-urgent', async (req, res) => {
    try {
        const results = await emailSender.autoRespondUrgentEmails();

        res.json({
            success: true,
            data: results,
            message: `Auto-responded to ${results.filter(r => r.success).length} urgent emails`
        });
    } catch (error) {
        console.error('Error auto-responding to urgent emails:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to auto-respond to urgent emails',
            message: error.message
        });
    }
});

// POST /api/email-sender/bulk-send - Send bulk responses
router.post('/bulk-send', async (req, res) => {
    try {
        const { emailResponses } = req.body;

        if (!emailResponses || !Array.isArray(emailResponses)) {
            return res.status(400).json({
                success: false,
                error: 'emailResponses array is required'
            });
        }

        const results = await emailSender.sendBulkResponses(emailResponses);

        res.json({
            success: true,
            data: results,
            message: `Sent ${results.filter(r => r.success).length} out of ${results.length} responses`
        });
    } catch (error) {
        console.error('Error sending bulk responses:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send bulk responses',
            message: error.message
        });
    }
});

// GET /api/email-sender/test-config - Test email configuration
router.get('/test-config', async (req, res) => {
    try {
        const result = await emailSender.testEmailConfig();

        res.json({
            success: result.success,
            data: result,
            message: result.message
        });
    } catch (error) {
        console.error('Error testing email config:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to test email configuration',
            message: error.message
        });
    }
});

// GET /api/email-sender/queue-status - Get priority queue status
router.get('/queue-status', async (req, res) => {
    try {
        const status = priorityQueue.getQueueStatus();

        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('Error getting queue status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get queue status',
            message: error.message
        });
    }
});

// POST /api/email-sender/process-urgent - Process urgent emails immediately
router.post('/process-urgent', async (req, res) => {
    try {
        const result = await priorityQueue.processUrgentEmails();

        res.json({
            success: true,
            data: result,
            message: `Processed ${result.processed} urgent emails`
        });
    } catch (error) {
        console.error('Error processing urgent emails:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process urgent emails',
            message: error.message
        });
    }
});

// GET /api/email-sender/queue-items - Get queue items for monitoring
router.get('/queue-items', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const items = priorityQueue.getQueueItems(limit);

        res.json({
            success: true,
            data: items,
            count: items.length
        });
    } catch (error) {
        console.error('Error getting queue items:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get queue items',
            message: error.message
        });
    }
});

// POST /api/email-sender/force-process - Force process specific email
router.post('/force-process', async (req, res) => {
    try {
        const { emailId } = req.body;

        if (!emailId) {
            return res.status(400).json({
                success: false,
                error: 'emailId is required'
            });
        }

        const result = await priorityQueue.forceProcessEmail(emailId);

        res.json({
            success: result.success,
            data: result,
            message: result.success ? 'Email processed successfully' : 'Email processing failed'
        });
    } catch (error) {
        console.error('Error force processing email:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to force process email',
            message: error.message
        });
    }
});

export default router;