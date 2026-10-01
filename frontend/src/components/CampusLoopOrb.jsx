import React, { useEffect, useRef } from 'react';

// Generative Tree Canvas Component (High-Performance Direct React 2D Engine)
export default function CampusLoopOrb({ className = '', style }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
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

    const MAX_DEPTH = 7;
    const GROWTH_SPEED_BASE = 0.012;
    const HOLD_DURATION = 420;
    const FADE_DURATION = 140;
    const WAIT_DURATION = 50;
    const PARTICLE_COUNT = 45;

    // Pre-rendered Particle Sprite
    let particleSprite;
    function initParticleSprite() {
      particleSprite = document.createElement('canvas');
      particleSprite.width = 32;
      particleSprite.height = 32;
      const pctx = particleSprite.getContext('2d');
      const g = pctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, 'rgba(199, 210, 254, 0.95)');
      g.addColorStop(0.4, 'rgba(99, 102, 241, 0.55)');
      g.addColorStop(1, 'rgba(79, 70, 229, 0)');
      pctx.fillStyle = g;
      pctx.fillRect(0, 0, 32, 32);
    }
    initParticleSprite();

    // Pre-rendered Luminous Crystal Leaf Tip Sprite (Avoids creating thousands of radial gradients per frame!)
    let tipSprite;
    function initTipSprite() {
      tipSprite = document.createElement('canvas');
      tipSprite.width = 32;
      tipSprite.height = 32;
      const tctx = tipSprite.getContext('2d');
      const g = tctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      g.addColorStop(0.3, 'rgba(224, 231, 255, 0.75)');
      g.addColorStop(0.65, 'rgba(165, 180, 252, 0.35)');
      g.addColorStop(1, 'rgba(99, 102, 241, 0)');
      tctx.fillStyle = g;
      tctx.fillRect(0, 0, 32, 32);
    }
    initTipSprite();

    function resize() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width || 500;
      H = rect.height || 450;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
        size: rand(0.8, 2.2),
        alpha: rand(0.08, 0.28),
        phase: rand(0, Math.PI * 2),
        freq: rand(0.0004, 0.0015),
        life: fullRandom ? rand(0, 1) : 0,
        lifeSpeed: rand(0.0008, 0.0025),
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
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
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
    let mouseX = W / 2, mouseActive = false;
    let windForce = 0, shakeAmount = 0;

    function createTree() {
      allBranches = [];

      const trunkLen = H * rand(0.24, 0.28);
      const trunkThick = Math.max(6, W * 0.012);
      const trunkAngle = -Math.PI / 2 + rand(-0.04, 0.04);
      const baseY = H + trunkThick * 0.2;

      allBranches.push({
        x0: W / 2 + rand(-W * 0.015, W * 0.015),
        y0: baseY,
        angle: trunkAngle,
        length: trunkLen,
        thickness: trunkThick,
        depth: 0,
        growthProgress: 0,
        growthSpeed: GROWTH_SPEED_BASE * rand(0.95, 1.1),
        children: [],
        spawned: false,
        swayPhase: rand(0, Math.PI * 2),
        swayAmp: 0.0006,
        sway: 0,
        curvature: rand(-0.012, 0.012),
        colorShift: rand(-6, 6),
        hueShift: 0,
        parent: null,
        strokeSeeds: [rand(-1, 1), rand(-1, 1), rand(-1, 1)],
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
      if (parent.depth < 1) numChildren = 3;
      else if (parent.depth < 3) numChildren = Math.random() < 0.6 ? 3 : 2;
      else if (parent.depth < 5) numChildren = Math.random() < 0.45 ? 3 : 2;
      else numChildren = 2;

      const spread = parent.depth < 2 ? rand(0.32, 0.46) : rand(0.36, 0.56);

      for (let i = 0; i < numChildren; i++) {
        let angleOffset;
        if (numChildren === 1) {
          angleOffset = rand(-0.2, 0.2);
        } else if (numChildren === 2) {
          angleOffset = (i === 0 ? -1 : 1) * rand(0.18, spread);
        } else {
          angleOffset = (i - 1) * spread + rand(-0.08, 0.08);
        }

        const childAngle = parent.angle + angleOffset;
        const lengthFactor = rand(0.62, 0.76);
        const thickFactor = rand(0.52, 0.68);

        const ep = getBranchEnd(parent, 1);

        const tipDots = [];
        const childDepth = parent.depth + 1;
        if (childDepth >= MAX_DEPTH - 1) {
          const count = Math.random() < 0.5 ? 2 : 1;
          for (let d = 0; d < count; d++) {
            tipDots.push({
              ox: rand(-4, 4),
              oy: rand(-4, 4),
              size: rand(3.0, 5.5),
              alpha: rand(0.4, 0.85),
            });
          }
        }

        const child = {
          x0: ep.x,
          y0: ep.y,
          angle: childAngle,
          length: parent.length * lengthFactor,
          thickness: Math.max(0.6, parent.thickness * thickFactor),
          depth: childDepth,
          growthProgress: 0,
          growthSpeed: GROWTH_SPEED_BASE * rand(1.0, 1.4) * (1 + parent.depth * 0.08),
          children: [],
          spawned: false,
          swayPhase: rand(0, Math.PI * 2),
          swayAmp: 0.0014 * (parent.depth + 1) * rand(0.7, 1.2),
          sway: 0,
          curvature: rand(-0.035, 0.035) * (1 + parent.depth * 0.1),
          colorShift: rand(-10, 10),
          hueShift: Math.max(-1, Math.min(1, parent.hueShift + rand(-0.3, 0.3))),
          parent: parent,
          strokeSeeds: [rand(-1, 1), rand(-1, 1)],
          tipDots: tipDots,
        };

        parent.children.push(child);
        allBranches.push(child);
      }
    }

    function getBranchEnd(branch, progress) {
      const angle = branch.angle + (branch.sway || 0);
      const len = branch.length * progress;
      const perpX = -Math.sin(angle);
      const perpY = Math.cos(angle);
      const curveOff = branch.curvature * len;
      return {
        x: branch.x0 + Math.cos(angle) * len + perpX * curveOff,
        y: branch.y0 + Math.sin(angle) * len + perpY * curveOff,
      };
    }

    // O(N) hierarchical sway and position update
    function recalcPositionsAndSway(time) {
      const windTarget = mouseActive ? windForce * 0.03 : 0;
      const shakeVal = shakeAmount > 0.01 ? shakeAmount * 0.05 : 0;

      for (let i = 0; i < allBranches.length; i++) {
        const b = allBranches[i];
        
        // Compute local sway
        const localSway = Math.sin(time * 0.0005 + b.swayPhase) * b.swayAmp;
        const parentSway = b.parent ? b.parent.sway : 0;
        
        b.sway = parentSway + localSway;
        if (windTarget !== 0) b.sway += windTarget;
        if (shakeVal !== 0) b.sway += Math.sin(time * 0.015 + b.swayPhase * 3) * shakeVal;

        if (b.parent) {
          const pe = getBranchEnd(b.parent, 1);
          b.x0 = pe.x;
          b.y0 = pe.y;
        }
      }
    }

    function updateBranches() {
      let allDone = true;
      const len = allBranches.length;
      for (let i = 0; i < len; i++) {
        const b = allBranches[i];
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

    function drawBranch(drawCtx, b) {
      if (b.growthProgress <= 0) return;

      const angle = b.angle + b.sway;
      const progress = easeOutCubic(b.growthProgress);
      const len = b.length * progress;

      const x1 = b.x0;
      const y1 = b.y0;

      const perpX = -Math.sin(angle);
      const perpY = Math.cos(angle);

      const curveOff = b.curvature * len * 1.3;
      const cpx1 = x1 + Math.cos(angle) * len * 0.33 + perpX * curveOff * 0.4;
      const cpy1 = y1 + Math.sin(angle) * len * 0.33 + perpY * curveOff * 0.4;
      const cpx2 = x1 + Math.cos(angle) * len * 0.66 + perpX * curveOff * 0.85;
      const cpy2 = y1 + Math.sin(angle) * len * 0.66 + perpY * curveOff * 0.85;
      const x2 = x1 + Math.cos(angle) * len + perpX * curveOff * 0.7;
      const y2 = y1 + Math.sin(angle) * len + perpX * curveOff * 0.7;

      const col = colorForDepth(b.depth, b.hueShift);
      const depthT = b.depth / MAX_DEPTH;
      const baseAlpha = b.depth <= 1 ? 0.95
                      : b.depth <= 4 ? lerp(0.92, 0.75, depthT)
                      : lerp(0.75, 0.4, (depthT - 0.5) * 2);

      const strokeCount = b.depth < 2 ? 2 : 1;
      const thickBase = b.thickness;
      const thickTaper = lerp(thickBase, thickBase * 0.35, progress);

      for (let s = 0; s < strokeCount; s++) {
        const seed = b.strokeSeeds[s] || 0;
        const normalizedS = strokeCount > 1 ? (s / (strokeCount - 1) - 0.5) : 0;

        const offsetAmt = normalizedS * thickBase * 0.3 + seed * thickBase * 0.05;
        const ox = perpX * offsetAmt;
        const oy = perpY * offsetAmt;

        const shift = normalizedS * 18 + b.colorShift * 0.25;
        const r = Math.max(0, Math.min(255, col.r + shift));
        const g = Math.max(0, Math.min(255, col.g + shift * 0.65));
        const bb = Math.max(0, Math.min(255, col.b + shift * 0.8));

        const isCore = s === 0;
        const alpha = baseAlpha * (isCore ? 1.0 : 0.6);
        const thick = thickTaper * (isCore ? 1.0 : 0.7);

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

      // Fast hardware-accelerated crystal leaf tips using cached Sprite
      if (b.tipDots.length > 0 && b.growthProgress > 0.85) {
        const tipFade = smoothstep(0.85, 1.0, b.growthProgress);
        for (let d = 0; d < b.tipDots.length; d++) {
          const dot = b.tipDots[d];
          const dx = x2 + dot.ox;
          const dy = y2 + dot.oy;
          const da = tipFade * dot.alpha * treeAlpha;
          if (da < 0.01) continue;
          const ds = dot.size * 2.2;
          
          drawCtx.globalAlpha = da;
          drawCtx.drawImage(tipSprite, dx - ds, dy - ds, ds * 2, ds * 2);
        }
        drawCtx.globalAlpha = treeAlpha;
      }
    }

    function drawScene(time) {
      ctx.clearRect(0, 0, W, H);

      // Radial Light Halo (Soft ambient glow)
      if (treeAlpha > 0.05) {
        const cx = W / 2, cy = H * 0.38;
        const radius = Math.min(W, H) * 0.45;
        const canopyGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        canopyGlow.addColorStop(0, `rgba(79, 70, 229, ${0.28 * treeAlpha})`);
        canopyGlow.addColorStop(0.5, `rgba(99, 102, 241, ${0.09 * treeAlpha})`);
        canopyGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = canopyGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      recalcPositionsAndSway(time);

      ctx.save();
      ctx.globalAlpha = treeAlpha;
      const branchCount = allBranches.length;
      for (let i = 0; i < branchCount; i++) {
        drawBranch(ctx, allBranches[i]);
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
          const done = updateBranches();
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
      el.addEventListener('mousemove', handleMouseMove, { passive: true });
      el.addEventListener('mouseleave', handleMouseLeave, { passive: true });
      el.addEventListener('click', handleClick, { passive: true });
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

