
"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Rocket, Bot, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NewBotPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !topic) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          topic,
          initialOptions: ["Start"],
          rulesType: 'master',
          fixedMappings: [],
          knowledgeSources: [],
        }),
      });

      if (response.ok) {
        const newBot = await response.json();
        toast({
          title: "Chatbot Created",
          description: `${name} is ready for configuration.`,
        });
        router.push(`/admin/bots/${newBot._id?.toString()}`);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create chatbot.",
        });
      }
    } catch (error) {
      console.error('Error creating bot:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create chatbot.",
      });
    } finally {
      setIsLoading(false);
    }
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
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Assigned Topic</Label>
              <Input 
                placeholder="e.g. IT Support, Product Catalog, Onboarding..." 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="bg-background border-border/50"
                disabled={isLoading}
              />
              <p className="text-[10px] text-muted-foreground mt-1">A unique link will be created for this topic.</p>
            </div>
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20"
              onClick={handleCreate}
              disabled={!name || !topic || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  Initialize Engine <Rocket className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
