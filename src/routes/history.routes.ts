import { Router, Response, Request } from 'express';

const router = Router();

// In-memory store for history (simulating a database)
// In a real app, this would be in MongoDB/PostgreSQL and tied to a user ID
let matchHistory: any[] = [];

// Middleware to simulate authentication check
// Since we're using Clerk on frontend, in a real production app we'd verify the JWT here
const checkAuth = (req: Request, res: Response, next: Function) => {
  // For demo purposes, we'll assume the request is authenticated if it comes from the frontend
  // In a real app, you'd use clerkMiddleware or similar
  next();
};

// Get all history
router.get('/', checkAuth, (req: Request, res: Response) => {
  try {
    // Sort by timestamp descending
    const sortedHistory = [...matchHistory].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return res.json({
      success: true,
      data: sortedHistory
    });
  } catch (error) {
    console.error('Get history error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve history'
    });
  }
});

// Save to history
router.post('/', checkAuth, (req: Request, res: Response) => {
  try {
    const matchData = req.body;
    
    if (!matchData) {
      return res.status(400).json({
        success: false,
        error: 'Match data is required'
      });
    }

    // Create a history entry
    const entry = {
      id: `hist_${Date.now()}`,
      timestamp: new Date().toISOString(),
      resumeName: matchData.name || 'Unknown Candidate',
      jobTitle: matchData.matchingJobs?.[0]?.role || 'Unknown Role',
      company: 'N/A', // Could be extracted from JD
      matchScore: matchData.matchingJobs?.[0]?.matchingScore || 0,
      skillsMatched: matchData.matchingJobs?.[0]?.skillsAnalysis?.filter((s: any) => s.presentInResume).length || 0,
      totalSkills: matchData.matchingJobs?.[0]?.skillsAnalysis?.length || 0,
      status: 'Completed',
      matchData: matchData // Store full data for detail view
    };

    matchHistory.push(entry);
    
    return res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Save history error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save to history'
    });
  }
});

// Delete history entry
router.delete('/', checkAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.query;
    
    if (id) {
      // Delete specific entry
      matchHistory = matchHistory.filter(entry => entry.id !== id);
    } else {
      // Clear all history
      matchHistory = [];
    }
    
    return res.json({
      success: true,
      message: id ? 'Entry deleted' : 'History cleared'
    });
  } catch (error) {
    console.error('Delete history error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete history'
    });
  }
});

// Get specific history detail
router.get('/:id', checkAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entry = matchHistory.find(e => e.id === id);
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'History entry not found'
      });
    }
    
    return res.json({
      success: true,
      data: entry
    });
  } catch (error) {
    console.error('Get history detail error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve history detail'
    });
  }
});

export default router;
