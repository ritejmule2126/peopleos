import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Calendar,
  Clock,
  Heart,
  Users,
  LifeBuoy,
  ChevronRight,
  Maximize2,
  Minimize2,
  RefreshCw,
} from 'lucide-react';
import { useApp, NavigationModule } from '../../context/AppContext';
import { soundEffects } from '../../services/soundEffects';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  action?: {
    label: string;
    module: NavigationModule;
  };
}

export const CopilotDrawer: React.FC = () => {
  const {
    currentUser,
    leaveBalances,
    leaveRequests,
    employees,
    holidays,
    isPunchedIn,
    workTimerSeconds,
    tickets,
    setActiveModule,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${currentUser.firstName}! 👋 I am **PeopleOS Copilot**, your workplace intelligence assistant. How can I help you today?`,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    { label: '🌴 Leave Balances', prompt: 'What are my remaining leave balances?' },
    { label: '👥 Who is out today?', prompt: 'Who is on leave today in the company?' },
    { label: '⏱️ Working hours today', prompt: 'How many hours have I worked today?' },
    { label: '🎉 Send Kudos', prompt: 'How do I appreciate a team member?' },
    { label: '📅 Upcoming Holidays', prompt: 'What are our upcoming public holidays?' },
  ];

  const handleSend = (userQuery?: string) => {
    const query = (userQuery || inputText).trim();
    if (!query) return;

    soundEffects.playPop();

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!userQuery) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      generateResponse(query);
      setIsTyping(false);
    }, 600);
  };

  const generateResponse = (query: string) => {
    const q = query.toLowerCase();
    let replyText = '';
    let actionTarget: { label: string; module: NavigationModule } | undefined = undefined;

    const userBal = leaveBalances[currentUser.id] || {
      CL: { total: 12, remaining: 10 },
      SL: { total: 10, remaining: 9 },
      PL: { total: 15, remaining: 11 },
    };

    if (q.includes('leave balance') || q.includes('how many leaves') || q.includes('time off')) {
      replyText = `Here is your current leave quota breakdown:\n\n` +
        `• **Casual Leave (CL)**: **${userBal.CL.remaining}** days remaining (of ${userBal.CL.total})\n` +
        `• **Sick Leave (SL)**: **${userBal.SL.remaining}** days remaining (of ${userBal.SL.total})\n` +
        `• **Privilege Leave (PL)**: **${userBal.PL.remaining}** days remaining (of ${userBal.PL.total})\n\n` +
        `Would you like to file a new leave application?`;
      actionTarget = { label: 'Go to Leave Tracker', module: 'leaves' };
    } else if (q.includes('who is on leave') || q.includes('out today') || q.includes('who is out')) {
      const onLeave = employees.filter((e) => e.status === 'On Leave');
      if (onLeave.length === 0) {
        replyText = `Great news! Everyone is active and present at work today across all departments. 🎉`;
      } else {
        const names = onLeave.map((e) => `• **${e.firstName} ${e.lastName}** (${e.department} - ${e.designation})`).join('\n');
        replyText = `There are currently **${onLeave.length}** team members on leave today:\n\n${names}`;
      }
      actionTarget = { label: 'View Employee Directory', module: 'employees' };
    } else if (q.includes('hours') || q.includes('worked today') || q.includes('attendance') || q.includes('timer')) {
      const hrs = Math.floor(workTimerSeconds / 3600);
      const mins = Math.floor((workTimerSeconds % 3600) / 60);
      replyText = isPunchedIn
        ? `You are currently **Checked In**. You have logged **${hrs}h ${mins}m** so far today against your standard 8.0-hour shift target.`
        : `You are currently **Checked Out**. Clock in using the top bar or Attendance tab to start tracking your working hours.`;
      actionTarget = { label: 'View Attendance Records', module: 'attendance' };
    } else if (q.includes('holiday') || q.includes('holidays') || q.includes('vacation')) {
      const upcoming = holidays.slice(4, 7).map((h) => `• **${h.name}**: ${h.date} (${h.day})`).join('\n');
      replyText = `Here are the upcoming company holidays on the calendar:\n\n${upcoming}`;
      actionTarget = { label: 'View Leave Calendar', module: 'leaves' };
    } else if (q.includes('kudos') || q.includes('appreciate') || q.includes('praise')) {
      replyText = `You can celebrate great work by sending a peer recognition badge on the Kudos Wall! Badges include *Innovator*, *Team Player*, *Problem Solver*, and *Speed Demon*.`;
      actionTarget = { label: 'Open Kudos & Goals Wall', module: 'performance' };
    } else if (q.includes('ticket') || q.includes('support') || q.includes('it equipment') || q.includes('help')) {
      const openCount = tickets.filter((t) => t.status === 'Open').length;
      replyText = `You have **${openCount}** open support cases with HR & IT Helpdesk. You can create a new ticket or check resolution progress at any time.`;
      actionTarget = { label: 'Open HR Helpdesk', module: 'helpdesk' };
    } else {
      replyText = `I can help you navigate PeopleOS, check leave quotas, summarize team attendance, draft peer appreciations, or lookup organization policies. What would you like to explore?`;
      actionTarget = { label: 'View Dashboard', module: 'dashboard' };
    }

    const aiMsg: Message = {
      id: String(Date.now()),
      sender: 'ai',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: actionTarget,
    };

    setMessages((prev) => [...prev, aiMsg]);
  };

  return (
    <>
      {/* Floating Launcher Trigger */}
      <button
        onClick={() => {
          soundEffects.playPop();
          setIsOpen(!isOpen);
        }}
        title="PeopleOS Copilot Assistant (⌘J)"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          height: '50px',
          padding: '0 18px',
          borderRadius: '25px',
          backgroundColor: '#0066ff',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 8px 24px rgba(0, 102, 255, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          zIndex: 900,
          fontWeight: 600,
          fontSize: '13px',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 102, 255, 0.45)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 102, 255, 0.35)';
        }}
      >
        <div
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sparkles size={15} color="#ffffff" />
        </div>
        <span>AI Copilot</span>
        <span
          style={{
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            fontWeight: 700,
          }}
        >
          ⌘J
        </span>
      </button>

      {/* Slide-out Copilot Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '86px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '540px',
            maxHeight: 'calc(100vh - 110px)',
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 950,
            animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0066ff 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0, 102, 255, 0.3)',
                }}
              >
                <Bot size={18} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  PeopleOS Copilot
                </div>
                <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  Live Workspace Intelligence
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '86%',
                    padding: '10px 14px',
                    borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    backgroundColor: msg.sender === 'user' ? '#0066ff' : 'var(--bg-surface-secondary)',
                    color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {msg.text}
                </div>

                {/* Optional Quick Action Button */}
                {msg.action && (
                  <button
                    onClick={() => {
                      soundEffects.playPop();
                      setActiveModule(msg.action!.module);
                      setIsOpen(false);
                    }}
                    className="btn btn-sm btn-primary"
                    style={{
                      marginTop: '6px',
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    <span>{msg.action.label}</span>
                    <ChevronRight size={12} />
                  </button>
                )}

                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px', padding: '0 4px' }}>
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Copilot is thinking...</span>
                <RefreshCw size={12} color="#0066ff" className="animate-spin" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div
            style={{
              padding: '8px 12px',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface-secondary)',
            }}
          >
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.prompt)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  fontSize: '11px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0066ff';
                  e.currentTarget.style.color = '#0066ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '12px 14px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--card-bg)',
            }}
          >
            <input
              type="text"
              placeholder="Ask Copilot a question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="form-control"
              style={{
                flex: 1,
                fontSize: '12px',
                padding: '8px 12px',
                borderRadius: '8px',
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: inputText.trim() ? '#0066ff' : 'var(--border-color)',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputText.trim() ? 'pointer' : 'default',
                transition: 'background-color 0.15s ease',
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
