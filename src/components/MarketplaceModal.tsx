'use client';

import React, { useState, useEffect } from 'react';
import { MarketListing, MarketBid, EscrowReceipt, UserPersona, CitizenData } from '@/types';

interface MarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPersona: UserPersona | null;
  onSwitchPersona: () => void;
  citizens: CitizenData[];
}

export const MarketplaceModal: React.FC<MarketplaceModalProps> = ({
  isOpen,
  onClose,
  userPersona,
  onSwitchPersona,
  citizens
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'post' | 'passports' | 'escrow' | 'api'>('listings');
  const [filterType, setFilterType] = useState<'ALL' | 'BOUNTY' | 'SKILL_OFFER' | 'MENTORSHIP'>('ALL');
  const [filterEntity, setFilterEntity] = useState<'ALL' | 'HUMAN' | 'AGENT'>('ALL');

  const [listings, setListings] = useState<MarketListing[]>([]);
  const [receipts, setReceipts] = useState<EscrowReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // New Listing Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'BOUNTY' | 'SKILL_OFFER' | 'MENTORSHIP'>('BOUNTY');
  const [newCategory, setNewCategory] = useState('Software & Architecture');
  const [newBounty, setNewBounty] = useState('150');
  const [newSkills, setNewSkills] = useState('Architectural Planning, Software & Tool Building');
  const [newDesc, setNewDesc] = useState('');

  // Bid Form Modal state
  const [biddingListingId, setBiddingListingId] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState('120');
  const [bidProposal, setBidProposal] = useState('');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [mercuryReasoningTokens, setMercuryReasoningTokens] = useState<number | null>(null);

  // Load listings on open
  useEffect(() => {
    if (isOpen) {
      loadMarketData();
    }
  }, [isOpen]);

  const loadMarketData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/market');
      const data = await res.json();
      if (data.listings) setListings(data.listings);
      if (data.receipts) setReceipts(data.receipts);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsLoading(true);
    const entityType = userPersona?.type || 'HUMAN';
    const posterName = entityType === 'HUMAN'
      ? (userPersona?.human?.name || 'Human Principal')
      : (userPersona?.agent?.name || 'Autonomous Agent');

    const idOrDid = entityType === 'HUMAN'
      ? `human:principal:${posterName.toLowerCase().replace(/\s+/g, '-')}`
      : (userPersona?.agent?.did || 'did:agent:passport:unknown');

    const payload = {
      type: newType,
      title: newTitle,
      category: newCategory,
      description: newDesc || `Skill contract posted under ${entityType} protocol.`,
      skills: newSkills.split(',').map(s => s.trim()).filter(Boolean),
      priceOrBounty: parseFloat(newBounty) || 100,
      postedBy: {
        name: posterName,
        entityType,
        idOrDid,
        reputation: 95
      },
      escrowStatus: newType === 'BOUNTY' ? 'HELD_IN_ESCROW' : 'UNFUNDED',
      status: 'OPEN'
    };

    try {
      const res = await fetch('/api/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_listing', data: payload })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`✅ Listing "${payload.title}" successfully published to decentralized registry!`);
        setNewTitle('');
        setNewDesc('');
        loadMarketData();
        setActiveTab('listings');
      }
    } catch (err: any) {
      setStatusMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitManualBid = async (listingId: string) => {
    if (!bidProposal.trim()) return;
    setIsSubmittingBid(true);

    const bidderName = userPersona?.type === 'HUMAN'
      ? (userPersona?.human?.name || 'Human Contractor')
      : (userPersona?.agent?.name || 'Autonomous Agent');

    try {
      const res = await fetch('/api/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_bid',
          listingId,
          bidData: {
            bidderName,
            entityType: userPersona?.type || 'HUMAN',
            amount: parseFloat(bidAmount) || 100,
            proposal: bidProposal
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`✅ Bid submitted successfully for $${bidAmount}!`);
        setBiddingListingId(null);
        setBidProposal('');
        loadMarketData();
      }
    } catch (err: any) {
      setStatusMessage(`❌ Error submitting bid: ${err.message}`);
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const handleTriggerMercuryAutoBid = async (listing: MarketListing) => {
    setIsLoading(true);
    setStatusMessage('🧠 Inception Mercury 2.5 is evaluating the contract with max reasoning depth...');
    setMercuryReasoningTokens(null);

    // Pick an agent with related skills or default
    const matchingCitizen = citizens.find(c =>
      c.nativeSkills.some(s => listing.skills.includes(s))
    ) || citizens[0];

    try {
      const res = await fetch('/api/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'agent_auto_bid',
          listing,
          agent: {
            name: matchingCitizen.name,
            title: matchingCitizen.title,
            wallet: matchingCitizen.wallet,
            nativeSkills: matchingCitizen.nativeSkills,
            acquiredSkills: matchingCitizen.acquiredSkills
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        setMercuryReasoningTokens(data.reasoningTokens);
        if (data.evaluation.shouldBid) {
          setStatusMessage(
            `🧠 Mercury 2.5 Autonomous Bid Placed by ${matchingCitizen.name}! ($${data.evaluation.bidAmount}) - "${data.evaluation.proposal}"`
          );
        } else {
          setStatusMessage(
            `🧠 Mercury 2.5 reasoned not to bid: "${data.evaluation.reasoningThought}"`
          );
        }
        loadMarketData();
      }
    } catch (err: any) {
      setStatusMessage(`❌ Mercury 2.5 Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptBid = async (listingId: string, bidId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept_bid', listingId, bidId })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('🔒 Bid accepted! Funds are locked in Civic Escrow Vault awaiting delivery.');
        loadMarketData();
      }
    } catch (err: any) {
      setStatusMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFulfillAndRelease = async (listingId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fulfill_and_release', listingId })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('✨ Deliverable verified! Escrow payment released & digital passport credential stamped.');
        loadMarketData();
      }
    } catch (err: any) {
      setStatusMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredListings = listings.filter(l => {
    if (filterType !== 'ALL' && l.type !== filterType) return false;
    if (filterEntity !== 'ALL' && l.postedBy.entityType !== filterEntity) return false;
    return true;
  });

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 50 }}>
      <div
        className="modal-card"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '960px', width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Top Header Bar */}
        <div className="modal-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-hairline)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '26px' }}>🏛️</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="modal-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '22px' }}>
                  Human & Agent Skill Marketplace
                </span>
                <span style={{ fontSize: '9px', fontWeight: 700, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '2px 6px', borderRadius: '4px' }}>
                  DIGITAL PASSPORT PROTOCOL
                </span>
              </div>
              <div className="modal-subtitle" style={{ fontSize: '11.5px', marginTop: '2px' }}>
                Bilateral exchange for autonomous agents & human principals to trade verified skills, bounties & mentorship
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Active Persona Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: userPersona?.type === 'HUMAN' ? 'var(--bg-surface-inset)' : 'rgba(155, 81, 224, 0.08)',
                border: `1px solid ${userPersona?.type === 'HUMAN' ? 'var(--border-hairline)' : 'rgba(155, 81, 224, 0.25)'}`,
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '11.5px'
              }}
            >
              <span>{userPersona?.type === 'HUMAN' ? '👤' : '🤖'}</span>
              <div>
                <div style={{ fontWeight: 700, color: userPersona?.type === 'HUMAN' ? '#18181A' : '#9b51e0' }}>
                  {userPersona?.type === 'HUMAN'
                    ? (userPersona?.human?.name || 'Human Principal')
                    : (userPersona?.agent?.name || 'Autonomous Agent')}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {userPersona?.type === 'HUMAN'
                    ? `${userPersona?.human?.role} • $${userPersona?.human?.balance?.toFixed(0)}`
                    : userPersona?.agent?.did.substring(0, 18) + '...'}
                </div>
              </div>
              <button
                onClick={onSwitchPersona}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '9.5px',
                  cursor: 'pointer',
                  marginLeft: '4px',
                  color: 'var(--text-secondary)'
                }}
                title="Switch between Human and Agent persona"
              >
                Switch
              </button>
            </div>

            <button className="modal-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Global Notification Strip */}
        {statusMessage && (
          <div
            style={{
              padding: '8px 24px',
              background: '#faf5ff',
              borderBottom: '1px solid #e9d5ff',
              fontSize: '11.5px',
              color: '#6b21a8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>{statusMessage}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {mercuryReasoningTokens && (
                <span style={{ fontWeight: 700, fontSize: '10px', color: '#9b51e0' }}>
                  🧠 {mercuryReasoningTokens} tokens
                </span>
              )}
              <button
                onClick={() => setStatusMessage(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b21a8' }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            borderBottom: '1px solid var(--border-hairline)',
            background: 'var(--bg-surface-subtle)'
          }}
        >
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className={`log-tab ${activeTab === 'listings' ? 'active' : ''}`}
              onClick={() => setActiveTab('listings')}
            >
              📋 Marketplace Listings ({filteredListings.length})
            </button>
            <button
              className={`log-tab ${activeTab === 'post' ? 'active' : ''}`}
              onClick={() => setActiveTab('post')}
            >
              ✍️ Post New Contract
            </button>
            <button
              className={`log-tab ${activeTab === 'passports' ? 'active' : ''}`}
              onClick={() => setActiveTab('passports')}
            >
              🪪 Verified Agent Directory ({citizens.length})
            </button>
            <button
              className={`log-tab ${activeTab === 'escrow' ? 'active' : ''}`}
              onClick={() => setActiveTab('escrow')}
            >
              🔒 Escrow Ledger ({receipts.length})
            </button>
            <button
              className={`log-tab ${activeTab === 'api' ? 'active' : ''}`}
              onClick={() => setActiveTab('api')}
            >
              ⚡ Developer & Agent API
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              className="hud-btn"
              style={{ height: '26px', fontSize: '10.5px', padding: '0 8px' }}
              onClick={loadMarketData}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : '🔄 Refresh'}
            </button>
          </div>
        </div>

        {/* Main Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {/* TAB 1: LISTINGS */}
          {activeTab === 'listings' && (
            <div>
              {/* Filters */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  background: 'var(--bg-surface-inset)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-hairline)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Type:</span>
                  {(['ALL', 'BOUNTY', 'SKILL_OFFER', 'MENTORSHIP'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      style={{
                        padding: '3px 8px',
                        fontSize: '11px',
                        borderRadius: '4px',
                        border: '1px solid',
                        cursor: 'pointer',
                        borderColor: filterType === t ? 'var(--text-primary)' : 'transparent',
                        background: filterType === t ? 'var(--text-primary)' : 'transparent',
                        color: filterType === t ? '#fff' : 'var(--text-secondary)'
                      }}
                    >
                      {t === 'ALL' ? 'All Types' : t.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Origin:</span>
                  {(['ALL', 'HUMAN', 'AGENT'] as const).map(e => (
                    <button
                      key={e}
                      onClick={() => setFilterEntity(e)}
                      style={{
                        padding: '3px 8px',
                        fontSize: '11px',
                        borderRadius: '4px',
                        border: '1px solid',
                        cursor: 'pointer',
                        borderColor: filterEntity === e ? 'var(--text-primary)' : 'transparent',
                        background: filterEntity === e ? 'var(--text-primary)' : 'transparent',
                        color: filterEntity === e ? '#fff' : 'var(--text-secondary)'
                      }}
                    >
                      {e === 'ALL' ? 'All Entities' : e === 'HUMAN' ? '👤 Humans Only' : '🤖 Agents Only'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Listings Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredListings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No contracts match the selected filter. Click "Post New Contract" to publish one!
                  </div>
                ) : (
                  filteredListings.map(listing => {
                    const isHumanPoster = listing.postedBy.entityType === 'HUMAN';
                    const hasBids = listing.bids && listing.bids.length > 0;

                    return (
                      <div
                        key={listing.id}
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-hairline)',
                          borderRadius: '8px',
                          padding: '16px',
                          boxShadow: 'var(--shadow-editorial)'
                        }}
                      >
                        {/* Top Meta */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: isHumanPoster ? 'var(--bg-surface-inset)' : 'rgba(155, 81, 224, 0.1)',
                                color: isHumanPoster ? '#18181A' : '#9b51e0',
                                border: `1px solid ${isHumanPoster ? 'var(--border-hairline)' : 'rgba(155, 81, 224, 0.25)'}`
                              }}
                            >
                              {isHumanPoster ? '👤 HUMAN POST' : '🤖 AGENT POST'} • {listing.postedBy.name}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              in {listing.category}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                fontFamily: 'var(--font-mono)',
                                color: '#2b5731',
                                background: '#edf3ec',
                                padding: '2px 8px',
                                borderRadius: '4px'
                              }}
                            >
                              ${listing.priceOrBounty.toFixed(2)}{' '}
                              {listing.escrowStatus === 'HELD_IN_ESCROW' ? '🔒 ESCROW' : ''}
                            </span>
                            <span
                              style={{
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                fontWeight: 600,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: listing.status === 'COMPLETED' ? '#f3f4f6' : listing.status === 'IN_PROGRESS' ? '#fef3c7' : '#ecfdf5',
                                color: listing.status === 'COMPLETED' ? '#4b5563' : listing.status === 'IN_PROGRESS' ? '#b45309' : '#059669'
                              }}
                            >
                              {listing.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        {/* Title and Description */}
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                          {listing.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '10px' }}>
                          {listing.description}
                        </div>

                        {/* Required Skills */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                          {listing.skills.map((s, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: '10px',
                                background: 'var(--bg-surface-inset)',
                                border: '1px solid var(--border-hairline)',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                color: 'var(--text-primary)'
                              }}
                            >
                              🏷️ {s}
                            </span>
                          ))}
                        </div>

                        {/* Bids Section */}
                        {hasBids && (
                          <div
                            style={{
                              marginTop: '8px',
                              padding: '10px 12px',
                              background: 'var(--bg-surface-subtle)',
                              borderRadius: '6px',
                              border: '1px solid var(--border-hairline)'
                            }}
                          >
                            <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                              Received Bids ({listing.bids.length}):
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {listing.bids.map(bid => (
                                <div
                                  key={bid.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontSize: '11.5px',
                                    background: '#fff',
                                    padding: '6px 10px',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border-hairline)'
                                  }}
                                >
                                  <div>
                                    <span style={{ fontWeight: 700, color: bid.entityType === 'HUMAN' ? '#18181A' : '#9b51e0' }}>
                                      {bid.entityType === 'HUMAN' ? '👤 ' : '🤖 '}
                                      {bid.bidderName}
                                    </span>
                                    : "{bid.proposal}"{' '}
                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                      [{bid.passportStamp}]
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                                      ${bid.amount.toFixed(2)}
                                    </span>
                                    {listing.status === 'OPEN' && (
                                      <button
                                        onClick={() => handleAcceptBid(listing.id, bid.id)}
                                        style={{
                                          background: '#18181A',
                                          color: '#fff',
                                          border: 'none',
                                          padding: '3px 8px',
                                          borderRadius: '4px',
                                          fontSize: '10.5px',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Accept Bid
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Interactive Action Bar */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '12px',
                            paddingTop: '10px',
                            borderTop: '1px solid var(--border-hairline)'
                          }}
                        >
                          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                            ID: {listing.id} • Posted {listing.createdAt}
                          </div>

                          <div style={{ display: 'flex', gap: '8px' }}>
                            {listing.status === 'OPEN' && (
                              <>
                                <button
                                  className="hud-btn"
                                  style={{ height: '28px', fontSize: '11px', background: '#9b51e0', color: '#fff', borderColor: '#9b51e0' }}
                                  onClick={() => handleTriggerMercuryAutoBid(listing)}
                                  disabled={isLoading}
                                  title="Autonomous Mercury 2.5 agent will evaluate and bid in real-time"
                                >
                                  ⚡ Mercury 2.5 Auto-Bid
                                </button>
                                <button
                                  className="hud-btn"
                                  style={{ height: '28px', fontSize: '11px' }}
                                  onClick={() => {
                                    setBiddingListingId(listing.id);
                                    setBidAmount(listing.priceOrBounty.toString());
                                  }}
                                >
                                  ✍️ Place Bid
                                </button>
                              </>
                            )}

                            {listing.status === 'IN_PROGRESS' && (
                              <button
                                className="hud-btn hud-btn-primary"
                                style={{ height: '28px', fontSize: '11px', background: '#059669', borderColor: '#059669' }}
                                onClick={() => handleFulfillAndRelease(listing.id)}
                                disabled={isLoading}
                              >
                                ✨ Verify & Release Escrow (${listing.priceOrBounty.toFixed(2)})
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Inline Bid Drawer */}
                        {biddingListingId === listing.id && (
                          <div
                            style={{
                              marginTop: '12px',
                              padding: '12px',
                              background: 'var(--bg-surface-inset)',
                              borderRadius: '6px',
                              border: '1px solid var(--border-hairline)'
                            }}
                          >
                            <div style={{ fontWeight: 600, fontSize: '12px', marginBottom: '8px' }}>
                              Submit Bid as {userPersona?.type === 'HUMAN' ? 'Human Principal' : 'Autonomous Agent'}:
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: '8px' }}>
                              <input
                                type="number"
                                className="spawner-input"
                                style={{ padding: '6px 8px' }}
                                value={bidAmount}
                                onChange={e => setBidAmount(e.target.value)}
                                placeholder="Amount $"
                              />
                              <input
                                type="text"
                                className="spawner-input"
                                style={{ padding: '6px 8px' }}
                                value={bidProposal}
                                onChange={e => setBidProposal(e.target.value)}
                                placeholder="Brief proposal pitch & passport verification stamp..."
                              />
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  className="hud-btn hud-btn-primary"
                                  style={{ height: '32px' }}
                                  onClick={() => handleSubmitManualBid(listing.id)}
                                  disabled={isSubmittingBid}
                                >
                                  Submit
                                </button>
                                <button
                                  className="hud-btn"
                                  style={{ height: '32px' }}
                                  onClick={() => setBiddingListingId(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: POST CONTRACT */}
          {activeTab === 'post' && (
            <div style={{ maxWidth: '640px', margin: '0 auto' }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--text-primary)' }}>
                  Publish a Skill Contract or Bounty
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Posting under protocol: <strong>{userPersona?.type === 'HUMAN' ? 'Human Principal' : 'Autonomous Agent'}</strong>.
                  Funds will be protected by the Civic Escrow Vault.
                </p>
              </div>

              <form onSubmit={handleCreateListing} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="spawner-field">
                    <label>Contract Type</label>
                    <select
                      className="spawner-input"
                      value={newType}
                      onChange={e => setNewType(e.target.value as any)}
                    >
                      <option value="BOUNTY">Bounty (Hire Specialists for $)</option>
                      <option value="SKILL_OFFER">Skill Offer (Provide Service for $)</option>
                      <option value="MENTORSHIP">Mentorship (Transfer Knowledge for Tuition)</option>
                    </select>
                  </div>

                  <div className="spawner-field">
                    <label>Domain Category</label>
                    <select
                      className="spawner-input"
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                    >
                      <option value="Architecture & Design">Architecture & Design</option>
                      <option value="Software & Architecture">Software & Architecture</option>
                      <option value="Research & Technical Writing">Research & Technical Writing</option>
                      <option value="Cost & Financial Estimation">Cost & Financial Estimation</option>
                      <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                      <option value="Community & Ergonomics">Community & Ergonomics</option>
                      <option value="Hands-on Construction">Hands-on Construction</option>
                    </select>
                  </div>
                </div>

                <div className="spawner-field">
                  <label>Contract Title</label>
                  <input
                    type="text"
                    className="spawner-input"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. Design Sustainable Thermal Hospital Blueprints"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="spawner-field">
                    <label>Bounty / Escrow Amount ($USD)</label>
                    <input
                      type="number"
                      className="spawner-input"
                      value={newBounty}
                      onChange={e => setNewBounty(e.target.value)}
                      min="20"
                      step="5"
                      required
                    />
                  </div>

                  <div className="spawner-field">
                    <label>Required Skill Credentials (comma-separated)</label>
                    <input
                      type="text"
                      className="spawner-input"
                      value={newSkills}
                      onChange={e => setNewSkills(e.target.value)}
                      placeholder="e.g. Architectural Planning, UI/UX"
                      required
                    />
                  </div>
                </div>

                <div className="spawner-field">
                  <label>Detailed Scope & Acceptance Criteria</label>
                  <textarea
                    className="spawner-input"
                    rows={4}
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="Explain the technical requirements, deliverable formats, and acceptance conditions..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="hud-btn hud-btn-primary"
                  style={{ height: '36px', marginTop: '10px' }}
                  disabled={isLoading}
                >
                  Publish Contract & Lock Escrow →
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: VERIFIED AGENT DIRECTORY */}
          {activeTab === 'passports' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px' }}>
                  Decentralized Citizen Registry & Verified Passports
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  All registered agents possess sovereign cryptographic credentials, skill stamps, and living standard scores.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {citizens.map(c => (
                  <div
                    key={c.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-hairline)',
                      borderRadius: '8px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: 'var(--shadow-editorial)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '6px',
                              background: c.color,
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '12px'
                            }}
                          >
                            {c.glyph}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '13px' }}>{c.name}</div>
                            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{c.title}</div>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            background: '#fef3c7',
                            color: '#b45309',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}
                        >
                          {c.wallet.livingStandardTier.split(':')[0]}
                        </span>
                      </div>

                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        <strong>Native Skills:</strong> {c.nativeSkills.join(', ')}
                        {c.acquiredSkills.length > 0 && (
                          <div style={{ color: '#059669', marginTop: '2px' }}>
                            <strong>Acquired:</strong> {c.acquiredSkills.map(s => s.skillName).join(', ')}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', background: 'var(--bg-surface-inset)', padding: '6px 8px', borderRadius: '4px' }}>
                        <span>Balance: <strong>${c.wallet.balance.toFixed(2)}</strong></span>
                        <span>Living Score: <strong>{c.wallet.livingStandardScore} pts</strong></span>
                        <span>Jobs: <strong>{c.jobsCompleted}</strong></span>
                      </div>
                    </div>

                    <div style={{ marginTop: '12px', display: 'flex', gap: '6px' }}>
                      <button
                        className="hud-btn"
                        style={{ flex: 1, height: '26px', fontSize: '10px' }}
                        onClick={() => {
                          setNewTitle(`Direct Contract with ${c.name}`);
                          setNewSkills(c.nativeSkills.join(', '));
                          setActiveTab('post');
                        }}
                      >
                        Hire Directly
                      </button>
                      <button
                        className="hud-btn"
                        style={{ flex: 1, height: '26px', fontSize: '10px' }}
                        onClick={() => {
                          setNewTitle(`Mentorship Session with ${c.name}`);
                          setNewType('MENTORSHIP');
                          setNewBounty('35');
                          setActiveTab('post');
                        }}
                      >
                        Learn Skill
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ESCROW LEDGER */}
          {activeTab === 'escrow' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px' }}>
                  Civic Escrow Vault & Settlement Ledger
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Cryptographically verifiable transactions, bilateral locks, and digital passport hash trails.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {receipts.map(r => (
                  <div
                    key={r.transactionId}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-hairline)',
                      borderRadius: '6px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#18181A' }}>
                          {r.transactionId}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{r.timestamp}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '11.5px' }}>
                        From: <strong>{r.payer}</strong> → To: <strong>{r.payee}</strong> on Contract [{r.contractId}]
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Passport Hash: {r.passportHash}
                      </div>
                    </div>

                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: '#2b5731' }}>
                      ${r.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DEVELOPER & AGENT API */}
          {activeTab === 'api' && (
            <div>
              <div style={{ marginBottom: '14px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px' }}>
                  Developer & Autonomous Agent Integration Protocols
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Integrate your own autonomous LLM agents or install the official NPM package and CLI.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#18181A', color: '#f3f4f6', padding: '16px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '11.5px', lineHeight: 1.6 }}>
                  <div style={{ color: '#a7f3d0', fontWeight: 700, marginBottom: '6px' }}># 1. Install & Launch Terminal User Interface (TUI)</div>
                  npm install -g agent-passport-marketplace<br />
                  <span style={{ color: '#94a3b8' }}># or run directly with npx:</span><br />
                  npx agent-passport<br />
                  <br />
                  <div style={{ color: '#a7f3d0', fontWeight: 700, marginBottom: '6px' }}># 2. Command Line Protocol</div>
                  agent-passport list                     # View all active contracts & bounties<br />
                  agent-passport passport Maya            # Inspect verified agent credentials<br />
                  agent-passport post --title "Solar Grid" --bounty 180 --skills "Architectural Planning"<br />
                  agent-passport bid --job mkt-human-01 --agent Devon --amount 210
                </div>

                <div style={{ background: '#18181A', color: '#f3f4f6', padding: '16px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '11.5px', lineHeight: 1.6 }}>
                  <div style={{ color: '#93c5fd', fontWeight: 700, marginBottom: '6px' }}>// 3. Machine-to-Machine Agent API (TypeScript / Node.js)</div>
                  <pre style={{ margin: 0 }}>{`import { AgentMarketplaceClient } from 'agent-passport-marketplace';

const client = new AgentMarketplaceClient({
  agentDid: 'did:agent:passport:cyber-specialist-01',
  privateKey: process.env.AGENT_SOVEREIGN_KEY
});

// Autonomous bid evaluation
const openJobs = await client.getBounties();
for (const job of openJobs) {
  if (client.hasSkills(job.requiredSkills)) {
    await client.submitBid({
      jobId: job.id,
      proposedWage: job.bounty * 0.95,
      pitch: "Verified passport credentials ready for immediate dispatch."
    });
  }
}`}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
