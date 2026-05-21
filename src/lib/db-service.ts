import { ObjectId } from 'mongodb';
import { getDatabase } from './db';
import { Chatbot, CreateChatbotInput, UpdateChatbotInput, UnansweredQuestion } from './mongodb-models';

const COLLECTION_NAME = 'chatbots';

export async function getChatbots(): Promise<Chatbot[]> {
  const db = await getDatabase();
  const collection = db.collection<Chatbot>(COLLECTION_NAME);
  return collection.find({}).toArray();
}

export async function getChatbotById(id: string): Promise<Chatbot | null> {
  const db = await getDatabase();
  const collection = db.collection<Chatbot>(COLLECTION_NAME);
  
  try {
    const objectId = new ObjectId(id);
    return await collection.findOne({ _id: objectId });
  } catch (error) {
    console.error('Invalid bot ID:', id);
    return null;
  }
}

export async function addChatbot(input: CreateChatbotInput): Promise<Chatbot> {
  const db = await getDatabase();
  const collection = db.collection<Chatbot>(COLLECTION_NAME);
  
  const newBot: Chatbot = {
    name: input.name,
    topic: input.topic,
    status: 'online',
    welcomeMessage: input.welcomeMessage,
    initialOptions: input.initialOptions,
    rulesType: input.rulesType || 'master',
    customRules: input.customRules,
    knowledgeSources: input.knowledgeSources || [],
    fixedMappings: input.fixedMappings || [],
    unansweredQuestions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  const result = await collection.insertOne(newBot);
  
  return {
    ...newBot,
    _id: result.insertedId,
  };
}

export async function updateChatbot(id: string, updates: UpdateChatbotInput): Promise<Chatbot | null> {
  const db = await getDatabase();
  const collection = db.collection<Chatbot>(COLLECTION_NAME);
  
  try {
    const objectId = new ObjectId(id);
    
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    return result.value || null;
  } catch (error) {
    console.error('Error updating bot:', error);
    return null;
  }
}

export async function deleteChatbot(id: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Chatbot>(COLLECTION_NAME);
  
  try {
    const objectId = new ObjectId(id);
    const result = await collection.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  } catch (error) {
    console.error('Error deleting bot:', error);
    return false;
  }
}

export async function recordUnansweredQuestion(
  botId: string,
  questionText: string
): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Chatbot>(COLLECTION_NAME);
  
  try {
    const objectId = new ObjectId(botId);
    
    const newQuestion: UnansweredQuestion = {
      text: questionText,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };
    
    const result = await collection.updateOne(
      { _id: objectId },
      { $push: { unansweredQuestions: newQuestion } }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error recording unanswered question:', error);
    return false;
  }
}

export async function resolveUnansweredQuestion(botId: string, questionId: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Chatbot>(COLLECTION_NAME);
  
  try {
    const botObjectId = new ObjectId(botId);
    const questionObjectId = new ObjectId(questionId);
    
    const result = await collection.updateOne(
      { _id: botObjectId, 'unansweredQuestions._id': questionObjectId },
      { $set: { 'unansweredQuestions.$.status': 'resolved' } }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error resolving unanswered question:', error);
    return false;
  }
}

export async function clearUnansweredQuestions(botId: string): Promise<boolean> {
  const db = await getDatabase();
  const collection = db.collection<Chatbot>(COLLECTION_NAME);
  
  try {
    const objectId = new ObjectId(botId);
    
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: { unansweredQuestions: [] } }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error clearing unanswered questions:', error);
    return false;
  }
}
