// app/api/users/[id]/route.ts
// Server-side API route - runs on Next.js server, not browser

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user ID from cookie (server-side)
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    // Optional: Validate user can only access their own data
    if (userId && userId !== params.id) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot access other user data' },
        { status: 403 }
      );
    }

    // Make request to FastAPI backend from server
    // This call is NOT visible to the browser
    const backendUrl = process.env.USER_SERVICE_URL || 'http://user_service:8000';
    const response = await fetch(`${backendUrl}/users/${params.id}`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: response.status }
      );
    }

    const userData = await response.json();
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    // Only allow users to update their own profile
    if (!userId || userId !== params.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const backendUrl = process.env.USER_SERVICE_URL || 'http://user_service:8000';
    const response = await fetch(`${backendUrl}/users/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: response.status }
      );
    }

    const userData = await response.json();
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
