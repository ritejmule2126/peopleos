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
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        <div className="zp-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>TOTAL HEADCOUNT</span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#eff6ff' }}>
              <Users size={20} color="#0066ff" />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>
            {employees.length}
          </div>
          <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} /> +12% YoY Organization Growth
          </div>
        </div>

        <div className="zp-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>ATTENDANCE RATE</span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#ecfdf5' }}>
              <Clock size={20} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>
            {attendanceRate}%
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Across all shifts this quarter</div>
        </div>

        <div className="zp-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>ACTIVE DEPARTMENTS</span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#f5f3ff' }}>
              <Building size={20} color="#8b5cf6" />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>
            {departments.length}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Engineering, Product, HR, Sales...</div>
        </div>

        <div className="zp-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>AVERAGE COMPENSATION</span>
            <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#fffbeb' }}>
              <DollarSign size={20} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>
            ${(avgSalary / 1000).toFixed(0)}k
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Annual base per FTE</div>
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
