import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Coffee,
  CheckCircle,
  XCircle,
  Award,
  Plane,
  Plus,
  AlertCircle,
  Users,
  ChevronRight,
  TrendingUp,
  Sparkles,
  LifeBuoy,
  Heart,
  CalendarDays,
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

  const totalRemainingLeaves =
    userBalance.CL.remaining + userBalance.SL.remaining + userBalance.PL.remaining;

  const pendingApprovals = leaveRequests.filter((r) => r.status === 'Pending');
  const employeesOnLeave = employees.filter((e) => e.status === 'On Leave');

  // Format work timer
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const shiftProgressPercent = Math.min(100, Math.round((workTimerSeconds / 28800) * 100));

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const [userMood, setUserMood] = useState<string>(() => {
    return localStorage.getItem(`peopleos_mood_${currentUser.id}`) || '';
  });

  const handleSelectMood = (mood: string) => {
    soundEffects.playPop();
    setUserMood(mood);
    localStorage.setItem(`peopleos_mood_${currentUser.id}`, mood);
    if (['Energized', 'In Flow', 'Great'].includes(mood)) {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
    }
  };

  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});

  const handleReaction = (kudosId: string, rxName: string) => {
    soundEffects.playPop();
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
  };

  return (
    <div className="page-body">
      {/* Top Page Header */}
      <div className="page-header-row">
        <div>
          <div className="page-title">
            <span>Good day, {currentUser.firstName}</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-muted)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
              }}
            >
              {currentDateFormatted}
            </span>
          </div>
          <div className="page-subtitle">
            Acuity Solutions · Engineering & Operations · Everything running smoothly today.
          </div>
        </div>

        {/* Clean Action Button Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setActiveModule('leaves')}
            className="btn btn-secondary"
          >
            <CalendarDays size={15} />
            <span>Time Off</span>
          </button>

          <button
            onClick={() => setActiveModule('helpdesk')}
            className="btn btn-secondary"
          >
            <LifeBuoy size={15} />
            <span>Raise Ticket</span>
          </button>

          <button
            onClick={() => setActiveModule('performance')}
            className="btn btn-primary"
          >
            <Sparkles size={15} />
            <span>Give Kudos</span>
          </button>
        </div>
      </div>

      {/* 4 Clean Metric Cards (Uniform 1-Row Grid) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Metric 1: Work Hours & Shift */}
        <div className="zp-card" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Shift Today</span>
            <span className={`badge ${isPunchedIn ? (isOnBreak ? 'badge-warning' : 'badge-success') : 'badge-neutral'}`}>
              {isPunchedIn ? (isOnBreak ? 'On Break' : 'Active') : 'Checked Out'}
            </span>
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '10px',
            }}
          >
            {formatTimer(workTimerSeconds)}
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>8h Goal</span>
              <span>{shiftProgressPercent}%</span>
            </div>
            <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-muted)', borderRadius: '2px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${shiftProgressPercent}%`,
                  height: '100%',
                  backgroundColor: shiftProgressPercent >= 100 ? 'var(--success-main)' : 'var(--primary-600)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>

        {/* Metric 2: Available Leaves */}
        <div className="zp-card" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Available Leave</span>
            <button
              onClick={() => setActiveModule('leaves')}
              style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
            >
              View →
            </button>
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '10px',
            }}
          >
            {totalRemainingLeaves} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>days</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {userBalance.CL.remaining} Casual · {userBalance.SL.remaining} Sick · {userBalance.PL.remaining} Privilege
          </div>
        </div>

        {/* Metric 3: Team Out of Office */}
        <div className="zp-card" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Out of Office</span>
            <span className="badge badge-purple">{employeesOnLeave.length} Away</span>
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '10px',
            }}
          >
            {employeesOnLeave.length} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>colleagues</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {employeesOnLeave.length > 0
              ? `${employeesOnLeave[0].firstName} ${employeesOnLeave[0].lastName} and others`
              : 'Full team presence today'}
          </div>
        </div>

        {/* Metric 4: Pending Queue */}
        <div className="zp-card" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Pending Requests</span>
            <span className="badge badge-warning">{pendingApprovals.length} Inbox</span>
          </div>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: '10px',
            }}
          >
            {pendingApprovals.length} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>items</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {pendingApprovals.length > 0 ? 'Requires manager review' : 'All workflows up to date'}
          </div>
        </div>
      </div>

      {/* Main 2-Column Balanced Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Work Feed & Kudos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Approvals Queue */}
          <div className="zp-card">
            <div className="zp-card-header">
              <div className="zp-card-title">
                <AlertCircle size={16} color="var(--primary-600)" />
                <span>Pending Approvals Queue</span>
              </div>
              <span className="badge badge-neutral">{pendingApprovals.length} Total</span>
            </div>
            <div className="zp-card-body" style={{ padding: 0 }}>
              {pendingApprovals.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No pending requests waiting for review. All caught up!
                </div>
              ) : (
                pendingApprovals.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {req.employeeName}
                        </span>
                        <span className="badge badge-primary">{req.leaveType}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          · {req.days} {req.days > 1 ? 'days' : 'day'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {req.fromDate} to {req.toDate} · {req.reason}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => {
                          soundEffects.playPop();
                          approveLeave(req.id);
                        }}
                        className="btn btn-sm btn-success"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          soundEffects.playPop();
                          rejectLeave(req.id);
                        }}
                        className="btn btn-sm btn-secondary"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Peer Recognition Wall (Kudos Feed) */}
          <div className="zp-card">
            <div className="zp-card-header">
              <div className="zp-card-title">
                <Award size={16} color="#ec4899" />
                <span>Team Recognition Wall</span>
              </div>
              <button
                onClick={() => setActiveModule('performance')}
                style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
              >
                View all →
              </button>
            </div>
            <div className="zp-card-body" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {kudosList.slice(0, 3).map((k) => {
                const rx = reactions[k.id] || {};
                return (
                  <div
                    key={k.id}
                    style={{
                      padding: '14px 16px',
                      backgroundColor: 'var(--bg-muted)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={k.fromAvatar}
                          alt={k.fromEmployeeName}
                          style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          <strong>{k.fromEmployeeName}</strong> recognized <strong>{k.toEmployeeName}</strong>
                        </span>
                      </div>
                      <span className="badge badge-purple">{k.badge}</span>
                    </div>

                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                      "{k.message}"
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {[
                        { emoji: '👏', name: 'clap' },
                        { emoji: '🔥', name: 'fire' },
                        { emoji: '🚀', name: 'rocket' },
                        { emoji: '❤️', name: 'heart' },
                      ].map((item) => {
                        const count = rx[item.name] || 0;
                        return (
                          <button
                            key={item.name}
                            onClick={() => handleReaction(k.id, item.name)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              height: '24px',
                              padding: '0 7px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: count > 0 ? 'var(--primary-tint)' : 'var(--bg-surface)',
                              border: '1px solid var(--border-color)',
                              fontSize: '11px',
                              cursor: 'pointer',
                              color: count > 0 ? 'var(--primary-600)' : 'var(--text-secondary)',
                            }}
                          >
                            <span>{item.emoji}</span>
                            {count > 0 && <span style={{ fontWeight: 600 }}>{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Energy Pulse, Out of Office & Holidays */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Daily Energy Pulse */}
          <div className="zp-card">
            <div className="zp-card-header">
              <div className="zp-card-title">
                <span>Daily Energy Pulse</span>
              </div>
              <span className="badge badge-success">Confidential</span>
            </div>
            <div className="zp-card-body">
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                How is your focus and energy today, {currentUser.firstName}?
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '12px' }}>
                {[
                  { emoji: '🚀', label: 'Energized' },
                  { emoji: '😊', label: 'Great' },
                  { emoji: '⚡', label: 'In Flow' },
                  { emoji: '🥱', label: 'Tired' },
                  { emoji: '🤯', label: 'Busy' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleSelectMood(item.label)}
                    style={{
                      height: '42px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '2px',
                      borderRadius: 'var(--radius-md)',
                      border: userMood === item.label ? '2px solid var(--primary-600)' : '1px solid var(--border-color)',
                      backgroundColor: userMood === item.label ? 'var(--primary-tint)' : 'var(--bg-muted)',
                      cursor: 'pointer',
                      transition: 'transform 0.1s ease',
                    }}
                    title={item.label}
                  >
                    <span style={{ fontSize: '16px' }}>{item.emoji}</span>
                  </button>
                ))}
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {userMood
                  ? `Checked in as "${userMood}". Thanks for sharing!`
                  : 'Click an icon to log your sentiment anonymously.'}
              </div>
            </div>
          </div>

          {/* Out of Office Today */}
          <div className="zp-card">
            <div className="zp-card-header">
              <div className="zp-card-title">
                <Users size={16} color="var(--purple-main)" />
                <span>Who's Away Today</span>
              </div>
              <span className="badge badge-neutral">{employeesOnLeave.length}</span>
            </div>
            <div className="zp-card-body" style={{ padding: '8px 16px' }}>
              {employeesOnLeave.length === 0 ? (
                <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                  No one is on leave today.
                </div>
              ) : (
                employeesOnLeave.map((emp) => (
                  <div
                    key={emp.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 0',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <img
                      src={emp.avatar}
                      alt={emp.firstName}
                      style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {emp.department}
                      </div>
                    </div>
                    <span className="badge badge-purple" style={{ fontSize: '10px' }}>Leave</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Holidays */}
          <div className="zp-card">
            <div className="zp-card-header">
              <div className="zp-card-title">
                <Calendar size={16} color="var(--primary-600)" />
                <span>Upcoming Holidays</span>
              </div>
            </div>
            <div className="zp-card-body" style={{ padding: '8px 16px' }}>
              {holidays.slice(0, 3).map((h) => (
                <div
                  key={h.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {h.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {h.day} · {h.isOptional ? 'Optional' : 'Public Holiday'}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      color: 'var(--primary-600)',
                      backgroundColor: 'var(--primary-tint)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {h.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
