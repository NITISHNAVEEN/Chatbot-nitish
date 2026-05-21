import { ObjectId } from 'mongodb';

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
  _id?: ObjectId;
  text: string;
  timestamp: string;
  status: 'pending' | 'resolved';
}

export interface Chatbot {
  _id?: ObjectId;
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
  updatedAt?: string;
}

export interface CreateChatbotInput {
  name: string;
  topic: string;
  welcomeMessage?: string;
  initialOptions: string[];
  rulesType?: 'master' | 'custom';
  customRules?: string;
  knowledgeSources?: KnowledgeSource[];
  fixedMappings?: FixedMapping[];
}

export interface UpdateChatbotInput {
  name?: string;
  topic?: string;
  status?: 'online' | 'offline';
  welcomeMessage?: string;
  initialOptions?: string[];
  rulesType?: 'master' | 'custom';
  customRules?: string;
  knowledgeSources?: KnowledgeSource[];
  fixedMappings?: FixedMapping[];
}
