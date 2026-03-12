import { SkillNormalizerService } from '../matching/skill-normalizer.service';
import { SectionDetectorService } from './section-detector.service';
import { 
  JD_REQUIRED_HEADINGS, 
  JD_OPTIONAL_HEADINGS 
} from '../../constants/section-headings';

export class SkillExtractorService {
  static extractSkills(text: string): string[] {
    const skills = new Set<string>();
    
    // Extract from sections
    const sections = SectionDetectorService.detectSections(text, true);
    
    // Skills section - extract known and unknown technical terms
    const skillsSection = SectionDetectorService.getSectionContent(sections, 'skills');
    if (skillsSection) {
      // For the dedicated skills section, include unknown technical terms
      const sectionSkills = SkillNormalizerService.extractSkillsFromText(skillsSection, true);
      sectionSkills.forEach(skill => skills.add(skill));
    } else {
      // Fallback: If no skills section found, extract from the entire text
      // This is important for the matching service which might receive already parsed skill lists
      const allTextSkills = SkillNormalizerService.extractSkillsFromText(text, true);
      allTextSkills.forEach(skill => skills.add(skill));
    }
    
    return Array.from(skills);
  }
  
  private static extractSkillsFromText(text: string): string[] {
    // Use SkillNormalizerService for consistent extraction, only known skills for generic text
    return SkillNormalizerService.extractSkillsFromText(text, false);
  }
  
  static extractRequiredVsOptionalSkills(text: string): {
    required: string[];
    optional: string[];
    all: string[];
  } {
    const sections = SectionDetectorService.detectSections(text, false);
    
    // Extract required skills from various headings
    let requiredText = '';
    for (const heading of JD_REQUIRED_HEADINGS) {
      const content = SectionDetectorService.getSectionContent(sections, heading);
      if (content) requiredText += ' ' + content;
    }
    const requiredSkills = this.extractSkillsFromText(requiredText);
    
    // Extract optional skills from various headings
    let optionalText = '';
    for (const heading of JD_OPTIONAL_HEADINGS) {
      const content = SectionDetectorService.getSectionContent(sections, heading);
      if (content) optionalText += ' ' + content;
    }
    const optionalSkills = this.extractSkillsFromText(optionalText);
    
    // Extract all skills from entire text
    const allSkills = this.extractSkills(text);
    
    // Categorize skills based on context
    const finalRequired: string[] = [];
    const finalOptional: string[] = [];
    
    for (const skill of allSkills) {
      const isRequired = requiredSkills.includes(skill);
      const isOptional = optionalSkills.includes(skill);

      if (isRequired) {
        finalRequired.push(skill);
      } else if (isOptional) {
        finalOptional.push(skill);
      } else {
        // Default to required if unclear
        finalRequired.push(skill);
      }
    }
    
    return {
      required: SkillNormalizerService.normalizeSkills(finalRequired),
      optional: SkillNormalizerService.normalizeSkills(finalOptional),
      all: SkillNormalizerService.normalizeSkills(allSkills)
    };
  }
}
