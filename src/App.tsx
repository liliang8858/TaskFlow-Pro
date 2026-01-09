import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { TodoProvider } from './context/TodoContext';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { Stats } from './components/Stats';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { UserSetup } from './components/UserSetup';
import { PeerProvider, usePeer } from './context/PeerContext';
import { Copy, Wifi } from 'lucide-react';

function DisplayModeContent() {
  const { peerId, reporters } = usePeer();
  const [copied, setCopied] = useState(false);

  const onlineCount = reporters.filter(r => r.isOnline).length;

  const handleCopy = () => {
    if (peerId) {
      navigator.clipboard.writeText(peerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen py-6 px-4 md:px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-[28px] font-bold bg-primary-gradient bg-clip-text text-transparent tracking-tighter">
            TaskFlow Pro <span className="text-base font-normal text-text-sub ml-2 opacity-70">汇报概览</span>
          </h1>
        </header>

        {/* Main Layout: Sidebar + Content + Stats */}
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <Sidebar />

          {/* Center: Todo List */}
          <div className="flex-1 min-w-0">
            <TodoList />
          </div>

          {/* Right: Stats + QR Code */}
          <div className="w-72 flex-shrink-0 space-y-4">
            {/* Connection Card */}
            <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-4 shadow-soft">
              <div className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <Wifi className={`w-4 h-4 ${onlineCount > 0 ? 'text-green-500' : 'text-gray-400'}`} />
                {onlineCount > 0 ? `${onlineCount} 人在线` : '等待连接...'}
              </div>

              {peerId && (
                <div className="space-y-3">
                  <div className="bg-white p-2 rounded-xl shadow-inner border border-slate-100 flex justify-center">
                    <QRCodeSVG value={peerId} size={120} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 p-2 rounded-lg text-xs font-mono text-center text-slate-600 truncate">
                      {peerId}
                    </div>
                    <button
                      onClick={handleCopy}
                      className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      {copied ? <span className="text-green-500 text-xs">✓</span> : <Copy className="w-4 h-4 text-gray-500" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <Stats layout="clover" />
          </div>
        </div>
      </div>
    </div>
  );
}

function NormalModeContent() {
  const { peerId, reporters, hostInfo, isConnected } = usePeer();
  const [copied, setCopied] = useState(false);

  const onlineCount = reporters.filter(r => r.isOnline).length;

  const handleCopy = () => {
    if (peerId) {
      navigator.clipboard.writeText(peerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen py-6 px-4 md:px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <Header />

        {/* Main Layout */}
        <div className="flex gap-6 mt-6">
          {/* Left Sidebar */}
          <Sidebar />

          {/* Center: Input + Todo List */}
          <div className="flex-1 min-w-0 space-y-6">
            <TodoInput />
            <TodoList />
          </div>

          {/* Right: Stats + QR Code */}
          <div className="w-72 flex-shrink-0 space-y-4">
            {/* Connection Card */}
            <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-4 shadow-soft">
              <div className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <Wifi className={`w-4 h-4 ${onlineCount > 0 ? 'text-green-500' : 'text-gray-400'}`} />
                {onlineCount > 0 ? `${onlineCount} 人在线` : '我的连接码'}
              </div>

              {peerId && (
                <div className="space-y-3">
                  <div className="bg-white p-2 rounded-xl shadow-inner border border-slate-100 flex justify-center">
                    <QRCodeSVG value={peerId} size={100} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 p-2 rounded-lg text-xs font-mono text-center text-slate-600 truncate">
                      {peerId.slice(0, 16)}...
                    </div>
                    <button
                      onClick={handleCopy}
                      className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      {copied ? <span className="text-green-500 text-xs">✓</span> : <Copy className="w-4 h-4 text-gray-500" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <Stats layout="clover" />
          </div>
        </div>

        <footer className="mt-12 py-6 text-center text-sm text-text-sub opacity-70">
          <p>&copy; {new Date().getFullYear()} TaskFlow Pro. Created with ❤️ by Trae.</p>
        </footer>
      </div>
    </div>
  );
}

function AppContent() {
  const [isDisplayMode, setIsDisplayMode] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('mode') === 'display') {
      setIsDisplayMode(true);
    }

    // 检查是否已设置名称
    const savedName = localStorage.getItem('taskflow_user_name');
    if (savedName) {
      setIsSetupComplete(true);
    }
  }, []);

  const handleSetupComplete = useCallback((name: string) => {
    setIsSetupComplete(true);
  }, []);

  if (!isSetupComplete) {
    return <UserSetup onComplete={handleSetupComplete} />;
  }

  return isDisplayMode ? <DisplayModeContent /> : <NormalModeContent />;
}

function App() {
  return (
    <TodoProvider>
      <PeerProvider>
        <AppContent />
      </PeerProvider>
    </TodoProvider>
  );
}

export default App;
