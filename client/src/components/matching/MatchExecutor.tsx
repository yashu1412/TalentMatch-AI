"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Play, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { apiClient } from "@/lib/api";
import { ParsedResume, ParsedJD, MatchResult } from "@/lib/api";

interface MatchExecutorProps {
  onResumeData?: ParsedResume;
  onJDData?: ParsedJD;
  onMatchComplete?: (result: MatchResult) => void;
}

export default function MatchExecutor({
  onResumeData,
  onJDData,
  onMatchComplete,
}: MatchExecutorProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null);
  const [jdData, setJDData] = useState<ParsedJD | null>(null);
  const [targetRole, setTargetRole] = useState("");

  const matchingSkills = useMemo(() => {
    if (!resumeData || !jdData) return [];
    
    const resumeSkills = resumeData.resumeSkills || [];
    const jdSkills = jdData.allSkills || [];
    
    return resumeSkills.filter(skill => 
      jdSkills.some(jdSkill => jdSkill.toLowerCase() === skill.toLowerCase())
    );
  }, [resumeData, jdData]);

  // Listen for resume and JD parsing events
  useEffect(() => {
    const handleResumeParsed = (event: CustomEvent) => {
      setResumeData(event.detail);
      setError(null);
    };

    const handleJDParsed = (event: CustomEvent) => {
      const data = event.detail;
      setJDData(data);
      setError(null);
    };

    const handleTargetRoleChanged = (event: CustomEvent) => {
      setTargetRole(event.detail);
    };

    window.addEventListener('resumeParsed', handleResumeParsed as EventListener);
    window.addEventListener('jdParsed', handleJDParsed as EventListener);
    window.addEventListener('targetRoleChanged', handleTargetRoleChanged as EventListener);

    return () => {
      window.removeEventListener('resumeParsed', handleResumeParsed as EventListener);
      window.removeEventListener('jdParsed', handleJDParsed as EventListener);
      window.removeEventListener('targetRoleChanged', handleTargetRoleChanged as EventListener);
    };
  }, []);

  // Update data when props change
  useEffect(() => {
    if (onResumeData) setResumeData(onResumeData);
    if (onJDData) setJDData(onJDData);
  }, [onResumeData, onJDData]);

  const canExecute = resumeData && jdData && !isExecuting;

  const executeMatching = async () => {
    if (!canExecute) return;

    setIsExecuting(true);
    setError(null);
    setResult(null);

    try {
      // Send a more structured text so the backend can correctly extract metadata if needed
      const resumeText = [
        resumeData!.name ? `Name: ${resumeData!.name}` : '',
        resumeData!.yearOfExperience !== null ? `Experience: ${resumeData!.yearOfExperience} years` : '',
        `Skills:\n${resumeData!.resumeSkills.join(', ')}`
      ].filter(Boolean).join('\n');

      const jdText = [
        `Job Title: ${targetRole || jdData!.role}`,
        jdData!.salary ? `Salary: ${jdData!.salary}` : '',
        jdData!.aboutRole ? `About: ${jdData!.aboutRole}` : '',
        `Required Qualifications:\n${jdData!.allSkills.join(', ')}`
      ].filter(Boolean).join('\n\n');

      const response = await apiClient.matchResumeToJD({
        resumeText,
        jdText,
        jobCode: jdData!.jobId,
      });

      if (response.success && response.data) {
        setResult(response.data);
        onMatchComplete?.(response.data);
        
        // Emit match completed event
        window.dispatchEvent(new CustomEvent('matchCompleted', { detail: response.data }));
      
      } else {
        setError(response.error || 'Matching failed');
      }
    } catch (err) {
      setError('Failed to execute matching');
      console.error('Matching error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setResumeData(null);
    setJDData(null);
    setTargetRole("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3 }}
      className="mx-auto max-w-7xl px-6 md:px-10 lg:px-16"
    >
      <GlassCard className="p-6 md:p-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold text-gradient-blue mb-4">
            Execute Matching
          </h2>
          <p className="text-text-secondary mb-8 max-w-2xl">
            Upload your resume and add a job description, then click execute to see the matching results
          </p>

          {/* Status Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-8">
            <div className="text-center p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center justify-center gap-2 mb-2">
                {resumeData ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-warning" />
                )}
                <span className="text-sm font-medium text-text-primary">Resume</span>
              </div>
              <p className="text-xs text-text-secondary">
                {resumeData
                  ? `${resumeData.name} - ${(resumeData.resumeSkills?.length ?? 0)} skills`
                  : 'Not uploaded'}
              </p>
            </div>

            <div className="text-center p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center justify-center gap-2 mb-2">
                {jdData ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-warning" />
                )}
                <span className="text-sm font-medium text-text-primary">Job Description</span>
              </div>
              <p className="text-xs text-text-secondary">
                {jdData
                  ? `${jdData.role} - ${(jdData.allSkills?.length ?? 0)} total skills`
                  : 'Not added'}
              </p>
            </div>
          </div>

          {/* Matching Skills Preview */}
          {canExecute && matchingSkills.length > 0 && (
            <div className="w-full max-w-2xl mb-8 p-5 rounded-2xl border border-primary-glow/20 bg-primary-glow/5 text-left">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Matching Skills Identified
                </div>
                <span className="text-xs text-text-muted">
                  {matchingSkills.length} matches found
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {matchingSkills.map((skill, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center rounded-md bg-success/10 px-2.5 py-1 text-xs font-medium text-success border border-success/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Execute Button */}
          <motion.button
            whileHover={canExecute ? { scale: 1.05 } : {}}
            whileTap={canExecute ? { scale: 0.95 } : {}}
            onClick={executeMatching}
            disabled={!canExecute}
            className={`inline-flex items-center gap-3 rounded-xl border px-8 py-4 text-lg font-medium transition-all duration-300 ${
              canExecute
                ? 'border-primary-light/30 bg-gradient-to-r from-primary-dark via-primary to-primary-glow text-white shadow-blue hover:-translate-y-0.5 hover:shadow-glow'
                : 'border-white/20 bg-white/5 text-text-secondary cursor-not-allowed opacity-50'
            }`}
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Executing Matching...
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                Execute Matching
              </>
            )}
          </motion.button>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl border border-danger/30 bg-danger/20 text-danger max-w-2xl"
            >
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          {/* Success Display */}
          {result && result.matchingJobs && result.matchingJobs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl border border-success/30 bg-success/20 text-success max-w-2xl"
            >
              <p className="text-sm font-medium">
                Matching completed successfully! Score: {result.matchingJobs[0].matchingScore}%
                <span className="ml-2 opacity-80 font-normal">
                  ({result.matchingJobs[0].skillsAnalysis.filter(s => s.presentInResume).length} out of {result.matchingJobs[0].skillsAnalysis.length} skills matched)
                </span>
              </p>
            </motion.div>
          )}

          {/* Reset Button */}
          {(result || error) && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={reset}
              className="mt-4 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Reset and try again
            </motion.button>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
