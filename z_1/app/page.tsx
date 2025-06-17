"use client";

import { useState } from "react";
import { Home, Search, BookOpen, Settings, Users, Zap } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { ToolCardDemo } from "../components/ToolCard";
import { CategoryTileDemo } from "../components/CategoryTile";
import { ChatPanelDemo } from "../components/ChatPanel";
import { CuratorDashboard } from "../components/CuratorDashboard";
import { FeaturedCarousel } from "../components/FeaturedCarousel";
import { CategoryGrid } from "../components/CategoryGrid";
import { ToolGrid } from "../components/ToolGrid";
import { useLocalSearch } from "../hooks/useLocalSearch";
import type { Tool, Category, SidebarSection } from "../types";

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
    tags: ["coding", "ai", "debugging"],
    featured: true,
    function: "Content & Creative",
    link: "https://chat.openai.com/g/code-assistant",
    date_added: "2024-01-15T10:00:00Z",
    added_by: "curator-1",
    scheduled_feature_date: undefined,
  },
  {
    id: "2",
    title: "API Documentation Generator",
    description:
      "Automatically generate comprehensive API documentation from your codebase.",
    type: "Script",
    tier: "Foundation",
    complexity: "Beginner",
    tags: ["documentation", "api", "automation"],
    featured: true,
    function: "Ops & Governance",
    link: "https://github.com/api-doc-generator",
    date_added: "2024-01-20T14:30:00Z",
    added_by: "curator-2",
    scheduled_feature_date: undefined,
  },
  {
    id: "3",
    title: "React Best Practices Guide",
    description:
      "Comprehensive guide covering modern React development patterns and practices.",
    type: "Doc",
    tier: "Foundation",
    complexity: "Intermediate",
    tags: ["react", "frontend", "best-practices"],
    function: "Best Practice Guides",
    link: "https://example.com/react-best-practices.pdf",
    date_added: "2024-01-10T11:00:00Z",
    added_by: "curator-3",
    scheduled_feature_date: undefined,
  },
  {
    id: "4",
    title: "Advanced TypeScript Tutorial",
    description: "Deep dive into TypeScript advanced features and patterns.",
    type: "Video",
    tier: "Specialist",
    complexity: "Advanced",
    tags: ["typescript", "tutorial", "advanced"],
    function: "Best Practice Guides",
    link: "https://www.youtube.com/watch?v=typescript-advanced",
    date_added: "2024-01-25T09:30:00Z",
    added_by: "curator-1",
    scheduled_feature_date: undefined,
  },
];

const sampleCategories: Category[] = [
  {
    id: "1",
    icon: "🤖",
    title: "AI Assistants",
    description: "Powerful AI tools for various tasks",
    count: 24,
  },
  {
    id: "2",
    icon: "📚",
    title: "Documentation",
    description: "Guides, tutorials, and references",
    count: 156,
  },
  {
    id: "3",
    icon: "⚡",
    title: "Scripts & Tools",
    description: "Automation and utility scripts",
    count: 89,
  },
  {
    id: "4",
    icon: "🎥",
    title: "Video Tutorials",
    description: "Step-by-step video guides",
    count: 67,
  },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<
    "home" | "search" | "library" | "curator" | "users" | "analytics" | "demos"
  >("home");

  const filteredTools = useLocalSearch(sampleTools, searchQuery);

  // Create sidebar sections with proper active state
  const sidebarSections: SidebarSection[] = [
    {
      id: "main",
      title: "Main",
      items: [
        {
          id: "home",
          title: "Home",
          icon: Home,
          active: activeView === "home",
        },
        {
          id: "search",
          title: "Search",
          icon: Search,
          active: activeView === "search",
        },
        {
          id: "library",
          title: "Library",
          icon: BookOpen,
          active: activeView === "library",
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
          active: activeView === "curator",
        },
        {
          id: "users",
          title: "Users",
          icon: Users,
          active: activeView === "users",
        },
        {
          id: "analytics",
          title: "Analytics",
          icon: Zap,
          active: activeView === "analytics",
        },
      ],
    },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setActiveView("search");
    }
  };

  const handleNavigate = (itemId: string) => {
    console.log("Navigating to:", itemId);
    setActiveView(itemId as any);
  };

  const handleToolSelect = (id: string) => {
    console.log("Selected tool:", id);
  };

  const handleCategorySelect = (id: string) => {
    console.log("Selected category:", id);
  };

  const renderMainContent = () => {
    switch (activeView) {
      case "home":
        return (
          <div className="space-y-16">
            {/* Featured Tools */}
            <FeaturedCarousel tools={sampleTools} onSelect={handleToolSelect} />

            {/* Categories */}
            <section className="zeno-section-spacing">
              <h2 className="zeno-heading text-card-foreground mb-6">
                Browse categories
              </h2>
              <CategoryGrid
                categories={sampleCategories}
                onSelect={handleCategorySelect}
              />
            </section>

            {/* All Tools */}
            <section className="zeno-section-spacing">
              <h2 className="zeno-heading text-card-foreground mb-6">
                All tools
              </h2>
              <ToolGrid tools={sampleTools} onSelect={handleToolSelect} />
            </section>
          </div>
        );

      case "search":
        return (
          <div className="space-y-8">
            <section>
              <h2 className="zeno-heading text-card-foreground mb-6">
                {searchQuery
                  ? `Search results for "${searchQuery}"`
                  : "Search tools"}
              </h2>
              {searchQuery ? (
                <ToolGrid tools={filteredTools} onSelect={handleToolSelect} />
              ) : (
                <div className="text-center py-16">
                  <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="zeno-body text-muted-foreground">
                    Use the search bar above to find tools
                  </p>
                </div>
              )}
            </section>
          </div>
        );

      case "library":
        return (
          <div className="space-y-8">
            <section>
              <h2 className="zeno-heading text-card-foreground mb-6">
                Your library
              </h2>
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="zeno-body text-muted-foreground">
                  Your saved tools and bookmarks will appear here
                </p>
              </div>
            </section>
          </div>
        );

      case "curator":
        return <CuratorDashboard />;

      case "users":
        return (
          <div className="space-y-8">
            <section>
              <h2 className="zeno-heading text-card-foreground mb-6">
                User management
              </h2>
              <div className="text-center py-16">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="zeno-body text-muted-foreground">
                  User management features coming soon
                </p>
              </div>
            </section>
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-8">
            <section>
              <h2 className="zeno-heading text-card-foreground mb-6">
                Analytics dashboard
              </h2>
              <div className="text-center py-16">
                <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="zeno-body text-muted-foreground">
                  Analytics and insights coming soon
                </p>
              </div>
            </section>
          </div>
        );

      case "demos":
        return (
          <div className="space-y-16">
            <section>
              <h2 className="zeno-heading text-card-foreground mb-8">
                Component demos
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h3 className="zeno-emphasis text-card-foreground mb-4">
                    Tool card
                  </h3>
                  <ToolCardDemo />
                </div>
                <div>
                  <h3 className="zeno-emphasis text-card-foreground mb-4">
                    Category tile
                  </h3>
                  <CategoryTileDemo />
                </div>
              </div>
            </section>
            <section>
              <h3 className="zeno-emphasis text-card-foreground mb-4">
                Chat panel
              </h3>
              <ChatPanelDemo />
            </section>
          </div>
        );

      default:
        return (
          <div className="text-center py-16">
            <p className="zeno-body text-muted-foreground">Page not found</p>
          </div>
        );
    }
  };

  return (
    <AppShell
      sidebarSections={sidebarSections}
      onSearch={handleSearch}
      onNavigate={handleNavigate}
    >
      <div className="zeno-section-spacing space-y-16">
        {/* Navigation buttons for demo purposes */}
        <div className="flex space-x-4 mb-8 border-b border-border pb-4">
          <button
            onClick={() => setActiveView("demos")}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeView === "demos"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary"
            }`}
          >
            Component demos
          </button>
        </div>

        {renderMainContent()}
      </div>
    </AppShell>
  );
}
