import { useState } from 'react';

import { invoke } from '@tauri-apps/api/core';
import { CheckCircle2, Loader2, MonitorSmartphone, ShieldCheck, XCircle } from 'lucide-react';

import { Button, Input, Label } from '@repo/ui';

export default function App() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'pairing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handlePair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) return;

    setStatus('pairing');
    setMessage('');

    try {
      await invoke('pair_agent', { code });
      setStatus('success');
      setMessage('Liên kết thiết bị thành công. Agent đã sẵn sàng nhận lệnh từ Web App.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.toString());
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0c] overflow-hidden selection:bg-primary/30">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen opacity-50"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Logo / Header Area */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative flex items-center justify-center w-20 h-20 mb-6 rounded-2xl glass shadow-[0_0_40px_rgba(37,99,235,0.15)] group">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <MonitorSmartphone className="w-9 h-9 text-primary relative z-10 drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">WorkFlow Agent</h1>
          <p className="text-neutral-400 text-sm max-w-[280px] leading-relaxed">
            Cầu nối bảo mật giữa trình duyệt và không gian làm việc trên máy tính của bạn.
          </p>
        </div>

        {/* Main Card */}
        <div className="glass-card rounded-2xl p-8 transition-all duration-300 hover:shadow-[0_8px_40px_-12px_rgba(37,99,235,0.2)]">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in zoom-in duration-500">
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Sẵn Sàng Hoạt Động</h3>
              <p className="text-sm text-neutral-400 leading-relaxed max-w-[250px] mx-auto mb-6">
                {message}
              </p>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs font-medium text-green-400 uppercase tracking-wider">
                  Đang chạy ngầm
                </span>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handlePair}
              className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="code" className="text-sm font-medium text-neutral-300">
                    Mã ghép nối (Pairing Code)
                  </Label>
                  <ShieldCheck className="w-4 h-4 text-primary/70" />
                </div>
                <Input
                  id="code"
                  type="text"
                  placeholder="------"
                  className="h-14 text-center text-3xl font-mono tracking-[0.3em] uppercase bg-black/40 border-white/10 text-white placeholder:text-neutral-700 focus-visible:ring-primary/50 focus-visible:border-primary/50 rounded-xl transition-all shadow-inner"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  disabled={status === 'pairing'}
                  autoFocus
                />
              </div>

              {status === 'error' && (
                <div className="flex items-start gap-3 text-sm text-red-200 bg-red-950/40 border border-red-900/50 p-4 rounded-xl animate-in fade-in slide-in-from-top-2">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{message}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all disabled:opacity-50 disabled:hover:shadow-none"
                disabled={status === 'pairing' || code.length < 6}
              >
                {status === 'pairing' ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Đang thiết lập kết nối...
                  </>
                ) : (
                  'Kết Nối Thiết Bị'
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-neutral-600 mt-8 font-medium">
          WorkFlow Hub Agent v0.1.0 • Chạy ngầm an toàn
        </p>
      </div>
    </main>
  );
}
