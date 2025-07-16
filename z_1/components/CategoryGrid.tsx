"use client";
import { cn } from "@/lib/utils";
import { CategoryTile } from "./CategoryTile";
import type { Category } from "../types";
import { ZenoAsset } from "../types/config";

interface CategoryGridProps {
  categories: Category[];
  tools?: ZenoAsset[]; // optional, for category counts or filtering
  onSelect?: (id: string) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  tools,
  onSelect,
}) => {
  return (
    <div className="category-grid">
      {categories.map((category) => {
        return (
          <div
            className="category-tile"
            key={category.id}
            onClick={() => onSelect && onSelect(category.id)}
            style={{ cursor: onSelect ? "pointer" : "default" }}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-title">{category.title}</span>
            <span className="category-description">{category.description}</span>
            <span className="category-count">{category.count}</span>
          </div>
        );
      })}
    </div>
  );
};

export default CategoryGrid;
