import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap-reboot.min.css';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import 'bootstrap/dist/css/bootstrap-utilities.min.css';
import './Styles/index.css';
import App from './App.jsx';

/**
 * Entry point del frontend.
 * Bootstrap: sólo importamos reboot/grid/utilities (NO componentes).
 * Los componentes UI son propios + Tailwind.
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
