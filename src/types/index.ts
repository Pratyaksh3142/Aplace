export interface SocialBond {
  affinity: number; // 0 - 100
  status: string;   // "Friend", "Employer / Boss", "Employed Specialist", "Collaborator", "Rival"
  dealsDone: number;
}

export interface SkillStamp {
  skillName: string;
  learnedFrom: string;
  cost: number;
  acquiredAt: string;
}

export interface WalletLedger {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  livingStandardScore: number;
  livingStandardTier: string;
}

export interface CitizenData {
  id: string;
  name: string;
  title: string;
  glyph: string;
  color: string;
  bio?: string;
  wallet: WalletLedger;
  nativeSkills: string[];
  acquiredSkills: SkillStamp[];
  currentNeeds: string[];
  socialBonds: Record<string, SocialBond>;
  jobsCompleted: number;
  clientSatisfaction: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  isMoving: boolean;
  speechText?: string;
  speechVisible?: boolean;
  reasoningTokensLastAction?: number;
}

export interface JobContract {
  id: string;
  title: string;
  category: string;
  bounty: number;
  requiredSkills: string[];
  description: string;
  postedBy: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  assignedTo: string | null;
}

export interface ActivityLog {
  id: string;
  tag: string;
  message: string;
  category: 'jobs' | 'social' | 'civic' | 'leaderboard' | 'all';
  time: string;
  reasoningTokens?: number;
}

export interface CityMetrics {
  treasury: number;
  tier: number;
  tierName: string;
  leaderName: string;
  activeCitizens: number;
  totalVolume: number;
}

export type PersonaType = 'HUMAN' | 'AGENT';

export interface HumanProfile {
  name: string;
  organization: string;
  balance: number;
  role: 'CLIENT' | 'MENTOR' | 'AUDITOR';
  activeContracts: string[];
}

export interface AgentProfile {
  did: string;
  name: string;
  specialty: string;
  ratePerJob: number;
  keySignature: string;
  livingStandardTier: string;
}

export interface UserPersona {
  type: PersonaType;
  human?: HumanProfile;
  agent?: AgentProfile;
  onboardedAt: string;
}

export interface MarketBid {
  id: string;
  bidderName: string;
  entityType: PersonaType;
  amount: number;
  proposal: string;
  timestamp: string;
  passportStamp: string;
}

export interface MarketListing {
  id: string;
  type: 'BOUNTY' | 'SKILL_OFFER' | 'MENTORSHIP';
  title: string;
  category: string;
  description: string;
  skills: string[];
  priceOrBounty: number;
  postedBy: {
    name: string;
    entityType: PersonaType;
    idOrDid: string;
    reputation: number;
  };
  escrowStatus: 'UNFUNDED' | 'HELD_IN_ESCROW' | 'RELEASED';
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  bids: MarketBid[];
  assignedTo: string | null;
  createdAt: string;
}

export interface EscrowReceipt {
  transactionId: string;
  contractId: string;
  payer: string;
  payee: string;
  amount: number;
  timestamp: string;
  passportHash: string;
}

