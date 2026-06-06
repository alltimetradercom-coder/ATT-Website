import { NextResponse } from "next/server";

// Yahoo Finance v2 import — server-side only
let yf: any = null;

async function getYF() {
  if (!yf) {
    const YahooFinance = (await import("yahoo-finance2")).default;
    yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
  }
  return yf;
}

// Symbols we track
const SYMBOLS = [
  { yahoo: "^NSEI", id: "nifty", name: "NIFTY 50" },
  { yahoo: "^NSEBANK", id: "banknifty", name: "BANK NIFTY" },
  { yahoo: "^BSESN", id: "sensex", name: "SENSEX" },
  { yahoo: "^INDIAVIX", id: "indiavix", name: "INDIA VIX" },
  { yahoo: "INR=X", id: "usdinr", name: "USD/INR", yahooAlt: "USDINR=X" },
  { yahoo: "GC=F", id: "gold", name: "GOLD" },
];

// In-memory cache — avoid hitting Yahoo on every request
let cachedData: any = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30_000; // 30 seconds — good balance of freshness vs rate-limiting

export async function GET() {
  try {
    const now = Date.now();

    // Return cached data if still fresh
    if (cachedData && now - cacheTimestamp < CACHE_TTL) {
      return NextResponse.json(cachedData, {
        headers: { "Cache-Control": "public, s-maxage=25" },
      });
    }

    const yahooFinance = await getYF();
    const quotes = await yahooFinance.quote(SYMBOLS.map((s) => s.yahoo));

    // Extract USD/INR rate for Gold conversion
    const usdinrQuote = quotes.find((r: any) => r.symbol === "INR=X" || r.symbol === "USDINR=X");
    const usdinrRate = usdinrQuote?.regularMarketPrice ?? 83.5;

    const results = SYMBOLS.map((sym) => {
      const q = quotes.find((r: any) => r.symbol === sym.yahoo || r.symbol === sym.yahooAlt);
      if (!q) {
        return {
          id: sym.id,
          name: sym.name,
          price: 0,
          change: 0,
          changePercent: 0,
          status: "error" as const,
        };
      }

      let price = q.regularMarketPrice ?? 0;
      let change = q.regularMarketChange ?? 0;
      const changePercent = q.regularMarketChangePercent ?? 0;
      let open = q.regularMarketOpen ?? 0;
      let high = q.regularMarketDayHigh ?? 0;
      let low = q.regularMarketDayLow ?? 0;

      if (sym.id === "gold" && price > 0) {
        // Convert global Gold price (USD per troy ounce) to domestic Indian Gold price (INR per 10 grams)
        // 1 troy ounce = 31.1035 grams.
        // Approx 9% import customs duty + local premium + taxes
        const conversionFactor = (10 / 31.1035) * usdinrRate * 1.09;
        price = price * conversionFactor;
        change = change * conversionFactor;
        open = open * conversionFactor;
        high = high * conversionFactor;
        low = low * conversionFactor;
      }

      return {
        id: sym.id,
        name: sym.name,
        price,
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        status: "live" as const,
      };
    });

    cachedData = {
      timestamp: now,
      marketOpen: isMarketOpen(),
      data: results,
    };
    cacheTimestamp = now;

    return NextResponse.json(cachedData, {
      headers: { "Cache-Control": "public, s-maxage=25" },
    });
  } catch (error: any) {
    console.error("Market data fetch error:", error.message);

    // Return stale cache if available
    if (cachedData) {
      return NextResponse.json(
        { ...cachedData, status: "stale" },
        { headers: { "Cache-Control": "public, s-maxage=10" } }
      );
    }

    // No cache available — return fallback
    return NextResponse.json({
      timestamp: Date.now(),
      marketOpen: false,
      status: "fallback",
      data: [
        { id: "nifty", name: "NIFTY 50", price: 23558, change: -349.1, changePercent: -1.46, open: 23900, high: 23920, low: 23520, status: "fallback" },
        { id: "banknifty", name: "BANK NIFTY", price: 54250, change: -603.4, changePercent: -1.10, open: 54800, high: 54950, low: 54100, status: "fallback" },
        { id: "sensex", name: "SENSEX", price: 77300, change: -1120.5, changePercent: -1.43, open: 78400, high: 78500, low: 77200, status: "fallback" },
        { id: "indiavix", name: "INDIA VIX", price: 16.15, change: 1.17, changePercent: 7.79, open: 15.10, high: 16.50, low: 14.80, status: "fallback" },
        { id: "usdinr", name: "USD/INR", price: 83.5, change: 0.12, changePercent: 0.14, open: 83.38, high: 83.55, low: 83.35, status: "fallback" },
        { id: "gold", name: "GOLD", price: 152450, change: 238.1, changePercent: 0.33, open: 152200, high: 152550, low: 152150, status: "fallback" },
      ],
    });
  }
}

// Check if Indian market is currently open (NSE: Mon-Fri 9:15-15:30 IST)
function isMarketOpen(): boolean {
  const now = new Date();
  const ist = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const day = ist.getDay();
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const time = hours * 60 + minutes;

  const isWeekday = day >= 1 && day <= 5;
  const afterOpen = time >= 9 * 60 + 15; // 9:15 AM
  const beforeClose = time < 15 * 60 + 30; // 3:30 PM

  return isWeekday && afterOpen && beforeClose;
}
