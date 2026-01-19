import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FPL Luck Finder | Spot Undervalued Players",
  description: "Find undervalued Fantasy Premier League players using xG analysis. Identify who's due a haul and who's a trap.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="bg-[rgb(var(--background))] text-[rgb(var(--text-primary))] font-sans">
        <ThemeProvider>
        <nav className="bg-[rgb(var(--background))]/90 backdrop-blur-md border-b border-[rgb(var(--surface-highlight))]/60 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/luck" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">
                    FPL Luck Finder
                  </h1>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                    xG-Powered Insights
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-4">
                <Link 
                  href="/" 
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Home
                </Link>
                <Link 
                  href="/luck" 
                  className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Luck Cards
                </Link>
                <Link 
                  href="/teams" 
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Teams
                </Link>
                <Link 
                  href="/matrix" 
                  className="text-sm font-medium text-slate-400 hover:text-purple-400 transition-colors"
                >
                  Matrix
                </Link>
                <div className="px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700">
                  <span className="text-xs font-semibold text-emerald-400">2025-26</span>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-slate-950">{children}</main>
        <footer className="bg-slate-950 border-t border-slate-800/60 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-400">
                  2025-26 Season
                </span>
                <span>•</span>
                <span>Powered by API-Football</span>
              </div>
              <p className="text-xs text-slate-600">
                Statistical analysis using Expected Goals (xG) • Not affiliated with FPL
              </p>
              <p className="text-xs text-slate-700">
                Find undervalued assets before the casuals
              </p>
            </div>
          </div>
        </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
