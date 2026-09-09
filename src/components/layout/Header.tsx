import React, { useState } from 'react';
import {
  Search,
  Bell,
  Play,
  Square,
  Coffee,
  ShieldAlert,
  ChevronDown,
  Sun,
  Moon,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { soundEffects } from '../../services/soundEffects';

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
  const [isMuted, setIsMuted] = useState(() => soundEffects.getIsMuted());

  // 8.0-hour shift target calculation (28,800 seconds)
  const shiftProgressPercent = Math.min(100, Math.round((workTimerSeconds / 28800) * 100));

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

  const handleToggleMute = () => {
    const newMute = soundEffects.toggleMute();
    setIsMuted(newMute);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      style={{
        height: '60px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 40,
      }}
    >
      {/* Left: Global Search trigger (Linear/Stripe style) */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, maxWidth: '340px' }}>
        <button
          onClick={() => {
            soundEffects.playPop();
            setIsSearchModalOpen(true);
          }}
          style={{
            width: '100%',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            backgroundColor: 'var(--bg-muted)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'border-color 0.15s ease, background-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--text-muted)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={15} color="var(--text-muted)" />
            <span>Search anything...</span>
          </div>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              backgroundColor: 'var(--bg-surface)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            ⌘K
          </span>
        </button>
      </div>

      {/* Right Controls: Perfectly aligned, unified 36px heights */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Sleek Integrated Punch & Shift Widget */}
        <div
          style={{
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '0 10px',
            backgroundColor: 'var(--bg-muted)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {/* Status Dot */}
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isPunchedIn ? (isOnBreak ? '#f59e0b' : '#10b981') : '#94a3b8',
              boxShadow: isPunchedIn && !isOnBreak ? '0 0 0 3px rgba(16, 185, 129, 0.25)' : 'none',
              transition: 'background-color 0.2s ease',
            }}
          />

          {/* Time & Shift Gauge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                color: isPunchedIn ? 'var(--text-primary)' : 'var(--text-muted)',
                letterSpacing: '0.02em',
              }}
            >
              {formatTimer(workTimerSeconds)}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
              ({shiftProgressPercent}%)
            </span>
          </div>

          {/* Quick Action Button */}
          {isPunchedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '2px' }}>
              <button
                onClick={() => {
                  soundEffects.playPop();
                  toggleBreak();
                }}
                className="btn btn-sm btn-secondary"
                style={{ height: '26px', padding: '0 8px', fontSize: '11px' }}
                title={isOnBreak ? 'Resume Work' : 'Take Break'}
              >
                <Coffee size={12} />
                {isOnBreak ? 'Resume' : 'Break'}
              </button>
              <button
                onClick={handlePunchOut}
                className="btn btn-sm btn-danger"
                style={{ height: '26px', padding: '0 8px', fontSize: '11px' }}
                title="Punch Out"
              >
                <Square size={11} />
                Out
              </button>
            </div>
          ) : (
            <button
              onClick={handlePunchIn}
              className="btn btn-sm btn-success"
              style={{ height: '26px', padding: '0 10px', fontSize: '11px', fontWeight: 600 }}
              title="Punch In"
            >
              <Play size={11} />
              Check In
            </button>
          )}
        </div>

        {/* Vertical Divider */}
        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)', margin: '0 2px' }} />

        {/* Role Selector Pill */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            style={{
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 10px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <ShieldAlert size={14} color="var(--primary-600)" />
            <span>{currentRole === 'FOUNDER' ? 'Founder' : currentRole === 'HR_ADMIN' ? 'HR Admin' : currentRole === 'MANAGER' ? 'Manager' : 'Employee'}</span>
            <ChevronDown size={12} color="var(--text-muted)" />
          </button>

          {isRoleDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '42px',
                right: 0,
                width: '220px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                padding: '6px',
                zIndex: 100,
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', padding: '6px 8px', textTransform: 'uppercase' }}>
                Switch Role
              </div>
              {[
                { id: 'FOUNDER', label: '👑 Founder & CEO', desc: 'Full authority' },
                { id: 'HR_ADMIN', label: '⚙️ HR Administrator', desc: 'Policy & payroll' },
                { id: 'MANAGER', label: '👥 Team Manager', desc: 'Approvals & reviews' },
                { id: 'EMPLOYEE', label: '💻 Employee', desc: 'Self-service workspace' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setRole(r.id as any);
                    setIsRoleDropdownOpen(false);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: currentRole === r.id ? 'var(--primary-tint)' : 'transparent',
                    color: currentRole === r.id ? 'var(--primary-600)' : 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{r.label}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Audio Sound Toggle */}
        <button
          onClick={handleToggleMute}
          className="btn btn-ghost"
          style={{ width: '36px', height: '36px', padding: 0, borderRadius: 'var(--radius-md)' }}
          title={isMuted ? 'Unmute sound effects (M)' : 'Mute sound effects (M)'}
        >
          {isMuted ? <VolumeX size={16} color="var(--text-muted)" /> : <Volume2 size={16} color="var(--text-secondary)" />}
        </button>

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost"
          style={{ width: '36px', height: '36px', padding: 0, borderRadius: 'var(--radius-md)' }}
          title={theme === 'dark' ? 'Switch to Light mode (D)' : 'Switch to Dark mode (D)'}
        >
          {theme === 'dark' ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="var(--text-secondary)" />}
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="btn btn-ghost"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: 'var(--radius-md)', position: 'relative' }}
            title="Notifications"
          >
            <Bell size={16} color="var(--text-secondary)" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--danger-main)',
                }}
              />
            )}
          </button>

          {isNotifOpen && (
            <div
              style={{
                position: 'absolute',
                top: '42px',
                right: 0,
                width: '320px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 100,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: notif.read ? 'transparent' : 'var(--primary-tint)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: notif.read ? 500 : 700, color: 'var(--text-primary)' }}>
                        {notif.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {notif.message}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {notif.time}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Thumbnail */}
        <div
          onClick={() => setActiveModule('settings')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '2px',
            borderRadius: 'var(--radius-full)',
          }}
          title={`${currentUser.firstName} ${currentUser.lastName} · View Settings`}
        >
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
        </div>
      </div>
    </header>
  );
};
