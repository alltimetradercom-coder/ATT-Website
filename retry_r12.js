const { PrismaClient } = require('@prisma/client');
const ZAI = require('z-ai-web-dev-sdk').default;
const prisma = new PrismaClient();
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('Waiting 60s for rate limit reset...');
  await sleep(60000);
  console.log('Starting processing...');
  
  const nodes = await prisma.node.findMany({
    where: { realmId: 12, content: { equals: null } },
    orderBy: { id: 'asc' },
    select: { nodeId: true, title: true, slug: true, contentType: true, difficulty: true, xp: true }
  });
  console.log('Remaining:', nodes.length);
  
  const zai = await ZAI.create();
  let ok = 0;
  
  for (const node of nodes) {
    let success = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        process.stdout.write(node.nodeId + ' attempt ' + (attempt+1) + '... ');
        const c = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: 'You are an expert Indian stock market educator. Respond with valid JSON only, no code fences.' },
            { role: 'user', content: 'Market Legends - Famous Traders and Market History realm. Legendary investors like Rakesh Jhunjhunwala, Radhakishan Damani, Warren Buffett, market events, Harshad Mehta scam, historical lessons from Indian and global markets.\n\nGenerate content for: ' + node.title + ' (Slug: ' + node.slug + ', Type: ' + node.contentType + ', Diff: ' + node.difficulty + ', XP: ' + node.xp + '). Use Indian market examples and real stories. Return JSON: {content: 300-500 word lesson, tldr: [4 items], cheatsheet: [5 items], mindNote: 1 sentence, lore: 2-3 sentences RPG, storyChapter, keyTakeaways: [3 items], traderTips: [3 items], importantNotes: [2 items], badge, seoTitle: 60 chars, seoDescription: 155 chars}. No emojis.' }
          ],
          temperature: 0.7, max_tokens: 2000
        });
        let raw = c.choices[0]?.message?.content || '';
        if (raw.startsWith('```')) raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        const p = JSON.parse(raw.trim());
        await prisma.node.update({
          where: { nodeId: node.nodeId },
          data: { content: p.content, tldr: JSON.stringify(p.tldr), cheatsheet: JSON.stringify(p.cheatsheet), mindNote: p.mindNote, lore: p.lore, storyChapter: p.storyChapter, keyTakeaways: JSON.stringify(p.keyTakeaways), traderTips: JSON.stringify(p.traderTips), importantNotes: JSON.stringify(p.importantNotes), badge: p.badge, seoTitle: p.seoTitle, seoDescription: p.seoDescription, status: 'published', lastUpdated: new Date().toISOString().split('T')[0] }
        });
        console.log('OK');
        ok++;
        success = true;
        break;
      } catch(e) {
        console.log('FAIL:', e.message.substring(0,60));
        if (attempt < 2) {
          console.log('Waiting 30s before retry...');
          await sleep(30000);
        }
      }
    }
    if (!success) console.log('SKIPPED:', node.nodeId);
    await sleep(2000);
  }
  
  console.log('Total OK:', ok);
  const remaining = await prisma.node.count({ where: { realmId: 12, content: { equals: null } } });
  console.log('Still empty:', remaining);
}

main().catch(console.error).finally(() => prisma.$disconnect());
