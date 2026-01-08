import { useTodos } from '../context/TodoContext';
import { PieChart, TrendingUp, CheckCircle2, Clock } from 'lucide-react';

export function Stats() {
  const { todos } = useTodos();
  
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const active = total - completed;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider">
            <TrendingUp className="h-4 w-4" />
            <span>完成率</span>
        </div>
        <div className="text-2xl font-bold">{completionRate}%</div>
        <div className="h-1.5 w-full bg-secondary rounded-full mt-2 overflow-hidden">
            <div 
                className="h-full bg-primary transition-all duration-1000 ease-out" 
                style={{ width: `${completionRate}%` }} 
            />
        </div>
      </div>

      <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
         <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider">
            <Clock className="h-4 w-4" />
            <span>待处理</span>
        </div>
        <div className="text-2xl font-bold">{active}</div>
      </div>

       <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
         <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider">
            <CheckCircle2 className="h-4 w-4" />
            <span>已完成</span>
        </div>
        <div className="text-2xl font-bold">{completed}</div>
      </div>
      
       <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
         <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider">
            <PieChart className="h-4 w-4" />
            <span>总计</span>
        </div>
        <div className="text-2xl font-bold">{total}</div>
      </div>
    </div>
  )
}
