import { Check, Trash2, Calendar } from 'lucide-react';
import { Todo, useTodos } from '../context/TodoContext';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export function TodoItem({ todo }: { todo: Todo }) {
  const { toggleTodo, deleteTodo } = useTodos();

  return (
    <div className="group flex items-center justify-between p-4 mb-3 bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => toggleTodo(todo.id)}
          className={cn(
            "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 shrink-0",
            todo.completed 
              ? "bg-primary border-primary text-primary-foreground scale-110" 
              : "border-muted-foreground/50 hover:border-primary hover:scale-110"
          )}
        >
          {todo.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
        </button>
        
        <div className="flex flex-col flex-1 min-w-0">
          <span className={cn(
            "text-base font-medium transition-all truncate",
            todo.completed && "text-muted-foreground line-through decoration-muted-foreground decoration-2"
          )}>
            {todo.text}
          </span>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-muted-foreground">
            <Badge variant={todo.priority} className="uppercase text-[10px] px-2 py-0.5 tracking-wider font-bold">
              {todo.priority}
            </Badge>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {todo.category}
            </span>
            {todo.dueDate && (
              <span className="flex items-center gap-1 ml-1 text-xs font-medium">
                <Calendar className="h-3 w-3" />
                {format(new Date(todo.dueDate), 'MMM d')}
              </span>
            )}
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => deleteTodo(todo.id)}
        className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-2"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
