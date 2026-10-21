import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { CameraView, BarcodeScanningResult } from 'expo-camera';
import { useTheme } from '../hooks/useTheme';
import { usePermission } from '../hooks/usePermission';
import { useScanner } from '../hooks/useScanner';
import { usePopup } from '../hooks/usePopup';
import { ScreenWrapper } from '../components/layout/ScreenWrapper';
import { Container } from '../components/layout/Container';
import { Header } from '../components/organisms/Header';
import { HistoryList } from '../components/organisms/HistoryList';
import { PermissionBanner } from '../components/molecules/PermissionBanner';
import { Text } from '../components/atoms/Text';
import { Button } from '../components/atoms/Button';
import { Icon } from '../components/atoms/Icon';
import { clipboardService } from '../services/clipboardService';
import { sanitizeUrl } from '../utils/validators';
import { ScanHistoryItem } from '../types/history';

/**
 * Pantalla de escaneo de códigos QR y códigos de barra con marco de mira y registro persistente.
 */
const ScannerScreen: React.FC = () => {
  const { theme } = useTheme();
  const { isGranted, status, requestPermission, openAppSettings } = usePermission('camera');
  const {
    isScanning,
    history,
    handleBarcodeScanned,
    resumeScanning,
    pauseScanning,
    clearHistory,
  } = useScanner();
  const { showPopup } = usePopup();

  const handleScanCallback = (result: BarcodeScanningResult) => {
    if (!isScanning) return;
    handleBarcodeScanned({ data: result.data, type: result.type });
  };

  const handleSelectHistoryItem = (item: ScanHistoryItem) => {
    const actions = [
      {
        label: 'Copiar',
        variant: 'secondary' as const,
        onPress: async () => {
          await clipboardService.copyText(item.data);
          showPopup({
            type: 'success',
            title: 'Copiado',
            message: 'Texto copiado al portapapeles.',
          });
        },
      },
    ];

    if (item.isUrl) {
      actions.push({
        label: 'Abrir enlace',
        variant: 'primary' as const,
        onPress: async () => {
          const finalUrl = sanitizeUrl(item.data);
          try {
            await Linking.openURL(finalUrl);
          } catch {
            showPopup({
              type: 'error',
              title: 'Error de navegación',
              message: 'No fue posible abrir la dirección en el navegador.',
            });
          }
        },
      });
    }

    showPopup({
      type: 'info',
      title: 'Detalle del Código',
      message: `Tipo: ${item.type}\n\n${item.data}`,
      actions,
      dismissible: true,
    });
  };

  return (
    <ScreenWrapper>
      <Header
        title="Lector de Códigos"
        subtitle="Escaneo de QR, EAN-13, EAN-8, Code128 y más"
      />

      <Container style={{ paddingVertical: theme.spacing.md }}>
        {!isGranted ? (
          <PermissionBanner
            type="camera"
            status={status}
            onRequest={requestPermission}
            onOpenSettings={openAppSettings}
          />
        ) : (
          <View style={styles.scannerWrapper}>
            {/* Visor de escaneo */}
            <View style={styles.cameraContainer}>
              <CameraView
                style={styles.camera}
                barcodeScannerSettings={{
                  barcodeTypes: [
                    'qr',
                    'ean13',
                    'ean8',
                    'code128',
                    'code39',
                    'upc_a',
                    'upc_e',
                    'datamatrix',
                  ],
                }}
                onBarcodeScanned={isScanning ? handleScanCallback : undefined}
              >
                {/* Marco de mira y overlays oscuros */}
                <View style={styles.overlay}>
                  <View style={styles.topMask}>
                    <Text
                      variant="body"
                      weight="bold"
                      color="#FFFFFF"
                      align="center"
                      style={{ textShadowColor: '#000', textShadowRadius: 4 }}
                    >
                      {isScanning ? 'Alinea el código dentro del marco' : 'Lectura procesada'}
                    </Text>
                  </View>

                  <View style={styles.middleRow}>
                    <View style={styles.sideMask} />
                    <View
                      style={[
                        styles.targetBox,
                        {
                          borderColor: isScanning ? theme.colors.primary : theme.colors.success,
                        },
                      ]}
                    >
                      {/* Esquinas decorativas */}
                      <View style={[styles.cornerTL, { borderColor: theme.colors.primary }]} />
                      <View style={[styles.cornerTR, { borderColor: theme.colors.primary }]} />
                      <View style={[styles.cornerBL, { borderColor: theme.colors.primary }]} />
                      <View style={[styles.cornerBR, { borderColor: theme.colors.primary }]} />
                    </View>
                    <View style={styles.sideMask} />
                  </View>

                  <View style={styles.bottomMask}>
                    <Button
                      label={isScanning ? 'Pausar Escaneo' : 'Reanudar Escaneo'}
                      variant={isScanning ? 'secondary' : 'primary'}
                      icon={isScanning ? 'pause' : 'play'}
                      size="sm"
                      onPress={isScanning ? pauseScanning : resumeScanning}
                    />
                  </View>
                </View>
              </CameraView>
            </View>

            {/* Listado de historial persistente */}
            <HistoryList
              items={history}
              onClear={clearHistory}
              onSelectItem={handleSelectHistoryItem}
            />
          </View>
        )}
      </Container>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scannerWrapper: {
    width: '100%',
  },
  cameraContainer: {
    height: 380,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    flexDirection: 'column',
  },
  topMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  middleRow: {
    height: 220,
    flexDirection: 'row',
  },
  sideMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  targetBox: {
    width: 220,
    height: 220,
    borderWidth: 1.5,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  bottomMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  cornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
});

export default ScannerScreen;
