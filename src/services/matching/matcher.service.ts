import { ResumeParserService } from '../parsers/resume-parser.service';
import { JDParserService } from '../parsers/jd-parser.service';
import { ScoreCalculatorService } from './score-calculator.service';
import { MatchResponseDTO } from '../../types/match.types';

export class MatcherService {
  static matchResumeToJD(resumeText: string, jdText: string, jobCode: string): MatchResponseDTO {
    // Parse resume
    const parsedResume = ResumeParserService.parseResume(resumeText);
    
    // Parse job description
    const parsedJD = JDParserService.parseJD(jdText, jobCode);
    
    // Calculate matching score
    const scoreResult = ScoreCalculatorService.generateMatchReport(
      parsedResume.resumeSkills,
      parsedJD.allSkills
    );
    
    // Build response
    return {
      name: parsedResume.name,
      salary: parsedJD.salary,
      yearOfExperience: parsedResume.yearOfExperience,
      resumeSkills: parsedResume.resumeSkills,
      matchingJobs: [{
        jobId: parsedJD.jobId,
        role: parsedJD.role,
        aboutRole: parsedJD.aboutRole,
        skillsAnalysis: scoreResult.skillsAnalysis,
        matchingScore: scoreResult.score
      }]
    };
  }

  static matchResumeToMultipleJDs(
    resumeText: string, 
    jdTexts: Array<{ text: string; jobCode: string }>
  ): MatchResponseDTO {
    // Parse resume once
    const parsedResume = ResumeParserService.parseResume(resumeText);
    
    // Parse all JDs and calculate matches
    const matchingJobs = jdTexts.map(jd => {
      const parsedJD = JDParserService.parseJD(jd.text, jd.jobCode);
      const scoreResult = ScoreCalculatorService.generateMatchReport(
        parsedResume.resumeSkills,
        parsedJD.allSkills
      );
      
      return {
        jobId: parsedJD.jobId,
        role: parsedJD.role,
        aboutRole: parsedJD.aboutRole,
        skillsAnalysis: scoreResult.skillsAnalysis,
        matchingScore: scoreResult.score
      };
    });
    
    // Sort by matching score (highest first)
    matchingJobs.sort((a, b) => b.matchingScore - a.matchingScore);
    
    return {
      name: parsedResume.name,
      salary: null, // Can't determine single salary for multiple JDs
      yearOfExperience: parsedResume.yearOfExperience,
      resumeSkills: parsedResume.resumeSkills,
      matchingJobs
    };
  }

  static getDetailedMatchAnalysis(
    resumeText: string, 
    jdText: string, 
    jobCode: string
  ): {
    basic: MatchResponseDTO;
    detailed: {
      skillsBreakdown: {
        required: {
          score: number;
          matched: string[];
          missing: string[];
        };
        optional: {
          score: number;
          matched: string[];
          missing: string[];
        };
        overall: {
          score: number;
          matched: string[];
          missing: string[];
        };
      };
      experienceMatch: number;
      salaryAnalysis: {
        jdSalary: string | null;
        matchScore: number;
      };
      recommendations: string[];
    };
  } {
    // Parse resume and JD
    const parsedResume = ResumeParserService.parseResume(resumeText);
    const parsedJD = JDParserService.parseJD(jdText, jobCode);
    
    // Get basic match
    const basic = this.matchResumeToJD(resumeText, jdText, jobCode);
    
    // Calculate detailed skill breakdown
    const requiredScore = ScoreCalculatorService.generateMatchReport(
      parsedResume.resumeSkills,
      parsedJD.requiredSkills
    );
    
    const optionalScore = ScoreCalculatorService.generateMatchReport(
      parsedResume.resumeSkills,
      parsedJD.optionalSkills
    );
    
    const overallScore = ScoreCalculatorService.generateMatchReport(
      parsedResume.resumeSkills,
      parsedJD.allSkills
    );
    
    // Calculate experience match
    const experienceMatch = ScoreCalculatorService.calculateExperienceMatch(
      parsedResume.yearOfExperience,
      parsedJD.yearOfExperience
    );
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      overallScore,
      experienceMatch,
      parsedResume.resumeSkills,
      parsedJD.requiredSkills,
      parsedJD.optionalSkills
    );
    
    return {
      basic,
      detailed: {
        skillsBreakdown: {
          required: {
            score: requiredScore.score,
            matched: requiredScore.matchedSkills,
            missing: requiredScore.missingSkills
          },
          optional: {
            score: optionalScore.score,
            matched: optionalScore.matchedSkills,
            missing: optionalScore.missingSkills
          },
          overall: {
            score: overallScore.score,
            matched: overallScore.matchedSkills,
            missing: overallScore.missingSkills
          }
        },
        experienceMatch,
        salaryAnalysis: {
          jdSalary: parsedJD.salary,
          matchScore: 0 // Could be calculated if we had salary expectations
        },
        recommendations
      }
    };
  }

  private static generateRecommendations(
    matchResult: any,
    experienceMatch: number,
    resumeSkills: string[],
    requiredSkills: string[],
    optionalSkills: string[]
  ): string[] {
    const recommendations: string[] = [];
    
    // Skills recommendations
    const missingRequired = requiredSkills.filter(skill => !resumeSkills.includes(skill));
    const missingOptional = optionalSkills.filter(skill => !resumeSkills.includes(skill));
    
    if (missingRequired.length > 0) {
      recommendations.push(
        `Focus on learning these required skills: ${missingRequired.slice(0, 3).join(', ')}${missingRequired.length > 3 ? ` and ${missingRequired.length - 3} more` : ''}`
      );
    }
    
    if (missingOptional.length > 0 && missingOptional.length <= 3) {
      recommendations.push(
        `Consider learning these optional skills to stand out: ${missingOptional.join(', ')}`
      );
    }
    
    // Experience recommendations
    if (experienceMatch < 80) {
      recommendations.push(
        'Consider gaining more relevant experience to better meet the requirements'
      );
    }
    
    // Overall score recommendations
    if (matchResult.score >= 80) {
      recommendations.push('Strong match! Consider highlighting your relevant projects and achievements.');
    } else if (matchResult.score >= 60) {
      recommendations.push('Good match. Focus on showcasing your most relevant skills and experience.');
    } else {
      recommendations.push('Consider additional skill development or experience to improve your match.');
    }
    
    return recommendations;
  }

  static compareMultipleCandidates(
    candidateResumes: Array<{ id: string; text: string }>,
    jdText: string,
    jobCode: string
  ): Array<{
    candidateId: string;
    match: MatchResponseDTO;
    rank: number;
  }> {
    const results = candidateResumes.map(candidate => {
      const match = this.matchResumeToJD(candidate.text, jdText, jobCode);
      return {
        candidateId: candidate.id,
        match,
        rank: 0 // Will be set after sorting
      };
    });
    
    // Sort by score and assign ranks
    results.sort((a, b) => b.match.matchingJobs[0].matchingScore - a.match.matchingJobs[0].matchingScore);
    
    results.forEach((result, index) => {
      result.rank = index + 1;
    });
    
    return results;
  }

  static getSkillGapAnalysis(resumeSkills: string[], jdSkills: string[]): {
    gaps: Array<{
      skill: string;
      priority: 'high' | 'medium' | 'low';
      learningResources: string[];
    }>;
    coverage: number;
  } {
    const missingSkills = jdSkills.filter(skill => !resumeSkills.includes(skill));
    const coverage = ((jdSkills.length - missingSkills.length) / jdSkills.length) * 100;
    
    const gaps = missingSkills.map(skill => {
      // Determine priority based on skill importance
      let priority: 'high' | 'medium' | 'low' = 'medium';
      
      // High priority for core technical skills
      const coreSkills = ['JavaScript', 'Python', 'Java', 'React.js', 'Node.js', 'SQL'];
      if (coreSkills.includes(skill)) {
        priority = 'high';
      }
      
      // Low priority for nice-to-have skills
      const niceToHave = ['Docker', 'Kubernetes', 'AWS', 'Azure'];
      if (niceToHave.includes(skill)) {
        priority = 'low';
      }
      
      return {
        skill,
        priority,
        learningResources: this.getLearningResources(skill)
      };
    });
    
    // Sort by priority
    gaps.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    return {
      gaps,
      coverage: Math.round(coverage)
    };
  }

  private static getLearningResources(skill: string): string[] {
    const resourceMap: Record<string, string[]> = {
      'JavaScript': ['MDN Web Docs', 'JavaScript.info', 'Eloquent JavaScript'],
      'Python': ['Python.org Tutorial', 'Real Python', 'Automate the Boring Stuff'],
      'React.js': ['React Documentation', 'React Tutorial', 'React Patterns'],
      'Node.js': ['Node.js Documentation', 'Node.js Best Practices', 'Node.js Design Patterns'],
      'SQL': ['SQLBolt', 'Mode Analytics SQL Tutorial', 'W3Schools SQL'],
      'TypeScript': ['TypeScript Handbook', 'TypeScript Deep Dive', 'TypeScript Tutorial'],
      'Docker': ['Docker Documentation', 'Docker Tutorial', 'Docker Best Practices'],
      'AWS': ['AWS Documentation', 'AWS Tutorial', 'AWS Free Tier']
    };
    
    return resourceMap[skill] || ['Official Documentation', 'Online Courses', 'Community Forums'];
  }
}
