"use client";

import React, { useState } from "react";
import { useSupabaseAuth } from "../../hooks/useSupabaseAuth";
import AuthGuard from "../../components/AuthGuard";

export default function AdminPage() {
  const { user, role, loading } = useSupabaseAuth();
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/redis/comments");
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "comments.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user || role !== "superadmin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 bg-white rounded shadow text-center">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">
            You must be a superadmin to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-2xl font-bold mb-4">Admin: Redis Data Access</h1>
        <div className="bg-gray-100 p-6 rounded shadow">
          <p className="text-gray-700 mb-4">
            Download all comments from Redis (Upstash):
          </p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? "Downloading..." : "Download Comments JSON"}
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    </AuthGuard>
  );
}
