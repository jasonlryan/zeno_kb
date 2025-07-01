# Environment Configuration

This document describes the available environment variables for configuring the Zeno Knowledge Hub.

## Required Configuration

### OpenAI API Key

```bash
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key-here
```

- **Required**: Yes
- **Description**: Your OpenAI API key for AI chat functionality
- **How to get**: Visit https://platform.openai.com/api-keys

## Feature Toggles

### Filter Functionality

```bash
NEXT_PUBLIC_ENABLE_FILTERS=false
```

- **Required**: No
- **Default**: `false`
- **Description**: Enable/disable the filter panel and filter button
- **Values**: `true` or `false`
- **When enabled**: Shows filter panel on the left side with search and categorization options
- **When disabled**: Hides filter panel completely for a cleaner interface

## Setup Instructions

1. Create a `.env.local` file in the `z_1` directory
2. Add your configuration variables:

```bash
# .env.local
NEXT_PUBLIC_OPENAI_API_KEY=your-actual-api-key-here
NEXT_PUBLIC_ENABLE_FILTERS=false
```

3. Restart your development server: `pnpm dev`

## Feature Flag Architecture

Feature flags are managed in `lib/featureFlags.ts` and can be easily extended for future functionality:

- Filters: Controlled by `NEXT_PUBLIC_ENABLE_FILTERS`
- Future features can be added following the same pattern

## Development vs Production

- Environment variables prefixed with `NEXT_PUBLIC_` are available in the browser
- For security-sensitive config, use server-side only variables (without `NEXT_PUBLIC_`)
- Always test feature flags in both enabled and disabled states
