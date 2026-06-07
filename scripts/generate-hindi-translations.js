/**
 * Generate Hindi translations for all 270 Skill Tree nodes.
 * Uses z-ai-web-dev-sdk LLM chat completions.
 * 
 * Run: node scripts/generate-hindi-translations.js
 * 
 * Features:
 * - Skips nodes already translated (crash-resilient via progress file)
 * - Smart rate limit handling: waits until API is available before processing
 * - Unlimited retries on rate limits (doesn't count 429 against retry budget)
 * - Only counts non-429 errors against retry budget (max 3)
 * - Progress file for resume capability
 * - 5-second delay between successful translations
 */

const ZAI = require('z-ai-web-dev-sdk').default;
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const DELAY_MS = 5000;
const MAX_ERROR_RETRIES = 3; // Max retries for non-429 errors
const RATE_LIMIT_WAIT_MS = 60000; // Wait 1 minute between rate limit retries
const PROGRESS_FILE = path.join(__dirname, '.hindi-translation-progress.json');

const SYSTEM_PROMPT = `You are a Hindi translator for Indian stock market education content. Translate naturally into Hindi, keeping trading terms in English where appropriate (e.g., "candlestick", "support", "resistance", "P/E ratio", "moving average", "breakout", "stop loss", "NSE", "BSE", "SEBI", "IPO", "F&O", "FII", "DII"). Use Devanagari script for Hindi text. Always respond with valid JSON only. No markdown code fences, no extra text.`;

function safeParseJSON(str) {
  if (!str) return null;
  try { return JSON.parse(str); } catch { return null; }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function loadProgress() {
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    }
  } catch {}
  return { completed: [], failed: [] };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function buildTranslationPrompt(node) {
  const parts = [];
  if (node.content) parts.push(`CONTENT:\n${node.content}`);
  if (node.tldr) {
    const arr = safeParseJSON(node.tldr);
    if (Array.isArray(arr)) parts.push(`TLDR (JSON array - translate each string, return as JSON array):\n${JSON.stringify(arr)}`);
  }
  if (node.cheatsheet) {
    const arr = safeParseJSON(node.cheatsheet);
    if (Array.isArray(arr)) parts.push(`CHEATSHEET (JSON array - translate each string, return as JSON array):\n${JSON.stringify(arr)}`);
  }
  if (node.mindNote) parts.push(`MIND_NOTE:\n${node.mindNote}`);

  return `Translate the following Indian stock market educational content to Hindi.

Node: ${node.nodeId} - ${node.title}

${parts.join('\n\n')}

Return a JSON object with EXACTLY these fields:
{
  "contentHi": "Hindi translation of CONTENT field",
  "tldrHi": ["Hindi bullet 1", "Hindi bullet 2", ...],
  "cheatsheetHi": ["Hindi fact 1", "Hindi fact 2", ...],
  "mindNoteHi": "Hindi translation of MIND_NOTE field"
}

RULES:
- Use Devanagari script for Hindi
- Keep trading/finance terms in English: candlestick, support, resistance, moving average, breakout, stop loss, P/E ratio, NSE, BSE, SEBI, IPO, F&O, FII, DII, etc.
- For tldrHi and cheatsheetHi, return JSON arrays of strings
- Return ONLY the JSON object, no markdown code fences`;
}

/**
 * Wait for the API to become available (rate limit to clear).
 * Checks every RATE_LIMIT_WAIT_MS by making a tiny test request.
 */
async function waitForAPI(zai) {
  let waitCount = 0;
  while (true) {
    try {
      const completion = await zai.chat.completions.create({
        messages: [{ role: 'user', content: 'ok' }],
        max_tokens: 1,
        thinking: { type: 'disabled' }
      });
      // API is available!
      if (waitCount > 0) {
        console.log(`  API available after ${waitCount} wait cycle(s)!`);
      }
      return true;
    } catch (err) {
      if (err.message?.includes('429') || err.message?.includes('Too many requests')) {
        waitCount++;
        const timestamp = new Date().toISOString();
        console.log(`  [${timestamp}] API rate limited (wait #${waitCount}). Waiting ${RATE_LIMIT_WAIT_MS/1000}s...`);
        await sleep(RATE_LIMIT_WAIT_MS);
        continue;
      }
      // Other error - might be temporary
      console.log(`  API error: ${err.message.substring(0, 100)}. Waiting ${RATE_LIMIT_WAIT_MS/1000}s...`);
      await sleep(RATE_LIMIT_WAIT_MS);
      continue;
    }
  }
}

/**
 * Translate a single node.
 * Rate limits don't count against retry budget - we wait and retry indefinitely.
 * Only non-429 errors count against the retry budget.
 */
async function translateNode(zai, node) {
  let errorRetries = 0;
  
  while (true) {
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
      if (!rawContent) throw new Error('Empty LLM response');

      let parsed;
      try {
        let clean = rawContent.trim();
        if (clean.startsWith('```')) {
          clean = clean.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }
        parsed = JSON.parse(clean);
      } catch {
        throw new Error('JSON parse failed: ' + rawContent.substring(0, 300));
      }

      if (!parsed.contentHi && node.content) {
        throw new Error('Missing contentHi in response');
      }

      const updateData = {};
      if (parsed.contentHi) updateData.contentHi = parsed.contentHi;
      if (parsed.mindNoteHi) updateData.mindNoteHi = parsed.mindNoteHi;
      if (Array.isArray(parsed.tldrHi)) updateData.tldrHi = JSON.stringify(parsed.tldrHi);
      if (Array.isArray(parsed.cheatsheetHi)) updateData.cheatsheetHi = JSON.stringify(parsed.cheatsheetHi);

      if (Object.keys(updateData).length === 0) {
        throw new Error('No valid translations in response');
      }

      await prisma.node.update({
        where: { nodeId: node.nodeId },
        data: updateData,
      });

      return { success: true, fields: Object.keys(updateData).length };
    } catch (err) {
      const isRateLimit = err.message?.includes('429') || err.message?.includes('Too many requests');
      
      if (isRateLimit) {
        // Rate limit: wait for API to become available, then retry (doesn't count as error retry)
        console.log(`  Rate limited on ${node.nodeId}. Waiting for API...`);
        await waitForAPI(zai);
        continue;
      }
      
      // Non-rate-limit error: count against retry budget
      errorRetries++;
      if (errorRetries <= MAX_ERROR_RETRIES) {
        console.log(`  Error retry ${errorRetries}/${MAX_ERROR_RETRIES} for ${node.nodeId}: ${err.message}`);
        await sleep(5000 * errorRetries);
        continue;
      }
      
      return { success: false, error: err.message };
    }
  }
}

async function main() {
  console.log('=== ATT Hindi Translation Generator ===');
  console.log(`Delay: ${DELAY_MS}ms between nodes, Max error retries: ${MAX_ERROR_RETRIES}`);
  console.log(`Rate limit wait: ${RATE_LIMIT_WAIT_MS/1000}s per check`);
  console.log(`Progress file: ${PROGRESS_FILE}`);
  console.log(`Started at: ${new Date().toISOString()}\n`);

  const progress = loadProgress();
  console.log(`Previous progress: ${progress.completed.length} completed, ${progress.failed.length} failed`);

  const nodes = await prisma.node.findMany({
    where: {
      content: { not: null },
      contentHi: null,
    },
    orderBy: [{ realmId: 'asc' }, { id: 'asc' }],
    select: {
      nodeId: true,
      title: true,
      content: true,
      tldr: true,
      cheatsheet: true,
      mindNote: true,
      realmId: true,
    },
  });

  const remaining = nodes.filter(n => !progress.completed.includes(n.nodeId));
  console.log(`Found ${nodes.length} nodes needing translation, ${remaining.length} remaining\n`);

  if (remaining.length === 0) {
    console.log('All nodes already translated! Done.');
    return;
  }

  // First, wait for the API to be available
  console.log('Checking API availability...');
  const zai = await ZAI.create();
  await waitForAPI(zai);
  console.log('API is available! Starting translations...\n');

  let translated = progress.completed.length;
  let failed = progress.failed.length;
  const newFailedNodes = [];

  for (let i = 0; i < remaining.length; i++) {
    const node = remaining[i];
    process.stdout.write(`[${i + 1}/${remaining.length}] ${node.nodeId} "${node.title}"... `);

    const result = await translateNode(zai, node);

    if (result.success) {
      translated++;
      progress.completed.push(node.nodeId);
      saveProgress(progress);
      console.log(`OK (${result.fields} fields) [total: ${progress.completed.length}/270]`);
    } else {
      failed++;
      progress.failed.push(node.nodeId);
      newFailedNodes.push(node.nodeId);
      saveProgress(progress);
      console.log(`FAILED: ${result.error}`);
    }

    if (i < remaining.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log('\n========================================');
  console.log('=== Hindi Translation Summary ===');
  console.log('========================================');
  console.log(`Translated: ${translated} nodes`);
  console.log(`Failed: ${failed} nodes`);
  console.log(`Total completed in DB: ${progress.completed.length}`);
  if (newFailedNodes.length > 0) {
    console.log(`Newly failed node IDs: ${newFailedNodes.join(', ')}`);
  }
  console.log(`Finished at: ${new Date().toISOString()}`);
  console.log('========================================');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
