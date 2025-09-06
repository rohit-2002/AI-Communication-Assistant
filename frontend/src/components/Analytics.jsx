import React, { useState, useEffect } from "react";
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
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  Calendar,
  Filter,
  Download,
} from "lucide-react";
import { statsService } from "../services/api";

const Analytics = ({ stats, emails }) => {
  const [timelineData, setTimelineData] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [performanceStats, setPerformanceStats] = useState(null);
  const [topSenders, setTopSenders] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [timelineRes, categoryRes, performanceRes, sendersRes] =
        await Promise.all([
          statsService.getTimelineStats(selectedPeriod),
          statsService.getCategoryStats(),
          statsService.getPerformanceStats(),
          statsService.getTopSenders(10),
        ]);

      setTimelineData(timelineRes.data.data.timeline || []);
      setCategoryStats(categoryRes.data.data || []);
      setPerformanceStats(performanceRes.data.data || {});
      setTopSenders(sendersRes.data.data || []);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  // Format timeline data for charts
  const formattedTimelineData = timelineData.map((item) => ({
    period:
      selectedPeriod === "day"
        ? `${item._id.hour}:00`
        : selectedPeriod === "week"
        ? `${item._id.month}/${item._id.day}`
        : `Week ${item._id.week}`,
    totalEmails: item.totalEmails,
    urgentEmails: item.urgentEmails,
    positiveEmails: item.positiveEmails,
    negativeEmails: item.negativeEmails,
    resolvedEmails: item.resolvedEmails,
  }));

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
    subtitle,
  }) => (
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
      {change && (
        <div className="mt-4 flex items-center">
          {change > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span
            className={`text-sm ${
              change > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {Math.abs(change)}% from last period
          </span>
        </div>
      )}
    </div>
  );

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Comprehensive insights into your email management
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>

          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      {performanceStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Emails"
            value={performanceStats.totalEmails}
            icon={Users}
            color="bg-blue-500"
            subtitle="All time"
            change={performanceStats.performance?.weeklyGrowth}
          />
          <MetricCard
            title="Avg Response Time"
            value={`${performanceStats.avgResponseTime}h`}
            icon={Clock}
            color="bg-green-500"
            subtitle="Hours to respond"
          />
          <MetricCard
            title="Resolution Rate"
            value={`${performanceStats.resolutionRate}%`}
            icon={Target}
            color="bg-purple-500"
            subtitle="Emails resolved"
          />
          <MetricCard
            title="Daily Average"
            value={performanceStats.performance?.dailyAverage}
            icon={Calendar}
            color="bg-orange-500"
            subtitle="Emails per day"
          />
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Email Volume Over Time
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedTimelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="totalEmails"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="urgentEmails"
                  stackId="2"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sentiment Distribution
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
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Category Performance
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
                <Bar dataKey="urgentCount" fill="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resolution Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resolution Trends
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedTimelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="resolvedEmails"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: "#10B981" }}
                />
                <Line
                  type="monotone"
                  dataKey="totalEmails"
                  stroke="#6B7280"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#6B7280" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Senders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Email Senders
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Emails
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Sentiment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Email
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topSenders.map((sender, index) => (
                <tr key={sender._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {sender._id.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {sender._id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sender.emailCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        sender.urgentCount > 0
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {sender.urgentCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          sender.avgSentiment > 0.1
                            ? "bg-green-400"
                            : sender.avgSentiment < -0.1
                            ? "bg-red-400"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-900">
                        {sender.avgSentiment > 0.1
                          ? "Positive"
                          : sender.avgSentiment < -0.1
                          ? "Negative"
                          : "Neutral"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sender.lastEmailDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {stats
                ? Math.round((stats.urgentEmails / stats.totalEmails) * 100)
                : 0}
              %
            </div>
            <p className="text-sm text-blue-800">Emails marked as urgent</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {stats
                ? Math.round((stats.resolvedEmails / stats.totalEmails) * 100)
                : 0}
              %
            </div>
            <p className="text-sm text-green-800">Resolution rate</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {performanceStats?.performance?.dailyAverage || 0}
            </div>
            <p className="text-sm text-purple-800">Average emails per day</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
