import { cn } from '../lib/utils';

interface FilterBarProps {
  filter: 'all' | 'active' | 'completed';
  setFilter: (filter: 'all' | 'active' | 'completed') => void;
  categoryFilter: string | null;
  setCategoryFilter: (category: string | null) => void;
  categories: string[];
}

export function FilterBar({ 
  filter, 
  setFilter, 
  categoryFilter, 
  setCategoryFilter, 
  categories 
}: FilterBarProps) {
  const predefinedCategories = ['工作', '学习', '生活'];
  // Combine predefined with existing to ensure all show up, remove duplicates
  const allCategories = Array.from(new Set([...predefinedCategories, ...categories]));

  return (
    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
      <div className="bg-white/60 p-1.5 rounded-xl flex gap-1">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-6 py-2.5 rounded-lg border-none bg-transparent text-text-sub font-semibold text-sm cursor-pointer transition-all duration-300",
              filter === f && "bg-white text-primary shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
            )}
          >
            {f === 'all' ? '全部' : f === 'active' ? '进行中' : '已完成'}
          </button>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
            onClick={() => setCategoryFilter(null)}
            className={cn(
              "px-4 py-2 rounded-[20px] text-[13px] font-medium cursor-pointer border border-transparent transition-all duration-300 bg-white/50 text-text-sub hover:bg-white hover:border-slate-200 hover:text-text-main hover:-translate-y-0.5 flex items-center gap-1.5",
              categoryFilter === null && "bg-white border-slate-200 text-text-main -translate-y-0.5"
            )}
        >
            <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
            所有
        </button>
        {allCategories.map(cat => (
            <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                "px-4 py-2 rounded-[20px] text-[13px] font-medium cursor-pointer border border-transparent transition-all duration-300 bg-white/50 text-text-sub hover:bg-white hover:border-slate-200 hover:text-text-main hover:-translate-y-0.5 flex items-center gap-1.5",
                categoryFilter === cat && "bg-white border-slate-200 text-text-main -translate-y-0.5"
                )}
            >
                <span 
                    className="w-2 h-2 rounded-full inline-block" 
                    style={{ 
                        backgroundColor: 
                            cat === '工作' ? '#3182ce' : 
                            cat === '学习' ? '#e53e3e' : 
                            cat === '生活' ? '#38a169' : '#a0aec0' 
                    }}
                />
                {cat}
            </button>
        ))}
      </div>
    </div>
  );
}
