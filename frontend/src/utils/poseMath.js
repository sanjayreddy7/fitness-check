/**
 * Computer Vision Pose Geometry and Angle Analytics
 * Standard MediaPipe 33 Landmark Indices:
 * 11: left_shoulder, 12: right_shoulder
 * 13: left_elbow,    14: right_elbow
 * 15: left_wrist,    16: right_wrist
 * 23: left_hip,      24: right_hip
 * 25: left_knee,     26: right_knee
 * 27: left_ankle,    28: right_ankle
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

export function calculateDistance(p1, p2) {
  if (!p1 || !p2) return 0;
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export const POSE_CONNECTIONS = [
  // Torso
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
 * Draws real-time skeletal landmarks and connected bone vectors onto canvas
 */
export function drawSkeleton(ctx, landmarks, width, height, isFormGood = true) {
  if (!landmarks || landmarks.length === 0) return;

  const lineColor = isFormGood ? '#10b981' : '#f59e0b'; // Emerald if good, Amber if adjusting
  const pointColor = '#06b6d4'; // Cyan joints

  // Draw Bones
  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = lineColor;
  ctx.shadowColor = lineColor;
  ctx.shadowBlur = 10;

  for (const [startIdx, endIdx] of POSE_CONNECTIONS) {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];

    if (start && end && (start.visibility === undefined || start.visibility > 0.45) &&
        (end.visibility === undefined || end.visibility > 0.45)) {
      ctx.beginPath();
      ctx.moveTo(start.x * width, start.y * height);
      ctx.lineTo(end.x * width, end.y * height);
      ctx.stroke();
    }
  }

  // Draw Key Joint Nodes
  ctx.fillStyle = pointColor;
  ctx.shadowColor = pointColor;
  ctx.shadowBlur = 8;

  const keyPoints = [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];
  for (const idx of keyPoints) {
    const pt = landmarks[idx];
    if (pt && (pt.visibility === undefined || pt.visibility > 0.45)) {
      ctx.beginPath();
      ctx.arc(pt.x * width, pt.y * height, 6, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  ctx.restore();
}
