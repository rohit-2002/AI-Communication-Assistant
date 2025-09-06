import Email from '../models/Email.js';
import aiService from './aiService.js';
import emailSender from './emailSender.js';

class PriorityQueueService {
    constructor() {
        this.processingQueue = [];
        this.isProcessing = false;
        this.maxConcurrentProcessing = 5;
        this.processingInterval = 30000; // 30 seconds

        // Start the queue processor
        this.startQueueProcessor();
    }

    // Add email to priority queue
    async addToQueue(emailId, priority = 'normal') {
        try {
            const email = await Email.findById(emailId);
            if (!email) {
                throw new Error('Email not found');
            }

            const queueItem = {
                emailId: emailId,
                priority: priority,
                addedAt: new Date(),
                attempts: 0,
                maxAttempts: 3,
                status: 'queued'
            };

            // Insert based on priority (urgent first)
            if (priority === 'urgent') {
                this.processingQueue.unshift(queueItem);
            } else {
                this.processingQueue.push(queueItem);
            }

            console.log(`📋 Added email ${emailId} to priority queue (${priority})`);
            return queueItem;
        } catch (error) {
            console.error('Error adding to queue:', error);
            throw error;
        }
    }

    // Process queue items
    async processQueue() {
        if (this.isProcessing || this.processingQueue.length === 0) {
            return;
        }

        this.isProcessing = true;
        console.log(`🔄 Processing ${this.processingQueue.length} items in queue`);

        const itemsToProcess = this.processingQueue
            .filter(item => item.status === 'queued')
            .slice(0, this.maxConcurrentProcessing);

        const processingPromises = itemsToProcess.map(item => this.processQueueItem(item));

        try {
            await Promise.allSettled(processingPromises);
        } catch (error) {
            console.error('Error processing queue:', error);
        }

        // Remove completed items
        this.processingQueue = this.processingQueue.filter(
            item => item.status !== 'completed' && item.status !== 'failed'
        );

        this.isProcessing = false;
    }

    // Process individual queue item
    async processQueueItem(queueItem) {
        try {
            queueItem.status = 'processing';
            queueItem.attempts++;

            const email = await Email.findById(queueItem.emailId);
            if (!email) {
                queueItem.status = 'failed';
                queueItem.error = 'Email not found';
                return;
            }

            // Generate AI response if not already generated
            if (!email.aiResponse) {
                const emailData = {
                    subject: email.subject,
                    senderEmail: email.senderEmail,
                    body: email.body,
                    sentiment: email.sentiment,
                    priority: email.priority,
                    extractedInfo: email.extractedInfo || {}
                };

                const aiResponse = await aiService.generateResponse(emailData);
                email.aiResponse = aiResponse;
                await email.save();
            }

            // Send auto-response for urgent emails
            if (email.priority === 'urgent' && email.status === 'pending') {
                await emailSender.sendResponse(
                    email._id,
                    email.aiResponse,
                    `[URGENT] Re: ${email.subject}`
                );
                console.log(`🚀 Auto-sent urgent response for: ${email.subject}`);
            }

            queueItem.status = 'completed';
            queueItem.completedAt = new Date();

        } catch (error) {
            console.error(`❌ Error processing queue item ${queueItem.emailId}:`, error);

            queueItem.error = error.message;

            if (queueItem.attempts >= queueItem.maxAttempts) {
                queueItem.status = 'failed';
                console.error(`❌ Queue item ${queueItem.emailId} failed after ${queueItem.attempts} attempts`);
            } else {
                queueItem.status = 'queued'; // Retry
                console.log(`🔄 Retrying queue item ${queueItem.emailId} (attempt ${queueItem.attempts})`);
            }
        }
    }

    // Start the automatic queue processor
    startQueueProcessor() {
        setInterval(() => {
            this.processQueue();
        }, this.processingInterval);

        console.log(`🚀 Priority queue processor started (interval: ${this.processingInterval}ms)`);
    }

    // Get queue status
    getQueueStatus() {
        const statusCounts = this.processingQueue.reduce((counts, item) => {
            counts[item.status] = (counts[item.status] || 0) + 1;
            return counts;
        }, {});

        return {
            totalItems: this.processingQueue.length,
            statusBreakdown: statusCounts,
            isProcessing: this.isProcessing,
            urgentItems: this.processingQueue.filter(item => item.priority === 'urgent').length,
            oldestItem: this.processingQueue.length > 0
                ? Math.min(...this.processingQueue.map(item => item.addedAt.getTime()))
                : null
        };
    }

    // Process all pending urgent emails immediately
    async processUrgentEmails() {
        try {
            const urgentEmails = await Email.find({
                priority: 'urgent',
                status: 'pending'
            }).sort({ receivedDate: 1 }); // Oldest first

            console.log(`🚨 Found ${urgentEmails.length} urgent emails to process`);

            for (const email of urgentEmails) {
                await this.addToQueue(email._id, 'urgent');
            }

            // Process immediately
            await this.processQueue();

            return {
                processed: urgentEmails.length,
                emails: urgentEmails.map(email => ({
                    id: email._id,
                    subject: email.subject,
                    sender: email.senderEmail,
                    receivedDate: email.receivedDate
                }))
            };
        } catch (error) {
            console.error('Error processing urgent emails:', error);
            throw error;
        }
    }

    // Clear completed items from queue
    clearCompletedItems() {
        const beforeCount = this.processingQueue.length;
        this.processingQueue = this.processingQueue.filter(
            item => item.status !== 'completed'
        );
        const clearedCount = beforeCount - this.processingQueue.length;

        console.log(`🧹 Cleared ${clearedCount} completed items from queue`);
        return clearedCount;
    }

    // Get queue items for monitoring
    getQueueItems(limit = 50) {
        return this.processingQueue
            .sort((a, b) => {
                // Sort by priority first, then by addedAt
                if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
                if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
                return a.addedAt - b.addedAt;
            })
            .slice(0, limit)
            .map(item => ({
                emailId: item.emailId,
                priority: item.priority,
                status: item.status,
                attempts: item.attempts,
                addedAt: item.addedAt,
                completedAt: item.completedAt,
                error: item.error
            }));
    }

    // Force process specific email
    async forceProcessEmail(emailId) {
        try {
            const email = await Email.findById(emailId);
            if (!email) {
                throw new Error('Email not found');
            }

            const queueItem = {
                emailId: emailId,
                priority: email.priority,
                addedAt: new Date(),
                attempts: 0,
                maxAttempts: 1,
                status: 'queued'
            };

            await this.processQueueItem(queueItem);

            return {
                success: queueItem.status === 'completed',
                status: queueItem.status,
                error: queueItem.error
            };
        } catch (error) {
            console.error('Error force processing email:', error);
            throw error;
        }
    }
}

export default new PriorityQueueService();