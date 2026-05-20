"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ChevronLeft, Save, Trash2, Plus, Copy, CheckCircle, ArrowRight, FileText, X, Settings, Power } from 'lucide-react';
import { BotPreview } from '@/components/admin/bot-preview';
import { getChatbotById, updateChatbot, type Chatbot, type FixedMapping } from '@/lib/mock-db';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function BotConfigPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [bot, setBot] = useState<Chatbot | null>(null);
  const [activeTab, setActiveTab] = useState('training');
  const [copied, setCopied] = useState(false);
  
  // Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newPair, setNewPair] = useState<FixedMapping & { currentFollowUp: string }>({ 
    userPrompt: '', 
    botResponse: '', 
    followUpOptions: [],
    currentFollowUp: ''
  });

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
        description: "Your bot settings and decision tree have been synchronized.",
      });
    }
  };

  const startWizard = () => {
    setNewPair({ userPrompt: '', botResponse: '', followUpOptions: [], currentFollowUp: '' });
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const finishWizard = () => {
    if (bot && newPair.userPrompt && newPair.botResponse) {
      const { currentFollowUp, ...mapping } = newPair;
      setBot({
        ...bot,
        fixedMappings: [...bot.fixedMappings, mapping]
      });
      setIsWizardOpen(false);
      toast({
        title: "Tree Node Added",
        description: "New decision path has been mapped.",
      });
    }
  };

  const addFollowUp = () => {
    if (newPair.currentFollowUp.trim()) {
      setNewPair({
        ...newPair,
        followUpOptions: [...(newPair.followUpOptions || []), newPair.currentFollowUp.trim()],
        currentFollowUp: ''
      });
    }
  };

  const removeFollowUp = (idx: number) => {
    const next = [...(newPair.followUpOptions || [])];
    next.splice(idx, 1);
    setNewPair({ ...newPair, followUpOptions: next });
  };

  const removeMapping = (index: number) => {
    if (bot) {
      const newList = [...bot.fixedMappings];
      newList.splice(index, 1);
      setBot({ ...bot, fixedMappings: newList });
    }
  };

  const addInitialOption = (val: string) => {
    if (bot && val.trim()) {
      setBot({ ...bot, initialOptions: [...bot.initialOptions, val.trim()] });
    }
  };

  const removeInitialOption = (idx: number) => {
    if (bot) {
      const next = [...bot.initialOptions];
      next.splice(idx, 1);
      setBot({ ...bot, initialOptions: next });
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
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-headline font-bold">{bot.name}</h1>
              <Badge variant={bot.status === 'online' ? 'default' : 'secondary'} className={bot.status === 'online' ? 'bg-green-500/20 text-green-500 border-green-500/30' : ''}>
                {bot.status === 'online' ? 'ONLINE' : 'OFFLINE'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-code uppercase tracking-tighter">{bot.topic}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={copyLink} className="border-primary/20">
            {copied ? <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied' : 'Share Link'}
          </Button>
          <Button size="sm" onClick={handleSave} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Save className="h-4 w-4 mr-2" /> Save Changes
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className="w-1/2 h-full border-r border-border overflow-y-auto bg-card/20 scrollbar-none">
          <div className="p-8 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-secondary/30 grid w-full grid-cols-4 p-1">
                <TabsTrigger value="general">Root</TabsTrigger>
                <TabsTrigger value="training">Nodes</TabsTrigger>
                <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
                <TabsTrigger value="settings" className="gap-2"><Settings className="h-3.5 w-3.5" /> Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="mt-6 space-y-6">
                <Card className="bg-background border-border">
                  <CardHeader>
                    <CardTitle className="text-lg font-headline">Entry Point</CardTitle>
                    <CardDescription>First contact configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Welcome Message</Label>
                      <Textarea 
                        value={bot.welcomeMessage || ''} 
                        onChange={e => setBot({...bot, welcomeMessage: e.target.value})}
                        placeholder="e.g. Hello! How can I help you today?"
                        className="bg-background min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Initial Menu Options</Label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {bot.initialOptions.map((opt, i) => (
                          <Badge key={i} variant="secondary" className="gap-1 px-2 py-1">
                            {opt}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => removeInitialOption(i)} />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Add starting option..." 
                          id="new-init-opt"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addInitialOption((e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                        <Button variant="outline" size="icon" onClick={() => {
                          const input = document.getElementById('new-init-opt') as HTMLInputElement;
                          addInitialOption(input.value);
                          input.value = '';
                        }}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="training" className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-headline font-bold">Flow Logic Designer</h3>
                    <p className="text-sm text-muted-foreground">Define triggers and branches.</p>
                  </div>
                  <Button onClick={startWizard} variant="outline" size="sm" className="border-accent text-accent hover:bg-accent/10">
                    <Plus className="h-4 w-4 mr-2" /> Add Node
                  </Button>
                </div>

                <div className="space-y-3">
                  {bot.fixedMappings.map((mapping, idx) => (
                    <div key={idx} className="flex flex-col gap-2 p-4 rounded-lg border border-border bg-background group animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] h-4 font-code">TRIGGER</Badge>
                          <span className="text-sm font-bold">{mapping.userPrompt}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeMapping(idx)}
                          className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="text-[9px] h-4 font-code border-accent/30 text-accent">MSG</Badge>
                        <span className="text-xs text-muted-foreground leading-relaxed">{mapping.botResponse}</span>
                      </div>
                      {mapping.followUpOptions && mapping.followUpOptions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 pl-6">
                          {mapping.followUpOptions.map((opt, i) => (
                            <Badge key={i} variant="secondary" className="text-[8px] h-4">
                              → {opt}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="knowledge" className="mt-6 space-y-6">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Fallback Knowledge Base
                    </CardTitle>
                    <CardDescription>OCR Extract / Source Text</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      placeholder="Paste text extracts..."
                      className="min-h-[300px] bg-background border-primary/20"
                      value={bot.knowledgeBaseContent}
                      onChange={e => setBot({...bot, knowledgeBaseContent: e.target.value})}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Power className="h-5 w-5 text-primary" />
                      Availability Settings
                    </CardTitle>
                    <CardDescription>Control if this bot is live to the public</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border border-border">
                      <div className="space-y-0.5">
                        <Label className="text-base">Bot Status</Label>
                        <p className="text-xs text-muted-foreground">
                          {bot.status === 'online' ? 'Publicly accessible and active.' : 'Hidden from public with maintenance message.'}
                        </p>
                      </div>
                      <Switch 
                        checked={bot.status === 'online'} 
                        onCheckedChange={(checked) => setBot({...bot, status: checked ? 'online' : 'offline'})}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Assistant Identity</Label>
                        <Input value={bot.name} onChange={e => setBot({...bot, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Topic Mapping</Label>
                        <Input value={bot.topic} onChange={e => setBot({...bot, topic: e.target.value})} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="w-1/2 h-full bg-background p-8 flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-headline uppercase tracking-widest text-muted-foreground">Tree Preview</h2>
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">DETERMINISTIC FLOW</Badge>
          </div>
          <div className="flex-1 min-h-0">
            <BotPreview bot={bot} />
          </div>
        </div>
      </main>

      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Flow Node Designer</DialogTitle>
            <DialogDescription>
              Step {wizardStep} of 3
            </DialogDescription>
            <Progress value={(wizardStep / 3) * 100} className="h-1 mt-2" />
          </DialogHeader>
          <div className="py-4 space-y-4">
            {wizardStep === 1 && (
              <div className="space-y-4">
                <Label>Trigger Phrase / Button Label</Label>
                <Input 
                  placeholder="e.g. Technical Support" 
                  value={newPair.userPrompt}
                  onChange={(e) => setNewPair({...newPair, userPrompt: e.target.value})}
                  autoFocus
                />
              </div>
            )}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <Label>Bot Response</Label>
                <Textarea 
                  placeholder="Provide instructions..." 
                  value={newPair.botResponse}
                  onChange={(e) => setNewPair({...newPair, botResponse: e.target.value})}
                  className="min-h-[100px]"
                  autoFocus
                />
              </div>
            )}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <Label>Suggested Branches</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newPair.followUpOptions?.map((opt, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {opt}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeFollowUp(i)} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add follow-up option..." 
                    value={newPair.currentFollowUp}
                    onChange={(e) => setNewPair({...newPair, currentFollowUp: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && addFollowUp()}
                  />
                  <Button variant="outline" size="icon" onClick={addFollowUp}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            {wizardStep < 3 ? (
              <Button 
                onClick={() => setWizardStep(wizardStep + 1)} 
                disabled={wizardStep === 1 ? !newPair.userPrompt.trim() : !newPair.botResponse.trim()}
                className="w-full"
              >
                Next <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={finishWizard} className="w-full bg-primary">Create Node</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
