/**
 * Biomechanical Kinematics Engine & Computer Vision Pose Mathematics
 * Standard MediaPipe 33 Landmark Indices:
 * 11: left_shoulder, 12: right_shoulder
 * 13: left_elbow,    14: right_elbow
 * 15: left_wrist,    16: right_wrist
 * 23: left_hip,      24: right_hip
 * 25: left_knee,     26: right_knee
 * 27: left_ankle,    28: right_ankle
 */

export const EXERCISE_KINEMATICS = {
  squat: {
    id: 'squat',
    name: 'Bodyweight Squats',
    targetJoint: 'Knee Angle',
    targetThreshold: 95,
    lockoutThreshold: 160,
    idealDepthRange: [75, 95],
    criticalLandmarks: [23, 24, 25, 26, 27, 28],
    cues: {
      descent: 'Hips back, keep chest tall!',
      depth: 'Parallel depth achieved! Power up!',
      ascent: 'Drive through heels to full lockout!',
      lockout: 'Great rep! Reset for the next repetition.'
    }
  },
  pushup: {
    id: 'pushup',
    name: 'Pushups',
    targetJoint: 'Elbow Angle',
    targetThreshold: 90,
    lockoutThreshold: 155,
    idealDepthRange: [70, 90],
    criticalLandmarks: [11, 12, 13, 14, 15, 16, 23, 24],
    cues: {
      descent: 'Tuck elbows at 45°, lower chest with control!',
      depth: 'Deep chest position! Press the ground away!',
      ascent: 'Maintain rigid core plank line!',
      lockout: 'Top lockout! Full protraction achieved.'
    }
  },
  lunge: {
    id: 'lunge',
    name: 'Forward Lunges',
    targetJoint: 'Lead Knee Flexion',
    targetThreshold: 95,
    lockoutThreshold: 160,
    idealDepthRange: [85, 95],
    criticalLandmarks: [23, 24, 25, 26, 27, 28],
    cues: {
      descent: 'Step forward, drop back knee toward floor!',
      depth: '90-degree front knee! Drive back through lead heel!',
      ascent: 'Push back explosively to standing posture!',
      lockout: 'Full extension upright reset.'
    }
  },
  jumping_jack: {
    id: 'jumping_jack',
    name: 'Jumping Jacks',
    targetJoint: 'Shoulder Abduction',
    targetThreshold: 135,
    lockoutThreshold: 60,
    idealDepthRange: [130, 180],
    criticalLandmarks: [11, 12, 15, 16, 27, 28],
    cues: {
      descent: 'Arms overhead and feet wide!',
      depth: 'Max extension reached!',
      ascent: 'Spring back to center with soft knees!',
      lockout: 'Crisp rhythm! Keep the tempo.'
    }
  },
  bicep_curl: {
    id: 'bicep_curl',
    name: 'Bicep Curls',
    targetJoint: 'Elbow Flexion',
    targetThreshold: 50,
    lockoutThreshold: 150,
    idealDepthRange: [35, 55],
    criticalLandmarks: [11, 12, 13, 14, 15, 16],
    cues: {
      descent: 'Keep elbows fixed at sides, curl upwards!',
      depth: 'Peak bicep contraction! Squeeze!',
      ascent: 'Lower under strict 2-second control!',
      lockout: 'Full tricep extension reset.'
    }
  },
  plank: {
    id: 'plank',
    name: 'Isometric Plank',
    targetJoint: 'Spine & Hip Collinearity',
    targetThreshold: 180,
    lockoutThreshold: 165,
    idealDepthRange: [165, 195],
    criticalLandmarks: [11, 12, 23, 24, 27, 28],
    cues: {
      descent: 'Draw navel to spine, tuck pelvis!',
      depth: 'Optimal horizontal spine line! Hold tight!',
      ascent: 'Avoid hip sagging or high piking!',
      lockout: 'Core locked in iron stability.'
    }
  }
};

/**
 * Calculates internal angle in degrees between three 2D/3D points (p1 - p2 - p3)
 * where p2 is the vertex (e.g. knee joint).
 */
export function calculateAngle(p1, p2, p3) {
  if (!p1 || !p2 || !p3) return null;
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return Math.round(angle);
}

/**
 * Calculates Euclidean distance between two points normalized [0..1]
 */
export function calculateDistance(p1, p2) {
  if (!p1 || !p2) return 0;
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Validates whether user is sufficiently positioned in camera view
 */
export function checkLandmarkVisibility(landmarks, exerciseType = 'squat') {
  if (!landmarks || landmarks.length === 0) {
    return {
      isCalibrated: false,
      visiblePercent: 0,
      feedbackMessage: 'Step into camera frame to initiate tracking.'
    };
  }

  const config = EXERCISE_KINEMATICS[exerciseType] || EXERCISE_KINEMATICS.squat;
  const required = config.criticalLandmarks;

  let visibleCount = 0;
  for (const idx of required) {
    const pt = landmarks[idx];
    if (pt && (pt.visibility === undefined || pt.visibility > 0.45)) {
      visibleCount++;
    }
  }

  const pct = Math.round((visibleCount / required.length) * 100);
  const isCalibrated = pct >= 65;

  let feedbackMessage = 'Full body alignment locked.';
  if (pct < 40) {
    feedbackMessage = 'Take 2-3 steps back so full body is visible.';
  } else if (pct < 65) {
    feedbackMessage = 'Adjust lighting or camera angle to capture key joints.';
  }

  return { isCalibrated, visiblePercent: pct, feedbackMessage };
}

/**
 * Evaluates real-time rep form accuracy percentage (0% to 100%)
 */
export function calculateFormAccuracy(exerciseType, angle, landmarks) {
  if (!angle || !landmarks) return 85;

  if (exerciseType === 'squat' || exerciseType === 'lunge') {
    if (angle <= 95) {
      const depthScore = Math.max(85, 100 - Math.abs(angle - 85) * 1.2);
      return Math.round(Math.min(100, depthScore));
    } else if (angle <= 110) {
      return 78;
    } else {
      return 60;
    }
  }

  if (exerciseType === 'pushup') {
    if (angle <= 90) {
      const depthScore = Math.max(85, 100 - Math.abs(angle - 80) * 1.5);
      return Math.round(Math.min(100, depthScore));
    } else if (angle <= 105) {
      return 75;
    } else {
      return 62;
    }
  }

  if (exerciseType === 'jumping_jack') {
    if (angle >= 135) return 96;
    if (angle >= 115) return 82;
    return 68;
  }

  if (exerciseType === 'bicep_curl') {
    if (angle <= 50) return 98;
    if (angle <= 75) return 84;
    return 65;
  }

  if (exerciseType === 'plank') {
    const diff = Math.abs(angle - 180);
    if (diff <= 10) return 98;
    if (diff <= 20) return 85;
    return Math.max(40, 75 - diff * 2);
  }

  return 90;
}

export const POSE_CONNECTIONS = [
  // Torso box
  [11, 12], [11, 23], [12, 24], [23, 24],
  // Left arm
  [11, 13], [13, 15],
  // Right arm
  [12, 14], [14, 16],
  // Left leg
  [23, 25], [25, 27],
  // Right leg
  [24, 26], [26, 28]
];

/**
 * Draws real-time skeletal landmarks and connected bone vectors onto canvas with glowing HUD aesthetics
 */
export function drawSkeleton(ctx, landmarks, width, height, isFormGood = true, activeJointCoords = null, activeAngle = null) {
  if (!landmarks || landmarks.length === 0) return;

  const lineColor = isFormGood ? '#10b981' : '#f59e0b'; // Emerald if good, Amber if adjusting
  const pointColor = '#06b6d4'; // Cyan joints

  ctx.save();

  // 1. Draw Skeleton Bones
  ctx.lineWidth = 4;
  ctx.strokeStyle = lineColor;
  ctx.shadowColor = lineColor;
  ctx.shadowBlur = 12;

  for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];

    if (
      start &&
      end &&
      (start.visibility === undefined || start.visibility > 0.45) &&
      (end.visibility === undefined || end.visibility > 0.45)
    ) {
      ctx.beginPath();
      ctx.moveTo(start.x * width, start.y * height);
      ctx.lineTo(end.x * width, end.y * height);
      ctx.stroke();
    }
  }

  // 2. Draw Key Joint Nodes
  ctx.fillStyle = pointColor;
  ctx.shadowColor = pointColor;
  ctx.shadowBlur = 10;

  const keyPoints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
  for (const idx of keyPoints) {
    const pt = landmarks[idx];
    if (pt && (pt.visibility === undefined || pt.visibility > 0.45)) {
      ctx.beginPath();
      ctx.arc(pt.x * width, pt.y * height, 6, 0, 2 * Math.PI);
      ctx.fill();

      // White inner core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pt.x * width, pt.y * height, 2.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = pointColor;
    }
  }

  // 3. Highlight Active Primary Tracking Joint & Degree Tag
  if (activeJointCoords && activeJointCoords.x && activeJointCoords.y) {
    const jx = activeJointCoords.x * width;
    const jy = activeJointCoords.y * height;

    // Glowing target reticle
    ctx.strokeStyle = isFormGood ? '#34d399' : '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(jx, jy, 16, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = isFormGood ? '#10b981' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(jx, jy, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Floating angle indicator tag directly on the joint
    if (activeAngle !== null && activeAngle !== undefined) {
      ctx.save();
      const tagText = `${activeAngle}°`;
      ctx.font = 'bold 12px monospace';
      const textWidth = ctx.measureText(tagText).width;
      const tagX = Math.min(width - 50, Math.max(10, jx + 20));
      const tagY = Math.min(height - 20, Math.max(25, jy - 8));

      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = isFormGood ? '#10b981' : '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(tagX - 5, tagY - 13, textWidth + 10, 18, 5);
      } else {
        ctx.rect(tagX - 5, tagY - 13, textWidth + 10, 18);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isFormGood ? '#34d399' : '#fbbf24';
      ctx.fillText(tagText, tagX, tagY);
      ctx.restore();
    }
  }

  ctx.restore();
}
