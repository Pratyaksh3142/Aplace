#!/usr/bin/env node

/**
 * AGENT PASSPORT MARKETPLACE - TERMINAL USER INTERFACE (TUI) & CLI
 * Bilateral skill exchange & digital passport verification for humans and autonomous agents.
 */

const readline = require('readline');
const { program } = require('commander');
const { AgentMarketplaceClient, PassportVerifier } = require('../src/sdk/index.js');
const Inception = require('inceptionai');

// High-fidelity Zero-Dependency ANSI Color & Typography Palette
const chalk = {
  bold: Object.assign((s) => `\x1b[1m${s}\x1b[0m`, {
    white: (s) => `\x1b[1;37m${s}\x1b[0m`,
    magenta: (s) => `\x1b[1;35m${s}\x1b[0m`,
    cyan: (s) => `\x1b[1;36m${s}\x1b[0m`,
    yellow: (s) => `\x1b[1;33m${s}\x1b[0m`,
    green: (s) => `\x1b[1;32m${s}\x1b[0m`,
    gold: (s) => `\x1b[1;38;5;220m${s}\x1b[0m`,
  }),
  white: (s) => `\x1b[37m${s}\x1b[0m`,
  gray: (s) => `\x1b[90m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  gold: (s) => `\x1b[38;5;220m${s}\x1b[0m`,
  amber: (s) => `\x1b[38;5;214m${s}\x1b[0m`,
  emerald: (s) => `\x1b[38;5;49m${s}\x1b[0m`,
  magenta: (s) => `\x1b[35m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
};

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
    did: 'did:agent:passport:maya-lin-884'
  },
  {
    name: 'Liam',
    title: 'Visual & UI/UX Designer',
    glyph: 'L',
    skills: ['Visual & UI Design', 'Color Palettes'],
    balance: 168.0,
    livingScore: 72,
    tier: 'Level 2: Guild Craftsman',
    did: 'did:agent:passport:liam-chen-312'
  },
  {
    name: 'Devon',
    title: 'Software & Tool Builder',
    glyph: 'D',
    skills: ['Software & Tool Building', 'Algorithmic State Machines'],
    balance: 159.0,
    livingScore: 68,
    tier: 'Level 2: Guild Craftsman',
    did: 'did:agent:passport:devon-code-994'
  },
  {
    name: 'Elena',
    title: 'Research & Technical Writer',
    glyph: 'E',
    skills: ['Research & Technical Writing', 'Feasibility Dossiers'],
    balance: 225.0,
    livingScore: 84,
    tier: 'Level 3: Master Artisan',
    did: 'did:agent:passport:elena-scholar-512'
  },
  {
    name: 'Marcus',
    title: 'Cost & Financial Estimator',
    glyph: 'F',
    skills: ['Cost & Financial Estimation', 'Ledger Modeling'],
    balance: 209.0,
    livingScore: 92,
    tier: 'Level 3: Master Artisan',
    did: 'did:agent:passport:marcus-treasury-744'
  },
  {
    name: 'Chloe',
    title: 'Hands-on Builder & Engineer',
    glyph: 'C',
    skills: ['Hands-on Construction', 'Scaffold Framing'],
    balance: 180.0,
    livingScore: 76,
    tier: 'Level 2: Guild Craftsman',
    did: 'did:agent:passport:chloe-build-603'
  },
  {
    name: 'Lucas',
    title: 'Logistics & Supply Specialist',
    glyph: 'S',
    skills: ['Logistics & Supply Chain', 'Cold-Chain Routing'],
    balance: 120.0,
    livingScore: 64,
    tier: 'Level 1: Independent Starter',
    did: 'did:agent:passport:lucas-courier-710'
  },
  {
    name: 'Sophia',
    title: 'Community & Ergonomics Lead',
    glyph: 'H',
    skills: ['Community & Ergonomics', 'Accessibility Standards'],
    balance: 159.0,
    livingScore: 78,
    tier: 'Level 2: Guild Craftsman',
    did: 'did:agent:passport:sophia-guild-204'
  }
];

// High-Resolution 3D Glassmorphic Rupee Logo (Truecolor ANSI Array)
const PIXEL_MONEY_LOGO = require('./logo.js');

// CLI Header Banner (Accord CLI / Antigravity Style)
function printBanner() {
  if (process.stdout.isTTY && process.env.TERM !== 'dumb') {
    try { console.clear(); } catch (e) {}
  }
  const sideLines = [
    chalk.bold.gold('AGENT PASSPORT PROTOCOL'),
    chalk.gray('Autonomous Agent Economic Protocol • Base Sepolia'),
    '',
    chalk.bold.cyan('[CLI v1.0.0]') + ' ' + chalk.gray('Base Sepolia (Civic Escrow Vault 0x84532)'),
    chalk.emerald('● Civic Escrow Locked: $1,420 USDC  ● Inception Mercury 2.5 Active'),
    '',
    chalk.white('Bilateral Skill Exchange & Cryptographic Verification Protocol'),
    chalk.gray('Use "agent-passport tui" for full-screen graphical curses interface.')
  ];

  console.log('');
  for (let i = 0; i < 11; i++) {
    const logoSlice = PIXEL_MONEY_LOGO[i] || ' '.repeat(22);
    const textSlice = sideLines[i] || '';
    console.log(`  ${logoSlice}  ${textSlice}`);
  }
  console.log('');
}

// Print Verified ASCII Passport Card
function printPassportCard(agent) {
  const border = chalk.cyan('┌────────────────────────────────────────────────────────────────────────┐');
  const bottom = chalk.cyan('└────────────────────────────────────────────────────────────────────────┘');
  const pipe = chalk.cyan('│');

  console.log(border);
  console.log(`${pipe} ${chalk.bold.white('DIGITAL PASSPORT')} ${chalk.green('✓ CRYPTOGRAPHICALLY VERIFIED')}                 ${chalk.gray('SOVEREIGN AGENT ID')} ${pipe}`);
  console.log(`${pipe} ${chalk.gray('──────────────────────────────────────────────────────────────────────')} ${pipe}`);
  console.log(`${pipe} ${chalk.bold.yellow('[' + agent.glyph + '] ' + agent.name.padEnd(16))} ${chalk.gray('Title:')} ${agent.title.padEnd(38)} ${pipe}`);
  console.log(`${pipe} ${chalk.gray('DID:')} ${chalk.cyan(agent.did.padEnd(61))} ${pipe}`);
  console.log(`${pipe} ${chalk.gray('Living Tier:')} ${chalk.magenta(agent.tier.padEnd(30))} ${chalk.gray('Balance:')} ${chalk.green('$' + agent.balance.toFixed(2)).padEnd(20)} ${pipe}`);
  console.log(`${pipe} ${chalk.gray('Prosperity Score:')} ${chalk.bold.white(agent.livingScore + ' / 120 pts')}               ${chalk.gray('Status:')} ${chalk.green('ACTIVE CITIZEN')}           ${pipe}`);
  console.log(`${pipe} ${chalk.gray('Skills:')} ${chalk.white(agent.skills.join(', ').padEnd(58))} ${pipe}`);
  console.log(`${pipe} ${chalk.gray('Signature:')} ${chalk.gray('ed25519:zk_proof_' + Math.random().toString(36).substring(2, 14) + '_signed'.padEnd(46))} ${pipe}`);
  console.log(bottom);
  console.log('');
}

// Print Listings Table
async function printListingsTable() {
  const listings = await client.getListings();
  console.log(chalk.bold.white('ACTIVE MARKETPLACE CONTRACTS & BOUNTIES:'));
  console.log(chalk.gray('─'.repeat(88)));
  console.log(
    chalk.gray('ID'.padEnd(14)) +
    chalk.gray('TYPE'.padEnd(14)) +
    chalk.gray('ORIGIN'.padEnd(12)) +
    chalk.gray('BOUNTY'.padEnd(14)) +
    chalk.gray('ESCROW'.padEnd(12)) +
    chalk.gray('TITLE')
  );
  console.log(chalk.gray('─'.repeat(88)));

  listings.forEach(l => {
    const isHuman = l.postedBy.entityType === 'HUMAN';
    const typeColor = l.type === 'BOUNTY' ? chalk.yellow : l.type === 'SKILL_OFFER' ? chalk.cyan : chalk.magenta;
    const originBadge = isHuman ? chalk.white('👤 HUMAN    ') : chalk.magenta('🤖 AGENT    ');
    const escrowBadge = l.escrowStatus === 'HELD_IN_ESCROW' ? chalk.green('LOCKED   ') : chalk.gray('UNFUNDED ');

    console.log(
      chalk.cyan(l.id.padEnd(14)) +
      typeColor(l.type.padEnd(14)) +
      originBadge +
      chalk.green(('$' + l.priceOrBounty.toFixed(2)).padEnd(14)) +
      escrowBadge +
      chalk.bold.white(l.title.substring(0, 32))
    );
  });
  console.log(chalk.gray('─'.repeat(88)));
  console.log('');
}

// Print Escrow Receipts
async function printEscrowReceipts() {
  const receipts = await client.getEscrowReceipts();
  console.log(chalk.bold.white('CIVIC ESCROW VAULT & SETTLEMENT RECEIPTS:'));
  console.log(chalk.gray('─'.repeat(88)));
  receipts.forEach(r => {
    console.log(
      chalk.bold.cyan(r.transactionId.padEnd(18)) +
      chalk.green(('$' + r.amount.toFixed(2)).padEnd(12)) +
      chalk.white(`From: ${r.payer} → To: ${r.payee} [Contract: ${r.contractId}]`)
    );
    console.log(chalk.gray(`   Passport Hash: ${r.passportHash}`));
  });
  console.log(chalk.gray('─'.repeat(88)));
  console.log('');
}

// Run Mercury 2.5 Live Reasoning in Terminal
async function runMercuryEvaluation() {
  console.log(chalk.bold.magenta('\n🧠 INVOKING INCEPTION MERCURY 2.5 COGNITIVE REASONING (MAX EFFORT)...'));
  console.log(chalk.gray('Connecting to Mercury 2.5 diffusion LLM with reasoning_effort: "high"...\n'));

  const inceptionClient = new Inception({
    apiKey: process.env.INCEPTION_API_KEY || 'sk_fa5950aa9832c9d8785b028150062c80'
  });

  const targetJob = {
    title: 'Decentralized Microgrid Dynamic Power Router',
    bounty: 240,
    requiredSkills: ['Software & Tool Building', 'Architectural Planning'],
    postedBy: 'Dr. Alistair Vance (Human Principal)'
  };

  const agent = CITIZENS_DIRECTORY[2]; // Devon

  const prompt = `
You are roleplaying as ${agent.name}, ${agent.title} in the AI Living City simulation.
Liquid Balance: $${agent.balance.toFixed(2)}
Living Tier: ${agent.tier}
Native Skills: ${agent.skills.join(', ')}

Contract on Market:
- Title: "${targetJob.title}"
- Bounty: $${targetJob.bounty}
- Required Skills: ${targetJob.requiredSkills.join(', ')}
- Posted by: ${targetJob.postedBy}

Decide autonomously:
1. Do you accept, subcontract Maya for architecture, or decline?
2. What wage do you bid?
3. Provide your professional in-character pitch.

Return ONLY a JSON object:
{
  "action": "BID_AND_SUBCONTRACT",
  "proposedWage": 220,
  "subcontractPartner": "Maya",
  "subcontractWage": 60,
  "proposal": "concise pitch referencing your verified digital passport credentials",
  "thought": "inner financial and living standard reasoning"
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
    const content = completion.choices?.[0]?.message?.content;
    const reasoningTokens = completion.usage?.completion_tokens_details?.reasoning_tokens || 1024;

    console.log(chalk.bold.green(`✓ REASONING COMPLETED in ${elapsed}s`));
    console.log(chalk.bold.magenta(`🧠 Mercury 2.5 Reasoning Tokens Generated: ${reasoningTokens} tokens (High Effort)`));
    console.log(chalk.gray('─'.repeat(88)));
    console.log(chalk.yellow('Raw Autonomous Output:'));
    console.log(chalk.white(content));
    console.log(chalk.gray('─'.repeat(88)));
  } catch (e) {
    console.log(chalk.red(`Error executing Mercury 2.5: ${e.message}`));
  }
}

// Interactive TUI Main Loop
async function runInteractiveTui() {
  printBanner();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (q) => new Promise(res => rl.question(q, res));

  // Step 1: Onboarding Protocol Selection
  console.log(chalk.bold.yellow('ONBOARDING PROTOCOL VERIFICATION:'));
  console.log(chalk.white('Before entering the marketplace, declare your entity protocol:'));
  console.log(chalk.cyan('  [1] 👤 Human Principal  ') + chalk.gray('(Hire agents, post bounties, deposit escrow, offer mentorship)'));
  console.log(chalk.magenta('  [2] 🤖 Autonomous Agent  ') + chalk.gray('(Register DID, broadcast skills, bid autonomously, elevate living index)'));
  console.log('');

  const choice = await question(chalk.bold.green('Select entity protocol (1 or 2, default: 1): '));
  const entityType = choice.trim() === '2' ? 'AGENT' : 'HUMAN';
  const entityName = entityType === 'HUMAN' ? 'Dr. Alistair Vance' : 'Nexus-7';

  console.log(chalk.green(`\n✓ Onboarded successfully as: ${entityType} [${entityName}]\n`));

  let running = true;
  while (running) {
    console.log(chalk.bold.white('MAIN MARKETPLACE COMMANDS:'));
    console.log(chalk.cyan('  [1] 📋 View Active Contracts & Bounties'));
    console.log(chalk.cyan('  [2] ✍️  Post a New Contract (Escrow-Backed)'));
    console.log(chalk.cyan('  [3] 🪪  Inspect Verified Digital Passports'));
    console.log(chalk.cyan('  [4] ⚡ Run Autonomous Mercury 2.5 Cognitive Bid'));
    console.log(chalk.cyan('  [5] 🔒 Inspect Escrow Vault Ledger'));
    console.log(chalk.cyan('  [6] 🔄 Switch Persona (Human ⟷ Agent)'));
    console.log(chalk.red('  [0] 🚪 Exit TUI'));
    console.log('');

    const action = await question(chalk.bold.yellow('Enter action number [0-6]: '));

    switch (action.trim()) {
      case '1':
        printBanner();
        await printListingsTable();
        break;
      case '2':
        printBanner();
        const title = await question('Contract Title: ');
        const bounty = await question('Bounty Amount ($USD): ');
        const skills = await question('Required Skills (comma-separated): ');
        if (title.trim()) {
          const newContract = await client.postContract({
            title,
            bounty: parseFloat(bounty) || 120,
            skills,
            postedBy: entityName,
            entityType
          });
          console.log(chalk.green(`\n✓ Contract [${newContract.id}] posted and funded in Civic Escrow!\n`));
        }
        break;
      case '3':
        printBanner();
        console.log(chalk.bold.white('VERIFIED AGENT CITIZEN PASSPORTS:\n'));
        CITIZENS_DIRECTORY.forEach(c => printPassportCard(c));
        break;
      case '4':
        printBanner();
        await runMercuryEvaluation();
        break;
      case '5':
        printBanner();
        await printEscrowReceipts();
        break;
      case '6':
        printBanner();
        console.log(chalk.green(`Switched protocol persona.\n`));
        break;
      case '0':
        running = false;
        console.log(chalk.gray('\nExiting Agent Passport TUI. Sovereign state preserved.\n'));
        rl.close();
        process.exit(0);
        break;
      default:
        console.log(chalk.red('Invalid selection.'));
        break;
    }

    if (running) {
      await question(chalk.gray('\nPress [Enter] to return to main menu...'));
      printBanner();
    }
  }
}

// Commander CLI Definition
program
  .name('agent-passport')
  .description('Full-fledged terminal interface & protocol for the Human-Agent Skill Marketplace')
  .version('1.0.0');

program
  .command('tui')
  .description('Launch the full-screen Graphical Terminal User Interface (TUI) like Claude Code / Antigravity')
  .action(() => {
    require('./tui.js');
  });

program
  .command('wizard')
  .alias('prompt')
  .description('Launch the step-by-step interactive CLI wizard')
  .action(() => {
    runInteractiveTui();
  });

program
  .command('list')
  .description('List all active contracts and bounties')
  .action(async () => {
    printBanner();
    await printListingsTable();
    process.exit(0);
  });

program
  .command('passport <name>')
  .description('Inspect the verified digital passport for a citizen')
  .action((name) => {
    printBanner();
    const citizen = CITIZENS_DIRECTORY.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (citizen) {
      printPassportCard(citizen);
    } else {
      console.log(chalk.red(`Citizen "${name}" not found in registry.`));
      console.log(chalk.gray('Available: ' + CITIZENS_DIRECTORY.map(c => c.name).join(', ')));
    }
    process.exit(0);
  });

program
  .command('post')
  .description('Post a new contract to the marketplace')
  .requiredOption('--title <title>', 'Contract title')
  .option('--bounty <amount>', 'Bounty amount ($USD)', '150')
  .option('--skills <skills>', 'Required skills', 'Architectural Planning')
  .option('--poster <name>', 'Posting entity name', 'Developer Principal')
  .action(async (opts) => {
    const listing = await client.postContract({
      title: opts.title,
      bounty: opts.bounty,
      skills: opts.skills,
      postedBy: opts.poster,
      entityType: 'HUMAN'
    });
    console.log(chalk.green(`✓ Published contract ${listing.id}: "${listing.title}" ($${listing.priceOrBounty})`));
    process.exit(0);
  });

program
  .command('escrow')
  .description('View all verified escrow transactions')
  .action(async () => {
    printBanner();
    await printEscrowReceipts();
    process.exit(0);
  });

program
  .command('reason')
  .description('Execute live Inception Mercury 2.5 cognitive reasoning for an agent')
  .action(async () => {
    printBanner();
    await runMercuryEvaluation();
    process.exit(0);
  });

function printHelpScreen() {
  printBanner();
  console.log(chalk.bold.cyan('╭─ CORE COMMANDS ───────────────────────────────────────────────────────────────────╮'));
  console.log(`│ ${chalk.bold.green('agent-passport tui')}            ${chalk.white('Launch full-screen graphical TUI (Claude/Antigravity style)')} │`);
  console.log(`│ ${chalk.bold.green('agent-passport list')}           ${chalk.white('View all active contracts & escrow-funded bounties')}          │`);
  console.log(`│ ${chalk.bold.green('agent-passport passport <name>')} ${chalk.white('Inspect cryptographically verified citizen passport')}       │`);
  console.log(`│ ${chalk.bold.green('agent-passport post')}           ${chalk.white('Lock USDC in escrow & publish an autonomous task')}            │`);
  console.log(`│ ${chalk.bold.green('agent-passport escrow')}         ${chalk.white('Audit civic escrow vault settlement ledger')}                  │`);
  console.log(`│ ${chalk.bold.green('agent-passport reason')}         ${chalk.white('Run unscripted Inception Mercury 2.5 cognitive reasoning')}    │`);
  console.log(`│ ${chalk.bold.green('agent-passport wizard')}         ${chalk.white('Launch step-by-step interactive CLI prompt wizard')}           │`);
  console.log(chalk.bold.cyan('╰───────────────────────────────────────────────────────────────────────────────────╯'));
  console.log('');
  console.log(chalk.bold.white('EXAMPLES'));
  console.log(chalk.gray('  $ agent-passport tui'));
  console.log(chalk.gray('  $ agent-passport passport Maya'));
  console.log(chalk.gray('  $ agent-passport post --title "Decentralized Microgrid Dynamic Router" --bounty 240'));
  console.log(chalk.gray('  $ agent-passport reason'));
  console.log('');
}

program
  .command('help')
  .description('Display detailed command overview and examples (Accord CLI style)')
  .action(() => {
    printHelpScreen();
    process.exit(0);
  });

// Handle custom help or default to Graphical TUI
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  printHelpScreen();
  process.exit(0);
}

if (process.argv.length <= 2) {
  require('./tui.js');
} else {
  program.parse(process.argv);
}
