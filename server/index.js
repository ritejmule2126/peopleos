import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { readDatabase, writeDatabase, resetDatabase } from './db.js';
import { getDownlineIds, canAccessSubordinate } from './hierarchy.js';
import { generateBase32Secret, generateTOTP, verifyTOTP, getOtpauthUrl } from './totp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// =========================================================================
// 1. SYSTEM & HEALTH
// =========================================================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    product: 'PeopleOS',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/system/reset', (req, res) => {
  resetDatabase();
  const db = readDatabase();
  res.json({ success: true, message: 'Database reset to factory defaults', db });
});

// =========================================================================
// 2. AUTHENTICATION & FOUNDER REGISTRATION
// =========================================================================
app.post('/api/auth/register', (req, res) => {
  const { companyName, domain, founderName, workEmail, password, timezone } = req.body;

  if (!companyName || !founderName || !workEmail || !password) {
    return res.status(400).json({ error: 'Missing required registration parameters' });
  }

  const db = readDatabase();
  const newEmpId = `emp-root-${Date.now()}`;
  const newAccId = `acc-root-${Date.now()}`;

  const [firstName, ...lastParts] = founderName.split(' ');
  const lastName = lastParts.join(' ') || 'Founder';

  const founderEmp = {
    id: newEmpId,
    employeeId: 'POS-1001',
    firstName,
    lastName,
    email: workEmail,
    phone: '+1 (555) 100-0001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    department: 'Executive Leadership',
    designation: 'CEO & Founder (Company Root)',
    managerId: null,
    managerName: null,
    role: 'FOUNDER',
    dateOfJoining: new Date().toISOString().split('T')[0],
    workLocation: 'Company Headquarters',
    employmentType: 'Full Time',
    status: 'Active',
    salary: 220000,
    skills: ['Leadership', 'Strategic Planning', 'Product Vision'],
    bio: `Founder & Executive Leader at ${companyName}. Self-hosted instance root.`,
  };

  const founderSecret = generateBase32Secret(16);
  const founderAcc = {
    id: newAccId,
    employeeId: newEmpId,
    email: workEmail,
    passwordHash: password,
    role: 'FOUNDER',
    fullName: founderName,
    avatar: founderEmp.avatar,
    companyName,
    twoFactorEnabled: true,
    twoFactorSecret: founderSecret,
  };

  db.organization = {
    name: companyName,
    domain: domain || `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    timezone: timezone || 'America/Los_Angeles (PST - UTC-8)',
    established: new Date().toISOString().split('T')[0],
  };

  db.employees.unshift(founderEmp);
  db.accounts.unshift(founderAcc);

  writeDatabase(db);

  res.status(201).json({
    success: true,
    account: founderAcc,
    employee: founderEmp,
    token: `token_${newAccId}_${Date.now()}`,
    twoFactorSecret: founderSecret,
    otpauthUrl: getOtpauthUrl(workEmail, founderSecret, 'PeopleOS'),
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, deviceToken } = req.body;
  const db = readDatabase();

  const account = db.accounts.find(
    (a) => a.email.toLowerCase() === (email || '').toLowerCase() && a.passwordHash === password
  );

  if (!account) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const employee = db.employees.find((e) => e.id === account.employeeId) || db.employees[0];

  // Check if device is recognized and trusted
  const isTrustedDevice = Boolean(deviceToken && account.trustedDevices && account.trustedDevices.includes(deviceToken));

  // If 2FA enabled and device is not trusted, challenge with Google Authenticator
  if (account.twoFactorEnabled !== false && !isTrustedDevice) {
    const secret = account.twoFactorSecret || 'JBSWY3DPEHPK3PXP';
    return res.json({
      success: true,
      requires2FA: true,
      tempToken: `temp_2fa_${account.id}_${Date.now()}`,
      email: account.email,
      fullName: account.fullName,
      role: account.role,
      avatar: account.avatar,
      employeeId: account.employeeId,
      twoFactorSecret: secret,
      otpauthUrl: getOtpauthUrl(account.email, secret, 'PeopleOS'),
      currentTotpHint: generateTOTP(secret),
      message: 'Please enter the 6-digit verification code from Google Authenticator on your device.',
    });
  }

  res.json({
    success: true,
    requires2FA: false,
    account,
    employee,
    token: `token_${account.id}_${Date.now()}`,
  });
});

app.post('/api/auth/2fa/verify', (req, res) => {
  const { email, code, tempToken, trustDevice, deviceName } = req.body;
  const db = readDatabase();

  const account = db.accounts.find(
    (a) => a.email.toLowerCase() === (email || '').toLowerCase()
  );

  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const secret = account.twoFactorSecret || 'JBSWY3DPEHPK3PXP';
  const isValid = verifyTOTP(code, secret, 1);

  if (!isValid) {
    return res.status(401).json({
      error: 'Invalid authenticator code. Please check Google Authenticator on your device (or use demo master code 123456).',
    });
  }

  let deviceToken = null;
  if (trustDevice) {
    deviceToken = `dev_${account.id}_${Date.now()}`;
    account.trustedDevices = account.trustedDevices || [];
    account.trustedDevices.push(deviceToken);
    writeDatabase(db);
  }

  const employee = db.employees.find((e) => e.id === account.employeeId) || db.employees[0];

  res.json({
    success: true,
    account,
    employee,
    token: `token_${account.id}_${Date.now()}`,
    deviceToken,
  });
});

app.post('/api/auth/2fa/setup', (req, res) => {
  const { email } = req.body;
  const db = readDatabase();
  const account = db.accounts.find(
    (a) => a.email.toLowerCase() === (email || '').toLowerCase()
  );

  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const newSecret = generateBase32Secret(16);
  account.twoFactorSecret = newSecret;
  account.twoFactorEnabled = true;
  writeDatabase(db);

  res.json({
    success: true,
    twoFactorSecret: newSecret,
    otpauthUrl: getOtpauthUrl(account.email, newSecret, 'PeopleOS'),
    currentTotpHint: generateTOTP(newSecret),
  });
});

app.get('/api/auth/me', (req, res) => {
  const db = readDatabase();
  const email = req.query.email || 'founder@peopleos.dev';
  const account = db.accounts.find((a) => a.email.toLowerCase() === email.toLowerCase()) || db.accounts[0];
  const employee = db.employees.find((e) => e.id === account.employeeId) || db.employees[0];

  res.json({ account, employee });
});

// =========================================================================
// 3. EMPLOYEES & ORGANIZATIONAL HIERARCHY
// =========================================================================
app.get('/api/employees', (req, res) => {
  const db = readDatabase();
  res.json({
    employees: db.employees,
    departments: db.departments,
  });
});

app.post('/api/employees', (req, res) => {
  const db = readDatabase();
  const payload = req.body;

  const newEmpId = `emp-${Date.now()}`;
  const manager = db.employees.find((m) => m.id === payload.managerId);

  const newEmployee = {
    ...payload,
    id: newEmpId,
    employeeId: `POS-${1000 + db.employees.length + 1}`,
    managerName: manager ? `${manager.firstName} ${manager.lastName}` : null,
    avatar:
      payload.avatar ||
      `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    salary: Number(payload.salary || 100000),
  };

  db.employees.unshift(newEmployee);

  // Initialize leave balance
  db.leaveBalances[newEmpId] = {
    CL: { total: 12, used: 0, remaining: 12 },
    SL: { total: 10, used: 0, remaining: 10 },
    PL: { total: 15, used: 0, remaining: 15 },
    ML: { total: 14, used: 0, remaining: 14 },
    UL: { total: 30, used: 0, remaining: 30 },
  };

  writeDatabase(db);
  res.status(201).json({ success: true, employee: newEmployee });
});

app.put('/api/employees/:id', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const index = db.employees.findIndex((e) => e.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  db.employees[index] = { ...db.employees[index], ...req.body };
  writeDatabase(db);
  res.json({ success: true, employee: db.employees[index] });
});

app.delete('/api/employees/:id', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  db.employees = db.employees.filter((e) => e.id !== id);
  writeDatabase(db);
  res.json({ success: true, message: 'Employee removed' });
});

// =========================================================================
// 4. ATTENDANCE & DOWN-TREE FILTERING
// =========================================================================
app.get('/api/attendance', (req, res) => {
  const db = readDatabase();
  const requesterId = req.query.requesterId;
  const role = req.query.role || 'EMPLOYEE';

  // Founder and HR Admin view all organization records
  if (role === 'FOUNDER' || role === 'HR_ADMIN' || !requesterId) {
    return res.json({
      attendance: db.attendance,
      downlineSubordinates: [],
      canViewAll: true,
    });
  }

  // Calculate down-tree reports for senior manager
  const downlineIds = getDownlineIds(db.employees, requesterId);

  // Filter logs: only requester + their subordinates!
  const scopedAttendance = db.attendance.filter(
    (a) => a.employeeId === requesterId || downlineIds.includes(a.employeeId)
  );

  res.json({
    attendance: scopedAttendance,
    downlineSubordinates: downlineIds,
    canViewAll: false,
  });
});

app.post('/api/attendance/punch-in', (req, res) => {
  const { employeeId } = req.body;
  const db = readDatabase();

  const todayStr = new Date().toISOString().split('T')[0];
  const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  let record = db.attendance.find((a) => a.employeeId === employeeId && a.date === todayStr);

  if (record) {
    record.checkIn = record.checkIn || nowTimeStr;
    record.status = 'Present';
  } else {
    record = {
      id: `att-${Date.now()}`,
      employeeId,
      date: todayStr,
      checkIn: nowTimeStr,
      checkOut: null,
      totalHours: 0.1,
      breakMinutes: 0,
      status: 'Present',
    };
    db.attendance.unshift(record);
  }

  writeDatabase(db);
  res.json({ success: true, record });
});

app.post('/api/attendance/punch-out', (req, res) => {
  const { employeeId, totalHours } = req.body;
  const db = readDatabase();

  const todayStr = new Date().toISOString().split('T')[0];
  const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const record = db.attendance.find((a) => a.employeeId === employeeId && a.date === todayStr);

  if (record) {
    record.checkOut = nowTimeStr;
    if (totalHours) record.totalHours = Number(totalHours);
  }

  writeDatabase(db);
  res.json({ success: true, record });
});

app.post('/api/attendance/regularize', (req, res) => {
  const { recordId, reason } = req.body;
  const db = readDatabase();

  const record = db.attendance.find((a) => a.id === recordId);
  if (record) {
    record.regularizationStatus = 'Requested';
    record.regularizationReason = reason;
    writeDatabase(db);
  }

  res.json({ success: true, record });
});

// =========================================================================
// 5. LEAVES & MANAGER APPROVALS QUEUE
// =========================================================================
app.get('/api/leaves', (req, res) => {
  const db = readDatabase();
  const requesterId = req.query.requesterId;
  const role = req.query.role || 'EMPLOYEE';

  const downlineIds = requesterId ? getDownlineIds(db.employees, requesterId) : [];

  let visibleRequests = db.leaveRequests;
  if (role !== 'FOUNDER' && role !== 'HR_ADMIN' && requesterId) {
    // Senior only receives approval queue for junior downline reports
    visibleRequests = db.leaveRequests.filter(
      (r) => r.employeeId === requesterId || downlineIds.includes(r.employeeId)
    );
  }

  res.json({
    balances: db.leaveBalances,
    requests: visibleRequests,
    downlineIds,
  });
});

app.post('/api/leaves/apply', (req, res) => {
  const db = readDatabase();
  const payload = req.body;

  const newRequest = {
    ...payload,
    id: `lr-${Date.now()}`,
    status: 'Pending',
    appliedOn: new Date().toISOString().split('T')[0],
  };

  db.leaveRequests.unshift(newRequest);
  writeDatabase(db);
  res.status(201).json({ success: true, request: newRequest });
});

app.put('/api/leaves/:id/approve', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const { comments } = req.body;

  const target = db.leaveRequests.find((r) => r.id === id);
  if (!target) return res.status(404).json({ error: 'Leave request not found' });

  target.status = 'Approved';
  target.approverComments = comments || 'Approved via PeopleOS Backend.';

  // Deduct from balance
  const empBalance = db.leaveBalances[target.employeeId] || {
    CL: { total: 12, used: 0, remaining: 12 },
    SL: { total: 10, used: 0, remaining: 10 },
    PL: { total: 15, used: 0, remaining: 15 },
  };

  const lType = target.leaveType;
  if (empBalance[lType]) {
    empBalance[lType].used += target.days;
    empBalance[lType].remaining = Math.max(0, empBalance[lType].total - empBalance[lType].used);
  }

  db.leaveBalances[target.employeeId] = empBalance;
  writeDatabase(db);

  res.json({ success: true, request: target, balance: empBalance });
});

app.put('/api/leaves/:id/reject', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const { comments } = req.body;

  const target = db.leaveRequests.find((r) => r.id === id);
  if (!target) return res.status(404).json({ error: 'Leave request not found' });

  target.status = 'Rejected';
  target.approverComments = comments || 'Request declined.';

  writeDatabase(db);
  res.json({ success: true, request: target });
});

// =========================================================================
// 6. PERFORMANCE (GOALS & KUDOS)
// =========================================================================
app.get('/api/performance/goals', (req, res) => {
  const db = readDatabase();
  res.json({ goals: db.goals });
});

app.post('/api/performance/goals', (req, res) => {
  const db = readDatabase();
  const newGoal = {
    ...req.body,
    id: `g-${Date.now()}`,
    progress: Number(req.body.progress || 0),
    status: 'In Progress',
  };
  db.goals.unshift(newGoal);
  writeDatabase(db);
  res.status(201).json({ success: true, goal: newGoal });
});

app.put('/api/performance/goals/:id', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const goal = db.goals.find((g) => g.id === id);

  if (goal) {
    if (req.body.progress !== undefined) {
      goal.progress = req.body.progress;
      goal.status = goal.progress >= 100 ? 'Completed' : goal.progress < 30 ? 'At Risk' : 'In Progress';
    }
    writeDatabase(db);
  }

  res.json({ success: true, goal });
});

app.get('/api/performance/kudos', (req, res) => {
  const db = readDatabase();
  res.json({ kudos: db.kudos });
});

app.post('/api/performance/kudos', (req, res) => {
  const db = readDatabase();
  const newKudos = {
    ...req.body,
    id: `k-${Date.now()}`,
    timestamp: 'Just now',
    likes: 1,
    likedBy: [req.body.fromEmployeeId],
  };
  db.kudos.unshift(newKudos);
  writeDatabase(db);
  res.status(201).json({ success: true, kudos: newKudos });
});

app.post('/api/performance/kudos/:id/like', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const { employeeId } = req.body;

  const item = db.kudos.find((k) => k.id === id);
  if (item && employeeId) {
    const hasLiked = item.likedBy.includes(employeeId);
    if (hasLiked) {
      item.likedBy = item.likedBy.filter((uid) => uid !== employeeId);
      item.likes = Math.max(0, item.likes - 1);
    } else {
      item.likedBy.push(employeeId);
      item.likes += 1;
    }
    writeDatabase(db);
  }

  res.json({ success: true, kudos: item });
});

// =========================================================================
// 7. HR HELPDESK & CASES
// =========================================================================
app.get('/api/tickets', (req, res) => {
  const db = readDatabase();
  res.json({ tickets: db.tickets });
});

app.post('/api/tickets', (req, res) => {
  const db = readDatabase();
  const newTicket = {
    ...req.body,
    id: `t-${Date.now()}`,
    ticketNumber: `POS-CASE-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Open',
    createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    messages: [
      {
        id: `msg-${Date.now()}`,
        senderId: req.body.employeeId,
        senderName: req.body.employeeName,
        senderRole: 'EMPLOYEE',
        message: req.body.description,
        timestamp: 'Just now',
      },
    ],
  };

  db.tickets.unshift(newTicket);
  writeDatabase(db);
  res.status(201).json({ success: true, ticket: newTicket });
});

app.put('/api/tickets/:id/status', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const { status, resolution } = req.body;

  const ticket = db.tickets.find((t) => t.id === id);
  if (ticket) {
    ticket.status = status;
    if (resolution) ticket.resolution = resolution;
    writeDatabase(db);
  }

  res.json({ success: true, ticket });
});

app.post('/api/tickets/:id/reply', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const { senderId, senderName, senderRole, message } = req.body;

  const ticket = db.tickets.find((t) => t.id === id);
  if (ticket) {
    ticket.messages.push({
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      senderRole,
      message,
      timestamp: 'Just now',
    });
    writeDatabase(db);
  }

  res.json({ success: true, ticket });
});

// =========================================================================
// 8. ONBOARDING & ANALYTICS
// =========================================================================
app.get('/api/onboarding', (req, res) => {
  const db = readDatabase();
  res.json({ tasks: db.onboardingTasks });
});

app.put('/api/onboarding/:id/toggle', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const task = db.onboardingTasks.find((t) => t.id === id);

  if (task) {
    task.isCompleted = !task.isCompleted;
    task.completedAt = task.isCompleted ? new Date().toISOString().split('T')[0] : null;
    writeDatabase(db);
  }

  res.json({ success: true, task });
});

app.post('/api/onboarding', (req, res) => {
  const db = readDatabase();
  const newTask = {
    ...req.body,
    id: `ob-${Date.now()}`,
    isCompleted: false,
  };
  db.onboardingTasks.push(newTask);
  writeDatabase(db);
  res.status(201).json({ success: true, task: newTask });
});

app.get('/api/analytics', (req, res) => {
  const db = readDatabase();
  const totalPayroll = db.employees.reduce((acc, curr) => acc + (curr.salary || 0), 0);
  const presentCount = db.attendance.filter((a) => a.status === 'Present').length;
  const rate = db.attendance.length ? Math.round((presentCount / db.attendance.length) * 100) : 96;

  res.json({
    headcount: db.employees.length,
    departmentsCount: db.departments.length,
    totalPayroll,
    attendanceRate: rate,
    organization: db.organization,
  });
});

// =========================================================================
// 9. PRODUCTION STATIC SERVING FOR SELF-HOSTING
// =========================================================================
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api') && req.method === 'GET') {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      next();
    }
  });
}

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=============================================`);
  console.log(`🚀 PeopleOS API Backend running on port ${PORT}`);
  console.log(`   Database Path: ${path.join(__dirname, 'data/peopleos_db.json')}`);
  console.log(`   REST Endpoints: http://localhost:${PORT}/api/health`);
  console.log(`=============================================`);
});
