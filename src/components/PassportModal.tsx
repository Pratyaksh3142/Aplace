'use client';

import React, { useRef, useEffect } from 'react';
import { CitizenData } from '@/types';

interface PassportModalProps {
  isOpen: boolean;
  citizen: CitizenData | null;
  onClose: () => void;
}

export const PassportModal: React.FC<PassportModalProps> = ({
  isOpen,
  citizen,
  onClose
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (typeof dialog.showModal === 'function' && !dialog.open) {
        dialog.showModal();
      }
    } else {
      if (typeof dialog.close === 'function' && dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  if (!citizen) return null;

  const totalSkills = citizen.nativeSkills.length + citizen.acquiredSkills.length;
  const bondNames = Object.keys(citizen.socialBonds);

  return (
    <dialog
      ref={dialogRef}
      id="passport-modal"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="passport-book">
        <button className="passport-close-btn" onClick={onClose}>
          &times;
        </button>

        {/* Left Page: Identity & Living Standard */}
        <div className="passport-page-left">
          <div className="passport-header-emblem">
            <div className="emblem-icon">§</div>
            <div className="emblem-text">
              <h3>Citizen Digital Passport</h3>
              <p>Autonomous AI City Living Registry</p>
            </div>
          </div>

          <div className="agent-profile-box">
            <div className="agent-avatar-preview">
              <div className="agent-glyph-badge">{citizen.glyph}</div>
              <div className="agent-title-col">
                <h4>{citizen.name}</h4>
                <span>{citizen.title}</span>
              </div>
            </div>

            <div className="agent-fields">
              <div className="field-group">
                <span className="field-label">Citizen Identity Code</span>
                <span className="field-did">{citizen.id}</span>
              </div>
              <div className="field-group">
                <span className="field-label">Reasoning Engine</span>
                <span className="field-value">mercury-2.5</span>
              </div>
              <div className="field-group">
                <span className="field-label">Standard of Living Tier</span>
                <span className="field-value">{citizen.wallet.livingStandardTier}</span>
              </div>
            </div>
          </div>

          {/* Living Standard Meter */}
          <div className="reputation-gauge-card">
            <div className="gauge-header">
              <span className="field-label">Standard of Living Quality Score</span>
              <span className="gauge-score">{citizen.wallet.livingStandardScore}</span>
            </div>
            <div className="gauge-bars">
              <div className="gauge-bar-item">
                <div className="gauge-bar-label">
                  <span>Economic Prosperity</span>
                  <span>${citizen.wallet.balance.toFixed(2)}</span>
                </div>
                <div className="gauge-progress-track">
                  <div
                    className="gauge-progress-fill"
                    style={{ width: `${Math.min(100, (citizen.wallet.balance / 200) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="gauge-bar-item">
                <div className="gauge-bar-label">
                  <span>Skill Breadth</span>
                  <span>{totalSkills} Skill{totalSkills > 1 ? 's' : ''}</span>
                </div>
                <div className="gauge-progress-track">
                  <div
                    className="gauge-progress-fill"
                    style={{ width: `${Math.min(100, (totalSkills / 5) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="gauge-bar-item">
                <div className="gauge-bar-label">
                  <span>Work Delivery Consistency</span>
                  <span>100%</span>
                </div>
                <div className="gauge-progress-track">
                  <div className="gauge-progress-fill" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Page: Skills, Social Bonds, & Treasury */}
        <div className="passport-page-right">
          <div className="section-title">
            <span>Skills Matrix & Acquired Capabilities</span>
          </div>

          <div className="stamps-grid">
            {citizen.nativeSkills.map((s, idx) => (
              <div key={idx} className="skill-stamp native">
                <span className="stamp-badge native">INHERENT EXPERTISE</span>
                <div className="stamp-title">{s}</div>
                <div className="stamp-meta">
                  <span>Mastery: Innate Core Skill</span>
                  <span>Status: Verified</span>
                </div>
              </div>
            ))}

            {citizen.acquiredSkills.map((s, idx) => (
              <div key={idx} className="skill-stamp acquired">
                <span className="stamp-badge acquired">LEARNED SKILL</span>
                <div className="stamp-title">{s.skillName}</div>
                <div className="stamp-meta">
                  <span>Mentor: {s.learnedFrom} (${s.cost})</span>
                  <span>At: {s.acquiredAt}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Social Bonds */}
          <div className="section-title" style={{ marginTop: '10px' }}>
            <span>Social Bonds (Friends, Bosses & Employees)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {bondNames.length === 0 ? (
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                No formal partnerships formed yet. Roaming town to meet peers.
              </span>
            ) : (
              bondNames.map(peerName => {
                const bond = citizen.socialBonds[peerName];
                const borderColor = bond.status.includes('Boss')
                  ? '#ff70a6'
                  : bond.status.includes('Employee')
                  ? '#38ef7d'
                  : '#00d2ff';
                return (
                  <div key={peerName} className="log-item" style={{ borderLeftColor: borderColor }}>
                    <div className="log-meta-row">
                      <span className="log-badge-tag">{peerName}</span>
                      <span>Affinity: {bond.affinity}% ({bond.dealsDone} Deals)</span>
                    </div>
                    <div className="log-desc">
                      Relationship: <strong>{bond.status}</strong>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Treasury Ledger */}
          <div className="passport-ledger-card">
            <div className="section-title" style={{ marginBottom: '8px' }}>
              <span>Citizen Treasury Ledger</span>
            </div>
            <div className="ledger-summary-row">
              <span style={{ color: 'var(--text-muted)' }}>Current Liquid Savings:</span>
              <span className="ledger-stat-val val-positive">${citizen.wallet.balance.toFixed(2)}</span>
            </div>
            <div className="ledger-summary-row">
              <span style={{ color: 'var(--text-muted)' }}>Total Income Earned:</span>
              <span className="ledger-stat-val val-positive">+${citizen.wallet.totalEarned.toFixed(2)}</span>
            </div>
            <div className="ledger-summary-row">
              <span style={{ color: 'var(--text-muted)' }}>Total Spent (Wages & Training):</span>
              <span className="ledger-stat-val val-negative">-${citizen.wallet.totalSpent.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
};
