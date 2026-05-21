"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Bot, Link as LinkIcon, Settings, ExternalLink, ArrowRight, MessageSquare, Power } from 'lucide-react';
import type { Chatbot } from '@/lib/mongodb-models';

export default function AdminDashboard() {
  const [bots, setBots] = useState<Chatbot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBots() {
      try {
        const response = await fetch('/api/bots');
        if (response.ok) {
          const data = await response.json();
          setBots(data);
        }
      } catch (error) {
        console.error('Failed to fetch bots:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchBots();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border bg-card/30 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-headline font-bold text-white">LinkThread</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm" className="border-primary/20">
              <Link href="/">Back to Site</Link>
            </Button>
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
              <Link href="/admin/bots/new"><Plus className="h-4 w-4 mr-2" /> Create Bot</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="grid gap-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-headline font-bold">Active Chatbots</h2>
                <p className="text-muted-foreground">Manage your deployed bot instances.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots.length === 0 && !isLoading && (
                <Card className="col-span-full">
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No bots created yet. Create one to get started!</p>
                  </CardContent>
                </Card>
              )}
              
              {bots.map((bot) => (
                <Card key={bot._id?.toString()} className="group hover:border-primary/50 transition-all bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-2">
                        <Badge variant="secondary" className="bg-secondary/50 text-accent font-code text-[10px] uppercase tracking-wider w-fit">
                          {bot.topic}
                        </Badge>
                        <Badge variant={bot.status === 'online' ? 'outline' : 'secondary'} className={bot.status === 'online' ? 'text-[9px] border-green-500/50 text-green-500 w-fit' : 'text-[9px] w-fit'}>
                          <Power className="h-2.5 w-2.5 mr-1" />
                          {bot.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Link href={`/admin/bots/${bot._id?.toString()}`}>
                            <Settings className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-accent">
                          <Link href={`/chat/${bot._id?.toString()}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors mt-2">{bot.name}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm mt-1">
                      Deterministic engine with {bot.fixedMappings.length} decision nodes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        <span>{bot.fixedMappings.length} mappings</span>
                      </div>
                      <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-medium hover:bg-primary/10 hover:text-primary">
                        <Link href={`/admin/bots/${bot._id?.toString()}`}>
                          Edit Config <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Link href="/admin/bots/new" className="h-full">
                <Card className="h-full border-dashed border-2 border-border/50 bg-transparent hover:bg-primary/5 hover:border-primary/30 transition-all flex flex-col items-center justify-center p-8 gap-4 min-h-[200px]">
                  <div className="p-3 rounded-full bg-secondary/30">
                    <Plus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-headline font-medium text-lg">Create New Bot</p>
                    <p className="text-sm text-muted-foreground mt-1">Add a topic and start training</p>
                  </div>
                </Card>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
