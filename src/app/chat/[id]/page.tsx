"use client"

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, Loader2, ShieldCheck, Info, PowerOff } from 'lucide-react';
import { ragBotResponse } from '@/ai/flows/rag-bot-response-flow';
import { getChatbotById, type Chatbot } from '@/lib/mock-db';

export default function PublicChatPage() {
  const { id } = useParams();
  const [bot, setBot] = useState<Chatbot | null>(null);
  const [messages, setMessages] = useState<{ role: 'bot' | 'user'; text: string; options?: string[] }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const found = getChatbotById(id as string);
    if (found) {
      setBot(found);
      if (found.status === 'online') {
        setMessages([{ 
          role: 'bot', 
          text: found.welcomeMessage || `Hello! I am ${found.name}. I am a rules-based assistant for ${found.topic}.`,
          options: found.initialOptions
        }]);
      }
    }
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const userMessage = text || input.trim();
    if (!userMessage || isLoading || !bot || bot.status === 'offline') return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    setTimeout(async () => {
      try {
        const result = await ragBotResponse({
          botId: bot.id,
          userMessage: userMessage,
          knowledgeBaseContent: bot.knowledgeBaseContent,
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
        setMessages(prev => [...prev, { role: 'bot', text: "Service temporarily unavailable. Please try again." }]);
      } finally {
        setIsLoading(false);
      }
    }, 400);
  };

  if (!bot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6 text-center">
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
            <Info className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="text-xl font-headline font-bold">Rule Book Not Found</h1>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">This instance is either offline or the configuration is invalid.</p>
        </div>
      </div>
    );
  }

  if (bot.status === 'offline') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a090c] p-6 text-center">
        <div className="space-y-6 max-w-md bg-card/50 p-10 rounded-3xl border border-border">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <PowerOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-headline font-bold">{bot.name} is Offline</h1>
            <p className="text-muted-foreground text-sm">
              This support channel is currently closed for maintenance or has been disabled by an administrator.
            </p>
          </div>
          <div className="pt-4">
            <Button variant="outline" className="w-full border-primary/20" onClick={() => window.location.reload()}>
              Check Status
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0a090c] text-foreground font-body max-w-2xl mx-auto border-x border-border/50 overflow-hidden">
      <header className="p-4 border-b border-primary/10 bg-primary/5 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-headline font-bold text-sm leading-none">{bot.name}</h1>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{bot.topic}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <span className="text-[10px] text-accent font-medium uppercase tracking-widest">Guided Flow</span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full" ref={scrollRef}>
          <div className="p-6 space-y-6 pb-20">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} chat-bubble-fade-in`}
              >
                <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-md' 
                    : 'bg-secondary/40 text-secondary-foreground rounded-tl-sm border border-border shadow-sm'
                }`}>
                  {msg.text}
                </div>
                
                {msg.role === 'bot' && msg.options && msg.options.length > 0 && i === messages.length - 1 && (
                  <div className="flex flex-wrap gap-2 mt-2 max-w-[90%]">
                    {msg.options.map((opt, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSend(opt)}
                        disabled={isLoading}
                        className="bg-background/50 border-primary/20 hover:bg-primary/10 hover:border-primary/50 text-xs rounded-full h-8"
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
                <div className="p-4 rounded-2xl bg-secondary/40 text-secondary-foreground rounded-tl-sm border border-border">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      <footer className="p-4 border-t border-border bg-[#0d0c11] pb-8 md:pb-4">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or select an option..."
            className="pr-12 bg-[#121118] border-border h-12 rounded-xl focus-visible:ring-primary/50"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
            className="absolute right-1 w-10 h-10 bg-primary hover:bg-primary/90 text-white rounded-lg transition-transform active:scale-95 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
        <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-tighter opacity-50">
          LinkThread Decision Tree v3
        </p>
      </footer>
    </div>
  );
}
