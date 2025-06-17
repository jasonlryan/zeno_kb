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
import { useLocalSearch } from "../hooks/useLocalSearch";
// import { useTaxonomy } from "../hooks/useTaxonomy";
import {
  useConfig,
  useNavigation,
  useTools,
  useCategories,
  useText,
} from "../hooks/useConfig";
import type { Tool, Category, SidebarSection } from "../types";

// Configuration data loaded from config files

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<
    "home" | "search" | "library" | "curator" | "users" | "analytics" | "demos"
  >("home");
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

  // Use local search for now
  const displayTools = localSearchResults;
  const hasActiveFilters = false;

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
    // Use local search for now
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
            {/* Welcome Section */}
            <section className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
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
            <section className="zeno-section-spacing">
              <h2 className="zeno-heading text-card-foreground mb-6">
                {categoriesTitle}
              </h2>
              <CategoryGrid
                categories={categories}
                onSelect={handleCategorySelect}
              />
            </section>

            {/* All Tools */}
            <section className="zeno-section-spacing">
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
                  ? `Search results for "${searchQuery}"`
                  : "Search tools"}
              </h2>
              {searchQuery ? (
                <ToolGrid tools={displayTools} onSelect={handleToolSelect} />
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
          <div className="zeno-section-spacing space-y-16">
            {/* Filter Toggle Button - positioned at top of main content */}
            <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isFilterOpen
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-300"
                }`}
              >
                <Filter size={16} />
                {isFilterOpen ? "Hide Filters" : "Show Filters"}
              </button>

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
        </div>
      </div>
    </AppShell>
  );
}
