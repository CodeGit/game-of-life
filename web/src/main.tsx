import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.css';
import App from './App.tsx';
import { MantineProvider } from '@mantine/core';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/ui/ErrorFallback.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider defaultColorScheme="dark">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <App />
      </ErrorBoundary>
    </MantineProvider>
  </StrictMode>,
);
