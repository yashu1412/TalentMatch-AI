import { Router, Response } from 'express';
import multer from 'multer';
import { ResumeParserService } from '../services/parsers/resume-parser.service.js';
import { JDParserService } from '../services/parsers/jd-parser.service.js';
import { PDFService } from '../services/text-extract/pdf.service.js';
import { DocxService } from '../services/text-extract/docx.service.js';
import { PlainTextService } from '../services/text-extract/plain-text.service.js';
import logger from '../logger.js';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

// Resume parsing routes
router.post('/resume/text', async (req, res: Response) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    const parsedResume = ResumeParserService.parseResume(text);
    
    return res.json({
      success: true,
      data: parsedResume
    });
  } catch (error) {
    logger.error('Resume text parsing error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse resume text'
    });
  }
});

router.post('/resume/file', upload.single('file'), async (req, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'File is required'
      });
    }

    const { buffer, mimetype } = req.file;
    let text = '';

    // Extract text based on file type
    if (PDFService.isPDFFile(mimetype)) {
      text = await PDFService.extractText(buffer);
    } else if (DocxService.isDocxFile(mimetype)) {
      text = await DocxService.extractText(buffer);
    } else if (PlainTextService.isTextFile(mimetype)) {
      text = await PlainTextService.extractText(buffer);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Unsupported file type'
      });
    }

    // Parse the extracted text
    const parsedResume = ResumeParserService.parseResume(text);
    
    return res.json({
      success: true,
      data: parsedResume
    });
  } catch (error) {
    logger.error('Resume file parsing error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse resume file'
    });
  }
});

// Job description parsing routes
router.post('/jd/text', async (req, res: Response) => {
  try {
    const { text, jobCode } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    const parsedJD = JDParserService.parseJD(text, jobCode || `JD-${Date.now()}`);
    
    return res.json({
      success: true,
      data: parsedJD
    });
  } catch (error) {
    logger.error('JD text parsing error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse JD text'
    });
  }
});

router.post('/jd/file', upload.single('file'), async (req, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'File is required'
      });
    }

    const { buffer, mimetype } = req.file;
    const { jobCode } = req.body;
    let text = '';

    // Extract text based on file type
    if (PDFService.isPDFFile(mimetype)) {
      text = await PDFService.extractText(buffer);
    } else if (DocxService.isDocxFile(mimetype)) {
      text = await DocxService.extractText(buffer);
    } else if (PlainTextService.isTextFile(mimetype)) {
      text = await PlainTextService.extractText(buffer);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Unsupported file type'
      });
    }

    // Parse the extracted text
    const parsedJD = JDParserService.parseJD(text, jobCode || `JD-${Date.now()}`);
    
    return res.json({
      success: true,
      data: parsedJD
    });
  } catch (error) {
    logger.error('JD file parsing error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse JD file'
    });
  }
});

export default router;
