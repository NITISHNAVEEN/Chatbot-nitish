export interface FixedMapping {
  userPrompt: string;
  botResponse: string;
  followUpOptions?: string[]; // New: suggested buttons after this response
}

export interface Chatbot {
  id: string;
  name: string;
  topic: string;
  welcomeMessage?: string;
  initialOptions: string[]; // New: entry point buttons
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
    welcomeMessage: 'Welcome to Tech Support! Please select an option below to get started.',
    initialOptions: ['Internet Issues', 'Password Reset', 'Software Install'],
    rulesType: 'master',
    knowledgeBaseContent: 'Our support hours are 9 AM to 5 PM EST. We provide help with software installation, hardware troubleshooting, and network configuration.',
    fixedMappings: [
      { 
        userPrompt: 'Internet Issues', 
        botResponse: 'Are you experiencing a total outage or just slow speeds?',
        followUpOptions: ['Total Outage', 'Slow Speeds', 'Back to Main']
      },
      { 
        userPrompt: 'Password Reset', 
        botResponse: 'To reset your password, visit the portal at portal.company.com and click "Forgot Password".',
        followUpOptions: ['Portal not loading', 'Successful', 'Back to Main']
      },
      {
        userPrompt: 'Back to Main',
        botResponse: 'What else can I help you with?',
        followUpOptions: ['Internet Issues', 'Password Reset', 'Software Install']
      }
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
