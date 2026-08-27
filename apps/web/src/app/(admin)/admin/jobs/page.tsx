'use client';

import * as React from 'react';

import { useQuery } from '@tanstack/react-query';
import { Activity, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@repo/ui';

import { FadeIn } from '@/components/animations/fade-in';
import { adminApi } from '@/features/admin/services/admin.api';

interface StatCardProps {
  title: string;
  icon: React.ReactNode;
  value?: number | undefined;
  isLoading: boolean;
}

function StatCard({ title, icon, value, isLoading }: StatCardProps): React.ReactNode {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value ?? 0}</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminJobsPage(): React.ReactNode {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'queue-stats'],
    queryFn: adminApi.getQueueStats,
    refetchInterval: 15000, // auto-refresh every 15s
    refetchIntervalInBackground: false,
  });

  if (isError) {
    return (
      <div className="flex flex-col h-full w-full p-6 items-center justify-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
        <h2 className="text-xl font-bold">Lỗi tải dữ liệu Queue</h2>
        <Button
          className="mt-4"
          onClick={() => {
            void refetch();
          }}
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <FadeIn className="flex flex-col h-full w-full p-6 bg-slate-50/50">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Background Jobs</h1>
          <p className="text-muted-foreground mt-1">
            Giám sát tiến trình các luồng xử lý nền (BullMQ)
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            void refetch();
          }}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Làm mới
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Đang chờ (Waiting)"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          value={data?.counts.waiting}
          isLoading={isLoading}
        />
        <StatCard
          title="Đang chạy (Active)"
          icon={<Activity className="h-4 w-4 text-blue-500" />}
          value={data?.counts.active}
          isLoading={isLoading}
        />
        <StatCard
          title="Hoàn thành (Completed)"
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
          value={data?.counts.completed}
          isLoading={isLoading}
        />
        <StatCard
          title="Thất bại (Failed)"
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
          value={data?.counts.failed}
          isLoading={isLoading}
        />
      </div>

      <h2 className="text-xl font-bold mb-4">Lỗi gần đây (Failed Jobs)</h2>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : data?.jobs.failed && data.jobs.failed.length > 0 ? (
            <div className="divide-y">
              {data.jobs.failed.map((job) => (
                <div key={job.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-red-600">
                      {job.name} (ID: {job.id})
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(job.timestamp).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {job.failedReason ?? 'Không rõ lý do'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Không có Job nào bị lỗi trong hàng đợi.
            </div>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  );
}
