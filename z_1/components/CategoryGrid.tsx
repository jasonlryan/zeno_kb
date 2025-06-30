"use client"
import { cn } from "@/lib/utils"
import { CategoryTile } from "./CategoryTile"
import type { Category } from "../types"

interface CategoryGridProps {
  categories: Category[]
  onSelect: (id: string) => void
  className?: string
}

export function CategoryGrid({ categories, onSelect, className }: CategoryGridProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
      {categories.map((category) => (
        <CategoryTile key={category.id} category={category} onSelect={onSelect} />
      ))}
    </div>
  )
}
