# Content Extraction & Configuration Specification

## Overview

This specification outlines the plan to extract all hardcoded content from the Zeno KB application and implement a flexible configuration system. This will enable easy content management, localization, and customization without code changes.

## Current State Analysis

### Hardcoded Content Audit

**Location: `z_1/app/page.tsx`**

- Navigation labels: "Main", "Home", "Search", "Library", "Management"
- Page headings: "Browse categories", "All tools", "Search results"
- Sample tools data: 4 complete tool objects with titles, descriptions
- Sample categories: 4 category objects with titles, descriptions, icons
- Empty state messages: "Use the search bar above to find tools"

**Location: Components**

- `ToolCard.tsx`: Button labels, status text
- `ChatPanel.tsx`: Chat messages, prompts
- `CuratorDashboard.tsx`: Form labels, table headers
- `AppShell.tsx`: App name "Zeno Knows"

## Target Configuration System

### Configuration Files Structure

#### `z_1/config/app-config.json`

```json
{
  "app": {
    "name": "Zeno Knows",
    "version": "1.0.0"
  },
  "navigation": {
    "sections": [
      {
        "id": "main",
        "title": "Main",
        "items": [
          { "id": "home", "title": "Home", "icon": "Home" },
          { "id": "search", "title": "Search", "icon": "Search" },
          { "id": "library", "title": "Library", "icon": "BookOpen" }
        ]
      }
    ]
  }
}
```

#### `z_1/config/content.json`

```json
{
  "pages": {
    "home": {
      "sections": {
        "featured": { "title": "Featured Tools" },
        "categories": { "title": "Browse categories" },
        "allTools": { "title": "All tools" }
      }
    },
    "search": {
      "title": "Search Tools",
      "emptyState": "Use the search bar above to find tools"
    }
  }
}
```

#### `z_1/config/data.json`

```json
{
  "tools": [
    {
      "id": "1",
      "title": "GPT-4 Code Assistant",
      "description": "Advanced AI assistant for code generation, debugging, and optimization.",
      "type": "GPT",
      "tier": "Specialist"
    }
  ],
  "categories": [
    {
      "id": "1",
      "icon": "🤖",
      "title": "AI Assistants",
      "description": "Powerful AI tools for various tasks",
      "count": 24
    }
  ]
}
```

### Implementation Architecture

#### Config Manager: `z_1/lib/configManager.ts`

```typescript
interface Config {
  app: { name: string; version: string };
  navigation: { sections: NavigationSection[] };
  content: { pages: Record<string, any> };
  data: { tools: Tool[]; categories: Category[] };
}

class ConfigManager {
  private config: Config | null = null;

  async load(): Promise<Config> {
    if (!this.config) {
      const [app, content, data] = await Promise.all([
        fetch("/config/app-config.json").then((r) => r.json()),
        fetch("/config/content.json").then((r) => r.json()),
        fetch("/config/data.json").then((r) => r.json()),
      ]);

      this.config = { ...app, ...content, data };
    }
    return this.config;
  }

  getText(path: string): string {
    // Navigate nested object path like "pages.home.sections.featured.title"
    return this.getNestedValue(this.config, path) || `[${path}]`;
  }
}
```

#### React Hook: `z_1/hooks/useConfig.ts`

```typescript
export function useConfig() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    configManager
      .load()
      .then(setConfig)
      .finally(() => setLoading(false));
  }, []);

  const getText = (path: string) => {
    return config ? configManager.getText(path) : `[${path}]`;
  };

  return { config, loading, getText };
}
```

## Implementation Plan

### Phase 1: Infrastructure (3 days)

1. Create config directory and JSON files
2. Build ConfigManager class
3. Create useConfig hook
4. Set up TypeScript interfaces

### Phase 2: Data Extraction (5 days)

1. Move navigation data to config
2. Extract page content strings
3. Move tools and categories data
4. Update main page component

### Phase 3: Component Updates (7 days)

1. Update all components to use config
2. Replace hardcoded strings with getText calls
3. Add loading states
4. Test all functionality

### Phase 4: Polish & Optimization (3 days)

1. Add error handling
2. Optimize loading performance
3. Add config validation
4. Documentation

## Benefits

### Immediate Benefits

- ✅ Content updates without code changes
- ✅ Centralized content management
- ✅ Easier A/B testing
- ✅ Preparation for internationalization

### Long-term Benefits

- ✅ Non-technical content editing
- ✅ Environment-specific configurations
- ✅ Brand customization capability
- ✅ Reduced maintenance overhead

## Migration Strategy

1. **Gradual Implementation**: Start with navigation, then pages, then components
2. **Backward Compatibility**: Keep fallbacks during transition
3. **Feature Flags**: Use flags to switch between hardcoded and config-driven content
4. **Testing**: Comprehensive testing at each phase

## Success Criteria

- Zero hardcoded strings in components
- Config loading time < 100ms
- No TypeScript errors
- All existing functionality preserved
- Content updates possible without code deployment

This specification provides a clear roadmap for transforming Zeno KB into a configuration-driven application that's easier to maintain and customize.
