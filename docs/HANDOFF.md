# FinFinity Intranet Portal — AI Handoff Document

> **Purpose:** Complete context for any AI assistant (or developer) picking up this project.
> Last updated: April 2026

---

## 1. What This App Is

A corporate intranet portal for **FinFinity**, a financial services company.
All employees use it daily for HR tools, IT support, announcements, documents, and internal links.

**Live URL:** `https://localhost` (self-signed TLS cert via mkcert)
**Repo location:** `/Users/rounakchadha/Desktop/finfinity/Intranet-portal`

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 12 (PHP 8.2) |
| Frontend | React 18 + Vite (SPA, served by Laravel) |
| Styling | Tailwind CSS |
| Database | PostgreSQL 16 (container: `finxportal_db`) |
| Cache/Queue | Redis 7 (container: `finxportal_redis`) + DB cache |
| Auth | Microsoft Azure AD OAuth2 (via `TheNetworg/oauth2-azure`) |
| Directory/Groups | Microsoft Graph API |
| Email | Microsoft Graph API (application permissions, noreply@finfinity.co.in) |
| Documents | Paperless-ngx (optional, not yet configured) |
| Container | Docker Compose — single `finxportal` app container |
| Web server | Nginx + PHP-FPM inside same container, managed by Supervisor |

---

## 3. How to Run

```bash
cd /Users/rounakchadha/Desktop/finfinity/Intranet-portal
docker compose up -d          # start
docker compose up -d --build  # rebuild after JSX/PHP changes
```

**After every rebuild** (container is recreated from fresh image — no live source mount):
```bash
docker compose exec app php artisan migrate --force
docker compose exec app php artisan db:seed --class=PortalSeeder --force
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
```

**CRITICAL rule:** Never run `php artisan optimize:clear` without immediately running `php artisan config:cache` after it.  
The app runs as `APP_ENV=production` — dotenv is NOT loaded at runtime. `APP_KEY` and all config values live in the config cache. Clearing it breaks the app.

**To deploy a changed PHP file without rebuilding:**
```bash
docker cp path/to/file.php finxportal:/var/www/html/path/to/file.php
# If it's a new class (new file), also run:
docker compose exec app composer dump-autoload --optimize
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
```

**To deploy a changed JSX/CSS file:**  
You must rebuild: `docker compose up -d --build` (Vite bundles at image build time).

**Dev bypass login (no Azure needed):**  
Visit `https://localhost/auth/local-login` — sets a session with roles `['Admin', 'HR Manager', 'IT Admin']` and redirects to `/app`.

---

## 4. Key Files & Architecture

### Config (single source of truth)
- **`config/portal.php`** — navigation items, feature flags, branding colors, right panel, admin groups, IT admin email, employee email domain. **Never hardcode these in React components.**
- **`config/services.php`** — Azure AD credentials, Microsoft email credentials, Paperless URL/token.
- **`.env`** — raw env vars. Only read by config files (never by controllers — use `config()` not `env()` in PHP).

### Backend
```
app/Http/Controllers/
  AuthController.php        — Azure OAuth login/callback, getValidToken() static helper
  ConfigController.php      — /api/config endpoint (serves portal.php to React)
  AnnouncementController.php — CRUD + /latest endpoint for dashboard
  QrCodeController.php      — CRUD, admin-gated
  EmployeeController.php    — Graph API fetch, falls back to local employees DB
  GroupMemberController.php — Graph API fetch, falls back to local employees DB
  SharedCalendarController.php — Graph API calendar events
  MemoController.php        — raise memo
  ApprovalController.php    — approve/decline
  AssetController.php       — IT asset management (CRUD, allocate, deallocate, audit)
  AssetRequestController.php — employee IT requests → IT admin reviews
  HRAdminController.php     — full recruitment workflow
  DocumentController.php    — Paperless-ngx integration
  LinkController.php        — quick links + right panel personalization
  AccessControlController.php — group-based link personalization
  
app/Services/
  EmailService.php          — sends via Microsoft Graph (noreply address, app permissions)
  MicrosoftGroupSyncService.php — fetches Azure AD groups and members

app/Models/               — Eloquent models (one per DB table, see Section 6)
```

### Frontend
```
resources/js/
  app.jsx                   — root, fetches /api/config + /api/auth/status on load
  AppRoutes.jsx             — React Router routes, sidebar layout vs fullscreen pages
  components/
    Sidebar.jsx             — config-driven nav, collapses, admin section auto-shows
    TopNav.jsx              — top bar with user name
    RightPanel.jsx          — profile panel, doc directory link, personalized link
    Dashboard.jsx           — greeting, quick links (from DB), schedule, updates
    Login.jsx               — split-screen, "Continue with Microsoft" + "Use a different account"
    EmployeeDirectory.jsx   — Grid view, search + dept filter
    Announcements.jsx       — List + CRUD for admin
    QrCodeManager.jsx       — Grid + CRUD for admin, QR canvas rendering
    MemoApproval.jsx        — Raise memo (select approvers) + Approve tab
    AssetRequestPage.jsx    — Submit IT request + list of own requests
    ITAdminTools.jsx        — Full IT asset management (fullscreen)
    HRAdminTools.jsx        — Full HR recruitment workflow (fullscreen)
    DocumentDirectory.jsx   — Paperless document viewer
    Calendar.jsx            — Personal calendar (Graph API)
    SharedCalendar.jsx      — Shared calendar widget
    Account.jsx             — User profile page
```

### Routes
All routes are in `routes/web.php` (session-based auth needs web middleware).
`routes/api.php` is empty — reserved for future stateless endpoints.

The SPA catch-all is the last route: `Route::get('/{any}', fn() => view('app'))`.

---

## 5. Authentication

### Production (Azure AD)
1. User visits `/auth/login` → redirected to Microsoft
2. Microsoft redirects back to `/auth/azure/callback`
3. `AuthController::callback()` exchanges code for token, fetches profile + calendar + groups
4. Session stores: `user.authenticated`, `user.profile`, `user.groups`, `user.roles`, and `token` (with refresh_token)
5. Token auto-refreshes via `AuthController::getValidToken()` — call this in any controller that needs a Graph token

### Local dev bypass
`GET /auth/local-login` — sets a fake session. Roles: `['Admin', 'HR Manager', 'IT Admin']`.
These match `portal.admin_groups` so all admin UI is visible.

### Admin access gating
- **Announcements / QR codes / general admin** → `portal.admin_groups = ['Admin', 'HR', 'HR Manager']`
- **IT Admin Tools nav item** → roles must include `IT Manager` or `IT Admin`
- **HR Admin Tools nav item** → roles must include `HR` or `HR Manager`

If an Azure user's groups don't match, check `https://localhost/api/auth/status` → `user.roles` to see what Azure returned, then update `config/portal.php` → `admin_groups` to match.

### Token refresh
`AuthController::getValidToken()` — static method. Checks expiry, uses refresh_token if expired, stores new token in session. Returns `null` if no token (local login) or refresh failed. All Graph API callers use this.

---

## 6. Database Tables

| Table | Purpose |
|---|---|
| `sessions` | Laravel session storage |
| `cache` / `cache_locks` | Laravel cache |
| `jobs` / `job_batches` / `failed_jobs` | Queue |
| `users` | Laravel default (not actively used — auth is Azure) |
| `employees` | HR-managed employee records (onboarded via HR workflow) |
| `links` | Quick links shown on dashboard |
| `group_personalized_links` | Per-Azure-group link overrides (right panel personalization) |
| `announcements` | Portal announcements (`title`, `body`, `posted_by_name`, `is_pinned`, `expires_at`) |
| `announcement_acknowledgements` | Who acknowledged each announcement |
| `qr_codes` | QR codes (`name`, `category`, `content`, `is_dynamic`) |
| `memos` | Raised memos |
| `approvals` | Approval steps for each memo |
| `microsoft_groups` | Cached Azure AD group list |
| `asset_master` | IT assets (laptops, phones, etc.) |
| `allocated_asset_master` | Asset-to-employee allocations |
| `asset_type_master` | Asset types lookup |
| `location_master` | Office locations lookup |
| `asset_audit_logs` | Every asset action logged |
| `asset_requests` | Employee IT support requests (`asset_type`, `notes`, `status`, `review_notes`) |
| `jobs_master` | HR job openings |
| `candidates_master` | Candidate profiles |
| `candidate_jobs` | Candidate-to-job assignments |
| `candidate_source_master` | Where candidates come from |
| `candidate_skill_master` | Skills lookup |
| `background_checks` | Background check records |
| `offers` | Job offers sent |
| `onboarding` | Onboarding tasks/status |
| `role_tag` | Maps Azure roles → Paperless tags (for document access) |
| `doc_tag` | Maps Paperless doc IDs → tags |
| `password_reset_tokens` | Laravel default |

---

## 7. Seed Data

`database/seeders/PortalSeeder.php` — idempotent (skips if table already has rows):
- **12 employees** across Technology, Finance, HR, IT, Marketing, Sales, Legal
- **5 QR codes** — Office Wi-Fi, Cafeteria, Parking, Emergency, IT Support
- **3 announcements** — Welcome (pinned), IT Policy, Office Closure

Run: `docker compose exec app php artisan db:seed --class=PortalSeeder --force`

---

## 8. Environment Variables (`.env`)

```
APP_NAME="FinFinity Portal"
APP_ENV=local           # set to 'production' in prod — disables dotenv at runtime
APP_URL=https://localhost

DB_CONNECTION=pgsql
DB_HOST=db / DB_PORT=5432 / DB_DATABASE=finxportal / DB_USERNAME=laravel / DB_PASSWORD=...

SESSION_DRIVER=database
SESSION_LIFETIME=480    # 8 hours

AZURE_CLIENT_ID=...     # Azure app registration
AZURE_CLIENT_SECRET=... # Azure app secret
AZURE_TENANT_ID=...     # Azure tenant
AZURE_REDIRECT_URI=https://localhost/auth/azure/callback

MICROSOFT_EMAIL_CLIENT_ID=...     # Separate app reg for sending email
MICROSOFT_EMAIL_CLIENT_SECRET=... # (needs Mail.Send application permission)
MICROSOFT_EMAIL_TENANT_ID=...
MICROSOFT_NOREPLY_EMAIL=noreply@finfinity.co.in

IT_ADMIN_EMAIL=it@finfinity.co.in         # Gets notified on employee resignation / new hire
EMPLOYEE_EMAIL_DOMAIN=finfinity.co.in     # Used when auto-generating employee email addresses

PAPERLESS_URL=http://...    # Paperless-ngx instance URL (leave blank if not set up)
PAPERLESS_TOKEN=...         # Paperless API token
```

---

## 9. What Has Been Built & Works ✅

### Auth & Infrastructure
- Azure AD OAuth2 login with account picker (`?switch=1` forces Microsoft account chooser)
- Auto token refresh using refresh_token (no re-login after 1 hour)
- Session-based auth, 8-hour lifetime
- Local dev bypass (`/auth/local-login`)
- Config-cached production setup (no dotenv at runtime)
- Docker Compose with Nginx + PHP-FPM + Supervisor

### Navigation & Layout
- Sidebar fully config-driven from `config/portal.php` → `/api/config` → React
- Feature flags gate both nav items and API endpoints
- Role-based nav filtering (admin-only items hidden for regular users)
- Collapsible sidebar
- Fullscreen mode for IT Admin and HR Admin tools
- TopNav with user info

### Dashboard
- Greeting with user's first name from Graph profile
- Quick links from DB (`links` table) — no hardcoded logos
- Schedule widget pulling from shared calendar (Graph API), falls back gracefully
- Updates widget showing latest 5 announcements from DB

### Employee Directory
- Fetches from Microsoft Graph API when logged in via Azure
- Falls back to local `employees` DB table when no Graph token (local dev login)
- Search by name/email/title/dept, filter by department

### Announcements
- Full CRUD for admins (create, pin, edit, delete)
- Acknowledgement flow for employees
- Role-gated: only `admin_groups` members can create/edit/delete
- `/api/announcements/latest` endpoint for dashboard widget

### QR Code Manager
- Full CRUD for admins
- Live QR preview in form, download as PNG
- Category filter (WiFi, Cafeteria, Parking, Emergency, Custom)
- Role-gated admin controls

### IT Support (Asset Requests)
- Employee submits request with asset type + notes
- Submitted requests shown below form with status (Pending / Approved / Rejected) + IT review notes
- IT admin reviews via IT Admin Tools panel (approve/reject with notes)

### Memo Approval
- Raise memo with description + document upload
- Select approvers from group hierarchy (Graph API or local DB fallback)
- Approve / Decline with reason
- Email notification on decline (via EmailService)

### HR Admin Tools (full recruitment workflow)
- Create job openings
- Add candidates, assign to jobs
- Approve candidates, schedule interviews
- Send offers, start onboarding
- Mark resignation (triggers email to IT admin for asset recovery)
- Background checks

### IT Admin Tools (full asset management)
- Add assets (laptops, phones, accessories)
- Allocate to employees, deallocate, reallocate, decommission
- Full audit log of every action
- Asset type and location master data

### Right Panel
- User profile with avatar (ui-avatars.com)
- Document Directory shortcut
- Personalized link (per Azure group, configured via Access Control)
- Support button (links to Teams or memo-approval)

### Document Directory
- Connected to Paperless-ngx via `role_tag` + `doc_tag` tables
- Returns empty list gracefully when Paperless not configured

### Login Page
- Split-screen: brand green left panel + white right form
- "Continue with Microsoft" button
- "Use a different account" link (forces Microsoft account picker)
- Mobile responsive (collapses to single column)

---

## 10. What Is NOT Built / Broken / TODO ❌

### High Priority
- **Memo list page** — users can raise memos and approvers can approve/decline, but there's no page showing "my raised memos and their current status". Only the "Approve" tab exists.
- **IT Admin pending requests** — IT Admin Tools doesn't have a dedicated section showing pending asset requests from employees. Employees submit via `/asset-request` but IT admins need to see them in `/it-admin-tools`.
- **Announcement acknowledgement count** — admins can't see how many people acknowledged an announcement.
- **Email not sending** — `MICROSOFT_EMAIL_CLIENT_ID` and `MICROSOFT_EMAIL_CLIENT_SECRET` in `.env` are blank. Email service will silently fail until these are filled with a valid Azure app registration that has `Mail.Send` application permission.

### Medium Priority
- **Document Directory not usable** — Paperless-ngx not configured (`PAPERLESS_URL` / `PAPERLESS_TOKEN` missing). The `role_tag` and `doc_tag` tables exist but are empty. To use: set up Paperless, fill in env vars, then populate `role_tag` (which Azure groups get which tags) and `doc_tag` (which Paperless doc IDs map to which tags).
- **Calendar page** — the personal calendar (`/calendar`) fetches Graph events. Needs testing with real Azure login. SharedCalendar widget (dashboard) only shows non-primary calendar events, might be empty if no shared calendars exist.
- **Disable `/auth/local-login` in production** — currently always enabled. Should be env-gated: `if (config('app.env') !== 'production')`.

### Low Priority / Phase 3
- **Helpdesk module** — `features.helpdesk = false` in portal.php. Not built yet.
- **Mobile responsiveness** — not systematically tested
- **Loading skeletons** — pages show spinners but no skeleton screens
- **Error toast notifications** — errors shown inline or via console, no unified toast system
- **Consistent color system** — some components still use `indigo` (Tailwind) instead of brand green `#115948`. Identified in: `Calendar.jsx` (indigo event colors), `MemoApproval.jsx` (some buttons)

---

## 11. Known Rules / Gotchas

1. **Never use `env()` in controllers or services** — config cache is active, dotenv not loaded at runtime. Always use `config('key')`. Only `config/*.php` files should call `env()`.

2. **No source volume mount** — The container builds from Dockerfile. Changing a PHP file on the host does NOT update the container. You must `docker cp` the file in. For JSX changes, you must `docker compose up -d --build`.

3. **After `optimize:clear`, always `config:cache`** — clearing config removes APP_KEY from cache, which crashes everything.

4. **Session structure** — the `user` session key has this shape:
   ```
   user.authenticated = true
   user.profile.displayName = "John Doe"
   user.profile.userPrincipalName = "john@finfinity.co.in"
   user.profile.mail = "john@finfinity.co.in"
   user.profile.id = "azure-object-id"
   user.groups = [ {displayName: "HR Manager"}, ... ]
   user.roles = ["HR Manager", "IT Admin", ...]   ← flat array, used for role checks
   token.access_token = "..."
   token.refresh_token = "..."
   token.expires = 1234567890   ← unix timestamp
   ```
   Always use `$user['profile']['userPrincipalName']` for email, NOT `$user['email']` (that key doesn't exist).

5. **Admin groups must match Azure group names exactly** — `portal.admin_groups` defaults to `['Admin', 'HR', 'HR Manager']`. If an Azure user's groups are named differently, update this array in `config/portal.php`. Check `/api/auth/status` → `user.roles` to see what Azure returned.

6. **Announcement body field is `body`** — not `content`. The DB column is `body`. Frontend must use `ann.body` not `ann.content`.

7. **Employees table vs Graph API** — `employees` table is populated by the HR onboarding workflow (when a candidate is onboarded). The Employee Directory page pulls from Microsoft Graph API if a token exists, or falls back to the `employees` DB table. These are two separate data sources.

8. **Token for Graph API** — always call `AuthController::getValidToken()` (static method). Never read `Session::get('token')['access_token']` directly — the token may be expired and getValidToken handles refresh automatically.

9. **Quick links** — stored in `links` DB table. The `logo` field should be a path to an image file in `/public/assets/` or a full URL. If blank, the component shows a letter-avatar with `background_color`.

---

## 12. How to Add Content (Admin Guide)

| What | How |
|---|---|
| Announcement | Log in → `/announcements` → "New Announcement" button (admin only) |
| QR Code | Log in → `/qr-codes` → "+ New QR Code" button (admin only) |
| Quick Link | Direct DB insert into `links` table, or build an admin UI |
| Employee | Via HR workflow: `/hr-admin-tools` → Onboarding → creates row in `employees` table |
| Asset | Via IT Admin: `/it-admin-tools` → Add Asset |
| Document | Set up Paperless-ngx, then populate `role_tag` + `doc_tag` tables |
| IT Request (as employee) | `/asset-request` → submit form |
| IT Request (review as admin) | `/it-admin-tools` → pending requests section (TODO: needs UI) |

---

## 13. Deployment Checklist (Production)

- [ ] Set `APP_ENV=production` and `APP_DEBUG=false` in `.env`
- [ ] Set real `AZURE_*` credentials
- [ ] Set real `MICROSOFT_EMAIL_*` credentials (app reg needs `Mail.Send` application permission)
- [ ] Set `IT_ADMIN_EMAIL` to the real IT admin email
- [ ] Set `PAPERLESS_URL` and `PAPERLESS_TOKEN` if using Paperless
- [ ] Change `AZURE_REDIRECT_URI` to production domain
- [ ] Gate `/auth/local-login` route behind `app.env !== production` check
- [ ] Run `php artisan config:cache` after any `.env` changes
- [ ] Run `php artisan migrate --force` on first deploy
- [ ] Run `php artisan db:seed --class=PortalSeeder --force` if DB is fresh

---

## 14. Useful Commands

```bash
# Enter container shell
docker compose exec app bash

# View live Laravel logs
docker compose exec app tail -f /var/www/html/storage/logs/laravel-$(date +%Y-%m-%d).log

# Check what roles the current user has (after logging in)
# Visit in browser: https://localhost/api/auth/status

# Check all DB tables
docker compose exec app php artisan tinker --execute="echo implode(', ', array_column(DB::select(\"select tablename from pg_tables where schemaname='public' order by tablename\"), 'tablename'));"

# Clear and rebuild everything
docker compose exec app php artisan optimize:clear
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache

# Re-seed (safe — skips if data already exists)
docker compose exec app php artisan db:seed --class=PortalSeeder --force
```
