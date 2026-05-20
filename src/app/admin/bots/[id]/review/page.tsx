"use client"

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  Inbox, 
  Plus, 
  Trash2, 
  ArrowRight, 
  MessageCircle, 
  Calendar, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';
import { 
  getChatbotById, 
  resolveUnansweredQuestion, 
  clearUnansweredQuestions,
  updateChatbot, 
  type Chatbot, 
  type UnansweredQuestion 
} from '@/lib/mock-db';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { X } from 'lucide-react';

export default function ReviewInboxPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [bot, setBot] = useState<Chatbot | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Resolution Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState<UnansweredQuestion | null>(null);
  const [newMapping, setNewMapping] = useState({
    userPrompt: '',
    botResponse: '',
    followUpOptions: [] as string[],
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

  const unansweredQuestions = bot?.unansweredQuestions || [];
  
  const totalPages = Math.ceil(unansweredQuestions.length / entriesPerPage);
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return unansweredQuestions.slice(start, start + entriesPerPage);
  }, [unansweredQuestions, currentPage, entriesPerPage]);

  const handleResolve = (questionId: string) => {
    resolveUnansweredQuestion(id as string, questionId);
    setBot(prev => prev ? {
      ...prev,
      unansweredQuestions: prev.unansweredQuestions.filter(q => q.id !== questionId)
    } : null);
    toast({
      title: "Query Resolved",
      description: "The unanswered question has been removed from the inbox.",
    });
  };

  const handleClearAll = () => {
    clearUnansweredQuestions(id as string);
    setBot(prev => prev ? { ...prev, unansweredQuestions: [] } : null);
    toast({
      title: "Inbox Cleared",
      description: "All pending questions have been removed.",
    });
  };

  const startResolutionWizard = (q: UnansweredQuestion) => {
    setSelectedQuestion(q);
    setNewMapping({
      userPrompt: q.text,
      botResponse: '',
      followUpOptions: [],
      currentFollowUp: ''
    });
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const addFollowUp = () => {
    if (newMapping.currentFollowUp.trim()) {
      setNewMapping(prev => ({
        ...prev,
        followUpOptions: [...prev.followUpOptions, prev.currentFollowUp.trim()],
        currentFollowUp: ''
      }));
    }
  };

  const removeFollowUp = (idx: number) => {
    setNewMapping(prev => {
      const next = [...prev.followUpOptions];
      next.splice(idx, 1);
      return { ...prev, followUpOptions: next };
    });
  };

  const finalizeResolution = () => {
    if (!bot || !selectedQuestion) return;

    const mapping = {
      userPrompt: newMapping.userPrompt,
      botResponse: newMapping.botResponse,
      followUpOptions: newMapping.followUpOptions
    };

    updateChatbot(bot.id, {
      fixedMappings: [...bot.fixedMappings, mapping],
      unansweredQuestions: bot.unansweredQuestions.filter(q => q.id !== selectedQuestion.id)
    });

    setBot(prev => prev ? {
      ...prev,
      fixedMappings: [...prev.fixedMappings, mapping],
      unansweredQuestions: prev.unansweredQuestions.filter(q => q.id !== selectedQuestion.id)
    } : null);

    setIsWizardOpen(false);
    toast({
      title: "Decision Node Created",
      description: "The bot will now respond to this query deterministically.",
    });
  };

  if (!bot) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-card/30 h-16 shrink-0 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href={`/admin/bots/${id}`}><ChevronLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="h-8 w-px bg-border" />
          <div>
            <h1 className="text-lg font-headline font-bold">Review Inbox</h1>
            <p className="text-xs text-muted-foreground font-code uppercase tracking-tighter">{bot.name}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-4xl py-12 px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-accent/10 border border-accent/20">
              <Inbox className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h2 className="text-3xl font-headline font-bold tracking-tight">Handle Workflow</h2>
              <p className="text-muted-foreground">Train your bot on queries it couldn't answer.</p>
            </div>
          </div>

          {unansweredQuestions.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-destructive/20 text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 mr-2" /> Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {unansweredQuestions.length} pending unanswered questions. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {unansweredQuestions.length > 0 && (
          <div className="flex items-center justify-between mb-6 bg-secondary/20 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">Show:</Label>
                <Select 
                  value={entriesPerPage.toString()} 
                  onValueChange={(val) => {
                    setEntriesPerPage(parseInt(val));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[80px] h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                Showing {Math.min((currentPage - 1) * entriesPerPage + 1, unansweredQuestions.length)} - {Math.min(currentPage * entriesPerPage, unansweredQuestions.length)} of {unansweredQuestions.length} entries
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentPage(i + 1)}
                    className="h-8 w-8 p-0 text-xs"
                  >
                    {i + 1}
                  </Button>
                )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {unansweredQuestions.length === 0 ? (
            <Card className="border-dashed border-2 bg-transparent text-center py-20">
              <CardContent>
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-lg font-headline font-medium">Clear Skies!</p>
                <p className="text-muted-foreground text-sm">No unanswered questions pending review.</p>
              </CardContent>
            </Card>
          ) : (
            paginatedQuestions.map((q) => (
              <Card key={q.id} className="bg-card/40 border-border/50 hover:border-accent/30 transition-all group overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-code text-accent border-accent/20">UNANSWERED</Badge>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(q.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleResolve(q.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-xl mt-3 leading-tight">"{q.text}"</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">Status: Pending Admin Resolution</p>
                    <Button onClick={() => startResolutionWizard(q)} className="bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20">
                      Convert to Node <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Resolve Query</DialogTitle>
            <DialogDescription>
              Step {wizardStep} of 3
            </DialogDescription>
            <Progress value={(wizardStep / 3) * 100} className="h-1 mt-2" />
          </DialogHeader>
          <div className="py-4 space-y-4">
            {wizardStep === 1 && (
              <div className="space-y-4">
                <Label>Trigger / Prompt</Label>
                <Input 
                  value={newMapping.userPrompt}
                  onChange={(e) => setNewMapping(prev => ({...prev, userPrompt: e.target.value}))}
                  autoFocus
                />
                <p className="text-[10px] text-muted-foreground italic">Captured from user session: "{selectedQuestion?.text}"</p>
              </div>
            )}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <Label>New Bot Response</Label>
                <Textarea 
                  placeholder="Provide instructions..." 
                  value={newMapping.botResponse}
                  onChange={(e) => setNewMapping(prev => ({...prev, botResponse: e.target.value}))}
                  className="min-h-[100px]"
                  autoFocus
                />
              </div>
            )}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <Label>Next Steps (Branches)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newMapping.followUpOptions.map((opt, i) => (
                    <Badge key={i} variant="secondary" className="gap-1">
                      {opt}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeFollowUp(i)} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Add option..." 
                    value={newMapping.currentFollowUp}
                    onChange={(e) => setNewMapping(prev => ({...prev, currentFollowUp: e.target.value}))}
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
            <div className="flex w-full justify-between">
              <Button variant="ghost" onClick={() => setWizardStep(Math.max(1, wizardStep - 1))} disabled={wizardStep === 1}>
                Back
              </Button>
              {wizardStep < 3 ? (
                <Button 
                  onClick={() => setWizardStep(wizardStep + 1)} 
                  disabled={wizardStep === 1 ? !newMapping.userPrompt.trim() : !newMapping.botResponse.trim()}
                >
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={finalizeResolution} className="bg-primary">Finish Training</Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
