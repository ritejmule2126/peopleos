import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  Coffee,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { AttendanceStatus } from '../../../types';

export const AttendanceView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    employees,
    attendance,
    isPunchedIn,
    isOnBreak,
    workTimerSeconds,
    punchIn,
    punchOut,
    toggleBreak,
    requestRegularization,
    getDownlineEmployeeIds,
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [viewTab, setViewTab] = useState<'myAttendance' | 'teamAttendance'>('myAttendance');
  const [regularizeRecordId, setRegularizeRecordId] = useState<string | null>(null);
  const [regularizeReason, setRegularizeReason] = useState('');

  // Format timer
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Down-tree subordinated calculation
  const downlineIds = getDownlineEmployeeIds(currentUser.id);
  const canViewTeam = currentRole === 'FOUNDER' || currentRole === 'HR_ADMIN' || downlineIds.length > 0;

  // Team attendance scoped to downline reports for seniors, or all for Founder/HR
  const teamLogs = attendance.filter((rec) => {
    if (currentRole === 'FOUNDER' || currentRole === 'HR_ADMIN') return true;
    return downlineIds.includes(rec.employeeId);
  });

  // User's personal logs
  const userLogs = attendance.filter((a) => a.employeeId === currentUser.id);

  // Stats calculation
  const presentDays = userLogs.filter((l) => l.status === 'Present').length;
  const lateDays = userLogs.filter((l) => l.status === 'Late').length;
  const halfDays = userLogs.filter((l) => l.status === 'Half-day').length;
  const leaveDays = userLogs.filter((l) => l.status === 'On Leave').length;
  const avgHours = (
    userLogs.reduce((acc, curr) => acc + curr.totalHours, 0) / (userLogs.length || 1)
  ).toFixed(1);

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'Present':
        return <span className="badge badge-success">Present</span>;
      case 'Late':
        return <span className="badge badge-warning">Late Arrival</span>;
      case 'Half-day':
        return <span className="badge badge-warning">Half Day</span>;
      case 'On Leave':
        return <span className="badge badge-purple">On Leave</span>;
      case 'Holiday':
        return <span className="badge badge-primary">Holiday</span>;
      case 'Absent':
        return <span className="badge badge-danger">Absent</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const handleRegularizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regularizeRecordId && regularizeReason.trim()) {
      requestRegularization(regularizeRecordId, regularizeReason);
      setRegularizeRecordId(null);
      setRegularizeReason('');
      alert('Regularization request submitted to your manager for approval.');
    }
  };

  const exportAttendanceCSV = () => {
    const records = viewTab === 'myAttendance' ? userLogs : attendance;
    const headers = ['Date', 'Employee ID', 'Check In', 'Check Out', 'Total Hours', 'Break (mins)', 'Status'];
    const rows = records.map((r) => [
      r.date,
      r.employeeId,
      r.checkIn || '—',
      r.checkOut || '—',
      r.totalHours,
      r.breakMinutes,
      r.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `peopleos_attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="page-title">
            <Clock size={24} color="#0066ff" />
            Time & Attendance Tracker
          </div>
          <div className="page-subtitle">
            Shift scheduling, check-in punch logs, overtime calculations, and regularizations.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportAttendanceCSV} className="btn btn-secondary">
            <Download size={15} /> Export Timesheet
          </button>
        </div>
      </div>

      {/* Top Terminal & Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '16px', marginBottom: '24px' }}>
        {/* Check-in Clock Terminal */}
        <div className="zp-card">
          <div className="zp-card-header">
            <div className="zp-card-title">
              <Clock size={16} color="var(--primary-600)" />
              <span>Shift Terminal</span>
            </div>
            <span className={`badge ${isPunchedIn ? (isOnBreak ? 'badge-warning' : 'badge-success') : 'badge-neutral'}`}>
              {isPunchedIn ? (isOnBreak ? 'Break' : 'Active Duty') : 'Signed Off'}
            </span>
          </div>

          <div className="zp-card-body">
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Today's Working Hours
              </div>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-primary)',
                  letterSpacing: '0.02em',
                  margin: '6px 0',
                }}
              >
                {formatTimer(workTimerSeconds)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Shift: 09:00 AM - 06:00 PM · <strong>8h Target</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              {isPunchedIn ? (
                <>
                  <button onClick={toggleBreak} className="btn btn-secondary" style={{ flex: 1 }}>
                    <Coffee size={14} />
                    {isOnBreak ? 'Resume Work' : 'Take Break'}
                  </button>
                  <button onClick={punchOut} className="btn btn-danger" style={{ flex: 1 }}>
                    <Square size={14} />
                    Check Out
                  </button>
                </>
              ) : (
                <button onClick={punchIn} className="btn btn-success" style={{ width: '100%' }}>
                  <Play size={14} />
                  Check In (Start Shift)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Attendance Metrics */}
        <div className="zp-card">
          <div className="zp-card-header">
            <div className="zp-card-title">
              <Calendar size={16} color="var(--primary-600)" />
              <span>September 2026 Summary</span>
            </div>
          </div>
          <div className="zp-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>PRESENT DAYS</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success-main)', margin: '4px 0' }}>
                  {presentDays}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>On time records</div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>LATE / HALF-DAY</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--warning-main)', margin: '4px 0' }}>
                  {lateDays + halfDays}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Grace allowed</div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>LEAVES TAKEN</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--purple-main)', margin: '4px 0' }}>
                  {leaveDays}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Approved time off</div>
              </div>

              <div style={{ padding: '12px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>AVG DAILY HOURS</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-600)', margin: '4px 0' }}>
                  {avgHours}h
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Productivity</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: My Attendance vs Team Attendance (if Manager or Admin) */}
      <div className="tab-nav">
        <button
          onClick={() => setViewTab('myAttendance')}
          className={`tab-btn ${viewTab === 'myAttendance' ? 'active' : ''}`}
        >
          My Attendance Log
        </button>

        {canViewTeam && (
          <button
            onClick={() => setViewTab('teamAttendance')}
            className={`tab-btn ${viewTab === 'teamAttendance' ? 'active' : ''}`}
          >
            {currentRole === 'FOUNDER' || currentRole === 'HR_ADMIN'
              ? 'Organization Attendance Log'
              : `Downline Reports (${downlineIds.length})`}
          </button>
        )}
      </div>

      {/* Table: Attendance Log */}
      <div className="zp-table-wrapper">
        <table className="zp-table">
          <thead>
            <tr>
              <th>Date</th>
              {viewTab === 'teamAttendance' && <th>Employee</th>}
              <th>Check In</th>
              <th>Check Out</th>
              <th>Work Duration</th>
              <th>Break</th>
              <th>Status</th>
              <th>Regularization</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {(viewTab === 'myAttendance' ? userLogs : teamLogs).map((rec) => {
              const emp = employees.find((e) => e.id === rec.employeeId);
              return (
                <tr key={rec.id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{rec.date}</td>
                  {viewTab === 'teamAttendance' && (
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={emp?.avatar}
                          alt={emp?.firstName}
                          style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '12px' }}>
                            {emp?.firstName} {emp?.lastName}
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748b' }}>{emp?.department}</div>
                        </div>
                      </div>
                    </td>
                  )}
                  <td>{rec.checkIn || '—'}</td>
                  <td>{rec.checkOut || (rec.checkIn ? 'Active In Progress' : '—')}</td>
                  <td>
                    <strong>{rec.totalHours > 0 ? `${rec.totalHours} hrs` : '—'}</strong>
                  </td>
                  <td>{rec.breakMinutes > 0 ? `${rec.breakMinutes} mins` : '—'}</td>
                  <td>{getStatusBadge(rec.status)}</td>
                  <td>
                    {rec.regularizationStatus === 'Requested' ? (
                      <span className="badge badge-warning">Regularization Pending</span>
                    ) : rec.regularizationStatus === 'Approved' ? (
                      <span className="badge badge-success">Regularized</span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Normal</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {!rec.regularizationStatus && rec.status !== 'Present' && rec.status !== 'Holiday' ? (
                      <button
                        onClick={() => setRegularizeRecordId(rec.id)}
                        className="btn btn-secondary btn-sm"
                      >
                        Regularize
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>None</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* REGULARIZATION MODAL */}
      {regularizeRecordId && (
        <div className="modal-overlay" onClick={() => setRegularizeRecordId(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Attendance Regularization Request</div>
            </div>
            <form onSubmit={handleRegularizeSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
                  Submit an official correction for forgotten check-in, system outage, or client field duty.
                </p>
                <div className="form-group">
                  <label className="form-label">Reason for Discrepancy *</label>
                  <textarea
                    className="form-control"
                    placeholder="e.g. Worked from on-site client meeting during morning shift..."
                    value={regularizeReason}
                    onChange={(e) => setRegularizeReason(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setRegularizeRecordId(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit to Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
