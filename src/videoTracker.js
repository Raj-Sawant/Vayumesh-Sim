/**
 * Real-time Drone Video Neural Tracking & Telemetry Overlay
 * Renders optical flow, feature keypoints (SuperPoint/ORB), and tactical target tracking
 */

export class VideoTracker {
  constructor(videoElement, canvasElement) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.active = true;
    this.showKeypoints = true;
    this.showVectors = true;
    this.showTargetBox = true;

    // Simulated tracked feature points
    this.keypoints = [];
    this.initKeypoints();

    // Listen to video resize
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas || !this.video) return;
    const rect = this.video.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    }
  }

  initKeypoints() {
    this.keypoints = [];
    // Generate ~120 persistent feature tracks clustered in the central area (where the monument is)
    for (let i = 0; i < 140; i++) {
      this.keypoints.push({
        relX: 0.25 + Math.random() * 0.5,
        relY: 0.2 + Math.random() * 0.6,
        vx: (Math.random() - 0.45) * 0.4,
        vy: (Math.random() - 0.5) * 0.15,
        confidence: 0.85 + Math.random() * 0.14,
        id: Math.floor(1000 + Math.random() * 9000),
        size: Math.random() > 0.8 ? 4 : 2.5,
        trackLength: Math.floor(12 + Math.random() * 45),
      });
    }
  }

  render(timestamp) {
    if (!this.active || !this.ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (w === 0 || h === 0) return;

    this.ctx.clearRect(0, 0, w, h);

    const isPlaying = !this.video.paused && !this.video.ended;
    const speed = isPlaying ? 1.0 : 0.05;

    // 1. Draw Target Acquisition Bounding Box
    if (this.showTargetBox) {
      const boxX = w * 0.28;
      const boxY = h * 0.18;
      const boxW = w * 0.44;
      const boxH = h * 0.62;

      this.ctx.save();
      this.ctx.strokeStyle = '#00f59b';
      this.ctx.lineWidth = 1.5;
      this.ctx.setLineDash([8, 6]);

      // Reticle corners
      const cornerLen = 24;
      // Top-Left
      this.ctx.beginPath();
      this.ctx.moveTo(boxX, boxY + cornerLen);
      this.ctx.lineTo(boxX, boxY);
      this.ctx.lineTo(boxX + cornerLen, boxY);
      this.ctx.stroke();

      // Top-Right
      this.ctx.beginPath();
      this.ctx.moveTo(boxX + boxW - cornerLen, boxY);
      this.ctx.lineTo(boxX + boxW, boxY);
      this.ctx.lineTo(boxX + boxW, boxY + cornerLen);
      this.ctx.stroke();

      // Bottom-Left
      this.ctx.beginPath();
      this.ctx.moveTo(boxX, boxY + boxH - cornerLen);
      this.ctx.lineTo(boxX, boxY + boxH);
      this.ctx.lineTo(boxX + cornerLen, boxY + boxH);
      this.ctx.stroke();

      // Bottom-Right
      this.ctx.beginPath();
      this.ctx.moveTo(boxX + boxW - cornerLen, boxY + boxH);
      this.ctx.lineTo(boxX + boxW, boxY + boxH);
      this.ctx.lineTo(boxX + boxW, boxY + boxH - cornerLen);
      this.ctx.stroke();

      // Target Label
      this.ctx.setLineDash([]);
      this.ctx.fillStyle = 'rgba(0, 245, 155, 0.9)';
      this.ctx.font = '10px "JetBrains Mono", monospace';
      this.ctx.fillText('TARGET LOCK: [TAJ MAHAL MAIN MAUSOLEUM]', boxX + 6, boxY - 8);
      this.ctx.fillText('CLASS: HISTORIC_WHITE_MARBLE | ZERO-GCP SOLVER', boxX + 6, boxY + boxH + 16);
      this.ctx.restore();
    }

    // 2. Draw Feature Keypoints & Vectors
    this.keypoints.forEach((kp) => {
      // Drift slightly to simulate camera orbit
      if (isPlaying) {
        kp.relX += (kp.vx * 0.001) * speed;
        kp.relY += (kp.vy * 0.0005) * speed;

        // Wrap around bounds
        if (kp.relX < 0.22) kp.relX = 0.72;
        if (kp.relX > 0.76) kp.relX = 0.24;
        if (kp.relY < 0.16) kp.relY = 0.8;
        if (kp.relY > 0.82) kp.relY = 0.18;
      }

      const x = kp.relX * w;
      const y = kp.relY * h;

      // Keypoint crosshair
      if (this.showKeypoints) {
        this.ctx.strokeStyle = kp.confidence > 0.92 ? '#00f59b' : '#00e5ff';
        this.ctx.lineWidth = 1;
        const s = kp.size;

        this.ctx.beginPath();
        this.ctx.moveTo(x - s, y);
        this.ctx.lineTo(x + s, y);
        this.ctx.moveTo(x, y - s);
        this.ctx.lineTo(x, y + s);
        this.ctx.stroke();

        // Little outer circle for high confidence points
        if (kp.size > 3) {
          this.ctx.beginPath();
          this.ctx.arc(x, y, s + 2, 0, Math.PI * 2);
          this.ctx.stroke();
        }
      }

      // Optical flow motion vector tail
      if (this.showVectors && isPlaying) {
        this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x - kp.vx * 35, y - kp.vy * 35);
        this.ctx.stroke();
      }
    });

    // 3. Central Reticle & Crosshair
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(0, 245, 155, 0.4)';
    this.ctx.lineWidth = 1;
    const cx = w / 2;
    const cy = h / 2;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    this.ctx.moveTo(cx - 38, cy);
    this.ctx.lineTo(cx - 12, cy);
    this.ctx.moveTo(cx + 12, cy);
    this.ctx.lineTo(cx + 38, cy);
    this.ctx.moveTo(cx, cy - 38);
    this.ctx.lineTo(cx, cy - 12);
    this.ctx.moveTo(cx, cy + 12);
    this.ctx.lineTo(cx, cy + 38);
    this.ctx.stroke();
    this.ctx.restore();
  }
}
