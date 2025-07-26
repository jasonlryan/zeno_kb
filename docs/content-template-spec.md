# Content Template Specification

## Overview

Different content types require different presentation templates to optimize user experience and information consumption. This specification outlines template variations based on data type and content structure.

## Content Types & Templates

### 1. Learning Guide Template

**Data Type:** `"Learning Guide"`
**Use Case:** Structured educational content with learning objectives

**Template Features:**

- **Prerequisites section** - Shows required prior knowledge
- **Learning objectives** - Clear bullet points of what users will learn
- **Estimated read time** - Helps users plan their learning
- **Progress tracking** - Checkboxes for completion
- **Sequential navigation** - Previous/Next guide suggestions
- **Interactive elements** - Code examples, exercises

**Layout:**

```
┌─────────────────────────────────────┐
│ [Badge: Learning Guide]             │
│ Title                               │
│ Description                         │
│                                     │
│ ⏱️ 15 min read | 📋 Prerequisites   │
│                                     │
│ 🎯 Learning Objectives:             │
│ • Objective 1                       │
│ • Objective 2                       │
│                                     │
│ [Start Learning] [Bookmark]         │
└─────────────────────────────────────┘
```

### 2. GPT/AI Assistant Template

**Data Type:** `"GPT"`, `"Platform"`
**Use Case:** AI tools and assistants

**Template Features:**

- **Try it now** button - Direct access to tool
- **Capability highlights** - What it's good at
- **Use case examples** - Specific scenarios
- **Tier/Access info** - Foundation/Specialist/etc.
- **Integration info** - How it connects to workflows

**Layout:**

```
┌─────────────────────────────────────┐
│ [Badge: GPT Assistant]              │
│ Title                               │
│ Description                         │
│                                     │
│ 🎯 Best for: Use case tags          │
│ 🔧 Tier: Foundation                 │
│                                     │
│ [Try Now] [Add to Favorites]        │
│ [View Examples]                     │
└─────────────────────────────────────┘
```

### 3. Documentation Template

**Data Type:** `"Doc"`
**Use Case:** Reference materials, guides, PDFs

**Template Features:**

- **Download/View options** - PDF, online view
- **Table of contents** - For longer docs
- **Last updated** - Freshness indicator
- **Related docs** - Cross-references
- **Print-friendly** option

**Layout:**

```
┌─────────────────────────────────────┐
│ [Badge: Documentation]              │
│ Title                               │
│ Description                         │
│                                     │
│ 📄 Format: PDF | 📅 Updated: Date   │
│                                     │
│ [View Online] [Download PDF]        │
│ [Print Version]                     │
└─────────────────────────────────────┘
```

### 4. Video Tutorial Template

**Data Type:** `"Video"`
**Use Case:** Video content and tutorials

**Template Features:**

- **Video thumbnail** - Preview image
- **Duration** - Video length
- **Transcript availability** - Accessibility
- **Chapter markers** - For longer videos
- **Related videos** - Playlist functionality
- **Playback speed** options

**Layout:**

```
┌─────────────────────────────────────┐
│ [Video Thumbnail]                   │
│ [Badge: Video Tutorial]             │
│ Title                               │
│ Description                         │
│                                     │
│ ▶️ 12:34 | 📝 Transcript Available   │
│                                     │
│ [Watch Now] [Add to Playlist]       │
│ [Download] [Share]                  │
└─────────────────────────────────────┘
```

### 5. Script/Tool Template

**Data Type:** `"Script"`
**Use Case:** Automation scripts, utilities

**Template Features:**

- **Installation instructions** - How to set up
- **Requirements** - Dependencies, environment
- **Code preview** - Snippet of the script
- **Usage examples** - Command line examples
- **GitHub integration** - Link to repository

**Layout:**

```
┌─────────────────────────────────────┐
│ [Badge: Script/Tool]                │
│ Title                               │
│ Description                         │
│                                     │
│ 💻 Language: Python | ⚡ Complexity │
│                                     │
│ [View Code] [Download] [Fork]       │
│ [Documentation]                     │
└─────────────────────────────────────┘
```

## Implementation Strategy

### Phase 1: Template Detection

```typescript
interface ContentTemplate {
  type: string;
  component: React.ComponentType;
  fields: string[];
  layout: "standard" | "video" | "learning" | "code";
}

const CONTENT_TEMPLATES: Record<string, ContentTemplate> = {
  "Learning Guide": {
    type: "learning",
    component: LearningGuideCard,
    fields: ["prerequisites", "learning_objectives", "estimated_read_time"],
    layout: "learning",
  },
  GPT: {
    type: "ai-assistant",
    component: AIAssistantCard,
    fields: ["tier", "complexity", "function"],
    layout: "standard",
  },
  // ... more templates
};
```

### Phase 2: Dynamic Component Selection

```typescript
function ToolCard({ tool }: { tool: Tool }) {
  const template = CONTENT_TEMPLATES[tool.type] || CONTENT_TEMPLATES["default"];
  const TemplateComponent = template.component;

  return <TemplateComponent tool={tool} template={template} />;
}
```

### Phase 3: Template-Specific Features

**Learning Guide Features:**

- Progress tracking
- Sequential navigation
- Interactive checkboxes
- Related content suggestions

**Video Features:**

- Embedded player
- Transcript toggle
- Chapter navigation
- Playback controls

**Script Features:**

- Syntax highlighting
- Copy code button
- Installation wizard
- Dependency checker

## Benefits

### User Experience

- ✅ **Optimized layouts** for different content types
- ✅ **Relevant actions** based on content type
- ✅ **Better information hierarchy**
- ✅ **Specialized interactions**

### Content Management

- ✅ **Flexible content structure**
- ✅ **Type-specific metadata**
- ✅ **Consistent presentation**
- ✅ **Easier content creation**

### Developer Experience

- ✅ **Reusable components**
- ✅ **Type-safe templates**
- ✅ **Easy to extend**
- ✅ **Maintainable code**

## Future Considerations

### Advanced Templates

- **Interactive tutorials** - Step-by-step guides with embedded tools
- **Comparison tables** - Side-by-side tool comparisons
- **Workflow builders** - Visual process creators
- **Assessment tools** - Quizzes and knowledge checks

### Personalization

- **User preferences** - Preferred template styles
- **Role-based views** - Different layouts for different user types
- **Adaptive content** - Templates that adjust based on user behavior
- **Accessibility options** - High contrast, screen reader optimized

This template system will make the Zeno KB much more engaging and appropriate for different types of content while maintaining consistency and usability.
