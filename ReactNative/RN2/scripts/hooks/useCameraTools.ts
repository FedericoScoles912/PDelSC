import { useState, useRef, useCallback } from 'react';
import { CameraView, CameraType } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { usePopup } from './usePopup';

export interface CameraToolsState {
  facing: CameraType;
  torch: boolean;
  photos: string[];
  lastPhoto: string | null;
  isCapturing: boolean;
  cameraRef: React.RefObject<CameraView | null>;
  toggleFacing: () => void;
  toggleTorch: () => void;
  takePicture: () => Promise<string | null>;
  clearSessionPhotos: () => void;
}

/**
 * Hook para controlar las herramientas de la cámara (cambio de lente, linterna, captura y galería de sesión).
 */
export function useCameraTools(): CameraToolsState {
  const [facing, setFacing] = useState<CameraType>('back');
  const [torch, setTorch] = useState<boolean>(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const cameraRef = useRef<CameraView | null>(null);
  const { showPopup } = usePopup();

  const toggleFacing = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  }, []);

  const toggleTorch = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setTorch((prev) => !prev);
  }, []);

  const takePicture = useCallback(async (): Promise<string | null> => {
    if (!cameraRef.current || isCapturing) return null;

    try {
      setIsCapturing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: false,
      });

      if (photo && photo.uri) {
        setPhotos((prev) => [photo.uri, ...prev]);
        setIsCapturing(false);
        return photo.uri;
      }
      setIsCapturing(false);
      return null;
    } catch (err) {
      setIsCapturing(false);
      showPopup({
        type: 'error',
        title: 'Error al capturar',
        message: 'No fue posible tomar la fotografía con la cámara activa.',
      });
      return null;
    }
  }, [isCapturing, showPopup]);

  const clearSessionPhotos = useCallback(() => {
    setPhotos([]);
  }, []);

  return {
    facing,
    torch,
    photos,
    lastPhoto: photos.length > 0 ? photos[0] : null,
    isCapturing,
    cameraRef,
    toggleFacing,
    toggleTorch,
    takePicture,
    clearSessionPhotos,
  };
}
