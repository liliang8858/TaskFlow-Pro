import { useState, useMemo } from 'react';
import { useTodos } from '../context/TodoContext';
import { TodoItem } from './TodoItem';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { CheckCircle2, ListFilter } from 'lucide-react';

export function TodoList() {
  const { todos, clearCompleted } = useTodos();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const categories = useMemo(() => {
    return Array.from(new Set(todos.map(t => t.category)));
  }, [todos]);

  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      const statusMatch = 
        filter === 'all' ? true :
        filter === 'active' ? !todo.completed :
        todo.completed;
      
      const categoryMatch = categoryFilter ? todo.category === categoryFilter : true;
      
      return statusMatch && categoryMatch;
    }).sort((a, b) => {
        // Sort by completed (active first), then priority (high first), then date
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
            return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        return b.createdAt - a.createdAt;
    });
  }, [todos, filter, categoryFilter]);

  const activeCount = todos.filter(t => !t.completed).length;

  if (todos.length === 0) {
    return (
      <div className="text-center py-20 opacity-50 animate-in fade-in zoom-in-95 duration-500">
        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-muted mb-6">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">还没有任务</h3>
        <p className="text-muted-foreground">开始添加一些任务来追踪你的进度吧</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card/50 p-2 rounded-xl border border-border/40 backdrop-blur-sm sticky top-4 z-10 shadow-sm">
        <div className="flex p-1 bg-muted/50 rounded-lg w-full md:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
              filter === 'all' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('active')}
            className={cn(
              "flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
              filter === 'active' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            进行中
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={cn(
              "flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
              filter === 'completed' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            已完成
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
           {categories.length > 0 && (
             <div className="flex items-center gap-1 pr-2 border-r border-border/50 mr-2 shrink-0">
                <ListFilter className="h-4 w-4 text-muted-foreground" />
             </div>
           )}
           <div className="flex gap-2">
            <button
                onClick={() => setCategoryFilter(null)}
                className={cn(
                    "whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    categoryFilter === null 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "bg-transparent border-border hover:border-primary/50"
                )}
            >
                全部
            </button>
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                        "whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                        categoryFilter === cat 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "bg-transparent border-border hover:border-primary/50"
                    )}
                >
                    {cat}
                </button>
            ))}
           </div>
        </div>
      </div>

      <div className="space-y-1 min-h-[300px]">
        {filteredTodos.length === 0 ? (
           <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
               <p>没有找到符合条件的任务</p>
           </div>
        ) : (
            filteredTodos.map(todo => (
            <TodoItem key={todo.id} todo={todo} />
            ))
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
        <span className="font-medium">{activeCount} 个未完成任务</span>
        {todos.some(t => t.completed) && (
          <Button variant="ghost" size="sm" onClick={clearCompleted} className="text-destructive hover:text-destructive hover:bg-destructive/10">
            清除已完成
          </Button>
        )}
      </div>
    </div>
  );
}
