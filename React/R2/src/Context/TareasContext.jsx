import { createContext, useContext, useState } from 'react';
import tareasIniciales from '../Data/tareasIniciales.js';

const TareasContext = createContext(null);

/**
 * Provider que maneja el estado global de las tareas.
 * Expone funciones CRUD y utilidades (exportar JSON).
 * @component
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 */
export function TareasProvider({ children }) {
  const [tareas, setTareas] = useState(tareasIniciales);

  /**
   * Agrega una nueva tarea al estado global.
   * @param {Object} tarea - Datos de la tarea (sin id ni fechaCreacion)
   * @param {string} tarea.titulo - Título de la tarea
   * @param {string} tarea.descripcion - Descripción de la tarea
   * @param {boolean} tarea.completa - Estado de completitud
   * @returns {Object} La tarea creada completa con id y fechaCreacion
   */
  const agregarTarea = ({ titulo, descripcion, completa }) => {
    const nuevaTarea = {
      id: crypto.randomUUID(),
      titulo,
      descripcion,
      fechaCreacion: new Date().toISOString(),
      completa: Boolean(completa)
    };
    setTareas((prev) => [nuevaTarea, ...prev]);
    return nuevaTarea;
  };

  /**
   * Obtiene una tarea por su id.
   * @param {string} id - Identificador de la tarea
   * @returns {Object|undefined} La tarea encontrada o undefined
   */
  const obtenerTareaPorId = (id) => {
    return tareas.find((t) => t.id === id);
  };

  /**
   * Alterna el estado "completa" de una tarea.
   * @param {string} id - Identificador de la tarea
   */
  const toggleCompleta = (id) => {
    setTareas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completa: !t.completa } : t))
    );
  };

  /**
   * Elimina una tarea por su id.
   * @param {string} id - Identificador de la tarea
   */
  const eliminarTarea = (id) => {
    setTareas((prev) => prev.filter((t) => t.id !== id));
  };

  /**
   * Elimina TODAS las tareas del estado global.
   * @returns {number} Cantidad de tareas eliminadas
   */
  const eliminarTodas = () => {
    const cantidad = tareas.length;
    setTareas([]);
    return cantidad;
  };

  /**
   * Marca todas las tareas como completas o pendientes.
   * @param {boolean} valor - true para completas, false para pendientes
   * @returns {number} Cantidad de tareas modificadas
   */
  const marcarTodas = (valor) => {
    let modificadas = 0;
    setTareas((prev) =>
      prev.map((t) => {
        if (t.completa !== Boolean(valor)) modificadas++;
        return { ...t, completa: Boolean(valor) };
      })
    );
    return modificadas;
  };

  /**
   * Elimina SOLO las tareas que estén marcadas como completas.
   * @returns {number} Cantidad de tareas eliminadas
   */
  const eliminarCompletadas = () => {
    let eliminadas = 0;
    setTareas((prev) =>
      prev.filter((t) => {
        if (t.completa) {
          eliminadas++;
          return false;
        }
        return true;
      })
    );
    return eliminadas;
  };

  /**
   * Restaura el listado al array inicial de mock data.
   */
  const restaurarIniciales = () => {
    setTareas([...tareasIniciales]);
  };

  /**
   * Exporta todas las tareas como un archivo JSON descargable.
   */
  const exportarJSON = () => {
    const datos = JSON.stringify(tareas, null, 2);
    const blob = new Blob([datos], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tareas_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <TareasContext.Provider
      value={{
        tareas,
        setTareas,
        agregarTarea,
        obtenerTareaPorId,
        toggleCompleta,
        eliminarTarea,
        eliminarTodas,
        marcarTodas,
        eliminarCompletadas,
        restaurarIniciales,
        exportarJSON
      }}
    >
      {children}
    </TareasContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de tareas.
 * @returns {{
 *   tareas: Array,
 *   setTareas: Function,
 *   agregarTarea: Function,
 *   obtenerTareaPorId: Function,
 *   toggleCompleta: Function,
 *   eliminarTarea: Function,
 *   eliminarTodas: Function,
 *   marcarTodas: Function,
 *   eliminarCompletadas: Function,
 *   restaurarIniciales: Function,
 *   exportarJSON: Function
 * }}
 */
export function useTareas() {
  const contexto = useContext(TareasContext);
  if (!contexto) {
    throw new Error('useTareas debe usarse dentro de TareasProvider');
  }
  return contexto;
}

export default TareasContext;
