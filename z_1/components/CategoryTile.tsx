"use client";
import { cn } from "@/lib/utils";
import type { Category } from "../types";

interface CategoryTileProps {
  category: Category;
  onSelect?: (id: string) => void;
  className?: string;
}

export function CategoryTile({
  category,
  onSelect,
  className,
}: CategoryTileProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
        className
      )}
      onClick={() => onSelect?.(category.id)}
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-4">
          <span className="text-2xl">{category.icon}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {category.title}
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {category.count} tools
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
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
