"use client";
import { cn } from "@/lib/utils";
import type { SidebarSection } from "../types";

interface SidebarNavProps {
  sections: SidebarSection[];
  collapsed?: boolean;
  className?: string;
  onItemClick?: (itemId: string) => void;
}

export function SidebarNav({
  sections,
  collapsed = false,
  className,
  onItemClick,
}: SidebarNavProps) {
  const handleItemClick = (itemId: string) => {
    onItemClick?.(itemId);
  };

  return (
    <nav className={cn("p-4 space-y-6", className)}>
      {sections.map((section, sectionIndex) => (
        <div key={section.id || sectionIndex}>
          {!collapsed && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {section.title}
            </h3>
          )}
          <ul className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item.id)}
                    className={cn(
                      "w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      "hover:bg-primary/10 hover:text-primary",
                      "focus:outline-none focus:ring-2 focus:ring-primary",
                      item.active
                        ? "bg-primary text-primary-foreground"
                        : "text-card-foreground"
                    )}
                    aria-label={item.title}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <span className="ml-3 truncate">{item.title}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
