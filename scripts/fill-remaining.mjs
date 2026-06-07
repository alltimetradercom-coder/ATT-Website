/**
 * Generate content for remaining nodes with retry logic.
 * Handles 429 rate limiting with exponential backoff.
 * Usage: node scripts/fill-remaining.mjs
 */
import ZAI from 'z-ai-web-dev-sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REALM_CTX = {
  12: 'Market Legends - Famous Traders and Market History. Legendary investors like Rakesh Jhunjhunwala, Radhakishan Damani, Warren Buffett, market events, Harshad Mehta scam, historical lessons from Indian and global markets.',
  13: 'Professional Careers - Careers in Finance. SEBI certifications (NISM), career paths, industry roles, professional development in Indian finance industry.',
};

async function generateWithRetry(zai, node, realmId, maxRetries = 5) {
  const ctx = REALM_CTX[realmId] || 'Indian stock market education.';
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const c = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are an expert Indian stock market educator. Respond with valid JSON only, no code fences.' },
          { role: 'user', content: `${ctx}\n\nGenerate content for: ${node.title} (Slug: ${node.slug}, Type: ${node.contentType}, Diff: ${node.difficulty}, XP: ${node.xp}). Use Indian market examples. Return JSON: {content: 300-500 word lesson, tldr: [4 items], cheatsheet: [5 items], mindNote: 1 sentence, lore: 2-3 sentences RPG, storyChapter, keyTakeaways: [3 items], traderTips: [3 items], importantNotes: [2 items], badge, seoTitle: 60 chars, seoDescription: 155 chars}. No emojis.` }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      let raw = c.choices[0]?.message?.content || '';
      if (raw.startsWith('```')) {
        raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      const p = JSON.parse(raw.trim());

      await prisma.node.update({
        where: { nodeId: node.nodeId },
        data: {
          content: p.content, tldr: JSON.stringify(p.tldr), cheatsheet: JSON.stringify(p.cheatsheet),
          mindNote: p.mindNote, lore: p.lore, storyChapter: p.storyChapter,
          keyTakeaways: JSON.stringify(p.keyTakeaways), traderTips: JSON.stringify(p.traderTips),
          importantNotes: JSON.stringify(p.importantNotes), badge: p.badge,
          seoTitle: p.seoTitle, seoDescription: p.seoDescription,
          status: 'published', lastUpdated: new Date().toISOString().split('T')[0]
        }
      });
      return { ok: true };
    } catch (e) {
      const is429 = e.message?.includes('429');
      if (is429 && attempt < maxRetries - 1) {
        const waitMs = Math.min(10000 * Math.pow(2, attempt), 120000); // 10s, 20s, 40s, 80s, 120s max
        console.log(`  Rate limited, waiting ${waitMs/1000}s (attempt ${attempt+1}/${maxRetries})...`);
        await new Promise(r => setTimeout(r, waitMs));
      } else {
        return { ok: false, error: e.message?.substring(0, 100) };
      }
    }
  }
  return { ok: false, error: 'Max retries exceeded' };
}

async function main() {
  console.log('=== Fill Remaining Nodes ===');

  const nodes = await prisma.node.findMany({
    where: { realmId: { in: [12, 13] }, content: { equals: null } },
    orderBy: [{ realmId: 'asc' }, { id: 'asc' }],
    select: { nodeId: true, title: true, slug: true, contentType: true, difficulty: true, xp: true, subRealm: true, realmId: true }
  });

  console.log(`Found ${nodes.length} empty nodes`);

  const zai = await ZAI.create();
  let ok = 0, fail = 0;

  for (const node of nodes) {
    process.stdout.write(`${node.nodeId} ${node.title.substring(0, 40)}... `);
    const result = await generateWithRetry(zai, node, node.realmId);
    if (result.ok) {
      ok++;
      console.log('OK');
    } else {
      fail++;
      console.log('FAILED:', result.error);
    }
    // Base delay between requests
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n=== Complete: ${ok} OK, ${fail} Failed ===`);

  // Final check
  const remaining = await prisma.node.count({ where: { realmId: { in: [12, 13] }, content: { equals: null } } });
  console.log(`Remaining empty nodes: ${remaining}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
