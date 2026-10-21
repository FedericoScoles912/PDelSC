/**
 * withShell.js
 * HOC que envuelve cada pantalla autenticada con el layout (AppShell),
 * inyectando navegación, usuario y cierre de sesión.
 */
import { useDispatch, useSelector } from 'react-redux';
import { AppShell } from '../Components/organisms/AppShell';
import { itemsForRole, NAV_ITEMS } from './navItems';
import { logout } from '../Store/slices/authSlice';
import { useFeedback } from '../Components/organisms/FeedbackProvider';

export function withShell(Component, name) {
  return function Shelled(props) {
    const usuario = useSelector((s) => s.auth.usuario);
    const dispatch = useDispatch();
    const { dialog, toast } = useFeedback();

    const items = itemsForRole(usuario?.rol);
    const item = NAV_ITEMS.find((i) => i.name === name);

    const onNavigate = (target) => props.navigation?.navigate(target);

    const onLogout = async () => {
      const ok = await dialog({
        title: 'Cerrar sesión',
        message: '¿Querés cerrar la sesión actual?',
        confirmLabel: 'Cerrar sesión',
        tone: 'warning',
      });
      if (ok) {
        await dispatch(logout());
        toast({ message: 'Sesión cerrada', tone: 'info' });
      }
    };

    return (
      <AppShell
        title={item?.label || name}
        items={items}
        active={name}
        onNavigate={onNavigate}
        usuario={usuario}
        onLogout={onLogout}
      >
        <Component {...props} />
      </AppShell>
    );
  };
}

export default withShell;
