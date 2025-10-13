// src/services/commentsApi.ts
import { CommentDef } from '../types/types';

const API_BASE_URL = 'http://localhost:8001/comments';

export interface CreateCommentRequest {
  content: string;
  coordinates: string; // formato "x,y"
}

// Basado en el schema CommentOut del Swagger
export interface CommentResponse {
  _id?: string;  // Optional porque puede venir como 'id'
  id?: string;   // Optional porque puede venir como '_id'
  dashboard_id: string;
  user_id: string;
  content: string;
  coordinates: number[];
  created_at: string;
  updated_at: string;
}

export interface UpdateCommentRequest {
  content: string;
}

export class CommentsApiService {
  
  // Crear un nuevo comentario
  static async createComment(
    dashboardId: string, 
    userId: string, 
    commentData: CreateCommentRequest
  ): Promise<CommentResponse> {
    console.log('Creando comentario:', { dashboardId, userId, commentData });
    
    const url = `${API_BASE_URL}/dashboards/${dashboardId}/users/${userId}/comments`;
    console.log('URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        content: commentData.content,
        coordinates: commentData.coordinates
      }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', errorData);
      
      if (response.status === 422) {
        const validationErrors = errorData.detail || [];
        throw new Error(`Validation Error: ${validationErrors.map((e: any) => e.msg).join(', ')}`);
      }
      
      throw new Error(`Error creating comment: ${response.status} - ${errorData.detail || response.statusText}`);
    }

    const result = await response.json();
    console.log('Comment created successfully:', result);
    return result;
  }

  // Obtener todos los comentarios de un tablero
  static async getCommentsByDashboard(dashboardId: string): Promise<CommentResponse[]> {
    console.log('Fetching comments for dashboard:', dashboardId);
    const url = `${API_BASE_URL}/dashboards/${dashboardId}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      // If 404, the dashboard might not have comments yet - return empty array
      if (response.status === 404) {
        console.log('No comments found for dashboard (404)');
        return [];
      }
      throw new Error(`Error fetching comments: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Comments fetched:', result);
    return result;
  }

  // Actualizar un comentario
  static async updateComment(commentId: string, updateData: UpdateCommentRequest): Promise<CommentResponse> {
    console.log('Updating comment:', commentId, updateData);
    
    const response = await fetch(`${API_BASE_URL}/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error updating comment: ${response.status} - ${errorData.detail || response.statusText}`);
    }

    const result = await response.json();
    console.log('Comment updated:', result);
    return result;
  }

  // Eliminar un comentario
  static async deleteComment(commentId: string): Promise<void> {
    console.log('Deleting comment:', commentId);
    
    const response = await fetch(`${API_BASE_URL}/${commentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error deleting comment: ${response.status} - ${response.statusText}`);
    }
    
    console.log('Comment deleted successfully');
  }

  // Convertir respuesta del backend a formato del frontend
  static convertToFrontendComment(backendComment: CommentResponse): CommentDef {
    // Handle both _id and id from backend
    const commentId = backendComment._id || backendComment.id || '';
    
    return {
      id: commentId,
      x: backendComment.coordinates[0],
      y: backendComment.coordinates[1],
      text: backendComment.content,
      user: {
        name: "Usuario" // Por ahora placeholder, después integrar con user service
      },
      // Añadimos campos adicionales para tracking
      backendId: commentId,
      dashboardId: backendComment.dashboard_id,
      userId: backendComment.user_id,
      createdAt: backendComment.created_at,
      updatedAt: backendComment.updated_at
    };
  }

  // Convertir comentario del frontend para enviar al backend
  static convertToBackendComment(frontendComment: CommentDef): CreateCommentRequest {
    return {
      content: frontendComment.text,
      coordinates: `${frontendComment.x},${frontendComment.y}`
    };
  }

}