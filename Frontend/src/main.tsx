import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import '@fontsource-variable/inter';
import '@fontsource-variable/source-serif-4';
import './index.css';
import './i18n/config';
import { auth, db } from './config/firebase';

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('SW registered:', registration))
      .catch(error => console.log('SW registration failed:', error));
  });
}

// Ensure root element exists
// Diagnostic logs for connectivity
console.log('--- FarmSync Diagnostic Check ---');
console.log('Firebase Service Status:', auth ? 'Initialized' : 'FAILED');
console.log('Database Service Status:', db ? 'Initialized' : 'FAILED');
if (auth) {
  console.log('Firebase App Name:', auth.app.name);
  console.log('Project ID:', auth.app.options.projectId);
}
console.log('---------------------------------');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
