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
      <body className="bg-gray-50 antialiased">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-900">
                  ⚽ Premier League xG Analysis
                </h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>2025-2026 Season</span>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-500">
              Data sourced from FBRef.com | Analysis powered by Poisson distribution
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
