import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  Check,
  X,
  FileText,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { LeaveTypeCode } from '../../../types';

export const LeavesView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    leaveBalances,
    leaveRequests,
    applyLeave,
    approveLeave,
    rejectLeave,
    holidays,
    getDownlineEmployeeIds,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'myLeaves' | 'approvals' | 'calendar'>('myLeaves');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Apply Form State
  const [formType, setFormType] = useState<LeaveTypeCode>('CL');
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState<'First Half' | 'Second Half'>('First Half');
  const [reason, setReason] = useState('');

  const userBalance = leaveBalances[currentUser.id] || {
    CL: { total: 12, used: 2, remaining: 10 },
    SL: { total: 10, used: 1, remaining: 9 },
    PL: { total: 15, used: 4, remaining: 11 },
    ML: { total: 14, used: 0, remaining: 14 },
    UL: { total: 30, used: 0, remaining: 30 },
  };

  // Calculate day difference
  const calculateDays = () => {
    if (isHalfDay) return 0.5;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) ? 1 : diffDays;
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please provide a reason for the leave request.');
      return;
    }

    const calculatedDays = calculateDays();
    const available = userBalance[formType]?.remaining || 0;

    if (calculatedDays > available) {
      if (!confirm(`You only have ${available} days available for this leave type. Do you want to proceed anyway?`)) {
        return;
      }
    }

    applyLeave({
      employeeId: currentUser.id,
      employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
      department: currentUser.department,
      leaveType: formType,
      fromDate,
      toDate,
      days: calculatedDays,
      isHalfDay,
      halfDaySession: isHalfDay ? halfDaySession : undefined,
      reason,
      approverId: currentUser.managerId || undefined,
      approverName: currentUser.managerName || 'Sarah Jenkins',
    });

    setIsApplyModalOpen(false);
    setReason('');
    alert('Leave request submitted successfully!');
  };

  const myRequests = leaveRequests.filter((r) => r.employeeId === currentUser.id);

  // Downline subordinates for senior manager
  const downlineIds = getDownlineEmployeeIds(currentUser.id);
  const canViewApprovals = currentRole === 'FOUNDER' || currentRole === 'HR_ADMIN' || downlineIds.length > 0;

  // Approvals queue strictly shows junior downline reports for managers, or all for Founder/HR
  const pendingApprovals = leaveRequests.filter((r) => {
    if (r.status !== 'Pending') return false;
    if (currentRole === 'FOUNDER' || currentRole === 'HR_ADMIN') return true;
    return downlineIds.includes(r.employeeId);
  });

  return (
    <div className="page-body">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="page-title">
            <CalendarDays size={24} color="#0066ff" />
            Leave Tracker & Time Off
          </div>
          <div className="page-subtitle">
            Apply for leave, monitor balance entitlements, and review team approval queues.
          </div>
        </div>

        <button onClick={() => setIsApplyModalOpen(true)} className="btn btn-primary">
          <Plus size={16} /> Apply Leave
        </button>
      </div>

      {/* Leave Quota Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <div className="zp-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>CASUAL LEAVE (CL)</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--primary-600)', margin: '4px 0' }}>
            {userBalance.CL.remaining}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Used: {userBalance.CL.used} · Total: {userBalance.CL.total}
          </div>
        </div>

        <div className="zp-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>SICK LEAVE (SL)</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--success-main)', margin: '4px 0' }}>
            {userBalance.SL.remaining}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Used: {userBalance.SL.used} · Total: {userBalance.SL.total}
          </div>
        </div>

        <div className="zp-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>PRIVILEGE LEAVE (PL)</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--purple-main)', margin: '4px 0' }}>
            {userBalance.PL.remaining}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Used: {userBalance.PL.used} · Total: {userBalance.PL.total}
          </div>
        </div>

        <div className="zp-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>PARENTAL LEAVE (ML)</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--warning-main)', margin: '4px 0' }}>
            {userBalance.ML.remaining}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Available days</div>
        </div>

        <div className="zp-card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>UNPAID LEAVE (UL)</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-secondary)', margin: '4px 0' }}>
            {userBalance.UL.remaining}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Available days</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav">
        <button
          onClick={() => setActiveTab('myLeaves')}
          className={`tab-btn ${activeTab === 'myLeaves' ? 'active' : ''}`}
        >
          My Applications ({myRequests.length})
        </button>

        {canViewApprovals && (
          <button
            onClick={() => setActiveTab('approvals')}
            className={`tab-btn ${activeTab === 'approvals' ? 'active' : ''}`}
          >
            <span>Approvals Queue</span>
            {pendingApprovals.length > 0 && (
              <span className="badge badge-danger">{pendingApprovals.length}</span>
            )}
          </button>
        )}

        <button
          onClick={() => setActiveTab('calendar')}
          className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
        >
          Company Holidays ({holidays.length})
        </button>
      </div>

      {/* TAB 1: My Leaves */}
      {activeTab === 'myLeaves' && (
        <div className="zp-table-wrapper">
          <table className="zp-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>From Date</th>
                <th>To Date</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Applied On</th>
                <th>Approver</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    No leave requests found. Click "Apply Leave" above to schedule time off.
                  </td>
                </tr>
              ) : (
                myRequests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <span className="badge badge-primary">{req.leaveType}</span>
                    </td>
                    <td>{req.fromDate}</td>
                    <td>{req.toDate}</td>
                    <td>
                      <strong>{req.days} {req.days === 1 ? 'day' : 'days'}</strong>
                      {req.isHalfDay && <span style={{ fontSize: '11px', color: '#64748b' }}> ({req.halfDaySession})</span>}
                    </td>
                    <td style={{ maxWidth: '240px', color: '#475569' }}>{req.reason}</td>
                    <td>{req.appliedOn}</td>
                    <td>{req.approverName || 'Alex Rivera'}</td>
                    <td>
                      <span
                        className={`badge ${
                          req.status === 'Approved'
                            ? 'badge-success'
                            : req.status === 'Pending'
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: Approvals Queue */}
      {activeTab === 'approvals' && (
        <div className="zp-table-wrapper">
          <table className="zp-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Dates</th>
                <th>Reason</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingApprovals.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                    🎉 No pending requests in queue. All approvals are up to date!
                  </td>
                </tr>
              ) : (
                pendingApprovals.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{req.employeeName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>ID: {req.employeeId}</div>
                    </td>
                    <td>{req.department}</td>
                    <td>
                      <span className="badge badge-primary">{req.leaveType}</span>
                    </td>
                    <td>
                      <strong>{req.days} {req.days === 1 ? 'day' : 'days'}</strong>
                    </td>
                    <td>
                      {req.fromDate} to {req.toDate}
                    </td>
                    <td style={{ maxWidth: '240px', fontStyle: 'italic', color: '#475569' }}>
                      "{req.reason}"
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => approveLeave(req.id, 'Approved by manager')}
                          className="btn btn-sm btn-success"
                        >
                          <Check size={13} /> Approve
                        </button>
                        <button
                          onClick={() => rejectLeave(req.id, 'Denied due to project deliverables')}
                          className="btn btn-sm btn-danger"
                        >
                          <X size={13} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: Company Holidays */}
      {activeTab === 'calendar' && (
        <div className="zp-card">
          <div className="zp-card-header">
            <div className="zp-card-title">
              <Calendar size={18} color="#0066ff" />
              Corporate Holiday Calendar 2026
            </div>
          </div>
          <div className="zp-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {holidays.map((h) => (
                <div
                  key={h.id}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>{h.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{h.day}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-primary">{h.date}</span>
                    {h.isOptional && <div style={{ fontSize: '10px', color: '#f59e0b', marginTop: '2px' }}>Optional</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPLY FOR LEAVE */}
      {isApplyModalOpen && (
        <div className="modal-overlay" onClick={() => setIsApplyModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Apply for Leave / Time Off</div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApplySubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Leave Type *</label>
                  <select
                    className="form-control"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as LeaveTypeCode)}
                  >
                    <option value="CL">Casual Leave (CL) - Available: {userBalance.CL.remaining}</option>
                    <option value="SL">Sick Leave (SL) - Available: {userBalance.SL.remaining}</option>
                    <option value="PL">Privilege Leave (PL) - Available: {userBalance.PL.remaining}</option>
                    <option value="ML">Maternity/Paternity (ML) - Available: {userBalance.ML.remaining}</option>
                    <option value="UL">Unpaid Leave (UL)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">From Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">To Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isHalfDay}
                      onChange={(e) => setIsHalfDay(e.target.checked)}
                    />
                    <span>Half Day Application</span>
                  </label>

                  {isHalfDay && (
                    <select
                      className="form-control"
                      style={{ width: '150px' }}
                      value={halfDaySession}
                      onChange={(e) => setHalfDaySession(e.target.value as any)}
                    >
                      <option value="First Half">First Half</option>
                      <option value="Second Half">Second Half</option>
                    </select>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Reason *</label>
                  <textarea
                    className="form-control"
                    placeholder="Brief description of your leave reason..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#64748b' }}>
                  Total Duration: <strong>{calculateDays()} day(s)</strong> · Request will be routed to{' '}
                  <strong>{currentUser.managerName || 'Sarah Jenkins'}</strong> for approval.
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Leave Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
