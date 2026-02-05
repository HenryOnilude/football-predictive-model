import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import MobileNav from "@/components/MobileNav";
import AlphaPulse from "@/components/AlphaPulse";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FPL Axiom | Capture the Alpha",
  description: "The institutional-grade analytics terminal for serious FPL managers. Separate signal from noise with predictive volatility models and real-time market pricing.",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="bg-[rgb(var(--background))] text-[rgb(var(--text-primary))] font-sans">
        <ThemeProvider>
        <nav className="bg-[rgb(var(--background))]/90 backdrop-blur-md border-b border-[rgb(var(--surface-highlight))]/60 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/luck" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-9 h-9 rounded-xl bg-slate-800/50 flex items-center justify-center shadow-lg">
                  <Image
                    src="/logo.png"
                    alt="FPL Axiom Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">
                    FPL Axiom
                  </h1>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                    Capture the Alpha
                  </p>
                </div>
              </Link>
              {/* Year Badge + Health Indicator */}
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700">
                  <span className="text-xs font-semibold text-emerald-400">2025-26</span>
                </div>
                <AlphaPulse />
              </div>
              
              {/* Desktop Navigation - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/"
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/fpl"
                  className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Terminal
                </Link>
                <Link
                  href="/luck"
                  className="text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors"
                >
                  Alpha
                </Link>
                <Link
                  href="/teams"
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Assets
                </Link>
                <Link
                  href="/matrix"
                  className="text-sm font-medium text-slate-400 hover:text-purple-400 transition-colors"
                >
                  Matrix
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-slate-950 pb-20 md:pb-0">{children}</main>
        <MobileNav />
        <footer className="bg-slate-950 border-t border-slate-800/60 mt-16 mb-16 md:mb-0">
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
                FPL Axiom • Institutional-Grade Analytics Terminal • Not affiliated with FPL
              </p>
              <p className="text-xs text-slate-700">
                Capture the Alpha
              </p>
            </div>
          </div>
        </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
