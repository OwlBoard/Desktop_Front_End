// src/components/CommentNode.tsx
import React from 'react';
import { Group, Circle, Text } from 'react-konva';
import type { CommentDef } from '../types/types';

interface CommentNodeProps {
  comment: CommentDef;
  onDblClick: () => void;
  onDragMove: (e: any) => void; // <-- AÑADIR
  onDragEnd: (e: any) => void;  // <-- AÑADIR
}

const COMMENT_ICON = '💬';
const COMMENT_RADIUS = 4;

export default function CommentNode({ comment, onDblClick, onDragMove, onDragEnd }: CommentNodeProps) {
  return (
    <Group 
        x={comment.x} 
        y={comment.y} 
        onDblClick={onDblClick} 
        onTap={onDblClick} 
        draggable // <-- draggable ya debería estar, pero asegúrate
        onDragMove={onDragMove} // <-- AÑADIR
        onDragEnd={onDragEnd}   // <-- AÑADIR
    >
      {/* Circle background for better visibility */}
      <Circle
        radius={COMMENT_RADIUS}
        fill="#FFD700"
        stroke="#E5A700"
        strokeWidth={2}
        shadowColor="black"
        shadowBlur={5}
        shadowOpacity={0.3}
      />
      {/* Emoji icon */}
      <Text
        text={COMMENT_ICON}
        fontSize={20}
        x={-COMMENT_RADIUS / 2 - 2}
        y={-COMMENT_RADIUS / 2 - 2}
        align="center"
        verticalAlign="middle"
      />
    </Group>
  );
}