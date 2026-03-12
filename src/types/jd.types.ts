export type ParsedJDDTO = {
  jobId: string;
  role: string | null;
  salary: string | null;
  yearOfExperience: number | null;
  aboutRole: string | null;
  requiredSkills: string[];
  optionalSkills: string[];
  allSkills: string[];
};
