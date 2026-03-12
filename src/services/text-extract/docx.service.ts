import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth';

export class DocxService {
  /**
   * Extract text content from a DOCX file
   * @param filePath - Path to the DOCX file
   * @returns Promise<string> - Extracted text content
   */
  async extractText(filePath: string): Promise<string> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`DOCX file not found: ${filePath}`);
      }

      const fileExtension = path.extname(filePath).toLowerCase();
      if (fileExtension !== '.docx') {
        throw new Error(`Invalid file type. Expected .docx, got ${fileExtension}`);
      }

      const result = await mammoth.extractRawText({ path: filePath });
      
      if (result.messages.length > 0) {
        console.warn('DOCX extraction warnings:', result.messages);
      }
      
      return result.value;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to extract text from DOCX: ${error.message}`);
      }
      throw new Error('Unknown error occurred while extracting text from DOCX');
    }
  }

  /**
   * Extract text from DOCX buffer
   * @param buffer - DOCX file buffer
   * @returns Promise<string> - Extracted text content
   */
  async extractTextFromBuffer(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      
      if (result.messages.length > 0) {
        console.warn('DOCX extraction warnings:', result.messages);
      }
      
      return result.value;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to extract text from DOCX buffer: ${error.message}`);
      }
      throw new Error('Unknown error occurred while extracting text from DOCX buffer');
    }
  }

  /**
   * Extract text with HTML formatting from DOCX
   * @param filePath - Path to the DOCX file
   * @returns Promise<string> - Extracted text with HTML formatting
   */
  async extractHtml(filePath: string): Promise<string> {
    try {
      const result = await mammoth.convertToHtml({ path: filePath });
      
      if (result.messages.length > 0) {
        console.warn('DOCX HTML conversion warnings:', result.messages);
      }
      
      return result.value;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to convert DOCX to HTML: ${error.message}`);
      }
      throw new Error('Unknown error occurred while converting DOCX to HTML');
    }
  }

  /**
   * Extract text with HTML formatting from DOCX buffer
   * @param buffer - DOCX file buffer
   * @returns Promise<string> - Extracted text with HTML formatting
   */
  async extractHtmlFromBuffer(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.convertToHtml({ buffer });
      
      if (result.messages.length > 0) {
        console.warn('DOCX HTML conversion warnings:', result.messages);
      }
      
      return result.value;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to convert DOCX buffer to HTML: ${error.message}`);
      }
      throw new Error('Unknown error occurred while converting DOCX buffer to HTML');
    }
  }

  /**
   * Check if file is a valid DOCX
   * @param filePath - Path to the file
   * @returns boolean - True if valid DOCX
   */
  isValidDocx(filePath: string): boolean {
    try {
      const fileExtension = path.extname(filePath).toLowerCase();
      return fileExtension === '.docx' && fs.existsSync(filePath);
    } catch {
      return false;
    }
  }

  /**
   * Extract structured data from DOCX (preserves some formatting)
   * @param filePath - Path to the DOCX file
   * @returns Promise<any> - Structured data with text and formatting info
   */
  async extractStructuredData(filePath: string): Promise<any> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      const htmlResult = await mammoth.convertToHtml({ path: filePath });
      
      return {
        text: result.value,
        html: htmlResult.value,
        messages: result.messages,
        warnings: htmlResult.messages
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to extract structured data from DOCX: ${error.message}`);
      }
      throw new Error('Unknown error occurred while extracting structured data from DOCX');
    }
  }

  static async extractText(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new Error(`Failed to extract text from DOCX: ${error}`);
    }
  }

  static isDocxFile(mimeType: string): boolean {
    return mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
}
