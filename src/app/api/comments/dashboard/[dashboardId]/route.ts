// API route for comments by dashboard
import { NextRequest, NextResponse } from 'next/server';

const COMMENTS_API_URL = process.env.COMMENTS_SERVICE_URL || 'http://localhost:8001';

export async function GET(
  request: NextRequest,
  { params }: { params: { dashboardId: string } }
) {
  try {
    const { dashboardId } = params;

    // Fetch comments from Comments Service
    const response = await fetch(`${COMMENTS_API_URL}/comments/dashboard/${dashboardId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure fresh data for SSR
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { dashboardId: string } }
) {
  try {
    const { dashboardId } = params;
    const body = await request.json();

    // Create comment in Comments Service
    const response = await fetch(`${COMMENTS_API_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        dashboard_id: dashboardId,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
