/**
 * Hindi + Telugu Translation Generator for AllTimeTrader Skill Tree
 * Translates all node content + quiz questions
 * Robust rate limit handling with long backoff
 */
import ZAI from 'z-ai-web-dev-sdk';
import { PrismaClient } from '@prisma/client';
import { writeFileSync, appendFileSync } from 'fs';

const prisma = new PrismaClient();
const LOG_FILE = '/home/z/my-project/download/translation-gen-log.txt';

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  try { appendFileSync(LOG_FILE, line + '\n'); } catch(e) {}
}

const delay = ms => new Promise(r => setTimeout(r, ms));

function cleanResponse(raw) {
  let s = raw.trim();
  if (s.startsWith('```')) {
    s = s.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return s.trim();
}

// Language config
const LANGUAGES = {
  hindi: { code: 'hi', name: 'Hindi', fields: { content: 'contentHi', tldr: 'tldrHi', cheatsheet: 'cheatsheetHi', mindNote: 'mindNoteHi' } },
  telugu: { code: 'te', name: 'Telugu', fields: { content: 'contentTe', tldr: 'tldrTe', cheatsheet: 'cheatsheetTe', mindNote: 'mindNoteTe' } }
};

async function safeApiCall(zai, messages, maxTokens = 2500) {
  for (let attempt = 0; attempt < 15; attempt++) {
    try {
      const result = await zai.chat.completions.create({
        messages,
        temperature: 0.3,
        max_tokens: maxTokens
      });
      return result;
    } catch (e) {
      const msg = e.message || '';
      if (msg.includes('429') || msg.includes('Too many') || msg.includes('rate')) {
        const waitTime = Math.min(30000 * Math.pow(2, attempt), 600000); // 30s, 60s, 120s, 240s max
        log(`  Rate limited, waiting ${Math.round(waitTime/1000)}s (attempt ${attempt+1})...`);
        await delay(waitTime);
      } else {
        throw e; // Non-rate-limit errors should propagate
      }
    }
  }
  throw new Error('Max retries exceeded for API call');
}

async function translateNode(zai, node, lang) {
  const langConfig = LANGUAGES[lang];

  const systemPrompt = `You are an expert translator for Indian stock market educational content. Translate from English to ${langConfig.name}. Use proper ${langConfig.name} script. Keep technical terms (like NSE, BSE, SEBI, P/E, ROE, Delta, etc.) in English. Ensure the translation is natural and culturally appropriate for Indian readers. Respond with valid JSON only, no code fences.`;

  const userPrompt = `Translate the following content to ${langConfig.name}:

Title: ${node.title}
Content: ${node.content}
TLDR: ${node.tldr}
Cheatsheet: ${node.cheatsheet}
MindNote: ${node.mindNote}

Return JSON:
{
  "content": "Full translated content in ${langConfig.name}",
  "tldr": "Translated TLDR as JSON array string",
  "cheatsheet": "Translated cheatsheet as JSON array string",
  "mindNote": "Translated mind note as single sentence in ${langConfig.name}"
}

IMPORTANT:
- For "tldr" and "cheatsheet", translate each item in the array and return as a JSON array string
- Keep all technical terms in English (NSE, BSE, SEBI, P/E, ROE, Delta, Gamma, Theta, Vega, etc.)
- Keep numbers and percentages as-is
- Return ONLY the JSON object, no markdown`;

  const completion = await safeApiCall(zai, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ]);

  let raw = completion.choices[0]?.message?.content || '';
  raw = cleanResponse(raw);
  const parsed = JSON.parse(raw);

  let tldrArr = parsed.tldr;
  if (typeof tldrArr === 'string') {
    try { tldrArr = JSON.parse(tldrArr); } catch(e) { tldrArr = [parsed.tldr]; }
  }
  let cheatArr = parsed.cheatsheet;
  if (typeof cheatArr === 'string') {
    try { cheatArr = JSON.parse(cheatArr); } catch(e) { cheatArr = [parsed.cheatsheet]; }
  }

  await prisma.node.update({
    where: { nodeId: node.nodeId },
    data: {
      [langConfig.fields.content]: parsed.content,
      [langConfig.fields.tldr]: JSON.stringify(tldrArr),
      [langConfig.fields.cheatsheet]: JSON.stringify(cheatArr),
      [langConfig.fields.mindNote]: parsed.mindNote,
    }
  });

  return true;
}

async function translateQuiz(zai, quiz, lang) {
  const langConfig = LANGUAGES[lang];

  const systemPrompt = `You are an expert translator for Indian stock market quiz content. Translate from English to ${langConfig.name}. Keep technical terms in English. Respond with valid JSON only, no code fences.`;

  const userPrompt = `Translate to ${langConfig.name}:
Question: ${quiz.question}
Options: ${quiz.options}
Answer: ${quiz.answer}
Explanation: ${quiz.explanation || ''}
Hint: ${quiz.hint || ''}

Return JSON:
{
  "question": "Translated question",
  "options": ["Translated option 1", "Translated option 2", "Translated option 3", "Translated option 4"],
  "answer": "Exact translated text of the correct answer",
  "explanation": "Translated explanation",
  "hint": "Translated hint"
}`;

  const completion = await safeApiCall(zai, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ], 1000);

  let raw = completion.choices[0]?.message?.content || '';
  raw = cleanResponse(raw);
  const parsed = JSON.parse(raw);

  const optionsArr = typeof parsed.options === 'string' ? JSON.parse(parsed.options) : parsed.options;

  await prisma.quizBank.update({
    where: { id: quiz.id },
    data: {
      [`question${lang === 'hindi' ? 'Hi' : 'Te'}`]: parsed.question,
      [`options${lang === 'hindi' ? 'Hi' : 'Te'}`]: JSON.stringify(optionsArr),
      [`answer${lang === 'hindi' ? 'Hi' : 'Te'}`]: parsed.answer,
      [`explanation${lang === 'hindi' ? 'Hi' : 'Te'}`]: parsed.explanation,
      [`hint${lang === 'hindi' ? 'Hi' : 'Te'}`]: parsed.hint,
    }
  });

  return true;
}

async function main() {
  const targetLang = process.argv[2] || 'hindi';
  const mode = process.argv[3] || 'nodes';

  log(`=== Translation Generator V2 - ${targetLang} / ${mode} ===`);
  writeFileSync(LOG_FILE, `=== Translation Gen V2 - ${targetLang} / ${mode} - ${new Date().toISOString()} ===\n`);

  const zai = await ZAI.create();
  log('ZAI SDK initialized');

  if (mode === 'nodes') {
    const field = LANGUAGES[targetLang].fields.content;
    const nodes = await prisma.node.findMany({
      where: { [field]: { equals: null }, content: { not: null } },
      orderBy: [{ realmId: 'asc' }, { id: 'asc' }],
      select: {
        id: true, nodeId: true, title: true, content: true,
        tldr: true, cheatsheet: true, mindNote: true, realmId: true
      }
    });

    log(`Found ${nodes.length} nodes needing ${targetLang} translation`);

    let success = 0, failed = 0;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      log(`[${i + 1}/${nodes.length}] ${targetLang.toUpperCase()} NODE: ${node.nodeId}`);

      try {
        await translateNode(zai, node, targetLang);
        success++;
        log(`  OK`);
      } catch (e) {
        const msg = e.message?.substring(0, 80) || 'Unknown';
        log(`  FAILED: ${msg}`);
        failed++;
      }

      // Always wait between nodes to avoid rate limiting
      await delay(6000);
    }

    log(`\nNode translations (${targetLang}): ${success} success, ${failed} failed`);

  } else if (mode === 'quizzes') {
    const hiField = targetLang === 'hindi' ? 'questionHi' : 'questionTe';
    const quizzes = await prisma.quizBank.findMany({
      where: { [hiField]: { equals: null }, question: { not: null } },
      orderBy: [{ id: 'asc' }],
      select: { id: true, question: true, options: true, answer: true, explanation: true, hint: true }
    });

    log(`Found ${quizzes.length} quizzes needing ${targetLang} translation`);

    let success = 0, failed = 0;
    for (let i = 0; i < quizzes.length; i++) {
      const quiz = quizzes[i];
      if (i % 20 === 0) log(`[${i + 1}/${quizzes.length}] ${targetLang.toUpperCase()} QUIZ progress...`);

      try {
        await translateQuiz(zai, quiz, targetLang);
        success++;
      } catch (e) {
        failed++;
      }

      await delay(5000);
    }

    log(`\nQuiz translations (${targetLang}): ${success} success, ${failed} failed`);
  }

  log('=== DONE ===');
  await prisma.$disconnect();
}

// Prevent unhandled rejections from crashing
process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled rejection: ${String(reason)?.substring(0, 100)}`);
  // Don't crash, just log
});

main().catch(e => {
  log(`FATAL: ${e.message}`);
  prisma.$disconnect();
  // Don't exit, let the process keep running
});
