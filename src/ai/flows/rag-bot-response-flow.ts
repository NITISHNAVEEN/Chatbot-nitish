'use server';
/**
 * @fileOverview A deterministic, rules-based bot response engine.
 * Updated to handle multiple knowledge sources.
 */

export type RagBotResponseInput = {
  botId: string;
  userMessage: string;
  fixedResponses?: {
    userPrompt: string;
    botResponse?: string;
    followUpOptions?: string[];
  }[];
  knowledgeSources?: { name: string; content: string }[];
};

export type RagBotResponseOutput = {
  response: string;
  responseSource: 'fixed' | 'knowledge_base' | 'fallback';
  followUpOptions?: string[];
};

export async function ragBotResponse(input: RagBotResponseInput): Promise<RagBotResponseOutput> {
  const userMsg = input.userMessage.toLowerCase().trim();

  // 1. Check for matches in fixed training pairs
  if (input.fixedResponses) {
    const match = input.fixedResponses.find(
      (f) => 
        f.userPrompt.toLowerCase().trim() === userMsg ||
        (userMsg.includes(f.userPrompt.toLowerCase().trim()) && f.userPrompt.length > 3)
    );
    if (match && match.botResponse) {
      return {
        response: match.botResponse,
        responseSource: 'fixed',
        followUpOptions: match.followUpOptions,
      };
    }
  }

  // 2. Search all Knowledge Base Sources
  if (input.knowledgeSources && input.knowledgeSources.length > 0) {
    const combinedContent = input.knowledgeSources.map(s => s.content).join('\n\n');
    const sentences = combinedContent.split(/[.!\n\?]/).map(s => s.trim()).filter(s => s.length > 5);
    const keywords = userMsg.split(/\s+/).filter(w => w.length > 3);

    let bestSentence = '';
    let maxMatches = 0;

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      let matches = 0;
      for (const keyword of keywords) {
        if (lowerSentence.includes(keyword)) {
          matches++;
        }
      }

      if (matches > maxMatches) {
        maxMatches = matches;
        bestSentence = sentence;
      }
    }

    if (maxMatches > 0) {
      return {
        response: bestSentence + ".",
        responseSource: 'knowledge_base',
      };
    }
  }

  return {
    response: "I'm sorry, I couldn't find a specific rule or resource to answer that question. Please try rephrasing or contact support.",
    responseSource: 'fallback',
  };
}
