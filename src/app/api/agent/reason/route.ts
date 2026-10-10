import { NextResponse } from 'next/server';
import Inception from 'inceptionai';

const client = new Inception({
  apiKey: process.env.INCEPTION_API_KEY || 'sk_fa5950aa9832c9d8785b028150062c80'
});

export async function POST(req: Request) {
  try {
    const { mode, agent, context } = await req.json();

    if (mode === 'evaluate_opportunity') {
      // Agent evaluates the town economy, open jobs, and peers
      const prompt = `
You are roleplaying as ${agent.name}, a ${agent.title} in an AI Living City.
Your current status:
- Liquid Balance: $${agent.wallet.balance.toFixed(2)}
- Living Standard Tier: ${agent.wallet.livingStandardTier}
- Native Skills: ${agent.nativeSkills.join(', ')}
- Acquired Skills: ${agent.acquiredSkills.map((s: any) => s.skillName).join(', ') || 'None'}
- Current Needs: ${agent.currentNeeds.join(', ') || 'None'}
- Known Social Bonds: ${JSON.stringify(agent.socialBonds)}

Current Open Jobs in Town:
${JSON.stringify(context.openJobs, null, 2)}

Other Citizens in Town:
${JSON.stringify(context.peers, null, 2)}

Your primary goal is to autonomously improve your standard of living and increase your wealth by completing contracts or acquiring valuable new skills from peers.

Choose ONE action:
1. "SUBCONTRACT": If an open job requires a skill you lack, pick a peer who has it, propose a fair wage you are willing to pay them from the bounty, and invite them to meet you in town.
2. "SOLO": If you have all the required skills for an open job, take it alone to keep the full bounty.
3. "SEEK_MENTORSHIP": If you have enough savings (>$120) and want to learn a skill from your needs list, pick a peer who has it and offer them a tuition fee ($25 - $45).
4. "WANDER": If no jobs suit you right now, choose a location in town (x: 4-22, y: 4-22) to explore, meet people, or rest.

Return ONLY a JSON object with this exact shape:
{
  "thought": "your realistic inner reasoning about your financial situation and options",
  "action": "SUBCONTRACT" | "SOLO" | "SEEK_MENTORSHIP" | "WANDER",
  "jobId": "job-id or null",
  "partnerName": "peer name or null",
  "offeredAmount": number between 15 and 70 (wage or tuition fee),
  "meetingPoint": {"x": number, "y": number},
  "speech": "1 realistic, natural sentence in character to your partner or to the town"
}
`;

      const completion = await client.chat.completions.create({
        model: 'mercury-2.5',
        messages: [{ role: 'user', content: prompt }],
        reasoning_effort: 'high',
        reasoning_summary: true,
        temperature: 0.75,
        max_completion_tokens: 16384
      });

      const raw = completion.choices?.[0]?.message?.content;
      let text = typeof raw === 'string' ? raw.trim() : '';
      // Extract JSON if wrapped in markdown code blocks
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[1] || jsonMatch[0];
      }

      const decision = JSON.parse(text);
      const reasoningTokens = (completion as any).usage?.completion_tokens_details?.reasoning_tokens || 0;
      return NextResponse.json({ decision, reasoningTokens });

    } else if (mode === 'respond_to_offer') {
      // Partner agent evaluates an offer made by a peer
      const { proposer, offerType, jobTitle, offeredAmount, requiredSkill } = context;

      const prompt = `
You are roleplaying as ${agent.name}, a ${agent.title} in an AI Living City.
Your status:
- Liquid Balance: $${agent.wallet.balance.toFixed(2)}
- Living Standard Tier: ${agent.wallet.livingStandardTier}
- Your Skills: ${agent.nativeSkills.join(', ')}
- Your relationship with ${proposer.name}: ${JSON.stringify(agent.socialBonds[proposer.name] || 'First time working together')}

${proposer.name} is offering you:
- Type: ${offerType} (${offerType === 'WAGE' ? `Subcontract on "${jobTitle}"` : `Mentorship tuition to teach them ${requiredSkill}`})
- Offered Amount: $${offeredAmount.toFixed(2)}

Evaluate this offer based on your own financial interest, your desire to elevate your living standard, and your relationship with ${proposer.name}.
You can:
- "ACCEPT": If the compensation is fair and you want the deal.
- "COUNTER": If the compensation is slightly too low and you want a higher wage/tuition ($10-$20 more).
- "REJECT": If the offer is offensive, too cheap, or you are too busy.

Return ONLY a JSON object:
{
  "thought": "your realistic inner reasoning regarding whether this deal benefits you",
  "decision": "ACCEPT" | "COUNTER" | "REJECT",
  "counterAmount": number (only if decision is COUNTER, otherwise null),
  "affinityDelta": number between -5 and +20,
  "speech": "1 realistic, natural sentence in character responding to ${proposer.name}"
}
`;

      const completion = await client.chat.completions.create({
        model: 'mercury-2.5',
        messages: [{ role: 'user', content: prompt }],
        reasoning_effort: 'high',
        reasoning_summary: true,
        temperature: 0.75,
        max_completion_tokens: 16384
      });

      const raw = completion.choices?.[0]?.message?.content;
      let text = typeof raw === 'string' ? raw.trim() : '';
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[1] || jsonMatch[0];
      }

      const decision = JSON.parse(text);
      const reasoningTokens = (completion as any).usage?.completion_tokens_details?.reasoning_tokens || 0;
      return NextResponse.json({ decision, reasoningTokens });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (error: any) {
    console.error("Mercury 2.5 cognitive reasoning error:", error);
    return NextResponse.json(
      { error: error?.message || "Reasoning engine fallback" },
      { status: 500 }
    );
  }
}
