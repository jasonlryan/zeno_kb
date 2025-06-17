"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tool, AccessRequest } from "../types";

interface AccessRequestFormProps {
  tool: Tool;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: Omit<AccessRequest, "id">) => void;
  className?: string;
}

export function AccessRequestForm({
  tool,
  isOpen,
  onClose,
  onSubmit,
  className,
}: AccessRequestFormProps) {
  const [justification, setJustification] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const request: Omit<AccessRequest, "id"> = {
      toolId: tool.id,
      userId: "current-user", // This would come from auth context in real app
      requestDate: new Date().toISOString(),
      status: "pending",
    };

    try {
      onSubmit(request);
      setJustification("");
      onClose();
    } catch (error) {
      console.error("Error submitting access request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className={cn(
          "bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Request Access
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Tool: {tool.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This specialist tool requires approval before access can be
              granted.
            </p>
          </div>

          <div>
            <label
              htmlFor="justification"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Business Justification *
            </label>
            <textarea
              id="justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Please explain why you need access to this tool and how you plan to use it..."
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
              What happens next?
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Your request will be reviewed by a consultant</li>
              <li>• You'll receive an email notification with the decision</li>
              <li>• Approval typically takes 1-2 business days</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!justification.trim() || isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
