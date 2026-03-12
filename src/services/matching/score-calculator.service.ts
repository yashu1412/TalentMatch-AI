import { SkillPresence } from '../../types/resume.types';

export class ScoreCalculatorService {
  static calculateMatchingScore(matchedJdSkills: number, totalJdSkills: number): number {
    if (!totalJdSkills || totalJdSkills <= 0) return 0;
    const score = (matchedJdSkills / totalJdSkills) * 100;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  static calculateSkillsAnalysis(resumeSkills: string[], jdSkills: string[]): SkillPresence[] {
    const analysis: SkillPresence[] = [];
    
    // Normalize all resume skills for comparison
    const normalizedResumeSkills = new Set(resumeSkills.map(s => s.toLowerCase().trim()));
    
    for (const jdSkill of jdSkills) {
      const normalizedJdSkill = jdSkill.toLowerCase().trim();
      const presentInResume = normalizedResumeSkills.has(normalizedJdSkill);
      
      analysis.push({
        skill: jdSkill,
        presentInResume
      });
    }
    
    return analysis;
  }

  static calculateWeightedScore(
    resumeSkills: string[], 
    requiredSkills: string[], 
    optionalSkills: string[]
  ): {
    totalScore: number;
    requiredScore: number;
    optionalScore: number;
    skillsAnalysis: SkillPresence[];
  } {
    // Calculate required skills score (weight: 1.0)
    const requiredAnalysis = this.calculateSkillsAnalysis(resumeSkills, requiredSkills);
    const requiredMatched = requiredAnalysis.filter(skill => skill.presentInResume).length;
    const requiredScore = requiredSkills.length > 0 
      ? this.calculateMatchingScore(requiredMatched, requiredSkills.length)
      : 0;

    // Calculate optional skills score (weight: 0.5)
    const optionalAnalysis = this.calculateSkillsAnalysis(resumeSkills, optionalSkills);
    const optionalMatched = optionalAnalysis.filter(skill => skill.presentInResume).length;
    const optionalScore = optionalSkills.length > 0
      ? this.calculateMatchingScore(optionalMatched, optionalSkills.length) * 0.5
      : 0;

    // Combine all skills for total score
    const allSkills = [...requiredSkills, ...optionalSkills];
    const allAnalysis = this.calculateSkillsAnalysis(resumeSkills, allSkills);
    const totalMatched = allAnalysis.filter(skill => skill.presentInResume).length;
    const totalScore = allSkills.length > 0
      ? this.calculateMatchingScore(totalMatched, allSkills.length)
      : 0;

    return {
      totalScore,
      requiredScore,
      optionalScore,
      skillsAnalysis: allAnalysis
    };
  }

  static calculateExperienceMatch(resumeExperience: number | null, jdExperience: number | null): number {
    if (resumeExperience === null || jdExperience === null) {
      return 0;
    }

    // Perfect match
    if (resumeExperience >= jdExperience) {
      return 100;
    }

    // Calculate percentage based on how close they are
    const ratio = resumeExperience / jdExperience;
    return Math.round(ratio * 100);
  }

  static calculateSalaryMatch(
    resumeExpectedSalary: number | null, 
    jdOfferedSalary: number | null,
    tolerance: number = 0.2 // 20% tolerance
  ): number {
    if (resumeExpectedSalary === null || jdOfferedSalary === null) {
      return 0;
    }

    // Perfect match or better offer
    if (jdOfferedSalary >= resumeExpectedSalary) {
      return 100;
    }

    // Calculate based on tolerance
    const ratio = jdOfferedSalary / resumeExpectedSalary;
    const minimumAcceptable = 1 - tolerance;

    if (ratio >= minimumAcceptable) {
      // Linear interpolation between minimum acceptable and perfect match
      const normalizedRatio = (ratio - minimumAcceptable) / tolerance;
      return Math.round(normalizedRatio * 100);
    }

    // Below tolerance
    return 0;
  }

  static generateMatchReport(resumeSkills: string[], jdSkills: string[]): {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    extraSkills: string[];
    skillsAnalysis: SkillPresence[];
  } {
    const skillsAnalysis = this.calculateSkillsAnalysis(resumeSkills, jdSkills);
    
    // Sort analysis: present in resume first, then alphabetically
    skillsAnalysis.sort((a, b) => {
      if (a.presentInResume && !b.presentInResume) return -1;
      if (!a.presentInResume && b.presentInResume) return 1;
      return a.skill.localeCompare(b.skill);
    });

    const matchedSkills = skillsAnalysis
      .filter(skill => skill.presentInResume)
      .map(skill => skill.skill);
    
    const missingSkills = skillsAnalysis
      .filter(skill => !skill.presentInResume)
      .map(skill => skill.skill);
    
    const extraSkills = resumeSkills.filter(skill => !jdSkills.includes(skill));
    
    const score = this.calculateMatchingScore(matchedSkills.length, jdSkills.length);

    return {
      score,
      matchedSkills,
      missingSkills,
      extraSkills,
      skillsAnalysis
    };
  }

  static calculateSkillCategoryScores(
    resumeSkills: string[], 
    jdSkillsByCategory: Record<string, string[]>
  ): Record<string, number> {
    const categoryScores: Record<string, number> = {};

    for (const [category, skills] of Object.entries(jdSkillsByCategory)) {
      if (skills.length === 0) {
        categoryScores[category] = 0;
        continue;
      }

      const analysis = this.calculateSkillsAnalysis(resumeSkills, skills);
      const matched = analysis.filter(skill => skill.presentInResume).length;
      categoryScores[category] = this.calculateMatchingScore(matched, skills.length);
    }

    return categoryScores;
  }

  static calculateOverallMatchScore(
    skillsScore: number,
    experienceScore: number,
    salaryScore: number,
    weights: {
      skills: number;
      experience: number;
      salary: number;
    } = { skills: 0.6, experience: 0.3, salary: 0.1 }
  ): number {
    const totalWeight = weights.skills + weights.experience + weights.salary;
    
    if (totalWeight === 0) {
      return skillsScore; // Fallback to skills score only
    }

    const normalizedWeights = {
      skills: weights.skills / totalWeight,
      experience: weights.experience / totalWeight,
      salary: weights.salary / totalWeight
    };

    const weightedScore = 
      (skillsScore * normalizedWeights.skills) +
      (experienceScore * normalizedWeights.experience) +
      (salaryScore * normalizedWeights.salary);

    return Math.round(weightedScore);
  }

  static getMatchGrade(score: number): {
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    description: string;
    color: string;
  } {
    if (score >= 90) {
      return {
        grade: 'A',
        description: 'Excellent match',
        color: '#10b981' // green
      };
    } else if (score >= 80) {
      return {
        grade: 'B',
        description: 'Good match',
        color: '#3b82f6' // blue
      };
    } else if (score >= 70) {
      return {
        grade: 'C',
        description: 'Fair match',
        color: '#f59e0b' // amber
      };
    } else if (score >= 60) {
      return {
        grade: 'D',
        description: 'Poor match',
        color: '#f97316' // orange
      };
    } else {
      return {
        grade: 'F',
        description: 'Very poor match',
        color: '#ef4444' // red
      };
    }
  }
}
