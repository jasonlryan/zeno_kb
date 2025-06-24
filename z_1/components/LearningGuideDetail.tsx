"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  Heart,
  ExternalLink,
  Clock,
  BookOpen,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  ArrowRight,
} from "lucide-react";
import type { Tool } from "../types";

interface LearningGuideDetailProps {
  tool: Tool;
  onBack: () => void;
  onFavorite?: (toolId: string) => void;
  isFavorite?: boolean;
}

export function LearningGuideDetail({
  tool,
  onBack,
  onFavorite,
  isFavorite = false,
}: LearningGuideDetailProps) {
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  }>({ text: "", type: "success" });

  const [completedObjectives, setCompletedObjectives] = useState<Set<number>>(
    new Set()
  );

  const displayMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "success" }), 3000);
  };

  const handleFeedback = (helpful: boolean) => {
    console.log(
      `Feedback for learning guide: ${tool.title} - Helpful: ${helpful}`
    );
    displayMessage(
      `Feedback recorded: ${helpful ? "Helpful!" : "Not helpful."} (Simulated)`,
      "success"
    );
  };

  const toggleObjective = (index: number) => {
    const newCompleted = new Set(completedObjectives);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedObjectives(newCompleted);
  };

  const progressPercentage = tool.learning_objectives
    ? (completedObjectives.size / tool.learning_objectives.length) * 100
    : 0;

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="container mx-auto">
        {/* Main Learning Guide Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          {/* Header with Title and Favorite */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start space-x-4">
              <div className="text-4xl">📚</div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                    Learning Guide
                  </span>
                  {tool.estimated_read_time && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock size={16} />
                      <span>{tool.estimated_read_time}</span>
                    </div>
                  )}
                </div>
                <h2 className="text-4xl font-extrabold text-gray-900">
                  {tool.title}
                </h2>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-gray-500">
                    Tier: {tool.tier}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-gray-500">
                    Complexity: {tool.complexity}
                  </span>
                </div>
              </div>
            </div>
            {onFavorite && (
              <button
                onClick={() => onFavorite(tool.id)}
                className={`p-3 rounded-full transition-colors duration-200 ${
                  isFavorite
                    ? "text-red-500 bg-red-100"
                    : "text-gray-400 hover:text-red-500 hover:bg-gray-100"
                }`}
                aria-label={
                  isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                <Heart fill={isFavorite ? "currentColor" : "none"} size={28} />
              </button>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 text-lg mb-6 leading-relaxed">
            {tool.description}
          </p>

          {/* Content Summary */}
          {tool.content_summary && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-blue-800 italic">{tool.content_summary}</p>
            </div>
          )}

          {/* Presenter Info */}
          {tool.presenter && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <User size={16} className="text-gray-600" />
                <span className="font-medium text-gray-700">Presented by:</span>
              </div>
              <p className="text-gray-800">{tool.presenter}</p>
            </div>
          )}

          {/* Prerequisites Section */}
          {tool.prerequisites && tool.prerequisites.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <BookOpen
                  className="mr-3 text-orange-600 mt-1 flex-shrink-0"
                  size={24}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-3 text-orange-900">
                    Prerequisites
                  </h3>
                  <p className="text-orange-800 mb-4">
                    Before starting this guide, make sure you're familiar with:
                  </p>
                  <div className="space-y-2">
                    {tool.prerequisites.map((prereq, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-orange-600" />
                        <span className="text-orange-800">{prereq}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Learning Objectives with Progress */}
          {tool.learning_objectives && tool.learning_objectives.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <Target
                  className="mr-3 text-green-600 mt-1 flex-shrink-0"
                  size={24}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg text-green-900">
                      Learning Objectives
                    </h3>
                    <div className="text-sm text-green-700">
                      {completedObjectives.size}/
                      {tool.learning_objectives.length} completed
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-green-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>

                  <p className="text-green-800 mb-4">
                    By the end of this guide, you will be able to:
                  </p>
                  <div className="space-y-3">
                    {tool.learning_objectives.map((objective, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <button
                          onClick={() => toggleObjective(index)}
                          className={`flex-shrink-0 mt-0.5 transition-colors ${
                            completedObjectives.has(index)
                              ? "text-green-600"
                              : "text-green-400 hover:text-green-600"
                          }`}
                        >
                          <CheckCircle
                            size={20}
                            fill={
                              completedObjectives.has(index)
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>
                        <span
                          className={`text-green-800 cursor-pointer ${
                            completedObjectives.has(index)
                              ? "line-through opacity-75"
                              : ""
                          }`}
                          onClick={() => toggleObjective(index)}
                        >
                          {objective}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tags and Metadata */}
          <div className="flex flex-wrap gap-3 mb-8">
            {tool.tags &&
              tool.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-blue-50 text-blue-700 text-sm px-4 py-2 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            <span
              className={`text-sm px-4 py-2 rounded-full font-medium ${
                tool.tier === "Specialist"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {tool.tier}
            </span>
            <span className="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-full font-medium">
              Complexity: {tool.complexity}
            </span>
          </div>

          {/* Start Learning Button */}
          <div className="mb-8">
            <a
              href={tool.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-xl transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              Start Learning
              <ArrowRight className="ml-3" size={24} />
            </a>
          </div>

          {/* Learning Tips */}
          <div className="bg-blue-50 border border-blue-200 text-blue-900 p-6 rounded-lg mb-8 shadow-inner">
            <div className="flex items-start">
              <AlertCircle
                className="mr-3 text-blue-600 mt-1 flex-shrink-0"
                size={24}
              />
              <div className="flex-1">
                <p className="font-semibold text-lg mb-3">
                  Learning Tips & Best Practices:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li className="text-sm leading-relaxed">
                    Take your time and practice each concept before moving on
                  </li>
                  <li className="text-sm leading-relaxed">
                    Use the learning objectives as checkpoints to track your
                    progress
                  </li>
                  <li className="text-sm leading-relaxed">
                    Apply what you learn immediately in real scenarios for
                    better retention
                  </li>
                  <li className="text-sm leading-relaxed">
                    Don't hesitate to revisit previous sections if needed
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {tool.date_added && (
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="font-medium text-gray-700">Added:</span>
                  <span className="text-gray-600">
                    {new Date(tool.date_added).toLocaleDateString()}
                  </span>
                </div>
                {tool.added_by && (
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-500" />
                    <span className="font-medium text-gray-700">Curator:</span>
                    <span className="text-gray-600">{tool.added_by}</span>
                  </div>
                )}
                {tool.content_type && (
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-gray-500" />
                    <span className="font-medium text-gray-700">Format:</span>
                    <span className="text-gray-600">{tool.content_type}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Feedback Widget */}
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg flex flex-col items-center shadow-inner">
            <p className="font-semibold text-gray-800 mb-4 text-lg">
              Was this learning guide helpful?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleFeedback(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-green-600 flex items-center"
              >
                <CheckCircle className="mr-2" size={20} /> Yes, very helpful
              </button>
              <button
                onClick={() => handleFeedback(false)}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-red-600 flex items-center"
              >
                <XCircle className="mr-2" size={20} /> Needs improvement
              </button>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`fixed bottom-8 right-8 p-4 rounded-lg shadow-xl text-white flex items-center z-50 ${
              message.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="mr-2" />
            ) : (
              <XCircle className="mr-2" />
            )}
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

export default LearningGuideDetail;
