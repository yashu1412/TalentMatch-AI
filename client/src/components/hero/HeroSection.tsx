"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import OrbScene from "@/components/background/OrbScene";
import GlassCard from "@/components/shared/GlassCard";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.7,
      ease: "easeOut",
    },
  }),
};

const stats = [
  { label: "Resume Parsing", value: "Fast" },
  { label: "Skill Mapping", value: "Accurate" },
  { label: "Match Output", value: "JSON Ready" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-10 md:px-10 lg:px-16 lg:pb-24 lg:pt-14">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            <motion.div
              custom={0}
              variants={fadeUp}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-glow/20 bg-white/5 px-4 py-2 text-sm text-text-secondary backdrop-blur-md"
            >
              <span className="h-2 w-2 rounded-full bg-primary-glow shadow-[0_0_14px_rgba(56,189,248,0.8)]" />
              Futuristic Resume Matching Dashboard
            </motion.div>

            <motion.h1
              custom={0.12}
              variants={fadeUp}
              className="text-4xl font-semibold leading-tight text-text-primary sm:text-5xl lg:text-6xl"
            >
              Build a{" "}
              <span className="bg-gradient-to-r from-white via-primary-light to-primary-glow bg-clip-text text-transparent">
                black + blue
              </span>{" "}
              intelligent hiring platform with 3D motion and premium UI.
            </motion.h1>

            <motion.p
              custom={0.24}
              variants={fadeUp}
              className="mt-6 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg"
            >
              Parse resumes, analyze job descriptions, compare skills, and
              visualize match scores in a modern AI-style interface with glass
              panels, electric blue glow, and advanced transitions.
            </motion.p>

            <motion.div
              custom={0.36}
              variants={fadeUp}
              className="mt-8 flex flex-wrap gap-4"
            >
              <Link
                href="#upload"
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl border border-primary-light/30 bg-gradient-to-r from-primary-dark via-primary to-primary-glow px-6 py-3 text-sm font-medium text-white shadow-blue transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow"
              >
                <span className="relative z-10">Start Matching</span>
                <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.28),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
              </Link>

              <Link
                href="#results"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-text-primary backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-glow/30 hover:bg-white/[0.07]"
              >
                View Results UI
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            className="mt-10 grid gap-4 sm:grid-cols-3"
          >
            {stats.map((item, index) => (
              <motion.div
                key={item.label}
                custom={0.45 + index * 0.08}
                variants={fadeUp}
              >
                <GlassCard className="p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-text-muted">
                    {item.label}
                  </div>
                  <div className="mt-2 text-xl font-semibold text-text-primary">
                    {item.value}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative">
            <OrbScene />

            <div className="pointer-events-none absolute left-4 top-10 animate-float">
              <GlassCard className="px-4 py-3">
                <div className="text-xs text-text-muted">Match Score</div>
                <div className="mt-1 text-lg font-semibold text-primary-glow">
                  84%
                </div>
              </GlassCard>
            </div>

            <div className="pointer-events-none absolute bottom-8 right-2 animate-float [animation-delay:1s]">
              <GlassCard className="px-4 py-3">
                <div className="text-xs text-text-muted">Skills Found</div>
                <div className="mt-1 text-lg font-semibold text-text-primary">
                  18 / 22
                </div>
              </GlassCard>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
