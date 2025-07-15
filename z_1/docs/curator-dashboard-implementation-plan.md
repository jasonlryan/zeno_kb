# Curator Dashboard Implementation Plan

## Overview

This document outlines the implementation plan for enabling all currently illustrative UI actions in the Curator Dashboard. The goal is to allow users to add, edit, and delete assets, schedule content, and manage tags directly from the dashboard interface.

---

## 1. Functional Scope

### 1.1 Asset Management

- **Add Asset**: Modal form for creating new assets.
- **Edit Asset**: Modal form for editing existing assets.
- **Delete Asset**: Confirmation dialog for asset removal.

### 1.2 Content Scheduling

- **Schedule Content**: Modal or drawer for assigning scheduled feature dates to assets.

### 1.3 Tag Management

- **Create Tag**: Modal form for new tag creation.
- **Edit Tag**: Modal for renaming or recategorizing tags.
- **Delete Tag**: Confirmation dialog for tag removal from all assets.

---

## 2. Data Model & Persistence

- **Assets**: Continue using the `tools` array in `data.json`. Ensure all fields are supported: `id`, `title`, `description`, `type`, `tier`, `tags`, `date_added`, `link`, `function`, `featured`, `scheduled_feature_date`.
- **Tags**: If not present, introduce a central tag list (e.g., `tags.json`) to support tag creation/editing/deletion.
- **Scheduling**: Use the `scheduled_feature_date` field in each asset.
- **Persistence**:
  - For local/dev: Update JSON files on disk.
  - For production: Integrate with backend API endpoints for CRUD operations.

---

## 3. UI/UX Requirements

- All modals/dialogs must be accessible and styled consistently.
- Show success/error toasts for all actions.
- Refresh dashboard data after any change.
- Disable actions and show loading indicators during async operations.

---

## 4. Implementation Steps

### 4.1 Asset Management

- [ ] Implement Add Asset modal with form validation.
- [ ] Implement Edit Asset modal, pre-filled with asset data.
- [ ] Implement Delete Asset confirmation dialog.
- [ ] Wire up all actions to update `data.json` (or API).
- [ ] Refresh asset list after changes.

### 4.2 Content Scheduling

- [ ] Implement Schedule Content modal/drawer.
- [ ] Allow selection of assets and date assignment.
- [ ] Update `scheduled_feature_date` in `data.json` (or API).
- [ ] Refresh dashboard after scheduling.

### 4.3 Tag Management

- [ ] Implement Create Tag modal.
- [ ] Implement Edit Tag modal.
- [ ] Implement Delete Tag confirmation dialog.
- [ ] Update tag list and propagate changes to all assets.
- [ ] Refresh tag list and asset tags after changes.

---

## 5. Validation & Error Handling

- [ ] Validate all required fields in forms.
- [ ] Prevent duplicate asset titles and tag names.
- [ ] Handle and display errors gracefully.

---

## 6. Testing

- [ ] Unit and integration tests for all new UI components and data operations.
- [ ] Manual QA for all user flows.

---

## 7. Stretch Goals / Future Enhancements

- [ ] Role-based access control for dashboard actions.
- [ ] Bulk asset/tag operations.
- [ ] Advanced scheduling features (recurring, pipeline, etc).

---

## 8. References

- See `z_1/docs/z1-functionality-upgrade-plan.md` for related upgrade context.
- See `z_1/config/data.json` for current asset data structure.

---

**Owner:** Engineering Team  
**Last updated:** {{TODAY'S DATE}}
