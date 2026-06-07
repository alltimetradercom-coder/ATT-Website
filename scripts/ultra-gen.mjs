/**
 * Ultra-robust content + quiz generator for remaining nodes.
 * Runs forever with long backoff (5 min base) until rate limit clears.
 * Process 1 node at a time.
 */
import ZAI from 'z-ai-web-dev-sdk';
import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';

const prisma = new PrismaClient();
writeFileSync('/tmp/ultra-gen.pid', String(process.pid));

const REALM_CTX = {
  12: 'Market Legends - Famous Traders and Market History. Rakesh Jhunjhunwala, Harshad Mehta, historical lessons.',
  13: 'Professional Careers - Careers in Finance. SEBI certifications (NISM), career paths, industry roles in Indian finance.',
};

const REALM_QUIZ_CTX = {
  2: 'Art of War - Technical Analysis', 3: 'The Shield - Risk Management',
  4: 'Boss Realm - Advanced Strategies', 5: 'Shadow Mechanics - Market Microstructure',
  6: 'Monster Mind - Trading Psychology', 7: 'Empire Builder - Portfolio Management',
  8: 'Legendary Trader - Advanced Mastery', 9: 'Quant Lab - Quantitative Analysis',
  10: 'Trader Business - Trading as Business', 11: 'Automation Lab - Algorithmic Trading',
  12: 'Market Legends - Famous Traders', 13: 'Professional Careers - Finance Careers',
};

async function generateContent(zai, node) {
  const ctx = REALM_CTX[node.realmId] || 'Indian stock market education.';
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
  return true;
}

async function generateQuiz(zai, node) {
  const isBoss = node.contentType === 'Certification';
  const qCount = isBoss ? 5 : 3;
  const ctx = REALM_QUIZ_CTX[node.realmId] || 'Indian stock market';
  const c = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are an expert Indian stock market educator. Respond with valid JSON only, no code fences.' },
      { role: 'user', content: `${ctx} realm. Generate ${qCount} MCQ questions for: ${node.title} (Slug: ${node.slug}, Diff: ${node.difficulty}). Indian market context. Return JSON: {questions: [{question, options: [4 items], answer: exact text, explanation, hint, difficulty: "${node.difficulty}", xp: ${isBoss ? 20 : 10}, type: "mcq"}]}. No emojis.` }
    ],
    temperature: 0.7, max_tokens: 2000
  });
  let raw = c.choices[0]?.message?.content || '';
  if (raw.startsWith('```')) raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  const parsed = JSON.parse(raw.trim());
  if (!parsed.questions) throw new Error('No questions');
  let created = 0;
  for (let i = 0; i < parsed.questions.length; i++) {
    const q = parsed.questions[i];
    const quizId = `Q-${node.nodeId}-${String(i + 1).padStart(2, '0')}`;
    try {
      await prisma.quizBank.create({
        data: {
          quizId, nodeId: node.id, type: q.type || 'mcq', question: q.question,
          options: JSON.stringify(q.options), answer: q.answer,
          explanation: q.explanation || null, hint: q.hint || null,
          difficulty: q.difficulty || node.difficulty, xp: q.xp || (isBoss ? 20 : 10),
          bossBattle: isBoss,
        }
      });
      created++;
    } catch (e) { /* skip duplicate */ }
  }
  return created;
}

async function main() {
  console.log(`[${new Date().toISOString()}] Ultra-gen starting...`);
  const zai = await ZAI.create();

  // PHASE 1: Fill remaining content (Realms 12, 13)
  const emptyNodes = await prisma.node.findMany({
    where: { realmId: { in: [12, 13] }, content: { equals: null } },
    orderBy: [{ realmId: 'asc' }, { id: 'asc' }],
    select: { id: true, nodeId: true, title: true, slug: true, contentType: true, difficulty: true, xp: true, realmId: true }
  });
  console.log(`Phase 1: ${emptyNodes.length} nodes need content`);

  for (const node of emptyNodes) {
    let done = false;
    for (let attempt = 0; attempt < 15 && !done; attempt++) {
      try {
        const wait = attempt === 0 ? 5000 : Math.min(30000 * Math.pow(1.5, attempt), 300000);
        if (attempt > 0) console.log(`  ${node.nodeId} retry ${attempt}, wait ${Math.round(wait/1000)}s`);
        await new Promise(r => setTimeout(r, wait));
        await generateContent(zai, node);
        console.log(`[CONTENT] ${node.nodeId} OK`);
        done = true;
      } catch (e) {
        if (e.message?.includes('429')) { console.log(`  ${node.nodeId} rate limited`); }
        else { console.log(`  ${node.nodeId} error: ${e.message?.substring(0,60)}`); done = true; }
      }
    }
    if (!done) console.log(`[CONTENT] ${node.nodeId} FAILED`);
  }

  // PHASE 2: Generate quizzes for all realms 2-13 that have content but no quiz
  const nodesWithContent = await prisma.node.findMany({
    where: { realmId: { gt: 1 }, content: { not: null }, status: 'published' },
    orderBy: [{ realmId: 'asc' }, { id: 'asc' }],
    select: { id: true, nodeId: true, title: true, slug: true, contentType: true, difficulty: true, realmId: true }
  });

  const needQuiz = [];
  for (const node of nodesWithContent) {
    const count = await prisma.quizBank.count({ where: { nodeId: node.id } });
    if (count === 0) needQuiz.push(node);
  }
  console.log(`\nPhase 2: ${needQuiz.length} nodes need quizzes`);

  for (const node of needQuiz) {
    let done = false;
    for (let attempt = 0; attempt < 15 && !done; attempt++) {
      try {
        const wait = attempt === 0 ? 3000 : Math.min(30000 * Math.pow(1.5, attempt), 300000);
        if (attempt > 0) console.log(`  ${node.nodeId} quiz retry ${attempt}, wait ${Math.round(wait/1000)}s`);
        await new Promise(r => setTimeout(r, wait));
        const count = await generateQuiz(zai, node);
        console.log(`[QUIZ] ${node.nodeId} OK (${count} questions)`);
        done = true;
      } catch (e) {
        if (e.message?.includes('429')) { console.log(`  ${node.nodeId} rate limited`); }
        else { console.log(`  ${node.nodeId} quiz error: ${e.message?.substring(0,60)}`); done = true; }
      }
    }
    if (!done) console.log(`[QUIZ] ${node.nodeId} FAILED`);
  }

  console.log(`\n[${new Date().toISOString()}] All done!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
