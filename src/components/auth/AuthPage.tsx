import React, { useState, useEffect } from 'react';
import {
  Shield,
  Building,
  Mail,
  Lock,
  User,
  Globe,
  ArrowRight,
  CheckCircle2,
  Users,
  Server,
  Sparkles,
  Smartphone,
  Copy,
  Check,
  KeyRound,
  ArrowLeft,
  Timer,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuthPage: React.FC = () => {
  const { login, registerFounder, verify2FA } = useApp();

  const [mode, setMode] = useState<'signin' | 'register' | '2fa'>('signin');

  // Sign In Form
  const [loginEmail, setLoginEmail] = useState('founder@peopleos.dev');
  const [loginPassword, setLoginPassword] = useState('founder123');
  const [loginError, setLoginError] = useState('');

  // 2FA Verification State
  const [twoFactorData, setTwoFactorData] = useState<{
    email: string;
    tempToken?: string;
    twoFactorSecret?: string;
    otpauthUrl?: string;
    currentTotpHint?: string;
    fullName?: string;
    role?: string;
    avatar?: string;
  } | null>(null);
  const [totpDigits, setTotpDigits] = useState(['', '', '', '', '', '']);
  const [trustDevice, setTrustDevice] = useState(true);
  const [totpError, setTotpError] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  // Register Form
  const [companyName, setCompanyName] = useState('');
  const [domain, setDomain] = useState('');
  const [founderName, setFounderName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [password, setPassword] = useState('');
  const [timezone, setTimezone] = useState('America/Los_Angeles (PST - UTC-8)');
  const [teamSize, setTeamSize] = useState('20 - 100 employees');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 30-Second TOTP window sync countdown
  useEffect(() => {
    if (mode !== '2fa') return;
    const updateTimer = () => {
      const epochSeconds = Math.floor(Date.now() / 1000);
      const remaining = 30 - (epochSeconds % 30);
      setSecondsRemaining(remaining === 0 ? 30 : remaining);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [mode]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (res.requires2FA) {
        setTwoFactorData({
          email: res.email || loginEmail,
          tempToken: res.tempToken,
          twoFactorSecret: res.twoFactorSecret,
          otpauthUrl: res.otpauthUrl,
          currentTotpHint: res.currentTotpHint,
          fullName: res.fullName,
          role: res.role,
          avatar: res.avatar,
        });
        setTotpDigits(['', '', '', '', '', '']);
        setTotpError('');
        setMode('2fa');
      } else if (!res.success) {
        setLoginError('Invalid email or password. Please use one of the demo quick-logins below or check credentials.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (clean.length > 1) {
      // Paste handling
      const digits = clean.slice(0, 6).split('');
      const newDigits = [...totpDigits];
      digits.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setTotpDigits(newDigits);
      const nextInput = document.getElementById(`totp-input-${Math.min(5, digits.length)}`);
      nextInput?.focus();
      return;
    }

    const newDigits = [...totpDigits];
    newDigits[index] = clean;
    setTotpDigits(newDigits);

    if (clean && index < 5) {
      const nextInput = document.getElementById(`totp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !totpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`totp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handle2FASubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!twoFactorData) return;

    const code = totpDigits.join('');
    if (code.length < 6) {
      setTotpError('Please enter the full 6-digit Google Authenticator code.');
      return;
    }

    setTotpError('');
    setIsSubmitting(true);
    try {
      const success = await verify2FA({
        email: twoFactorData.email,
        code,
        tempToken: twoFactorData.tempToken,
        trustDevice,
      });

      if (!success) {
        setTotpError('Invalid Google Authenticator code. Please check your app or use the demo code 123456.');
      }
    } catch (err: any) {
      setTotpError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoFillTestCode = () => {
    const code = twoFactorData?.currentTotpHint || '123456';
    setTotpDigits(code.split('').slice(0, 6));
  };

  const handleCopySecret = () => {
    if (!twoFactorData?.twoFactorSecret) return;
    navigator.clipboard.writeText(twoFactorData.twoFactorSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !founderName.trim() || !workEmail.trim() || !password.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerFounder({
        companyName,
        domain: domain || `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        founderName,
        workEmail,
        password,
        timezone,
        teamSize,
      });
    } catch (err: any) {
      alert(`Registration failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const qrImageUrl = twoFactorData?.otpauthUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(twoFactorData.otpauthUrl)}&margin=6`
    : '';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: '#0a0f1d',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Left Brand Panel */}
      <div
        style={{
          flex: '0 0 45%',
          background: 'linear-gradient(145deg, #0d1527 0%, #15203b 100%)',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 48px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '-100px',
            width: '350px',
            height: '350px',
            background: 'radial-gradient(circle, rgba(0,102,255,0.18) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-120px',
            right: '-80px',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(0,0,0,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Top Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0066ff 0%, #00d2ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,102,255,0.35)',
              }}
            >
              <Shield size={24} color="#ffffff" />
            </div>
            <div>
              <span style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>PeopleOS</span>
              <span
                style={{
                  marginLeft: '8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: 'rgba(0,102,255,0.2)',
                  color: '#60a5fa',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(0,102,255,0.3)',
                }}
              >
                v1.0 Production
              </span>
            </div>
          </div>

          <h1 style={{ fontSize: '38px', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px' }}>
            The Modern Open-Source <br />
            <span style={{ background: 'linear-gradient(90deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Employee Management
            </span>{' '}
            System
          </h1>

          <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6, maxWidth: '440px' }}>
            A production-ready, self-hostable alternative to Zoho People. Manage top-down organizational trees,
            biometric live punch-clocks, leave balance quotas, and Google Authenticator 2FA security.
          </p>
        </div>

        {/* Feature Highlights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', margin: '40px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(56,189,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} color="#38bdf8" />
            </div>
            <span style={{ fontSize: '14px', color: '#cbd5e1' }}>
              Strict Down-Tree Hierarchy: Seniors review & approve junior logs
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={16} color="#10b981" />
            </div>
            <span style={{ fontSize: '14px', color: '#cbd5e1' }}>
              Google Authenticator 2FA on employee login devices
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: 'rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server size={16} color="#a855f7" />
            </div>
            <span style={{ fontSize: '14px', color: '#cbd5e1' }}>
              100% Self-Hostable: Docker Compose & persistent server JSON database
            </span>
          </div>
        </div>

        {/* Bottom footer badge */}
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Open-Source Enterprise HRMS Core • Apache-2.0 License • Modeled after Zoho People
        </div>
      </div>

      {/* Right Form Card */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Tab Switcher (Only in signin / register modes) */}
          {mode !== '2fa' && (
            <div
              style={{
                display: 'flex',
                backgroundColor: '#1e293b',
                padding: '4px',
                borderRadius: '10px',
                marginBottom: '28px',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setLoginError('');
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: mode === 'signin' ? '#0066ff' : 'transparent',
                  color: mode === 'signin' ? '#ffffff' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Sign In to Workspace
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setLoginError('');
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: mode === 'register' ? '#0066ff' : 'transparent',
                  color: mode === 'register' ? '#ffffff' : '#94a3b8',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Register Organization
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODE 1: GOOGLE AUTHENTICATOR (2FA) STEP */}
          {/* ============================================================ */}
          {mode === '2fa' && twoFactorData && (
            <div>
              <button
                type="button"
                onClick={() => setMode('signin')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '13px',
                  cursor: 'pointer',
                  marginBottom: '16px',
                  padding: '4px 0',
                }}
              >
                <ArrowLeft size={16} /> Back to Sign In
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(16,185,129,0.2)',
                    color: '#34d399',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  <Smartphone size={12} /> Google Authenticator
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Step 2 of 2</span>
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                Two-Factor Authentication
              </h2>

              {/* User Persona Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#1e293b',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  marginBottom: '18px',
                }}
              >
                <img
                  src={twoFactorData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={twoFactorData.fullName}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                    {twoFactorData.fullName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {twoFactorData.email} • <span style={{ color: '#38bdf8', fontWeight: 600 }}>{twoFactorData.role}</span>
                  </div>
                </div>
              </div>

              {/* QR Code & Setup Card */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '12px', fontWeight: 500 }}>
                  Scan with <strong>Google Authenticator</strong> app on your phone:
                </div>

                {qrImageUrl && (
                  <div
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#ffffff',
                      padding: '8px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                      marginBottom: '12px',
                    }}
                  >
                    <img
                      src={qrImageUrl}
                      alt="Google Authenticator QR Code"
                      style={{ width: '130px', height: '130px', display: 'block' }}
                    />
                  </div>
                )}

                {/* Secret Key with Copy */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    backgroundColor: '#1e293b',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #334155',
                    fontSize: '11px',
                    color: '#94a3b8',
                  }}
                >
                  <KeyRound size={13} color="#38bdf8" />
                  <span>Key: <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{twoFactorData.twoFactorSecret}</strong></span>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: copiedSecret ? '#34d399' : '#38bdf8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 6px',
                    }}
                  >
                    {copiedSecret ? <Check size={12} /> : <Copy size={12} />}
                    {copiedSecret ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* 6-Digit Verification PIN Input */}
              <form onSubmit={handle2FASubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ color: '#cbd5e1', margin: 0, fontSize: '13px', fontWeight: 600 }}>
                      Enter 6-Digit Authenticator Code
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: secondsRemaining <= 5 ? '#f87171' : '#34d399' }}>
                      <Timer size={12} />
                      <span>{secondsRemaining}s</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                    {totpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`totp-input-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                        autoFocus={idx === 0}
                        style={{
                          width: '48px',
                          height: '52px',
                          textAlign: 'center',
                          fontSize: '22px',
                          fontWeight: 700,
                          backgroundColor: '#1e293b',
                          border: '2px solid #334155',
                          borderRadius: '8px',
                          color: '#ffffff',
                          outline: 'none',
                          transition: 'border-color 0.15s ease',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#0066ff')}
                        onBlur={(e) => (e.target.style.borderColor = '#334155')}
                      />
                    ))}
                  </div>
                </div>

                {totpError && (
                  <div
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      color: '#f87171',
                      fontSize: '12px',
                      marginBottom: '16px',
                    }}
                  >
                    {totpError}
                  </div>
                )}

                {/* Trust Device Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <input
                    type="checkbox"
                    id="trust-device"
                    checked={trustDevice}
                    onChange={(e) => setTrustDevice(e.target.checked)}
                    style={{ accentColor: '#0066ff', cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="trust-device" style={{ fontSize: '13px', color: '#cbd5e1', cursor: 'pointer' }}>
                    Trust this login device for 30 days
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 600, opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? 'Verifying Code...' : 'Verify & Launch PeopleOS'}
                </button>

                {/* Developer / Evaluator 1-Click Fast-Track Helper */}
                <div
                  style={{
                    marginTop: '20px',
                    padding: '10px 12px',
                    backgroundColor: 'rgba(0,102,255,0.08)',
                    border: '1px solid rgba(0,102,255,0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    ⚡ Test code: <strong style={{ color: '#60a5fa' }}>{twoFactorData.currentTotpHint || '123456'}</strong> (or 123456)
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillTestCode}
                    style={{
                      background: 'rgba(0,102,255,0.2)',
                      border: '1px solid rgba(0,102,255,0.4)',
                      color: '#60a5fa',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Auto-Fill
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODE 2: SIGN IN FORM */}
          {/* ============================================================ */}
          {mode === 'signin' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff' }}>Sign In</h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                  Enter your corporate credentials to access your PeopleOS portal.
                </p>
              </div>

              {loginError && (
                <div
                  style={{
                    padding: '10px 12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#f87171',
                    fontSize: '12px',
                    marginBottom: '16px',
                  }}
                >
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>
                    Work Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="email"
                      className="form-control"
                      style={{ paddingLeft: '38px', backgroundColor: '#1e293b', borderColor: '#334155', color: '#ffffff' }}
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="password"
                      className="form-control"
                      style={{ paddingLeft: '38px', backgroundColor: '#1e293b', borderColor: '#334155', color: '#ffffff' }}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 600, opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? 'Authenticating...' : <>Next: Verify Device <ArrowRight size={16} /></>}
                </button>
              </form>

              {/* 1-Click Quick Fill Demo Logins */}
              <div style={{ marginTop: '28px', borderTop: '1px solid #1e293b', paddingTop: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Instant Demo Roles (1-Click Fill)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('founder@peopleos.dev');
                      setLoginPassword('founder123');
                    }}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#60a5fa',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    👑 Founder / CEO
                    <div style={{ fontSize: '9px', color: '#94a3b8' }}>Full Org Down-tree</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('hr@peopleos.dev');
                      setLoginPassword('hr123');
                    }}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#34d399',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    🛡️ HR Admin
                    <div style={{ fontSize: '9px', color: '#94a3b8' }}>Onboarding & All Staff</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('manager@peopleos.dev');
                      setLoginPassword('manager123');
                    }}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#a78bfa',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    💼 Senior Lead
                    <div style={{ fontSize: '9px', color: '#94a3b8' }}>Subordinate Reports Only</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('employee@peopleos.dev');
                      setLoginPassword('employee123');
                    }}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#f472b6',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    👨‍💻 Junior Staff
                    <div style={{ fontSize: '9px', color: '#94a3b8' }}>Self-Service ESS View</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODE 3: REGISTER ORGANIZATION */}
          {/* ============================================================ */}
          {mode === 'register' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff' }}>Register Organization</h2>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                  Initialize your company's self-hosted workspace as the primary Founder.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>
                    Company / Organization Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="text"
                      placeholder="e.g. Acme Corporation"
                      className="form-control"
                      style={{ paddingLeft: '38px', backgroundColor: '#1e293b', borderColor: '#334155', color: '#ffffff' }}
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>
                    Corporate Domain
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Globe size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="text"
                      placeholder="e.g. acme.com"
                      className="form-control"
                      style={{ paddingLeft: '38px', backgroundColor: '#1e293b', borderColor: '#334155', color: '#ffffff' }}
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ color: '#cbd5e1' }}>
                    Founder / Executive Full Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
                      className="form-control"
                      style={{ paddingLeft: '38px', backgroundColor: '#1e293b', borderColor: '#334155', color: '#ffffff' }}
                      value={founderName}
                      onChange={(e) => setFounderName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ color: '#cbd5e1' }}>
                      Founder Email *
                    </label>
                    <input
                      type="email"
                      placeholder="founder@acme.com"
                      className="form-control"
                      style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#ffffff' }}
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ color: '#cbd5e1' }}>
                      Root Password *
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="form-control"
                      style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#ffffff' }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ color: '#cbd5e1' }}>
                      Timezone
                    </label>
                    <select
                      className="form-control"
                      style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#ffffff' }}
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    >
                      <option value="America/Los_Angeles (PST - UTC-8)">PST (UTC-8)</option>
                      <option value="America/New_York (EST - UTC-5)">EST (UTC-5)</option>
                      <option value="Europe/London (GMT - UTC+0)">GMT (UTC+0)</option>
                      <option value="Asia/Kolkata (IST - UTC+5:30)">IST (UTC+5:30)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ color: '#cbd5e1' }}>
                      Team Size
                    </label>
                    <select
                      className="form-control"
                      style={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#ffffff' }}
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value)}
                    >
                      <option value="1 - 20 employees">1 - 20 employees</option>
                      <option value="20 - 100 employees">20 - 100 employees</option>
                      <option value="100 - 500 employees">100 - 500 employees</option>
                      <option value="500+ employees">500+ employees</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 600, opacity: isSubmitting ? 0.7 : 1 }}
                >
                  {isSubmitting ? 'Provisioning Workspace...' : <><Sparkles size={16} /> Complete Setup & Launch Organization</>}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
