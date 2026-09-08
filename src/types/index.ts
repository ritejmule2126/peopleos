export type UserRole = 'FOUNDER' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';
export type ThemeMode = 'light' | 'dark';

export type EmploymentStatus = 'Active' | 'On Leave' | 'Probation' | 'Remote' | 'Terminated';
export type EmploymentType = 'Full Time' | 'Part Time' | 'Contract' | 'Intern';

export interface Employee {
  id: string;
  employeeId: string; // e.g. ZP-1001
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
  designation: string;
  managerId: string | null;
  managerName: string | null;
  role: UserRole;
  dateOfJoining: string; // YYYY-MM-DD
  workLocation: string;
  employmentType: EmploymentType;
  status: EmploymentStatus;
  salary: number;
  skills: string[];
  bio?: string;
  address?: {
    city: string;
    state: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
  };
}

export interface Department {
  id: string;
  name: string;
  code: string;
  leadId: string;
  leadName: string;
  description: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Half-day' | 'On Leave' | 'Holiday' | 'Late';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // e.g. "09:05 AM"
  checkOut: string | null; // e.g. "06:15 PM"
  totalHours: number; // e.g. 8.5
  breakMinutes: number; // e.g. 45
  status: AttendanceStatus;
  regularizationStatus?: 'None' | 'Requested' | 'Approved' | 'Rejected';
  regularizationReason?: string;
}

export type LeaveTypeCode = 'CL' | 'SL' | 'PL' | 'ML' | 'UL';

export interface LeaveTypeInfo {
  code: LeaveTypeCode;
  name: string;
  totalPerYear: number;
  color: string;
  bgLight: string;
}

export interface LeaveBalance {
  employeeId: string;
  CL: { total: number; used: number; remaining: number }; // Casual Leave
  SL: { total: number; used: number; remaining: number }; // Sick Leave
  PL: { total: number; used: number; remaining: number }; // Privilege / Earned
  ML: { total: number; used: number; remaining: number }; // Maternity / Paternity
  UL: { total: number; used: number; remaining: number }; // Unpaid
}

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveTypeCode;
  fromDate: string;
  toDate: string;
  days: number;
  isHalfDay: boolean;
  halfDaySession?: 'First Half' | 'Second Half';
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  approverId?: string;
  approverName?: string;
  approverComments?: string;
}

export interface Goal {
  id: string;
  employeeId: string;
  title: string;
  category: 'Strategic' | 'Operational' | 'Skill' | 'Project';
  description: string;
  progress: number; // 0 - 100
  targetDate: string;
  status: 'In Progress' | 'Completed' | 'At Risk' | 'Deferred';
  weightage: number; // %
}

export interface Appraisal {
  id: string;
  employeeId: string;
  cycle: string; // e.g. "Annual Review 2026"
  selfRating: number; // 1-5
  selfFeedback: string;
  managerRating: number | null; // 1-5
  managerFeedback: string | null;
  status: 'Draft' | 'Submitted' | 'Manager Review' | 'Completed';
  submittedDate: string;
}

export type KudosBadge = 'Innovator' | 'Team Player' | 'Problem Solver' | 'Superstar' | 'Customer Champion' | 'Rockstar Mentor';

export interface Kudos {
  id: string;
  fromEmployeeId: string;
  fromEmployeeName: string;
  fromAvatar: string;
  toEmployeeId: string;
  toEmployeeName: string;
  toAvatar: string;
  badge: KudosBadge;
  message: string;
  timestamp: string;
  likes: number;
  likedBy: string[]; // employee ids
}

export type TicketPriority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string; // e.g. ZP-CASE-2041
  employeeId: string;
  employeeName: string;
  department: string;
  category: 'Payroll & Compensation' | 'IT & Equipment' | 'Leaves & Attendance' | 'HR Policies' | 'Benefits & Insurance';
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  assignedToName?: string;
  resolution?: string;
  messages: TicketMessage[];
}

export interface OnboardingTask {
  id: string;
  employeeId: string;
  title: string;
  category: 'Documents' | 'IT & Hardware' | 'Orientation' | 'Compliance';
  dueDate: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface CompanyHoliday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  day: string;
  isOptional: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'leave' | 'attendance' | 'kudos' | 'ticket' | 'system';
  targetModule?: string;
}

export interface UserAccount {
  id: string;
  employeeId: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  fullName: string;
  avatar: string;
  companyName: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  trustedDevices?: string[];
}

export interface RegisterCompanyPayload {
  companyName: string;
  domain: string;
  founderName: string;
  workEmail: string;
  password: string;
  timezone: string;
  teamSize: string;
}
