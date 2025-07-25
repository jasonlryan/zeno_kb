"use client";

import React, { useState } from "react";
import { X, MessageSquare, User, Send } from "lucide-react";

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: {
    name: string;
    message: string;
    priority: string;
  }) => void;
  toolId?: string;
  toolTitle?: string;
}

export function CommentModal({
  isOpen,
  onClose,
  onSubmit,
  toolId,
  toolTitle,
}: CommentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    message: "",
    priority: "Low Priority",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ name: "", message: "", priority: "Low Priority" });
      onClose();
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between zeno-content-padding border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <h2 className="zeno-heading text-lg font-semibold text-foreground">
              Add Comment
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-muted-foreground transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tool Context */}
        {toolTitle && (
          <div className="px-6 py-3 bg-muted border-b border-gray-200">
            <p className="text-sm text-muted-foreground">
              Commenting on:{" "}
              <span className="font-medium text-foreground">{toolTitle}</span>
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="zeno-content-padding space-y-4">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className="flex items-center gap-2 text-sm font-medium text-foreground mb-2"
            >
              <User className="w-4 h-4" />
              Your Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter your name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Priority Dropdown */}
          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Priority
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => handleInputChange("priority", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="General Feedback">General Feedback</option>
              <option value="Low Priority">Low Priority</option>
              <option value="Medium Priority">Medium Priority</option>
              <option value="High Priority">High Priority</option>
              <option value="Bug Report">Bug Report</option>
              <option value="Feature Request">Feature Request</option>
            </select>
          </div>

          {/* Comment Field */}
          <div>
            <label
              htmlFor="comment"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Comment *
            </label>
            <textarea
              id="comment"
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Share your thoughts, suggestions, or questions..."
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !formData.name.trim() ||
                !formData.message.trim() ||
                isSubmitting
              }
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Add Comment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
