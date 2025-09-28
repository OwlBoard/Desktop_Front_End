// src/services/commentsApi.ts
import { CommentDef } from '../types/types';

const API_BASE_URL = 'http://localhost:8001/comments';

export interface CreateCommentRequest {
  content: string;
  coordinates: string; // formato "x,y"
}

// Basado en el schema CommentOut del Swagger
export interface CommentResponse {
  _id: string;  // PydanticObjectId - 24 caracteres hex
  dashboard_id: string;  // PydanticObjectId
  user_id: string;  // PydanticObjectId  
  content: string;  // 1-500 caracteres
  coordinates: number[];  // Array de números [x, y]
  created_at: string;  // ISO date-time string
  updated_at: string;  // ISO date-time string
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
    
    const url = `${API_BASE_URL}/dashboards/${dashboardId}/users/${userId}/comments?coordinates=${commentData.coordinates}`;
    console.log('URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ content: commentData.content }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', errorData);
      
      // Manejo específico de errores según el Swagger
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
    const response = await fetch(`${API_BASE_URL}/dashboards/${dashboardId}`);

    if (!response.ok) {
      throw new Error(`Error fetching comments: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }

  // Actualizar un comentario
  static async updateComment(commentId: string, updateData: UpdateCommentRequest): Promise<CommentResponse> {
    const response = await fetch(`${API_BASE_URL}/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error updating comment: ${response.status} - ${errorData.detail || response.statusText}`);
    }

    return response.json();
  }

  // Eliminar un comentario
  static async deleteComment(commentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${commentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Error deleting comment: ${response.status} - ${response.statusText}`);
    }
  }

  // Convertir respuesta del backend a formato del frontend
  static convertToFrontendComment(backendComment: CommentResponse): CommentDef {
    return {
      id: backendComment._id,
      x: backendComment.coordinates[0],
      y: backendComment.coordinates[1],
      text: backendComment.content,
      user: {
        name: "Usuario" // Por ahora placeholder, después integrar con user service
      },
      // Añadimos campos adicionales para tracking
      backendId: backendComment._id,
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