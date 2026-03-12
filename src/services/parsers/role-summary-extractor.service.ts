import { JD_SUMMARY_HEADINGS } from '../../constants/section-headings';
import { SectionDetectorService } from './section-detector.service';

export class RoleSummaryExtractorService {
  static extractRoleSummary(text: string): string | null {
    // Check for "About: " prefix
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const aboutLine = lines.find(l => l.toLowerCase().startsWith('about:'));
    if (aboutLine) {
      const summary = aboutLine.substring('about:'.length).trim();
      const cleaned = this.cleanSummary(summary);
      if (cleaned) return cleaned;
    }

    // First try to extract from dedicated summary sections
    const sections = SectionDetectorService.detectSections(text, false);
    
    // Check for specific summary headings
    for (const heading of JD_SUMMARY_HEADINGS) {
      const summary = SectionDetectorService.getSectionContent(sections, heading);
      if (summary) {
        const cleanedSummary = this.cleanSummary(summary);
        if (cleanedSummary && cleanedSummary.length > 20) {
          return cleanedSummary;
        }
      }
    }

    // Fallback: extract first few meaningful lines
    return this.extractFallbackSummary(text);
  }

  private static cleanSummary(text: string): string {
    if (!text) return null;

    // Remove bullet points and numbering
    let cleaned = text.replace(/^[•\-\*\d+\.\s]+/gm, '');
    
    // Remove excessive whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Remove common boilerplate
    const boilerplatePatterns = [
      /we are looking for/gi,
      /the ideal candidate will/gi,
      /you will be responsible for/gi,
      /what you'll do/gi,
      /about the team/gi,
      /about the company/gi,
      /equal opportunity/gi,
      /benefits include/gi,
      /requirements:/gi,
      /qualifications:/gi,
      /responsibilities:/gi
    ];

    for (const pattern of boilerplatePatterns) {
      cleaned = cleaned.replace(pattern, '');
    }

    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    // Return null if too short or just boilerplate
    if (cleaned.length < 20) return null;

    return cleaned;
  }

  private static extractFallbackSummary(text: string): string | null {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Look for first meaningful paragraph (2-4 sentences)
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i];
      
      // Skip if it's clearly a heading or requirement
      if (this.isHeadingOrRequirement(line)) continue;
      
      // Check if it contains meaningful content
      if (this.isMeaningfulSummaryLine(line)) {
        // Try to get a few more lines to form a paragraph
        let summary = line;
        let j = i + 1;
        
        while (j < i + 4 && j < lines.length) {
          const nextLine = lines[j];
          if (!this.isHeadingOrRequirement(nextLine) && 
              !this.isBoilerplateLine(nextLine)) {
            summary += ' ' + nextLine;
            j++;
          } else {
            break;
          }
        }
        
        const cleaned = this.cleanSummary(summary);
        if (cleaned && cleaned.length > 30) {
          return cleaned;
        }
      }
    }

    return null;
  }

  private static isHeadingOrRequirement(line: string): boolean {
    const lowerLine = line.toLowerCase();
    
    // Check for common heading patterns
    if (lowerLine.includes('requirements:') ||
        lowerLine.includes('qualifications:') ||
        lowerLine.includes('responsibilities:') ||
        lowerLine.includes('skills:') ||
        lowerLine.includes('experience:') ||
        lowerLine.includes('education:')) {
      return true;
    }

    // Check for all caps or title case (likely headings)
    if (line === line.toUpperCase() && line.length < 50) {
      return true;
    }

    // Check if it starts with a bullet point
    if (/^[•\-\*\d+\.]/.test(line)) {
      return true;
    }

    return false;
  }

  private static isMeaningfulSummaryLine(line: string): boolean {
    // Must be reasonably long
    if (line.length < 15) return false;

    // Must contain verbs indicating action/responsibility
    const actionWords = [
      'responsible', 'develop', 'design', 'implement', 'create', 'manage',
      'lead', 'build', 'work', 'collaborate', 'support', 'maintain', 'drive',
      'oversee', 'coordinate', 'execute', 'deliver', 'ensure', 'provide'
    ];

    const lowerLine = line.toLowerCase();
    return actionWords.some(word => lowerLine.includes(word));
  }

  private static isBoilerplateLine(line: string): boolean {
    const lowerLine = line.toLowerCase();
    
    const boilerplateKeywords = [
      'equal opportunity', 'eoe', 'm/f/d/v', 'veteran status',
      'background check', 'drug test', 'relocation', 'visa sponsorship',
      'benefits package', 'health insurance', '401k', 'pto', 'paid time off',
      'competitive salary', 'salary range', 'compensation package'
    ];

    return boilerplateKeywords.some(keyword => lowerLine.includes(keyword));
  }

  static extractBetweenHeadings(text: string, startHeading: string, endHeading?: string): string | null {
    const summary = SectionDetectorService.extractSectionBetweenHeadings(text, startHeading, endHeading);
    return summary ? this.cleanSummary(summary) : null;
  }

  static extractFirstParagraph(text: string, maxLines: number = 3): string | null {
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 0) return null;

    let paragraph = '';
    let count = 0;

    for (let i = 0; i < Math.min(maxLines, lines.length); i++) {
      if (!this.isHeadingOrRequirement(lines[i]) && 
          !this.isBoilerplateLine(lines[i])) {
        paragraph += (count > 0 ? ' ' : '') + lines[i];
        count++;
      }
    }

    return paragraph.length > 30 ? this.cleanSummary(paragraph) : null;
  }

  static extractFromResponsibilities(text: string): string | null {
    // Look for responsibilities section and extract first few items
    const sections = SectionDetectorService.detectSections(text, false);
    const responsibilitiesSection = SectionDetectorService.getSectionContent(sections, 'responsibilities');
    
    if (!responsibilitiesSection) return null;

    const lines = responsibilitiesSection.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !this.isBoilerplateLine(line));

    if (lines.length === 0) return null;

    // Take first 2-3 responsibility items
    const summaryLines = lines.slice(0, Math.min(3, lines.length));
    const summary = summaryLines.join(' ');
    
    return this.cleanSummary(summary);
  }
}
