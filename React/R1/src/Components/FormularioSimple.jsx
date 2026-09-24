import { useState } from 'react';
import EjercicioWrapper from './EjercicioWrapper.jsx';
import Modal from './Modal.jsx';
import { capitalizar } from '../Scripts/helpers.js';

/**
 * Ejercicio 5: Formulario simple + Modal propio.
 * Input controlado con useState que captura el nombre.
 * Al enviar, muestra un componente Modal reutilizable (NO usa alert()).
 *
 * Estado:
 *  - nombre: string del input (controlado)
 *  - modalVisible: booleano para mostrar/ocultar el modal
 */
export default function FormularioSimple() {
  const [nombre, setNombre] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [mensajeModal, setMensajeModal] = useState('');

  const manejarSubmit = (e) => {
    e.preventDefault();
    const limpio = nombre.trim();
    if (!limpio) return;

    const formateado = capitalizar(limpio);
    setMensajeModal(
      <>
        ¡Bienvenido/a, <strong>{formateado}</strong>! 👋<br />
        <span className="fs-6 opacity-75">Tu nombre fue capturado correctamente.</span>
      </>
    );
    setModalVisible(true);
  };

  const resetear = () => {
    setNombre('');
    setModalVisible(false);
  };

  return (
    <EjercicioWrapper
      numero={5}
      titulo="Formulario simple"
      descripcion="Input controlado con useState. Al enviar, muestra un Modal propio hecho en JS (sin alert())."
    >
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <form onSubmit={manejarSubmit} className="d-flex flex-column gap-4">
            <div>
              <label htmlFor="nombre-input" className="d-block mb-2 fw-medium texto-claro">
                Ingresá tu nombre
              </label>
              <input
                id="nombre-input"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Martín"
                className="input-base"
                autoComplete="off"
              />
              {nombre.length > 0 && (
                <p className="text-end mt-1 mb-0 small texto-claro opacity-70">
                  {nombre.length} caracteres
                </p>
              )}
            </div>

            <div className="d-flex flex-wrap gap-3 justify-content-end">
              <button
                type="button"
                onClick={() => setNombre('')}
                disabled={!nombre}
                className={`btn-secundario ${!nombre ? 'opacity-50' : ''}`}
              >
                Limpiar
              </button>
              <button
                type="submit"
                disabled={!nombre.trim()}
                className={`btn-primario ${!nombre.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Enviar
              </button>
            </div>
          </form>

          <p className="mt-4 mb-0 text-center small texto-claro opacity-80">
            💡 El modal se cierra con el botón, haciendo clic afuera o presionando Escape.
          </p>
        </div>
      </div>

      <Modal
        visible={modalVisible}
        tipo="success"
        titulo="¡Formulario enviado!"
        mensaje={mensajeModal}
        onCerrar={resetear}
        textoBoton="Genial 👍"
      />
    </EjercicioWrapper>
  );
}
