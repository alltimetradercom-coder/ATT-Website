import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// ============================================================
// 13 REALMS DATA
// ============================================================
const realms = [
  {
    realmNumber: 1, slug: 'genesis', title: 'Genesis', titleHi: 'जेनेसिस', titleTe: 'జెనెసిస్',
    subtitle: 'Entering the Arena', subtitleHi: 'अखाड़े में प्रवेश', subtitleTe: 'రంగంలోకి ప్రవేశం',
    description: 'Your journey begins here. Learn what the stock market is, how NSE and BSE work, what SEBI does, and how to open your first Demat account.',
    descriptionHi: 'आपकी यात्रा यहीं से शुरू होती है। स्टॉक मार्केट क्या है, NSE और BSE कैसे काम करते हैं, SEBI क्या करता है, और अपना पहला डीमैट खाता कैसे खोलें।',
    descriptionTe: 'మీ ప్రయాణం ఇక్కడే మొదలవుతుంది. స్టాక్ మార్కెట్ అంటే ఏమిటి, NSE మరియు BSE ఎలా పనిచేస్తాయి, SEBI ఏమి చేస్తుంది, మరియు మీ మొదటి డీమ్యాట్ ఖాతాను ఎలా తెరవాలి.',
    icon: '🌱', spirit: 'Beginner', color: '#10B981',
    bossName: 'The Ignorance Guardian', bossNameHi: 'अज्ञान का रक्षक', bossNameTe: 'అజ్ఞాన రక్షకుడు',
    badgeEmoji: '🌱', badgeTitle: 'Genesis Survivor', badgeTitleHi: 'जेनेसिस सर्वाइवर', badgeTitleTe: 'జెనెసిస్ సర్వైవర్',
    sortOrder: 1
  },
  {
    realmNumber: 2, slug: 'art-of-war', title: 'Art of War', titleHi: 'युद्ध कला', titleTe: 'యుద్ధ కళ',
    subtitle: 'Technical Analysis Mastery', subtitleHi: 'टेक्निकल एनालिसिस में महारत', subtitleTe: 'టెక్నికల్ అనాలిసిస్ నైపుణ్యం',
    description: 'Master candlesticks, price action, support-resistance, trendlines, indicators, and chart patterns. The core skill every trader needs.',
    descriptionHi: 'कैंडलस्टिक, प्राइस एक्शन, सपोर्ट-रेजिस्टेंस, ट्रेंडलाइन, इंडिकेटर और चार्ट पैटर्न में महारत हासिल करें।',
    descriptionTe: 'క్యాండిల్‌స్టిక్‌లు, ప్రైస్ యాక్షన్, సపోర్ట్-రెసిస్టెన్స్, ట్రెండ్‌లైన్‌లు, ఇండికేటర్‌లు మరియు చార్ట్ నమూనాలలో నైపుణ్యం సాధించండి.',
    icon: '⚔️', spirit: 'Core Skill', color: '#3B82F6',
    bossName: 'The Pattern Dragon', bossNameHi: 'पैटर्न ड्रैगन', bossNameTe: 'ప్యాటర్న్ డ్రాగన్',
    badgeEmoji: '⚔️', badgeTitle: 'Chart Warrior', badgeTitleHi: 'चार्ट योद्धा', badgeTitleTe: 'చార్ట్ వారియర్',
    sortOrder: 2
  },
  {
    realmNumber: 3, slug: 'the-shield', title: 'The Shield', titleHi: 'ढाल', titleTe: 'ఢలం',
    subtitle: 'Fundamental Analysis', subtitleHi: 'फंडामेंटल एनालिसिस', subtitleTe: 'ఫండమెంటల్ అనాలిసిస్',
    description: 'Read balance sheets, understand P/E ratios, analyze sectors, and discover what makes a company truly valuable. Defense wins championships.',
    descriptionHi: 'बैलेंस शीट पढ़ें, P/E रेश्यो समझें, सेक्टर एनालिसिस करें और जानें कंपनी को असली मूल्य क्या देता है।',
    descriptionTe: 'బ్యాలెన్స్ షీట్‌లను చదవండి, P/E నిష్పత్తులను అర్థం చేసుకోండి, రంగాలను విశ్లేషించండి.',
    icon: '🛡️', spirit: 'Defense', color: '#8B5CF6',
    bossName: 'The Illusion Master', bossNameHi: 'भ्रम गुरु', bossNameTe: 'భ్రమ మాస్టర్',
    badgeEmoji: '🛡️', badgeTitle: 'Fundamental Guardian', badgeTitleHi: 'फंडामेंटल गार्जियन', badgeTitleTe: 'ఫండమెంటల్ గార్డియన్',
    sortOrder: 3
  },
  {
    realmNumber: 4, slug: 'boss-realm', title: 'Boss Realm', titleHi: 'बॉस रियल्म', titleTe: 'బాస్ రియల్మ్',
    subtitle: 'Derivatives & Options Mastery', subtitleHi: 'डेरिवेटिव्स और ऑप्शन में महारत', subtitleTe: 'డెరివేటివ్స్ & ఆప్షన్స్ నైపుణ్యం',
    description: 'Futures, Options, Greeks, Strategies — the most dangerous and rewarding arena. Only the prepared survive the Volatility Dragon.',
    descriptionHi: 'फ्यूचर्स, ऑप्शन, ग्रीक्स, स्ट्रेटेजी — सबसे खतरनाक और लाभदायक अखाड़ा।',
    descriptionTe: 'ఫ్యూచర్స్, ఆప్షన్స్, గ్రీక్స్, స్ట్రాటెజీలు — అత్యంత ప్రమాదకరమైన మరియు లాభదాయకమైన రంగం.',
    icon: '👹', spirit: 'Boss Fight', color: '#EF4444',
    bossName: 'The Volatility Dragon', bossNameHi: 'वोलैटिलिटी ड्रैगन', bossNameTe: 'వోలాటిలిటీ డ్రాగన్',
    badgeEmoji: '👹', badgeTitle: 'Options Slayer', badgeTitleHi: 'ऑप्शन स्लेयर', badgeTitleTe: 'ఆప్షన్స్ స్లేయర్',
    sortOrder: 4
  },
  {
    realmNumber: 5, slug: 'shadow-mechanics', title: 'Shadow Mechanics', titleHi: 'शैडो मैकेनिक्स', titleTe: 'షాడో మెకానిక్స్',
    subtitle: 'Market Microstructure', subtitleHi: 'मार्केट माइक्रोस्ट्रक्चर', subtitleTe: 'మార్కెట్ మైక్రోస్ట్రక్చర్',
    description: 'What really happens behind the order book? Learn order flow, bid-ask dynamics, algorithmic trading, and how market makers operate.',
    descriptionHi: 'ऑर्डर बुक के पीछे असल में क्या होता है? ऑर्डर फ्लो, बिड-आस्क डायनामिक्स, एल्गो ट्रेडिंग सीखें।',
    descriptionTe: 'ఆర్డర్ బుక్ వెనుక నిజంగా ఏమి జరుగుతుంది? ఆర్డర్ ఫ్లో, బిడ్-ఆస్క్ డైనమిక్స్ నేర్చుకోండి.',
    icon: '🕵️', spirit: 'Hidden Layer', color: '#6366F1',
    bossName: 'The Shadow Broker', bossNameHi: 'शैडो ब्रोकर', bossNameTe: 'షాడో బ్రోకర్',
    badgeEmoji: '🕵️', badgeTitle: 'Shadow Agent', badgeTitleHi: 'शैडो एजेंट', badgeTitleTe: 'షాడో ఏజెంట్',
    sortOrder: 5
  },
  {
    realmNumber: 6, slug: 'monster-mind', title: 'Monster Mind', titleHi: 'मॉन्स्टर माइंड', titleTe: 'మాన్‌స్టర్ మైండ్',
    subtitle: 'Psychology & Risk Mastery', subtitleHi: 'मनोविज्ञान और जोखिम में महारत', subtitleTe: 'మనఃశాస్త్రం & రిస్క్ నైపుణ్యం',
    description: 'The hardest battle is inside your head. Conquer FOMO, revenge trading, and emotional decisions. Master position sizing and risk management.',
    descriptionHi: 'सबसे कठिन लड़ाई आपके दिमाग के अंदर है। FOMO, रिवेंज ट्रेडिंग और भावनात्मक फैसलों पर जीत हासिल करें।',
    descriptionTe: 'అత్యంత కష్టమైన పోరాటం మీ తలలో ఉంది. FOMO, ప్రతీకార ట్రేడింగ్‌ను జయించండి.',
    icon: '🧠', spirit: 'Inner Battle', color: '#EC4899',
    bossName: 'The Emotion Demon', bossNameHi: 'भावना राक्षस', bossNameTe: 'భావోద్వేగ రాక్షసుడు',
    badgeEmoji: '🧠', badgeTitle: 'Mind Master', badgeTitleHi: 'माइंड मास्टर', badgeTitleTe: 'మైండ్ మాస్టర్',
    sortOrder: 6
  },
  {
    realmNumber: 7, slug: 'empire-builder', title: 'Empire Builder', titleHi: 'साम्राज्य निर्माता', titleTe: 'సామ్రాజ్య నిర్మాత',
    subtitle: 'Portfolio & Wealth Building', subtitleHi: 'पोर्टफोलियो और धन निर्माण', subtitleTe: 'పోర్ట్‌ఫోలియో & సంపద నిర్మాణం',
    description: 'Build wealth that lasts generations. Asset allocation, SIP strategies, mutual funds, tax planning, and the power of compounding.',
    descriptionHi: 'ऐसा धन बनाएं जो पीढ़ियों तक चले। एसेट एलोकेशन, SIP, म्यूचुअल फंड, टैक्स प्लानिंग।',
    descriptionTe: 'తరాలు నిలిచే సంపదను నిర్మించండి. అసెట్ అలోకేషన్, SIP, మ్యూచువల్ ఫండ్స్, పన్ను ప్రణాళిక.',
    icon: '🏰', spirit: 'Long Game', color: '#F59E0B',
    bossName: 'The Inflation Titan', bossNameHi: 'मुद्रास्फीति टाइटन', bossNameTe: 'ద్రవ్యోల్బణ టైటాన్',
    badgeEmoji: '🏰', badgeTitle: 'Empire Architect', badgeTitleHi: 'साम्राज्य वास्तुकार', badgeTitleTe: 'సామ్రాజ్య ఆర్కిటెక్ట్',
    sortOrder: 7
  },
  {
    realmNumber: 8, slug: 'legendary-trader', title: 'Legendary Trader', titleHi: 'दिग्गज ट्रेडर', titleTe: 'లెజెండరీ ట్రేడర్',
    subtitle: 'Advanced Mastery', subtitleHi: 'एडवांस्ड महारत', subtitleTe: 'అడ్వాన్స్డ్ నైపుణ్యం',
    description: 'Multi-timeframe analysis, confluence trading, live market strategies, and the art of reading the tape like a professional.',
    descriptionHi: 'मल्टी-टाइमफ्रेम एनालिसिस, कॉन्फ्लुएंस ट्रेडिंग, लाइव मार्केट स्ट्रेटेजी।',
    descriptionTe: 'మల్టీ-టైమ్‌ఫ్రేమ్ అనాలిసిస్, కాన్ఫ్లుయెన్స్ ట్రేడింగ్, లైవ్ మార్కెట్ వ్యూహాలు.',
    icon: '🐉', spirit: 'Elite', color: '#D946EF',
    bossName: 'The Market Hydra', bossNameHi: 'मार्केट हाइड्रा', bossNameTe: 'మార్కెట్ హైడ్రా',
    badgeEmoji: '🐉', badgeTitle: 'Legendary', badgeTitleHi: 'दिग्गज', badgeTitleTe: 'లెజెండరీ',
    sortOrder: 8
  },
  {
    realmNumber: 9, slug: 'quant-lab', title: 'Quant Lab', titleHi: 'क्वांट लैब', titleTe: 'క్వాంట్ ల్యాబ్',
    subtitle: 'Statistics & Probability', subtitleHi: 'सांख्यिकी और संभावना', subtitleTe: 'గణాంకాలు & సంభావ్యత',
    description: 'Where intuition meets math. Backtesting, statistical edge, probability distributions, Monte Carlo simulations, and data-driven trading.',
    descriptionHi: 'जहां अंतर्ज्ञान गणित से मिलता है। बैकटेस्टिंग, स्टैटिस्टिकल एज, प्रॉबेबिलिटी डिस्ट्रिब्यूशन।',
    descriptionTe: 'అంతర్జ్ఞానం గణితాన్ని కలిసే చోట. బ్యాక్‌టెస్టింగ్, స్టాటిస్టికల్ ఎడ్జ్, ప్రాబబిలిటీ.',
    icon: '📊', spirit: 'Numbers', color: '#06B6D4',
    bossName: 'The Random Walk', bossNameHi: 'रैंडम वॉक', bossNameTe: 'రాండమ్ వాక్',
    badgeEmoji: '📊', badgeTitle: 'Quant Sage', badgeTitleHi: 'क्वांट सेज', badgeTitleTe: 'క్వాంట్ సేజ్',
    sortOrder: 9
  },
  {
    realmNumber: 10, slug: 'trader-business', title: 'Trader Business', titleHi: 'ट्रेडर बिज़नेस', titleTe: 'ట్రేడర్ బిజినెస్',
    subtitle: 'Operations & Scaling', subtitleHi: 'ऑपरेशन और स्केलिंग', subtitleTe: 'ఆపరేషన్స్ & స్కేలింగ్',
    description: 'Trading is a business. Learn compliance, tax audits, P&L tracking, scaling strategies, and building a sustainable trading operation.',
    descriptionHi: 'ट्रेडिंग एक बिज़नेस है। कंप्लायंस, टैक्स ऑडिट, P&L ट्रैकिंग, स्केलिंग स्ट्रेटेजी सीखें।',
    descriptionTe: 'ట్రేడింగ్ ఒక వ్యాపారం. కాంప్లయెన్స్, పన్ను ఆడిట్, P&L ట్రాకింగ్ నేర్చుకోండి.',
    icon: '💼', spirit: 'Professional', color: '#78716C',
    bossName: 'The Tax Collector', bossNameHi: 'टैक्स कलेक्टर', bossNameTe: 'పన్ను వసూలుదారుడు',
    badgeEmoji: '💼', badgeTitle: 'Trading CEO', badgeTitleHi: 'ट्रेडिंग CEO', badgeTitleTe: 'ట్రేడింగ్ CEO',
    sortOrder: 10
  },
  {
    realmNumber: 11, slug: 'automation-lab', title: 'Automation Lab', titleHi: 'ऑटोमेशन लैब', titleTe: 'ఆటోమేషన్ ల్యాబ్',
    subtitle: 'APIs, Bots & Tools', subtitleHi: 'API, बॉट्स और टूल्स', subtitleTe: 'APIలు, బాట్లు & టూల్స్',
    description: 'Build your own trading tools. Pine Script, Python for traders, Power BI dashboards, Chrome extensions, API integrations, and trading bots.',
    descriptionHi: 'अपने खुद के ट्रेडिंग टूल बनाएं। पाइन स्क्रिप्ट, पायथन, पावर BI, क्रोम एक्सटेंशन, API।',
    descriptionTe: 'మీ స్వంత ట్రేడింగ్ టూల్స్‌ను నిర్మించండి. పైన్ స్క్రిప్ట్, పైథాన్, పవర్ BI, క్రోమ్ ఎక్స్‌టెన్షన్లు.',
    icon: '🔧', spirit: 'Builder', color: '#F97316',
    bossName: 'The Bug King', bossNameHi: 'बग किंग', bossNameTe: 'బగ్ కింగ్',
    badgeEmoji: '🔧', badgeTitle: 'Automation Forge', badgeTitleHi: 'ऑटोमेशन फोर्ज', badgeTitleTe: 'ఆటోమేషన్ ఫోర్జ్',
    sortOrder: 11
  },
  {
    realmNumber: 12, slug: 'market-legends', title: 'Market Legends', titleHi: 'मार्केट दिग्गज', titleTe: 'మార్కెట్ లెజెండ్స్',
    subtitle: 'History & Case Studies', subtitleHi: 'इतिहास और केस स्टडी', subtitleTe: 'చరిత్ర & కేస్ స్టడీలు',
    description: 'Those who don\'t learn from market history are doomed to repeat it. Harshad Mehta, COVID crash, flash crashes, and the greatest trades ever made.',
    descriptionHi: 'जो मार्केट के इतिहास से नहीं सीखते, वो उसे दोहराते हैं। हर्षद मेहता, COVID क्रैश, फ्लैश क्रैश।',
    descriptionTe: 'మార్కెట్ చరిత్ర నుండి నేర్చుకోనివారు దానిని పునరావృతం చేస్తారు.',
    icon: '📜', spirit: 'Lore', color: '#A855F7',
    bossName: 'The Ghost of Crashes Past', bossNameHi: 'पिछले क्रैश का भूत', bossNameTe: 'గత క్రాష్ ల భూతం',
    badgeEmoji: '📜', badgeTitle: 'Lore Keeper', badgeTitleHi: 'लोर कीपर', badgeTitleTe: 'లోర్ కీపర్',
    sortOrder: 12
  },
  {
    realmNumber: 13, slug: 'professional-careers', title: 'Professional Careers', titleHi: 'पेशेवर करियर', titleTe: 'ప్రొఫెషనల్ కెరీర్లు',
    subtitle: 'Institutional Path', subtitleHi: 'संस्थागत मार्ग', subtitleTe: 'సంస్థాగత మార్గం',
    description: 'Make trading your career. Prop firms, hedge funds, NISM certifications, CFA path, research analyst roles, and the institutional workflow.',
    descriptionHi: 'ट्रेडिंग को अपना करियर बनाएं। प्रॉप फर्म, हेज फंड, NISM सर्टिफिकेशन, CFA पाथ।',
    descriptionTe: 'ట్రేడింగ్‌ను మీ కెరీర్‌గా మార్చుకోండి. ప్రాప్ ఫర్మ్‌లు, హెడ్జ్ ఫండ్స్, NISM సర్టిఫికేషన్లు.',
    icon: '🏢', spirit: 'Career', color: '#0EA5E9',
    bossName: 'The Final Interview', bossNameHi: 'फाइनल इंटरव्यू', bossNameTe: 'ఫైనల్ ఇంటర్వ్యూ',
    badgeEmoji: '🏢', badgeTitle: 'Institutional Elite', badgeTitleHi: 'संस्थागत एलीट', badgeTitleTe: 'సంస్థాగత ఎలీట్',
    sortOrder: 13
  }
]

// ============================================================
// ~280 NODES ACROSS 13 REALMS
// ============================================================
const nodes: { realmNumber: number; nodeId: string; title: string; titleHi: string; titleTe: string; slug: string; subRealm: string; subRealmHi: string; subRealmTe: string; contentType: string; difficulty: string; xp: number; badge: string; badgeHi: string; badgeTe: string; }[] = [
  // ---- REALM 1: GENESIS (15 nodes) ----
  { realmNumber: 1, nodeId: 'R1-N1', title: 'The Arena: What is the Stock Market?', titleHi: 'अखाड़ा: स्टॉक मार्केट क्या है?', titleTe: 'రంగం: స్టాక్ మార్కెట్ అంటే ఏమిటి?', slug: 'what-is-stock-market', subRealm: 'Market Basics', subRealmHi: 'मार्केट बेसिक्स', subRealmTe: 'మార్కెట్ బేసిక్స్', contentType: 'Lesson', difficulty: 'Beginner', xp: 100, badge: 'First Steps', badgeHi: 'पहले कदम', badgeTe: 'మొదటి అడుగులు' },
  { realmNumber: 1, nodeId: 'R1-N2', title: 'The Exchanges: NSE, BSE & How They Work', titleHi: 'एक्सचेंज: NSE, BSE और उनका काम', titleTe: 'ఎక్స్ఛేంజీలు: NSE, BSE & అవి ఎలా పనిచేస్తాయి', slug: 'nse-bse-exchanges', subRealm: 'Market Basics', subRealmHi: 'मार्केट बेसिक्स', subRealmTe: 'మార్కెట్ బేసిక్స్', contentType: 'Lesson', difficulty: 'Beginner', xp: 100, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 1, nodeId: 'R1-N3', title: 'The Regulator: SEBI & Investor Protection', titleHi: 'नियामक: SEBI और निवेशक सुरक्षा', titleTe: 'నియంత్రకుడు: SEBI & పెట్టుబడిదారు రక్షణ', slug: 'sebi-regulator', subRealm: 'Market Basics', subRealmHi: 'मार्केट बेसिक्स', subRealmTe: 'మార్కెట్ బేసిక్స్', contentType: 'Lesson', difficulty: 'Beginner', xp: 100, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 1, nodeId: 'R1-N4', title: 'The Gateway: Demat & Trading Accounts', titleHi: 'गेटवे: डीमैट और ट्रेडिंग खाते', titleTe: 'గేట్‌వే: డీమ్యాట్ & ట్రేడింగ్ ఖాతాలు', slug: 'demat-trading-account', subRealm: 'Getting Started', subRealmHi: 'शुरुआत', subRealmTe: 'ప్రారంభం', contentType: 'Lesson', difficulty: 'Beginner', xp: 120, badge: 'Account Holder', badgeHi: 'खाता धारक', badgeTe: 'ఖాతా హోల్డర్' },
  { realmNumber: 1, nodeId: 'R1-N5', title: 'Market Participants: Who Trades & Why?', titleHi: 'मार्केट प्रतिभागी: कौन ट्रेड करता है?', titleTe: 'మార్కెట్ పాల్గొనేవారు: ఎవరు ట్రేడ్ చేస్తారు?', slug: 'market-participants', subRealm: 'Getting Started', subRealmHi: 'शुरुआत', subRealmTe: 'ప్రారంభం', contentType: 'Lesson', difficulty: 'Beginner', xp: 100, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 1, nodeId: 'R1-N6', title: 'Types of Orders: Market, Limit & More', titleHi: 'ऑर्डर के प्रकार: मार्केट, लिमिट और भी', titleTe: 'ఆర్డర్ రకాలు: మార్కెట్, లిమిట్ & మరిన్ని', slug: 'types-of-orders', subRealm: 'Getting Started', subRealmHi: 'शुरुआत', subRealmTe: 'ప్రారంభం', contentType: 'Lesson', difficulty: 'Beginner', xp: 120, badge: 'Order Master', badgeHi: 'ऑर्डर मास्टर', badgeTe: 'ఆర్డర్ మాస్టర్' },
  { realmNumber: 1, nodeId: 'R1-N7', title: 'Market Timings & Trading Sessions', titleHi: 'मार्केट समय और ट्रेडिंग सत्र', titleTe: 'మార్కెట్ సమయాలు & ట్రేడింగ్ సెషన్లు', slug: 'market-timings-sessions', subRealm: 'Getting Started', subRealmHi: 'शुरुआत', subRealmTe: 'ప్రారంభం', contentType: 'Lesson', difficulty: 'Beginner', xp: 80, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 1, nodeId: 'R1-N8', title: 'Understanding T+1 Settlement', titleHi: 'T+1 सेटलमेंट समझें', titleTe: 'T+1 సెటిల్‌మెంట్ అర్థం చేసుకోండి', slug: 't1-settlement', subRealm: 'Operations', subRealmHi: 'ऑपरेशन', subRealmTe: 'కార్యకలాపాలు', contentType: 'Lesson', difficulty: 'Beginner', xp: 100, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 1, nodeId: 'R1-N9', title: 'Indices Explained: Nifty 50 & Sensex', titleHi: 'इंडेक्स: निफ्टी 50 और सेंसेक्स', titleTe: 'ఇండెక్స్‌లు: నిఫ్టీ 50 & సెన్‌సెక్స్', slug: 'nifty-50-sensex-indices', subRealm: 'Market Basics', subRealmHi: 'मार्केट बेसिक्स', subRealmTe: 'మార్కెట్ బేసిక్స్', contentType: 'Lesson', difficulty: 'Beginner', xp: 100, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 1, nodeId: 'R1-N10', title: 'Stock Quotes: Reading a Trading Screen', titleHi: 'स्टॉक कोट: ट्रेडिंग स्क्रीन पढ़ना', titleTe: 'స్టాక్ కోట్స్: ట్రేడింగ్ స్క్రీన్ చదవడం', slug: 'reading-stock-quotes', subRealm: 'Getting Started', subRealmHi: 'शुरुआत', subRealmTe: 'ప్రారంభం', contentType: 'Lesson', difficulty: 'Beginner', xp: 100, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 1, nodeId: 'R1-N11', title: 'Bull vs Bear: Understanding Market Trends', titleHi: 'बुल बनाम बियर: मार्केट ट्रेंड समझें', titleTe: 'బుల్ vs బేర్: మార్కెట్ ట్రెండ్‌లు', slug: 'bull-bear-market-trends', subRealm: 'Market Basics', subRealmHi: 'मार्केट बेसिक्स', subRealmTe: 'మార్కెట్ బేసిక్స్', contentType: 'Lesson', difficulty: 'Beginner', xp: 100, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 1, nodeId: 'R1-N12', title: 'IPO: How Companies Go Public', titleHi: 'IPO: कंपनियां पब्लिक कैसे होती हैं', titleTe: 'IPO: కంపెనీలు పబ్లిక్ ఎలా అవుతాయి', slug: 'ipo-how-companies-go-public', subRealm: 'Getting Started', subRealmHi: 'शुरुआत', subRealmTe: 'ప్రారంభం', contentType: 'Lesson', difficulty: 'Beginner', xp: 120, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 1, nodeId: 'R1-N13', title: 'Brokerage & Charges: The Real Cost of Trading', titleHi: 'ब्रोकरेज और शुल्क: ट्रेडिंग की असली लागत', titleTe: 'బ్రోకరేజ్ & ఛార్జీలు: ట్రేడింగ్ నిజమైన ఖర్చు', slug: 'brokerage-charges-cost', subRealm: 'Operations', subRealmHi: 'ऑपरेशन', subRealmTe: 'కార్యకలాపాలు', contentType: 'Lesson', difficulty: 'Beginner', xp: 120, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 1, nodeId: 'R1-N14', title: 'Circuit Breakers & Trading Halts', titleHi: 'सर्किट ब्रेकर और ट्रेडिंग रोक', titleTe: 'సర్క్యూట్ బ్రేకర్లు & ట్రేడింగ్ హాల్ట్‌లు', slug: 'circuit-breakers-trading-halts', subRealm: 'Operations', subRealmHi: 'ऑपरेशन', subRealmTe: 'కార్యకలాపాలు', contentType: 'Lesson', difficulty: 'Beginner', xp: 100, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 1, nodeId: 'R1-N15', title: 'Boss Battle: Genesis Final Exam', titleHi: 'बॉस बैटल: जेनेसिस फाइनल परीक्षा', titleTe: 'బాస్ బాటిల్: జెనెసిస్ ఫైనల్ పరీక్ష', slug: 'genesis-final-exam', subRealm: 'Boss', subRealmHi: 'बॉस', subRealmTe: 'బాస్', contentType: 'Certification', difficulty: 'Beginner', xp: 200, badge: 'Genesis Survivor', badgeHi: 'जेनेसिस सर्वाइवर', badgeTe: 'జెనెసిస్ సర్వైవర్' },

  // ---- REALM 2: ART OF WAR - Technical Analysis (25 nodes) ----
  { realmNumber: 2, nodeId: 'R2-N1', title: 'Candlestick Anatomy: Reading the Language of Price', titleHi: 'कैंडलस्टिक: प्राइस की भाषा पढ़ना', titleTe: 'క్యాండిల్‌స్టిక్: ధర భాషను చదవడం', slug: 'candlestick-anatomy', subRealm: 'Candlesticks', subRealmHi: 'कैंडलस्टिक', subRealmTe: 'క్యాండిల్‌స్టిక్‌లు', contentType: 'Lesson', difficulty: 'Beginner', xp: 120, badge: 'Candle Reader', badgeHi: 'कैंडल रीडर', badgeTe: 'క్యాండిల్ రీడర్' },
  { realmNumber: 2, nodeId: 'R2-N2', title: 'Single Candle Patterns: Doji, Hammer, Marubozu', titleHi: 'सिंगल कैंडल: डोजी, हैमर, मारुबोज़ू', titleTe: 'సింగిల్ క్యాండిల్: డోజీ, హామర్, మారుబోజు', slug: 'single-candle-patterns', subRealm: 'Candlesticks', subRealmHi: 'कैंडलस्टिक', subRealmTe: 'క్యాండిల్‌స్టిక్‌లు', contentType: 'Lesson', difficulty: 'Beginner', xp: 120, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N3', title: 'Multi-Candle Patterns: Engulfing, Harami, Morning Star', titleHi: 'मल्टी-कैंडल: एनगल्फिंग, हरामी, मॉर्निंग स्टार', titleTe: 'మల్టీ-క్యాండిల్: ఎన్‌గల్ఫింగ్, హరామి, మార్నింగ్ స్టార్', slug: 'multi-candle-patterns', subRealm: 'Candlesticks', subRealmHi: 'कैंडलस्टिक', subRealmTe: 'క్యాండిల్‌స్టిక్‌లు', contentType: 'Lesson', difficulty: 'Intermediate', xp: 140, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N4', title: 'Price Action: Trading Without Indicators', titleHi: 'प्राइस एक्शन: इंडिकेटर के बिना ट्रेडिंग', titleTe: 'ప్రైస్ యాక్షన్: ఇండికేటర్లు లేకుండా ట్రేడింగ్', slug: 'price-action-trading', subRealm: 'Price Action', subRealmHi: 'प्राइस एक्शन', subRealmTe: 'ప్రైస్ యాక్షన్', contentType: 'Lesson', difficulty: 'Intermediate', xp: 150, badge: 'Price Reader', badgeHi: 'प्राइस रीडर', badgeTe: 'ప్రైస్ రీడర్' },
  { realmNumber: 2, nodeId: 'R2-N5', title: 'Support & Resistance: The Invisible Walls', titleHi: 'सपोर्ट और रेजिस्टेंस: अदृश्य दीवारें', titleTe: 'సపోర్ట్ & రెసిస్టెన్స్: అదృశ్య గోడలు', slug: 'support-resistance', subRealm: 'Price Action', subRealmHi: 'प्राइस एक्शन', subRealmTe: 'ప్రైస్ యాక్షన్', contentType: 'Lesson', difficulty: 'Intermediate', xp: 150, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N6', title: 'Trendlines & Channels: Drawing the Path', titleHi: 'ट्रेंडलाइन और चैनल: रास्ता बनाना', titleTe: 'ట్రెండ్‌లైన్లు & చానెల్లు: మార్గం గీయడం', slug: 'trendlines-channels', subRealm: 'Price Action', subRealmHi: 'प्राइस एक्शन', subRealmTe: 'ప్రైస్ యాక్షన్', contentType: 'Lesson', difficulty: 'Intermediate', xp: 140, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N7', title: 'Moving Averages: SMA, EMA & Their Power', titleHi: 'मूविंग एवरेज: SMA, EMA और उनकी शक्ति', titleTe: 'మూవింగ్ యావరేజెస్: SMA, EMA & వాటి శక్తి', slug: 'moving-averages-sma-ema', subRealm: 'Indicators', subRealmHi: 'इंडिकेटर', subRealmTe: 'ఇండికేటర్లు', contentType: 'Lesson', difficulty: 'Intermediate', xp: 130, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N8', title: 'RSI: Relative Strength Index Deep Dive', titleHi: 'RSI: रिलेटिव स्ट्रेंथ इंडेक्स', titleTe: 'RSI: రిలేటివ్ స్ట్రెంత్ ఇండెక్స్', slug: 'rsi-relative-strength-index', subRealm: 'Indicators', subRealmHi: 'इंडिकेटर', subRealmTe: 'ఇండికేటర్లు', contentType: 'Lesson', difficulty: 'Intermediate', xp: 140, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N9', title: 'MACD: Momentum & Trend Following', titleHi: 'MACD: मोमेंटम और ट्रेंड फॉलोइंग', titleTe: 'MACD: మొమెంటం & ట్రెండ్ ఫాలోయింగ్', slug: 'macd-momentum-trend', subRealm: 'Indicators', subRealmHi: 'इंडिकेटर', subRealmTe: 'ఇండికేటర్లు', contentType: 'Lesson', difficulty: 'Intermediate', xp: 140, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N10', title: 'Bollinger Bands: Volatility Squeeze & Expansion', titleHi: 'बोलिंजर बैंड्स: वोलैटिलिटी स्क्वीज़', titleTe: 'బోలింజర్ బ్యాండ్లు: వోలాటిలిటీ స్క్వీజ్', slug: 'bollinger-bands-volatility', subRealm: 'Indicators', subRealmHi: 'इंडिकेटर', subRealmTe: 'ఇండికేటర్లు', contentType: 'Lesson', difficulty: 'Intermediate', xp: 140, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N11', title: 'Volume Analysis: The Fuel Behind Moves', titleHi: 'वॉल्यूम एनालिसिस: मूव के पीछे का ईंधन', titleTe: 'వాల్యూమ్ అనాలిసిస్: మూవ్ వెనుక ఇంధనం', slug: 'volume-analysis', subRealm: 'Price Action', subRealmHi: 'प्राइस एक्शन', subRealmTe: 'ప్రైస్ యాక్షన్', contentType: 'Lesson', difficulty: 'Intermediate', xp: 130, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N12', title: 'Chart Patterns: Head & Shoulders, Double Top/Bottom', titleHi: 'चार्ट पैटर्न: हेड एंड शोल्डर, डबल टॉप', titleTe: 'చార్ట్ నమూనాలు: హెడ్ & షోల్డర్, డబుల్ టాప్', slug: 'chart-patterns-reversal', subRealm: 'Patterns', subRealmHi: 'पैटर्न', subRealmTe: 'నమూనాలు', contentType: 'Lesson', difficulty: 'Intermediate', xp: 150, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N13', title: 'Continuation Patterns: Flags, Pennants, Triangles', titleHi: 'कंटिन्यूएशन पैटर्न: फ्लैग, पेनेंट, ट्रायंगल', titleTe: 'కొనసాగుతున్న నమూనాలు: ఫ్లాగ్‌లు, పెన్నంట్‌లు', slug: 'continuation-patterns', subRealm: 'Patterns', subRealmHi: 'पैटर्न', subRealmTe: 'నమూనాలు', contentType: 'Lesson', difficulty: 'Intermediate', xp: 140, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N14', title: 'VWAP: The Institutional Benchmark', titleHi: 'VWAP: संस्थागत बेंचमार्क', titleTe: 'VWAP: సంస్థాగత బెంచ్‌మార్క్', slug: 'vwap-institutional-benchmark', subRealm: 'Indicators', subRealmHi: 'इंडिकेटर', subRealmTe: 'ఇండికేటర్లు', contentType: 'Lesson', difficulty: 'Intermediate', xp: 130, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N15', title: 'Fibonacci Retracement: Nature\'s Trading Tool', titleHi: 'फिबोनैचि रिट्रेसमेंट', titleTe: 'ఫిబోనాచీ రిట్రేస్‌మెంట్', slug: 'fibonacci-retracement', subRealm: 'Indicators', subRealmHi: 'इंडिकेटर', subRealmTe: 'ఇండికేటర్లు', contentType: 'Lesson', difficulty: 'Intermediate', xp: 140, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N16', title: 'Stochastic Oscillator & CCI', titleHi: 'स्टोकेस्टिक ऑसिलेटर और CCI', titleTe: 'స్టోకాస్టిక్ ఆసిలేటర్ & CCI', slug: 'stochastic-cci', subRealm: 'Indicators', subRealmHi: 'इंडिकेटर', subRealmTe: 'ఇండికేటర్లు', contentType: 'Lesson', difficulty: 'Intermediate', xp: 120, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N17', title: 'Ichimoku Cloud: The Complete System', titleHi: 'इचिमोकु क्लाउड: पूर्ण प्रणाली', titleTe: 'ఇచిమోకు క్లౌడ్: పూర్తి వ్యవస్థ', slug: 'ichimoku-cloud-system', subRealm: 'Indicators', subRealmHi: 'इंडिकेटर', subRealmTe: 'ఇండికేటర్లు', contentType: 'Lesson', difficulty: 'Advanced', xp: 180, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N18', title: 'Supertrend & ATR-Based Indicators', titleHi: 'सुपरट्रेंड और ATR इंडिकेटर', titleTe: 'సూపర్‌ట్రెండ్ & ATR ఇండికేటర్లు', slug: 'supertrend-atr-indicators', subRealm: 'Indicators', subRealmHi: 'इंडिकेटर', subRealmTe: 'ఇండికేటర్లు', contentType: 'Lesson', difficulty: 'Intermediate', xp: 130, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N19', title: 'Multiple Timeframe Analysis', titleHi: 'मल्टीपल टाइमफ्रेम एनालिसिस', titleTe: 'మల్టిపుల్ టైమ్‌ఫ్రేమ్ అనాలిసిస్', slug: 'multiple-timeframe-analysis', subRealm: 'Price Action', subRealmHi: 'प्राइस एक्शन', subRealmTe: 'ప్రైస్ యాక్షన్', contentType: 'Lesson', difficulty: 'Advanced', xp: 160, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N20', title: 'Divergence: When Price & Indicator Disagree', titleHi: 'डाइवर्जेंस: जब प्राइस और इंडिकेटर अलग हों', titleTe: 'డైవర్జెన్స్: ధర & ఇండికేటర్ విభేదించినప్పుడు', slug: 'divergence-trading', subRealm: 'Indicators', subRealmHi: 'इंडिकेटर', subRealmTe: 'ఇండికేటర్లు', contentType: 'Lesson', difficulty: 'Advanced', xp: 160, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N21', title: 'Pivot Points: Classic & Camarilla', titleHi: 'पिवट पॉइंट: क्लासिक और कैमरिला', titleTe: 'పివోట్ పాయింట్లు: క్లాసిక్ & కమరిల్లా', slug: 'pivot-points-classic-camarilla', subRealm: 'Indicators', subRealmHi: 'इंडिकेटर', subRealmTe: 'ఇండికేటర్లు', contentType: 'Lesson', difficulty: 'Intermediate', xp: 120, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N22', title: 'Gap Analysis: Breakaway, Runaway & Exhaustion', titleHi: 'गैप एनालिसिस: ब्रेकअवे, रनअवे और एक्सॉस्टन', titleTe: 'గ్యాప్ అనాలిసిస్: బ్రేక్‌అవే, రన్‌అవే & ఎగ్జాస్ట్', slug: 'gap-analysis-types', subRealm: 'Price Action', subRealmHi: 'प्राइस एक्शन', subRealmTe: 'ప్రైస్ యాక్షన్', contentType: 'Lesson', difficulty: 'Intermediate', xp: 130, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N23', title: 'Open Interest Analysis for Futures', titleHi: 'फ्यूचर्स के लिए ओपन इंटरेस्ट एनालिसिस', titleTe: 'ఫ్యూచర్స్ కోసం ఓపెన్ ఇంట్రెస్ట్ అనాలిసిస్', slug: 'open-interest-futures', subRealm: 'Price Action', subRealmHi: 'प्राइस एक्शन', subRealmTe: 'ప్రైస్ యాక్షన్', contentType: 'Lesson', difficulty: 'Advanced', xp: 160, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N24', title: 'Advanced Candlestick: Heikin Ashi & Renko', titleHi: 'एडवांस कैंडल: हाइकिन आशी और रेन्को', titleTe: 'అడ్వాన్స్డ్ క్యాండిల్: హైకిన్ ఆషి & రెంకో', slug: 'heikin-ashi-renko-charts', subRealm: 'Candlesticks', subRealmHi: 'कैंडलस्टिक', subRealmTe: 'క్యాండిల్‌స్టిక్‌లు', contentType: 'Lesson', difficulty: 'Advanced', xp: 160, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 2, nodeId: 'R2-N25', title: 'Boss Battle: Art of War Final Exam', titleHi: 'बॉस बैटल: युद्ध कला फाइनल परीक्षा', titleTe: 'బాస్ బాటిల్: యుద్ధ కళ ఫైనల్ పరీక్ష', slug: 'art-of-war-final-exam', subRealm: 'Boss', subRealmHi: 'बॉस', subRealmTe: 'బాస్', contentType: 'Certification', difficulty: 'Intermediate', xp: 300, badge: 'Chart Warrior', badgeHi: 'चार्ट योद्धा', badgeTe: 'చార్ట్ వారియర్' },

  // ---- REALM 3: THE SHIELD - Fundamental Analysis (20 nodes) ----
  { realmNumber: 3, nodeId: 'R3-N1', title: 'What is Fundamental Analysis?', titleHi: 'फंडामेंटल एनालिसिस क्या है?', titleTe: 'ఫండమెంటల్ అనాలిసిస్ అంటే ఏమిటి?', slug: 'what-is-fundamental-analysis', subRealm: 'Basics', subRealmHi: 'बेसिक्स', subRealmTe: 'బేసిక్స్', contentType: 'Lesson', difficulty: 'Beginner', xp: 100, badge: 'Fundamentalist', badgeHi: 'फंडामेंटलिस्ट', badgeTe: 'ఫండమెంటలిస్ట్' },
  { realmNumber: 3, nodeId: 'R3-N2', title: 'Reading a Balance Sheet Like a Pro', titleHi: 'बैलेंस शीट प्रो की तरह पढ़ें', titleTe: 'బ్యాలెన్స్ షీట్ ప్రో లాగా చదవడం', slug: 'reading-balance-sheet', subRealm: 'Financial Statements', subRealmHi: 'वित्तीय विवरण', subRealmTe: 'ఆర్థిక ప్రకటనలు', contentType: 'Lesson', difficulty: 'Intermediate', xp: 150, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 3, nodeId: 'R3-N3', title: 'Income Statement & Profit Analysis', titleHi: 'आय विवरण और लाभ विश्लेषण', titleTe: 'ఆదాయ ప్రకటన & లాభ విశ్లేషణ', slug: 'income-statement-profit', subRealm: 'Financial Statements', subRealmHi: 'वित्तीय विवरण', subRealmTe: 'ఆర్థిక ప్రకటనలు', contentType: 'Lesson', difficulty: 'Intermediate', xp: 150, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 3, nodeId: 'R3-N4', title: 'Cash Flow Statement: The Truth Teller', titleHi: 'कैश फ्लो: सच बोलने वाला', titleTe: 'క్యాష్ ఫ్లో: సత్యం చెప్పేది', slug: 'cash-flow-statement', subRealm: 'Financial Statements', subRealmHi: 'वित्तीय विवरण', subRealmTe: 'ఆర్థిక ప్రకటనలు', contentType: 'Lesson', difficulty: 'Intermediate', xp: 140, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 3, nodeId: 'R3-N5', title: 'Key Ratios: P/E, P/B, ROE, ROCE & More', titleHi: 'मुख्य अनुपात: P/E, P/B, ROE, ROCE', titleTe: 'కీ రేషియోలు: P/E, P/B, ROE, ROCE', slug: 'key-financial-ratios', subRealm: 'Ratios', subRealmHi: 'अनुपात', subRealmTe: 'నిష్పత్తులు', contentType: 'Lesson', difficulty: 'Intermediate', xp: 160, badge: 'Ratio Master', badgeHi: 'रेश्यो मास्टर', badgeTe: 'రేషియో మాస్టర్' },
  { realmNumber: 3, nodeId: 'R3-N6', title: 'Debt Analysis: Is the Company Safe?', titleHi: 'कर्ज विश्लेषण: क्या कंपनी सुरक्षित है?', titleTe: 'రుణ విశ్లేషణ: కంపెనీ సురక్షితమా?', slug: 'debt-analysis-company-safety', subRealm: 'Ratios', subRealmHi: 'अनुपात', subRealmTe: 'నిష్పత్తులు', contentType: 'Lesson', difficulty: 'Intermediate', xp: 140, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 3, nodeId: 'R3-N7', title: 'Sector Analysis: IT, Banking, Pharma & More', titleHi: 'सेक्टर एनालिसिस: IT, बैंकिंग, फार्मा', titleTe: 'రంగ విశ్లేషణ: IT, బ్యాంకింగ్, ఫార్మా', slug: 'sector-analysis-india', subRealm: 'Sectors', subRealmHi: 'सेक्टर', subRealmTe: 'రంగాలు', contentType: 'Lesson', difficulty: 'Intermediate', xp: 140, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 3, nodeId: 'R3-N8', title: 'Moat Analysis: Competitive Advantages', titleHi: 'मोट एनालिसिस: प्रतिस्पर्धात्मक लाभ', titleTe: 'మోట్ అనాలిసిస్: పోటీ ప్రయోజనాలు', slug: 'moat-competitive-advantage', subRealm: 'Valuation', subRealmHi: 'मूल्यांकन', subRealmTe: 'మూల్యాంకనం', contentType: 'Lesson', difficulty: 'Intermediate', xp: 150, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 3, nodeId: 'R3-N9', title: 'Intrinsic Value: DCF & Relative Valuation', titleHi: 'आंतरिक मूल्य: DCF और रिलेटिव वैल्यूएशन', titleTe: 'అంతర్గత విలువ: DCF & రిలేటివ్ వాల్యుయేషన్', slug: 'intrinsic-value-dcf', subRealm: 'Valuation', subRealmHi: 'मूल्यांकन', subRealmTe: 'మూల్యాంకనం', contentType: 'Lesson', difficulty: 'Advanced', xp: 180, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 3, nodeId: 'R3-N10', title: 'Management Quality & Corporate Governance', titleHi: 'मैनेजमेंट और कॉर्पोरेट गवर्नेंस', titleTe: 'మేనేజ్‌మెంట్ & కార్పొరేట్ గవర్నెన్స్', slug: 'management-corporate-governance', subRealm: 'Quality', subRealmHi: 'गुणवत्ता', subRealmTe: 'నాణ్యత', contentType: 'Lesson', difficulty: 'Intermediate', xp: 130, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 3, nodeId: 'R3-N11', title: 'Dividend Analysis & Yield Investing', titleHi: 'डिविडेंड एनालिसिस और यील्ड इन्वेस्टिंग', titleTe: 'డివిడెండ్ అనాలిసిస్ & యీల్డ్ ఇన్వెస్టింగ్', slug: 'dividend-yield-investing', subRealm: 'Valuation', subRealmHi: 'मूल्यांकन', subRealmTe: 'మూల్యాంకనం', contentType: 'Lesson', difficulty: 'Intermediate', xp: 130, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 3, nodeId: 'R3-N12', title: 'Economic Moats: Warren Buffett\'s Method', titleHi: 'इकोनॉमिक मोट: वारेन बफे का तरीका', titleTe: 'ఎకనామిక్ మోట్స్: వారెన్ బఫెట్ పద్ధతి', slug: 'economic-moats-buffett', subRealm: 'Valuation', subRealmHi: 'मूल्यांकन', subRealmTe: 'మూల్యాంకనం', contentType: 'Lesson', difficulty: 'Advanced', xp: 160, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 3, nodeId: 'R3-N13', title: 'Reading Annual Reports: The QR Method', titleHi: 'वार्षिक रिपोर्ट: QR मेथड', titleTe: 'వార్షిక నివేదికలు: QR పద్ధతి', slug: 'reading-annual-reports', subRealm: 'Financial Statements', subRealmHi: 'वित्तीय विवरण', subRealmTe: 'ఆర్థిక ప్రకటనలు', contentType: 'Lesson', difficulty: 'Advanced', xp: 150, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 3, nodeId: 'R3-N14', title: 'Macro Economics for Stock Markets', titleHi: 'स्टॉक मार्केट के लिए मैक्रो इकोनॉमिक्स', titleTe: 'స్టాక్ మార్కెట్‌ల కోసం మాక్రో ఎకనామిక్స్', slug: 'macro-economics-markets', subRealm: 'Economy', subRealmHi: 'अर्थव्यवस्था', subRealmTe: 'ఆర్థిక వ్యవస్థ', contentType: 'Lesson', difficulty: 'Intermediate', xp: 140, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 3, nodeId: 'R3-N15', title: 'RBI Policy, Interest Rates & Market Impact', titleHi: 'RBI नीति, ब्याज दर और मार्केट प्रभाव', titleTe: 'RBI విధానం, వడ్డీ రేట్లు & మార్కెట్ ప్రభావం', slug: 'rbi-policy-interest-rates', subRealm: 'Economy', subRealmHi: 'अर्थव्यवस्था', subRealmTe: 'ఆర్థిక వ్యవస్థ', contentType: 'Lesson', difficulty: 'Intermediate', xp: 130, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 3, nodeId: 'R3-N16', title: 'Screener.in: Finding Quality Stocks', titleHi: 'Screener.in: क्वालिटी स्टॉक्स ढूंढना', titleTe: 'Screener.in: క్వాలిటీ స్టాక్‌లను కనుగొనడం', slug: 'screener-finding-stocks', subRealm: 'Tools', subRealmHi: 'टूल्स', subRealmTe: 'టూల్స్', contentType: 'Tool', difficulty: 'Intermediate', xp: 120, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 3, nodeId: 'R3-N17', title: 'Ticking Ratio: The Complete Checklist', titleHi: 'टिकिंग रेश्यो: पूर्ण चेकलिस्ट', titleTe: 'టికింగ్ రేషియో: పూర్తి చెక్‌లిస్ట్', slug: 'ticking-ratio-checklist', subRealm: 'Ratios', subRealmHi: 'अनुपात', subRealmTe: 'నిష్పత్తులు', contentType: 'Checklist', difficulty: 'Advanced', xp: 150, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 3, nodeId: 'R3-N18', title: 'EPS, DPS & Shareholder Value', titleHi: 'EPS, DPS और शेयरहोल्डर वैल्यू', titleTe: 'EPS, DPS & షేర్‌హోల్డర్ విలువ', slug: 'eps-dps-shareholder-value', subRealm: 'Ratios', subRealmHi: 'अनुपात', subRealmTe: 'నిష్పత్తులు', contentType: 'Lesson', difficulty: 'Intermediate', xp: 130, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 3, nodeId: 'R3-N19', title: 'IPO Analysis: Should You Subscribe?', titleHi: 'IPO एनालिसिस: क्या सब्सक्राइब करें?', titleTe: 'IPO విశ్లేషణ: సబ్‌స్క్రైబ్ చేయాలా?', slug: 'ipo-analysis-subscribe', subRealm: 'Valuation', subRealmHi: 'मूल्यांकन', subRealmTe: 'మూల్యాంకనం', contentType: 'Lesson', difficulty: 'Intermediate', xp: 140, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 3, nodeId: 'R3-N20', title: 'Boss Battle: The Shield Final Exam', titleHi: 'बॉस बैटल: ढाल फाइनल परीक्षा', titleTe: 'బాస్ బాటిల్: ఢలం ఫైనల్ పరీక్ష', slug: 'the-shield-final-exam', subRealm: 'Boss', subRealmHi: 'बॉस', subRealmTe: 'బాస్', contentType: 'Certification', difficulty: 'Intermediate', xp: 250, badge: 'Fundamental Guardian', badgeHi: 'फंडामेंटल गार्जियन', badgeTe: 'ఫండమెంటల్ గార్డియన్' },

  // ---- REALM 4: BOSS REALM - Derivatives (30 nodes) ----
  { realmNumber: 4, nodeId: 'R4-N1', title: 'What Are Derivatives? Futures & Options Intro', titleHi: 'डेरिवेटिव्स क्या हैं? फ्यूचर्स और ऑप्शन परिचय', titleTe: 'డెరివేటివ్స్ అంటే ఏమిటి? ఫ్యూచర్స్ & ఆప్షన్స్ పరిచయం', slug: 'derivatives-futures-options-intro', subRealm: 'Basics', subRealmHi: 'बेसिक्स', subRealmTe: 'బేసిక్స్', contentType: 'Lesson', difficulty: 'Intermediate', xp: 130, badge: 'Derivative Initiate', badgeHi: 'डेरिवेटिव इनिशिएट', badgeTe: 'డెరివేటివ్ ఇనిషియేట్' },
  { realmNumber: 4, nodeId: 'R4-N2', title: 'Futures Contracts: Margin, Lot Size & Settlement', titleHi: 'फ्यूचर्स कॉन्ट्रैक्ट: मार्जिन, लॉट साइज', titleTe: 'ఫ్యూచర్స్ కాంట్రాక్ట్లు: మార్జిన్, లాట్ సైజ్', slug: 'futures-contracts-margin', subRealm: 'Futures', subRealmHi: 'फ्यूचर्स', subRealmTe: 'ఫ్యూచర్స్', contentType: 'Lesson', difficulty: 'Intermediate', xp: 150, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N3', title: 'Options 101: Calls, Puts & Premium', titleHi: 'ऑप्शन 101: कॉल, पुट और प्रीमियम', titleTe: 'ఆప్షన్స్ 101: కాల్స్, పుట్స్ & ప్రీమియం', slug: 'options-calls-puts-premium', subRealm: 'Options', subRealmHi: 'ऑप्शन', subRealmTe: 'ఆప్షన్స్', contentType: 'Lesson', difficulty: 'Intermediate', xp: 150, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N4', title: 'Option Moneyness: ITM, ATM, OTM', titleHi: 'ऑप्शन मनीनेस: ITM, ATM, OTM', titleTe: 'ఆప్షన్ మనీనెస్: ITM, ATM, OTM', slug: 'option-moneyness-itm-atm-otm', subRealm: 'Options', subRealmHi: 'ऑप्शन', subRealmTe: 'ఆప్షన్స్', contentType: 'Lesson', difficulty: 'Intermediate', xp: 130, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N5', title: 'Delta: The Rate of Change', titleHi: 'डेल्टा: परिवर्तन की दर', titleTe: 'డెల్టా: మార్పు రేటు', slug: 'delta-option-greek', subRealm: 'Greeks', subRealmHi: 'ग्रीक्स', subRealmTe: 'గ్రీక్స్', contentType: 'Lesson', difficulty: 'Intermediate', xp: 150, badge: 'Greek Explorer', badgeHi: 'ग्रीक एक्सप्लोरर', badgeTe: 'గ్రీక్ ఎక్స్‌ప్లోరర్' },
  { realmNumber: 4, nodeId: 'R4-N6', title: 'Gamma: The Accelerator', titleHi: 'गामा: त्वरक', titleTe: 'గామా: యాక్సిలరేటర్', slug: 'gamma-option-greek', subRealm: 'Greeks', subRealmHi: 'ग्रीक्स', subRealmTe: 'గ్రీక్స్', contentType: 'Lesson', difficulty: 'Advanced', xp: 170, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N7', title: 'Theta: Time Decay — The Silent Killer', titleHi: 'थीटा: टाइम डीके — चुपके से मारने वाला', titleTe: 'థీటా: టైమ్ డీకే — నిశ్శబ్ద హంతకుడు', slug: 'theta-time-decay', subRealm: 'Greeks', subRealmHi: 'ग्रीक्स', subRealmTe: 'గ్రీక్స్', contentType: 'Lesson', difficulty: 'Advanced', xp: 170, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N8', title: 'Vega: Volatility Sensitivity', titleHi: 'वेगा: वोलैटिलिटी संवेदनशीलता', titleTe: 'వేగా: వోలాటిలిటీ సున్నితత్వం', slug: 'vega-volatility-sensitivity', subRealm: 'Greeks', subRealmHi: 'ग्रीक्स', subRealmTe: 'గ్రీక్స్', contentType: 'Lesson', difficulty: 'Advanced', xp: 170, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N9', title: 'Option Chain: Reading the Battlefield Map', titleHi: 'ऑप्शन चेन: युद्ध का नक्शा पढ़ना', titleTe: 'ఆప్షన్ చైన్: యుద్ధ భూమి మ్యాప్', slug: 'option-chain-reading', subRealm: 'Options', subRealmHi: 'ऑप्शन', subRealmTe: 'ఆప్షన్స్', contentType: 'Lesson', difficulty: 'Intermediate', xp: 160, badge: 'Chain Reader', badgeHi: 'चेन रीडर', badgeTe: 'చైన్ రీడర్' },
  { realmNumber: 4, nodeId: 'R4-N10', title: 'Open Interest & PCR Analysis', titleHi: 'ओपन इंटरेस्ट और PCR एनालिसिस', titleTe: 'ఓపెన్ ఇంట్రెస్ట్ & PCR అనాలిసిస్', slug: 'open-interest-pcr-analysis', subRealm: 'Options', subRealmHi: 'ऑप्शन', subRealmTe: 'ఆప్షన్స్', contentType: 'Lesson', difficulty: 'Advanced', xp: 160, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N11', title: 'Option Buying vs Selling: Risk & Reward', titleHi: 'ऑप्शन बायिंग बनाम सेलिंग', titleTe: 'ఆప్షన్ కొనడం vs అమ్మడం', slug: 'option-buying-vs-selling', subRealm: 'Strategies', subRealmHi: 'रणनीतियाँ', subRealmTe: 'వ్యూహాలు', contentType: 'Lesson', difficulty: 'Intermediate', xp: 150, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N12', title: 'Bull Call Spread & Bear Put Spread', titleHi: 'बुल कॉल स्प्रेड और बियर पुट स्प्रेड', titleTe: 'బుల్ కాల్ స్ప్రెడ్ & బేర్ పుట్ స్ప్రెడ్', slug: 'bull-call-bear-put-spread', subRealm: 'Strategies', subRealmHi: 'रणनीतियाँ', subRealmTe: 'వ్యూహాలు', contentType: 'Lesson', difficulty: 'Advanced', xp: 170, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N13', title: 'Iron Condor: The Neutral Strategy', titleHi: 'आयरन कंडोर: न्यूट्रल स्ट्रेटेजी', titleTe: 'ఐరన్ కాండర్: న్యూట్రల్ వ్యూహం', slug: 'iron-condor-strategy', subRealm: 'Strategies', subRealmHi: 'रणनीतियाँ', subRealmTe: 'వ్యూహాలు', contentType: 'Lesson', difficulty: 'Advanced', xp: 180, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N14', title: 'Straddle & Strangle: Volatility Plays', titleHi: 'स्ट्रैडल और स्ट्रैंगल: वोलैटिलिटी प्ले', titleTe: 'స్ట్రాడిల్ & స్ట్రాంగిల్: వోలాటిలిటీ ప్లేలు', slug: 'straddle-strangle-volatility', subRealm: 'Strategies', subRealmHi: 'रणनीतियाँ', subRealmTe: 'వ్యూహాలు', contentType: 'Lesson', difficulty: 'Advanced', xp: 170, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N15', title: 'Covered Call & Protective Put', titleHi: 'कवर्ड कॉल और प्रोटेक्टिव पुट', titleTe: 'కవర్డ్ కాల్ & ప్రొటెక్టివ్ పుట్', slug: 'covered-call-protective-put', subRealm: 'Strategies', subRealmHi: 'रणनीतियाँ', subRealmTe: 'వ్యూహాలు', contentType: 'Lesson', difficulty: 'Intermediate', xp: 150, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N16', title: 'Futures Spread Trading: Calendar & Inter-Commodity', titleHi: 'फ्यूचर्स स्प्रेड: कैलेंडर और इंटर-कमोडिटी', titleTe: 'ఫ్యూచర్స్ స్ప్రెడ్: క్యాలెండర్ & ఇంటర్-కమోడిటీ', slug: 'futures-spread-trading', subRealm: 'Futures', subRealmHi: 'फ्यूचर्स', subRealmTe: 'ఫ్యూచర్స్', contentType: 'Lesson', difficulty: 'Advanced', xp: 170, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N17', title: 'Margin Trading & Leverage: Double-Edged Sword', titleHi: 'मार्जिन ट्रेडिंग और लीवरेज', titleTe: 'మార్జిన్ ట్రేడింగ్ & లివరేజ్', slug: 'margin-trading-leverage', subRealm: 'Futures', subRealmHi: 'फ्यूचर्स', subRealmTe: 'ఫ్యూచర్స్', contentType: 'Lesson', difficulty: 'Intermediate', xp: 150, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N18', title: 'Weekly vs Monthly Expiry: Strategies', titleHi: 'वीकली बनाम मंथली एक्सपायरी', titleTe: 'వీక్లీ vs మంత్లీ ఎక్స్‌పైరీ', slug: 'weekly-monthly-expiry', subRealm: 'Options', subRealmHi: 'ऑप्शन', subRealmTe: 'ఆప్షన్స్', contentType: 'Lesson', difficulty: 'Intermediate', xp: 140, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N19', title: 'Implied Volatility & VIX', titleHi: 'इम्प्लाइड वोलैटिलिटी और VIX', titleTe: 'ఇంప్లైడ్ వోలాటిలిటీ & VIX', slug: 'implied-volatility-vix', subRealm: 'Greeks', subRealmHi: 'ग्रीक्स', subRealmTe: 'గ్రీక్స్', contentType: 'Lesson', difficulty: 'Advanced', xp: 170, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N20', title: 'Option Pricing: Black-Scholes Simplified', titleHi: 'ऑप्शन प्राइसिंग: ब्लैक-स्कोल्स', titleTe: 'ఆప్షన్ ప్రైసింగ్: బ్లాక్-స్కోల్స్', slug: 'option-pricing-black-scholes', subRealm: 'Greeks', subRealmHi: 'ग्रीक्स', subRealmTe: 'గ్రీక్స్', contentType: 'Lesson', difficulty: 'Advanced', xp: 180, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N21', title: 'Hedging with Options: Portfolio Insurance', titleHi: 'ऑप्शन से हेजिंग: पोर्टफोलियो बीमा', titleTe: 'ఆప్షన్లతో హెడ్జింగ్: పోర్ట్‌ఫోలియో భీమా', slug: 'hedging-options-portfolio', subRealm: 'Strategies', subRealmHi: 'रणनीतियाँ', subRealmTe: 'వ్యూహాలు', contentType: 'Lesson', difficulty: 'Advanced', xp: 170, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N22', title: 'SEBI Margin Rules & Peak Margin', titleHi: 'SEBI मार्जिन नियम और पीक मार्जिन', titleTe: 'SEBI మార్జిన్ నియమాలు & పీక్ మార్జిన్', slug: 'sebi-margin-rules', subRealm: 'Regulation', subRealmHi: 'नियमन', subRealmTe: 'నియంత్రణ', contentType: 'Lesson', difficulty: 'Intermediate', xp: 130, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N23', title: 'Option Pain Theory', titleHi: 'ऑप्शन पेन थ्योरी', titleTe: 'ఆప్షన్ పెయిన్ థియరీ', slug: 'option-pain-theory', subRealm: 'Options', subRealmHi: 'ऑप्शन', subRealmTe: 'ఆప్షన్స్', contentType: 'Lesson', difficulty: 'Advanced', xp: 150, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N24', title: 'Max Pain & Expiry Day Trading', titleHi: 'मैक्स पेन और एक्सपायरी डे ट्रेडिंग', titleTe: 'మ్యాక్స్ పెయిన్ & ఎక్స్‌పైరీ డే ట్రేడింగ్', slug: 'max-pain-expiry-day', subRealm: 'Options', subRealmHi: 'ऑप्शन', subRealmTe: 'ఆప్షన్స్', contentType: 'Lesson', difficulty: 'Advanced', xp: 160, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N25', title: 'Butterfly Spread & Ratio Spreads', titleHi: 'बटरफ्लाई स्प्रेड और रेश्यो स्प्रेड', titleTe: 'బట్టర్‌ఫ్లై స్ప్రెడ్ & రేషియో స్ప్రెడ్లు', slug: 'butterfly-ratio-spreads', subRealm: 'Strategies', subRealmHi: 'रणनीतियाँ', subRealmTe: 'వ్యూహాలు', contentType: 'Lesson', difficulty: 'Advanced', xp: 180, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N26', title: 'Greeks Dashboard: Managing Multiple Legs', titleHi: 'ग्रीक्स डैशबोर्ड: मल्टीपल लेग मैनेजमेंट', titleTe: 'గ్రీక్స్ డాష్‌బోర్డ్: మల్టిపుల్ లెగ్ మేనేజ్‌మెంట్', slug: 'greeks-dashboard-multi-leg', subRealm: 'Greeks', subRealmHi: 'ग्रीक्स', subRealmTe: 'గ్రీక్స్', contentType: 'Lesson', difficulty: 'Advanced', xp: 180, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N27', title: 'SEBI F&O Regulations & Position Limits', titleHi: 'SEBI F&O नियम और पोजीशन लिमिट', titleTe: 'SEBI F&O నియమాలు & పొజిషన్ లిమిట్లు', slug: 'sebi-fno-regulations', subRealm: 'Regulation', subRealmHi: 'नियमन', subRealmTe: 'నియంత్రణ', contentType: 'Lesson', difficulty: 'Intermediate', xp: 120, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N28', title: 'Nifty vs BankNifty Options: Comparison', titleHi: 'निफ्टी बनाम बैंकनिफ्टी ऑप्शन', titleTe: 'నిఫ్టీ vs బ్యాంక్‌నిఫ్టీ ఆప్షన్స్', slug: 'nifty-vs-banknifty-options', subRealm: 'Options', subRealmHi: 'ऑप्शन', subRealmTe: 'ఆప్షన్స్', contentType: 'Lesson', difficulty: 'Intermediate', xp: 140, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N29', title: 'Case Study: The 2024 Nifty Crash & Options', titleHi: 'केस स्टडी: 2024 निफ्टी क्रैश और ऑप्शन', titleTe: 'కేస్ స్టడీ: 2024 నిఫ్టీ క్రాష్ & ఆప్షన్స్', slug: 'case-study-nifty-crash-options', subRealm: 'Case Studies', subRealmHi: 'केस स्टडी', subRealmTe: 'కేస్ స్టడీలు', contentType: 'CaseStudy', difficulty: 'Advanced', xp: 160, badge: '', badgeHi: '', badgeTe: '' },
  { realmNumber: 4, nodeId: 'R4-N30', title: 'Boss Battle: The Volatility Dragon', titleHi: 'बॉस बैटल: वोलैटिलिटी ड्रैगन', titleTe: 'బాస్ బాటిల్: వోలాటిలిటీ డ్రాగన్', slug: 'boss-realm-final-exam', subRealm: 'Boss', subRealmHi: 'बॉस', subRealmTe: 'బాస్', contentType: 'Certification', difficulty: 'Advanced', xp: 500, badge: 'Options Slayer', badgeHi: 'ऑप्शन स्लेयर', badgeTe: 'ఆప్షన్స్ స్లేయర్' },

  // ---- REALM 5-13: Remaining Realms (condensed titles) ----
  // REALM 5: Shadow Mechanics (20 nodes)
  ...generateRealmNodes(5, 'Shadow Mechanics', 20, [
    'Order Book Anatomy', 'Bid-Ask Spread Dynamics', 'Market Depth Reading', 'Order Flow Analysis', 'Time & Sales Data',
    'Algorithmic Trading Basics', 'HFT: High Frequency Trading', 'Market Making & Liquidity', 'Dark Pools & Hidden Orders', 'Iceberg Orders',
    'TWAP & VWAP Execution', 'Slippage & Its Impact', 'Pre-Market & Post-Market', 'Opening Range Breakout', 'Institutional Order Flow',
    'Smart Money Concepts', 'Order Block Theory', 'Fair Value Gaps', 'Liquidity Sweeps', 'Boss Battle: Shadow Broker'
  ]),
  // REALM 6: Monster Mind (20 nodes)
  ...generateRealmNodes(6, 'Monster Mind', 20, [
    'Trading Psychology 101', 'Fear & Greed Cycle', 'FOMO: The Account Killer', 'Revenge Trading: Breaking the Cycle', 'Overtrading: Less is More',
    'Position Sizing: The 1-2% Rule', 'Risk-Reward Ratio', 'Stop Loss Strategies', 'Trailing Stop Methods', 'Trading Journal for Discipline',
    'Mindfulness for Traders', 'Cognitive Biases in Trading', 'Confirmation Bias Trap', 'Loss Aversion & Sunk Cost', 'The Gambler\'s Fallacy',
    'Building a Trading Plan', 'Daily Trading Routine', 'Handling Drawdowns', 'Emotional Regulation Techniques', 'Boss Battle: Emotion Demon'
  ]),
  // REALM 7: Empire Builder (25 nodes)
  ...generateRealmNodes(7, 'Empire Builder', 25, [
    'Wealth Building Philosophy', 'Power of Compounding', 'Asset Allocation Strategy', 'SIP: Systematic Investment Plan', 'Mutual Funds Deep Dive',
    'Index Funds & ETFs', 'Large Cap vs Mid Cap vs Small Cap', 'Dividend Investing Strategy', 'Growth vs Value Investing', 'Portfolio Rebalancing',
    'Tax Saving: Section 80C & ELSS', 'Capital Gains Tax: LTCG & STCG', 'PPF, NPS & Fixed Deposits', 'Gold Investment Strategies', 'Real Estate as Investment',
    'International Diversification', 'Retirement Planning for Traders', 'Emergency Fund Essentials', 'Insurance for Investors', 'Inflation-Proofing Your Portfolio',
    'Behavioral Finance in Investing', 'Rupee Cost Averaging', 'Core & Satellite Strategy', 'Reinvestment Risk', 'Boss Battle: Inflation Titan'
  ]),
  // REALM 8: Legendary Trader (20 nodes)
  ...generateRealmNodes(8, 'Legendary Trader', 20, [
    'Multi-Timeframe Confluence', 'Top-Down Analysis Method', 'Reading the Tape', 'Scalping Techniques', 'Swing Trading Strategies',
    'Position Trading for Big Moves', 'Intraday Trading Framework', 'Event-Based Trading', 'Earnings Season Strategies', 'Budget & Policy Impact Trading',
    'Correlation Trading', 'Relative Strength Trading', 'Sector Rotation Strategy', 'Market Breadth Indicators', 'Advance-Decline Analysis',
    'Trading the News', 'Pre-Market Preparation', 'End of Day Analysis', 'Trading Journal Review System', 'Boss Battle: Market Hydra'
  ]),
  // REALM 9: Quant Lab (20 nodes)
  ...generateRealmNodes(9, 'Quant Lab', 20, [
    'Statistics for Traders', 'Probability & Expected Value', 'Normal Distribution & Markets', 'Standard Deviation & Volatility', 'Correlation & Causation',
    'Backtesting Basics', 'Walk-Forward Analysis', 'Monte Carlo Simulation', 'Sharpe & Sortino Ratios', 'Maximum Drawdown Analysis',
    'Win Rate vs Risk-Reward', 'Kelly Criterion for Position Sizing', 'Mean Reversion Strategies', 'Trend Following Systems', 'Statistical Significance in Trading',
    'Overfitting & Curve Fitting', 'Regime Detection', 'Machine Learning for Trading Intro', 'Data Cleaning for Trading', 'Boss Battle: Random Walk'
  ]),
  // REALM 10: Trader Business (15 nodes)
  ...generateRealmNodes(10, 'Trader Business', 15, [
    'Trading as a Business', 'P&L Tracking & Accounting', 'Tax Audit for Traders', 'ITR-3 for Trading Income', 'Business vs Speculative Income',
    'Compliance & Record Keeping', 'Scaling Your Trading', 'Building a Trading Desk', 'Risk Management Framework', 'Trading Team Structure',
    'Outsourcing Analysis', 'Subscription Models', 'Creating Trading Courses', 'Legal Structure for Traders', 'Boss Battle: Tax Collector'
  ]),
  // REALM 11: Automation Lab (25 nodes)
  ...generateRealmNodes(11, 'Automation Lab', 25, [
    'Pine Script Basics', 'Pine Script: Custom Indicators', 'Pine Script: Strategy Builder', 'Pine Script: Alerts & Automation', 'TradingView Webhooks',
    'Python for Traders: Setup', 'Python: Fetching Market Data', 'Python: Technical Analysis', 'Python: Backtesting with Zipline', 'Python: Option Chain Analysis',
    'Dhan API Integration', 'Angel One API Integration', 'Zerodha Kite API', 'Building a Trading Bot', 'Paper Trading Framework',
    'Power BI for Traders', 'Excel for Trading Analysis', 'Building a Dashboard', 'Chrome Extension for Trading', 'Web Scraping Market Data',
    'Telegram/Discord Trading Bots', 'Automated Journal Logging', 'CI/CD for Trading Systems', 'Monitoring & Alerts System', 'Boss Battle: Bug King'
  ]),
  // REALM 12: Market Legends (20 nodes)
  ...generateRealmNodes(12, 'Market Legends', 20, [
    'Harshad Mehta: The Big Bull', 'Ketan Parekh: The K-10 Scam', 'Dot-Com Bubble: 2000 Crash', 'The 2008 Financial Crisis', 'COVID Crash of 2020',
    'GameStop Short Squeeze', 'LTCM: When Geniuses Fail', 'Flash Crashes in India', 'The Satyam Scandal', 'Circuit Breaker History',
    'Famous Indian Traders', 'Rakesh Jhunjhunwala Legacy', 'Radhakishan Damani Story', 'Ramdeo Agarwal & Value Investing', 'Nikhil Kamath: Young Billionaire',
    'Global Market Crashes Timeline', 'Pump & Dump Schemes', 'Inside Trading Cases in India', 'Regulatory Evolution in India', 'Boss Battle: Ghost of Crashes Past'
  ]),
  // REALM 13: Professional Careers (15 nodes)
  ...generateRealmNodes(13, 'Professional Careers', 15, [
    'Prop Trading Firms in India', 'Hedge Fund Career Path', 'Research Analyst Role', 'Dealer Terminal Operations', 'NISM Certifications Guide',
    'CFA Path for Indian Markets', 'Portfolio Management Career', 'Institutional Trading Workflow', 'Bloomberg Terminal Basics', 'Trading Desk Operations',
    'Risk Manager Career', 'Compliance Officer Role', 'Algorithmic Trading Jobs', 'Freelance Trading Education', 'Boss Battle: Final Interview'
  ]),
]

// Helper to generate nodes for realms 5-13
function generateRealmNodes(realmNum: number, realmName: string, count: number, titles: string[]): any[] {
  return titles.map((title, i) => ({
    realmNumber: realmNum,
    nodeId: `R${realmNum}-N${i + 1}`,
    title,
    titleHi: title,
    titleTe: title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    subRealm: i === count - 1 ? 'Boss' : i < 5 ? 'Core' : i < 10 ? 'Intermediate' : 'Advanced',
    subRealmHi: i === count - 1 ? 'बॉस' : i < 5 ? 'मूल' : i < 10 ? 'मध्यवर्ती' : 'उन्नत',
    subRealmTe: i === count - 1 ? 'బాస్' : i < 5 ? 'కోర్' : i < 10 ? 'ఇంటర్మీడియట్' : 'అడ్వాన్స్డ్',
    contentType: i === count - 1 ? 'Certification' as const : 'Lesson' as const,
    difficulty: i === count - 1 ? 'Advanced' as const : i < 8 ? 'Intermediate' as const : 'Advanced' as const,
    xp: i === count - 1 ? 400 : i < 8 ? 130 : 160,
    badge: '',
    badgeHi: '',
    badgeTe: '',
  }))
}

// ============================================================
// SEED FUNCTION
// ============================================================
async function main() {
  console.log('🌱 Seeding ATT Skill Tree database...')

  // 1. Seed Realms
  console.log('📚 Seeding Realms...')
  for (const realm of realms) {
    await db.realm.upsert({
      where: { realmNumber: realm.realmNumber },
      update: realm,
      create: realm,
    })
  }
  console.log(`✅ ${realms.length} Realms seeded`)

  // 2. Seed Nodes
  console.log('🌳 Seeding Nodes...')
  let nodeCount = 0
  for (const node of nodes) {
    const realm = await db.realm.findUnique({ where: { realmNumber: node.realmNumber } })
    if (!realm) {
      console.log(`⚠️ Realm ${node.realmNumber} not found, skipping node ${node.nodeId}`)
      continue
    }

    // Fix duplicate contentType field on R1-N4
    const { realmNumber, ...nodeData } = node as any

    await db.node.upsert({
      where: { nodeId: node.nodeId },
      update: { ...nodeData, realmId: realm.id },
      create: { ...nodeData, realmId: realm.id },
    })
    nodeCount++
  }
  console.log(`✅ ${nodeCount} Nodes seeded`)

  // 3. Seed Edges (prerequisite chains within realms)
  console.log('🔗 Seeding Edges...')
  const allNodes = await db.node.findMany({ orderBy: { nodeId: 'asc' } })
  let edgeCount = 0

  for (let i = 1; i < allNodes.length; i++) {
    const currentNode = allNodes[i]
    const prevNode = allNodes[i - 1]

    // Only connect nodes in the same realm
    if (currentNode.realmId === prevNode.realmId) {
      const edgeId = `E-${prevNode.nodeId}-${currentNode.nodeId}`
      await db.edge.upsert({
        where: { edgeId },
        update: {},
        create: {
          edgeId,
          fromNodeId: prevNode.id,
          toNodeId: currentNode.id,
          relationship: 'leads_to',
          strength: 1,
          label: 'Next',
        },
      })
      edgeCount++
    }
  }
  console.log(`✅ ${edgeCount} Edges seeded`)

  // 4. Seed Tools (link existing ATT calculators)
  console.log('🔧 Seeding Tools...')
  const tools = [
    { toolId: 'T-stock-average', title: 'Stock Average Calculator', titleHi: 'स्टॉक एवरेज कैलकुलेटर', titleTe: 'స్టాక్ యావరేజ్ కాల్కులేటర్', description: 'Calculate your average stock price across multiple buys', slug: 'stock-average-calculator', type: 'calculator', route: '#stock-average', isLive: true, sortOrder: 1 },
    { toolId: 'T-sip', title: 'SIP Calculator', titleHi: 'SIP कैलकुलेटर', titleTe: 'SIP కాల్కులేటర్', description: 'Plan your SIP returns and wealth creation journey', slug: 'sip-calculator', type: 'calculator', route: '#sip', isLive: true, sortOrder: 2 },
    { toolId: 'T-brokerage', title: 'Brokerage Calculator', titleHi: 'ब्रोकरेज कैलकुलेटर', titleTe: 'బ్రోకరేజ్ కాల్కులేటర్', description: 'Compare brokerage charges across major Indian brokers', slug: 'brokerage-calculator', type: 'calculator', route: '#brokerage', isLive: true, sortOrder: 3 },
    { toolId: 'T-option-pain', title: 'Option Pain Calculator', titleHi: 'ऑप्शन पेन कैलकुलेटर', titleTe: 'ఆప్షన్ పెయిన్ కాల్కులేటర్', description: 'Find the option expiry pain point for any instrument', slug: 'option-pain-calculator', type: 'calculator', route: '#option-pain', isLive: true, sortOrder: 4 },
    { toolId: 'T-position-sizer', title: 'Position Sizer', titleHi: 'पोजीशन साइज़र', titleTe: 'పొజిషన్ సైజర్', description: 'Calculate optimal position size based on risk tolerance', slug: 'position-sizer', type: 'calculator', route: '#position-sizer', isLive: true, sortOrder: 5 },
    { toolId: 'T-pivot-point', title: 'Pivot Point Calculator', titleHi: 'पिवट पॉइंट कैलकुलेटर', titleTe: 'పివోట్ పాయింట్ కాల్కులేటర్', description: 'Classic & Fibonacci pivot point calculations', slug: 'pivot-point-calculator', type: 'calculator', route: '#pivot-point', isLive: true, sortOrder: 6 },
    { toolId: 'T-cagr', title: 'CAGR Calculator', titleHi: 'CAGR कैलकुलेटर', titleTe: 'CAGR కాల్కులేటర్', description: 'Calculate compound annual growth rate', slug: 'cagr-calculator', type: 'calculator', route: '#cagr', isLive: true, sortOrder: 7 },
    { toolId: 'T-fibonacci', title: 'Fibonacci Calculator', titleHi: 'फिबोनैचि कैलकुलेटर', titleTe: 'ఫిబోనాచీ కాల్కులేటర్', description: 'Fibonacci retracement and extension levels', slug: 'fibonacci-calculator', type: 'calculator', route: '#fibonacci', isLive: true, sortOrder: 8 },
    { toolId: 'T-margin', title: 'Margin Calculator', titleHi: 'मार्जिन कैलकुलेटर', titleTe: 'మార్జిన్ కాల్కులేటర్', description: 'Calculate F&O margin requirements', slug: 'margin-calculator', type: 'calculator', route: '#margin', isLive: true, sortOrder: 9 },
    { toolId: 'T-intrinsic-value', title: 'Intrinsic Value Calculator', titleHi: 'इंट्रिंसिक वैल्यू कैलकुलेटर', titleTe: 'ఇంట్రిన్సిక్ వాల్యూ కాల్కులేటర్', description: 'Estimate the intrinsic value of any stock', slug: 'intrinsic-value-calculator', type: 'calculator', route: '#intrinsic-value', isLive: true, sortOrder: 10 },
    { toolId: 'T-swp', title: 'SWP Calculator', titleHi: 'SWP कैलकुलेटर', titleTe: 'SWP కాల్కులేటర్', description: 'Systematic withdrawal plan calculator', slug: 'swp-calculator', type: 'calculator', route: '#swp', isLive: true, sortOrder: 11 },
    { toolId: 'T-break-even', title: 'Break Even Calculator', titleHi: 'ब्रेक इवन कैलकुलेटर', titleTe: 'బ్రేక్ ఈవెన్ కాల్కులేటర్', description: 'Find your break-even point for any trade', slug: 'break-even-calculator', type: 'calculator', route: '#break-even', isLive: true, sortOrder: 12 },
  ]

  for (const tool of tools) {
    await db.tool.upsert({
      where: { toolId: tool.toolId },
      update: tool,
      create: tool,
    })
  }
  console.log(`✅ ${tools.length} Tools seeded`)

  console.log('\n🎉 ATT Skill Tree database seeded successfully!')
  console.log(`   📚 ${realms.length} Realms`)
  console.log(`   🌳 ${nodeCount} Nodes`)
  console.log(`   🔗 ${edgeCount} Edges`)
  console.log(`   🔧 ${tools.length} Tools`)
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
