"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAPITools } from "../hooks/useAPITools";
import { useConfig } from "../hooks/useConfig";
import {
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  Tag,
  Hash,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { ToolFormModal } from "./ToolFormModal";
import { formatRelativeTime } from "@/lib/dateUtils";
import type { Tool } from "../types";

interface CuratorDashboardProps {
  className?: string;
}

type SortField =
  | "title"
  | "description"
  | "type"
  | "categories"
  | "lastUpdated";
type SortDirection = "asc" | "desc";

export function CuratorDashboard({ className }: CuratorDashboardProps) {
  const [activeTab, setActiveTab] = useState<"assets" | "tags">("assets");
  const [searchQuery, setSearchQuery] = useState("");
  const { all: allTools, loading } = useAPITools();
  const { dataConfig } = useConfig();

  // Editing state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | undefined>(undefined);
  const [tools, setTools] = useState<Tool[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("lastUpdated");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Update tools when allTools changes
  useEffect(() => {
    setTools(allTools);
  }, [allTools]);

  // Helper function to get the most recent date for a tool
  const getLastUpdated = (tool: Tool): Date => {
    // Check for date_modified first (if it's not empty string)
    if (tool.date_modified && tool.date_modified.trim() !== "") {
      return new Date(tool.date_modified);
    }

    // Fall back to date_created
    if (tool.date_created && tool.date_created.trim() !== "") {
      return new Date(tool.date_created);
    }

    // Final fallback to current date
    return new Date();
  };

  // Helper function to get tag categories for a tool
  const getToolTagCategories = (tool: Tool) => {
    if (!tool.tags || !Array.isArray(tool.tags) || !dataConfig?.tagCategories) {
      return [];
    }

    const tagCategories = dataConfig.tagCategories;
    return Object.values(tagCategories).filter((category: any) =>
      tool.tags?.some((tag: string) => category.tags.includes(tag))
    );
  };

  // Handle column sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Sort function
  const sortTools = (tools: Tool[]): Tool[] => {
    return [...tools].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "title":
          aValue = a.title?.toLowerCase() || "";
          bValue = b.title?.toLowerCase() || "";
          break;
        case "description":
          aValue = a.description?.toLowerCase() || "";
          bValue = b.description?.toLowerCase() || "";
          break;
        case "type":
          aValue = a.type?.toLowerCase() || "";
          bValue = b.type?.toLowerCase() || "";
          break;
        case "categories":
          aValue = getToolTagCategories(a)
            .map((cat: any) => cat.name)
            .join(", ")
            .toLowerCase();
          bValue = getToolTagCategories(b)
            .map((cat: any) => cat.name)
            .join(", ")
            .toLowerCase();
          break;
        case "lastUpdated":
          aValue = getLastUpdated(a).getTime();
          bValue = getLastUpdated(b).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  // Filter tools based on search query
  const filteredTools = tools.filter((tool) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      tool.title?.toLowerCase().includes(query) ||
      tool.description?.toLowerCase().includes(query) ||
      tool.type?.toLowerCase().includes(query) ||
      tool.tier?.toLowerCase().includes(query) ||
      tool.tags?.some((tag: string) => tag?.toLowerCase().includes(query))
    );
  });

  // Apply sorting to filtered tools
  const sortedTools = sortTools(filteredTools);

  // Calculate real counts from filtered data
  const assetsCount = filteredTools.length;

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
    { id: "tags" as const, label: "Tags", count: tagsCount },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Sortable column header component
  const SortableHeader = ({
    field,
    children,
    className = "",
  }: {
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }) => (
    <th
      className={cn(
        "px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-black hover:bg-opacity-10 transition-colors",
        className
      )}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <div className="flex flex-col">
          <ChevronUp
            size={12}
            className={cn(
              "transition-colors",
              sortField === field && sortDirection === "asc"
                ? "text-white"
                : "text-white text-opacity-60"
            )}
          />
          <ChevronDown
            size={12}
            className={cn(
              "transition-colors -mt-1",
              sortField === field && sortDirection === "desc"
                ? "text-white"
                : "text-white text-opacity-60"
            )}
          />
        </div>
      </div>
    </th>
  );

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700",
        className
      )}
    >
      {/* Header */}
      <div className="zeno-content-padding border-b border-gray-200 dark:border-gray-700">
        <h2 className="zeno-heading text-xl font-semibold text-foreground dark:text-white">
          Curator Dashboard
        </h2>
        <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
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
                  : "border-transparent text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-300"
              )}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-muted-foreground dark:text-gray-400 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="zeno-content-padding">
        {activeTab === "assets" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-foreground dark:text-white">
                Asset Management
              </h3>
              <button
                className="zeno-button-blue"
                onClick={() => {
                  setEditingTool(undefined);
                  setIsModalOpen(true);
                }}
              >
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
                className="zeno-search pl-10 pr-10 bg-white dark:bg-gray-700 text-foreground dark:text-white zeno-placeholder"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-muted-foreground dark:hover:text-gray-300"
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

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex">
                  <div className="text-red-800 dark:text-red-200 text-sm">
                    {error}
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Search Results Info */}
            {searchQuery && (
              <div className="text-sm text-muted-foreground dark:text-gray-400">
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
                <thead className="bg-primary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-32">
                      Actions
                    </th>
                    <SortableHeader field="title" className="w-1/5">
                      Asset
                    </SortableHeader>

                    <SortableHeader field="type">Type</SortableHeader>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Featured
                    </th>
                    <SortableHeader field="categories">
                      Categories
                    </SortableHeader>
                    <SortableHeader field="lastUpdated">
                      Last Updated
                    </SortableHeader>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedTools.map((tool) => (
                    <tr
                      key={tool.id}
                      className="hover:bg-muted dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 zeno-nowrap text-left text-sm font-medium">
                        <div className="flex items-center justify-start space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            disabled={!tool.url}
                            title={tool.url ? "Open link" : "No URL available"}
                            onClick={() => {
                              if (tool.url) {
                                window.open(
                                  tool.url,
                                  "_blank",
                                  "noopener,noreferrer"
                                );
                              }
                            }}
                          >
                            <ExternalLink size={16} />
                          </button>
                          <button
                            className="text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-300"
                            onClick={() => {
                              setEditingTool(tool);
                              setIsModalOpen(true);
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => setDeleteConfirmId(tool.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        {/* Delete confirmation dialog */}
                        {deleteConfirmId === tool.id && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
                              <h3 className="text-lg font-semibold mb-4 break-words text-center">
                                Are you sure you want to delete this asset?
                              </h3>
                              <div className="flex justify-center space-x-4">
                                <button
                                  className="px-4 py-2 bg-gray-300 text-foreground rounded hover:bg-gray-400 transition-colors"
                                  onClick={() => setDeleteConfirmId(null)}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                                  disabled={isDeleting === tool.id}
                                  onClick={async () => {
                                    setIsDeleting(tool.id);
                                    setError(null);

                                    try {
                                      const res = await fetch(
                                        `/api/tools/${tool.id}`,
                                        {
                                          method: "DELETE",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                        }
                                      );

                                      if (res.ok) {
                                        setTools((prev) =>
                                          prev.filter((t) => t.id !== tool.id)
                                        );
                                      } else {
                                        const errorData = await res
                                          .json()
                                          .catch(() => ({}));
                                        setError(
                                          errorData.error ||
                                            "Failed to delete asset"
                                        );
                                      }
                                    } catch (err) {
                                      setError("Network error occurred");
                                    } finally {
                                      setDeleteConfirmId(null);
                                      setIsDeleting(null);
                                    }
                                  }}
                                >
                                  {isDeleting === tool.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 w-1/3">
                        <div className="flex items-start">
                          <div className="ml-0 min-w-0 flex-1">
                            <div className="text-sm font-medium text-foreground dark:text-white">
                              {tool.title}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 zeno-nowrap">
                        <span className="zeno-type">{tool.type || "-"}</span>
                      </td>
                      <td className="px-6 py-4 zeno-nowrap">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              const updatedTool = {
                                ...tool,
                                featured: !tool.featured,
                              };
                              const res = await fetch(`/api/tools/${tool.id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(updatedTool),
                              });
                              if (res.ok) {
                                setTools((prev) =>
                                  prev.map((t) =>
                                    t.id === tool.id ? updatedTool : t
                                  )
                                );
                              }
                            } catch (error) {
                              console.error(
                                "Error updating featured status:",
                                error
                              );
                            }
                          }}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                            tool.featured
                              ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {tool.featured ? "✓ Featured" : "Set Featured"}
                        </button>
                      </td>
                      <td className="px-6 py-4 zeno-nowrap">
                        {(() => {
                          const toolTagCategories = getToolTagCategories(tool);
                          return toolTagCategories.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {toolTagCategories.map((category: any) => (
                                <button
                                  key={category.id}
                                  className="zeno-category text-xs"
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log(
                                      "Tag category clicked:",
                                      category.name
                                    );
                                  }}
                                >
                                  {category.name}
                                </button>
                              ))}
                            </div>
                          ) : (
                            "-"
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 zeno-nowrap text-sm text-muted-foreground dark:text-gray-400">
                        {(tool.date_modified &&
                          tool.date_modified.trim() !== "") ||
                        (tool.date_created &&
                          tool.date_created.trim() !== "") ? (
                          <div className="flex flex-col">
                            <span>
                              {formatRelativeTime(
                                getLastUpdated(tool).toISOString()
                              )}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-muted-foreground">
                              {getLastUpdated(tool).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span>Recently added</span>
                            <span className="text-xs text-gray-400 dark:text-muted-foreground">
                              {new Date().toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* ToolFormModal for add/edit */}
            <ToolFormModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              tool={editingTool}
              onSave={async (toolData) => {
                setError(null);

                if (editingTool) {
                  // Edit existing - persist to API
                  try {
                    const res = await fetch(`/api/tools/${editingTool.id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(toolData),
                    });
                    if (res.ok) {
                      const { tool: updatedTool } = await res.json();
                      setTools((prev) =>
                        prev.map((t) =>
                          t.id === editingTool.id ? updatedTool : t
                        )
                      );
                    } else {
                      const errorData = await res.json().catch(() => ({}));
                      setError(errorData.error || "Failed to update asset");
                      // fallback: update locally if API fails
                      setTools((prev) =>
                        prev.map((t) =>
                          t.id === editingTool.id ? { ...t, ...toolData } : t
                        )
                      );
                    }
                  } catch (err) {
                    setError("Network error occurred while updating");
                    console.error("Update error:", err);
                    // fallback: update locally if API fails
                    setTools((prev) =>
                      prev.map((t) =>
                        t.id === editingTool.id ? { ...t, ...toolData } : t
                      )
                    );
                  }
                } else {
                  // Add new (persist to API)
                  try {
                    const res = await fetch("/api/tools", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(toolData),
                    });
                    if (res.ok) {
                      const { tool: newTool } = await res.json();
                      setTools((prev) => [newTool, ...prev]);
                    } else {
                      const errorData = await res.json().catch(() => ({}));
                      setError(errorData.error || "Failed to create asset");
                      // fallback: add locally if API fails
                      const newTool: Tool = {
                        ...toolData,
                        id: Date.now().toString(),
                        title: toolData.title || "New Tool",
                        url: toolData.url || "",
                        type: toolData.type || "Tool",
                        categories: toolData.categories || [],
                      };
                      setTools((prev) => [newTool, ...prev]);
                    }
                  } catch (err) {
                    setError("Network error occurred while creating");
                    console.error("Create error:", err);
                    const newTool: Tool = {
                      ...toolData,
                      id: Date.now().toString(),
                      title: toolData.title || "New Tool",
                      url: toolData.url || "",
                      type: toolData.type || "Tool",
                      categories: toolData.categories || [],
                    };
                    setTools((prev) => [newTool, ...prev]);
                  }
                }
              }}
            />
          </div>
        )}

        {activeTab === "tags" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-foreground dark:text-white">
                Tag Management
              </h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Create Tag
              </button>
            </div>

            {/* Tags Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-muted dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-gray-300 uppercase tracking-wider">
                      Tag Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-gray-300 uppercase tracking-wider">
                      Usage Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-gray-300 uppercase tracking-wider">
                      Usage %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground dark:text-gray-300 uppercase tracking-wider">
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
                        className="hover:bg-muted dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 zeno-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                <Hash className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-foreground dark:text-white">
                                {tag.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 zeno-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-foreground dark:text-white">
                              {tag.count}
                            </span>
                            <span className="ml-2 text-xs text-muted-foreground dark:text-gray-400">
                              asset{tag.count !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 zeno-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2 max-w-24">
                              <div
                                className="bg-blue-600 h-2 rounded-full zeno-progress-bar"
                                style={
                                  {
                                    "--progress-width": `${Math.min(
                                      parseFloat(usagePercentage),
                                      100
                                    )}%`,
                                  } as React.CSSProperties
                                }
                              ></div>
                            </div>
                            <span className="text-sm text-foreground dark:text-white">
                              {usagePercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 zeno-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            {getTagCategory(tag.name)}
                          </span>
                        </td>
                        <td className="px-6 py-4 zeno-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-300">
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
