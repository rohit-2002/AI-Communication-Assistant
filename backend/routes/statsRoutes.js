import express from 'express';
import Email from '../models/Email.js';
import emailService from '../services/emailService.js';

const router = express.Router();

// GET /api/stats - Get comprehensive email statistics
router.get('/', async (req, res) => {
    try {
        const stats = await emailService.getEmailStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics',
            message: error.message
        });
    }
});

// GET /api/stats/overview - Get basic overview statistics
router.get('/overview', async (req, res) => {
    try {
        const [totalEmails, urgentEmails, pendingEmails, resolvedEmails] = await Promise.all([
            Email.countDocuments(),
            Email.countDocuments({ priority: 'urgent' }),
            Email.countDocuments({ status: 'pending' }),
            Email.countDocuments({ status: 'resolved' })
        ]);

        res.json({
            success: true,
            data: {
                totalEmails,
                urgentEmails,
                pendingEmails,
                resolvedEmails,
                responseRate: totalEmails > 0 ? ((resolvedEmails / totalEmails) * 100).toFixed(1) : 0
            }
        });
    } catch (error) {
        console.error('Error fetching overview stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch overview statistics',
            message: error.message
        });
    }
});

// GET /api/stats/sentiment - Get sentiment analysis statistics
router.get('/sentiment', async (req, res) => {
    try {
        const sentimentStats = await Email.aggregate([
            {
                $group: {
                    _id: '$sentiment',
                    count: { $sum: 1 },
                    avgResponseTime: { $avg: '$responseTime' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Format the response
        const sentimentBreakdown = {
            positive: 0,
            negative: 0,
            neutral: 0
        };

        sentimentStats.forEach(stat => {
            sentimentBreakdown[stat._id] = stat.count;
        });

        res.json({
            success: true,
            data: {
                breakdown: sentimentBreakdown,
                details: sentimentStats,
                total: sentimentStats.reduce((sum, stat) => sum + stat.count, 0)
            }
        });
    } catch (error) {
        console.error('Error fetching sentiment stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch sentiment statistics',
            message: error.message
        });
    }
});

// GET /api/stats/priority - Get priority distribution statistics
router.get('/priority', async (req, res) => {
    try {
        const priorityStats = await Email.aggregate([
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 },
                    pending: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
                        }
                    },
                    resolved: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        res.json({
            success: true,
            data: priorityStats
        });
    } catch (error) {
        console.error('Error fetching priority stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch priority statistics',
            message: error.message
        });
    }
});

// GET /api/stats/timeline/:period - Get email timeline statistics
router.get('/timeline/:period', async (req, res) => {
    try {
        const { period } = req.params; // 'day', 'week', 'month'

        let groupBy;
        let dateRange;

        switch (period) {
            case 'day':
                groupBy = {
                    year: { $year: '$receivedDate' },
                    month: { $month: '$receivedDate' },
                    day: { $dayOfMonth: '$receivedDate' },
                    hour: { $hour: '$receivedDate' }
                };
                dateRange = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
                break;
            case 'week':
                groupBy = {
                    year: { $year: '$receivedDate' },
                    month: { $month: '$receivedDate' },
                    day: { $dayOfMonth: '$receivedDate' }
                };
                dateRange = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
                break;
            case 'month':
                groupBy = {
                    year: { $year: '$receivedDate' },
                    month: { $month: '$receivedDate' },
                    week: { $week: '$receivedDate' }
                };
                dateRange = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid period. Use: day, week, or month'
                });
        }

        const timelineStats = await Email.aggregate([
            {
                $match: {
                    receivedDate: { $gte: dateRange }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    totalEmails: { $sum: 1 },
                    urgentEmails: {
                        $sum: {
                            $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0]
                        }
                    },
                    positiveEmails: {
                        $sum: {
                            $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, 0]
                        }
                    },
                    negativeEmails: {
                        $sum: {
                            $cond: [{ $eq: ['$sentiment', 'negative'] }, 1, 0]
                        }
                    },
                    resolvedEmails: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
                        }
                    }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 }
            }
        ]);

        res.json({
            success: true,
            data: {
                period,
                timeline: timelineStats,
                summary: {
                    totalDataPoints: timelineStats.length,
                    dateRange: {
                        from: dateRange.toISOString(),
                        to: new Date().toISOString()
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching timeline stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch timeline statistics',
            message: error.message
        });
    }
});

// GET /api/stats/categories - Get email category statistics
router.get('/categories', async (req, res) => {
    try {
        const categoryStats = await Email.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    urgentCount: {
                        $sum: {
                            $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0]
                        }
                    },
                    avgSentiment: {
                        $avg: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ['$sentiment', 'positive'] }, then: 1 },
                                    { case: { $eq: ['$sentiment', 'neutral'] }, then: 0 },
                                    { case: { $eq: ['$sentiment', 'negative'] }, then: -1 }
                                ],
                                default: 0
                            }
                        }
                    }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        res.json({
            success: true,
            data: categoryStats
        });
    } catch (error) {
        console.error('Error fetching category stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch category statistics',
            message: error.message
        });
    }
});

// GET /api/stats/performance - Get performance metrics
router.get('/performance', async (req, res) => {
    try {
        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [
            totalEmails,
            emailsLast24h,
            emailsLast7d,
            avgResponseTime,
            resolutionRate,
            urgentEmailsResolved
        ] = await Promise.all([
            Email.countDocuments(),
            Email.countDocuments({ receivedDate: { $gte: last24Hours } }),
            Email.countDocuments({ receivedDate: { $gte: last7Days } }),
            Email.aggregate([
                {
                    $match: { status: 'resolved' }
                },
                {
                    $group: {
                        _id: null,
                        avgTime: { $avg: '$responseTime' }
                    }
                }
            ]),
            Email.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        resolved: {
                            $sum: {
                                $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
                            }
                        }
                    }
                }
            ]),
            Email.countDocuments({ priority: 'urgent', status: 'resolved' })
        ]);

        const resolutionRatePercent = resolutionRate[0]
            ? ((resolutionRate[0].resolved / resolutionRate[0].total) * 100).toFixed(1)
            : 0;

        const avgResponseHours = avgResponseTime[0]?.avgTime
            ? (avgResponseTime[0].avgTime / (1000 * 60 * 60)).toFixed(1)
            : 'N/A';

        res.json({
            success: true,
            data: {
                totalEmails,
                emailsLast24h,
                emailsLast7d,
                avgResponseTime: avgResponseHours,
                resolutionRate: resolutionRatePercent,
                urgentEmailsResolved,
                performance: {
                    dailyAverage: (emailsLast7d / 7).toFixed(1),
                    weeklyGrowth: emailsLast7d > 0 ? ((emailsLast24h * 7 / emailsLast7d - 1) * 100).toFixed(1) : 0
                }
            }
        });
    } catch (error) {
        console.error('Error fetching performance stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch performance statistics',
            message: error.message
        });
    }
});

// GET /api/stats/top-senders - Get top email senders
router.get('/top-senders', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const topSenders = await Email.aggregate([
            {
                $group: {
                    _id: '$senderEmail',
                    emailCount: { $sum: 1 },
                    urgentCount: {
                        $sum: {
                            $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0]
                        }
                    },
                    lastEmailDate: { $max: '$receivedDate' },
                    avgSentiment: {
                        $avg: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ['$sentiment', 'positive'] }, then: 1 },
                                    { case: { $eq: ['$sentiment', 'neutral'] }, then: 0 },
                                    { case: { $eq: ['$sentiment', 'negative'] }, then: -1 }
                                ],
                                default: 0
                            }
                        }
                    }
                }
            },
            {
                $sort: { emailCount: -1 }
            },
            {
                $limit: limit
            }
        ]);

        res.json({
            success: true,
            data: topSenders
        });
    } catch (error) {
        console.error('Error fetching top senders:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch top senders',
            message: error.message
        });
    }
});

export default router;