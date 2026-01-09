import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TodoProvider } from './context/TodoContext';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { Stats } from './components/Stats';
import { Header } from './components/Header';
import { PeerProvider, usePeer } from './context/PeerContext';
import { Copy, Wifi } from 'lucide-react';

function DisplayModeContent() {
  const { peerId, connectionsCount } = usePeer();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (peerId) {
      navigator.clipboard.writeText(peerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 md:px-6 max-w-5xl mx-auto font-sans">
      <header className="mb-10 text-center relative">
        <h1 className="text-[32px] font-bold bg-primary-gradient bg-clip-text text-transparent tracking-tighter">
          TaskFlow Pro <span className="text-base font-normal text-text-sub ml-2 opacity-70">汇报概览</span>
        </h1>

        {/* Connection Info Card */}
        <div className="mt-6 bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-soft max-w-md mx-auto animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex flex-col items-center gap-4">
            <div className="text-sm font-semibold text-text-sub uppercase tracking-wider flex items-center gap-2">
              <Wifi className={`w-4 h-4 ${connectionsCount > 0 ? 'text-green-500' : 'text-gray-400'}`} />
              {connectionsCount > 0 ? `${connectionsCount} 个汇报人已连接` : '等待汇报人连接...'}
            </div>

            {peerId ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="bg-white p-2 rounded-xl shadow-inner border border-slate-100">
                  <QRCodeSVG value={peerId} size={160} />
                </div>
                <div className="flex items-center gap-2 w-full">
                  <div className="flex-1 bg-slate-100 p-2.5 rounded-lg text-xs font-mono text-center text-slate-600 truncate border border-slate-200">
                    {peerId}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="p-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
                    title="复制连接码"
                  >
                    {copied ? <span className="text-green-500 font-bold text-xs">已复制</span> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-text-sub text-center">
                  请下级点击"连接汇报对象"，扫描二维码或输入上方ID进行汇报
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-text-sub">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                正在生成连接码...
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Stats />
        <div className="grid grid-cols-1 gap-8">
          <TodoList />
        </div>
      </div>
    </div>
  );
}

function NormalModeContent() {
  return (
    <div className="min-h-screen py-8 px-4 md:px-6 max-w-5xl mx-auto font-sans">
      <Header />
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Stats />
        <div className="grid grid-cols-1 gap-8">
          <TodoInput />
          <TodoList />
        </div>
      </div>
      <footer className="mt-20 py-8 text-center text-sm text-text-sub opacity-70">
        <p>&copy; {new Date().getFullYear()} TaskFlow Pro. Created with ❤️ by Trae.</p>
      </footer>
    </div>
  );
}

function App() {
  const [isDisplayMode, setIsDisplayMode] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('mode') === 'display') {
      setIsDisplayMode(true);
    }
  }, []);

  return (
    <TodoProvider>
      <PeerProvider>
        {isDisplayMode ? <DisplayModeContent /> : <NormalModeContent />}
      </PeerProvider>
    </TodoProvider>
  );
}

export default App;
