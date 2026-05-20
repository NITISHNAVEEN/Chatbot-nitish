
"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Bot, Link as LinkIcon, Settings, ExternalLink, ArrowRight, MessageSquare } from 'lucide-react';
import { getChatbots, type Chatbot } from '@/lib/mock-db';

export default function AdminDashboard() {
  const [bots, setBots] = useState<Chatbot[]>([]);

  useEffect(() => {
    setBots(getChatbots());
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
                <p className="text-muted-foreground">Manage your deployed bot instances and topics.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bots.map((bot) => (
                <Card key={bot.id} className="group hover:border-primary/50 transition-all bg-card/50 border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary" className="bg-secondary/50 text-accent font-code text-[10px] uppercase tracking-wider mb-2">
                        {bot.topic}
                      </Badge>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-accent">
                          <Link href={`/chat/${bot.id}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{bot.name}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm mt-1">
                      {bot.rulesType === 'master' ? 'Using Master Rule Book' : 'Using Custom Regulations'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        <span>{bot.fixedMappings.length} mappings</span>
                      </div>
                      <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-medium hover:bg-primary/10 hover:text-primary">
                        <Link href={`/admin/bots/${bot.id}`}>
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

          <section className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-headline font-bold mb-3">Shareable Link Engine</h3>
                <p className="text-muted-foreground mb-6">
                  Every bot you create generates a unique production-ready link. Simply copy the link and embed it or share it. Our Intelligent RAG Tool handles the rest.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-md text-xs font-code text-accent">
                    <LinkIcon className="h-3 w-3" />
                    <span>linkthread.app/chat/[bot-id]</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="relative w-full max-w-sm aspect-video bg-card rounded-xl border border-primary/20 shadow-2xl overflow-hidden p-1">
                  <div className="h-full w-full bg-background rounded-lg p-3 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500/20" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500/20" />
                      <div className="h-3 w-3 rounded-full bg-green-500/20" />
                    </div>
                    <div className="flex-1 flex flex-col gap-2 mt-2">
                      <div className="h-6 w-3/4 bg-primary/10 rounded-md animate-pulse" />
                      <div className="h-6 w-1/2 self-end bg-secondary/50 rounded-md animate-pulse" />
                      <div className="h-10 w-full bg-muted/30 rounded-md mt-auto" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
