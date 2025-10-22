// app/api/users/[id]/dashboards/route.ts
// Server-side API route for fetching user dashboards

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authentication from cookies
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    // Make request to FastAPI backend from server
    const backendUrl = process.env.USER_SERVICE_URL || 'http://user_service:8000';
    const response = await fetch(`${backendUrl}/users/${params.id}/dashboards`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch dashboards' },
        { status: response.status }
      );
    }

    const dashboards = await response.json();
    
    // Return dashboards with additional metadata
    return NextResponse.json({
      dashboards,
      isOwnDashboards: userId === params.id,
    });
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    // Only allow users to create dashboards for themselves
    if (!userId || userId !== params.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const backendUrl = process.env.USER_SERVICE_URL || 'http://user_service:8000';
    const response = await fetch(`${backendUrl}/users/${params.id}/dashboards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to create dashboard' },
        { status: response.status }
      );
    }

    const dashboard = await response.json();
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Error creating dashboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
