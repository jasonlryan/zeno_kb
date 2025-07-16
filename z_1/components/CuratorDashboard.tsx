"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTools } from "../hooks/useConfig";
import { Edit, Trash2, ExternalLink, Calendar, Tag, Hash } from "lucide-react";
import { ToolFormModal } from "./ToolFormModal";
import type { Tool } from "../types";
import { ZenoAsset } from "../types/config";
import ToolGrid from "./ToolGrid";

interface CuratorDashboardProps {
  assets: ZenoAsset[];
}

const CuratorDashboard: React.FC<CuratorDashboardProps> = ({ assets }) => {
  // Example: dashboard logic for managing assets/tools
  // (Add your actual dashboard logic here)

  return (
    <div className="curator-dashboard">
      <h1>Curator Dashboard</h1>
      {/* Add dashboard controls/UI here if needed */}
      <ToolGrid tools={assets} />
    </div>
  );
};

export default CuratorDashboard;
