import React, { useCallback, useEffect, useState } from 'react';

import { EXTENSION_MESSAGE_TYPES } from '@repo/constants';

import { useWorkspaces } from '../hooks/use-workspaces';
import { CustomSelect } from './custom-select';

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

  const workspaceOptions = workspaces.map((ws) => ({
    value: ws.id,
    label: ws.name,
  }));

  return (
    <div className="space-y-3">
      {/* Current Tab Info */}
      {currentTab ? (
        <div className="p-3 bg-gray-800 rounded-lg border border-gray-700/60">
          <p className="text-xs font-medium text-gray-100 truncate">{currentTab.title}</p>
          <p className="text-[11px] text-gray-400 truncate mt-0.5">{currentTab.url}</p>
        </div>
      ) : (
        <div className="p-3 bg-gray-800 rounded-lg text-center">
          <p className="text-xs text-gray-500">Đang tải tab...</p>
        </div>
      )}

      {/* Workspace Selector */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1">Chọn Workspace</label>
        <CustomSelect
          value={selectedWorkspaceId}
          onChange={setSelectedWorkspaceId}
          options={workspaceOptions}
          placeholder={wsLoading ? 'Đang tải...' : '— Chọn workspace —'}
          disabled={wsLoading}
        />
      </div>

      {/* Add Button */}
      <button
        onClick={handleAdd}
        disabled={!selectedWorkspaceId || !currentTab || feedback.type === 'loading'}
        className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
      >
        {feedback.type === 'loading' ? 'Đang thêm...' : 'Thêm vào Workspace'}
      </button>

      {/* Feedback */}
      {feedback.type === 'success' && (
        <div className="p-2 text-xs text-green-400 bg-green-900/30 border border-green-800/40 rounded-lg text-center font-medium">
          ✅ {feedback.message}
        </div>
      )}
      {feedback.type === 'error' && (
        <div className="p-2 text-xs text-red-400 bg-red-900/30 border border-red-800/40 rounded-lg text-center font-medium">
          ❌ {feedback.message}
        </div>
      )}
    </div>
  );
}
