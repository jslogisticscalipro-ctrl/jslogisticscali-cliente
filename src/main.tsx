import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { iniciarPwa } from './lib/pwa';

iniciarPwa();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
