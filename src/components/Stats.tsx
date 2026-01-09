import { useTodos } from '../context/TodoContext';
import { Layers, Clock, CheckCircle2, PieChart } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatCardProps {
  type: 'total' | 'pending' | 'done' | 'rate';
  icon: React.ReactNode;
  title: string;
  value: string | number;
  layout?: 'horizontal' | 'vertical' | 'clover';
  children?: React.ReactNode;
}

function StatCard({ type, icon, title, value, layout = 'horizontal', children }: StatCardProps) {
  const isClover = layout === 'clover';
  
  return (
    <div className={cn(
      "rounded-[20px] p-6 text-white relative overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:-translate-y-1 flex flex-col justify-between",
      isClover ? "h-24 p-4" : "h-40",
      {
        'bg-stat-total': type === 'total',
        'bg-stat-pending': type === 'pending',
        'bg-stat-done text-[#1a5c48]': type === 'done',
        'bg-stat-rate': type === 'rate',
      }
    )}>
      <div className="flex justify-between items-start z-[2]">
        <div className={cn(
          "bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-[5px]",
          isClover ? "text-lg w-8 h-8" : "text-2xl w-11 h-11"
        )}>
          {icon}
        </div>
      </div>
      <div className="relative z-[2]">
        <h3 className={cn(
          "opacity-90 font-medium mb-2",
          isClover ? "text-xs" : "text-base"
        )}>{title}</h3>
        <div className={cn(
          "font-bold leading-none",
          isClover ? "text-xl" : "text-4xl"
        )}>{value}</div>
      </div>
      {children}
    </div>
  );
}

export function Stats({ layout = 'horizontal' }: { layout?: 'horizontal' | 'vertical' | 'clover' }) {
  const { todos } = useTodos();

  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const active = total - completed;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  // SVG parameters for circle progress
  const strokeDasharray = `${completionRate}, 100`;

  const getGridClass = () => {
    switch (layout) {
      case 'vertical':
        return "grid-cols-1";
      case 'clover':
        return "grid-cols-2 gap-3";
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    }
  };

  return (
    <div className={cn(
      "grid gap-4 mb-10 transition-all",
      getGridClass()
    )}>
      <StatCard
        type="total"
        icon={<Layers className="w-6 h-6" />}
        title="总任务数"
        value={total}
        layout={layout}
      />
      <StatCard
        type="pending"
        icon={<Clock className="w-6 h-6" />}
        title="待处理"
        value={active}
        layout={layout}
      />
      <StatCard
        type="done"
        icon={<CheckCircle2 className="w-6 h-6" />}
        title="已完成"
        value={completed}
        layout={layout}
      />
      <StatCard
        type="rate"
        icon={<PieChart className="w-6 h-6" />}
        title="完成率"
        value={`${completionRate}%`}
        layout={layout}
      >
        {layout !== 'clover' && (
          <div className="absolute right-5 bottom-5 w-20 h-20">
            <svg viewBox="0 0 36 36" className="block mx-auto max-w-full max-h-full">
              <path
                className="fill-none stroke-white/30 stroke-[3.8]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="fill-none stroke-[3.8] stroke-linecap-round stroke-white animate-[progress_1s_ease-out_forwards]"
                strokeDasharray={strokeDasharray}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="fill-white font-bold text-[0.5em] text-center anchor-middle" textAnchor="middle">
                {completionRate}%
              </text>
            </svg>
          </div>
        )}
      </StatCard>
    </div>
  )
}
