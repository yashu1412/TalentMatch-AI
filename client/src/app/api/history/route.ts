import { NextRequest, NextResponse } from 'next/server';

// Mock database - in production, this would be a real database
let userHistory: any[] = [];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: userHistory
    });
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const matchData = await request.json();
    
    // Validate required fields
    if (!matchData.resumeName || !matchData.jobTitle || !matchData.company) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create history entry
    const historyEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      resumeName: matchData.resumeName,
      jobTitle: matchData.jobTitle,
      company: matchData.company,
      matchScore: matchData.matchScore || 0,
      skillsMatched: matchData.skillsMatched || 0,
      totalSkills: matchData.totalSkills || 0,
      status: 'completed',
      // Store full match data for detailed view
      matchData: matchData
    };

    // Add to history (most recent first)
    userHistory.unshift(historyEntry);

    // Keep only last 50 entries
    if (userHistory.length > 50) {
      userHistory = userHistory.slice(0, 50);
    }

    return NextResponse.json({
      success: true,
      data: historyEntry
    });
  } catch (error) {
    console.error('History save error:', error);
    return NextResponse.json(
      { error: 'Failed to save history' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');

    if (!entryId) {
      // Clear all history
      userHistory = [];
      return NextResponse.json({
        success: true,
        message: 'History cleared successfully'
      });
    }

    // Delete specific entry
    userHistory = userHistory.filter((entry: any) => entry.id !== entryId);

    return NextResponse.json({
      success: true,
      message: 'Entry deleted successfully'
    });
  } catch (error) {
    console.error('History delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete history' },
      { status: 500 }
    );
  }
}
