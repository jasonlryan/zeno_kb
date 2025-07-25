"use client";

import React from "react";
import {
  Clock,
  BookOpen,
  Target,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import type { Tool } from "../types";
import { TemplateManager } from "../lib/templateManager";

interface LearningGuideCardProps {
  tool: Tool;
  onSelect: (id: string) => void;
  className?: string;
}

export function LearningGuideCard({
  tool,
  onSelect,
  className = "",
}: LearningGuideCardProps) {
  const template = TemplateManager.getTemplate(tool);
  const hasPrerequisites = tool.prerequisites && tool.prerequisites.length > 0;

  return (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 transform hover:-translate-y-1 cursor-pointer ${className}`}
      onClick={() => onSelect(tool.id)}
    >
      {/* Header with badge and estimated time */}
      <div className="zeno-content-padding pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{template.icon}</span>
            <span className="zeno-badge-blue">{template.displayName}</span>
          </div>
          {tool.estimated_read_time && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock size={16} />
              <span>{tool.estimated_read_time}</span>
            </div>
          )}
        </div>

        {/* Title and Description */}
        <h3 className="zeno-heading text-xl font-bold text-foreground mb-3 line-clamp-2">
          {tool.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
          {tool.description}
        </p>

        {/* Prerequisites */}
        {hasPrerequisites && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={16} className="text-orange-600" />
              <span className="text-sm font-medium text-foreground">
                Prerequisites:
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {tool.prerequisites!.slice(0, 2).map((prereq, index) => (
                <span
                  key={index}
                  className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-md"
                >
                  {prereq}
                </span>
              ))}
              {tool.prerequisites!.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{tool.prerequisites!.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Learning Objectives Preview */}
        {tool.learning_objectives && tool.learning_objectives.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-green-600" />
              <span className="text-sm font-medium text-foreground">
                You'll learn:
              </span>
            </div>
            <div className="space-y-1">
              {tool.learning_objectives.slice(0, 2).map((objective, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <CheckCircle
                    size={14}
                    className="text-green-500 mt-0.5 flex-shrink-0"
                  />
                  <span className="line-clamp-1">{objective}</span>
                </div>
              ))}
              {tool.learning_objectives.length > 2 && (
                <div className="text-xs text-muted-foreground ml-6">
                  +{tool.learning_objectives.length - 2} more objectives
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {tool.tags && tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tool.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="zeno-tag">
                {tag}
              </span>
            ))}
            {tool.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{tool.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Tier and Complexity */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              tool.tier === "Specialist"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {tool.tier}
          </span>
          <span className="bg-gray-100 text-foreground text-xs px-2 py-1 rounded-full font-medium">
            {tool.complexity}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-6 py-4 bg-muted rounded-b-xl border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-600">
              {template.actionText}
            </span>
          </div>
          <ChevronRight size={16} className="text-blue-600" />
        </div>
      </div>
    </div>
  );
}

export default LearningGuideCard;
