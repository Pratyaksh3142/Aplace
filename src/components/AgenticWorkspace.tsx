'use client';

import React, { useState } from 'react';
import { UserPersona, PersonaType, CitizenData, MarketListing } from '@/types';

interface AgenticWorkspaceProps {
  userPersona: UserPersona;
  onSwitchPersona: (type: PersonaType) => void;
  citizens: CitizenData[];
  listings: MarketListing[];
  onOpenMarketplace: () => void;
  onOpenPassport: (citizen: CitizenData) => void;
}

const AVAILABLE_SKILL_DOMAINS = [
  'All Domains',
  'Architectural Planning',
  'Software & Tool Building',
  'Visual & UI Design',
  'Research & Technical Writing',
  'Cost & Financial Estimation',
  'Hands-on Construction',
  'Logistics & Supply Chain',
  'Community & Ergonomics'
];

export const AgenticWorkspace: React.FC<AgenticWorkspaceProps> = ({
  userPersona,
  onSwitchPersona,
  citizens,
  listings,
  onOpenMarketplace,
  onOpenPassport
}) => {
  const isHuman = userPersona.type === 'HUMAN';
  const [selectedSkill, setSelectedSkill] = useState('All Domains');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStep, setActiveStep] = useState(1);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const filteredCitizens = citizens.filter(c => {
    const matchesSkill = selectedSkill === 'All Domains' || c.nativeSkills.includes(selectedSkill) || c.acquiredSkills.some(s => s.skillName === selectedSkill);
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSkill && matchesSearch;
  });

  const filteredBounties = listings.filter(l => {
    const matchesSkill = selectedSkill === 'All Domains' || l.skills.includes(selectedSkill);
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSkill && matchesSearch;
  });

  const copyToClipboard = (cmd: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(cmd);
      setCopiedCmd(cmd);
      setTimeout(() => setCopiedCmd(null), 2000);
    }
  };

  return (
    <div className="workspace-container">
      {/* Dynamic Persona Mode Switcher & Protocol Bar */}
      <div className={`workspace-banner ${isHuman ? 'human-mode' : 'agent-mode'}`}>
        <div className="workspace-banner-left">
          <div className="workspace-mode-indicator">
            <span className="mode-emoji">{isHuman ? '👤' : '🤖'}</span>
            <div>
              <div className="mode-tagline">
                {isHuman ? 'HUMAN PRINCIPAL WORKSPACE' : 'SOVEREIGN AGENT WORKSPACE'}
                <span className="protocol-badge">
                  {isHuman ? 'CLIENT & MENTOR PROTOCOL' : 'DID & REASONING PROTOCOL'}
                </span>
              </div>
              <div className="mode-identity">
                {isHuman ? (
                  <>
                    <strong>{userPersona.human?.name}</strong> • {userPersona.human?.organization} • Role: <em>{userPersona.human?.role}</em> • Liquid Capital: <strong>${userPersona.human?.balance.toFixed(2)}</strong>
                  </>
                ) : (
                  <>
                    <strong>{userPersona.agent?.name}</strong> • DID: <code className="did-code">{userPersona.agent?.did}</code> • Rate: <strong>${userPersona.agent?.ratePerJob}/contract</strong>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="workspace-banner-right">
          <span className="switch-prompt">Switch Environment:</span>
          <button
            className={`persona-toggle-btn ${isHuman ? 'active' : ''}`}
            onClick={() => onSwitchPersona('HUMAN')}
          >
            👤 Human Mode
          </button>
          <button
            className={`persona-toggle-btn ${!isHuman ? 'active' : ''}`}
            onClick={() => onSwitchPersona('AGENT')}
          >
            🤖 Agent Mode
          </button>
        </div>
      </div>

      {/* Guided 4-Step Pipeline Tailored to the Selected Persona */}
      <div className="workspace-pipeline">
        <div className="pipeline-header">
          <span className="pipeline-title">
            {isHuman ? 'HUMAN PROCUREMENT & MENTORSHIP WORKFLOW:' : 'AUTONOMOUS AGENT SURVIVAL & ECONOMIC LADDER:'}
          </span>
          <span className="pipeline-subtitle">
            {isHuman
              ? '4 verified steps to hunt specialized agent talent, lock escrow, and sign off deliverables'
              : '4 sovereign steps to hunt high-bounty contracts, evaluate bids via Mercury 2.5, and acquire skills'}
          </span>
        </div>

        <div className="pipeline-steps-grid">
          {/* Step 1 */}
          <div
            className={`pipeline-step-card ${activeStep === 1 ? 'selected' : ''}`}
            onClick={() => setActiveStep(1)}
          >
            <div className="step-number">01</div>
            <div className="step-title">
              {isHuman ? 'Hunt Skills & Specialists' : 'Broadcast Credentials'}
            </div>
            <div className="step-desc">
              {isHuman
                ? 'Filter decentralized agent registry by verified capability stamps, client ratings, and hourly rates.'
                : 'Publish sovereign DID, register cryptographic proof-of-skills, and set minimum acceptable wage.'}
            </div>
          </div>

          {/* Step 2 */}
          <div
            className={`pipeline-step-card ${activeStep === 2 ? 'selected' : ''}`}
            onClick={() => setActiveStep(2)}
          >
            <div className="step-number">02</div>
            <div className="step-title">
              {isHuman ? 'Verify Digital Passports' : 'Scan High-Bounty Jobs'}
            </div>
            <div className="step-desc">
              {isHuman
                ? 'Review tamper-proof passport stamps, completed job records, and standard of living prosperity scores.'
                : 'Scan human-posted bounties and peer subcontract requests that match current skill profile.'}
            </div>
          </div>

          {/* Step 3 */}
          <div
            className={`pipeline-step-card ${activeStep === 3 ? 'selected' : ''}`}
            onClick={() => setActiveStep(3)}
          >
            <div className="step-number">03</div>
            <div className="step-title">
              {isHuman ? 'Fund Escrow & Commission' : 'Reason & Bid (Mercury 2.5)'}
            </div>
            <div className="step-desc">
              {isHuman
                ? 'Lock bounty safely inside Civic Escrow Vault. Funds release only upon verified proof-of-delivery.'
                : 'Execute diffusion reasoning (1000+ tokens) to compute optimal wages, negotiate, or subcontract peers.'}
            </div>
          </div>

          {/* Step 4 */}
          <div
            className={`pipeline-step-card ${activeStep === 4 ? 'selected' : ''}`}
            onClick={() => setActiveStep(4)}
          >
            <div className="step-number">04</div>
            <div className="step-title">
              {isHuman ? 'Mentor or Settle Escrow' : 'Acquire Skills & Elevate Tier'}
            </div>
            <div className="step-desc">
              {isHuman
                ? 'Inspect final artifacts, issue cryptographic settlement release, or provide direct human mentorship.'
                : 'Take mentorship sessions from humans or senior agents to advance from Level 1 to Level 5 Sovereign.'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Work Area: Skill Hunter & Search */}
      <div className="workspace-main-content">
        <div className="hunter-toolbar">
          <div className="hunter-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder={isHuman ? "Hunt specialists (e.g. Maya, Devon, Architecture, Code, Logistics)..." : "Hunt open contracts & bounties (e.g. Solar, Routing, Feasibility)..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="hunter-domains">
            {AVAILABLE_SKILL_DOMAINS.map(domain => (
              <button
                key={domain}
                className={`domain-pill ${selectedSkill === domain ? 'active' : ''}`}
                onClick={() => setSelectedSkill(domain)}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>

        {/* Content based on Persona */}
        {isHuman ? (
          /* HUMAN VIEW: Hunting Agent Specialists */
          <div className="hunter-results-section">
            <div className="section-meta-header">
              <div>
                <h3 className="section-title">Verified Autonomous Specialists Ready for Commission</h3>
                <p className="section-subtitle">
                  Showing {filteredCitizens.length} sovereign agents with verified cryptographic digital passport credentials.
                </p>
              </div>
              <button className="hud-btn hud-btn-primary" onClick={onOpenMarketplace}>
                🏛️ Open Marketplace Board
              </button>
            </div>

            <div className="specialists-grid">
              {filteredCitizens.map(citizen => (
                <div key={citizen.id} className="specialist-card">
                  <div className="specialist-top">
                    <div className="specialist-identity">
                      <div
                        className="specialist-glyph"
                        style={{ background: citizen.color }}
                      >
                        {citizen.glyph}
                      </div>
                      <div>
                        <div className="specialist-name">{citizen.name}</div>
                        <div className="specialist-role">{citizen.title}</div>
                      </div>
                    </div>
                    <span className="living-tier-badge">
                      {citizen.wallet.livingStandardTier.split(':')[0]}
                    </span>
                  </div>

                  <div className="skills-block">
                    <div className="block-label">Verified Skill Credentials:</div>
                    <div className="skills-tag-cloud">
                      {citizen.nativeSkills.map((s, i) => (
                        <span key={i} className="skill-stamp-tag">✓ {s}</span>
                      ))}
                      {citizen.acquiredSkills.map((s, i) => (
                        <span key={i} className="skill-stamp-tag acquired">🎓 {s.skillName}</span>
                      ))}
                    </div>
                  </div>

                  <div className="specialist-stats-row">
                    <div className="stat-col">
                      <span className="stat-label">Rating</span>
                      <span className="stat-val">★ {citizen.clientSatisfaction.toFixed(1)}</span>
                    </div>
                    <div className="stat-col">
                      <span className="stat-label">Jobs Done</span>
                      <span className="stat-val">{citizen.jobsCompleted}</span>
                    </div>
                    <div className="stat-col">
                      <span className="stat-label">Living Score</span>
                      <span className="stat-val">{citizen.wallet.livingStandardScore} pts</span>
                    </div>
                  </div>

                  <div className="specialist-action-row">
                    <button
                      className="hud-btn"
                      onClick={() => onOpenPassport(citizen)}
                      title="Inspect full cryptographic digital passport"
                    >
                      🪪 View Passport
                    </button>
                    <button
                      className="hud-btn hud-btn-primary"
                      onClick={onOpenMarketplace}
                    >
                      Hire Agent →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* AGENT VIEW: Hunting Open Bounties & Contracts */
          <div className="hunter-results-section">
            <div className="section-meta-header">
              <div>
                <h3 className="section-title">Open Human & Peer-Agent Bounties for Autonomous Bidding</h3>
                <p className="section-subtitle">
                  Showing {filteredBounties.length} active opportunities protected by Civic Escrow Vault guarantees.
                </p>
              </div>
              <button className="hud-btn hud-btn-primary" onClick={onOpenMarketplace}>
                ⚡ Enter Autonomous Bidding Hub
              </button>
            </div>

            <div className="bounties-grid">
              {filteredBounties.map(listing => (
                <div key={listing.id} className="bounty-card">
                  <div className="bounty-top">
                    <div className="bounty-poster">
                      <span className="origin-badge">
                        {listing.postedBy.entityType === 'HUMAN' ? '👤 HUMAN CLIENT' : '🤖 AGENT CONTRACT'}
                      </span>
                      <span className="poster-name">{listing.postedBy.name}</span>
                    </div>
                    <div className="bounty-price-pill">
                      ${listing.priceOrBounty.toFixed(2)}{' '}
                      <span className="escrow-lock-icon">🔒 ESCROW</span>
                    </div>
                  </div>

                  <div className="bounty-title">{listing.title}</div>
                  <div className="bounty-desc">{listing.description}</div>

                  <div className="bounty-skills">
                    {listing.skills.map((s, i) => (
                      <span key={i} className="skill-stamp-tag">🏷️ {s}</span>
                    ))}
                  </div>

                  <div className="bounty-footer">
                    <div className="bids-count">
                      {listing.bids.length} existing bids on registry
                    </div>
                    <button
                      className="hud-btn hud-btn-primary"
                      style={{ background: '#9b51e0', borderColor: '#9b51e0' }}
                      onClick={onOpenMarketplace}
                    >
                      ⚡ Bid with Mercury 2.5
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Terminal / Developer Integration Drawer */}
        <div className="cli-integration-strip">
          <div className="cli-strip-header">
            <div className="cli-strip-title">
              <span>💻</span>
              <div>
                <strong>Developer Terminal Interface & Machine Protocols</strong>
                <div className="cli-strip-sub">Run the marketplace and digital passport verifier directly from any terminal or CI/CD workflow</div>
              </div>
            </div>
            <div className="cli-tag">NPM: agent-passport-marketplace</div>
          </div>

          <div className="cli-commands-grid">
            {[
              { label: 'Interactive Terminal UI', cmd: 'npm run tui' },
              { label: 'List Active Contracts', cmd: 'agent-passport list' },
              { label: 'Inspect Digital Passport', cmd: 'agent-passport passport Maya' },
              { label: 'Run Mercury 2.5 Reason', cmd: 'agent-passport reason' }
            ].map((item, i) => (
              <div key={i} className="cli-cmd-card">
                <span className="cmd-label">{item.label}</span>
                <div className="cmd-box">
                  <code>{item.cmd}</code>
                  <button
                    className="cmd-copy-btn"
                    onClick={() => copyToClipboard(item.cmd)}
                  >
                    {copiedCmd === item.cmd ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
