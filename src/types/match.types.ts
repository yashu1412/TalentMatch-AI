import { SkillPresence } from './resume.types';

export type MatchResponseDTO = {
  name: string | null;
  salary: string | null;
  yearOfExperience: number | null;
  resumeSkills: string[];
  matchingJobs: Array<{
    jobId: string;
    role: string | null;
    aboutRole: string | null;
    skillsAnalysis: SkillPresence[];
    matchingScore: number;
  }>;
};
