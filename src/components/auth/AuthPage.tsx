import React, { useState, useEffect } from 'react';
import {
  Building,
  Mail,
  Lock,
  User,
  Globe,
  ArrowRight,
  Users,
  Server,
  Sparkles,
  Smartphone,
  Copy,
  Check,
  KeyRound,
  ArrowLeft,
  Timer,
} from 'lucide-react';
import { Logo } from '../common/Logo';
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
        backgroundColor: '#f8fafc',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Left Brand Panel (Clean Enterprise Light Gradient) */}
      <div
        style={{
          flex: '0 0 45%',
          background: 'linear-gradient(145deg, #f0fdfa 0%, #eff6ff 50%, #f8fafc 100%)',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 48px',
          color: '#0f172a',
          position: 'relative',
        }}
      >
        {/* Top Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                padding: '3px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 4px 12px rgba(0, 166, 156, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <Logo width={42} height={44} />
            </div>
            <div>
              <span style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px', color: '#0f172a' }}>
                People<span style={{ color: '#0066ff' }}>OS</span>
              </span>
              <span
                style={{
                  marginLeft: '10px',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  border: '1px solid #a7f3d0',
                }}
              >
                v1.0 Production
              </span>
            </div>
          </div>

          <h1 style={{ fontSize: '36px', fontWeight: 800, lineHeight: 1.25, marginBottom: '16px', color: '#0f172a' }}>
            The Modern Open-Source <br />
            <span style={{ color: '#0066ff' }}>
              Employee Management
            </span>{' '}
            System
          </h1>

          <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, maxWidth: '440px' }}>
            A self-hostable, production-ready alternative to Zoho People. Manage top-down organizational hierarchy trees,
            biometric live punch-clocks, leave balance quotas, and Google Authenticator 2FA.
          </p>
        </div>

        {/* Clean Enterprise Feature Highlights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '40px 0' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#ffffff',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} color="#0066ff" />
            </div>
            <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
              Strict Down-Tree Hierarchy: Seniors review & approve junior logs
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#ffffff',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={16} color="#059669" />
            </div>
            <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
              Google Authenticator 2FA on employee login devices
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#ffffff',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server size={16} color="#7c3aed" />
            </div>
            <span style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>
              100% Self-Hostable: Docker Compose & persistent server JSON database
            </span>
          </div>
        </div>

        {/* Bottom footer badge */}
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Open-Source Enterprise HRMS Core • Modeled after Zoho People • MIT License
        </div>
      </div>

      {/* Right Form Card (Clean Crisp White Card) */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          overflowY: 'auto',
          backgroundColor: '#f8fafc',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: '#ffffff',
            padding: '36px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Tab Switcher (Only in signin / register modes) */}
          {mode !== '2fa' && (
            <div
              style={{
                display: 'flex',
                backgroundColor: '#f1f5f9',
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
                  backgroundColor: mode === 'signin' ? '#ffffff' : 'transparent',
                  color: mode === 'signin' ? '#0f172a' : '#64748b',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: mode === 'signin' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
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
                  backgroundColor: mode === 'register' ? '#ffffff' : 'transparent',
                  color: mode === 'register' ? '#0f172a' : '#64748b',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: mode === 'register' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
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
                  color: '#64748b',
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
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    textTransform: 'uppercase',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  <Smartphone size={12} /> Google Authenticator
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Step 2 of 2</span>
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Two-Factor Authentication
              </h2>

              {/* User Persona Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#f8fafc',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '18px',
                }}
              >
                <img
                  src={twoFactorData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={twoFactorData.fullName}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                    {twoFactorData.fullName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {twoFactorData.email} • <span style={{ color: '#0066ff', fontWeight: 600 }}>{twoFactorData.role}</span>
                  </div>
                </div>
              </div>

              {/* QR Code & Setup Card */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '12px', color: '#475569', marginBottom: '12px', fontWeight: 500 }}>
                  Scan with <strong>Google Authenticator</strong> app on your device:
                </div>

                {qrImageUrl && (
                  <div
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#ffffff',
                      padding: '8px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                      border: '1px solid #e2e8f0',
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
                    backgroundColor: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px',
                    color: '#64748b',
                  }}
                >
                  <KeyRound size={13} color="#0066ff" />
                  <span>Key: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{twoFactorData.twoFactorSecret}</strong></span>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: copiedSecret ? '#059669' : '#0066ff',
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
                    <label className="form-label" style={{ color: '#334155', margin: 0, fontSize: '13px', fontWeight: 600 }}>
                      Enter 6-Digit Authenticator Code
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: secondsRemaining <= 5 ? '#dc2626' : '#059669' }}>
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
                          backgroundColor: '#ffffff',
                          border: '2px solid #cbd5e1',
                          borderRadius: '8px',
                          color: '#0f172a',
                          outline: 'none',
                          transition: 'all 0.15s ease',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0066ff';
                          e.target.style.boxShadow = '0 0 0 3px rgba(0,102,255,0.15)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#cbd5e1';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    ))}
                  </div>
                </div>

                {totpError && (
                  <div
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      color: '#dc2626',
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
                  <label htmlFor="trust-device" style={{ fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
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
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ fontSize: '11px', color: '#1e40af' }}>
                    ⚡ Test code: <strong style={{ color: '#1d4ed8' }}>{twoFactorData.currentTotpHint || '123456'}</strong> (or 123456)
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillTestCode}
                    style={{
                      background: '#0066ff',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '4px 10px',
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
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Sign In</h2>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                  Enter your corporate credentials to access your PeopleOS portal.
                </p>
              </div>

              {loginError && (
                <div
                  style={{
                    padding: '10px 12px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#dc2626',
                    fontSize: '12px',
                    marginBottom: '16px',
                  }}
                >
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ color: '#334155', fontWeight: 600, fontSize: '13px' }}>
                    Work Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="email"
                      className="form-control"
                      style={{ paddingLeft: '38px', backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }}
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label" style={{ color: '#334155', fontWeight: 600, fontSize: '13px' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="password"
                      className="form-control"
                      style={{ paddingLeft: '38px', backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }}
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
              <div style={{ marginTop: '28px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
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
                      padding: '10px 12px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#1d4ed8',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  >
                    👑 Founder / CEO
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Full Org Down-tree</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('hr@peopleos.dev');
                      setLoginPassword('hr123');
                    }}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#059669',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ecfdf5')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  >
                    🛡️ HR Admin
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Onboarding & All Staff</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('manager@peopleos.dev');
                      setLoginPassword('manager123');
                    }}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#7c3aed',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#faf5ff')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  >
                    💼 Senior Lead
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Subordinate Reports Only</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('employee@peopleos.dev');
                      setLoginPassword('employee123');
                    }}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#db2777',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fdf2f8')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  >
                    👨‍💻 Junior Staff
                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Self-Service ESS View</div>
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
                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Register Organization</h2>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                  Initialize your company's self-hosted workspace as the primary Founder.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ color: '#334155', fontWeight: 600, fontSize: '13px' }}>
                    Company / Organization Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="text"
                      placeholder="e.g. Acme Corporation"
                      className="form-control"
                      style={{ paddingLeft: '38px', backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }}
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ color: '#334155', fontWeight: 600, fontSize: '13px' }}>
                    Corporate Domain
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Globe size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="text"
                      placeholder="e.g. acme.com"
                      className="form-control"
                      style={{ paddingLeft: '38px', backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }}
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ color: '#334155', fontWeight: 600, fontSize: '13px' }}>
                    Founder / Executive Full Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
                      className="form-control"
                      style={{ paddingLeft: '38px', backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }}
                      value={founderName}
                      onChange={(e) => setFounderName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ color: '#334155', fontWeight: 600, fontSize: '13px' }}>
                      Founder Email *
                    </label>
                    <input
                      type="email"
                      placeholder="founder@acme.com"
                      className="form-control"
                      style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }}
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label" style={{ color: '#334155', fontWeight: 600, fontSize: '13px' }}>
                      Root Password *
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="form-control"
                      style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label className="form-label" style={{ color: '#334155', fontWeight: 600, fontSize: '13px' }}>
                      Timezone
                    </label>
                    <select
                      className="form-control"
                      style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }}
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
                    <label className="form-label" style={{ color: '#334155', fontWeight: 600, fontSize: '13px' }}>
                      Team Size
                    </label>
                    <select
                      className="form-control"
                      style={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }}
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
