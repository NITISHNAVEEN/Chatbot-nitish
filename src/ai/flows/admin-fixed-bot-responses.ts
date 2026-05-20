'use server';
/**
 * @fileOverview This file implements a Genkit flow for handling administrator-defined fixed bot responses.
 * It allows matching user prompts against a predefined set of prompt-response pairs, providing consistent
 * and controlled answers for critical questions.
 *
 * - adminFixedBotResponses - A function that processes user prompts against fixed responses.
 * - AdminFixedBotResponsesInput - The input type for the adminFixedBotResponses function.
 * - AdminFixedBotResponsesOutput - The return type for the adminFixedBotResponses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdminFixedBotResponsesInputSchema = z.object({
  userPrompt: z.string().describe('The user\'s input prompt.'),
  fixedResponses: z
    .array(
      z.object({
        prompt: z.string().describe('The fixed user prompt to match.'),
        response: z.string().describe('The exact bot response for the matched prompt.'),
      })
    )
    .describe('An array of predefined prompt-response pairs.'),
});
export type AdminFixedBotResponsesInput = z.infer<typeof AdminFixedBotResponsesInputSchema>;

const AdminFixedBotResponsesOutputSchema = z.object({
  botResponse: z
    .string()
    .nullable()
    .describe('The bot\'s response, if a fixed match was found, otherwise null.'),
  matched: z
    .boolean()
    .describe('Indicates whether a fixed response was found and returned.'),
});
export type AdminFixedBotResponsesOutput = z.infer<typeof AdminFixedBotResponsesOutputSchema>;

export async function adminFixedBotResponses(
  input: AdminFixedBotResponsesInput
): Promise<AdminFixedBotResponsesOutput> {
  return adminFixedBotResponsesFlow(input);
}

const adminFixedBotResponsesFlow = ai.defineFlow(
  {
    name: 'adminFixedBotResponsesFlow',
    inputSchema: AdminFixedBotResponsesInputSchema,
    outputSchema: AdminFixedBotResponsesOutputSchema,
  },
  async input => {
    const {userPrompt, fixedResponses} = input;

    for (const fixedPair of fixedResponses) {
      if (userPrompt.trim().toLowerCase() === fixedPair.prompt.trim().toLowerCase()) {
        return {
          botResponse: fixedPair.response,
          matched: true,
        };
      }
    }

    // If no match is found, return null for botResponse and matched: false
    return {
      botResponse: null,
      matched: false,
    };
  }
);
