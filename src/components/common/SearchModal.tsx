import React, { useState, useEffect } from 'react';
import { Search, X, User, LifeBuoy, Calendar, LayoutDashboard } from 'lucide-react';
import { useApp, NavigationModule } from '../../context/AppContext';

export const SearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    employees,
    tickets,
    leaveRequests,
    setActiveModule,
    switchUser,
  } = useApp();

  const [term, setTerm] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const filteredEmployees = term.trim()
    ? employees.filter(
        (e) =>
          `${e.firstName} ${e.lastName}`.toLowerCase().includes(term.toLowerCase()) ||
          e.email.toLowerCase().includes(term.toLowerCase()) ||
          e.department.toLowerCase().includes(term.toLowerCase()) ||
          e.designation.toLowerCase().includes(term.toLowerCase())
      )
    : employees.slice(0, 4);

  const filteredTickets = term.trim()
    ? tickets.filter(
        (t) =>
          t.ticketNumber.toLowerCase().includes(term.toLowerCase()) ||
          t.subject.toLowerCase().includes(term.toLowerCase()) ||
          t.employeeName.toLowerCase().includes(term.toLowerCase())
      )
    : [];

  const filteredLeaves = term.trim()
    ? leaveRequests.filter(
        (l) =>
          l.employeeName.toLowerCase().includes(term.toLowerCase()) ||
          l.leaveType.toLowerCase().includes(term.toLowerCase()) ||
          l.reason.toLowerCase().includes(term.toLowerCase())
      )
    : [];

  const handleNavigate = (module: NavigationModule) => {
    setActiveModule(module);
    setIsSearchModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsSearchModalOpen(false)}>
      <div
        className="modal-container"
        style={{ maxWidth: '640px', marginTop: '60px', alignSelf: 'flex-start' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #e2e8f0' }}>
          <Search size={20} color="#0066ff" />
          <input
            type="text"
            placeholder="Search employees, tickets, leaves, or modules..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              color: '#0f172a',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={() => setIsSearchModalOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '12px 16px' }}>
          {/* Quick Navigation suggestions */}
          {!term.trim() && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                Quick Jump
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <button
                  onClick={() => handleNavigate('employees')}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start' }}
                >
                  <User size={14} /> Directory
                </button>
                <button
                  onClick={() => handleNavigate('attendance')}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start' }}
                >
                  <Calendar size={14} /> Timesheets
                </button>
                <button
                  onClick={() => handleNavigate('leaves')}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start' }}
                >
                  <Calendar size={14} /> Leave Tracker
                </button>
              </div>
            </div>
          )}

          {/* Employees match */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
              Employees ({filteredEmployees.length})
            </div>
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                onClick={() => {
                  switchUser(emp.id);
                  handleNavigate('employees');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '4px',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
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
                <span className="badge badge-primary">{emp.employeeId}</span>
              </div>
            ))}
          </div>

          {/* Tickets match */}
          {filteredTickets.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                Cases / Tickets ({filteredTickets.length})
              </div>
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => handleNavigate('helpdesk')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginBottom: '4px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LifeBuoy size={16} color="#0066ff" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                      {ticket.ticketNumber}: {ticket.subject}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      By {ticket.employeeName} · {ticket.status}
                    </div>
                  </div>
                  <span className={`badge ${ticket.status === 'Open' ? 'badge-danger' : 'badge-warning'}`}>
                    {ticket.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Leaves match */}
          {filteredLeaves.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                Leave Requests ({filteredLeaves.length})
              </div>
              {filteredLeaves.map((leave) => (
                <div
                  key={leave.id}
                  onClick={() => handleNavigate('leaves')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginBottom: '4px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Calendar size={16} color="#8b5cf6" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                      {leave.employeeName} - {leave.leaveType} ({leave.days} day(s))
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {leave.fromDate} to {leave.toDate} · {leave.reason}
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      leave.status === 'Approved'
                        ? 'badge-success'
                        : leave.status === 'Pending'
                        ? 'badge-warning'
                        : 'badge-danger'
                    }`}
                  >
                    {leave.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
