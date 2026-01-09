import { usePeer } from '../context/PeerContext';
import { useTodos } from '../context/TodoContext';
import { Users, User, LayoutGrid, ArrowUp, Wifi, WifiOff } from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar() {
  const { peerId, reporters, hostInfo, isConnected, getUserName } = usePeer();
  const { todos, filterSource, setFilterSource } = useTodos();

  const myName = getUserName();
  const allCount = todos.length;
  const myTodos = todos.filter(t => !t.sourceId || t.sourceId === peerId);
  const myCount = myTodos.length;

  // 按 sourceName 分组统计
  const reporterStats = reporters.map(r => ({
    ...r,
    count: todos.filter(t => t.sourceId === r.id).length
  }));

  return (
    <div className="w-64 flex-shrink-0 space-y-6">
      {/* 我的信息 */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-soft">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center text-white">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-800 truncate">{myName}</div>
            <div className="text-xs text-gray-400 font-mono truncate">{peerId?.slice(0, 12)}...</div>
          </div>
        </div>
      </div>

      {/* 上级连接状态 */}
      {hostInfo && (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-3">
            <ArrowUp className="w-4 h-4 text-blue-500" />
            <span>我的上级</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              hostInfo.isOnline ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
            )}>
              {hostInfo.isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-700 truncate">
                {hostInfo.isOnline ? '已连接' : '已断开'}
              </div>
              <div className="text-xs text-gray-400 font-mono truncate">{hostInfo.id.slice(0, 12)}...</div>
            </div>
          </div>
        </div>
      )}

      {/* 汇报人列表 */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-soft">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-3">
          <Users className="w-4 h-4 text-primary" />
          <span>任务来源</span>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {/* 全部 */}
          <button
            onClick={() => setFilterSource(null)}
            className={cn(
              "w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-sm",
              filterSource === null
                ? "bg-primary-gradient text-white shadow-md"
                : "bg-slate-50 hover:bg-slate-100 text-gray-600"
            )}
          >
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              <span className="font-medium">全部任务</span>
            </div>
            <span className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-md",
              filterSource === null ? "bg-white/20" : "bg-white"
            )}>
              {allCount}
            </span>
          </button>

          {/* 我自己 */}
          <button
            onClick={() => setFilterSource(peerId)}
            className={cn(
              "w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-sm",
              filterSource === peerId
                ? "bg-primary-gradient text-white shadow-md"
                : "bg-slate-50 hover:bg-slate-100 text-gray-600"
            )}
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" />
              <span className="font-medium">我自己</span>
            </div>
            <span className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-md",
              filterSource === peerId ? "bg-white/20" : "bg-white"
            )}>
              {myCount}
            </span>
          </button>

          {/* 汇报人 */}
          {reporterStats.map(reporter => (
            <button
              key={reporter.id}
              onClick={() => setFilterSource(reporter.id)}
              className={cn(
                "w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-sm",
                filterSource === reporter.id
                  ? "bg-primary-gradient text-white shadow-md"
                  : "bg-slate-50 hover:bg-slate-100 text-gray-600"
              )}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="relative">
                  <User className="w-4 h-4" />
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white",
                    reporter.isOnline ? "bg-green-500" : "bg-gray-300"
                  )} />
                </div>
                <span className="font-medium truncate">{reporter.name}</span>
              </div>
              <span className={cn(
                "text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0",
                filterSource === reporter.id ? "bg-white/20" : "bg-white"
              )}>
                {reporter.count}
              </span>
            </button>
          ))}

          {reporterStats.length === 0 && (
            <div className="text-center py-4 text-gray-400 text-xs">
              暂无汇报人连接
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
