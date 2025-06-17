# Configuration System

This directory contains the centralized configuration system for the Zeno Knowledge Base application. All hardcoded content, settings, and data have been extracted into structured JSON files for easy management.

## Overview

The configuration system consists of three main files:

- **`app-config.json`** - Application settings, navigation, UI configuration, and feature flags
- **`content.json`** - All text content, labels, messages, and copy used throughout the UI
- **`data.json`** - Tools, categories, users, and other structured data

## File Structure

```
z_1/config/
├── app-config.json     # App settings & configuration
├── content.json        # UI text & content
├── data.json          # Structured data
└── README.md          # This documentation
```

## Configuration Files

### app-config.json

Contains application-wide settings and configuration:

```json
{
  "app": {
    "name": "Zeno Knowledge Base",
    "version": "1.0.0",
    "description": "Centralized platform for AI tools and resources"
  },
  "navigation": {
    "sidebar": {
      "sections": [...]
    }
  },
  "search": {
    "placeholder": "Search tools, docs, and resources...",
    "filters": {...}
  },
  "ui": {
    "theme": {...},
    "layout": {...},
    "animations": {...}
  },
  "features": {
    "aiChat": { "enabled": true },
    "accessControl": { "enabled": true }
  },
  "limits": {
    "searchResults": 50,
    "featuredTools": 5
  }
}
```

**Key Sections:**

- `app` - Basic application metadata
- `navigation` - Sidebar navigation structure and settings
- `search` - Search functionality configuration
- `ui` - Theme, layout, and visual settings
- `features` - Feature flags for enabling/disabling functionality
- `limits` - Pagination and display limits

### content.json

Contains all user-facing text content:

```json
{
  "pages": {
    "home": {
      "title": "Welcome to Zeno Knowledge Base",
      "sections": {
        "featured": {
          "title": "Featured Tools",
          "subtitle": "Curated selection of top-performing tools"
        }
      }
    }
  },
  "components": {
    "toolCard": {
      "labels": {
        "tier": "Tier:",
        "complexity": "Complexity:"
      },
      "actions": {
        "view": "View Details",
        "save": "Save"
      }
    }
  },
  "forms": {
    "validation": {
      "required": "This field is required"
    }
  }
}
```

**Key Sections:**

- `pages` - Page-specific content (titles, headings, descriptions)
- `components` - Component-specific labels and text
- `forms` - Form validation messages and action labels
- `states` - Loading, error, and empty state messages
- `time` - Date formatting and relative time labels

### data.json

Contains structured application data:

```json
{
  "tools": [
    {
      "id": "1",
      "title": "GPT-4 Code Assistant",
      "type": "GPT",
      "tier": "Specialist",
      "featured": true
    }
  ],
  "categories": [
    {
      "id": "1",
      "title": "AI Assistants",
      "icon": "🤖",
      "count": 24
    }
  ],
  "functionCategories": [
    "Content & Creative",
    "Audience Insights"
  ],
  "users": [...],
  "announcements": [...]
}
```

**Key Sections:**

- `tools` - All available tools and resources
- `categories` - Tool categories with metadata
- `functionCategories` - Function-based categorization
- `tags` - Available tags with styling
- `users` - User data for attribution
- `announcements` - Active announcements and banners

## Usage

### TypeScript Integration

The configuration system is fully typed with TypeScript interfaces:

```typescript
import { useConfig, useText, useTools } from "../hooks/useConfig";

function MyComponent() {
  const { app, content } = useConfig();
  const title = useText("pages.home.title");
  const tools = useTools();

  return (
    <div>
      <h1>{title}</h1>
      <p>Version: {app.app.version}</p>
    </div>
  );
}
```

### Available Hooks

- **`useConfig()`** - Access all configuration data
- **`useText(path)`** - Get text content by path
- **`useNavigation()`** - Get navigation structure
- **`useTools()`** - Get tools data with filtering methods
- **`useCategories()`** - Get categories data
- **`useFeatures()`** - Get feature flag states
- **`usePageContent(page)`** - Get page-specific content
- **`useComponentContent(component)`** - Get component-specific content

### ConfigManager

Direct access to configuration data:

```typescript
import { configManager } from "../lib/configManager";

// Get text content
const title = configManager.getText("pages.home.title");

// Check feature flags
const isAIChatEnabled = configManager.isFeatureEnabled("aiChat.enabled");

// Get tools data
const featuredTools = configManager.getFeaturedTools();
const recentTools = configManager.getRecentTools();
```

## Key Structure Patterns

### Dot-Notation Paths

Text content is accessed using dot-notation paths:

```typescript
// pages.home.title → "Welcome to Zeno Knowledge Base"
// components.toolCard.actions.save → "Save"
// forms.validation.required → "This field is required"
```

### Hierarchical Organization

Content is organized hierarchically:

```
pages/
  ├── home/
  │   ├── title
  │   ├── subtitle
  │   └── sections/
  │       ├── featured/
  │       └── categories/
  └── search/
      ├── title
      └── filters/
```

### Feature Flags

Features can be enabled/disabled via configuration:

```json
{
  "features": {
    "aiChat": { "enabled": true },
    "accessControl": { "enabled": true },
    "scheduling": { "enabled": false }
  }
}
```

## Benefits

### Content Management

- **No Code Changes**: Update text content without touching code
- **Centralized**: All content in one place for easy management
- **Consistent**: Standardized text patterns across the application

### Internationalization Ready

- **Structure**: Prepared for multi-language support
- **Separation**: Content separated from logic
- **Scalable**: Easy to add new languages

### A/B Testing Support

- **Dynamic**: Content can be changed without deployment
- **Flexible**: Easy to test different messaging
- **Trackable**: Changes are version controlled

### Developer Experience

- **Type Safety**: Full TypeScript support
- **IntelliSense**: Auto-completion for all config paths
- **Validation**: Compile-time checks for configuration structure

### Performance

- **Caching**: Built-in caching for frequently accessed data
- **Memoization**: React hooks prevent unnecessary re-renders
- **Lazy Loading**: Configuration loaded only when needed

## Development Workflow

### Adding New Content

1. **Add to appropriate config file**:

   ```json
   // content.json
   {
     "components": {
       "myNewComponent": {
         "title": "My New Component",
         "actions": {
           "submit": "Submit"
         }
       }
     }
   }
   ```

2. **Use in component**:
   ```typescript
   const content = useComponentContent("myNewComponent");
   return <h1>{content.title}</h1>;
   ```

### Adding New Features

1. **Add feature flag**:

   ```json
   // app-config.json
   {
     "features": {
       "myNewFeature": {
         "enabled": true,
         "beta": false
       }
     }
   }
   ```

2. **Check in component**:
   ```typescript
   const isEnabled = useConfig().isFeatureEnabled("myNewFeature.enabled");
   if (!isEnabled) return null;
   ```

### Adding New Data

1. **Add to data.json**:

   ```json
   {
     "myDataType": [{ "id": "1", "name": "Item 1" }]
   }
   ```

2. **Update types** in `types/config.ts`
3. **Add getter** in `configManager.ts`
4. **Create hook** in `hooks/useConfig.ts`

## Best Practices

### Content Organization

- Group related content together
- Use consistent naming conventions
- Keep paths shallow when possible
- Use descriptive key names

### Feature Flags

- Default to `false` for new features
- Include description in comments
- Remove flags after feature is stable
- Use nested objects for complex features

### Data Structure

- Include all necessary metadata
- Use consistent field names
- Validate data structure
- Keep data normalized

### Performance

- Use hooks for React components
- Cache expensive computations
- Avoid deep object access in render loops
- Use memoization appropriately

## Migration Guide

### From Hardcoded Content

1. **Identify hardcoded strings** in components
2. **Add to content.json** with appropriate path
3. **Replace with `useText()` hook**
4. **Test functionality** remains the same

### Example Migration

**Before:**

```typescript
function ToolCard() {
  return (
    <div>
      <h3>Tool Details</h3>
      <button>Save to Library</button>
    </div>
  );
}
```

**After:**

```typescript
function ToolCard() {
  const content = useComponentContent("toolCard");

  return (
    <div>
      <h3>{content.labels.details}</h3>
      <button>{content.actions.save}</button>
    </div>
  );
}
```

## Troubleshooting

### Common Issues

**Path not found**: Check spelling and ensure path exists in config
**Type errors**: Verify interfaces match JSON structure
**Cache issues**: Clear cache with `configManager.clearCache()`
**Performance**: Use appropriate hooks, avoid direct configManager calls in render

### Debugging

```typescript
// Check cache status
console.log(configManager.getCacheStats());

// Verify path exists
console.log(configManager.getText("your.path.here"));

// Check feature flags
console.log(configManager.isFeatureEnabled("feature.name"));
```

## Future Enhancements

- **Dynamic Loading**: Load config from API
- **Environment Overrides**: Different configs per environment
- **Admin Interface**: UI for managing configuration
- **Validation**: Runtime validation of config structure
- **Hot Reloading**: Update config without restart
- **Internationalization**: Multi-language support
- **A/B Testing**: Dynamic content variation
- **Analytics**: Track config usage patterns
