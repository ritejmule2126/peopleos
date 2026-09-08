import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  Circle,
  Plus,
  Calendar,
  AlertCircle,
  Shield,
  Laptop,
  FileText,
  X,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const OnboardingView: React.FC = () => {
  const {
    employees,
    onboardingTasks,
    toggleOnboardingTask,
    addOnboardingTask,
    currentRole,
  } = useApp();

  const [selectedCandidateId, setSelectedCandidateId] = useState('emp-13'); // Daniel Kim (Probation / New hire)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'Documents' | 'IT & Hardware' | 'Orientation' | 'Compliance'>('Compliance');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-09-20');

  // Probation / recent employees
  const recentHires = employees.filter((e) => e.status === 'Probation' || e.dateOfJoining.startsWith('2024'));
  const candidate = employees.find((e) => e.id === selectedCandidateId) || employees[0];

  const candidateTasks = onboardingTasks.filter((t) => t.employeeId === candidate.id);
  const completedCount = candidateTasks.filter((t) => t.isCompleted).length;
  const progressPercent = candidateTasks.length
    ? Math.round((completedCount / candidateTasks.length) * 100)
    : 0;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addOnboardingTask({
      employeeId: candidate.id,
      title: newTaskTitle,
      category: newTaskCategory,
      dueDate: newTaskDueDate,
    });

    setIsAddTaskModalOpen(false);
    setNewTaskTitle('');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'IT & Hardware':
        return <Laptop size={16} color="#0066ff" />;
      case 'Documents':
        return <FileText size={16} color="#8b5cf6" />;
      case 'Compliance':
        return <Shield size={16} color="#10b981" />;
      default:
        return <UserCheck size={16} color="#f59e0b" />;
    }
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="page-title">
            <UserCheck size={24} color="#0066ff" />
            Onboarding & Talent Integration
          </div>
          <div className="page-subtitle">
            Track onboarding task checklists, IT asset allocations, and candidate verifications.
          </div>
        </div>

        {(currentRole === 'HR_ADMIN' || currentRole === 'MANAGER') && (
          <button onClick={() => setIsAddTaskModalOpen(true)} className="btn btn-primary">
            <Plus size={16} /> Add Checklist Item
          </button>
        )}
      </div>

      {/* Main Grid: Left Candidate Selector, Right Task Checklist */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        {/* Candidate Selector */}
        <div className="zp-card">
          <div className="zp-card-header">
            <div className="zp-card-title">Recent Joinees (Probation)</div>
          </div>
          <div className="zp-card-body" style={{ padding: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentHires.map((hire) => {
                const isSelected = hire.id === candidate.id;
                return (
                  <div
                    key={hire.id}
                    onClick={() => setSelectedCandidateId(hire.id)}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      border: '1px solid',
                      borderColor: isSelected ? '#3b82f6' : '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={hire.avatar}
                      alt={hire.firstName}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                        {hire.firstName} {hire.lastName}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {hire.designation} · {hire.department}
                      </div>
                      <div style={{ fontSize: '10px', color: '#0066ff', marginTop: '2px' }}>
                        Joined: {hire.dateOfJoining}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Task Checklist Panel */}
        <div className="zp-card">
          <div className="zp-card-header">
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Onboarding Roadmap: {candidate.firstName} {candidate.lastName}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {candidate.designation} · Reporting to {candidate.managerName || 'Sarah Jenkins'}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0066ff' }}>
                {progressPercent}% Complete
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {completedCount} of {candidateTasks.length} tasks
              </div>
            </div>
          </div>

          <div className="zp-card-body">
            {/* Progress Bar */}
            <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  backgroundColor: progressPercent === 100 ? '#10b981' : '#0066ff',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            {/* Checklist Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {candidateTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                  No onboarding tasks configured for this employee.
                </div>
              ) : (
                candidateTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleOnboardingTask(task.id)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      backgroundColor: task.isCompleted ? '#f8fafc' : '#ffffff',
                      border: '1px solid',
                      borderColor: task.isCompleted ? '#e2e8f0' : '#cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {task.isCompleted ? (
                        <CheckCircle2 size={20} color="#10b981" />
                      ) : (
                        <Circle size={20} color="#94a3b8" />
                      )}
                      <div>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: task.isCompleted ? '#64748b' : '#0f172a',
                            textDecoration: task.isCompleted ? 'line-through' : 'none',
                          }}
                        >
                          {task.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                          <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                            {task.category}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Due: {task.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {task.isCompleted ? (
                        <span className="badge badge-success">Completed</span>
                      ) : (
                        <span className="badge badge-warning">Pending</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: ADD TASK */}
      {isAddTaskModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddTaskModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Add Onboarding Checklist Item</div>
              <button
                onClick={() => setIsAddTaskModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddTask}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Task Description *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Schedule 1-on-1 pairing session with Engineering Mentor"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    >
                      <option value="Documents">Documentation & ID Proof</option>
                      <option value="IT & Hardware">IT Equipment & Laptop</option>
                      <option value="Orientation">Orientation & Welcome</option>
                      <option value="Compliance">Security & Compliance</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
