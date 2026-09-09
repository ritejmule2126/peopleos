import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Send,
  X,
  User,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Ticket, TicketPriority, TicketStatus } from '../../../types';

export const HelpdeskView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    tickets,
    createTicket,
    updateTicketStatus,
    addTicketMessage,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'ALL' | TicketStatus>('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);

  // New ticket form
  const [category, setCategory] = useState<Ticket['category']>('IT & Equipment');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  // Reply message in open ticket
  const [replyText, setReplyText] = useState('');

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.employeeName.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    createTicket({
      employeeId: currentUser.id,
      employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
      department: currentUser.department,
      category,
      priority,
      subject,
      description,
      assignedToName: 'Sarah Jenkins (HR)',
    });

    setIsNewTicketModalOpen(false);
    setSubject('');
    setDescription('');
    alert('Ticket submitted to HR Helpdesk.');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    addTicketMessage(selectedTicket.id, replyText);
    setReplyText('');

    // Keep active selected ticket updated
    const updated = tickets.find((t) => t.id === selectedTicket.id);
    if (updated) {
      setSelectedTicket(updated);
    }
  };

  // Sync selectedTicket on state changes
  React.useEffect(() => {
    if (selectedTicket) {
      const refreshed = tickets.find((t) => t.id === selectedTicket.id);
      if (refreshed) setSelectedTicket(refreshed);
    }
  }, [tickets]);

  return (
    <div className="page-body">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="page-title">
            <LifeBuoy size={24} color="#0066ff" />
            HR Services & Helpdesk
          </div>
          <div className="page-subtitle">
            Submit service requests, payroll inquiries, IT hardware requisitions, and policy queries.
          </div>
        </div>

        <button onClick={() => setIsNewTicketModalOpen(true)} className="btn btn-primary">
          <Plus size={16} /> Raise New Case
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search tickets by case ID, title, or employee..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="form-control"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="form-control"
            style={{ width: '150px' }}
          >
            <option value="ALL">All Cases ({tickets.length})</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Main Content: Tickets Table + Drawer/Split Preview */}
      <div className="zp-table-wrapper">
        <table className="zp-table">
          <thead>
            <tr>
              <th>Case Number</th>
              <th>Category</th>
              <th>Subject</th>
              <th>Requested By</th>
              <th>Priority</th>
              <th>Date Created</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                  No cases found matching current filters.
                </td>
              </tr>
            ) : (
              filteredTickets.map((t) => (
                <tr
                  key={t.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedTicket(t)}
                >
                  <td>
                    <span className="badge badge-primary">{t.ticketNumber}</span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#64748b' }}>{t.category}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.subject}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{t.employeeName}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{t.department}</div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        t.priority === 'Urgent'
                          ? 'badge-danger'
                          : t.priority === 'High'
                          ? 'badge-warning'
                          : 'badge-neutral'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#64748b' }}>{t.createdAt}</td>
                  <td>
                    <span
                      className={`badge ${
                        t.status === 'Resolved'
                          ? 'badge-success'
                          : t.status === 'In Progress'
                          ? 'badge-warning'
                          : t.status === 'Open'
                          ? 'badge-danger'
                          : 'badge-neutral'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTicket(t);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      Open Case
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* TICKET DETAILS DRAWER / CHAT */}
      {selectedTicket && (
        <div className="drawer-overlay" onClick={() => setSelectedTicket(null)}>
          <div
            className="drawer-container"
            style={{ width: '560px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge badge-primary">{selectedTicket.ticketNumber}</span>
                  <span
                    className={`badge ${
                      selectedTicket.status === 'Resolved'
                        ? 'badge-success'
                        : selectedTicket.status === 'In Progress'
                        ? 'badge-warning'
                        : 'badge-danger'
                    }`}
                  >
                    {selectedTicket.status}
                  </span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
                  {selectedTicket.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body - Case Details & Comments */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  marginBottom: '20px',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>Category:</span>
                    <div style={{ fontWeight: 600 }}>{selectedTicket.category}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>Priority:</span>
                    <div style={{ fontWeight: 600 }}>{selectedTicket.priority}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>Created By:</span>
                    <div style={{ fontWeight: 600 }}>{selectedTicket.employeeName}</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>Assigned Specialist:</span>
                    <div style={{ fontWeight: 600 }}>{selectedTicket.assignedToName || 'Sarah Jenkins'}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', color: '#334155', lineHeight: 1.5 }}>
                  <strong>Original Query:</strong> {selectedTicket.description}
                </div>
              </div>

              {/* Status Update Bar (for Admin / Manager) */}
              {(currentRole === 'HR_ADMIN' || currentRole === 'MANAGER') && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: '#eff6ff',
                    borderRadius: '8px',
                    marginBottom: '20px',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e40af' }}>
                    Update Ticket Status:
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => updateTicketStatus(selectedTicket.id, 'In Progress')}
                      className="btn btn-secondary btn-sm"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() =>
                        updateTicketStatus(selectedTicket.id, 'Resolved', 'Issue addressed and resolved.')
                      }
                      className="btn btn-success btn-sm"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              )}

              {/* Conversation Messages */}
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px' }}>
                Conversation History
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedTicket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: msg.senderId === currentUser.id ? '#eff6ff' : '#f8fafc',
                      border: '1px solid',
                      borderColor: msg.senderId === currentUser.id ? '#bfdbfe' : '#e2e8f0',
                      alignSelf: msg.senderId === currentUser.id ? 'flex-end' : 'flex-start',
                      maxWidth: '90%',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '12px', color: '#0f172a' }}>{msg.senderName}</strong>
                      <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                        {msg.senderRole}
                      </span>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>{msg.timestamp}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.4 }}>{msg.message}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Input Box */}
            <form
              onSubmit={handleSendReply}
              style={{
                padding: '16px 20px',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                gap: '10px',
              }}
            >
              <input
                type="text"
                placeholder="Type your response or update..."
                className="form-control"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={!replyText.trim()}>
                <Send size={15} /> Reply
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NEW TICKET */}
      {isNewTicketModalOpen && (
        <div className="modal-overlay" onClick={() => setIsNewTicketModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Raise New HR Helpdesk Ticket</div>
              <button
                onClick={() => setIsNewTicketModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTicket}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-control"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                    >
                      <option value="IT & Equipment">IT & Hardware Support</option>
                      <option value="Payroll & Compensation">Payroll & Compensation</option>
                      <option value="Leaves & Attendance">Leaves & Attendance</option>
                      <option value="HR Policies">Company Policies</option>
                      <option value="Benefits & Insurance">Benefits & Medical Coverage</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority Level *</label>
                    <select
                      className="form-control"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Ergonomic chair requisition for home workstation"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Description *</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Describe your query or request with all relevant details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
