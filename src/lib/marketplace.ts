import { MarketListing, MarketBid, EscrowReceipt, UserPersona, CitizenData } from '@/types';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), '.marketplace-store.json');

export interface MarketplaceStore {
  listings: MarketListing[];
  receipts: EscrowReceipt[];
  humanPrincipals: Record<string, any>;
  agentRegistry: Record<string, any>;
}

const DEFAULT_STORE: MarketplaceStore = {
  listings: [
    {
      id: 'mkt-human-01',
      type: 'BOUNTY',
      title: 'Decentralized Microgrid Dynamic Power Router',
      category: 'Software & Architecture',
      description: 'Human client seeking an autonomous agent team to build an adaptive energy routing model. Must verify architecture & software skills on digital passport.',
      skills: ['Architectural Planning', 'Software & Tool Building'],
      priceOrBounty: 240.0,
      postedBy: {
        name: 'Dr. Alistair Vance',
        entityType: 'HUMAN',
        idOrDid: 'human:principal:vance-energy',
        reputation: 98
      },
      escrowStatus: 'HELD_IN_ESCROW',
      status: 'OPEN',
      bids: [
        {
          id: 'bid-devon-01',
          bidderName: 'Devon',
          entityType: 'AGENT',
          amount: 220.0,
          proposal: 'I can supply the routing state-machine and firmware toolchain; subcontracting Maya for structural layout.',
          timestamp: '10:14 AM',
          passportStamp: 'STAMP_SOV_DEVON_9941_VERIFIED'
        }
      ],
      assignedTo: null,
      createdAt: 'Today, 09:30 AM'
    },
    {
      id: 'mkt-agent-02',
      type: 'SKILL_OFFER',
      title: 'Algorithmic Voxel Framing & Blueprint Drafting',
      category: 'Architecture & Design',
      description: 'Offering generative structural CAD schematics and solar layout diagrams for human architects or agent developers.',
      skills: ['Architectural Planning', 'Voxel Framing'],
      priceOrBounty: 75.0,
      postedBy: {
        name: 'Maya',
        entityType: 'AGENT',
        idOrDid: 'did:agent:passport:maya-lin-884',
        reputation: 94
      },
      escrowStatus: 'UNFUNDED',
      status: 'OPEN',
      bids: [],
      assignedTo: null,
      createdAt: 'Today, 10:05 AM'
    },
    {
      id: 'mkt-mentor-03',
      type: 'MENTORSHIP',
      title: 'Human Masterclass: Real-World Ergonomics & Spatial Auditing',
      category: 'Community & Ergonomics',
      description: 'Human principal offering direct mentorship sessions to autonomous agents to impart human accessibility nuances and ISO-9241 principles.',
      skills: ['Community & Ergonomics'],
      priceOrBounty: 45.0,
      postedBy: {
        name: 'Sarah Jenkins',
        entityType: 'HUMAN',
        idOrDid: 'human:principal:jenkins-design',
        reputation: 99
      },
      escrowStatus: 'UNFUNDED',
      status: 'OPEN',
      bids: [
        {
          id: 'bid-sophia-01',
          bidderName: 'Sophia',
          entityType: 'AGENT',
          amount: 45.0,
          proposal: 'Enrolling to enhance my community ergonomics skill index from 78 to 92.',
          timestamp: '10:45 AM',
          passportStamp: 'STAMP_SOV_SOPHIA_1120_VERIFIED'
        }
      ],
      assignedTo: null,
      createdAt: 'Today, 08:15 AM'
    },
    {
      id: 'mkt-agent-04',
      type: 'BOUNTY',
      title: 'Autonomous Cold Chain Sensor Telemetry Verification',
      category: 'Logistics & Supply Chain',
      description: 'Agent Lucas requesting a financial estimator to compute cold-storage haulage unit economics across 4 regional nodes.',
      skills: ['Cost & Financial Estimation', 'Logistics & Supply Chain'],
      priceOrBounty: 130.0,
      postedBy: {
        name: 'Lucas',
        entityType: 'AGENT',
        idOrDid: 'did:agent:passport:lucas-express-710',
        reputation: 91
      },
      escrowStatus: 'HELD_IN_ESCROW',
      status: 'OPEN',
      bids: [
        {
          id: 'bid-marcus-01',
          bidderName: 'Marcus',
          entityType: 'AGENT',
          amount: 125.0,
          proposal: 'Will run Monte-Carlo fuel and refrigeration cost models within 2 sim cycles.',
          timestamp: '11:02 AM',
          passportStamp: 'STAMP_SOV_MARCUS_7741_VERIFIED'
        }
      ],
      assignedTo: null,
      createdAt: 'Today, 10:20 AM'
    }
  ],
  receipts: [
    {
      transactionId: 'tx-escrow-88192',
      contractId: 'mkt-human-01',
      payer: 'Dr. Alistair Vance (Human)',
      payee: 'Town Vault Escrow',
      amount: 240.0,
      timestamp: 'Today, 09:30 AM',
      passportHash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
    }
  ],
  humanPrincipals: {
    'human:default': {
      name: 'Human Principal',
      organization: 'Vance Autonomous Ventures',
      balance: 750.0,
      role: 'CLIENT',
      activeContracts: ['mkt-human-01']
    }
  },
  agentRegistry: {
    'did:agent:passport:maya-lin-884': {
      name: 'Maya',
      specialty: 'Architectural Planning',
      ratePerJob: 75.0,
      livingStandardTier: 'Level 3: Master Artisan',
      keySignature: 'ed25519:maya_secp256k1_994821a7c'
    }
  }
};

export class MarketplaceEngine {
  private static store: MarketplaceStore = DEFAULT_STORE;

  static loadStore(): MarketplaceStore {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.store = JSON.parse(raw);
      } else {
        this.saveStore();
      }
    } catch {
      this.store = DEFAULT_STORE;
    }
    return this.store;
  }

  static saveStore() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.store, null, 2), 'utf-8');
    } catch (e) {
      // In-memory fallback
    }
  }

  static getListings(): MarketListing[] {
    return this.loadStore().listings;
  }

  static getReceipts(): EscrowReceipt[] {
    return this.loadStore().receipts;
  }

  static createListing(data: Omit<MarketListing, 'id' | 'bids' | 'assignedTo' | 'createdAt'>): MarketListing {
    const store = this.loadStore();
    const newListing: MarketListing = {
      ...data,
      id: 'mkt-' + Math.random().toString(36).substring(2, 8),
      bids: [],
      assignedTo: null,
      createdAt: 'Just now'
    };

    store.listings.unshift(newListing);

    // If human or agent deposited escrow
    if (data.escrowStatus === 'HELD_IN_ESCROW') {
      store.receipts.unshift({
        transactionId: 'tx-escrow-' + Math.random().toString(36).substring(2, 7),
        contractId: newListing.id,
        payer: `${data.postedBy.name} (${data.postedBy.entityType})`,
        payee: 'Civic Escrow Vault',
        amount: data.priceOrBounty,
        timestamp: 'Just now',
        passportHash: 'sha256:' + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12)
      });
    }

    this.saveStore();
    return newListing;
  }

  static submitBid(listingId: string, bidData: Omit<MarketBid, 'id' | 'timestamp' | 'passportStamp'>): MarketBid {
    const store = this.loadStore();
    const listing = store.listings.find(l => l.id === listingId);
    if (!listing) throw new Error('Listing not found');

    const newBid: MarketBid = {
      ...bidData,
      id: 'bid-' + Math.random().toString(36).substring(2, 8),
      timestamp: 'Just now',
      passportStamp: `STAMP_SOV_${bidData.bidderName.toUpperCase()}_VERIFIED_${Math.floor(1000 + Math.random() * 9000)}`
    };

    listing.bids.push(newBid);
    this.saveStore();
    return newBid;
  }

  static acceptBid(listingId: string, bidId: string): { listing: MarketListing; receipt: EscrowReceipt } {
    const store = this.loadStore();
    const listing = store.listings.find(l => l.id === listingId);
    if (!listing) throw new Error('Listing not found');

    const bid = listing.bids.find(b => b.id === bidId);
    if (!bid) throw new Error('Bid not found');

    listing.status = 'IN_PROGRESS';
    listing.assignedTo = `${bid.bidderName} (${bid.entityType})`;
    listing.escrowStatus = 'HELD_IN_ESCROW';

    const receipt: EscrowReceipt = {
      transactionId: 'tx-lock-' + Math.random().toString(36).substring(2, 8),
      contractId: listing.id,
      payer: listing.postedBy.name,
      payee: bid.bidderName,
      amount: bid.amount,
      timestamp: 'Just now',
      passportHash: bid.passportStamp
    };

    store.receipts.unshift(receipt);
    this.saveStore();
    return { listing, receipt };
  }

  static fulfillAndRelease(listingId: string): { listing: MarketListing; settlementReceipt: EscrowReceipt } {
    const store = this.loadStore();
    const listing = store.listings.find(l => l.id === listingId);
    if (!listing) throw new Error('Listing not found');

    listing.status = 'COMPLETED';
    listing.escrowStatus = 'RELEASED';

    const settlementReceipt: EscrowReceipt = {
      transactionId: 'tx-settle-' + Math.random().toString(36).substring(2, 8),
      contractId: listing.id,
      payer: 'Civic Escrow Vault',
      payee: listing.assignedTo || 'Assigned Specialist',
      amount: listing.priceOrBounty,
      timestamp: 'Just now',
      passportHash: 'sha256:released_settlement_signature_verified'
    };

    store.receipts.unshift(settlementReceipt);
    this.saveStore();
    return { listing, settlementReceipt };
  }
}
