import { useState, useMemo } from 'react';
import { useTodos } from '../context/TodoContext';
import { TodoItem } from './TodoItem';
import { FilterBar } from './FilterBar';
import { cn } from '../lib/utils';
import { Inbox } from 'lucide-react';

export function TodoList() {
  const { todos, filterSource } = useTodos();
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
      
      const sourceMatch = filterSource ? todo.sourceId === filterSource : true;
      
      return statusMatch && categoryMatch && sourceMatch;
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

  return (
    <div className="space-y-6">
      <FilterBar 
        filter={filter} 
        setFilter={setFilter} 
        categoryFilter={categoryFilter} 
        setCategoryFilter={setCategoryFilter} 
        categories={categories} 
      />

      {filteredTodos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-white/50 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <Inbox className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-text-main mb-1">
            {todos.length === 0 ? "还没有任务" : "没有匹配的任务"}
          </h3>
          <p className="text-text-sub text-sm">
            {todos.length === 0 ? "添加一个新的任务开始高效的一天" : "尝试切换过滤器或添加新任务"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </div>
      )}
    </div>
  );
}
