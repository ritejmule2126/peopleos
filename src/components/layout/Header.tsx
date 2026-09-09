import React, { useState } from 'react';
import {
  Search,
  Bell,
  Play,
  Square,
  Coffee,
  ShieldAlert,
  User,
  CheckCircle2,
  Calendar,
  LifeBuoy,
  Heart,
  ChevronDown,
  Sun,
  Moon,
  Target,
  Laptop,
  Plane,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { soundEffects } from '../../services/soundEffects';
import { UserRole } from '../../types';

export const Header: React.FC = () => {
  const {
    currentUser,
    currentRole,
    setRole,
    isPunchedIn,
    isOnBreak,
    workTimerSeconds,
    punchIn,
    punchOut,
    toggleBreak,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setIsSearchModalOpen,
    setActiveModule,
    theme,
    toggleTheme,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [workStatus, setWorkStatus] = useState<'Deep Work' | 'In Meeting' | 'On Break' | 'Remote' | 'Traveling'>('Deep Work');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // 8.0-hour shift target calculation (28,800 seconds)
  const shiftProgressPercent = Math.min(100, Math.round((workTimerSeconds / 28800) * 100));
  const strokeDashoffset = 87.96 - (87.96 * shiftProgressPercent) / 100;

  // Format work timer
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handlePunchIn = () => {
    soundEffects.playPunchIn();
    punchIn();
  };

  const handlePunchOut = () => {
    soundEffects.playPunchOut();
    punchOut();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: 'var(--header-bg)',
        borderBottom: '1px solid var(--header-border)',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 50,
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      {/* Left: Global Search trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '400px' }}>
        <button
          onClick={() => {
            soundEffects.playPop();
            setIsSearchModalOpen(true);
          }}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            backgroundColor: 'var(--bg-surface-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--input-border)';
            e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.backgroundColor = 'var(--bg-surface-secondary)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={16} color="var(--text-muted)" />
            <span>Search employees, actions (⌘K)...</span>
          </div>
          <span
            style={{
              fontSize: '11px',
              backgroundColor: 'var(--bg-surface)',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            ⌘K
          </span>
        </button>
      </div>

      {/* Right: Live Punch Clock Widget & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Punch In / Out Card with Shift Gauge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'var(--bg-surface-secondary)',
            border: '1px solid var(--border-color)',
            padding: '5px 12px',
            borderRadius: '10px',
          }}
        >
          {/* Shift Target Progress Ring */}
          <div
            title={`8.0h Daily Shift: ${shiftProgressPercent}% completed (${formatTimer(workTimerSeconds)})`}
            style={{
              position: 'relative',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="var(--border-color)"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke={shiftProgressPercent >= 100 ? '#10b981' : '#0066ff'}
                strokeWidth="3"
                strokeDasharray="87.96"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
                style={{ transition: 'stroke-dashoffset 0.4s ease' }}
              />
            </svg>
            <span style={{ position: 'absolute', fontSize: '9px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {shiftProgressPercent}%
            </span>
          </div>

          {/* Status Indicator */}
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              {isPunchedIn ? (isOnBreak ? 'Break Active' : 'Checked In') : 'Checked Out'}
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: 'monospace',
                color: isPunchedIn ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              {formatTimer(workTimerSeconds)}
            </div>
          </div>

          {/* Break & Punch Buttons */}
          {isPunchedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => {
                  soundEffects.playPop();
                  toggleBreak();
                }}
                className="btn btn-sm"
                style={{
                  backgroundColor: isOnBreak ? '#fef3c7' : 'var(--bg-surface)',
                  color: isOnBreak ? '#92400e' : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: isOnBreak ? '#fde68a' : 'var(--border-color)',
                }}
                title={isOnBreak ? 'Resume Work' : 'Start Break'}
              >
                <Coffee size={13} />
                {isOnBreak ? 'Resume' : 'Break'}
              </button>

              <button
                onClick={handlePunchOut}
                className="btn btn-sm btn-danger"
                title="Punch Out for today"
              >
                <Square size={12} />
                Check Out
              </button>
            </div>
          ) : (
            <button
              onClick={handlePunchIn}
              className="btn btn-sm btn-success"
              title="Punch In and start timer"
            >
              <Play size={12} />
              Check In
            </button>
          )}
        </div>

        {/* Live Work Status Radar Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              soundEffects.playPop();
              setIsStatusDropdownOpen(!isStatusDropdownOpen);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface-secondary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Set Live Work Status Radar"
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor:
                  workStatus === 'Deep Work'
                    ? '#8b5cf6'
                    : workStatus === 'In Meeting'
                    ? '#f59e0b'
                    : workStatus === 'On Break'
                    ? '#eab308'
                    : workStatus === 'Remote'
                    ? '#10b981'
                    : '#0066ff',
              }}
            />
            <span>{workStatus}</span>
            <ChevronDown size={11} color="var(--text-muted)" />
          </button>

          {isStatusDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                width: '160px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.18)',
                border: '1px solid var(--border-color)',
                padding: '6px',
                zIndex: 100,
              }}
            >
              {[
                { name: 'Deep Work', icon: Target, color: '#8b5cf6' },
                { name: 'In Meeting', icon: MessageSquare, color: '#f59e0b' },
                { name: 'On Break', icon: Coffee, color: '#eab308' },
                { name: 'Remote', icon: Laptop, color: '#10b981' },
                { name: 'Traveling', icon: Plane, color: '#0066ff' },
              ].map((st) => {
                const Icon = st.icon;
                return (
                  <button
                    key={st.name}
                    onClick={() => {
                      soundEffects.playPop();
                      setWorkStatus(st.name as any);
                      setIsStatusDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: workStatus === st.name ? 'var(--primary-tint)' : 'transparent',
                      color: workStatus === st.name ? '#0066ff' : 'var(--text-primary)',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <Icon size={13} color={st.color} />
                    <span>{st.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Persona / Role Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor:
                currentRole === 'FOUNDER'
                  ? '#eff6ff'
                  : currentRole === 'HR_ADMIN'
                  ? '#ecfdf5'
                  : currentRole === 'MANAGER'
                  ? '#f5f3ff'
                  : '#f8fafc',
              border: '1px solid',
              borderColor:
                currentRole === 'FOUNDER'
                  ? '#93c5fd'
                  : currentRole === 'HR_ADMIN'
                  ? '#a7f3d0'
                  : currentRole === 'MANAGER'
                  ? '#ddd6fe'
                  : '#cbd5e1',
              color:
                currentRole === 'FOUNDER'
                  ? '#1d4ed8'
                  : currentRole === 'HR_ADMIN'
                  ? '#047857'
                  : currentRole === 'MANAGER'
                  ? '#6d28d9'
                  : '#334155',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <ShieldAlert size={14} />
            <span>
              Role: {currentRole === 'FOUNDER' ? '👑 Founder' : currentRole === 'HR_ADMIN' ? 'HR Admin' : currentRole === 'MANAGER' ? 'Manager' : 'Employee'}
            </span>
            <ChevronDown size={12} />
          </button>

          {isRoleDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                width: '260px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                border: '1px solid var(--border-color)',
                padding: '8px',
                zIndex: 100,
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#94a3b8',
                  padding: '4px 8px 6px',
                  textTransform: 'uppercase',
                }}
              >
                Switch Experience Mode
              </div>
              <button
                onClick={() => {
                  setRole('FOUNDER');
                  setIsRoleDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: currentRole === 'FOUNDER' ? '#eff6ff' : 'transparent',
                  color: currentRole === 'FOUNDER' ? '#1d4ed8' : '#1e293b',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <span style={{ fontWeight: 600 }}>👑 Founder & CEO (Sarah Jenkins)</span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>Root authority & full down-tree visibility</span>
              </button>

              <button
                onClick={() => {
                  setRole('HR_ADMIN');
                  setIsRoleDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: currentRole === 'HR_ADMIN' ? '#ecfdf5' : 'transparent',
                  color: currentRole === 'HR_ADMIN' ? '#047857' : '#1e293b',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <span style={{ fontWeight: 600 }}>🛡️ HR Admin (Jordan Taylor)</span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>Onboarding, all staff & policy records</span>
              </button>

              <button
                onClick={() => {
                  setRole('MANAGER');
                  setIsRoleDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: currentRole === 'MANAGER' ? '#f5f3ff' : 'transparent',
                  color: currentRole === 'MANAGER' ? '#6d28d9' : '#1e293b',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <span style={{ fontWeight: 600 }}>💼 Team Manager (Alex Rivera)</span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>Engineering down-tree subordinates only</span>
              </button>

              <button
                onClick={() => {
                  setRole('EMPLOYEE');
                  setIsRoleDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: currentRole === 'EMPLOYEE' ? '#f8fafc' : 'transparent',
                  color: currentRole === 'EMPLOYEE' ? '#334155' : '#1e293b',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <span style={{ fontWeight: 600 }}>👨‍💻 Employee (Rohan Deshmukh)</span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>Personal self-service (own logs only)</span>
              </button>
            </div>
          )}
        </div>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 12px',
            borderRadius: '10px',
            border: `1px solid ${theme === 'dark' ? '#334155' : '#e2e8f0'}`,
            backgroundColor: theme === 'dark' ? '#172033' : '#f8fafc',
            color: theme === 'dark' ? '#f8fafc' : '#334155',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: theme === 'dark' ? '0 2px 6px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1e293b' : '#f1f5f9';
            e.currentTarget.style.borderColor = theme === 'dark' ? '#475569' : '#cbd5e1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#172033' : '#f8fafc';
            e.currentTarget.style.borderColor = theme === 'dark' ? '#334155' : '#e2e8f0';
          }}
        >
          {theme === 'dark' ? (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(245, 158, 11, 0.18)',
                }}
              >
                <Sun size={13} color="#fbbf24" />
              </div>
              <span style={{ letterSpacing: '0.2px' }}>Light Mode</span>
            </>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(99, 102, 241, 0.12)',
                }}
              >
                <Moon size={13} color="#4f46e5" />
              </div>
              <span style={{ letterSpacing: '0.2px' }}>Dark Mode</span>
            </>
          )}
        </button>

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: isNotifOpen ? 'var(--hover-bg)' : 'var(--bg-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--bg-surface)',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div
              style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: '320px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                zIndex: 100,
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--bg-surface-secondary)',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Notifications ({unreadCount} unread)
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0066ff',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        if (notif.targetModule) {
                          setActiveModule(notif.targetModule as any);
                          setIsNotifOpen(false);
                        }
                      }}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: notif.read ? 'var(--bg-surface)' : 'var(--bg-surface-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '12px',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = notif.read ? 'var(--bg-surface)' : 'var(--bg-surface-secondary)';
                      }}
                    >
                      <div style={{ marginTop: '2px' }}>
                        {notif.type === 'leave' && <Calendar size={16} color="#3b82f6" />}
                        {notif.type === 'kudos' && <Heart size={16} color="#ec4899" />}
                        {notif.type === 'ticket' && <LifeBuoy size={16} color="#f59e0b" />}
                        {notif.type === 'attendance' && <CheckCircle2 size={16} color="#10b981" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '12px',
                            fontWeight: notif.read ? 600 : 700,
                            color: 'var(--text-primary)',
                            marginBottom: '2px',
                          }}
                        >
                          {notif.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {notif.message}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {notif.time}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Mini Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={currentUser.avatar}
            alt={currentUser.firstName}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #e2e8f0',
            }}
          />
        </div>
      </div>
    </header>
  );
};
