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
import { ChevronLeft, Save, Trash2, Plus, Copy, CheckCircle, Info, ArrowRight, MessageCircle, FileText } from 'lucide-react';
import { BotPreview } from '@/components/admin/bot-preview';
import { getChatbotById, updateChatbot, type Chatbot, type FixedMapping } from '@/lib/mock-db';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

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
  const [newPair, setNewPair] = useState<FixedMapping>({ userPrompt: '', botResponse: '' });

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
        title: "Rules Updated",
        description: "Deterministic engine has been synchronized with your changes.",
      });
    }
  };

  const startWizard = () => {
    setNewPair({ userPrompt: '', botResponse: '' });
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const finishWizard = () => {
    if (bot && newPair.userPrompt && newPair.botResponse) {
      setBot({
        ...bot,
        fixedMappings: [...bot.fixedMappings, { ...newPair }]
      });
      setIsWizardOpen(false);
      toast({
        title: "Training Pair Added",
        description: "Your bot will now respond to this prompt deterministically.",
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
            <p className="text-xs text-muted-foreground font-code uppercase tracking-tighter">Deterministic Mode</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={copyLink} className="border-primary/20">
            {copied ? <CheckCircle className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied' : 'Share Link'}
          </Button>
          <Button size="sm" onClick={handleSave} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Save className="h-4 w-4 mr-2" /> Sync Engine
          </Button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <div className="w-1/2 h-full border-r border-border overflow-y-auto bg-card/20 scrollbar-none">
          <div className="p-8 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-secondary/30 grid w-full grid-cols-3 p-1">
                <TabsTrigger value="general">Settings</TabsTrigger>
                <TabsTrigger value="training">Training Rules</TabsTrigger>
                <TabsTrigger value="knowledge">Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="mt-6 space-y-6">
                <Card className="bg-background border-border">
                  <CardHeader>
                    <CardTitle className="text-lg font-headline">Bot Identity</CardTitle>
                    <CardDescription>Basic configurations for the instance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Display Name</Label>
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
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Label className="text-base font-headline">System Regulations</Label>
                  <RadioGroup 
                    value={bot.rulesType} 
                    onValueChange={(val: 'master' | 'custom') => setBot({...bot, rulesType: val})}
                  >
                    <div className="flex items-center space-x-3 rounded-lg border border-border p-4 bg-background/50">
                      <RadioGroupItem value="master" id="r1" />
                      <Label htmlFor="r1" className="flex-1 cursor-pointer">
                        <span className="font-bold block">Master Compliance</span>
                        <span className="text-xs text-muted-foreground">Apply global organization-wide standard behavior.</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 rounded-lg border border-border p-4 bg-background/50">
                      <RadioGroupItem value="custom" id="r2" />
                      <Label htmlFor="r2" className="flex-1 cursor-pointer">
                        <span className="font-bold block">Instance Custom Rules</span>
                        <span className="text-xs text-muted-foreground">Define logic specific to this bot instance.</span>
                      </Label>
                    </div>
                  </RadioGroup>

                  {bot.rulesType === 'custom' && (
                    <div className="space-y-2 pt-2">
                      <Label>Override Regulations</Label>
                      <Textarea 
                        placeholder="Define strict behavior rules..."
                        className="min-h-[150px] font-code text-sm bg-background border-primary/20"
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
                    <h3 className="text-lg font-headline font-bold">Custom Training Wizard</h3>
                    <p className="text-sm text-muted-foreground">Map triggers to specific responses step-by-step.</p>
                  </div>
                  <Button onClick={startWizard} variant="outline" size="sm" className="border-accent text-accent hover:bg-accent/10">
                    <Plus className="h-4 w-4 mr-2" /> Add Rule
                  </Button>
                </div>

                <div className="space-y-3">
                  {bot.fixedMappings.map((mapping, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background group animate-in fade-in slide-in-from-top-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[9px] h-4 font-code">USER</Badge>
                          <span className="text-sm font-medium">{mapping.userPrompt}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] h-4 font-code border-accent/30 text-accent">BOT</Badge>
                          <span className="text-xs text-muted-foreground line-clamp-1">{mapping.botResponse}</span>
                        </div>
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
                  ))}
                  {bot.fixedMappings.length === 0 && (
                    <div className="text-center py-12 border border-dashed rounded-xl text-muted-foreground bg-secondary/10">
                      No custom rules defined. Click "Add Rule" to start the wizard.
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="knowledge" className="mt-6 space-y-6">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Deterministic Knowledge Base
                    </CardTitle>
                    <CardDescription>Searchable resource content (e.g. OCR text extracts)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Source Text</Label>
                      <Textarea 
                        placeholder="Paste text extracted from PDFs or web resources..."
                        className="min-h-[300px] bg-background border-primary/20 focus:ring-primary/40"
                        value={bot.knowledgeBaseContent}
                        onChange={e => setBot({...bot, knowledgeBaseContent: e.target.value})}
                      />
                    </div>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 bg-background/50 rounded-lg border border-border">
                      <Info className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>
                        The engine uses keyword-weight matching to find the best sentence from this content if no direct Training Rule is matched.
                      </span>
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
            <h2 className="text-sm font-headline uppercase tracking-widest text-muted-foreground">Deterministic Preview</h2>
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">NO-AI MODE</Badge>
          </div>
          <div className="flex-1 min-h-0">
            <BotPreview bot={bot} />
          </div>
        </div>
      </main>

      {/* Step-by-Step Training Wizard */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Training Rule Wizard</DialogTitle>
            <DialogDescription>
              Step {wizardStep} of 2: {wizardStep === 1 ? 'Define User Trigger' : 'Define Bot Response'}
            </DialogDescription>
            <Progress value={wizardStep === 1 ? 50 : 100} className="h-1 mt-2" />
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {wizardStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <span className="text-xs">Think of a question users often ask about <strong>{bot.topic}</strong>.</span>
                </div>
                <div className="space-y-2">
                  <Label>User says...</Label>
                  <Input 
                    placeholder="e.g. How do I reset my password?" 
                    value={newPair.userPrompt}
                    onChange={(e) => setNewPair({...newPair, userPrompt: e.target.value})}
                    autoFocus
                  />
                </div>
              </div>
            )}
            
            {wizardStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                <div className="p-3 bg-accent/5 rounded-lg border border-accent/10 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <span className="text-xs">Now, define exactly how the bot should respond to "<strong>{newPair.userPrompt}</strong>".</span>
                </div>
                <div className="space-y-2">
                  <Label>Bot responds with...</Label>
                  <Textarea 
                    placeholder="Provide a clear, accurate answer..." 
                    value={newPair.botResponse}
                    onChange={(e) => setNewPair({...newPair, botResponse: e.target.value})}
                    className="min-h-[100px]"
                    autoFocus
                  />
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2">
            {wizardStep === 1 ? (
              <Button 
                onClick={() => setWizardStep(2)} 
                disabled={!newPair.userPrompt.trim()}
                className="w-full"
              >
                Next Step <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setWizardStep(1)}>Back</Button>
                <Button 
                  onClick={finishWizard} 
                  disabled={!newPair.botResponse.trim()}
                  className="bg-primary hover:bg-primary/90 flex-1"
                >
                  Create Training Rule
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
