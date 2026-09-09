import React from 'react';
import {
  BarChart3,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Download,
  Building,
  MapPin,
  Clock,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const AnalyticsView: React.FC = () => {
  const { employees, departments, leaveRequests, attendance } = useApp();

  // Headcount by department
  const deptCounts: Record<string, number> = {};
  departments.forEach((d) => (deptCounts[d.name] = 0));
  employees.forEach((e) => {
    deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
  });

  // Headcount by location
  const locCounts: Record<string, number> = {};
  employees.forEach((e) => {
    locCounts[e.workLocation] = (locCounts[e.workLocation] || 0) + 1;
  });

  // Total payroll estimate
  const totalPayroll = employees.reduce((acc, curr) => acc + (curr.salary || 0), 0);
  const avgSalary = Math.round(totalPayroll / (employees.length || 1));

  // Attendance metrics
  const presentCount = attendance.filter((a) => a.status === 'Present').length;
  const attendanceRate = attendance.length
    ? Math.round((presentCount / attendance.length) * 100)
    : 96;

  const exportAllHRData = () => {
    const data = {
      generatedAt: new Date().toISOString(),
      organization: 'Acuity Solutions (PeopleOS)',
      headcount: employees.length,
      departments: departments.map((d) => ({ name: d.name, code: d.code, count: deptCounts[d.name] })),
      payrollAnnualTotal: totalPayroll,
      attendanceRate: `${attendanceRate}%`,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peopleos_analytics_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="page-title">
            <BarChart3 size={24} color="#0066ff" />
            Reports & Workforce Analytics
          </div>
          <div className="page-subtitle">
            Executive workforce intelligence, department distributions, attendance trends, and payroll overview.
          </div>
        </div>

        <button onClick={exportAllHRData} className="btn btn-primary">
          <Download size={16} /> Export Intelligence Pack
        </button>
      </div>

      {/* Top 4 Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">TOTAL HEADCOUNT</span>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-tint)' }}>
              <Users size={18} color="var(--primary-600)" />
            </div>
          </div>
          <div className="stat-value" style={{ margin: '6px 0 2px' }}>
            {employees.length}
          </div>
          <div className="stat-meta" style={{ color: 'var(--success-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={13} /> +12% YoY Growth
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">ATTENDANCE RATE</span>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--success-bg)' }}>
              <Clock size={18} color="var(--success-main)" />
            </div>
          </div>
          <div className="stat-value" style={{ margin: '6px 0 2px' }}>
            {attendanceRate}%
          </div>
          <div className="stat-meta">Across all active shifts</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">ACTIVE DEPARTMENTS</span>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--purple-bg)' }}>
              <Building size={18} color="var(--purple-main)" />
            </div>
          </div>
          <div className="stat-value" style={{ margin: '6px 0 2px' }}>
            {departments.length}
          </div>
          <div className="stat-meta">Core business units</div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="stat-label">AVG BASE SALARY</span>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--warning-bg)' }}>
              <DollarSign size={18} color="var(--warning-main)" />
            </div>
          </div>
          <div className="stat-value" style={{ margin: '6px 0 2px' }}>
            ${(avgSalary / 1000).toFixed(0)}k
          </div>
          <div className="stat-meta">Annual FTE benchmark</div>
        </div>
      </div>

      {/* Grid: Charts & Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Department Breakdown */}
        <div className="zp-card">
          <div className="zp-card-header">
            <div className="zp-card-title">
              <Building size={18} color="#0066ff" />
              Headcount by Department
            </div>
          </div>
          <div className="zp-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(deptCounts).map(([dept, count]) => {
                const percent = Math.round((count / employees.length) * 100);
                return (
                  <div key={dept}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{dept}</span>
                      <span style={{ color: '#64748b' }}>
                        <strong>{count}</strong> members ({percent}%)
                      </span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${percent}%`,
                          backgroundColor: '#0066ff',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Location Breakdown */}
        <div className="zp-card">
          <div className="zp-card-header">
            <div className="zp-card-title">
              <MapPin size={18} color="#10b981" />
              Workforce Distribution by Hub
            </div>
          </div>
          <div className="zp-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.entries(locCounts).map(([loc, count]) => {
                const percent = Math.round((count / employees.length) * 100);
                return (
                  <div key={loc}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{loc}</span>
                      <span style={{ color: '#64748b' }}>
                        <strong>{count}</strong> ({percent}%)
                      </span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${percent}%`,
                          backgroundColor: '#10b981',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
