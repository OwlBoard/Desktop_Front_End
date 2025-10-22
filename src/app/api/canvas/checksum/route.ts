// API route for canvas checksum
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

    // Fetch checksum from Canvas Service (expects 'id' parameter)
    const response = await fetch(
      `${CANVAS_API_URL}/canvas/checksum?id=${encodeURIComponent(canvasId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to get checksum' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error getting checksum:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
