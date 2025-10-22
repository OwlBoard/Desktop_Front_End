'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Force dynamic rendering (no static generation at build time)
export const dynamic = 'force-dynamic';

export default function MyBoardsPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    if (typeof window === 'undefined') return;
    
    const userId = localStorage.getItem('user_id');
    
    if (!userId) {
      // Not logged in, redirect to login
      router.push('/login');
    } else {
      // Logged in, redirect to their dashboards page
      router.push(`/user/${userId}/dashboards`);
    }
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-gray-600">Cargando tus tableros...</p>
      </div>
    </div>
  );
}
