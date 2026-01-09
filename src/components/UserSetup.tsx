import { useState, useEffect } from 'react';
import { User, ArrowRight } from 'lucide-react';

interface UserSetupProps {
  onComplete: (name: string) => void;
}

export function UserSetup({ onComplete }: UserSetupProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('taskflow_user_name');
    if (savedName) {
      onComplete(savedName);
    }
  }, [onComplete]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName) {
      localStorage.setItem('taskflow_user_name', trimmedName);
      onComplete(trimmedName);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary-gradient flex items-center justify-center shadow-lg shadow-primary/30">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">欢迎使用 TaskFlow Pro</h1>
          <p className="text-gray-500 mt-2">请输入您的名称以开始使用</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              您的名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：张三"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-3 rounded-xl font-bold text-white bg-primary-gradient shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            开始使用
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
