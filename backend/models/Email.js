import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
    senderEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true
    },
    receivedDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    sentiment: {
        type: String,
        enum: ['positive', 'negative', 'neutral'],
        default: 'neutral'
    },
    priority: {
        type: String,
        enum: ['urgent', 'normal'],
        default: 'normal'
    },
    category: {
        type: String,
        enum: ['support', 'query', 'request', 'help'],
        default: 'support'
    },
    aiResponse: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'responded', 'resolved'],
        default: 'pending'
    },
    extractedInfo: {
        phoneNumbers: [String],
        emailAddresses: [String],
        mentionedProducts: [String],
        urgencyIndicators: [String],
        customerRequirements: [String]
    },
    responseTime: {
        type: Number, // Time in milliseconds from received to responded
        default: null
    },
    sentResponse: {
        messageId: String,
        sentAt: Date,
        responseText: String
    },
    metadata: {
        messageId: String,
        threadId: String,
        labels: [String],
        attachments: [{
            filename: String,
            contentType: String,
            size: Number
        }]
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
emailSchema.index({ senderEmail: 1 });
emailSchema.index({ receivedDate: -1 });
emailSchema.index({ priority: 1, receivedDate: -1 });
emailSchema.index({ status: 1 });
emailSchema.index({ sentiment: 1 });
emailSchema.index({ category: 1 });

// Virtual for formatted received date
emailSchema.virtual('formattedDate').get(function () {
    return this.receivedDate.toLocaleDateString();
});

// Virtual for time ago
emailSchema.virtual('timeAgo').get(function () {
    const now = new Date();
    const diff = now - this.receivedDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
});

// Static method to get priority emails
emailSchema.statics.getPriorityEmails = function () {
    return this.find({ priority: 'urgent', status: { $ne: 'resolved' } })
        .sort({ receivedDate: -1 });
};

// Static method to get recent emails
emailSchema.statics.getRecentEmails = function (hours = 24) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.find({ receivedDate: { $gte: cutoff } })
        .sort({ receivedDate: -1 });
};

// Instance method to mark as resolved
emailSchema.methods.markResolved = function () {
    this.status = 'resolved';
    return this.save();
};

// Instance method to generate response
emailSchema.methods.generateResponse = async function () {
    // This will be implemented in the AI service
    return null;
};

const Email = mongoose.model('Email', emailSchema);

export default Email;