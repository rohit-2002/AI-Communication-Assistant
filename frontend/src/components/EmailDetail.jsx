import React, { useState } from "react";
import {
  ArrowLeft,
  User,
  Calendar,
  Tag,
  AlertTriangle,
  Bot,
  Copy,
  Send,
  Edit,
  Save,
  X,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import toast from "react-hot-toast";

const EmailDetail = ({ email, onBack, onEmailUpdate, onGenerateResponse }) => {
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [editingResponse, setEditingResponse] = useState(false);
  const [editedResponse, setEditedResponse] = useState(email?.aiResponse || "");
  const [customContext, setCustomContext] = useState("");

  if (!email) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No email selected</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleGenerateResponse = async () => {
    try {
      setGeneratingResponse(true);
      const response = await onGenerateResponse(email._id);
      setEditedResponse(response);
      toast.success("AI response generated successfully");
    } catch (error) {
      toast.error("Failed to generate AI response");
    } finally {
      setGeneratingResponse(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await onEmailUpdate(email._id, { status: newStatus });
      toast.success(`Email marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update email status");
    }
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(editedResponse);
    toast.success("Response copied to clipboard");
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    return priority === "urgent"
      ? "bg-red-100 text-red-800 border-red-200"
      : "bg-blue-100 text-blue-800 border-blue-200";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Emails</span>
        </button>

        <div className="flex items-center space-x-3">
          <select
            value={email.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="pending">Pending</option>
            <option value="responded">Responded</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Email Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Email Header */}
        <div className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {email.subject}
              </h1>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{email.senderEmail}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(email.receivedDate), "PPpp")}</span>
                  <span className="text-gray-400">
                    (
                    {formatDistanceToNow(new Date(email.receivedDate), {
                      addSuffix: true,
                    })}
                    )
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(
                    email.priority
                  )}`}
                >
                  {email.priority === "urgent" && (
                    <AlertTriangle className="w-4 h-4 mr-1" />
                  )}
                  {email.priority}
                </span>

                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSentimentColor(
                    email.sentiment
                  )}`}
                >
                  {email.sentiment}
                </span>

                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  <Tag className="w-4 h-4 mr-1" />
                  {email.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Email Body */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Email Content
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-gray-700 font-sans">
              {email.body}
            </pre>
          </div>
        </div>

        {/* Extracted Information */}
        {email.extractedInfo &&
          Object.keys(email.extractedInfo).some(
            (key) => email.extractedInfo[key]?.length > 0
          ) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Extracted Information
              </h3>
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                {email.extractedInfo.phoneNumbers?.length > 0 && (
                  <div>
                    <span className="font-medium text-blue-900">
                      Phone Numbers:
                    </span>
                    <div className="mt-1">
                      {email.extractedInfo.phoneNumbers.map((phone, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2"
                        >
                          {phone}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {email.extractedInfo.emailAddresses?.length > 0 && (
                  <div>
                    <span className="font-medium text-blue-900">
                      Email Addresses:
                    </span>
                    <div className="mt-1">
                      {email.extractedInfo.emailAddresses.map(
                        (emailAddr, index) => (
                          <span
                            key={index}
                            className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2"
                          >
                            {emailAddr}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {email.extractedInfo.mentionedProducts?.length > 0 && (
                  <div>
                    <span className="font-medium text-blue-900">
                      Mentioned Products/Services:
                    </span>
                    <div className="mt-1">
                      {email.extractedInfo.mentionedProducts.map(
                        (product, index) => (
                          <span
                            key={index}
                            className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm mr-2"
                          >
                            {product}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {email.extractedInfo.urgencyIndicators?.length > 0 && (
                  <div>
                    <span className="font-medium text-blue-900">
                      Urgency Indicators:
                    </span>
                    <div className="mt-1">
                      {email.extractedInfo.urgencyIndicators.map(
                        (indicator, index) => (
                          <span
                            key={index}
                            className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-sm mr-2"
                          >
                            {indicator}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {email.extractedInfo.customerRequirements?.length > 0 && (
                  <div>
                    <span className="font-medium text-blue-900">
                      Customer Requirements:
                    </span>
                    <ul className="mt-1 list-disc list-inside text-blue-800">
                      {email.extractedInfo.customerRequirements.map(
                        (requirement, index) => (
                          <li key={index} className="text-sm">
                            {requirement}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>

      {/* AI Response Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bot className="w-5 h-5 mr-2 text-blue-600" />
            AI Generated Response
          </h3>

          <div className="flex items-center space-x-2">
            {!email.aiResponse && (
              <button
                onClick={handleGenerateResponse}
                disabled={generatingResponse}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Bot
                  className={`w-4 h-4 ${
                    generatingResponse ? "animate-spin" : ""
                  }`}
                />
                <span>
                  {generatingResponse ? "Generating..." : "Generate Response"}
                </span>
              </button>
            )}

            {(email.aiResponse || editedResponse) && (
              <>
                <button
                  onClick={() => setEditingResponse(!editingResponse)}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {editingResponse ? (
                    <X className="w-4 h-4" />
                  ) : (
                    <Edit className="w-4 h-4" />
                  )}
                  <span>{editingResponse ? "Cancel" : "Edit"}</span>
                </button>

                <button
                  onClick={handleCopyResponse}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Custom Context Input */}
        {!email.aiResponse && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Context (Optional)
            </label>
            <textarea
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              placeholder="Add any additional context or instructions for the AI response..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
        )}

        {/* Response Content */}
        {email.aiResponse || editedResponse ? (
          <div className="space-y-4">
            {editingResponse ? (
              <div>
                <textarea
                  value={editedResponse}
                  onChange={(e) => setEditedResponse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={10}
                />
                <div className="flex justify-end space-x-2 mt-3">
                  <button
                    onClick={() => {
                      setEditingResponse(false);
                      setEditedResponse(email.aiResponse);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setEditingResponse(false)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-gray-700 font-sans">
                  {editedResponse || email.aiResponse}
                </pre>
              </div>
            )}

            {/* Send Response Button */}
            {!editingResponse && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    toast.success("Response would be sent (demo mode)");
                    handleStatusChange("responded");
                  }}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Response</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No AI response generated yet</p>
            <button
              onClick={handleGenerateResponse}
              disabled={generatingResponse}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 mx-auto"
            >
              <Bot
                className={`w-4 h-4 ${
                  generatingResponse ? "animate-spin" : ""
                }`}
              />
              <span>
                {generatingResponse ? "Generating..." : "Generate AI Response"}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailDetail;
