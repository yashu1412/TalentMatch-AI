import * as fs from 'fs';
import * as path from 'path';

export class PlainTextService {
  /**
   * Extract text content from a plain text file
   * @param filePath - Path to the text file
   * @returns Promise<string> - Extracted text content
   */
  async extractText(filePath: string): Promise<string> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`Text file not found: ${filePath}`);
      }

      const fileExtension = path.extname(filePath).toLowerCase();
      const validExtensions = ['.txt', '.text', '.md', '.markdown'];
      
      if (!validExtensions.includes(fileExtension)) {
        throw new Error(`Invalid file type. Expected ${validExtensions.join(', ')}, got ${fileExtension}`);
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      return content;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to extract text from file: ${error.message}`);
      }
      throw new Error('Unknown error occurred while extracting text from file');
    }
  }

  /**
   * Extract text from text buffer
   * @param buffer - Text file buffer
   * @returns Promise<string> - Extracted text content
   */
  async extractTextFromBuffer(buffer: Buffer): Promise<string> {
    try {
      return buffer.toString('utf-8');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to extract text from buffer: ${error.message}`);
      }
      throw new Error('Unknown error occurred while extracting text from buffer');
    }
  }

  /**
   * Check if file is a valid text file
   * @param filePath - Path to the file
   * @returns boolean - True if valid text file
   */
  isValidTextFile(filePath: string): boolean {
    try {
      const fileExtension = path.extname(filePath).toLowerCase();
      const validExtensions = ['.txt', '.text', '.md', '.markdown'];
      return validExtensions.includes(fileExtension) && fs.existsSync(filePath);
    } catch {
      return false;
    }
  }

  /**
   * Get file encoding information
   * @param filePath - Path to the text file
   * @returns Promise<object> - File encoding info
   */
  async getFileInfo(filePath: string): Promise<any> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Basic encoding detection (simplified)
      const isUTF8 = Buffer.from(content, 'utf-8').equals(Buffer.from(content));
      const hasBOM = content.charCodeAt(0) === 0xFEFF;
      
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        extension: path.extname(filePath),
        encoding: isUTF8 ? 'utf-8' : 'unknown',
        hasBOM,
        lineCount: content.split('\n').length,
        characterCount: content.length,
        wordCount: content.split(/\s+/).filter(word => word.length > 0).length
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get file info: ${error.message}`);
      }
      throw new Error('Unknown error occurred while getting file info');
    }
  }

  /**
   * Clean and normalize text content
   * @param text - Raw text content
   * @returns string - Cleaned text
   */
  cleanText(text: string): string {
    return text
      // Remove BOM
      .replace(/^\uFEFF/, '')
      // Normalize line endings
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove excessive whitespace
      .replace(/[ \t]+/g, ' ')
      // Remove excessive newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim();
  }

  /**
   * Extract text with metadata
   * @param filePath - Path to the text file
   * @returns Promise<object> - Text content with metadata
   */
  async extractWithMetadata(filePath: string): Promise<any> {
    try {
      const rawText = await this.extractText(filePath);
      const cleanedText = this.cleanText(rawText);
      const fileInfo = await this.getFileInfo(filePath);
      
      return {
        text: cleanedText,
        rawText,
        metadata: fileInfo
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to extract text with metadata: ${error.message}`);
      }
      throw new Error('Unknown error occurred while extracting text with metadata');
    }
  }

  static extractText(buffer: Buffer): string {
    try {
      return buffer.toString('utf-8');
    } catch (error) {
      throw new Error(`Failed to extract text from plain text: ${error}`);
    }
  }

  static isTextFile(mimeType: string): boolean {
    return mimeType === 'text/plain';
  }
}
