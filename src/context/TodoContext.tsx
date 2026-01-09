import React, { createContext, useContext, useEffect, useState } from 'react';

export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: string;
  dueDate?: string;
  createdAt: number;
  sourceId?: string; // ID of the reporter who owns this task
}

interface TodoContextType {
  todos: Todo[];
  addTodo: (text: string, priority: Priority, category: string, dueDate?: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateTodo: (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void;
  clearCompleted: () => void;
  setTodos: (todos: Todo[] | ((prev: Todo[]) => Todo[])) => void;
  filterSource: string | null;
  setFilterSource: (sourceId: string | null) => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [filterSource, setFilterSource] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('super-todos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse todos', e);
      }
    }
    // Default demo data
    return [
      {
        id: '1',
        text: '欢迎使用 Super Todo',
        completed: false,
        priority: 'high',
        category: '个人',
        createdAt: Date.now(),
      },
      {
        id: '2',
        text: '尝试添加一个新的任务',
        completed: false,
        priority: 'medium',
        category: '工作',
        createdAt: Date.now() - 1000,
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('super-todos', JSON.stringify(todos));
    // Broadcast change to other tabs
    const channel = new BroadcastChannel('todo_channel');
    channel.postMessage({ type: 'UPDATE_TODOS', payload: todos });
    channel.close();
  }, [todos]);

  useEffect(() => {
    const channel = new BroadcastChannel('todo_channel');
    channel.onmessage = (event) => {
      if (event.data.type === 'UPDATE_TODOS') {
        // Only update if data is different to avoid loops (though SetState usually handles this)
        // For simplicity, we just sync the state from the message
        // We use a functional update to check if it's actually different if needed, 
        // but here we just trust the payload.
        // Important: we need to distinguish "local update" vs "remote update" to avoid infinite loops if we were also broadcasting on every set.
        // But here useEffect depends on [todos], so setting todos will trigger useEffect again and broadcast again.
        // To prevent infinite loop: we should compare with local storage or use a ref to ignore next update.
        // Actually, better approach: 
        // Only broadcast when we perform an action (add/delete/etc), NOT in useEffect([todos]).
        // BUT, since we want to keep it simple and react to state changes:
        // Let's rely on JSON stringify comparison or just `storage` event?
        // `storage` event is fired only in OTHER tabs, not current one. This is safer for loops.
        // BroadcastChannel also receives in other tabs.
        // The loop happens if Tab A sends -> Tab B receives & sets -> Tab B useEffect triggers -> Tab B sends -> Tab A receives...
        
        // Solution: When receiving remote update, set state but use a flag to skip broadcasting back? 
        // Or simply: check if data is deeply equal.
        setTodos(prev => {
            if (JSON.stringify(prev) === JSON.stringify(event.data.payload)) {
                return prev;
            }
            return event.data.payload;
        });
      }
    };
    return () => channel.close();
  }, []);

  const addTodo = (text: string, priority: Priority = 'medium', category: string = '个人', dueDate?: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      priority,
      category,
      dueDate,
      createdAt: Date.now(),
    };
    setTodos(prev => [newTodo, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const updateTodo = (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, ...updates } : todo
    ));
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(todo => !todo.completed));
  };

  const value = {
    todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    clearCompleted,
    setTodos,
    filterSource,
    setFilterSource
  };

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
}
