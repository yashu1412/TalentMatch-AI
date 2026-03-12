import { 
  INDIAN_SALARY_REGEX, 
  GLOBAL_SALARY_REGEX, 
  HOURLY_ANNUAL_SALARY_REGEX,
  CTC_SALARY_REGEX
} from '../../constants/regex';

export class SalaryExtractorService {
  static extractSalary(text: string): string | null {
    // Check for "Salary: " prefix
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const salaryLine = lines.find(l => l.toLowerCase().startsWith('salary:'));
    if (salaryLine) {
      return this.normalizeSalary(salaryLine.substring('salary:'.length).trim());
    }

    // Try different salary patterns in order of specificity
    const patterns = [
      CTC_SALARY_REGEX,
      HOURLY_ANNUAL_SALARY_REGEX,
      INDIAN_SALARY_REGEX,
      GLOBAL_SALARY_REGEX
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        // Return the first match found, cleaned up
        return this.normalizeSalary(matches[0].trim());
      }
    }

    return null;
  }

  static extractIndianSalary(text: string): string | null {
    const matches = text.match(INDIAN_SALARY_REGEX);
    return matches && matches.length > 0 ? matches[0].trim() : null;
  }

  static extractGlobalSalary(text: string): string | null {
    const matches = text.match(GLOBAL_SALARY_REGEX);
    return matches && matches.length > 0 ? matches[0].trim() : null;
  }

  static extractHourlyAnnualSalary(text: string): string | null {
    const matches = text.match(HOURLY_ANNUAL_SALARY_REGEX);
    return matches && matches.length > 0 ? matches[0].trim() : null;
  }

  static parseSalaryRange(salaryString: string): {
    min?: number;
    max?: number;
    currency?: string;
    period?: string;
    isRange: boolean;
  } | null {
    if (!salaryString) return null;

    // Indian salary patterns
    const indianMatch = salaryString.match(/₹\s?(\d[\d,]*)/);
    if (indianMatch) {
      const amount = parseInt(indianMatch[1].replace(/,/g, ''));
      const isLPA = salaryString.toLowerCase().includes('lpa') || 
                   salaryString.toLowerCase().includes('lakhs');
      
      return {
        min: amount,
        max: amount,
        currency: '₹',
        period: isLPA ? 'yearly' : 'unknown',
        isRange: false
      };
    }

    // Global salary patterns
    const dollarMatches = salaryString.match(/\$\s?(\d[\d,]*)/g);
    if (dollarMatches && dollarMatches.length > 0) {
      const amounts = dollarMatches.map(match => 
        parseInt(match.replace(/\$\s?/, '').replace(/,/g, ''))
      );

      const period = this.extractPeriod(salaryString);

      return {
        min: amounts.length > 1 ? Math.min(...amounts) : amounts[0],
        max: amounts.length > 1 ? Math.max(...amounts) : amounts[0],
        currency: '$',
        period,
        isRange: amounts.length > 1
      };
    }

    return null;
  }

  private static extractPeriod(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('/hour') || lowerText.includes('per hour')) {
      return 'hourly';
    }
    if (lowerText.includes('/month') || lowerText.includes('per month')) {
      return 'monthly';
    }
    if (lowerText.includes('/year') || lowerText.includes('per year') || 
        lowerText.includes('annually') || lowerText.includes('yearly')) {
      return 'yearly';
    }
    
    return 'unknown';
  }

  static normalizeSalary(salaryString: string): string | null {
    if (!salaryString) return null;

    // Clean up the salary string
    let normalized = salaryString.trim();
    
    // Remove extra spaces
    normalized = normalized.replace(/\s+/g, ' ');
    
    // Ensure proper spacing around currency symbols
    normalized = normalized.replace(/\$(\d)/g, '$ $1');
    normalized = normalized.replace(/₹(\d)/g, '₹ $1');
    
    return normalized;
  }

  static isValidSalaryString(text: string): boolean {
    return (
      INDIAN_SALARY_REGEX.test(text) ||
      GLOBAL_SALARY_REGEX.test(text) ||
      HOURLY_ANNUAL_SALARY_REGEX.test(text)
    );
  }

  static extractAllSalaries(text: string): string[] {
    const allSalaries: string[] = [];
    
    // Extract all salary mentions
    const patterns = [
      INDIAN_SALARY_REGEX,
      GLOBAL_SALARY_REGEX,
      HOURLY_ANNUAL_SALARY_REGEX
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        allSalaries.push(...matches.map(m => m.trim()));
      }
    }

    // Remove duplicates and return
    return Array.from(new Set(allSalaries));
  }
}
