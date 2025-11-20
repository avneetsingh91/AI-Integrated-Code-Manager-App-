import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface CodeFile {
  _id: string;
  filename: string;
  language: string;
  content: string;
  lastModified: string;
}

interface AppContextType {
  user: User | null;
  files: CodeFile[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  createFile: (filename: string, language: string) => Promise<void>;
  updateFile: (id: string, content: string) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  enhanceCode: (code: string, prompt: string) => Promise<string>;
  fetchFiles: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start loading to check token
  const { toast } = useToast();

  // Initialize axios token if exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(savedUser));
      fetchFiles();
    }
    setIsLoading(false);
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await axios.get('/api/files');
      setFiles(res.data);
    } catch (error) {
      console.error("Failed to fetch files", error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const { token, user } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      await fetchFiles();
      
      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const res = await axios.post('/api/auth/register', { email, password, name });
      const { token, user } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      await fetchFiles();
      
      toast({
        title: "Account created",
        description: "Welcome to AI Code Manager!",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setFiles([]);
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
  };

  const createFile = async (filename: string, language: string) => {
    try {
      await axios.post('/api/files', { filename, language, content: '// Start coding...' });
      await fetchFiles();
      toast({
        title: "File created",
        description: `${filename} has been created.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create file",
        variant: "destructive"
      });
    }
  };

  const updateFile = async (id: string, content: string) => {
    // Optimistic update
    setFiles(files.map(f => 
      f._id === id ? { ...f, content } : f
    ));
    
    try {
      await axios.put(`/api/files/${id}`, { content });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save file",
        variant: "destructive"
      });
      fetchFiles(); // Revert on error
    }
  };

  const deleteFile = async (id: string) => {
    try {
      await axios.delete(`/api/files/${id}`);
      setFiles(files.filter(f => f._id !== id));
      toast({
        title: "File deleted",
        description: "File has been moved to trash.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive"
      });
    }
  };

  const enhanceCode = async (code: string, prompt: string): Promise<string> => {
    try {
      const res = await axios.post('/api/ai/enhance', { code, prompt });
      return res.data.enhancedCode;
    } catch (error: any) {
      toast({
        title: "AI Error",
        description: error.response?.data?.message || "Failed to enhance code",
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      files, 
      isLoading, 
      login,
      register,
      logout, 
      createFile, 
      updateFile, 
      deleteFile,
      enhanceCode,
      fetchFiles
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
