"use client";

import { useState, useEffect } from "react";
import {
  Download,
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardData {
  dailyStats: {
    today: { queries: number; views: number };
    yesterday: { queries: number; views: number };
  };
  topTools: Array<{
    toolId: string;
    views: number;
    favorites: number;
  }>;
  recentQueries: Array<{
    query: string;
    timestamp: number;
    userId?: string;
  }>;
}

interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/analytics?action=dashboard");
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format: "json" | "csv" = "csv") => {
    try {
      const response = await fetch(
        `/api/analytics?action=report&format=${format}`
      );
      if (!response.ok) throw new Error("Failed to download report");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-report.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  if (loading) {
    return (
      <div className={cn("zeno-page", className)}>
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("zeno-page", className)}>
        <div className="text-center py-16">
          <p className="zeno-body text-red-600">Error: {error}</p>
          <button
            onClick={fetchDashboardData}
            className="zeno-button-blue mt-4"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={cn("zeno-page", className)}>
        <div className="text-center py-16">
          <p className="zeno-body text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  const queryChange =
    data.dailyStats.today.queries - data.dailyStats.yesterday.queries;
  const viewChange =
    data.dailyStats.today.views - data.dailyStats.yesterday.views;

  return (
    <div className={cn("zeno-page space-y-8", className)}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="zeno-heading zeno-heading-xl">Analytics Dashboard</h1>
          <p className="zeno-body text-muted-foreground">
            Track user engagement and tool performance
          </p>
        </div>
        <button
          onClick={() => downloadReport("csv")}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          title="Download CSV"
        >
          <Download size={20} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Queries Today"
          value={data.dailyStats.today.queries}
          change={queryChange}
          icon={MessageSquare}
          color="blue"
        />
        <StatCard
          title="Tool Views Today"
          value={data.dailyStats.today.views}
          change={viewChange}
          icon={Eye}
          color="green"
        />
        <StatCard
          title="Total Tools"
          value={data.topTools.length}
          icon={BarChart3}
          color="purple"
        />
        <StatCard
          title="Active Tools"
          value={data.topTools.filter((t) => t.views > 0).length}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Top Tools */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
        <div className="zeno-content-padding border-b border-gray-200 dark:border-gray-700">
          <h2 className="zeno-heading zeno-heading-lg">Top Performing Tools</h2>
          <p className="zeno-body text-muted-foreground">
            Most viewed and favorited tools
          </p>
        </div>
        <div className="zeno-content-padding">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 zeno-body font-semibold">
                    Tool ID
                  </th>
                  <th className="text-left py-2 zeno-body font-semibold">
                    Views
                  </th>
                  <th className="text-left py-2 zeno-body font-semibold">
                    Favorites
                  </th>
                  <th className="text-left py-2 zeno-body font-semibold">
                    Engagement
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.topTools.slice(0, 10).map((tool, index) => (
                  <tr
                    key={tool.toolId}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="py-3 zeno-body">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                        {tool.toolId}
                      </div>
                    </td>
                    <td className="py-3 zeno-body">{tool.views}</td>
                    <td className="py-3 zeno-body">{tool.favorites}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                (tool.favorites / Math.max(tool.views, 1)) *
                                  100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {tool.views > 0
                            ? Math.round((tool.favorites / tool.views) * 100)
                            : 0}
                          %
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Queries */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
        <div className="zeno-content-padding border-b border-gray-200 dark:border-gray-700">
          <h2 className="zeno-heading zeno-heading-lg">Recent Chat Queries</h2>
          <p className="zeno-body text-muted-foreground">
            Latest user questions and interactions
          </p>
        </div>
        <div className="zeno-content-padding">
          <div className="space-y-3">
            {data.recentQueries.slice(0, 10).map((query, index) => (
              <div
                key={index}
                className="border-b border-gray-100 dark:border-gray-800 pb-3 last:border-b-0"
              >
                <div className="flex justify-between items-start gap-4">
                  <p className="zeno-body flex-1">{query.query}</p>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(query.timestamp).toLocaleString()}
                  </div>
                </div>
                {query.userId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    User: {query.userId}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color?: "blue" | "green" | "purple" | "orange";
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color = "blue",
}: StatCardProps) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    green: "text-green-600 bg-green-50 dark:bg-green-900/20",
    purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
    orange: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="zeno-body text-muted-foreground text-sm">{title}</p>
          <p className="zeno-heading text-2xl font-bold mt-1">
            {value.toLocaleString()}
          </p>
          {change !== undefined && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${
                change >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              <TrendingUp
                size={14}
                className={change < 0 ? "rotate-180" : ""}
              />
              {change >= 0 ? "+" : ""}
              {change} vs yesterday
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
