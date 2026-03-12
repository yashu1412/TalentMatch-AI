import pdfParse from 'pdf-parse';

export class PDFService {
  static async extractText(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error}`);
    }
  }

  static isPDFFile(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }
}
