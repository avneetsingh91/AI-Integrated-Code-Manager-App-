import { useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wand2, Code2 } from "lucide-react";
import { useLocation } from "wouter";
import generatedImage from '@assets/generated_images/Minimalist_AI_Code_Logo_aa6b0b6b.png';

export default function AuthPage() {
  const { login, isLoading } = useApp();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email);
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
         <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="mb-8 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/30 flex items-center justify-center backdrop-blur-sm shadow-2xl shadow-primary/20">
           <img src={generatedImage} alt="Logo" className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          AI Code Manager
        </h1>
        <p className="text-muted-foreground text-lg">Your intelligent coding companion.</p>
      </div>

      <Card className="w-full max-w-md border-primary/10 bg-card/50 backdrop-blur-xl shadow-2xl">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>Sign in to access your projects.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="dev@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background/50 border-primary/20 focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background/50 border-primary/20 focus:border-primary/50 transition-all"
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20" disabled={isLoading}>
                  {isLoading ? "Authenticating..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <div className="space-y-4">
                <div className="space-y-2">
                   <Label>Name</Label>
                   <Input placeholder="John Doe" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                   <Label>Email</Label>
                   <Input placeholder="dev@example.com" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                   <Label>Password</Label>
                   <Input type="password" className="bg-background/50" />
                </div>
                <Button className="w-full" onClick={() => handleLogin({ preventDefault: () => {} } as any)}>
                  Create Account
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
