import { NextResponse } from 'next/server'

// Static fallback data — used if DB query fails or causes issues
const STATIC_REALMS = [
  { id:1, realmNumber:1, slug:"genesis", title:"Genesis", titleHi:"जेनेसिस", titleTe:"జెనెసిస్", subtitle:"Entering the Arena", subtitleHi:"अखाड़े में प्रवेश", subtitleTe:"రంగంలోకి ప్రవేశం", description:"Your journey begins here. Learn what the stock market is, how NSE and BSE work, what SEBI does, and how to open your first Demat account.", icon:"🌱", spirit:"Beginner", color:"#10B981", bossName:"The Ignorance Guardian", nodeCount:15, badgeEmoji:"🌱", badgeTitle:"Genesis Survivor", sortOrder:1 },
  { id:2, realmNumber:2, slug:"art-of-war", title:"Art of War", titleHi:"युद्ध कला", titleTe:"యుద్ధ కళ", subtitle:"Technical Analysis Mastery", subtitleHi:"टेक्निकल एनालिसिस में महारत", subtitleTe:"టెక్నికల్ అనాలిసిస్ నైపుణ్యం", description:"Master candlesticks, price action, support-resistance, trendlines, indicators, and chart patterns.", icon:"⚔️", spirit:"Core Skill", color:"#3B82F6", bossName:"The Pattern Dragon", nodeCount:25, badgeEmoji:"⚔️", badgeTitle:"Chart Warrior", sortOrder:2 },
  { id:3, realmNumber:3, slug:"the-shield", title:"The Shield", titleHi:"ढाल", titleTe:"ఢలం", subtitle:"Fundamental Analysis", subtitleHi:"फंडामेंटल एनालिसिस", subtitleTe:"ఫండమెంటల్ అనాలిసిస్", description:"Read balance sheets, understand P/E ratios, analyze sectors, and discover what makes a company truly valuable.", icon:"🛡️", spirit:"Defense", color:"#8B5CF6", bossName:"The Illusion Master", nodeCount:20, badgeEmoji:"🛡️", badgeTitle:"Fundamental Guardian", sortOrder:3 },
  { id:4, realmNumber:4, slug:"boss-realm", title:"Boss Realm", titleHi:"बॉस रियल्म", titleTe:"బాస్ రియల్మ్", subtitle:"Derivatives & Options Mastery", subtitleHi:"डेरिवेटिव्स और ऑप्शन में महारत", subtitleTe:"డెరివేటివ్స్ & ఆప్షన్స్ నైపుణ్యం", description:"Futures, Options, Greeks, Strategies — the most dangerous and rewarding arena.", icon:"👹", spirit:"Boss Fight", color:"#EF4444", bossName:"The Volatility Dragon", nodeCount:30, badgeEmoji:"👹", badgeTitle:"Options Slayer", sortOrder:4 },
  { id:5, realmNumber:5, slug:"shadow-mechanics", title:"Shadow Mechanics", titleHi:"शैडो मैकेनिक्स", titleTe:"షాడో మెకానిక్స్", subtitle:"Market Microstructure", subtitleHi:"मार्केट माइक्रोस्ट्रक्चर", subtitleTe:"మార్కెట్ మైక్రోస్ట్రక్చర్", description:"What really happens behind the order book? Learn order flow, bid-ask dynamics, algorithmic trading.", icon:"🕵️", spirit:"Hidden Layer", color:"#6366F1", bossName:"The Shadow Broker", nodeCount:20, badgeEmoji:"🕵️", badgeTitle:"Shadow Agent", sortOrder:5 },
  { id:6, realmNumber:6, slug:"monster-mind", title:"Monster Mind", titleHi:"मॉन्स्टर माइंड", titleTe:"మాన్‌స్టర్ మైండ్", subtitle:"Psychology & Risk Mastery", subtitleHi:"मनोविज्ञान और जोखिम में महारत", subtitleTe:"మనఃశాస్త్రం & రిస్క్ నైపుణ్యం", description:"Conquer FOMO, revenge trading, and emotional decisions. Master position sizing and risk management.", icon:"🧠", spirit:"Inner Battle", color:"#EC4899", bossName:"The Emotion Demon", nodeCount:20, badgeEmoji:"🧠", badgeTitle:"Mind Master", sortOrder:6 },
  { id:7, realmNumber:7, slug:"empire-builder", title:"Empire Builder", titleHi:"साम्राज्य निर्माता", titleTe:"సామ్రాజ్య నిర్మాత", subtitle:"Portfolio & Wealth Building", subtitleHi:"पोर्टफोलियो और धन निर्माण", subtitleTe:"పోర్ట్‌ఫోలియో & సంపద నిర్మాణం", description:"Build wealth that lasts generations. Asset allocation, SIP strategies, mutual funds, tax planning.", icon:"🏰", spirit:"Long Game", color:"#F59E0B", bossName:"The Inflation Titan", nodeCount:25, badgeEmoji:"🏰", badgeTitle:"Empire Architect", sortOrder:7 },
  { id:8, realmNumber:8, slug:"legendary-trader", title:"Legendary Trader", titleHi:"दिग्गज ट्रेडर", titleTe:"లెజెండరీ ట్రేడర్", subtitle:"Advanced Mastery", subtitleHi:"एडवांस्ड महारत", subtitleTe:"అడ్వాన్స్డ్ నైపుణ్యం", description:"Multi-timeframe analysis, confluence trading, live market strategies, and the art of reading the tape.", icon:"🐉", spirit:"Elite", color:"#D946EF", bossName:"The Market Hydra", nodeCount:20, badgeEmoji:"🐉", badgeTitle:"Legendary", sortOrder:8 },
  { id:9, realmNumber:9, slug:"quant-lab", title:"Quant Lab", titleHi:"क्वांट लैब", titleTe:"క్వాంట్ ల్యాబ్", subtitle:"Statistics & Probability", subtitleHi:"सांख्यिकी और संभावना", subtitleTe:"గణాంకాలు & సంభావ్యత", description:"Where intuition meets math. Backtesting, statistical edge, probability distributions, and data-driven trading.", icon:"📊", spirit:"Numbers", color:"#06B6D4", bossName:"The Random Walk", nodeCount:20, badgeEmoji:"📊", badgeTitle:"Quant Sage", sortOrder:9 },
  { id:10, realmNumber:10, slug:"trader-business", title:"Trader Business", titleHi:"ट्रेडर बिज़नेस", titleTe:"ట్రేడర్ బిజినెస్", subtitle:"Operations & Scaling", subtitleHi:"ऑपरेशन और स्केलिंग", subtitleTe:"ఆపరేషన్స్ & స్కేలింగ్", description:"Trading is a business. Learn compliance, tax audits, P&L tracking, scaling strategies.", icon:"💼", spirit:"Professional", color:"#78716C", bossName:"The Tax Collector", nodeCount:15, badgeEmoji:"💼", badgeTitle:"Trading CEO", sortOrder:10 },
  { id:11, realmNumber:11, slug:"automation-lab", title:"Automation Lab", titleHi:"ऑटोमेशन लैब", titleTe:"ఆటోమేషన్ ల్యాబ్", subtitle:"APIs, Bots & Tools", subtitleHi:"API, बॉट्स और टूल्स", subtitleTe:"APIలు, బాట్లు & టూల్స్", description:"Build your own trading tools. Pine Script, Python, Power BI, Chrome extensions, API integrations.", icon:"🔧", spirit:"Builder", color:"#F97316", bossName:"The Bug King", nodeCount:25, badgeEmoji:"🔧", badgeTitle:"Automation Forge", sortOrder:11 },
  { id:12, realmNumber:12, slug:"market-legends", title:"Market Legends", titleHi:"मार्केट दिग्गज", titleTe:"మార్కెట్ లెజెండ్స్", subtitle:"History & Case Studies", subtitleHi:"इतिहास और केस स्टडी", subtitleTe:"చరిత్ర & కేస్ స్టడీలు", description:"Those who don't learn from market history are doomed to repeat it.", icon:"📜", spirit:"Lore", color:"#A855F7", bossName:"The Ghost of Crashes Past", nodeCount:20, badgeEmoji:"📜", badgeTitle:"Lore Keeper", sortOrder:12 },
  { id:13, realmNumber:13, slug:"professional-careers", title:"Professional Careers", titleHi:"पेशेवर करियर", titleTe:"ప్రొఫెషనల్ కెరీర్లు", subtitle:"Institutional Path", subtitleHi:"संस्थागत मार्ग", subtitleTe:"సంస్థాగత మార్గం", description:"Make trading your career. Prop firms, hedge funds, NISM certifications, CFA path.", icon:"🏢", spirit:"Career", color:"#0EA5E9", bossName:"The Final Interview", nodeCount:15, badgeEmoji:"🏢", badgeTitle:"Institutional Elite", sortOrder:13 },
]

export async function GET() {
  try {
    // Try dynamic DB query first
    const { db } = await import('@/lib/db')
    const realms = await db.realm.findMany({
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true, realmNumber: true, slug: true,
        title: true, titleHi: true, titleTe: true,
        subtitle: true, subtitleHi: true, subtitleTe: true,
        description: true, descriptionHi: true, descriptionTe: true,
        icon: true, spirit: true, color: true,
        bossName: true, bossNameHi: true, bossNameTe: true,
        badgeEmoji: true, badgeTitle: true, badgeTitleHi: true, badgeTitleTe: true,
        sortOrder: true,
        nodes: { select: { id: true } },
      },
    })

    const totalXpResult = await db.node.aggregate({ _sum: { xp: true } })
    const totalNodes = await db.node.count()

    const data = realms.map((r) => ({
      id: r.id, realmNumber: r.realmNumber, slug: r.slug,
      title: r.title, titleHi: r.titleHi, titleTe: r.titleTe,
      subtitle: r.subtitle, subtitleHi: r.subtitleHi, subtitleTe: r.subtitleTe,
      description: r.description, descriptionHi: r.descriptionHi, descriptionTe: r.descriptionTe,
      icon: r.icon, spirit: r.spirit, color: r.color,
      bossName: r.bossName, bossNameHi: r.bossNameHi, bossNameTe: r.bossNameTe,
      badgeEmoji: r.badgeEmoji, badgeTitle: r.badgeTitle,
      badgeTitleHi: r.badgeTitleHi, badgeTitleTe: r.badgeTitleTe,
      sortOrder: r.sortOrder,
      nodeCount: r.nodes.length,
    }))

    return NextResponse.json({ realms: data, totalNodes, totalXp: totalXpResult._sum.xp ?? 0 })
  } catch (error) {
    console.error('DB query failed, using static fallback:', error)
    // Fallback to static data so the app never crashes
    return NextResponse.json({
      realms: STATIC_REALMS,
      totalNodes: 270,
      totalXp: 42140,
    })
  }
}
