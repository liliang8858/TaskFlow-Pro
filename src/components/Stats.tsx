import { useTodos } from '../context/TodoContext';
import { Layers, Clock, CheckCircle2, PieChart } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatCardProps {
  type: 'total' | 'pending' | 'done' | 'rate';
  icon: React.ReactNode;
  title: string;
  value: string | number;
  children?: React.ReactNode;
}

function StatCard({ type, icon, title, value, children }: StatCardProps) {
  return (
    <div className={cn(
      "rounded-[20px] p-6 text-white relative overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:-translate-y-1 flex flex-col justify-between h-40",
      {
        'bg-stat-total': type === 'total',
        'bg-stat-pending': type === 'pending',
        'bg-stat-done text-[#1a5c48]': type === 'done',
        'bg-stat-rate': type === 'rate',
      }
    )}>
      <div className="flex justify-between items-start z-[2]">
        <div className="text-2xl bg-white/20 w-11 h-11 rounded-xl flex items-center justify-center backdrop-blur-[5px]">
          {icon}
        </div>
      </div>
      <div className="relative z-[2]">
        <h3 className="text-base opacity-90 font-medium mb-2">{title}</h3>
        <div className="text-4xl font-bold leading-none">{value}</div>
      </div>
      {children}
    </div>
  );
}

export function Stats({ layout = 'horizontal' }: { layout?: 'horizontal' | 'vertical' }) {
  const { todos } = useTodos();
  
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const active = total - completed;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  // SVG parameters for circle progress
  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${completionRate}, 100`;

  return (
    <div className={cn(
      "grid gap-4 mb-10 transition-all",
      layout === 'horizontal' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
    )}>
      <StatCard 
        type="total" 
        icon={<Layers className="w-6 h-6" />} 
        title="总任务数" 
        value={total} 
      />
      <StatCard 
        type="pending" 
        icon={<Clock className="w-6 h-6" />} 
        title="待处理" 
        value={active} 
      />
      <StatCard 
        type="done" 
        icon={<CheckCircle2 className="w-6 h-6" />} 
        title="已完成" 
        value={completed} 
      />
      <StatCard 
        type="rate" 
        icon={<PieChart className="w-6 h-6" />} 
        title="完成率" 
        value={`${completionRate}%`}
      >
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
      </StatCard>
    </div>
  )
}
