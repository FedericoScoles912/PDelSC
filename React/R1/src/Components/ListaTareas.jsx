import { useState } from 'react';
import EjercicioWrapper from './EjercicioWrapper.jsx';
import FormularioTarea from './FormularioTarea.jsx';
import TareaItem from './TareaItem.jsx';
import Modal from './Modal.jsx';
import { useTheme } from '../Context/ThemeContext.jsx';
import { generarId } from '../Scripts/helpers.js';

/**
 * Ejercicio 4: Lista de tareas (Todo List).
 * Gestiona un array de objetos {id, texto, completada} mediante useState.
 * Divide la UI en FormularioTarea y TareaItem (subcomponentes atómicos).
 * Antes de borrar una tarea, muestra un Modal de confirmación propio.
 *
 * Estado:
 *  - tareas: Array de tareas. Incluye 3 ejemplos iniciales.
 *  - tareaAEliminar: tarea pendiente de confirmación para borrar (null = sin popup).
 */
export default function ListaTareas() {
  const [tareas, setTareas] = useState([
    { id: generarId(), texto: 'Repasar hooks básicos de React', completada: true },
    { id: generarId(), texto: 'Practicar componentes reutilizables', completada: false },
    { id: generarId(), texto: 'Probar el modo oscuro 🌙', completada: false }
  ]);

  const [tareaAEliminar, setTareaAEliminar] = useState(null);

  const { isDark } = useTheme();

  const agregarTarea = (texto) => {
    setTareas((prev) => [...prev, { id: generarId(), texto, completada: false }]);
  };

  const toggleCompletada = (id) => {
    setTareas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completada: !t.completada } : t))
    );
  };

  const solicitarEliminar = (id) => {
    const tarea = tareas.find((t) => t.id === id);
    if (tarea) {
      setTareaAEliminar(tarea);
    }
  };

  const confirmarEliminar = () => {
    if (tareaAEliminar) {
      setTareas((prev) => prev.filter((t) => t.id !== tareaAEliminar.id));
      setTareaAEliminar(null);
    }
  };

  const cancelarEliminar = () => {
    setTareaAEliminar(null);
  };

  const completadas = tareas.filter((t) => t.completada).length;
  const total = tareas.length;

  return (
    <EjercicioWrapper
      numero={4}
      titulo="Lista de tareas"
      descripcion="useState con array de objetos. Input + botón para agregar, click para tachar, eliminar CON confirmación."
    >
      <FormularioTarea onAgregar={agregarTarea} />

      {total > 0 ? (
        <>
          <div
            className={`d-flex flex-wrap justify-content-between align-items-center mb-3 px-2 text-sm
              ${isDark ? 'text-dark-crema/80' : 'text-light-oliva/90'}`}
          >
            <span>
              Total: <strong>{total}</strong> · Completadas: <strong>{completadas}</strong>
            </span>
            <span>Progreso: {total ? Math.round((completadas / total) * 100) : 0}%</span>
          </div>

          <ul className="list-unstyled d-flex flex-column gap-2 m-0">
            {tareas.map((t) => (
              <TareaItem
                key={t.id}
                tarea={t}
                onToggleCompletada={toggleCompletada}
                onSolicitarEliminar={solicitarEliminar}
              />
            ))}
          </ul>
        </>
      ) : (
        <div
          className={`text-center py-5 rounded-lg border border-dashed
            ${isDark
              ? 'text-dark-crema/70 border-dark-mostaza/30'
              : 'text-light-oliva/70 border-light-marron/40'}`}
        >
          <p className="m-0 fs-4 mb-2">📝</p>
          <p className="m-0">No hay tareas. ¡Agregá la primera!</p>
        </div>
      )}

      <Modal
        visible={tareaAEliminar !== null}
        tipo="confirm"
        titulo="Eliminar tarea"
        mensaje={
          tareaAEliminar ? (
            <>
              <p className="m-0 mb-2">
                ¿Estás seguro de que querés eliminar esta tarea?
              </p>
              <p
                className={`m-0 fw-medium px-3 py-2 rounded lh-base ${
                  isDark
                    ? 'bg-dark-gris/40 text-dark-crema border border-dark-mostaza/30'
                    : 'bg-light-beige/60 text-light-marron border border-light-marron/30'
                }`}
                style={{ wordBreak: 'break-word' }}
              >
                {tareaAEliminar.texto}
              </p>
              <p className="m-0 mt-3 text-sm opacity-80">
                Esta acción no se puede deshacer.
              </p>
            </>
          ) : null
        }
        textoBoton="Cancelar"
        textoBotonConfirmar="Eliminar"
        onCerrar={cancelarEliminar}
        onConfirmar={confirmarEliminar}
      />
    </EjercicioWrapper>
  );
}
