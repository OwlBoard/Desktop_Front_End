import { useEffect, useRef, useCallback } from 'react';
import { CanvasApiService } from '../services/canvasApi';
import { ShapeDef } from '../types/whiteboard';

interface UseCanvasSyncProps {
  dashboardId: string;
  shapes: ShapeDef[];
  onSync: () => void; // Función para recargar el canvas
  isEnabled: boolean;
}

/**
 * Hook para sincronizar el estado del canvas con el backend mediante polling de checksum.
 * @param dashboardId - ID del tablero a sincronizar.
 * @param shapes - El estado actual de las figuras en el frontend.
 * @param onSync - Callback que se ejecuta cuando se detectan cambios y es necesario recargar.
 * @param isEnabled - Booleano para activar o desactivar la sincronización.
 */
export const useCanvasSync = ({ dashboardId, shapes, onSync, isEnabled }: UseCanvasSyncProps) => {
  const localChecksumRef = useRef<string | null>(null);
  const isCheckingRef = useRef(false);

  // Función para calcular el checksum local (simplificada)
  // NOTA: Para una implementación robusta, esta lógica debería replicar
  // exactamente la del backend (ordenamiento, campos incluidos, etc.).
  const calculateLocalChecksum = useCallback(async (currentShapes: ShapeDef[]): Promise<string> => {
    const data = JSON.stringify(currentShapes.map(({ id, ...rest }) => rest)); // Ignora IDs de frontend
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }, []);

  useEffect(() => {
    if (!isEnabled || !dashboardId) return;

    const intervalId = setInterval(async () => {
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;

      try {
        const remoteChecksum = await CanvasApiService.getChecksum(dashboardId);
        const currentLocalChecksum = await calculateLocalChecksum(shapes);
 
        // Si el checksum local y el remoto ya coinciden, no hacemos nada.
        if (remoteChecksum === currentLocalChecksum) {
          localChecksumRef.current = remoteChecksum; // Actualizamos la referencia por si acaso.
          isCheckingRef.current = false;
          return;
        }
 
        // Si el checksum remoto ha cambiado desde la última vez que lo vimos,
        // y no coincide con nuestro estado local actual, significa que otro usuario hizo un cambio.
        if (localChecksumRef.current !== null && remoteChecksum !== localChecksumRef.current) {
          console.log("Cambios detectados en el servidor. Sincronizando...", { local: localChecksumRef.current, remote: remoteChecksum });
          onSync(); // Disparamos la recarga del canvas
        }
        localChecksumRef.current = remoteChecksum;
      } catch (error) {
        console.error("Error durante la verificación de checksum:", error);
      } finally {
        isCheckingRef.current = false;
      }
    }, 4000);

    return () => clearInterval(intervalId);
  }, [dashboardId, shapes, isEnabled, onSync, calculateLocalChecksum]);
};