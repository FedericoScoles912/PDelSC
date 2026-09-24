import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ThemeProvider } from './Context/ThemeContext.jsx';
import { TareasProvider } from './Context/TareasContext.jsx';
import { ToastProvider } from './Context/ToastContext.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <TareasProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </TareasProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
