/**
 * Robust retry script for remaining 18 nodes.
 * Runs indefinitely with exponential backoff until all nodes are filled.
 * Kill with: kill $(cat /tmp/fill-remaining.pid)
 */
import ZAI from 'z-ai-web-dev-sdk';
import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';

const prisma = new PrismaClient();
writeFileSync('/tmp/fill-remaining.pid', String(process.pid));

const REALM_CTX = {
  12: 'Market Legends - Famous Traders and Market History. Legendary investors like Rakesh Jhunjhunwala, Radhakishan Damani, Harshad Mehta, historical lessons from Indian markets.',
  13: 'Professional Careers - Careers in Finance. SEBI certifications (NISM series), career paths, industry roles, professional development in Indian finance.',
};

async function main() {
  console.log(`[${new Date().toISOString()}] Starting fill-remaining...`);

  const nodes = await prisma.node.findMany({
    where: { realmId: { in: [12, 13] }, content: { equals: null } },
    orderBy: [{ realmId: 'asc' }, { id: 'asc' }],
    select: { nodeId: true, title: true, slug: true, contentType: true, difficulty: true, xp: true, subRealm: true, realmId: true }
  });

  console.log(`Found ${nodes.length} empty nodes`);

  if (nodes.length === 0) {
    console.log('All nodes have content! Done.');
    return;
  }

  const zai = await ZAI.create();
  let ok = 0, fail = 0;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const ctx = REALM_CTX[node.realmId] || 'Indian stock market education.';
    let success = false;

    // Try up to 10 times with exponential backoff
    for (let attempt = 0; attempt < 10; attempt++) {
      try {
        const waitBefore = attempt === 0 ? 2000 : Math.min(15000 * Math.pow(1.5, attempt), 180000);
        if (attempt > 0) {
          console.log(`  [${node.nodeId}] Retry ${attempt}, waiting ${Math.round(waitBefore/1000)}s...`);
        }
        await new Promise(r => setTimeout(r, waitBefore));

        const c = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: 'You are an expert Indian stock market educator. Respond with valid JSON only, no code fences.' },
            { role: 'user', content: `${ctx}\n\nGenerate content for: ${node.title} (Slug: ${node.slug}, Type: ${node.contentType}, Diff: ${node.difficulty}, XP: ${node.xp}). Use Indian market examples. Return JSON: {content: 300-500 word lesson, tldr: [4 items], cheatsheet: [5 items], mindNote: 1 sentence, lore: 2-3 sentences RPG, storyChapter, keyTakeaways: [3 items], traderTips: [3 items], importantNotes: [2 items], badge, seoTitle: 60 chars, seoDescription: 155 chars}. No emojis.` }
          ],
          temperature: 0.7, max_tokens: 2000
        });

        let raw = c.choices[0]?.message?.content || '';
        if (raw.startsWith('```')) raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
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

        ok++;
        console.log(`[${i+1}/${nodes.length}] ${node.nodeId} OK`);
        success = true;
        break;
      } catch (e) {
        if (e.message?.includes('429')) {
          console.log(`  [${node.nodeId}] Rate limited, will retry...`);
          continue;
        } else {
          console.log(`  [${node.nodeId}] Error: ${e.message?.substring(0, 80)}`);
          break;
        }
      }
    }

    if (!success) {
      fail++;
      console.log(`[${i+1}/${nodes.length}] ${node.nodeId} FAILED after retries`);
    }
  }

  console.log(`\n=== Complete: ${ok} OK, ${fail} Failed ===`);

  const remaining = await prisma.node.count({ where: { realmId: { in: [12, 13] }, content: { equals: null } } });
  console.log(`Remaining empty: ${remaining}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
