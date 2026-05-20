'use server';
/**
 * @fileOverview An intelligent RAG (Retrieval Augmented Generation) bot response agent.
 *
 * - ragBotResponse - A function that intelligently answers user questions by first checking for fixed responses
 *                    and then retrieving and synthesizing information from a knowledge base if no fixed response is found.
 * - RagBotResponseInput - The input type for the ragBotResponse function.
 * - RagBotResponseOutput - The return type for the ragBotResponse function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RagBotResponseInputSchema = z.object({
  userId: z.string().describe('The ID of the user interacting with the bot.').optional(),
  botId: z.string().describe('The ID of the chatbot instance.'),
  userMessage: z.string().describe('The message or question from the user.'),
  fixedResponses: z.array(z.object({
    userPrompt: z.string().describe('A specific user prompt that triggers this fixed response.'),
    botResponse: z.string().describe('The pre-defined response from the bot for the specific user prompt.').optional(),
    botFlow: z.string().describe('The Genkit flow to call for this fixed response, if botResponse is not provided.').optional(),
  })).describe('An array of pre-defined user prompts and their corresponding bot responses or flow triggers.').optional(),
  knowledgeBaseContent: z.string().describe('Aggregated relevant content from the knowledge base (PDFs, web links, custom text) related to the user\'s query.').optional(),
});
export type RagBotResponseInput = z.infer<typeof RagBotResponseInputSchema>;

const RagBotResponseOutputSchema = z.object({
  response: z.string().describe('The bot\'s generated response.'),
  responseSource: z.enum(['fixed', 'retrieved', 'flow_triggered']).describe('Indicates whether the response came from a fixed mapping, retrieved RAG, or triggered a flow.'),
});
export type RagBotResponseOutput = z.infer<typeof RagBotResponseOutputSchema>;

// Prompt for the RAG part when no fixed response is found
const ragKnowledgeBasePrompt = ai.definePrompt({
  name: 'ragKnowledgeBasePrompt',
  input: { schema: z.object({
    userMessage: z.string(),
    knowledgeBaseContent: z.string().optional(),
  })},
  output: { schema: z.string() }, // Output is just the response string
  prompt: `You are a helpful and user-friendly chatbot. Your goal is to answer the user's question using the provided knowledge base content.

User Question: {{{userMessage}}}

Knowledge Base Content:
{{{knowledgeBaseContent}}}

If the knowledge base content is available and relevant, synthesize a comprehensive answer based on it. If the knowledge base content is not sufficient to answer the question, or is not provided, please state that you cannot find the information and suggest rephrasing the question or asking about a different topic. Do not invent information.`,
});

const ragBotResponseFlow = ai.defineFlow(
  {
    name: 'ragBotResponseFlow',
    inputSchema: RagBotResponseInputSchema,
    outputSchema: RagBotResponseOutputSchema,
  },
  async (input) => {
    // 1. Check for fixed responses first
    if (input.fixedResponses && input.fixedResponses.length > 0) {
      const lowerCaseUserMessage = input.userMessage.toLowerCase();
      for (const fixed of input.fixedResponses) {
        // For simplicity, we are doing an exact (case-insensitive) match for now.
        // More advanced matching (e.g., embeddings) could be implemented here if needed.
        if (fixed.userPrompt.toLowerCase() === lowerCaseUserMessage) {
          if (fixed.botResponse) {
            return {
              response: fixed.botResponse,
              responseSource: 'fixed',
            };
          } else if (fixed.botFlow) {
            // In a real scenario, you would dynamically call the specified flow here.
            // For now, we'll simulate a response indicating a flow trigger.
            return {
              response: `Triggering flow: ${fixed.botFlow}. (Actual flow execution logic would go here.)`,
              responseSource: 'flow_triggered',
            };
          }
        }
      }
    }

    // 2. If no fixed response, retrieve and synthesize from knowledge base (RAG)
    const { output: ragResponse } = await ragKnowledgeBasePrompt({
      userMessage: input.userMessage,
      knowledgeBaseContent: input.knowledgeBaseContent,
    });

    return {
      response: ragResponse || 'I am sorry, but I could not find an answer to your question based on the available information. Please try rephrasing your question.',
      responseSource: 'retrieved',
    };
  }
);

export async function ragBotResponse(input: RagBotResponseInput): Promise<RagBotResponseOutput> {
  return ragBotResponseFlow(input);
}
