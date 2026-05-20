"use client"

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, Loader2, RefreshCcw } from 'lucide-react';
import { ragBotResponse } from '@/ai/flows/rag-bot-response-flow';
import type { Chatbot } from '@/lib/mock-db';
import { Badge } from '@/components/ui/badge';

export function BotPreview({ bot }: { bot: Chatbot }) {
  const [messages, setMessages] = useState<{ role: 'bot' | 'user'; text: string; options?: string[] }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const resetChat = () => {
    setMessages([{
      role: 'bot',
      text: bot.welcomeMessage || `Hello! I am ${bot.name}.`,
      options: bot.initialOptions
    }]);
    setInput('');
  };

  useEffect(() => {
    resetChat();
  }, [bot.id, bot.welcomeMessage, bot.initialOptions]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const userMessage = text || input.trim();
    if (!userMessage || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const result = await ragBotResponse({
        botId: bot.id,
        userMessage: userMessage,
        knowledgeSources: bot.knowledgeSources.map(s => ({ name: s.name, content: s.content })),
        fixedResponses: bot.fixedMappings.map(m => ({
          userPrompt: m.userPrompt,
          botResponse: m.botResponse,
          followUpOptions: m.followUpOptions
        }))
      });

      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: result.response,
        options: result.followUpOptions
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Error syncing with tree engine." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col border-primary/20 bg-card/50 overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-primary/10 bg-primary/5 py-4">
        <CardTitle className="text-sm font-headline flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Node Matcher
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={resetChat} 
              className="h-6 w-6 text-muted-foreground hover:text-primary"
              title="New Chat"
            >
              <RefreshCcw className="h-3 w-3" />
            </Button>
            <Badge variant="outline" className="text-[9px] uppercase tracking-tighter border-primary/20">Decision Tree</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'} chat-bubble-fade-in`}
              >
                <div className={`p-2.5 rounded-xl max-w-[85%] text-xs ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                    : 'bg-secondary text-secondary-foreground rounded-tl-none border border-border'
                }`}>
                  {msg.text}
                </div>
                
                {msg.role === 'bot' && msg.options && msg.options.length > 0 && i === messages.length - 1 && (
                   <div className="flex flex-wrap gap-1 mt-1 max-w-[95%]">
                   {msg.options.map((opt, idx) => (
                     <Button
                       key={idx}
                       variant="outline"
                       size="sm"
                       onClick={() => handleSend(opt)}
                       disabled={isLoading}
                       className="bg-background/80 border-primary/30 hover:bg-primary/10 text-[10px] rounded-full h-7 px-3"
                     >
                       {opt}
                     </Button>
                   ))}
                 </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 chat-bubble-fade-in">
                <div className="p-2 rounded-lg bg-secondary text-secondary-foreground rounded-tl-none border border-border">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
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
              placeholder="Test a branch..."
              className="bg-background h-10 rounded-lg text-xs"
            />
            <Button size="icon" disabled={isLoading} className="bg-primary hover:bg-primary/90 h-10 w-10">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
