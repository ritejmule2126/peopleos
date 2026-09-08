import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  LeaveBalance,
  Goal,
  Kudos,
  Ticket,
  OnboardingTask,
  UserAccount,
  RegisterCompanyPayload,
  UserRole,
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errMsg = `Request failed: ${res.status} ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson?.error) errMsg = errorJson.error;
      } catch {
        // use default error message
      }
      throw new Error(errMsg);
    }

    return await res.json();
  } catch (err: any) {
    console.warn(`[PeopleOS API] Error calling ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // 1. System Health
  async getHealth() {
    return request<{ status: string; product: string; version: string }>('/health');
  },

  async resetDatabase() {
    return request<{ success: boolean; message: string; db: any }>('/system/reset', {
      method: 'POST',
    });
  },

  // 2. Auth & Accounts
  async register(payload: RegisterCompanyPayload) {
    return request<{
      success: boolean;
      account: UserAccount;
      employee: Employee;
      token: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(email: string, passwordHash: string, deviceToken?: string | null) {
    return request<{
      success: boolean;
      requires2FA?: boolean;
      tempToken?: string;
      email?: string;
      fullName?: string;
      role?: UserRole;
      avatar?: string;
      employeeId?: string;
      twoFactorSecret?: string;
      otpauthUrl?: string;
      currentTotpHint?: string;
      message?: string;
      account?: UserAccount;
      employee?: Employee;
      token?: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: passwordHash, deviceToken }),
    });
  },

  async verify2FA(payload: {
    email: string;
    code: string;
    tempToken?: string;
    trustDevice?: boolean;
  }) {
    return request<{
      success: boolean;
      account: UserAccount;
      employee: Employee;
      token: string;
      deviceToken?: string;
    }>('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async setup2FA(email: string) {
    return request<{
      success: boolean;
      twoFactorSecret: string;
      otpauthUrl: string;
      currentTotpHint: string;
    }>('/auth/2fa/setup', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // 3. Employees
  async getEmployees() {
    return request<{ employees: Employee[]; departments: any[] }>('/employees');
  },

  async createEmployee(empData: Partial<Employee>) {
    return request<{ success: boolean; employee: Employee }>('/employees', {
      method: 'POST',
      body: JSON.stringify(empData),
    });
  },

  async updateEmployee(id: string, empData: Partial<Employee>) {
    return request<{ success: boolean; employee: Employee }>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(empData),
    });
  },

  async deleteEmployee(id: string) {
    return request<{ success: boolean; message: string }>(`/employees/${id}`, {
      method: 'DELETE',
    });
  },

  // 4. Attendance & Live Punch
  async getAttendance(requesterId?: string, role?: UserRole) {
    const params = new URLSearchParams();
    if (requesterId) params.append('requesterId', requesterId);
    if (role) params.append('role', role);
    const query = params.toString() ? `?${params.toString()}` : '';

    return request<{
      attendance: AttendanceRecord[];
      downlineSubordinates: string[];
      canViewAll: boolean;
    }>(`/attendance${query}`);
  },

  async punchIn(employeeId: string) {
    return request<{ success: boolean; record: AttendanceRecord }>('/attendance/punch-in', {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
    });
  },

  async punchOut(employeeId: string, totalHours?: number) {
    return request<{ success: boolean; record: AttendanceRecord }>('/attendance/punch-out', {
      method: 'POST',
      body: JSON.stringify({ employeeId, totalHours }),
    });
  },

  async regularizeAttendance(recordId: string, reason: string) {
    return request<{ success: boolean; record: AttendanceRecord }>('/attendance/regularize', {
      method: 'POST',
      body: JSON.stringify({ recordId, reason }),
    });
  },

  // 5. Leaves
  async getLeaves(requesterId?: string, role?: UserRole) {
    const params = new URLSearchParams();
    if (requesterId) params.append('requesterId', requesterId);
    if (role) params.append('role', role);
    const query = params.toString() ? `?${params.toString()}` : '';

    return request<{
      balances: Record<string, LeaveBalance>;
      requests: LeaveRequest[];
      downlineIds: string[];
    }>(`/leaves${query}`);
  },

  async applyLeave(payload: Partial<LeaveRequest>) {
    return request<{ success: boolean; request: LeaveRequest }>('/leaves/apply', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async approveLeave(leaveId: string, comments?: string) {
    return request<{
      success: boolean;
      request: LeaveRequest;
      balance: LeaveBalance;
    }>(`/leaves/${leaveId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ comments }),
    });
  },

  async rejectLeave(leaveId: string, comments?: string) {
    return request<{ success: boolean; request: LeaveRequest }>(`/leaves/${leaveId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ comments }),
    });
  },

  // 6. Goals & Kudos
  async getGoals() {
    return request<{ goals: Goal[] }>('/performance/goals');
  },

  async createGoal(goal: Partial<Goal>) {
    return request<{ success: boolean; goal: Goal }>('/performance/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  },

  async updateGoal(id: string, progress: number) {
    return request<{ success: boolean; goal: Goal }>(`/performance/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    });
  },

  async getKudos() {
    return request<{ kudos: Kudos[] }>('/performance/kudos');
  },

  async giveKudos(kudos: Partial<Kudos>) {
    return request<{ success: boolean; kudos: Kudos }>('/performance/kudos', {
      method: 'POST',
      body: JSON.stringify(kudos),
    });
  },

  async likeKudos(kudosId: string, employeeId: string) {
    return request<{ success: boolean; kudos: Kudos }>(`/performance/kudos/${kudosId}/like`, {
      method: 'POST',
      body: JSON.stringify({ employeeId }),
    });
  },

  // 7. HR Helpdesk
  async getTickets() {
    return request<{ tickets: Ticket[] }>('/tickets');
  },

  async createTicket(ticket: Partial<Ticket>) {
    return request<{ success: boolean; ticket: Ticket }>('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticket),
    });
  },

  async updateTicketStatus(ticketId: string, status: Ticket['status'], resolution?: string) {
    return request<{ success: boolean; ticket: Ticket }>(`/tickets/${ticketId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, resolution }),
    });
  },

  async replyTicket(ticketId: string, reply: {
    senderId: string;
    senderName: string;
    senderRole: string;
    message: string;
  }) {
    return request<{ success: boolean; ticket: Ticket }>(`/tickets/${ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify(reply),
    });
  },

  // 8. Onboarding
  async getOnboardingTasks() {
    return request<{ tasks: OnboardingTask[] }>('/onboarding');
  },

  async toggleOnboardingTask(taskId: string) {
    return request<{ success: boolean; task: OnboardingTask }>(`/onboarding/${taskId}/toggle`, {
      method: 'PUT',
    });
  },

  async addOnboardingTask(task: Partial<OnboardingTask>) {
    return request<{ success: boolean; task: OnboardingTask }>('/onboarding', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  // 9. Analytics
  async getAnalytics() {
    return request<{
      headcount: number;
      departmentsCount: number;
      totalPayroll: number;
      attendanceRate: number;
      organization: any;
    }>('/analytics');
  },
};
