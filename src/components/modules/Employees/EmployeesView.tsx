import React, { useState } from 'react';
import {
  Users,
  Grid,
  List,
  GitFork,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  X,
  Edit2,
  Trash2,
  CheckCircle,
  Shield,
  Download,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Employee, EmploymentStatus, EmploymentType, UserRole } from '../../../types';

export const EmployeesView: React.FC = () => {
  const { employees, departments, addEmployee, updateEmployee, deleteEmployee, currentRole, switchUser } =
    useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'orgChart'>('grid');
  const [searchFilter, setSearchFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Drawer details
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Add Employee Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmpForm, setNewEmpForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: 'Software Engineer',
    managerId: 'emp-2',
    role: 'EMPLOYEE' as UserRole,
    dateOfJoining: new Date().toISOString().split('T')[0],
    workLocation: 'San Francisco HQ',
    employmentType: 'Full Time' as EmploymentType,
    status: 'Active' as EmploymentStatus,
    salary: 110000,
    skills: 'React, TypeScript, Node.js',
    bio: '',
  });

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchFilter.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchFilter.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpForm.firstName || !newEmpForm.lastName || !newEmpForm.email) {
      alert('Please fill out all required fields.');
      return;
    }

    const manager = employees.find((m) => m.id === newEmpForm.managerId);
    const newEmpIdCode = `ZP-${1000 + employees.length + 1}`;

    addEmployee({
      employeeId: newEmpIdCode,
      firstName: newEmpForm.firstName,
      lastName: newEmpForm.lastName,
      email: newEmpForm.email,
      phone: newEmpForm.phone || '+1 (555) 000-0000',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      department: newEmpForm.department,
      designation: newEmpForm.designation,
      managerId: newEmpForm.managerId,
      managerName: manager ? `${manager.firstName} ${manager.lastName}` : null,
      role: newEmpForm.role,
      dateOfJoining: newEmpForm.dateOfJoining,
      workLocation: newEmpForm.workLocation,
      employmentType: newEmpForm.employmentType,
      status: newEmpForm.status,
      salary: Number(newEmpForm.salary),
      skills: newEmpForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
      bio: newEmpForm.bio,
      address: { city: 'San Francisco', state: 'CA', country: 'United States' },
    });

    setIsAddModalOpen(false);
    // Reset form
    setNewEmpForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: 'Engineering',
      designation: 'Software Engineer',
      managerId: 'emp-2',
      role: 'EMPLOYEE',
      dateOfJoining: new Date().toISOString().split('T')[0],
      workLocation: 'San Francisco HQ',
      employmentType: 'Full Time',
      status: 'Active',
      salary: 110000,
      skills: 'React, TypeScript, Node.js',
      bio: '',
    });
  };

  const exportEmployeesCSV = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Designation', 'Status', 'Date of Joining', 'Location'];
    const rows = filteredEmployees.map((e) => [
      e.employeeId,
      `"${e.firstName} ${e.lastName}"`,
      e.email,
      `"${e.department}"`,
      `"${e.designation}"`,
      e.status,
      e.dateOfJoining,
      `"${e.workLocation}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `peopleos_employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-body">
      {/* Header Row */}
      <div className="page-header-row">
        <div>
          <div className="page-title">
            <Users size={24} color="#0066ff" />
            Employee Directory
          </div>
          <div className="page-subtitle">
            Manage organization members, reporting structures, roles, and profiles.
          </div>
        </div>

        {/* Right Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Segmented View Mode Toggle */}
          <div className="segmented-control">
            <button
              onClick={() => setViewMode('grid')}
              className={`segmented-btn ${viewMode === 'grid' ? 'active' : ''}`}
              title="Grid View"
            >
              <Grid size={14} /> <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`segmented-btn ${viewMode === 'table' ? 'active' : ''}`}
              title="Table View"
            >
              <List size={14} /> <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('orgChart')}
              className={`segmented-btn ${viewMode === 'orgChart' ? 'active' : ''}`}
              title="Org Chart"
            >
              <GitFork size={14} /> <span>Org Chart</span>
            </button>
          </div>

          <button onClick={exportEmployeesCSV} className="btn btn-secondary">
            <Download size={14} /> <span>Export</span>
          </button>

          {(currentRole === 'FOUNDER' || currentRole === 'HR_ADMIN') && (
            <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
              <Plus size={15} /> <span>Onboard Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search by name, ID, title, or email..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="form-control"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="form-control"
            style={{ width: '160px' }}
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control"
            style={{ width: '130px' }}
          >
            <option value="ALL">All Status</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Probation">Probation</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
          <strong>{filteredEmployees.length}</strong> colleagues
        </div>
      </div>

      {/* VIEW 1: GRID VIEW */}
      {viewMode === 'grid' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="zp-card"
              style={{
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onClick={() => setSelectedEmployee(emp)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
              }}
            >
              <div className="zp-card-body" style={{ textAlign: 'center', padding: '24px 20px' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '12px' }}>
                  <img
                    src={emp.avatar}
                    alt={emp.firstName}
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #e2e8f0',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor:
                        emp.status === 'Active'
                          ? '#10b981'
                          : emp.status === 'On Leave'
                          ? '#8b5cf6'
                          : '#f59e0b',
                      border: '2px solid #ffffff',
                    }}
                  />
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  {emp.firstName} {emp.lastName}
                </h3>
                <div style={{ fontSize: '12px', color: '#0066ff', fontWeight: 600, marginTop: '2px' }}>
                  {emp.designation}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {emp.department} · {emp.employeeId}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    margin: '12px 0',
                  }}
                >
                  <span
                    className={`badge ${
                      emp.status === 'Active'
                        ? 'badge-success'
                        : emp.status === 'On Leave'
                        ? 'badge-purple'
                        : 'badge-warning'
                    }`}
                  >
                    {emp.status}
                  </span>
                  <span className="badge badge-neutral">{emp.employmentType}</span>
                </div>

                <div
                  style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '12px',
                    fontSize: '12px',
                    color: '#64748b',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={13} color="#94a3b8" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {emp.email}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={13} color="#94a3b8" />
                    <span>{emp.workLocation}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="zp-table-wrapper">
          <table className="zp-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Reporting Manager</th>
                <th>Location</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={emp.avatar}
                        alt={emp.firstName}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-primary">{emp.employeeId}</span>
                  </td>
                  <td>{emp.department}</td>
                  <td>{emp.designation}</td>
                  <td>{emp.managerName || '— (Executive)'}</td>
                  <td>{emp.workLocation}</td>
                  <td>
                    <span
                      className={`badge ${
                        emp.status === 'Active'
                          ? 'badge-success'
                          : emp.status === 'On Leave'
                          ? 'badge-purple'
                          : 'badge-warning'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => setSelectedEmployee(emp)}
                        className="btn btn-secondary btn-sm"
                      >
                        View
                      </button>
                      {currentRole === 'HR_ADMIN' && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${emp.firstName} from organization?`)) {
                              deleteEmployee(emp.id);
                            }
                          }}
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#ef4444' }}
                          title="Remove employee"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 3: ORG CHART TREE */}
      {viewMode === 'orgChart' && (
        <div
          className="zp-card"
          style={{
            padding: '32px 20px',
            backgroundColor: '#ffffff',
            overflowX: 'auto',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              Acuity Solutions Organizational Hierarchy
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Visual top-down reporting lines. Click any card to inspect member profile.
            </p>
          </div>

          {/* Root CEO / CPO */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {employees
              .filter((e) => e.managerId === null)
              .map((rootEmp) => (
                <div key={rootEmp.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Root Node */}
                  <div
                    onClick={() => setSelectedEmployee(rootEmp)}
                    style={{
                      padding: '16px 20px',
                      backgroundColor: '#eff6ff',
                      border: '2px solid #3b82f6',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      minWidth: '240px',
                    }}
                  >
                    <img
                      src={rootEmp.avatar}
                      alt={rootEmp.firstName}
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e40af' }}>
                        {rootEmp.firstName} {rootEmp.lastName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 600 }}>
                        {rootEmp.designation}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{rootEmp.department}</div>
                    </div>
                  </div>

                  {/* Stem line */}
                  <div style={{ width: '2px', height: '28px', backgroundColor: '#cbd5e1' }} />

                  {/* Level 2: Department Leads / Managers */}
                  <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {employees
                      .filter((e) => e.managerId === rootEmp.id)
                      .map((mgr) => {
                        const directReports = employees.filter((e) => e.managerId === mgr.id);
                        return (
                          <div
                            key={mgr.id}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                          >
                            <div
                              onClick={() => setSelectedEmployee(mgr)}
                              style={{
                                padding: '12px 16px',
                                backgroundColor: '#ffffff',
                                border: '1px solid #cbd5e1',
                                borderRadius: '10px',
                                boxShadow: 'var(--shadow-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                                minWidth: '200px',
                              }}
                            >
                              <img
                                src={mgr.avatar}
                                alt={mgr.firstName}
                                style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>
                                  {mgr.firstName} {mgr.lastName}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{mgr.designation}</div>
                                <span className="badge badge-primary" style={{ fontSize: '10px', marginTop: '2px' }}>
                                  {directReports.length} Reports
                                </span>
                              </div>
                            </div>

                            {/* Reports under manager */}
                            {directReports.length > 0 && (
                              <>
                                <div style={{ width: '2px', height: '18px', backgroundColor: '#cbd5e1' }} />
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                  {directReports.map((report) => (
                                    <div
                                      key={report.id}
                                      onClick={() => setSelectedEmployee(report)}
                                      style={{
                                        padding: '8px 12px',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        minWidth: '160px',
                                      }}
                                    >
                                      <img
                                        src={report.avatar}
                                        alt={report.firstName}
                                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                                      />
                                      <div>
                                        <div style={{ fontWeight: 600, fontSize: '12px', color: '#0f172a' }}>
                                          {report.firstName} {report.lastName}
                                        </div>
                                        <div style={{ fontSize: '10px', color: '#64748b' }}>
                                          {report.designation}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* SLIDE-OVER DRAWER: Employee Full Profile */}
      {selectedEmployee && (
        <div className="drawer-overlay" onClick={() => setSelectedEmployee(null)}>
          <div className="drawer-container" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#f8fafc',
              }}
            >
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Employee Profile Details
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {/* Profile Card Top */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <img
                  src={selectedEmployee.avatar}
                  alt={selectedEmployee.firstName}
                  style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid #dbeafe',
                    marginBottom: '12px',
                  }}
                />
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </h2>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0066ff', marginTop: '2px' }}>
                  {selectedEmployee.designation}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  {selectedEmployee.department} · {selectedEmployee.employeeId}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
                  <span
                    className={`badge ${
                      selectedEmployee.status === 'Active'
                        ? 'badge-success'
                        : selectedEmployee.status === 'On Leave'
                        ? 'badge-purple'
                        : 'badge-warning'
                    }`}
                  >
                    {selectedEmployee.status}
                  </span>
                  <span className="badge badge-neutral">{selectedEmployee.employmentType}</span>
                </div>
              </div>

              {/* Bio */}
              {selectedEmployee.bio && (
                <div style={{ marginBottom: '20px', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                  "{selectedEmployee.bio}"
                </div>
              )}

              {/* Information Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Work & Organization
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>Department</div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedEmployee.department}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>Reporting Manager</div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>
                      {selectedEmployee.managerName || 'Direct to CEO'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>Joining Date</div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedEmployee.dateOfJoining}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>Work Location</div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedEmployee.workLocation}</div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '12px' }}>
                  Contact Information
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>Work Email</div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedEmployee.email}</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>Phone Number</div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedEmployee.phone}</div>
                  </div>
                </div>

                {/* Skills */}
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '12px' }}>
                  Core Skills & Expertise
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedEmployee.skills.map((skill, idx) => (
                    <span key={idx} className="badge badge-primary">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Switch View Persona action */}
              <div style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button
                  onClick={() => {
                    switchUser(selectedEmployee.id);
                    setSelectedEmployee(null);
                  }}
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  Switch Session as {selectedEmployee.firstName}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD EMPLOYEE */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-container" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add New Employee</div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newEmpForm.firstName}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newEmpForm.lastName}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Work Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={newEmpForm.email}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newEmpForm.phone}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      className="form-control"
                      value={newEmpForm.department}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, department: e.target.value })}
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newEmpForm.designation}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, designation: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Reporting Manager</label>
                    <select
                      className="form-control"
                      value={newEmpForm.managerId}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, managerId: e.target.value })}
                    >
                      {employees.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.firstName} {m.lastName} ({m.designation})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">System Role</label>
                    <select
                      className="form-control"
                      value={newEmpForm.role}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, role: e.target.value as UserRole })}
                    >
                      <option value="EMPLOYEE">Standard Employee</option>
                      <option value="MANAGER">Team Manager</option>
                      <option value="HR_ADMIN">HR Administrator</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Joining Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newEmpForm.dateOfJoining}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, dateOfJoining: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Work Location</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newEmpForm.workLocation}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, workLocation: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Salary ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newEmpForm.salary}
                      onChange={(e) => setNewEmpForm({ ...newEmpForm, salary: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Key Skills (comma separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newEmpForm.skills}
                    onChange={(e) => setNewEmpForm({ ...newEmpForm, skills: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Employee Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
