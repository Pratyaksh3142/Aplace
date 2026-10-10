'use client';

import React, { useRef, useEffect } from 'react';
import { CitizenData, JobContract, ActivityLog } from '@/types';

interface CommandConsoleProps {
  selectedCitizen: CitizenData | null;
  allCitizens: CitizenData[];
  activeJobs: JobContract[];
  logs: ActivityLog[];
  activeTab: 'all' | 'jobs' | 'social' | 'leaderboard';
  onTabChange: (tab: 'all' | 'jobs' | 'social' | 'leaderboard') => void;
  onOpenPassport: () => void;
  onSelectCitizen: (citizen: CitizenData) => void;
}

export const CommandConsole: React.FC<CommandConsoleProps> = ({
  selectedCitizen,
  allCitizens,
  activeJobs,
  logs,
  activeTab,
  onTabChange,
  onOpenPassport,
  onSelectCitizen
}) => {
  const minimapRef = useRef<HTMLCanvasElement | null>(null);

  // Render minimap
  useEffect(() => {
    const canvas = minimapRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 340;
    canvas.height = 75;

    ctx.fillStyle = '#e8f5e9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const pad = 10;
    const mapW = canvas.width - pad * 2;
    const mapH = canvas.height - pad * 2;

    allCitizens.forEach(citizen => {
      const mx = pad + (citizen.x / 26) * mapW;
      const my = pad + (citizen.y / 26) * mapH;

      ctx.fillStyle = citizen.color || '#00d2ff';
      ctx.beginPath();
      ctx.arc(mx, my, 4, 0, Math.PI * 2);
      ctx.fill();

      if (selectedCitizen && citizen.id === selectedCitizen.id) {
        ctx.strokeStyle = '#18181A';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mx, my, 7, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }, [allCitizens, selectedCitizen]);

  const bondKeys = selectedCitizen ? Object.keys(selectedCitizen.socialBonds) : [];

  return (
    <aside id="right-hud-panel">
      <div className="panel-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
        <div className="panel-header-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="status-dot"></div>
          <span style={{ fontSize: '15px', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>Citizen Registry & Living Index</span>
        </div>
        <span className="panel-subtag" style={{ color: '#059669', fontWeight: 600, fontSize: '9px', letterSpacing: '0.05em', background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', border: '1px solid #d1fae5', marginLeft: '14px' }}>
          🧠 MERCURY 2.5: MAX THINKING
        </span>
      </div>

      {selectedCitizen && (
        <div id="agent-focus-card">
          <div className="focus-card-top">
            <div className="focus-name-group">
              <div className="focus-name">
                <span className="focus-glyph" style={{ background: selectedCitizen.color, color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                  {selectedCitizen.glyph}
                </span>
                <span style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'var(--font-serif)' }}>{selectedCitizen.name}</span>
              </div>
              <div className="focus-did">{selectedCitizen.title}</div>
            </div>
            <span className="focus-badge badge-working">
              {selectedCitizen.wallet.livingStandardTier.split(':')[0].toUpperCase()}
            </span>
          </div>

          <div className="focus-card-meta">
            <div className="focus-meta-item">
              <div className="label">Balance</div>
              <div className="val" style={{ color: '#2ec4b6', fontWeight: 700 }}>
                ${selectedCitizen.wallet.balance.toFixed(2)}
              </div>
            </div>
            <div className="focus-meta-item">
              <div className="label">Jobs Done</div>
              <div className="val">{selectedCitizen.jobsCompleted}</div>
            </div>
            <div className="focus-meta-item">
              <div className="label">Living Score</div>
              <div className="val">{selectedCitizen.wallet.livingStandardScore} pts</div>
            </div>
          </div>

          {selectedCitizen.reasoningTokensLastAction ? (
            <div
              style={{
                marginTop: '6px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(155, 81, 224, 0.08)',
                border: '1px solid rgba(155, 81, 224, 0.2)',
                padding: '4px 8px',
                borderRadius: '4px'
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Mercury 2.5 Thinking:</span>
              <span style={{ fontWeight: 600, color: '#9b51e0' }}>
                🧠 {selectedCitizen.reasoningTokensLastAction} tokens (High Effort)
              </span>
            </div>
          ) : null}

          <div className="focus-needs-strip">
            <span className="focus-needs-title">Social Bonds & Network:</span>
            <div className="focus-needs-tags">
              {bondKeys.length === 0 ? (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  Independent citizen (Roam to form bonds)
                </span>
              ) : (
                bondKeys.slice(0, 3).map(name => (
                  <span key={name} className="need-tag">
                    {name} ({selectedCitizen.socialBonds[name].status})
                  </span>
                ))
              )}
            </div>
          </div>

          <button className="focus-action-btn" onClick={onOpenPassport}>
            <span>Open Citizen Digital Passport</span>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div id="activity-log-container">
        <div className="log-tabs">
          <div
            className={`log-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => onTabChange('all')}
          >
            Activity
          </div>
          <div
            className={`log-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => onTabChange('leaderboard')}
          >
            🏆 Leaderboard
          </div>
          <div
            className={`log-tab ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => onTabChange('jobs')}
          >
            Jobs ({activeJobs.filter(j => j.status === 'OPEN').length})
          </div>
          <div
            className={`log-tab ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => onTabChange('social')}
          >
            Social
          </div>
        </div>

        <div id="log-entries">
          {activeTab === 'leaderboard' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div
                style={{
                  padding: '6px 8px',
                  background: 'var(--surface-sunken)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: 'var(--text-secondary)'
                }}
              >
                🏆 <strong>Town Prosperity Leaderboard</strong>: Ranked by Standard of Living Quality Score and Liquid Wealth.
              </div>
              {allCitizens
                .slice()
                .sort((a, b) => {
                  if (b.wallet.livingStandardScore !== a.wallet.livingStandardScore) {
                    return b.wallet.livingStandardScore - a.wallet.livingStandardScore;
                  }
                  return b.wallet.balance - a.wallet.balance;
                })
                .map((c, index) => {
                  const isTop = index === 0;
                  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
                  const isSelected = selectedCitizen?.id === c.id;

                  return (
                    <div
                      key={c.id}
                      onClick={() => onSelectCitizen(c)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        padding: '8px 10px',
                        background: isSelected
                          ? 'rgba(0, 210, 255, 0.08)'
                          : isTop
                          ? 'rgba(246, 211, 101, 0.12)'
                          : 'var(--surface)',
                        border: `1px solid ${
                          isSelected ? 'var(--accent)' : isTop ? '#f6d365' : 'var(--border-subtle)'
                        }`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, width: '22px' }}>{medal}</span>
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '4px',
                              background: c.color,
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '11px'
                            }}
                          >
                            {c.glyph}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {c.name}{' '}
                              {isTop && (
                                <span
                                  style={{
                                    fontSize: '9px',
                                    background: '#f6d365',
                                    color: '#18181A',
                                    padding: '1px 5px',
                                    borderRadius: '3px',
                                    fontWeight: 700
                                  }}
                                >
                                  TOWN MAYOR
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{c.title}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#2ec4b6' }}>
                            ${c.wallet.balance.toFixed(2)}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            {c.wallet.livingStandardScore} pts
                          </div>
                        </div>
                      </div>

                      {/* Living score progress */}
                      <div style={{ marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div
                          style={{
                            flex: 1,
                            height: '4px',
                            background: 'rgba(0,0,0,0.06)',
                            borderRadius: '2px',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(100, (c.wallet.livingStandardScore / 120) * 100)}%`,
                              height: '100%',
                              background: isTop ? '#f6d365' : 'var(--accent)',
                              borderRadius: '2px'
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {c.wallet.livingStandardTier.split(':')[0]}
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginTop: '4px',
                          fontSize: '10px',
                          color: 'var(--text-muted)'
                        }}
                      >
                        <span>
                          Jobs: <strong>{c.jobsCompleted}</strong> | Skills:{' '}
                          <strong>{c.nativeSkills.length + c.acquiredSkills.length}</strong>
                        </span>
                        {c.reasoningTokensLastAction ? (
                          <span style={{ color: '#9b51e0', fontWeight: 600 }}>
                            🧠 {c.reasoningTokensLastAction} tkns
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : activeTab === 'jobs' ? (
            activeJobs.map(job => (
              <div
                key={job.id}
                className="log-item jobs"
                style={{ borderLeftColor: job.status === 'OPEN' ? '#38ef7d' : '#f6d365' }}
              >
                <div className="log-meta-row">
                  <span className="log-badge-tag">${job.bounty.toFixed(0)} Bounty</span>
                  <span>{job.status}</span>
                </div>
                <div className="log-desc">
                  <strong>{job.title}</strong>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Requires: {job.requiredSkills.join(' + ')}
                </div>
              </div>
            ))
          ) : (
            logs
              .filter(l => activeTab === 'all' || l.category === activeTab)
              .map(log => (
                <div key={log.id} className={`log-item ${log.category}`}>
                  <div className="log-meta-row">
                    <span className="log-badge-tag">{log.tag}</span>
                    <span>{log.time}</span>
                  </div>
                  <div className="log-desc">{log.message}</div>
                  {log.reasoningTokens ? (
                    <div style={{ marginTop: '3px', fontSize: '9px', color: '#9b51e0', fontWeight: 600 }}>
                      🧠 Inception Mercury 2.5 thinking: {log.reasoningTokens} tokens
                    </div>
                  ) : null}
                </div>
              ))
          )}
        </div>
      </div>

      {/* Minimap */}
      <div id="minimap-wrapper">
        <canvas ref={minimapRef} id="minimap-canvas" />
        <div className="minimap-legend">
          {allCitizens.slice(0, 4).map(c => (
            <div
              key={c.id}
              className="legend-item"
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectCitizen(c)}
            >
              <div className="legend-dot" style={{ background: c.color }} />
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
