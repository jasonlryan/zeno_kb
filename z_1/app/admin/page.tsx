"use client";

import React, { useState } from "react";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";
import AuthGuard from "../../components/AuthGuard";
import { ZenoAsset } from "../../types/config";
import ToolGrid from "../../components/ToolGrid";

const AdminPage: React.FC = () => {
  // Replace with actual data fetching logic
  const assets: ZenoAsset[] = [];

  // Example: admin-specific logic for managing assets/tools
  // (Add your actual admin logic here)

  return (
    <div className="admin-page">
      <h1>Admin: Manage Assets</h1>
      {/* Add admin controls/UI here if needed */}
      <ToolGrid tools={assets} />
    </div>
  );
};

export default AdminPage;
