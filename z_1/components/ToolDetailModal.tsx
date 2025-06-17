"use client";

import { useState } from "react";
import {
  X,
  ExternalLink,
  Heart,
  Clock,
  User,
  Calendar,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tool } from "../types";
import { formatDate, formatRelativeTime } from "../lib/dateUtils";

interface ToolDetailModalProps {
  tool: Tool | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestAccess?: (toolId: string) => void;
  onFeedback?: (toolId: string, helpful: boolean, comment?: string) => void;
  className?: string;
}

export function ToolDetailModal({
  tool,
  isOpen,
  onClose,
  onRequestAccess,
  onFeedback,
  className,
}: ToolDetailModalProps) {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState("");

  if (!isOpen || !tool) return null;

  const isSpecialist = tool.tier === "Specialist";

  const handleFeedback = (helpful: boolean) => {
    if (onFeedback) {
      onFeedback(tool.id, helpful, feedbackComment);
      setFeedbackSubmitted(true);
      setFeedbackComment("");
    }
  };

  const handleRequestAccess = () => {
    if (onRequestAccess) {
      onRequestAccess(tool.id);
    }
  };

  const handleExternalLink = () => {
    window.open(tool.link, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className={cn(
          "bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {tool.title}
              </h2>
              {tool.featured && (
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                  Featured
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                {tool.function}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Added {formatRelativeTime(tool.date_added)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Description
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {tool.description}
            </p>
          </div>

          {/* Tool Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                Type
              </h4>
              <p className="text-gray-600 dark:text-gray-400">{tool.type}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                Tier
              </h4>
              <p className="text-gray-600 dark:text-gray-400">{tool.tier}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                Complexity
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                {tool.complexity}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                Added By
              </h4>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <User className="w-4 h-4" />
                {tool.added_by}
              </p>
            </div>
          </div>

          {/* Tags */}
          {tool.tags.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Specialist Access Warning */}
          {isSpecialist && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Specialist Access Required
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                This tool requires specialist access. Please request access to
                use this tool.
              </p>
            </div>
          )}

          {/* Scheduled Feature Date */}
          {tool.scheduled_feature_date && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Scheduled Feature
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This tool is scheduled to be featured on{" "}
                {formatDate(tool.scheduled_feature_date)}.
              </p>
            </div>
          )}

          {/* Best Practices & Caveats */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Best Practices & Caveats
            </h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>
                • Always verify outputs and cross-reference with reliable
                sources
              </li>
              <li>• Be mindful of data privacy when using external tools</li>
              <li>
                • Test tools with sample data before using with client
                information
              </li>
              {isSpecialist && (
                <li>
                  • Specialist tools require additional training and approval
                </li>
              )}
            </ul>
          </div>

          {/* Feedback Section */}
          {!feedbackSubmitted ? (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Was this tool helpful?
              </h4>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => handleFeedback(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    👍 Yes, helpful
                  </button>
                  <button
                    onClick={() => handleFeedback(false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    👎 Not helpful
                  </button>
                </div>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Optional: Share your thoughts or suggestions..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  Thank you for your feedback! It helps us improve our tool
                  library.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Added on {formatDate(tool.date_added)}
          </div>
          <div className="flex gap-3">
            {isSpecialist && onRequestAccess && (
              <button
                onClick={handleRequestAccess}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Request Access
              </button>
            )}
            <button
              onClick={handleExternalLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open Tool
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
