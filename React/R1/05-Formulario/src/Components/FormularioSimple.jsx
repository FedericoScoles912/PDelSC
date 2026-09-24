import { useMemo, useState } from 'react';
import EjercicioWrapper from './EjercicioWrapper.jsx';
import Modal from './Modal.jsx';
import {
  capitalizar,
  esSoloLetras,
  filtrarSoloLetras
} from '../Scripts/helpers.js';

/**
 * Ejercicio 5: Formulario simple + Modal propio.
 * Input controlado con useState que captura el nombre.
 * VALIDACIÓN EXTRA: el input solo acepta letras, espacios, tildes y ñ.
 * - OnChange: filtra caracteres inválidos (impide escribir números/símbolos).
 * - OnSubmit: doble validación y muestra Modal de éxito o error.
 *
 * Estado:
 *  - nombre: string del input (controlado y filtrado)
 *  - modalVisible: booleano para mostrar/ocultar el modal
 *  - modalTipo: 'success' | 'error' | 'warning'
 *  - errorInline: mensaje bajo el input cuando el usuario intentó escribir inválido
 */
export default function FormularioSimple() {
  const [nombre, setNombre] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState('success');
  const [tituloModal, setTituloModal] = useState('');
  const [mensajeModal, setMensajeModal] = useState('');
  const [errorInline, setErrorInline] = useState('');

  const nombreLimpio = useMemo(() => nombre.trim(), [nombre]);
  const esValido = nombreLimpio.length > 0 && esSoloLetras(nombreLimpio);

  const manejarCambio = (e) => {
    const entrada = e.target.value;
    const filtrado = filtrarSoloLetras(entrada);

    if (filtrado.length !== entrada.length) {
      setErrorInline('Solo se permiten letras, espacios y tildes.');
      setTimeout(() => setErrorInline(''), 2500);
    }

    setNombre(filtrado);
  };

  const manejarSubmit = (e) => {
    e.preventDefault();

    if (!nombreLimpio) {
      setModalTipo('warning');
      setTituloModal('Falta el nombre');
      setMensajeModal('Por favor, escribí tu nombre antes de enviar.');
      setModalVisible(true);
      return;
    }

    if (!esSoloLetras(nombreLimpio)) {
      setModalTipo('error');
      setTituloModal('Nombre inválido');
      setMensajeModal(
        <>
          El nombre solo puede contener <strong>letras, espacios y tildes</strong>.
          <br />
          <span className="fs-6 opacity-75">
            No se aceptan números ni símbolos.
          </span>
        </>
      );
      setModalVisible(true);
      return;
    }

    const formateado = capitalizar(nombreLimpio);
    setModalTipo('success');
    setTituloModal('¡Formulario enviado!');
    setMensajeModal(
      <>
        ¡Bienvenido/a, <strong>{formateado}</strong>!<br />
        <span className="fs-6 opacity-75">
          Tu nombre fue validado y guardado correctamente.
        </span>
      </>
    );
    setModalVisible(true);
  };

  const resetear = () => {
    setNombre('');
    setModalVisible(false);
    setErrorInline('');
  };

  return (
    <EjercicioWrapper
      numero={5}
      titulo="Formulario simple"
      descripcion="Input controlado con useState y validación de SOLO LETRAS. Al enviar, muestra un Modal propio (sin alert())."
    >
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <form onSubmit={manejarSubmit} className="d-flex flex-column gap-4" noValidate>
            <div>
              <label htmlFor="nombre-input" className="d-block mb-2 fw-medium texto-claro">
                Ingresá tu nombre
                <span className="ms-2 small opacity-70 fw-normal">
                  (solo letras, espacios y tildes)
                </span>
              </label>

              <input
                id="nombre-input"
                type="text"
                value={nombre}
                onChange={manejarCambio}
                placeholder="Ej: María José"
                className={`input-base ${errorInline ? 'input-invalido' : ''}`}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="words"
                spellCheck="false"
                maxLength={40}
              />

              <div className="d-flex justify-content-between align-items-center mt-2">
                <p className={`m-0 small ${errorInline ? 'text-red-500 dark:text-red-400 fw-medium' : 'texto-claro opacity-80'}`}>
                  {errorInline || '✓ Números y símbolos se bloquean automáticamente.'}
                </p>
                <p className="m-0 small texto-claro opacity-70">
                  {nombre.length} / 40
                </p>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-3 justify-content-end">
              <button
                type="button"
                onClick={() => {
                  setNombre('');
                  setErrorInline('');
                }}
                disabled={!nombre}
                className={`btn-secundario ${!nombre ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Limpiar
              </button>
              <button
                type="submit"
                disabled={!esValido}
                className={`btn-primario ${!esValido ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Enviar
              </button>
            </div>
          </form>

          <p className="mt-4 mb-0 text-center small texto-claro opacity-80">
             El modal se cierra con el botón, haciendo clic afuera o presionando Escape.
          </p>
        </div>
      </div>

      <Modal
        visible={modalVisible}
        tipo={modalTipo}
        titulo={tituloModal}
        mensaje={mensajeModal}
        onCerrar={modalTipo === 'success' ? resetear : () => setModalVisible(false)}
        textoBoton={modalTipo === 'success' ? 'Genial 👍' : 'Entendido'}
      />
    </EjercicioWrapper>
  );
}
