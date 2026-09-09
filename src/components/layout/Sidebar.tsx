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
  RotateCcw,
  LogOut,
  HelpCircle,
} from 'lucide-react';
import { Logo } from '../common/Logo';
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
  } = useApp();

  const pendingLeavesCount = leaveRequests.filter((r) => r.status === 'Pending').length;
  const openTicketsCount = tickets.filter((t) => t.status === 'Open').length;

  const navItems: { id: NavigationModule; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'employees', label: 'Directory', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'leaves', label: 'Time Off', icon: CalendarDays, badge: pendingLeavesCount },
    { id: 'performance', label: 'Performance', icon: Target },
    { id: 'helpdesk', label: 'Helpdesk', icon: LifeBuoy, badge: openTicketsCount },
    { id: 'onboarding', label: 'Onboarding', icon: UserCheck },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        flexShrink: 0,
        userSelect: 'none',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: '60px',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Logo width={26} height={28} />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            People<span style={{ color: 'var(--primary-600)' }}>OS</span>
          </span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-muted)',
              padding: '1px 5px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
            }}
          >
            v2.0
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--text-muted)',
            padding: '0 10px 8px',
          }}
        >
          Platform
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveModule(item.id)}
                  style={{
                    width: '100%',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 10px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--primary-600)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--primary-tint)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={16} color={isActive ? 'var(--primary-600)' : 'var(--text-muted)'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span
                      style={{
                        backgroundColor: 'var(--danger-main)',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        minWidth: '18px',
                        textAlign: 'center',
                      }}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Footer Panel */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <img
            src={currentUser.avatar}
            alt={currentUser.firstName}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1px solid var(--border-color)',
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
                color: 'var(--text-muted)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentRole === 'FOUNDER' ? '👑 Founder' : currentRole === 'HR_ADMIN' ? 'HR Admin' : currentRole === 'MANAGER' ? 'Manager' : 'Employee'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => {
              if (confirm('Reset demo data to default?')) {
                resetDemoData();
              }
            }}
            className="btn btn-ghost btn-sm"
            style={{ flex: 1, height: '28px', fontSize: '11px', color: 'var(--text-secondary)' }}
            title="Reset data"
          >
            <RotateCcw size={12} />
            Reset
          </button>

          <button
            onClick={() => {
              if (confirm('Sign out of current workspace?')) {
                logout();
              }
            }}
            className="btn btn-ghost btn-sm"
            style={{ flex: 1, height: '28px', fontSize: '11px', color: 'var(--danger-main)' }}
            title="Sign out"
          >
            <LogOut size={12} />
            Exit
          </button>
        </div>
      </div>
    </aside>
  );
};
