<div align="left">
  <img src="./frontend/public/logo.svg" alt="PeopleOS Core Symbol" width="100" height="100" style="border-radius: 6px; margin-bottom: 12px;" />
</div>

# PeopleOS
### The Modern, Open-Source Enterprise Workday, HRMS & Agile Operating System

**PeopleOS** is an open-source enterprise operating system unifying agile project sprints, biometric workday reconciliation, HRMS administration, and statutory payroll into a single high-velocity platform.

---

## 📂 Repository Architecture

The repository is structured into two dedicated directories:

```
peopleos/
├── humora/           # Golang backend microservices, SQL databases, migrations & API endpoints
└── frontend/         # React 19 + TypeScript + Vite modern web application
```

- **[`humora/`](./humora)**: High-performance Go service powering attendance engines, statutory salary calculation, sprint tracking, and Postgres migrations.
- **[`frontend/`](./frontend)**: Luxury Champagne Amber Gold & Smoky Obsidian frontend application. See [`frontend/README.md`](./frontend/README.md) for full documentation of every view, component, and workflow.

---

## 🚀 Quick Start

### 1. Start Backend (`humora`)
```bash
cd humora
go run ./cmd/server
```
Runs on `http://127.0.0.1:8090`.

### 2. Start Frontend (`frontend`)
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:3000/` or `http://localhost:3001/` with automated proxy to backend.

### 4. Production build
```bash
npm run build
```

---

## 📁 Architecture Overview

```
peopleos/
├── public/
├── src/
│   ├── components/
│   │   ├── common/         # SearchModal (⌘K), Modals, Drawers
│   │   ├── layout/         # PeopleOS Sidebar, Live Clock Header
│   │   └── modules/
│   │       ├── Analytics/  # Workforce intelligence & department bars
│   │       ├── Attendance/ # Live punch clock & timesheets
│   │       ├── Dashboard/  # Executive workspace & quick widgets
│   │       ├── Employees/  # Grid, List, and Visual Org Chart Tree
│   │       ├── Helpdesk/   # HR cases & threaded discussions
│   │       ├── Leaves/     # Quota balances & manager approvals
│   │       ├── Onboarding/ # Milestone checklists & progress
│   │       ├── Performance/# Goals, sliders, appraisals & kudos
│   │       └── Settings/   # Company profile & demo reset
│   ├── context/            # Central reactive AppContext with localStorage sync
│   ├── data/               # Seed dataset (25+ profiles, leaves, tickets, holidays)
│   ├── types/              # Full TypeScript schemas
│   ├── index.css           # PeopleOS design system tokens & variables
│   └── App.tsx             # Shell router & layout
├── package.json
└── vite.config.ts
```

---

## 🤝 Contributing

Contributions are warmly welcomed! Feel free to submit issues, propose new modules (e.g. Payroll calculations, Slack/Discord webhooks), or create pull requests.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
