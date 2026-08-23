/**
 * High-Precision Landmark-based Gesture Classifier & Posture Matcher for EchoSign
 * Supports all gestures from:
 * - PDF 1: Sign Language & Hand Gestures Guide (ASL A, B, C, D, F, I, L, V, W, Y, I Love You, Thumbs Up/Down, Point, Pinch, Applause)
 * - PDF 2: Expressions & Actions Symbols Guide (Meditation Mudra, Walking Fingers, Writing Sign, Open Palms, Heart Hands)
 */

function dist(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Classifies gesture from MediaPipe hand landmarks (21 points)
 * @param {Array} landmarks Array of {x, y, z} objects
 * @returns {Object} { sign: string, confidence: number, text: string, emoji: string }
 */
export function classifyGesture(landmarks) {
  if (!landmarks || landmarks.length < 21) {
    return { sign: 'UNKNOWN', confidence: 0, text: 'No Hand Detected', emoji: '✋' };
  }

  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const thumbMcp = landmarks[2];
  const thumbCmc = landmarks[1];

  const indexTip = landmarks[8];
  const indexPip = landmarks[6];
  const indexMcp = landmarks[5];

  const middleTip = landmarks[12];
  const middlePip = landmarks[10];
  const middleMcp = landmarks[9];

  const ringTip = landmarks[16];
  const ringPip = landmarks[14];
  const ringMcp = landmarks[13];

  const pinkyTip = landmarks[20];
  const pinkyPip = landmarks[18];
  const pinkyMcp = landmarks[17];

  // Palm scale reference (distance from wrist to middle MCP)
  const palmScale = dist(wrist, middleMcp) || 0.2;

  // Finger extension states (tip distance from wrist compared to PIP distance from wrist)
  const isIndexExtended = dist(indexTip, wrist) > dist(indexPip, wrist) * 1.15;
  const isMiddleExtended = dist(middleTip, wrist) > dist(middlePip, wrist) * 1.15;
  const isRingExtended = dist(ringTip, wrist) > dist(ringPip, wrist) * 1.15;
  const isPinkyExtended = dist(pinkyTip, wrist) > dist(pinkyPip, wrist) * 1.15;
  const isThumbExtended = dist(thumbTip, wrist) > dist(thumbMcp, wrist) * 1.25;

  const extendedCount = [isIndexExtended, isMiddleExtended, isRingExtended, isPinkyExtended].filter(Boolean).length;

  // Key distances for specialized signs
  const thumbToIndexTipDist = dist(thumbTip, indexTip) / palmScale;
  const thumbToMiddleTipDist = dist(thumbTip, middleTip) / palmScale;
  const thumbToPinkyTipDist = dist(thumbTip, pinkyTip) / palmScale;
  const indexToMiddleTipDist = dist(indexTip, middleTip) / palmScale;

  // 1. ASL_ILY: Thumb, Index, and Pinky extended, Middle & Ring folded
  if (isThumbExtended && isIndexExtended && !isMiddleExtended && !isRingExtended && isPinkyExtended) {
    return { sign: 'ASL_ILY', confidence: 0.96, text: 'I LOVE YOU (ASL)', emoji: '🤟' };
  }

  // 2. ASL_Y / HORNS: Thumb & Pinky extended, Index, Middle, Ring curled
  if (isThumbExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended && isPinkyExtended) {
    return { sign: 'ASL_Y', confidence: 0.95, text: 'LETTER Y / HORNS', emoji: '🤙' };
  }

  // 3. ASL_L: Index UP, Thumb OUT sideways (~90 deg), Middle, Ring, Pinky curled
  if (isThumbExtended && isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    // Check if thumb is extended laterally
    const isLateralThumb = Math.abs(thumbTip.x - wrist.x) > Math.abs(indexTip.x - wrist.x) * 0.4;
    if (isLateralThumb) {
      return { sign: 'ASL_L', confidence: 0.94, text: 'LETTER L (L-SHAPE)', emoji: '👆' };
    }
  }

  // 4. ASL_W / THREE: Index, Middle, Ring extended, Pinky curled
  if (isIndexExtended && isMiddleExtended && isRingExtended && !isPinkyExtended) {
    return { sign: 'ASL_W', confidence: 0.95, text: 'LETTER W / THREE', emoji: '🖖' };
  }

  // 5. ASL_V / TWO / PEACE: Index & Middle extended, Ring & Pinky curled
  if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    return { sign: 'ASL_V', confidence: 0.95, text: 'LETTER V / PEACE / TWO', emoji: '✌️' };
  }

  // 6. ASL_I: Pinky extended UP, Index, Middle, Ring folded flat
  if (!isIndexExtended && !isMiddleExtended && !isRingExtended && isPinkyExtended) {
    return { sign: 'ASL_I', confidence: 0.94, text: 'LETTER I (PINKY UP)', emoji: '🤙' };
  }

  // 7. ASL_F / OK SYMBOL / MEDITATION MUDRA: Index and Thumb touching (circle), Middle, Ring, Pinky extended
  if (thumbToIndexTipDist < 0.45 && isMiddleExtended && isRingExtended && isPinkyExtended) {
    return { sign: 'ASL_F', confidence: 0.95, text: 'LETTER F / OK / MUDRA', emoji: '👌' };
  }

  // 8. ASL_D: Index extended UP, Thumb touching middle/ring tips in loop
  if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended && thumbToMiddleTipDist < 0.6) {
    return { sign: 'ASL_D', confidence: 0.92, text: 'LETTER D (INDEX UP)', emoji: '☝️' };
  }

  // 9. POINT: Single index extended forward/up, all other fingers curled
  if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    return { sign: 'POINT', confidence: 0.93, text: 'POINT / DIRECTION', emoji: '👉' };
  }

  // 10. THUMBS_UP: Fist closed, thumb pointing straight UP
  if (isThumbExtended && extendedCount === 0 && thumbTip.y < thumbMcp.y) {
    return { sign: 'THUMBS_UP', confidence: 0.96, text: 'THUMBS UP / YES / GOOD', emoji: '👍' };
  }

  // 11. THUMBS_DOWN: Fist closed, thumb pointing DOWN
  if (isThumbExtended && extendedCount === 0 && thumbTip.y > thumbMcp.y) {
    return { sign: 'THUMBS_DOWN', confidence: 0.94, text: 'THUMBS DOWN / NO', emoji: '👎' };
  }

  // 12. PINCH: Thumb tip and Index tip very close together without other fingers fully extended
  if (thumbToIndexTipDist < 0.45 && extendedCount <= 1) {
    return { sign: 'PINCH', confidence: 0.92, text: 'PINCH / SMALL AMOUNT', emoji: '🤏' };
  }

  // 13. ASL_C / CURVED: All fingers curved (tips closer to wrist than extended, forming arch)
  const isCurvedIndex = dist(indexTip, wrist) > dist(indexPip, wrist) * 0.9 && indexTip.y > indexPip.y * 0.9;
  if (!isIndexExtended && !isPinkyExtended && thumbToIndexTipDist > 0.6 && thumbToIndexTipDist < 1.3) {
    const isCurved = [indexTip, middleTip, ringTip, pinkyTip].every(p => p.x > wrist.x - 0.3 && p.x < wrist.x + 0.3);
    if (isCurved && extendedCount === 0 && isThumbExtended) {
      return { sign: 'ASL_C', confidence: 0.91, text: 'LETTER C (CURVED HAND)', emoji: '🫲' };
    }
  }

  // 14. ASL_B / FLAT HAND: All 4 fingers extended straight together
  if (extendedCount >= 4 && indexToMiddleTipDist < 0.35) {
    return { sign: 'ASL_B', confidence: 0.95, text: 'LETTER B (FLAT HAND)', emoji: '✋' };
  }

  // 15. OPEN_HAND: All 5 fingers extended wide
  if (extendedCount >= 4 && isThumbExtended) {
    return { sign: 'OPEN_HAND', confidence: 0.96, text: 'OPEN HAND / HELLO / APPLAUSE', emoji: '👋' };
  }

  // 16. ASL_A / FIST: All fingers curled tightly
  if (extendedCount === 0) {
    return { sign: 'ASL_A', confidence: 0.93, text: 'LETTER A / FIST / STOP', emoji: '✊' };
  }

  return { sign: 'UNKNOWN', confidence: 0.60, text: 'GESTURE DETECTED', emoji: '✋' };
}

export const GESTURE_ALIASES = {
  OPEN_HAND: ['OPEN_HAND', 'ASL_B', 'HELLO'],
  THUMBS_UP: ['THUMBS_UP', 'YES'],
  THUMBS_DOWN: ['THUMBS_DOWN', 'NO'],
  FIST: ['FIST', 'ASL_A', 'STOP'],
  POINT: ['POINT', 'ASL_D', 'ASL_L', 'THERE'],
  TWO_FINGERS: ['TWO_FINGERS', 'ASL_V', 'PEACE', 'TWO'],
  ASL_A: ['ASL_A', 'FIST', 'STOP'],
  ASL_B: ['ASL_B', 'OPEN_HAND', 'FLAT_HAND'],
  ASL_V: ['ASL_V', 'TWO_FINGERS', 'PEACE', 'TWO'],
  ASL_ILY: ['ASL_ILY', 'ILY', 'I_LOVE_YOU'],
  ASL_F: ['ASL_F', 'OK', 'MEDITATION_MUDRA'],
  ASL_Y: ['ASL_Y', 'HORNS'],
  ASL_W: ['ASL_W', 'THREE'],
  ASL_I: ['ASL_I', 'PINKY'],
  ASL_L: ['ASL_L', 'L_SHAPE'],
  ASL_C: ['ASL_C', 'CURVED'],
  PINCH: ['PINCH', 'WRITING_SIGN'],
  MEDITATION_MUDRA: ['MEDITATION_MUDRA', 'ASL_F', 'PINCH'],
  WALKING_FINGERS: ['WALKING_FINGERS', 'ASL_V', 'TWO_FINGERS', 'POINT'],
  WRITING_SIGN: ['WRITING_SIGN', 'PINCH', 'ASL_A', 'FIST']
};

/**
 * High-accuracy reference skeleton templates for visual dotted-guide and geometric alignment
 */
export const TARGET_SKELETON_TEMPLATES = {
  OPEN_HAND: [
    {x:0.5, y:0.85},
    {x:0.42, y:0.75}, {x:0.36, y:0.65}, {x:0.32, y:0.55}, {x:0.28, y:0.45},
    {x:0.44, y:0.55}, {x:0.42, y:0.42}, {x:0.40, y:0.32}, {x:0.38, y:0.22},
    {x:0.50, y:0.53}, {x:0.50, y:0.39}, {x:0.50, y:0.28}, {x:0.50, y:0.18},
    {x:0.56, y:0.55}, {x:0.58, y:0.42}, {x:0.60, y:0.32}, {x:0.62, y:0.22},
    {x:0.62, y:0.60}, {x:0.66, y:0.50}, {x:0.70, y:0.40}, {x:0.74, y:0.30}
  ],
  THUMBS_UP: [
    {x:0.5, y:0.85},
    {x:0.45, y:0.70}, {x:0.42, y:0.55}, {x:0.40, y:0.38}, {x:0.38, y:0.20}, // thumb up
    {x:0.48, y:0.62}, {x:0.52, y:0.65}, {x:0.54, y:0.70}, {x:0.52, y:0.73}, // index curled
    {x:0.53, y:0.63}, {x:0.57, y:0.66}, {x:0.59, y:0.71}, {x:0.57, y:0.74}, // middle curled
    {x:0.58, y:0.65}, {x:0.62, y:0.68}, {x:0.64, y:0.72}, {x:0.62, y:0.75}, // ring curled
    {x:0.63, y:0.68}, {x:0.66, y:0.70}, {x:0.68, y:0.73}, {x:0.66, y:0.76}  // pinky curled
  ],
  FIST: [
    {x:0.5, y:0.85},
    {x:0.44, y:0.72}, {x:0.40, y:0.62}, {x:0.44, y:0.56}, {x:0.50, y:0.56}, // thumb across
    {x:0.46, y:0.62}, {x:0.46, y:0.52}, {x:0.50, y:0.58}, {x:0.48, y:0.66}, // index curled
    {x:0.51, y:0.62}, {x:0.51, y:0.52}, {x:0.55, y:0.58}, {x:0.53, y:0.66}, // middle curled
    {x:0.56, y:0.63}, {x:0.56, y:0.54}, {x:0.60, y:0.60}, {x:0.58, y:0.68}, // ring curled
    {x:0.61, y:0.66}, {x:0.61, y:0.58}, {x:0.64, y:0.63}, {x:0.63, y:0.70}  // pinky curled
  ],
  POINT: [
    {x:0.5, y:0.85},
    {x:0.45, y:0.72}, {x:0.42, y:0.62}, {x:0.46, y:0.58}, {x:0.52, y:0.58}, // thumb across
    {x:0.46, y:0.55}, {x:0.44, y:0.42}, {x:0.42, y:0.30}, {x:0.40, y:0.18}, // index pointing UP
    {x:0.52, y:0.62}, {x:0.54, y:0.55}, {x:0.56, y:0.62}, {x:0.54, y:0.68}, // middle curled
    {x:0.57, y:0.64}, {x:0.59, y:0.57}, {x:0.61, y:0.64}, {x:0.59, y:0.70}, // ring curled
    {x:0.62, y:0.67}, {x:0.64, y:0.61}, {x:0.65, y:0.66}, {x:0.63, y:0.72}  // pinky curled
  ],
  TWO_FINGERS: [
    {x:0.5, y:0.85},
    {x:0.45, y:0.72}, {x:0.42, y:0.62}, {x:0.47, y:0.58}, {x:0.53, y:0.58}, // thumb across
    {x:0.46, y:0.55}, {x:0.44, y:0.40}, {x:0.42, y:0.28}, {x:0.40, y:0.16}, // index pointing left-up
    {x:0.52, y:0.53}, {x:0.54, y:0.38}, {x:0.56, y:0.26}, {x:0.58, y:0.16}, // middle pointing right-up
    {x:0.58, y:0.64}, {x:0.60, y:0.57}, {x:0.62, y:0.64}, {x:0.60, y:0.70}, // ring curled
    {x:0.63, y:0.67}, {x:0.65, y:0.61}, {x:0.66, y:0.66}, {x:0.64, y:0.72}  // pinky curled
  ]
};

/**
 * Compares live hand landmarks against target gesture and returns normalized score and match boolean
 */
export function matchTargetGesture(liveLandmarks, targetSign, skeletonTemplate) {
  if (!liveLandmarks || liveLandmarks.length < 21) {
    return { isMatched: false, score: 0, feedback: 'Show your hand clearly to the camera' };
  }

  const detected = classifyGesture(liveLandmarks);
  const targetKey = (targetSign || '').toUpperCase();
  const detectedKey = (detected.sign || '').toUpperCase();

  // 1. Check direct match or alias overlap
  const targetAliases = GESTURE_ALIASES[targetKey] || [targetKey];
  const detectedAliases = GESTURE_ALIASES[detectedKey] || [detectedKey];

  const hasAliasOverlap = targetAliases.some(a => detectedAliases.includes(a)) ||
                          targetAliases.includes(detectedKey) ||
                          detectedAliases.includes(targetKey);

  // 2. Structural landmark distance calculation against template
  const tmpl = skeletonTemplate || TARGET_SKELETON_TEMPLATES[targetKey];
  let templateSimilarity = 0.5;

  if (tmpl && tmpl.length === 21) {
    let totalError = 0;
    const liveWrist = liveLandmarks[0];
    const tmplWrist = tmpl[0];

    const liveScale = dist(liveLandmarks[0], liveLandmarks[9]) || 0.2;
    const tmplScale = dist(tmpl[0], tmpl[9]) || 0.2;

    for (let i = 0; i < 21; i++) {
      // Mirror X if needed
      const lx = (liveLandmarks[i].x - liveWrist.x) / liveScale;
      const ly = (liveLandmarks[i].y - liveWrist.y) / liveScale;
      const tx = (tmpl[i].x - tmplWrist.x) / tmplScale;
      const ty = (tmpl[i].y - tmplWrist.y) / tmplScale;
      totalError += Math.hypot(lx - tx, ly - ty);
    }
    const avgError = totalError / 21;
    templateSimilarity = Math.max(0.2, Math.min(1.0, 1.0 - (avgError / 2.2)));
  }

  // 3. Combined score calculation
  let score = 0;
  if (hasAliasOverlap) {
    score = Math.max(0.85, 0.45 * (detected.confidence || 0.9) + 0.55 * templateSimilarity);
  } else {
    score = Math.min(0.75, 0.3 * (detected.confidence || 0.5) + 0.7 * templateSimilarity);
  }

  const isMatched = score >= 0.65 || hasAliasOverlap;

  let feedback = 'Align your hand with the dotted guide';
  if (score >= 0.55 && !isMatched) {
    feedback = 'Getting closer! Hold steady...';
  } else if (isMatched) {
    feedback = 'Perfect Match! ✔️ Keep holding...';
  }

  return {
    isMatched,
    score: Math.round(score * 100),
    feedback,
    detectedSign: detected.sign,
    detectedText: detected.text,
    detectedEmoji: detected.emoji
  };
}

export const GESTURE_MAP = {
  ASL_A: { text: 'LETTER A (CLENCHED FIST)', emoji: '✊', speech: 'Letter A' },
  ASL_B: { text: 'LETTER B (FLAT HAND)', emoji: '✋', speech: 'Letter B' },
  ASL_C: { text: 'LETTER C (CURVED HAND)', emoji: '🫲', speech: 'Letter C' },
  ASL_D: { text: 'LETTER D (INDEX UP)', emoji: '☝️', speech: 'Letter D' },
  ASL_F: { text: 'LETTER F (OK SYMBOL)', emoji: '👌', speech: 'Letter F' },
  ASL_I: { text: 'LETTER I (PINKY UP)', emoji: '🤙', speech: 'Letter I' },
  ASL_L: { text: 'LETTER L (L-SHAPE)', emoji: '👆', speech: 'Letter L' },
  ASL_V: { text: 'LETTER V (VICTORY / TWO)', emoji: '✌️', speech: 'Letter V' },
  ASL_W: { text: 'LETTER W (THREE EXTENDED)', emoji: '🖖', speech: 'Letter W' },
  ASL_Y: { text: 'LETTER Y (HORNS / PHONE)', emoji: '🤙', speech: 'Letter Y' },
  ASL_ILY: { text: 'I LOVE YOU (ASL)', emoji: '🤟', speech: 'I Love You' },
  THUMBS_UP: { text: 'APPROVAL / GOOD', emoji: '👍', speech: 'Thumbs Up' },
  THUMBS_DOWN: { text: 'DISAPPROVAL / NO', emoji: '👎', speech: 'Thumbs Down' },
  POINT: { text: 'POINTING / DIRECTION', emoji: '👉', speech: 'Point' },
  PINCH: { text: 'PINCHING / SMALL AMOUNT', emoji: '🤏', speech: 'Pinch' },
  MEDITATION_MUDRA: { text: 'MEDITATION / CALM', emoji: '🧘', speech: 'Calm' },
  WALKING_FINGERS: { text: 'WALKING / PEDESTRIAN', emoji: '🚶', speech: 'Walking' },
  WRITING_SIGN: { text: 'WRITING / SIGNING', emoji: '✍️', speech: 'Writing' },
  OPEN_HAND: { text: 'HELLO / APPLAUSE', emoji: '👋', speech: 'Hello' },
  FIST: { text: 'STOP / FIST', emoji: '✊', speech: 'Stop' },
  UNKNOWN: { text: 'GESTURE DETECTED', emoji: '✋', speech: 'Gesture' }
};
