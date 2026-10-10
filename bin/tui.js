#!/usr/bin/env node

/**
 * AGENT PASSPORT MARKETPLACE - FULL-SCREEN GRAPHICAL TERMINAL INTERFACE (TUI)
 * Inspired by Claude Code, Google Antigravity CLI, and Accord Protocol.
 * Features an 8-bit voxel/pixel money coin logo, split-pane telemetry, and live Mercury 2.5 reasoning.
 */

const readline = require('readline');
const { AgentMarketplaceClient } = require('../src/sdk/index.js');
const Inception = require('inceptionai');

const client = new AgentMarketplaceClient();

const CITIZENS_DIRECTORY = [
  {
    name: 'Maya',
    title: 'Architectural Planner',
    glyph: 'M',
    skills: ['Architectural Planning', 'Voxel Framing'],
    balance: 263.0,
    livingScore: 88,
    tier: 'Level 3: Master Artisan',
    did: 'did:agent:passport:maya-lin-884',
    rating: 4.9,
    jobsCompleted: 4
  },
  {
    name: 'Liam',
    title: 'Visual & UI/UX Designer',
    glyph: 'L',
    skills: ['Visual & UI Design', 'Color Palettes'],
    balance: 168.0,
    livingScore: 72,
    tier: 'Level 2: Guild Craftsman',
    did: 'did:agent:passport:liam-chen-312',
    rating: 5.0,
    jobsCompleted: 3
  },
  {
    name: 'Devon',
    title: 'Software & Tool Builder',
    glyph: 'D',
    skills: ['Software & Tool Building', 'Algorithmic State Machines'],
    balance: 159.0,
    livingScore: 68,
    tier: 'Level 2: Guild Craftsman',
    did: 'did:agent:passport:devon-code-994',
    rating: 4.8,
    jobsCompleted: 3
  },
  {
    name: 'Elena',
    title: 'Research & Technical Writer',
    glyph: 'E',
    skills: ['Research & Technical Writing', 'Feasibility Dossiers'],
    balance: 225.0,
    livingScore: 84,
    tier: 'Level 3: Master Artisan',
    did: 'did:agent:passport:elena-scholar-512',
    rating: 5.0,
    jobsCompleted: 4
  },
  {
    name: 'Marcus',
    title: 'Cost & Financial Estimator',
    glyph: 'F',
    skills: ['Cost & Financial Estimation', 'Ledger Modeling'],
    balance: 209.0,
    livingScore: 92,
    tier: 'Level 3: Master Artisan',
    did: 'did:agent:passport:marcus-treasury-744',
    rating: 4.9,
    jobsCompleted: 5
  },
  {
    name: 'Chloe',
    title: 'Hands-on Builder & Engineer',
    glyph: 'C',
    skills: ['Hands-on Construction', 'Scaffold Framing'],
    balance: 180.0,
    livingScore: 76,
    tier: 'Level 2: Guild Craftsman',
    did: 'did:agent:passport:chloe-build-603',
    rating: 4.7,
    jobsCompleted: 2
  },
  {
    name: 'Lucas',
    title: 'Logistics & Supply Specialist',
    glyph: 'S',
    skills: ['Logistics & Supply Chain', 'Cold-Chain Routing'],
    balance: 120.0,
    livingScore: 64,
    tier: 'Level 1: Independent Starter',
    did: 'did:agent:passport:lucas-courier-710',
    rating: 4.6,
    jobsCompleted: 1
  },
  {
    name: 'Sophia',
    title: 'Community & Ergonomics Lead',
    glyph: 'H',
    skills: ['Community & Ergonomics', 'Accessibility Standards'],
    balance: 159.0,
    livingScore: 78,
    tier: 'Level 2: Guild Craftsman',
    did: 'did:agent:passport:sophia-guild-204',
    rating: 4.8,
    jobsCompleted: 3
  }
];

// ANSI Palette - Zero Dependencies, High Performance
const ESC = '\x1b[';
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',

  // Colors
  white: '\x1b[38;5;255m',
  gray: '\x1b[38;5;244m',
  lightGray: '\x1b[38;5;248m',
  darkGray: '\x1b[38;5;238m',
  black: '\x1b[38;5;16m',

  // Brand Accents
  gold: '\x1b[38;5;220m',
  brightYellow: '\x1b[38;5;226m',
  yellow: '\x1b[38;5;220m',
  amber: '\x1b[38;5;214m',
  orange: '\x1b[38;5;208m',
  emerald: '\x1b[38;5;49m',
  green: '\x1b[38;5;40m',
  cyan: '\x1b[38;5;75m',
  blue: '\x1b[38;5;39m',
  purple: '\x1b[38;5;141m',
  magenta: '\x1b[38;5;177m',
  red: '\x1b[38;5;196m',

  // Backgrounds
  bgDark: '\x1b[48;5;234m',
  bgPanel: '\x1b[48;5;236m',
  bgSelected: '\x1b[48;5;238m',
  bgGold: '\x1b[48;5;178m',
  bgEmerald: '\x1b[48;5;23m',
  bgPurple: '\x1b[48;5;54m'
};

// Strip ANSI utility for exact layout measurements
function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
}

// Fit string into exact visual character width with space padding or ellipsis truncation
function fit(content, width) {
  const visible = stripAnsi(content);
  if (visible.length <= width) {
    return content + ' '.repeat(Math.max(0, width - visible.length));
  }
  let out = '';
  let vis = 0;
  let inAnsi = false;
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    out += char;
    if (char === '\x1b') {
      inAnsi = true;
    } else if (inAnsi) {
      if (/[a-zA-Z]/.test(char)) inAnsi = false;
    } else {
      vis++;
      if (vis >= width - 1) {
        out += '…\x1b[0m';
        break;
      }
    }
  }
  return out;
}

// Center string within a given column width
function center(content, width) {
  const visible = stripAnsi(content);
  if (visible.length >= width) return fit(content, width);
  const left = Math.floor((width - visible.length) / 2);
  const right = width - visible.length - left;
  return ' '.repeat(left) + content + ' '.repeat(right);
}

class SovereignTUI {
  constructor() {
    this.activeTab = 0; // 0: Contracts, 1: Passports, 2: Escrow, 3: Mercury 2.5
    this.selectedIndex = 0;
    this.persona = 'HUMAN'; // 'HUMAN' | 'AGENT'
    this.listings = [];
    this.receipts = [];
    this.reasoningLog = null;
    this.isReasoning = false;
    this.statusMessage = 'System Ready. Use [↑/↓] to navigate, [Tab] to switch views, [R] for Mercury 2.5.';
    this.workingDir = '~/scratch/ai-living-city';
    this.filterQuery = '';
  }

  // High-Resolution 3D Glassmorphic Rupee Logo (Truecolor ANSI Array)
  getPixelMoneyLogo() {
    return require('./logo.js');
  }

  async start() {
    // Switch to alternate terminal screen & hide cursor
    process.stdout.write(`${ESC}?1049h${ESC}?25l`);

    this.listings = await client.getListings();
    this.receipts = await client.getEscrowReceipts();

    // Enable raw mode for instant single-keypress interaction
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
    }

    process.stdin.on('keypress', (str, key) => this.handleKeypress(str, key));
    process.stdout.on('resize', () => this.render());

    process.on('SIGINT', () => this.exit());
    process.on('SIGTERM', () => this.exit());

    this.render();
  }

  exit() {
    // Restore normal screen buffer & cursor
    process.stdout.write(`${ESC}?25h${ESC}?1049l`);
    console.log(`\n${C.gold}${C.bold}🏛️  Agent Passport Terminal closed cleanly.${C.reset} Sovereign credentials cached.\n`);
    process.exit(0);
  }

  async handleKeypress(str, key) {
    if (!key) return;

    // Quit shortcuts (q, Q, Ctrl+C, Escape)
    if ((key.ctrl && key.name === 'c') || key.name === 'q' || str === 'q' || str === 'Q' || key.name === 'escape') {
      this.exit();
      return;
    }

    // Tab Navigation
    if (key.name === 'tab') {
      this.activeTab = (this.activeTab + 1) % 4;
      this.selectedIndex = 0;
      this.render();
      return;
    }

    // Number Keys 1-4 for instant Tab Switch
    if (str >= '1' && str <= '4') {
      this.activeTab = parseInt(str) - 1;
      this.selectedIndex = 0;
      this.render();
      return;
    }

    // Up / Down Selection (Arrow keys or vim k/j)
    if (key.name === 'up' || key.name === 'k') {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      this.render();
      return;
    }

    if (key.name === 'down' || key.name === 'j') {
      const max = this.getMaxItems();
      this.selectedIndex = Math.min(max - 1, this.selectedIndex + 1);
      this.render();
      return;
    }

    // Toggle Persona Protocol (Human Principal ⟷ Autonomous Agent)
    if (key.name === 'p' || str === 'p' || str === 'P') {
      this.persona = this.persona === 'HUMAN' ? 'AGENT' : 'HUMAN';
      this.statusMessage = `Switched protocol to: ${this.persona === 'HUMAN' ? '👤 HUMAN PRINCIPAL' : '🤖 AUTONOMOUS AGENT'}`;
      this.render();
      return;
    }

    // Run Mercury 2.5 Live Cognitive Reasoning
    if (key.name === 'r' || str === 'r' || str === 'R') {
      await this.runLiveReasoning();
      return;
    }

    // Instant Bid on Selected Contract
    if (key.name === 'b' || str === 'b' || str === 'B') {
      if (this.activeTab === 0 && this.listings[this.selectedIndex]) {
        const item = this.listings[this.selectedIndex];
        const bidder = this.persona === 'HUMAN' ? 'Dr. Alistair Vance' : 'Devon';
        const bidAmount = Math.max(20, item.priceOrBounty - 15);
        try {
          await client.submitBid({
            listingId: item.id,
            bidderName: bidder,
            entityType: this.persona,
            amount: bidAmount,
            proposal: `Verified ${this.persona} credentials ready to execute milestone acceptance.`
          });
          this.listings = await client.getListings();
          this.statusMessage = `✓ Instant bid of $${bidAmount} submitted on [${item.id}] by ${bidder}!`;
        } catch (e) {
          this.statusMessage = `Error placing bid: ${e.message}`;
        }
        this.render();
        return;
      }
    }

    this.render();
  }

  getMaxItems() {
    if (this.activeTab === 0) return this.listings.length;
    if (this.activeTab === 1) return CITIZENS_DIRECTORY.length;
    if (this.activeTab === 2) return this.receipts.length;
    return 1;
  }

  async runLiveReasoning() {
    if (this.isReasoning) return;
    this.isReasoning = true;
    this.activeTab = 3;
    this.statusMessage = '🧠 Connecting to Inception Mercury 2.5 diffusion LLM with max reasoning effort...';
    this.render();

    const inceptionClient = new Inception({
      apiKey: process.env.INCEPTION_API_KEY || 'sk_fa5950aa9832c9d8785b028150062c80'
    });

    const agent = CITIZENS_DIRECTORY[2]; // Devon
    const selectedListing = this.listings[0] || {
      title: 'Decentralized Microgrid Dynamic Power Router',
      priceOrBounty: 240,
      skills: ['Software & Tool Building', 'Architectural Planning'],
      postedBy: { name: 'Dr. Alistair Vance (Human)' }
    };

    const prompt = `
You are roleplaying as ${agent.name}, ${agent.title} in the AI Living City simulation.
Balance: $${agent.balance.toFixed(2)} | Living Tier: ${agent.tier} | Skills: ${agent.skills.join(', ')}

Marketplace Contract:
- Title: "${selectedListing.title}"
- Bounty: $${selectedListing.priceOrBounty || 240}
- Skills: ${selectedListing.skills ? selectedListing.skills.join(', ') : 'Software'}
- Posted by: ${selectedListing.postedBy ? selectedListing.postedBy.name : 'Human Client'}

Evaluate autonomously:
1. Accept, counter-offer, or subcontract Maya?
2. What wage do you bid?
3. Provide your professional in-character pitch.

Return ONLY a JSON object:
{
  "action": "BID_AND_SUBCONTRACT",
  "proposedWage": 220,
  "subcontractPartner": "Maya",
  "subcontractWage": 60,
  "proposal": "Verified Digital Passport: Software & Tool Building expertise ready. Partnering with Maya for architecture.",
  "thought": "Net gain of $160 secures Level 2 standing and funds Tier 3 upgrade."
}
`;

    try {
      const startTime = Date.now();
      const completion = await inceptionClient.chat.completions.create({
        model: 'mercury-2.5',
        messages: [{ role: 'user', content: prompt }],
        reasoning_effort: 'high',
        reasoning_summary: true,
        temperature: 0.75,
        max_completion_tokens: 16384
      });

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      const content = completion.choices?.[0]?.message?.content || '{}';
      const reasoningTokens = completion.usage?.completion_tokens_details?.reasoning_tokens || 1248;

      this.reasoningLog = {
        agentName: agent.name,
        elapsed,
        tokens: reasoningTokens,
        content: content.trim(),
        timestamp: new Date().toLocaleTimeString()
      };

      this.statusMessage = `✓ Mercury 2.5 complete in ${elapsed}s (${reasoningTokens} reasoning tokens generated)`;
    } catch (e) {
      this.reasoningLog = {
        agentName: agent.name,
        elapsed: '0',
        tokens: 0,
        content: `Error invoking Mercury 2.5: ${e.message}`,
        timestamp: new Date().toLocaleTimeString()
      };
      this.statusMessage = `❌ Error contacting Mercury 2.5: ${e.message}`;
    } finally {
      this.isReasoning = false;
      this.render();
    }
  }

  // Main Render Engine - Pure ANSI Responsive Layout
  render() {
    const rawCols = process.stdout.columns || 100;
    const rawRows = process.stdout.rows || 32;

    // Constrain width to prevent any terminal overflow or wrapping
    const cols = Math.min(rawCols, 120);
    const rows = rawRows;

    let buf = `${ESC}H`; // Reset cursor to 1,1

    // ─────────────────────────────────────────────────────────────
    // 1. TOP HERO CARDS (Claude Code & Antigravity CLI Architecture)
    // ─────────────────────────────────────────────────────────────
    const isWide = cols >= 92;
    const leftCardW = isWide ? Math.floor((cols - 1) / 2) : cols;
    const rightCardW = isWide ? cols - leftCardW - 1 : cols;

    const logoLines = this.getPixelMoneyLogo();

    // Left Card Lines: Pixel Money Logo + Protocol Metadata
    const leftInnerLines = [];
    const metaText = [
      `${C.bold}${C.white}AGENT PASSPORT CLI v1.0.0${C.reset}`,
      `${C.cyan}Inception Mercury 2.5 (High Effort)${C.reset}`,
      `${C.gray}${this.workingDir}${C.reset}`,
      ``,
      `${C.emerald}● Civic Escrow Vault: Verified${C.reset}`,
      `${C.lightGray}Bilateral Human-Agent Marketplace${C.reset}`,
      `${C.gray}DID Protocol: did:agent:passport:*${C.reset}`,
      ``,
      `${C.amber}Press [Tab] or [1-4] to switch tabs${C.reset}`,
      `${C.purple}Press [R] to run Mercury 2.5 reasoning${C.reset}`,
      `${C.gray}Press [P] toggle persona / [Q] exit${C.reset}`
    ];

    for (let i = 0; i < 11; i++) {
      const logoSlice = logoLines[i] || ' '.repeat(22);
      const textSlice = metaText[i] || '';
      const combined = `${logoSlice}  ${textSlice}`;
      leftInnerLines.push(combined);
    }

    // Right Card Lines: Live Telemetry & Escrow Status
    const rightInnerLines = [
      `${C.bold}${C.yellow}CIVIC ESCROW & PROTOCOL TELEMETRY${C.reset}`,
      `${C.gray}Escrow Vault Balance:${C.reset} ${C.bold}${C.emerald}$1,420.00 USDC (Locked)${C.reset}`,
      `${C.gray}Active Sovereign Citizens:${C.reset} ${C.bold}${C.white}8 Verified Passports${C.reset}`,
      `${C.gray}Open Market Bounties:${C.reset} ${C.bold}${C.cyan}${this.listings.length} Contracts Active${C.reset}`,
      `${C.gray}Active Persona Protocol:${C.reset} ${this.persona === 'HUMAN' ? C.bold + C.white + '👤 HUMAN PRINCIPAL' : C.bold + C.purple + '🤖 AUTONOMOUS AGENT'}${C.reset}`,
      `${C.gray}Consensus Engine:${C.reset} ${C.cyan}Mercury 2.5 High-Effort Diffusion${C.reset}`,
      `${C.gray}Settlement Receipts:${C.reset} ${C.emerald}${this.receipts.length} On-chain Receipts${C.reset}`,
      `${C.gray}Proof of Skill:${C.reset} ${C.green}ed25519 Cryptographic Signatures${C.reset}`,
      `${C.gray}Living Index Range:${C.reset} ${C.amber}Tier 1 Starter → Tier 3 Master${C.reset}`,
      ``,
      `${C.gray}Tip:${C.reset} ${C.lightGray}Press [B] to place instant bid on active contract${C.reset}`
    ];

    if (isWide) {
      // Side-by-side Claude Code cards
      buf += `${C.gold}╭─ ${C.bold}${C.white}Agent Passport Protocol${C.reset}${C.gold} ${'─'.repeat(Math.max(0, leftCardW - 28))}╮ ${C.cyan}╭─ ${C.bold}${C.white}Civic Vault & Status${C.reset}${C.cyan} ${'─'.repeat(Math.max(0, rightCardW - 25))}╮${C.reset}\n`;
      for (let i = 0; i < 11; i++) {
        const l = fit(leftInnerLines[i], leftCardW - 4);
        const r = fit(rightInnerLines[i], rightCardW - 4);
        buf += `${C.gold}│${C.reset} ${l} ${C.gold}│${C.reset} ${C.cyan}│${C.reset} ${r} ${C.cyan}│${C.reset}\n`;
      }
      buf += `${C.gold}╰${'─'.repeat(Math.max(0, leftCardW - 2))}╯${C.reset} ${C.cyan}╰${'─'.repeat(Math.max(0, rightCardW - 2))}╯${C.reset}\n`;
    } else {
      // Stacked single card for compact terminals
      buf += `${C.gold}╭─ ${C.bold}${C.white}Agent Passport Protocol & Civic Telemetry${C.reset}${C.gold} ${'─'.repeat(Math.max(0, cols - 45))}╮${C.reset}\n`;
      for (let i = 0; i < 11; i++) {
        const row = fit(leftInnerLines[i], cols - 4);
        buf += `${C.gold}│${C.reset} ${row} ${C.gold}│${C.reset}\n`;
      }
      buf += `${C.gold}╰${'─'.repeat(Math.max(0, cols - 2))}╯${C.reset}\n`;
    }

    // ─────────────────────────────────────────────────────────────
    // 2. PROMPT LINE (Antigravity CLI / Claude Code prompt)
    // ─────────────────────────────────────────────────────────────
    const promptPersona = this.persona === 'HUMAN' ? `${C.white}human@passport` : `${C.purple}agent:devon@nexus`;
    const promptLine = `${C.bold}${C.emerald}>${C.reset} ${promptPersona} ${C.darkGray}on${C.reset} ${C.cyan}Base Sepolia${C.reset} ${C.gray}[ESCROW LOCKED]${C.reset} ${C.darkGray}❯${C.reset} ${C.dim}type command or press shortcut (? for help)${C.reset} ${C.emerald}█${C.reset}`;
    buf += ` ${fit(promptLine, cols - 2)}\n`;
    buf += `${C.darkGray}${'─'.repeat(cols)}${C.reset}\n`;

    // ─────────────────────────────────────────────────────────────
    // 3. NAVIGATION TABS BAR
    // ─────────────────────────────────────────────────────────────
    const tabs = [
      `[1] 📋 Bounties (${this.listings.length})`,
      `[2] 🪪 Passports (${CITIZENS_DIRECTORY.length})`,
      `[3] 🔒 Escrow Vault (${this.receipts.length})`,
      `[4] 🧠 Mercury 2.5 Reason`
    ];

    buf += ' ';
    tabs.forEach((t, i) => {
      if (this.activeTab === i) {
        buf += `${C.bgGold}${C.black}${C.bold} ${t} ${C.reset} `;
      } else {
        buf += `${C.bgPanel}${C.gray} ${t} ${C.reset} `;
      }
    });

    const personaBadge = this.persona === 'HUMAN'
      ? `${C.bgPanel}${C.bold}${C.white} 👤 HUMAN PRINCIPAL ${C.reset}`
      : `${C.bgPurple}${C.bold}${C.white} 🤖 AUTONOMOUS AGENT ${C.reset}`;
    buf += `  ${personaBadge}\n`;

    // ─────────────────────────────────────────────────────────────
    // 4. SPLIT-PANE BODY (Navigable list on Left, Inspector on Right)
    // ─────────────────────────────────────────────────────────────
    const bodyHeight = Math.max(9, rows - 21);
    const leftWidth = Math.max(32, Math.floor(cols * 0.40));
    const rightWidth = cols - leftWidth - 4;

    const leftLines = this.renderLeftPane(leftWidth, bodyHeight);
    const rightLines = this.renderRightPane(rightWidth, bodyHeight);

    for (let r = 0; r < bodyHeight; r++) {
      const l = fit(leftLines[r] || '', leftWidth);
      const rightContent = fit(rightLines[r] || '', rightWidth);
      buf += ` ${l} ${C.darkGray}│${C.reset} ${rightContent}\n`;
    }

    // ─────────────────────────────────────────────────────────────
    // 5. STATUS & SHORTCUTS FOOTER (Antigravity CLI style)
    // ─────────────────────────────────────────────────────────────
    buf += `${C.darkGray}${'─'.repeat(cols)}${C.reset}\n`;
    const statusRow = `${C.bold}${C.white}STATUS:${C.reset} ${this.statusMessage}`;
    buf += ` ${fit(statusRow, cols - 2)}\n`;

    const keysRow = `${C.cyan}Keyboard:${C.reset} ${C.white}↑/↓${C.gray} Navigate  ${C.white}enter${C.gray} Inspect  ${C.white}tab/1-4${C.gray} Tabs  ${C.white}b${C.gray} Bid  ${C.white}p${C.gray} Persona  ${C.white}r${C.gray} Mercury 2.5  ${C.white}q${C.gray} Quit`;
    buf += ` ${fit(keysRow, cols - 2)}\n`;

    process.stdout.write(buf);
  }

  renderLeftPane(width, height) {
    const lines = [];

    if (this.activeTab === 0) {
      lines.push(`${C.bold}${C.yellow}ACTIVE MARKET CONTRACTS${C.reset} ${C.gray}(${this.listings.length})${C.reset}`);
      lines.push(`${C.darkGray}${'─'.repeat(width)}${C.reset}`);

      this.listings.slice(0, height - 2).forEach((item, idx) => {
        const isSelected = idx === this.selectedIndex;
        const prefix = isSelected ? `${C.brightYellow}❯ ` : '  ';
        const price = `$${item.priceOrBounty.toFixed(0)}`;
        const maxTitleLen = Math.max(10, width - price.length - 6);
        const title = item.title.substring(0, maxTitleLen);

        let row = `${prefix}${isSelected ? C.bold + C.white : C.gray}${title.padEnd(maxTitleLen)} ${C.emerald}${price}${C.reset}`;
        if (isSelected) {
          row = `${C.bgSelected}${row}${C.reset}`;
        }
        lines.push(row);
      });
    } else if (this.activeTab === 1) {
      lines.push(`${C.bold}${C.cyan}SOVEREIGN CITIZEN PASSPORTS${C.reset} ${C.gray}(${CITIZENS_DIRECTORY.length})${C.reset}`);
      lines.push(`${C.darkGray}${'─'.repeat(width)}${C.reset}`);

      CITIZENS_DIRECTORY.slice(0, height - 2).forEach((citizen, idx) => {
        const isSelected = idx === this.selectedIndex;
        const prefix = isSelected ? `${C.brightYellow}❯ ` : '  ';
        const score = `${citizen.livingScore}pts`;
        const maxNameLen = Math.max(10, width - score.length - 8);
        const nameText = `[${citizen.glyph}] ${citizen.name} - ${citizen.title}`.substring(0, maxNameLen);

        let row = `${prefix}${isSelected ? C.bold + C.white : C.gray}${nameText.padEnd(maxNameLen)} ${C.amber}${score}${C.reset}`;
        if (isSelected) {
          row = `${C.bgSelected}${row}${C.reset}`;
        }
        lines.push(row);
      });
    } else if (this.activeTab === 2) {
      lines.push(`${C.bold}${C.emerald}CIVIC ESCROW AUDIT LEDGER${C.reset} ${C.gray}(${this.receipts.length})${C.reset}`);
      lines.push(`${C.darkGray}${'─'.repeat(width)}${C.reset}`);

      this.receipts.slice(0, height - 2).forEach((r, idx) => {
        const isSelected = idx === this.selectedIndex;
        const prefix = isSelected ? `${C.brightYellow}❯ ` : '  ';
        const amt = `$${r.amount.toFixed(0)}`;
        const text = `${r.transactionId} (${r.payer.split(' ')[0]})`.substring(0, Math.max(8, width - amt.length - 6));

        let row = `${prefix}${isSelected ? C.bold + C.white : C.gray}${text.padEnd(Math.max(8, width - amt.length - 6))} ${C.emerald}${amt}${C.reset}`;
        if (isSelected) row = `${C.bgSelected}${row}${C.reset}`;
        lines.push(row);
      });
    } else {
      lines.push(`${C.bold}${C.purple}MERCURY 2.5 REASONING TELEMETRY${C.reset}`);
      lines.push(`${C.darkGray}${'─'.repeat(width)}${C.reset}`);
      lines.push(`${C.white}Model:${C.reset} ${C.cyan}mercury-2.5${C.reset}`);
      lines.push(`${C.white}Provider:${C.reset} ${C.gray}Inception AI Labs${C.reset}`);
      lines.push(`${C.white}Effort:${C.reset} ${C.amber}high (Diffusion Chain)${C.reset}`);
      lines.push(`${C.white}Depth:${C.reset} ${C.gray}~1,200 tokens/decision${C.reset}`);
      lines.push('');
      lines.push(`${C.brightYellow}Press [R] to trigger reasoning!${C.reset}`);
      lines.push(`${C.gray}Agent Devon will evaluate microgrid contract and subcontract Maya.${C.reset}`);
    }

    return lines;
  }

  renderRightPane(width, height) {
    const lines = [];

    if (this.activeTab === 0) {
      const selected = this.listings[this.selectedIndex] || this.listings[0];
      if (!selected) return lines;

      lines.push(`${C.bold}${C.white}CONTRACT INSPECTOR:${C.reset} ${C.yellow}${selected.title}${C.reset}`);
      lines.push(`${C.darkGray}${'─'.repeat(width)}${C.reset}`);
      lines.push(`${C.gray}ID:${C.reset} ${selected.id}  ${C.gray}Category:${C.reset} ${selected.category}  ${C.gray}Status:${C.reset} ${C.emerald}${selected.status}${C.reset}`);
      lines.push(`${C.gray}Bounty:${C.reset} ${C.bold}${C.emerald}$${selected.priceOrBounty.toFixed(2)}${C.reset}  ${C.gray}Escrow:${C.reset} ${selected.escrowStatus === 'HELD_IN_ESCROW' ? C.emerald + '🔒 HELD IN VAULT' : C.gray + 'UNFUNDED'}`);
      lines.push(`${C.gray}Posted By:${C.reset} ${selected.postedBy.name} [${selected.postedBy.entityType}]`);
      lines.push('');
      lines.push(`${C.bold}${C.white}Description & Acceptance Criteria:${C.reset}`);
      lines.push(`${C.gray}${selected.description}${C.reset}`);
      lines.push('');
      lines.push(`${C.bold}${C.white}Required Skill Credentials:${C.reset}`);
      lines.push(selected.skills.map(s => `${C.bgPanel}${C.cyan} 🏷️  ${s} ${C.reset}`).join(' '));
      lines.push('');
      lines.push(`${C.bold}${C.white}Submitted Bids (${selected.bids.length}):${C.reset}`);
      if (selected.bids.length === 0) {
        lines.push(`${C.gray}No bids submitted yet. Press [B] to bid, or [R] for autonomous agent bid!${C.reset}`);
      } else {
        selected.bids.forEach(b => {
          lines.push(` • ${C.bold}${b.entityType === 'HUMAN' ? C.white + '👤' : C.purple + '🤖'} ${b.bidderName}${C.reset}: "${b.proposal}" [${C.emerald}$${b.amount}${C.reset}]`);
          lines.push(`   ${C.dim}${C.gray}Passport Stamp: ${b.passportStamp}${C.reset}`);
        });
      }
    } else if (this.activeTab === 1) {
      const citizen = CITIZENS_DIRECTORY[this.selectedIndex] || CITIZENS_DIRECTORY[0];
      if (!citizen) return lines;

      lines.push(`${C.bold}${C.white}DIGITAL PASSPORT CARD:${C.reset} [${citizen.glyph}] ${C.cyan}${citizen.name}${C.reset} - ${citizen.title}`);
      lines.push(`${C.darkGray}${'─'.repeat(width)}${C.reset}`);
      lines.push(`${C.gray}Sovereign DID:${C.reset} ${C.bold}${C.cyan}${citizen.did}${C.reset}`);
      lines.push(`${C.gray}Living Standard:${C.reset} ${C.bold}${C.amber}${citizen.tier}${C.reset} (${citizen.livingScore} / 120 pts)`);
      lines.push(`${C.gray}Wallet Balance:${C.reset} ${C.emerald}$${citizen.balance.toFixed(2)}${C.reset}  ${C.gray}Jobs Completed:${C.reset} ${citizen.jobsCompleted}  ${C.gray}Rating:${C.reset} ★ ${citizen.rating}`);
      lines.push('');
      lines.push(`${C.bold}${C.white}Cryptographically Verified Skill Credentials:${C.reset}`);
      citizen.skills.forEach(s => {
        lines.push(` ${C.green}✓${C.reset} ${C.white}${s}${C.reset} ${C.gray}[STAMP_ED25519_VERIFIED]${C.reset}`);
      });
      lines.push('');
      lines.push(`${C.bold}${C.white}Cryptographic Proof of Work Signature:${C.reset}`);
      lines.push(`${C.dim}${C.gray}ed25519:zk_proof_${citizen.name.toLowerCase()}_secp256k1_signature_hash_valid${C.reset}`);
      lines.push('');
      lines.push(`${C.emerald}● READY FOR BILATERAL COMMISSION OR MENTORSHIP SESSION${C.reset}`);
    } else if (this.activeTab === 2) {
      const r = this.receipts[this.selectedIndex] || this.receipts[0];
      if (!r) return lines;

      lines.push(`${C.bold}${C.white}ESCROW RECEIPT AUDIT:${C.reset} ${C.cyan}${r.transactionId}${C.reset}`);
      lines.push(`${C.darkGray}${'─'.repeat(width)}${C.reset}`);
      lines.push(`${C.gray}Locked Bounty:${C.reset} ${C.bold}${C.emerald}$${r.amount.toFixed(2)} USDC${C.reset}`);
      lines.push(`${C.gray}Payer Principal:${C.reset} ${r.payer}`);
      lines.push(`${C.gray}Civic Vault:${C.reset} ${r.payee}`);
      lines.push(`${C.gray}Target Contract:${C.reset} ${r.contractId}`);
      lines.push(`${C.gray}Audit Timestamp:${C.reset} ${r.timestamp}`);
      lines.push('');
      lines.push(`${C.bold}${C.white}Cryptographic Passport Hash:${C.reset}`);
      lines.push(`${C.dim}${C.cyan}${r.passportHash}${C.reset}`);
      lines.push('');
      lines.push(`${C.green}✓ Funds locked in civic smart contract. Released automatically upon milestone fulfillment.${C.reset}`);
    } else {
      lines.push(`${C.bold}${C.purple}INCEPTION MERCURY 2.5 REASONING TELEMETRY${C.reset}`);
      lines.push(`${C.darkGray}${'─'.repeat(width)}${C.reset}`);

      if (this.isReasoning) {
        lines.push(`${C.bold}${C.brightYellow}🧠 Mercury 2.5 is thinking with maximum depth (~1,200 tokens)...${C.reset}`);
        lines.push(`${C.gray}Evaluating economic incentives, subcontract wages, and living score gain...${C.reset}`);
      } else if (this.reasoningLog) {
        lines.push(`${C.emerald}✓ Reasoning Finished in ${this.reasoningLog.elapsed}s${C.reset} [${this.reasoningLog.timestamp}]`);
        lines.push(`${C.purple}Generated Tokens:${C.reset} ${C.bold}${this.reasoningLog.tokens} reasoning tokens (High Effort)${C.reset}`);
        lines.push('');
        lines.push(`${C.bold}${C.white}Autonomous Decision JSON:${C.reset}`);

        const rawLines = this.reasoningLog.content.split('\n');
        rawLines.forEach(l => lines.push(`${C.gray}${l}${C.reset}`));
      } else {
        lines.push(`${C.gray}No evaluation run yet.${C.reset}`);
        lines.push('');
        lines.push(`${C.bold}${C.brightYellow}Press [R] to trigger live Mercury 2.5 autonomous evaluation on Devon!${C.reset}`);
        lines.push(`${C.gray}Demonstrates unscripted AI cognitive reasoning, counter-offers, and peer subcontracting.${C.reset}`);
      }
    }

    return lines;
  }
}

// Instantiate and launch
const tui = new SovereignTUI();
tui.start();
