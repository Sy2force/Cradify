import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Ensure the root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

// Create root and render app
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hide loading screen when React app is ready
interface WindowWithCardifyUtils extends Window {
  cardifyUtils?: {
    hideLoadingScreen: () => void;
  };
}

const windowWithUtils = window as WindowWithCardifyUtils;
if (windowWithUtils.cardifyUtils) {
  windowWithUtils.cardifyUtils.hideLoadingScreen();
}
