// Demo Mode Interceptor — Returns mock API responses when no backend is available
// Activated automatically on Vercel or when VITE_DEMO_MODE=true

const DEMO_TENANT_ID = 'tenant-acme';

const DEMO_USER = {
  id: 'usr-founder-001',
  tenant_id: DEMO_TENANT_ID,
  tenant_name: 'Acme Corp',
  tenant_slug: 'acme',
  email: 'founder@acme.io',
  status: 'active',
  presence_status: 'online',
  roles: ['founder', 'admin'],
  permissions: ['*'],
};

const DEMO_EMPLOYEES = [
  {
    id: 'emp-001',
    tenant_id: DEMO_TENANT_ID,
    user_id: 'usr-founder-001',
    employee_code: 'EMP-0104',
    first_name: 'Marcus',
    last_name: 'Vance',
    work_email: 'founder@acme.io',
    department_name: 'Core Platform Engineering',
    designation_title: 'CEO & Founder',
    date_of_joining: '2024-03-15',
    employment_type: 'full_time',
    status: 'active',
    hourly_cost_rate: 150,
    effective_from: '2024-03-15',
    effective_to: '9999-12-31',
    created_at: '2024-03-15T00:00:00Z',
  },
  {
    id: 'emp-002',
    tenant_id: DEMO_TENANT_ID,
    user_id: 'usr-hr-001',
    employee_code: 'EMP-0201',
    first_name: 'Priya',
    last_name: 'Sharma',
    work_email: 'priya@acme.io',
    department_name: 'Human Resources',
    designation_title: 'VP People & Culture',
    manager_id: 'emp-001',
    manager_name: 'Marcus Vance',
    date_of_joining: '2024-04-01',
    employment_type: 'full_time',
    status: 'active',
    hourly_cost_rate: 95,
    effective_from: '2024-04-01',
    effective_to: '9999-12-31',
    created_at: '2024-04-01T00:00:00Z',
  },
  {
    id: 'emp-003',
    tenant_id: DEMO_TENANT_ID,
    employee_code: 'EMP-0302',
    first_name: 'Arjun',
    last_name: 'Mehta',
    work_email: 'arjun@acme.io',
    department_name: 'Product Engineering',
    designation_title: 'Senior Software Engineer',
    manager_id: 'emp-001',
    manager_name: 'Marcus Vance',
    date_of_joining: '2024-06-10',
    employment_type: 'full_time',
    status: 'active',
    hourly_cost_rate: 85,
    effective_from: '2024-06-10',
    effective_to: '9999-12-31',
    created_at: '2024-06-10T00:00:00Z',
  },
  {
    id: 'emp-004',
    tenant_id: DEMO_TENANT_ID,
    employee_code: 'EMP-0405',
    first_name: 'Sarah',
    last_name: 'Chen',
    work_email: 'sarah@acme.io',
    department_name: 'Design',
    designation_title: 'Lead Product Designer',
    manager_id: 'emp-001',
    manager_name: 'Marcus Vance',
    date_of_joining: '2024-07-22',
    employment_type: 'full_time',
    status: 'active',
    hourly_cost_rate: 80,
    effective_from: '2024-07-22',
    effective_to: '9999-12-31',
    created_at: '2024-07-22T00:00:00Z',
  },
  {
    id: 'emp-005',
    tenant_id: DEMO_TENANT_ID,
    employee_code: 'EMP-0510',
    first_name: 'Vikram',
    last_name: 'Patel',
    work_email: 'vikram@acme.io',
    department_name: 'DevOps',
    designation_title: 'Site Reliability Engineer',
    manager_id: 'emp-003',
    manager_name: 'Arjun Mehta',
    date_of_joining: '2024-09-01',
    employment_type: 'full_time',
    status: 'active',
    hourly_cost_rate: 75,
    effective_from: '2024-09-01',
    effective_to: '9999-12-31',
    created_at: '2024-09-01T00:00:00Z',
  },
  {
    id: 'emp-006',
    tenant_id: DEMO_TENANT_ID,
    employee_code: 'EMP-0612',
    first_name: 'Neha',
    last_name: 'Gupta',
    work_email: 'neha@acme.io',
    department_name: 'QA & Testing',
    designation_title: 'Quality Assurance Lead',
    manager_id: 'emp-002',
    manager_name: 'Priya Sharma',
    date_of_joining: '2025-01-15',
    employment_type: 'full_time',
    status: 'active',
    hourly_cost_rate: 70,
    effective_from: '2025-01-15',
    effective_to: '9999-12-31',
    created_at: '2025-01-15T00:00:00Z',
  },
];

const now = new Date().toISOString();
const today = new Date().toISOString().split('T')[0];

const DEMO_ATTENDANCE_SUMMARY = {
  punched_in: true,
  last_punch_type: 'in',
  last_punch_time: new Date(Date.now() - 3 * 3600000).toISOString(),
  today_hours: 5.2,
  total_work_minutes: 312,
  active_breaks_count: 1,
  expected_work_minutes: 480,
};

const DEMO_ATTENDANCE_SESSION = {
  employee_id: 'emp-001',
  current_state: 'working' as const,
  shift: {
    id: 'shift-general',
    tenant_id: DEMO_TENANT_ID,
    name: 'General Shift',
    start_time: '09:00',
    end_time: '18:00',
    grace_minutes: 15,
    half_day_hours: 4,
    full_day_hours: 8,
    is_night_shift: false,
    night_shift_allowance: 0,
    created_at: now,
  },
  first_punch_in: new Date(Date.now() - 5 * 3600000).toISOString(),
  last_punch_time: new Date(Date.now() - 3 * 3600000).toISOString(),
  last_punch_type: 'in',
  active_work_seconds: 18720,
  break_seconds: 1800,
  is_late_in: false,
  today_punches: [],
};

const DEMO_TEAM_RADAR = DEMO_EMPLOYEES.slice(1).map((emp) => ({
  employee_id: emp.id,
  employee_code: emp.employee_code,
  first_name: emp.first_name,
  last_name: emp.last_name,
  work_email: emp.work_email,
  department_name: emp.department_name,
  presence_status: (['working', 'working', 'on_break', 'working', 'on_leave'] as const)[
    DEMO_EMPLOYEES.indexOf(emp) - 1
  ] || 'working',
  first_punch_in: new Date(Date.now() - 6 * 3600000).toISOString(),
  last_punch_time: new Date(Date.now() - 1 * 3600000).toISOString(),
  active_work_seconds: 21600,
  shift_name: 'General Shift',
}));

const DEMO_LEAVE_TYPES = [
  { id: 'lt-casual', tenant_id: DEMO_TENANT_ID, name: 'Casual Leave', code: 'CL', annual_quota: 12, accrual_frequency: 'monthly', is_carry_forward: false, max_carry_forward: 0, is_sandwich_rule_enabled: false },
  { id: 'lt-sick', tenant_id: DEMO_TENANT_ID, name: 'Sick Leave', code: 'SL', annual_quota: 8, accrual_frequency: 'monthly', is_carry_forward: true, max_carry_forward: 5, is_sandwich_rule_enabled: false },
  { id: 'lt-earned', tenant_id: DEMO_TENANT_ID, name: 'Earned Leave', code: 'EL', annual_quota: 15, accrual_frequency: 'monthly', is_carry_forward: true, max_carry_forward: 30, is_sandwich_rule_enabled: true },
  { id: 'lt-comp', tenant_id: DEMO_TENANT_ID, name: 'Comp Off', code: 'CO', annual_quota: 0, accrual_frequency: 'manual', is_carry_forward: false, max_carry_forward: 0, is_sandwich_rule_enabled: false },
];

const DEMO_LEAVE_BALANCES = [
  { id: 'lb-1', tenant_id: DEMO_TENANT_ID, employee_id: 'emp-001', leave_type_id: 'lt-casual', leave_type_name: 'Casual Leave', leave_type_code: 'CL', balance: 8, credited: 12, used: 4, year: 2026 },
  { id: 'lb-2', tenant_id: DEMO_TENANT_ID, employee_id: 'emp-001', leave_type_id: 'lt-sick', leave_type_name: 'Sick Leave', leave_type_code: 'SL', balance: 6, credited: 8, used: 2, year: 2026 },
  { id: 'lb-3', tenant_id: DEMO_TENANT_ID, employee_id: 'emp-001', leave_type_id: 'lt-earned', leave_type_name: 'Earned Leave', leave_type_code: 'EL', balance: 12, credited: 15, used: 3, year: 2026 },
];

const DEMO_MY_LEAVES = [
  { id: 'lr-1', tenant_id: DEMO_TENANT_ID, employee_id: 'emp-001', employee_name: 'Marcus Vance', leave_type_id: 'lt-casual', leave_type_name: 'Casual Leave', from_date: '2026-09-10', to_date: '2026-09-10', total_days: 1, sandwich_days_added: 0, reason: 'Personal work', status: 'approved' as const, current_approval_level: 1, created_at: '2026-09-05T10:00:00Z' },
  { id: 'lr-2', tenant_id: DEMO_TENANT_ID, employee_id: 'emp-001', employee_name: 'Marcus Vance', leave_type_id: 'lt-earned', leave_type_name: 'Earned Leave', from_date: '2026-10-14', to_date: '2026-10-18', total_days: 5, sandwich_days_added: 2, reason: 'Family vacation — Diwali', status: 'pending' as const, current_approval_level: 0, created_at: '2026-09-20T08:30:00Z' },
];

const DEMO_COMPANY_LEAVES = [
  ...DEMO_MY_LEAVES,
  { id: 'lr-3', tenant_id: DEMO_TENANT_ID, employee_id: 'emp-003', employee_name: 'Arjun Mehta', leave_type_id: 'lt-sick', leave_type_name: 'Sick Leave', from_date: '2026-09-25', to_date: '2026-09-26', total_days: 2, sandwich_days_added: 0, reason: 'Unwell — fever', status: 'pending' as const, current_approval_level: 0, created_at: '2026-09-22T07:00:00Z' },
  { id: 'lr-4', tenant_id: DEMO_TENANT_ID, employee_id: 'emp-004', employee_name: 'Sarah Chen', leave_type_id: 'lt-casual', leave_type_name: 'Casual Leave', from_date: '2026-09-29', to_date: '2026-09-30', total_days: 2, sandwich_days_added: 0, reason: 'Design conference in Mumbai', status: 'approved' as const, current_approval_level: 1, created_at: '2026-09-18T14:00:00Z' },
];

const DEMO_SHIFTS = [
  { id: 'shift-general', tenant_id: DEMO_TENANT_ID, name: 'General Shift', start_time: '09:00', end_time: '18:00', grace_minutes: 15, half_day_hours: 4, full_day_hours: 8, is_night_shift: false, night_shift_allowance: 0, created_at: now },
  { id: 'shift-flex', tenant_id: DEMO_TENANT_ID, name: 'Flex Hours', start_time: '10:00', end_time: '19:00', grace_minutes: 30, half_day_hours: 4, full_day_hours: 8, is_night_shift: false, night_shift_allowance: 0, created_at: now },
  { id: 'shift-night', tenant_id: DEMO_TENANT_ID, name: 'Night Ops', start_time: '22:00', end_time: '06:00', grace_minutes: 10, half_day_hours: 4, full_day_hours: 8, is_night_shift: true, night_shift_allowance: 500, created_at: now },
];

const DEMO_PROJECTS = [
  { id: 'proj-1', tenant_id: DEMO_TENANT_ID, key: 'POS', name: 'PeopleOS Core Platform', lead_id: 'emp-001', lead_name: 'Marcus Vance', workflow_id: 'wf-1', workflow_name: 'Standard Scrum', project_type: 'scrum' as const, last_issue_number: 142, created_at: '2024-05-01T00:00:00Z' },
  { id: 'proj-2', tenant_id: DEMO_TENANT_ID, key: 'MOB', name: 'Mobile App', lead_id: 'emp-003', lead_name: 'Arjun Mehta', workflow_id: 'wf-1', workflow_name: 'Standard Scrum', project_type: 'scrum' as const, last_issue_number: 67, created_at: '2024-08-15T00:00:00Z' },
  { id: 'proj-3', tenant_id: DEMO_TENANT_ID, key: 'INF', name: 'Infrastructure & DevOps', lead_id: 'emp-005', lead_name: 'Vikram Patel', workflow_id: 'wf-2', workflow_name: 'Kanban Flow', project_type: 'kanban' as const, last_issue_number: 38, created_at: '2024-11-01T00:00:00Z' },
];

const DEMO_MY_WORKDAY = {
  employee_id: 'emp-001',
  employee_name: 'Marcus Vance',
  work_email: 'founder@acme.io',
  department: 'Core Platform Engineering',
  designation: 'CEO & Founder',
  punched_in: true,
  last_punch_time: new Date(Date.now() - 3 * 3600000).toISOString(),
  today_hours: 5.2,
  reconciliation: {
    clocked_hours: 5.2,
    logged_hours: 4.5,
    variance_hours: 0.7,
    sync_percentage: 86.5,
    status_indicator: 'fair',
  },
  focus_tasks: [
    { id: 'issue-1', project_id: 'proj-1', project_key: 'POS', issue_key: 'POS-138', title: 'Implement RBAC for Founder Console', issue_type: 'story', status_id: 'st-in-progress', status_name: 'In Progress', status_category: 'in_progress', priority: 'high', story_points: 8, original_estimate_seconds: 28800, remaining_estimate_seconds: 14400 },
    { id: 'issue-2', project_id: 'proj-1', project_key: 'POS', issue_key: 'POS-141', title: 'Approval Workflow Engine — Multi-Level Chains', issue_type: 'task', status_id: 'st-todo', status_name: 'To Do', status_category: 'todo', priority: 'medium', story_points: 5, original_estimate_seconds: 18000, remaining_estimate_seconds: 18000 },
  ],
  today_worklogs: [
    { id: 'wl-1', issue_id: 'issue-1', issue_key: 'POS-138', issue_title: 'Implement RBAC for Founder Console', time_spent_seconds: 10800, started_at: new Date(Date.now() - 5 * 3600000).toISOString(), description: 'Built role guard component and auth middleware', is_billable: true },
    { id: 'wl-2', issue_id: 'issue-2', issue_key: 'POS-141', issue_title: 'Approval Workflow Engine', time_spent_seconds: 5400, started_at: new Date(Date.now() - 2 * 3600000).toISOString(), description: 'Design review for multi-level approval chains', is_billable: true },
  ],
  leave_balances: [
    { leave_type_id: 'lt-casual', leave_type_name: 'Casual Leave', leave_type_code: 'CL', balance: 8, used: 4, credited: 12 },
    { leave_type_id: 'lt-sick', leave_type_name: 'Sick Leave', leave_type_code: 'SL', balance: 6, used: 2, credited: 8 },
    { leave_type_id: 'lt-earned', leave_type_name: 'Earned Leave', leave_type_code: 'EL', balance: 12, used: 3, credited: 15 },
  ],
};

const DEMO_REGULARIZATIONS = [
  { id: 'reg-1', tenant_id: DEMO_TENANT_ID, employee_id: 'emp-003', employee_name: 'Arjun Mehta', employee_code: 'EMP-0302', request_type: 'missed_punch' as const, request_date: '2026-09-19', requested_punch_in: '09:15', requested_punch_out: '18:30', reason: 'Forgot to punch out — was in a client call', status: 'pending' as const, created_at: '2026-09-20T09:00:00Z' },
  { id: 'reg-2', tenant_id: DEMO_TENANT_ID, employee_id: 'emp-005', employee_name: 'Vikram Patel', employee_code: 'EMP-0510', request_type: 'wfh' as const, request_date: '2026-09-18', requested_punch_in: '10:00', requested_punch_out: '19:00', reason: 'Work from home — ISP maintenance at office', status: 'approved' as const, approved_by: 'emp-001', approver_name: 'Marcus Vance', created_at: '2026-09-18T08:00:00Z' },
];

// Route map for demo API responses
const demoRoutes: Record<string, (body?: any) => any> = {
  'POST:/auth/login': (body: any) => ({
    access_token: 'demo_access_token_' + Date.now(),
    refresh_token: 'demo_refresh_token_' + Date.now(),
    user: DEMO_USER,
  }),
  'GET:/auth/me': () => DEMO_USER,
  'PUT:/auth/presence': () => ({ status: 'online' }),

  // HRMS
  'GET:/hrms/attendance/summary': () => DEMO_ATTENDANCE_SUMMARY,
  'GET:/hrms/attendance/session': () => DEMO_ATTENDANCE_SESSION,
  'POST:/hrms/attendance/punch': () => ({ ...DEMO_ATTENDANCE_SUMMARY, last_punch_type: 'in', last_punch_time: now }),
  'GET:/hrms/attendance/team-radar': () => DEMO_TEAM_RADAR,
  'GET:/hrms/employees': () => DEMO_EMPLOYEES,
  'GET:/hrms/org-tree': () => [{
    employee: DEMO_EMPLOYEES[0],
    subordinates: DEMO_EMPLOYEES.slice(1, 3).map(e => ({ employee: e, subordinates: [] })),
  }],
  'GET:/hrms/shifts': () => DEMO_SHIFTS,
  'GET:/hrms/shift-rosters': () => DEMO_EMPLOYEES.map(e => ({
    employee_id: e.id,
    employee_code: e.employee_code,
    first_name: e.first_name,
    last_name: e.last_name,
    work_email: e.work_email,
    department_name: e.department_name,
    shift_id: 'shift-general',
    shift_name: 'General Shift',
    start_time: '09:00',
    end_time: '18:00',
    grace_minutes: 15,
    effective_date: '2024-04-01',
  })),
  'GET:/hrms/regularizations/my': () => [],
  'GET:/hrms/regularizations/team': () => DEMO_REGULARIZATIONS,
  'GET:/hrms/leave-types': () => DEMO_LEAVE_TYPES,
  'GET:/hrms/leave-balances': () => DEMO_LEAVE_BALANCES,
  'GET:/hrms/leaves/my': () => DEMO_MY_LEAVES,
  'GET:/hrms/leaves/company': () => DEMO_COMPANY_LEAVES,
  'GET:/hrms/profile/me': () => ({
    employee: DEMO_EMPLOYEES[0],
    personal_details: { dob: '1990-05-14', gender: 'Male', blood_group: 'O+', marital_status: 'Married', current_address: '45, Whitefield Main Road, Bengaluru 560066', permanent_address: '12, MG Road, Pune 411001' },
    emergency_contacts: [{ name: 'Elena Vance', relationship: 'Spouse', phone: '+91 98765 43210', email: 'elena@email.com' }],
    bank_details: { bank_name: 'HDFC Bank Ltd', account_number_masked: '•••• •••• 8842', routing_number: 'HDFC0001248', tax_id_masked: '•••••1234F', direct_deposit: true },
    education_history: [{ degree: 'B.Tech Computer Science', institution: 'IIT Bombay', year: 2012, grade: '8.9 CGPA' }, { degree: 'MS Software Engineering', institution: 'Stanford University', year: 2014, grade: '3.9 GPA' }],
    experience_history: [{ company: 'Google', role: 'Senior Software Engineer', period: '2014-2020', summary: 'Worked on Google Cloud Platform infrastructure' }, { company: 'Stripe', role: 'Engineering Manager', period: '2020-2024', summary: 'Led payments infrastructure team' }],
    skills: ['Go', 'TypeScript', 'React', 'PostgreSQL', 'Kubernetes', 'System Design', 'Team Leadership'],
    assigned_assets: [{ asset_name: 'MacBook Pro 16" M3 Max', category: 'Laptop', serial: 'C02ZP1ABCD', assigned_date: '2024-03-15' }, { asset_name: 'Dell UltraSharp 34"', category: 'Monitor', serial: 'MNT-8842', assigned_date: '2024-03-15' }],
  }),
  'GET:/hrms/onboarding/pipeline': () => [
    { id: 'cand-1', tenant_id: DEMO_TENANT_ID, first_name: 'Rahul', last_name: 'Joshi', personal_email: 'rahul.joshi@gmail.com', phone: '+91 87654 32109', department_name: 'Product Engineering', designation_title: 'Backend Developer', manager_name: 'Arjun Mehta', expected_joining_date: '2026-10-01', employment_type: 'full_time', hourly_cost_rate: 65, invite_token: 'tok-demo-1', status: 'in_progress', created_at: '2026-09-15T10:00:00Z' },
    { id: 'cand-2', tenant_id: DEMO_TENANT_ID, first_name: 'Ananya', last_name: 'Reddy', personal_email: 'ananya.r@outlook.com', department_name: 'Design', designation_title: 'UI/UX Designer', manager_name: 'Sarah Chen', expected_joining_date: '2026-10-15', employment_type: 'full_time', hourly_cost_rate: 55, invite_token: 'tok-demo-2', status: 'invited', created_at: '2026-09-20T14:00:00Z' },
  ],
  'GET:/hrms/company/profile': () => null, // Falls back to DEFAULT_COMPANY_PROFILE in the store
  'GET:/hrms/compensation': () => null, // Falls back to DEFAULT_COMPENSATION in the store

  // Work Management
  'GET:/work/projects': () => DEMO_PROJECTS,
  'GET:/work/kanban': () => ({
    project: DEMO_PROJECTS[0],
    columns: [
      { status_id: 'st-todo', name: 'To Do', category: 'todo', position: 0, issues: [
        { id: 'issue-3', tenant_id: DEMO_TENANT_ID, project_id: 'proj-1', project_key: 'POS', issue_number: 141, issue_key: 'POS-141', title: 'Approval Workflow Engine — Multi-Level Chains', issue_type: 'task', status_id: 'st-todo', status_name: 'To Do', status_category: 'todo', priority: 'medium', assignee_id: 'emp-001', assignee_name: 'Marcus Vance', reporter_id: 'emp-001', reporter_name: 'Marcus Vance', story_points: 5, original_estimate_seconds: 18000, remaining_estimate_seconds: 18000, created_at: now, updated_at: now },
        { id: 'issue-4', tenant_id: DEMO_TENANT_ID, project_id: 'proj-1', project_key: 'POS', issue_number: 142, issue_key: 'POS-142', title: 'Burnout Sentinel Alert Dashboard', issue_type: 'story', status_id: 'st-todo', status_name: 'To Do', status_category: 'todo', priority: 'low', assignee_id: 'emp-004', assignee_name: 'Sarah Chen', reporter_id: 'emp-001', reporter_name: 'Marcus Vance', story_points: 3, original_estimate_seconds: 10800, remaining_estimate_seconds: 10800, created_at: now, updated_at: now },
      ]},
      { status_id: 'st-in-progress', name: 'In Progress', category: 'in_progress', position: 1, issues: [
        { id: 'issue-1', tenant_id: DEMO_TENANT_ID, project_id: 'proj-1', project_key: 'POS', issue_number: 138, issue_key: 'POS-138', title: 'Implement RBAC for Founder Console', issue_type: 'story', status_id: 'st-in-progress', status_name: 'In Progress', status_category: 'in_progress', priority: 'high', assignee_id: 'emp-001', assignee_name: 'Marcus Vance', reporter_id: 'emp-001', reporter_name: 'Marcus Vance', story_points: 8, original_estimate_seconds: 28800, remaining_estimate_seconds: 14400, created_at: now, updated_at: now },
      ]},
      { status_id: 'st-review', name: 'In Review', category: 'in_progress', position: 2, issues: [
        { id: 'issue-5', tenant_id: DEMO_TENANT_ID, project_id: 'proj-1', project_key: 'POS', issue_number: 135, issue_key: 'POS-135', title: 'Biometric Face Enrollment API', issue_type: 'task', status_id: 'st-review', status_name: 'In Review', status_category: 'in_progress', priority: 'high', assignee_id: 'emp-003', assignee_name: 'Arjun Mehta', reporter_id: 'emp-001', reporter_name: 'Marcus Vance', story_points: 5, original_estimate_seconds: 14400, remaining_estimate_seconds: 3600, created_at: now, updated_at: now },
      ]},
      { status_id: 'st-done', name: 'Done', category: 'done', position: 3, issues: [
        { id: 'issue-6', tenant_id: DEMO_TENANT_ID, project_id: 'proj-1', project_key: 'POS', issue_number: 130, issue_key: 'POS-130', title: 'TeamPulse WhatsApp-Grade Chat Engine', issue_type: 'epic', status_id: 'st-done', status_name: 'Done', status_category: 'done', priority: 'highest', assignee_id: 'emp-001', assignee_name: 'Marcus Vance', reporter_id: 'emp-001', reporter_name: 'Marcus Vance', story_points: 13, original_estimate_seconds: 46800, remaining_estimate_seconds: 0, created_at: now, updated_at: now },
      ]},
    ],
  }),

  // Fusion
  'GET:/fusion/my-workday': () => DEMO_MY_WORKDAY,
  'GET:/fusion/team-capacity': () => ({
    total_engineers: 5,
    clocked_in_count: 4,
    on_leave_count: 1,
    overallocated_count: 0,
    available_count: 4,
    members: DEMO_EMPLOYEES.slice(1).map((e, i) => ({
      employee_id: e.id,
      employee_name: `${e.first_name} ${e.last_name}`,
      employee_code: e.employee_code,
      designation_title: e.designation_title || '',
      department_name: e.department_name || '',
      punched_in: i !== 3,
      presence_status: i === 3 ? 'on_leave' : 'working',
      assigned_issue_count: [4, 3, 2, 1, 5][i] || 2,
      total_story_points: [16, 11, 8, 3, 13][i] || 5,
      capacity_status: 'available',
    })),
  }),
};

// Check if demo mode should be active
export function isDemoMode(): boolean {
  // Explicit env var override
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_DEMO_MODE === 'true') {
    return true;
  }
  // Auto-detect: if running on vercel.app domain, activate demo mode
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.endsWith('.vercel.app') || host.endsWith('.vercel.sh')) {
      return true;
    }
  }
  return false;
}

// Resolve a demo response for a given method + endpoint
export function getDemoResponse(method: string, endpoint: string, body?: any): { data: any } | null {
  const key = `${method.toUpperCase()}:${endpoint}`;

  // Exact match
  if (demoRoutes[key]) {
    return { data: demoRoutes[key](body) };
  }

  // Prefix matching for parameterized routes
  for (const routeKey of Object.keys(demoRoutes)) {
    const [routeMethod, routePath] = routeKey.split(':');
    if (routeMethod === method.toUpperCase() && endpoint.startsWith(routePath)) {
      return { data: demoRoutes[routeKey](body) };
    }
  }

  // Default fallback — return empty array or null so the UI doesn't crash
  console.warn(`[DemoMode] Unhandled route: ${key}, returning empty fallback`);
  return { data: endpoint.includes('list') || endpoint.includes('leaves') || endpoint.includes('employees') ? [] : null };
}
