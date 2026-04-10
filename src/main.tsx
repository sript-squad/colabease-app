import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './auth/authContex';
import './auth/amplifyConfig';   // ← must be first import
import App from './App.tsx';



ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);