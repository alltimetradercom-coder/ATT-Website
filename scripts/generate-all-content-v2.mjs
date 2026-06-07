/**
 * Comprehensive Content + Quiz Generator for AllTimeTrader Skill Tree
 * Generates content for ALL remaining nodes (Realms 2-13) and quizzes
 * Uses z-ai-web-dev-sdk with robust retry logic
 */
import ZAI from 'z-ai-web-dev-sdk';
import { PrismaClient } from '@prisma/client';
import { writeFileSync, appendFileSync } from 'fs';

const prisma = new PrismaClient();
const LOG_FILE = '/home/z/my-project/download/content-gen-log.txt';

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  try { appendFileSync(LOG_FILE, line + '\n'); } catch(e) {}
}

// Realm context for better AI content generation
const REALM_CONTEXT = {
  2: { name: 'Art of War', topic: 'Technical Analysis', desc: 'Candlestick patterns, price action, support-resistance, trendlines, technical indicators (RSI, MACD, Bollinger Bands, VWAP, Fibonacci, Ichimoku), chart patterns (Head & Shoulders, double top/bottom, flags, pennants, triangles), volume analysis, open interest, Heikin Ashi, Renko, divergence, pivot points, gap analysis. Indian market examples: Nifty 50, BankNifty, Reliance, TCS, HDFC Bank charts.' },
  3: { name: 'The Shield', topic: 'Fundamental Analysis', desc: 'Balance sheets, income statements, cash flow, financial ratios (P/E, P/B, ROE, ROCE, Debt/Equity), sector analysis (IT, Banking, Pharma, Auto, FMCG), economic moats, intrinsic value (DCF), dividend analysis, management quality, annual reports, macro economics, RBI policy, Screener.in usage. Indian companies: Infosys, ITC, Asian Paints, Hindustan Unilever.' },
  4: { name: 'Boss Realm', topic: 'Derivatives & Options', desc: 'Futures contracts, margin trading, lot size, options (calls, puts, premium), moneyness (ITM, ATM, OTM), Greeks (Delta, Gamma, Theta, Vega), option chain reading, open interest, PCR, option strategies (Bull Call Spread, Bear Put Spread, Iron Condor, Straddle, Strangle, Covered Call, Butterfly, Ratio Spreads), Black-Scholes, implied volatility, VIX, hedging, SEBI F&O rules, weekly vs monthly expiry, max pain theory. Indian context: Nifty options, BankNifty weekly expiry.' },
  5: { name: 'Shadow Mechanics', topic: 'Market Microstructure', desc: 'Order book anatomy, bid-ask spread dynamics, market depth, order flow analysis, time & sales, algorithmic trading, HFT, market making, dark pools, iceberg orders, TWAP/VWAP execution, slippage, pre/post market, opening range breakout, institutional order flow, smart money concepts, order block theory, fair value gaps, liquidity sweeps. Indian market microstructure specifics.' },
  6: { name: 'Monster Mind', topic: 'Trading Psychology & Risk Management', desc: 'Trading psychology, fear & greed cycle, FOMO, revenge trading, overtrading, position sizing (1-2% rule), risk-reward ratio, stop loss strategies, trailing stops, trading journal, mindfulness for traders, cognitive biases (confirmation bias, loss aversion, sunk cost, gambler fallacy), building a trading plan, daily routine, handling drawdowns, emotional regulation. Indian trader psychology examples.' },
  7: { name: 'Empire Builder', topic: 'Portfolio & Wealth Building', desc: 'Wealth building, compounding, asset allocation, SIP, mutual funds, index funds, ETFs, market cap categories (large, mid, small cap), dividend investing, growth vs value, portfolio rebalancing, tax saving (80C, ELSS), capital gains tax (LTCG, STCG), PPF, NPS, gold investment, real estate, international diversification, retirement planning, emergency fund, insurance, inflation-proofing, behavioral finance, rupee cost averaging, core & satellite strategy. Indian tax laws and investment options.' },
  8: { name: 'Legendary Trader', topic: 'Advanced Trading Mastery', desc: 'Multi-timeframe confluence, top-down analysis, reading the tape, scalping, swing trading, position trading, intraday framework, event-based trading, earnings season strategies, budget/policy impact trading, correlation trading, relative strength, sector rotation, market breadth, advance-decline analysis, trading the news, pre-market preparation, end-of-day analysis, journal review system. Advanced Indian market strategies.' },
  9: { name: 'Quant Lab', topic: 'Statistics & Quantitative Analysis', desc: 'Statistics for traders, probability & expected value, normal distribution, standard deviation, correlation vs causation, backtesting, walk-forward analysis, Monte Carlo simulation, Sharpe & Sortino ratios, maximum drawdown, win rate vs risk-reward, Kelly criterion, mean reversion, trend following systems, statistical significance, overfitting, regime detection, machine learning intro, data cleaning. Applied to NSE/BSE data.' },
  10: { name: 'Trader Business', topic: 'Trading Operations & Business', desc: 'Trading as a business, P&L tracking, tax audit for traders, ITR-3 filing, business vs speculative income classification, compliance & record keeping, scaling trading operations, building a trading desk, risk management framework, trading team structure, outsourcing analysis, subscription models, creating trading courses, legal structure for traders. Indian tax laws for traders, SEBI compliance.' },
  11: { name: 'Automation Lab', topic: 'APIs, Bots & Trading Tools', desc: 'Pine Script basics through advanced, custom indicators, strategy builder, alerts & automation, TradingView webhooks, Python for traders setup, fetching market data, technical analysis in Python, backtesting with Zipline, option chain analysis, Dhan API, Angel One API, Zerodha Kite API, trading bot development, paper trading, Power BI, Excel for trading, dashboard building, Chrome extensions, web scraping, Telegram/Discord bots, automated journal logging, CI/CD for trading systems, monitoring & alerts. Indian broker APIs.' },
  12: { name: 'Market Legends', topic: 'Market History & Case Studies', desc: 'Harshad Mehta scam, Ketan Parekh K-10 scam, dot-com bubble 2000, 2008 financial crisis, COVID crash 2020, GameStop short squeeze, LTCM failure, flash crashes in India, Satyam scandal, circuit breaker history, famous Indian traders (Rakesh Jhunjhunwala, Radhakishan Damani, Ramdeo Agarwal, Nikhil Kamath), global market crashes timeline, pump & dump schemes, insider trading cases in India, regulatory evolution (SEBI history). Indian market history focus.' },
  13: { name: 'Professional Careers', topic: 'Finance Career Paths', desc: 'Prop trading firms in India, hedge fund career path, research analyst role, dealer terminal operations, NISM certifications (Series I, V, VII, VIII), CFA path for Indian markets, portfolio management career, institutional trading workflow, Bloomberg Terminal, trading desk operations, risk manager career, compliance officer role, algorithmic trading jobs, freelance trading education. Indian finance industry careers.' },
};

// Delay helper
const delay = ms => new Promise(r => setTimeout(r, ms));

// Clean AI response - strip code fences
function cleanResponse(raw) {
  let s = raw.trim();
  if (s.startsWith('```')) {
    s = s.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return s.trim();
}

// ============================================================
// PHASE 1: Generate Content
// ============================================================
async function generateContent(zai, node, realmCtx) {
  const isBoss = node.contentType === 'Certification';
  const isCaseStudy = node.contentType === 'CaseStudy';
  const isTool = node.contentType === 'Tool';
  const isChecklist = node.contentType === 'Checklist';

  let systemPrompt = `You are an expert Indian stock market educator creating content for a gamified trading learning platform called AllTimeTrader. Write in an engaging, conversational style with practical Indian market examples. Use NSE/BSE/Nifty/BankNifty/Reliance/TCS/HDFC etc. as examples. Respond with valid JSON only, no code fences, no markdown.`;

  let userPrompt = `Realm: ${realmCtx.name} (${realmCtx.topic})
Context: ${realmCtx.desc}

Generate content for: "${node.title}" (Slug: ${node.slug}, Type: ${node.contentType}, Difficulty: ${node.difficulty}, XP: ${node.xp})

Return a JSON object with these exact fields:
{
  "content": "${isBoss ? 'A comprehensive final exam review covering all topics in this realm. 400-600 words.' : isCaseStudy ? 'A detailed real-world case study with data, timeline, and lessons. 400-600 words.' : isTool ? 'A practical guide on using this tool with step-by-step instructions. 300-500 words.' : isChecklist ? 'A detailed checklist with explanations for each item. 300-500 words.' : 'A comprehensive lesson with clear explanations and Indian market examples. 300-500 words.'}",
  "tldr": ["4 concise bullet points summarizing the key points"],
  "cheatsheet": ["5 quick-reference items for revision"],
  "mindNote": "One sentence of printable wisdom that captures the essence",
  "lore": "${isBoss ? 'Epic boss battle narrative. 3-4 sentences.' : '2-3 sentence RPG-style narrative connecting this topic to the realm theme.'}",
  "storyChapter": "A 1-2 sentence story progression for this node",
  "keyTakeaways": ["3 essential takeaways"],
  "traderTips": ["3 practical tips for Indian market traders"],
  "importantNotes": ["2 important warnings or edge cases"],
  "seoTitle": "SEO title under 60 characters",
  "seoDescription": "SEO meta description under 155 characters"
}

Do NOT use emojis. Write plain text only. Return ONLY the JSON object.`;

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 2500
  });

  let raw = completion.choices[0]?.message?.content || '';
  raw = cleanResponse(raw);
  const parsed = JSON.parse(raw);

  // Update the node with generated content
  await prisma.node.update({
    where: { nodeId: node.nodeId },
    data: {
      content: parsed.content,
      tldr: JSON.stringify(parsed.tldr),
      cheatsheet: JSON.stringify(parsed.cheatsheet),
      mindNote: parsed.mindNote,
      lore: parsed.lore,
      storyChapter: parsed.storyChapter,
      keyTakeaways: JSON.stringify(parsed.keyTakeaways),
      traderTips: JSON.stringify(parsed.traderTips),
      importantNotes: JSON.stringify(parsed.importantNotes),
      seoTitle: parsed.seoTitle,
      seoDescription: parsed.seoDescription,
      status: 'published',
      lastUpdated: new Date().toISOString().split('T')[0]
    }
  });

  return true;
}

// ============================================================
// PHASE 2: Generate Quiz
// ============================================================
async function generateQuiz(zai, node, realmCtx) {
  const isBoss = node.contentType === 'Certification';
  const qCount = isBoss ? 5 : 3;

  const systemPrompt = `You are an expert Indian stock market educator creating quiz questions for a gamified learning platform. Use Indian market context (NSE, BSE, Nifty, Indian companies). Respond with valid JSON only, no code fences, no markdown.`;

  const userPrompt = `Realm: ${realmCtx.name} (${realmCtx.topic})
Topic: "${node.title}" (Slug: ${node.slug}, Difficulty: ${node.difficulty})

Generate ${qCount} multiple-choice questions. Each question must have exactly 4 options with one correct answer.

Return JSON:
{
  "questions": [
    {
      "question": "Clear, specific question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Exact text of the correct option",
      "explanation": "1-2 sentence explanation of why this is correct",
      "hint": "A helpful hint without giving away the answer"
    }
  ]
}

Do NOT use emojis. Use Indian market examples. Return ONLY the JSON object.`;

  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });

  let raw = completion.choices[0]?.message?.content || '';
  raw = cleanResponse(raw);
  const parsed = JSON.parse(raw);

  if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    throw new Error('No questions in response');
  }

  let created = 0;
  for (let i = 0; i < parsed.questions.length; i++) {
    const q = parsed.questions[i];
    const quizId = `Q-${node.nodeId}-${String(i + 1).padStart(2, '0')}`;

    try {
      await prisma.quizBank.create({
        data: {
          quizId,
          nodeId: node.id,
          type: 'mcq',
          question: q.question,
          options: JSON.stringify(q.options),
          answer: q.answer,
          explanation: q.explanation || null,
          hint: q.hint || null,
          difficulty: node.difficulty,
          xp: isBoss ? 20 : 10,
          bossBattle: isBoss,
        }
      });
      created++;
    } catch (e) {
      // Skip duplicate quiz IDs
      if (!e.message?.includes('Unique')) {
        log(`  Quiz create error for ${quizId}: ${e.message?.substring(0, 60)}`);
      }
    }
  }

  return created;
}

// ============================================================
// MAIN EXECUTION
// ============================================================
async function main() {
  log('=== ATT Content Generator V2 Starting ===');
  writeFileSync(LOG_FILE, `=== ATT Content Generator V2 - ${new Date().toISOString()} ===\n`);

  const zai = await ZAI.create();
  log('ZAI SDK initialized');

  // Get all nodes that need content (Realms 2-13, no content)
  const emptyNodes = await prisma.node.findMany({
    where: {
      realmId: { gt: 1 },
      content: { equals: null }
    },
    orderBy: [{ realmId: 'asc' }, { id: 'asc' }],
    select: {
      id: true, nodeId: true, title: true, slug: true,
      contentType: true, difficulty: true, xp: true, realmId: true
    }
  });

  log(`Found ${emptyNodes.length} nodes needing content`);

  // Group by realm for reporting
  const byRealm = {};
  for (const n of emptyNodes) {
    byRealm[n.realmId] = (byRealm[n.realmId] || 0) + 1;
  }
  for (const [rid, count] of Object.entries(byRealm)) {
    const ctx = REALM_CONTEXT[rid];
    log(`  Realm ${rid} (${ctx?.name || 'Unknown'}): ${count} nodes`);
  }

  // ---- PHASE 1: Generate content ----
  log('\n--- PHASE 1: Content Generation ---');
  let contentSuccess = 0;
  let contentFailed = 0;

  for (let i = 0; i < emptyNodes.length; i++) {
    const node = emptyNodes[i];
    const realmCtx = REALM_CONTEXT[node.realmId];
    if (!realmCtx) {
      log(`SKIP ${node.nodeId}: No realm context for realm ${node.realmId}`);
      contentFailed++;
      continue;
    }

    log(`[${i + 1}/${emptyNodes.length}] CONTENT: ${node.nodeId} - ${node.title.substring(0, 50)}`);

    let done = false;
    for (let attempt = 0; attempt < 10 && !done; attempt++) {
      try {
        // Exponential backoff: 4s initial, then growing
        const waitTime = attempt === 0 ? 4000 : Math.min(5000 * Math.pow(1.5, attempt), 300000);
        if (attempt > 0) {
          log(`  Retry ${attempt}, waiting ${Math.round(waitTime / 1000)}s...`);
        }
        await delay(waitTime);

        await generateContent(zai, node, realmCtx);
        contentSuccess++;
        log(`  OK`);
        done = true;
      } catch (e) {
        const msg = e.message?.substring(0, 100) || 'Unknown error';
        if (msg.includes('429') || msg.includes('rate') || msg.includes('Rate')) {
          log(`  Rate limited, will retry...`);
          // On rate limit, always retry
        } else if (msg.includes('JSON') || msg.includes('parse') || msg.includes('syntax')) {
          log(`  Parse error: ${msg}`);
          // JSON parse errors might resolve on retry with different output
          if (attempt >= 3) {
            log(`  Giving up after ${attempt + 1} attempts`);
            done = true;
            contentFailed++;
          }
        } else {
          log(`  Error: ${msg}`);
          if (attempt >= 2) {
            done = true;
            contentFailed++;
          }
        }
      }
    }

    if (!done) {
      contentFailed++;
      log(`  FAILED: ${node.nodeId} after all retries`);
    }
  }

  log(`\nPhase 1 Complete: ${contentSuccess} success, ${contentFailed} failed`);

  // ---- PHASE 2: Generate quizzes ----
  log('\n--- PHASE 2: Quiz Generation ---');

  // Get all nodes with content but no quiz (Realms 2-13)
  const nodesWithContent = await prisma.node.findMany({
    where: {
      realmId: { gt: 1 },
      content: { not: null },
      status: 'published'
    },
    orderBy: [{ realmId: 'asc' }, { id: 'asc' }],
    select: {
      id: true, nodeId: true, title: true, slug: true,
      contentType: true, difficulty: true, realmId: true
    }
  });

  // Filter to nodes that don't have quizzes yet
  const needQuiz = [];
  for (const node of nodesWithContent) {
    const count = await prisma.quizBank.count({ where: { nodeId: node.id } });
    if (count === 0) needQuiz.push(node);
  }

  log(`Found ${needQuiz.length} nodes needing quizzes`);

  let quizSuccess = 0;
  let quizFailed = 0;
  let totalQuestions = 0;

  for (let i = 0; i < needQuiz.length; i++) {
    const node = needQuiz[i];
    const realmCtx = REALM_CONTEXT[node.realmId];
    if (!realmCtx) {
      quizFailed++;
      continue;
    }

    log(`[${i + 1}/${needQuiz.length}] QUIZ: ${node.nodeId} - ${node.title.substring(0, 50)}`);

    let done = false;
    for (let attempt = 0; attempt < 10 && !done; attempt++) {
      try {
        const waitTime = attempt === 0 ? 3000 : Math.min(4000 * Math.pow(1.5, attempt), 300000);
        if (attempt > 0) {
          log(`  Retry ${attempt}, waiting ${Math.round(waitTime / 1000)}s...`);
        }
        await delay(waitTime);

        const count = await generateQuiz(zai, node, realmCtx);
        quizSuccess++;
        totalQuestions += count;
        log(`  OK (${count} questions)`);
        done = true;
      } catch (e) {
        const msg = e.message?.substring(0, 100) || 'Unknown error';
        if (msg.includes('429') || msg.includes('rate') || msg.includes('Rate')) {
          log(`  Rate limited, will retry...`);
        } else if (msg.includes('JSON') || msg.includes('parse')) {
          if (attempt >= 3) { done = true; quizFailed++; }
        } else {
          if (attempt >= 2) { done = true; quizFailed++; }
        }
      }
    }

    if (!done) {
      quizFailed++;
      log(`  FAILED: ${node.nodeId}`);
    }
  }

  log(`\nPhase 2 Complete: ${quizSuccess} success, ${quizFailed} failed, ${totalQuestions} total questions`);

  // ---- SUMMARY ----
  log('\n=== GENERATION COMPLETE ===');
  log(`Content: ${contentSuccess} generated, ${contentFailed} failed`);
  log(`Quizzes: ${quizSuccess} generated, ${quizFailed} failed, ${totalQuestions} questions total`);
  log(`Log saved to: ${LOG_FILE}`);

  await prisma.$disconnect();
}

main().catch(e => {
  log(`FATAL: ${e.message}`);
  prisma.$disconnect();
  process.exit(1);
});
