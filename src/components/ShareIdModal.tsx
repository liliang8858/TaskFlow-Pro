import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, X, Wifi } from 'lucide-react';
import { usePeer } from '../context/PeerContext';

interface ShareIdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareIdModal({ isOpen, onClose }: ShareIdModalProps) {
  const { peerId, connectionsCount } = usePeer();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (peerId) {
        navigator.clipboard.writeText(peerId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[24px] shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-white/50 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">接收汇报</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
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
      </div>
    </div>
  );
}
