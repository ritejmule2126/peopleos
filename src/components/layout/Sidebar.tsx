import React from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Target,
  LifeBuoy,
  UserCheck,
  BarChart3,
  Settings,
  ChevronRight,
  RotateCcw,
  LogOut,
} from 'lucide-react';
import { useApp, NavigationModule } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    currentUser,
    currentRole,
    leaveRequests,
    tickets,
    resetDemoData,
    logout,
    theme,
  } = useApp();

  const pendingLeavesCount = leaveRequests.filter((r) => r.status === 'Pending').length;
  const openTicketsCount = tickets.filter((t) => t.status === 'Open').length;

  const navItems: { id: NavigationModule; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leaves', label: 'Leave Tracker', icon: CalendarDays, badge: pendingLeavesCount },
    { id: 'performance', label: 'Performance', icon: Target },
    { id: 'helpdesk', label: 'HR Helpdesk', icon: LifeBuoy, badge: openTicketsCount },
    { id: 'onboarding', label: 'Onboarding', icon: UserCheck },
    { id: 'analytics', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--sidebar-bg)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        borderRight: '1px solid var(--sidebar-border)',
        flexShrink: 0,
        userSelect: 'none',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '20px 20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <img
          src="/logo.png"
          alt="PeopleOS Logo"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            objectFit: 'contain',
            backgroundColor: '#ffffff',
            padding: '2px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 2px 6px rgba(0, 166, 156, 0.15)',
          }}
        />
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
              People<span style={{ color: '#0066ff' }}>OS</span>
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#059669',
                background: theme === 'dark' ? 'rgba(5, 150, 105, 0.2)' : '#ecfdf5',
                padding: '1px 6px',
                borderRadius: '4px',
                border: '1px solid rgba(5, 150, 105, 0.3)',
              }}
            >
              OPEN SOURCE
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
            Acuity Solutions
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            color: '#94a3b8',
            padding: '0 12px 10px',
          }}
        >
          Main Menu
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveModule(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#0066ff' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--primary-tint)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={18} color={isActive ? '#0066ff' : 'var(--text-muted)'} />
                    <span>{item.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.badge && item.badge > 0 ? (
                      <span
                        style={{
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '10px',
                        }}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                    {isActive && <ChevronRight size={14} color="#0066ff" />}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Footer Profile */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <img
            src={currentUser.avatar}
            alt={currentUser.firstName}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--border-color)',
            }}
          />
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentUser.firstName} {currentUser.lastName}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: '#0066ff',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentRole === 'FOUNDER'
                ? '👑 Founder & CEO'
                : currentRole === 'HR_ADMIN'
                ? 'HR Administrator'
                : currentRole === 'MANAGER'
                ? 'Team Manager'
                : 'Employee'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              if (confirm('Reset application data to initial demo state?')) {
                resetDemoData();
              }
            }}
            className="btn btn-ghost btn-sm"
            style={{
              flex: 1,
              color: 'var(--text-secondary)',
              fontSize: '11px',
              padding: '6px',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
            }}
            title="Reset database to initial demo values"
          >
            <RotateCcw size={12} />
            Reset
          </button>

          <button
            onClick={() => {
              if (confirm('Sign out of PeopleOS?')) {
                logout();
              }
            }}
            className="btn btn-ghost btn-sm"
            style={{
              flex: 1,
              color: '#dc2626',
              fontSize: '11px',
              padding: '6px',
              justifyContent: 'center',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
            }}
            title="Sign out of current workspace"
          >
            <LogOut size={12} />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};
