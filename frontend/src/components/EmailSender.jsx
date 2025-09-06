import React, { useState, useEffect } from "react";
import {
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Mail,
  Zap,
  Settings,
  Play,
} from "lucide-react";
import { emailSenderService } from "../services/api";
import toast from "react-hot-toast";

const EmailSender = ({ emails, onRefresh }) => {
  const [queueStatus, setQueueStatus] = useState(null);
  const [queueItems, setQueueItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [configStatus, setConfigStatus] = useState(null);

  useEffect(() => {
    loadQueueStatus();
    loadQueueItems();
    testEmailConfig();
  }, []);

  const loadQueueStatus = async () => {
    try {
      const response = await emailSenderService.getQueueStatus();
      setQueueStatus(response.data.data);
    } catch (error) {
      console.error("Error loading queue status:", error);
    }
  };

  const loadQueueItems = async () => {
    try {
      const response = await emailSenderService.getQueueItems(20);
      setQueueItems(response.data.data);
    } catch (error) {
      console.error("Error loading queue items:", error);
    }
  };

  const testEmailConfig = async () => {
    try {
      const response = await emailSenderService.testConfig();
      setConfigStatus(response.data.data);
    } catch (error) {
      console.error("Error testing email config:", error);
      setConfigStatus({ success: false, message: "Configuration test failed" });
    }
  };

  const handleAutoRespondUrgent = async () => {
    try {
      setLoading(true);
      const response = await emailSenderService.autoRespondUrgent();
      const successCount = response.data.data.filter((r) => r.success).length;

      toast.success(`Auto-responded to ${successCount} urgent emails`);
      await loadQueueStatus();
      await loadQueueItems();
      onRefresh?.();
    } catch (error) {
      toast.error("Failed to auto-respond to urgent emails");
      console.error("Error auto-responding:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessUrgent = async () => {
    try {
      setLoading(true);
      const response = await emailSenderService.processUrgent();

      toast.success(`Processed ${response.data.data.processed} urgent emails`);
      await loadQueueStatus();
      await loadQueueItems();
      onRefresh?.();
    } catch (error) {
      toast.error("Failed to process urgent emails");
      console.error("Error processing urgent emails:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendResponse = async (emailId, responseText) => {
    try {
      await emailSenderService.sendResponse(emailId, responseText);
      toast.success("Email response sent successfully");
      await loadQueueStatus();
      onRefresh?.();
    } catch (error) {
      toast.error("Failed to send email response");
      console.error("Error sending response:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "processing":
        return "text-blue-600 bg-blue-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "queued":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority) => {
    return priority === "urgent"
      ? "text-red-600 bg-red-100"
      : "text-blue-600 bg-blue-100";
  };

  // Get emails that can be sent (have AI responses)
  const sendableEmails = emails.filter(
    (email) => email.aiResponse && email.status === "pending"
  );

  const urgentSendableEmails = sendableEmails.filter(
    (email) => email.priority === "urgent"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Sender</h2>
          <p className="text-gray-600">
            Manage automated email responses and queue
          </p>
        </div>
        <button
          onClick={() => {
            loadQueueStatus();
            loadQueueItems();
            testEmailConfig();
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Configuration Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Email Configuration
          </h3>
          <Settings className="w-5 h-5 text-gray-400" />
        </div>

        {configStatus && (
          <div
            className={`flex items-center space-x-2 p-3 rounded-lg ${
              configStatus.success
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {configStatus.success ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span>{configStatus.message}</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleAutoRespondUrgent}
          disabled={
            loading ||
            !configStatus?.success ||
            urgentSendableEmails.length === 0
          }
          className="flex items-center justify-center space-x-2 p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Zap className="w-5 h-5" />
          <span>Auto-Respond Urgent ({urgentSendableEmails.length})</span>
        </button>

        <button
          onClick={handleProcessUrgent}
          disabled={loading}
          className="flex items-center justify-center space-x-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Play className="w-5 h-5" />
          <span>Process Urgent Queue</span>
        </button>

        <div className="flex items-center justify-center space-x-2 p-4 bg-gray-100 text-gray-700 rounded-lg">
          <Mail className="w-5 h-5" />
          <span>Ready to Send: {sendableEmails.length}</span>
        </div>
      </div>

      {/* Queue Status */}
      {queueStatus && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Queue Status
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {queueStatus.totalItems}
              </div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {queueStatus.urgentItems}
              </div>
              <div className="text-sm text-gray-600">Urgent Items</div>
            </div>

            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  queueStatus.isProcessing ? "text-green-600" : "text-gray-400"
                }`}
              >
                {queueStatus.isProcessing ? "Active" : "Idle"}
              </div>
              <div className="text-sm text-gray-600">Queue Status</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {queueStatus.statusBreakdown?.queued || 0}
              </div>
              <div className="text-sm text-gray-600">Queued</div>
            </div>
          </div>

          {queueStatus.statusBreakdown && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(queueStatus.statusBreakdown).map(
                ([status, count]) => (
                  <span
                    key={status}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      status
                    )}`}
                  >
                    {status}: {count}
                  </span>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* Queue Items */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Queue Items
        </h3>

        {queueItems.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No items in queue</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queueItems.map((item, index) => (
              <div
                key={`${item.emailId}-${index}`}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Email ID: {item.emailId.slice(-8)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Added: {new Date(item.addedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    Attempts: {item.attempts}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sendable Emails */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ready to Send ({sendableEmails.length})
        </h3>

        {sendableEmails.length === 0 ? (
          <div className="text-center py-8">
            <Send className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No emails ready to send</p>
            <p className="text-sm text-gray-500 mt-1">
              Generate AI responses first to enable sending
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sendableEmails.slice(0, 10).map((email) => (
              <div
                key={email._id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {email.subject}
                  </p>
                  <p className="text-sm text-gray-600 truncate">
                    To: {email.senderEmail}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(email.receivedDate).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      email.priority
                    )}`}
                  >
                    {email.priority}
                  </span>
                  <button
                    onClick={() =>
                      handleSendResponse(email._id, email.aiResponse)
                    }
                    disabled={!configStatus?.success}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            ))}

            {sendableEmails.length > 10 && (
              <p className="text-sm text-gray-500 text-center">
                And {sendableEmails.length - 10} more emails...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailSender;
