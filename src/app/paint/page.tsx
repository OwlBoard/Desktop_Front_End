'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// Force dynamic rendering (no static generation at build time)
export const dynamic = 'force-dynamic';

function PaintContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dashboardId = searchParams.get('id');

  useEffect(() => {
    // Redirect to the board route with proper path parameter
    if (dashboardId) {
      console.log('Redirecting from /paint?id=' + dashboardId + ' to /board/' + dashboardId);
      router.replace(/board/);
    } else {
      console.log('No dashboard ID provided, redirecting to home');
      router.replace('/');
    }
  }, [dashboardId, router]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: 'rgba(15, 23, 42, 0.65)',
        color: 'white',
        fontSize: '18px',
      }}
    >
      Redirecting to board...
    </div>
  );
}

export default function PaintPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.65)',
        color: 'white'
      }}>
        Loading...
      </div>
    }>
      <PaintContent />
    </Suspense>
  );
}
