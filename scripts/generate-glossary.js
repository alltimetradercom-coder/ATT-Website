/**
 * Glossary Term Generator for ATT Skill Tree
 * 
 * Reads all 270 nodes, groups by realm, uses z-ai-web-dev-sdk to generate
 * trading glossary terms with definitions, translations, and node links.
 * 
 * Run: node scripts/generate-glossary.js [--realm 2] [--delay 2000]
 */

const ZAI = require('z-ai-web-dev-sdk').default;
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Parse CLI args
const args = process.argv.slice(2);
const realmArg = args.indexOf('--realm');
const targetRealm = realmArg !== -1 ? parseInt(args[realmArg + 1]) : null;
const delayArg = args.indexOf('--delay');
const apiDelay = delayArg !== -1 ? parseInt(args[delayArg + 1]) : 2000;

// Realm info for context
const REALM_INFO = {
  1: { name: 'Genesis', focus: 'stock market basics, exchanges, SEBI, Demat accounts, orders, indices, IPO, brokerage' },
  2: { name: 'Art of War', focus: 'candlestick patterns, technical indicators (RSI, MACD, Bollinger Bands, VWAP, Fibonacci), support/resistance, trendlines, volume analysis, chart patterns, divergence, Heikin Ashi, Renko' },
  3: { name: 'The Shield', focus: 'fundamental analysis, balance sheet, income statement, cash flow, financial ratios (P/E, P/B, ROE, ROCE), debt analysis, DCF valuation, dividend yield, moat analysis, EPS, DPS' },
  4: { name: 'Boss Realm', focus: 'derivatives, futures, options, option Greeks (Delta, Gamma, Theta, Vega), option chain, PCR, spreads, straddle, strangle, iron condor, implied volatility, Black-Scholes, hedging, margin' },
  5: { name: 'Shadow Mechanics', focus: 'order book, bid-ask spread, market depth, order flow, HFT, market making, dark pools, iceberg orders, TWAP, VWAP execution, slippage, smart money concepts, order blocks, fair value gaps, liquidity sweeps' },
  6: { name: 'Monster Mind', focus: 'trading psychology, FOMO, fear and greed, revenge trading, overtrading, position sizing, risk-reward ratio, stop loss, trailing stop, cognitive biases, confirmation bias, loss aversion, gambler fallacy, drawdown' },
  7: { name: 'Empire Builder', focus: 'compounding, asset allocation, SIP, mutual funds, ETFs, index funds, large/mid/small cap, dividend investing, growth vs value, portfolio rebalancing, LTCG, STCG, ELSS, PPF, NPS, rupee cost averaging' },
  8: { name: 'Legendary Trader', focus: 'multi-timeframe analysis, top-down analysis, scalping, swing trading, position trading, intraday, event trading, earnings season, sector rotation, market breadth, advance-decline, correlation trading' },
  9: { name: 'Quant Lab', focus: 'statistics, probability, expected value, standard deviation, backtesting, walk-forward analysis, Monte Carlo simulation, Sharpe ratio, Sortino ratio, maximum drawdown, Kelly criterion, mean reversion, overfitting' },
  10: { name: 'Trader Business', focus: 'trading as business, P&L tracking, tax audit, ITR-3, business vs speculative income, compliance, risk management framework, trading desk, legal structure' },
  11: { name: 'Automation Lab', focus: 'Pine Script, Python for trading, backtesting, APIs (Dhan, Angel One, Zerodha Kite), trading bots, paper trading, webhooks, dashboards, web scraping, CI/CD, monitoring' },
  12: { name: 'Market Legends', focus: 'market crashes, scams (Harshad Mehta, Ketan Parekh, Satyam), short squeeze, flash crashes, circuit breakers, famous traders (Jhunjhunwala, Damani), pump and dump, insider trading' },
  13: { name: 'Professional Careers', focus: 'prop trading, hedge fund, research analyst, NISM, CFA, portfolio management, Bloomberg Terminal, risk manager, compliance officer, algorithmic trading jobs' },
};

function buildPrompt(realmNumber, nodes) {
  const info = REALM_INFO[realmNumber];
  const nodeList = nodes.map(n => `- ${n.nodeId}: ${n.title}`).join('\n');

  return `You are a financial glossary expert specializing in Indian stock markets. Generate comprehensive glossary entries for a gamified trading education platform called AllTimeTrader (ATT).

REALM: ${info.name} (Realm ${realmNumber})
FOCUS AREAS: ${info.focus}

NODES IN THIS REALM:
${nodeList}

TASK: Identify 12-15 KEY TRADING TERMS from this realm's nodes. For each term, provide a complete glossary entry.

IMPORTANT RULES:
1. All examples must reference Indian markets (NSE, BSE, Indian companies like Reliance, TCS, Infosys, HDFC, Wipro, Adani, etc.)
2. Terms should be the most important, unique concepts from this realm
3. Do NOT include terms that are too generic (like "stock", "market", "price")
4. Each term must be linked to the most relevant nodeId(s) from the list above
5. Hindi translations should be natural, commonly used Hindi financial terms
6. Telugu translations should be accurate financial terminology
7. NO emoji characters anywhere in the output

Return a JSON object with a "terms" array. Each element must have EXACTLY this structure:
{
  "termId": "G-kebab-case-id",
  "term": "English Term",
  "termHi": "Hindi Term",
  "termTe": "Telugu Term",
  "simpleDefinition": "Simple 1-2 sentence explanation anyone can understand",
  "simpleDefinitionHi": "Hindi simple definition",
  "simpleDefinitionTe": "Telugu simple definition",
  "professionalDefinition": "Detailed technical definition for professionals (2-3 sentences)",
  "formula": "Mathematical formula if applicable, or null",
  "commonMistake": "Common mistake traders make with this concept",
  "commonMistakeHi": "Hindi common mistake",
  "commonMistakeTe": "Telugu common mistake",
  "realExample": "Real Indian market example with specific stock/price/date",
  "realExampleHi": "Hindi real example",
  "realExampleTe": "Telugu real example",
  "relatedTerms": "Comma-separated list of related term names",
  "searchIntent": "What the user is trying to learn when searching this term",
  "linkedNodeIds": ["R2-N1", "R2-N5"]
}

Return ONLY the JSON object, no markdown code fences, no extra text.`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function parseJSON(raw) {
  if (!raw) throw new Error('Empty LLM response');
  let clean = raw.trim();
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  // Try to find JSON object if there's extra text
  const jsonStart = clean.indexOf('{');
  const jsonEnd = clean.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1) {
    clean = clean.substring(jsonStart, jsonEnd + 1);
  }
  return JSON.parse(clean);
}

async function generateForRealm(zai, realmNumber, nodes) {
  const info = REALM_INFO[realmNumber];
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Realm ${realmNumber}: ${info.name} (${nodes.length} nodes)`);
  console.log(`${'='.repeat(60)}`);

  try {
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert Indian stock market glossary creator. You always respond with valid JSON only. No markdown, no code fences, just the raw JSON object. All content must be about Indian stock markets (NSE, BSE, SEBI, Indian companies).',
        },
        {
          role: 'user',
          content: buildPrompt(realmNumber, nodes),
        },
      ],
      temperature: 0.7,
      max_tokens: 8000,
    });

    const rawContent = completion.choices[0]?.message?.content;
    const parsed = await parseJSON(rawContent);

    if (!parsed.terms || !Array.isArray(parsed.terms)) {
      throw new Error('Response missing "terms" array');
    }

    console.log(`  LLM returned ${parsed.terms.length} terms`);
    return parsed.terms;
  } catch (err) {
    console.error(`  LLM generation failed for Realm ${realmNumber}: ${err.message}`);
    // Return static fallback terms for this realm
    return getFallbackTerms(realmNumber);
  }
}

// Fallback terms in case LLM fails for a realm
function getFallbackTerms(realmNumber) {
  const fallbacks = {
    1: [
      { termId: 'G-stock-market', term: 'Stock Market', termHi: 'शेयर बाजार', termTe: 'స్టాక్ మార్కెట్', simpleDefinition: 'A place where buyers and sellers trade shares of publicly listed companies.', simpleDefinitionHi: 'एक जगह जहाँ खरीदार और विक्रेता सार्वजनिक कंपनियों के शेयरों का व्यापार करते हैं।', simpleDefinitionTe: 'పబ్లిక్ కంపెనీల షేర్లను కొనుగోలుదారులు మరియు విక్రేతలు వర్తకం చేసే స్థలం.', professionalDefinition: 'An organized marketplace where securities such as stocks, bonds, and derivatives are traded, providing price discovery and liquidity through regulated exchanges.', formula: null, commonMistake: 'Thinking the stock market is just gambling without understanding price discovery and business fundamentals.', commonMistakeHi: 'शेयर बाजार को सिर्फ जुआ समझना बिना मूल्य खोज और व्यापार मूलभूत को समझे।', commonMistakeTe: 'ధర నిర్ధారణ మరియు వ్యాపార ప్రాథమికాలను అర్థం చేసుకోకుండా స్టాక్ మార్కెట్‌ను కేవలం జూదంగా భావించడం.', realExample: 'On NSE, Reliance Industries trades under symbol RELIANCE with daily volumes exceeding 50 lakh shares.', realExampleHi: 'NSE पर, रिलायंस इंडस्ट्रीज़ RELIANCE प्रतीक के तहत लगभग 50 लाख शेयरों की दैनिक मात्रा के साथ व्यापार करती है।', realExampleTe: 'NSEలో, రిలయన్స్ ఇండస్ట్రీస్ RELIANCE చిహ్నం కింద రోజువారీ 50 లక్షల షేర్ల వాల్యూమ్‌తో వర్తకం చేస్తుంది.', relatedTerms: 'NSE, BSE, SEBI, Demat Account', searchIntent: 'Learn what the stock market is and how it works', linkedNodeIds: ['R1-N1'] },
      { termId: 'G-nse', term: 'NSE', termHi: 'एनएसई', termTe: 'ఎన్‌ఎస్‌ఇ', simpleDefinition: 'National Stock Exchange — India\'s largest stock exchange where most trading happens electronically.', simpleDefinitionHi: 'राष्ट्रीय शेयर बाजार — भारत का सबसे बड़ा शेयर बाजार जहाँ अधिकांश व्यापार इलेक्ट्रॉनिक होता है।', simpleDefinitionTe: 'నేషనల్ స్టాక్ ఎక్స్చేంజ్ — భారతదేశపు అతిపెద్ద స్టాక్ ఎక్స్చేంజ్ ఇక్కడ చాలా వర్తకం ఎలక్ట్రానిక్‌గా జరుగుతుంది.', professionalDefinition: 'The National Stock Exchange of India Limited, established in 1992, is the leading stock exchange in India by trading volume, offering electronic screen-based trading for equities, derivatives, and debt instruments.', formula: null, commonMistake: 'Confusing NSE with BSE — NSE is electronic-first while BSE is Asia\'s oldest exchange.', commonMistakeHi: 'NSE को BSE से भ्रमित करना — NSE इलेक्ट्रॉनिक-फर्स्ट है जबकि BSE एशिया का सबसे पुराना एक्सचेंज है।', commonMistakeTe: 'NSEని BSEతో గందరవేషం చేయడం — NSE ఎలక్ట్రానిక్-ఫస్ట్ అయితే BSE ఆసియాలో అతి పురాతన ఎక్స్చేంజ్.', realExample: 'Nifty 50 is NSE\'s flagship index, tracking the top 50 companies by market capitalization.', realExampleHi: 'निफ्टी 50 NSE का प्रमुख सूचकांक है, जो बाजार पूंजीकरण के अनुसार शीर्ष 50 कंपनियों को ट्रैक करता है।', realExampleTe: 'నిఫ్టీ 50 NSE యొక్క ప్రధాన సూచిక, మార్కెట్ క్యాపిటలైజేషన్ ప్రకారం టాప్ 50 కంపెనీలను ట్రాక్ చేస్తుంది.', relatedTerms: 'BSE, Nifty 50, Stock Exchange, SEBI', searchIntent: 'Learn about the National Stock Exchange of India', linkedNodeIds: ['R1-N2'] },
      { termId: 'g-demat-account', term: 'Demat Account', termHi: 'डीमैट खाता', termTe: 'డీమ్యాట్ ఖాతా', simpleDefinition: 'An electronic account that holds your shares and securities in digital form, like a bank account for stocks.', simpleDefinitionHi: 'एक इलेक्ट्रॉनिक खाता जो आपके शेयरों और प्रतिभूतियों को डिजिटल रूप में रखता है।', simpleDefinitionTe: 'మీ షేర్లు మరియు సెక్యూరిటీలను డిజిటల్ రూపంలో నిల్వ చేసే ఎలక్ట్రానిక్ ఖాతా.', professionalDefinition: 'A dematerialized account provided by Depository Participants (DPs) registered with NSDL or CDSL, used to hold securities in electronic form, eliminating the need for physical share certificates.', formula: null, commonMistake: 'Confusing Demat account with trading account — Demat holds shares, trading account executes buy/sell orders.', commonMistakeHi: 'डीमैट खाते को ट्रेडिंग खाते से भ्रमित करना — डीमैट शेयर रखता है, ट्रेडिंग खाता खरीद/बिक्री के आदेश निष्पादित करता है।', commonMistakeTe: 'డీమ్యాట్ ఖాతాను ట్రేడింగ్ ఖాతాతో గందరవేషం చేయడం — డీమ్యాట్ షేర్లను నిల్వ చేస్తుంది, ట్రేడింగ్ ఖాతా కొనుగోలు/అమ్మకం ఆర్డర్లను అమలు చేస్తుంది.', realExample: 'Zerodha provides Demat accounts through CDSL, allowing investors to hold shares of TCS, Infosys, etc. electronically.', realExampleHi: 'ज़ेरोधा CDSL के माध्यम से डीमैट खाते प्रदान करता है, जिससे निवेशक TCS, इन्फोसिस आदि के शेयर इलेक्ट्रॉनिक रूप से रख सकते हैं।', realExampleTe: 'జెరోధా CDSL ద్వారా డీమ్యాట్ ఖాతాలను అందిస్తుంది, TCS, ఇన్ఫోసిస్ మొదలైన వాటి షేర్లను ఎలక్ట్రానిక్‌గా నిల్వ చేయడానికి అనుమతిస్తుంది.', relatedTerms: 'Trading Account, CDSL, NSDL, Depository Participant', searchIntent: 'Understand what a Demat account is and how to open one', linkedNodeIds: ['R1-N4'] },
      { termId: 'g-sebi', term: 'SEBI', termHi: 'सेबी', termTe: 'సెబీ', simpleDefinition: 'Securities and Exchange Board of India — the government regulator that protects investors and controls the stock markets.', simpleDefinitionHi: 'भारतीय प्रतिभूति और विनिमय बोर्ड — सरकारी नियामक जो निवेशकों की रक्षा करता है और शेयर बाजारों को नियंत्रित करता है।', simpleDefinitionTe: 'సెక్యూరిటీస్ అండ్ ఎక్స్చేంజ్ బోర్డ్ ఆఫ్ ఇండియా — పెట్టుబడిదారులను రక్షించి స్టాక్ మార్కెట్‌లను నియంత్రించే ప్రభుత్వ నియంత్రక సంస్థ.', professionalDefinition: 'The Securities and Exchange Board of India, established in 1988 and given statutory powers in 1992, is the regulatory body for securities markets in India, responsible for investor protection, market regulation, and promoting fair practices.', formula: null, commonMistake: 'Thinking SEBI guarantees profits or prevents all losses — it only ensures fair market practices.', commonMistakeHi: 'सोचना कि SEBI मुनाफे की गारंटी देता है या सभी नुकसान रोकता है — यह केवल निष्पक्ष बाजार प्रथाओं को सुनिश्चित करता है।', commonMistakeTe: 'SEBI లాభాలకు హామీ ఇస్తుంది లేదా అన్ని నష్టాలను నివారిస్తుందని భావించడం — ఇది కేవలం సరసమైన మార్కెట్ పద్ధతులను నిర్ధారిస్తుంది.', realExample: 'In 2023, SEBI imposed a penalty on a broker for front-running trades in Infosys and TCS shares.', realExampleHi: '2023 में, SEBI ने इन्फोसिस और TCS शेयरों में फ्रंट-रनिंग ट्रेडों के लिए एक ब्रोकर पर जुर्माना लगाया।', realExampleTe: '2023లో, SEBI ఇన్ఫోసిస్ మరియు TCS షేర్లలో ఫ్రంట్-రన్నింగ్ ట్రేడ్‌ల కోసం ఒక బ్రోకర్‌పై జరిమానా విధించింది.', relatedTerms: 'Stock Exchange, NSE, BSE, Regulatory Framework', searchIntent: 'Understand SEBI role and investor protection', linkedNodeIds: ['R1-N3'] },
      { termId: 'g-market-order', term: 'Market Order', termHi: 'मार्केट ऑर्डर', termTe: 'మార్కెట్ ఆర్డర్', simpleDefinition: 'An order to buy or sell a stock immediately at the best available current price.', simpleDefinitionHi: 'सबसे अच्छी उपलब्ध वर्तमान कीमत पर तुरंत शेयर खरीदने या बेचने का आदेश।', simpleDefinitionTe: 'అందుబాటులో ఉన్న ఉత్తమ ప్రస్తుత ధర వద్ద వెంటనే షేరును కొనడానికి లేదా అమ్మడానికి ఆర్డర్.', professionalDefinition: 'An order type that guarantees execution but not price, filled at the prevailing market price when the order reaches the exchange. Subject to slippage in fast-moving or illiquid markets.', formula: null, commonMistake: 'Using market orders on illiquid stocks — you may get a very different price than expected.', commonMistakeHi: 'कम तरल शेयरों पर मार्केट ऑर्डर का उपयोग करना — आपको उम्मीद से बहुत अलग कीमत मिल सकती है।', commonMistakeTe: 'తక్కువ ద్రవ్యత ఉన్న షేర్లపై మార్కెట్ ఆర్డర్‌లను ఉపయోగించడం — మీకు ఊహించిన దానికంటే చాలా భిన్నమైన ధర లభించవచ్చు.', realExample: 'Placing a market order to buy 100 shares of Reliance at 10:00 AM — you get filled at whatever the best ask price is at that moment.', realExampleHi: 'सुबह 10:00 बजे रिलायंस के 100 शेयर खरीदने के लिए मार्केट ऑर्डर देना — आप उस क्षण सबसे अच्छी पूछताछ कीमत पर भरे जाते हैं।', realExampleTe: 'ఉదయం 10:00 గంటలకు రిలయన్స్ 100 షేర్లను కొనడానికి మార్కెట్ ఆర్డర్ ఇవ్వడం — ఆ క్షణంలో ఉన్న ఉత్తమ అస్క్ ధర వద్ద నింపబడుతుంది.', relatedTerms: 'Limit Order, Stop Loss, Slippage, Bid-Ask Spread', searchIntent: 'Learn about market orders vs limit orders', linkedNodeIds: ['R1-N6'] },
      { termId: 'g-ipo', term: 'IPO', termHi: 'आईपीओ', termTe: 'ఐపీఓ', simpleDefinition: 'Initial Public Offering — when a company sells its shares to the public for the first time to raise money.', simpleDefinitionHi: 'प्रारंभिक सार्वजनिक पेशकश — जब कोई कंपनी पहली बार पैसा जुटाने के लिए अपने शेयर जनता को बेचती है।', simpleDefinitionTe: 'ఇనిషియల్ పబ్లిక్ ఆఫరింగ్ — ఒక కంపెనీ నిధులను సేకరించడానికి మొదటిసారి తన షేర్లను ప్రజలకు అమ్మినప్పుడు.', professionalDefinition: 'An Initial Public Offering is the process by which a privately held company issues shares to the public on a stock exchange for the first time, transitioning from private to public ownership and subject to SEBI regulations.', formula: null, commonMistake: 'Assuming all IPOs will list at a premium — many IPOs list below their issue price.', commonMistakeHi: 'मान लेना कि सभी IPO प्रीमियम पर लिस्ट होंगे — कई IPO अपनी जारी कीमत से नीचे लिस्ट होते हैं।', commonMistakeTe: 'అన్ని IPOలు ప్రీమియం వద్ద లిస్ట్ అవుతాయని భావించడం — చాలా IPOలు వాటి ఇష్యూ ధర కంటే తక్కువకు లిస్ట్ అవుతాయి.', realExample: 'Zomato\'s IPO in July 2021 was priced at Rs 76 per share and listed at Rs 116, a 53% premium on NSE.', realExampleHi: 'ज़ोमैटो का IPO जुलाई 2021 में प्रति शेयर ₹76 पर था और NSE पर ₹116 पर लिस्ट हुआ, 53% प्रीमियम।', realExampleTe: 'జోమాటో IPO జూలై 2021లో షేరుకు ₹76 ధర నిర్ణయించబడి ₹116 వద్ద లిస్ట్ అయింది, 53% ప్రీమియం.', relatedTerms: 'Listing Price, Grey Market Premium, SEBI, DRHP', searchIntent: 'Learn about IPO process and how to invest', linkedNodeIds: ['R1-N12', 'R3-N19'] },
      { termId: 'g-nifty-50', term: 'Nifty 50', termHi: 'निफ्टी 50', termTe: 'నిఫ్టీ 50', simpleDefinition: 'India\'s most popular stock market index that tracks the performance of the top 50 companies on NSE.', simpleDefinitionHi: 'भारत का सबसे लोकप्रिय शेयर बाजार सूचकांक जो NSE की शीर्ष 50 कंपनियों के प्रदर्शन को ट्रैक करता है।', simpleDefinitionTe: 'భారతదేశపు అత్యంత ప్రజాదరణ పొందిన స్టాక్ మార్కెట్ సూచిక NSEలో టాప్ 50 కంపెనీల పనితీరును ట్రాక్ చేస్తుంది.', professionalDefinition: 'A benchmark index of the National Stock Exchange comprising 50 of the largest and most liquid Indian companies across 13 sectors, calculated using free-float market capitalization weighted methodology with base date November 3, 1995.', formula: 'Index Value = (Current Market Cap / Base Market Cap) x Base Index Value (1000)', commonMistake: 'Thinking Nifty 50 contains exactly the 50 largest companies — selection considers liquidity and sector representation too.', commonMistakeHi: 'सोचना कि निफ्टी 50 में ठीक 50 सबसे बड़ी कंपनियां हैं — चयन में तरलता और सेक्टर प्रतिनिधित्व भी महत्वपूर्ण है।', commonMistakeTe: 'నిఫ్టీ 50లో ఖచ్చితంగా 50 అతిపెద్ద కంపెనీలు ఉన్నాయని భావించడం — ఎంపికలో ద్రవ్యత మరియు రంగ ప్రాతినిధ్యం కూడా ముఖ్యం.', realExample: 'When Reliance Industries gains 2% on NSE, it can move Nifty 50 by approximately 30-40 points due to its heavy weight.', realExampleHi: 'जब रिलायंस इंडस्ट्रीज़ NSE पर 2% बढ़ती है, तो अपने भारी वजन के कारण निफ्टी 50 को लगभग 30-40 अंक बढ़ा सकती है।', realExampleTe: 'రిలయన్స్ ఇండస్ట్రీస్ NSEలో 2% పెరిగినప్పుడు, దాని భారీ బరువు కారణంగా నిఫ్టీ 50ను సుమారు 30-40 పాయింట్లు కదిలించగలదు.', relatedTerms: 'Sensex, Index, BSE, Market Capitalization', searchIntent: 'Understand what Nifty 50 is and how it works', linkedNodeIds: ['R1-N9'] },
      { termId: 'g-circuit-breaker', term: 'Circuit Breaker', termHi: 'सर्किट ब्रेकर', termTe: 'సర్క్యూట్ బ్రేకర్', simpleDefinition: 'A safety mechanism that stops trading when the market falls or rises too quickly, like an emergency brake.', simpleDefinitionHi: 'एक सुरक्षा तंत्र जो बाजार में बहुत तेज़ गिरावट या वृद्धि होने पर व्यापार रोक देता है।', simpleDefinitionTe: 'మార్కెట్ చాలా వేగంగా పడిపోయినప్పుడు లేదా పెరిగినప్పుడు వర్తకాన్ని ఆపే భద్రతా యంత్రాంగం.', professionalDefinition: 'A market mechanism that halts trading on exchanges when indices or individual stocks breach predefined percentage thresholds, implemented by SEBI to prevent panic selling and allow market participants to reassess information. Index circuit breakers trigger at 10%, 15%, and 20% moves.', formula: null, commonMistake: 'Thinking circuit breakers only apply to falling markets — they trigger on sharp upward moves too.', commonMistakeHi: 'सोचना कि सर्किट ब्रेकर केवल गिरते बाजार पर लागू होते हैं — वे तेज वृद्धि पर भी ट्रिगर होते हैं।', commonMistakeTe: 'సర్క్యూట్ బ్రేకర్లు కేవలం పడిపోతున్న మార్కెట్‌లకు మాత్రమే వర్తిస్తుందని భావించడం — అవి తీవ్రమైన పెరుగుదలపై కూడా ట్రిగ్గర్ అవుతాయి.', realExample: 'On 23 March 2020, Nifty hit the 10% lower circuit, triggering a 45-minute trading halt.', realExampleHi: '23 मार्च 2020 को, निफ्टी ने 10% लोअर सर्किट छुआ, जिससे 45 मिनट का व्यापार रुका।', realExampleTe: '23 మార్చి 2020న, నిఫ్టీ 10% లోయర్ సర్క్యూట్‌ను తాకింది, 45 నిమిషాల వర్తక హాల్ట్‌ను ట్రిగ్గర్ చేసింది.', relatedTerms: 'Trading Halt, Upper Circuit, Lower Circuit, SEBI', searchIntent: 'Understand how circuit breakers protect the market', linkedNodeIds: ['R1-N14'] },
    ],
  };
  return fallbacks[realmNumber] || [];
}

async function upsertGlossaryTerm(termData, nodeMap) {
  const {
    termId: rawTermId,
    term,
    termHi,
    termTe,
    simpleDefinition,
    simpleDefinitionHi,
    simpleDefinitionTe,
    professionalDefinition,
    formula,
    commonMistake,
    commonMistakeHi,
    commonMistakeTe,
    realExample,
    realExampleHi,
    realExampleTe,
    relatedTerms,
    searchIntent,
    linkedNodeIds,
  } = termData;

  // Ensure termId follows format "G-kebab-case"
  let termId = rawTermId || slugify(term);
  if (!termId.startsWith('G-')) {
    termId = 'G-' + termId;
  }
  termId = termId.toLowerCase();

  // Check if term already exists
  const existing = await prisma.glossary.findUnique({ where: { termId } });

  let glossaryRecord;
  if (existing) {
    glossaryRecord = existing;
    console.log(`    [EXISTS] ${termId}: ${term}`);
  } else {
    glossaryRecord = await prisma.glossary.create({
      data: {
        termId,
        term,
        termHi: termHi || null,
        termTe: termTe || null,
        simpleDefinition: simpleDefinition || '',
        simpleDefinitionHi: simpleDefinitionHi || null,
        simpleDefinitionTe: simpleDefinitionTe || null,
        professionalDefinition: professionalDefinition || null,
        formula: formula || null,
        commonMistake: commonMistake || null,
        commonMistakeHi: commonMistakeHi || null,
        commonMistakeTe: commonMistakeTe || null,
        realExample: realExample || null,
        realExampleHi: realExampleHi || null,
        realExampleTe: realExampleTe || null,
        relatedTerms: relatedTerms || null,
        searchIntent: searchIntent || null,
      },
    });
    console.log(`    [CREATED] ${termId}: ${term}`);
  }

  // Link to nodes via GlossaryNode
  if (linkedNodeIds && Array.isArray(linkedNodeIds)) {
    let linked = 0;
    for (const nodeId of linkedNodeIds) {
      const node = nodeMap.get(nodeId);
      if (!node) {
        // Try to find by nodeId pattern
        continue;
      }
      try {
        await prisma.glossaryNode.upsert({
          where: {
            glossaryId_nodeId: {
              glossaryId: glossaryRecord.id,
              nodeId: node.id,
            },
          },
          create: {
            glossaryId: glossaryRecord.id,
            nodeId: node.id,
          },
          update: {},
        });
        linked++;
      } catch (e) {
        // Skip if link already exists
      }
    }
    if (linked > 0) {
      console.log(`      -> Linked to ${linked} node(s)`);
    }
  }

  return glossaryRecord;
}

async function main() {
  console.log('='.repeat(60));
  console.log('  ATT Glossary Term Generator');
  console.log('='.repeat(60));
  console.log(`Target Realm: ${targetRealm || 'ALL'}`);
  console.log(`API Delay: ${apiDelay}ms`);

  // Read all nodes
  const nodes = await prisma.node.findMany({
    orderBy: [{ realmId: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      nodeId: true,
      title: true,
      slug: true,
      realmId: true,
      contentType: true,
    },
  });

  // Build nodeMap: nodeId -> node record
  const nodeMap = new Map();
  nodes.forEach(n => nodeMap.set(n.nodeId, n));

  // Group by realmId
  const byRealm = new Map();
  nodes.forEach(n => {
    if (!byRealm.has(n.realmId)) byRealm.set(n.realmId, []);
    byRealm.get(n.realmId).push(n);
  });

  console.log(`\nTotal nodes: ${nodes.length}`);
  console.log(`Realms to process: ${targetRealm ? 1 : byRealm.size}`);

  // Check existing glossary
  const existingCount = await prisma.glossary.count();
  console.log(`Existing glossary terms: ${existingCount}`);

  // Initialize ZAI SDK
  console.log('\nInitializing z-ai-web-dev-sdk...');
  const zai = await ZAI.create();
  console.log('SDK initialized successfully.\n');

  let totalCreated = 0;
  let totalLinked = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  // Process each realm
  const realmsToProcess = targetRealm
    ? [targetRealm]
    : Array.from(byRealm.keys()).sort((a, b) => a - b);

  for (const realmId of realmsToProcess) {
    const realmNodes = byRealm.get(realmId);
    if (!realmNodes || realmNodes.length === 0) continue;

    const info = REALM_INFO[realmId];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Realm ${realmId}: ${info?.name || 'Unknown'} (${realmNodes.length} nodes)`);
    console.log(`${'='.repeat(60)}`);

    try {
      const terms = await generateForRealm(zai, realmId, realmNodes);

      if (!terms || terms.length === 0) {
        console.log(`  No terms generated for Realm ${realmId}`);
        continue;
      }

      for (const termData of terms) {
        try {
          await upsertGlossaryTerm(termData, nodeMap);
          totalCreated++;
        } catch (err) {
          console.error(`  Failed to create term: ${err.message}`);
          totalFailed++;
        }
      }
    } catch (err) {
      console.error(`  Realm ${realmId} generation completely failed: ${err.message}`);
      totalFailed++;
    }

    // Delay between realm API calls to avoid rate limits
    if (realmsToProcess.indexOf(realmId) < realmsToProcess.length - 1) {
      console.log(`  Waiting ${apiDelay}ms before next realm...`);
      await sleep(apiDelay);
    }
  }

  // Final stats
  const finalCount = await prisma.glossary.count();
  const finalLinks = await prisma.glossaryNode.count();

  console.log('\n' + '='.repeat(60));
  console.log('  GENERATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`Glossary terms in DB: ${finalCount}`);
  console.log(`Glossary-Node links: ${finalLinks}`);
  console.log(`Terms processed: ${totalCreated}`);
  console.log(`Failures: ${totalFailed}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
