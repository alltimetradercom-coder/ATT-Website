/**
 * Telugu Translation Generator for ATT Skill Tree nodes.
 * Translates contentTe, tldrTe, and cheatsheetTe fields to Telugu using z-ai-web-dev-sdk.
 * 
 * Run: node scripts/generate-telugu-translations.js
 * 
 * Features:
 * - Checks API rate limits before starting (exits with clear message if daily limit hit)
 * - Skips nodes that already have contentTe (resumable — just re-run to continue)
 * - Exponential backoff on rate limit (429) errors
 * - Retry logic (max 3 retries per node with increasing backoff)
 * - Progress logging: "Translated node X/270: nodeId"
 * - Final summary: "Translated X nodes, Y failed"
 * 
 * CLI options:
 *   --check     Just check rate limits and exit
 *   --force     Overwrite existing translations
 *   --realm N   Only translate nodes in realm N
 * 
 * If the daily API limit is hit, the script exits with instructions to re-run later.
 * The script is fully resumable — it skips nodes that already have Telugu content.
 */

const ZAI = require('z-ai-web-dev-sdk').default;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Parse CLI args
const args = process.argv.slice(2);
const doCheck = args.includes('--check');
const force = args.includes('--force');
const realmArg = args.indexOf('--realm');
const targetRealm = realmArg !== -1 ? parseInt(args[realmArg + 1]) : null;

const MAX_RETRIES = 3;
const NODE_DELAY_MS = 3000;       // 3s between successful API calls
const BACKOFF_BASE_MS = 30000;    // 30s base backoff for 429 errors

const SYSTEM_PROMPT = `You are a professional Telugu translator specializing in Indian stock market education content.

RULES:
1. Translate naturally into Telugu using Telugu script.
2. Keep trading/finance terms in English where commonly used by Indian traders: candlestick, support, resistance, moving average, breakout, P/E ratio, stop loss, RSI, MACD, fibonacci, bullish, bearish, NSE, BSE, SEBI, IPO, F&O, demat, options, futures, dividend, EPS, etc.
3. Use natural Telugu sentence structure, not word-for-word translation.
4. Keep the same level of detail and educational value as the original.
5. For JSON array fields, translate each string individually and return a valid JSON array.
6. Return ONLY valid JSON with the exact structure requested. No markdown code fences, no extra text.`;

function log(msg) {
  console.log(`[${ts()}] ${msg}`);
}

function ts() {
  return new Date().toISOString().split('T')[1].split('.')[0];
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Check API rate limits by making a lightweight request and reading response headers.
 */
async function checkRateLimit(zai) {
  try {
    const config = zai.config;
    const url = `${config.baseUrl}/chat/completions`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
      'X-Z-AI-From': 'Z',
    };
    if (config.chatId) headers['X-Chat-Id'] = config.chatId;
    if (config.userId) headers['X-User-Id'] = config.userId;
    if (config.token) headers['X-Token'] = config.token;

    const resp = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'OK' }],
        thinking: { type: 'disabled' },
      }),
    });

    const ip10minLimit = parseInt(resp.headers.get('x-ratelimit-ip-10min-limit') || '0');
    const ip10minRemaining = parseInt(resp.headers.get('x-ratelimit-ip-10min-remaining') || '0');
    const dailyRemaining = parseInt(resp.headers.get('x-ratelimit-user-daily-remaining') || '-1');

    return { 
      available: resp.ok, 
      ip10minLimit, 
      ip10minRemaining, 
      dailyRemaining 
    };
  } catch (e) {
    return { available: false, ip10minLimit: 0, ip10minRemaining: 0, dailyRemaining: -1, error: e.message };
  }
}

function buildTranslationPrompt(node) {
  let tldrArr = [];
  let cheatsheetArr = [];
  try {
    if (node.tldr) tldrArr = JSON.parse(node.tldr);
  } catch { /* keep empty */ }
  try {
    if (node.cheatsheet) cheatsheetArr = JSON.parse(node.cheatsheet);
  } catch { /* keep empty */ }

  return `Translate the following stock market education content to Telugu.

NODE: ${node.nodeId} — ${node.title}

CONTENT (translate to Telugu):
${node.content || 'N/A'}

TLDR (JSON array, translate each string):
${JSON.stringify(tldrArr)}

CHEATSHEET (JSON array, translate each string):
${JSON.stringify(cheatsheetArr)}

Return a JSON object with EXACTLY these fields:
{
  "contentTe": "Full Telugu translation of content",
  "tldrTe": ["Telugu point 1", "Telugu point 2"],
  "cheatsheetTe": ["Telugu point 1", "Telugu point 2"]
}

Return ONLY the JSON object.`;
}

function parseLLMResponse(rawContent) {
  if (!rawContent) throw new Error('Empty LLM response');

  let clean = rawContent.trim();
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  try {
    return JSON.parse(clean);
  } catch (e) {
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e2) {
        throw new Error('JSON parse failed: ' + clean.substring(0, 200));
      }
    }
    throw new Error('JSON parse failed: ' + clean.substring(0, 200));
  }
}

let dailyLimitHit = false;

async function translateNode(zai, node) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildTranslationPrompt(node) },
        ],
        temperature: 0.3,
        max_tokens: 3000,
      });

      const rawContent = completion.choices[0]?.message?.content;
      const parsed = parseLLMResponse(rawContent);

      if (!parsed.contentTe) throw new Error('Missing contentTe');
      if (!Array.isArray(parsed.tldrTe)) throw new Error('tldrTe not array');
      if (!Array.isArray(parsed.cheatsheetTe)) throw new Error('cheatsheetTe not array');

      await prisma.node.update({
        where: { nodeId: node.nodeId },
        data: {
          contentTe: parsed.contentTe,
          tldrTe: JSON.stringify(parsed.tldrTe),
          cheatsheetTe: JSON.stringify(parsed.cheatsheetTe),
        },
      });

      return { success: true, contentLen: parsed.contentTe.length };
    } catch (err) {
      const is429 = err.message && err.message.includes('429');
      
      if (is429) {
        // Check if it's a daily limit
        const limits = await checkRateLimit(zai);
        if (limits.dailyRemaining === 0) {
          dailyLimitHit = true;
          return { success: false, error: 'Daily API limit exhausted. Re-run script later to continue.' };
        }
        
        if (attempt < MAX_RETRIES) {
          const backoff = Math.min(BACKOFF_BASE_MS * Math.pow(2, attempt), 120000);
          log(`  Rate limited! Waiting ${backoff/1000}s before retry ${attempt+1}/${MAX_RETRIES}...`);
          await sleep(backoff);
          continue;
        }
      } else if (attempt < MAX_RETRIES) {
        log(`  Error: ${err.message.substring(0, 80)}. Retry ${attempt+1}/${MAX_RETRIES} in 5s...`);
        await sleep(5000);
        continue;
      }
      return { success: false, error: err.message.substring(0, 150) };
    }
  }
  return { success: false, error: 'Max retries exceeded' };
}

async function main() {
  log('=== ATT Telugu Translation Generator ===');
  log(`Start time: ${new Date().toISOString()}`);

  const zai = await ZAI.create();

  // Check rate limits first
  const limits = await checkRateLimit(zai);
  log(`Rate limits - IP 10min: ${limits.ip10minRemaining}/${limits.ip10minLimit}, Daily remaining: ${limits.dailyRemaining}`);

  if (doCheck) {
    if (limits.dailyRemaining === 0) {
      log('DAILY LIMIT EXHAUSTED. Re-run script after the daily limit resets (typically midnight UTC).');
    } else if (limits.available) {
      log('API is available. Ready to translate.');
    } else {
      log('API is rate-limited on short window. Try again in a few minutes.');
    }
    return;
  }

  // If daily limit is already hit, exit early with clear instructions
  if (limits.dailyRemaining === 0) {
    log('');
    log('========================================');
    log('DAILY API LIMIT EXHAUSTED');
    log('========================================');
    log('The z-ai daily API quota has been used up.');
    log('This script is resumable — just re-run it after the limit resets.');
    log('The daily limit typically resets at midnight UTC.');
    log('');
    log('To check rate limits: node scripts/generate-telugu-translations.js --check');
    log('To re-run: node scripts/generate-telugu-translations.js');
    log('========================================');
    process.exit(1);
  }

  // Find nodes that need Telugu translations (skip already translated)
  const where = {
    content: { not: null },
    ...(targetRealm ? { realmId: targetRealm } : {}),
    ...(force ? {} : { contentTe: { equals: null } }),
  };

  const nodes = await prisma.node.findMany({
    where,
    orderBy: [{ realmId: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      nodeId: true,
      title: true,
      content: true,
      tldr: true,
      cheatsheet: true,
      realmId: true,
    },
  });

  log(`Found ${nodes.length} nodes needing Telugu translation`);

  if (nodes.length === 0) {
    log('All nodes already have Telugu translations!');
    return;
  }

  let translated = 0;
  let failed = 0;
  const failedNodes = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    process.stdout.write(`Translated node ${i + 1}/${nodes.length}: ${node.nodeId}... `);

    const result = await translateNode(zai, node);

    if (result.success) {
      translated++;
      console.log(`OK (${result.contentLen} chars)`);
    } else {
      failed++;
      failedNodes.push(node.nodeId);
      console.log(`FAILED: ${result.error}`);
      
      // If daily limit hit during processing, stop gracefully
      if (dailyLimitHit) {
        log('');
        log('Daily API limit hit during processing. Stopping to preserve progress.');
        log('Re-run this script later to continue from where you left off.');
        break;
      }
    }

    // Delay between nodes (3s)
    if (i < nodes.length - 1 && !dailyLimitHit) {
      await sleep(NODE_DELAY_MS);
    }

    // Progress update every 10 nodes
    if ((i + 1) % 10 === 0) {
      log(`Progress: ${i+1}/${nodes.length} processed (${translated} translated, ${failed} failed)`);
    }
  }

  log('');
  log('=== Translation Summary ===');
  log(`Translated ${translated} nodes, ${failed} failed`);
  if (failedNodes.length > 0) {
    log(`Failed nodes: ${failedNodes.join(', ')}`);
  }

  const totalWithTe = await prisma.node.count({ where: { contentTe: { not: null } } });
  log(`Database now has ${totalWithTe}/270 nodes with Telugu translations`);
  
  if (dailyLimitHit) {
    log('');
    log('NEXT STEPS: Re-run this script after the daily API limit resets.');
    log('  Check: node scripts/generate-telugu-translations.js --check');
    log('  Run:   node scripts/generate-telugu-translations.js');
  }
  
  log(`End time: ${new Date().toISOString()}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
