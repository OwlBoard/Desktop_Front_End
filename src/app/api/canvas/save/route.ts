// API route for canvas operations - Save canvas
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const CANVAS_API_URL = process.env.CANVAS_SERVICE_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    // Get auth from cookies (server-side) - optional for now
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value || 'anonymous';

    const body = await request.json();

    // Validate required fields
    if (!body.canvasId) {
      return NextResponse.json(
        { error: 'canvasId is required' },
        { status: 400 }
      );
    }

    // Add userId to the request
    const canvasData = {
      ...body,
      userId
    };

    // Save canvas to Canvas Service
    const response = await fetch(`${CANVAS_API_URL}/canvas/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(canvasData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to save canvas', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error saving canvas:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
