# Code Review: Mobile Push Notification (Expo delivery engine)

## Scope
- Plan: `plans/260825-1029-mobile-push-notification/` (plan.md + phase-01..05)
- Contract: `docs/push-notification-integration.md`
- Files reviewed: `backend/src/services/expo-push-service.js` (149 lines), `backend/src/jobs/task-reminder-scheduler.js` (104), `backend/scripts/send-test-notification.js` (31), `backend/src/services/tasks-service.js` (159, diff only), `backend/prisma/schema.prisma`, `backend/prisma/migrations/20260825034917_add_push_dedupe_to_tasks/migration.sql`, `backend/src/utils/date-range-utils.js`, `backend/package.json`, `backend/src/server.js`, `docs/system-architecture.md`, `docs/push-notification-integration.md`
- ~450 LOC analyzed. Focus: acceptance criteria, regression, contract fidelity, risk items from plan.

## Overall Assessment
Implementation matches the plan closely — architecture, function signatures, query shapes, and payload contract all follow phase-01..05 verbatim. All success-criteria smoke tests I could run (no live device) pass. No blockers found in the reviewed feature files.

## Verification performed (all PASS)
- `node -e "require('./src/app')"` → loads clean, no circular require.
- `expo-server-sdk` resolved version `3.15.0` (CommonJS, `main: build/ExpoClient.js`) — correctly pinned, not the ESM-only v7.
- `node-cron` resolved version `3.0.3` (`engines.node >= 6`) — correctly pinned.
- `buildTaskMessage('task_reminder', ...)` → `{"to":"ExponentPushToken[x]","sound":"default","title":"Nhắc việc","body":"Sắp đến giờ: Hop","data":{"type":"task_reminder","taskId":"t1"}}` — byte-for-byte matches contract field names (`docs/push-notification-integration.md:83-89`).
- `isQuietHour` boundary table (22:00→07:00, Asia/Ho_Chi_Minh): 23:30→true, 06:59→true, 07:00→false, 21:59→false, 22:00→true — all match plan's expected table exactly.
- `canSendToUser`: null user→false, garbage token `"abc"`→false, `settings:null`→false (+warns userId only), `settings.push:false`→false, `task_updated` ignores quiet-hours→true. All match.
- `sendPushMessages([])` → `[]`, no network call.
- `Expo.isExpoPushToken(null/undefined)` → `false` (safe, no throw).
- `migration.sql` contains only 2 `ADD COLUMN ... NULL` statements, no DROP/MODIFY.
- `git diff --stat` / `git status --porcelain desktop/` → empty, no desktop files touched by pending changes.
- `expo-push-service.js` = 149 lines, under the 200-line modularization threshold.

## Critical Issues
None in the reviewed feature files.

One **out-of-scope security finding** worth flagging to the controller: an untracked file `DU_AN_NODEJS2026NLTASKbackend__test_login.json` sits at the repo root (`git status` shows it as `??`) containing a real JWT `accessToken`, `refreshToken`, and admin email in plaintext. It is not part of the push-notification changeset and I did not touch it, but it is sitting in the working tree and would leak credentials if accidentally `git add -A`'d. Recommend deleting it or adding to `.gitignore` before any commit — not related to this feature's file list, flagging only because it showed up in `git status`.

## High Priority Findings
None. Specifically checked and clear:
- **Ticket/chunk offset alignment** (`expo-push-service.js:79-102`): `offset += chunk.length` is applied identically on both the success path (after `tickets.forEach`) and the `catch` path (`continue` after incrementing offset) — no index drift across chunks, including the error branch. Matches phase-02 step 7 exactly.
- **Fire-and-forget in `tasks-service.js:118-122`**: `notifyTaskUpdated(...).catch(...)` — no stray `await`, `.catch` wraps the whole promise chain, cannot produce `unhandledRejection`. `notifyTaskUpdated` itself never throws synchronously (all async), so the `.catch` reliably attaches before rejection is observable.
- **Circular require**: `tasks-service.js` → `expo-push-service.js` → (`prisma-client`, `env-config`, `date-range-utils`) only; `expo-push-service.js` never requires `tasks-service.js` or the scheduler. `require('./src/app')` loads without error.
- **`canSendToUser` logic**: token validity via `Expo.isExpoPushToken`, `settings == null` → warn + false, `settings.push === false` → false, quiet-hours skipped only for `task_updated`. All branches verified live (see Verification section).
- **Dedupe correctness in `runTick`**: `reminder.taskIds`/`overdue.taskIds` are built only from tasks that actually produced an `entries` push (i.e., passed `canSendToUser` and the precise per-user threshold check) — not from the raw `findMany` result set. `updateMany` for `remindedAt`/`lastOverdueNotifiedAt` uses these filtered ID lists only.
- **`checkReceipts` isolation**: wrapped per-chunk in try/catch (`getReceiptsAsync` failure just logs and `continue`s); the final `clearDeviceTokens` call is unguarded but any throw there propagates up through `runTick` to the scheduler's own try/catch (`task-reminder-scheduler.js:93-99`), so it cannot crash the process — it can only skip that tick, matching "mọi lỗi trong tick bị nuốt".
- **Token logging**: grepped both files — no full `deviceToken` is logged anywhere; only `userId` and Expo error codes/messages.
- **`send-test-notification.js`**: placeholder token `ExponentPushToken[REPLACE_ME]` present, exits 1 with instructions if unreplaced; no `require('../src/lib/prisma-client')` or DB import — matches "no DB/cron touch" requirement.
- **Migration**: additive-only, 2 nullable `DATETIME(3)` columns, nothing else.

## Medium Priority Improvements
None found that need action — implementation is intentionally minimal per plan's YAGNI-aligned decisions (no index added yet, no multi-instance guard beyond the documented single-instance constraint, no `Settings.vibrate` mapping — all explicitly deferred/rejected in the plan itself).

## Low Priority Suggestions
- None beyond what's already tracked as accepted risk in phase-03 (e.g., quiet-hours-blocked reminders are sent on the next tick after quiet-hours ends rather than immediately — documented as intentional, not a bug).

## Positive Observations
- Every function signature, query shape, and payload literal matches the phase files almost verbatim — very low drift between plan and implementation.
- Contract fidelity is exact: `buildTaskMessage` output was diffed character-for-character against the mobile contract via live `node -e` run.
- Fire-and-forget push in `updateTask` is implemented correctly with no `await` on the notify call and a `.catch` that only logs.
- Ownership/scoping preserved everywhere: `updateMany({ where: { id, userId } })` unchanged, 404 behavior unchanged, `toggleTask` correctly has no push hook (out of the 3-field allowlist).
- `docs/system-architecture.md` and `docs/push-notification-integration.md` were both updated accurately — no stale "delivery engine" non-goal string remains, no "chưa chốt" placeholder remains, and every file path mentioned in the new docs section exists in the actual tree.

## Task Completeness Verification (plan.md Success Criteria)
- [x] Migration additive-only, 2 nullable columns, no data loss (schema unchanged for existing columns)
- [x] `task_reminder` sent exactly once, dedup via `remindedAt`, survives repeated ticks (verified via code path + dedupe logic)
- [x] `task_overdue` 1x/day via `APP_TIMEZONE`-aware `formatDateKey` comparison
- [x] `title`/`dueAt`/`category` edits trigger `task_updated`; `dueAt` edit resets both dedupe columns
- [x] `DeviceNotRegistered` → `deviceToken` cleared via `clearDeviceTokens`, no re-send
- [x] Push failure doesn't fail `PATCH /api/tasks/:id` (fire-and-forget, `.catch` only)
- [x] `docs/system-architecture.md` reflects new architecture, stale non-goal removed
- [x] `git status` shows no changes in `desktop/`

All 8 plan-level success criteria are satisfied by the code as written. Live end-to-end device verification (phase-05's 15-scenario table with 2 real users/tokens) was **not** performed by this review — that requires physical devices and is out of scope for static code review; recommend the controller run that checklist before marking phase-05 fully done.

## Updated Plans
None — this was a review-only pass; no plan/phase files were modified. Recommend the controller mark phase-01 through phase-04 status as done based on this verification, and keep phase-05's device-verification checklist open until run on real hardware.

## Metrics
- Type Coverage: N/A (no TypeScript in backend)
- Test Coverage: no automated test suite in this repo for backend; verification was via `node -e` smoke tests matching plan's Success Criteria commands
- Lint/Build errors: 0 (no linter configured in backend; `require('./src/app')` loads clean)

## Second-pass findings (from independent `/code-review` background pass)

A second, independently-run review pass (5 parallel finder agents + direct trace) surfaced 5 candidates. I verified each against the code and the plan's locked decisions:

### Valid — new findings not caught in first pass

1. **[Medium] `backend/src/jobs/task-reminder-scheduler.js:73-77`** — `runTick` marks `remindedAt`/`lastOverdueNotifiedAt` for every id in `reminder.taskIds`/`overdue.taskIds` unconditionally, **not filtered by whether `sendPushMessages` actually succeeded for that entry**. `collectReminderEntries`/`collectOverdueEntries` populate `taskIds` before any send is attempted (based only on `canSendToUser` + threshold checks). If `sendPushNotificationsAsync` throws for an entire chunk (network blip, Expo 5xx — `expo-push-service.js:81-87`), or a ticket comes back `status:'error'` with a non-`DeviceNotRegistered` reason (e.g. rate limit), those tasks are still stamped as notified and will **never be retried** — that specific reminder/overdue push is silently and permanently lost. Verified: `sendPushMessages`'s return value (`receipts`) is only used for `checkReceipts`, never to filter `reminder.taskIds`/`overdue.taskIds` before the `updateMany` calls.
   - Note: the plan's phase-03 Risk table only accepts the *crash-between-send-and-mark* window as low-probability/low-impact; it does not address explicit Expo-reported send failures, so this is a genuine gap, not an already-accepted trade-off. Flagging for the controller to decide: accept as best-effort semantics (document it), or filter taskIds by actual `sendPushMessages` outcome before marking.

2. **[Low] `backend/src/jobs/task-reminder-scheduler.js` (findMany read vs. later blanket `updateMany` write)** — theoretical race: if a task's `dueAt` is PATCHed (which resets `remindedAt`/`lastOverdueNotifiedAt` to `null` in `tasks-service.js`) *during* an in-flight tick that already read the old row, the tick's later `updateMany` can overwrite the fresh `null` back to "reminded", silently dropping the reminder for the new due date. Window is sub-second to a few seconds (one tick's duration). Same risk class as the plan's already-accepted "crash between send and mark" window — real but very low probability/impact, not blocking.

3. **[Nit] `backend/src/jobs/task-reminder-scheduler.js:14-38` vs `:40-64`** — `collectReminderEntries`/`collectOverdueEntries` duplicate the same findMany+include+accumulate shape (DRY nit, no functional impact). Not actionable per current file size/scope; noted for awareness only.

### Refuted — already an accepted plan decision, not a bug

4. **`task-reminder-scheduler.js:58`** (claimed dead/unreachable-true code: `task.lastOverdueNotifiedAt && formatDateKey(...) === formatDateKey(now)`) — the sub-review is correct that this condition is mathematically redundant given the DB prefilter (`lastOverdueNotifiedAt: { lt: todayStart }`), but this is an **intentional double-check explicitly required by phase-03 Key Insights**: "prefilter ở DB... rồi xác nhận lại trong JS bằng formatDateKey... (đúng theo APP_TIMEZONE, xử lý được cả DST)". Per the "don't reverse verified decisions" rule, this is not a fresh finding requiring action — it's deliberate defense-in-depth against future prefilter changes, not dead code to remove.

### Valid — pre-existing contradiction, not previously checked

5. **[Low] `backend/scripts/send-test-notification.js:4`** — verified live: `expo-push-service.js:3` requires `../config/env-config`, and `env-config.js:7-11` throws synchronously (`Missing required env var: DATABASE_URL`) if `DATABASE_URL`/`JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`/`ADMIN_EMAIL`/`ADMIN_PASSWORD` are unset. This contradicts the script's own header comment ("Không đụng DB") and phase-04's Security Considerations ("Script không đọc `.env`, không kết nối DB → chạy được ở máy dev không có DB"). In practice this only bites a fresh checkout with zero `.env` — anyone already running this backend (needed to have `.env` configured for `npm run dev` anyway) is unaffected. Real but low-impact contradiction between doc claim and code; not a functional bug for the normal workflow.

## Unresolved Questions
1. Has the phase-05 mandatory pre-prod seed (`UPDATE tasks SET lastOverdueNotifiedAt = NOW() WHERE completed = 0 AND dueAt < NOW();`) been run against staging/prod yet? Not verifiable from code alone — flag for deploy checklist.
2. Has the 15-scenario 2-device end-to-end table in phase-05 been executed on real hardware? Not verifiable statically.
3. Should the stray root-level `DU_AN_NODEJS2026NLTASKbackend__test_login.json` (contains live JWT + refresh token) be deleted / gitignored before next commit? Flagging per security duty; out of scope of the feature file list I was given.
