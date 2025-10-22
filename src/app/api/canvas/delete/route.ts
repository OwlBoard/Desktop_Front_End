// API route for deleting canvas
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const CANVAS_API_URL = process.env.CANVAS_SERVICE_URL || 'http://localhost:8080';

export async function DELETE(request: NextRequest) {
  try {
    // Get auth from cookies (server-side)
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const canvasId = searchParams.get('canvasId');

    if (!canvasId) {
      return NextResponse.json(
        { error: 'canvasId query parameter is required' },
        { status: 400 }
      );
    }

    // Delete canvas from Canvas Service (expects 'id' parameter)
    const response = await fetch(
      `${CANVAS_API_URL}/canvas?id=${encodeURIComponent(canvasId)}`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to delete canvas' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error deleting canvas:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
