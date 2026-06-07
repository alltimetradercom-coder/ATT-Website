import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel,
  WidthType, BorderStyle, ShadingType, AlignmentType, PageBreak, TableOfContents,
  SectionType, NumberFormat, PageNumber, Footer } from "docx";
import fs from "fs";

// Color Palette - Deep Sea Blue-Gold (Finance/Investment)
const palette = {
  primary: "0F2027",
  body: "1A2B40",
  secondary: "4A6575",
  accent: "D4AF37",
  surface: "F5F7FA",
};

const coverPalette = {
  titleColor: "FFFFFF",
  subtitleColor: "B0B8C0",
  metaColor: "90989F",
  footerColor: "687078",
};

const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

const tableBorders = {
  top: { style: BorderStyle.SINGLE, size: 2, color: palette.accent },
  bottom: { style: BorderStyle.SINGLE, size: 2, color: palette.accent },
  left: { style: BorderStyle.NONE },
  right: { style: BorderStyle.NONE },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "D0D0D0" },
  insideVertical: { style: BorderStyle.NONE },
};

function headerCell(text) {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 21, color: "FFFFFF", font: { ascii: "Calibri", eastAsia: "SimHei" } })] })],
    shading: { type: ShadingType.CLEAR, fill: palette.accent },
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
  });
}

function dataCell(text, idx) {
  return new TableCell({
    children: [new Paragraph({ children: [new TextRun({ text, size: 20, color: palette.body, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })] })],
    shading: idx % 2 === 0 ? { type: ShadingType.CLEAR, fill: palette.surface } : { type: ShadingType.CLEAR, fill: "FFFFFF" },
    margins: { top: 50, bottom: 50, left: 120, right: 120 },
  });
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text, bold: true, size: 32, color: palette.primary, font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    children: [new TextRun({ text, bold: true, size: 28, color: palette.primary, font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true, size: 24, color: palette.body, font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  });
}

function bodyPara(text) {
  return new Paragraph({
    spacing: { line: 312, after: 120 },
    children: [new TextRun({ text, size: 22, color: palette.body, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
  });
}

function boldBodyPara(label, text) {
  return new Paragraph({
    spacing: { line: 312, after: 120 },
    children: [
      new TextRun({ text: label, bold: true, size: 22, color: palette.primary, font: { ascii: "Calibri", eastAsia: "SimHei" } }),
      new TextRun({ text, size: 22, color: palette.body, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } }),
    ],
  });
}

// =============== BUILD DOCUMENT ===============

// --- COVER SECTION ---
const coverChildren = [
  new Paragraph({ spacing: { before: 4200 }, children: [] }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { line: 900, lineRule: "atLeast" },
    children: [new TextRun({ text: "AllTimeTrader", size: 72, bold: true, color: coverPalette.titleColor, font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, line: 600, lineRule: "atLeast" },
    children: [new TextRun({ text: "Skill Tree Project", size: 44, color: coverPalette.titleColor, font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 300 },
    children: [new TextRun({ text: "Complete Development Backup", size: 28, color: coverPalette.subtitleColor, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200 },
    indent: { left: 2000, right: 2000 },
    border: { top: { style: BorderStyle.SINGLE, size: 12, color: palette.accent, space: 20 } },
    children: [],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 400 },
    children: [new TextRun({ text: "Gamified Anime-RPG Trading Learning Universe", size: 22, color: coverPalette.metaColor, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200 },
    children: [new TextRun({ text: "13 Realms | 270 Nodes | 836 Quizzes | 12 Calculators", size: 20, color: coverPalette.metaColor, font: { ascii: "Calibri" } })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 600 },
    children: [new TextRun({ text: "Backup Date: June 7, 2026", size: 20, color: coverPalette.footerColor, font: { ascii: "Calibri" } })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100 },
    children: [new TextRun({ text: "Next.js 16 | Prisma + SQLite | TypeScript | Tailwind CSS 4", size: 18, color: coverPalette.footerColor, font: { ascii: "Calibri" } })],
  }),
];

// --- BODY CONTENT ---
const bodyChildren = [];

// ===== 1. PROJECT OVERVIEW =====
bodyChildren.push(heading1("1. Project Overview"));
bodyChildren.push(bodyPara("AllTimeTrader (ATT) is a gamified anime-RPG trading learning universe built for Indian stock market education. The platform combines role-playing game mechanics with comprehensive financial education, creating an immersive learning experience where users progress through 13 themed Realms, each containing multiple lesson Nodes with quizzes, XP rewards, certificates, and boss battles."));
bodyChildren.push(bodyPara("The Skill Tree is the core feature of ATT, transforming dry financial education into an epic adventure. Each Realm represents a major trading domain (e.g., Genesis for market basics, Art of War for technical analysis, Boss Realm for derivatives), and each Node within a Realm covers a specific topic with rich educational content, interactive quizzes, and gamified progression mechanics."));
bodyChildren.push(bodyPara("The platform supports trilingual content (English, Hindi, Telugu), features 12 built-in trading calculators, a trading journal, mind journal, live market data via Yahoo Finance, TradingView chart widgets, and is built as a Progressive Web App (PWA) with full dark/light theme support."));

bodyChildren.push(heading2("1.1 Tech Stack"));
const techStack = [
  ["Framework", "Next.js 16 (Turbopack), React 19, TypeScript"],
  ["Database", "SQLite via Prisma ORM 6"],
  ["Styling", "Tailwind CSS 4, shadcn/ui (45 components), Framer Motion"],
  ["State", "Zustand 5 (2 stores: app + journal)"],
  ["AI/LLM", "z-ai-web-dev-sdk (content, quiz, glossary, translation generation)"],
  ["Market Data", "Yahoo Finance 2, TradingView Widgets"],
  ["Charts", "Recharts, Chart.js, @xyflow/react (knowledge graph)"],
  ["i18n", "next-intl (EN/HI/TE), custom LanguageSwitcher"],
  ["PWA", "manifest.json, Service Worker, install banner"],
  ["SEO", "270 SSG pages, sitemap.xml, JSON-LD structured data"],
];
bodyChildren.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: tableBorders,
  rows: [
    new TableRow({ children: [headerCell("Category"), headerCell("Technology")] }),
    ...techStack.map((row, i) => new TableRow({ children: [dataCell(row[0], i), dataCell(row[1], i)] })),
  ],
}));

bodyChildren.push(heading2("1.2 Key Statistics"));
const stats = [
  ["Total Realms", "13"],
  ["Total Nodes", "270 (all published with content)"],
  ["Total Quiz Questions", "836"],
  ["Total XP Available", "42,140"],
  ["Glossary Terms", "8 seeded (seed API ready for more)"],
  ["Certificates", "17 levels (13 realm + 4 combo)"],
  ["Calculators", "12 premium calculators"],
  ["SEO Learn Pages", "270 pre-rendered at /learn/[slug]"],
  ["API Routes", "20 endpoints"],
  ["UI Components", "45 shadcn/ui + 9 skill-tree + 12 calculators"],
];
bodyChildren.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: tableBorders,
  rows: [
    new TableRow({ children: [headerCell("Metric"), headerCell("Value")] }),
    ...stats.map((row, i) => new TableRow({ children: [dataCell(row[0], i), dataCell(row[1], i)] })),
  ],
}));

// ===== 2. DATABASE SCHEMA =====
bodyChildren.push(heading1("2. Database Schema (Prisma)"));
bodyChildren.push(bodyPara("The database uses SQLite with 9 Prisma models. The schema supports full i18n (English, Hindi, Telugu), gamification (XP, badges, boss battles), knowledge graph connections (edges), glossary cross-references, certificate issuance, and spaced repetition for learning."));

const models = [
  ["Realm", "13 realms with i18n titles, descriptions, boss names, badges, colors, icons, sort orders. Fields: realmNumber, slug, title, titleHi, titleTe, subtitle, description, spirit, color, icon, bossName, badgeEmoji, badgeTitle + i18n variants."],
  ["Node", "~280 lesson nodes. Massive model with: content fields (story, mindNotes, keyTakeaways, traderTip, importantNote, tldr, cheatsheet), gamification (xp, difficulty, badge, contentType, subRealm), SEO (seoTitle, seoDescription), i18n (titleHi/Te, contentHi/Te, tldrHi/Te, cheatsheetHi/Te), marketplace, certification, versioning fields."],
  ["Edge", "Knowledge graph connections between nodes. Types: prerequisite, leads_to, related_to. Used for node unlock progression and knowledge map visualization."],
  ["Glossary", "Trading term definitions with i18n. Fields: term, termHi, termTe, simpleDefinition (+Hi/Te), professionalDefinition, formula, commonMistake (+Hi/Te), realExample (+Hi/Te), relatedTerms."],
  ["GlossaryNode", "Many-to-many junction table linking Glossary terms to Nodes. Enables cross-referencing between lessons and vocabulary."],
  ["QuizBank", "MCQ/true-false/fill-blank/scenario questions with i18n. Fields: question, options (4), correctAnswer, hint, explanation, xpReward, difficulty, questionType."],
  ["Tool", "Calculators, checklists, labs linked to nodes. Fields: name, type, description, config (JSON), url."],
  ["UserProgress", "Per-node progress tracking. States: locked, available, in_progress, completed. Includes quizScore, xpEarned, startedAt, completedAt, spacedRepetition fields."],
  ["Certificate", "17 certificate levels. Fields: level, certificateId (unique URL-safe), issuedAt. Levels range from single-realm to grandmaster (all 13 realms)."],
];
models.forEach(([name, desc]) => {
  bodyChildren.push(boldBodyPara(`${name}: `, desc));
});

// ===== 3. THE 13 REALMS =====
bodyChildren.push(heading1("3. The 13 Realms"));
bodyChildren.push(bodyPara("Each Realm represents a major domain of trading knowledge, themed as an RPG zone with a unique boss, badge, and spirit. Realms are unlocked sequentially as users complete prerequisite nodes from previous realms."));

const realms = [
  ["1", "Genesis", "Entering the Arena", "15", "1,640", "Beginner", "The Ignorance Guardian", "Market basics, NSE/BSE, SEBI, Demat accounts, orders, indices"],
  ["2", "Art of War", "Technical Analysis Mastery", "25", "3,460", "Core Skill", "The Pattern Dragon", "Candlesticks, price action, indicators (RSI, MACD, Bollinger), chart patterns, VWAP, Fibonacci, Ichimoku"],
  ["3", "The Shield", "Fundamental Analysis", "20", "2,780", "Defense", "The Illusion Master", "Balance sheets, income/cash flow statements, P/E ratios, debt analysis, sector analysis, moat analysis, DCF valuation"],
  ["4", "Boss Realm", "Derivatives & Options Mastery", "25", "4,080", "Boss Fight", "The Volatility Dragon", "Futures, options, Greeks, strategies, premium decay, option selling, hedging"],
  ["5", "Shadow Mechanics", "Market Microstructure", "18", "2,520", "Hidden Layer", "The Shadow Broker", "Order flow, bid-ask dynamics, algorithmic trading, market makers, HFT"],
  ["6", "Monster Mind", "Psychology & Risk Mastery", "18", "2,520", "Inner Battle", "The Emotion Demon", "FOMO, revenge trading, position sizing, risk management, trading psychology, discipline"],
  ["7", "Empire Builder", "Portfolio & Wealth Building", "20", "2,880", "Long Game", "The Inflation Titan", "Asset allocation, SIP strategies, mutual funds, tax planning, compounding, retirement"],
  ["8", "Legendary Trader", "Advanced Mastery", "20", "3,200", "Elite", "The Market Hydra", "Multi-timeframe analysis, confluence trading, live market strategies, tape reading"],
  ["9", "Quant Lab", "Statistics & Probability", "18", "2,640", "Numbers", "The Random Walk", "Backtesting, statistical edge, probability distributions, Monte Carlo, data-driven trading"],
  ["10", "Trader Business", "Operations & Scaling", "18", "2,540", "Professional", "The Tax Collector", "Compliance, tax audits, P&L tracking, scaling strategies, sustainable operations"],
  ["11", "Automation Lab", "APIs, Bots & Tools", "18", "2,580", "Builder", "The Bug King", "Pine Script, Python, Power BI, Chrome extensions, API integrations, trading bots"],
  ["12", "Market Legends", "History & Case Studies", "18", "2,520", "Lore", "The Ghost of Crashes Past", "Harshad Mehta, COVID crash, flash crashes, greatest trades, market history"],
  ["13", "Professional Careers", "Institutional Path", "17", "2,340", "Career", "The Final Interview", "Prop firms, hedge funds, NISM certifications, CFA path, research analyst roles"],
];
bodyChildren.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: tableBorders,
  rows: [
    new TableRow({ children: [headerCell("#"), headerCell("Realm"), headerCell("Subtitle"), headerCell("Nodes"), headerCell("XP"), headerCell("Spirit"), headerCell("Boss"), headerCell("Topics")] }),
    ...realms.map((row, i) => new TableRow({ children: row.map((cell, j) => dataCell(cell, i)) })),
  ],
}));

// ===== 4. API ROUTES =====
bodyChildren.push(heading1("4. API Routes (20 Endpoints)"));
bodyChildren.push(bodyPara("All API routes are built using Next.js App Router with TypeScript. The skill tree API provides RESTful endpoints for realms, nodes, quizzes, progress tracking, glossary, certificates, and admin content generation."));

const apiRoutes = [
  ["/api", "GET", "Health check endpoint"],
  ["/api/market-data", "GET", "Yahoo Finance data (NIFTY, BANKNIFTY, SENSEX, VIX, USD/INR, Gold) with 30s cache"],
  ["/api/skill-tree/realms", "GET", "All 13 realms with node counts, static fallback data"],
  ["/api/skill-tree/realm/[id]", "GET", "Single realm with nodes + edges"],
  ["/api/skill-tree/node/[nodeId]", "GET", "Full node with content, connected nodes, edges"],
  ["/api/skill-tree/map", "GET", "All nodes + edges + realms for knowledge graph visualization"],
  ["/api/skill-tree/search", "GET", "Search nodes by title/content across all languages (EN/HI/TE)"],
  ["/api/skill-tree/progress", "GET/POST", "All progress + stats for guest user, initialize records"],
  ["/api/skill-tree/progress/[nodeId]", "GET/POST/PUT", "Node-level progress: start, read, quiz-score updates, auto-unlock next"],
  ["/api/skill-tree/quiz/[nodeId]", "GET/POST", "Fetch quiz questions, submit answers (60% pass = complete + unlock)"],
  ["/api/skill-tree/glossary", "GET", "List/search glossary terms with i18n, filter by realm/node/language"],
  ["/api/skill-tree/glossary/[termId]", "GET", "Single glossary term detail with linked nodes"],
  ["/api/skill-tree/glossary/seed", "POST", "AI-powered glossary generation using z-ai-web-dev-sdk"],
  ["/api/skill-tree/certificate", "GET", "List user certificates with realm enrichment"],
  ["/api/skill-tree/certificate/issue", "POST", "Issue certificate (validates all realm nodes completed)"],
  ["/api/skill-tree/certificate/[certId]", "GET", "Public certificate verification endpoint"],
  ["/api/skill-tree/admin/generate-content", "POST/PUT", "LLM content generation per node or per realm"],
  ["/api/skill-tree/admin/generate-quiz", "POST/PUT", "LLM quiz generation per node or per realm"],
  ["/api/skill-tree/admin/generate-translation", "POST", "LLM Hindi/Telugu translation per node"],
];
bodyChildren.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: tableBorders,
  rows: [
    new TableRow({ children: [headerCell("Endpoint"), headerCell("Methods"), headerCell("Description")] }),
    ...apiRoutes.map((row, i) => new TableRow({ children: row.map((cell, j) => dataCell(cell, i)) })),
  ],
}));

// ===== 5. UI COMPONENTS =====
bodyChildren.push(heading1("5. UI Components"));

bodyChildren.push(heading2("5.1 Skill Tree Components (9 files)"));
const skillTreeComponents = [
  ["skill-tree-landing.tsx", "385 lines", "Main landing with realm cards, progress stats, search, CTA buttons (Start Journey, Knowledge Map, Certificates, Glossary), SEBI disclaimer"],
  ["realm-view.tsx", "462 lines", "Single realm view with node path visualization, grouped node cards, progress tracking, realm stats"],
  ["node-view.tsx", "768 lines", "Full lesson view: Lore/Story, Mind Note, Main Content, Key Takeaways, Trader Tips, Important Notes, TL;DR, Cheatsheet, Quiz, Certificate Progress"],
  ["quiz-view.tsx", "599 lines", "Interactive quiz with MCQ, hints, explanations, XP tracking, boss battles, retake, celebration animation"],
  ["knowledge-map.tsx", "515 lines", "@xyflow/react graph with custom SkillNode, zoom controls, minimap, status indicators, legend"],
  ["certificate-view.tsx", "690 lines", "17-level certificate system with gold/silver/bronze borders, claim button, share functionality"],
  ["glossary-view.tsx", "660 lines", "A-Z sidebar, search, term detail modal, language toggle, linked nodes, Generate Glossary button"],
  ["language-switcher.tsx", "51 lines", "3-language toggle (EN/Hindi/Telugu) with getLocalizedText() helper"],
  ["skill-tree-search.tsx", "268 lines", "Debounced search (300ms) with dropdown, keyboard navigation, difficulty/XP badges"],
];
bodyChildren.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: tableBorders,
  rows: [
    new TableRow({ children: [headerCell("Component"), headerCell("Size"), headerCell("Description")] }),
    ...skillTreeComponents.map((row, i) => new TableRow({ children: row.map((cell, j) => dataCell(cell, i)) })),
  ],
}));

bodyChildren.push(heading2("5.2 Main Site Components"));
const mainComponents = [
  ["hero.tsx", "496 lines", "Deterministic SVG candlestick chart, live market ticker, floating stat cards, animated grid, CTAs"],
  ["navbar.tsx", "326 lines", "Sticky navbar with dropdowns, Skill Tree button, theme toggle, mobile Sheet menu"],
  ["market-snapshot.tsx", "132 lines", "TradingView widgets (NIFTY 50, BANK NIFTY, INDIA VIX) with dark/light theme"],
  ["market-ticker.tsx", "Variable", "Live market data ticker cycling through indices"],
  ["tool-cards.tsx", "136 lines", "Calculator cards grid with icons, ratings, usage counts"],
  ["footer.tsx", "132 lines", "4-column footer: Brand, Calculators, Resources, Legal"],
  ["floating-actions.tsx", "Variable", "Floating action buttons for quick access"],
  ["daily-insights.tsx", "Variable", "Daily market insights section"],
  ["demat-section.tsx", "Variable", "Demat account offers with broker logos"],
];
bodyChildren.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: tableBorders,
  rows: [
    new TableRow({ children: [headerCell("Component"), headerCell("Size"), headerCell("Description")] }),
    ...mainComponents.map((row, i) => new TableRow({ children: row.map((cell, j) => dataCell(cell, i)) })),
  ],
}));

bodyChildren.push(heading2("5.3 Calculators (12 Premium)"));
const calculators = [
  ["Stock Average", "Average down calculator with break-even price, total investment, profit/loss"],
  ["SIP", "Systematic Investment Plan calculator with projected value, year-by-year table, growth chart"],
  ["Brokerage", "Brokerage cost calculator comparing multiple brokers (Zerodha, Groww, Upstox, etc.)"],
  ["Option Pain", "OI-based max pain calculation, PCR display, pain point chart"],
  ["Position Sizer", "Risk-based position sizing with risk amount, position value, stop-loss distance"],
  ["Pivot Point", "5 methods (Classic, Fibonacci, Camarilla, Woodie, DeMark) with R1-R4/S1-S4 levels"],
  ["CAGR", "Compound Annual Growth Rate with growth projection chart, year-by-year breakdown"],
  ["Fibonacci", "Retracement levels (0%-100%) + extension levels (127.2%-423.6%), golden ratio badge"],
  ["Break Even", "Business break-even: fixed costs, variable cost, selling price, contribution margin, BE chart"],
  ["SWP", "Systematic Withdrawal Plan with corpus tracking, depletion detection, balance chart"],
  ["Margin", "F&O margin calculator with lot size, MIS/NRML/CNC, 7-broker comparison"],
  ["Intrinsic Value", "Graham Number + DCF with terminal growth rate, EPS projection chart, margin of safety"],
];
bodyChildren.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: tableBorders,
  rows: [
    new TableRow({ children: [headerCell("Calculator"), headerCell("Features")] }),
    ...calculators.map((row, i) => new TableRow({ children: row.map((cell, j) => dataCell(cell, i)) })),
  ],
}));

// ===== 6. SEO PAGES =====
bodyChildren.push(heading1("6. SEO Learn Pages"));
bodyChildren.push(bodyPara("270 server-rendered pages at /learn/[slug] provide SEO-optimized public access to all lesson content. These pages work without JavaScript, making them fully indexable by search engines. Each page includes comprehensive meta tags, structured data, and internal linking for maximum SEO impact."));
bodyChildren.push(bodyPara("Key features of each learn page: dynamic SEO meta tags (title, description, OG, Twitter, canonical URL), JSON-LD structured data using schema.org LearningResource type, breadcrumb navigation (Home > Skill Tree > Realm > Node), full lesson content rendered as semantic HTML, glossary terms with definitions, quiz preview with CTA, next/previous lesson navigation, and SEBI disclaimer. The sitemap.xml includes all 270 learn URLs plus static pages with appropriate priorities and change frequencies."));

// ===== 7. STATE MANAGEMENT =====
bodyChildren.push(heading1("7. State Management"));
bodyChildren.push(heading2("7.1 App Store (useAppStore - Zustand)"));
bodyChildren.push(bodyPara("The main Zustand store manages view navigation (home, calculator, journal, mind-journal, demat, skill-tree) with sub-views for the skill tree (landing, realm, node, map, certificate, glossary). It tracks the selected realm/node, current calculator, and language preference (en/hi/te, persisted to localStorage). The store also defines the 12 calculator configurations and provides formatting helpers for Indian number system (Lakh/Crore)."));

bodyChildren.push(heading2("7.2 Journal Store (useJournalStore - Zustand)"));
bodyChildren.push(bodyPara("The journal store manages trading journal entries (symbol, entry/exit price, quantity, direction, strategy, emotions) and mind journal entries (mood, confidence, FOMO, sleep quality, emotional state). Both are persisted to localStorage. The store provides computed stats including win rate, total P&L, profit factor, average win/loss for performance tracking."));

// ===== 8. CONTENT GENERATION PIPELINE =====
bodyChildren.push(heading1("8. Content Generation Pipeline"));
bodyChildren.push(bodyPara("The content generation pipeline uses z-ai-web-dev-sdk to auto-generate lesson content, quiz questions, glossary terms, and Hindi/Telugu translations. Three admin API endpoints power the pipeline, and several standalone scripts are available for batch operations."));

bodyChildren.push(heading2("8.1 Admin API Endpoints"));
bodyChildren.push(boldBodyPara("POST/PUT /api/skill-tree/admin/generate-content: ", "Generates lesson content for a single node (POST) or an entire realm (PUT). Uses LLM to create story, mindNotes, keyTakeaways, traderTip, importantNote, tldr, cheatsheet, seoTitle, seoDescription. Content is 900-1400 characters per node with rich educational detail about Indian stock markets."));
bodyChildren.push(boldBodyPara("POST/PUT /api/skill-tree/admin/generate-quiz: ", "Generates quiz questions for a single node (POST) or entire realm (PUT). Creates 3 MCQ questions per regular node (10 XP each) and 5 harder questions per boss battle node (20 XP each). Each question includes 4 options, correct answer, hint, and explanation."));
bodyChildren.push(boldBodyPara("POST /api/skill-tree/admin/generate-translation: ", "Generates Hindi or Telugu translations for a single node. Translates content, tldr, and cheatsheet fields while keeping trading terms (NSE, BSE, SEBI, candlestick, etc.) in English."));

bodyChildren.push(heading2("8.2 Batch Scripts"));
const scripts = [
  ["generate-all-content-v2.mjs", "Batch content generation for all nodes across all realms using z-ai-web-dev-sdk"],
  ["generate-quizzes.mjs", "Batch quiz generation for all nodes"],
  ["generate-translations-v2.mjs", "Batch Hindi/Telugu translation generation with rate limit handling"],
  ["generate-hindi-translations.js", "Standalone Hindi translation script with resumable progress"],
  ["generate-telugu-translations.js", "Standalone Telugu translation script with resumable progress"],
  ["seed-glossary.mjs", "AI-powered glossary term generation per realm"],
  ["fill-remaining-v2.mjs", "Fill remaining nodes that missed initial content generation"],
  ["ultra-gen.mjs", "Ultra batch generator combining content + quiz + translation in one pass"],
  ["check-db-state.mjs", "Database state verification script"],
  ["check-i18n-state.mjs", "i18n translation coverage checker"],
];
bodyChildren.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: tableBorders,
  rows: [
    new TableRow({ children: [headerCell("Script"), headerCell("Purpose")] }),
    ...scripts.map((row, i) => new TableRow({ children: row.map((cell, j) => dataCell(cell, i)) })),
  ],
}));

// ===== 9. CURRENT DATABASE STATE =====
bodyChildren.push(heading1("9. Current Database State"));
bodyChildren.push(bodyPara("As of the backup date, the database contains 270 published nodes across 13 realms, 836 quiz questions, 8 glossary terms, 257 knowledge graph edges, 270 user progress records (1 completed), and 0 certificates. All nodes have English content; Hindi and Telugu translations are pending due to API rate limits."));

const dbState = [
  ["Nodes (total)", "270", "All published with content"],
  ["Nodes with English content", "270/270", "100% coverage"],
  ["Nodes with Hindi translations", "0/270", "Blocked by API rate limit"],
  ["Nodes with Telugu translations", "1/270", "R1-N1 test only, rest blocked"],
  ["Quiz Questions", "836", "3 per regular node, 5 per boss"],
  ["Glossary Terms", "8", "Realm 1 only, seed API ready"],
  ["Knowledge Graph Edges", "257", "Prerequisite + leads_to chains"],
  ["UserProgress Records", "270", "1 completed, 14 available, 255 locked"],
  ["Certificates Issued", "0", "System ready, no completions yet"],
];
bodyChildren.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: tableBorders,
  rows: [
    new TableRow({ children: [headerCell("Metric"), headerCell("Count"), headerCell("Notes")] }),
    ...dbState.map((row, i) => new TableRow({ children: row.map((cell, j) => dataCell(cell, i)) })),
  ],
}));

// ===== 10. BUGS FIXED =====
bodyChildren.push(heading1("10. Bugs Fixed"));
bodyChildren.push(heading2("10.1 Map Constructor Conflict"));
bodyChildren.push(bodyPara("Issue: lucide-react's Map icon import shadowed JavaScript's native Map constructor, causing a runtime crash 'Map is not a constructor' in skill-tree-landing.tsx. Fix: Renamed the import from Map to MapIcon and updated all usages in the stats row. This was a critical fix as it prevented the entire skill tree landing page from rendering."));

bodyChildren.push(heading2("10.2 TradingView Widget Parse Error"));
bodyChildren.push(bodyPara("Issue: TradingView widget threw 'Widget settings parse error: SyntaxError: Unexpected end of JSON input' and 'Invalid settings provided, fall back to defaults'. Root causes: (1) Symbols format was incorrect - needed [[title + '|' + symbol]] instead of [[title, symbol + '|1D']], (2) Locale was set to 'in' which TradingView does not support, changed to 'en', (3) DOM injection approach was unreliable, switched to innerHTML with a 100ms delay for DOM commit before loading the embed script."));

// ===== 11. REMAINING WORK =====
bodyChildren.push(heading1("11. Remaining Work & Known Limitations"));
bodyChildren.push(bodyPara("While the core Skill Tree feature is complete and functional, several enhancements remain to be implemented. The most significant pending items are the Hindi and Telugu translations for all 270 nodes, which are blocked by the z-ai-web-dev-sdk daily API rate limit. The translation scripts are ready and can be re-run once the rate limit resets."));

const remaining = [
  ["Hindi Translations", "0/270 nodes translated", "Script ready (generate-hindi-translations.js), blocked by API rate limit. Run after daily reset."],
  ["Telugu Translations", "1/270 nodes translated", "Script ready (generate-telugu-translations.js), blocked by API rate limit. Run after daily reset."],
  ["Glossary Seeding", "8/130+ terms", "Seed API ready, blocked by rate limit. Need ~10-15 terms per realm."],
  ["User Authentication", "Not implemented", "NextAuth dependency installed but not configured. Currently using guest user."],
  ["Persistent Progress", "localStorage only", "Progress resets on browser clear. Needs auth + server-side persistence."],
  ["Spaced Repetition", "Schema ready, no UI", "UserProgress has nextReviewAt/interval fields but no review scheduler."],
  ["Tools Integration", "Schema ready, no UI", "Tool model exists but no calculator-to-node linking UI."],
  ["Mobile App", "PWA only", "No native mobile app. PWA provides install-to-homescreen."],
  ["Admin Dashboard", "Not built", "Content management UI for reviewing/editing generated content."],
  ["Analytics", "Not implemented", "No usage tracking, completion funnel, or drop-off analytics."],
];
bodyChildren.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: tableBorders,
  rows: [
    new TableRow({ children: [headerCell("Item"), headerCell("Status"), headerCell("Notes")] }),
    ...remaining.map((row, i) => new TableRow({ children: row.map((cell, j) => dataCell(cell, i)) })),
  ],
}));

// ===== 12. FILE INVENTORY =====
bodyChildren.push(heading1("12. Key File Inventory"));
bodyChildren.push(bodyPara("This section provides a reference of all critical source files in the project, organized by category. All paths are relative to /home/z/my-project/."));

bodyChildren.push(heading2("12.1 Configuration & Root"));
const configFiles = [
  ["package.json", "Dependencies and scripts"],
  ["next.config.ts", "Next.js config (standalone output, allowed origins)"],
  ["tailwind.config.ts", "Tailwind CSS config with shadcn/ui CSS variables"],
  ["tsconfig.json", "TypeScript configuration"],
  ["prisma/schema.prisma", "Database schema (9 models, 331 lines)"],
  ["prisma/seed.ts", "Initial seed data (13 realms, 270 nodes, 451 lines)"],
  ["components.json", "shadcn/ui configuration"],
  ["Caddyfile", "Reverse proxy configuration"],
];
bodyChildren.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: tableBorders,
  rows: [
    new TableRow({ children: [headerCell("File"), headerCell("Description")] }),
    ...configFiles.map((row, i) => new TableRow({ children: row.map((cell, j) => dataCell(cell, i)) })),
  ],
}));

bodyChildren.push(heading2("12.2 Source Code Summary"));
const sourceFiles = [
  ["src/app/page.tsx", "155 lines", "Main SPA page with view switching"],
  ["src/app/layout.tsx", "100 lines", "Root layout with theme, analytics, PWA"],
  ["src/app/learn/[slug]/page.tsx", "532 lines", "SEO learn pages with SSG"],
  ["src/app/sitemap.ts", "72 lines", "Dynamic sitemap generation"],
  ["src/lib/store.ts", "112 lines", "Zustand app store"],
  ["src/lib/db.ts", "Variable", "Prisma singleton"],
  ["src/data/skill-tree-realms.ts", "48 lines", "Static realm data constants"],
  ["src/components/skill-tree/*", "~5,000 lines", "9 skill tree components"],
  ["src/components/calculators/*", "~3,000 lines", "12 calculator components + modal"],
  ["src/components/journal/*", "~400 lines", "Trading + Mind journal"],
  ["src/app/api/skill-tree/*", "~3,000 lines", "20 API route files"],
];
bodyChildren.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: tableBorders,
  rows: [
    new TableRow({ children: [headerCell("File/Path"), headerCell("Size"), headerCell("Description")] }),
    ...sourceFiles.map((row, i) => new TableRow({ children: row.map((cell, j) => dataCell(cell, i)) })),
  ],
}));

// ===== 13. HOW TO RESTORE =====
bodyChildren.push(heading1("13. How to Restore / Continue Development"));
bodyChildren.push(bodyPara("This section provides step-by-step instructions for restoring the project from this backup and continuing development. The project is currently running on the server at the preview URL."));

bodyChildren.push(heading2("13.1 Quick Start"));
bodyChildren.push(boldBodyPara("1. ", "Ensure Node.js 18+ and bun are installed."));
bodyChildren.push(boldBodyPara("2. ", "Run 'bun install' in the project root to install all dependencies."));
bodyChildren.push(boldBodyPara("3. ", "Run 'npx prisma generate' to generate the Prisma client from the schema."));
bodyChildren.push(boldBodyPara("4. ", "The SQLite database at db/custom.db contains all seeded data (270 nodes, 836 quizzes, etc.). If starting fresh, run 'npx prisma db push' then 'npx prisma db seed'."));
bodyChildren.push(boldBodyPara("5. ", "Run 'bun run dev' to start the development server on port 3000."));
bodyChildren.push(boldBodyPara("6. ", "Run 'bun run build' to verify the production build compiles successfully."));

bodyChildren.push(heading2("13.2 Running Translations (After Rate Limit Resets)"));
bodyChildren.push(boldBodyPara("Hindi: ", "node scripts/generate-hindi-translations.js"));
bodyChildren.push(boldBodyPara("Telugu: ", "node scripts/generate-telugu-translations.js"));
bodyChildren.push(boldBodyPara("Check rate limits: ", "node scripts/generate-telugu-translations.js --check"));
bodyChildren.push(boldBodyPara("Specific realm: ", "node scripts/generate-telugu-translations.js --realm 2"));

bodyChildren.push(heading2("13.3 Seeding Glossary"));
bodyChildren.push(boldBodyPara("Via API: ", "POST /api/skill-tree/glossary/seed with body { realmNumber: 1 } or { all: true }"));
bodyChildren.push(boldBodyPara("Via Script: ", "node scripts/seed-glossary.mjs"));

bodyChildren.push(heading2("13.4 Preview URL"));
bodyChildren.push(bodyPara("The live preview is available at: https://preview-d03583f1.space-z.ai/"));

// ===== 14. DEVELOPMENT WORKLOG =====
bodyChildren.push(heading1("14. Development Worklog Summary"));
bodyChildren.push(bodyPara("This section summarizes the major development milestones recorded in the worklog. Each task represents a significant feature or fix that was implemented during the project."));

const worklog = [
  ["backup-gen", "Generated initial backup document"],
  ["1", "Content Engine - Auto-generated lesson content for Genesis Realm (15 nodes). Created admin API route for LLM content generation. All 15 nodes populated with 900-1400 char content."],
  ["2", "Quiz System - Built interactive quiz UI with MCQ, hints, explanations, XP tracking, boss battles. Generated 47 quiz questions for Genesis. Created quiz API endpoints."],
  ["3", "Progress & Locking - Built XP tracking, node unlocking, progress bars. 4-state system: locked, available, in_progress, completed. Fixed edge chain ordering."],
  ["4", "Polish - Search across 270 nodes (EN/HI/TE), enhanced Knowledge Map with zoom + minimap, mobile fixes, quiz celebration animation."],
  ["hotfix-1", "Fixed Map constructor conflict (Map to MapIcon) and TradingView widget JSON parse error."],
  ["5", "Full Content & Quiz Generation for all 13 Realms - 270/270 nodes with content, 836 quiz questions. Rate-limited nodes got hand-crafted static content."],
  ["2-b", "Telugu translation script created. API rate limit blocked execution. 1/270 test translation verified."],
  ["5 (glossary)", "Glossary API + UI built. 3 endpoints, rich UI with A-Z jump, search, language toggle. 8 terms seeded."],
  ["6", "Certificate system built. 3 endpoints, 17 levels, gold/silver/bronze borders, share feature. Integrated into boss battle nodes."],
  ["7", "12 Calculator Tool pages rebuilt with premium UI. Real-time calculations, Indian formatting, dark mode, FAQ accordions."],
  ["8", "270 SEO learn pages at /learn/[slug]. SSG pre-rendering, JSON-LD, breadcrumbs, sitemap.xml."],
  ["9", "Fixed TradingView widget (symbols format, locale, DOM approach). Translation + glossary scripts ready (blocked by rate limit)."],
];
bodyChildren.push(new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  borders: tableBorders,
  rows: [
    new TableRow({ children: [headerCell("Task ID"), headerCell("Description")] }),
    ...worklog.map((row, i) => new TableRow({ children: row.map((cell, j) => dataCell(cell, i)) })),
  ],
}));

// ===== BUILD DOCUMENT =====
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 22, color: palette.body },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 32, bold: true, color: palette.primary },
      },
      heading2: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 28, bold: true, color: palette.primary },
      },
      heading3: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 24, bold: true, color: palette.body },
      },
    },
  },
  sections: [
    // Cover Section
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838, orientation: 0 },
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        },
      },
      children: [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: allNoBorders,
          rows: [
            new TableRow({
              height: { value: 16838, rule: "exact" },
              children: [
                new TableCell({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: "0F2027" },
                  borders: allNoBorders,
                  verticalAlign: "top",
                  children: coverChildren,
                }),
              ],
            }),
          ],
        }),
      ],
    },
    // Body Section
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1 },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ children: [PageNumber.CURRENT], size: 18, color: palette.secondary, font: { ascii: "Calibri" } }),
              ],
            }),
          ],
        }),
      },
      children: bodyChildren,
    },
  ],
});

// Generate the document
const buffer = await Packer.toBuffer(doc);
fs.writeFileSync("/home/z/my-project/download/ATT-Skill-Tree-Complete-Backup.docx", buffer);
console.log("Backup document generated: /home/z/my-project/download/ATT-Skill-Tree-Complete-Backup.docx");
console.log("Size:", (buffer.length / 1024).toFixed(1), "KB");
