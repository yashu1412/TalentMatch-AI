"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { CheckCircle2, Target, TriangleAlert, Zap, Save } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { useHistory } from "@/hooks/useHistory";

type MatchScoreCardProps = {
  score?: number;
  matched?: number;
  total?: number;
  matchData?: any; // Full match data for history saving
};

export default function MatchScoreCard({
  score = 0,
  matched = 0,
  total = 0,
  matchData,
}: MatchScoreCardProps) {
  const { saveToHistory, canSave } = useHistory();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const circumference = 2 * Math.PI * 64;
  const progress = Math.max(0, Math.min(100, score));
  const offset = circumference - (progress / 100) * circumference;
  const missing = Math.max(total - matched, 0);

  const handleSaveToHistory = async () => {
    if (!canSave || !matchData || saving) return;

    setSaving(true);
    try {
      const success = await saveToHistory(matchData);
      if (success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <GlassCard className="relative overflow-hidden p-6 md:p-8">
        <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-primary-glow/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col items-center justify-center">
            <div className="relative flex h-[190px] w-[190px] items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary-glow/10 blur-2xl" />
              <div className="absolute inset-4 rounded-full border border-primary-glow/15 bg-white/[0.03]" />

              <svg
                className="absolute inset-0 -rotate-90"
                viewBox="0 0 160 160"
              >
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="10"
                  fill="none"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="64"
                  stroke="url(#scoreGradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ strokeDashoffset: circumference }}
                  whileInView={{ strokeDashoffset: offset }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
                  strokeDasharray={circumference}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#38BDF8" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="relative z-10 text-center">
                <div className="text-xs uppercase tracking-[0.22em] text-text-muted">
                  Match Score
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                  className="mt-2 text-5xl font-bold text-text-primary"
                >
                  {score}
                  <span className="text-2xl text-primary-glow">%</span>
                </motion.div>
              </div>
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-glow/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-text-secondary">
              <Target className="h-3.5 w-3.5 text-primary-glow" />
              Compatibility Analysis
            </div>

            <h3 className="mt-4 text-2xl font-semibold text-text-primary md:text-3xl">
              Candidate fit looks strong for this role
            </h3>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
              The system compares extracted resume skills against job
              requirements, then calculates a matching score and highlights
              missing technologies for quick hiring review.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <MetricCard
                icon={<CheckCircle2 className="h-5 w-5 text-success" />}
                label="Matched"
                value={`${matched}`}
                tone="green"
              />
              <MetricCard
                icon={<TriangleAlert className="h-5 w-5 text-warning" />}
                label="Missing"
                value={`${missing}`}
                tone="yellow"
              />
              <MetricCard
                icon={<Zap className="h-5 w-5 text-primary-glow" />}
                label="Total JD Skills"
                value={`${total}`}
                tone="blue"
              />
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-text-secondary">Fit strength</span>
                <span className="font-medium text-text-primary">{score}%</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.25 }}
                  className="relative h-full rounded-full bg-gradient-to-r from-primary-dark via-primary to-primary-glow"
                >
                  <div className="absolute inset-0 animate-pulse rounded-full bg-white/10" />
                </motion.div>
              </div>
            </div>

            {/* Skills Analysis List */}
            {matchData?.matchingJobs?.[0]?.skillsAnalysis && (
              <div className="mt-8 border-t border-white/10 pt-6">
                <h4 className="text-sm font-medium text-text-primary mb-4 uppercase tracking-wider">
                  Skills Analysis
                </h4>
                <div className="flex flex-wrap gap-2">
                  {matchData.matchingJobs[0].skillsAnalysis.map((item: any, idx: number) => (
                    <span 
                      key={idx}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${
                        item.presentInResume 
                          ? 'bg-success/10 text-success border-success/20' 
                          : 'bg-warning/10 text-warning border-warning/20'
                      }`}
                    >
                      {item.presentInResume ? <CheckCircle2 className="w-3 h-3" /> : <TriangleAlert className="w-3 h-3" />}
                      {item.skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Save to History Button */}
            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveToHistory}
                disabled={saving || saved}
                className={`flex w-full items-center justify-center gap-2.5 rounded-2xl border px-6 py-4 text-sm font-semibold transition-all duration-300 ${
                  saved 
                    ? "border-success/30 bg-success/10 text-success" 
                    : "border-primary-glow/30 bg-primary-glow/10 text-primary-glow hover:bg-primary-glow/20"
                }`}
              >
                {saving ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-glow border-t-transparent" />
                ) : saved ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Saved to History
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Results to History
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "green" | "yellow" | "blue";
}) {
  const toneClasses = {
    green: "border-green-400/15 bg-green-400/5",
    yellow: "border-yellow-400/15 bg-yellow-400/5",
    blue: "border-primary-glow/15 bg-primary-glow/5",
  };

  return (
    <div
      className={`rounded-2xl border p-4 ${toneClasses[tone]}`}
    >
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-text-primary">
        {value}
      </div>
    </div>
  );
}
