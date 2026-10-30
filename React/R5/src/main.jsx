import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Bootstrap: SOLO el grid de utilidades responsive (sin su JS ni componentes).
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import './Styles/index.css';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
