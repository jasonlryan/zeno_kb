"use client";

import React, { useState } from "react";

export default function CommentRetrievalPage() {
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

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Comment Retrieval</h1>
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
  );
}
