import { Trash2, Calendar, Flag, Check, User } from 'lucide-react';
import { Todo, useTodos } from '../context/TodoContext';
import { usePeer } from '../context/PeerContext';
import { cn } from '../lib/utils';
import { format, isToday, isTomorrow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function TodoItem({ todo }: { todo: Todo }) {
  const { toggleTodo, deleteTodo } = useTodos();
  const { peerId } = usePeer();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isToday(date)) return `今天 ${format(date, 'HH:mm')}`;
    if (isTomorrow(date)) return `明天 ${format(date, 'HH:mm')}`;
    return format(date, 'MM月dd日', { locale: zhCN });
  };

  const getPriorityLabel = (p: string) => {
    switch(p) {
      case 'high': return '高优先级';
      case 'medium': return '中优先级';
      case 'low': return '低优先级';
      default: return '';
    }
  };

  const isMyTask = !todo.sourceId || todo.sourceId === peerId;
  const sourceName = todo.sourceName || (isMyTask ? '我自己' : '未知来源');

  return (
    <div className={cn(
      "group bg-white/90 rounded-2xl p-5 flex items-center justify-between shadow-card transition-all duration-300 relative overflow-hidden border border-white hover:-translate-y-1 hover:scale-[1.005] hover:shadow-card-hover hover:z-10",
      {
        'opacity-70 bg-white/60': todo.completed,
        'ring-2 ring-primary/20': isMyTask, // 自己的任务加边框
      }
    )}>
      {/* Priority Indicator Line */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1.5",
        {
          'bg-prio-high': todo.priority === 'high',
          'bg-prio-med': todo.priority === 'medium',
          'bg-prio-low': todo.priority === 'low',
          'bg-slate-300': todo.completed
        }
      )} />

      <div className="flex items-center gap-5 flex-1 pl-2">
        <label className={cn(
          "relative flex items-center group/check",
          isMyTask ? "cursor-pointer" : "cursor-not-allowed opacity-60"
        )}>
          <input 
            type="checkbox" 
            className="hidden" 
            checked={todo.completed}
            onChange={() => isMyTask && toggleTodo(todo.id)}
            disabled={!isMyTask}
          />
          <div className={cn(
            "w-6 h-6 border-2 border-slate-300 rounded-md transition-all duration-300 flex items-center justify-center text-white",
            isMyTask && "group-hover/check:border-primary",
            todo.completed && "bg-success border-success"
          )}>
             {todo.completed && <Check className="w-4 h-4" strokeWidth={3} />}
          </div>
        </label>

        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex items-center gap-3">
            <div className={cn(
              "text-lg font-semibold text-text-main transition-all duration-300",
              todo.completed && "line-through text-slate-400"
            )}>
              {todo.text}
            </div>
            
            {/* 来源标记 */}
            {!isMyTask && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-xs font-medium">
                <User className="w-3 h-3" />
                <span>{sourceName}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-[13px] text-text-sub">
            <span className={cn(
              "px-2.5 py-1 rounded-md text-xs font-semibold",
              {
                'bg-blue-50 text-blue-600': todo.category === '工作',
                'bg-green-50 text-green-600': todo.category === '生活',
                'bg-red-50 text-red-600': todo.category === '学习',
                'bg-slate-100 text-slate-600': !['工作', '生活', '学习'].includes(todo.category)
              }
            )}>
              {todo.category}
            </span>
            {todo.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(todo.dueDate)}
              </span>
            )}
            <span 
              className="flex items-center gap-1 font-medium"
              style={{
                color: todo.priority === 'high' ? 'var(--high-prio)' : 
                       todo.priority === 'medium' ? 'var(--med-prio)' : 
                       todo.priority === 'low' ? 'var(--low-prio)' : 'inherit'
              }}
            >
              <Flag className="w-3.5 h-3.5 fill-current" />
              {getPriorityLabel(todo.priority)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* 只有自己的任务才能删除 */}
        {isMyTask && (
          <button
            onClick={() => deleteTodo(todo.id)}
            className="w-9 h-9 rounded-[10px] border-none bg-red-50 text-red-400 cursor-pointer flex items-center justify-center text-lg transition-all duration-300 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
