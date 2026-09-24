import { useState } from 'react';

export default function FormularioTarea({ onAgregar }) {
  const [texto, setTexto] = useState('');

  const manejarSubmit = (e) => {
    e.preventDefault();
    const limpio = texto.trim();
    if (!limpio) return;
    onAgregar(limpio);
    setTexto('');
  };

  return (
    <form onSubmit={manejarSubmit} className="row g-3 mb-4">
      <div className="col-12 col-md-9">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribí una nueva tarea..."
          className="input-base"
          aria-label="Nueva tarea"
        />
      </div>
      <div className="col-12 col-md-3 d-flex">
        <button type="submit" className="btn-primario w-100">
          + Agregar
        </button>
      </div>
    </form>
  );
}
