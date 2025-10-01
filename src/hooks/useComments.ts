// src/hooks/useComments.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { CommentDef } from '../types/types';
import { CommentsApiService, CommentResponse } from '../services/commentsApi';

interface UseCommentsProps {
  dashboardId: string;
  userId: string; // Por ahora hardcoded, después integrar con auth
}

export const useComments = ({ dashboardId, userId }: UseCommentsProps) => {
  const [comments, setComments] = useState<CommentDef[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Referencia para el debounce de actualización de posición
  const positionUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar comentarios del tablero
  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const backendComments = await CommentsApiService.getCommentsByDashboard(dashboardId);
      const frontendComments = backendComments.map(CommentsApiService.convertToFrontendComment);
      setComments(frontendComments);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError(err instanceof Error ? err.message : 'Error loading comments');
    } finally {
      setLoading(false);
    }
  }, [dashboardId]);

  // Crear comentario temporal (para empezar a editar sin guardar aún)
  const createTemporaryComment = useCallback((x: number, y: number) => {
    const tempId = `temp-${Date.now()}`;
    const tempComment: CommentDef = {
      id: tempId,
      backendId: undefined, // Sin ID de backend hasta que se guarde
      text: "",
      x: Math.round(x),
      y: Math.round(y),
      user: { name: "Usuario" }, // Temporal
      dashboardId,
      userId
    };
    
    setComments(prev => [...prev, tempComment]);
    return tempComment;
  }, [dashboardId, userId]);

  // Guardar comentario temporal (convertirlo en real)
  const saveTemporaryComment = useCallback(async (tempCommentId: string, text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) {
      throw new Error('El contenido del comentario no puede estar vacío');
    }

    const tempComment = comments.find(c => c.id === tempCommentId);
    if (!tempComment) {
      throw new Error('Comentario temporal no encontrado');
    }

    setError(null);
    try {
      const newComment = await CommentsApiService.createComment(dashboardId, userId, {
        content: trimmedText,
        coordinates: `${tempComment.x},${tempComment.y}`
      });
      
      const frontendComment = CommentsApiService.convertToFrontendComment(newComment);
      
      // Reemplazar el comentario temporal con el real
      setComments(prev => prev.map(c => 
        c.id === tempCommentId ? frontendComment : c
      ));
      
      return frontendComment;
    } catch (err) {
      console.error('Error saving comment:', err);
      setError(err instanceof Error ? err.message : 'Error saving comment');
      // Eliminar el comentario temporal si falla el guardado
      setComments(prev => prev.filter(c => c.id !== tempCommentId));
      throw err;
    }
  }, [dashboardId, userId, comments]);

  // Cancelar comentario temporal
  const cancelTemporaryComment = useCallback((tempCommentId: string) => {
    setComments(prev => prev.filter(c => c.id !== tempCommentId));
  }, []);

  // Actualizar comentario
  const updateComment = useCallback(async (commentId: string, newText: string) => {
    setError(null);
    
    // No actualizar comentario si el texto está vacío
    const trimmedText = newText.trim();
    if (!trimmedText) {
      throw new Error('El contenido del comentario no puede estar vacío');
    }
    
    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment?.backendId) {
        throw new Error('Comment not found or missing backend ID');
      }

      const updatedComment = await CommentsApiService.updateComment(comment.backendId, {
        content: trimmedText
      });

      const frontendComment = CommentsApiService.convertToFrontendComment(updatedComment);
      
      setComments(prev => prev.map(c => 
        c.id === commentId ? frontendComment : c
      ));
      
      return frontendComment;
    } catch (err) {
      console.error('Error updating comment:', err);
      setError(err instanceof Error ? err.message : 'Error updating comment');
      throw err;
    }
  }, [comments]);

  // Eliminar comentario
  const deleteComment = useCallback(async (commentId: string) => {
    setError(null);
    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment?.backendId) {
        throw new Error('Comment not found or missing backend ID');
      }

      await CommentsApiService.deleteComment(comment.backendId);
      
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(err instanceof Error ? err.message : 'Error deleting comment');
      throw err;
    }
  }, [comments]);

  // Actualizar posición del comentario inmediatamente (para UX fluido)
  const updateCommentPositionImmediate = useCallback((commentId: string, x: number, y: number) => {
    setComments(prev => prev.map(c => 
      c.id === commentId ? { ...c, x: Math.round(x), y: Math.round(y) } : c
    ));
  }, []);

  // Actualizar posición del comentario con debounce (para persistencia)
  const updateCommentPositionPersistent = useCallback((commentId: string, x: number, y: number) => {
    // Limpiar timeout anterior si existe
    if (positionUpdateTimeoutRef.current) {
      clearTimeout(positionUpdateTimeoutRef.current);
    }

    // Configurar nuevo timeout para actualizar en el backend después de 500ms
    positionUpdateTimeoutRef.current = setTimeout(async () => {
      try {
        const comment = comments.find(c => c.id === commentId);
        if (comment?.backendId) {
          await CommentsApiService.updateCommentCoordinates(
            comment.backendId, 
            [Math.round(x), Math.round(y)]
          );
          console.log('Position updated in backend for comment:', commentId);
        }
      } catch (err) {
        console.error('Error updating comment position in backend:', err);
        setError(err instanceof Error ? err.message : 'Error updating comment position');
      }
    }, 500);
  }, [comments]);

  // Función combinada que actualiza inmediatamente y programa la persistencia
  const updateCommentPosition = useCallback((commentId: string, x: number, y: number) => {
    updateCommentPositionImmediate(commentId, x, y);
    updateCommentPositionPersistent(commentId, x, y);
  }, [updateCommentPositionImmediate, updateCommentPositionPersistent]);

  // Cargar comentarios al montar el componente
  useEffect(() => {
    if (dashboardId && userId) {
      loadComments();
    }
  }, [dashboardId, userId, loadComments]);

  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (positionUpdateTimeoutRef.current) {
        clearTimeout(positionUpdateTimeoutRef.current);
      }
    };
  }, []);

  return {
    comments,
    loading,
    error,
    createTemporaryComment,
    saveTemporaryComment,
    cancelTemporaryComment,
    updateComment,
    deleteComment,
    updateCommentPosition,
    loadComments
  };
};