/**
 * ZENO KB - Template Manager
 *
 * Manages templates for learning guides and tools, including template lookup and type checks.
 * Used in LearningGuideCard, ToolDetailModal, and other components for template-driven UI.
 *
 * Core to template-based rendering in Zeno Knowledge Base.
 */
import React from 'react';
import type { Tool } from '../types';

export interface ContentTemplate {
  type: string;
  component: string; // Component name as string for dynamic import
  fields: string[];
  layout: 'standard' | 'video' | 'learning' | 'code' | 'platform';
  displayName: string;
  icon: string;
  actionText: string;
}

export const CONTENT_TEMPLATES: Record<string, ContentTemplate> = {
  'Learning Guide': {
    type: 'learning',
    component: 'LearningGuideCard',
    fields: ['prerequisites', 'learning_objectives', 'estimated_read_time', 'content_type'],
    layout: 'learning',
    displayName: 'Learning Guide',
    icon: '📚',
    actionText: 'Start Learning'
  },
  'GPT': {
    type: 'ai-assistant',
    component: 'AIAssistantCard',
    fields: ['tier', 'complexity', 'function'],
    layout: 'standard',
    displayName: 'AI Assistant',
    icon: '🤖',
    actionText: 'Try Now'
  },
  'Platform': {
    type: 'platform',
    component: 'PlatformCard',
    fields: ['tier', 'complexity', 'function'],
    layout: 'platform',
    displayName: 'Platform',
    icon: '🌐',
    actionText: 'Visit Platform'
  },
  'Doc': {
    type: 'documentation',
    component: 'DocumentationCard',
    fields: ['date_added', 'added_by'],
    layout: 'standard',
    displayName: 'Documentation',
    icon: '📄',
    actionText: 'View Document'
  },
  'Video': {
    type: 'video',
    component: 'VideoCard',
    fields: ['duration', 'transcript_available'],
    layout: 'video',
    displayName: 'Video Tutorial',
    icon: '🎥',
    actionText: 'Watch Video'
  },
  'Script': {
    type: 'script',
    component: 'ScriptCard',
    fields: ['language', 'requirements'],
    layout: 'code',
    displayName: 'Script/Tool',
    icon: '⚡',
    actionText: 'View Code'
  },
  'Tool': {
    type: 'tool',
    component: 'ToolCard',
    fields: ['tier', 'complexity'],
    layout: 'standard',
    displayName: 'Tool',
    icon: '🔧',
    actionText: 'Use Tool'
  }
};

export class TemplateManager {
  static getTemplate(tool: Tool): ContentTemplate {
    return CONTENT_TEMPLATES[tool.type] || CONTENT_TEMPLATES['Tool'];
  }

  static getTemplateFields(tool: Tool): Record<string, any> {
    const template = this.getTemplate(tool);
    const fields: Record<string, any> = {};
    
    template.fields.forEach(field => {
      if (tool[field as keyof Tool] !== undefined) {
        fields[field] = tool[field as keyof Tool];
      }
    });
    
    return fields;
  }

  static getActionText(tool: Tool): string {
    const template = this.getTemplate(tool);
    return template.actionText;
  }

  static getDisplayIcon(tool: Tool): string {
    const template = this.getTemplate(tool);
    return template.icon;
  }

  static getDisplayName(tool: Tool): string {
    const template = this.getTemplate(tool);
    return template.displayName;
  }

  static isLearningContent(tool: Tool): boolean {
    return tool.type === 'Learning Guide';
  }

  static isVideoContent(tool: Tool): boolean {
    return tool.type === 'Video';
  }

  static isCodeContent(tool: Tool): boolean {
    return tool.type === 'Script';
  }

  static isPlatformContent(tool: Tool): boolean {
    return tool.type === 'Platform';
  }
} 