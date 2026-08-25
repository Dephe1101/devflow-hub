import React, { useCallback, useEffect, useState } from 'react';

import { EXTENSION_MESSAGE_TYPES } from '@repo/constants';

import { useWorkspaces } from '../hooks/use-workspaces';

interface FeedbackState {
  type: 'success' | 'error' | 'loading' | null;
  message: string;
}

/**
 * Quick Add form — auto-populates with current tab URL/title,
 * lets user select a workspace, and adds the URL as a resource.
 */
export function QuickAddForm(): React.ReactElement {
  const { workspaces, isLoading: wsLoading } = useWorkspaces();
  const [currentTab, setCurrentTab] = useState<{ url: string; title: string } | null>(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [feedback, setFeedback] = useState<FeedbackState>({ type: null, message: '' });

  useEffect(() => {
    chrome.runtime.sendMessage(
      { type: EXTENSION_MESSAGE_TYPES.GET_CURRENT_TAB },
      (response: { success: boolean; data?: { url: string; title: string } | null }) => {
        if (response?.success && response.data) {
          setCurrentTab(response.data);
        }
      },
    );
  }, []);

  const handleAdd = useCallback(() => {
    if (!selectedWorkspaceId || !currentTab) return;

    setFeedback({ type: 'loading', message: 'Đang thêm...' });

    chrome.runtime.sendMessage(
      {
        type: EXTENSION_MESSAGE_TYPES.ADD_RESOURCE,
        payload: {
          workspaceId: selectedWorkspaceId,
          resource: {
            type: 'URL',
            value: currentTab.url,
            displayName: currentTab.title,
          },
        },
      },
      (response: { success: boolean; error?: string }) => {
        if (response?.success) {
          setFeedback({ type: 'success', message: 'Đã thêm thành công!' });
          setTimeout(() => {
            setFeedback({ type: null, message: '' });
          }, 2000);
        } else {
          setFeedback({
            type: 'error',
            message: response?.error ?? 'Thêm tài nguyên thất bại',
          });
        }
      },
    );
  }, [selectedWorkspaceId, currentTab]);

  return (
    <div className="space-y-3">
      {/* Current Tab Info */}
      {currentTab ? (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
            {currentTab.title}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {currentTab.url}
          </p>
        </div>
      ) : (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
          <p className="text-xs text-gray-400">Đang tải tab...</p>
        </div>
      )}

      {/* Workspace Selector */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Chọn Workspace
        </label>
        <select
          value={selectedWorkspaceId}
          onChange={(e) => {
            setSelectedWorkspaceId(e.target.value);
          }}
          disabled={wsLoading}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        >
          <option value="">{wsLoading ? 'Đang tải...' : '— Chọn workspace —'}</option>
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </select>
      </div>

      {/* Add Button */}
      <button
        onClick={handleAdd}
        disabled={!selectedWorkspaceId || !currentTab || feedback.type === 'loading'}
        className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {feedback.type === 'loading' ? 'Đang thêm...' : 'Thêm vào Workspace'}
      </button>

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
