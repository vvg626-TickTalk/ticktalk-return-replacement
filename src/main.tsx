import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from '@/App';
import { ServiceOrderAccountProvider } from '@/features/serviceOrder/ServiceOrderAccountContext';
import '@/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ServiceOrderAccountProvider>
      <App />
      </ServiceOrderAccountProvider>
    </BrowserRouter>
  </StrictMode>,
);
