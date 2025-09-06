import React, { useState } from "react";
import {
  Mail,
  AlertTriangle,
  Clock,
  CheckCircle,
  Filter,
  Search,
  Bot,
  User,
  Calendar,
  Tag,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

const EmailList = ({
  emails,
  onEmailSelect,
  onEmailUpdate,
  onGenerateResponse,
  filters,
  onFiltersChange,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [generatingResponse, setGeneratingResponse] = useState(null);

  // Filter emails based on search term
  const filteredEmails = emails.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.senderEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.body.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (emailId, newStatus) => {
    try {
      await onEmailUpdate(emailId, { status: newStatus });
      toast.success(`Email marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update email status");
    }
  };

  const handleGenerateResponse = async (emailId) => {
    try {
      setGeneratingResponse(emailId);
      await onGenerateResponse(emailId);
      toast.success("AI response generated successfully");
    } catch (error) {
      toast.error("Failed to generate AI response");
    } finally {
      setGeneratingResponse(null);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800";
      case "negative":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    return priority === "urgent"
      ? "bg-red-100 text-red-800 border-red-200"
      : "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "responded":
        return <Mail className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Management</h1>
          <p className="text-gray-600">
            {filteredEmails.length} of {emails.length} emails
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search emails by subject, sender, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) =>
                  onFiltersChange({ ...filters, priority: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="normal">Normal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sentiment
              </label>
              <select
                value={filters.sentiment}
                onChange={(e) =>
                  onFiltersChange({ ...filters, sentiment: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  onFiltersChange({ ...filters, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="responded">Responded</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) =>
                  onFiltersChange({ ...filters, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="support">Support</option>
                <option value="query">Query</option>
                <option value="request">Request</option>
                <option value="help">Help</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Email List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading emails...</p>
            </div>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No emails found
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try adjusting your search terms"
                : "No emails match the current filters"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredEmails.map((email) => (
              <div
                key={email._id}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onEmailSelect(email)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {email.senderEmail}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(email.receivedDate), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Subject */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                      {email.subject}
                    </h3>

                    {/* Body Preview */}
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {email.body.substring(0, 200)}...
                    </p>

                    {/* Tags */}
                    <div className="flex items-center space-x-2 mb-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                          email.priority
                        )}`}
                      >
                        {email.priority === "urgent" && (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        {email.priority}
                      </span>

                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(
                          email.sentiment
                        )}`}
                      >
                        {email.sentiment}
                      </span>

                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Tag className="w-3 h-3 mr-1" />
                        {email.category}
                      </span>
                    </div>

                    {/* Extracted Info */}
                    {email.extractedInfo && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {email.extractedInfo.phoneNumbers?.length > 0 && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            📞 {email.extractedInfo.phoneNumbers.length}{" "}
                            phone(s)
                          </span>
                        )}
                        {email.extractedInfo.mentionedProducts?.length > 0 && (
                          <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                            🏷️{" "}
                            {email.extractedInfo.mentionedProducts.join(", ")}
                          </span>
                        )}
                        {email.extractedInfo.urgencyIndicators?.length > 0 && (
                          <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                            ⚡ Urgent keywords detected
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    {/* Status */}
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(email.status)}
                      <span className="text-sm text-gray-600 capitalize">
                        {email.status}
                      </span>
                    </div>

                    {/* Generate Response Button */}
                    {!email.aiResponse && email.status === "pending" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateResponse(email._id);
                        }}
                        disabled={generatingResponse === email._id}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Bot
                          className={`w-4 h-4 ${
                            generatingResponse === email._id
                              ? "animate-spin"
                              : ""
                          }`}
                        />
                        <span>
                          {generatingResponse === email._id
                            ? "Generating..."
                            : "Generate Response"}
                        </span>
                      </button>
                    )}

                    {/* Status Change Dropdown */}
                    <select
                      value={email.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(email._id, e.target.value);
                      }}
                      className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="pending">Pending</option>
                      <option value="responded">Responded</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                {/* AI Response Preview */}
                {email.aiResponse && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Bot className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        AI Generated Response
                      </span>
                    </div>
                    <p className="text-sm text-blue-800 line-clamp-3">
                      {email.aiResponse.substring(0, 200)}...
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailList;
