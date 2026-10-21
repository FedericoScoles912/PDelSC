/**
 * AppShell.js
 * Layout principal de la app autenticada.
 *  - Desktop/tablet: sidebar fija a la izquierda + contenido.
 *  - Mobile: barra superior con menú que abre el sidebar en un modal.
 */
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ModalPopup } from '../molecules/ModalPopup';
import { useBreakpoint } from '../../Utils/responsive';

export function AppShell({
  title,
  items,
  active,
  onNavigate,
  usuario,
  onLogout,
  actions,
  children,
  scrollable = true,
}) {
  const { isDesktop } = useBreakpoint();
  const [drawer, setDrawer] = useState(false);

  const handleNavigate = (name) => {
    setDrawer(false);
    onNavigate?.(name);
  };

  const main = (
    <View className="flex-1 bg-warm-50 dark:bg-warm-950">
      <TopBar
        title={title}
        onMenuPress={isDesktop ? undefined : () => setDrawer(true)}
        onLogout={onLogout}
        right={actions}
      />
      {scrollable ? (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          <View className="mx-auto w-full max-w-[1280px]">{children}</View>
        </ScrollView>
      ) : (
        <View className="flex-1 p-4">
          <View className="mx-auto h-full w-full max-w-[1280px]">{children}</View>
        </View>
      )}
    </View>
  );

  if (isDesktop) {
    return (
      <View className="flex-1 flex-row bg-warm-50 dark:bg-warm-950">
        <Sidebar items={items} active={active} onSelect={handleNavigate} usuario={usuario} onLogout={onLogout} />
        {main}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-warm-50 dark:bg-warm-950">
      {main}
      <ModalPopup visible={drawer} onClose={() => setDrawer(false)} maxWidth={320} className="p-0">
        <View className="-m-5">
          <Sidebar items={items} active={active} onSelect={handleNavigate} usuario={usuario} onLogout={onLogout} />
        </View>
      </ModalPopup>
    </View>
  );
}

export default AppShell;
