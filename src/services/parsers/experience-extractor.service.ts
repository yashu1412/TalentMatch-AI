import { 
  EXPERIENCE_REGEX, 
  EXPERIENCE_RANGE_REGEX, 
  FRESHER_REGEX 
} from '../../constants/regex';

export class ExperienceExtractorService {
  static extractExperience(text: string): number | null {
    // Check for "Experience: " prefix
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const expLine = lines.find(l => l.toLowerCase().startsWith('experience:'));
    if (expLine) {
      const yearsMatch = expLine.match(/(\d+(?:\.\d+)?)/);
      if (yearsMatch) {
        return parseFloat(yearsMatch[1]);
      }
    }

    // Check for fresher/entry-level first
    const fresherMatch = text.match(FRESHER_REGEX);
    if (fresherMatch) {
      return 0;
    }

    // Extract explicit years of experience
    const experienceMatches = text.match(EXPERIENCE_REGEX);
    if (experienceMatches && experienceMatches.length > 0) {
      const match = experienceMatches[0];
      const yearsMatch = match.match(/(\d+(?:\.\d+)?)/);
      if (yearsMatch) {
        return parseFloat(yearsMatch[1]);
      }
    }

    // Extract experience ranges
    const rangeMatches = text.match(EXPERIENCE_RANGE_REGEX);
    if (rangeMatches && rangeMatches.length > 0) {
      const match = rangeMatches[0];
      const rangeNumbers = match.match(/(\d+(?:\.\d+)?)/g);
      if (rangeNumbers && rangeNumbers.length >= 2) {
        // Return the lower bound of the range
        return parseFloat(rangeNumbers[0]);
      }
    }

    return null;
  }

  static extractExperienceRange(text: string): {
    min?: number;
    max?: number;
    isRange: boolean;
  } | null {
    // Check for fresher/entry-level
    const fresherMatch = text.match(FRESHER_REGEX);
    if (fresherMatch) {
      return { min: 0, max: 0, isRange: false };
    }

    // Extract experience ranges
    const rangeMatches = text.match(EXPERIENCE_RANGE_REGEX);
    if (rangeMatches && rangeMatches.length > 0) {
      const match = rangeMatches[0];
      const rangeNumbers = match.match(/(\d+(?:\.\d+)?)/g);
      if (rangeNumbers && rangeNumbers.length >= 2) {
        return {
          min: parseFloat(rangeNumbers[0]),
          max: parseFloat(rangeNumbers[1]),
          isRange: true
        };
      }
    }

    // Extract single years value
    const experienceMatches = text.match(EXPERIENCE_REGEX);
    if (experienceMatches && experienceMatches.length > 0) {
      const match = experienceMatches[0];
      const yearsMatch = match.match(/(\d+(?:\.\d+)?)/);
      if (yearsMatch) {
        const years = parseFloat(yearsMatch[1]);
        return { min: years, max: years, isRange: false };
      }
    }

    return null;
  }

  static extractFromWorkHistory(workHistoryText: string): number | null {
    // Split into entries/lines to avoid picking up education info
    const lines = workHistoryText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Calculate total experience from date ranges, but only for lines that don't look like education
    let totalMonths = 0;
    
    for (const line of lines) {
      // Skip lines that clearly indicate education
      const lowerLine = line.toLowerCase();
      const educationKeywords = [
        'university', 'college', 'school', 'institute', 'bachelor', 'master', 
        'phd', 'b.tech', 'm.tech', 'b.e', 'm.e', 'b.sc', 'm.sc', 'degree',
        'secondary', 'high school', 'cbse', 'pcmb', 'higher secondary',
        'expected', 'iiitdm', 'graduation', 'gpa', 'cgpa', 'percentage'
      ];
      
      if (educationKeywords.some(keyword => lowerLine.includes(keyword))) {
        continue;
      }

      const dateRanges = this.extractDateRanges(line);
      for (const range of dateRanges) {
        if (range.end === 'present') {
          // Calculate from start date to present
          const startDate = this.parseDate(range.start);
          if (startDate) {
            const present = new Date();
            totalMonths += this.monthsBetween(startDate, present);
          }
        } else {
          // Calculate between start and end dates
          const startDate = this.parseDate(range.start);
          const endDate = this.parseDate(range.end);
          if (startDate && endDate) {
            totalMonths += this.monthsBetween(startDate, endDate);
          }
        }
      }
    }

    // Convert months to years
    return totalMonths > 0 ? Math.round((totalMonths / 12) * 10) / 10 : null;
  }

  private static extractDateRanges(text: string): Array<{
    start: string;
    end: string;
  }> {
    const ranges: Array<{ start: string; end: string }> = [];
    
    // Pattern for date ranges like "Jan 2020 - Mar 2022" or "2020-2022"
    const rangePatterns = [
      /(\w{3}\s+\d{4})\s*[-–—]\s*(\w{3}\s+\d{4}|\w{3}\s+\d{4}|present|current)/gi,
      /(\d{4})\s*[-–—]\s*(\d{4}|present|current)/gi,
      /(\d{1,2}\/\d{4})\s*[-–—]\s*(\d{1,2}\/\d{4}|present|current)/gi
    ];

    for (const pattern of rangePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        ranges.push({
          start: match[1],
          end: match[2].toLowerCase()
        });
      }
    }

    return ranges;
  }

  private static parseDate(dateString: string): Date | null {
    try {
      // Handle various date formats
      if (dateString === 'present' || dateString === 'current') {
        return new Date();
      }

      // Month Year format (e.g., "Jan 2020")
      const monthYearMatch = dateString.match(/^(\w{3})\s+(\d{4})$/);
      if (monthYearMatch) {
        const month = new Date(Date.parse(monthYearMatch[1] + ' 1, 2000')).getMonth();
        const year = parseInt(monthYearMatch[2]);
        return new Date(year, month, 1);
      }

      // Year only (e.g., "2020")
      const yearMatch = dateString.match(/^(\d{4})$/);
      if (yearMatch) {
        return new Date(parseInt(yearMatch[1]), 0, 1);
      }

      // MM/YYYY format (e.g., "01/2020")
      const monthDayYearMatch = dateString.match(/^(\d{1,2})\/(\d{4})$/);
      if (monthDayYearMatch) {
        const month = parseInt(monthDayYearMatch[1]) - 1; // JS months are 0-indexed
        const year = parseInt(monthDayYearMatch[2]);
        return new Date(year, month, 1);
      }

      return null;
    } catch {
      return null;
    }
  }

  private static monthsBetween(startDate: Date, endDate: Date): number {
    return (
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth())
    );
  }

  static isFresher(text: string): boolean {
    return FRESHER_REGEX.test(text);
  }

  static getExperienceLevel(text: string): 'fresher' | 'entry-level' | 'mid' | 'senior' | 'unknown' {
    const lowerText = text.toLowerCase();
    
    if (this.isFresher(text)) {
      return 'fresher';
    }
    
    if (lowerText.includes('entry-level') || lowerText.includes('entry level') || 
        lowerText.includes('junior')) {
      return 'entry-level';
    }
    
    if (lowerText.includes('mid-level') || lowerText.includes('mid level')) {
      return 'mid';
    }
    
    if (lowerText.includes('senior') || lowerText.includes('lead') || 
        lowerText.includes('principal')) {
      return 'senior';
    }
    
    // Try to determine from years of experience
    const years = this.extractExperience(text);
    if (years !== null) {
      if (years <= 1) return 'fresher';
      if (years <= 3) return 'entry-level';
      if (years <= 6) return 'mid';
      return 'senior';
    }
    
    return 'unknown';
  }

  static extractAllExperienceMentions(text: string): Array<{
    text: string;
    years?: number;
    range?: { min: number; max: number };
    type: 'explicit' | 'range' | 'calculated';
  }> {
    const mentions: Array<{
      text: string;
      years?: number;
      range?: { min: number; max: number };
      type: 'explicit' | 'range' | 'calculated';
    }> = [];

    // Extract explicit years
    const explicitMatches = text.match(EXPERIENCE_REGEX);
    if (explicitMatches) {
      for (const match of explicitMatches) {
        const years = this.extractExperience(match);
        if (years !== null) {
          mentions.push({
            text: match,
            years,
            type: 'explicit'
          });
        }
      }
    }

    // Extract ranges
    const rangeMatches = text.match(EXPERIENCE_RANGE_REGEX);
    if (rangeMatches) {
      for (const match of rangeMatches) {
        const range = this.extractExperienceRange(match);
        if (range) {
          mentions.push({
            text: match,
            range: { min: range.min, max: range.max },
            type: 'range'
          });
        }
      }
    }

    return mentions;
  }
}
