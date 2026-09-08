# 🌐 PeopleOS Self-Hosting Guide

This guide provides step-by-step instructions for founders, CTOs, and DevOps engineers to self-host **PeopleOS** on your own server, private cloud, or VPS.

---

## ⚡ Quick Start: 60-Second Docker Deployment

The fastest way to deploy PeopleOS is using the bundled `docker-compose.yml`.

### Prerequisites
- Docker (version 24.0+)
- Docker Compose (v2.0+)

### Step 1: Clone Repository
```bash
git clone https://github.com/your-org/peopleos.git
cd peopleos
```

### Step 2: Launch Container
```bash
docker compose up -d --build
```

### Step 3: Access Workspace
Open **`http://<YOUR_SERVER_IP>:8080`** in your browser.
You will see the PeopleOS registration & sign-in screen.

---

## 🏢 Founder Setup & Initializing Your Company

Once your instance is live:

1. Click **"Register Organization"** on the authentication screen.
2. Enter:
   - **Company Name**: (e.g. *Acme Innovations*)
   - **Corporate Domain**: (e.g. *acme.com*)
   - **Founder Name**: Your full name (e.g. *Sarah Jenkins*)
   - **Work Email**: Your executive login email
   - **Root Password**: Master admin password
   - **Timezone**: Primary corporate timezone
3. Click **"Complete Setup & Launch Organization"**.

> [!NOTE]
> As the **Founder**, your account is automatically positioned at the **root node** of the organizational hierarchy tree with unrestricted oversight over all departments, attendances, and logs.

---

## 👥 Onboarding Flow: How Founder & HR Onboard Employees

PeopleOS uses a structured **down-tree reporting flow**:

```
                 👑 Founder / CEO
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
   🛡️ HR Administrator          💼 VP of Engineering (Manager)
         │                             │
         ▼                             ├──────────────┬──────────────┐
   HR Specialist                       ▼              ▼              ▼
                                 Senior Eng     Frontend Lead   QA Engineer
                                       │
                                       ▼
                                   Junior Dev
```

### How to Onboard Staff:
1. Log in as **Founder** or **HR Administrator**.
2. Navigate to **Employees** in the sidebar.
3. Click the **"Onboard Employee"** button.
4. Fill in:
   - Personal information (First/Last name, work email, phone)
   - Department assignment (Engineering, Sales, HR, etc.)
   - Designation & Employment Type (Full Time, Contract, Intern)
   - **Reporting Manager**: Select which senior lead this employee reports to in the down-tree flow!
   - System Role:
     - `MANAGER`: If this person will lead a team and review junior logs.
     - `EMPLOYEE`: Standard team member with self-service view.
5. Click **"Create Employee Record"**.
   - The employee is instantly integrated into the visual **Org Chart**, timesheets, and leave tracking systems.

---

## 🛡️ Down-Tree Access Control & Log Visibility

PeopleOS enforces downward security policies:

| Persona | Attendance & Timesheets | Leave Approvals | Employee Directory |
| :--- | :--- | :--- | :--- |
| **👑 Founder / CEO** | Can view all organization members' logs. | Can approve any leave request across the entire company. | Full org-wide access, can onboard and remove members. |
| **🛡️ HR Admin** | Can view all staff logs for compliance. | Can review & approve all leave requests. | Full org-wide access, can onboard and configure departments. |
| **💼 Senior / Manager** | **Down-Tree Only**: Can only view attendances & timesheets of direct and indirect junior reports. | **Down-Tree Only**: Can only approve leaves submitted by team subordinates. | Can inspect profiles and direct reports. |
| **👨‍💻 Junior Employee** | **Self Only**: Can only view personal daily hours, timers, and attendance history. | Self-service leave application only. | Can view directory and organizational chart. |

---

## 🔒 Production VPS Deployment with SSL (Nginx & Let's Encrypt)

If deploying to a public Linux VPS (Ubuntu 22.04/24.04, Debian 12, AWS EC2, DigitalOcean Droplet):

### 1. Install Nginx and Certbot
```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. Configure Reverse Proxy
Create `/etc/nginx/sites-available/peopleos.conf`:
```nginx
server {
    server_name hr.yourcompany.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/peopleos.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Obtain Free HTTPS Certificate
```bash
sudo certbot --nginx -d hr.yourcompany.com
```

Certbot will automatically configure auto-renewing TLS 1.3 encryption.

---

## 💾 Backup and Restoration

All PeopleOS company configuration, departments, accounts, and attendance logs can be exported directly:

1. **In-App Export**: Navigate to **Reports** -> click **"Export Intelligence Pack"** to download complete JSON state backups.
2. **Directory Export**: Navigate to **Employees** -> click **"Export CSV"** for complete workforce rosters.
3. **Reset to Factory Defaults**: Founder can click **"Reset"** in the sidebar footer or **Settings** -> **"Reset Database"** to restore seed demonstration data at any time.

---

## ❓ FAQ & Troubleshooting

#### How do I change the default port?
Edit `docker-compose.yml` and change `"8080:80"` to your desired host port (e.g. `"3000:80"` or `"80:80"`).

#### Does PeopleOS require an external database to get started?
No. PeopleOS runs out-of-the-box with reactive persistent storage, meaning you can launch it in seconds with zero database administration headaches.
