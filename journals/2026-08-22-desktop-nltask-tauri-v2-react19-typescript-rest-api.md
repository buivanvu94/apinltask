# Technical Journal: NLTASK Desktop Application (Tauri v2 + React 19 + TypeScript + REST API)

**Date:** 2026-08-22  
**Topic:** Desktop Application Development with Tauri v2, React 19, TypeScript, and Full REST API Integration  

---

## 1. What Was Built

Implemented the complete Desktop application for NLTASK based on `UIDEMO/NLTASK Desktop.dc.html` and integrated with the Express + Prisma + MySQL backend:

1. **Scaffold & Desktop Runtime (`desktop/`):**
   - Tauri v2 core in Rust (`desktop/src-tauri`) with plugins: `tauri-plugin-notification`, `tauri-plugin-store`.
   - Tauri v2 capability configuration (`capabilities/default.json`) with `core:default`, `notification:default`, `store:default`.
   - System Tray integration with "Mở NLTASK" and "Thoát" menu items, plus close-to-tray window intercepting (`WindowEvent::CloseRequested` -> `prevent_close` + `hide`).
   - React 19 + TypeScript + Vite frontend with Google Font Space Grotesk and customized scrollbars.

2. **Data & Auth Layer:**
   - In-memory `accessToken`, secure `refreshToken` persistence via `@tauri-apps/plugin-store`.
   - Axios API client with automatic token attachment and deduped 401 response interceptor.
   - `AuthContext` with session restoration on boot.
   - `AuthView` with NLTASK brand identity.

3. **Application Shell & Views:**
   - `Sidebar` (gradient 248px) with 4 navigation tabs, "+ Thêm công việc" button, and user session profile footer.
   - `TodayView` with 3 Quick Stat cards (Progress donut, Overdue count, Upcoming count), filter category chips, and task lists.
   - `TaskDetailPanel` (360px) with complete task metadata, status badges, countdown/overdue calculation, and delete trigger.
   - `TaskAddEditModal`, `DatePickerModal` (42-cell calendar grid), `TimePickerModal` (stepper + quick presets), and `TaskDeleteModal`.
   - `HistoryView` with real-time search, date grouping ("Hôm nay", "Hôm qua", "dd ThM"), and un-complete checkbox toggle.
   - `StatsView` with Donut chart, Streak flame card, 7-day bar chart, and category progress bars.
   - `SettingsView` with switches, remind-before pills, snooze pills, quiet hours picker, and native/in-app notifications.

4. **Modularity & Build:**
   - 47/47 files in `desktop/src/` are strictly < 200 lines of code.
   - Windows release bundles produced: `.msi` (3.12 MB), NSIS `.exe` setup (2.05 MB), and standalone executable (9.55 MB).

---

## 2. Key Decisions & Technical Trade-offs

- **Refresh Token Storage:** Selected `@tauri-apps/plugin-store` over localStorage for enhanced security inside the webview.
- **Refresh Deduplication:** Handled concurrent 401 requests with a single shared `refreshPromise` at module scope to eliminate race conditions.
- **Minimize-to-Tray:** Implemented close-to-tray window event handling so the client-side scheduler continues checking reminder times in the background.
- **Modular Component Decomposition:** Decomposed modals and complex views into dedicated sub-components (`task-form-pill-selectors`, `task-form-datetime-inputs`, `task-form-text-fields`, `stats-week-bar-chart`, `stats-category-breakdown`, `settings-switch-item`, `settings-pill-selector-group`, `sidebar-user-footer`, `history-item-row`, `task-detail-info-card`) to enforce strict modularity without sacrificing readability.

---

## 3. Verification

- All 11 automated E2E API integration test cases passed 100%.
- TypeScript build (`tsc && vite build`) passed with 0 errors.
- Rust compilation (`cargo check` & `tauri build`) passed with 0 errors.
