"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTools } from "../hooks/useConfig";
import {
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  Tag,
  Hash,
  Search,
} from "lucide-react";

interface CuratorDashboardProps {
  className?: string;
}

export function CuratorDashboard({ className }: CuratorDashboardProps) {
  const [activeTab, setActiveTab] = useState<"assets" | "schedule" | "tags">(
    "assets"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const { all: allTools } = useTools();

  // Filter tools based on search query
  const filteredTools = allTools.filter((tool) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      tool.title.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.type.toLowerCase().includes(query) ||
      tool.tier.toLowerCase().includes(query) ||
      tool.tags?.some((tag: string) => tag.toLowerCase().includes(query))
    );
  });

  // Calculate real counts from filtered data
  const assetsCount = filteredTools.length;
  const scheduledCount = filteredTools.filter(
    (tool) => tool.scheduled_feature_date
  ).length;

  // Get unique tags count and frequency from filtered tools
  const allTags = filteredTools.flatMap((tool) => tool.tags || []);
  const uniqueTags = new Set(allTags);
  const tagsCount = uniqueTags.size;

  // Calculate tag frequency for tags table
  const tagFrequency = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedTags = Array.from(uniqueTags)
    .map((tag) => ({ name: tag, count: tagFrequency[tag] }))
    .sort((a, b) => b.count - a.count);

  const tabs = [
    { id: "assets" as const, label: "Assets", count: assetsCount },
    { id: "schedule" as const, label: "Schedule", count: scheduledCount },
    { id: "tags" as const, label: "Tags", count: tagsCount },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700",
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Curator Dashboard
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your content and resources
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              )}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "assets" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Asset Management
              </h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Add Asset
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Search Results Info */}
            {searchQuery && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {assetsCount === 0 ? (
                  <span>No assets found for "{searchQuery}"</span>
                ) : (
                  <span>
                    {assetsCount} asset{assetsCount !== 1 ? "s" : ""} found for
                    "{searchQuery}"
                  </span>
                )}
              </div>
            )}

            {/* Assets Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/4">
                      Asset
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Added
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTools.map((tool) => (
                    <tr
                      key={tool.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                                {tool.type.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white break-words">
                              {tool.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 break-words mt-1">
                              {tool.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {tool.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {tool.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-48">
                          {tool.tags
                            ?.slice(0, 3)
                            .map((tag: string, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                              >
                                {tag}
                              </span>
                            ))}
                          {tool.tags && tool.tags.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{tool.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {tool.date_added
                          ? new Date(tool.date_added).toLocaleDateString()
                          : "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            <ExternalLink size={16} />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                            <Edit size={16} />
                          </button>
                          <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Content Schedule
              </h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Schedule Content
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Content scheduling interface will be integrated here
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Features: Calendar view, automated publishing, content pipeline
              </p>
            </div>
          </div>
        )}

        {activeTab === "tags" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Tag Management
              </h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Create Tag
              </button>
            </div>

            {/* Tags Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tag Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Usage Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Usage %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedTags.map((tag, index) => {
                    const usagePercentage = (
                      (tag.count / filteredTools.length) *
                      100
                    ).toFixed(1);
                    const getTagCategory = (tagName: string) => {
                      if (
                        ["ai", "gpt", "automation", "machine-learning"].some(
                          (t) => tagName.includes(t)
                        )
                      )
                        return "AI & ML";
                      if (
                        ["frontend", "backend", "coding", "development"].some(
                          (t) => tagName.includes(t)
                        )
                      )
                        return "Development";
                      if (
                        ["marketing", "sales", "content", "social"].some((t) =>
                          tagName.includes(t)
                        )
                      )
                        return "Marketing";
                      if (
                        ["research", "analysis", "data"].some((t) =>
                          tagName.includes(t)
                        )
                      )
                        return "Research";
                      return "General";
                    };

                    return (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                <Hash className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {tag.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {tag.count}
                            </span>
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              asset{tag.count !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2 max-w-24">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    parseFloat(usagePercentage),
                                    100
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {usagePercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            {getTagCategory(tag.name)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                              <Edit size={16} />
                            </button>
                            <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
