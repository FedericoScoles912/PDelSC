/**
 * AppNavigator.js
 * Pila de pantallas de la app autenticada. Cada pantalla va envuelta por
 * withShell(...) para incluir el layout (sidebar/barra superior).
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { withShell } from './withShell';
import { NAV_ITEMS } from './navItems';
import { DashboardScreen } from '../Screens/DashboardScreen';
import { ProductosScreen } from '../Screens/ProductosScreen';
import { BusquedaScreen } from '../Screens/BusquedaScreen';
import { MovimientosScreen } from '../Screens/MovimientosScreen';
import { PreciosScreen } from '../Screens/PreciosScreen';
import { ReportesScreen } from '../Screens/ReportesScreen';
import { UsuariosScreen } from '../Screens/UsuariosScreen';
import { AuditoriaScreen } from '../Screens/AuditoriaScreen';
import { ConfiguracionScreen } from '../Screens/ConfiguracionScreen';

const Stack = createNativeStackNavigator();

const SCREENS = {
  Dashboard: withShell(DashboardScreen, 'Dashboard'),
  Productos: withShell(ProductosScreen, 'Productos'),
  Busqueda: withShell(BusquedaScreen, 'Busqueda'),
  Movimientos: withShell(MovimientosScreen, 'Movimientos'),
  Precios: withShell(PreciosScreen, 'Precios'),
  Reportes: withShell(ReportesScreen, 'Reportes'),
  Usuarios: withShell(UsuariosScreen, 'Usuarios'),
  Auditoria: withShell(AuditoriaScreen, 'Auditoria'),
  Configuracion: withShell(ConfiguracionScreen, 'Configuracion'),
};

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {NAV_ITEMS.map((item) => {
        const Component = SCREENS[item.name];
        if (!Component) return null;
        return <Stack.Screen key={item.name} name={item.name} component={Component} />;
      })}
    </Stack.Navigator>
  );
}

export default AppNavigator;
