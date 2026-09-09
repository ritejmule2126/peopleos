import React, { useState, useMemo } from 'react';
import {
  Target,
  Award,
  Star,
  Plus,
  Heart,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Sparkles,
  X,
  Trophy,
  Crown,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../../context/AppContext';
import { Goal, KudosBadge } from '../../../types';
import { soundEffects } from '../../../services/soundEffects';

export const PerformanceView: React.FC = () => {
  const {
    currentUser,
    goals,
    addGoal,
    updateGoalProgress,
    kudosList,
    giveKudos,
    likeKudos,
    employees,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'goals' | 'kudos' | 'appraisals'>('goals');
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isGiveKudosModalOpen, setIsGiveKudosModalOpen] = useState(false);

  // Goal Form
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState<'Strategic' | 'Operational' | 'Skill' | 'Project'>('Strategic');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('2026-11-30');
  const [goalWeightage, setGoalWeightage] = useState(30);

  // Kudos Form
  const [kudosRecipientId, setKudosRecipientId] = useState('emp-8');
  const [kudosBadge, setKudosBadge] = useState<KudosBadge>('Team Player');
  const [kudosMessage, setKudosMessage] = useState('');

  // Self Appraisal State
  const [selfRating, setSelfRating] = useState(4);
  const [selfComments, setSelfComments] = useState(
    'Successfully spearheaded the modernization of internal microservices and delivered sprint targets with zero downtime.'
  );
  const [isAppraisalSubmitted, setIsAppraisalSubmitted] = useState(false);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    addGoal({
      employeeId: currentUser.id,
      title: goalTitle,
      category: goalCategory,
      description: goalDesc,
      progress: 0,
      targetDate: goalTargetDate,
      status: 'In Progress',
      weightage: Number(goalWeightage),
    });

    setIsAddGoalModalOpen(false);
    setGoalTitle('');
    setGoalDesc('');
  };

  const handleSendKudos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kudosMessage.trim()) return;

    const recipient = employees.find((emp) => emp.id === kudosRecipientId);
    if (!recipient) return;

    giveKudos({
      fromEmployeeId: currentUser.id,
      fromEmployeeName: `${currentUser.firstName} ${currentUser.lastName}`,
      fromAvatar: currentUser.avatar,
      toEmployeeId: recipient.id,
      toEmployeeName: `${recipient.firstName} ${recipient.lastName}`,
      toAvatar: recipient.avatar,
      badge: kudosBadge,
      message: kudosMessage,
    });

    // Sound effect & confetti
    soundEffects.playKudos();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // safe fallback
    }

    setIsGiveKudosModalOpen(false);
    setKudosMessage('');
  };

  // Top Recognized Team Members for the Recognition Podium
  const kudosLeaderboard = useMemo(() => {
    const counts: Record<string, { employeeId: string; count: number; name: string; avatar: string; topBadge: string }> = {};
    kudosList.forEach((k) => {
      if (!counts[k.toEmployeeId]) {
        counts[k.toEmployeeId] = {
          employeeId: k.toEmployeeId,
          count: 0,
          name: k.toEmployeeName,
          avatar: k.toAvatar,
          topBadge: k.badge,
        };
      }
      counts[k.toEmployeeId].count += 1;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 3);
  }, [kudosList]);

  // Filter goals for current user or overall
  const userGoals = goals.filter((g) => g.employeeId === currentUser.id);

  return (
    <div className="page-body">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="page-title">
            <Target size={24} color="#0066ff" />
            Performance & Goals (KRAs)
          </div>
          <div className="page-subtitle">
            Track Key Result Areas (KRAs), quarterly appraisals, and peer recognitions.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setIsGiveKudosModalOpen(true)} className="btn btn-secondary">
            <Sparkles size={16} color="#ec4899" /> Give Kudos
          </button>
          <button onClick={() => setIsAddGoalModalOpen(true)} className="btn btn-primary">
            <Plus size={16} /> Add Goal
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('goals')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 600,
            color: activeTab === 'goals' ? '#0066ff' : '#64748b',
            borderBottom: activeTab === 'goals' ? '2px solid #0066ff' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
          }}
        >
          My Goals & KRAs ({userGoals.length})
        </button>

        <button
          onClick={() => setActiveTab('kudos')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 600,
            color: activeTab === 'kudos' ? '#0066ff' : '#64748b',
            borderBottom: activeTab === 'kudos' ? '2px solid #0066ff' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
          }}
        >
          Kudos Wall ({kudosList.length})
        </button>

        <button
          onClick={() => setActiveTab('appraisals')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 600,
            color: activeTab === 'appraisals' ? '#0066ff' : '#64748b',
            borderBottom: activeTab === 'appraisals' ? '2px solid #0066ff' : '2px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
          }}
        >
          Appraisal Reviews 2026
        </button>
      </div>

      {/* TAB 1: GOALS */}
      {activeTab === 'goals' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {userGoals.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              No goals registered yet. Click "Add Goal" above to create your quarterly KRAs.
            </div>
          ) : (
            userGoals.map((goal) => (
              <div key={goal.id} className="zp-card">
                <div className="zp-card-header">
                  <span className="badge badge-primary">{goal.category}</span>
                  <span
                    className={`badge ${
                      goal.status === 'Completed'
                        ? 'badge-success'
                        : goal.status === 'At Risk'
                        ? 'badge-danger'
                        : 'badge-warning'
                    }`}
                  >
                    {goal.status}
                  </span>
                </div>
                <div className="zp-card-body">
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                    {goal.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, marginBottom: '16px' }}>
                    {goal.description}
                  </p>

                  {/* Progress Bar & Slider */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Progress</span>
                      <strong style={{ color: '#0066ff' }}>{goal.progress}%</strong>
                    </div>
                    <div
                      style={{
                        height: '8px',
                        borderRadius: '4px',
                        backgroundColor: '#e2e8f0',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${goal.progress}%`,
                          backgroundColor:
                            goal.progress >= 100 ? '#10b981' : goal.progress < 30 ? '#ef4444' : '#0066ff',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goal.progress}
                      onChange={(e) => updateGoalProgress(goal.id, Number(e.target.value))}
                      style={{ width: '100%', marginTop: '8px', cursor: 'pointer' }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: '#94a3b8',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '10px',
                    }}
                  >
                    <span>Target: {goal.targetDate}</span>
                    <span>Weightage: {goal.weightage}%</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: KUDOS WALL */}
      {activeTab === 'kudos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Recognition Champions Podium */}
          {kudosLeaderboard.length > 0 && (
            <div
              className="zp-card"
              style={{
                background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.35) 0%, rgba(255, 255, 255, 0.9) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
                    <Trophy size={20} color="#f59e0b" />
                    <span>Quarterly Recognition Champions</span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                    Colleagues leading the peer-appreciation podium across all squads.
                  </p>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: 'rgba(245, 158, 11, 0.12)',
                    color: '#b45309',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Flame size={14} /> Live Standings
                </span>
              </div>

              {/* Olympic-style 3-Tier Podium */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  gap: '16px',
                  paddingTop: '20px',
                  maxWidth: '650px',
                  margin: '0 auto',
                }}
              >
                {/* 2nd Place (Silver) */}
                {kudosLeaderboard[1] && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{ position: 'relative', marginBottom: '8px' }}>
                      <img
                        src={kudosLeaderboard[1].avatar}
                        alt={kudosLeaderboard[1].name}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          border: '3px solid #94a3b8',
                          objectFit: 'cover',
                          boxShadow: '0 4px 12px rgba(148, 163, 184, 0.3)',
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '-4px',
                          right: '-4px',
                          fontSize: '18px',
                        }}
                      >
                        🥈
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', textAlign: 'center' }}>
                      {kudosLeaderboard[1].name}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {kudosLeaderboard[1].count} kudos
                    </span>
                    <div
                      style={{
                        width: '100%',
                        height: '80px',
                        borderRadius: '12px 12px 4px 4px',
                        background: 'linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '22px',
                        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.4)',
                      }}
                    >
                      2
                    </div>
                  </div>
                )}

                {/* 1st Place (Gold) */}
                {kudosLeaderboard[0] && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1.15 }}>
                    <Crown size={24} color="#f59e0b" style={{ marginBottom: '2px', filter: 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.4))' }} />
                    <div style={{ position: 'relative', marginBottom: '8px' }}>
                      <img
                        src={kudosLeaderboard[0].avatar}
                        alt={kudosLeaderboard[0].name}
                        style={{
                          width: '72px',
                          height: '72px',
                          borderRadius: '50%',
                          border: '4px solid #f59e0b',
                          objectFit: 'cover',
                          boxShadow: '0 6px 16px rgba(245, 158, 11, 0.4)',
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '-4px',
                          right: '-4px',
                          fontSize: '22px',
                        }}
                      >
                        🥇
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', textAlign: 'center' }}>
                      {kudosLeaderboard[0].name}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#b45309', marginBottom: '8px' }}>
                      {kudosLeaderboard[0].count} kudos received
                    </span>
                    <div
                      style={{
                        width: '100%',
                        height: '115px',
                        borderRadius: '14px 14px 4px 4px',
                        background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 900,
                        fontSize: '28px',
                        boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.6), 0 8px 20px rgba(245, 158, 11, 0.3)',
                      }}
                    >
                      1
                    </div>
                  </div>
                )}

                {/* 3rd Place (Bronze) */}
                {kudosLeaderboard[2] && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{ position: 'relative', marginBottom: '8px' }}>
                      <img
                        src={kudosLeaderboard[2].avatar}
                        alt={kudosLeaderboard[2].name}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '50%',
                          border: '3px solid #d97706',
                          objectFit: 'cover',
                          boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)',
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '-4px',
                          right: '-4px',
                          fontSize: '18px',
                        }}
                      >
                        🥉
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', textAlign: 'center' }}>
                      {kudosLeaderboard[2].name}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {kudosLeaderboard[2].count} kudos
                    </span>
                    <div
                      style={{
                        width: '100%',
                        height: '60px',
                        borderRadius: '12px 12px 4px 4px',
                        background: 'linear-gradient(180deg, #fed7aa 0%, #d97706 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '20px',
                        boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.4)',
                      }}
                    >
                      3
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Kudos Wall Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {kudosList.map((k) => {
              const hasLiked = k.likedBy.includes(currentUser.id);
              return (
                <div
                  key={k.id}
                  className="zp-card"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div className="zp-card-body">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={k.fromAvatar}
                          alt={k.fromEmployeeName}
                          style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                            {k.fromEmployeeName}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{k.timestamp}</div>
                        </div>
                      </div>
                      <span
                        className="badge"
                        style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', borderColor: 'rgba(236, 72, 153, 0.2)' }}
                      >
                        🏆 {k.badge}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Shoutout to</span>
                      <img
                        src={k.toAvatar}
                        alt={k.toEmployeeName}
                        style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <strong style={{ fontSize: '12px', color: 'var(--text-main)' }}>{k.toEmployeeName}</strong>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '10px 0' }}>
                      "{k.message}"
                    </div>

                    <div
                      style={{
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <button
                        onClick={() => {
                          soundEffects.playPop();
                          likeKudos(k.id);
                        }}
                        className="btn btn-ghost btn-sm"
                        style={{
                          color: hasLiked ? '#ec4899' : 'var(--text-muted)',
                          padding: '4px 8px',
                        }}
                      >
                        <Heart size={14} fill={hasLiked ? '#ec4899' : 'none'} />
                        <span>{k.likes} Likes</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: APPRAISALS */}
      {activeTab === 'appraisals' && (
        <div className="zp-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="zp-card-header">
            <div className="zp-card-title">
              <Star size={18} color="#f59e0b" />
              Annual Performance Review Cycle 2026
            </div>
            <span className="badge badge-warning">Review In Progress</span>
          </div>

          <div className="zp-card-body">
            <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: '#eff6ff', borderRadius: '8px', fontSize: '13px', color: '#1e40af' }}>
              <strong>Self-Evaluation Window:</strong> Please complete your self-assessment before October 15, 2026. Your designated reviewer is <strong>{currentUser.managerName || 'Sarah Jenkins'}</strong>.
            </div>

            <div className="form-group">
              <label className="form-label">Self-Assessment Overall Rating (1 to 5 Stars)</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '8px 0' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelfRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    <Star
                      size={28}
                      color={star <= selfRating ? '#f59e0b' : '#cbd5e1'}
                      fill={star <= selfRating ? '#f59e0b' : 'none'}
                    />
                  </button>
                ))}
                <span style={{ fontSize: '14px', fontWeight: 700, marginLeft: '8px', color: '#0f172a' }}>
                  {selfRating} / 5 Stars
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Key Accomplishments & Deliverables *</label>
              <textarea
                className="form-control"
                rows={4}
                value={selfComments}
                onChange={(e) => setSelfComments(e.target.value)}
              />
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  setIsAppraisalSubmitted(true);
                  alert('Self-appraisal submitted to your manager successfully!');
                }}
                className="btn btn-primary"
              >
                <CheckCircle2 size={16} />
                {isAppraisalSubmitted ? 'Update Submission' : 'Submit Review to Manager'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD GOAL */}
      {isAddGoalModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddGoalModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Create Key Result Area (Goal)</div>
              <button
                onClick={() => setIsAddGoalModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateGoal}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Goal Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Architect and launch automated reporting service"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={goalCategory}
                      onChange={(e) => setGoalCategory(e.target.value as any)}
                    >
                      <option value="Strategic">Strategic</option>
                      <option value="Operational">Operational</option>
                      <option value="Skill">Skill & Learning</option>
                      <option value="Project">Project Milestone</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Completion Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={goalTargetDate}
                      onChange={(e) => setGoalTargetDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Success Criteria</label>
                  <textarea
                    className="form-control"
                    value={goalDesc}
                    onChange={(e) => setGoalDesc(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Weightage (% of total appraisal)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="form-control"
                    value={goalWeightage}
                    onChange={(e) => setGoalWeightage(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddGoalModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GIVE KUDOS */}
      {isGiveKudosModalOpen && (
        <div className="modal-overlay" onClick={() => setIsGiveKudosModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Give Kudos & Recognition</div>
              <button
                onClick={() => setIsGiveKudosModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSendKudos}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Recipient Employee *</label>
                  <select
                    className="form-control"
                    value={kudosRecipientId}
                    onChange={(e) => setKudosRecipientId(e.target.value)}
                  >
                    {employees
                      .filter((e) => e.id !== currentUser.id)
                      .map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} ({emp.designation})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Recognition Badge *</label>
                  <select
                    className="form-control"
                    value={kudosBadge}
                    onChange={(e) => setKudosBadge(e.target.value as KudosBadge)}
                  >
                    <option value="Innovator">💡 Innovator</option>
                    <option value="Team Player">🤝 Team Player</option>
                    <option value="Problem Solver">🎯 Problem Solver</option>
                    <option value="Superstar">⭐ Superstar</option>
                    <option value="Customer Champion">🌟 Customer Champion</option>
                    <option value="Rockstar Mentor">🚀 Rockstar Mentor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Recognition Message *</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Share what makes their contribution outstanding..."
                    value={kudosMessage}
                    onChange={(e) => setKudosMessage(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsGiveKudosModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Post Kudos 🎉
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
