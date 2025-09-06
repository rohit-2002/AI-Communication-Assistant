import Imap from 'imap';
import { simpleParser } from 'mailparser';
import Email from '../models/Email.js';
import { analyzeSentiment, determinePriority, extractInformation } from './aiService.js';
import priorityQueue from './priorityQueue.js';

class EmailService {
    constructor() {
        this.supportKeywords = ['support', 'query', 'request', 'help', 'issue', 'problem', 'bug', 'error', 'assistance'];
        this.urgentKeywords = ['urgent', 'critical', 'immediately', 'asap', 'emergency', 'cannot access', 'down', 'broken', 'critical issue'];
    }

    // Connect to email server using IMAP
    async connectToEmail() {
        return new Promise((resolve, reject) => {
            const imap = new Imap({
                user: process.env.EMAIL_ADDRESS,
                password: process.env.EMAIL_PASSWORD,
                host: process.env.IMAP_SERVER || 'imap.gmail.com',
                port: 993,
                tls: true,
                tlsOptions: { rejectUnauthorized: false }
            });

            imap.once('ready', () => {
                console.log('✅ IMAP connection ready');
                resolve(imap);
            });

            imap.once('error', (err) => {
                console.error('❌ IMAP connection error:', err);
                reject(err);
            });

            imap.connect();
        });
    }

    // Check if email is support-related
    isSupportEmail(subject, body) {
        const text = (subject + ' ' + body).toLowerCase();
        return this.supportKeywords.some(keyword => text.includes(keyword));
    }

    // Fetch emails from IMAP server
    async fetchEmailsFromServer() {
        try {
            if (!process.env.EMAIL_ADDRESS || !process.env.EMAIL_PASSWORD) {
                console.log('📧 Email credentials not configured, using sample data');
                return await this.createSampleEmails();
            }

            const imap = await this.connectToEmail();

            return new Promise((resolve, reject) => {
                imap.openBox('INBOX', false, (err, box) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    // Search for recent emails (last 7 days)
                    const searchCriteria = ['UNSEEN', ['SINCE', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)]];

                    imap.search(searchCriteria, (err, results) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        if (!results || results.length === 0) {
                            console.log('📭 No new emails found');
                            resolve([]);
                            return;
                        }

                        const fetch = imap.fetch(results, { bodies: '' });
                        const emails = [];

                        fetch.on('message', (msg, seqno) => {
                            msg.on('body', (stream, info) => {
                                simpleParser(stream, (err, parsed) => {
                                    if (err) {
                                        console.error('Error parsing email:', err);
                                        return;
                                    }

                                    const subject = parsed.subject || '';
                                    const body = parsed.text || parsed.html || '';

                                    // Only process support-related emails
                                    if (this.isSupportEmail(subject, body)) {
                                        emails.push({
                                            messageId: parsed.messageId,
                                            from: parsed.from?.text || '',
                                            subject: subject,
                                            body: body,
                                            date: parsed.date || new Date(),
                                            attachments: parsed.attachments || []
                                        });
                                    }
                                });
                            });
                        });

                        fetch.once('error', reject);
                        fetch.once('end', () => {
                            imap.end();
                            resolve(emails);
                        });
                    });
                });
            });
        } catch (error) {
            console.error('Error fetching emails:', error);
            // Fallback to sample data
            return await this.createSampleEmails();
        }
    }

    // Create sample emails for demo
    async createSampleEmails() {
        const sampleEmails = [
            {
                messageId: `sample-${Date.now()}-1`,
                from: 'john.doe@customer.com',
                subject: 'Urgent: Cannot access my account',
                body: `Hi Support Team,

I'm having trouble logging into my account. I've tried multiple times but keep getting an error message saying "Invalid credentials" even though I'm sure my password is correct.

This is urgent as I need to access my billing information immediately for a client meeting tomorrow morning. I've been a customer for over 2 years and this has never happened before.

My phone number is 555-123-4567 if you need to call me directly. Please help me resolve this as soon as possible.

Best regards,
John Doe`,
                date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                attachments: []
            },
            {
                messageId: `sample-${Date.now()}-2`,
                from: 'sarah.wilson@company.com',
                subject: 'Help with API integration',
                body: `Hello,

I'm trying to integrate your API into our system but I'm having some issues with authentication. The documentation mentions OAuth 2.0 but I'm not getting the expected response when I make the token request.

Could you please provide some guidance on the proper authentication flow? Our development team email is dev@company.com if you need to send any technical documentation.

We're planning to go live next week, so any assistance would be greatly appreciated.

Thanks,
Sarah Wilson
Lead Developer`,
                date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            },
            {
                from: 'mike.johnson@startup.io',
                subject: 'Thank you for the great support!',
                body: `Hi there,

I wanted to take a moment to thank your support team for the excellent help I received yesterday. The issue with our webhook integration was resolved quickly and professionally.

Your customer service is outstanding and it's one of the reasons we chose your platform. Keep up the great work!

Best regards,
Mike Johnson
CTO, StartupIO`,
                date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            },
            {
                messageId: `sample-${Date.now()}-3`,
                from: 'mike.johnson@startup.io',
                subject: 'Thank you for the great support!',
                body: `Hi there,

I wanted to take a moment to thank your support team for the excellent help I received yesterday. The issue with our webhook integration was resolved quickly and professionally.

Your customer service is outstanding and it's one of the reasons we chose your platform. Keep up the great work!

Best regards,
Mike Johnson
CTO, StartupIO`,
                date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                attachments: []
            },
            {
                messageId: `sample-${Date.now()}-4`,
                from: 'lisa.chen@enterprise.com',
                subject: 'Critical: System down for production',
                body: `URGENT - PRODUCTION DOWN

Our production system is completely down and we cannot access any of your services. This is affecting our entire operation and we're losing money every minute this continues.

Error message: "Service Unavailable - 503"
Started: About 30 minutes ago
Affected systems: All API endpoints

Please escalate this immediately! Contact me at 555-987-6543 or lisa.chen@enterprise.com

This is a critical business impact situation.

Lisa Chen
Operations Manager
Enterprise Corp`,
                date: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
                attachments: []
            },
            {
                messageId: `sample-${Date.now()}-5`,
                from: 'david.brown@client.org',
                subject: 'Query about subscription pricing',
                body: `Hi,

I'm interested in upgrading our subscription plan. We're currently on the Basic plan but we're hitting the API rate limits more frequently as our usage grows.

Could you provide information about:
1. Enterprise pricing and features
2. Custom API rate limits
3. Priority support options
4. Migration process from Basic to Enterprise

We process about 50,000 API calls per month and expect this to double in the next quarter.

Please let me know the best time to schedule a call to discuss our needs.

Thanks,
David Brown
IT Director`,
                date: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
                attachments: []
            }
        ];

        // Return raw emails for processing by processEmails function
        return sampleEmails;
    }

    // Extract email address from "Name <email@domain.com>" format
    extractEmail(fromField) {
        if (!fromField || typeof fromField !== 'string') {
            return 'unknown@example.com';
        }
        const emailMatch = fromField.match(/<(.+?)>/);
        return emailMatch ? emailMatch[1] : fromField;
    }

    // Determine email category based on subject
    determineCategory(subject) {
        const subjectLower = subject.toLowerCase();

        if (subjectLower.includes('query') || subjectLower.includes('question')) {
            return 'query';
        } else if (subjectLower.includes('request')) {
            return 'request';
        } else if (subjectLower.includes('help')) {
            return 'help';
        } else {
            return 'support';
        }
    }

    // Process and save emails to database
    async processEmails(rawEmails) {
        const processedEmails = [];

        for (const rawEmail of rawEmails) {
            try {
                // Check if email already exists
                const existingEmail = await Email.findOne({
                    senderEmail: this.extractEmail(rawEmail.from),
                    subject: rawEmail.subject
                });

                if (existingEmail) {
                    continue; // Skip if already processed
                }

                // Extract information and analyze
                const senderEmail = this.extractEmail(rawEmail.from);
                const sentiment = await analyzeSentiment(rawEmail.body);
                const priority = determinePriority(rawEmail.subject, rawEmail.body);
                const extractedInfo = extractInformation(rawEmail.body);
                const category = this.determineCategory(rawEmail.subject);

                // Create email record
                const emailRecord = new Email({
                    senderEmail,
                    subject: rawEmail.subject,
                    body: rawEmail.body,
                    receivedDate: rawEmail.date,
                    sentiment,
                    priority,
                    category,
                    extractedInfo,
                    metadata: {
                        messageId: rawEmail.messageId,
                        threadId: rawEmail.threadId,
                        labels: ['inbox'],
                        attachments: rawEmail.attachments.map(att => ({
                            filename: att.filename,
                            contentType: att.contentType,
                            size: att.size
                        }))
                    }
                });

                await emailRecord.save();
                processedEmails.push(emailRecord);

                // Add to priority queue for processing
                await priorityQueue.addToQueue(emailRecord._id, emailRecord.priority);

                console.log(`✅ Processed email: ${rawEmail.subject}`);
            } catch (error) {
                console.error(`❌ Error processing email "${rawEmail.subject}":`, error);
            }
        }

        return processedEmails;
    }

    // Get filtered emails with sorting
    async getEmails(filters = {}) {
        const {
            priority,
            sentiment,
            status,
            category,
            limit = 50,
            skip = 0,
            sortBy = 'receivedDate',
            sortOrder = 'desc'
        } = filters;

        const query = {};

        if (priority) query.priority = priority;
        if (sentiment) query.sentiment = sentiment;
        if (status) query.status = status;
        if (category) query.category = category;

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Always prioritize urgent emails
        if (!priority) {
            sortOptions.priority = -1; // urgent first
        }

        const emails = await Email.find(query)
            .sort(sortOptions)
            .limit(limit)
            .skip(skip)
            .lean();

        return emails;
    }

    // Update email status
    async updateEmailStatus(emailId, status) {
        const email = await Email.findByIdAndUpdate(
            emailId,
            { status },
            { new: true }
        );

        if (!email) {
            throw new Error('Email not found');
        }

        return email;
    }

    // Get email statistics
    async getEmailStats() {
        const [
            totalEmails,
            urgentEmails,
            pendingEmails,
            resolvedEmails,
            sentimentStats,
            recentEmails,
            avgResponseTime
        ] = await Promise.all([
            Email.countDocuments(),
            Email.countDocuments({ priority: 'urgent' }),
            Email.countDocuments({ status: 'pending' }),
            Email.countDocuments({ status: 'resolved' }),
            Email.aggregate([
                {
                    $group: {
                        _id: '$sentiment',
                        count: { $sum: 1 }
                    }
                }
            ]),
            Email.getRecentEmails(24),
            Email.aggregate([
                {
                    $match: {
                        responseTime: { $exists: true, $ne: null }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgTime: { $avg: '$responseTime' }
                    }
                }
            ])
        ]);

        // Format sentiment breakdown
        const sentimentBreakdown = {
            positive: 0,
            negative: 0,
            neutral: 0
        };

        sentimentStats.forEach(stat => {
            sentimentBreakdown[stat._id] = stat.count;
        });

        // Format recent activity
        const recentActivity = recentEmails.slice(0, 10).map(email => ({
            id: email._id,
            subject: email.subject,
            sender: email.senderEmail,
            priority: email.priority,
            sentiment: email.sentiment,
            createdAt: email.createdAt
        }));

        // Calculate average response time in hours
        const avgResponseTimeHours = avgResponseTime[0]?.avgTime
            ? (avgResponseTime[0].avgTime / (1000 * 60 * 60)).toFixed(1)
            : null;

        return {
            totalEmails,
            urgentEmails,
            pendingEmails,
            resolvedEmails,
            sentimentBreakdown,
            recentActivity,
            avgResponseTime: avgResponseTimeHours
        };
    }
}

export default new EmailService();