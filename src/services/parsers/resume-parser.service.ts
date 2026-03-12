import { EMAIL_REGEX, PHONE_REGEX } from '../../constants/regex';
import { SectionDetectorService } from './section-detector.service';
import { SkillExtractorService } from './skill-extractor.service';
import { ExperienceExtractorService } from './experience-extractor.service';
import { ParsedResumeDTO } from '../../types/resume.types';

export class ResumeParserService {
  static parseResume(text: string): ParsedResumeDTO {
    return {
      name: this.extractName(text),
      email: this.extractEmail(text),
      phone: this.extractPhone(text),
      yearOfExperience: this.extractExperience(text),
      resumeSkills: SkillExtractorService.extractSkills(text),
      education: this.extractEducation(text),
      workHistory: this.extractWorkHistory(text)
    };
  }

  private static extractName(text: string): string | null {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Check for "Name: " prefix
    const nameLine = lines.find(line => line.toLowerCase().startsWith('name:'));
    if (nameLine) {
      return nameLine.substring('name:'.length).trim();
    }

    // First non-empty line is often the name
    if (lines.length > 0) {
      const firstLine = lines[0];
      
      // Skip if it looks like a heading or contact info
      if (firstLine && !this.isLikelyHeading(firstLine) && !this.isContactInfo(firstLine)) {
        // Check if it looks like a person's name (2-4 words, mostly letters)
        const words = firstLine.split(/\s+/);
        if (words.length >= 2 && words.length <= 4) {
          const nameWords = words.filter(word => 
            /^[A-Za-z][A-Za-z\.\-']*$/.test(word) && word.length > 1
          );
          
          if (nameWords.length === words.length) {
            return firstLine;
          }
        }
      }
    }

    // Try to find name near email
    const email = this.extractEmail(text);
    if (email) {
      const emailIndex = text.indexOf(email);
      const linesBeforeEmail = text.substring(0, emailIndex).split('\n').map(line => line.trim()).reverse();
      
      for (const line of linesBeforeEmail) {
        if (line.length > 0 && !this.isLikelyHeading(line) && !this.isContactInfo(line)) {
          const words = line.split(/\s+/);
          if (words.length >= 2 && words.length <= 4) {
            const nameWords = words.filter(word => 
              /^[A-Za-z][A-Za-z\.\-']*$/.test(word) && word.length > 1
            );
            
            if (nameWords.length === words.length) {
              return line;
            }
          }
        }
      }
    }

    return null;
  }

  private static isLikelyHeading(line: string): boolean {
    const lowerLine = line.toLowerCase();
    const headingWords = ['resume', 'cv', 'curriculum vitae', 'profile', 'summary'];
    return headingWords.some(word => lowerLine.includes(word));
  }

  private static isContactInfo(line: string): boolean {
    return EMAIL_REGEX.test(line) || PHONE_REGEX.test(line) || 
           line.toLowerCase().includes('linkedin') || 
           line.toLowerCase().includes('github');
  }

  private static extractEmail(text: string): string | null {
    const matches = text.match(EMAIL_REGEX);
    return matches && matches.length > 0 ? matches[0] : null;
  }

  private static extractPhone(text: string): string | null {
    const matches = text.match(PHONE_REGEX);
    if (matches && matches.length > 0) {
      // Return the first reasonable phone number
      for (const match of matches) {
        const cleanPhone = match.replace(/[^\d+\-\s\(\)]/g, '');
        if (cleanPhone.replace(/\D/g, '').length >= 10) {
          return match.trim();
        }
      }
    }
    return null;
  }

  private static extractExperience(text: string): number | null {
    const sections = SectionDetectorService.detectSections(text, true);
    const experienceSection = SectionDetectorService.getSectionContent(sections, 'experience');
    const workHistorySection = SectionDetectorService.getSectionContent(sections, 'work experience');
    const employmentSection = SectionDetectorService.getSectionContent(sections, 'employment history');

    const workText = experienceSection || workHistorySection || employmentSection;
    if (workText) {
      // 1. First try to find explicit years within the work history section ONLY
      const explicitYears = ExperienceExtractorService.extractExperience(workText);
      if (explicitYears !== null) {
        return explicitYears;
      }

      // 2. If no explicit years, calculate from date ranges in the work history section ONLY
      const calculatedYears = ExperienceExtractorService.extractFromWorkHistory(workText);
      if (calculatedYears !== null) {
        return calculatedYears;
      }
    }

    // Treat as unknown/fresher if no experience section found
    return null;
  }

  private static extractEducation(text: string): Array<{
    degree?: string;
    institution?: string;
    startDate?: string;
    endDate?: string;
  }> {
    const sections = SectionDetectorService.detectSections(text, true);
    const educationSection = SectionDetectorService.getSectionContent(sections, 'education');
    
    if (!educationSection) return [];

    const education: Array<{
      degree?: string;
      institution?: string;
      startDate?: string;
      endDate?: string;
    }> = [];

    const lines = educationSection.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let currentEducation: typeof education[0] = {};
    
    for (const line of lines) {
      // Check for degree keywords
      const degreeKeywords = [
        'bachelor', 'master', 'phd', 'doctorate', 'mba', 'b.s.', 'b.a.', 'm.s.', 'm.a.',
        'b.tech', 'm.tech', 'b.e', 'm.e', 'b.sc', 'm.sc', 'diploma', 'certification'
      ];
      
      const lowerLine = line.toLowerCase();
      const hasDegree = degreeKeywords.some(keyword => lowerLine.includes(keyword));
      
      if (hasDegree) {
        // If we have a previous entry, push it
        if (Object.keys(currentEducation).length > 0) {
          education.push(currentEducation);
        }
        currentEducation = { degree: line };
      } else if (this.looksLikeInstitution(line)) {
        currentEducation.institution = line;
      } else if (this.looksLikeDate(line)) {
        const dates = this.extractDates(line);
        if (dates) {
          currentEducation.startDate = dates.start;
          currentEducation.endDate = dates.end;
        }
      }
    }
    
    // Push the last entry if it exists
    if (Object.keys(currentEducation).length > 0) {
      education.push(currentEducation);
    }

    return education;
  }

  private static looksLikeInstitution(line: string): boolean {
    const institutionKeywords = [
      'university', 'college', 'institute', 'institute of technology', 'polytechnic',
      'academy', 'school of', 'department of'
    ];
    
    const lowerLine = line.toLowerCase();
    return institutionKeywords.some(keyword => lowerLine.includes(keyword));
  }

  private static looksLikeDate(line: string): boolean {
    return /\d{4}/.test(line) || /\b(19|20)\d{2}\b/.test(line);
  }

  private static extractDates(line: string): { start?: string; end?: string } | null {
    // Look for date patterns like "2018-2022" or "2018 - Present"
    const dateRangeMatch = line.match(/(\d{4})\s*[-–—]\s*(\d{4}|present|current)/i);
    if (dateRangeMatch && dateRangeMatch[2]) {
      return {
        start: dateRangeMatch[1],
        end: dateRangeMatch[2].toLowerCase() === 'present' || dateRangeMatch[2].toLowerCase() === 'current' 
          ? 'Present' 
          : dateRangeMatch[2]
      };
    }

    // Look for single year
    const yearMatch = line.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      return { start: yearMatch[0] };
    }

    return null;
  }

  private static extractWorkHistory(text: string): Array<{
    company?: string;
    title?: string;
    startDate?: string;
    endDate?: string;
    durationMonths?: number;
  }> {
    const sections = SectionDetectorService.detectSections(text, true);
    const experienceSection = SectionDetectorService.getSectionContent(sections, 'experience');
    const workHistorySection = SectionDetectorService.getSectionContent(sections, 'work experience');
    const employmentSection = SectionDetectorService.getSectionContent(sections, 'employment history');

    const workText = experienceSection || workHistorySection || employmentSection;
    
    if (!workText) return [];

    const workHistory: Array<{
      company?: string;
      title?: string;
      startDate?: string;
      endDate?: string;
      durationMonths?: number;
    }> = [];

    const lines = workText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    let currentJob: typeof workHistory[0] = {};
    
    for (const line of lines) {
      // Check if it looks like a job title (usually first line)
      if (this.looksLikeJobTitle(line) && !currentJob.title) {
        currentJob.title = line;
      } else if (this.looksLikeCompany(line) && !currentJob.company) {
        currentJob.company = line;
      } else if (this.looksLikeDate(line)) {
        const dates = this.extractDates(line);
        if (dates) {
          currentJob.startDate = dates.start;
          currentJob.endDate = dates.end;
          
          // Calculate duration if we have both dates
          if (dates.start && dates.end && dates.end !== 'Present') {
            currentJob.durationMonths = this.calculateDuration(dates.start, dates.end);
          }
        }
      } else if (this.looksLikeNewJobEntry(line)) {
        // Save previous job and start new one
        if (Object.keys(currentJob).length > 0) {
          workHistory.push(currentJob);
        }
        currentJob = { title: line };
      }
    }
    
    // Push the last job if it exists
    if (Object.keys(currentJob).length > 0) {
      workHistory.push(currentJob);
    }

    return workHistory;
  }

  private static looksLikeJobTitle(line: string): boolean {
    const titleKeywords = [
      'engineer', 'developer', 'manager', 'analyst', 'consultant', 'specialist',
      'director', 'lead', 'senior', 'junior', 'associate', 'coordinator', 'architect'
    ];
    
    const lowerLine = line.toLowerCase();
    return titleKeywords.some(keyword => lowerLine.includes(keyword)) && 
           line.length < 100 && !line.includes('@') && !line.includes('http');
  }

  private static looksLikeCompany(line: string): boolean {
    // Usually contains company name, often all caps or title case
    // This is a simplified heuristic
    return line.length < 100 && 
           !line.includes('@') && 
           !line.includes('http') &&
           !this.looksLikeDate(line) &&
           !this.looksLikeJobTitle(line);
  }

  private static looksLikeNewJobEntry(line: string): boolean {
    // New job entries often start with a title and don't have previous context
    return this.looksLikeJobTitle(line) && line.length < 60;
  }

  private static calculateDuration(startDate: string, endDate: string): number {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                     (end.getMonth() - start.getMonth());
      
      return Math.max(0, months);
    } catch {
      return 0;
    }
  }
}
