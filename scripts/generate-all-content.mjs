/**
 * Batch content generation script for all Skill Tree nodes.
 * Uses z-ai-web-dev-sdk directly (not via HTTP API) to avoid timeout issues.
 * Run: node scripts/generate-all-content.mjs [--realm 2] [--force] [--batch 5]
 */
import ZAI from 'z-ai-web-dev-sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Parse CLI args
const args = process.argv.slice(2);
const realmArg = args.indexOf('--realm');
const targetRealm = realmArg !== -1 ? parseInt(args[realmArg + 1]) : null;
const force = args.includes('--force');
const batchArg = args.indexOf('--batch');
const batchSize = batchArg !== -1 ? parseInt(args[batchArg + 1]) : 50;

// Realm-specific prompt adjustments
function getRealmContext(realmNumber) {
  const contexts = {
    1: 'This is the Genesis (first) realm for absolute beginners in Indian stock markets. Use simple language, basic concepts, and encouraging tone.',
    2: 'This is "Art of War" — technical analysis realm. Focus on chart patterns, indicators, candlesticks, support/resistance with Indian market examples.',
    3: 'This is "The Shield" — risk management realm. Focus on stop losses, position sizing, portfolio protection, hedging strategies for Indian traders.',
    4: 'This is "Boss Realm" — advanced trading strategies. Focus on complex strategies, derivatives, options, futures for experienced Indian traders.',
    5: 'This is "Shadow Mechanics" — market microstructure. Focus on how markets work behind the scenes, order flow, market makers, algorithms.',
    6: 'This is "Monster Mind" — trading psychology. Focus on emotional control, cognitive biases, discipline, mindset of successful traders.',
    7: 'This is "Empire Builder" — portfolio management & wealth building. Focus on asset allocation, diversification, long-term compounding for Indian investors.',
    8: 'This is "Legendary Trader" — advanced mastery. Focus on expert-level techniques, market wisdom, legendary trader stories and lessons.',
    9: 'This is "Quant Lab" — quantitative analysis. Focus on data-driven trading, backtesting, statistical methods, systematic approaches.',
    10: 'This is "Trader Business" — trading as a business. Focus on tax, compliance, record-keeping, business planning for full-time Indian traders.',
    11: 'This is "Automation Lab" — algorithmic trading. Focus on trading systems, APIs, automation tools, building trading bots for Indian markets.',
    12: 'This is "Market Legends" — famous traders & market history. Focus on legendary investors, market events, historical lessons from Indian and global markets.',
    13: 'This is "Professional Careers" — careers in finance. Focus on SEBI certifications, career paths, industry roles, professional development in Indian finance.',
  };
  return contexts[realmNumber] || 'General Indian stock market education.';
}

function buildPrompt(node, realmNumber) {
  return `You are an expert Indian stock market educator creating content for a gamified trading learning platform called AllTimeTrader (ATT).

${getRealmContext(realmNumber)}

Generate rich, detailed educational content for this lesson node:

Node ID: ${node.nodeId}
Title: ${node.title}
Topic Slug: ${node.slug}
Content Type: ${node.contentType}
Difficulty: ${node.difficulty}
XP Value: ${node.xp}
Sub-Realm: ${node.subRealm || 'General'}

IMPORTANT RULES:
1. Content must be about INDIAN stock markets (NSE, BSE, SEBI, Indian companies, INR currency)
2. Match the difficulty level — ${node.difficulty} level content
3. Include real Indian examples (Reliance, TCS, Infosys, HDFC, Wipro, etc.)
4. Be accurate and educational — this is for real learners
5. Make it engaging with an RPG/adventure flavor where appropriate
6. DO NOT use any emoji characters in your output

Return a JSON object with EXACTLY these fields:
{
  "content": "Full lesson content in plain text (300-500 words). Write in clear paragraphs. Cover the topic comprehensively. Include real examples and analogies. Do NOT use markdown headers or bold - just plain text with clear paragraph breaks.",
  "tldr": ["Bullet 1", "Bullet 2", "Bullet 3", "Bullet 4"],
  "cheatsheet": ["Quick fact 1", "Quick fact 2", "Quick fact 3", "Quick fact 4", "Quick fact 5"],
  "mindNote": "One memorable sentence of wisdom about this topic",
  "lore": "2-3 sentences of RPG-style story flavor connecting this lesson to the trading adventure",
  "storyChapter": "Chapter name like 'Chapter 1: The Arena Awakens'",
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
  "traderTips": ["Tip 1", "Tip 2", "Tip 3"],
  "importantNotes": ["Note 1", "Note 2"],
  "badge": "Badge name for completing this node (creative, themed to the realm)",
  "seoTitle": "SEO-optimized page title (60 chars max)",
  "seoDescription": "SEO meta description (155 chars max)"
}

Return ONLY the JSON object, no markdown code fences, no extra text.`;
}

async function generateForNode(zai, node, realmNumber) {
  const completion = await zai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are an expert Indian stock market educator. You always respond with valid JSON only. No markdown, no code fences, just the raw JSON object.',
      },
      {
        role: 'user',
        content: buildPrompt(node, realmNumber),
      },
    ],
    temperature: 0.7,
    max_tokens: 3000,
  });

  const rawContent = completion.choices[0]?.message?.content;
  if (!rawContent) throw new Error('Empty LLM response');

  let parsed;
  try {
    let clean = rawContent.trim();
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    parsed = JSON.parse(clean);
  } catch {
    throw new Error('JSON parse failed: ' + rawContent.substring(0, 200));
  }

  await prisma.node.update({
    where: { nodeId: node.nodeId },
    data: {
      content: parsed.content || null,
      tldr: Array.isArray(parsed.tldr) ? JSON.stringify(parsed.tldr) : null,
      cheatsheet: Array.isArray(parsed.cheatsheet) ? JSON.stringify(parsed.cheatsheet) : null,
      mindNote: parsed.mindNote || null,
      lore: parsed.lore || null,
      storyChapter: parsed.storyChapter || null,
      keyTakeaways: Array.isArray(parsed.keyTakeaways) ? JSON.stringify(parsed.keyTakeaways) : null,
      traderTips: Array.isArray(parsed.traderTips) ? JSON.stringify(parsed.traderTips) : null,
      importantNotes: Array.isArray(parsed.importantNotes) ? JSON.stringify(parsed.importantNotes) : null,
      badge: parsed.badge || null,
      seoTitle: parsed.seoTitle || null,
      seoDescription: parsed.seoDescription || null,
      status: 'published',
      lastUpdated: new Date().toISOString().split('T')[0],
    },
  });

  return parsed.content?.length || 0;
}

async function main() {
  console.log('=== ATT Content Generator ===');
  console.log(`Target Realm: ${targetRealm || 'ALL'}`);
  console.log(`Force: ${force}`);
  console.log(`Batch Size: ${batchSize}`);

  const where = {
    realmId: targetRealm ? { equals: targetRealm } : { gt: 1 },
    ...(force ? {} : { content: { equals: null } }),
  };

  const nodes = await prisma.node.findMany({
    where,
    orderBy: [{ realmId: 'asc' }, { id: 'asc' }],
    select: {
      nodeId: true,
      title: true,
      slug: true,
      contentType: true,
      difficulty: true,
      xp: true,
      subRealm: true,
      realmId: true,
    },
  });

  // Get realm info for context
  const realms = await prisma.realm.findMany({
    select: { id: true, realmNumber: true, title: true },
  });
  const realmMap = new Map(realms.map(r => [r.id, r]));

  console.log(`Found ${nodes.length} nodes to generate content for\n`);

  if (nodes.length === 0) {
    console.log('No nodes need content generation. Done!');
    return;
  }

  const zai = await ZAI.create();
  let success = 0;
  let failed = 0;
  const limit = Math.min(nodes.length, batchSize);

  for (let i = 0; i < limit; i++) {
    const node = nodes[i];
    const realm = realmMap.get(node.realmId);
    const prefix = `[${i + 1}/${limit}] R${realm?.realmNumber || '?'}-${node.nodeId}`;

    try {
      process.stdout.write(`${prefix} ${node.title}... `);
      const contentLen = await generateForNode(zai, node, realm?.realmNumber || 1);
      success++;
      console.log(`OK (${contentLen} chars)`);

      // Small delay to avoid rate limits
      if (i < limit - 1) {
        await new Promise(r => setTimeout(r, 300));
      }
    } catch (err) {
      failed++;
      console.log(`FAILED: ${err.message}`);
    }
  }

  console.log(`\n=== Generation Complete ===`);
  console.log(`Success: ${success}/${limit}`);
  console.log(`Failed: ${failed}/${limit}`);
  if (limit < nodes.length) {
    console.log(`Remaining: ${nodes.length - limit} (run again with --batch ${nodes.length - limit + success} or without --batch limit)`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
