import { StyleSheet } from 'react-native';
/** Crea estilos adaptados a la paleta activa de la portada. */
export const createHolaStyles = (colors, compact) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: compact ? 22 : 40 },
  title: { color: colors.text, fontSize: compact ? 39 : 58, fontWeight: '800', textAlign: 'center', letterSpacing: -1, textShadowColor: colors.shadow, textShadowOffset: { width: 1, height: 3 }, textShadowRadius: 7 },
  subtitle: { color: colors.muted, fontSize: 16, textAlign: 'center', marginTop: 18, lineHeight: 23 }, themeButton: { marginTop: 32, borderColor: colors.primary, borderWidth: 1, borderRadius: 22, paddingHorizontal: 18, paddingVertical: 10 }, themeText: { color: colors.primary, fontWeight: '700' },
});
