'use client';

import React from 'react';
import BoardTopBar from '@/components/BoardTopBar';
import Whiteboard from '@/components/Whiteboard';

// Force dynamic rendering (no static generation at build time)
export const dynamic = 'force-dynamic';

export default function BoardPage() {
  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        background: '#f8fafc',
        overflow: 'hidden',
      }}
    >
      {/* Top bar */}
      <BoardTopBar />

      {/* Whiteboard area */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <Whiteboard />
      </div>
    </div>
  );
}
