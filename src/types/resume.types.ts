export type SkillPresence = {
  skill: string;
  presentInResume: boolean;
};

export type ParsedResumeDTO = {
  name: string | null;
  email: string | null;
  phone: string | null;
  yearOfExperience: number | null;
  resumeSkills: string[];
  education?: Array<{
    degree?: string;
    institution?: string;
    startDate?: string;
    endDate?: string;
  }>;
  workHistory?: Array<{
    company?: string;
    title?: string;
    startDate?: string;
    endDate?: string;
    durationMonths?: number;
  }>;
};
