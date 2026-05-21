import { NextRequest, NextResponse } from 'next/server';
import { recordUnansweredQuestion, clearUnansweredQuestions, getChatbotById } from '@/lib/db-service';
import { z } from 'zod';

const RecordQuestionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate request body
    const validatedData = RecordQuestionSchema.parse(body);
    
    // Check if bot exists
    const bot = await getChatbotById(id);
    if (!bot) {
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      );
    }
    
    // Record unanswered question
    const success = await recordUnansweredQuestion(id, validatedData.text);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to record unanswered question' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Question recorded successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error recording unanswered question:', error);
    return NextResponse.json(
      { error: 'Failed to record question' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    // Check if bot exists
    const bot = await getChatbotById(id);
    if (!bot) {
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      );
    }
    
    // Clear unanswered questions
    const success = await clearUnansweredQuestions(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to clear unanswered questions' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Unanswered questions cleared successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error clearing unanswered questions:', error);
    return NextResponse.json(
      { error: 'Failed to clear unanswered questions' },
      { status: 500 }
    );
  }
}
