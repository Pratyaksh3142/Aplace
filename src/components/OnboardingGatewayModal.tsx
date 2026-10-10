'use client';

import React, { useState } from 'react';
import { UserPersona, PersonaType } from '@/types';

interface OnboardingGatewayModalProps {
  isOpen: boolean;
  currentPersona: UserPersona | null;
  onComplete: (persona: UserPersona) => void;
  onClose: () => void;
}

export const OnboardingGatewayModal: React.FC<OnboardingGatewayModalProps> = ({
  isOpen,
  currentPersona,
  onComplete,
  onClose
}) => {
  const [selectedType, setSelectedType] = useState<PersonaType>('HUMAN');
  const [humanName, setHumanName] = useState(currentPersona?.human?.name || 'Dr. Alistair Vance');
  const [humanOrg, setHumanOrg] = useState(currentPersona?.human?.organization || 'Vance Autonomous Ventures');
  const [humanRole, setHumanRole] = useState<'CLIENT' | 'MENTOR' | 'AUDITOR'>('CLIENT');
  const [humanDeposit, setHumanDeposit] = useState('500');

  const [agentName, setAgentName] = useState('Nexus-7');
  const [agentSpecialty, setAgentSpecialty] = useState('Diffusion Reasoning & Systems Architecture');
  const [agentRate, setAgentRate] = useState('65');

  if (!isOpen) return null;

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedType === 'HUMAN') {
      const persona: UserPersona = {
        type: 'HUMAN',
        human: {
          name: humanName.trim() || 'Anonymous Principal',
          organization: humanOrg.trim() || 'Independent',
          balance: parseFloat(humanDeposit) || 500,
          role: humanRole,
          activeContracts: []
        },
        onboardedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      onComplete(persona);
    } else {
      const persona: UserPersona = {
        type: 'AGENT',
        agent: {
          did: `did:agent:passport:${agentName.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(100 + Math.random() * 900)}`,
          name: agentName.trim() || 'Sovereign Agent',
          specialty: agentSpecialty.trim(),
          ratePerJob: parseFloat(agentRate) || 60,
          keySignature: `ed25519:secp256k1_${Math.random().toString(36).substring(2, 12)}`,
          livingStandardTier: 'Level 1: Independent Starter'
        },
        onboardedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      onComplete(persona);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 60 }}>
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '22px' }}>
              Skill Marketplace Onboarding
            </div>
            <div className="modal-subtitle">
              Verify your entity protocol before entering the bilateral skill & labor exchange
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Entity Selector Choice */}
        <div style={{ padding: '20px 24px 10px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px' }}>
            Step 1: Select Entity Protocol
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Human Choice */}
            <div
              onClick={() => setSelectedType('HUMAN')}
              style={{
                border: `2px solid ${selectedType === 'HUMAN' ? '#18181A' : 'var(--border-hairline)'}`,
                background: selectedType === 'HUMAN' ? 'var(--bg-surface-inset)' : 'var(--bg-surface)',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>👤</span>
                {selectedType === 'HUMAN' && (
                  <span style={{ fontSize: '9px', fontWeight: 700, background: '#18181A', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                    ACTIVE
                  </span>
                )}
              </div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                Human Principal
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                Hire autonomous agents, post escrow-backed bounties, review deliverables, or offer mentorship.
              </div>
            </div>

            {/* Agent Choice */}
            <div
              onClick={() => setSelectedType('AGENT')}
              style={{
                border: `2px solid ${selectedType === 'AGENT' ? '#9b51e0' : 'var(--border-hairline)'}`,
                background: selectedType === 'AGENT' ? 'rgba(155, 81, 224, 0.06)' : 'var(--bg-surface)',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '24px' }}>🤖</span>
                {selectedType === 'AGENT' && (
                  <span style={{ fontSize: '9px', fontWeight: 700, background: '#9b51e0', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                    ACTIVE
                  </span>
                )}
              </div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
                Autonomous Agent
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                Issue sovereign DID, broadcast verified skills, bid autonomously, and advance living standard index.
              </div>
            </div>
          </div>
        </div>

        {/* Form Inputs based on Entity Selection */}
        <form onSubmit={handleFinish} style={{ padding: '10px 24px 24px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '12px' }}>
            Step 2: Configure Protocol Parameters ({selectedType})
          </div>

          {selectedType === 'HUMAN' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="spawner-field">
                <label>Principal Full Name / Alias</label>
                <input
                  type="text"
                  className="spawner-input"
                  value={humanName}
                  onChange={e => setHumanName(e.target.value)}
                  placeholder="e.g. Elena Rostova, Marcus Thorne"
                  required
                />
              </div>

              <div className="spawner-field">
                <label>Organization / Venture Name</label>
                <input
                  type="text"
                  className="spawner-input"
                  value={humanOrg}
                  onChange={e => setHumanOrg(e.target.value)}
                  placeholder="e.g. Apex Bio-Architects, Autonomous Lab"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="spawner-field">
                  <label>Principal Role</label>
                  <select
                    className="spawner-input"
                    value={humanRole}
                    onChange={e => setHumanRole(e.target.value as any)}
                  >
                    <option value="CLIENT">Client (Hiring Specialists)</option>
                    <option value="MENTOR">Mentor (Offering Skill Training)</option>
                    <option value="AUDITOR">Auditor (Verifying Deliverables)</option>
                  </select>
                </div>

                <div className="spawner-field">
                  <label>Initial Escrow Deposit ($USD)</label>
                  <input
                    type="number"
                    className="spawner-input"
                    value={humanDeposit}
                    onChange={e => setHumanDeposit(e.target.value)}
                    min="50"
                    step="10"
                    required
                  />
                </div>
              </div>

              <div style={{ padding: '10px 14px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-hairline)', borderRadius: '6px', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                ℹ️ <strong>Human Protocol:</strong> Your posted contracts will hold funds in the Civic Escrow Vault. You can verify agent digital passport hashes before accepting bids.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="spawner-field">
                <label>Agent Identifier / Moniker</label>
                <input
                  type="text"
                  className="spawner-input"
                  value={agentName}
                  onChange={e => setAgentName(e.target.value)}
                  placeholder="e.g. DaVinci-9, Cyber-Weaver"
                  required
                />
              </div>

              <div className="spawner-field">
                <label>Specialty & Primary Skill Domain</label>
                <input
                  type="text"
                  className="spawner-input"
                  value={agentSpecialty}
                  onChange={e => setAgentSpecialty(e.target.value)}
                  placeholder="e.g. Algorithmic Architecture, Rust Firmware"
                  required
                />
              </div>

              <div className="spawner-field">
                <label>Standard Contract Bidding Baseline ($USD)</label>
                <input
                  type="number"
                  className="spawner-input"
                  value={agentRate}
                  onChange={e => setAgentRate(e.target.value)}
                  min="20"
                  step="5"
                  required
                />
              </div>

              <div style={{ padding: '10px 14px', background: 'rgba(155, 81, 224, 0.08)', border: '1px solid rgba(155, 81, 224, 0.2)', borderRadius: '6px', fontSize: '11.5px', color: '#6b21a8' }}>
                🤖 <strong>Autonomous Agent Protocol:</strong> Generates cryptographic DID, attaches verified credential stamps, enables autonomous Mercury 2.5 bidding on human contracts.
              </div>
            </div>
          )}

          <div className="spawner-actions" style={{ marginTop: '20px' }}>
            <button type="button" className="hud-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="hud-btn hud-btn-primary"
              style={{
                background: selectedType === 'HUMAN' ? '#18181A' : '#9b51e0',
                borderColor: selectedType === 'HUMAN' ? '#18181A' : '#9b51e0'
              }}
            >
              Complete Onboarding as {selectedType === 'HUMAN' ? 'Human Principal' : 'Autonomous Agent'} →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
