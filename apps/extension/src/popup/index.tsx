import React from 'react';
import ReactDOM from 'react-dom/client';

import '../index.css';

const Popup = () => {
  return (
    <div style={{ width: '300px', padding: '16px', fontFamily: 'sans-serif' }}>
      <h2>DevFlow Hub</h2>
      <p>Save session or add to workspace.</p>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
);
