import { useState } from 'react';

import { invoke } from '@tauri-apps/api/core';
import { CheckCircle2, Loader2, MonitorSmartphone, XCircle } from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@repo/ui';

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
      setMessage('Kết nối Agent thành công! Bạn có thể khởi chạy tài nguyên từ trình duyệt.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.toString());
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-neutral-800 bg-neutral-900 text-neutral-100">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
            <MonitorSmartphone className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">DevFlow Hub Agent</CardTitle>
          <CardDescription className="text-neutral-400">
            Liên kết thiết bị này với tài khoản DevFlow Hub để khởi chạy tài nguyên local.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center space-y-4 text-center pb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-2" />
              <h3 className="text-xl font-medium text-neutral-100">Kết nối thành công</h3>
              <p className="text-sm text-neutral-400">{message}</p>
            </div>
          ) : (
            <form onSubmit={handlePair} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-neutral-200">
                  Mã kết nối
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Nhập mã 6 chữ số"
                  className="text-center text-2xl tracking-widest bg-neutral-950 border-neutral-800 text-neutral-100 placeholder:text-neutral-700"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  disabled={status === 'pairing'}
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-md">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <p>{message}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                disabled={status === 'pairing' || code.length < 6}
              >
                {status === 'pairing' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang kết nối...
                  </>
                ) : (
                  'Kết nối thiết bị'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
