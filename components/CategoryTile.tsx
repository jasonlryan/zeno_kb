"use client";
import { cn } from "@/lib/utils";
import type { Category } from "../types";

interface CategoryTileProps {
  category: Category;
  onSelect?: (id: string) => void;
  className?: string;
}

// Map category titles to CSS color classes
function getCategoryColorClass(title: string): string {
  const titleLower = title.toLowerCase();
  if (titleLower.includes("audience") || titleLower.includes("research"))
    return "zeno-category-card-audience";
  if (titleLower.includes("executive") || titleLower.includes("leadership"))
    return "zeno-category-card-executive";
  if (titleLower.includes("industries") || titleLower.includes("trends"))
    return "zeno-category-card-industries";
  if (titleLower.includes("digital") || titleLower.includes("platforms"))
    return "zeno-category-card-digital";
  if (titleLower.includes("ai") || titleLower.includes("training"))
    return "zeno-category-card-ai";
  if (titleLower.includes("brand") || titleLower.includes("communications"))
    return "zeno-category-card-brand";
  return "zeno-category-card-audience"; // default
}

export function CategoryTile({
  category,
  onSelect,
  className,
}: CategoryTileProps) {
  const colorClass = getCategoryColorClass(category.title);

  return (
    <div
      className={cn(
        "rounded-lg border-2 zeno-content-padding cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
        colorClass,
        className
      )}
      onClick={() => onSelect?.(category.id)}
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 zeno-category-icon">
          <span className="text-2xl">{category.icon}</span>
        </div>
        <div className="flex-1">
          <h3 className="zeno-heading-md text-foreground dark:text-white">
            {category.title}
          </h3>
        </div>
      </div>
      <p className="zeno-text-sm text-muted-foreground dark:text-gray-400">
        {category.description}
      </p>
    </div>
  );
}

// Demo component
export function CategoryTileDemo() {
  const sampleCategory: Category = {
    id: "1",
    icon: "🤖",
    title: "AI Assistants",
    description:
      "Powerful AI tools for code generation, content creation, and problem-solving.",
    count: 24,
  };

  return (
    <div className="max-w-sm">
      <CategoryTile
        category={sampleCategory}
        onSelect={(id) => console.log("Selected category:", id)}
      />
    </div>
  );
}
