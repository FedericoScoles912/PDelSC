import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import { usePopup } from '../../hooks/usePopup';
import { useTheme } from '../../hooks/useTheme';
import { Text } from '../atoms/Text';
import { Icon, IconName } from '../atoms/Icon';
import { Button } from '../atoms/Button';

/**
 * Modal global interactivo para reemplazar llamadas a alert().
 * Soporta estados de éxito, error, advertencia e información con acciones personalizadas.
 */
export const PopupModal: React.FC = () => {
  const { popupState, hidePopup } = usePopup();
  const { theme } = useTheme();

  if (!popupState.visible) return null;

  let iconName: IconName = 'information-circle';
  let iconColor = theme.colors.info;
  let bgIcon = theme.colors.infoBackground;

  if (popupState.type === 'success') {
    iconName = 'checkmark-circle';
    iconColor = theme.colors.success;
    bgIcon = theme.colors.successBackground;
  } else if (popupState.type === 'error') {
    iconName = 'alert-circle';
    iconColor = theme.colors.error;
    bgIcon = theme.colors.errorBackground;
  } else if (popupState.type === 'warning') {
    iconName = 'warning';
    iconColor = theme.colors.warning;
    bgIcon = theme.colors.warningBackground;
  }

  const handleBackdropPress = () => {
    if (popupState.dismissible) {
      hidePopup();
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={popupState.visible}
      onRequestClose={handleBackdropPress}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderRadius: theme.borderRadius.xl,
                  padding: theme.spacing.xl,
                },
              ]}
            >
              <View style={styles.headerRow}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: bgIcon,
                      borderRadius: theme.borderRadius.full,
                    },
                  ]}
                >
                  <Icon name={iconName} size={28} color={iconColor} />
                </View>
                {popupState.dismissible && (
                  <TouchableOpacity
                    onPress={hidePopup}
                    style={styles.closeBtn}
                    accessibilityLabel="Cerrar ventana emergente"
                  >
                    <Icon name="close" size={22} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              <Text variant="title" weight="bold" style={{ marginTop: theme.spacing.sm }}>
                {popupState.title}
              </Text>

              <Text
                variant="body"
                secondary
                style={{
                  marginTop: theme.spacing.xs,
                  marginBottom: theme.spacing.lg,
                }}
              >
                {popupState.message}
              </Text>

              <View style={styles.actionsContainer}>
                {popupState.actions && popupState.actions.length > 0 ? (
                  popupState.actions.map((action, idx) => (
                    <Button
                      key={idx}
                      label={action.label}
                      variant={action.variant || (idx === 0 ? 'primary' : 'secondary')}
                      onPress={() => {
                        hidePopup();
                        if (action.onPress) {
                          action.onPress();
                        }
                      }}
                      style={[
                        styles.actionButton,
                        idx > 0 && { marginTop: theme.spacing.xs },
                      ]}
                    />
                  ))
                ) : (
                  <Button label="Entendido" variant="primary" onPress={hidePopup} fullWidth />
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 8,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    width: '100%',
  },
  actionButton: {
    width: '100%',
  },
});
