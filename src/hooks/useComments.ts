import { useState, useCallback, useEffect } from "react";
import { CommentDef } from "../types/types";
import { CommentsApiService } from "../services/commentsApi";

interface UseCommentsProps {
  dashboardId: string;
  userId: string;
}

export const useComments = ({ dashboardId, userId }: UseCommentsProps) => {
  const [comments, setComments] = useState<CommentDef[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Cargar todos los comentarios
  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const backendComments = await CommentsApiService.getCommentsByDashboard(dashboardId);
      const frontendComments = backendComments.map(CommentsApiService.convertToFrontendComment);
      setComments(frontendComments);
    } catch (err) {
      console.error("Error loading comments:", err);
      setError(err instanceof Error ? err.message : "Error loading comments");
    } finally {
      setLoading(false);
    }
  }, [dashboardId]);

  // 🔹 Crear comentario temporal
  const createTemporaryComment = useCallback((x: number, y: number) => {
    const tempId = `temp-${Date.now()}`;
    const tempComment: CommentDef = {
      id: tempId,
      backendId: undefined,
      text: "",
      x,
      y,
      user: { name: "Usuario" },
      dashboardId,
      userId,
    };
    setComments((prev) => [...prev, tempComment]);
    return tempComment;
  }, [dashboardId, userId]);

  // 🔹 Guardar comentario en backend
  const saveTemporaryComment = useCallback(
    async (tempId: string, text: string) => {
      const comment = comments.find((c) => c.id === tempId);
      if (!comment) return;

      const newComment = await CommentsApiService.createComment(
        dashboardId,
        userId,
        CommentsApiService.convertToBackendComment({ ...comment, text })
      );
      const converted = CommentsApiService.convertToFrontendComment(newComment);

      setComments((prev) =>
        prev.map((c) => (c.id === tempId ? converted : c))
      );
      return converted;
    },
    [comments, dashboardId, userId]
  );

  // 🔹 Cancelar comentario temporal
  const cancelTemporaryComment = useCallback((id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // 🔹 Actualizar comentario
  const updateComment = useCallback(async (id: string, text: string) => {
    const comment = comments.find((c) => c.id === id);
    if (!comment?.backendId) return;
    const updated = await CommentsApiService.updateComment(comment.backendId, { content: text });
    const converted = CommentsApiService.convertToFrontendComment(updated);
    setComments((prev) => prev.map((c) => (c.id === id ? converted : c)));
  }, [comments]);

  // 🔹 Eliminar comentario
  const deleteComment = useCallback(async (id: string) => {
    const comment = comments.find((c) => c.id === id);
    if (!comment?.backendId) return;
    await CommentsApiService.deleteComment(comment.backendId);
    setComments((prev) => prev.filter((c) => c.id !== id));
  }, [comments]);

  // 🔹 Mover comentario (drag)
  const updateCommentPosition = useCallback((id: string, x: number, y: number) => {
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, x, y } : c)));
  }, []);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

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
  };
};
