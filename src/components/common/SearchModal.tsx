import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  User,
  LifeBuoy,
  Calendar,
  LayoutDashboard,
  Clock,
  Award,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Plus,
  Play,
  Square,
  Shield,
  CornerDownLeft,
  Command,
} from 'lucide-react';
import { useApp, NavigationModule } from '../../context/AppContext';
import { soundEffects } from '../../services/soundEffects';

type FilterCategory = 'all' | 'actions' | 'people' | 'modules' | 'tickets';

export const SearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    employees,
    tickets,
    leaveRequests,
    setActiveModule,
    switchUser,
    isPunchedIn,
    punchIn,
    punchOut,
    theme,
    toggleTheme,
    setRole,
  } = useApp();

  const [term, setTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        soundEffects.playPop();
        setIsSearchModalOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchModalOpen]);

  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const quickActions = [
    {
      id: 'act-punch',
      title: isPunchedIn ? 'Punch Out (End Work Shift)' : 'Punch In (Start Work Shift)',
      category: 'actions',
      icon: isPunchedIn ? Square : Play,
      color: isPunchedIn ? '#ef4444' : '#10b981',
      run: () => {
        if (isPunchedIn) {
          soundEffects.playPunchOut();
          punchOut();
        } else {
          soundEffects.playPunchIn();
          punchIn();
        }
        setIsSearchModalOpen(false);
      },
    },
    {
      id: 'act-leave',
      title: 'Apply for Leave / Time Off',
      category: 'actions',
      icon: Calendar,
      color: '#3b82f6',
      run: () => {
        soundEffects.playPop();
        setActiveModule('leaves');
        setIsSearchModalOpen(false);
      },
    },
    {
      id: 'act-kudos',
      title: 'Send Peer Recognition & Kudos',
      category: 'actions',
      icon: Award,
      color: '#ec4899',
      run: () => {
        soundEffects.playPop();
        setActiveModule('performance');
        setIsSearchModalOpen(false);
      },
    },
    {
      id: 'act-ticket',
      title: 'Raise Support Ticket / Case',
      category: 'actions',
      icon: LifeBuoy,
      color: '#f59e0b',
      run: () => {
        soundEffects.playPop();
        setActiveModule('helpdesk');
        setIsSearchModalOpen(false);
      },
    },
    {
      id: 'act-theme',
      title: theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme',
      category: 'actions',
      icon: theme === 'dark' ? Sun : Moon,
      color: theme === 'dark' ? '#f59e0b' : '#6366f1',
      run: () => {
        soundEffects.playPop();
        toggleTheme();
        setIsSearchModalOpen(false);
      },
    },
    {
      id: 'act-sound',
      title: soundEffects.getIsMuted() ? 'Unmute Audio Feedback Chimes' : 'Mute Audio Feedback Chimes',
      category: 'actions',
      icon: soundEffects.getIsMuted() ? Volume2 : VolumeX,
      color: '#10b981',
      run: () => {
        soundEffects.toggleMute();
        soundEffects.playPop();
        setIsSearchModalOpen(false);
      },
    },
    {
      id: 'act-founder',
      title: 'Switch Experience to Founder (Sarah Jenkins)',
      category: 'actions',
      icon: Shield,
      color: '#2563eb',
      run: () => {
        soundEffects.playPop();
        setRole('FOUNDER');
        setIsSearchModalOpen(false);
      },
    },
  ];

  const modules = [
    { id: 'dashboard', title: 'Dashboard & Home', icon: LayoutDashboard },
    { id: 'employees', title: 'Employee Directory & Org Chart', icon: User },
    { id: 'attendance', title: 'Attendance & Time Tracker', icon: Clock },
    { id: 'leaves', title: 'Leave Tracker & Approvals', icon: Calendar },
    { id: 'performance', title: 'Performance, KRAs & Kudos', icon: Award },
    { id: 'helpdesk', title: 'HR Helpdesk & Cases', icon: LifeBuoy },
  ];

  const filteredActions = quickActions.filter(
    (a) =>
      (selectedCategory === 'all' || selectedCategory === 'actions') &&
      (!term.trim() || a.title.toLowerCase().includes(term.toLowerCase()))
  );

  const filteredEmployees = employees.filter(
    (e) =>
      (selectedCategory === 'all' || selectedCategory === 'people') &&
      (!term.trim() ||
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(term.toLowerCase()) ||
        e.email.toLowerCase().includes(term.toLowerCase()) ||
        e.department.toLowerCase().includes(term.toLowerCase()) ||
        e.designation.toLowerCase().includes(term.toLowerCase()))
  );

  const filteredTickets = tickets.filter(
    (t) =>
      (selectedCategory === 'all' || selectedCategory === 'tickets') &&
      term.trim() &&
      (t.ticketNumber.toLowerCase().includes(term.toLowerCase()) ||
        t.subject.toLowerCase().includes(term.toLowerCase()) ||
        t.employeeName.toLowerCase().includes(term.toLowerCase()))
  );

  return (
    <div className="modal-overlay" onClick={() => setIsSearchModalOpen(false)}>
      <div
        className="modal-container"
        style={{
          maxWidth: '640px',
          marginTop: '60px',
          alignSelf: 'flex-start',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-tint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Command size={16} color="#0066ff" />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, action, employee, or module..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              backgroundColor: 'transparent',
            }}
          />
          {term && (
            <button
              onClick={() => setTerm('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}
          <kbd
            style={{
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-surface-secondary)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Category Filter Pills */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            padding: '8px 18px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-secondary)',
            overflowX: 'auto',
          }}
        >
          {(['all', 'actions', 'people', 'modules', 'tickets'] as FilterCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                backgroundColor: selectedCategory === cat ? '#0066ff' : 'transparent',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Container */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '12px 16px' }}>
          {/* Actions Section */}
          {filteredActions.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                  letterSpacing: '0.5px',
                }}
              >
                Instant Actions
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {filteredActions.map((act) => {
                  const Icon = act.icon;
                  return (
                    <div
                      key={act.id}
                      onClick={act.run}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                        e.currentTarget.style.borderColor = '#0066ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-surface-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={14} color={act.color} />
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {act.title}
                        </span>
                      </div>
                      <CornerDownLeft size={13} color="var(--text-muted)" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modules Section */}
          {(selectedCategory === 'all' || selectedCategory === 'modules') && !term && (
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                  letterSpacing: '0.5px',
                }}
              >
                Quick Jump
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {modules.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        soundEffects.playPop();
                        setActiveModule(m.id as any);
                        setIsSearchModalOpen(false);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ justifyContent: 'flex-start', padding: '8px 10px' }}
                    >
                      <Icon size={14} color="#0066ff" />
                      <span>{m.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Employees match */}
          {filteredEmployees.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                  letterSpacing: '0.5px',
                }}
              >
                People ({filteredEmployees.length})
              </div>
              {filteredEmployees.slice(0, 5).map((emp) => (
                <div
                  key={emp.id}
                  onClick={() => {
                    soundEffects.playPop();
                    switchUser(emp.id);
                    setActiveModule('employees');
                    setIsSearchModalOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginBottom: '4px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--hover-bg)';
                    e.currentTarget.style.borderColor = '#0066ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <img
                    src={emp.avatar}
                    alt={emp.firstName}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {emp.firstName} {emp.lastName}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {emp.designation} · {emp.department} · {emp.employeeId}
                    </div>
                  </div>
                  <span className={`badge ${emp.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                    {emp.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Tickets match */}
          {filteredTickets.length > 0 && (
            <div style={{ marginTop: '14px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                  letterSpacing: '0.5px',
                }}
              >
                Helpdesk Tickets ({filteredTickets.length})
              </div>
              {filteredTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    soundEffects.playPop();
                    setActiveModule('helpdesk');
                    setIsSearchModalOpen(false);
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    marginBottom: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {t.ticketNumber}: {t.subject}
                    </span>
                    <span className="badge badge-warning">{t.status}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Requester: {t.employeeName} · {t.category}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '10px 18px',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-surface-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--text-muted)',
          }}
        >
          <span>Use <strong>↑</strong> <strong>↓</strong> to navigate, <strong>↵</strong> to select</span>
          <span>Super Command Palette 2.0</span>
        </div>
      </div>
    </div>
  );
};
