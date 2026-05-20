'use server';
/**
 * @fileOverview A deterministic, rules-based bot response engine.
 * Updated to handle tree-based navigation with follow-up options.
 */

export type RagBotResponseInput = {
  botId: string;
  userMessage: string;
  fixedResponses?: {
    userPrompt: string;
    botResponse?: string;
    followUpOptions?: string[];
  }[];
  knowledgeBaseContent?: string;
};

export type RagBotResponseOutput = {
  response: string;
  responseSource: 'fixed' | 'knowledge_base' | 'fallback';
  followUpOptions?: string[];
};

/**
 * Deterministically finds the best response based on fixed mappings and knowledge base text.
 */
export async function ragBotResponse(input: RagBotResponseInput): Promise<RagBotResponseOutput> {
  const userMsg = input.userMessage.toLowerCase().trim();

  // 1. Check for exact matches in fixed training pairs (Custom Training Modality)
  if (input.fixedResponses) {
    const exactMatch = input.fixedResponses.find(
      (f) => f.userPrompt.toLowerCase().trim() === userMsg
    );
    if (exactMatch && exactMatch.botResponse) {
      return {
        response: exactMatch.botResponse,
        responseSource: 'fixed',
        followUpOptions: exactMatch.followUpOptions,
      };
    }

    // 2. Check for partial matches in fixed training pairs
    const partialMatch = input.fixedResponses.find(
      (f) => userMsg.includes(f.userPrompt.toLowerCase().trim()) && f.userPrompt.length > 3
    );
    if (partialMatch && partialMatch.botResponse) {
      return {
        response: partialMatch.botResponse,
        responseSource: 'fixed',
        followUpOptions: partialMatch.followUpOptions,
      };
    }
  }

  // 3. Search Knowledge Base Content (Deterministic Substring Search)
  if (input.knowledgeBaseContent) {
    // Split into sentences for more precise matching
    const sentences = input.knowledgeBaseContent.split(/[.!\n\?]/).map(s => s.trim()).filter(s => s.length > 5);
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

  // 4. Fallback if no rules or resources match
  return {
    response: "I'm sorry, I couldn't find a specific rule or resource to answer that question. Please try rephrasing or contact support.",
    responseSource: 'fallback',
  };
}
