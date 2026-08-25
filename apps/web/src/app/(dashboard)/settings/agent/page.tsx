'use client';

import React, { useState } from 'react';

import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Loader2, MonitorSmartphone } from 'lucide-react';
import { toast } from 'sonner';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';

import { useAgentDevices, useRevokeDevice } from '@/features/agent/hooks/use-agent-devices';
import { usePairing } from '@/features/agent/hooks/use-pairing';

export default function AgentSettingsPage(): React.ReactElement {
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const { mutate: generateCode, isPending } = usePairing();

  const { data: devices, isLoading: isDevicesLoading } = useAgentDevices();
  const { mutate: revokeDevice, isPending: isRevoking } = useRevokeDevice();

  const handleGenerate = (): void => {
    generateCode(undefined, {
      onSuccess: (data) => {
        setPairingCode(data.code);
        setCountdown(data.expiresIn);
        toast.success('Pairing code generated successfully');

        // Simple countdown
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setPairingCode(null);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to generate code');
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Desktop Agent</h1>
        <p className="text-muted-foreground mt-2">
          Kết nối Desktop Agent để cho phép DevFlow Hub điều khiển và mở các dự án local trực tiếp
          trên máy tính của bạn.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MonitorSmartphone className="w-5 h-5" />
            Connect New Device
          </CardTitle>
          <CardDescription>
            Tạo một mã kết nối (Pairing Code) dùng một lần để liên kết Desktop Agent với tài khoản
            này.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!pairingCode ? (
            <Button onClick={handleGenerate} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Pairing Code
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted p-6 rounded-lg text-center">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Nhập mã này vào Desktop Agent của bạn
                </p>
                <p className="text-5xl font-mono tracking-[0.2em] font-bold text-primary">
                  {pairingCode}
                </p>
                <p className="text-sm text-destructive mt-4">
                  Mã sẽ hết hạn sau {Math.floor(countdown / 60)}:
                  {(countdown % 60).toString().padStart(2, '0')} phút
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setPairingCode(null);
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Devices</CardTitle>
          <CardDescription>
            Danh sách các Desktop Agent đang được kết nối với tài khoản này.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isDevicesLoading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : devices && devices.length > 0 ? (
            <div className="space-y-4">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card"
                >
                  <div>
                    <p className="font-medium text-foreground">{device.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ID: {device.deviceId.substring(0, 8)}... • Hoạt động:{' '}
                      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
                      {formatDistanceToNow(new Date(device.lastSeen), {
                        addSuffix: true,
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        locale: vi,
                      })}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      revokeDevice(device.deviceId);
                    }}
                    disabled={isRevoking}
                  >
                    Xóa liên kết
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Chưa có thiết bị nào được kết nối.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
