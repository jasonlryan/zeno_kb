/**
 * ZENO KB - Date Utils
 *
 * Utility functions for date formatting and manipulation.
 * Used in CuratorDashboard and other components for displaying relative and formatted dates.
 *
 * Essential for user-friendly date/time display in Zeno Knowledge Base.
 */
import type { Tool } from "../types";

/**
 * Get the top 5 tools added this week, sorted by most recent first
 */
export function getTopToolsThisWeek(tools: Tool[]): Tool[] {
  return tools
    .sort((a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime())
    .slice(0, 5);
}

/**
 * Check if a tool was added within the last week
 */
export function isNewThisWeek(dateAdded: string): boolean {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return new Date(dateAdded) >= oneWeekAgo;
}

/**
 * Sort tools by date added (most recent first)
 */
export function sortByDateAdded(tools: Tool[]): Tool[] {
  return [...tools].sort(
    (a, b) => new Date(b.date_added).getTime() - new Date(a.date_added).getTime()
  );
}

/**
 * Get tools that are scheduled for featuring
 */
export function getScheduledTools(tools: Tool[]): Tool[] {
  return tools
    .filter((tool) => tool.scheduled_feature_date)
    .sort((a, b) => {
      const dateA = new Date(a.scheduled_feature_date!);
      const dateB = new Date(b.scheduled_feature_date!);
      return dateA.getTime() - dateB.getTime();
    });
}

/**
 * Get tools that should be featured today
 */
export function getTodaysFeaturedTools(tools: Tool[]): Tool[] {
  const today = new Date().toISOString().split("T")[0];
  return tools.filter((tool) => {
    if (!tool.scheduled_feature_date) return false;
    const scheduledDate = new Date(tool.scheduled_feature_date)
      .toISOString()
      .split("T")[0];
    return scheduledDate === today;
  });
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  return `${Math.floor(diffInDays / 365)} years ago`;
} 