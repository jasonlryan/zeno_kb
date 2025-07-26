import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Comment {
  id: string;
  toolId: string;
  name: string;
  message: string;
  priority: string;
  timestamp: string;
  ip?: string;
}

const COMMENTS_FILE = path.join(process.cwd(), 'data', 'comments.json');

// Ensure data directory and comments file exist
function ensureCommentsFile() {
  const dataDir = path.dirname(COMMENTS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(COMMENTS_FILE)) {
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify([], null, 2));
  }
}

// Read comments from file
function readComments(): Comment[] {
  try {
    ensureCommentsFile();
    const data = fs.readFileSync(COMMENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading comments:', error);
    return [];
  }
}

// Write comments to file
function writeComments(comments: Comment[]) {
  try {
    ensureCommentsFile();
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2));
  } catch (error) {
    console.error('Error writing comments:', error);
    throw new Error('Failed to save comment');
  }
}

// Generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// POST - Submit a new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toolId, name, message, priority } = body;

    // Validate required fields
    if (!toolId || !name?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields: toolId, name, and message are required' },
        { status: 400 }
      );
    }

    // Sanitize input
    const comment: Comment = {
      id: generateId(),
      toolId: String(toolId).trim(),
      name: String(name).trim().substring(0, 100), // Limit name length
      message: String(message).trim().substring(0, 1000), // Limit message length
      priority: priority || 'Low Priority',
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    };

    // Read existing comments
    const comments = readComments();
    
    // Add new comment
    comments.push(comment);
    
    // Save comments
    writeComments(comments);

    // Return success (without IP address)
    const responseComment = { ...comment };
    delete responseComment.ip;

    return NextResponse.json({
      success: true,
      comment: responseComment,
      message: 'Comment submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting comment:', error);
    return NextResponse.json(
      { error: 'Failed to submit comment' },
      { status: 500 }
    );
  }
}

// GET - Retrieve comments (optional, for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('toolId');
    
    const comments = readComments();
    
    // Filter by toolId if specified
    const filteredComments = toolId 
      ? comments.filter(comment => comment.toolId === toolId)
      : comments;

    // Remove IP addresses from response
    const safeComments = filteredComments.map(comment => {
      const { ip, ...safeComment } = comment;
      return safeComment;
    });

    return NextResponse.json({
      success: true,
      comments: safeComments,
      total: safeComments.length
    });

  } catch (error) {
    console.error('Error retrieving comments:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve comments' },
      { status: 500 }
    );
  }
} 