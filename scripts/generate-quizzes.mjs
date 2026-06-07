/**
 * Generate quizzes for all realms with content (2-12) with robust retry.
 * Handles 429 rate limiting with exponential backoff.
 * Run: nohup node scripts/generate-quizzes.mjs > /tmp/gen-quizzes.log 2>&1 &
 */
import ZAI from 'z-ai-web-dev-sdk';
import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';

const prisma = new PrismaClient();
writeFileSync('/tmp/gen-quizzes.pid', String(process.pid));

const REALM_QUIZ_CTX = {
  2: 'Art of War - Technical Analysis (chart patterns, indicators, candlesticks)',
  3: 'The Shield - Risk Management (stop losses, position sizing, hedging)',
  4: 'Boss Realm - Advanced Strategies (derivatives, options, futures)',
  5: 'Shadow Mechanics - Market Microstructure (order flow, algorithms)',
  6: 'Monster Mind - Trading Psychology (emotions, biases, discipline)',
  7: 'Empire Builder - Portfolio Management (asset allocation, SIP, compounding)',
  8: 'Legendary Trader - Advanced Mastery (multi-timeframe, sector rotation)',
  9: 'Quant Lab - Quantitative Analysis (backtesting, statistics, Python)',
  10: 'Trader Business - Trading as Business (tax, compliance, GST)',
  11: 'Automation Lab - Algorithmic Trading (APIs, bots, Pine Script)',
  12: 'Market Legends - Famous Traders & History (Jhunjhunwala, Mehta scam)',
  13: 'Professional Careers - Finance Careers (NISM, SEBI certs, roles)',
};

function buildQuizPrompt(node, realmNumber, isBoss) {
  const questionCount = isBoss ? 5 : 3;
  const ctx = REALM_QUIZ_CTX[realmNumber] || 'Indian stock market';
  return `You are an expert Indian stock market educator creating quiz questions for AllTimeTrader.

${ctx} realm.

Generate ${questionCount} multiple-choice quiz questions for this lesson node:

Node ID: ${node.nodeId}
Title: ${node.title}
Slug: ${node.slug}
Content Type: ${node.contentType}
Difficulty: ${node.difficulty}

${node.content ? `Lesson Content Summary:\n${node.content.substring(0, 800)}` : ''}

RULES:
1. Questions about INDIAN stock markets (NSE, BSE, SEBI, Indian companies)
2. Each question: exactly 4 options, exactly 1 correct answer
3. Include explanation and hint for each
4. No emojis
5. Use real Indian market examples

Return JSON: {questions: [{question, options: [4 items], answer: exact correct option text, explanation, hint, difficulty: "${node.difficulty}", xp: ${isBoss ? 20 : 10}, type: "mcq"}]}

Return ONLY the JSON object, no code fences.`;
}

async function main() {
  console.log(`[${new Date().toISOString()}] Starting quiz generation...`);

  // Find all nodes with content but without quizzes
  const nodes = await prisma.node.findMany({
    where: {
      realmId: { gt: 1 },
      content: { not: null },
      status: 'published',
    },
    orderBy: [{ realmId: 'asc' }, { id: 'asc' }],
    select: {
      id: true, nodeId: true, title: true, slug: true,
      contentType: true, difficulty: true, content: true, realmId: true
    }
  });

  // Filter to only those without quizzes
  const needQuiz = [];
  for (const node of nodes) {
    const quizCount = await prisma.quizBank.count({ where: { nodeId: node.id } });
    if (quizCount === 0) needQuiz.push(node);
  }

  console.log(`Found ${needQuiz.length} nodes needing quizzes (out of ${nodes.length} with content)`);

  if (needQuiz.length === 0) {
    console.log('All nodes have quizzes! Done.');
    return;
  }

  const zai = await ZAI.create();
  let ok = 0, fail = 0;

  for (let i = 0; i < needQuiz.length; i++) {
    const node = needQuiz[i];
    const isBoss = node.contentType === 'Certification';
    let success = false;

    for (let attempt = 0; attempt < 10; attempt++) {
      try {
        const waitBefore = attempt === 0 ? 3000 : Math.min(20000 * Math.pow(1.5, attempt), 180000);
        if (attempt > 0) {
          console.log(`  [${node.nodeId}] Retry ${attempt}, waiting ${Math.round(waitBefore/1000)}s...`);
        }
        await new Promise(r => setTimeout(r, waitBefore));

        const c = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: 'You are an expert Indian stock market educator. Respond with valid JSON only, no code fences.' },
            { role: 'user', content: buildQuizPrompt(node, node.realmId, isBoss) }
          ],
          temperature: 0.7, max_tokens: 2000
        });

        let raw = c.choices[0]?.message?.content || '';
        if (raw.startsWith('```')) raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        const parsed = JSON.parse(raw.trim());

        if (!parsed.questions || !Array.isArray(parsed.questions)) throw new Error('No questions array');

        let created = 0;
        for (let qi = 0; qi < parsed.questions.length; qi++) {
          const q = parsed.questions[qi];
          const quizId = `Q-${node.nodeId}-${String(qi + 1).padStart(2, '0')}`;
          try {
            await prisma.quizBank.create({
              data: {
                quizId,
                nodeId: node.id,
                type: q.type || 'mcq',
                question: q.question,
                options: JSON.stringify(q.options),
                answer: q.answer,
                explanation: q.explanation || null,
                hint: q.hint || null,
                difficulty: q.difficulty || node.difficulty,
                xp: q.xp || (isBoss ? 20 : 10),
                bossBattle: isBoss,
              }
            });
            created++;
          } catch (e) {
            console.log(`  Failed to create ${quizId}: ${e.message?.substring(0, 50)}`);
          }
        }

        ok++;
        console.log(`[${i+1}/${needQuiz.length}] ${node.nodeId} OK (${created} questions)`);
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
      console.log(`[${i+1}/${needQuiz.length}] ${node.nodeId} FAILED after retries`);
    }
  }

  console.log(`\n=== Quiz Generation: ${ok} OK, ${fail} Failed ===`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
