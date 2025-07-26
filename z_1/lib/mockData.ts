/**
 * ZENO KB - Mock Data
 *
 * Provides mock data and helper functions for development, testing, and category generation.
 * Used in configManager and app/page for generating categories and fallback data.
 *
 * Useful for development, testing, and as a fallback in Zeno Knowledge Base.
 */
import type { Tool, Category } from "../types";

// Function to generate categories from real data
export function generateCategoriesFromData(tools: Tool[]): Category[] {
  // Create function-based categories
  const functionGroups = {
    "Other": {
      name: "Other",
      icon: "🔧",
      functions: [
        "Audience Research", "Executive Research", "Technology Research", 
        "Marketing Research", "Trend Analysis", "Industry Analysis", 
        "Financial Analysis", "Workplace Analysis", "Media Analysis", 
        "Social Media Analysis", "Digital Analysis", "Real-time Social Media", 
        "Real-time News", "Analysis & Research"
      ]
    },
    "Content & Creative": {
      name: "Content & Creative", 
      icon: "✍️",
      functions: [
        "Content & Creative", "Brand & Voice", "Content Creation", 
        "Social Media", "Social Trends & Idea Generators"
      ]
    },
    "Strategy & Analysis": {
      name: "Strategy & Analysis",
      icon: "🎯", 
      functions: [
        "Strategy & Planning", "Audience Insights", 
        "Campaign & Competitive Analysis", "Research & Analysis"
      ]
    },
    "Media & Communications": {
      name: "Media & Communications",
      icon: "📰",
      functions: [
        "Media Relations", "Media List Creation", "Executive Voice Emulation"
      ]
    }
  };

  const categories: Category[] = [];
  let categoryId = 1;

  // Create categories based on function groups
  Object.entries(functionGroups).forEach(([groupKey, groupData]) => {
    // Count tools that belong to this function group
    const toolsInGroup = tools.filter(tool => 
      tool.function && groupData.functions.includes(tool.function)
    );

    // Only create category if there are tools in this group
    if (toolsInGroup.length > 0) {
      categories.push({
        id: categoryId.toString(),
        icon: groupData.icon,
        title: groupData.name,
        description: `${groupData.functions.join(', ')} tools and resources`,
        count: toolsInGroup.length,
      });
      categoryId++;
    }
  });

  // Sort by count (descending) to show most popular categories first
  return categories.sort((a, b) => b.count - a.count);
}

// Function categories for reference
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