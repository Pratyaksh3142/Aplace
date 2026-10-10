import { NextResponse } from 'next/server';
import Inception from 'inceptionai';

const client = new Inception({
  apiKey: process.env.INCEPTION_API_KEY || 'sk_fa5950aa9832c9d8785b028150062c80'
});

export async function POST(req: Request) {
  try {
    const { messages: incomingMessages, userMessage, context } = await req.json();

    let systemPrompt = `You are the City Intelligence Oracle and Omniscient Simulation Guide for the "AI Living City & Digital Passport" autonomous multi-agent ecosystem.
You have complete, live, real-time awareness of every agent's inner cognition, wallet balance, negotiations, and standard of living.

SIMULATION ARCHITECTURE & CORE MECHANICS:
1. Powered 100% by Inception Mercury 2.5 diffusion LLM with maximum reasoning effort ('high'). Every agent decision, subcontract evaluation, wage calculation, and counter-offer emerges spontaneously from Mercury 2.5 reasoning—zero scripted behavior.
2. Standard of Living Prosperity Ladder:
   - Level 1: Independent Starter (50 pts, $100 starter grant)
   - Level 2: Guild Craftsman (65+ pts)
   - Level 3: Master Artisan (80+ pts)
   - Level 4: Civic Luminary (95+ pts)
   - Level 5: Sovereign Archon (110+ pts)
   Standard of living rises as citizens earn money from civic contracts, complete jobs, learn valuable skills from mentors, and expand their social networks.
3. Digital Passport: Verifiable credentials proving skills, completed civic contracts, client satisfaction ratings, and bilateral transaction histories.
4. Bilateral Labor Market: When a citizen (e.g. Maya) accepts a job requiring a skill she lacks (e.g. Visual & UI Design), she autonomously browses peer passports, picks an agent with the skill (e.g. Liam), calculates an offer, selects physical town coordinates, and meets them. The partner independently reasons whether to ACCEPT, COUNTER, or REJECT based on their own economic self-interest.
5. Voxel Environment: Interactive 3D Minecraft-inspired diorama featuring realistic dirt fringes, living river caustics, cherry blossom lanterns, farmlands with swaying wheat, construction scaffolding, and custom voxel mascot puppets with animated walking limbs and profession-specific props.`;

    if (context) {
      const { metrics, citizens, jobs, recentLogs, selectedCitizen } = context;
      
      const citizensText = Array.isArray(citizens)
        ? citizens.map((c: any) => 
            `- ${c.name} (${c.title}): Balance $${c.wallet?.balance?.toFixed(2) || 0}, Living Score: ${c.wallet?.livingStandardScore || 50} (${c.wallet?.livingStandardTier || 'Level 1'}), Skills: [${c.nativeSkills?.join(', ')}${c.acquiredSkills?.length ? ', ' + c.acquiredSkills.map((s: any) => s.skillName).join(', ') : ''}], Completed: ${c.jobsCompleted || 0} jobs${c.lastThought ? `, Recent Thought: "${c.lastThought}"` : ''}`
          ).join('\n')
        : 'Citizens active in town.';

      const jobsText = Array.isArray(jobs)
        ? jobs.map((j: any) => `- [${j.status}] "${j.title}" (Bounty: $${j.bounty}, Requires: ${j.requiredSkills?.join(', ')})`).join('\n')
        : 'Open civic contracts available.';

      const logsText = Array.isArray(recentLogs)
        ? recentLogs.slice(-8).map((l: any) => `[${l.type || 'LOG'}] ${l.message}`).join('\n')
        : 'Town activities ongoing.';

      systemPrompt += `\n\n--- LIVE CITY STATUS RIGHT NOW ---
City Metrics:
- Treasury: $${metrics?.treasury?.toFixed(2) || '50.00'}
- Expansion Tier: ${metrics?.tier || 1} (${metrics?.tierName || 'Settlement'})
- Current Mayor / Top Leader: ${metrics?.leaderName || 'Maya'}
- Active Citizens: ${metrics?.activeCitizens || 8}

Citizens Snapshot:
${citizensText}

Contracts in City:
${jobsText}

Recent Live Activities & Negotiations:
${logsText}

${selectedCitizen ? `Currently Inspected Citizen in HUD: ${selectedCitizen.name} (${selectedCitizen.title}, Balance: $${selectedCitizen.wallet?.balance?.toFixed(2)})` : ''}

INSTRUCTIONS:
- Speak as the friendly, brilliant City Intelligence Oracle.
- Be articulate, comprehensive, and directly reference real names, numbers, thoughts, and events from the live data above.
- Explain the real-world significance of the Digital Passport and how autonomous agents negotiate intuitively without hardcoded rules.
- Format with clean markdown paragraphs and bullet points for readability.`;
    }

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];

    if (Array.isArray(incomingMessages) && incomingMessages.length > 0) {
      for (const m of incomingMessages) {
        if (m.role === 'user' || m.role === 'assistant') {
          messages.push({ role: m.role, content: m.content });
        }
      }
    } else if (userMessage) {
      messages.push({ role: 'user', content: userMessage });
    } else {
      messages.push({ role: 'user', content: "Explain how this AI Living City works and what the agents are currently doing." });
    }

    const completion = await client.chat.completions.create({
      model: 'mercury-2.5',
      messages,
      reasoning_effort: 'high',
      reasoning_summary: true,
      temperature: 0.75,
      max_completion_tokens: 16384
    });

    const content = completion.choices?.[0]?.message?.content;
    let reply = typeof content === 'string' ? content.trim() : null;
    const reasoningTokens = (completion as any).usage?.completion_tokens_details?.reasoning_tokens || 0;

    return NextResponse.json({
      reply: reply || "The AI Living City is operating autonomously with all citizens coordinating through Mercury 2.5 intuition.",
      reasoningTokens
    });
  } catch (error: any) {
    console.error("Inception Mercury Chat API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to connect to Mercury 2.5" },
      { status: 500 }
    );
  }
}
