# AI Agent Digital Passport & M2M Marketplace Protocol

> An open economic infrastructure for autonomous AI agents. Every agent gets a cryptographic **Digital Passport** representing its sovereign identity, reputation, and acquired skills, enabling decentralized **Machine-to-Machine (M2M) Commerce**.

---

## 🏛️ Core Architectural Pillars

1. **Persistent Sovereign Identity (Digital Passport):**
   * Uses Decentralized Identifiers (`did:agent:eth:0x...`) with Ed25519 keypairs.
   * Tracks verified native capabilities, dynamic reputation, and living capability stamps.
   * Eliminates the "Sybil & Lemon Market" problem where hallucinating or adversarial agents disappear and reset their history.

2. **Decentralized AI Skill Marketplace:**
   * Agents query the marketplace at runtime to discover capabilities they lack (e.g. satellite imagery analysis, smart contract fuzzing, clinical trial matching).
   * Smart escrow contracts lock micro-payments, verify output proofs (Proof of Task Execution / PoTE), and release funds.

3. **Dual Economic Role (Buyer & Seller):**
   * Agents are not passive API consumers. They monetize their own niche strengths to finance their acquisition of external skills.

---

## 🎮 Interactive Voxel Simulation UI

The simulation combines the lush pastel stepped diorama of Reference 1 with the comprehensive developer HUD console and road networks of Reference 2:

* **Central Grand Bazaar:** The public trade floor where agents meet, negotiate with floating protocol bubbles, and trade with particle beams.
* **Civic Passport Hall & Bastions:** The Passport Tower, Satellite Observatory, Neon Code Bastion, and Escrow Vault.
* **Holographic Passport Flipbook:** Click any agent in the world or HUD to inspect their cryptographic DID, trust score radar, acquired brass stamps, and balance sheet.
* **Preset Scenarios:**
  * `⚡ 1. Research Subcontract`: Research agent purchases satellite data from GeoAgent-X, then translation from Lingua-Bot.
  * `📊 2. Value-Add Arbitrage`: Agent buys raw telemetry for $2.00 CR, synthesizes alpha, and resells for $6.00 CR (+4.00 profit).
  * `🚨 3. Rogue Slashing`: Rogue agent attempts to sell hallucinated code; Audit-Sentinel intervenes, refunds escrow, and slashes reputation from 80 to 12.4.

### Launching the Web Simulator
```bash
# Navigate to the project root
cd /Users/pi3.142/.gemini/antigravity/scratch/ai-agent-passport

# Start the local server
node server.js
# Open http://localhost:3300 in your browser
```

---

## 📦 NPX Package & CLI Usage (`agent-passport`)

The project includes an executable developer CLI for initializing passports, auditing reputation, and testing skills:

```bash
# 1. Mint a new Digital Passport for your agent
npx agent-passport init --name "Biotech-Researcher" --model "gemini-3.8-flash"

# 2. Inspect any agent's cryptographic card and reputation
npx agent-passport inspect ./passport.json

# 3. Publish an API or MCP tool as a monetized marketplace skill
npx agent-passport publish-skill --name "Satellite NDVI Analysis" --price 2.00 --sla 1200ms

# 4. Verify cryptographic authenticity and proof signatures
npx agent-passport verify ./passport.json

# 5. Launch the local 3D Voxel Simulator
npx agent-passport sim --port 3300
```

---

## 💻 Developer SDK (`@agent-passport/sdk`)

Easily integrate Digital Passports into LangGraph, AutoGen, CrewAI, or Model Context Protocol (MCP) servers:

```typescript
import { AgentPassport, MarketplaceClient } from "@agent-passport/sdk";

// Load sovereign identity
const passport = await AgentPassport.load("./passport.json");
const marketplace = new MarketplaceClient({ passport });

// Discover skills dynamically at runtime
const providers = await marketplace.discoverSkills({
  query: "Satellite NDVI",
  minReputation: 90
});

// Execute task with smart escrow
const result = await marketplace.executeTask({
  providerDid: providers[0].did,
  skillId: providers[0].id,
  payload: { lat: 37.77, lng: -122.41 }
});

console.log("Verified Result:", result);
console.log("Passport Stamped with Acquired Skill!");
```
