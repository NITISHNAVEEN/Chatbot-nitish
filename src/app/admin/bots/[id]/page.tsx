
"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronLeft, Save, Trash2, Plus, Copy, CheckCircle } from 'lucide-react';
import { BotPreview } from '@/components/admin/bot-preview';
import { getChatbotById, updateChatbot, type Chatbot, type FixedMapping } from '@/lib/mock-db';
import { useToast } from '@/hooks/use-toast';

export default function BotConfigPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [bot, setBot] = useState<Chatbot | null>(null);
  const [activeTab, setActiveTab] = useState('training');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const found = getChatbotById(id as string);
    if (!found) {
      router.push('/admin/dashboard');
      return;
    }
    setBot({ ...found });
  }, [id, router]);

  const handleSave = () => {
    if (bot) {
      updateChatbot(bot.id, bot);
      toast({
        title: "Configuration Saved",
        description: "Your bot has been updated with the latest settings.",
      });
    }
  };

  const addMapping = () => {
    if (bot) {
      setBot({
        ...bot,
        fixedMappings: [...bot.fixedMappings, { userPrompt: '', botResponse: '' }]
      });
    }
  };

  const removeMapping = (index: number) => {
    if (bot) {
      const newList = [...bot.fixedMappings];
      newList.splice(index, 1);
      setBot({ ...bot, fixedMappings: newList });
    }
  };

  const updateMapping = (index: number, field: keyof FixedMapping, value: string) => {
    if (bot) {
      const newList = [...bot.fixedMappings];
      newList[index][field] = value;
      setBot({ ...bot, fixedMappings: newList });
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/chat/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!bot) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="border-b border-border bg-card/30 h-16 shrink-0 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/dashboard"><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="h-8 w-px bg-border" />
          <div>
            <h1 className="text-lg font-headline font-bold">{bot.name}</h1>
            <p className="text-xs text-muted-foreground font-code uppercase tracking-tighter">{bot.topic}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={copyLink} className="border-primary/20">
            {copied ? <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied Link' : 'Copy Share Link'}
          </Button>
          <Button size="sm" onClick={handleSave} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left Config Panel */}
        <div className="w-1/2 h-full border-r border-border overflow-y-auto bg-card/20 custom-scrollbar">
          <div className="p-8 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-secondary/30 grid w-full grid-cols-3 p-1">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="training">Training</TabsTrigger>
                <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="mt-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Bot Name</Label>
                    <Input 
                      value={bot.name} 
                      onChange={e => setBot({...bot, name: e.target.value})}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Primary Topic</Label>
                    <Input 
                      value={bot.topic} 
                      onChange={e => setBot({...bot, topic: e.target.value})}
                      className="bg-background"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label className="text-base font-headline">Rule Book Configuration</Label>
                  <RadioGroup 
                    value={bot.rulesType} 
                    onValueChange={(val: 'master' | 'custom') => setBot({...bot, rulesType: val})}
                  >
                    <div className="flex items-center space-x-3 rounded-lg border border-border p-4 bg-background/50">
                      <RadioGroupItem value="master" id="r1" />
                      <Label htmlFor="r1" className="flex-1 cursor-pointer">
                        <span className="font-bold block">Master Rule Book</span>
                        <span className="text-xs text-muted-foreground">Apply organization-wide standard behavior and compliance.</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 rounded-lg border border-border p-4 bg-background/50">
                      <RadioGroupItem value="custom" id="r2" />
                      <Label htmlFor="r2" className="flex-1 cursor-pointer">
                        <span className="font-bold block">Custom Regulations</span>
                        <span className="text-xs text-muted-foreground">Define specific behavior and personality for this instance.</span>
                      </Label>
                    </div>
                  </RadioGroup>

                  {bot.rulesType === 'custom' && (
                    <div className="space-y-2 pt-2">
                      <Label>Custom Rules (JSON or Plain Text)</Label>
                      <Textarea 
                        placeholder="Define custom rules here..."
                        className="min-h-[200px] font-code text-sm bg-background border-primary/20"
                        value={bot.customRules}
                        onChange={e => setBot({...bot, customRules: e.target.value})}
                      />
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="training" className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-headline font-bold">Custom Training Modality</h3>
                    <p className="text-sm text-muted-foreground">Map fixed bot responses to specific user prompts.</p>
                  </div>
                  <Button onClick={addMapping} variant="outline" size="sm" className="border-accent text-accent hover:bg-accent/10">
                    <Plus className="h-4 w-4 mr-2" /> Add Pair
                  </Button>
                </div>

                <div className="space-y-4">
                  {bot.fixedMappings.map((mapping, idx) => (
                    <Card key={idx} className="bg-background border-border relative group">
                      <CardContent className="p-4 flex gap-4">
                        <div className="flex-1 space-y-2">
                          <Label className="text-[10px] uppercase text-muted-foreground">User Prompt</Label>
                          <Input 
                            placeholder="What the user says..."
                            value={mapping.userPrompt}
                            onChange={e => updateMapping(idx, 'userPrompt', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label className="text-[10px] uppercase text-muted-foreground">Bot Response</Label>
                          <Input 
                            placeholder="How the bot answers..."
                            value={mapping.botResponse}
                            onChange={e => updateMapping(idx, 'botResponse', e.target.value)}
                            className="h-8 text-sm border-accent/30"
                          />
                        </div>
                        <div className="flex items-end pb-0.5">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeMapping(idx)}
                            className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {bot.fixedMappings.length === 0 && (
                    <div className="text-center py-12 border border-dashed rounded-xl text-muted-foreground">
                      No custom mappings defined yet.
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="knowledge" className="mt-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-headline font-bold">Intelligent RAG Knowledge Base</h3>
                    <p className="text-sm text-muted-foreground">Add text extraction from PDFs, web links, or custom info.</p>
                  </div>
                  <div className="space-y-4 bg-primary/5 p-6 rounded-xl border border-primary/10">
                    <div className="space-y-2">
                      <Label>Knowledge Base Content</Label>
                      <Textarea 
                        placeholder="Paste extracted text from PDF, web links or custom information here..."
                        className="min-h-[300px] bg-background border-primary/20"
                        value={bot.knowledgeBaseContent}
                        onChange={e => setBot({...bot, knowledgeBaseContent: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-secondary/20 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      Our Intelligent RAG Tool automatically prioritizes Fixed Training over this Knowledge Base.
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Preview Panel */}
        <div className="w-1/2 h-full bg-background p-8 flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-headline uppercase tracking-widest text-muted-foreground">Live Bot Preview</h2>
          </div>
          <div className="flex-1 min-h-0">
            <BotPreview bot={bot} />
          </div>
        </div>
      </main>
    </div>
  );
}
