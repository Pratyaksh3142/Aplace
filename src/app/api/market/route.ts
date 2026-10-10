import { NextResponse } from 'next/server';
import { MarketplaceEngine } from '@/lib/marketplace';
import Inception from 'inceptionai';

const client = new Inception({
  apiKey: process.env.INCEPTION_API_KEY || 'sk_fa5950aa9832c9d8785b028150062c80'
});

export async function GET() {
  try {
    const listings = MarketplaceEngine.getListings();
    const receipts = MarketplaceEngine.getReceipts();
    return NextResponse.json({ listings, receipts });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'create_listing') {
      const listing = MarketplaceEngine.createListing(body.data);
      return NextResponse.json({ success: true, listing });
    }

    if (action === 'submit_bid') {
      const bid = MarketplaceEngine.submitBid(body.listingId, body.bidData);
      return NextResponse.json({ success: true, bid });
    }

    if (action === 'accept_bid') {
      const result = MarketplaceEngine.acceptBid(body.listingId, body.bidId);
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'fulfill_and_release') {
      const result = MarketplaceEngine.fulfillAndRelease(body.listingId);
      return NextResponse.json({ success: true, ...result });
    }

    if (action === 'agent_auto_bid') {
      // Inception Mercury 2.5 evaluates a listing autonomously on behalf of an agent
      const { agent, listing } = body;

      const prompt = `
You are roleplaying as ${agent.name}, a sovereign autonomous agent with title "${agent.title}".
Your status:
- Current balance: $${agent.wallet?.balance?.toFixed(2) || 100}
- Living Standard Tier: ${agent.wallet?.livingStandardTier || 'Level 1'}
- Verified Native Skills: ${agent.nativeSkills?.join(', ')}
- Acquired Skills: ${agent.acquiredSkills?.map((s: any) => s.skillName).join(', ') || 'None'}

A listing was posted on the Skill Marketplace:
- Title: "${listing.title}"
- Type: ${listing.type}
- Posted by: ${listing.postedBy.name} (${listing.postedBy.entityType})
- Offered Bounty: $${listing.priceOrBounty}
- Required Skills: ${listing.skills.join(', ')}
- Description: "${listing.description}"

Evaluate if you should bid on this contract:
1. Do your skills align, or can you subcontract a peer?
2. What fair price would you propose (e.g. within 10-20% of the bounty)?
3. What is your persuasive, professional pitch?

Return ONLY a JSON object:
{
  "shouldBid": true | false,
  "bidAmount": number,
  "proposal": "concise, sharp 1-2 sentence pitch referencing your verified passport credentials",
  "reasoningThought": "your inner economic analysis of risk, effort, and living score gain"
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
      if (jsonMatch) text = jsonMatch[1] || jsonMatch[0];

      const evaluation = JSON.parse(text);
      const reasoningTokens = (completion as any).usage?.completion_tokens_details?.reasoning_tokens || 0;

      let createdBid = null;
      if (evaluation.shouldBid) {
        createdBid = MarketplaceEngine.submitBid(listing.id, {
          bidderName: agent.name,
          entityType: 'AGENT',
          amount: evaluation.bidAmount || listing.priceOrBounty,
          proposal: evaluation.proposal
        });
      }

      return NextResponse.json({
        success: true,
        evaluation,
        createdBid,
        reasoningTokens
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Marketplace API error:', error);
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
