import { useState, useEffect } from 'react';
import { TodoProvider } from './context/TodoContext';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { Stats } from './components/Stats';
import { Button } from './components/ui/Button';
import { Moon, Sun, LayoutDashboard } from 'lucide-react';

function App() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference on load or saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <TodoProvider>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans antialiased selection:bg-primary/20">
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50 supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5 group cursor-pointer">
              <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Super Todo
              </h1>
            </div>
            
            <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} className="rounded-full">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-4 mb-12">
               <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent pb-2">
                  管理你的每一天
               </h2>
               <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
                  简单、强大、美观。这是你一直在寻找的任务管理工具。
               </p>
            </div>

            <Stats />
            <TodoInput />
            <TodoList />
          </div>
        </main>
        
        <footer className="border-t border-border/50 mt-20 py-8">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} Super Todo. Created with ❤️ by Trae.</p>
            </div>
        </footer>
      </div>
    </TodoProvider>
  );
}

export default App;
