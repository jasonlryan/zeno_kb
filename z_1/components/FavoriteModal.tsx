import React, { useState } from "react";
import { Button } from "./ui/button";
import { Heart, X } from "lucide-react";

interface Tool {
  id: string;
  title: string;
  description: string;
  type: string;
}

interface FavoriteModalProps {
  tool: Tool | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (toolId: string, note: string) => Promise<void>;
}

export const FavoriteModal: React.FC<FavoriteModalProps> = ({
  tool,
  isOpen,
  onClose,
  onSave,
}) => {
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setNote(""); // Reset note when modal opens
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!tool) return;

    setIsLoading(true);
    try {
      await onSave(tool.id, note);
      onClose();
      setNote("");
    } catch (error) {
      console.error("Error saving favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNote("");
    onClose();
  };

  if (!isOpen || !tool) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg zeno-content-padding w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
            <h2 className="text-xl font-semibold text-foreground dark:text-white">
              Save to Library
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-muted-foreground dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <div className="bg-muted dark:bg-gray-700 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-foreground dark:text-white mb-1">
              {tool.title}
            </h3>
            <p className="text-sm text-muted-foreground dark:text-gray-400 mb-2">
              {tool.description}
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
              {tool.type}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-2">
              Add a personal note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why is this tool useful to you? What do you plan to use it for?"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-foreground dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
              This note will help you remember why you saved this tool
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isLoading ? "Saving..." : "Save to Library"}
          </Button>
        </div>
      </div>
    </div>
  );
};
