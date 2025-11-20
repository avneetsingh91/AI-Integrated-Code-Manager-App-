import { useEffect, useState } from "react";
import { useApp } from "@/lib/store";
import { useRoute, useLocation } from "wouter";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Play, Save, Sparkles, ArrowLeft, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function EditorPage() {
  const [, params] = useRoute("/editor/:id");
  const { files, updateFile, enhanceCode } = useApp();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const file = files.find(f => f.id === params?.id);
  
  const [code, setCode] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [output, setOutput] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      setCode(file.content);
    } else {
      setLocation("/dashboard");
    }
  }, [file, setLocation]);

  if (!file) return null;

  const handleSave = () => {
    updateFile(file.id, code);
    toast({ title: "Saved", description: "Your changes have been saved." });
  };

  const handleEnhance = async () => {
    if (!prompt) return;
    
    setIsEnhancing(true);
    try {
      const enhanced = await enhanceCode(code, prompt);
      setCode(enhanced);
      toast({ 
        title: "Code Enhanced", 
        description: "AI has applied your changes.",
        className: "bg-primary border-primary text-white" 
      });
      setPrompt("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to enhance code.", variant: "destructive" });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleRun = () => {
    setOutput("Running...");
    setTimeout(() => {
      try {
        // Dangerous in prod, but fine for mockup demonstration
        // In a real app, this would go to a sandbox API
        if (file.language === 'javascript') {
             // Basic console log capture
             const logs: string[] = [];
             const mockConsole = { log: (...args: any[]) => logs.push(args.join(' ')) };
             // eslint-disable-next-line no-new-func
             const func = new Function('console', code);
             func(mockConsole);
             setOutput(logs.length > 0 ? logs.join('\n') : 'Program executed successfully (no output)');
        } else {
          setOutput(`[System] Executing ${file.language}...\n\n> Program finished with exit code 0.`);
        }
      } catch (err: any) {
        setOutput(`Error: ${err.message}`);
      }
    }, 500);
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col">
            <span className="font-semibold">{file.name}</span>
            <span className="text-xs text-muted-foreground">{file.language}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
          <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleRun}>
            <Play className="h-4 w-4 mr-2" /> Run
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={70}>
            <Editor
              height="100%"
              defaultLanguage={file.language}
              language={file.language}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 16 },
                fontFamily: "'JetBrains Mono', monospace",
                scrollBeyondLastLine: false,
                smoothScrolling: true,
              }}
            />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={30} minSize={20}>
            <div className="h-full flex flex-col border-l border-border bg-card/30">
              
              {/* AI Section */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2 mb-3 text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-semibold text-sm">AI Assistant</span>
                </div>
                <div className="space-y-3">
                  <div className="relative">
                    <Input 
                      placeholder="E.g., 'Add comments', 'Refactor'" 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="pr-10 bg-background/50"
                      onKeyDown={(e) => e.key === 'Enter' && handleEnhance()}
                    />
                    <Button 
                      size="icon" 
                      className="absolute right-1 top-1 h-7 w-7" 
                      onClick={handleEnhance}
                      disabled={isEnhancing || !prompt}
                    >
                      {isEnhancing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bot className="h-3 w-3" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ask Gemini to refactor, debug, or document your code.
                  </p>
                </div>
              </div>

              {/* Output Console */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-3 bg-muted/30 text-xs font-semibold uppercase tracking-wider border-b border-border">
                  Console Output
                </div>
                <ScrollArea className="flex-1 p-4 font-mono text-sm">
                  {output ? (
                    <pre className="whitespace-pre-wrap break-words text-green-400">{output}</pre>
                  ) : (
                    <span className="text-muted-foreground italic">Run your code to see output...</span>
                  )}
                </ScrollArea>
              </div>

            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
