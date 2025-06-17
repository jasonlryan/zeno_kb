import React, { useState } from "react";
import { Filter, X, Search, Star } from "lucide-react";

interface FilterPanelProps {
  tools: any[];
  isOpen: boolean;
  onToggle: () => void;
}

export function FilterPanel({
  tools = [],
  isOpen,
  onToggle,
}: FilterPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    featured: false,
    gpt: false,
    platform: false,
    tool: false,
  });

  const handleFilterChange = (filterKey: keyof typeof selectedFilters) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedFilters({
      featured: false,
      gpt: false,
      platform: false,
      tool: false,
    });
  };

  const hasActiveFilters =
    searchTerm || Object.values(selectedFilters).some(Boolean);

  return (
    <div
      className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
        isOpen ? "w-72" : "w-0"
      } overflow-hidden flex-shrink-0`}
    >
      <div className="w-72 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-600" />
            <h2 className="font-semibold text-gray-900">Filters</h2>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close filters"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Tools
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Type to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Quick Filters
            </label>
            <div className="space-y-3">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedFilters.featured}
                  onChange={() => handleFilterChange("featured")}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Star size={14} className="ml-2 mr-1.5 text-yellow-500" />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Featured Tools
                </span>
              </label>

              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedFilters.gpt}
                  onChange={() => handleFilterChange("gpt")}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 mr-1.5 text-sm font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                  GPT
                </span>
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  GPT Tools
                </span>
              </label>

              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedFilters.platform}
                  onChange={() => handleFilterChange("platform")}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 mr-1.5 text-sm font-mono bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                  PLT
                </span>
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Platforms
                </span>
              </label>

              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedFilters.tool}
                  onChange={() => handleFilterChange("tool")}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 mr-1.5 text-sm font-mono bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">
                  TL
                </span>
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  Tools
                </span>
              </label>
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{tools.length}</span>{" "}
              tools available
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-blue-600 hover:text-blue-800 mt-1 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
