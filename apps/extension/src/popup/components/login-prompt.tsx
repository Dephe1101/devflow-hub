import React from 'react';

import { WEB_APP_URL } from '../../utils/config';

/**
 * Displayed when the user has not logged in to DevFlow Hub.
 * Provides a link to open the web app login page.
 */
export function LoginPrompt(): React.ReactElement {
  const handleOpenLogin = (): void => {
    chrome.tabs.create({ url: `${WEB_APP_URL}/login` });
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
        <svg
          className="w-6 h-6 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Chưa đăng nhập</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Đăng nhập trên DevFlow Hub để sử dụng extension
      </p>
      <button
        onClick={handleOpenLogin}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Mở DevFlow Hub
      </button>
    </div>
  );
}
