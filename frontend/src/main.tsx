/**
 * React Entry Point
 * 
 * WHAT HAPPENS HERE?
 * ==================
 * 1. Import React and ReactDOM
 * 2. Import our App component
 * 3. Import global styles
 * 4. Set up React Query
 * 5. Mount the app to the DOM
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Create a React Query client
// This manages caching and refetching for all our API calls
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data is "fresh" for 5 minutes
      retry: 1, // Only retry failed requests once
    },
  },
});

// Mount the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
