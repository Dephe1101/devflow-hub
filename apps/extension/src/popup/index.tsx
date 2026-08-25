import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

import '../index.css';
import { LoginPrompt } from './components/login-prompt';
import { QuickAddForm } from './components/quick-add-form';
import { SessionCapture } from './components/session-capture';
import { useAuth } from './hooks/use-auth';

type TabView = 'quick-add' | 'capture';

function Popup(): React.ReactElement {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabView>('quick-add');

  if (isLoading) {
    return (
      <div className="w-[360px] p-6 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-[360px]">
        <PopupHeader />
        <LoginPrompt />
      </div>
    );
  }

  return (
    <div className="w-[360px]">
      <PopupHeader />

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            setActiveTab('quick-add');
          }}
          className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'quick-add'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Thêm Nhanh
        </button>
        <button
          onClick={() => {
            setActiveTab('capture');
          }}
          className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'capture'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50/50 dark:bg-purple-900/10'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Lưu Phiên (Capture)
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4">{activeTab === 'quick-add' ? <QuickAddForm /> : <SessionCapture />}</div>
    </div>
  );
}

function PopupHeader(): React.ReactElement {
  return (
    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <h1 className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
        DevFlow Hub
      </h1>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>,
  );
}
