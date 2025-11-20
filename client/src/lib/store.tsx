import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
  lastModified: Date;
}

interface AppContextType {
  user: User | null;
  files: CodeFile[];
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  createFile: (name: string, language: string) => void;
  updateFile: (id: string, content: string) => void;
  deleteFile: (id: string) => void;
  enhanceCode: (code: string, prompt: string) => Promise<string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock Initial Data
const INITIAL_FILES: CodeFile[] = [
  {
    id: '1',
    name: 'server.js',
    language: 'javascript',
    content: `const express = require('express');\nconst app = express();\nconst port = 3000;\n\napp.get('/', (req, res) => {\n  res.send('Hello World!');\n});\n\napp.listen(port, () => {\n  console.log(\`Example app listening at http://localhost:\${port}\`);\n});`,
    lastModified: new Date()
  },
  {
    id: '2',
    name: 'utils.ts',
    language: 'typescript',
    content: `export const formatDate = (date: Date): string => {\n  return new Intl.DateTimeFormat('en-US').format(date);\n};\n\nexport const calculateTotal = (items: any[]) => {\n  return items.reduce((acc, item) => acc + item.price, 0);\n};`,
    lastModified: new Date(Date.now() - 86400000)
  },
  {
    id: '3',
    name: 'App.jsx',
    language: 'javascript',
    content: `import React from 'react';\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Welcome to React</h1>\n    </div>\n  );\n}\n\nexport default App;`,
    lastModified: new Date(Date.now() - 172800000)
  }
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [files, setFiles] = useState<CodeFile[]>(INITIAL_FILES);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const login = async (email: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({
      id: 'u1',
      name: email.split('@')[0],
      email: email,
      avatar: 'https://github.com/shadcn.png'
    });
    setIsLoading(false);
    toast({
      title: "Welcome back!",
      description: "Successfully logged in.",
    });
  };

  const logout = () => {
    setUser(null);
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
  };

  const createFile = (name: string, language: string) => {
    const newFile: CodeFile = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      language,
      content: '// Start coding...',
      lastModified: new Date()
    };
    setFiles([newFile, ...files]);
    toast({
      title: "File created",
      description: `${name} has been created.`,
    });
  };

  const updateFile = (id: string, content: string) => {
    setFiles(files.map(f => 
      f.id === id ? { ...f, content, lastModified: new Date() } : f
    ));
  };

  const deleteFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
    toast({
      title: "File deleted",
      description: "File has been moved to trash.",
    });
  };

  const enhanceCode = async (code: string, prompt: string): Promise<string> => {
    // Simulate AI Delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI Logic
    let enhanced = code;
    if (prompt.toLowerCase().includes('comment')) {
      enhanced = `/**\n * Enhanced by AI Code Manager\n * Goal: ${prompt}\n */\n\n` + code.split('\n').map(line => `// ${line.trim()} - Explained\n${line}`).join('\n');
    } else if (prompt.toLowerCase().includes('refactor')) {
       enhanced = `// ✨ Refactored for performance\n` + code;
    } else {
      enhanced = `// 🤖 AI Suggestion: ${prompt}\n` + code + `\n\n// TODO: Implement suggested improvements`;
    }
    
    return enhanced;
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      files, 
      isLoading, 
      login, 
      logout, 
      createFile, 
      updateFile, 
      deleteFile,
      enhanceCode 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
