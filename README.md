<div align="center">
  <img src="./humora/web/public/logo.svg" alt="PeopleOS Core Monogram" width="110" height="110" style="margin-bottom: 16px;" />
  <h1>PeopleOS</h1>
  <p><strong>The Enterprise Operating System Unifying Agile Sprints, Biometric Workday Reconciliation, HRMS Administration, and Statutory Payroll</strong></p>

  <p>
    <a href="#-architecture-overview"><img src="https://img.shields.io/badge/Architecture-Go%20Fiber%20%2B%20React%2019-amber?style=for-the-badge" alt="Tech Stack" /></a>
    <a href="#-getting-started"><img src="https://img.shields.io/badge/Go%20Version-1.22+-blue?style=for-the-badge&logo=go" alt="Go Version" /></a>
    <a href="#-getting-started"><img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=nodedotjs" alt="Node Version" /></a>
    <a href="#-license"><img src="https://img.shields.io/badge/License-MIT-orange?style=for-the-badge" alt="License" /></a>
  </p>
</div>

---

## 🌟 Executive Overview

**PeopleOS** is a high-velocity, open-source enterprise operating system designed to eliminate corporate friction. It fuses corporate collaboration, sprint tracking, attendance auditing, and statutory payroll into a single, cohesive experience.

Instead of navigating between multiple disconnected SaaS products (e.g. Jira for agile tasks, Slack/WhatsApp for communication, Zoho/Darwinbox for HRMS, and greytHR/Excel for payroll), PeopleOS unifies every core business workflow into a single, performant workspace.

---

## ⚡ Key Highlights & Core Capabilities

### 1. 💬 TeamPulse: Enterprise Collaboration Engine (WhatsApp Web-Caliber UX)
* **WhatsApp Web Layout & UX**: Split-screen conversation canvas with active group channels, direct messages, unread badges, timestamp formatting, and search filters.
* **Continuous Border Triangular Corner Tails**: Signature WhatsApp top-right (outgoing) and top-left (incoming) triangular corner notches engineered with continuous SVG strokes that seamlessly merge into the bubble borders in both **Obsidian Dark** and **Warm Linen Light** themes.
* **In-Chat Task Cards & Inspection**: Actionable task widgets embedded straight within conversation bubbles featuring live progress bars, assignee avatars, priority badges, and one-click `⚡ Inspect` buttons that open the dedicated right-side task drawer.
* **Group Sprint Deliverables Roster**: Slide-over sprint roster on the right side of any group chat showing all active deliverables with 1-click inspector access.
* **Direct Audio/Video Calling & Group Participant Roster**: Side drawer displaying all group members with duty status indicators, direct 1-click Voice Call, Video Call, and Direct Message initiation.
* **Micro-Interactions**: Floating hover reaction pill (👍, ❤️, 🔥, 🚀), message threading replies, voice note recorder with sound wave animations, attachment picker, and audio feedback.

### 2. ⚡ Agile Work & Sprint Engineering
* **Interactive Kanban Board**: Drag-and-drop or state-driven task workflow (`To Do` ➔ `In Progress` ➔ `In Review` ➔ `Done`) with priority badges, estimates, assignee tags, and quick-task inline creation.
* **Sprint Backlog & List Views**: Comprehensive sprint planning view with backlog prioritization, story points estimation, and tabular list perspectives with multi-criteria filtering.
* **Slide-Over Task Inspector**:
  - Live ticking focus stopwatch (`HH:MM:SS`) with Start, Pause, Reset, and auto-logging to timesheets.
  - Biometric sync audit progress bar (`3.5h / 8.0h logged` • `44% Synced`).
  - 1-Click quick log presets (`+15m`, `+30m`, `+1h`, `+2h`).
  - Threaded discussions with 1-click `Post Live Update to Chat` button.

### 3. ⏱️ Financial-Grade Workday & Biometric Reconciliation
* **Vertical Day-Wise Ledger Table**: Replaces fragmented attendance cards with a strict tabular reconciliation ledger:
  - **Shift Attendance**: Biometric clock-in shift hours with micro clock indicator.
  - **Sprint Worklogs**: Logged hours allocated to specific sprint deliverables.
  - **Sync Ratio**: Dynamic visual progress bar and percentage readout (`100% Synced`, `81% Partial`).
  - **Net Variance**: Monospace variance calculation (`0.0h bal`, `-1.5h deficit`, `+0.1h surplus`).
  - **Audit Status & Actions**: Status pills (`Synced`, `Deficit`, `Surplus`, `Rest Day`), direct `+ Log Work` action, and expandable itemized ticket breakdowns.
* **Weekly Timesheet Sign-Off Ribbon**: Manager sign-off workflow with submission notes and instant audit trail.

### 4. 🏢 Full-Stack HRMS Suite
* **Employee Directory & Hierarchy Tree**: Grid, list, and visual organizational hierarchy chart displaying management reporting lines, employee roles, contact info, and department tags.
* **Leave Balances & Approvals Desk**: Real-time quota balance cards (Privilege, Sick, Casual, Comp-Off), interactive leave application modal, and manager approval queues with one-click approve/reject actions.
* **Shift Management & Rotational Rostering**: Shift scheduling dashboard (General, Morning, Evening, Night) with rotational assignments, grace period settings, and attendance policies.
* **Team Capacity & Radar**: Heatmap visualization of team availability, holiday calendars, out-of-office trackers, and resource utilization.
* **Candidate Onboarding Pipeline**: Interactive step-by-step onboarding pipeline tracking prospective hires from document submission to orientation.

### 5. 💰 Statutory Payroll & CTC Engine
* **Automated Monthly Payroll Execution**: One-click payroll calculation engine accounting for attendance deductions, loss of pay (LOP), bonuses, statutory contributions, and net disbursements.
* **Salary CTC Schedules**: Itemized compensation breakdowns:
  - **Part A (Fixed Monthly Earnings)**: Basic Salary, House Rent Allowance (HRA), Special Allowance, Medical Reimbursement.
  - **Part B (Retiral & Statutory Deductions)**: Provident Fund (PF), Employee State Insurance (ESI), Professional Tax (PT).
* **Income Tax Regime Planner**: Side-by-side comparative modeling between Old Tax Regime and New Tax Regime with exemption calculations (Section 80C, 80D, 24b).
* **One-Click Payslip Document Generator**: Instant printable, high-resolution enterprise PDF payslip modal with automated number-to-words currency formatting.

### 6. 🎨 Luxury Design System & Shell Ergonomics
* **Dual Theme Architecture**:
  - **Smoky Obsidian Dark Mode**: High-contrast, OLED-friendly amber gold accents (`#f59e0b`) with deep matte surfaces (`#12110e`, `#1c1b18`).
  - **Warm Linen Light Mode**: Authentic WhatsApp Web warm linen wallpaper (`#efeae2`), ivory cream outgoing bubbles (`#fdf5e6`), and pure white incoming cards (`#ffffff`).
* **Google Search Command Bar (`⌘K` / `Ctrl+K`)**: Global search modal with real-time substring highlighting, recent searches memory, and keyboard arrow auto-scroll.
* **Live Shell Stopwatch & Beacon**: Persistent header clock with live digital stopwatch (`HH:MM:SS`) and pulsating royal indigo beacon when punched in.
* **Interactive Breadcrumbs**: One-click navigation buttons for jumping instantly to parent hubs and workspaces.
* **Global Keyboard Shortcuts Guide (`?`)**: Full-screen modal detailing keybindings across the entire platform.

---

## 📂 Repository Structure

```
peopleos/
├── README.md                           # Master application documentation
├── .gitignore                          # Root Git ignore rules
└── humora/                             # Monolithic application core (Backend + Frontend)
    ├── cmd/
    │   └── server/
    │       └── main.go                 # Fiber HTTP REST API Server Entrypoint
    ├── configs/
    │   ├── config.go                   # Viper & environment configuration loaders
    │   ├── database.go                 # PostgreSQL & SQLite connection manager
    │   ├── env.go                      # Env variables validation
    │   └── redis.go                    # Redis cache & session client
    ├── database/
    │   ├── migrations/                 # Versioned SQL migration files (Atlas/Goose)
    │   ├── schema/                     # Core SQL DDL schemas (Identity, HRMS, Work, Audit)
    │   └── seeds/                      # Initial database seed fixtures
    ├── internal/                       # Domain-Driven Core Business Logic
    │   ├── identity/                   # Users, JWT authentication, sessions, roles (RBAC)
    │   ├── hrms/                       # Employees, attendance, leaves, shifts, payroll
    │   ├── work/                       # Projects, boards, sprints, tasks, worklogs
    │   ├── fusion/                     # Cross-domain reconciliation & intelligence engine
    │   └── health/                     # Liveness and readiness health checks
    ├── pkg/                            # Shared internal utility packages (logger, errors)
    ├── doc/                            # Deep-dive architecture & system specifications
    └── web/                            # React 19 + Vite Frontend Application
        ├── package.json                # Frontend dependencies & scripts
        ├── vite.config.ts              # Vite configuration with API reverse proxy
        ├── tsconfig.json               # TypeScript compiler options
        ├── public/                     # Static assets, brand icons, logo.svg
        └── src/
            ├── App.tsx                 # Main application shell with providers
            ├── index.css               # Design system tokens, variables & micro-animations
            ├── api/
            │   └── client.ts           # Central Axios HTTP client with interceptors
            ├── store/                  # Redux Toolkit state management
            │   ├── store.ts            # Root store definition
            │   ├── authSlice.ts        # Authentication state & active user profile
            │   ├── hrmsSlice.ts        # HRMS directory, leaves, attendance, payroll
            │   ├── workSlice.ts        # Agile projects, tasks, sprints, worklogs
            │   ├── fusionSlice.ts      # Biometric reconciliation & timesheet sync
            │   └── uiSlice.ts          # Active theme, search, drawers, modals
            ├── components/             # Global reusable components
            │   ├── AppRail.tsx         # Leftmost persistent navigation rail
            │   ├── Header.tsx          # Top bar with breadcrumbs & active stopwatch
            │   ├── GoogleSearchBar.tsx # Cmd+K global search with history
            │   ├── NotificationDrawer  # Sliding alert drawer
            │   ├── PeopleOSLogo.tsx    # Brand vector monogram
            │   └── ToastContainer.tsx  # Dynamic feedback alerts
            └── views/                  # Primary application view desks
                ├── pulse/
                │   └── PulseDesk.tsx   # TeamPulse WhatsApp Web-grade chat workspace
                ├── work/
                │   ├── KanbanBoard.tsx # Drag/click task workflow board
                │   ├── BacklogView.tsx # Sprint planning & backlog estimation
                │   ├── ListView.tsx    # Tabular deliverables perspective
                │   └── IssueDrawer.tsx # Slide-over task details & worklog logger
                ├── hub/
                │   └── MyWorkdayHub.tsx# Financial-grade vertical reconciliation ledger
                ├── hrms/
                │   ├── EmployeeDirectory.tsx # Org directory & visual hierarchy chart
                │   ├── AttendanceDesk.tsx    # Clock-in punch & shift logs
                │   ├── LeavesPage.tsx        # Leave quotas & manager approvals
                │   ├── PayrollDesk.tsx       # CTC schedules, tax regimes & payslips
                │   ├── ShiftManagementDesk   # Rotational shift rostering
                │   ├── TeamCapacityDesk.tsx  # Resource availability & heatmaps
                │   └── OnboardingPipelineDesk# Candidate pipeline wizard
                └── profile/
                    └── MyProfileDesk.tsx     # Personal credentials & documents
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose & Description |
| :--- | :--- | :--- |
| **Backend API** | **Go 1.22+ & Fiber v2** | High-concurrency, sub-millisecond REST API server with low memory footprint |
| **Database** | **PostgreSQL / SQLite** | Relational storage for transactions, biometric shifts, tasks, and audit logs |
| **Migrations** | **Atlas / Goose** | Version-controlled deterministic database schema evolution |
| **Frontend Core**| **React 19 & TypeScript** | Strict-typed reactive user interface with hooks and component composition |
| **Build Tooling**| **Vite 8** | Instant Hot Module Replacement (HMR) and optimized Rollup production builds |
| **State Store** | **Redux Toolkit** | Centralized predictable state slices with localStorage rehydration |
| **Styling** | **Vanilla CSS Tokens** | Tailored CSS variables, glassmorphism, zero-bloat modern animations |
| **Iconography** | **Lucide Icons** | Clean, minimalist SVG iconography |
| **Audio Engine** | **Web Audio API** | Synthesized tactile micro-sounds for punch clocks and UI status feedback |

---

## 🚀 Quick Start Guide

### Prerequisites
* **Go**: `v1.22` or later installed ([Download Go](https://go.dev/dl/))
* **Node.js**: `v18.0.0` or later installed ([Download Node.js](https://nodejs.org/))
* **Git**: Installed and configured

### 1. Clone the Repository
```bash
git clone git@github.com:ritejmule2126/peopleos.git
cd peopleos
```

### 2. Launch the Backend Server (`humora`)
```bash
cd humora

# Run the Go Fiber server
go run ./cmd/server
```
* The backend will spin up at **`http://127.0.0.1:8090`**.
* Database migrations and seed datasets run automatically on boot.

### 3. Launch the Frontend Application (`humora/web`)
Open a new terminal window:
```bash
cd peopleos/humora/web

# Install client dependencies
npm install

# Start Vite development server
npm run dev
```
* The web app will launch at **`http://localhost:3001/`** (or `http://localhost:3000/`).
* Vite is pre-configured with a reverse proxy routing `/api/*` requests directly to the Go server on port `8090`.

### 4. Build for Production
```bash
cd peopleos/humora/web
npm run build
```
Generates an optimized client bundle in `humora/web/dist`.

---

## 🔌 API Route Architecture

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Authenticate user & issue signed JWT bearer token |
| `GET` | `/api/v1/auth/me` | Fetch active session profile, permissions & duty status |
| `GET` | `/api/v1/hrms/employees` | Retrieve paginated employee directory with reporting lines |
| `POST` | `/api/v1/hrms/attendance/punch`| Biometric clock-in / clock-out event creation |
| `GET` | `/api/v1/hrms/attendance/logs` | Fetch monthly attendance logs with biometric timestamps |
| `GET` | `/api/v1/hrms/leaves/balances` | Query personal leave quota entitlements |
| `POST` | `/api/v1/hrms/leaves/apply` | Submit leave request for manager approval |
| `GET` | `/api/v1/hrms/payroll/history` | List monthly payslip records |
| `GET` | `/api/v1/work/projects` | Fetch agile projects, sprints, and board configurations |
| `GET` | `/api/v1/work/tasks` | Query sprint tasks filtered by status, assignee, or priority |
| `POST` | `/api/v1/work/worklogs` | Log hours allocated to a deliverable with ticket linkage |
| `GET` | `/api/v1/fusion/reconcile` | Compute day-wise variance between biometric shifts and logged work |
| `GET` | `/api/v1/pulse/channels` | Retrieve active conversation groups and direct message threads |
| `POST` | `/api/v1/pulse/messages` | Send message with attachments, task links, or audio notes |

---

## 🎨 Design Philosophy & UX Standards

1. **Information Density with Zero Clutter**: Every view is designed to maximize actionable throughput without overwhelming the user.
2. **Tactile Feedback**: Soft UI elevations, subtle borders, and gentle auditory cues make every action feel responsive and immediate.
3. **Continuous Geometry**: Curved contours, seamless SVG borders (such as WhatsApp message triangular corner notches), and cohesive typography hierarchy eliminate visual fragmentation.
4. **Theme Respect**: Both dark and light modes are treated as primary citizens, ensuring zero eye fatigue in dark mode and warm, crisp readability in light mode.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./humora/LICENSE) file for details.

---

<div align="center">
  <sub>Engineered with precision for modern high-velocity organizations.</sub>
</div>
