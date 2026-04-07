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
- [ ] Fix EmailService to use config() instead of env() — breaks email notifications
- [ ] Move right panel items (doc directory link, support button) to config/portal.php
- [ ] Move SharedCalendar section title to config
- [ ] Add missing env vars to config/services.php (Paperless, email sender)
- [ ] Enforce feature flags in ConfigController (hide nav when feature disabled)

### 2b. Core Feature Fixes
- [ ] Test & fix Announcements (CRUD + acknowledge)
- [ ] Test & fix QR Codes (CRUD)
- [ ] Test & fix Memo Approval (raise + approve/decline flow)
- [ ] Test & fix Asset Requests (submit + IT admin review)
- [ ] Test & fix IT Admin Tools (asset CRUD, allocate/deallocate)
- [ ] Test & fix HR Admin Tools (full recruitment workflow)
- [ ] Test & fix Employee Directory (Graph API fetch)
- [ ] Test & fix Document Directory (Paperless integration or fallback)
- [ ] Test & fix Calendar (personal + shared)

### 2c. Missing Functionality
- [ ] Asset request — IT admin should see all pending requests in IT Admin Tools panel
- [ ] Memo list page — raised memos and their approval status (currently only "Approve" tab exists)
- [ ] Announcement acknowledgement count visible to admins
- [ ] Disable /auth/local-login in production (env-gate it)

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
