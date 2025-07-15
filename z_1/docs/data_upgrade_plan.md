# Data Upgrade Plan: Migrating to New CSV Structure

## Overview

This document outlines the plan for upgrading the Zeno KB data pipeline, configuration, and UI to accommodate the new data structure provided in `zeno_kb_assets.csv`.

---

## 1. New CSV Structure & Key Differences

**New CSV Columns:**

- Skill Level
- Business Category (comma-separated list)
- Media Type
- Title
- Description
- URL

**Key Differences:**

- More granular fields (Skill Level, Business Category, Media Type)
- Potential for nested/grouped data (e.g., Business Category as array)
- No explicit `id` or `tags` columns (may need to be generated)
- Some fields are comma-separated lists

---

## 2. Stage-by-Stage Diagnosis & Required Changes

### A. Data Auditing (`dataAuditor.js`)

- Update required fields to match new CSV
- Validate comma-separated lists in Business Category
- Validate allowed values for Media Type
- Generate/check unique IDs if needed

### B. Data Conversion (`dataConverter.js`)

- Update field mapping for new columns
- Map Business Category to array/taxonomy
- Map Media Type to config field
- Handle splitting/nesting for lists
- Generate IDs if not present

### C. Migration Pipeline (`migrationPipeline.js`)

- Ensure pipeline supports new structure
- Update reporting for new fields
- Update backup/rollback logic if config structure changes

### D. Config Synchronization & Planning (`configSynchronizer.js`, `configMigrationPlanner.js`)

- Recognize and validate new fields
- Update taxonomy/category logic for new values
- Synchronize new fields across all configs

### E. UI/Frontend

- Update UI components to use new field names
- Update navigation/filtering for new categories/fields
- Update detail views to display new fields

---

## 3. Upgrade Plan: Step-by-Step

1. **Schema Mapping & Documentation**
   - Document new schema and field mappings
2. **Update Data Auditor**
   - Update required fields and validation logic
3. **Update Data Converter**
   - Map new columns, handle arrays/nesting, generate IDs
4. **Test Migration Pipeline (Dry Run)**
   - Run pipeline, review reports for errors/missing data
5. **Update Config Synchronizer & Planner**
   - Ensure new fields are validated and synchronized
6. **Update UI**
   - Refactor UI for new field names, filters, and display
7. **Full Migration & Validation**
   - Run full migration, validate in UI, fix issues
8. **Document the New Process**
   - Update README and migration docs

---

## 4. Summary Table

| Stage               | What Needs to Change?                                                             |
| ------------------- | --------------------------------------------------------------------------------- |
| Data Auditing       | Update required fields, validate new columns, handle lists, generate/check IDs    |
| Data Conversion     | Map new columns, handle arrays/nesting, generate IDs, ensure config compatibility |
| Migration Pipeline  | Pass new structure, update reporting, ensure backup/rollback works                |
| Config Sync/Planner | Recognize new fields, update taxonomy/category logic, validate across configs     |
| UI/Frontend         | Update to use new field names, support new filters, update display and navigation |

---

**This document should be updated as the migration progresses and as new requirements or issues are discovered.**
