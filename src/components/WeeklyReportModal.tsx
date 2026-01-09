import { useState, useMemo } from 'react';
import { useTodos } from '../context/TodoContext';
import { X, Copy, Check, FileText } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval, addWeeks, isAfter } from 'date-fns';
import { cn } from '../lib/utils';

interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WeeklyReportModal({ isOpen, onClose }: WeeklyReportModalProps) {
  const { todos } = useTodos();
  const [copied, setCopied] = useState(false);

  const reportContent = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const nextWeekStart = startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });
    const nextWeekEnd = endOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });

    // 1. 本周已完成 (Completed this week)
    // 逻辑：状态为已完成，且 (创建时间在本周 OR 截止时间在本周 OR 无截止时间)
    // 由于没有 completedAt，我们尽量展示相关的。
    // 简单起见：展示所有已完成的任务中，属于本周关注范围的（截止时间在本周或之前，或者本周创建的）
    const completedTasks = todos.filter(t => {
      if (!t.completed) return false;
      const createdDate = new Date(t.createdAt);
      const dueDate = t.dueDate ? new Date(t.dueDate) : null;

      const isCreatedThisWeek = isWithinInterval(createdDate, { start: weekStart, end: weekEnd });
      const isDueThisWeek = dueDate && isWithinInterval(dueDate, { start: weekStart, end: weekEnd });

      // 如果没有截止日期，且已完成，且是本周创建的 -> 算本周
      // 如果有截止日期，且截止日期在本周 -> 算本周
      return isCreatedThisWeek || isDueThisWeek;
    });

    // 2. 本周进行中 (In Progress)
    const inProgressTasks = todos.filter(t => {
      if (t.completed) return false;
      const createdDate = new Date(t.createdAt);
      const dueDate = t.dueDate ? new Date(t.dueDate) : null;

      // 本周创建的，或者截止日期在本周的，或者截止日期已过但未完成的
      const isCreatedThisWeek = isWithinInterval(createdDate, { start: weekStart, end: weekEnd });
      const isDueThisWeekOrBefore = dueDate && (isWithinInterval(dueDate, { start: weekStart, end: weekEnd }) || dueDate < weekStart);

      return isCreatedThisWeek || isDueThisWeekOrBefore;
    });

    // 3. 下周计划 (Next Week Plan)
    const nextWeekTasks = todos.filter(t => {
      if (t.completed) return false;
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      return isWithinInterval(dueDate, { start: nextWeekStart, end: nextWeekEnd }) || isAfter(dueDate, nextWeekEnd);
    });

    // 4. 生成文本
    const dateRangeStr = `${format(weekStart, 'MM.dd')} - ${format(weekEnd, 'MM.dd')}`;

    let content = `# 📝 周报 (${dateRangeStr})\n\n`;

    content += `## ✅ 本周完成\n`;
    if (completedTasks.length > 0) {
      completedTasks.forEach(t => content += `- ${t.text} \n`);
    } else {
      content += `- (暂无已完成事项)\n`;
    }
    content += `\n`;

    content += `## 🚧 进行中 / 待办\n`;
    if (inProgressTasks.length > 0) {
      inProgressTasks.forEach(t => {
        const priorityIcon = t.priority === 'high' ? '🔥' : t.priority === 'medium' ? '⚡' : '🌱';
        content += `- [${priorityIcon}] ${t.text} ${t.dueDate ? `(截止: ${t.dueDate})` : ''}\n`;
      });
    } else {
      content += `- (暂无进行中事项)\n`;
    }
    content += `\n`;

    content += `## 📅 下周计划\n`;
    if (nextWeekTasks.length > 0) {
      nextWeekTasks.forEach(t => content += `- ${t.text} (${t.dueDate})\n`);
    } else {
      content += `- (暂无具体计划)\n`;
    }

    content += `\n`;
    const completionRate = (completedTasks.length + inProgressTasks.length) > 0
      ? Math.round((completedTasks.length / (completedTasks.length + inProgressTasks.length)) * 100)
      : 0;
    content += `**📊 本周完成率**: ${completionRate}%`;

    return content;
  }, [todos]);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-[24px] shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 border border-white/50">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">生成周报</h2>
              <p className="text-sm text-gray-500">自动汇总本周工作进展</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="bg-slate-50 rounded-xl p-5 font-mono text-sm text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-100 shadow-inner">
            {reportContent}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white/50 rounded-b-[24px]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            关闭
          </button>
          <button
            onClick={handleCopy}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-200 flex items-center gap-2",
              copied
                ? "bg-green-500 shadow-green-500/30"
                : "bg-gray-900 hover:bg-gray-800 shadow-gray-900/30 hover:-translate-y-0.5"
            )}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制周报
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
