"use client";

import { useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  ClipboardList,
  FileText,
  Sparkles,
  Upload,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { useUpload } from "@/hooks/useUpload";
import { parseJD, ParsedJD } from "@/lib/api";

function formatExperience(years?: number | null): string {
  if (years == null) return "Experience not detected";
  if (years === 0) return "0–1 year";

  const months = Math.round(years * 12);
  if (months > 0 && months < 12) {
    return `${months} month${months === 1 ? "" : "s"}`;
  }

  const rounded = Math.round(years * 10) / 10;
  if (Number.isInteger(rounded)) {
    return `${rounded} years`;
  }
  return `${rounded.toFixed(1)} years`;
}

type TabType = "paste" | "upload";

export default function JDInputPanel() {
  const [activeTab, setActiveTab] = useState<TabType>("paste");
  const [jdText, setJdText] = useState("");
  const [parsedFromText, setParsedFromText] = useState<ParsedJD | null>(null);
  const [isParsingText, setIsParsingText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading, progress, error, data, uploadFile, reset } = useUpload({
    onSuccess: (parsedData) => {
      console.log('JD parsed successfully:', parsedData);
      // You can emit an event or call a callback here
      window.dispatchEvent(new CustomEvent('jdParsed', { detail: parsedData }));
    },
    onError: (errorMessage) => {
    },
  });

  const preview = useMemo(() => {
    const words = jdText.trim().split(/\s+/).filter(Boolean).length;
    const experienceMatch = jdText.match(/(\d+(?:\.\d+)?)\+?\s*(?:years|yrs)/i)?.[0];
    const source = parsedFromText || data || null;
    const experienceYears = source?.yearOfExperience;
    const salaryMatch =
      jdText.match(
        /(?:₹|\$)\s?\d[\d,]*(?:\s*[–-]\s*(?:₹|\$)?\s?\d[\d,]*)?(?:\s*(?:per\s+year|per\s+annum|\/year|annual(?:ly)?)?)?/i
      ) ||
      jdText.match(/\d+(?:\.\d+)?\s*(?:LPA|lakhs?)/i);

    const firstNonEmptyLine =
      jdText
        .split("\n")
        .map((l) => l.trim())
        .find((l) => l.length > 0) || "";

    return {
      role:
        /frontend/i.test(jdText)
          ? "Frontend Engineer"
          : /backend/i.test(jdText)
          ? "Backend Developer"
          : /full[\s-]?stack/i.test(jdText)
          ? "Full Stack Developer"
          : firstNonEmptyLine.length > 0 && firstNonEmptyLine.length < 80
          ? firstNonEmptyLine
          : data?.role || "Role will appear here",
      experience: experienceMatch
        ? experienceMatch
        : formatExperience(experienceYears),
      salary: salaryMatch?.[0] || source?.salary || "Salary not detected",
      skills: source?.allSkills || [],
      words,
    };
  }, [jdText, data, parsedFromText]);

  const handleFileUpload = async (file: File) => {
    await uploadFile(file, 'jd', { jobCode: `JD-${Date.now()}` });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const resetUpload = () => {
    reset();
    setParsedFromText(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
      className="w-full h-full"
    >
      <GlassCard className="p-6 md:p-7 h-full flex flex-col">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-glow/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-text-secondary">
              <BriefcaseBusiness className="h-3.5 w-3.5 text-primary-glow" />
              Job Description
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-text-primary">
              Add job description
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
              Paste JD content or upload a file to extract role summary,
              experience, skills, and salary information.
            </p>
          </div>

          <div className="hidden rounded-2xl border border-white/10 bg-white/5 p-3 md:block">
            <ClipboardList className="h-8 w-8 text-primary-glow" />
          </div>
        </div>

        <div className="mb-5 inline-flex rounded-2xl border border-white/10 bg-black/20 p-1">
          <button
            onClick={() => setActiveTab("paste")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
              activeTab === "paste"
                ? "bg-primary/20 text-white shadow-blue"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Paste text
            </span>
          </button>

          <button
            onClick={() => setActiveTab("upload")}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
              activeTab === "upload"
                ? "bg-primary/20 text-white shadow-blue"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload file
            </span>
          </button>
        </div>

        {activeTab === "paste" ? (
          <div className="space-y-5">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
              <label className="mb-3 block text-sm font-medium text-text-primary">
                Paste JD content
              </label>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                placeholder="Paste job description here..."
                className="min-h-[280px] w-full rounded-2xl border border-primary-light/15 bg-slate-950/50 px-4 py-4 text-sm text-text-primary outline-none transition-all duration-300 placeholder:text-text-muted focus:border-primary-glow/40 focus:ring-2 focus:ring-primary-glow/15"
              />
              <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
                <span>Live JD preview enabled</span>
                <span>{preview.words} words</span>
              </div>
              <button
                onClick={async () => {
                  if (!jdText.trim() || isParsingText) return;
                  setIsParsingText(true);
                  try {
                    const res = await parseJD(undefined, jdText, `JD-${Date.now()}`);
                    if (res.success && res.data) {
                      setParsedFromText(res.data);
                      window.dispatchEvent(new CustomEvent('jdParsed', { detail: res.data }));
                    }
                  } finally {
                    setIsParsingText(false);
                  }
                }}
                className="mt-4 inline-flex items-center rounded-xl border border-primary-light/30 bg-gradient-to-r from-primary-dark via-primary to-primary-glow px-4 py-2 text-xs font-medium text-white shadow-blue transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isParsingText || !jdText.trim()}
              >
                {isParsingText ? "Analyzing JD..." : "Use this JD for matching"}
              </button>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-text-primary">
                <Sparkles className="h-4 w-4 text-primary-glow" />
                Extracted preview
              </div>

              <div className="space-y-3">
                <InfoRow label="Role" value={preview.role} />
                <InfoRow label="Experience" value={preview.experience} />
                <InfoRow label="Salary" value={preview.salary} />
                
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="text-xs uppercase tracking-[0.16em] text-text-muted mb-2">
                    Extracted Skills
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {preview.skills.length > 0 ? (
                      preview.skills.map((skill: string, idx: number) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center rounded-md bg-primary-glow/10 px-2 py-0.5 text-xs font-medium text-primary-glow border border-primary-glow/20"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-text-secondary italic">
                        {isParsingText ? "Analyzing..." : "No skills extracted yet. Click 'Use this JD' to analyze."}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[26px] border border-dashed border-primary-light/20 bg-white/[0.03] p-10 text-center transition-all duration-300 hover:border-primary-glow/30 hover:bg-white/[0.05]">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            
            {isUploading ? (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary-glow/20 bg-primary-glow/10">
                  <Loader2 className="h-7 w-7 text-primary-glow animate-spin" />
                </div>
                <h4 className="mt-5 text-lg font-semibold text-text-primary">
                  Parsing JD file...
                </h4>
                <p className="mt-2 text-sm text-text-secondary">
                  {progress}% complete
                </p>
                <div className="mt-4 w-64 h-2 bg-white/10 rounded-full overflow-hidden mx-auto">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary-glow/20 bg-primary-glow/10">
                  <Upload className="h-7 w-7 text-primary-glow" />
                </div>
                <h4 className="mt-5 text-lg font-semibold text-text-primary">
                  Upload JD file
                </h4>
                <p className="mt-2 text-sm text-text-secondary">
                  Support PDF, DOC, DOCX, or TXT for job description extraction.
                </p>
                <button 
                  onClick={handleFileButtonClick}
                  className="mt-6 rounded-2xl border border-primary-light/30 bg-gradient-to-r from-primary-dark via-primary to-primary-glow px-5 py-3 text-sm font-medium text-white shadow-blue transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow"
                >
                  Choose JD File
                </button>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/5 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-red-400/20 bg-red-400/10 p-2">
                <FileText className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-red-400">
                  Upload failed
                </div>
                <div className="text-sm text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {data && (
          <div className="mt-4 rounded-2xl border border-green-400/20 bg-green-400/5 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-green-400/20 bg-green-400/10 p-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="text-sm font-medium text-success">
                    JD parsed successfully
                  </div>
                  <div className="text-sm text-green-300 mb-3">
                    {data.role} • {data.allSkills?.length || 0} skills found
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {data.allSkills?.map((skill: string, idx: number) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center rounded-md bg-green-400/10 px-2 py-0.5 text-[10px] font-medium text-green-400 border border-green-400/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={resetUpload}
                className="text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="text-xs uppercase tracking-[0.16em] text-text-muted">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-text-primary">{value}</div>
    </div>
  );
}
