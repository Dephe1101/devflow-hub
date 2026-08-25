import React, { useCallback, useState } from 'react';

import { EXTENSION_MESSAGE_TYPES } from '@repo/constants';

interface CapturedTab {
  url: string;
  title: string;
  favIconUrl?: string;
  selected: boolean;
}

interface FeedbackState {
  type: 'success' | 'error' | 'loading' | null;
  message: string;
}

/**
 * Session Capture component — captures all browser tabs and saves them as a new workspace.
 */
export function SessionCapture(): React.ReactElement {
  const [tabs, setTabs] = useState<CapturedTab[]>([]);
  const [workspaceName, setWorkspaceName] = useState('');
  const [isCaptured, setIsCaptured] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>({ type: null, message: '' });

  const handleCapture = useCallback(() => {
    setFeedback({ type: 'loading', message: 'Đang thu thập tabs...' });

    chrome.runtime.sendMessage(
      { type: EXTENSION_MESSAGE_TYPES.CAPTURE_SESSION },
      (response: {
        success: boolean;
        data?: Array<{ url: string; title: string; favIconUrl?: string }>;
      }) => {
        if (response?.success && response.data) {
          setTabs(response.data.map((t) => ({ ...t, selected: true })));
          setIsCaptured(true);
          setFeedback({ type: null, message: '' });
        } else {
          setFeedback({ type: 'error', message: 'Không thể thu thập tabs' });
        }
      },
    );
  }, []);

  const handleToggleTab = useCallback((index: number) => {
    setTabs((prev) =>
      prev.map((tab, i) => (i === index ? { ...tab, selected: !tab.selected } : tab)),
    );
  }, []);

  const handleSave = useCallback(() => {
    const selectedTabs = tabs.filter((t) => t.selected);
    if (!workspaceName.trim() || selectedTabs.length === 0) return;

    setFeedback({ type: 'loading', message: 'Đang lưu workspace...' });

    chrome.runtime.sendMessage(
      {
        type: EXTENSION_MESSAGE_TYPES.CREATE_WORKSPACE_WITH_RESOURCES,
        payload: {
          workspaceName: workspaceName.trim(),
          resources: selectedTabs.map((t) => ({ url: t.url, title: t.title })),
        },
      },
      (response: { success: boolean; data?: unknown; error?: string }) => {
        if (response?.success) {
          setFeedback({ type: 'success', message: `Đã lưu ${selectedTabs.length} tabs!` });
          setIsCaptured(false);
          setTabs([]);
          setWorkspaceName('');
        } else {
          setFeedback({
            type: 'error',
            message: response?.error ?? 'Lưu workspace thất bại',
          });
        }
      },
    );
  }, [tabs, workspaceName]);

  const selectedCount = tabs.filter((t) => t.selected).length;

  if (!isCaptured) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
          <svg
            className="w-6 h-6 text-purple-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Thu thập tất cả tabs đang mở và lưu thành workspace mới
        </p>
        <button
          onClick={handleCapture}
          disabled={feedback.type === 'loading'}
          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {feedback.type === 'loading' ? 'Đang thu thập...' : 'Thu thập toàn bộ Tabs'}
        </button>
        {feedback.type === 'error' && (
          <p className="mt-2 text-xs text-red-500">{feedback.message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Workspace Name */}
      <input
        type="text"
        placeholder="Tên workspace mới..."
        value={workspaceName}
        onChange={(e) => {
          setWorkspaceName(e.target.value);
        }}
        className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
      />

      {/* Tab List */}
      <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
        {tabs.map((tab, index) => (
          <label
            key={tab.url}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              checked={tab.selected}
              onChange={() => {
                handleToggleTab(index);
              }}
              className="w-3.5 h-3.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate text-gray-900 dark:text-white">
                {tab.title}
              </p>
              <p className="text-[10px] text-gray-400 truncate">{tab.url}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Summary + Save */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {selectedCount}/{tabs.length} tabs
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsCaptured(false);
              setTabs([]);
            }}
            className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!workspaceName.trim() || selectedCount === 0 || feedback.type === 'loading'}
            className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {feedback.type === 'loading' ? 'Đang lưu...' : 'Lưu Workspace'}
          </button>
        </div>
      </div>

      {/* Feedback */}
      {feedback.type === 'success' && (
        <div className="p-2 text-xs text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-900/20 rounded-lg text-center">
          ✅ {feedback.message}
        </div>
      )}
      {feedback.type === 'error' && (
        <div className="p-2 text-xs text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20 rounded-lg text-center">
          ❌ {feedback.message}
        </div>
      )}
    </div>
  );
}
