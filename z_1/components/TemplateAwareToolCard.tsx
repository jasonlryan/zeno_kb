"use client";

import React from "react";
import { ZenoAsset } from "../types/config";
import ToolCard from "./ToolCard";

interface TemplateAwareToolCardProps {
  tool: ZenoAsset;
}

const TemplateAwareToolCard: React.FC<TemplateAwareToolCardProps> = ({
  tool,
}) => {
  // Example: route to different card templates based on tool.type or categories
  // For now, just use ToolCard for all types
  return <ToolCard tool={tool} />;
};

export default TemplateAwareToolCard;
