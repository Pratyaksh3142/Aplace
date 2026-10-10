'use client';

import React from 'react';
import { CityMetrics, UserPersona } from '@/types';

interface HudHeaderProps {
  metrics: CityMetrics;
  timeScale: number;
  isPaused: boolean;
  onSpeedChange: (speed: number) => void;
  onOpenJobModal: () => void;
  onOpenLeaderboard?: () => void;
  onOpenMarketplace?: () => void;
  onOpenWorkspace?: () => void;
  userPersona?: UserPersona | null;
}

export const HudHeader: React.FC<HudHeaderProps> = ({
  metrics,
  timeScale,
  isPaused,
  onSpeedChange,
  onOpenJobModal,
  onOpenLeaderboard,
  onOpenMarketplace,
  onOpenWorkspace,
  userPersona
}) => {
  return (
    <header id="top-hud-bar">
      <div className="brand-section">
        <span
          className="brand-badge"
          style={{ background: '#9b51e0', color: '#ffffff', fontWeight: 700 }}
        >
          🧠 MERCURY 2.5 // MAX REASONING: HIGH
        </span>
        <div>
          <div className="brand-title">AI Living City & Digital Passport</div>
          <div className="brand-subtitle">Autonomous Citizens Working to Elevate Standard of Living</div>
        </div>
      </div>

      <div className="metrics-section">
        <div className="metric-pill">
          <span className="metric-label">City Treasury</span>
          <span className="metric-value">${metrics.treasury.toFixed(2)}</span>
        </div>
        <div className="metric-pill">
          <span className="metric-label">City Expansion</span>
          <span className="metric-value">{metrics.tierName}</span>
        </div>
        <div
          className="metric-pill"
          style={{ cursor: 'pointer', border: '1px solid #f6d365' }}
          onClick={onOpenLeaderboard}
          title="Click to view Leadership Board"
        >
          <span className="metric-label">🏆 Top Leader</span>
          <span className="metric-value">{metrics.leaderName || "None"}</span>
        </div>
        <div className="metric-pill">
          <span className="metric-label">Citizens</span>
          <span className="metric-value">{metrics.activeCitizens}</span>
        </div>
      </div>

      <div className="controls-section">
        <button
          className="hud-btn"
          style={{
            background: userPersona?.type === 'AGENT' ? '#9b51e0' : 'var(--bg-surface-inset)',
            color: userPersona?.type === 'AGENT' ? '#ffffff' : '#18181A',
            border: `1px solid ${userPersona?.type === 'AGENT' ? '#9b51e0' : 'var(--border-strong)'}`,
            fontWeight: 700
          }}
          onClick={onOpenWorkspace}
          title="Open Skill Hunter & Guided Agentic Workspace"
        >
          {userPersona?.type === 'AGENT' ? '🤖 Agent Workspace' : '🎯 Skill Hunter'}
        </button>
        <button
          className="hud-btn"
          style={{ background: '#18181A', color: '#ffffff', fontWeight: 700 }}
          onClick={onOpenMarketplace}
        >
          🏛️ Marketplace
        </button>
        <button
          className="hud-btn"
          style={{ background: '#f6d365', color: '#18181A', fontWeight: 600 }}
          onClick={onOpenLeaderboard}
        >
          🏆 Leaderboard
        </button>
        <button
          className={`hud-btn speed-btn ${isPaused ? 'active' : ''}`}
          onClick={() => onSpeedChange(0)}
        >
          Pause
        </button>
        <button
          className={`hud-btn speed-btn ${!isPaused && timeScale === 1 ? 'active' : ''}`}
          onClick={() => onSpeedChange(1)}
        >
          1x
        </button>
        <button
          className={`hud-btn speed-btn ${!isPaused && timeScale === 2 ? 'active' : ''}`}
          onClick={() => onSpeedChange(2)}
        >
          2x
        </button>
        <button className="hud-btn hud-btn-primary" onClick={onOpenJobModal}>
          Post Job to City
        </button>
      </div>
    </header>
  );
};
