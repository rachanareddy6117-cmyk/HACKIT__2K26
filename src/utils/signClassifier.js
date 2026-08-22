/**
 * Landmark-based Gesture Classifier for EchoSign
 * Analyzes MediaPipe 21 hand landmarks to classify gestures.
 */

// Helper to calculate 3D or 2D Euclidean distance between two landmarks
function dist(lm1, lm2) {
  const dx = lm1.x - lm2.x;
  const dy = lm1.y - lm2.y;
  const dz = (lm1.z || 0) - (lm2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Classifies gesture from MediaPipe hand landmarks (21 points)
 * @param {Array} landmarks Array of {x, y, z} objects
 * @returns {Object} { sign: string, confidence: number }
 */
export function classifyGesture(landmarks) {
  if (!landmarks || landmarks.length < 21) {
    return { sign: 'UNKNOWN', confidence: 0 };
  }

  const wrist = landmarks[0];

  // Key fingertip and PIP/MCP joint indices
  // Thumb: 4 (tip), 2 (MCP)
  // Index: 8 (tip), 6 (PIP), 5 (MCP)
  // Middle: 12 (tip), 10 (PIP), 9 (MCP)
  // Ring: 16 (tip), 14 (PIP), 13 (MCP)
  // Pinky: 20 (tip), 18 (PIP), 17 (MCP)

  const isThumbExtended = dist(landmarks[4], wrist) > dist(landmarks[2], wrist) * 1.2;
  const isIndexExtended = landmarks[8].y < landmarks[6].y;
  const isMiddleExtended = landmarks[12].y < landmarks[10].y;
  const isRingExtended = landmarks[16].y < landmarks[14].y;
  const isPinkyExtended = landmarks[20].y < landmarks[18].y;

  const extendedFingersCount = [
    isIndexExtended,
    isMiddleExtended,
    isRingExtended,
    isPinkyExtended
  ].filter(Boolean).length;

  // 1. OPEN HAND: All 4 fingers extended
  if (extendedFingersCount >= 4) {
    return { sign: 'OPEN_HAND', confidence: 0.95 };
  }

  // 2. FIST: All 4 fingers curled down
  if (extendedFingersCount === 0 && !isThumbExtended) {
    return { sign: 'FIST', confidence: 0.93 };
  }

  // 3. THUMBS UP: Thumb extended upwards, all other fingers curled
  if (isThumbExtended && extendedFingersCount === 0 && landmarks[4].y < landmarks[3].y) {
    return { sign: 'THUMBS_UP', confidence: 0.94 };
  }

  // 4. POINT: Index finger extended, others curled
  if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    return { sign: 'POINT', confidence: 0.91 };
  }

  // 5. TWO FINGERS (PEACE / VICTORY): Index and Middle extended
  if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    return { sign: 'TWO_FINGERS', confidence: 0.92 };
  }

  return { sign: 'UNKNOWN', confidence: 0.60 };
}

export const GESTURE_MAP = {
  OPEN_HAND: { text: 'HELLO', emoji: '👋', speech: 'Hello' },
  THUMBS_UP: { text: 'YES', emoji: '👍', speech: 'Yes' },
  FIST: { text: 'STOP', emoji: '✊', speech: 'Stop' },
  POINT: { text: 'THERE', emoji: '👉', speech: 'There' },
  TWO_FINGERS: { text: 'TWO', emoji: '✌️', speech: 'Two' },
  UNKNOWN: { text: 'GESTURE DETECTED', emoji: '✋', speech: 'Gesture' }
};
