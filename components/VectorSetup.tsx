"use client";

import { useState } from "react";
import { Button } from "./ui/button";

export function VectorSetup() {
  const [setupStatus, setSetupStatus] = useState<string>("");
  const [embeddingStatus, setEmbeddingStatus] = useState<string>("");
  const [syncStatus, setSyncStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const setupDatabase = async () => {
    setIsLoading(true);
    setSetupStatus("Setting up vector database...");

    try {
      const response = await fetch("/api/setup-vector-db", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        setSetupStatus("✅ Vector database setup complete!");
      } else {
        setSetupStatus(`❌ Setup failed: ${result.error}`);
      }
    } catch (error) {
      setSetupStatus(`❌ Setup failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateEmbeddings = async () => {
    setIsLoading(true);
    setEmbeddingStatus("Generating embeddings for all tools...");

    try {
      const response = await fetch("/api/generate-embeddings", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        setEmbeddingStatus(
          `✅ Embeddings generated! Processed: ${result.stats.processed}, Errors: ${result.stats.errors}`
        );
      } else {
        setEmbeddingStatus(`❌ Generation failed: ${result.error}`);
      }
    } catch (error) {
      setEmbeddingStatus(`❌ Generation failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkEmbeddingCount = async () => {
    try {
      const response = await fetch("/api/generate-embeddings");
      const result = await response.json();

      if (result.success) {
        setEmbeddingStatus(`📊 Current embeddings: ${result.embeddingCount}`);
      }
    } catch (error) {
      setEmbeddingStatus(`❌ Check failed: ${error}`);
    }
  };

  const checkSyncStats = async () => {
    try {
      const response = await fetch("/api/embeddings-sync?action=stats");
      const result = await response.json();

      if (result.success) {
        setStats(result.stats);
        setSyncStatus(
          `📊 Sync Status: ${result.stats.totalEmbeddings}/${result.stats.totalTools} tools (${result.stats.syncPercentage}%)`
        );
      }
    } catch (error) {
      setSyncStatus(`❌ Sync check failed: ${error}`);
    }
  };

  const syncMissingEmbeddings = async () => {
    setIsLoading(true);
    setSyncStatus("🔄 Syncing missing embeddings...");

    try {
      const response = await fetch("/api/embeddings-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync-missing" }),
      });

      const result = await response.json();

      if (result.success) {
        setSyncStatus(`✅ ${result.message}`);
        await checkSyncStats(); // Refresh stats
      } else {
        setSyncStatus(`❌ Sync failed: ${result.error}`);
      }
    } catch (error) {
      setSyncStatus(`❌ Sync failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Vector Database Setup</h2>
        <p className="text-gray-600">
          Set up Supabase vector database and generate embeddings for semantic
          search
        </p>
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Step 1: Setup Vector Database</h3>
          <p className="text-sm text-gray-600 mb-3">
            Creates the vector database tables, indexes, and search functions in
            Supabase.
          </p>
          <Button
            onClick={setupDatabase}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Setting up..." : "Setup Vector Database"}
          </Button>
          {setupStatus && (
            <p className="mt-2 text-sm font-mono bg-gray-100 p-2 rounded">
              {setupStatus}
            </p>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Step 2: Generate Embeddings</h3>
          <p className="text-sm text-gray-600 mb-3">
            Generates OpenAI embeddings for all existing tools and stores them
            in the vector database.
          </p>
          <div className="space-y-2">
            <Button
              onClick={generateEmbeddings}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Generating..." : "Generate All Embeddings"}
            </Button>
            <Button
              onClick={checkEmbeddingCount}
              variant="outline"
              className="w-full"
            >
              Check Current Count
            </Button>
          </div>
          {embeddingStatus && (
            <p className="mt-2 text-sm font-mono bg-gray-100 p-2 rounded">
              {embeddingStatus}
            </p>
          )}
        </div>

        <div className="border rounded-lg p-4 bg-green-50">
          <h3 className="font-semibold mb-2">Step 3: Monitor Sync Status</h3>
          <p className="text-sm text-gray-600 mb-3">
            Check embedding sync status and ensure all tools have embeddings.
            New tools automatically get embeddings when created/updated.
          </p>
          <div className="space-y-2">
            <Button
              onClick={checkSyncStats}
              variant="outline"
              className="w-full"
            >
              Check Sync Status
            </Button>
            <Button
              onClick={syncMissingEmbeddings}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Syncing..." : "Sync Missing Embeddings"}
            </Button>
          </div>
          {syncStatus && (
            <p className="mt-2 text-sm font-mono bg-gray-100 p-2 rounded">
              {syncStatus}
            </p>
          )}
          {stats && (
            <div className="mt-3 p-2 bg-white rounded border text-xs">
              <div>
                📊 <strong>Total Tools:</strong> {stats.totalTools}
              </div>
              <div>
                🔗 <strong>With Embeddings:</strong> {stats.totalEmbeddings}
              </div>
              <div>
                📈 <strong>Sync Percentage:</strong> {stats.syncPercentage}%
              </div>
              {stats.lastUpdated && (
                <div>
                  🕒 <strong>Last Updated:</strong>{" "}
                  {new Date(stats.lastUpdated).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4 bg-blue-50">
          <h3 className="font-semibold mb-2">🔄 Auto-Sync Features</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              • <strong>Create Tool:</strong> Automatically generates embedding
            </li>
            <li>
              • <strong>Update Tool:</strong> Updates embedding with new content
            </li>
            <li>
              • <strong>Delete Tool:</strong> Removes embedding from vector
              store
            </li>
            <li>
              • <strong>Semantic Search:</strong> AI chat uses vector similarity
            </li>
            <li>
              • <strong>Always in Sync:</strong> Your vector store stays current
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
