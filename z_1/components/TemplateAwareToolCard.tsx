"use client";

import React from "react";
import type { Tool } from "../types";
import { TemplateManager } from "../lib/templateManager";
import { LearningGuideCard } from "./LearningGuideCard";
import { ToolCard } from "./ToolCard"; // Import the existing ToolCard as fallback

interface TemplateAwareToolCardProps {
  tool: Tool;
  onSelect: (id: string) => void;
  className?: string;
}

export function TemplateAwareToolCard({
  tool,
  onSelect,
  className = "",
}: TemplateAwareToolCardProps) {
  const template = TemplateManager.getTemplate(tool);

  // Route to appropriate template component based on tool type
  switch (template.layout) {
    case "learning":
      return (
        <LearningGuideCard
          tool={tool}
          onSelect={onSelect}
          className={className}
        />
      );

    case "video":
      // TODO: Implement VideoCard component
      return <ToolCard tool={tool} onSelect={onSelect} className={className} />;

    case "code":
      // TODO: Implement ScriptCard component
      return <ToolCard tool={tool} onSelect={onSelect} className={className} />;

    case "platform":
      // TODO: Implement PlatformCard component
      return <ToolCard tool={tool} onSelect={onSelect} className={className} />;

    case "standard":
    default:
      // Use the existing ToolCard for standard layout
      return <ToolCard tool={tool} onSelect={onSelect} className={className} />;
  }
}

export default TemplateAwareToolCard;
