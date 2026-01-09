import { useState } from 'react';
import { CheckSquare, FileText, Monitor, Smartphone } from 'lucide-react';
import { WeeklyReportModal } from './WeeklyReportModal';
import { ConnectModal } from './ConnectModal';
import { ShareIdModal } from './ShareIdModal';

export function Header() {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  return (
    <>
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 md:gap-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-gradient rounded-[14px] flex items-center justify-center text-white text-2xl shadow-[0_10px_20px_rgba(118,75,162,0.3)]">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h1 className="text-[28px] font-bold bg-primary-gradient bg-clip-text text-transparent tracking-tighter">
            TaskFlow Pro
          </h1>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <button 
              onClick={() => setIsConnectOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-text-main text-sm font-semibold shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 border border-transparent hover:border-slate-100 cursor-pointer"
              title="连接汇报对象"
          >
              <Smartphone className="w-4 h-4 text-purple-500" />
              <span className="hidden sm:inline">连接汇报对象</span>
          </button>

          <button 
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-text-main text-sm font-semibold shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 border border-transparent hover:border-slate-100 cursor-pointer"
              title="接收汇报"
          >
              <Monitor className="w-4 h-4 text-blue-500" />
              <span className="hidden sm:inline">接收汇报</span>
          </button>

          <button 
              onClick={() => setIsReportOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-text-main text-sm font-semibold shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 border border-transparent hover:border-slate-100 cursor-pointer"
          >
              <FileText className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline">生成周报</span>
              <span className="sm:hidden">周报</span>
          </button>

          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
            <span className="font-semibold text-text-main text-sm hidden sm:inline">Alexander</span>
            <div className="w-9 h-9 rounded-full bg-slate-200 bg-[url('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100')] bg-cover" />
          </div>
        </div>
      </header>

      <WeeklyReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
      <ConnectModal isOpen={isConnectOpen} onClose={() => setIsConnectOpen(false)} />
      <ShareIdModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </>
  );
}
