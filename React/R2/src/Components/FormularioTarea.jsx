import { useState } from 'react';
import { useTheme } from '../Context/ThemeContext.jsx';
import { useToast } from '../Context/ToastContext.jsx';

/**
 * Formulario controlado para crear una tarea nueva.
 * No envía la data al servidor: la devuelve mediante onSubmit.
 * @component
 * @param {Object} props - Props del componente
 * @param {Function} props.onSubmit - Callback ({ titulo, descripcion, completa }) => void
 */
function FormularioTarea({ onSubmit }) {
  const { esOscuro } = useTheme();
  const { mostrarToast } = useToast();

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    completa: false
  });

  const [errores, setErrores] = useState({});

  /**
   * Actualiza un campo del formulario.
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} e
   */
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const valorFinal = type === 'checkbox' ? e.target.checked : value;
    setForm((prev) => ({ ...prev, [name]: valorFinal }));
    if (errores[name]) {
      setErrores((prev) => {
        const copia = { ...prev };
        delete copia[name];
        return copia;
      });
    }
  };

  /**
   * Valida el formulario y devuelve errores encontrados.
   * @returns {Object} Errores { campo: mensaje }
   */
  const validar = () => {
    const nuevosErrores = {};
    if (!form.titulo.trim()) {
      nuevosErrores.titulo = 'El título es obligatorio';
    } else if (form.titulo.trim().length < 3) {
      nuevosErrores.titulo = 'El título debe tener al menos 3 caracteres';
    }
    if (!form.descripcion.trim()) {
      nuevosErrores.descripcion = 'La descripción es obligatoria';
    } else if (form.descripcion.trim().length < 10) {
      nuevosErrores.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }
    return nuevosErrores;
  };

  /**
   * Maneja el envío del formulario.
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    const nuevosErrores = validar();
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      mostrarToast({
        mensaje: 'Por favor revisa los campos del formulario',
        tipo: 'error'
      });
      return;
    }
    onSubmit({
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      completa: Boolean(form.completa)
    });
  };

  const labelClase = `form-label fw-medium mb-2 ${
    esOscuro ? 'text-otoño-claro-crema' : 'text-otoño-oscuro-chocolate'
  }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="d-flex flex-column gap-4">
      <div>
        <label htmlFor="titulo" className={labelClase}>
          Título de la tarea <span className="text-danger">*</span>
        </label>
        <input
          id="titulo"
          name="titulo"
          type="text"
          value={form.titulo}
          onChange={handleChange}
          placeholder="Ej.: Implementar Context API"
          maxLength={100}
          className={`input-form ${errores.titulo ? 'is-invalid' : ''}`}
          aria-invalid={!!errores.titulo}
          aria-describedby={errores.titulo ? 'error-titulo' : undefined}
        />
        {errores.titulo && (
          <div id="error-titulo" className="invalid-feedback fs-6 mt-1 d-block text-danger">
            {errores.titulo}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="descripcion" className={labelClase}>
          Descripción <span className="text-danger">*</span>
        </label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          placeholder="Descripción detallada de la tarea..."
          rows={5}
          maxLength={1000}
          className={`input-form resize-y ${errores.descripcion ? 'is-invalid' : ''}`}
          aria-invalid={!!errores.descripcion}
          aria-describedby={errores.descripcion ? 'error-descripcion' : undefined}
        />
        <div className="d-flex justify-content-between mt-1">
          <div id="error-descripcion" className="text-danger fs-6">
            {errores.descripcion || ''}
          </div>
          <span className="fs-6 opacity-75">{form.descripcion.length}/1000</span>
        </div>
      </div>

      <div
        className={`d-flex align-items-center gap-3 p-3 rounded-lg border-2 ${
          esOscuro ? 'border-otoño-oscuro-mostazaApagado' : 'border-otoño-claro-marron'
        }`}
      >
        <div className="form-check form-switch m-0">
          <input
            id="completa"
            name="completa"
            type="checkbox"
            role="switch"
            checked={form.completa}
            onChange={handleChange}
            className="form-check-input"
            style={{
              cursor: 'pointer',
              width: '3rem',
              height: '1.5rem'
            }}
          />
          <label
            htmlFor="completa"
            className={`form-check-label fw-medium ps-2 ${
              esOscuro ? 'text-otoño-claro-crema' : 'text-otoño-oscuro-chocolate'
            }`}
            style={{ cursor: 'pointer' }}
          >
            ¿La tarea ya está completa?
          </label>
        </div>
      </div>

      <div className="d-flex gap-3 justify-content-end pt-2">
        <button
          type="reset"
          onClick={() => {
            setForm({ titulo: '', descripcion: '', completa: false });
            setErrores({});
          }}
          className="btn-ghost"
        >
          Limpiar
        </button>
        <button type="submit" className="btn-primario">
          Crear tarea
        </button>
      </div>
    </form>
  );
}

export default FormularioTarea;
