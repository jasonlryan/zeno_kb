"use client";
import { cn } from "@/lib/utils";
import { ZenoAsset } from "../types/config";
import ToolCard from "./ToolCard";

interface ToolGridProps {
  tools: ZenoAsset[];
  onSelect?: (id: string) => void;
}

const ToolGrid: React.FC<ToolGridProps> = ({ tools, onSelect }) => {
  if (!tools || tools.length === 0) {
    return <div className="tool-grid-empty">No tools found.</div>;
  }
  return (
    <div className="tool-grid">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} onSelect={onSelect} />
      ))}
    </div>
  );
};

export default ToolGrid;
