"use client"

import { ToolCardDemo } from "./components/ToolCard"
import { CategoryTileDemo } from "./components/CategoryTile"
import { ChatPanelDemo } from "./components/ChatPanel"
import { CuratorDashboard } from "./components/CuratorDashboard"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Zeno Knows Component Library</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Production-ready React components for AI tool knowledge hubs
          </p>
        </div>

        {/* Individual Component Demos */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Component Demos</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tool Card</h3>
              <ToolCardDemo />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Category Tile</h3>
              <CategoryTileDemo />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chat Panel</h3>
              <div className="h-96">
                <ChatPanelDemo />
              </div>
            </div>
          </div>
        </section>

        {/* Curator Dashboard */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Curator Dashboard</h2>
          <CuratorDashboard />
        </section>
      </div>
    </div>
  )
}
