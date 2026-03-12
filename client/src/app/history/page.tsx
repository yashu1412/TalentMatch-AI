"use client";

import { motion } from "framer-motion";
import { Clock, FileText, Target, TrendingUp, User, Trash2, ChevronRight, Loader2 } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import AuthenticatedContent from "@/components/auth/AuthenticatedContent";
import { useHistory } from "@/hooks/useHistory";

export default function HistoryPage() {
  const { history, loading, error, deleteEntry, clearHistory } = useHistory();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-primary-glow";
    if (score >= 40) return "text-warning";
    return "text-danger";
  };

  return (
    <div className="min-h-screen px-6 pt-32 pb-20 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-blue mb-4">
            Your Matching History
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Track all your resume-job matches and analyze your application patterns
          </p>
        </motion.div>

        <AuthenticatedContent fallback={
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <GlassCard className="max-w-md mx-auto p-8 text-center">
              <User className="w-16 h-16 text-primary-glow mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Sign In Required
              </h3>
              <p className="text-text-secondary mb-6">
                Please sign in to view your matching history and track your progress.
              </p>
            </GlassCard>
          </motion.div>
        }>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-primary-glow animate-spin mb-4" />
              <p className="text-text-secondary">Loading your history...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <GlassCard className="max-w-md mx-auto p-8 border-danger/20 bg-danger/5">
                <p className="text-danger mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-xl bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30 transition-all"
                >
                  Retry
                </button>
              </GlassCard>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-20">
              <GlassCard className="max-w-md mx-auto p-12 text-center opacity-80">
                <Clock className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  No History Yet
                </h3>
                <p className="text-text-secondary mb-6">
                  Once you start matching resumes with job descriptions, your history will appear here.
                </p>
                <a 
                  href="/#upload"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white shadow-blue hover:shadow-glow transition-all"
                >
                  Start Matching
                </a>
              </GlassCard>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
              >
                <GlassCard className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-primary-glow" />
                  </div>
                  <div className="text-2xl font-bold text-text-primary mb-1">{history.length}</div>
                  <div className="text-sm text-text-secondary">Total Matches</div>
                </GlassCard>

                <GlassCard className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-success" />
                  </div>
                  <div className="text-2xl font-bold text-text-primary mb-1">
                    {Math.round(history.reduce((acc, curr) => acc + curr.matchScore, 0) / history.length)}%
                  </div>
                  <div className="text-sm text-text-secondary">Average Match</div>
                </GlassCard>

                <GlassCard className="p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary-glow/20 flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-primary-glow" />
                  </div>
                  <div className="text-2xl font-bold text-text-primary mb-1">
                    {history.filter(h => h.matchScore >= 80).length}
                  </div>
                  <div className="text-sm text-text-secondary">High Matches (80%+)</div>
                </GlassCard>
              </motion.div>

              {/* History Actions */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-text-primary">Recent Activity</h2>
                <button 
                  onClick={clearHistory}
                  className="flex items-center gap-2 text-sm text-danger hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All History
                </button>
              </div>

              {/* History Table/List */}
              <div className="space-y-4">
                {history.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                  >
                    <GlassCard className="group relative overflow-hidden p-5 transition-all hover:bg-white/[0.05]">
                      <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1.5fr_1fr_1fr_auto] items-center gap-6">
                        {/* Job & Date */}
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                            <Clock className="w-5 h-5 text-primary-glow" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-text-primary group-hover:text-primary-glow transition-colors">
                              {entry.jobTitle}
                            </div>
                            <div className="text-xs text-text-muted mt-1">
                              {formatDate(entry.timestamp)}
                            </div>
                          </div>
                        </div>

                        {/* Resume */}
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-text-muted" />
                          <div className="text-sm text-text-secondary truncate max-w-[180px]">
                            {entry.resumeName}
                          </div>
                        </div>

                        {/* Skills Matched */}
                        <div className="text-center md:text-left">
                          <div className="text-xs text-text-muted mb-1">Skills Matched</div>
                          <div className="text-sm font-medium text-text-primary">
                            {entry.skillsMatched} / {entry.totalSkills}
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-center md:text-left">
                          <div className="text-xs text-text-muted mb-1">Match Score</div>
                          <div className={`text-xl font-bold ${getScoreColor(entry.matchScore)}`}>
                            {entry.matchScore}%
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => deleteEntry(entry.id)}
                            className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-all opacity-0 group-hover:opacity-100"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg bg-white/5 text-text-muted hover:text-text-primary hover:bg-white/10 transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </AuthenticatedContent>
      </div>
    </div>
  );
}
