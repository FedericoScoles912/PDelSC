import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { useTheme } from '../hooks/useTheme';
import { usePermission } from '../hooks/usePermission';
import { useCameraTools } from '../hooks/useCameraTools';
import { ScreenWrapper } from '../components/layout/ScreenWrapper';
import { Container } from '../components/layout/Container';
import { Header } from '../components/organisms/Header';
import { CameraControls } from '../components/organisms/CameraControls';
import { PermissionBanner } from '../components/molecules/PermissionBanner';
import { Text } from '../components/atoms/Text';
import { Icon } from '../components/atoms/Icon';
import { Button } from '../components/atoms/Button';

/**
 * Pantalla de control de cámara fotográfica con visor en vivo, linterna y galería de sesión.
 */
const CameraScreen: React.FC = () => {
  const { theme } = useTheme();
  const { isGranted, status, requestPermission, openAppSettings } = usePermission('camera');
  const {
    facing,
    torch,
    photos,
    lastPhoto,
    isCapturing,
    cameraRef,
    toggleFacing,
    toggleTorch,
    takePicture,
    clearSessionPhotos,
  } = useCameraTools();

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <ScreenWrapper scrollable={!isGranted}>
      <Header
        title="Cámara"
        subtitle="Captura y visor fotográfico en tiempo real"
      />

      <Container style={{ flex: 1, paddingVertical: theme.spacing.md }}>
        {!isGranted ? (
          <PermissionBanner
            type="camera"
            status={status}
            onRequest={requestPermission}
            onOpenSettings={openAppSettings}
          />
        ) : (
          <View style={styles.cameraWrapper}>
            {/* Visor en vivo de Expo CameraView */}
            <CameraView
              ref={cameraRef}
              style={styles.cameraView}
              facing={facing}
              enableTorch={torch}
            >
              <View style={styles.topInfoBar}>
                <View
                  style={[
                    styles.tagBadge,
                    {
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      borderRadius: theme.borderRadius.full,
                    },
                  ]}
                >
                  <Icon name="eye-outline" size={16} color="#FFFFFF" />
                  <Text variant="caption" weight="semibold" color="#FFFFFF" style={{ marginLeft: 6 }}>
                    {facing === 'back' ? 'Cámara Trasera' : 'Cámara Frontal'}
                  </Text>
                </View>

                {torch && (
                  <View
                    style={[
                      styles.tagBadge,
                      {
                        backgroundColor: theme.colors.warning,
                        borderRadius: theme.borderRadius.full,
                        marginLeft: 8,
                      },
                    ]}
                  >
                    <Icon name="flash" size={14} color="#FFFFFF" />
                    <Text variant="caption" weight="bold" color="#FFFFFF" style={{ marginLeft: 4 }}>
                      Flash ON
                    </Text>
                  </View>
                )}
              </View>

              {/* Controles de cámara en la base */}
              <CameraControls
                onCapture={takePicture}
                onToggleFacing={toggleFacing}
                onToggleTorch={toggleTorch}
                facing={facing}
                torch={torch}
                isCapturing={isCapturing}
                lastPhotoUri={lastPhoto}
                onPressThumbnail={() => {
                  if (lastPhoto) setSelectedPhoto(lastPhoto);
                }}
              />
            </CameraView>

            {/* Galería de sesión */}
            {photos.length > 0 && (
              <View
                style={[
                  styles.gallerySection,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderRadius: theme.borderRadius.lg,
                  },
                ]}
              >
                <View style={styles.galleryHeader}>
                  <Text variant="title" weight="bold">
                    Fotos de la Sesión ({photos.length})
                  </Text>
                  <Button
                    label="Limpiar"
                    variant="ghost"
                    size="sm"
                    onPress={clearSessionPhotos}
                    icon="trash-outline"
                  />
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.galleryScroll}
                >
                  {photos.map((uri, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedPhoto(uri)}
                      activeOpacity={0.8}
                      accessibilityLabel={`Foto tomada número ${idx + 1}`}
                      style={[
                        styles.galleryItem,
                        {
                          borderColor: theme.colors.border,
                          borderRadius: theme.borderRadius.md,
                        },
                      ]}
                    >
                      <Image source={{ uri }} style={styles.galleryThumb} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Modal de visualización de foto en pantalla completa */}
        <Modal
          visible={selectedPhoto !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedPhoto(null)}
        >
          <View style={styles.photoModalBackdrop}>
            <TouchableOpacity
              onPress={() => setSelectedPhoto(null)}
              style={styles.closeModalBtn}
              accessibilityLabel="Cerrar vista de foto"
            >
              <Icon name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            {selectedPhoto && (
              <Image
                source={{ uri: selectedPhoto }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>
      </Container>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  cameraWrapper: {
    flex: 1,
    minHeight: 520,
  },
  cameraView: {
    flex: 1,
    minHeight: 460,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
  },
  topInfoBar: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  gallerySection: {
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  galleryScroll: {
    flexDirection: 'row',
    gap: 12,
  },
  galleryItem: {
    width: 80,
    height: 80,
    borderWidth: 1,
    overflow: 'hidden',
  },
  galleryThumb: {
    width: '100%',
    height: '100%',
  },
  photoModalBackdrop: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalBtn: {
    position: 'absolute',
    top: 48,
    right: 24,
    zIndex: 10,
    padding: 10,
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '94%',
    height: '80%',
  },
});

export default CameraScreen;
