'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Whiteboard from '@/components/Whiteboard';
import BoardTopBar from '@/components/BoardTopBar';
import ChatPanel from '@/components/ChatPanel';

// Force dynamic rendering (no static generation at build time)
export const dynamic = 'force-dynamic';

export default function BoardPage() {
  const params = useParams();
  const dashboardId = params.id as string;
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get userId from localStorage
    const storedUserId = localStorage.getItem('user_id');
    setUserId(storedUserId);
  }, []);

  const handleNew = () => {
    console.log('🆕 New board');
    // TODO: Implement via Whiteboard component context
  };

  const handleSave = () => {
    console.log('💾 Save board');
    // TODO: Implement via Whiteboard component context
  };

  const handleMoveToBin = () => {
    console.log('🗑️ Move to bin');
  };

  const handleUndo = () => {
    console.log('↩️ Undo');
    // TODO: Implement via Whiteboard component context
  };

  const handleRedo = () => {
    console.log('↪️ Redo');
    // TODO: Implement via Whiteboard component context
  };

  // Show loading state while userId is being retrieved
  if (!userId) {
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
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        background: 'rgba(15, 23, 42, 0.65)',
        overflow: 'hidden',
      }}
    >
      {/* Top bar - Fixed height */}
      <div style={{ 
        height: '64px', 
        flexShrink: 0,
        zIndex: 1000 
      }}>
        <BoardTopBar
          onNew={handleNew}
          onSave={handleSave}
          onMoveToBin={handleMoveToBin}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
      </div>

      {/* Whiteboard - Flexible height */}
      <div style={{ 
        flex: 1,
        minHeight: 0,
        overflow: 'hidden'
      }}>
        <Whiteboard dashboardId={dashboardId} userId={userId} />
      </div>

      {/* Chat Panel - Fixed right sidebar */}
      <ChatPanel dashboardId={dashboardId} defaultCollapsed={false} />
    </div>
  );
}
