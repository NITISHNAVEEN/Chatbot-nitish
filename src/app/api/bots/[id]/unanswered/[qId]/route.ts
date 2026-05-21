import { NextRequest, NextResponse } from 'next/server';
import { resolveUnansweredQuestion, getChatbotById } from '@/lib/db-service';

interface RouteParams {
  params: Promise<{ id: string; qId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, qId } = await params;
    
    // Check if bot exists
    const bot = await getChatbotById(id);
    if (!bot) {
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      );
    }
    
    // Resolve unanswered question
    const success = await resolveUnansweredQuestion(id, qId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to resolve question or question not found' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Question resolved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error resolving unanswered question:', error);
    return NextResponse.json(
      { error: 'Failed to resolve question' },
      { status: 500 }
    );
  }
}
