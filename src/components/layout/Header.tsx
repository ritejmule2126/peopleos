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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
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
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Format work timer
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 50,
      }}
    >
      {/* Left: Global Search trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '400px' }}>
        <button
          onClick={() => setIsSearchModalOpen(true)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            color: '#64748b',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.backgroundColor = '#e2e8f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.backgroundColor = '#f1f5f9';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={16} color="#94a3b8" />
            <span>Search employees, cases, leaves...</span>
          </div>
          <span
            style={{
              fontSize: '11px',
              backgroundColor: '#ffffff',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              color: '#475569',
              fontWeight: 600,
            }}
          >
            ⌘K
          </span>
        </button>
      </div>

      {/* Right: Live Punch Clock Widget & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* Punch In / Out Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '6px 12px',
            borderRadius: '10px',
          }}
        >
          {/* Status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isPunchedIn ? (isOnBreak ? '#f59e0b' : '#10b981') : '#94a3b8',
                boxShadow: isPunchedIn && !isOnBreak ? '0 0 8px #10b981' : 'none',
              }}
            />
            <div>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                {isPunchedIn ? (isOnBreak ? 'Break Active' : 'Checked In') : 'Checked Out'}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: isPunchedIn ? '#0f172a' : '#64748b',
                }}
              >
                {formatTimer(workTimerSeconds)}
              </div>
            </div>
          </div>

          {/* Break & Punch Buttons */}
          {isPunchedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={toggleBreak}
                className="btn btn-sm"
                style={{
                  backgroundColor: isOnBreak ? '#fef3c7' : '#ffffff',
                  color: isOnBreak ? '#92400e' : '#475569',
                  border: '1px solid',
                  borderColor: isOnBreak ? '#fde68a' : '#cbd5e1',
                }}
                title={isOnBreak ? 'Resume Work' : 'Start Break'}
              >
                <Coffee size={13} />
                {isOnBreak ? 'Resume' : 'Break'}
              </button>

              <button
                onClick={punchOut}
                className="btn btn-sm btn-danger"
                title="Punch Out for today"
              >
                <Square size={12} />
                Check Out
              </button>
            </div>
          ) : (
            <button
              onClick={punchIn}
              className="btn btn-sm btn-success"
              title="Punch In and start timer"
            >
              <Play size={12} />
              Check In
            </button>
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
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                border: '1px solid #e2e8f0',
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

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: isNotifOpen ? '#f1f5f9' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
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
                  border: '2px solid #ffffff',
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
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                zIndex: 100,
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#fafbfc',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
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
                  <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
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
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: notif.read ? '#ffffff' : '#f8faff',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '12px',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = notif.read ? '#ffffff' : '#f8faff';
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
                            color: '#0f172a',
                            marginBottom: '2px',
                          }}
                        >
                          {notif.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                          {notif.message}
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
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
