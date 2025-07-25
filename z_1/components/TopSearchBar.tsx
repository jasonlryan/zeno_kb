"use client";

import type React from "react";
import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchConfig } from "../hooks/useConfig";

interface TopSearchBarProps {
  onSubmit: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function TopSearchBar({
  onSubmit,
  placeholder,
  className,
}: TopSearchBarProps) {
  const [query, setQuery] = useState("");
  const searchConfig = useSearchConfig();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(query);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    // Call onSubmit immediately for incremental search
    onSubmit(newQuery);
  };

  const placeholderText = placeholder || searchConfig.placeholder;

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 zeno-transform-center text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholderText}
          className="zeno-search pl-10 pr-4 bg-white dark:bg-gray-700 text-foreground dark:text-white zeno-placeholder"
        />
      </div>
    </form>
  );
}
