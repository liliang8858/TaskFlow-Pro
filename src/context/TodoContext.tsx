import React, { createContext, useContext, useEffect, useState } from 'react';

export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;           // 唯一任务ID (UUID)，创建后永不改变
  text: string;
  completed: boolean;
  priority: Priority;
  category: string;
  dueDate?: string;
  createdAt: number;
  ownerId: string;      // 任务创建者的 peerId，永不改变
  ownerName: string;    // 任务创建者的名称
}

interface TodoContextType {
  todos: Todo[];
  addTodo: (text: string, priority: Priority, category: string, dueDate?: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  updateTodo: (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt' | 'ownerId' | 'ownerName'>>) => void;
  clearCompleted: () => void;
  setTodos: (todos: Todo[] | ((prev: Todo[]) => Todo[])) => void;
  filterOwner: string | null;
  setFilterOwner: (ownerId: string | null) => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

// 获取当前用户信息
const getCurrentUser = () => {
  const peerId = localStorage.getItem('taskflow_peer_id') || '';
  const userName = localStorage.getItem('taskflow_user_name') || '未命名';
  return { peerId, userName };
};

export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [filterOwner, setFilterOwner] = useState<string | null>(null);
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('super-todos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 兼容旧数据：将 sourceId/sourceName 迁移到 ownerId/ownerName
        return parsed.map((t: any) => ({
          ...t,
          ownerId: t.ownerId || t.sourceId || '',
          ownerName: t.ownerName || t.sourceName || '未命名'
        }));
      } catch (e) {
        console.error('Failed to parse todos', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('super-todos', JSON.stringify(todos));
    const channel = new BroadcastChannel('todo_channel');
    channel.postMessage({ type: 'UPDATE_TODOS', payload: todos });
    channel.close();
  }, [todos]);

  useEffect(() => {
    const channel = new BroadcastChannel('todo_channel');
    channel.onmessage = (event) => {
      if (event.data.type === 'UPDATE_TODOS') {
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
    const { peerId, userName } = getCurrentUser();
    
    const newTodo: Todo = {
      id: crypto.randomUUID(),  // 唯一ID
      text,
      completed: false,
      priority,
      category,
      dueDate,
      createdAt: Date.now(),
      ownerId: peerId,          // 创建者ID，永不改变
      ownerName: userName       // 创建者名称
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

  const updateTodo = (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt' | 'ownerId' | 'ownerName'>>) => {
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
    filterOwner,
    setFilterOwner
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
