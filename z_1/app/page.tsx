"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Search,
  BookOpen,
  Settings,
  Users,
  Zap,
  Filter,
  ChevronLeft,
  Heart,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { ToolCardDemo } from "../components/ToolCard";
import { CategoryTileDemo } from "../components/CategoryTile";
import { ChatPanelDemo } from "../components/ChatPanel";
import { CuratorDashboard } from "../components/CuratorDashboard";
import { FeaturedCarousel } from "../components/FeaturedCarousel";
import type { ZenoAsset } from "../types/config";
import { CategoryGrid } from "../components/CategoryGrid";
import { ToolGrid } from "../components/ToolGrid";
// FILTERS: Conditionally imported based on feature flag
import { FilterPanel } from "../components/FilterPanel";
import ToolDetailPage from "../components/ToolDetailModal";
import { useLocalSearch } from "../hooks/useLocalSearch";
// import { useTaxonomy } from "../hooks/useTaxonomy";
import {
  useConfig,
  useNavigation,
  useTools,
  useCategories,
} from "../hooks/useConfig";
import { useAPITools } from "../hooks/useAPITools";
import { generateCategoriesFromData } from "../lib/mockData";
import { featureFlags } from "../lib/featureFlags";
import type { Tool, Category, SidebarSection } from "../types";
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";
import { UserList } from "../components/UserList";
import UserGuidePage from "./user-guide/page";
import { useFavorites } from "../hooks/useFavorites";
import { FavoriteModal } from "../components/FavoriteModal";
import { AnalyticsDashboard } from "../components/AnalyticsDashboard";
import { VectorSetup } from "../components/VectorSetup";

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
    | "vector-setup"
    | "demos"
    | "tool-detail"
    | "category"
    | "user-guide"
  >("home");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // FILTERS: Only enable if feature flag is on
  const [isFilterOpen, setIsFilterOpen] = useState(
    false && featureFlags.enableFilters
  );

  // Favorites state
  const [favoriteModalOpen, setFavoriteModalOpen] = useState(false);
  const [toolToFavorite, setToolToFavorite] = useState<ZenoAsset | null>(null);

  // Add URL hash-based routing persistence
  useEffect(() => {
    // Read initial view from URL hash
    const hash = window.location.hash.replace("#", "");
    if (hash && hash !== activeView) {
      const validViews = [
        "home",
        "search",
        "library",
        "curator",
        "users",
        "analytics",
        "demos",
        "tool-detail",
        "category",
        "user-guide",
      ];
      if (validViews.includes(hash)) {
        setActiveView(hash as any);
      }
    }

    // Listen for hash changes (back/forward navigation)
    const handleHashChange = () => {
      const newHash = window.location.hash.replace("#", "") || "home";
      const validViews = [
        "home",
        "search",
        "library",
        "curator",
        "users",
        "analytics",
        "demos",
        "tool-detail",
        "category",
        "user-guide",
      ];
      if (validViews.includes(newHash)) {
        setActiveView(newHash as any);

        // Handle special cases for back navigation
        if (newHash === "home") {
          setSelectedTool(null);
          setSelectedCategory(null);
          setSearchQuery("");
        }
      }
    };

    // Listen for browser back/forward buttons
    const handlePopState = (event: PopStateEvent) => {
      const newHash = window.location.hash.replace("#", "") || "home";
      const validViews = [
        "home",
        "search",
        "library",
        "curator",
        "users",
        "analytics",
        "demos",
        "tool-detail",
        "category",
        "user-guide",
      ];
      if (validViews.includes(newHash)) {
        setActiveView(newHash as any);

        // Restore state from history if available
        if (event.state) {
          if (event.state.selectedTool) {
            setSelectedTool(event.state.selectedTool);
          }
          if (event.state.selectedCategory) {
            setSelectedCategory(event.state.selectedCategory);
          }
          if (event.state.searchQuery !== undefined) {
            setSearchQuery(event.state.searchQuery);
          }
        }
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []); // Remove activeView dependency to prevent infinite loop

  // Update URL hash when activeView changes (but not on initial load)
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [lastActiveView, setLastActiveView] = useState<string>("");

  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      setLastActiveView(activeView);
      return;
    }

    // Only update URL if activeView actually changed
    if (activeView !== lastActiveView) {
      const currentHash = window.location.hash.replace("#", "");
      if (currentHash !== activeView) {
        // Use pushState for navigation to create browser history entries
        const state = {
          selectedTool,
          selectedCategory,
          searchQuery,
          timestamp: Date.now(),
        };

        // Push new state to browser history
        window.history.pushState(state, "", `#${activeView}`);
      }
      setLastActiveView(activeView);
    }
  }, [
    activeView,
    selectedTool,
    selectedCategory,
    searchQuery,
    isInitialLoad,
    lastActiveView,
  ]);

  // Load configuration data - ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL LOGIC
  const { appConfig } = useConfig();
  const { navigation, loading: navLoading } = useNavigation();
  const {
    all: allTools,
    featured: featuredTools,
    loading: toolsLoading,
    count: toolsCount,
  } = useAPITools();
  const categories = useCategories();
  const { role } = useSupabaseAuth();
  const {
    favorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    loading: favoritesLoading,
  } = useFavorites();

  // FILTERS: Debug log for development
  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🚩 Filters enabled:", featureFlags.enableFilters);
    }
  }, []);

  // Always call useLocalSearch (Rules of Hooks)
  const localSearchResults = useLocalSearch(allTools, searchQuery);

  // Memoize category function mapping to prevent re-creation on every render
  const categoryFunctionMap = React.useMemo(
    (): Record<string, string[]> => ({
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
    }),
    []
  );

  // Get dataConfig at component level to use in callback
  const { dataConfig } = useConfig();

  // Memoize the getToolsByCategory function for tag-based filtering
  const getToolsByCategory = React.useCallback(
    (categoryId: string): Tool[] => {
      // Find the category definition from the categories hook
      const category = categories.find((c) => c.id === categoryId);
      if (!category) {
        return [];
      }

      // Get the tag list for this category from dataConfig
      const tagCategories = dataConfig?.tagCategories || {};
      const categoryDef = tagCategories[categoryId];

      if (!categoryDef || !categoryDef.tags) {
        return [];
      }

      // Return tools that have any of this category's tags
      return allTools.filter((tool) => {
        if (!Array.isArray(tool.tags)) return false;
        return tool.tags.some((tag: string) => categoryDef.tags.includes(tag));
      });
    },
    [allTools, categories, dataConfig]
  );

  // Use static text instead of problematic useText hook
  const categoriesTitle = "Browse by Category";

  // All event handlers - memoized to prevent Fast Refresh issues
  const handleSearch = React.useCallback((query: string) => {
    setSearchQuery(query);
    // Always switch to search view when user starts searching
    setActiveView("search");
  }, []);

  const handleNavigate = React.useCallback((itemId: string) => {
    console.log("Navigating to:", itemId);
    setActiveView(itemId as any);
  }, []);

  const handleToolSelect = React.useCallback(
    (id: string) => {
      const tool = allTools.find((t) => t.id === id);
      if (tool) {
        setSelectedTool(tool);
        setActiveView("tool-detail");
      }
    },
    [allTools]
  );

  const handleBackToHome = React.useCallback(() => {
    setSelectedTool(null);
    setSelectedCategory(null);
    setSearchQuery("");
    setActiveView("home");
  }, []);

  const handleCategorySelect = React.useCallback(
    (id: string) => {
      const category = categories.find((c) => c.id === id);
      if (category) {
        setSelectedCategory(id); // Store category ID instead of title
        setActiveView("category");
      }
    },
    [categories]
  );

  const handleTagClick = React.useCallback((tag: string) => {
    setSearchQuery(tag);
    setActiveView("search");
    // Scroll to top of page when navigating to search
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Favorites handlers
  const handleFavoriteClick = (toolId: string) => {
    const tool = allTools.find((t) => t.id === toolId);
    if (!tool) return;

    if (isFavorite(toolId)) {
      // Remove from favorites
      removeFavorite(toolId).catch(console.error);
    } else {
      // Show modal to add with note
      setToolToFavorite(tool);
      setFavoriteModalOpen(true);
    }
  };

  const handleFavoriteSave = async (toolId: string, note: string) => {
    try {
      await addFavorite(toolId, note);
    } catch (error) {
      console.error("Error saving favorite:", error);
      throw error;
    }
  };

  // Enhanced back navigation that works with browser back button
  const handleBack = React.useCallback(() => {
    // Use browser's back functionality
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to home if no history
      handleBackToHome();
    }
  }, [handleBackToHome]);

  // Use local search for now - if no search query, show all tools
  const displayTools = searchQuery.trim() ? localSearchResults : allTools;
  const hasActiveFilters = false;

  // Helper to get search title based on context
  const getSearchTitle = React.useCallback(() => {
    if (!searchQuery.trim()) {
      return "Search Results";
    }

    // Check if the search query matches a tag category
    const matchingCategory = categories.find((category) => {
      const tagCategories = dataConfig?.tagCategories || {};
      const categoryDef = tagCategories[category.id];
      return categoryDef && categoryDef.tags.includes(searchQuery.trim());
    });

    if (matchingCategory) {
      const filteredCount = displayTools.length;
      return `${matchingCategory.title}: ${filteredCount} tools tagged with "${searchQuery}"`;
    }

    // For individual tag searches
    const filteredCount = displayTools.length;
    return `Search Results: ${filteredCount} tools for "${searchQuery}"`;
  }, [searchQuery, categories, dataConfig, displayTools]);

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
  let filteredSidebarSections: any[] = [];
  if (!navLoading) {
    filteredSidebarSections = navigation
      .map((section: any) => ({
        ...section,
        items: section.items
          .filter((item: any) => {
            // If permissions are specified, only show if user role is included
            if (item.permissions && item.permissions.length > 0) {
              return role && item.permissions.includes(role);
            }
            // If no permissions specified, show to all
            return true;
          })
          .map((item: any) => ({
            ...item,
            icon:
              typeof item.icon === "string"
                ? iconMap[item.icon] || Home
                : item.icon,
            active: activeView === item.id,
          })),
      }))
      // Remove sections with no visible items
      .filter((section: any) => section.items.length > 0);
  }

  // NOW we can have conditional returns after all hooks are called
  if (navLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg text-muted-foreground">
        Loading navigation...
      </div>
    );
  }

  const renderMainContent = () => {
    // Remove the toolsLoading check here since it's causing unnecessary Loading states
    // The individual sections will handle their own loading states appropriately
    switch (activeView) {
      case "home":
        return (
          <div className="space-y-4">
            {/* Page Title */}
            <section className="text-center py-2">
              <h1 className="zeno-heading text-2xl text-primary mb-1">
                Welcome to the Zeno AI Knowledge Hub
              </h1>
              <p className="zeno-body text-lg text-foreground">
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
              onFavorite={handleFavoriteClick}
              onTagClick={handleTagClick}
              isFavorite={isFavorite}
            />

            {/* Categories */}
            <section className="zeno-content-padding">
              <h2 className="zeno-heading-lg text-card-foreground mb-4">
                {categoriesTitle}
              </h2>
              <CategoryGrid
                categories={categories}
                onSelect={handleCategorySelect}
              />
            </section>

            {/* All Tools */}
            <section className="zeno-content-padding">
              <h2 className="zeno-heading-lg text-card-foreground mb-4">
                All tools ({toolsLoading ? "Loading..." : `${toolsCount} tools`}
                )
              </h2>
              <ToolGrid
                tools={allTools}
                onSelect={handleToolSelect}
                onFavorite={handleFavoriteClick}
                onTagClick={handleTagClick}
                isFavorite={isFavorite}
              />
            </section>
          </div>
        );

      case "search":
        return (
          <div className="space-y-8">
            <section>
              <h2 className="zeno-heading text-card-foreground mb-6">
                {searchQuery
                  ? getSearchTitle()
                  : `All tools (${
                      toolsLoading ? "Loading..." : `${toolsCount} tools`
                    })`}
              </h2>
              <ToolGrid
                tools={displayTools}
                onSelect={handleToolSelect}
                onFavorite={handleFavoriteClick}
                onTagClick={handleTagClick}
                isFavorite={isFavorite}
              />
            </section>
          </div>
        );

      case "library":
        if (favoritesLoading) {
          return (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="zeno-body text-muted-foreground">
                Loading your library...
              </p>
            </div>
          );
        }

        const favoriteTools = allTools.filter((tool) =>
          favorites.some((fav) => fav.tool_id === tool.id)
        );

        return (
          <div className="space-y-8">
            <section>
              <h2 className="zeno-heading text-card-foreground mb-6">
                My Library ({favoriteTools.length})
              </h2>
              {favoriteTools.length === 0 ? (
                <div className="text-center py-16">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="zeno-body text-muted-foreground mb-2">
                    No saved tools yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click the heart icon on any tool to save it to your library
                  </p>
                </div>
              ) : (
                <ToolGrid
                  tools={favoriteTools}
                  onSelect={handleToolSelect}
                  onFavorite={handleFavoriteClick}
                  isFavorite={isFavorite}
                />
              )}
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
                <UserList role={role} />
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
          return <AnalyticsDashboard />;
        } else {
          return (
            <div className="text-center py-16">
              <p className="zeno-body text-muted-foreground">Not authorized</p>
            </div>
          );
        }

      case "vector-setup":
        if (role === "admin") {
          return <VectorSetup />;
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
        const categoryTools =
          typeof selectedCategory === "string"
            ? getToolsByCategory(selectedCategory)
            : [];
        const categoryTitle =
          categories.find((c) => c.id === selectedCategory)?.title ||
          selectedCategory;
        return (
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={handleBack}
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  <ChevronLeft size={20} className="mr-2" /> Back
                </button>
                <h2 className="zeno-heading text-card-foreground">
                  {categoryTitle} ({categoryTools.length} tools)
                </h2>
              </div>
              {categoryTools.length > 0 ? (
                <ToolGrid
                  tools={categoryTools}
                  onSelect={handleToolSelect}
                  onFavorite={handleFavoriteClick}
                  onTagClick={handleTagClick}
                  isFavorite={isFavorite}
                />
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
                onClick={handleBack}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                <ChevronLeft size={20} className="mr-2" /> Back
              </button>
            </div>
            <ToolDetailPage
              tool={selectedTool}
              onBack={handleBackToHome}
              onFavorite={handleFavoriteClick}
              onCategoryClick={handleCategorySelect}
              onTagClick={handleTagClick}
              isFavorite={isFavorite(selectedTool.id)}
            />
          </div>
        );

      case "user-guide":
        return <UserGuidePage />;

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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="space-y-8">{renderMainContent()}</div>
          </div>
        </div>
      </div>

      {/* Favorite Modal */}
      <FavoriteModal
        tool={toolToFavorite}
        isOpen={favoriteModalOpen}
        onClose={() => {
          setFavoriteModalOpen(false);
          setToolToFavorite(null);
        }}
        onSave={handleFavoriteSave}
      />
    </AppShell>
  );
}
