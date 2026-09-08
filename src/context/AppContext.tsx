import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Employee,
  Department,
  UserRole,
  AttendanceRecord,
  LeaveRequest,
  LeaveBalance,
  Goal,
  Kudos,
  Ticket,
  OnboardingTask,
  NotificationItem,
  CompanyHoliday,
  LeaveTypeCode,
  UserAccount,
  RegisterCompanyPayload,
} from '../types';
import {
  INITIAL_EMPLOYEES,
  INITIAL_DEPARTMENTS,
  INITIAL_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_LEAVE_BALANCES,
  getDefaultLeaveBalance,
  INITIAL_GOALS,
  INITIAL_KUDOS,
  INITIAL_TICKETS,
  INITIAL_ONBOARDING_TASKS,
  COMPANY_HOLIDAYS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACCOUNTS,
} from '../data/seedData';
import { api } from '../services/api';

export type NavigationModule =
  | 'dashboard'
  | 'employees'
  | 'attendance'
  | 'leaves'
  | 'performance'
  | 'helpdesk'
  | 'onboarding'
  | 'analytics'
  | 'settings';

export interface LoginResult {
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
}

interface AppContextType {
  // Authentication & Session
  isAuthenticated: boolean;
  currentUserAccount: UserAccount | null;
  login: (email: string, pass: string) => Promise<LoginResult>;
  verify2FA: (payload: { email: string; code: string; tempToken?: string; trustDevice?: boolean }) => Promise<boolean>;
  logout: () => void;
  registerFounder: (payload: RegisterCompanyPayload) => Promise<void>;

  // Roles & Current User
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: Employee;
  switchUser: (employeeId: string) => void;

  // Down-Tree Visibility & Hierarchical Access
  getDownlineEmployeeIds: (managerId: string) => string[];
  canViewEmployeeLogs: (targetEmployeeId: string) => boolean;
  canOnboardEmployees: boolean;

  // Active Navigation
  activeModule: NavigationModule;
  setActiveModule: (module: NavigationModule) => void;

  // Employees & Depts
  employees: Employee[];
  departments: Department[];
  addEmployee: (emp: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, emp: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;

  // Attendance & Live Punch Clock
  attendance: AttendanceRecord[];
  isPunchedIn: boolean;
  isOnBreak: boolean;
  workTimerSeconds: number;
  punchIn: () => Promise<void>;
  punchOut: () => Promise<void>;
  toggleBreak: () => void;
  requestRegularization: (recordId: string, reason: string) => Promise<void>;

  // Leave Management
  leaveRequests: LeaveRequest[];
  leaveBalances: Record<string, LeaveBalance>;
  applyLeave: (req: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>) => Promise<void>;
  approveLeave: (id: string, comments?: string) => Promise<void>;
  rejectLeave: (id: string, comments?: string) => Promise<void>;
  holidays: CompanyHoliday[];

  // Performance & Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoalProgress: (id: string, progress: number) => Promise<void>;
  kudosList: Kudos[];
  giveKudos: (kudos: Omit<Kudos, 'id' | 'timestamp' | 'likes' | 'likedBy'>) => Promise<void>;
  likeKudos: (kudosId: string) => Promise<void>;

  // HR Helpdesk
  tickets: Ticket[];
  createTicket: (ticket: Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt' | 'status' | 'messages'>) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: Ticket['status'], resolution?: string) => Promise<void>;
  addTicketMessage: (ticketId: string, message: string) => Promise<void>;

  // Onboarding
  onboardingTasks: OnboardingTask[];
  toggleOnboardingTask: (taskId: string) => Promise<void>;
  addOnboardingTask: (task: Omit<OnboardingTask, 'id' | 'isCompleted'>) => Promise<void>;

  // Notifications & Global Search
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;

  // Theme Management
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Reset to initial demo data
  resetDemoData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'peopleos_';

function getStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Failed to load ${key} from storage:`, err);
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save ${key} to storage:`, err);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeModule, setActiveModule] = useState<NavigationModule>('dashboard');

  // Accounts & Authentication State
  const [accounts, setAccounts] = useState<UserAccount[]>(() =>
    getStorage('accounts', INITIAL_ACCOUNTS)
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Production default: redirect to login page at start unless active session is explicitly active
    const hasActiveSession = sessionStorage.getItem('peopleos_session_active') === 'true';
    return hasActiveSession && getStorage('is_authenticated', false);
  });
  const [currentUserAccountId, setCurrentUserAccountId] = useState<string | null>(() =>
    getStorage('active_account_id', 'acc-1')
  );

  // Employees & Depts
  const [employees, setEmployees] = useState<Employee[]>(() =>
    getStorage('employees', INITIAL_EMPLOYEES)
  );
  const [departments, setDepartments] = useState<Department[]>(() =>
    getStorage('departments', INITIAL_DEPARTMENTS)
  );

  // Current logged in user ID
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return getStorage('current_user_id', 'emp-1'); // Default Sarah Jenkins (Founder)
  });

  const currentUser = employees.find((e) => e.id === currentUserId) || employees[0];
  const [currentRole, setCurrentRole] = useState<UserRole>(() => currentUser ? currentUser.role : 'FOUNDER');

  const currentUserAccount =
    accounts.find((a) => a.id === currentUserAccountId) || accounts[0] || null;

  // Attendance
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() =>
    getStorage('attendance', INITIAL_ATTENDANCE)
  );
  const [isPunchedIn, setIsPunchedIn] = useState<boolean>(() => getStorage('punched_in', true));
  const [isOnBreak, setIsOnBreak] = useState<boolean>(() => getStorage('on_break', false));
  const [workTimerSeconds, setWorkTimerSeconds] = useState<number>(() =>
    getStorage('work_timer_sec', 24800)
  );

  // Leaves
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() =>
    getStorage('leave_requests', INITIAL_LEAVE_REQUESTS)
  );
  const [leaveBalances, setLeaveBalances] = useState<Record<string, LeaveBalance>>(() =>
    getStorage('leave_balances', INITIAL_LEAVE_BALANCES)
  );
  const holidays = COMPANY_HOLIDAYS;

  // Performance & Goals
  const [goals, setGoals] = useState<Goal[]>(() => getStorage('goals', INITIAL_GOALS));
  const [kudosList, setKudosList] = useState<Kudos[]>(() => getStorage('kudos', INITIAL_KUDOS));

  // Helpdesk
  const [tickets, setTickets] = useState<Ticket[]>(() => getStorage('tickets', INITIAL_TICKETS));

  // Onboarding
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>(() =>
    getStorage('onboarding', INITIAL_ONBOARDING_TASKS)
  );

  // Notifications & Search
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    getStorage('notifications', INITIAL_NOTIFICATIONS)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Theme Management (Default: light)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('peopleos_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('peopleos_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // ==========================================
  // 1. INITIAL BACKEND DATA SYNC
  // ==========================================
  useEffect(() => {
    let isMounted = true;
    const syncWithBackend = async () => {
      try {
        const [empRes, attRes, leavesRes, goalsRes, kudosRes, ticketsRes, obRes] = await Promise.all([
          api.getEmployees().catch(() => null),
          api.getAttendance(currentUserId, currentRole).catch(() => null),
          api.getLeaves(currentUserId, currentRole).catch(() => null),
          api.getGoals().catch(() => null),
          api.getKudos().catch(() => null),
          api.getTickets().catch(() => null),
          api.getOnboardingTasks().catch(() => null),
        ]);

        if (!isMounted) return;

        if (empRes?.employees) {
          setEmployees(empRes.employees);
          setStorage('employees', empRes.employees);
        }
        if (empRes?.departments) {
          setDepartments(empRes.departments);
          setStorage('departments', empRes.departments);
        }
        if (attRes?.attendance) {
          setAttendance(attRes.attendance);
          setStorage('attendance', attRes.attendance);
        }
        if (leavesRes?.requests) {
          setLeaveRequests(leavesRes.requests);
          setStorage('leave_requests', leavesRes.requests);
        }
        if (leavesRes?.balances) {
          setLeaveBalances(leavesRes.balances);
          setStorage('leave_balances', leavesRes.balances);
        }
        if (goalsRes?.goals) {
          setGoals(goalsRes.goals);
          setStorage('goals', goalsRes.goals);
        }
        if (kudosRes?.kudos) {
          setKudosList(kudosRes.kudos);
          setStorage('kudos', kudosRes.kudos);
        }
        if (ticketsRes?.tickets) {
          setTickets(ticketsRes.tickets);
          setStorage('tickets', ticketsRes.tickets);
        }
        if (obRes?.tasks) {
          setOnboardingTasks(obRes.tasks);
          setStorage('onboarding', obRes.tasks);
        }
      } catch (err) {
        console.warn('Initial backend sync error:', err);
      }
    };

    syncWithBackend();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync attendance and leaves when switching active user or role for senior down-tree access
  useEffect(() => {
    let isMounted = true;
    const refreshHierarchyData = async () => {
      try {
        const [attRes, leavesRes] = await Promise.all([
          api.getAttendance(currentUserId, currentRole).catch(() => null),
          api.getLeaves(currentUserId, currentRole).catch(() => null),
        ]);

        if (!isMounted) return;

        if (attRes?.attendance) {
          setAttendance(attRes.attendance);
          setStorage('attendance', attRes.attendance);
        }
        if (leavesRes?.requests) {
          setLeaveRequests(leavesRes.requests);
          setStorage('leave_requests', leavesRes.requests);
        }
      } catch (err) {
        console.warn('Hierarchy scoped sync:', err);
      }
    };

    refreshHierarchyData();

    return () => {
      isMounted = false;
    };
  }, [currentUserId, currentRole]);

  // Live timer tick
  useEffect(() => {
    let interval: any = null;
    if (isPunchedIn && !isOnBreak) {
      interval = setInterval(() => {
        setWorkTimerSeconds((prev) => {
          const next = prev + 1;
          setStorage('work_timer_sec', next);
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPunchedIn, isOnBreak]);

  // ==========================================
  // AUTHENTICATION & FOUNDER ONBOARDING
  // ==========================================
  const login = async (email: string, pass: string): Promise<LoginResult> => {
    try {
      const storedDeviceToken = localStorage.getItem('peopleos_device_token');
      const res = await api.login(email, pass, storedDeviceToken);

      if (res.success) {
        if (res.requires2FA) {
          return {
            success: true,
            requires2FA: true,
            tempToken: res.tempToken,
            email: res.email,
            fullName: res.fullName,
            role: res.role,
            avatar: res.avatar,
            employeeId: res.employeeId,
            twoFactorSecret: res.twoFactorSecret,
            otpauthUrl: res.otpauthUrl,
            currentTotpHint: res.currentTotpHint,
            message: res.message,
          };
        }

        if (res.account) {
          setIsAuthenticated(true);
          sessionStorage.setItem('peopleos_session_active', 'true');
          setCurrentUserAccountId(res.account.id);
          setCurrentUserId(res.account.employeeId);
          setCurrentRole(res.account.role);

          setStorage('is_authenticated', true);
          setStorage('active_account_id', res.account.id);
          setStorage('current_user_id', res.account.employeeId);
          setStorage('role', res.account.role);

          if (res.employee) {
            setEmployees((prev) => {
              const idx = prev.findIndex((e) => e.id === res.employee!.id);
              if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = res.employee!;
                return copy;
              }
              return [res.employee!, ...prev];
            });
          }
          return { success: true, requires2FA: false };
        }
      }
    } catch (err) {
      console.warn('Backend login fallback to local credentials check:', err);
    }

    // Local fallback check
    const account = accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.passwordHash === pass
    );
    if (!account) return { success: false };

    return {
      success: true,
      requires2FA: true,
      tempToken: `temp_${account.id}`,
      email: account.email,
      fullName: account.fullName,
      role: account.role,
      avatar: account.avatar,
      employeeId: account.employeeId,
      twoFactorSecret: account.twoFactorSecret || 'JBSWY3DPEHPK3PXP',
      otpauthUrl: `otpauth://totp/PeopleOS:${encodeURIComponent(account.email)}?secret=${account.twoFactorSecret || 'JBSWY3DPEHPK3PXP'}&issuer=PeopleOS`,
      currentTotpHint: '123456',
    };
  };

  const verify2FA = async (payload: {
    email: string;
    code: string;
    tempToken?: string;
    trustDevice?: boolean;
  }): Promise<boolean> => {
    try {
      const res = await api.verify2FA(payload);
      if (res.success && res.account) {
        setIsAuthenticated(true);
        sessionStorage.setItem('peopleos_session_active', 'true');
        setCurrentUserAccountId(res.account.id);
        setCurrentUserId(res.account.employeeId);
        setCurrentRole(res.account.role);

        setStorage('is_authenticated', true);
        setStorage('active_account_id', res.account.id);
        setStorage('current_user_id', res.account.employeeId);
        setStorage('role', res.account.role);

        if (res.deviceToken) {
          localStorage.setItem('peopleos_device_token', res.deviceToken);
        }

        if (res.employee) {
          setEmployees((prev) => {
            const idx = prev.findIndex((e) => e.id === res.employee!.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = res.employee!;
              return copy;
            }
            return [res.employee!, ...prev];
          });
        }
        return true;
      }
    } catch (err) {
      console.warn('Backend verify2FA failed, checking local demo code:', err);
    }

    // Local master demo code fallback (123456)
    if (payload.code.trim() === '123456') {
      const account = accounts.find((a) => a.email.toLowerCase() === payload.email.toLowerCase());
      if (account) {
        setIsAuthenticated(true);
        sessionStorage.setItem('peopleos_session_active', 'true');
        setCurrentUserAccountId(account.id);
        setCurrentUserId(account.employeeId);
        setCurrentRole(account.role);

        setStorage('is_authenticated', true);
        setStorage('active_account_id', account.id);
        setStorage('current_user_id', account.employeeId);
        setStorage('role', account.role);
        return true;
      }
    }

    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('peopleos_session_active');
    setCurrentUserAccountId(null);
    setStorage('is_authenticated', false);
    setStorage('active_account_id', null);
    localStorage.removeItem('peopleos_device_token');
  };

  const registerFounder = async (payload: RegisterCompanyPayload) => {
    try {
      const res = await api.register(payload);
      if (res.success && res.account && res.employee) {
        const updatedEmployees = [res.employee, ...employees];
        const updatedAccounts = [res.account, ...accounts];

        setEmployees(updatedEmployees);
        setAccounts(updatedAccounts);
        setCurrentUserId(res.employee.id);
        setCurrentRole('FOUNDER');
        setCurrentUserAccountId(res.account.id);
        setIsAuthenticated(true);

        setStorage('employees', updatedEmployees);
        setStorage('accounts', updatedAccounts);
        setStorage('current_user_id', res.employee.id);
        setStorage('role', 'FOUNDER');
        setStorage('active_account_id', res.account.id);
        setStorage('is_authenticated', true);
        return;
      }
    } catch (err) {
      console.warn('Backend register failed, applying local fallback:', err);
    }

    // Fallback local registration
    const newEmpId = `emp-root-${Date.now()}`;
    const newAccId = `acc-root-${Date.now()}`;
    const [first, ...lastParts] = payload.founderName.split(' ');
    const last = lastParts.join(' ') || 'Founder';

    const founderEmp: Employee = {
      id: newEmpId,
      employeeId: 'POS-1001',
      firstName: first,
      lastName: last,
      email: payload.workEmail,
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
      salary: 200000,
      skills: ['Leadership', 'Strategic Planning', 'Product Vision', 'Scaling Teams'],
      bio: `Founder & Executive Leader at ${payload.companyName}. Initialized self-hosted PeopleOS workspace.`,
      address: { city: 'HQ', state: 'US', country: 'United States' },
    };

    const founderAccount: UserAccount = {
      id: newAccId,
      employeeId: newEmpId,
      email: payload.workEmail,
      passwordHash: payload.password,
      role: 'FOUNDER',
      fullName: payload.founderName,
      avatar: founderEmp.avatar,
      companyName: payload.companyName,
    };

    const updatedEmployees = [founderEmp, ...employees];
    const updatedAccounts = [founderAccount, ...accounts];

    setEmployees(updatedEmployees);
    setAccounts(updatedAccounts);
    setCurrentUserId(newEmpId);
    setCurrentRole('FOUNDER');
    setCurrentUserAccountId(newAccId);
    setIsAuthenticated(true);

    setStorage('employees', updatedEmployees);
    setStorage('accounts', updatedAccounts);
    setStorage('current_user_id', newEmpId);
    setStorage('role', 'FOUNDER');
    setStorage('active_account_id', newAccId);
    setStorage('is_authenticated', true);
  };

  // ==========================================
  // ROLES & HIERARCHY TRAVERSAL
  // ==========================================
  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    setStorage('role', role);

    if (role === 'FOUNDER') {
      const founder = employees.find((e) => e.role === 'FOUNDER') || employees[0];
      setCurrentUserId(founder.id);
      setStorage('current_user_id', founder.id);
    } else if (role === 'HR_ADMIN') {
      const hr = employees.find((e) => e.role === 'HR_ADMIN') || employees[10] || employees[0];
      setCurrentUserId(hr.id);
      setStorage('current_user_id', hr.id);
    } else if (role === 'MANAGER') {
      const mgr = employees.find((e) => e.role === 'MANAGER') || employees[1];
      setCurrentUserId(mgr.id);
      setStorage('current_user_id', mgr.id);
    } else {
      const emp = employees.find((e) => e.role === 'EMPLOYEE') || employees[6];
      setCurrentUserId(emp.id);
      setStorage('current_user_id', emp.id);
    }
  };

  const switchUser = (employeeId: string) => {
    const target = employees.find((e) => e.id === employeeId);
    if (target) {
      setCurrentUserId(target.id);
      setCurrentRole(target.role);
      setStorage('current_user_id', target.id);
      setStorage('role', target.role);
    }
  };

  const getDownlineEmployeeIds = (managerId: string): string[] => {
    const directReports = employees.filter((e) => e.managerId === managerId);
    let allSubordinates: string[] = directReports.map((e) => e.id);
    directReports.forEach((dr) => {
      allSubordinates = [...allSubordinates, ...getDownlineEmployeeIds(dr.id)];
    });
    return allSubordinates;
  };

  const canViewEmployeeLogs = (targetEmployeeId: string): boolean => {
    if (currentRole === 'FOUNDER' || currentRole === 'HR_ADMIN') return true;
    if (targetEmployeeId === currentUser.id) return true;
    const downline = getDownlineEmployeeIds(currentUser.id);
    return downline.includes(targetEmployeeId);
  };

  const canOnboardEmployees = currentRole === 'FOUNDER' || currentRole === 'HR_ADMIN';

  // ==========================================
  // ATTENDANCE & PUNCH CLOCK
  // ==========================================
  const punchIn = async () => {
    setIsPunchedIn(true);
    setIsOnBreak(false);
    setStorage('punched_in', true);
    setStorage('on_break', false);

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAttendance((prev) => {
      const existsIndex = prev.findIndex((a) => a.employeeId === currentUser.id && a.date === todayStr);
      let updated: AttendanceRecord[];
      if (existsIndex >= 0) {
        updated = [...prev];
        updated[existsIndex] = {
          ...updated[existsIndex],
          checkIn: updated[existsIndex].checkIn || nowTimeStr,
          status: 'Present',
        };
      } else {
        const newRecord: AttendanceRecord = {
          id: `att-${Date.now()}`,
          employeeId: currentUser.id,
          date: todayStr,
          checkIn: nowTimeStr,
          checkOut: null,
          totalHours: 0.1,
          breakMinutes: 0,
          status: 'Present',
        };
        updated = [newRecord, ...prev];
      }
      setStorage('attendance', updated);
      return updated;
    });

    try {
      await api.punchIn(currentUser.id);
    } catch (err) {
      console.warn('API punchIn sync:', err);
    }
  };

  const punchOut = async () => {
    setIsPunchedIn(false);
    setIsOnBreak(false);
    setStorage('punched_in', false);
    setStorage('on_break', false);

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const hours = Number((workTimerSeconds / 3600).toFixed(1));

    setAttendance((prev) => {
      const updated = prev.map((a) => {
        if (a.employeeId === currentUser.id && a.date === todayStr) {
          return {
            ...a,
            checkOut: nowTimeStr,
            totalHours: hours,
          };
        }
        return a;
      });
      setStorage('attendance', updated);
      return updated;
    });

    try {
      await api.punchOut(currentUser.id, hours);
    } catch (err) {
      console.warn('API punchOut sync:', err);
    }
  };

  const toggleBreak = () => {
    const nextState = !isOnBreak;
    setIsOnBreak(nextState);
    setStorage('on_break', nextState);
  };

  const requestRegularization = async (recordId: string, reason: string) => {
    setAttendance((prev) => {
      const updated = prev.map((item) =>
        item.id === recordId
          ? { ...item, regularizationStatus: 'Requested' as const, regularizationReason: reason }
          : item
      );
      setStorage('attendance', updated);
      return updated;
    });

    try {
      await api.regularizeAttendance(recordId, reason);
    } catch (err) {
      console.warn('API regularization sync:', err);
    }
  };

  // ==========================================
  // LEAVE MANAGEMENT
  // ==========================================
  const applyLeave = async (req: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>) => {
    const newReq: LeaveRequest = {
      ...req,
      id: `lr-${Date.now()}`,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0],
      approverId: currentUser.managerId || 'emp-1',
      approverName: currentUser.managerName || 'Sarah Jenkins',
    };

    const updatedRequests = [newReq, ...leaveRequests];
    setLeaveRequests(updatedRequests);
    setStorage('leave_requests', updatedRequests);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'New Leave Request Received',
      message: `${req.employeeName} submitted a ${req.leaveType} leave request for ${req.days} day(s).`,
      time: 'Just now',
      read: false,
      type: 'leave',
      targetModule: 'leaves',
    };
    setNotifications((prev) => {
      const u = [notif, ...prev];
      setStorage('notifications', u);
      return u;
    });

    try {
      await api.applyLeave(newReq);
    } catch (err) {
      console.warn('API applyLeave sync:', err);
    }
  };

  const approveLeave = async (id: string, comments?: string) => {
    setLeaveRequests((prev) => {
      const targetReq = prev.find((r) => r.id === id);
      if (!targetReq) return prev;

      const updated = prev.map((r) =>
        r.id === id ? { ...r, status: 'Approved' as const, approverComments: comments || 'Approved.' } : r
      );
      setStorage('leave_requests', updated);

      setLeaveBalances((balances) => {
        const empBalance = balances[targetReq.employeeId] || getDefaultLeaveBalance(targetReq.employeeId);
        const lType = targetReq.leaveType as LeaveTypeCode;
        const currentTypeBal = empBalance[lType] || { total: 12, used: 0, remaining: 12 };
        const newUsed = currentTypeBal.used + targetReq.days;
        const newRemaining = Math.max(0, currentTypeBal.total - newUsed);

        const updatedBalances = {
          ...balances,
          [targetReq.employeeId]: {
            ...empBalance,
            [lType]: {
              ...currentTypeBal,
              used: newUsed,
              remaining: newRemaining,
            },
          },
        };
        setStorage('leave_balances', updatedBalances);
        return updatedBalances;
      });

      return updated;
    });

    try {
      await api.approveLeave(id, comments);
    } catch (err) {
      console.warn('API approveLeave sync:', err);
    }
  };

  const rejectLeave = async (id: string, comments?: string) => {
    setLeaveRequests((prev) => {
      const updated = prev.map((r) =>
        r.id === id ? { ...r, status: 'Rejected' as const, approverComments: comments || 'Leave request declined.' } : r
      );
      setStorage('leave_requests', updated);
      return updated;
    });

    try {
      await api.rejectLeave(id, comments);
    } catch (err) {
      console.warn('API rejectLeave sync:', err);
    }
  };

  // ==========================================
  // EMPLOYEES CRUD
  // ==========================================
  const addEmployee = async (empData: Omit<Employee, 'id'>) => {
    const tempId = `emp-${Date.now()}`;
    const newEmp: Employee = {
      ...empData,
      id: tempId,
    };
    const updated = [newEmp, ...employees];
    setEmployees(updated);
    setStorage('employees', updated);

    try {
      const res = await api.createEmployee(empData);
      if (res?.employee) {
        setEmployees((prev) => [res.employee, ...prev.filter((e) => e.id !== tempId)]);
      }
    } catch (err) {
      console.warn('API addEmployee sync:', err);
    }
  };

  const updateEmployee = async (id: string, partial: Partial<Employee>) => {
    const updated = employees.map((e) => (e.id === id ? { ...e, ...partial } : e));
    setEmployees(updated);
    setStorage('employees', updated);

    try {
      await api.updateEmployee(id, partial);
    } catch (err) {
      console.warn('API updateEmployee sync:', err);
    }
  };

  const deleteEmployee = async (id: string) => {
    const updated = employees.filter((e) => e.id !== id);
    setEmployees(updated);
    setStorage('employees', updated);

    try {
      await api.deleteEmployee(id);
    } catch (err) {
      console.warn('API deleteEmployee sync:', err);
    }
  };

  // ==========================================
  // GOALS & KUDOS
  // ==========================================
  const addGoal = async (goalData: Omit<Goal, 'id'>) => {
    const tempId = `goal-${Date.now()}`;
    const newGoal: Goal = {
      ...goalData,
      id: tempId,
    };
    const updated = [newGoal, ...goals];
    setGoals(updated);
    setStorage('goals', updated);

    try {
      const res = await api.createGoal(goalData);
      if (res?.goal) {
        setGoals((prev) => [res.goal, ...prev.filter((g) => g.id !== tempId)]);
      }
    } catch (err) {
      console.warn('API addGoal sync:', err);
    }
  };

  const updateGoalProgress = async (id: string, progress: number) => {
    const updated = goals.map((g) =>
      g.id === id
        ? {
            ...g,
            progress,
            status: progress >= 100 ? ('Completed' as const) : progress < 30 ? ('At Risk' as const) : ('In Progress' as const),
          }
        : g
    );
    setGoals(updated);
    setStorage('goals', updated);

    try {
      await api.updateGoal(id, progress);
    } catch (err) {
      console.warn('API updateGoal sync:', err);
    }
  };

  const giveKudos = async (kudosData: Omit<Kudos, 'id' | 'timestamp' | 'likes' | 'likedBy'>) => {
    const tempId = `kudos-${Date.now()}`;
    const newKudos: Kudos = {
      ...kudosData,
      id: tempId,
      timestamp: 'Just now',
      likes: 1,
      likedBy: [currentUser.id],
    };
    const updated = [newKudos, ...kudosList];
    setKudosList(updated);
    setStorage('kudos', updated);

    try {
      const res = await api.giveKudos(kudosData);
      if (res?.kudos) {
        setKudosList((prev) => [res.kudos, ...prev.filter((k) => k.id !== tempId)]);
      }
    } catch (err) {
      console.warn('API giveKudos sync:', err);
    }
  };

  const likeKudos = async (kudosId: string) => {
    setKudosList((prev) => {
      const updated = prev.map((k) => {
        if (k.id === kudosId) {
          const hasLiked = k.likedBy.includes(currentUser.id);
          const nextLikes = hasLiked ? Math.max(0, k.likes - 1) : k.likes + 1;
          const nextLikedBy = hasLiked
            ? k.likedBy.filter((uid) => uid !== currentUser.id)
            : [...k.likedBy, currentUser.id];
          return { ...k, likes: nextLikes, likedBy: nextLikedBy };
        }
        return k;
      });
      setStorage('kudos', updated);
      return updated;
    });

    try {
      await api.likeKudos(kudosId, currentUser.id);
    } catch (err) {
      console.warn('API likeKudos sync:', err);
    }
  };

  // ==========================================
  // HR HELPDESK & TICKETS
  // ==========================================
  const createTicket = async (ticketData: Omit<Ticket, 'id' | 'ticketNumber' | 'createdAt' | 'status' | 'messages'>) => {
    const tempId = `t-${Date.now()}`;
    const newTicket: Ticket = {
      ...ticketData,
      id: tempId,
      ticketNumber: `POS-CASE-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Open',
      createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderId: currentUser.id,
          senderName: `${currentUser.firstName} ${currentUser.lastName}`,
          senderRole: currentUser.role,
          message: ticketData.description,
          timestamp: 'Just now',
        },
      ],
    };
    const updated = [newTicket, ...tickets];
    setTickets(updated);
    setStorage('tickets', updated);

    try {
      const res = await api.createTicket(ticketData);
      if (res?.ticket) {
        setTickets((prev) => [res.ticket, ...prev.filter((t) => t.id !== tempId)]);
      }
    } catch (err) {
      console.warn('API createTicket sync:', err);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: Ticket['status'], resolution?: string) => {
    const updated = tickets.map((t) =>
      t.id === ticketId ? { ...t, status, resolution: resolution || t.resolution } : t
    );
    setTickets(updated);
    setStorage('tickets', updated);

    try {
      await api.updateTicketStatus(ticketId, status, resolution);
    } catch (err) {
      console.warn('API updateTicketStatus sync:', err);
    }
  };

  const addTicketMessage = async (ticketId: string, message: string) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      senderRole: currentUser.role,
      message,
      timestamp: 'Just now',
    };

    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          messages: [...t.messages, newMsg],
        };
      }
      return t;
    });
    setTickets(updated);
    setStorage('tickets', updated);

    try {
      await api.replyTicket(ticketId, {
        senderId: currentUser.id,
        senderName: `${currentUser.firstName} ${currentUser.lastName}`,
        senderRole: currentUser.role,
        message,
      });
    } catch (err) {
      console.warn('API replyTicket sync:', err);
    }
  };

  // ==========================================
  // ONBOARDING
  // ==========================================
  const toggleOnboardingTask = async (taskId: string) => {
    const updated = onboardingTasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            isCompleted: !t.isCompleted,
            completedAt: !t.isCompleted ? new Date().toISOString().split('T')[0] : undefined,
          }
        : t
    );
    setOnboardingTasks(updated);
    setStorage('onboarding', updated);

    try {
      await api.toggleOnboardingTask(taskId);
    } catch (err) {
      console.warn('API toggleOnboardingTask sync:', err);
    }
  };

  const addOnboardingTask = async (task: Omit<OnboardingTask, 'id' | 'isCompleted'>) => {
    const tempId = `ob-${Date.now()}`;
    const newTask: OnboardingTask = {
      ...task,
      id: tempId,
      isCompleted: false,
    };
    const updated = [...onboardingTasks, newTask];
    setOnboardingTasks(updated);
    setStorage('onboarding', updated);

    try {
      const res = await api.addOnboardingTask(task);
      if (res?.task) {
        setOnboardingTasks((prev) => [...prev.filter((t) => t.id !== tempId), res.task]);
      }
    } catch (err) {
      console.warn('API addOnboardingTask sync:', err);
    }
  };

  // ==========================================
  // NOTIFICATIONS & SEARCH
  // ==========================================
  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    setStorage('notifications', updated);
  };

  const markAllNotificationsAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    setStorage('notifications', updated);
  };

  // ==========================================
  // SYSTEM RESET
  // ==========================================
  const resetDemoData = async () => {
    try {
      await api.resetDatabase();
    } catch (err) {
      console.warn('API resetDatabase sync:', err);
    }
    localStorage.clear();
    setEmployees(INITIAL_EMPLOYEES);
    setAccounts(INITIAL_ACCOUNTS);
    setDepartments(INITIAL_DEPARTMENTS);
    setAttendance(INITIAL_ATTENDANCE);
    setLeaveRequests(INITIAL_LEAVE_REQUESTS);
    setLeaveBalances(INITIAL_LEAVE_BALANCES);
    setGoals(INITIAL_GOALS);
    setKudosList(INITIAL_KUDOS);
    setTickets(INITIAL_TICKETS);
    setOnboardingTasks(INITIAL_ONBOARDING_TASKS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUserId('emp-1');
    setCurrentRole('FOUNDER');
    setCurrentUserAccountId('acc-1');
    setIsAuthenticated(true);
    setIsPunchedIn(true);
    setIsOnBreak(false);
    setWorkTimerSeconds(24800);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUserAccount,
        login,
        verify2FA,
        logout,
        registerFounder,
        currentRole,
        setRole,
        currentUser,
        switchUser,
        getDownlineEmployeeIds,
        canViewEmployeeLogs,
        canOnboardEmployees,
        activeModule,
        setActiveModule,
        employees,
        departments,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        attendance,
        isPunchedIn,
        isOnBreak,
        workTimerSeconds,
        punchIn,
        punchOut,
        toggleBreak,
        requestRegularization,
        leaveRequests,
        leaveBalances,
        applyLeave,
        approveLeave,
        rejectLeave,
        holidays,
        goals,
        addGoal,
        updateGoalProgress,
        kudosList,
        giveKudos,
        likeKudos,
        tickets,
        createTicket,
        updateTicketStatus,
        addTicketMessage,
        onboardingTasks,
        toggleOnboardingTask,
        addOnboardingTask,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        searchQuery,
        setSearchQuery,
        isSearchModalOpen,
        setIsSearchModalOpen,
        theme,
        toggleTheme,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
