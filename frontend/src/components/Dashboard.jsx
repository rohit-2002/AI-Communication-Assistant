import React from "react";
import {
  Mail,
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp,
  Users,
  MessageSquare,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatDistanceToNow } from "date-fns";

const Dashboard = ({
  stats,
  emails,
  onEmailSelect,
  onFetchEmails,
  loading,
}) => {
  // Prepare chart data
  const sentimentData = stats?.sentimentBreakdown
    ? [
        {
          name: "Positive",
          value: stats.sentimentBreakdown.positive,
          color: "#10B981",
        },
        {
          name: "Neutral",
          value: stats.sentimentBreakdown.neutral,
          color: "#6B7280",
        },
        {
          name: "Negative",
          value: stats.sentimentBreakdown.negative,
          color: "#EF4444",
        },
      ]
    : [];

  const priorityData = [
    { name: "Urgent", value: stats?.urgentEmails || 0, color: "#EF4444" },
    {
      name: "Normal",
      value: (stats?.totalEmails || 0) - (stats?.urgentEmails || 0),
      color: "#10B981",
    },
  ];

  // Get urgent emails for quick access
  const urgentEmails = emails
    .filter(
      (email) => email.priority === "urgent" && email.status !== "resolved"
    )
    .slice(0, 5);

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-sm text-green-600">{trend}</span>
        </div>
      )}
    </div>
  );

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Overview of your email management system
          </p>
        </div>
        <button
          onClick={onFetchEmails}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Mail className="w-4 h-4" />
          <span>{loading ? "Fetching..." : "Fetch New Emails"}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Emails"
          value={stats.totalEmails}
          icon={Mail}
          color="bg-blue-500"
          subtitle="All time"
        />
        <StatCard
          title="Urgent Emails"
          value={stats.urgentEmails}
          icon={AlertTriangle}
          color="bg-red-500"
          subtitle="Needs immediate attention"
        />
        <StatCard
          title="Pending"
          value={stats.pendingEmails}
          icon={Clock}
          color="bg-yellow-500"
          subtitle="Awaiting response"
        />
        <StatCard
          title="Resolved"
          value={stats.resolvedEmails}
          icon={CheckCircle}
          color="bg-green-500"
          subtitle="Completed"
          trend={`${((stats.resolvedEmails / stats.totalEmails) * 100).toFixed(
            1
          )}% resolution rate`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Analysis Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sentiment Analysis
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            {sentimentData.map((item) => (
              <div key={item.name} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Priority Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity and Urgent Emails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Emails */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Urgent Emails
            </h3>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>

          {urgentEmails.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">No urgent emails pending!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {urgentEmails.map((email) => (
                <div
                  key={email._id}
                  onClick={() => onEmailSelect(email)}
                  className="p-3 border border-red-200 rounded-lg bg-red-50 cursor-pointer hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {email.subject}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        From: {email.senderEmail}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(email.receivedDate), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Urgent
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h3>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>

          {stats.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.priority === "urgent"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                    ></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      {activity.subject}
                    </p>
                    <p className="text-xs text-gray-500">
                      From: {activity.sender} •{" "}
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        activity.sentiment === "positive"
                          ? "bg-green-100 text-green-800"
                          : activity.sentiment === "negative"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {activity.sentiment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onEmailSelect(urgentEmails[0])}
            disabled={urgentEmails.length === 0}
            className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-red-300 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AlertTriangle className="w-5 h-5" />
            <span>Handle Urgent Email</span>
          </button>

          <button
            onClick={onFetchEmails}
            className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50"
          >
            <Mail className="w-5 h-5" />
            <span>Fetch New Emails</span>
          </button>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:bg-green-50"
          >
            <Activity className="w-5 h-5" />
            <span>Refresh Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
