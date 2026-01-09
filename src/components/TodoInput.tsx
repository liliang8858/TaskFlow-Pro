import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useTodos, Priority } from '../context/TodoContext';
import { format } from 'date-fns';

export function TodoInput() {
  const { addTodo } = useTodos();
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('work');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    addTodo(text, priority, category === 'work' ? '工作' : category === 'study' ? '学习' : '生活', date || undefined);
    setText('');
    setIsExpanded(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node) && !text.trim()) {
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="bg-white/75 backdrop-blur-[20px] rounded-[20px] p-6 shadow-soft mb-8 border border-white/80 transition-all duration-300"
    >
      {!isExpanded ? (
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => setIsExpanded(true)}
        >
          <div className="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center text-white text-2xl shadow-[0_4px_15px_rgba(102,126,234,0.4)]">
            <Plus className="w-6 h-6" />
          </div>
          <div className="text-text-sub text-base flex-grow text-gray-400">
            准备做什么？例如：周五下午3点提交设计方案...
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col gap-2 w-full">
            <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide ml-1">创建新任务</label>
            <input
              type="text"
              className="w-full border-none bg-white/50 p-4 rounded-xl text-lg text-gray-800 outline-none transition-all focus:bg-white focus:shadow-[0_0_0_2px_#667eea] placeholder:text-gray-400"
              placeholder="准备做什么？例如：周五下午3点提交设计方案..."
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-end gap-4 w-full">
            <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
              <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide ml-1">优先级</label>
              <div className="relative">
                <select
                  className="appearance-none w-full bg-white border border-slate-200 px-4 py-3 rounded-[10px] text-sm text-gray-700 cursor-pointer focus:outline-none focus:border-primary pr-8"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                >
                  <option value="high">🔥 高优先级</option>
                  <option value="medium">⚡ 中优先级</option>
                  <option value="low">🌱 低优先级</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
              <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide ml-1">分类</label>
              <div className="relative">
                <select
                  className="appearance-none w-full bg-white border border-slate-200 px-4 py-3 rounded-[10px] text-sm text-gray-700 cursor-pointer focus:outline-none focus:border-primary pr-8"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="work">💼 工作</option>
                  <option value="study">📚 学习</option>
                  <option value="life">🏠 生活</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
              <label className="text-xs text-gray-500 font-semibold uppercase tracking-wide ml-1">截止日期</label>
              <input
                type="date"
                className="appearance-none w-full bg-white border border-slate-200 px-4 py-3 rounded-[10px] text-sm text-gray-700 cursor-pointer focus:outline-none focus:border-primary"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="bg-primary-gradient text-white border-none px-8 py-3 rounded-[10px] text-base font-semibold cursor-pointer shadow-[0_4px_15px_rgba(102,126,234,0.4)] transition-all duration-300 h-[46px] mb-[1px] flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(102,126,234,0.6)] active:translate-y-0"
            >
              <Plus className="w-5 h-5" />
              添加任务
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
