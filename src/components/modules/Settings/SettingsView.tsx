import React, { useState } from 'react';
import {
  Settings,
  Building,
  RotateCcw,
  CheckCircle2,
  Plus,
  Shield,
  Clock,
  Globe,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const SettingsView: React.FC = () => {
  const { departments, resetDemoData, currentRole } = useApp();

  const [companyName, setCompanyName] = useState('Acuity Solutions Inc.');
  const [domain, setDomain] = useState('acuity.io');
  const [timezone, setTimezone] = useState('America/Los_Angeles (PST - UTC-8)');
  const [currency, setCurrency] = useState('USD ($)');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="page-title">
            <Settings size={24} color="#0066ff" />
            Settings & Organization Configuration
          </div>
          <div className="page-subtitle">
            Configure enterprise preferences, departments, work hours, and administrative policies.
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
        {/* Left: Company Profile Settings */}
        <div className="zp-card">
          <div className="zp-card-header">
            <div className="zp-card-title">
              <Building size={18} color="#0066ff" />
              Company Profile & Regional Preferences
            </div>
          </div>
          <div className="zp-card-body">
            <form onSubmit={handleSaveCompany}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Corporate Domain</label>
                  <input
                    type="text"
                    className="form-control"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Standard Organization Timezone</label>
                  <select
                    className="form-control"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  >
                    <option value="America/Los_Angeles (PST - UTC-8)">America/Los_Angeles (PST - UTC-8)</option>
                    <option value="America/New_York (EST - UTC-5)">America/New_York (EST - UTC-5)</option>
                    <option value="Europe/London (GMT - UTC+0)">Europe/London (GMT - UTC+0)</option>
                    <option value="Asia/Kolkata (IST - UTC+5:30)">Asia/Kolkata (IST - UTC+5:30)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Operating Currency</label>
                  <select
                    className="form-control"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                    <option value="INR (₹)">INR (₹)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
                {savedSuccess && (
                  <span style={{ fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={16} /> Saved successfully!
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right: Departments Quick Overview & Reset */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Departments List */}
          <div className="zp-card">
            <div className="zp-card-header">
              <div className="zp-card-title">
                <Building size={18} color="#8b5cf6" />
                Active Departments ({departments.length})
              </div>
            </div>
            <div className="zp-card-body" style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>
                        {dept.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Lead: {dept.leadName}</div>
                    </div>
                    <span className="badge badge-primary">{dept.code}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Danger Zone: Reset Data */}
          <div className="zp-card" style={{ borderColor: '#fecaca' }}>
            <div className="zp-card-header" style={{ backgroundColor: '#fef2f2' }}>
              <div className="zp-card-title" style={{ color: '#b91c1c' }}>
                <RotateCcw size={18} color="#ef4444" />
                Environment Demo State
              </div>
            </div>
            <div className="zp-card-body">
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px', lineHeight: 1.4 }}>
                Clear browser storage and restore initial seed data for 25+ employees, attendance logs, and sample tickets.
              </p>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset all data back to the demo state?')) {
                    resetDemoData();
                    alert('Demo environment reset successfully!');
                  }
                }}
                className="btn btn-danger btn-sm"
              >
                Reset Database to Factory Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
