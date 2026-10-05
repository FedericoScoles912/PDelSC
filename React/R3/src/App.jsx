import React, { useState } from 'react';
import { STORAGE_KEYS } from './Scripts/utils/constants.js';
import AppRouter from './RouterSystem/AppRouter.jsx';
import StateApp from './StateSystem/StateApp.jsx';

/**
 * Componente Raíz: Permite alternar y comparar en tiempo real entre:
 * - Sistema A: Enrutamiento con React Router v6 (/RouterSystem)
 * - Sistema B: Enrutamiento condicional con useState puro (/StateSystem)
 */
export default function App() {
  const [activeSystem, setActiveSystem] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_SYSTEM);
    return saved === 'state' ? 'state' : 'router';
  });

  const handleSwitchSystem = () => {
    setActiveSystem((prev) => {
      const next = prev === 'router' ? 'state' : 'router';
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SYSTEM, next);
      return next;
    });
  };

  return (
    <div className="relative">
      {activeSystem === 'router' ? (
        <AppRouter onSwitchSystem={handleSwitchSystem} />
      ) : (
        <StateApp onSwitchSystem={handleSwitchSystem} />
      )}
    </div>
  );
}
