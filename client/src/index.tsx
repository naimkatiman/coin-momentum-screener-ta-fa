import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

function getUnhandledRejectionMessage(reason: unknown): string {
  if (typeof reason === 'string') return reason;
  if (reason instanceof Error) return reason.message;
  if (typeof reason === 'object' && reason !== null && 'message' in reason) {
    const { message } = reason as { message?: unknown };
    return typeof message === 'string' ? message : '';
  }
  return '';
}

window.addEventListener('unhandledrejection', (event) => {
  const message = getUnhandledRejectionMessage(event.reason).toLowerCase();
  if (message.includes('talisman extension has not been configured yet')) {
    event.preventDefault();
  }
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
