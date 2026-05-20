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
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ChevronLeft, Save, Trash2, Plus, Copy, CheckCircle, Info, ArrowRight, MessageCircle, FileText, X } from 'lucide-react';
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
        title: "Tree Synchronized",
        description: "Decision engine updated with latest nodes and branches.",
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
            <h1 className="text-lg font-headline font-bold">{bot.name}</h1>
            <p className="text-xs text-muted-foreground font-code uppercase tracking-tighter">Tree Engine Mode</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={copyLink} className="border-primary/20">
            {copied ? <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied' : 'Share Link'}
          </Button>
          <Button size="sm" onClick={handleSave} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Save className="h-4 w-4 mr-2" /> Save Decision Tree
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className="w-1/2 h-full border-r border-border overflow-y-auto bg-card/20 scrollbar-none">
          <div className="p-8 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-secondary/30 grid w-full grid-cols-3 p-1">
                <TabsTrigger value="general">Tree Root</TabsTrigger>
                <TabsTrigger value="training">Decision Nodes</TabsTrigger>
                <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="mt-6 space-y-6">
                <Card className="bg-background border-border">
                  <CardHeader>
                    <CardTitle className="text-lg font-headline">Entry Point</CardTitle>
                    <CardDescription>What the user sees first</CardDescription>
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

                <div className="space-y-4">
                  <Label className="text-base font-headline">Identity & Governance</Label>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Bot Name</Label>
                      <Input value={bot.name} onChange={e => setBot({...bot, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Assigned Topic</Label>
                      <Input value={bot.topic} onChange={e => setBot({...bot, topic: e.target.value})} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="training" className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-headline font-bold">Flow Logic Designer</h3>
                    <p className="text-sm text-muted-foreground">Define triggers and their resulting branches.</p>
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
                  {bot.fixedMappings.length === 0 && (
                    <div className="text-center py-12 border border-dashed rounded-xl text-muted-foreground bg-secondary/10">
                      No flow nodes defined. Start building your tree.
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="knowledge" className="mt-6 space-y-6">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Fallback Knowledge Base
                    </CardTitle>
                    <CardDescription>Resources used if no tree node is matched</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>OCR Extract / Source Text</Label>
                      <Textarea 
                        placeholder="Paste text extracts..."
                        className="min-h-[300px] bg-background border-primary/20"
                        value={bot.knowledgeBaseContent}
                        onChange={e => setBot({...bot, knowledgeBaseContent: e.target.value})}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Preview Panel */}
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

      {/* Decision Node Wizard */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Flow Node Designer</DialogTitle>
            <DialogDescription>
              Step {wizardStep} of 3: {wizardStep === 1 ? 'Trigger' : wizardStep === 2 ? 'Response' : 'Follow-up Branches'}
            </DialogDescription>
            <Progress value={(wizardStep / 3) * 100} className="h-1 mt-2" />
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {wizardStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 text-xs">
                  What button label or user phrase triggers this path?
                </div>
                <div className="space-y-2">
                  <Label>Trigger Phrase / Button Label</Label>
                  <Input 
                    placeholder="e.g. Technical Support" 
                    value={newPair.userPrompt}
                    onChange={(e) => setNewPair({...newPair, userPrompt: e.target.value})}
                    autoFocus
                  />
                </div>
              </div>
            )}
            
            {wizardStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                <div className="p-3 bg-accent/5 rounded-lg border border-accent/10 text-xs">
                  What message does the bot send when triggered?
                </div>
                <div className="space-y-2">
                  <Label>Bot Response</Label>
                  <Textarea 
                    placeholder="Provide the answer or instructions..." 
                    value={newPair.botResponse}
                    onChange={(e) => setNewPair({...newPair, botResponse: e.target.value})}
                    className="min-h-[100px]"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                <div className="p-3 bg-secondary/30 rounded-lg border border-border text-xs">
                  Add suggested next steps for the user (optional).
                </div>
                <div className="space-y-2">
                  <Label>Suggested Branches (Quick Replies)</Label>
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
              <>
                <Button variant="ghost" onClick={() => setWizardStep(2)}>Back</Button>
                <Button 
                  onClick={finishWizard} 
                  className="bg-primary hover:bg-primary/90 flex-1"
                >
                  Create Node
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
