import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Coffee,
  CheckCircle,
  XCircle,
  Award,
  BellRing,
  Plane,
  Plus,
  Send,
  AlertCircle,
  Users,
  ChevronRight,
  TrendingUp,
  Smile,
  Flame,
  Zap,
  ThumbsUp,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../../context/AppContext';
import { soundEffects } from '../../../services/soundEffects';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    isPunchedIn,
    isOnBreak,
    workTimerSeconds,
    punchIn,
    punchOut,
    toggleBreak,
    leaveBalances,
    leaveRequests,
    approveLeave,
    rejectLeave,
    setActiveModule,
    holidays,
    kudosList,
    employees,
  } = useApp();

  const userBalance = leaveBalances[currentUser.id] || {
    CL: { total: 12, used: 2, remaining: 10 },
    SL: { total: 10, used: 1, remaining: 9 },
    PL: { total: 15, used: 4, remaining: 11 },
    ML: { total: 14, used: 0, remaining: 14 },
    UL: { total: 30, used: 0, remaining: 30 },
  };

  const pendingApprovals = leaveRequests.filter((r) => r.status === 'Pending');
  const employeesOnLeave = employees.filter((e) => e.status === 'On Leave');

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const [userMood, setUserMood] = useState<string>(() => {
    return localStorage.getItem(`peopleos_mood_${currentUser.id}`) || '';
  });

  const handleSelectMood = (mood: string, emoji: string) => {
    soundEffects.playPop();
    setUserMood(mood);
    localStorage.setItem(`peopleos_mood_${currentUser.id}`, mood);
    if (['Energized', 'In The Flow', 'Great'].includes(mood)) {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});

  const handleReaction = (kudosId: string, rxName: string) => {
    soundEffects.playKudosChime();
    setReactions((prev) => {
      const currentKudosRx = prev[kudosId] || {};
      return {
        ...prev,
        [kudosId]: {
          ...currentKudosRx,
          [rxName]: (currentKudosRx[rxName] || 0) + 1,
        },
      };
    });
    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.7 },
    });
  };

  return (
    <div className="page-body">
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0066ff 100%)',
          borderRadius: '16px',
          padding: '24px 32px',
          color: '#ffffff',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 10px 25px rgba(0, 102, 255, 0.2)',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ fontSize: '13px', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
            {currentDateFormatted}
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, marginTop: '4px', letterSpacing: '-0.5px' }}>
            Welcome back, {currentUser.firstName}! 👋
          </h1>
          <p style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px', maxWidth: '600px' }}>
            Here is your daily workspace snapshot for Acuity Solutions. All systems operational.
          </p>
        </div>

        {/* Quick action buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              soundEffects.playPop();
              setActiveModule('leaves');
            }}
            className="btn"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)' }}
          >
            <Plane size={15} /> Apply Leave
          </button>
          <button
            onClick={() => {
              soundEffects.playPop();
              setActiveModule('helpdesk');
            }}
            className="btn"
            style={{ backgroundColor: '#ffffff', color: '#0066ff', fontWeight: 600 }}
          >
            <Plus size={15} /> Raise Case / Ticket
          </button>
        </div>
      </div>

      {/* Daily Morale & Energy Pulse Bar */}
      <div
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          padding: '14px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: 'var(--card-shadow)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>⚡</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Daily Team Pulse: How is your energy today, {currentUser.firstName}?
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {userMood
                ? `You checked in as "${userMood}". Team Vibe: 94% Positive Morale across Acuity Solutions today!`
                : '1-click confidential pulse keeps your team energized, supported, and balanced.'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { emoji: '🚀', label: 'Energized', color: '#3b82f6' },
            { emoji: '😊', label: 'Great', color: '#10b981' },
            { emoji: '⚡', label: 'In The Flow', color: '#8b5cf6' },
            { emoji: '🥱', label: 'Tired', color: '#f59e0b' },
            { emoji: '🤯', label: 'Overwhelmed', color: '#ef4444' },
          ].map((m) => (
            <button
              key={m.label}
              onClick={() => handleSelectMood(m.label, m.emoji)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: userMood === m.label ? `2px solid ${m.color}` : '1px solid var(--border-color)',
                backgroundColor: userMood === m.label ? 'var(--primary-tint)' : 'var(--bg-surface-secondary)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: userMood === m.label ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px) scale(1.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
              }}
            >
              <span style={{ fontSize: '14px' }}>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid: 3 Columns Top */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Card 1: Time Tracker / Attendance Widget */}
        <div className="zp-card">
          <div className="zp-card-header">
            <div className="zp-card-title">
              <Clock size={18} color="#0066ff" />
              Time Tracker
            </div>
            <span className={`badge ${isPunchedIn ? (isOnBreak ? 'badge-warning' : 'badge-success') : 'badge-neutral'}`}>
              {isPunchedIn ? (isOnBreak ? 'On Break' : 'Punched In') : 'Off Duty'}
            </span>
          </div>
          <div className="zp-card-body">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                  Working Duration
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>
                  {formatTimer(workTimerSeconds)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Shift</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>9:00 AM - 6:00 PM</div>
                <div style={{ fontSize: '11px', color: '#10b981' }}>Standard General</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {isPunchedIn ? (
                <>
                  <button
                    onClick={toggleBreak}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    <Coffee size={15} />
                    {isOnBreak ? 'Resume Work' : 'Take Break'}
                  </button>
                  <button
                    onClick={punchOut}
                    className="btn btn-danger"
                    style={{ flex: 1 }}
                  >
                    <XCircle size={15} />
                    Punch Out
                  </button>
                </>
              ) : (
                <button
                  onClick={punchIn}
                  className="btn btn-success"
                  style={{ width: '100%', padding: '12px' }}
                >
                  <CheckCircle size={16} />
                  Punch In (Start Day)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Leave Balances */}
        <div className="zp-card">
          <div className="zp-card-header">
            <div className="zp-card-title">
              <Calendar size={18} color="#8b5cf6" />
              My Leave Balances
            </div>
            <button
              onClick={() => setActiveModule('leaves')}
              style={{ background: 'none', border: 'none', color: '#0066ff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              View History →
            </button>
          </div>
          <div className="zp-card-body" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Casual Leave</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#1d4ed8', margin: '4px 0' }}>
                  {userBalance.CL.remaining}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Available of {userBalance.CL.total}</div>
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Sick Leave</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#10b981', margin: '4px 0' }}>
                  {userBalance.SL.remaining}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Available of {userBalance.SL.total}</div>
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Privilege Leave</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#8b5cf6', margin: '4px 0' }}>
                  {userBalance.PL.remaining}
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Available of {userBalance.PL.total}</div>
              </div>
            </div>

            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              <button
                onClick={() => setActiveModule('leaves')}
                className="btn btn-primary btn-sm"
                style={{ width: '100%' }}
              >
                Apply for Time Off
              </button>
            </div>
          </div>
        </div>

        {/* Card 3: Team Presence / Out of Office */}
        <div className="zp-card">
          <div className="zp-card-header">
            <div className="zp-card-title">
              <Users size={18} color="#f59e0b" />
              Out of Office Today
            </div>
            <span className="badge badge-warning">{employeesOnLeave.length} On Leave</span>
          </div>
          <div className="zp-card-body">
            {employeesOnLeave.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#94a3b8', fontSize: '13px' }}>
                Everyone is active at work today! 🎉
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {employeesOnLeave.map((emp) => (
                  <div
                    key={emp.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <img
                      src={emp.avatar}
                      alt={emp.firstName}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {emp.designation} · {emp.department}
                      </div>
                    </div>
                    <span className="badge badge-purple">On Leave</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns Bottom */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Left Column: Manager Approvals or Recent Kudos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Pending Approvals Card (Highlighted if Manager or Admin) */}
          {(currentRole === 'HR_ADMIN' || currentRole === 'MANAGER') && (
            <div className="zp-card">
              <div className="zp-card-header">
                <div className="zp-card-title">
                  <AlertCircle size={18} color="#ef4444" />
                  Pending Approvals Queue
                </div>
                <span className="badge badge-danger">{pendingApprovals.length} Pending</span>
              </div>
              <div className="zp-card-body">
                {pendingApprovals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>
                    All requests have been reviewed! Inbox is clear.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {pendingApprovals.map((req) => (
                      <div
                        key={req.id}
                        style={{
                          padding: '14px 16px',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#fafbfc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                              {req.employeeName}
                            </span>
                            <span className="badge badge-primary">{req.leaveType}</span>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                              ({req.days} {req.days > 1 ? 'days' : 'day'})
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                            Dates: <strong>{req.fromDate}</strong> to <strong>{req.toDate}</strong> · Dept: {req.department}
                          </div>
                          <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontStyle: 'italic' }}>
                            "{req.reason}"
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => approveLeave(req.id, 'Approved via Dashboard')}
                            className="btn btn-sm btn-success"
                          >
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button
                            onClick={() => rejectLeave(req.id, 'Declined due to project delivery schedule')}
                            className="btn btn-sm btn-danger"
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Kudos & Peer Recognition Feed */}
          <div className="zp-card">
            <div className="zp-card-header">
              <div className="zp-card-title">
                <Award size={18} color="#ec4899" />
                Kudos & Peer Recognition Wall
              </div>
              <button
                onClick={() => setActiveModule('performance')}
                style={{ background: 'none', border: 'none', color: '#0066ff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Send Kudos →
              </button>
            </div>
            <div className="zp-card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {kudosList.slice(0, 3).map((k) => (
                  <div
                    key={k.id}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #fff5f8 0%, #ffffff 100%)',
                      border: '1px solid #fce7f3',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={k.fromAvatar}
                          alt={k.fromEmployeeName}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                          {k.fromEmployeeName}
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>recognized</span>
                        <img
                          src={k.toAvatar}
                          alt={k.toEmployeeName}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                          {k.toEmployeeName}
                        </span>
                      </div>
                      <span className="badge badge-purple" style={{ backgroundColor: '#fdf2f8', color: '#be185d', borderColor: '#fbcfe8' }}>
                        🏆 {k.badge}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                      "{k.message}"
                    </div>

                    {/* Interactive Multi-Reactions Bar */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '10px',
                        paddingTop: '8px',
                        borderTop: '1px solid rgba(0,0,0,0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[
                          { emoji: '👏', name: 'clap' },
                          { emoji: '🔥', name: 'fire' },
                          { emoji: '🚀', name: 'rocket' },
                          { emoji: '💡', name: 'insight' },
                          { emoji: '❤️', name: 'heart' },
                        ].map((rx) => {
                          const count = (reactions[k.id]?.[rx.name] || 0) + (rx.name === 'heart' ? k.likes : 0);
                          return (
                            <button
                              key={rx.name}
                              onClick={() => handleReaction(k.id, rx.name)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--bg-surface)',
                                cursor: 'pointer',
                                fontSize: '11px',
                                transition: 'transform 0.1s ease',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                            >
                              <span>{rx.emoji}</span>
                              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{count}</span>
                            </button>
                          );
                        })}
                      </div>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>{k.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Holidays & Announcements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Upcoming Holidays */}
          <div className="zp-card">
            <div className="zp-card-header">
              <div className="zp-card-title">
                <Calendar size={18} color="#0066ff" />
                Upcoming Holidays
              </div>
            </div>
            <div className="zp-card-body" style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {holidays.slice(4, 8).map((hol) => (
                  <div
                    key={hol.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                        {hol.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{hol.day}</div>
                    </div>
                    <span className="badge badge-primary">{hol.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Company Announcements */}
          <div className="zp-card">
            <div className="zp-card-header">
              <div className="zp-card-title">
                <BellRing size={18} color="#f59e0b" />
                Company Feeds
              </div>
            </div>
            <div className="zp-card-body">
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                🎉 Q3 All-Hands & Product Launch Summit
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                Join the executive team next Thursday at 3:00 PM EST for the presentation of our H2 roadmap and major milestones.
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px' }}>
                Posted by Sarah Jenkins · HR Dept
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
