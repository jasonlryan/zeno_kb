import type { Tool, Category } from "../types";

// Enhanced mock data matching gemini.tsx structure
export const mockTools: Tool[] = [
  {
    id: "1",
    title: "GPT-4 Code Assistant",
    description: "Advanced AI assistant for code generation, debugging, and optimization.",
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
    title: "Pitch Deck Generator GPT",
    description: "Generates compelling pitch deck content for client presentations, including executive summaries and key messaging.",
    type: "GPT",
    tier: "Foundation",
    complexity: "Beginner",
    tags: ["marketing", "sales", "presentations", "pitching"],
    featured: true,
    function: "Content & Creative",
    link: "https://chat.openai.com/g/pitch-deck-generator",
    date_added: "2024-01-20T14:30:00Z",
    added_by: "curator-2",
    scheduled_feature_date: "2024-02-01",
  },
  {
    id: "3",
    title: "Audience Insight Analyzer",
    description: "Analyzes demographic and psychographic data to provide deep audience insights for strategic planning.",
    type: "GPT",
    tier: "Specialist",
    complexity: "Advanced",
    tags: ["strategy", "research", "demographics", "psychographics"],
    featured: false,
    function: "Audience Insights",
    link: "https://chat.openai.com/g/audience-insights-analyzer",
    date_added: "2024-01-22T09:00:00Z",
    added_by: "curator-1",
    scheduled_feature_date: undefined,
  },
  {
    id: "4",
    title: "Media List Builder Template",
    description: "An Excel template with built-in macros to streamline the creation of targeted media lists.",
    type: "Doc",
    tier: "Foundation",
    complexity: "Beginner",
    tags: ["media relations", "outreach", "excel"],
    featured: false,
    function: "Media List Creation",
    link: "https://example.com/media-list-template.xlsx",
    date_added: "2024-01-10T11:00:00Z",
    added_by: "curator-3",
    scheduled_feature_date: undefined,
  },
  {
    id: "5",
    title: "Executive Voice Emulation GPT",
    description: "Crafts communications in a distinct executive voice, suitable for high-level internal and external messaging.",
    type: "GPT",
    tier: "Specialist",
    complexity: "Intermediate",
    tags: ["executive comms", "writing", "tone"],
    featured: false,
    function: "Executive Voice Emulation",
    link: "https://chat.openai.com/g/executive-voice",
    date_added: "2024-01-18T16:00:00Z",
    added_by: "curator-2",
    scheduled_feature_date: "2024-02-10",
  },
  {
    id: "6",
    title: "Social Trends Monitoring Video Guide",
    description: "A short video tutorial on using AI tools to monitor and identify emerging social media trends.",
    type: "Video",
    tier: "Foundation",
    complexity: "Beginner",
    tags: ["social media", "trends", "monitoring"],
    featured: false,
    function: "Monitoring & Alerts",
    link: "https://www.youtube.com/watch?v=mock-video-id",
    date_added: "2024-01-25T09:30:00Z",
    added_by: "curator-3",
    scheduled_feature_date: undefined,
  },
  {
    id: "7",
    title: "Campaign Analysis Best Practices",
    description: "A comprehensive guide on best practices for analyzing campaign performance and optimizing results.",
    type: "Doc",
    tier: "Foundation",
    complexity: "Intermediate",
    tags: ["campaigns", "analytics", "best practices"],
    featured: false,
    function: "Campaign & Competitive Analysis",
    link: "https://example.com/campaign-analysis-guide.pdf",
    date_added: "2024-01-28T11:00:00Z",
    added_by: "curator-1",
    scheduled_feature_date: undefined,
  },
];

// Remove hardcoded categories and replace with dynamic generation
export function generateCategoriesFromData(tools: Tool[]): Category[] {
  // Create categories based on tool types
  const typeCategories = new Map<string, { count: number; tools: Tool[] }>();
  
  tools.forEach(tool => {
    const type = tool.type;
    if (!typeCategories.has(type)) {
      typeCategories.set(type, { count: 0, tools: [] });
    }
    const category = typeCategories.get(type)!;
    category.count++;
    category.tools.push(tool);
  });

  // Map types to category configurations
  const categoryConfigs: Record<string, { icon: string; title: string; description: string }> = {
    'GPT': {
      icon: '🤖',
      title: 'AI Assistants',
      description: 'Custom GPTs and AI tools for various tasks'
    },
    'Doc': {
      icon: '📚',
      title: 'Documentation',
      description: 'Guides, templates, and reference materials'
    },
    'Video': {
      icon: '🎥',
      title: 'Video Tutorials',
      description: 'Step-by-step video guides and tutorials'
    },
    'Script': {
      icon: '⚡',
      title: 'Scripts & Tools',
      description: 'Automation scripts and utility tools'
    },
    'Platform': {
      icon: '🌐',
      title: 'Platforms',
      description: 'AI platforms and enterprise tools'
    },
    'Tool': {
      icon: '🔧',
      title: 'Tools',
      description: 'Specialized tools and applications'
    },
    'Learning Guide': {
      icon: '📖',
      title: 'Learning Materials',
      description: 'Educational content and learning resources'
    }
  };

  // Generate categories from the data
  const categories: Category[] = [];
  let categoryId = 1;

  typeCategories.forEach((data, type) => {
    const config = categoryConfigs[type];
    if (config) {
      categories.push({
        id: categoryId.toString(),
        icon: config.icon,
        title: config.title,
        description: config.description,
        count: data.count,
      });
      categoryId++;
    }
  });

  // Sort by count (descending) to show most popular categories first
  return categories.sort((a, b) => b.count - a.count);
}

// Keep the original mockCategories as fallback but mark it as deprecated
export const mockCategories: Category[] = [
  {
    id: "1",
    icon: "🤖",
    title: "AI Assistants",
    description: "Powerful AI tools for various tasks",
    count: 0, // Will be dynamically calculated
  },
  {
    id: "2",
    icon: "📚",
    title: "Documentation",
    description: "Guides, tutorials, and references",
    count: 0, // Will be dynamically calculated
  },
  {
    id: "3",
    icon: "⚡",
    title: "Scripts & Tools",
    description: "Automation and utility scripts",
    count: 0, // Will be dynamically calculated
  },
  {
    id: "4",
    icon: "🎥",
    title: "Video Tutorials",
    description: "Step-by-step video guides",
    count: 0, // Will be dynamically calculated
  },
];

// Function categories from gemini.tsx
export const functionCategories = [
  "Content & Creative",
  "Audience Insights", 
  "Media List Creation",
  "Campaign & Competitive Analysis",
  "Executive Voice Emulation",
  "Monitoring & Alerts",
  "Strategy & Planning",
  "Media Relations",
  "Social Trends & Idea Generators",
  "Ops & Governance",
  "Compliance Checklists",
  "Best Practice Guides",
];

// Mock user ID
export const mockUserId = "mock-user-12345"; 