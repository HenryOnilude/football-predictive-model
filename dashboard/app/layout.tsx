import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Premier League xG Analysis Dashboard",
  description: "Performance regression analysis based on Expected Goals (xG) data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-white text-lg">⚽</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                    Premier League xG Analysis
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                  <span className="text-xs font-medium text-slate-600">2025-2026</span>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">{children}</main>
        <footer className="bg-white border-t border-slate-200/60 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center space-y-2">
              <p className="text-sm text-slate-500">
                Data sourced from FBRef.com
              </p>
              <p className="text-xs text-slate-400">
                Analysis powered by Poisson distribution • Auto-updated daily
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
