"use client";
import { useState, useEffect } from "react";
import type React from "react";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConfig } from "../hooks/useConfig";
import type { Tool } from "../types";

interface ToolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Tool, "id">) => void;
  tool?: Tool;
  className?: string;
}

export function ToolFormModal({
  isOpen,
  onClose,
  onSave,
  tool,
  className,
}: ToolFormModalProps) {
  const { dataConfig } = useConfig();

  const [formData, setFormData] = useState({
    title: tool?.title || "",
    description: tool?.description || "",
    url: tool?.url || "",
    type: tool?.type || "GPT",
    categories: tool?.categories || [],
    tags: tool?.tags || [],
    function: tool?.function || "",
    created_by: tool?.created_by || "",
    featured: tool?.featured || false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Admin functionality for adding new items
  const [showAddPrimaryCategory, setShowAddPrimaryCategory] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newPrimaryCategoryName, setNewPrimaryCategoryName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newTagName, setNewTagName] = useState("");

  useEffect(() => {
    setFormData({
      title: tool?.title || "",
      description: tool?.description || "",
      url: tool?.url || "",
      type: tool?.type || "GPT",
      categories: tool?.categories || [],
      tags: tool?.tags || [],
      function: tool?.function || "",
      created_by: tool?.created_by || "",
      featured: tool?.featured || false,
    });
  }, [tool, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.url.trim()) {
      newErrors.url = "URL is required";
    }
    if (!formData.type.trim()) {
      newErrors.type = "Type is required";
    }
    if (!formData.function.trim()) {
      newErrors.function = "Function is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const toolData = {
      title: formData.title,
      description: formData.description,
      url: formData.url,
      type: formData.type,
      function: formData.function,
      categories: formData.categories,
      tags: formData.tags,
    };
    onSave(toolData);
    onClose();
  };

  const handleInputChange = (
    field: string,
    value: string | string[] | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleCategoryToggle = (categoryName: string) => {
    const currentCategories = Array.isArray(formData.categories)
      ? formData.categories
      : [];
    const newCategories = currentCategories.includes(categoryName)
      ? currentCategories.filter((cat) => cat !== categoryName)
      : [...currentCategories, categoryName];
    handleInputChange("categories", newCategories);
  };

  const handleTagToggle = (tagName: string) => {
    const currentTags = Array.isArray(formData.tags) ? formData.tags : [];
    const newTags = currentTags.includes(tagName)
      ? currentTags.filter((tag) => tag !== tagName)
      : [...currentTags, tagName];
    handleInputChange("tags", newTags);
  };

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      // Add to form data
      handleCategoryToggle(newCategoryName.trim());

      // TODO: Save to taxonomy in backend
      console.log(
        "TODO: Save new category to taxonomy:",
        newCategoryName.trim()
      );

      // Reset form
      setNewCategoryName("");
      setShowAddCategory(false);
    }
  };

  const handleAddNewTag = () => {
    if (newTagName.trim()) {
      // Add to form data
      handleTagToggle(newTagName.trim());

      // TODO: Save to taxonomy in backend
      console.log("TODO: Save new tag to taxonomy:", newTagName.trim());

      // Reset form
      setNewTagName("");
      setShowAddTag(false);
    }
  };

  const handleAddNewPrimaryCategory = () => {
    if (newPrimaryCategoryName.trim()) {
      // Add to form data - update the first category
      const newCategories = [
        ...(Array.isArray(formData.categories) ? formData.categories : []),
      ];
      newCategories[0] = newPrimaryCategoryName.trim();
      handleInputChange("categories", newCategories.filter(Boolean));

      // TODO: Save to business categories in backend
      console.log(
        "TODO: Save new primary category:",
        newPrimaryCategoryName.trim()
      );

      // Reset form
      setNewPrimaryCategoryName("");
      setShowAddPrimaryCategory(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      {/* Modal */}
      <div
        className={cn(
          "relative bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between zeno-content-padding border-b border-gray-200 dark:border-gray-700">
          <h2 className="zeno-heading text-xl font-semibold text-foreground dark:text-white">
            {tool ? "Edit Tool" : "Add New Tool"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="zeno-content-padding space-y-4">
          {tool && (
            <div className="flex gap-8 mb-2">
              <div>
                <label className="zeno-body block text-xs font-medium text-muted-foreground dark:text-gray-400 mb-0.5">
                  Created On
                </label>
                <div className="zeno-body text-sm text-foreground dark:text-gray-200">
                  {tool.date_created
                    ? new Date(tool.date_created).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "-"}
                </div>
              </div>
              <div>
                <label className="zeno-body block text-xs font-medium text-muted-foreground dark:text-gray-400 mb-0.5">
                  Created By
                </label>
                <div className="zeno-body text-sm text-foreground dark:text-gray-200">
                  {tool.created_by || "-"}
                </div>
              </div>
            </div>
          )}
          <div>
            <label className="zeno-label">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="zeno-input"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>
          <div>
            <label className="zeno-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className="zeno-input"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="zeno-label">Type</label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="zeno-input"
              >
                <option value="GPT">GPT</option>
                <option value="Doc">Doc</option>
                <option value="Script">Script</option>
                <option value="Video">Video</option>
              </select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type}</p>
              )}
            </div>
            <div>
              <label className="zeno-label">Function</label>
              <input
                type="text"
                value={formData.function}
                onChange={(e) => handleInputChange("function", e.target.value)}
                placeholder="e.g. Audience Research"
                className="zeno-input"
              />
              {errors.function && (
                <p className="text-red-500 text-sm mt-1">{errors.function}</p>
              )}
            </div>
          </div>
          <div>
            <label className="zeno-label">URL</label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => handleInputChange("url", e.target.value)}
              className="zeno-input"
            />
            {errors.url && (
              <p className="text-red-500 text-sm mt-1">{errors.url}</p>
            )}
          </div>

          {/* Featured Toggle */}
          <div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) =>
                  handleInputChange("featured", e.target.checked)
                }
                className="zeno-checkbox"
              />
              <label
                htmlFor="featured"
                className="zeno-label mb-0 flex items-center"
              >
                <span className="mr-2">Featured Tool</span>
                <span className="text-xs text-muted-foreground dark:text-gray-400">
                  (Shows green border and appears in carousel)
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="zeno-label mb-0">Category</label>
                <button
                  type="button"
                  onClick={() =>
                    setShowAddPrimaryCategory(!showAddPrimaryCategory)
                  }
                  className="text-xs text-primary hover:text-primary/80 font-medium"
                >
                  + Add New
                </button>
              </div>

              {showAddPrimaryCategory && (
                <div className="mb-3 p-3 bg-muted dark:bg-gray-800 rounded-lg">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPrimaryCategoryName}
                      onChange={(e) =>
                        setNewPrimaryCategoryName(e.target.value)
                      }
                      placeholder="Enter new business category"
                      className="zeno-input flex-1 text-xs"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddNewPrimaryCategory()
                      }
                    />
                    <button
                      type="button"
                      onClick={handleAddNewPrimaryCategory}
                      className="zeno-button-primary text-xs px-3 py-1"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddPrimaryCategory(false);
                        setNewPrimaryCategoryName("");
                      }}
                      className="zeno-button-secondary text-xs px-3 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <select
                value={
                  Array.isArray(formData.categories)
                    ? formData.categories[0] || ""
                    : ""
                }
                onChange={(e) => {
                  const newCategories = [
                    ...(Array.isArray(formData.categories)
                      ? formData.categories
                      : []),
                  ];
                  newCategories[0] = e.target.value;
                  handleInputChange(
                    "categories",
                    newCategories.filter(Boolean)
                  );
                }}
                className="zeno-input"
              >
                <option value="">Select Category</option>
                <option value="Account">Account</option>
                <option value="Strategy & Planning">Strategy & Planning</option>
                <option value="Data + Intelligence">Data + Intelligence</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="zeno-label mb-0">Tag Categories</label>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  className="text-xs text-primary hover:text-primary/80 font-medium"
                >
                  + Add New
                </button>
              </div>

              {showAddCategory && (
                <div className="mb-3 p-3 bg-muted dark:bg-gray-800 rounded-lg">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Enter new category name"
                      className="zeno-input flex-1 text-xs"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddNewCategory()
                      }
                    />
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      className="zeno-button-primary text-xs px-3 py-1"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCategory(false);
                        setNewCategoryName("");
                      }}
                      className="zeno-button-secondary text-xs px-3 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-32 overflow-y-auto">
                {dataConfig?.tagCategories ? (
                  Object.values(dataConfig.tagCategories).map(
                    (category: any) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-2 mb-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            Array.isArray(formData.categories) &&
                            formData.categories.includes(category.name)
                          }
                          onChange={() => handleCategoryToggle(category.name)}
                          className="zeno-checkbox"
                        />
                        <span className="zeno-body text-sm">
                          {category.name}
                        </span>
                      </label>
                    )
                  )
                ) : (
                  <span className="text-muted-foreground text-sm">
                    No categories available
                  </span>
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="zeno-label mb-0">Tags</label>
              <button
                type="button"
                onClick={() => setShowAddTag(!showAddTag)}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                + Add New
              </button>
            </div>

            {showAddTag && (
              <div className="mb-3 p-3 bg-muted dark:bg-gray-800 rounded-lg">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Enter new tag name (use hyphens for multi-word tags)"
                    className="zeno-input flex-1 text-xs"
                    onKeyPress={(e) => e.key === "Enter" && handleAddNewTag()}
                  />
                  <button
                    type="button"
                    onClick={handleAddNewTag}
                    className="zeno-button-primary text-xs px-3 py-1"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddTag(false);
                      setNewTagName("");
                    }}
                    className="zeno-button-secondary text-xs px-3 py-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-3 max-h-40 overflow-y-auto">
              {(() => {
                // Get all available tags from selected categories
                const availableTags = new Set<string>();
                if (dataConfig?.tagCategories) {
                  Object.values(dataConfig.tagCategories).forEach(
                    (category: any) => {
                      category.tags.forEach((tag: string) =>
                        availableTags.add(tag)
                      );
                    }
                  );
                }

                const sortedTags = Array.from(availableTags).sort();

                return sortedTags.length > 0 ? (
                  sortedTags.map((tag) => (
                    <label
                      key={tag}
                      className="flex items-center gap-2 mb-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={
                          Array.isArray(formData.tags) &&
                          formData.tags.includes(tag)
                        }
                        onChange={() => handleTagToggle(tag)}
                        className="zeno-checkbox"
                      />
                      <span className="zeno-body text-sm">{tag}</span>
                    </label>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm">
                    No tags available
                  </span>
                );
              })()}
            </div>
          </div>
          {!tool && (
            <div>
              <label className="zeno-label">Created By</label>
              <input
                type="text"
                value={formData.created_by}
                onChange={(e) =>
                  handleInputChange("created_by", e.target.value)
                }
                className="zeno-input"
              />
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="zeno-button-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="zeno-button-primary">
              {tool ? "Update" : "Create"} Tool
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
