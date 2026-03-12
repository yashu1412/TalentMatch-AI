"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileUp, FileText, CheckCircle2, UploadCloud, Loader2 } from "lucide-react";
import GlassCard from "@/components/shared/GlassCard";
import { useUpload } from "@/hooks/useUpload";

function formatExperience(years?: number | null): string {
  if (years == null) return "Not detected";
  if (years === 0) return "Fresher / < 1 year";

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

export default function ResumeUploadCard() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [targetRole, setTargetRole] = useState("");

  // Listen for JD parsing to auto-fill target role
  useEffect(() => {
    const handleJDParsed = (event: CustomEvent) => {
      const data = event.detail;
      if (data.role) {
        setTargetRole(data.role);
        window.dispatchEvent(new CustomEvent('targetRoleChanged', { detail: data.role }));
      }
    };

    window.addEventListener('jdParsed', handleJDParsed as EventListener);
    return () => {
      window.removeEventListener('jdParsed', handleJDParsed as EventListener);
    };
  }, []);

  const { isUploading, progress, error, data, uploadFile, reset } = useUpload({
    onSuccess: (parsedData) => {
      console.log('Resume parsed successfully:', parsedData);
      // You can emit an event or call a callback here
      window.dispatchEvent(new CustomEvent('resumeParsed', { detail: parsedData }));
    },
    onError: (errorMessage) => {
    },
  });

  const handleFile = async (file?: File) => {
    if (!file) return;
    
    setFileName(file.name);
    await uploadFile(file, 'resume');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleClick = () => {
    if (!isUploading) {
      inputRef.current?.click();
    }
  };

  const resetUpload = () => {
    reset();
    setFileName("");
    setTargetRole("");
    window.dispatchEvent(new CustomEvent('targetRoleChanged', { detail: "" }));
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full h-full"
    >
      <GlassCard className="relative p-6 md:p-7 h-full flex flex-col">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-glow/20 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-text-secondary">
              <FileUp className="h-3.5 w-3.5 text-primary-glow" />
              Resume Upload
            </div>
            <h3 className="mt-4 text-2xl font-semibold text-text-primary">
              Upload candidate resume
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
              Drop a PDF or DOCX file to begin parsing candidate details,
              experience, and skills using your backend pipeline.
            </p>
          </div>

          <div className="hidden rounded-2xl border border-white/10 bg-white/5 p-3 md:block">
            <UploadCloud className="h-8 w-8 text-primary-glow" />
          </div>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={[
            "group relative cursor-pointer overflow-hidden rounded-[26px] border border-dashed p-8 transition-all duration-300",
            isDragging
              ? "border-primary-glow/50 bg-primary-glow/10 shadow-glow"
              : isUploading
              ? "border-primary-light/20 bg-white/[0.03]"
              : "border-primary-light/20 bg-white/[0.03] hover:border-primary-glow/35 hover:bg-white/[0.06]",
          ].join(" ")}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_45%)] opacity-80" />
          <div className="absolute -left-10 top-0 h-full w-20 -skew-x-12 bg-white/10 blur-xl transition-transform duration-1000 group-hover:translate-x-[520px]" />

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />

          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            {isUploading ? (
              <>
                <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-primary-glow/20 bg-primary-glow/10">
                  <div className="absolute inset-0 rounded-full bg-primary-glow/20 blur-xl" />
                  <Loader2 className="relative z-10 h-9 w-9 text-primary-glow animate-spin" />
                </div>
                <h4 className="text-lg font-semibold text-text-primary">
                  Parsing resume...
                </h4>
                <p className="mt-2 text-sm text-text-secondary">
                  {progress}% complete
                </p>
                <div className="mt-4 w-64 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-primary-glow/20 bg-primary-glow/10">
                  <div className="absolute inset-0 rounded-full bg-primary-glow/20 blur-xl" />
                  <UploadCloud className="relative z-10 h-9 w-9 text-primary-glow" />
                </div>
                <h4 className="text-lg font-semibold text-text-primary">
                  Drag & drop your resume
                </h4>
                <p className="mt-2 text-sm text-text-secondary">
                  or click to browse PDF / DOCX files
                </p>
                <div className="mt-5 inline-flex rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-text-secondary">
                  Supported formats: PDF, DOC, DOCX
                </div>
              </>
            )}
          </div>
        </div>

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

        <div className="mt-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-text-muted mb-3">
              Target Role (Optional)
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-primary-glow/5 rounded-xl blur-md group-focus-within:bg-primary-glow/10 transition-all" />
              <input
                type="text"
                value={targetRole}
                onChange={(e) => {
                  setTargetRole(e.target.value);
                  window.dispatchEvent(new CustomEvent('targetRoleChanged', { detail: e.target.value }));
                }}
                placeholder="e.g. Senior Software Engineer"
                className="relative w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-2.5 text-sm text-text-primary outline-none transition-all focus:border-primary-glow/40 focus:ring-2 focus:ring-primary-glow/15"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-text-muted">
              Current file
            </div>
            {fileName ? (
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`rounded-xl border p-2 ${
                    data 
                      ? 'border-green-400/20 bg-green-400/10' 
                      : isUploading 
                      ? 'border-yellow-400/20 bg-yellow-400/10'
                      : 'border-primary-light/20 bg-primary/10'
                  }`}>
                    {data ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : isUploading ? (
                      <Loader2 className="h-5 w-5 text-yellow-400 animate-spin" />
                    ) : (
                      <FileText className="h-5 w-5 text-primary-light" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-text-primary">
                      {fileName}
                    </div>
                    <div className={`text-sm ${
                      data 
                        ? 'text-success' 
                        : isUploading 
                        ? 'text-yellow-400'
                        : 'text-text-secondary'
                    }`}>
                      {data ? 'Parsing complete' : isUploading ? 'Processing...' : 'Ready for upload'}
                    </div>
                  </div>
                </div>
                {data && (
                  <button
                    onClick={resetUpload}
                    className="text-xs text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-3 text-sm text-text-secondary">
                No file selected yet.
              </div>
            )}
          </div>
        </div>

        {/* Parsed resume preview */}
        {data && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-text-muted">
              Parsed resume details
            </div>
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              <div>
                <div className="text-xs text-text-muted">Name</div>
                <div className="mt-1 text-sm font-medium text-text-primary">
                  {data.name || "Not detected"}
                </div>
              </div>
              <div>
                <div className="text-xs text-text-muted">Experience</div>
                <div className="mt-1 text-sm font-medium text-text-primary">
                  {formatExperience(data.yearOfExperience)}
                </div>
              </div>
              <div className="md:col-span-3">
                <div className="text-xs text-text-muted mb-2">Skills extracted</div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.isArray(data.resumeSkills) && data.resumeSkills.length > 0 ? (
                    data.resumeSkills.map((skill: string, idx: number) => (
                      <span 
                        key={idx}
                        className="inline-flex items-center rounded-md bg-primary-glow/10 px-2 py-0.5 text-xs font-medium text-primary-glow border border-primary-glow/20"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-text-secondary">No skills detected</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}
