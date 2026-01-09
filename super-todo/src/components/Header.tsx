import { CheckSquare } from 'lucide-react';

export function Header() {
  return (
    <header className="flex justify-between items-center mb-10">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary-gradient rounded-[14px] flex items-center justify-center text-white text-2xl shadow-[0_10px_20px_rgba(118,75,162,0.3)]">
          <CheckSquare className="w-6 h-6" />
        </div>
        <h1 className="text-[28px] font-bold bg-primary-gradient bg-clip-text text-transparent tracking-tighter">
          TaskFlow Pro
        </h1>
      </div>
      <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <span className="font-semibold text-text-main text-sm">Alexander</span>
        <div className="w-9 h-9 rounded-full bg-slate-200 bg-[url('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100')] bg-cover" />
      </div>
    </header>
  );
}
