"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/hero/HeroSection";
import ResumeUploadCard from "@/components/upload/ResumeUploadCard";
import JDInputPanel from "@/components/jd/JDInputPanel";
import MatchExecutor from "@/components/matching/MatchExecutor";
import MatchScoreCard from "@/components/results/MatchScoreCard";
import { MatchResult } from "@/lib/api";

export default function HomePage() {
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);

  const handleMatchComplete = (result: MatchResult) => {
    setMatchResult(result);
  };

  return (
    <main id="top" className="relative">
      <Navbar />
      <HeroSection />

      <section
        id="upload"
        className="mx-auto grid max-w-[1600px] gap-6 px-6 pb-16 md:px-10 lg:grid-cols-2 lg:px-16 items-stretch"
      >
        <ResumeUploadCard />
        <JDInputPanel />
      </section>

      <section
        id="execute"
        className="mx-auto max-w-[1600px] px-6 pb-16 md:px-10 lg:px-16"
      >
        <MatchExecutor onMatchComplete={handleMatchComplete} />
      </section>

      {matchResult && matchResult.matchingJobs && matchResult.matchingJobs.length > 0 && (
        <section
          id="results"
          className="mx-auto max-w-[1600px] px-6 pb-24 md:px-10 lg:px-16"
        >
          <MatchScoreCard 
            score={matchResult.matchingJobs[0].matchingScore}
            matched={matchResult.matchingJobs[0].skillsAnalysis?.filter((skill: any) => skill.presentInResume).length || 0}
            total={matchResult.matchingJobs[0].skillsAnalysis?.length || 0}
            matchData={matchResult}
          />
        </section>
      )}
    </main>
  );
}
