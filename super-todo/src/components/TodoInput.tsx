import { useState, useRef, useEffect } from 'react';
import { Plus, Calendar, Flag, Tag } from 'lucide-react';
import { useTodos, Priority } from '../context/TodoContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { cn } from '../lib/utils';

export function TodoInput() {
  const { addTodo } = useTodos();
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('个人');
  const [date, setDate] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTodo(text, priority, category, date || undefined);
    setText('');
    setPriority('medium');
    setDate('');
    // keep category
    setIsExpanded(false);
  };

  // Click outside to collapse
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node) && !text.trim()) {
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [text]);

  return (
    <>
    {isExpanded && <div className="fixed inset-0 bg-black/5 z-10" />}
    <form ref={formRef} onSubmit={handleSubmit} className="relative z-20 w-full max-w-2xl mx-auto mb-8">
      <div className={cn(
        "bg-card border border-border rounded-2xl shadow-xl transition-all duration-300 overflow-hidden",
        isExpanded ? "p-4 ring-4 ring-primary/10 scale-105" : "p-3 flex items-center gap-3 hover:shadow-2xl hover:-translate-y-0.5"
      )}>
        <div className={cn("transition-all duration-300 text-muted-foreground", isExpanded ? "hidden" : "block pl-2")}>
             <Plus className="h-6 w-6" />
        </div>
        
        <div className="flex-1">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder={isExpanded ? "准备做什么？" : "添加新任务..."}
              className="border-none shadow-none focus-visible:ring-0 text-lg bg-transparent p-0 h-auto placeholder:text-muted-foreground/50 font-medium"
              autoFocus={isExpanded}
            />
        </div>

        {isExpanded ? (
          <div className="flex flex-col gap-4 mt-4 animate-in fade-in slide-in-from-top-2 pt-4 border-t border-border/50">
            <div className="flex flex-wrap gap-2">
              <div className="relative group/priority">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <Button type="button" variant="outline" size="sm" className={cn(
                  "gap-1.5 text-xs h-8 font-medium transition-colors",
                  priority === 'high' && "text-red-600 border-red-200 bg-red-50 hover:bg-red-100",
                  priority === 'medium' && "text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100",
                  priority === 'low' && "text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                )}>
                  <Flag className="h-3.5 w-3.5" />
                  {priority === 'high' ? '高优先级' : priority === 'medium' ? '中优先级' : '低优先级'}
                </Button>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 rounded-md border border-input bg-background h-8">
                 <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                 <input 
                    type="text" 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    className="w-20 text-xs bg-transparent outline-none placeholder:text-muted-foreground"
                    placeholder="分类"
                 />
              </div>

               <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <Button type="button" variant="outline" size="sm" className={cn("gap-1.5 text-xs h-8 font-medium", date && "text-primary border-primary bg-primary/5")}>
                  <Calendar className="h-3.5 w-3.5" />
                  {date ? format(new Date(date), 'MMM d') : '截止日期'}
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
                 <Button type="button" variant="ghost" size="sm" onClick={() => setIsExpanded(false)} className="h-9">取消</Button>
                 <Button type="submit" size="sm" disabled={!text.trim()} className="h-9 px-6 font-semibold">
                    添加任务
                 </Button>
            </div>
          </div>
        ) : (
            <Button type="submit" size="sm" disabled={!text.trim()} className={cn("rounded-xl h-9 px-4 font-semibold transition-opacity", !text.trim() && "opacity-0")}>
                添加
            </Button>
        )}
      </div>
    </form>
    </>
  );
}

// Helper for date formatting in input
import { format } from 'date-fns';
