import { useNavigate } from 'react-router-dom';

/**
 * Botón reutilizable para volver a la página anterior o a una ruta específica.
 * @component
 * @param {Object} props - Props del componente
 * @param {string} [props.to='/'] - Ruta de destino (opcional)
 * @param {string} [props.texto='Volver'] - Texto visible del botón
 * @param {'primario'|'secundario'|'ghost'} [props.variante='ghost'] - Estilo del botón
 */
function BotonVolver({ to = '/', texto = 'Volver', variante = 'ghost' }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    if (to === '-1' && window.history.length > 1) {
      navigate(-1);
    } else if (to === '-1') {
      navigate('/');
    } else {
      navigate(to);
    }
  };

  const claseVariante = {
    primario: 'btn-primario',
    secundario: 'btn-secundario',
    ghost: 'btn-ghost'
  }[variante];

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${claseVariante} d-inline-flex align-items-center gap-2`}
      aria-label={texto}
    >
      <span aria-hidden="true">←</span>
      {texto}
    </button>
  );
}

export default BotonVolver;
