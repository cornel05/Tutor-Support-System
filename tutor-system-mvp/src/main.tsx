import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';
import { ThemeProvider } from './theme/ThemeProvider';
import { Toaster } from 'sonner';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="tss-theme">
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  </React.StrictMode>
);