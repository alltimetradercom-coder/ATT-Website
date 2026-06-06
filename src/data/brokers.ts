export interface BrokerData {
  id: string
  name: string
  shortName: string
  tagline: string
  logo: string
  brandColor: string
  brandColorLight: string
  founded: number
  activeClients: string
  sebiRegistered: boolean

  // Fees
  accountOpeningFee: number
  equityDelivery: number
  intradayFlat: number
  intradayPercent: number
  optionsFlat: number
  futuresFlat: number
  amcAnnual: number
  pledgingCharges: number

  // Platform features
  platforms: string[]
  hasResearch: boolean
  hasMutualFunds: boolean
  hasIPO: boolean
  hasSmallcase: boolean
  hasMarginTrading: boolean
  hasCommodities: boolean
  hasCurrency: boolean
  hasUsStocks: boolean
  hasAlgoTrading: boolean

  // Ratings
  rating: number
  pros: string[]
  cons: string[]
  bestFor: string

  // Referral
  isReferralPartner: boolean
  referralUrl: string
  referralText: string

  // UI
  badge?: string
  badgeColor?: string
  highlighted?: boolean
}

export const BROKERS: BrokerData[] = [
  {
    id: 'zerodha',
    name: 'Zerodha',
    shortName: 'Z',
    tagline: 'India\'s largest stock broker',
    logo: '/brokers/zerodha.svg',
    brandColor: '#F57C00',
    brandColorLight: '#FFF3E0',
    founded: 2010,
    activeClients: '1 Cr+',
    sebiRegistered: true,

    accountOpeningFee: 200,
    equityDelivery: 0,
    intradayFlat: 20,
    intradayPercent: 0.03,
    optionsFlat: 20,
    futuresFlat: 20,
    amcAnnual: 300,
    pledgingCharges: 0,

    platforms: ['Kite Web', 'Kite Mobile', 'Coin', 'Console'],
    hasResearch: false,
    hasMutualFunds: true,
    hasIPO: true,
    hasSmallcase: true,
    hasMarginTrading: true,
    hasCommodities: true,
    hasCurrency: true,
    hasUsStocks: false,
    hasAlgoTrading: true,

    rating: 4.5,
    pros: [
      'Most trusted & reliable platform in India',
      'Zero brokerage on equity delivery trades',
      'Excellent charting with TradingView integration',
      'Strong community & educational content (Varsity)',
      'Stable and fast order execution',
    ],
    cons: [
      '₹200 account opening fee',
      '₹300/year AMC on demat account',
      'No advisory or research reports',
      'Customer support can be slow during peak hours',
      'No US stocks or global investing',
    ],
    bestFor: 'Experienced traders & investors who value reliability',

    isReferralPartner: false,
    referralUrl: 'https://zerodha.com/open-account',
    referralText: 'Open Zerodha Account',

    badge: 'Most Popular',
    badgeColor: '#F57C00',
    highlighted: true,
  },
  {
    id: 'angelone',
    name: 'Angel One',
    shortName: 'A',
    tagline: 'Full-service broking at discount prices',
    logo: '/brokers/angelone.svg',
    brandColor: '#D32F2F',
    brandColorLight: '#FFEBEE',
    founded: 1987,
    activeClients: '50 Lakh+',
    sebiRegistered: true,

    accountOpeningFee: 0,
    equityDelivery: 0,
    intradayFlat: 20,
    intradayPercent: 0.25,
    optionsFlat: 20,
    futuresFlat: 20,
    amcAnnual: 0,
    pledgingCharges: 0,

    platforms: ['Angel One App', 'Angel SpeedPro', 'Angel Trade Web'],
    hasResearch: true,
    hasMutualFunds: true,
    hasIPO: true,
    hasSmallcase: false,
    hasMarginTrading: true,
    hasCommodities: true,
    hasCurrency: true,
    hasUsStocks: false,
    hasAlgoTrading: false,

    rating: 4.0,
    pros: [
      'Zero account opening & zero AMC forever',
      'Free research reports & stock recommendations',
      'Full-service broker with advisory support',
      'User-friendly mobile app for beginners',
      'Strong IPO application support',
    ],
    cons: [
      'Intraday brokerage is higher (0.25%) on some plans',
      'Desktop platform can feel outdated',
      'Occasional app stability issues during high volume',
      'No smallcase integration',
    ],
    bestFor: 'Beginners & investors who want research + advisory',

    isReferralPartner: true,
    referralUrl: '#',
    referralText: 'Open Angel One Account',

    badge: 'Best for Beginners',
    badgeColor: '#4CAF50',
    highlighted: true,
  },
  {
    id: 'upstox',
    name: 'Upstox',
    shortName: 'U',
    tagline: 'Fastest growing discount broker',
    logo: '/brokers/upstox.svg',
    brandColor: '#6A1B9A',
    brandColorLight: '#F3E5F5',
    founded: 2011,
    activeClients: '1 Cr+',
    sebiRegistered: true,

    accountOpeningFee: 0,
    equityDelivery: 0,
    intradayFlat: 20,
    intradayPercent: 0.05,
    optionsFlat: 20,
    futuresFlat: 20,
    amcAnnual: 0,
    pledgingCharges: 0,

    platforms: ['Upstox Pro Web', 'Upstox Pro Mobile'],
    hasResearch: false,
    hasMutualFunds: true,
    hasIPO: true,
    hasSmallcase: false,
    hasMarginTrading: true,
    hasCommodities: true,
    hasCurrency: true,
    hasUsStocks: false,
    hasAlgoTrading: false,

    rating: 4.0,
    pros: [
      'Zero account opening & zero AMC',
      'Fast and responsive trading platform',
      'Good charting with multiple indicators',
      'Simple and clean user interface',
      'Backed by Tiger Global & Ratan Tata',
    ],
    cons: [
      'No research or advisory services',
      'No smallcase integration',
      'Customer support needs improvement',
      'Limited order types compared to Zerodha',
    ],
    bestFor: 'Intraday traders looking for speed & low cost',

    isReferralPartner: true,
    referralUrl: '#',
    referralText: 'Open Upstox Account',

    highlighted: false,
  },
  {
    id: 'groww',
    name: 'Groww',
    shortName: 'G',
    tagline: 'Simplest way to invest in stocks & MF',
    logo: '/brokers/groww.svg',
    brandColor: '#00D09C',
    brandColorLight: '#E0F7FA',
    founded: 2016,
    activeClients: '2 Cr+',
    sebiRegistered: true,

    accountOpeningFee: 0,
    equityDelivery: 0,
    intradayFlat: 20,
    intradayPercent: 0.05,
    optionsFlat: 20,
    futuresFlat: 20,
    amcAnnual: 0,
    pledgingCharges: 0,

    platforms: ['Groww Web', 'Groww Mobile App'],
    hasResearch: false,
    hasMutualFunds: true,
    hasIPO: true,
    hasSmallcase: false,
    hasMarginTrading: false,
    hasCommodities: false,
    hasCurrency: false,
    hasUsStocks: true,
    hasAlgoTrading: false,

    rating: 3.5,
    pros: [
      'Zero account opening & zero AMC forever',
      'Extremely simple and beginner-friendly app',
      'US Stocks investing available',
      'Best mutual fund experience in India',
      'Quick digital onboarding (10 mins)',
    ],
    cons: [
      'Limited trading features for advanced traders',
      'No commodities or currency segments',
      'No margin trading facility',
      'No desktop trading platform',
      'Relatively new to stock broking',
    ],
    bestFor: 'First-time investors & mutual fund buyers',

    isReferralPartner: true,
    referralUrl: '#',
    referralText: 'Open Groww Account',

    highlighted: false,
  },
  {
    id: 'dhan',
    name: 'Dhan',
    shortName: 'D',
    tagline: 'Next-gen trading & investing platform',
    logo: '/brokers/dhan.svg',
    brandColor: '#2196F3',
    brandColorLight: '#E3F2FD',
    founded: 2021,
    activeClients: '10 Lakh+',
    sebiRegistered: true,

    accountOpeningFee: 0,
    equityDelivery: 0,
    intradayFlat: 20,
    intradayPercent: 0.03,
    optionsFlat: 20,
    futuresFlat: 20,
    amcAnnual: 0,
    pledgingCharges: 0,

    platforms: ['Dhan Web', 'Dhan Mobile', 'TradingView by Dhan'],
    hasResearch: false,
    hasMutualFunds: true,
    hasIPO: true,
    hasSmallcase: false,
    hasMarginTrading: true,
    hasCommodities: true,
    hasCurrency: true,
    hasUsStocks: false,
    hasAlgoTrading: true,

    rating: 3.5,
    pros: [
      'Zero account opening & zero AMC',
      'Official TradingView integration for India',
      'Built-in Options Trader with strategy builder',
      'Modern and feature-rich platform',
      'API access for algo trading',
    ],
    cons: [
      'Relatively new broker (founded 2021)',
      'Smaller user base compared to established players',
      'No research or advisory services',
      'Limited track record in market stress conditions',
    ],
    bestFor: 'Tech-savvy traders & TradingView users',

    isReferralPartner: true,
    referralUrl: '#',
    referralText: 'Open Dhan Account',

    highlighted: false,
  },
  {
    id: 'fyers',
    name: 'Fyers',
    shortName: 'F',
    tagline: 'Trading made simple & affordable',
    logo: '/brokers/fyers.svg',
    brandColor: '#FF6B00',
    brandColorLight: '#FFF8E1',
    founded: 2015,
    activeClients: '5 Lakh+',
    sebiRegistered: true,

    accountOpeningFee: 0,
    equityDelivery: 0,
    intradayFlat: 20,
    intradayPercent: 0.03,
    optionsFlat: 20,
    futuresFlat: 20,
    amcAnnual: 0,
    pledgingCharges: 0,

    platforms: ['Fyers Web', 'Fyers Mobile', 'Fyers Desktop (Thinq)'],
    hasResearch: false,
    hasMutualFunds: false,
    hasIPO: false,
    hasSmallcase: false,
    hasMarginTrading: true,
    hasCommodities: true,
    hasCurrency: true,
    hasUsStocks: false,
    hasAlgoTrading: true,

    rating: 3.5,
    pros: [
      'Zero account opening & zero AMC',
      'Free thematic investing with Fyers Thematic',
      'Powerful API for algo trading',
      'Single margin for all segments',
      'Good charting with multiple timeframes',
    ],
    cons: [
      'No mutual funds or IPO support',
      'Smaller user base & community',
      'No research or advisory services',
      'Limited customer support channels',
      'Less brand recognition than competitors',
    ],
    bestFor: 'Algo traders & thematic investors',

    isReferralPartner: false,
    referralUrl: 'https://fyers.in/open-account',
    referralText: 'Open Fyers Account',

    highlighted: false,
  },
  {
    id: 'indmoney',
    name: 'INDmoney',
    shortName: 'IND',
    tagline: 'All-in-one wealth management & US stocks',
    logo: '/brokers/indmoney.svg',
    brandColor: '#3F51B5',
    brandColorLight: '#E8EAF6',
    founded: 2018,
    activeClients: '30 Lakh+',
    sebiRegistered: true,

    accountOpeningFee: 0,
    equityDelivery: 0,
    intradayFlat: 20,
    intradayPercent: 0.05,
    optionsFlat: 20,
    futuresFlat: 20,
    amcAnnual: 0,
    pledgingCharges: 0,

    platforms: ['INDmoney Web', 'INDmoney Mobile App'],
    hasResearch: true,
    hasMutualFunds: true,
    hasIPO: true,
    hasSmallcase: false,
    hasMarginTrading: false,
    hasCommodities: false,
    hasCurrency: false,
    hasUsStocks: true,
    hasAlgoTrading: false,

    rating: 4.0,
    pros: [
      'Zero account opening & zero AMC forever',
      'Best platform for US stocks investing from India',
      'AI-powered financial planning & tracking',
      'All-in-one wealth dashboard (stocks, MF, FD, EPF, PPF)',
      'Free research & stock scores powered by AI',
    ],
    cons: [
      'Limited intraday & F&O trading features',
      'No commodities or currency segments',
      'No margin trading facility',
      'No desktop trading terminal for active traders',
      'Relatively newer to full-fledged stock broking',
    ],
    bestFor: 'Long-term investors & US stock enthusiasts',

    isReferralPartner: true,
    referralUrl: '#',
    referralText: 'Open INDmoney Account',

    badge: 'Best for US Stocks',
    badgeColor: '#3F51B5',
    highlighted: true,
  },
]

// Helper functions
export function getBrokerById(id: string): BrokerData | undefined {
  return BROKERS.find(b => b.id === id)
}

export function getReferralBrokers(): BrokerData[] {
  return BROKERS.filter(b => b.isReferralPartner)
}

export function getHighlightedBrokers(): BrokerData[] {
  return BROKERS.filter(b => b.highlighted)
}

export function formatFee(amount: number, type: 'flat' | 'percent' = 'flat'): string {
  if (amount === 0) return '₹0'
  if (type === 'percent') return `${amount}%`
  return `₹${amount}`
}

export const BROKER_NAMES = BROKERS.map(b => b.name)

export const BROKER_IDS = BROKERS.map(b => b.id)

// Margin rates per broker per segment (as % of total trade value)
export const MARGIN_RATES: Record<string, { delivery: number; intraday: number; futures: number }> = {
  'Zerodha': { delivery: 100, intraday: 20, futures: 50 },
  'Angel One': { delivery: 100, intraday: 20, futures: 50 },
  'Upstox': { delivery: 100, intraday: 20, futures: 50 },
  'Groww': { delivery: 100, intraday: 25, futures: 50 },
  'Dhan': { delivery: 100, intraday: 20, futures: 50 },
  'Fyers': { delivery: 100, intraday: 20, futures: 50 },
  'INDmoney': { delivery: 100, intraday: 25, futures: 50 },
}
