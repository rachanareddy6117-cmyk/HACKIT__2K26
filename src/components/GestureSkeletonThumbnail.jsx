import React from 'react';
import { TARGET_SKELETON_TEMPLATES } from '../utils/signClassifier';

const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],
  [9,13],[13,14],[14,15],[15,16],
  [13,17],[0,17],[17,18],[18,19],[19,20],
];

/**
 * 2D Line and Dot Design Component for Hand Gestures
 * Renders the accurate anatomical skeleton pattern with glowing joint dots and connecting lines.
 */
export default function GestureSkeletonThumbnail({ sign = 'OPEN_HAND', size = 70, strokeColor = '#00f2fe', dotColor = '#9d50bb' }) {
  const normalizedKey = (sign || 'OPEN_HAND').toUpperCase();
  const template = TARGET_SKELETON_TEMPLATES[normalizedKey] || TARGET_SKELETON_TEMPLATES.OPEN_HAND;

  const W = 100;
  const H = 100;

  return (
    <div style={{
      width: size,
      height: size,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(5, 8, 14, 0.85)',
      borderRadius: 10,
      border: `1px solid ${strokeColor}44`,
      boxShadow: `0 0 14px ${strokeColor}22`,
      padding: 4,
      overflow: 'hidden',
    }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        style={{ filter: `drop-shadow(0 0 4px ${strokeColor}66)` }}
      >
        {/* Connecting Lines */}
        {CONNECTIONS.map(([a, b], idx) => {
          const p1 = template[a];
          const p2 = template[b];
          if (!p1 || !p2) return null;
          return (
            <line
              key={`line-${idx}`}
              x1={p1.x * W}
              y1={p1.y * H}
              x2={p2.x * W}
              y2={p2.y * H}
              stroke={strokeColor}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          );
        })}

        {/* Joint Nodes */}
        {template.map((pt, idx) => {
          const isFingertip = idx === 4 || idx === 8 || idx === 12 || idx === 16 || idx === 20;
          return (
            <circle
              key={`dot-${idx}`}
              cx={pt.x * W}
              cy={pt.y * H}
              r={isFingertip ? 3.2 : 2.0}
              fill={isFingertip ? strokeColor : dotColor}
              stroke="#ffffff"
              strokeWidth="0.8"
            />
          );
        })}
      </svg>
    </div>
  );
}
