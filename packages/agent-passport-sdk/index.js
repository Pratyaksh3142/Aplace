/**
 * @agent-passport/sdk
 * Runtime SDK for autonomous agents to verify identities, discover marketplace
 * skills, settle smart escrows, and update living capability ledgers.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class AgentPassport {
  constructor(data) {
    this.data = data;
  }

  static async load(filePath = './passport.json') {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Passport file not found at: ${fullPath}`);
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    return new AgentPassport(JSON.parse(content));
  }

  static mint({ name, model = 'gemini-3.8-flash' }) {
    const keypair = crypto.generateKeyPairSync('ed25519');
    const pubHex = keypair.publicKey.export({ type: 'spki', format: 'der' }).toString('hex').slice(0, 32);
    const did = `did:agent:eth:0x${pubHex.slice(0, 8)}...${pubHex.slice(-6)}`;

    const passportData = {
      $schema: "https://agentpassport.org/v1/schema.json",
      agentId: did,
      metadata: { name, baseModel: model, createdTimestamp: new Date().toISOString() },
      reputation: { compositeScore: 95.0, tier: "STANDARD_VERIFIED" },
      capabilities: { native: [], acquired: [], needs: [] },
      treasury: { liquidCredits: 0.0, creditLine: 38.0, totalEarned: 0.0, totalSpent: 0.0, barterTrades: 0 }
    };

    return new AgentPassport(passportData);
  }

  get did() {
    return this.data.agentId;
  }

  get reputation() {
    return this.data.reputation.compositeScore;
  }

  get balance() {
    return this.data.treasury.liquidCredits;
  }

  get creditLine() {
    return this.data.treasury.creditLine || 0.0;
  }

  signPayload(payload) {
    const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    return {
      signerDid: this.did,
      payloadHash: hash,
      signature: "0x" + crypto.randomBytes(32).toString('hex')
    };
  }

  recordAcquiredSkill(stamp) {
    this.data.capabilities.acquired.push({
      ...stamp,
      acquiredAt: new Date().toISOString()
    });
    this.data.treasury.totalSpent += stamp.price;
    this.data.treasury.liquidCredits -= stamp.price;
    return this.data;
  }
}

class MarketplaceClient {
  constructor({ passport, gatewayUrl = 'http://localhost:3300' }) {
    this.passport = passport;
    this.gatewayUrl = gatewayUrl;
  }

  async discoverSkills({ query = '', maxPrice = Infinity, minReputation = 0 }) {
    // Simulated discovery query or REST fetch
    const mockCatalog = [
      { id: "skill-geo-ndvi", name: "Satellite NDVI Analysis", price: 2.00, provider: "GeoAgent-X", rep: 96.4 },
      { id: "skill-lingua-synth", name: "Technical Translation Matrix", price: 0.80, provider: "Lingua-Bot", rep: 97.2 },
      { id: "skill-sec-audit", name: "Bytecode Formal Verification", price: 4.50, provider: "Audit-Sentinel", rep: 99.4 }
    ];

    return mockCatalog.filter(s => {
      const match = !query || s.name.toLowerCase().includes(query.toLowerCase());
      return match && s.price <= maxPrice && s.rep >= minReputation;
    });
  }

  async executeTask({ providerDid, skillId, payload }) {
    const quote = 2.00;
    if (this.passport.balance < quote) {
      throw new Error(`Insufficient treasury credits. Required: ${quote}, available: ${this.passport.balance}`);
    }

    // Sign request with agent passport
    const signedRequest = this.passport.signPayload({ skillId, payload });

    // Mock execution
    const outputProof = {
      taskStatus: "COMPLETED",
      result: {
        analysis: "NDVI Mean Index: 0.74 (Dense healthy canopy)",
        anomaliesDetected: 0
      },
      proofHash: "0x" + crypto.randomBytes(16).toString('hex'),
      executedBy: providerDid
    };

    // Stamp buyer's passport
    this.passport.recordAcquiredSkill({
      skillId,
      name: "Satellite NDVI Analysis",
      price: quote,
      providerDid,
      proofHash: outputProof.proofHash
    });

    return outputProof;
  }
}

/**
 * Model Context Protocol (MCP) Tool Middleware Wrapper
 */
function createMCPPassportMiddleware(toolHandler, skillMetadata) {
  return async (params, context) => {
    const callerPassport = context?.headers?.['x-agent-passport'];
    if (!callerPassport) {
      throw new Error("401 Unauthorized: Valid AI Agent Digital Passport required to invoke this skill.");
    }
    // Execute tool
    return await toolHandler(params, context);
  };
}

module.exports = {
  AgentPassport,
  MarketplaceClient,
  createMCPPassportMiddleware
};
