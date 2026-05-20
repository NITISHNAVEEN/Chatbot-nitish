
"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Rocket, Bot } from 'lucide-react';
import { addChatbot } from '@/lib/mock-db';

export default function NewBotPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');

  const handleCreate = () => {
    if (!name || !topic) return;

    const newBot = addChatbot({
      id: Math.random().toString(36).substring(7),
      name,
      topic,
      rulesType: 'master',
      fixedMappings: [],
      createdAt: new Date().toISOString()
    });

    router.push(`/admin/bots/${newBot.id}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
       <header className="border-b border-border bg-card/30 h-16 shrink-0 flex items-center px-6">
        <Button asChild variant="ghost" size="icon" className="mr-4">
          <Link href="/admin/dashboard"><ChevronLeft className="h-5 w-5" /></Link>
        </Button>
        <h1 className="text-lg font-headline font-bold">Create New Chatbot</h1>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card/50 border-primary/20">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-headline">New Assistant</CardTitle>
            <CardDescription>Setup your bot's identity and core topic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label>Assistant Name</Label>
              <Input 
                placeholder="e.g. HelpDesk AI, Sales Bot..." 
                value={name}
                onChange={e => setName(e.target.value)}
                className="bg-background border-border/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Assigned Topic</Label>
              <Input 
                placeholder="e.g. IT Support, Product Catalog, Onboarding..." 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="bg-background border-border/50"
              />
              <p className="text-[10px] text-muted-foreground mt-1">A unique link will be created for this topic.</p>
            </div>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20"
              onClick={handleCreate}
              disabled={!name || !topic}
            >
              Initialize Engine <Rocket className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
