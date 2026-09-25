import React, { useEffect, useRef } from 'react';

// Generative Tree Canvas Component (Direct React 2D Engine - No iframe overhead)
export default function CampusLoopOrb({ className = '', style }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let W = 0, H = 0;

    function lerp(a, b, t) { return a + (b - a) * t; }
    function rand(lo, hi) { return Math.random() * (hi - lo) + lo; }
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function smoothstep(a, b, t) {
      t = Math.max(0, Math.min(1, (t - a) / (b - a)));
      return t * t * (3 - 2 * t);
    }

    const MAX_DEPTH = 10;
    const GROWTH_SPEED_BASE = 0.007;
    const HOLD_DURATION = 400;
    const FADE_DURATION = 160;
    const WAIT_DURATION = 60;
    const PARTICLE_COUNT = 75;

    let particleSprite;
    function initParticleSprite() {
      particleSprite = document.createElement('canvas');
      particleSprite.width = 32;
      particleSprite.height = 32;
      const pctx = particleSprite.getContext('2d');
      const g = pctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, 'rgba(199, 210, 254, 0.95)');  // Soft Indigo/Cyan White Motes
      g.addColorStop(0.4, 'rgba(99, 102, 241, 0.55)');
      g.addColorStop(1, 'rgba(79, 70, 229, 0)');
      pctx.fillStyle = g;
      pctx.fillRect(0, 0, 32, 32);
    }
    initParticleSprite();

    function resize() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      W = canvas.width = rect.width || 500;
      H = canvas.height = rect.height || 450;
    }
    resize();

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    // Particles
    let particles = [];
    function createParticle(fullRandom) {
      return {
        x: rand(W * 0.05, W * 0.95),
        y: fullRandom ? rand(H * 0.1, H * 0.9) : rand(H * 0.4, H),
        vx: rand(-0.15, 0.15),
        vy: rand(-0.4, -0.08),
        size: rand(0.8, 2.5),
        alpha: rand(0.08, 0.3),
        phase: rand(0, Math.PI * 2),
        freq: rand(0.0004, 0.0015),
        life: fullRandom ? rand(0, 1) : 0,
        lifeSpeed: rand(0.0006, 0.0025),
      };
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle(true));
      }
    }

    function updateParticles(time) {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx + Math.sin(time * p.freq + p.phase) * 0.25;
        p.y += p.vy;
        p.life += p.lifeSpeed;
        if (p.life > 1 || p.y < -10 || p.x < -10 || p.x > W + 10) {
          particles[i] = createParticle(false);
        }
      }
    }

    function drawParticles(drawCtx, globalAlpha) {
      for (const p of particles) {
        const lifeFade = p.life < 0.15 ? p.life / 0.15
                       : p.life > 0.8 ? (1 - p.life) / 0.2
                       : 1;
        const a = p.alpha * lifeFade * globalAlpha;
        if (a < 0.004) continue;
        const s = p.size * 3;
        drawCtx.globalAlpha = a;
        drawCtx.drawImage(particleSprite, p.x - s, p.y - s, s * 2, s * 2);
      }
      drawCtx.globalAlpha = 1;
    }

    // Cohesive Page Palette
    const PALETTE = [
      { r: 49, g: 46, b: 129 },    // #312e81 Deep Indigo Trunk
      { r: 67, g: 56, b: 202 },    // #4338ca Branch
      { r: 79, g: 70, b: 229 },    // #4f46e5 Primary Indigo
      { r: 99, g: 102, b: 241 },   // #6366f1 Indigo Accent
      { r: 129, g: 140, b: 248 },  // #818cf8 Soft Sky Indigo
      { r: 199, g: 210, b: 254 },  // #c7d2fe Luminous Crystal Tips
    ];

    function colorForDepth(depth, hueShift) {
      const t = depth / MAX_DEPTH;
      const idx = t * (PALETTE.length - 1);
      const i0 = Math.floor(idx);
      const i1 = Math.min(PALETTE.length - 1, i0 + 1);
      const f = idx - i0;
      let r = lerp(PALETTE[i0].r, PALETTE[i1].r, f);
      let g = lerp(PALETTE[i0].g, PALETTE[i1].g, f);
      let b = lerp(PALETTE[i0].b, PALETTE[i1].b, f);

      if (hueShift !== undefined) {
        const strength = t * t * 15;
        r += hueShift * strength * 0.5;
        g += hueShift * strength * 0.5;
        b += hueShift * strength * 1.0;
      }
      return { r, g, b };
    }

    let allBranches = [];
    let treeAlpha = 1;
    let treeState = 'growing';
    let holdTimer = 0, fadeTimer = 0, waitTimer = 0;
    let mouseX = W / 2, mouseY = H / 2, mouseActive = false;
    let windForce = 0, shakeAmount = 0;

    function createTree() {
      allBranches = [];

      const trunkLen = H * rand(0.24, 0.29);
      const trunkThick = Math.max(7, W * 0.014);
      const trunkAngle = -Math.PI / 2 + rand(-0.05, 0.05);

      const baseY = H + trunkThick * 0.2;

      allBranches.push({
        x0: W / 2 + rand(-W * 0.02, W * 0.02),
        y0: baseY,
        angle: trunkAngle,
        length: trunkLen,
        thickness: trunkThick,
        depth: 0,
        growthProgress: 0,
        growthSpeed: GROWTH_SPEED_BASE * rand(0.9, 1.1),
        children: [],
        spawned: false,
        swayPhase: rand(0, Math.PI * 2),
        swayAmp: 0.0008,
        curvature: rand(-0.015, 0.015),
        colorShift: rand(-8, 8),
        hueShift: 0,
        parent: null,
        strokeSeeds: [rand(-1,1), rand(-1,1), rand(-1,1), rand(-1,1), rand(-1,1)],
        tipDots: [],
      });

      treeState = 'growing';
      holdTimer = fadeTimer = waitTimer = 0;
      treeAlpha = 1;
      initParticles();
    }

    function spawnChildren(parent) {
      if (parent.depth >= MAX_DEPTH) return;

      let numChildren;
      if (parent.depth < 1) numChildren = 2 + (Math.random() < 0.35 ? 1 : 0);
      else if (parent.depth < 3) numChildren = 2 + (Math.random() < 0.4 ? 1 : 0);
      else numChildren = Math.random() < 0.25 ? 3 : 2;

      const pruneChance = parent.depth <= 3 ? 0 : parent.depth <= 5 ? 0.1 : parent.depth <= 7 ? 0.22 : 0.35;
      if (Math.random() < pruneChance) numChildren = Math.max(1, numChildren - 1);

      const spread = parent.depth < 2 ? rand(0.32, 0.48) : rand(0.38, 0.6);

      for (let i = 0; i < numChildren; i++) {
        let angleOffset;
        if (numChildren === 1) {
          angleOffset = rand(-0.25, 0.25);
        } else if (numChildren === 2) {
          angleOffset = (i === 0 ? -1 : 1) * rand(0.18, spread);
        } else {
          angleOffset = (i - 1) * spread + rand(-0.1, 0.1);
        }

        const childAngle = parent.angle + angleOffset;
        const lengthFactor = rand(0.58, 0.76);
        const thickFactor = rand(0.48, 0.67);

        const ep = getBranchEnd(parent, 1, 0);

        const tipDots = [];
        const childDepth = parent.depth + 1;
        if (childDepth >= MAX_DEPTH) {
          const count = Math.random() < 0.4 ? 2 : 1;
          for (let d = 0; d < count; d++) {
            tipDots.push({
              ox: rand(-2, 2),
              oy: rand(-2, 2),
              size: rand(0.8, 1.8),
              alpha: rand(0.1, 0.3),
            });
          }
        }

        const child = {
          x0: ep.x,
          y0: ep.y,
          angle: childAngle,
          length: parent.length * lengthFactor,
          thickness: Math.max(0.4, parent.thickness * thickFactor),
          depth: childDepth,
          growthProgress: 0,
          growthSpeed: GROWTH_SPEED_BASE * rand(1.0, 1.5) * (1 + parent.depth * 0.1),
          children: [],
          spawned: false,
          swayPhase: rand(0, Math.PI * 2),
          swayAmp: 0.0018 * (parent.depth + 1) * rand(0.7, 1.3),
          curvature: rand(-0.04, 0.04) * (1 + parent.depth * 0.12),
          colorShift: rand(-12, 12),
          hueShift: Math.max(-1, Math.min(1, parent.hueShift + rand(-0.35, 0.35))),
          parent: parent,
          strokeSeeds: [rand(-1,1), rand(-1,1), rand(-1,1), rand(-1,1), rand(-1,1)],
          tipDots: tipDots,
        };

        parent.children.push(child);
        allBranches.push(child);
      }
    }

    function getSwayAngle(branch, time) {
      let total = 0;
      let b = branch;
      let depth = 0;
      while (b) {
        const a = b.swayAmp;
        total += Math.sin(time * 0.0005 + b.swayPhase) * a;
        total += Math.sin(time * 0.0003 + b.swayPhase * 1.7) * a * 0.6;
        total += Math.sin(time * 0.00012 + b.swayPhase * 0.4) * a * 0.35;
        depth++;
        b = b.parent;
      }
      if (mouseActive) {
        total += windForce * 0.04 * depth;
      }
      if (shakeAmount > 0.01) {
        total += Math.sin(time * 0.015 + branch.swayPhase * 3) * shakeAmount * 0.06 * depth;
      }
      return total;
    }

    function getBranchEnd(branch, progress, time) {
      const sway = getSwayAngle(branch, time);
      const angle = branch.angle + sway;
      const len = branch.length * progress;
      const perpX = -Math.sin(angle);
      const perpY = Math.cos(angle);
      const curveOff = branch.curvature * len;
      return {
        x: branch.x0 + Math.cos(angle) * len + perpX * curveOff,
        y: branch.y0 + Math.sin(angle) * len + perpY * curveOff,
      };
    }

    function recalcPositions(time) {
      for (const b of allBranches) {
        if (b.parent) {
          const pe = getBranchEnd(b.parent, 1, time);
          b.x0 = pe.x;
          b.y0 = pe.y;
        }
      }
    }

    function updateBranches(time) {
      let allDone = true;
      for (const b of allBranches) {
        if (b.growthProgress < 1) {
          b.growthProgress = Math.min(1, b.growthProgress + b.growthSpeed);
          allDone = false;
        }
        if (b.growthProgress >= 0.65 && !b.spawned) {
          b.spawned = true;
          spawnChildren(b);
        }
      }
      return allDone;
    }

    function drawBranch(drawCtx, b, time) {
      if (b.growthProgress <= 0) return;

      const sway = getSwayAngle(b, time);
      const angle = b.angle + sway;
      const progress = easeOutCubic(b.growthProgress);
      const len = b.length * progress;

      const x1 = b.x0;
      const y1 = b.y0;

      const perpX = -Math.sin(angle);
      const perpY = Math.cos(angle);

      const curveOff = b.curvature * len * 1.4;
      const cpx1 = x1 + Math.cos(angle) * len * 0.33 + perpX * curveOff * 0.4;
      const cpy1 = y1 + Math.sin(angle) * len * 0.33 + perpY * curveOff * 0.4;
      const cpx2 = x1 + Math.cos(angle) * len * 0.66 + perpX * curveOff * 0.85;
      const cpy2 = y1 + Math.sin(angle) * len * 0.66 + perpY * curveOff * 0.85;
      const x2 = x1 + Math.cos(angle) * len + perpX * curveOff * 0.7;
      const y2 = y1 + Math.sin(angle) * len + perpX * curveOff * 0.7;

      const col = colorForDepth(b.depth, b.hueShift);
      const depthT = b.depth / MAX_DEPTH;
      const baseAlpha = b.depth <= 1 ? 0.95
                      : b.depth <= 5 ? lerp(0.92, 0.7, depthT)
                      : lerp(0.7, 0.35, (depthT - 0.5) * 2);

      const strokeCount = b.depth < 3 ? 5 : (b.depth < 6 ? 3 : 2);
      const thickBase = b.thickness;
      const thickTaper = lerp(thickBase, thickBase * 0.3, progress);

      for (let s = 0; s < strokeCount; s++) {
        const seed = b.strokeSeeds[s] || 0;
        const normalizedS = strokeCount > 1 ? (s / (strokeCount - 1) - 0.5) : 0;

        const offsetAmt = normalizedS * thickBase * 0.35 + seed * thickBase * 0.08;
        const ox = perpX * offsetAmt;
        const oy = perpY * offsetAmt;

        const shift = normalizedS * 22 + b.colorShift * 0.3;
        const r = Math.max(0, Math.min(255, col.r + shift));
        const g = Math.max(0, Math.min(255, col.g + shift * 0.65));
        const bb = Math.max(0, Math.min(255, col.b + shift * 0.8));

        const isCore = s === Math.floor(strokeCount / 2);
        const alpha = baseAlpha * (isCore ? 1.0 : 0.5);
        const thick = thickTaper * (isCore ? 1.0 : lerp(0.65, 0.45, Math.abs(normalizedS)));

        drawCtx.beginPath();
        drawCtx.moveTo(x1 + ox, y1 + oy);
        drawCtx.bezierCurveTo(
          cpx1 + ox, cpy1 + oy,
          cpx2 + ox, cpy2 + oy,
          x2 + ox, y2 + oy
        );
        drawCtx.strokeStyle = `rgba(${r | 0}, ${g | 0}, ${bb | 0}, ${alpha})`;
        drawCtx.lineWidth = thick;
        drawCtx.lineCap = 'round';
        drawCtx.stroke();
      }

      // Luminous crystal leaf tips
      if (b.tipDots.length > 0 && b.growthProgress > 0.9) {
        const tipFade = smoothstep(0.9, 1.0, b.growthProgress);
        const tr = Math.min(255, col.r * 1.1 + 50);
        const tg2 = Math.min(255, col.g * 1.1 + 50);
        const tb = Math.min(255, col.b * 1.1 + 70);
        for (const dot of b.tipDots) {
          const dx = x2 + dot.ox;
          const dy = y2 + dot.oy;
          const da = tipFade * dot.alpha;
          const ds = dot.size;

          const tg = drawCtx.createRadialGradient(dx, dy, 0, dx, dy, ds * 2.5);
          tg.addColorStop(0, `rgba(${tr|0}, ${tg2|0}, ${tb|0}, ${da * 0.85})`);
          tg.addColorStop(0.5, `rgba(${col.r|0}, ${col.g|0}, ${col.b|0}, ${da * 0.3})`);
          tg.addColorStop(1, `rgba(${col.r|0}, ${col.g|0}, ${col.b|0}, 0)`);
          drawCtx.fillStyle = tg;
          drawCtx.beginPath();
          drawCtx.arc(dx, dy, ds * 2.5, 0, Math.PI * 2);
          drawCtx.fill();
        }
      }
    }

    function drawScene(time) {
      ctx.clearRect(0, 0, W, H);

      // Radial Light Halo (No box boundaries!)
      if (treeAlpha > 0.05) {
        const cx = W / 2, cy = H * 0.38;
        const radius = Math.min(W, H) * 0.45;
        const canopyGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        canopyGlow.addColorStop(0, `rgba(79, 70, 229, ${0.35 * treeAlpha})`);
        canopyGlow.addColorStop(0.5, `rgba(99, 102, 241, ${0.12 * treeAlpha})`);
        canopyGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = canopyGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      recalcPositions(time);

      ctx.save();
      ctx.globalAlpha = treeAlpha;
      for (const b of allBranches) {
        drawBranch(ctx, b, time);
      }
      ctx.restore();

      updateParticles(time);
      ctx.save();
      drawParticles(ctx, treeAlpha);
      ctx.restore();
    }

    function frame(time) {
      if (shakeAmount > 0.01) shakeAmount *= 0.95;
      else shakeAmount = 0;

      switch (treeState) {
        case 'growing': {
          const done = updateBranches(time);
          drawScene(time);
          if (done) {
            treeState = 'holding';
            holdTimer = 0;
          }
          break;
        }
        case 'holding': {
          drawScene(time);
          holdTimer++;
          if (holdTimer >= HOLD_DURATION) {
            treeState = 'fading';
            fadeTimer = 0;
          }
          break;
        }
        case 'fading': {
          fadeTimer++;
          treeAlpha = Math.max(0, 1 - fadeTimer / FADE_DURATION);
          drawScene(time);
          if (fadeTimer >= FADE_DURATION) {
            treeState = 'waiting';
            waitTimer = 0;
          }
          break;
        }
        case 'waiting': {
          ctx.clearRect(0, 0, W, H);
          waitTimer++;
          if (waitTimer >= WAIT_DURATION) {
            createTree();
          }
          break;
        }
      }
      animId = requestAnimationFrame(frame);
    }

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      mouseActive = true;
      windForce = (mouseX - W / 2) / (W / 2);
    };

    const handleMouseLeave = () => {
      mouseActive = false;
      windForce = 0;
    };

    const handleClick = () => {
      shakeAmount = 1.0;
    };

    const el = containerRef.current;
    if (el) {
      el.addEventListener('mousemove', handleMouseMove);
      el.addEventListener('mouseleave', handleMouseLeave);
      el.addEventListener('click', handleClick);
    }

    createTree();
    animId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      if (el) {
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('mouseleave', handleMouseLeave);
        el.removeEventListener('click', handleClick);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-[400px] sm:h-[460px] md:h-[520px] relative pointer-events-auto ${className}`}
      style={{ background: 'transparent', filter: 'brightness(1.80)', ...style }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          background: 'transparent',
        }}
      />
    </div>
  );
}
