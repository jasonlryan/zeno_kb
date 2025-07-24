# Zeno Knowledge Hub

## 🚀 Current Project Status

**Last Updated:** June 28, 2025  
**Active Branch:** UI  
**Latest Commit:** 4a0c5b0 - "Add OpenAI chat interface with streaming support"

### 📊 Repository State

- **Main Branch:** `main` - Production/stable branch
- **UI Branch:** `UI` - Current development branch with latest features ✅
- **UI2 Branch:** `UI2` - Successfully merged into UI branch
- **All branches synced** with remote repository

### 🎯 Recent Major Actions (June 28, 2025)

1. ✅ **Implemented OpenAI Chat Interface** with streaming support
2. ✅ **Added Knowledge Base Integration** using data.json (26 tools)
3. ✅ **Enhanced UI/UX** with proper focus management and auto-scroll
4. ✅ **Added Clickable Tool Links** in AI responses
5. ✅ **Applied Zeno Branding** (green colors, proper styling)
6. ✅ **Improved Development Workflow** with updated dev.sh script
7. ✅ **Merged UI2 → UI** and pushed to remote

### 🛠️ Technical Implementation

- **OpenAI Integration:** Streaming chat with gpt-4o-mini model
- **Knowledge Base API:** `/api/knowledge-base` endpoint serving tool data
- **Enhanced Markdown:** Proper rendering with clickable links
- **Focus Management:** Smart auto-scroll with user interaction detection
- **Responsive Design:** Fixed height chat interface with proper viewport handling

### 🏗️ Architecture

```
zeno_kb/                    ← Git repository root
├── .git/                   ← Git tracking (UI, UI2, main branches)
├── dev.sh                  ← Development startup script
├── z_1/                    ← Next.js application
│   ├── app/               ← Next.js app router
│   │   ├── api/           ← API endpoints (knowledge-base)
│   │   └── page.tsx       ← Main page with chat interface
│   ├── components/        ← React components (ChatPanel, etc.)
│   ├── lib/               ← Utilities (aiService, configManager)
│   ├── data/              ← Knowledge base CSV files
│   └── config/            ← Configuration files (data.json)
└── other project files...
```

---

## 💻 Development

### Quick Start

```bash
# From project root
./dev.sh
# Starts Next.js dev server at http://localhost:3000
```

### Environment Setup

- Requires `NEXT_PUBLIC_OPENAI_API_KEY` in .env file
- Uses pnpm for package management
- Built with Next.js 15.2.4, React 19, TypeScript

### Key Features

- **AI Chat Assistant** - Streaming responses with tool recommendations
- **Knowledge Base** - 26 AI tools with descriptions and links
- **Smart Auto-scroll** - User-controlled chat experience
- **Responsive Design** - Works on desktop and mobile
- **Zeno Branding** - Consistent green color scheme

---

_Original v0.dev integration maintained below for reference_

## v0.dev Integration

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/jasonlryans-projects/v0-zeno-knows-component-library)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/QHSANAdM2NA)

This repository stays in sync with deployed chats on [v0.dev](https://v0.dev).

**Live Deployment:** [https://vercel.com/jasonlryans-projects/v0-zeno-knows-component-library](https://vercel.com/jasonlryans-projects/v0-zeno-knows-component-library)

**Continue Building:** [https://v0.dev/chat/projects/QHSANAdM2NA](https://v0.dev/chat/projects/QHSANAdM2NA)
# Updated Thu Jul 24 07:15:04 BST 2025
