# Zeno KB Migration Tools

This directory contains a comprehensive set of tools for migrating from dummy data to real Zeno GPT data. These tools ensure data quality, validate URLs, and provide safe migration with rollback capabilities.

## 🛠️ Available Tools

### 1. **Data Auditor** (`dataAuditor.js`)

Validates data integrity and quality before migration.

**Features:**

- Validates required fields (title, description, URL, type)
- Checks for duplicate IDs and titles
- Validates URL formats
- Analyzes content quality (length, placeholders)
- Generates detailed audit reports

**Usage:**

```bash
node dataAuditor.js <path-to-data-file>

# Examples
node dataAuditor.js ../config/data.json
node dataAuditor.js ../data/zeno_kb_assets.csv
```

### 2. **URL Health Checker** (`urlHealthChecker.js`)

Tests all URLs for accessibility and performance.

**Features:**

- Checks HTTP status codes
- Measures response times
- Identifies slow URLs (>3s)
- Categorizes URL types (ChatGPT, SharePoint, etc.)
- Batch processing to avoid overwhelming servers

**Usage:**

```bash
node urlHealthChecker.js <path-to-data-file> [batch-size]

# Examples
node urlHealthChecker.js ../config/data.json 5
node urlHealthChecker.js ../data/zeno_kb_assets.csv 3
```

### 3. **Data Converter** (`dataConverter.js`)

Converts CSV data to JSON format with intelligent field mapping.

**Features:**

- CSV to JSON conversion
- Intelligent field mapping and defaults
- Tag generation from content
- Category and function assignment
- Featured tool selection

**Usage:**

```bash
node dataConverter.js <input-csv-file> [output-json-file]

# Examples
node dataConverter.js ../data/zeno_kb_assets.csv
node dataConverter.js ../data/zeno_kb_assets.csv ../config/converted-data.json
```

### 4. **Migration Pipeline** (`migrationPipeline.js`)

Orchestrates the complete migration process with safety checks.

**Features:**

- Complete end-to-end migration
- Automatic backups
- Rollback capabilities
- Dry-run mode for testing
- Comprehensive reporting

**Usage:**

```bash
node migrationPipeline.js <csv-file> [options]

# Options
--target <path>      # Target config file (default: ../config/data.json)
--dry-run           # Run without deploying changes
--skip-url-check    # Skip URL health checking
--force             # Force overwrite existing files

# Examples
node migrationPipeline.js ../data/zeno_kb_assets.csv --dry-run
node migrationPipeline.js ../data/zeno_kb_assets.csv --target ../config/new-data.json
node migrationPipeline.js ../data/zeno_kb_assets.csv --skip-url-check --force
```

### 5. **Configuration Migration Planner** (`configMigrationPlanner.js`)

Analyzes all configuration files and identifies what needs to be updated beyond just data migration.

**Features:**

- Analyzes app-config.json, content.json, taxonomy.json, and data.json
- Identifies version mismatches and outdated settings
- Checks feature flag appropriateness for production
- Validates UI limits against actual data volumes
- Detects dummy/placeholder content that needs updating
- Generates comprehensive migration plans with priorities

**Usage:**

```bash
node configMigrationPlanner.js <config-directory> [options]

# Options
--analyze-only      # Only analyze, don't save migration plan
--output=<file>     # Custom output file for migration plan

# Examples
node configMigrationPlanner.js ../public/config
node configMigrationPlanner.js ../public/config --analyze-only
node configMigrationPlanner.js ../public/config --output=custom-plan.json
```

### 6. **Configuration Synchronizer** (`configSynchronizer.js`)

Ensures all configuration files remain synchronized and consistent with each other.

**Features:**

- Validates cross-references between config files
- Automatically updates dependent configurations
- Synchronizes version numbers across all configs
- Maintains consistency in shared values
- Updates taxonomy when new tool types are added
- Fixes metadata counts and feature flag alignment

**Usage:**

```bash
node configSynchronizer.js <config-directory> [options]

# Options
--auto-fix          # Automatically fix synchronization issues
--dry-run           # Show what would be fixed without making changes
--watch             # Monitor for changes and auto-sync (future feature)

# Examples
node configSynchronizer.js ../public/config --dry-run
node configSynchronizer.js ../public/config --auto-fix
node configSynchronizer.js ../public/config --auto-fix --dry-run
```

## 🚀 Complete Migration Strategy

The migration process involves both **data migration** and **configuration synchronization**. Here's the complete workflow:

### Phase 1: Configuration Analysis

Before migrating data, analyze your configuration ecosystem:

```bash
# 1. Analyze all configuration files for issues
node configMigrationPlanner.js ../public/config

# 2. Check synchronization between config files
node configSynchronizer.js ../public/config --dry-run
```

This identifies:

- ✅ Version mismatches between config files
- ✅ Feature flags needing production updates
- ✅ UI limits that need adjustment for real data
- ✅ Dummy content requiring replacement
- ✅ Taxonomy alignment with actual data

### Phase 2: Data Migration

```bash
# 3. Run data migration with safety checks
node migrationPipeline.js ../data/zeno_kb_assets.csv --dry-run

# 4. If dry-run looks good, run live migration
node migrationPipeline.js ../data/zeno_kb_assets.csv
```

### Phase 3: Configuration Synchronization

After data migration, ensure all configs are aligned:

```bash
# 5. Fix any synchronization issues introduced by new data
node configSynchronizer.js ../public/config --auto-fix

# 6. Final validation that everything is consistent
node configMigrationPlanner.js ../public/config --analyze-only
```

## 🛠️ Data-Only Migration (Original Process)

### Step 1: Prepare Your CSV Data

Ensure your CSV file has the following columns:

- `Type` (GPT, Resource, etc.)
- `Asset` (category information)
- `Title` (tool name)
- `Description` (tool description)
- `URL` (link to the tool)

### Step 2: Run a Dry-Run Migration

```bash
cd tools
node migrationPipeline.js ../data/zeno_kb_assets.csv --dry-run
```

This will:

- ✅ Audit your source data
- ✅ Convert CSV to JSON
- ✅ Check URL health
- ✅ Generate reports
- ❌ **NOT** deploy changes

### Step 3: Review Reports

Check the generated reports in `tools/reports/`:

- `audit-report.json` - Data quality issues
- `url-health-report.json` - URL accessibility results
- `migration-report-*.json` - Complete pipeline results

### Step 4: Run Live Migration

If dry-run looks good:

```bash
node migrationPipeline.js ../data/zeno_kb_assets.csv
```

This will backup your existing data and deploy the new data.

## 📊 Data Transformation

### Field Mapping

The converter automatically maps CSV fields to application schema:

| CSV Column  | JSON Field  | Notes                   |
| ----------- | ----------- | ----------------------- |
| Type        | type        | GPT, Doc, Video, Tool   |
| Asset       | asset_type  | Used for categorization |
| Title       | title       | Tool name               |
| Description | description | Cleaned and formatted   |
| URL         | link        | Validated format        |

### Generated Fields

Missing fields are automatically populated:

| Field      | Default Value        | Logic                          |
| ---------- | -------------------- | ------------------------------ |
| id         | Generated from title | Unique identifier              |
| tier       | "Specialist"         | Most Zeno GPTs are specialized |
| complexity | "Intermediate"       | Safe default                   |
| tags       | Auto-generated       | Extracted from content         |
| function   | Mapped from title    | Based on GPT type              |
| featured   | false                | Selected tools marked true     |
| date_added | Current timestamp    | Migration date                 |
| added_by   | "data-migration"     | Migration identifier           |

### Category Mapping

Tools are categorized based on their Asset type:

- **Audience GPT** → Audience Insights
- **Trends & Topics** → Trends & Analysis
- **Real-time Search** → Real-time Data
- **Writing** → Content Creation
- **Resource** → Resources & Documentation

## 🔍 Quality Checks

### Data Auditor Checks

- ✅ Required fields present
- ✅ Valid URL formats
- ✅ No duplicate IDs/titles
- ✅ Content quality (length, placeholders)
- ✅ Data type validation

### URL Health Checks

- ✅ HTTP status codes (200 = healthy)
- ✅ Response time measurement
- ✅ Redirect detection
- ✅ Server error identification
- ✅ Accessibility verification

### Validation Checks

- ✅ JSON structure integrity
- ✅ Required arrays present
- ✅ Unique ID enforcement
- ✅ Featured tools count
- ✅ Metadata completeness

## 🔄 Backup & Rollback

### Automatic Backups

Every migration automatically creates timestamped backups:

```
tools/backups/data-backup-2024-01-15T10-30-00-000Z.json
```

### Manual Rollback

If something goes wrong:

```bash
# The pipeline will attempt automatic rollback on failure
# Or manually restore from backup:
cp tools/backups/data-backup-*.json ../config/data.json
```

## 📁 Directory Structure

After running tools, you'll see:

```
tools/
├── dataAuditor.js          # Data quality validator
├── urlHealthChecker.js     # URL accessibility checker
├── dataConverter.js        # CSV to JSON converter
├── migrationPipeline.js    # Complete migration orchestrator
├── README.md              # This file
├── backups/               # Automatic backups
│   └── data-backup-*.json
├── reports/               # Generated reports
│   ├── audit-report.json
│   ├── url-health-report.json
│   └── migration-report-*.json
└── temp/                  # Temporary files
    └── converted-data.json
```

## 🚨 Troubleshooting

### Common Issues

**1. "Source CSV file not found"**

- Check the file path is correct
- Ensure file exists and is readable

**2. "Data audit failed"**

- Review `audit-report.json` for specific issues
- Fix data quality problems in source CSV
- Use `--force` flag to bypass non-critical issues

**3. "Some URLs are unhealthy"**

- Review `url-health-report.json`
- Fix broken URLs in source data
- Use `--skip-url-check` to bypass if acceptable

**4. "Permission denied"**

- Ensure write permissions to target directory
- Check file is not locked by another process

### Debug Mode

Add verbose logging by setting environment variable:

```bash
DEBUG=1 node migrationPipeline.js ../data/zeno_kb_assets.csv
```

## 🔧 Customization

### Modify Default Values

Edit the `defaults` object in `dataConverter.js`:

```javascript
this.defaults = {
  tier: "Foundation", // Change default tier
  complexity: "Beginner", // Change default complexity
  featured: false, // Default featured status
  // ...
};
```

### Add Custom Categories

Update `categoryMapping` in `dataConverter.js`:

```javascript
this.categoryMapping = {
  "Your Category": "Your Function",
  // ...
};
```

### Adjust URL Patterns

Modify `urlPatterns` in `urlHealthChecker.js`:

```javascript
const urlPatterns = {
  yoursite: /^https:\/\/yoursite\.com\//,
  // ...
};
```

## 📈 Best Practices

1. **Always run dry-run first** to catch issues early
2. **Review all reports** before live migration
3. **Test URLs manually** if health check shows issues
4. **Keep backups** until migration is fully validated
5. **Monitor application** after deployment
6. **Document any customizations** for future migrations

## 🆘 Support

If you encounter issues:

1. Check the generated reports for detailed error information
2. Review this README for troubleshooting steps
3. Run individual tools to isolate problems
4. Use dry-run mode to test changes safely

## 📝 Migration Checklist

- [ ] CSV data prepared with required columns
- [ ] Backup of current application data
- [ ] Dry-run migration completed successfully
- [ ] All reports reviewed and issues addressed
- [ ] URLs validated and accessible
- [ ] Live migration executed
- [ ] Application tested with new data
- [ ] Team notified of changes
