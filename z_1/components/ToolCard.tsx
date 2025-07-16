"use client";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useComponentContent } from "../hooks/useConfig";
import { ZenoAsset } from "../types/config";

interface ToolCardProps {
  tool: ZenoAsset;
  onBookmark?: (id: string) => void;
  onSelect?: (id: string) => void;
  bookmarked?: boolean;
  className?: string;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(tool.id);
    }
  };

  return (
    <div
      className="tool-card"
      onClick={handleClick}
      style={{ cursor: onSelect ? "pointer" : "default" }}
    >
      <h3 className="tool-title">{tool.title}</h3>
      <p className="tool-description">{tool.description}</p>
      {tool.categories && tool.categories.length > 0 && (
        <div className="tool-categories">
          {tool.categories.map((cat) => (
            <span className="tool-category-tag" key={cat}>
              {cat}
            </span>
          ))}
        </div>
      )}
      <div className="tool-meta">
        <span className="tool-type">{tool.type}</span>
        {tool.skillLevel && (
          <span className="tool-skill">Skill: {tool.skillLevel}</span>
        )}
      </div>
      {tool.url && (
        <a
          href={tool.url}
          className="tool-link"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          Open Resource
        </a>
      )}
    </div>
  );
};

export default ToolCard;

// Demo component
export function ToolCardDemo() {
  const sampleTool: ZenoAsset = {
    id: "1",
    title: "GPT-4 Code Assistant",
    description:
      "Advanced AI assistant for code generation, debugging, and optimization. Supports multiple programming languages and frameworks.",
    type: "GPT",
    categories: ["coding", "ai", "debugging", "optimization"],
    skillLevel: "Intermediate",
    url: "https://chat.openai.com/g/code-assistant",
    // Removed date_added and added_by as they are not in ZenoAsset
  };

  return (
    <div className="max-w-sm">
      <ToolCard
        tool={sampleTool}
        onBookmark={(id) => console.log("Bookmarked:", id)}
        onSelect={(id) => console.log("Selected:", id)}
      />
    </div>
  );
}
