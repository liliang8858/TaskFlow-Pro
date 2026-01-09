import { useTodos } from '../context/TodoContext';
import { usePeer } from '../context/PeerContext';
import { Users, User, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/utils';

export function ReporterList() {
    const { todos, filterSource, setFilterSource } = useTodos();
    const { peerId } = usePeer();

    // Calculate stats
    const allCount = todos.length;
    
    // Get unique source IDs, excluding undefined/null
    const sources = Array.from(new Set(todos.map(t => t.sourceId))).filter(Boolean) as string[];
    
    // Sort sources: put peerId (myself) first, then others
    const sortedSources = sources.sort((a, b) => {
        if (a === peerId) return -1;
        if (b === peerId) return 1;
        return a.localeCompare(b);
    });

    const reporters = sortedSources.map(id => ({
        id,
        name: id === peerId ? '我自己' : id,
        isMe: id === peerId,
        count: todos.filter(t => t.sourceId === id).length
    }));

    // If "myself" is not in the list (no tasks yet), we might want to show it? 
    // But sticking to data-driven is safer.

    return (
        <div className="space-y-4">
             <div className="flex items-center gap-2 text-lg font-bold text-gray-700 px-1">
                <Users className="w-5 h-5 text-primary" />
                <h2>汇报人列表</h2>
             </div>
             
             <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
                <button
                    onClick={() => setFilterSource(null)}
                    className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-sm",
                        filterSource === null 
                            ? "bg-primary-gradient text-white shadow-lg shadow-primary/30 transform scale-[1.02]" 
                            : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-100 hover:border-slate-200 shadow-sm"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <LayoutGrid className="w-4 h-4" />
                        <span className="font-bold">全部任务</span>
                    </div>
                    <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-md",
                        filterSource === null ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    )}>
                        {allCount}
                    </span>
                </button>

                {reporters.map(reporter => (
                     <button
                        key={reporter.id}
                        onClick={() => setFilterSource(reporter.id)}
                        className={cn(
                            "w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-sm",
                            filterSource === reporter.id 
                                ? "bg-primary-gradient text-white shadow-lg shadow-primary/30 transform scale-[1.02]" 
                                : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-100 hover:border-slate-200 shadow-sm"
                        )}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <User className={cn("w-4 h-4 flex-shrink-0", reporter.isMe && "text-amber-300")} />
                            <div className="flex flex-col items-start overflow-hidden">
                                <span className="font-bold truncate w-full text-left" title={reporter.id}>
                                    {reporter.isMe ? '我自己' : `汇报人 ${reporter.id.slice(0, 4)}...`}
                                </span>
                                {!reporter.isMe && (
                                    <span className="text-[10px] opacity-70 font-mono truncate w-full text-left">
                                        {reporter.id}
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0 ml-2",
                            filterSource === reporter.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                        )}>
                            {reporter.count}
                        </span>
                    </button>
                ))}
                
                {reporters.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        暂无汇报数据
                    </div>
                )}
             </div>
        </div>
    );
}
