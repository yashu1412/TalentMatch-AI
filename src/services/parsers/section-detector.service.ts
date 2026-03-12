import { 
  RESUME_SECTION_HEADINGS, 
  JD_REQUIRED_HEADINGS, 
  JD_OPTIONAL_HEADINGS, 
  JD_SUMMARY_HEADINGS 
} from '../../constants/section-headings';

export interface Section {
  heading: string;
  content: string;
  startIndex: number;
  endIndex: number;
}

export class SectionDetectorService {
  static detectSections(text: string, isResume: boolean = true): Section[] {
    const lines = text.split('\n');
    const sections: Section[] = [];
    let currentSection: Section | null = null;
    let currentContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() || '';
      const normalizedLine = line.toLowerCase();
      
      const isHeading = this.isSectionHeading(normalizedLine, isResume);
      
      if (isHeading) {
        // Save previous section if exists
        if (currentSection) {
          currentSection.content = currentContent.join('\n').trim();
          currentSection.endIndex = i - 1;
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          heading: line,
          content: '',
          startIndex: i,
          endIndex: -1
        };
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }
    
    // Save last section
    if (currentSection) {
      currentSection.content = currentContent.join('\n').trim();
      currentSection.endIndex = lines.length - 1;
      sections.push(currentSection);
    }
    
    return sections;
  }

  private static isSectionHeading(line: string, isResume: boolean): boolean {
    const headings = isResume 
      ? RESUME_SECTION_HEADINGS 
      : [...JD_REQUIRED_HEADINGS, ...JD_OPTIONAL_HEADINGS, ...JD_SUMMARY_HEADINGS];
    
    const lowerLine = line.toLowerCase();
    
    return headings.some(heading => {
      const lowerHeading = heading.toLowerCase();
      // Match if the line exactly equals the heading
      if (lowerLine === lowerHeading) return true;
      // Match if the line starts with the heading followed by a colon or separator
      if (lowerLine.startsWith(lowerHeading + ':')) return true;
      if (lowerLine.startsWith(lowerHeading + ' -')) return true;
      // Match if the heading is a single word and the line is just that word
      if (!lowerHeading.includes(' ') && lowerLine === lowerHeading) return true;
      
      return false;
    });
  }

  static getSectionContent(sections: Section[], heading: string): string | null {
    const section = sections.find(s => 
      s.heading.toLowerCase().includes(heading.toLowerCase()) ||
      heading.toLowerCase().includes(s.heading.toLowerCase())
    );
    return section ? section.content : null;
  }

  static extractSectionBetweenHeadings(text: string, startHeading: string, endHeading?: string): string | null {
    const lines = text.split('\n');
    let startIndex = -1;
    let endIndex = lines.length;
    
    // Find start heading
    for (let i = 0; i < lines.length; i++) {
      if (lines[i]?.toLowerCase().includes(startHeading.toLowerCase())) {
        startIndex = i + 1;
        break;
      }
    }
    
    if (startIndex === -1) return null;
    
    // Find end heading if specified
    if (endHeading) {
      for (let i = startIndex; i < lines.length; i++) {
        if (lines[i]?.toLowerCase().includes(endHeading.toLowerCase())) {
          endIndex = i;
          break;
        }
      }
    }
    
    return lines.slice(startIndex, endIndex).join('\n').trim();
  }
}
