<div align="left">
  <img src="./public/logo.svg" alt="PeopleOS Core Symbol" width="115" height="121" style="border-radius: 6px; margin-bottom: 12px;" />
</div>

# PeopleOS
### The Modern, Open-Source Alternative to Zoho People & BambooHR.

<p align="left">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" />
  <img src="https://img.shields.io/badge/React-19.2-61dafb.svg" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178c6.svg" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.2-646cff.svg" alt="Vite" />
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg" alt="PRs Welcome" />
</p>

**PeopleOS** is a comprehensive, open-source Employee Management System (HRMS) built for high-velocity teams, startups, and enterprises that want full control over their people operations and workplace workflows without vendor lock-in.

---

## ✨ Features at a Glance

| Module | Features & Capabilities |
| :--- | :--- |
| 🏠 **Executive Home** | Live working hours timer, instant check-in/out, break toggle, balance radar, who's out today, manager approval queue, corporate feeds. |
| 👥 **Core HR & Org Chart** | Card grid, enterprise data table, and interactive **Top-Down Visual Org Chart** hierarchy with slide-over profile drawers & CSV export. |
| ⏱️ **Time & Attendance** | Real-time shift clock, break duration tracking, monthly attendance metrics, timesheet calendar log, and regularization requests. |
| 🌴 **Leave Tracker** | Entitlement quotas (Casual, Sick, Privilege, Parental, Unpaid), half/full day applications, dynamic balance deduction, and approval queue. |
| 🎯 **Performance & KRAs** | Strategic/Operational goal tracking with interactive progress sliders, annual appraisal cycles with star ratings, and peer **Kudos Wall** with confetti. |
| 🎫 **HR Services & Helpdesk** | Multi-category support cases (IT, Payroll, Leaves, Benefits), priority tiers, status kanban/pipeline, and live threaded discussion. |
| 📋 **Onboarding Roadmap** | New hire milestones (Documentation, IT Hardware, Orientation, Compliance) with live completion percentage tracking. |
| 📊 **Workforce Analytics** | Headcount distribution by department and geographic hub, average compensation metrics, attendance trends, and JSON intelligence export. |
| 🎭 **Persona Switcher** | 1-click switcher between **HR Admin (Sarah Jenkins)**, **Team Manager (Alex Rivera)**, and **Employee (Rohan Deshmukh)**. |
| ⚡ **Spotlight Search** | Global `⌘K` command palette searching across all employees, cases, leaves, and navigation modules. |

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Icons**: Lucide React
- **Animations & Effects**: Canvas Confetti
- **Styling**: Bespoke Vanilla CSS Design System with CSS variables and responsive glassmorphism
- **Persistence**: Browser `localStorage` with initial enterprise seed dataset

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/your-org/peopleos.git
cd peopleos
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

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
