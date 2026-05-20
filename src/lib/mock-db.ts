export interface FixedMapping {
  userPrompt: string;
  botResponse: string;
  followUpOptions?: string[];
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: 'pdf' | 'text' | 'web';
  content: string;
  createdAt: string;
}

export interface UnansweredQuestion {
  id: string;
  text: string;
  timestamp: string;
  status: 'pending' | 'resolved';
}

export interface Chatbot {
  id: string;
  name: string;
  topic: string;
  status: 'online' | 'offline';
  welcomeMessage?: string;
  initialOptions: string[];
  rulesType: 'master' | 'custom';
  customRules?: string;
  knowledgeSources: KnowledgeSource[];
  fixedMappings: FixedMapping[];
  unansweredQuestions: UnansweredQuestion[];
  createdAt: string;
}

let chatbots: Chatbot[] = [
  {
    id: 'demo-bot-1',
    name: 'Tech Support Assistant',
    topic: 'General IT Support',
    status: 'online',
    welcomeMessage: 'Welcome to Tech Support! Please select an option below to get started.',
    initialOptions: ['Internet Issues', 'Password Reset', 'Software Install'],
    rulesType: 'master',
    knowledgeSources: [
      {
        id: 'ks-1',
        name: 'Core Support Policy',
        type: 'text',
        content: 'Our support hours are 9 AM to 5 PM EST. We provide help with software installation, hardware troubleshooting, and network configuration.',
        createdAt: new Date().toISOString()
      }
    ],
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
    unansweredQuestions: Array.from({ length: 15 }).map((_, i) => ({
      id: `uq-demo-${i}`,
      text: i === 0 ? 'How do I request a new laptop?' : i === 1 ? 'Where is the office located?' : `Random query ${i + 1}?`,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      status: 'pending'
    })),
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

export const recordUnansweredQuestion = (botId: string, text: string) => {
  const bot = getChatbotById(botId);
  if (bot) {
    const newQuestion: UnansweredQuestion = {
      id: Math.random().toString(36).substring(7),
      text,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    updateChatbot(botId, {
      unansweredQuestions: [newQuestion, ...bot.unansweredQuestions]
    });
  }
};

export const resolveUnansweredQuestion = (botId: string, questionId: string) => {
  const bot = getChatbotById(botId);
  if (bot) {
    updateChatbot(botId, {
      unansweredQuestions: bot.unansweredQuestions.filter(q => q.id !== questionId)
    });
  }
};

export const clearUnansweredQuestions = (botId: string) => {
  const bot = getChatbotById(botId);
  if (bot) {
    updateChatbot(botId, {
      unansweredQuestions: []
    });
  }
};
