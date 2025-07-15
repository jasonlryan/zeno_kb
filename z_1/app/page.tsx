"use client";

import React, { useState } from "react";
import {
  Home,
  Search,
  BookOpen,
  Settings,
  Users,
  Zap,
  Filter,
  ChevronLeft,
  MessageCircle, // Add this import
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { ToolCardDemo } from "../components/ToolCard";
import { CategoryTileDemo } from "../components/CategoryTile";
import { ChatPanelDemo } from "../components/ChatPanel";
import { CuratorDashboard } from "../components/CuratorDashboard";
import { FeaturedCarousel } from "../components/FeaturedCarousel";
import { CategoryGrid } from "../components/CategoryGrid";
import { ToolGrid } from "../components/ToolGrid";
// FILTERS: Conditionally imported based on feature flag
import { FilterPanel } from "../components/FilterPanel";
import { ToolDetailPage } from "../components/ToolDetailModal";
import { useLocalSearch } from "../hooks/useLocalSearch";
// import { useTaxonomy } from "../hooks/useTaxonomy";
import {
  useConfig,
  useNavigation,
  useTools,
  useCategories,
  useText,
} from "../hooks/useConfig";
import { useAPITools } from "../hooks/useAPITools";
import { generateCategoriesFromData } from "../lib/mockData";
import { featureFlags } from "../lib/featureFlags";
import type { Tool, Category, SidebarSection } from "../types";
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";

// Configuration data loaded from config files

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<
    | "home"
    | "search"
    | "library"
    | "curator"
    | "users"
    | "analytics"
    | "demos"
    | "tool-detail"
    | "category"
    | "comment-retrieval" // Add this state
  >("home");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // FILTERS: Only enable if feature flag is on
  const [isFilterOpen, setIsFilterOpen] = useState(
    false && featureFlags.enableFilters
  );

  // Load configuration data
  const { app } = useConfig();
  const navigation = useNavigation();
  const {
    all: allTools,
    featured: featuredTools,
    loading: toolsLoading,
    count: toolsCount,
  } = useAPITools();
  const categories = useCategories();
  const { role } = useSupabaseAuth();

  // FILTERS: Debug log for development
  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // console.log("🚩 Filters enabled:", featureFlags.enableFilters);
    }
  }, []);

  // Temporarily disable taxonomy system for debugging
  // const {
  //   filteredTools: taxonomyFilteredTools,
  //   searchTools,
  //   hasActiveFilters,
  //   clearFilters,
  // } = useTaxonomy(allTools);

  // Always call useLocalSearch (Rules of Hooks)
  const localSearchResults = useLocalSearch(allTools, searchQuery);

  // Use local search for now - if no search query, show all tools
  const displayTools = searchQuery.trim() ? localSearchResults : allTools;
  const hasActiveFilters = false;

  // Filter tools by category (function-based categories)
  const getToolsByCategory = (categoryTitle: string): Tool[] => {
    // Map category titles to the functions they contain
    const categoryFunctionMap: Record<string, string[]> = {
      Other: [
        "Audience Research",
        "Executive Research",
        "Technology Research",
        "Marketing Research",
        "Trend Analysis",
        "Industry Analysis",
        "Financial Analysis",
        "Workplace Analysis",
        "Media Analysis",
        "Social Media Analysis",
        "Digital Analysis",
        "Real-time Social Media",
        "Real-time News",
        "Analysis & Research",
      ],
      "Content & Creative": [
        "Content & Creative",
        "Brand & Voice",
        "Content Creation",
        "Social Media",
        "Social Trends & Idea Generators",
      ],
      "Strategy & Analysis": [
        "Strategy & Planning",
        "Audience Insights",
        "Campaign & Competitive Analysis",
        "Research & Analysis",
      ],
      "Media & Communications": [
        "Media Relations",
        "Media List Creation",
        "Executive Voice Emulation",
      ],
    };

    const functions = categoryFunctionMap[categoryTitle];
    if (!functions) {
      return [];
    }

    // Return tools that have functions belonging to this category
    return allTools.filter((tool) => functions.includes(tool.function));
  };

  // Get text values at top level to avoid hook violations
  const categoriesTitle = useText("pages.home.sections.categories.title");

  // Icon mapping for navigation
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Home,
    Search,
    BookOpen,
    Settings,
    Users,
    Zap,
    MessageCircle, // Add this to the icon map
  };

  // Create sidebar sections with proper active state from config
  let filteredSidebarSections = navigation
    .map((section) => ({
      ...section,
      items: section.items
        .filter((item) => {
          // If permissions are specified, only show if user role is included
          if (item.permissions && item.permissions.length > 0) {
            return role && item.permissions.includes(role);
          }
          // If no permissions specified, show to all
          return true;
        })
        .map((item) => ({
          ...item,
          icon:
            typeof item.icon === "string"
              ? iconMap[item.icon] || Home
              : item.icon,
          active: activeView === item.id,
        })),
    }))
    // Remove sections with no visible items
    .filter((section) => section.items.length > 0);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Always switch to search view when user starts searching
    setActiveView("search");
  };

  const handleNavigate = (itemId: string) => {
    // console.log("Navigating to:", itemId);
    setActiveView(itemId as any);
  };

  const handleToolSelect = (id: string) => {
    const tool = allTools.find((t) => t.id === id);
    if (tool) {
      setSelectedTool(tool);
      setActiveView("tool-detail");
    }
  };

  const handleBackToHome = () => {
    setSelectedTool(null);
    setSelectedCategory(null);
    setActiveView("home");
  };

  const handleCategorySelect = (id: string) => {
    const category = categories.find((c) => c.id === id);
    if (category) {
      setSelectedCategory(category.title);
      setActiveView("category");
    }
  };

  const renderMainContent = () => {
    switch (activeView) {
      case "home":
        return (
          <div className="space-y-8">
            {/* Page Title */}
            <section className="text-center py-8">
              <h1 className="text-4xl font-bold text-green-600 mb-2">
                Welcome to the Zeno Knowledge Hub
              </h1>
              <p className="text-xl text-gray-900 dark:text-gray-100">
                Your AI toolkit, all in one place
              </p>
            </section>

            {/* AI Chat Assistant */}
            <section className="max-w-5xl mx-auto sticky top-4 z-10">
              <div className="bg-white rounded-lg shadow-xl">
                <ChatPanelDemo />
              </div>
            </section>

            {/* Featured Tools */}
            <FeaturedCarousel
              tools={featuredTools}
              onSelect={handleToolSelect}
            />

            {/* Categories */}
            <section>
              <h2 className="zeno-heading text-card-foreground mb-6">
                {categoriesTitle}
              </h2>
              <CategoryGrid
                categories={categories}
                onSelect={handleCategorySelect}
              />
            </section>

            {/* All Tools */}
            <section>
              <h2 className="zeno-heading text-card-foreground mb-6">
                All tools ({toolsLoading ? "Loading..." : `${toolsCount} tools`}
                )
              </h2>
              <ToolGrid tools={allTools} onSelect={handleToolSelect} />
            </section>
          </div>
        );

      case "search":
        return (
          <div className="space-y-8">
            <section>
              <h2 className="zeno-heading text-card-foreground mb-6">
                {searchQuery
                  ? `Search results for "${searchQuery}" (${displayTools.length} tools)`
                  : `All tools (${
                      toolsLoading ? "Loading..." : `${toolsCount} tools`
                    })`}
              </h2>
              <ToolGrid tools={displayTools} onSelect={handleToolSelect} />
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
        if (role === "admin") {
          return <CuratorDashboard />;
        } else {
          return (
            <div className="text-center py-16">
              <p className="zeno-body text-muted-foreground">Not authorized</p>
            </div>
          );
        }

      case "users":
        if (role === "admin") {
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
        } else {
          return (
            <div className="text-center py-16">
              <p className="zeno-body text-muted-foreground">Not authorized</p>
            </div>
          );
        }

      case "analytics":
        if (role === "admin") {
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
        } else {
          return (
            <div className="text-center py-16">
              <p className="zeno-body text-muted-foreground">Not authorized</p>
            </div>
          );
        }

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

      case "category":
        const categoryTools = selectedCategory
          ? getToolsByCategory(selectedCategory)
          : [];
        return (
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={handleBackToHome}
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  <ChevronLeft size={20} className="mr-2" /> Back to Home
                </button>
                <h2 className="zeno-heading text-card-foreground">
                  {selectedCategory} ({categoryTools.length} tools)
                </h2>
              </div>
              {categoryTools.length > 0 ? (
                <ToolGrid tools={categoryTools} onSelect={handleToolSelect} />
              ) : (
                <div className="text-center py-16">
                  <p className="zeno-body text-muted-foreground">
                    No tools found in this category
                  </p>
                </div>
              )}
            </section>
          </div>
        );

      case "tool-detail":
        if (!selectedTool) {
          return (
            <div className="text-center py-16">
              <p className="zeno-body text-muted-foreground">
                No tool selected
              </p>
            </div>
          );
        }
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleBackToHome}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                <ChevronLeft size={20} className="mr-2" /> Back to All Tools
              </button>
            </div>
            <ToolDetailPage
              tool={selectedTool}
              onBack={handleBackToHome}
              onFavorite={(toolId) => {
                // console.log("Toggle favorite for tool:", toolId);
                // TODO: Implement favorites functionality
              }}
              isFavorite={false} // TODO: Implement favorites state
            />
          </div>
        );

      case "comment-retrieval":
        if (role === "admin") {
          // Import the CommentRetrievalPage component
          const CommentRetrievalPage =
            require("./comment-retrieval/page").default;
          return <CommentRetrievalPage />;
        } else {
          return (
            <div className="text-center py-16">
              <p className="zeno-body text-muted-foreground">Not authorized</p>
            </div>
          );
        }

      default:
        return (
          <div className="text-center py-16">
            <p className="zeno-body text-muted-foreground">Page not found</p>
          </div>
        );
    }
  };

  // Tool detail is now handled within the AppShell in renderMainContent

  return (
    <AppShell
      sidebarSections={filteredSidebarSections}
      onSearch={handleSearch}
      onNavigate={handleNavigate}
      // FILTERS: Only pass filter props if enabled
      isFilterOpen={featureFlags.enableFilters ? isFilterOpen : undefined}
      onFilterToggle={
        featureFlags.enableFilters
          ? () => setIsFilterOpen(!isFilterOpen)
          : undefined
      }
    >
      <div className="flex h-full">
        {/* FILTERS: Filter Panel - commented out, controlled by feature flag */}
        {featureFlags.enableFilters && (
          <div
            className={`transition-all duration-300 ease-in-out ${
              isFilterOpen ? "w-80 opacity-100" : "w-0 opacity-0"
            } overflow-hidden`}
          >
            <div className="w-80 h-full flex flex-col">
              <FilterPanel
                tools={allTools}
                isOpen={isFilterOpen}
                onToggle={() => setIsFilterOpen(!isFilterOpen)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area - expands to fill available space */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="space-y-16">{renderMainContent()}</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
