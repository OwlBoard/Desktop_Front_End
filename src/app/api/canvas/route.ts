// API route for canvas operations - Load canvas
import { NextRequest, NextResponse } from 'next/server';

const CANVAS_API_URL = process.env.CANVAS_SERVICE_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const canvasId = searchParams.get('canvasId');

    if (!canvasId) {
      return NextResponse.json(
        { error: 'canvasId query parameter is required' },
        { status: 400 }
      );
    }

    // Fetch canvas from Canvas Service (Canvas Service expects 'id' not 'canvasId')
    const response = await fetch(
      `${CANVAS_API_URL}/canvas?id=${encodeURIComponent(canvasId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Fresh data for SSR
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Canvas not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to load canvas' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error loading canvas:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
