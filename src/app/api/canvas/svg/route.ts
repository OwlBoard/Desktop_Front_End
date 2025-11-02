// API route for canvas SVG export
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

    // Fetch SVG from Canvas Service (expects 'id' parameter)
    const response = await fetch(
      `${CANVAS_API_URL}/canvas/svg?id=${encodeURIComponent(canvasId)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'image/svg+xml',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to generate SVG' },
        { status: response.status }
      );
    }

    const svgData = await response.text();
    
    // Return SVG with proper content type
    return new NextResponse(svgData, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Error generating SVG:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
