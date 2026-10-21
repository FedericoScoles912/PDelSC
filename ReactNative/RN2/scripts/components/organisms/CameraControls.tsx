import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Icon } from '../atoms/Icon';
import { Spinner } from '../atoms/Spinner';

export interface CameraControlsProps {
  onCapture: () => void;
  onToggleFacing: () => void;
  onToggleTorch: () => void;
  facing: 'front' | 'back';
  torch: boolean;
  isCapturing: boolean;
  lastPhotoUri?: string | null;
  onPressThumbnail?: () => void;
}

/**
 * Organismo de controles para la cámara: disparador central, switch frontal/trasera, linterna y miniatura.
 */
export const CameraControls: React.FC<CameraControlsProps> = ({
  onCapture,
  onToggleFacing,
  onToggleTorch,
  facing,
  torch,
  isCapturing,
  lastPhotoUri,
  onPressThumbnail,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* Botón linterna */}
      <TouchableOpacity
        onPress={onToggleTorch}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Alternar linterna"
        style={[
          styles.roundBtn,
          {
            backgroundColor: torch ? theme.colors.warning : 'rgba(0, 0, 0, 0.45)',
          },
        ]}
      >
        <Icon
          name={torch ? 'flash' : 'flash-off'}
          size={24}
          color={torch ? '#FFFFFF' : '#FFFFFF'}
        />
      </TouchableOpacity>

      {/* Botón de captura central */}
      <TouchableOpacity
        onPress={onCapture}
        disabled={isCapturing}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Tomar fotografía"
        style={[
          styles.shutterOuter,
          {
            borderColor: theme.colors.primary,
          },
        ]}
      >
        <View
          style={[
            styles.shutterInner,
            {
              backgroundColor: isCapturing ? theme.colors.border : theme.colors.primary,
            },
          ]}
        >
          {isCapturing && <Spinner size="small" color="#FFFFFF" />}
        </View>
      </TouchableOpacity>

      {/* Botón cambiar cámara o miniatura */}
      <View style={styles.rightGroup}>
        <TouchableOpacity
          onPress={onToggleFacing}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Cambiar a cámara ${facing === 'back' ? 'frontal' : 'trasera'}`}
          style={[styles.roundBtn, { backgroundColor: 'rgba(0, 0, 0, 0.45)' }]}
        >
          <Icon name="camera-reverse" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {lastPhotoUri && (
          <TouchableOpacity
            onPress={onPressThumbnail}
            accessibilityLabel="Ver última foto capturada"
            style={[
              styles.thumbnailWrapper,
              {
                borderColor: theme.colors.primary,
                borderRadius: theme.borderRadius.sm,
              },
            ]}
          >
            <Image source={{ uri: lastPhotoUri }} style={styles.thumbnail} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.7)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  roundBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnailWrapper: {
    width: 44,
    height: 44,
    borderWidth: 2,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
});
