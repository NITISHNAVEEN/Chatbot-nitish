import { NextRequest, NextResponse } from 'next/server';
import { getChatbots, addChatbot } from '@/lib/db-service';
import { CreateChatbotInput } from '@/lib/mongodb-models';
import { z } from 'zod';
import error from 'next/error';

const CreateBotSchema = z.object({
  name: z.string().min(1, 'Bot name is required'),
  topic: z.string().min(1, 'Topic is required'),
  welcomeMessage: z.string().optional(),
  initialOptions: z.array(z.string()).min(1, 'At least one initial option is required'),
  rulesType: z.enum(['master', 'custom']).optional().default('master'),
  customRules: z.string().optional(),
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
});

export async function GET() {
  try {
    const bots = await getChatbots();
    return NextResponse.json(bots, { status: 200 });
  } catch (error) {
    console.error('Error fetching bots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = CreateBotSchema.parse(body);
    
    // Add bot to database
    const newBot = await addChatbot(validatedData as CreateChatbotInput);
    
    return NextResponse.json(newBot, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
    return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }

      );
    }
    
    console.error('Error creating bot:', error);
    return NextResponse.json(
      { error: 'Failed to create bot' },
      { status: 500 }
    );
  }
}