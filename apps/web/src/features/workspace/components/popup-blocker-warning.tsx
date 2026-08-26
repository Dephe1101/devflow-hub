import { AlertTriangle, ExternalLink, X } from 'lucide-react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';

import { SlideUp } from '@/components/animations/slide-up';

interface PopupBlockerWarningProps {
  blockedUrls: string[];
  onClear: () => void;
}

export function PopupBlockerWarning({
  blockedUrls,
  onClear,
}: PopupBlockerWarningProps): React.ReactElement | null {
  if (blockedUrls.length === 0) {
    return null;
  }

  return (
    <SlideUp duration={0.4}>
      <Card className="border-yellow-500/50 bg-yellow-500/10 shadow-sm">
        <CardHeader className="py-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <CardTitle className="text-sm font-semibold text-yellow-800 dark:text-yellow-500">
                  Phát hiện chặn Popup
                </CardTitle>
                <CardDescription className="text-yellow-700 dark:text-yellow-400/80 mt-1">
                  Trình duyệt của bạn đã chặn {blockedUrls.length} tab mở tự động. Vui lòng cho phép
                  Xin cấp quyền popup trên trình duyệt này cho WorkFlow Hub.
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="text-yellow-600 hover:bg-yellow-500/20 -mr-2 -mt-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-4 pt-0 pl-[3.25rem]">
          <div className="flex flex-wrap gap-2">
            {blockedUrls.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 rounded hover:bg-yellow-500/30 transition-colors"
              >
                {url} <ExternalLink className="ml-1.5 h-3 w-3 opacity-70" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </SlideUp>
  );
}
