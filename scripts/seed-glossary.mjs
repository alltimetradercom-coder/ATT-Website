/**
 * Glossary Seeder - Generates glossary terms for all 13 realms
 * Uses z-ai-web-dev-sdk + Prisma directly (no dev server needed)
 */
import ZAI from 'z-ai-web-dev-sdk';
import { PrismaClient } from '@prisma/client';
import { appendFileSync } from 'fs';

const prisma = new PrismaClient();
const LOG_FILE = '/home/z/my-project/download/glossary-gen-log.txt';

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  try { appendFileSync(LOG_FILE, line + '\n'); } catch(e) {}
}

const delay = ms => new Promise(r => setTimeout(r, ms));

const REALM_TERMS = {
  1: ['Stock Market', 'NSE', 'BSE', 'SEBI', 'Demat Account', 'Trading Account', 'Market Order', 'Limit Order', 'Index', 'Nifty 50', 'Sensex', 'IPO', 'Circuit Breaker', 'T+1 Settlement', 'Brokerage'],
  2: ['Candlestick', 'Doji', 'Hammer', 'Support', 'Resistance', 'Trendline', 'SMA', 'EMA', 'RSI', 'MACD', 'Bollinger Bands', 'VWAP', 'Fibonacci Retracement', 'Head and Shoulders', 'Double Top', 'Divergence', 'Volume', 'Heikin Ashi', 'Ichimoku Cloud', 'Supertrend'],
  3: ['Fundamental Analysis', 'Balance Sheet', 'Income Statement', 'Cash Flow', 'P/E Ratio', 'P/B Ratio', 'ROE', 'ROCE', 'Debt to Equity', 'Economic Moat', 'Intrinsic Value', 'DCF', 'Dividend Yield', 'EPS', 'Sector Analysis'],
  4: ['Derivatives', 'Futures', 'Options', 'Call Option', 'Put Option', 'Premium', 'Strike Price', 'Delta', 'Gamma', 'Theta', 'Vega', 'Implied Volatility', 'Option Chain', 'Open Interest', 'Iron Condor', 'Straddle', 'Butterfly Spread', 'Black-Scholes', 'PCR', 'Margin'],
  5: ['Order Book', 'Bid-Ask Spread', 'Market Depth', 'Order Flow', 'Algorithmic Trading', 'HFT', 'Market Maker', 'Slippage', 'TWAP', 'Iceberg Order', 'Smart Money', 'Order Block', 'Fair Value Gap', 'Liquidity Sweep'],
  6: ['FOMO', 'Revenge Trading', 'Position Sizing', 'Risk-Reward Ratio', 'Stop Loss', 'Trailing Stop', 'Trading Journal', 'Cognitive Bias', 'Confirmation Bias', 'Loss Aversion', 'Drawdown', 'Trading Plan'],
  7: ['SIP', 'Mutual Fund', 'ETF', 'Asset Allocation', 'Compounding', 'LTCG', 'STCG', 'ELSS', 'PPF', 'NPS', 'Index Fund', 'Dividend Investing', 'Rebalancing'],
  8: ['Scalping', 'Swing Trading', 'Position Trading', 'Confluence', 'Sector Rotation', 'Market Breadth', 'Advance-Decline', 'Earnings Season', 'Relative Strength'],
  9: ['Backtesting', 'Monte Carlo Simulation', 'Sharpe Ratio', 'Sortino Ratio', 'Maximum Drawdown', 'Kelly Criterion', 'Mean Reversion', 'Walk-Forward Analysis', 'Overfitting', 'Expected Value'],
  10: ['ITR-3', 'Speculative Income', 'Business Income', 'Tax Audit', 'P&L Statement', 'Compliance', 'Trading Desk'],
  11: ['Pine Script', 'TradingView Webhook', 'Zerodha Kite API', 'Python Backtesting', 'Trading Bot', 'Paper Trading', 'Power BI', 'Chrome Extension'],
  12: ['Harshad Mehta', 'Ketan Parekh', 'Satyam Scam', 'Flash Crash', 'Pump and Dump', 'Insider Trading', 'Circuit Breaker History'],
  13: ['Prop Trading', 'Hedge Fund', 'NISM', 'CFA', 'Research Analyst', 'Bloomberg Terminal', 'Dealer Terminal']
};

async function main() {
  log('=== Glossary Seeder Starting ===');

  const zai = await ZAI.create();
  log('ZAI SDK initialized');

  const existingCount = await prisma.glossary.count();
  log(`Existing glossary terms: ${existingCount}`);

  for (const [realmNum, terms] of Object.entries(REALM_TERMS)) {
    const rn = parseInt(realmNum);
    const realm = await prisma.realm.findUnique({ where: { realmNumber: rn } });
    if (!realm) { log(`Realm ${rn} not found, skipping`); continue; }

    log(`\nProcessing Realm ${rn} (${realm.title}): ${terms.length} terms`);

    // Get nodes in this realm for linking
    const nodes = await prisma.node.findMany({
      where: { realmId: realm.id },
      select: { id: true, nodeId: true },
    });

    // Generate glossary entries in batches of 5
    for (let i = 0; i < terms.length; i += 5) {
      const batch = terms.slice(i, i + 5);

      log(`  Generating entries for: ${batch.join(', ')}`);

      try {
        const completion = await zai.chat.completions.create({
          messages: [{
            role: 'user',
            content: `You are an expert Indian stock market educator. Generate glossary entries for these terms: ${batch.join(', ')}

For EACH term, provide a JSON object with these fields:
- termId: "G-{camelCase}" (unique ID, e.g., "G-stockMarket", "G-peRatio")
- term: English term name
- termHi: Hindi translation in Devanagari script
- termTe: Telugu translation in Telugu script
- simpleDefinition: Simple explanation in 1-2 sentences for beginners (English)
- simpleDefinitionHi: Same in Hindi (Devanagari)
- simpleDefinitionTe: Same in Telugu (Telugu script)
- professionalDefinition: Professional/technical definition in 2-3 sentences (English only)
- formula: Mathematical formula if applicable, or null
- commonMistake: A common mistake traders make (English)
- commonMistakeHi: Same in Hindi
- commonMistakeTe: Same in Telugu
- realExample: Real Indian market example using ₹ (English)
- realExampleHi: Same in Hindi
- realExampleTe: Same in Telugu
- relatedTerms: JSON array of related term IDs

Keep NSE, BSE, SEBI, P/E, EPS, F&O etc. in English even in Hindi/Telugu.
Return ONLY a JSON array of objects, no other text.`
          }],
          temperature: 0.5,
          max_tokens: 3000
        });

        let raw = completion.choices?.[0]?.message?.content || '[]';
        // Extract JSON array from response
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        if (jsonMatch) raw = jsonMatch[0];
        const entries = JSON.parse(raw);

        for (const entry of entries) {
          const termId = entry.termId || `G-${(entry.term || '').toLowerCase().replace(/\s+/g, '-')}`;
          if (!entry.term) continue;

          try {
            // Check existing
            const existing = await prisma.glossary.findUnique({ where: { termId } });
            if (existing) {
              // Link to new nodes
              await prisma.glossaryNode.createMany({
                data: nodes.map(n => ({ glossaryId: existing.id, nodeId: n.id })),
                skipDuplicates: true,
              });
              continue;
            }

            const glossary = await prisma.glossary.create({
              data: {
                termId,
                term: entry.term,
                termHi: entry.termHi || null,
                termTe: entry.termTe || null,
                simpleDefinition: entry.simpleDefinition || '',
                simpleDefinitionHi: entry.simpleDefinitionHi || null,
                simpleDefinitionTe: entry.simpleDefinitionTe || null,
                professionalDefinition: entry.professionalDefinition || null,
                formula: entry.formula || null,
                commonMistake: entry.commonMistake || null,
                commonMistakeHi: entry.commonMistakeHi || null,
                commonMistakeTe: entry.commonMistakeTe || null,
                realExample: entry.realExample || null,
                realExampleHi: entry.realExampleHi || null,
                realExampleTe: entry.realExampleTe || null,
                relatedTerms: entry.relatedTerms ? JSON.stringify(entry.relatedTerms) : null,
              }
            });

            // Link to nodes in this realm
            await prisma.glossaryNode.createMany({
              data: nodes.map(n => ({ glossaryId: glossary.id, nodeId: n.id })),
              skipDuplicates: true,
            });

            log(`    Created: ${entry.term} (${termId})`);
          } catch (err) {
            log(`    Error saving ${entry.term}: ${err.message?.substring(0, 50)}`);
          }
        }
      } catch (e) {
        log(`  Batch error: ${e.message?.substring(0, 80)}`);
      }

      // Rate limit delay
      await delay(5000);
    }
  }

  const finalCount = await prisma.glossary.count();
  log(`\n=== Glossary Seeding Complete ===`);
  log(`Started with ${existingCount} terms, now have ${finalCount} terms`);
  await prisma.$disconnect();
}

main().catch(e => {
  log(`FATAL: ${e.message}`);
  prisma.$disconnect();
  process.exit(1);
});
