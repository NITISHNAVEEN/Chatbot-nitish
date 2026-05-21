import { NextRequest, NextResponse } from 'next/server';
import { getChatbotById, updateChatbot, deleteChatbot } from '@/lib/db-service';
import { UpdateChatbotInput } from '@/lib/mongodb-models';
import { z } from 'zod';

const UpdateBotSchema = z.object({
  name: z.string().optional(),
  topic: z.string().optional(),
  status: z.enum(['online', 'offline']).optional(),
  welcomeMessage: z.string().optional().nullable(),
  initialOptions: z.array(z.string()).optional(),
  rulesType: z.enum(['master', 'custom']).optional(),
  customRules: z.string().optional().nullable(),
  knowledgeSources: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(['pdf', 'text', 'web']),
    content: z.string(),
    createdAt: z.string(),
  })).optional(),
  fixedMappings: z.array(z.object({
    userPrompt: z.string(),
    botResponse: z.string(),
    followUpOptions: z.array(z.string()).optional(),
  })).optional(),
  unansweredQuestions: z.array(z.object({
    _id: z.any().optional(),
    text: z.string(),
    timestamp: z.string(),
    status: z.enum(['pending', 'resolved']),
  })).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const bot = await getChatbotById(id);
    
    if (!bot) {
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(bot, { status: 200 });
  } catch (error) {
    console.error('Error fetching bot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bot' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate request body
    const validatedData = UpdateBotSchema.parse(body);
    
    // Check if bot exists
    const existingBot = await getChatbotById(id);
    if (!existingBot) {
      return NextResponse.json(
        { error: 'Bot not found' },
        { status: 404 }
      );
    }
    
    // Update bot
    const updatedBot = await updateChatbot(id, validatedData as UpdateChatbotInput);
    
    if (!updatedBot) {
      return NextResponse.json(
        { error: 'Failed to update bot' },
        { status: 500 }
      );
    }
    return NextResponse.json(updatedBot, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Zod validation error:', error.errors);
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating bot:', error);
    return NextResponse.json(
      { error: 'Failed to update bot', details: error instanceof Error ? error.message : 'Unknown error' },
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
    
    // Delete bot
    const deleted = await deleteChatbot(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete bot' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Bot deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting bot:', error);
    return NextResponse.json(
      { error: 'Failed to delete bot' },
      { status: 500 }
    );
  }
}
