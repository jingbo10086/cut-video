
import React from 'react';
// Fixed: createRoot must be imported from 'react-dom/client' instead of 'react-dom' in React 18+
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
