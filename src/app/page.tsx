
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bot, Zap, Shield, Link as LinkIcon, ArrowRight, MessageSquare, Code, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Navbar */}
      <nav className="border-b border-border/50 bg-background/50 backdrop-blur-lg h-16 sticky top-0 z-50">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-headline font-bold text-white tracking-tight">LinkThread</span>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/admin/dashboard">Login</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Link href="/admin/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-30" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] opacity-30" />
        </div>
        
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-primary/20 text-xs font-medium mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Next Gen RAG-Powered Assistant Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-bold mb-8 leading-[1.1] tracking-tight">
            Build a <span className="text-primary italic">Production-Ready</span> Bot in Seconds
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Apply intelligent chatbots to any web page using only a unique link. 
            Train with fixed responses or feed it your entire knowledge base.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 rounded-xl group">
              <Link href="/admin/dashboard">
                Create My First Bot <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-10 text-lg border-primary/20 rounded-xl">
              <Link href="/chat/demo-bot-1">Live Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-card/20 border-y border-border/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">Centralized Bot Control</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Full governance over your AI agents with professional administrative tools.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-secondary/20 border border-border group hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LinkIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-headline font-bold mb-3">Unique Share Links</h3>
              <p className="text-muted-foreground leading-relaxed">Generate unique, deployable links for each chatbot instance that can be used independently on any web page.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-secondary/20 border border-border group hover:border-accent/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-headline font-bold mb-3">Rule Book System</h3>
              <p className="text-muted-foreground leading-relaxed">Set a Master Rule Book or create specific behavior custom regulations for individual bot instances easily.</p>
            </div>
            
            <div className="p-8 rounded-2xl bg-secondary/20 border border-border group hover:border-primary/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-headline font-bold mb-3">Intelligent RAG</h3>
              <p className="text-muted-foreground leading-relaxed">AI powered tool that decides when to use fixed training data versus searching your Firestore knowledge base.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Types Section */}
      <section className="py-24 container mx-auto px-6">
        <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-transparent p-12 rounded-3xl border border-primary/20">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-headline font-bold mb-6">Multi-Resource Knowledge Base</h2>
              <p className="text-lg text-muted-foreground mb-8">
                The bot doesn't just guess. It answers based on real resources you provide, stored securely in our centralized database.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: Code, text: "PDF Text Extraction", color: "text-primary" },
                  { icon: Globe, text: "Live Webpage Links", color: "text-accent" },
                  { icon: MessageSquare, text: "Custom Fixed Training Data", color: "text-primary" }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-background/50 border border-border ${item.color}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-lg">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-card rounded-2xl border border-primary/30 p-2 shadow-2xl">
                <div className="bg-background rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-4 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20" />
                    <span className="text-xs font-code text-muted-foreground ml-2">linkthread_config.yaml</span>
                  </div>
                  <div className="font-code text-sm space-y-2 opacity-80">
                    <div className="text-primary">rules:</div>
                    <div className="pl-4 text-accent">master_book: true</div>
                    <div className="pl-4 text-accent">custom_regulation: "friendly_tech_pro"</div>
                    <div className="text-primary mt-4">knowledge_base:</div>
                    <div className="pl-4 text-accent">sources: [pdf, links, custom]</div>
                    <div className="pl-4 text-accent">storage: firestore</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary blur-[60px] opacity-40 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/50 py-12 bg-card/10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-headline font-bold text-white tracking-tight">LinkThread</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Documentation</a>
            </div>
            <p className="text-xs text-muted-foreground">© 2025 LinkThread. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
