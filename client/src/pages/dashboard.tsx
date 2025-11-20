import { useApp } from "@/lib/store";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileCode, Trash2, MoreVertical, Search } from "lucide-react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { files, createFile, deleteFile, user } = useApp();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileLang, setNewFileLang] = useState("javascript");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredFiles = files.filter(f => 
    f.filename.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    await createFile(newFileName, newFileLang);
    setIsDialogOpen(false);
    setNewFileName("");
  };

  const getLanguageColor = (lang: string) => {
    switch(lang) {
      case 'typescript': return 'text-blue-400 bg-blue-400/10';
      case 'javascript': return 'text-yellow-400 bg-yellow-400/10';
      case 'python': return 'text-green-400 bg-green-400/10';
      case 'html': return 'text-orange-400 bg-orange-400/10';
      case 'css': return 'text-sky-400 bg-sky-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.name}. Manage your projects.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search files..." 
              className="pl-9 bg-card border-primary/10 focus:border-primary/40"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" /> New File
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New File</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Filename</Label>
                  <Input 
                    id="name" 
                    value={newFileName} 
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="script.js" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={newFileLang} onValueChange={setNewFileLang}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="css">CSS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full">Create File</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFiles.map((file) => (
          <Card 
            key={file._id} 
            className="group relative border-primary/10 bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
            onClick={() => setLocation(`/editor/${file._id}`)}
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className={`p-2 rounded-lg ${getLanguageColor(file.language)}`}>
                <FileCode className="h-6 w-6" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file._id);
                  }}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-lg mb-1">{file.filename}</CardTitle>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{file.language}</p>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Edited {formatDistanceToNow(new Date(file.lastModified))} ago
              </p>
            </CardFooter>
          </Card>
        ))}

        {filteredFiles.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center text-muted-foreground border-2 border-dashed border-muted rounded-xl bg-muted/20">
            <FileCode className="h-12 w-12 mb-4 opacity-20" />
            <h3 className="text-lg font-medium">No files found</h3>
            <p>Create a new file to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
