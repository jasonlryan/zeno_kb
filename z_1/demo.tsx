"use client";
import {
  ToolCardDemo,
  CategoryTileDemo,
  ChatPanelDemo,
  TopSearchBar,
  ToolGrid,
  FeaturedCarousel,
  CategoryGrid,
  CuratorDashboard,
} from "./components";
import {
  LayoutDashboard,
  Wrench,
  Grid3X3,
  Settings,
  BarChart3,
} from "lucide-react";
import type { Tool, Category, SidebarSection } from "./types";

// Sample data
const sampleTools: Tool[] = [
  {
    id: "1",
    title: "GPT-4 Code Assistant",
    description:
      "Advanced AI assistant for code generation, debugging, and optimization.",
    type: "GPT",
    tier: "Specialist",
    complexity: "Intermediate",
    tags: ["JavaScript", "Python", "React"],
    featured: true,
    function: "Content & Creative",
    link: "https://chat.openai.com/g/code-assistant",
    date_added: "2024-01-15T10:00:00Z",
    added_by: "curator-1",
    scheduled_feature_date: undefined,
  },
  {
    id: "2",
    title: "React Documentation Hub",
    description:
      "Comprehensive documentation and examples for React development.",
    type: "Doc",
    tier: "Foundation",
    complexity: "Beginner",
    tags: ["React", "Documentation", "Frontend"],
    featured: true,
    function: "Best Practice Guides",
    link: "https://react.dev/learn",
    date_added: "2024-01-20T14:30:00Z",
    added_by: "curator-2",
    scheduled_feature_date: undefined,
  },
  {
    id: "3",
    title: "Python Data Analysis Script",
    description:
      "Automated script for data cleaning and analysis using pandas.",
    type: "Script",
    tier: "Specialist",
    complexity: "Advanced",
    tags: ["Python", "Data Science", "Pandas"],
    function: "Strategy & Planning",
    link: "https://github.com/python-data-analysis",
    date_added: "2024-01-25T09:30:00Z",
    added_by: "curator-3",
    scheduled_feature_date: undefined,
  },
];

const sampleCategories: Category[] = [
  {
    id: "1",
    icon: "Bot",
    title: "AI Assistants",
    description: "Intelligent chatbots and AI-powered tools",
    count: 24,
  },
  {
    id: "2",
    icon: "FileText",
    title: "Documentation",
    description: "Guides, tutorials, and reference materials",
    count: 67,
  },
  {
    id: "3",
    icon: "Code",
    title: "Scripts & Tools",
    description: "Automation scripts and utility tools",
    count: 43,
  },
  {
    id: "4",
    icon: "Video",
    title: "Video Tutorials",
    description: "Step-by-step video guides and courses",
    count: 18,
  },
];

const sidebarSections: SidebarSection[] = [
  {
    id: "main",
    title: "Main",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/",
        active: true,
      },
      { id: "tools", title: "Tools", icon: Wrench, href: "/tools" },
      {
        id: "categories",
        title: "Categories",
        icon: Grid3X3,
        href: "/categories",
      },
    ],
  },
  {
    id: "management",
    title: "Management",
    items: [
      {
        id: "curator",
        title: "Curator Dashboard",
        icon: Settings,
        href: "/curator",
      },
      {
        id: "analytics",
        title: "Analytics",
        icon: BarChart3,
        href: "/analytics",
      },
    ],
  },
];

export default function ComponentDemo() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Zeno Knows Component Library
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Production-ready React components for AI tool knowledge hubs
          </p>
        </div>

        {/* Individual Component Demos */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Component Demos
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tool Card</h3>
              <ToolCardDemo />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Category Tile</h3>
              <CategoryTileDemo />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Chat Panel</h3>
              <ChatPanelDemo />
            </div>
          </div>
        </section>

        {/* Search Bar Demo */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Search Bar
          </h2>
          <TopSearchBar onSubmit={(query) => console.log("Search:", query)} />
        </section>

        {/* Featured Carousel */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Featured Carousel
          </h2>
          <FeaturedCarousel
            tools={sampleTools}
            onSelect={(id) => console.log("Selected tool:", id)}
          />
        </section>

        {/* Tool Grid */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Tool Grid
          </h2>
          <ToolGrid
            tools={sampleTools}
            onSelect={(id) => console.log("Selected tool:", id)}
          />
        </section>

        {/* Category Grid */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Category Grid
          </h2>
          <CategoryGrid
            categories={sampleCategories}
            onSelect={(id) => console.log("Selected category:", id)}
          />
        </section>

        {/* Curator Dashboard */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Curator Dashboard
          </h2>
          <CuratorDashboard />
        </section>
      </div>
    </div>
  );
}
