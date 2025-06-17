"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface CuratorDashboardProps {
  className?: string
}

export function CuratorDashboard({ className }: CuratorDashboardProps) {
  const [activeTab, setActiveTab] = useState<"assets" | "schedule" | "tags">("assets")

  const tabs = [
    { id: "assets" as const, label: "Assets", count: 156 },
    { id: "schedule" as const, label: "Schedule", count: 8 },
    { id: "tags" as const, label: "Tags", count: 42 },
  ]

  return (
    <div
      className={cn("bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700", className)}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Curator Dashboard</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your content and resources</p>
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
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300",
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
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Asset Management</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Add Asset
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">Asset management table will be integrated here</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Features: Upload, categorize, tag, and manage all resources
              </p>
            </div>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Content Schedule</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Schedule Content
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">Content scheduling interface will be integrated here</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Features: Calendar view, automated publishing, content pipeline
              </p>
            </div>
          </div>
        )}

        {activeTab === "tags" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tag Management</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Create Tag
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">Tag management system will be integrated here</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Features: Create, edit, merge tags, and manage taxonomy
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
