import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { usePopup } from '../../hooks/usePopup';
import { useTheme } from '../../hooks/useTheme';
import { Label } from '../atoms/Label';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';

/**
 * Componente Feedback PopupModal:
 * Modal emergente totalmente personalizado con animaciones suaves, cierre al tocar el fondo,
 * variantes de estado (error, éxito, info) y sin ninguna dependencia de alert().
 */
export const PopupModal: React.FC = () => {
  const { popup, hidePopup } = usePopup();
  const { theme } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (popup.visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.92);
    }
  }, [popup.visible, fadeAnim, scaleAnim]);

  if (!popup.visible) return null;

  const getIconInfo = () => {
    switch (popup.type) {
      case 'error':
        return {
          name: 'alert-circle' as const,
          color: theme.error,
          bgColor: theme.errorBackground,
        };
      case 'success':
        return {
          name: 'checkmark-circle' as const,
          color: theme.success,
          bgColor: theme.successBackground,
        };
      case 'info':
      default:
        return {
          name: 'information-circle' as const,
          color: theme.info,
          bgColor: theme.infoBackground,
        };
    }
  };

  const iconInfo = getIconInfo();

  return (
    <Modal
      transparent
      visible={popup.visible}
      animationType="none"
      onRequestClose={hidePopup}
      accessibilityViewIsModal
    >
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Fondo táctil para cerrar */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={hidePopup}
          accessibilityLabel="Cerrar modal tocando el fondo"
        />

        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              transform: [{ scale: scaleAnim }],
              shadowColor: theme.shadow,
            },
          ]}
        >
          {/* Icono de estado */}
          <View style={[styles.iconWrapper, { backgroundColor: iconInfo.bgColor }]}>
            <Icon name={iconInfo.name} size={36} color={iconInfo.color} />
          </View>

          {/* Título */}
          <Label
            variant="h3"
            weight="bold"
            style={styles.title}
          >
            {popup.title}
          </Label>

          {/* Mensaje */}
          <Label
            variant="body"
            color={theme.textSecondary}
            style={styles.message}
          >
            {popup.message}
          </Label>

          {/* Botón de acción */}
          <View style={styles.buttonContainer}>
            <Button
              title={popup.buttonText || 'Entendido'}
              variant={popup.type === 'error' ? 'danger' : 'primary'}
              onPress={hidePopup}
              accessibilityLabel={popup.buttonText || 'Entendido'}
              style={styles.actionButton}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
  },
  actionButton: {
    width: '100%',
  },
});
