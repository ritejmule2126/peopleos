import React, { useEffect, useState } from 'react';
import { Keyboard, X, Command } from 'lucide-react';
import { useApp, NavigationModule } from '../../context/AppContext';
import { soundEffects } from '../../services/soundEffects';

interface ShortcutGroup {
  category: string;
  items: { keys: string[]; description: string }[];
}

export const ShortcutsModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { setActiveModule, toggleTheme, punchIn, punchOut, isPunchedIn } = useApp();

  useEffect(() => {
    let lastKey = '';
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering when user is typing in inputs or textareas
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      // '?' key opens shortcuts HUD
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        soundEffects.playPop();
        setIsOpen((prev) => !prev);
        return;
      }

      // 'Escape' closes HUD
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        return;
      }

      // 'd' toggles theme
      if (e.key.toLowerCase() === 'd' && !e.metaKey && !e.ctrlKey) {
        soundEffects.playPop();
        toggleTheme();
        return;
      }

      // 'p' toggles punch in/out
      if (e.key.toLowerCase() === 'p' && !e.metaKey && !e.ctrlKey) {
        if (isPunchedIn) {
          soundEffects.playPunchOut();
          punchOut();
        } else {
          soundEffects.playPunchIn();
          punchIn();
        }
        return;
      }

      // 'm' toggles sound
      if (e.key.toLowerCase() === 'm' && !e.metaKey && !e.ctrlKey) {
        const isMuted = soundEffects.toggleMute();
        soundEffects.playPop();
        return;
      }

      // 'g' sequence navigation: g then d, g then e, etc.
      const now = Date.now();
      if (lastKey === 'g' && now - lastKeyTime < 1000) {
        const char = e.key.toLowerCase();
        const navMap: Record<string, NavigationModule> = {
          d: 'dashboard',
          e: 'employees',
          a: 'attendance',
          l: 'leaves',
          p: 'performance',
          h: 'helpdesk',
          o: 'onboarding',
          r: 'analytics',
          s: 'settings',
        };
        if (navMap[char]) {
          e.preventDefault();
          soundEffects.playPop();
          setActiveModule(navMap[char]);
          lastKey = '';
          return;
        }
      }

      if (e.key.toLowerCase() === 'g') {
        lastKey = 'g';
        lastKeyTime = now;
      } else {
        lastKey = '';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleTheme, punchIn, punchOut, isPunchedIn, setActiveModule]);

  if (!isOpen) return null;

  const shortcuts: ShortcutGroup[] = [
    {
      category: 'General & Actions',
      items: [
        { keys: ['⌘', 'K'], description: 'Open Super Command Palette' },
        { keys: ['⌘', 'J'], description: 'Toggle PeopleOS AI Copilot' },
        { keys: ['P'], description: 'Instant Punch In / Check Out' },
        { keys: ['D'], description: 'Toggle Dark / Light Mode' },
        { keys: ['M'], description: 'Mute / Unmute UI Audio Chimes' },
        { keys: ['?'], description: 'Show / Hide this Shortcuts HUD' },
        { keys: ['Esc'], description: 'Close any active modal or drawer' },
      ],
    },
    {
      category: 'Quick Navigation (Press G, then...)',
      items: [
        { keys: ['G', 'D'], description: 'Jump to Dashboard / Home' },
        { keys: ['G', 'E'], description: 'Jump to Employees Directory' },
        { keys: ['G', 'A'], description: 'Jump to Attendance Records' },
        { keys: ['G', 'L'], description: 'Jump to Leave Tracker' },
        { keys: ['G', 'P'], description: 'Jump to Performance & Goals' },
        { keys: ['G', 'H'], description: 'Jump to HR Helpdesk Cases' },
        { keys: ['G', 'R'], description: 'Jump to Organization Reports' },
      ],
    },
  ];

  return (
    <div className="modal-overlay" onClick={() => setIsOpen(false)}>
      <div
        className="modal-container"
        style={{ maxWidth: '620px', alignSelf: 'center' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-tint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Keyboard size={18} color="#0066ff" />
            </div>
            <div>
              <div className="modal-title">Keyboard Shortcuts HUD</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Speed through PeopleOS at lightspeed like a power user
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {shortcuts.map((group, idx) => (
            <div key={idx}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  color: 'var(--text-muted)',
                  marginBottom: '12px',
                }}
              >
                {group.category}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                {group.items.map((item, iIdx) => (
                  <div
                    key={iIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-surface-secondary)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.description}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '22px',
                            height: '22px',
                            padding: '0 6px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Tip: Press <kbd style={{ padding: '1px 5px', borderRadius: '3px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>?</kbd> anywhere to open this screen
          </span>
          <button onClick={() => setIsOpen(false)} className="btn btn-secondary btn-sm">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
