
export interface FixedMapping {
  userPrompt: string;
  botResponse: string;
}

export interface Chatbot {
  id: string;
  name: string;
  topic: string;
  rulesType: 'master' | 'custom';
  customRules?: string;
  knowledgeBaseContent?: string;
  fixedMappings: FixedMapping[];
  createdAt: string;
}

// In-memory mock storage for demo purposes
let chatbots: Chatbot[] = [
  {
    id: 'demo-bot-1',
    name: 'Tech Support Assistant',
    topic: 'General IT Support',
    rulesType: 'master',
    knowledgeBaseContent: 'Our support hours are 9 AM to 5 PM EST. We provide help with software installation, hardware troubleshooting, and network configuration.',
    fixedMappings: [
      { userPrompt: 'Hello', botResponse: 'Welcome to Tech Support! How can I assist you today?' },
      { userPrompt: 'Bye', botResponse: 'Goodbye! Feel free to reach out if you need more help.' }
    ],
    createdAt: new Date().toISOString()
  }
];

export const getChatbots = () => chatbots;
export const getChatbotById = (id: string) => chatbots.find(b => b.id === id);
export const addChatbot = (bot: Chatbot) => {
  chatbots.push(bot);
  return bot;
};
export const updateChatbot = (id: string, updates: Partial<Chatbot>) => {
  chatbots = chatbots.map(b => b.id === id ? { ...b, ...updates } : b);
  return chatbots.find(b => b.id === id);
};
