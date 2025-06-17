import { Tool } from '@/types';

export interface FilterState {
  types: string[];
  tiers: string[];
  complexity: string[];
  functions: string[];
  functionGroups: string[];
  tags: string[];
  featured: boolean | null;
  searchTerm: string;
}

export interface TaxonomyConfig {
  version: string;
  lastUpdated: string;
  structure: {
    types: Array<{ id: string; label: string; icon: string; color: string }>;
    tiers: Array<{ id: string; label: string; color: string; description: string }>;
    complexity: Array<{ id: string; label: string; color: string }>;
  };
  functionCategories: {
    groups: Record<string, {
      name: string;
      icon: string;
      color: string;
      functions: string[];
    }>;
  };
  tagCategories: Record<string, {
    name: string;
    color: string;
    tags: string[];
  }>;
  searchConfig: {
    searchableFields: string[];
    weightings: Record<string, number>;
  };
}

export class TaxonomyManager {
  private static instance: TaxonomyManager;
  private taxonomy: TaxonomyConfig | null = null;

  constructor() {
    this.loadTaxonomy();
  }

  static getInstance(): TaxonomyManager {
    if (!TaxonomyManager.instance) {
      TaxonomyManager.instance = new TaxonomyManager();
    }
    return TaxonomyManager.instance;
  }

  async loadTaxonomy(): Promise<void> {
    try {
      // Use absolute URL in browser, relative in server
      const url = typeof window !== 'undefined' 
        ? `${window.location.origin}/config/taxonomy.json`
        : '/config/taxonomy.json';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.taxonomy = await response.json();
      console.log('Taxonomy loaded successfully');
    } catch (error) {
      console.error('Failed to load taxonomy:', error);
      // Fallback to basic taxonomy
      this.taxonomy = this.getBasicTaxonomy();
      console.log('Using fallback taxonomy');
    }
  }

  private getBasicTaxonomy(): TaxonomyConfig {
    return {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      structure: {
        types: [
          { id: "GPT", label: "GPT", icon: "🤖", color: "#3B82F6" },
          { id: "Platform", label: "Platform", icon: "🌐", color: "#10B981" },
          { id: "Tool", label: "Tool", icon: "🔧", color: "#F59E0B" },
          { id: "Doc", label: "Document", icon: "📄", color: "#6B7280" },
          { id: "Video", label: "Video", icon: "🎥", color: "#EF4444" }
        ],
        tiers: [
          { id: "Foundation", label: "Foundation", color: "#10B981", description: "Open access" },
          { id: "Specialist", label: "Specialist", color: "#F59E0B", description: "Requires consultation" },
          { id: "Restricted", label: "Restricted", color: "#DC2626", description: "Approval required" }
        ],
        complexity: [
          { id: "Beginner", label: "Beginner", color: "#10B981" },
          { id: "Intermediate", label: "Intermediate", color: "#F59E0B" },
          { id: "Advanced", label: "Advanced", color: "#DC2626" }
        ]
      },
      functionCategories: { groups: {} },
      tagCategories: {},
      searchConfig: {
        searchableFields: ["title", "description", "function", "tags"],
        weightings: { title: 3, description: 2, function: 2, tags: 1 }
      }
    };
  }

  // Extract all unique tags from actual tools
  extractTagsFromTools(tools: Tool[]): string[] {
    const allTags = new Set<string>();
    tools.forEach(tool => {
      tool.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  }

  // Extract all unique function categories from actual tools
  extractFunctionsFromTools(tools: Tool[]): string[] {
    const functions = new Set<string>();
    tools.forEach(tool => {
      functions.add(tool.function);
    });
    return Array.from(functions).sort();
  }

  // Get function groups from taxonomy
  getFunctionGroups(): Record<string, { name: string; icon: string; color: string; functions: string[] }> {
    return this.taxonomy?.functionCategories.groups || {};
  }

  // Get filter options based on actual data
  getFilterOptions(tools: Tool[]) {
    const functionGroups = this.getFunctionGroups();
    
    return {
      types: [...new Set(tools.map(t => t.type))].sort(),
      tiers: [...new Set(tools.map(t => t.tier))].sort(),
      complexity: [...new Set(tools.map(t => t.complexity))].sort(),
      functions: this.extractFunctionsFromTools(tools),
      functionGroups: Object.keys(functionGroups),
      tags: this.extractTagsFromTools(tools),
      typeConfig: this.taxonomy?.structure.types || [],
      tierConfig: this.taxonomy?.structure.tiers || [],
      complexityConfig: this.taxonomy?.structure.complexity || [],
      functionGroupConfig: functionGroups,
      tagCategories: this.taxonomy?.tagCategories || {}
    };
  }

  // Enhanced search with weighted scoring
  searchTools(tools: Tool[], searchTerm: string): Tool[] {
    if (!searchTerm.trim()) return tools;
    
    const term = searchTerm.toLowerCase();
    const searchConfig = this.taxonomy?.searchConfig || this.getBasicTaxonomy().searchConfig;
    
    return tools.filter(tool => {
      let score = 0;
      
      // Title search (highest weight)
      if (tool.title.toLowerCase().includes(term)) {
        score += searchConfig.weightings.title || 3;
      }
      
      // Description search
      if (tool.description.toLowerCase().includes(term)) {
        score += searchConfig.weightings.description || 2;
      }
      
      // Function search
      if (tool.function.toLowerCase().includes(term)) {
        score += searchConfig.weightings.function || 2;
      }
      
      // Tags search
      if (tool.tags.some(tag => tag.toLowerCase().includes(term))) {
        score += searchConfig.weightings.tags || 1;
      }
      
      // Type search
      if (tool.type.toLowerCase().includes(term)) {
        score += searchConfig.weightings.type || 1;
      }
      
      // Tier search
      if (tool.tier.toLowerCase().includes(term)) {
        score += searchConfig.weightings.tier || 1;
      }
      
      return score > 0;
    }).sort((a, b) => {
      // Sort by relevance (exact title matches first)
      const aExact = a.title.toLowerCase().includes(term) ? 1 : 0;
      const bExact = b.title.toLowerCase().includes(term) ? 1 : 0;
      return bExact - aExact;
    });
  }

  // Apply filters based on actual data structure
  applyFilters(tools: Tool[], filters: FilterState): Tool[] {
    let filtered = tools;

    // Search filter
    if (filters.searchTerm) {
      filtered = this.searchTools(filtered, filters.searchTerm);
    }

    // Type filter
    if (filters.types.length > 0) {
      filtered = filtered.filter(tool => filters.types.includes(tool.type));
    }

    // Tier filter
    if (filters.tiers.length > 0) {
      filtered = filtered.filter(tool => filters.tiers.includes(tool.tier));
    }

    // Complexity filter
    if (filters.complexity.length > 0) {
      filtered = filtered.filter(tool => filters.complexity.includes(tool.complexity));
    }

    // Function filter
    if (filters.functions.length > 0) {
      filtered = filtered.filter(tool => filters.functions.includes(tool.function));
    }

    // Function group filter
    if (filters.functionGroups.length > 0) {
      const functionGroups = this.getFunctionGroups();
      const allowedFunctions = new Set<string>();
      
      filters.functionGroups.forEach(groupKey => {
        const group = functionGroups[groupKey];
        if (group) {
          group.functions.forEach(func => allowedFunctions.add(func));
        }
      });
      
      filtered = filtered.filter(tool => allowedFunctions.has(tool.function));
    }

    // Tag filter (AND logic - tool must have all selected tags)
    if (filters.tags.length > 0) {
      filtered = filtered.filter(tool => 
        filters.tags.every(tag => tool.tags.includes(tag))
      );
    }

    // Featured filter
    if (filters.featured !== null) {
      filtered = filtered.filter(tool => tool.featured === filters.featured);
    }

    return filtered;
  }

  // Get tools by function group
  getToolsByFunctionGroup(tools: Tool[], groupKey: string): Tool[] {
    const functionGroups = this.getFunctionGroups();
    const group = functionGroups[groupKey];
    
    if (!group) return [];
    
    return tools.filter(tool => group.functions.includes(tool.function));
  }

  // Get tag color by category
  getTagColor(tag: string): string {
    const tagCategories = this.taxonomy?.tagCategories || {};
    
    for (const category of Object.values(tagCategories)) {
      if (category.tags.includes(tag)) {
        return category.color;
      }
    }
    
    return '#6B7280'; // Default gray
  }

  // Get type configuration
  getTypeConfig(type: string) {
    return this.taxonomy?.structure.types.find(t => t.id === type);
  }

  // Get tier configuration
  getTierConfig(tier: string) {
    return this.taxonomy?.structure.tiers.find(t => t.id === tier);
  }

  // Get complexity configuration
  getComplexityConfig(complexity: string) {
    return this.taxonomy?.structure.complexity.find(c => c.id === complexity);
  }
}

export const taxonomyManager = TaxonomyManager.getInstance(); 