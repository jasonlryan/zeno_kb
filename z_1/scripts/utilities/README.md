# Utilities for Day-to-Day Operations

This folder contains **all scripts required for daily operations and maintenance** of the Zeno Knowledge Base system. Use these scripts for backup, export, style auditing, and configuration sync.

---

## 📋 **Scripts in This Folder**

- **`completeDataExporter.js`** — Export a complete backup of all Redis data (tools, configs, analytics) as CSV/JSON.
- **`redisDataExporter.js`** — Export only tool/config data from Redis as CSV/JSON.
- **`analyticsDataExporter.js`** — Export analytics data (chat, views, favorites, etc.) from Redis as CSV.
- **`seedRedisConfigs.ts`** — Sync Redis with configuration files (for config refresh or new environments).
- **`styleAuditor.js`** — Audit the codebase for style violations against Zeno brand/style rules.

---

## 🚀 **Usage Examples**

### **Complete Data Backup**

```bash
node scripts/utilities/completeDataExporter.js
```

### **Export Tool/Config Data**

```bash
node scripts/utilities/redisDataExporter.js
```

### **Export Analytics Data**

```bash
node scripts/utilities/analyticsDataExporter.js
```

### **Sync Redis Configurations**

```bash
node scripts/utilities/seedRedisConfigs.ts
```

### **Run Style Audit**

```bash
node scripts/utilities/styleAuditor.js --ignore "**/node_modules/**"
```

---

## 📝 **Notes**

- All scripts are designed to be run from the `z_1/` directory.
- Environment variables for Redis, Supabase, and OpenAI must be set in `.env.local`.
- See the main `scripts/README.md` for a high-level overview and documentation links.

---

**This folder is the single source for all operational scripts needed to run, maintain, and audit the Zeno Knowledge Base system.**
