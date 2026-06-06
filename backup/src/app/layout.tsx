import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AllTimeTrader — Free Trading Calculators, Journal & Tools for Indian Traders",
  description: "Free stock average calculator, SIP calculator, brokerage calculator, trading journal, mind journal & discipline tools for Indian stock market traders. Trade with rules, not emotions.",
  keywords: ["stock average calculator", "SIP calculator", "brokerage calculator", "trading journal", "option pain calculator", "position sizer", "Indian stock market", "Nifty", "demat account", "pivot point calculator", "CAGR calculator", "Fibonacci calculator", "margin calculator", "intrinsic value calculator"],
  authors: [{ name: "AllTimeTrader" }],
  icons: { icon: "/logo.svg", apple: "/logo.svg" },
  openGraph: {
    title: "AllTimeTrader — Trade With Rules. Not Emotions.",
    description: "Free calculators, trading journal & discipline tools for Indian traders. 12+ tools including stock average, SIP, brokerage, option pain calculators.",
    url: "https://alltimetrader.com",
    siteName: "AllTimeTrader",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AllTimeTrader — Free Trading Tools for Indian Traders",
    description: "12+ free calculators, trading journal & mind journal. Trade with rules, not emotions.",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-78NHQR7E47"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-78NHQR7E47');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="att-theme"
        >
          {children}
          <Toaster />
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                var register = function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('SW registered:', reg.scope);
                  }).catch(function(err) {
                    console.log('SW registration failed:', err);
                  });
                };
                if (document.readyState === 'complete' || document.readyState === 'interactive') {
                  register();
                } else {
                  window.addEventListener('load', register);
                }
              }
            `
          }}
        />
      </body>
    </html>
  );
}
