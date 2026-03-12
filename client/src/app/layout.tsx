import type { Metadata } from 'next';
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Resume Intelligence Matcher",
  description: "AI-style futuristic dashboard for resume parsing and job matching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} min-h-screen bg-background text-text-primary antialiased`}
      >
        <div className="relative min-h-screen overflow-x-hidden">
          <div className="pointer-events-none absolute inset-0 -z-20 bg-background" />

          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.10),transparent_25%),linear-gradient(to_bottom,#050816,#070b18,#050816)]" />

          <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-pattern bg-[size:38px_38px] opacity-[0.08]" />

          <div className="pointer-events-none absolute left-[-10%] top-[-5%] -z-10 h-[26rem] w-[26rem] rounded-full bg-primary/20 blur-3xl animate-glowPulse" />
          <div className="pointer-events-none absolute bottom-[-8%] right-[-8%] -z-10 h-[24rem] w-[24rem] rounded-full bg-primary-glow/15 blur-3xl animate-glowPulse" />

          {children}
        </div>
      </body>
    </html>
  );
}
