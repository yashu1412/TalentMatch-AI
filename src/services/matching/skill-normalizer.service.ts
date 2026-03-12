import { SKILL_ALIASES } from '../../constants/aliases';

export class SkillNormalizerService {
  private static canonicalSkills = new Map<string, string>();
  private static aliasMap = new Map<string, string>();

  static {
    // Initialize alias mappings
    for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
      this.canonicalSkills.set(canonical.toLowerCase(), canonical);
      
      for (const alias of aliases) {
        this.aliasMap.set(alias.toLowerCase(), canonical);
      }
    }
  }

  static normalizeSkill(skill: string): string {
    const normalized = skill.toLowerCase().trim();
    
    // Check if it's already a canonical skill
    if (this.canonicalSkills.has(normalized)) {
      return this.canonicalSkills.get(normalized)!;
    }
    
    // Check if it's an alias
    if (this.aliasMap.has(normalized)) {
      return this.aliasMap.get(normalized)!;
    }
    
    // Return original if no mapping found
    return skill;
  }

  static normalizeSkills(skills: string[]): string[] {
    const normalized = skills.map(skill => this.normalizeSkill(skill));
    
    // Remove duplicates while preserving order
    const seen = new Set<string>();
    const unique: string[] = [];
    
    for (const skill of normalized) {
      if (!seen.has(skill)) {
        seen.add(skill);
        unique.push(skill);
      }
    }
    
    return unique;
  }

  static extractSkillsFromText(text: string, includeUnknown: boolean = true): string[] {
    const lowerText = text.toLowerCase();
    const foundSkills: string[] = [];
    const seen = new Set<string>();

    // 1. Search for all known aliases in the text (handles multi-word skills)
    for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
      const allVariants = [canonical.toLowerCase(), ...aliases.map(a => a.toLowerCase())];
      
      for (const variant of allVariants) {
        // Special handling for skills with symbols like C++, .NET
        const escapedVariant = variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        let regex;
        if (/[\+\.\#]/.test(variant)) {
          // For skills like C++, C#, .NET, use whitespace/punctuation boundaries
          regex = new RegExp(`(?:^|\\s|[\\(\\)\\[\\]\\{\\}])${escapedVariant}(?:$|\\s|[\\(\\)\\[\\]\\{\\}]|[,.;:])`, 'gi');
        } else {
          // Standard word boundary for alphanumeric skills
          regex = new RegExp(`\\b${escapedVariant}\\b`, 'gi');
        }
        
        if (regex.test(lowerText)) {
          const normalized = this.normalizeSkill(variant);
          if (!seen.has(normalized)) {
            seen.add(normalized);
            foundSkills.push(normalized);
          }
          break; // Found one variant, move to next canonical skill
        }
      }
    }

    // 2. Tokenize and look for unknown but technical-looking words (optional)
    if (includeUnknown) {
      const words = lowerText.split(/\s+|,|;|\|\/|&|\+|-|\(|\)|\[|\]|\{|\}|\:|\.|\?|\!|@|#|\$|\%|\^|\*|\(|\)|\_|\=|\+|\\|\||\<|\>|\~|\`/);
      for (const word of words) {
        const cleanWord = word.trim().replace(/[^\w\s\-\.\+]/g, '');
        if (cleanWord.length < 2 || cleanWord.length > 50) continue;
        
        const normalized = this.normalizeSkill(cleanWord);
        if (!seen.has(normalized) && this.looksLikeTechnicalSkill(cleanWord)) {
          const capitalized = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1);
          if (!seen.has(capitalized)) {
            seen.add(capitalized);
            foundSkills.push(capitalized);
          }
        }
      }
    }

    return foundSkills;
  }
  
  private static looksLikeTechnicalSkill(word: string): boolean {
    const lowerWord = word.toLowerCase();
    
    // 1. Exclude common non-technical words, locations, names, and resume boilerplate
    const excludeWords = new Set([
      'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'are', 'was', 'were', 'been', 'will', 'would', 
      'could', 'should', 'may', 'might', 'can', 'shall', 'must', 'need', 'want', 'like', 'just', 'only', 'very', 
      'really', 'quite', 'rather', 'somewhat', 'too', 'also', 'even', 'still', 'yet', 'already', 'again', 
      'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'what', 'which', 'who', 
      'whom', 'whose', 'whatever', 'whichever', 'whoever', 'whomever', 'however', 'whenever', 'wherever', 
      'whereas', 'whereby', 'wherein', 'whereof', 'whether', 'while', 'whilst', 'until', 'since', 'before', 
      'after', 'during', 'under', 'over', 'above', 'below', 'beneath', 'beside', 'between', 'among', 'around', 
      'about', 'against', 'through', 'throughout', 'across', 'along', 'following', 'behind', 'beyond', 'plus', 
      'except', 'but', 'nor', 'or', 'yet', 'so', 'as', 'because', 'although', 'though', 'if', 'unless',
      // Resume/JD keywords
      'education', 'experience', 'projects', 'certifications', 'summary', 'profile', 'skills', 'technical', 
      'professional', 'employment', 'history', 'background', 'responsibility', 'responsibilities', 'achievements',
      'university', 'college', 'institute', 'school', 'bachelor', 'master', 'phd', 'degree', 'intern', 'internship',
      'candidate', 'qualified', 'ideal', 'looking', 'seeking', 'role', 'position', 'overview', 'expected', 
      'expected', 'current', 'present', 'location', 'india', 'portfolio', 'link', 'live', 'gmail', 'com', 'email',
      'phone', 'contact', 'address', 'jabalpur', 'madhya', 'pradesh', 'dhule', 'maharashtra', 'august', 'june',
      'july', 'november', 'february', 'march', 'april', 'september', 'october', 'december', 'january',
      'tools', 'using', 'built', 'developed', 'engineered', 'implemented', 'managed', 'optimized', 'enhanced',
      'interactive', 'responsive', 'scalable', 'robust', 'efficient', 'smooth', 'modern', 'advanced', 'basics',
      'core', 'concepts', 'basics', 'expert', 'proficient', 'knowledge', 'understanding', 'working', 'collaborative'
    ]);
    
    if (excludeWords.has(lowerWord)) {
      return false;
    }

    // 2. Technical patterns (must be specific)
    const technicalPatterns = [
      /^[a-z]+\.js$/i,        // React.js, Vue.js
      /^[a-z]+\d+(\.\d+)*$/i, // HTML5, CSS3, v18
      /^[a-z]+-[a-z]+$/i,     // node-js, express-js
      /^[a-z]+\+\+$/i,        // C++
      /^\.[a-z]+$/i,          // .NET, .js
      /\b(api|rest|graphql|sql|nosql|json|jwt|aws|gcp|azure|docker|k8s|git|ssh|postman|ffmpeg|opencv|redis|kafka|prisma|zod|zustand|vite|clerk|stripe|razorpay|cloudinary|arduino|esp32|verilog|vivado|kicad|tcad|ansys|simulink|solidworks|matlab)\b/i
    ];
    
    if (technicalPatterns.some(pattern => pattern.test(word))) {
      return true;
    }

    // 3. Stricter heuristic for unknown skills
    // Must contain a special character but NOT be an email or URL
    const hasSpecialChar = (word.includes('.') || word.includes('-') || word.includes('+') || word.includes('#'));
    const isEmail = word.includes('@');
    const isUrl = word.startsWith('http') || word.includes('www.');
    const isNameOrEmail = /^[A-Z][a-z]+[-][A-Z][a-z]+$/.test(word); // e.g. Yashpalsingh-Pawara
    
    if (hasSpecialChar && !isEmail && !isUrl && !isNameOrEmail) {
      // Still exclude common non-tech words with special chars
      const specialExclude = ['higher-secondary', 'entry-level', 'full-time', 'part-time', 'cross-device'];
      if (specialExclude.includes(lowerWord)) return false;
      
      return true;
    }
    
    return false;
  }

  static getSkillCanonicalForm(skill: string): string | null {
    const normalized = skill.toLowerCase().trim();
    return this.aliasMap.get(normalized) || null;
  }

  static isKnownSkill(skill: string): boolean {
    const normalized = skill.toLowerCase().trim();
    return this.canonicalSkills.has(normalized) || this.aliasMap.has(normalized);
  }

  static getAllCanonicalSkills(): string[] {
    return Array.from(this.canonicalSkills.keys());
  }

  static getAliasesForSkill(canonicalSkill: string): string[] {
    const normalized = canonicalSkill.toLowerCase();
    const aliases: string[] = [];
    
    for (const [canonical, aliasList] of Object.entries(SKILL_ALIASES)) {
      if (canonical.toLowerCase() === normalized) {
        aliases.push(...aliasList);
        break;
      }
    }
    
    return aliases;
  }
}
