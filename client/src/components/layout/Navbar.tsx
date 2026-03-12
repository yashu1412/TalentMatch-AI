"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Sparkles, FileText, Play, BarChart3, History, LayoutDashboard } from "lucide-react";
import AuthButtons from "@/components/auth/AuthButtons";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "History", href: "/history", icon: History },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-6 pt-6 md:px-10 lg:px-16"
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between rounded-[24px] border border-white/10 bg-slate-950/40 px-6 py-3 backdrop-blur-2xl shadow-2xl transition-all duration-300 hover:border-white/20">
        <Link href="/" className="group flex items-center gap-4">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-[18px] border border-primary-glow/30 bg-white/5 transition-transform duration-500 group-hover:rotate-[10deg] group-hover:scale-110">
            <div className="absolute inset-0 rounded-[18px] bg-primary-glow/20 blur-xl group-hover:bg-primary-glow/40 transition-all duration-500" />
            <Sparkles className="relative z-10 h-6 w-6 text-primary-glow animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white group-hover:text-primary-glow transition-colors duration-300">
              Resume Matcher
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary-light/70 font-medium">
              AI-Powered Analysis
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-3 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group relative flex items-center gap-2.5 rounded-2xl px-5 py-2.5 text-sm font-medium transition-all duration-500 ${
                  isActive 
                    ? "bg-primary-glow/10 text-white border border-primary-glow/20 shadow-[0_0_20px_rgba(56,189,248,0.15)]" 
                    : "text-text-secondary hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-all duration-500 ${
                  isActive ? "text-primary-glow scale-110" : "text-primary-light/60 group-hover:text-primary-glow group-hover:scale-110"
                }`} />
                <span>{item.label}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="navGlow"
                    className="absolute inset-0 rounded-2xl bg-primary-glow/5 blur-sm -z-10"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="h-6 w-px bg-white/10 hidden md:block mx-2" />
          <AuthButtons />
        </div>
      </div>
    </motion.header>
  );
}
