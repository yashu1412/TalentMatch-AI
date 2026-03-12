import { Router, Response } from 'express';
import { MatcherService } from '../services/matching/matcher.service';

const router = Router();

// Single match route
router.post('/single', async (req, res: Response) => {
  try {
    const { resumeText, jdText, jobCode } = req.body;
    
    if (!resumeText || !jdText) {
      return res.status(400).json({
        success: false,
        error: 'Resume text and JD text are required'
      });
    }

    const matchResult = MatcherService.matchResumeToJD(resumeText, jdText, jobCode);
    
    return res.json({
      success: true,
      data: matchResult
    });
  } catch (error) {
    console.error('Single match error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to match resume to JD'
    });
  }
});

// Bulk match route
router.post('/bulk', async (req, res: Response) => {
  try {
    const { resumeText, jdTexts } = req.body;
    
    if (!resumeText || !jdTexts || !Array.isArray(jdTexts)) {
      return res.status(400).json({
        success: false,
        error: 'Resume text and JD texts array are required'
      });
    }

    const matchResult = MatcherService.matchResumeToMultipleJDs(resumeText, jdTexts);
    
    return res.json({
      success: true,
      data: matchResult
    });
  } catch (error) {
    console.error('Bulk match error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to match resume to multiple JDs'
    });
  }
});

export default router;
