import { SectionDetectorService } from './section-detector.service';
import { SkillExtractorService } from './skill-extractor.service';
import { SalaryExtractorService } from './salary-extractor.service';
import { ExperienceExtractorService } from './experience-extractor.service';
import { RoleSummaryExtractorService } from './role-summary-extractor.service';
import { ParsedJDDTO } from '../../types/jd.types';

export class JDParserService {
  static parseJD(text: string, jobCode: string): ParsedJDDTO {
    const skillsData = SkillExtractorService.extractRequiredVsOptionalSkills(text);
    
    // Also extract skills from responsibilities to be comprehensive
    const sections = SectionDetectorService.detectSections(text, false);
    const responsibilitiesSection = SectionDetectorService.getSectionContent(sections, 'responsibilities') || 
                                   SectionDetectorService.getSectionContent(sections, 'role responsibilities') ||
                                   SectionDetectorService.getSectionContent(sections, 'key responsibilities');
    
    if (responsibilitiesSection) {
      const respSkills = SkillNormalizerService.extractSkillsFromText(responsibilitiesSection, false);
      respSkills.forEach(skill => {
        if (!skillsData.all.includes(skill)) {
          skillsData.all.push(skill);
          // Default responsibility skills to required if not already categorized
          if (!skillsData.required.includes(skill) && !skillsData.optional.includes(skill)) {
            skillsData.required.push(skill);
          }
        }
      });
    }

    return {
      jobId: jobCode,
      role: this.extractRole(text),
      salary: SalaryExtractorService.extractSalary(text),
      yearOfExperience: ExperienceExtractorService.extractExperience(text),
      aboutRole: RoleSummaryExtractorService.extractRoleSummary(text),
      requiredSkills: skillsData.required,
      optionalSkills: skillsData.optional,
      allSkills: skillsData.all
    };
  }

  private static extractRole(text: string): string | null {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Check for "Job Title: " prefix
    const roleLine = lines.find(line => line.toLowerCase().startsWith('job title:'));
    if (roleLine) {
      return roleLine.substring('job title:'.length).trim();
    }

    // First non-empty line is often the job title
    if (lines.length > 0) {
      const firstLine = lines[0];
      if (this.looksLikeJobTitle(firstLine)) {
        return firstLine;
      }
    }

    // Look for job title in first 10 lines
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i];
      if (this.looksLikeJobTitle(line)) {
        return line;
      }
    }

    // Try to find role in sections
    const sections = SectionDetectorService.detectSections(text, false);
    
    // Look for common role indicators
    const roleKeywords = [
      'position', 'role', 'job title', 'opportunity', 'opening', 'vacancy'
    ];

    for (const section of sections) {
      const sectionLines = section.content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      for (const line of sectionLines) {
        const lowerLine = line.toLowerCase();
        
        // Check if line contains role keywords and looks like a title
        if (roleKeywords.some(keyword => lowerLine.includes(keyword)) && 
            this.looksLikeJobTitle(line)) {
          return line;
        }
        
        // Check if it's a title case line with job-related words
        if (this.looksLikeJobTitle(line)) {
          return line;
        }
      }
    }

    return null;
  }

  private static looksLikeJobTitle(line: string): boolean {
    if (!line || line.length > 100) return false;

    const lowerLine = line.toLowerCase();
    
    // Common job title keywords
    const titleKeywords = [
      'engineer', 'developer', 'manager', 'analyst', 'consultant', 'specialist',
      'director', 'lead', 'senior', 'junior', 'associate', 'coordinator', 'architect',
      'designer', 'administrator', 'technician', 'therapist', 'counselor', 'advisor',
      'officer', 'executive', 'assistant', 'representative', 'agent', 'broker',
      'scientist', 'researcher', 'professor', 'teacher', 'instructor', 'trainer',
      'accountant', 'bookkeeper', 'cashier', 'clerk', 'receptionist', 'secretary',
      'driver', 'operator', 'mechanic', 'electrician', 'plumber', 'carpenter',
      'nurse', 'doctor', 'physician', 'surgeon', 'dentist', 'pharmacist',
      'attorney', 'lawyer', 'paralegal', 'judge', 'prosecutor', 'defender'
    ];

    const hasTitleKeyword = titleKeywords.some(keyword => lowerLine.includes(keyword));
    
    // Exclude lines that are clearly not job titles
    const excludePatterns = [
      /requirements?/i,
      /qualifications?/i,
      /responsibilities?/i,
      /skills?/i,
      /experience/i,
      /education/i,
      /benefits?/i,
      /salary/i,
      /location/i,
      /company/i,
      /about us/i,
      /we are/i,
      /you will/i,
      /what you/i,
      /how to/i,
      /please/i,
      /note:/i,
      /https?:\/\//i,
      /\b\d{4}\b/,  // Years
      /\$\d/,       // Money
      /\b\d+\s*years?\b/i  // Experience mentioned
    ];

    const hasExcludePattern = excludePatterns.some(pattern => pattern.test(line));

    return hasTitleKeyword && !hasExcludePattern;
  }

  static extractJobLocation(text: string): string | null {
    const sections = SectionDetectorService.detectSections(text, false);
    const locationSection = SectionDetectorService.getSectionContent(sections, 'location');
    
    if (locationSection) {
      return locationSection.trim();
    }

    // Look for location patterns in text
    const locationPatterns = [
      /\b(?:remote|hybrid|onsite|in-office|in office)\b/i,
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*,\s*([A-Z]{2})\b/,  // City, State
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*,\s*([A-Z][a-z]+)\b/,  // City, Country
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0].trim();
      }
    }

    return null;
  }

  static extractEmploymentType(text: string): string | null {
    const lowerText = text.toLowerCase();
    
    const employmentTypes = [
      { type: 'full-time', keywords: ['full time', 'full-time', 'permanent'] },
      { type: 'part-time', keywords: ['part time', 'part-time'] },
      { type: 'contract', keywords: ['contract', 'contractor', 'contractual'] },
      { type: 'temporary', keywords: ['temporary', 'temp'] },
      { type: 'internship', keywords: ['internship', 'intern'] },
      { type: 'freelance', keywords: ['freelance', 'freelancer'] }
    ];

    for (const empType of employmentTypes) {
      if (empType.keywords.some(keyword => lowerText.includes(keyword))) {
        return empType.type;
      }
    }

    return null;
  }

  static extractDepartment(text: string): string | null {
    const lowerText = text.toLowerCase();
    
    const departments = [
      'engineering', 'development', 'product', 'design', 'marketing', 'sales',
      'finance', 'accounting', 'human resources', 'hr', 'operations', 'customer service',
      'support', 'research', 'legal', 'compliance', 'quality assurance', 'qa',
      'data science', 'analytics', 'information technology', 'it', 'administration'
    ];

    for (const dept of departments) {
      if (lowerText.includes(dept)) {
        return dept.charAt(0).toUpperCase() + dept.slice(1);
      }
    }

    return null;
  }

  static extractReportingStructure(text: string): {
    reportsTo?: string;
    manages?: string[];
    teamSize?: number;
  } | null {
    const lowerText = text.toLowerCase();
    
    const result: {
      reportsTo?: string;
      manages?: string[];
      teamSize?: number;
    } = {};

    // Extract reports to
    const reportsToPatterns = [
      /reports to[:\s]+([^.]+)/i,
      /reporting to[:\s]+([^.]+)/i,
      /reports directly to[:\s]+([^.]+)/i
    ];

    for (const pattern of reportsToPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        result.reportsTo = match[1].trim();
        break;
      }
    }

    // Extract team size
    const teamSizePatterns = [
      /team size[:\s]*(\d+)/i,
      /managing a team of[:\s]*(\d+)/i,
      /leading a team of[:\s]*(\d+)/i,
      /(\d+)\s*team members?/i,
      /(\d+)\s*direct reports?/i
    ];

    for (const pattern of teamSizePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        result.teamSize = parseInt(match[1]);
        break;
      }
    }

    // Extract manages (roles they manage)
    const managesPatterns = [
      /manages?[:\s]+([^.]+)/i,
      /responsible for managing[:\s]+([^.]+)/i,
      /oversees?[:\s]+([^.]+)/i
    ];

    for (const pattern of managesPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const roles = match[1].split(/[,;]|\s+and\s+/).map(role => role.trim()).filter(role => role.length > 0);
        if (roles.length > 0) {
          result.manages = roles;
          break;
        }
      }
    }

    return Object.keys(result).length > 0 ? result : null;
  }

  static extractKeyResponsibilities(text: string): string[] {
    const sections = SectionDetectorService.detectSections(text, false);
    const responsibilitiesSection = SectionDetectorService.getSectionContent(sections, 'responsibilities');
    
    if (!responsibilitiesSection) return [];

    const lines = responsibilitiesSection.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => /^[•\-\*\d+\.]/.test(line) || this.looksLikeResponsibility(line));

    return lines.map(line => line.replace(/^[•\-\*\d+\.]\s*/, '').trim());
  }

  private static looksLikeResponsibility(line: string): boolean {
    const actionVerbs = [
      'develop', 'design', 'implement', 'create', 'manage', 'lead', 'coordinate',
      'oversee', 'maintain', 'support', 'analyze', 'optimize', 'improve', 'build',
      'test', 'deploy', 'monitor', 'document', 'collaborate', 'communicate', 'present'
    ];

    const lowerLine = line.toLowerCase();
    return actionVerbs.some(verb => lowerLine.startsWith(verb)) && line.length < 200;
  }
}
