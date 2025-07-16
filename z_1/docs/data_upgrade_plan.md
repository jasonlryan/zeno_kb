# Data Upgrade Plan: Migrating to New CSV Structure

## Progress & Status (as of 2025-07-15)

**Backend & Data Pipeline:**

- ✅ All migration tools (cleaner, auditor, converter, pipeline) are now fully schema-driven and use `schema.json` for field mapping and validation.
- ✅ The migration pipeline audits only the converted JSON, not the raw CSV, so CSV columns do not need to be renamed.
- ✅ Automatic config backup and rollback are in place.
- ✅ Dry-run and full migration modes are supported.
- ✅ Data successfully migrates from the new CSV structure to the app config JSON.
- ⚠️ Some URLs in the data are broken (404/401), but this is a data/content issue, not a pipeline bug.

**UI/Frontend:**

- ✅ TypeScript types in `z_1/types/config.ts` and `z_1/types/index.ts` have been updated to match the schema. All downstream UI components will now surface type errors if they use old/removed fields.
- ⏳ UI components, templates, and management pages still need to be updated to use the new schema fields (`categories`, `type`, `skillLevel`, etc.).
- ⏳ Need to audit all UI code for references to old field names and update for new structure.
- ⏳ Need to test and validate the UI after migration.

**Documentation:**

- ⏳ README and migration docs to be finalized after UI update.

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

- ✅ Update required fields to match new CSV
- ✅ Validate comma-separated lists in Business Category
- ✅ Validate allowed values for Media Type
- ✅ Generate/check unique IDs if needed

### B. Data Conversion (`dataConverter.js`)

- ✅ Update field mapping for new columns
- ✅ Map Business Category to array/taxonomy
- ✅ Map Media Type to config field
- ✅ Handle splitting/nesting for lists
- ✅ Generate IDs if not present

### C. Migration Pipeline (`migrationPipeline.js`)

- ✅ Ensure pipeline supports new structure
- ✅ Update reporting for new fields
- ✅ Update backup/rollback logic if config structure changes
- ✅ Audit now runs on converted JSON, not raw CSV

### D. Config Synchronization & Planning (`configSynchronizer.js`, `configMigrationPlanner.js`)

- ✅ Recognize and validate new fields
- ✅ Update taxonomy/category logic for new values
- ✅ Synchronize new fields across all configs

### E. UI/Frontend

- ⏳ Update UI components to use new field names
- ⏳ Update navigation/filtering for new categories/fields
- ⏳ Update detail views to display new fields
- ⏳ Handle arrays (e.g., categories) and missing/optional fields gracefully
- ⏳ Test and validate UI after migration

---

## 3. Upgrade Plan: Step-by-Step (with Progress)

1. **Schema Mapping & Documentation**
   - ✅ Document new schema and field mappings
2. **Update Data Auditor**
   - ✅ Update required fields and validation logic
3. **Update Data Converter**
   - ✅ Map new columns, handle arrays/nesting, generate IDs
4. **Test Migration Pipeline (Dry Run)**
   - ✅ Run pipeline, review reports for errors/missing data
5. **Update Config Synchronizer & Planner**
   - ✅ Ensure new fields are validated and synchronized
6. **Update UI**
   - ⏳ Refactor UI for new field names, filters, and display
7. **Full Migration & Validation**
   - ⏳ Run full migration, validate in UI, fix issues
8. **Document the New Process**
   - ⏳ Update README and migration docs

---

## 4. Summary Table (with Status)

| Stage               | What Needs to Change?                                                             | Status         |
| ------------------- | --------------------------------------------------------------------------------- | -------------- |
| Data Auditing       | Update required fields, validate new columns, handle lists, generate/check IDs    | ✅ Done        |
| Data Conversion     | Map new columns, handle arrays/nesting, generate IDs, ensure config compatibility | ✅ Done        |
| Migration Pipeline  | Pass new structure, update reporting, ensure backup/rollback works                | ✅ Done        |
| Config Sync/Planner | Recognize new fields, update taxonomy/category logic, validate across configs     | ✅ Done        |
| UI/Frontend         | Update to use new field names, support new filters, update display and navigation | ⏳ In Progress |

---

## 5. Next Steps: UI/Frontend Migration Checklist

**Audit and update the following UI files/components for new schema fields:**

- ✅ `z_1/types/config.ts` and `z_1/types/index.ts` (update types/interfaces for new fields)
- ⏳ `z_1/components/ToolCard.tsx` (tool/asset card display)
  - **Planned change:** Update to use new schema fields (`title`, `description`, `url`, `type`, `categories`, `skillLevel`). Display arrays (like `categories`) as tags or lists. Handle missing/optional fields gracefully. Fix any type errors that arise from the updated types.
- ⏳ `z_1/components/ToolDetailModal.tsx` (detailed tool/asset view)
- ⏳ `z_1/components/ToolGrid.tsx` (grid/listing of tools/assets)
- ⏳ `z_1/components/CategoryGrid.tsx` (category display)
- ⏳ `z_1/components/TemplateAwareToolCard.tsx` (template routing)
- ⏳ `z_1/components/LearningGuideCard.tsx` and `LearningGuideDetail.tsx` (if using learning guides)
- ⏳ `z_1/app/page.tsx` (main home/search/category view)
- ⏳ `z_1/app/admin/page.tsx` (admin/asset management)
- ⏳ `z_1/app/comment-retrieval/page.tsx` (if asset data is shown here)
- ⏳ `z_1/components/CuratorDashboard.tsx` (if asset management is here)
- ⏳ Any custom hooks in `z_1/hooks/` that reference asset/tool fields (e.g., `useConfig`, `useTaxonomy`, `useAdvancedFilter`)

**For each file/component:**

- Update to use new field names (`categories`, `type`, `skillLevel`, etc.)
- Ensure arrays (e.g., `categories`) are handled and displayed correctly
- Add support for new filters/searches if needed
- Handle missing/optional fields gracefully
- Update any forms or editors for asset data

---

**This document should continue to be updated as the migration progresses and as new requirements or issues are discovered.**

---

# [END OF PLAN]
