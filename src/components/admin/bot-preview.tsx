
"use client"

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { ragBotResponse } from '@/ai/flows/rag-bot-response-flow';
import type { Chatbot } from '@/lib/mock-db';

export function BotPreview({ bot }: { bot: Chatbot }) {
  const [messages, setMessages] = useState<{ role: 'bot' | 'user'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const result = await ragBotResponse({
        botId: bot.id,
        userMessage: userMessage,
        knowledgeBaseContent: bot.knowledgeBaseContent,
        fixedResponses: bot.fixedMappings.map(m => ({
          userPrompt: m.userPrompt,
          botResponse: m.botResponse
        }))
      });

      setMessages(prev => [...prev, { role: 'bot', text: result.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I encountered an error processing that request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col border-primary/20 bg-card/50 overflow-hidden">
      <CardHeader className="border-b border-primary/10 bg-primary/5 py-4">
        <CardTitle className="text-sm font-headline flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live Preview: {bot.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8 text-sm italic">
                Send a message to start testing the bot behavior...
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 chat-bubble-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`p-2 rounded-lg max-w-[80%] text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                    : 'bg-secondary text-secondary-foreground rounded-tl-none border border-border'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 chat-bubble-fade-in">
                <div className="p-2 rounded-lg bg-secondary text-secondary-foreground rounded-tl-none border border-border">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-border bg-background/50">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Test the bot rules..."
              className="bg-background"
            />
            <Button size="icon" disabled={isLoading} className="bg-primary hover:bg-primary/90">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
