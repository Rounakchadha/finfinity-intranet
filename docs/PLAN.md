# FinFinity Intranet Portal — Implementation Plan

## Phase 1 — Docker + Auth + Sidebar (DONE ✅)
- [x] Fix Docker Compose so app runs at https://localhost
- [x] Fix session config (connection: null)
- [x] Fix APP_KEY in config cache
- [x] Remove vite-dev from supervisord
- [x] Migrate MICROSOFT_* env vars to AZURE_*
- [x] Move Azure credentials to config/services.php → use config() in AuthController
- [x] Add /auth/azure/callback route alias
- [x] Rewrite Sidebar to be config-driven via /api/config
- [x] Fix AssetRequestModal field names
- [x] Create links + group_personalized_links migrations
- [x] Seed default links (Keka, Zoho, Outlook, Teams, SharePoint)

---

## Phase 2 — Fix Broken Features + Config-Driven Right Panel (IN PROGRESS)

### 2a. Config & Hardcoded Values
- [x] Move Azure creds from env() to config/services.php
- [x] Move right panel items to config/portal.php
- [x] Move SharedCalendar section title to config
- [x] Enforce feature flags in ConfigController (hide nav when feature disabled)
- [ ] Fix EmailService to use config() instead of env() — breaks email notifications
- [ ] Add missing env vars to config/services.php (Paperless, email sender)

### 2b. Core Feature Fixes
- [x] Fix local login roles to match admin_groups + nav role gates (was: FinFinity IT/HR Team/Management → now: Admin/HR Manager/IT Admin)
- [x] Employee Directory — falls back to local employees DB when no Graph token (was: always empty with local login)
- [x] GroupMemberController — falls back to local employees DB as approver list when no Graph token
- [x] Seeded 12 sample employees, 5 QR codes, 3 announcements so all pages show data out-of-the-box
- [x] QR Codes — CRUD works (admin sees + New button, non-admin can download)
- [x] Announcements — CRUD works (admin can create/pin/delete)
- [x] Dashboard Schedule — fixed wrong route (/api/shared-events → /api/shared-calendar) + response shape
- [x] Dashboard Updates — fixed wrong route (/api/announcements/latest added) + ann.content → ann.body
- [x] Dashboard quick links — removed hardcoded SVG logos, now uses DB logo field with letter-avatar fallback
- [x] SharedCalendarController — uses AuthController::getValidToken() + returns flat array
- [x] AssetRequestController — fixed session keys ($user['email'] → $user['profile']['userPrincipalName'])
- [x] HRAdminController — fixed env() → config() for IT_ADMIN_EMAIL and EMPLOYEE_EMAIL_DOMAIN
- [x] config/portal.php — added it_admin_email, employee_email_domain keys
- [x] Employee removal email — notifyITForAssetRecovery already sends email to IT_ADMIN_EMAIL on resignation
- [x] AssetRequestPage — now shows submitted requests with status + review notes below the form
- [ ] Memo Approval — raise + approve/decline flow (needs testing with multiple users)
- [x] IT Admin Tools — pending requests now visible to IT admin (session key bug fixed)
- [ ] HR Admin Tools (full recruitment workflow)
- [ ] Document Directory (Paperless integration or fallback)
- [ ] Calendar (personal + shared)

### Admin access note
Admin buttons (New Announcement, New QR Code, etc.) are gated by portal.admin_groups = ['Admin','HR','HR Manager'].
For Azure login users whose groups don't match, update portal.admin_groups in config/portal.php to match
the actual Azure AD group names. Check /api/auth/status → user.roles to see what groups Azure returns.

### 2c. Missing Functionality
- [x] Asset request — IT admin now sees all requests (session key fix in AssetRequestController)
- [x] Memo list page — "My Memos" tab added to MemoApproval.jsx + GET /api/my-memos route + MemoController::myMemos()
- [x] Announcement acknowledgement count — already showing in Announcements.jsx (ack_count from API)
- [x] Disable /auth/local-login in production — gated via LOCAL_LOGIN_ENABLED=true in .env (defaults false)

### Important operational note
- After `php artisan optimize:clear`, always follow with `php artisan config:cache` immediately — the APP_KEY lives in config cache in production (APP_ENV=production, dotenv not loaded)
- New files must be `docker cp`'d into the container (no source volume mount) followed by `composer dump-autoload --optimize`

---

## Phase 3 — UI Polish (Gemini / separate)
- [ ] Consistent color usage via CSS variables from config
- [ ] Mobile responsiveness
- [ ] Loading skeletons
- [ ] Error toast notifications

---

## Notes
- All hardcoded `env()` calls in controllers/services that run during HTTP requests MUST use `config()` instead (config cache is active in production — Dotenv is not loaded)
- config/portal.php is the single source of truth for navigation, branding, features, and right panel defaults
- All feature flags in config/portal.php['features'] should gate both nav items AND API endpoints
