"use client";

import { useState } from "react";
import {
  Home,
  Search,
  BookOpen,
  Settings,
  Users,
  Zap,
  Filter,
  ChevronLeft,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { ToolCardDemo } from "../components/ToolCard";
import { CategoryTileDemo } from "../components/CategoryTile";
import { ChatPanelDemo } from "../components/ChatPanel";
import { CuratorDashboard } from "../components/CuratorDashboard";
import { FeaturedCarousel } from "../components/FeaturedCarousel";
import { CategoryGrid } from "../components/CategoryGrid";
import { ToolGrid } from "../components/ToolGrid";
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
import { generateCategoriesFromData } from "../lib/mockData";
import type { Tool, Category, SidebarSection } from "../types";

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
  >("home");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // Load configuration data
  const { app } = useConfig();
  const navigation = useNavigation();
  const { all: allTools, featured: featuredTools } = useTools();
  const categories = useCategories();

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

  // Filter tools by category (dynamic based on actual categories)
  const getToolsByCategory = (categoryTitle: string): Tool[] => {
    // Dynamic mapping based on the category title to tool type
    const categoryToTypeMap: Record<string, string> = {
      "AI Assistants": "GPT",
      Documentation: "Doc",
      "Video Tutorials": "Video",
      "Scripts & Tools": "Script",
      Platforms: "Platform",
      Tools: "Tool",
      "Learning Materials": "Learning Guide",
    };

    const targetType = categoryToTypeMap[categoryTitle];
    if (!targetType) {
      // If no mapping found, return empty array
      return [];
    }

    return allTools.filter((tool) => tool.type === targetType);
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
  };

  // Create sidebar sections with proper active state from config
  const sidebarSections: SidebarSection[] = navigation.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      icon:
        typeof item.icon === "string" ? iconMap[item.icon] || Home : item.icon,
      active: activeView === item.id,
    })),
  }));

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Always switch to search view when user starts searching
    setActiveView("search");
  };

  const handleNavigate = (itemId: string) => {
    console.log("Navigating to:", itemId);
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
            {/* Welcome Section */}
            <section className="text-center py-12 bg-gray-100">
              <h1 className="text-4xl font-bold text-green-600 mb-4">
                Welcome to the Zeno Knowledge Hub
              </h1>
              <h2 className="text-xl text-gray-600 mb-6">
                Your AI toolkit, all in one place
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Explore practical guides, GPTs, and shared know-how to help you
                get more from AI – fast.
              </p>
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
                All tools
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
                  : `All tools (${allTools.length} tools)`}
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
                console.log("Toggle favorite for tool:", toolId);
                // TODO: Implement favorites functionality
              }}
              isFavorite={false} // TODO: Implement favorites state
            />
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

  // Tool detail is now handled within the AppShell in renderMainContent

  return (
    <AppShell
      sidebarSections={sidebarSections}
      onSearch={handleSearch}
      onNavigate={handleNavigate}
      isFilterOpen={isFilterOpen}
      onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
    >
      <div className="flex h-full">
        {/* Filter Panel - only takes space when open */}
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
