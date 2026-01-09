import { useState } from 'react';
import { X, Smartphone, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { usePeerSync } from '../hooks/usePeerSync';
import { cn } from '../lib/utils';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectModal({ isOpen, onClose }: ConnectModalProps) {
  const [hostId, setHostId] = useState('');
  const { connectToHost, isConnected, isReady } = usePeerSync(false); // false = isClient
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    if (!hostId.trim()) return;
    setIsConnecting(true);
    // Timeout to simulate connection delay or wait for callback
    connectToHost(hostId.trim());
    
    // In a real app, we'd wait for connection success event, 
    // but usePeerSync updates isConnected state.
    // We can just watch isConnected.
    
    // Reset loading state after 3 seconds if not connected (timeout)
    setTimeout(() => {
        if (!isConnected) {
            setIsConnecting(false);
        }
    }, 3000);
  };
  
  // Close automatically after success
  if (isConnected && isOpen) {
      setTimeout(() => {
          onClose();
          setIsConnecting(false);
          setHostId('');
      }, 1500);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[24px] shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-white/50 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-800">连接大屏</h2>
                <p className="text-sm text-gray-500">输入大屏显示的 ID 进行同步</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!isConnected ? (
              <>
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">大屏 ID</label>
                    <input 
                        type="text" 
                        value={hostId}
                        onChange={(e) => setHostId(e.target.value)}
                        placeholder="输入大屏 ID (例如: e8f9...)"
                        disabled={!isReady}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>
                {!isReady && (
                    <div className="text-xs text-amber-600 flex items-center gap-2 bg-amber-50 p-2 rounded-lg">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        正在初始化网络服务，请稍候...
                    </div>
                )}
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl text-xs flex gap-2">
                    <span className="font-bold">提示:</span>
                    大屏模式下会显示专属 ID 和二维码。此功能支持跨浏览器和跨设备同步。
                </div>
              </>
          ) : (
              <div className="flex flex-col items-center justify-center py-8 text-green-600 animate-in zoom-in duration-300">
                  <CheckCircle2 className="w-16 h-16 mb-4" />
                  <h3 className="text-xl font-bold">已成功连接!</h3>
                  <p className="text-gray-500 text-sm mt-1">数据正在实时同步中</p>
              </div>
          )}
        </div>

        {!isConnected && (
            <div className="p-6 border-t border-gray-100 bg-white/50">
            <button
                onClick={handleConnect}
                disabled={!hostId.trim() || isConnecting || !isReady}
                className={cn(
                "w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2",
                (!hostId.trim() || isConnecting || !isReady) ? "bg-slate-300 shadow-none cursor-not-allowed" : "bg-primary-gradient hover:shadow-primary/30 hover:-translate-y-0.5"
                )}
            >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    正在连接...
                  </>
                ) : (
                  <>
                    连接并同步
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
            </button>
            </div>
        )}
      </div>
    </div>
  );
}
