# Zeno KB Scripts Directory

This directory contains all utility scripts for the Zeno Knowledge Base project, organized for clarity and ease of maintenance.

## 📁 **Directory Structure**

```
scripts/
├── utilities/              # 🚀 DAY-TO-DAY OPERATIONS
│   ├── completeDataExporter.js    # Complete system backup/export
│   ├── redisDataExporter.js       # Export tool/config data from Redis
│   ├── analyticsDataExporter.js   # Export analytics data from Redis
│   ├── seedRedisConfigs.ts        # Sync Redis with config files
│   ├── styleAuditor.js            # Style compliance audit
│   └── README.md                  # Detailed utilities documentation
├── setup/                  # 🗂️ HISTORICAL SETUP (Reference Only)
│   ├── README.md                  # Setup documentation
│   ├── generateShortDescriptions.js
│   ├── csvDataCleaner.js
│   ├── csvMultiLineFixer.js
│   ├── csvRobustCleaner.js
│   ├── dataConverter.js
│   ├── dataAuditor.js
│   ├── migrationPipeline.js
│   ├── configMigrationPlanner.js
│   ├── configSynchronizer.js
│   ├── create_test_users.js
│   └── urlHealthChecker.js
└── README.md               # 📋 This file
```

---

## 🚀 **Essential Scripts for Day-to-Day Operations**

### **Location: `utilities/` folder**

These scripts are **essential for ongoing Zeno operations**:

#### **Data Export & Backup**

- **`completeDataExporter.js`** — Complete system backup (all data + analytics)
- **`redisDataExporter.js`** — Export tool/config data from Redis
- **`analyticsDataExporter.js`** — Export analytics data from Redis

#### **Quality Assurance**

- **`styleAuditor.js`** — Audit codebase for Zeno brand/style compliance

#### **Configuration Management**

- **`seedRedisConfigs.ts`** — Sync Redis with configuration files

---

## 🗂️ **Historical Setup Scripts**

### **Location: `setup/` folder**

These scripts were used during initial data migration and setup. **Not needed for daily operations.**

- **`generateShortDescriptions.js`** — Generated tool descriptions (now managed via UI)
- **`csvDataCleaner.js`** — Historical CSV processing
- **`migrationPipeline.js`** — Historical data migration orchestration
- **`create_test_users.js`** — Development utility for test user creation
- **And others...** — See `setup/README.md` for complete list

---

## 🎯 **Quick Start for Zeno Operations**

### **Essential Commands**

```bash
# Complete data backup (recommended for regular backups)
pnpm export:complete

# Export just tool/content data
pnpm export:data

# Export just analytics data
pnpm export:analytics

# Check for style violations
pnpm audit:styles

# Sync Redis configurations
node scripts/utilities/seedRedisConfigs.ts
```

### **Manual Execution**

```bash
# Complete backup with custom output
node scripts/utilities/completeDataExporter.js --output=./my-backups

# Export analytics for last 7 days
node scripts/utilities/analyticsDataExporter.js --days=7

# Style audit with custom ignore
node scripts/utilities/styleAuditor.js --ignore "**/node_modules/**"
```

---

## 📊 **What Each Export Contains**

### **Complete Export** (`pnpm export:complete`)

- ✅ All configuration data (app, content, data, taxonomy)
- ✅ All tools and user data
- ✅ All analytics data (chat, views, favorites, sessions)
- ✅ Summary reports and metadata

### **Data Export** (`pnpm export:data`)

- ✅ Configuration data and tools
- ✅ Users and favorites data
- ❌ No analytics data

### **Analytics Export** (`pnpm export:analytics`)

- ✅ Chat queries and responses
- ✅ Tool views and favorites
- ✅ User sessions and activity
- ❌ No configuration or tool data

---

## 🔧 **Environment Requirements**

### **Required Environment Variables** (`.env.local`)

```bash
# Redis (Upstash)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# OpenAI (for style audit)
OPENAI_API_KEY=your_openai_key

# Supabase (for config sync)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Dependencies**

All scripts use Node.js and npm packages already installed in the project:

- `@upstash/redis` — Redis client
- `csv-stringify` — CSV generation
- `dotenv` — Environment variable loading

---

## 📋 **Recommended Usage Schedule**

### **Daily**

- `pnpm audit:styles` — Before committing code changes

### **Weekly**

- `pnpm export:data` — Backup tool and configuration data
- `pnpm export:analytics` — Backup analytics data

### **Monthly**

- `pnpm export:complete` — Complete system backup
- `node scripts/utilities/seedRedisConfigs.ts` — Sync configurations

### **Before Zeno Handover**

- `pnpm export:complete` — Final complete backup
- Document all export files and their purposes

---

## 🎉 **Success Indicators**

### **Successful Export**

- ✅ Files created in output directory
- ✅ No error messages in console
- ✅ CSV files contain expected data
- ✅ Summary report shows correct counts

### **Successful Style Audit**

- ✅ No violations found
- ✅ Exit code 0
- ✅ Clean console output

### **Successful Config Sync**

- ✅ Redis updated with latest configs
- ✅ No error messages
- ✅ Application loads correctly

---

## 🚨 **Troubleshooting**

### **Export Fails**

```bash
# Check Redis connection
node -e "const { Redis } = require('@upstash/redis'); const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN }); redis.ping().then(console.log).catch(console.error)"
```

### **Style Audit Issues**

```bash
# Check specific file
node scripts/utilities/styleAuditor.js --file components/MyComponent.tsx

# Generate detailed report
node scripts/utilities/styleAuditor.js --output=style-report.json
```

### **Configuration Sync Issues**

```bash
# Check configuration files exist
ls -la public/_config/

# Verify Redis connection
node scripts/utilities/seedRedisConfigs.ts --dry-run
```

---

## 📁 **Output Locations**

### **Default Export Locations**

- **Complete Export**: `./exports/` (timestamped folders)
- **Data Export**: `./exports/` (CSV files)
- **Analytics Export**: `./analytics/` (CSV files)
- **Style Reports**: `./style-audit-report.json`

### **Custom Locations**

```bash
# Custom output directory
node scripts/utilities/completeDataExporter.js --output=./my-backups

# Custom analytics period
node scripts/utilities/analyticsDataExporter.js --days=7 --output=./weekly-reports
```

---

## 🎉 **Quick Reference for Zeno Operations**

### **Recommended Usage Schedule**

#### **Daily**

- `pnpm audit:styles` - Before committing code changes

#### **Weekly**

- `pnpm export:data` - Backup tool and configuration data
- `pnpm export:analytics` - Backup analytics data

#### **Monthly**

- `pnpm export:complete` - Complete system backup
- `node scripts/utilities/seedRedisConfigs.ts` - Sync configurations

#### **Before Zeno Handover**

- `pnpm export:complete` - Final complete backup
- Document all export files and their purposes

### **Success Indicators**

- ✅ Files created in output directory
- ✅ No error messages in console
- ✅ CSV files contain expected data
- ✅ Summary report shows correct counts
- ✅ No violations found in style audit
- ✅ Redis updated with latest configs
- ✅ Application loads correctly

### **Troubleshooting**

- **Export Fails:**
  - Check Redis connection:
    ```bash
    node -e "const { Redis } = require('@upstash/redis'); const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN }); redis.ping().then(console.log).catch(console.error)"
    ```
- **Style Audit Issues:**
  - Check specific file:
    ```bash
    node scripts/utilities/styleAuditor.js --file components/MyComponent.tsx
    ```
  - Generate detailed report:
    ```bash
    node scripts/utilities/styleAuditor.js --output=style-report.json
    ```
- **Configuration Sync Issues:**
  - Check configuration files exist:
    ```bash
    ls -la public/_config/
    ```
  - Verify Redis connection:
    ```bash
    node scripts/utilities/seedRedisConfigs.ts --dry-run
    ```

---

**This structure ensures all scripts needed for running and maintaining the Zeno Knowledge Base system are clearly organized and documented for successful Zeno team handover.**
