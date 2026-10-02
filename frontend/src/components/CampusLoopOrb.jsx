import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

// High-Performance Generative Botanical Tree Canvas with Lush Gradient Foliage
export default function CampusLoopOrb({ className = '', style }) {
  const { isDark } = useTheme();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDarkRef = useRef(isDark);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId;
    let W = 0, H = 0, scaleFactor = 1;
    let isVisible = true;

    function lerp(a, b, t) { return a + (b - a) * t; }
    function rand(lo, hi) { return Math.random() * (hi - lo) + lo; }
    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
    function smoothstep(a, b, t) {
      t = Math.max(0, Math.min(1, (t - a) / (b - a)));
      return t * t * (3 - 2 * t);
    }

    const MAX_DEPTH = 6;
    const GROWTH_SPEED_BASE = 0.012;
    const HOLD_DURATION = 460;
    const FADE_DURATION = 120;
    const WAIT_DURATION = 35;
    const PARTICLE_COUNT = 38;

    // Harmonic Spectral Gradient Palette Stops
    const GRADIENT_STOPS_LIGHT = [
      { pos: 0.00, r: 99,  g: 102, b: 241 }, // Indigo / Violet
      { pos: 0.20, r: 168, g: 85,  b: 247 }, // Purple Orchid
      { pos: 0.40, r: 236, g: 72,  b: 153 }, // Rose Pink
      { pos: 0.60, r: 249, g: 115, b: 22  }, // Sunset Coral
      { pos: 0.80, r: 16,  g: 185, b: 129 }, // Emerald Jade
      { pos: 1.00, r: 6,   g: 182, b: 212 }, // Sky Cyan
    ];

    const GRADIENT_STOPS_DARK = [
      { pos: 0.00, r: 129, g: 140, b: 248 }, // Soft Periwinkle
      { pos: 0.20, r: 192, g: 132, b: 252 }, // Radiant Lavender
      { pos: 0.40, r: 244, g: 114, b: 182 }, // Neon Blossom Pink
      { pos: 0.60, r: 251, g: 146, b: 60  }, // Sunlit Amber
      { pos: 0.80, r: 52,  g: 211, b: 153 }, // Aurora Mint
      { pos: 1.00, r: 56,  g: 189, b: 248 }, // Sky Cyan
    ];

    function getGradientColor(t, isDarkTheme) {
      const stops = isDarkTheme ? GRADIENT_STOPS_DARK : GRADIENT_STOPS_LIGHT;
      const clamped = Math.max(0, Math.min(1, t));

      for (let i = 0; i < stops.length - 1; i++) {
        const s0 = stops[i];
        const s1 = stops[i + 1];
        if (clamped >= s0.pos && clamped <= s1.pos) {
          const ratio = (clamped - s0.pos) / (s1.pos - s0.pos);
          return {
            r: Math.round(lerp(s0.r, s1.r, ratio)),
            g: Math.round(lerp(s0.g, s1.g, ratio)),
            b: Math.round(lerp(s0.b, s1.b, ratio)),
          };
        }
      }
      return stops[stops.length - 1];
    }

    // Pre-rendered Particle Sprites for lag-free particle drawing
    let particleSpriteDark, particleSpriteLight;
    function initParticleSprites() {
      particleSpriteDark = document.createElement('canvas');
      particleSpriteDark.width = 32;
      particleSpriteDark.height = 32;
      const pctxDark = particleSpriteDark.getContext('2d');
      const gDark = pctxDark.createRadialGradient(16, 16, 0, 16, 16, 16);
      gDark.addColorStop(0, 'rgba(244, 114, 182, 0.95)');
      gDark.addColorStop(0.4, 'rgba(129, 140, 248, 0.55)');
      gDark.addColorStop(1, 'rgba(99, 102, 241, 0)');
      pctxDark.fillStyle = gDark;
      pctxDark.fillRect(0, 0, 32, 32);

      particleSpriteLight = document.createElement('canvas');
      particleSpriteLight.width = 32;
      particleSpriteLight.height = 32;
      const pctxLight = particleSpriteLight.getContext('2d');
      const gLight = pctxLight.createRadialGradient(16, 16, 0, 16, 16, 16);
      gLight.addColorStop(0, 'rgba(236, 72, 153, 0.95)');
      gLight.addColorStop(0.4, 'rgba(99, 102, 241, 0.6)');
      gLight.addColorStop(0.8, 'rgba(16, 185, 129, 0.25)');
      gLight.addColorStop(1, 'rgba(16, 185, 129, 0)');
      pctxLight.fillStyle = gLight;
      pctxLight.fillRect(0, 0, 32, 32);
    }
    initParticleSprites();

    function resize() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width || 500;
      H = rect.height || 450;
      scaleFactor = Math.min(Math.max(W / 520, 0.65), 1.25);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    // Pause rendering when off-screen to guarantee 0% CPU waste and buttery load performance
    const intersectionObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    if (containerRef.current) intersectionObserver.observe(containerRef.current);

    // Floating Spore/Petal Particles
    let particles = [];
    function createParticle(fullRandom) {
      return {
        x: rand(W * 0.05, W * 0.95),
        y: fullRandom ? rand(H * 0.1, H * 0.9) : rand(H * 0.4, H),
        vx: rand(-0.25, 0.25),
        vy: rand(-0.35, -0.06),
        size: rand(0.9, 2.4) * scaleFactor,
        alpha: rand(0.12, 0.35),
        phase: rand(0, Math.PI * 2),
        freq: rand(0.0006, 0.002),
        life: fullRandom ? rand(0, 1) : 0,
        lifeSpeed: rand(0.001, 0.0028),
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
        p.x += p.vx + Math.sin(time * p.freq + p.phase) * 0.3;
        p.y += p.vy;
        p.life += p.lifeSpeed;
        if (p.life > 1 || p.y < -10 || p.x < -10 || p.x > W + 10) {
          particles[i] = createParticle(false);
        }
      }
    }

    function drawParticles(drawCtx, globalAlpha) {
      const dark = isDarkRef.current;
      const sprite = dark ? particleSpriteDark : particleSpriteLight;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const lifeFade = p.life < 0.15 ? p.life / 0.15
                       : p.life > 0.8 ? (1 - p.life) / 0.2
                       : 1;
        const a = p.alpha * lifeFade * globalAlpha * (dark ? 1.0 : 1.25);
        if (a < 0.004) continue;
        const s = p.size * (dark ? 2.8 : 3.2);
        drawCtx.globalAlpha = Math.min(1, a);
        drawCtx.drawImage(sprite, p.x - s, p.y - s, s * 2, s * 2);
      }
      drawCtx.globalAlpha = 1;
    }

    let allBranches = [];
    let treeAlpha = 1;
    let treeState = 'growing';
    let holdTimer = 0, fadeTimer = 0, waitTimer = 0;
    let mouseX = W / 2, mouseActive = false;
    let windForce = 0, shakeAmount = 0;

    function createTree() {
      allBranches = [];

      const trunkLen = H * rand(0.24, 0.29) * scaleFactor;
      const trunkThick = Math.max(5.0, W * 0.0115);
      const trunkAngle = -Math.PI / 2 + rand(-0.03, 0.03);
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
        curvature: rand(-0.01, 0.01),
        parent: null,
        leaves: [],
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
      else if (parent.depth < 3) numChildren = Math.random() < 0.65 ? 3 : 2;
      else if (parent.depth < 5) numChildren = Math.random() < 0.5 ? 3 : 2;
      else numChildren = 2;

      const spread = parent.depth < 2 ? rand(0.34, 0.50) : rand(0.38, 0.62);

      for (let i = 0; i < numChildren; i++) {
        let angleOffset;
        if (numChildren === 1) {
          angleOffset = rand(-0.2, 0.2);
        } else if (numChildren === 2) {
          angleOffset = (i === 0 ? -1 : 1) * rand(0.20, spread);
        } else {
          angleOffset = (i - 1) * spread + rand(-0.09, 0.09);
        }

        const childAngle = parent.angle + angleOffset;
        const lengthFactor = rand(0.55, 0.88);
        const thickFactor = rand(0.52, 0.68);
        const ep = getBranchEnd(parent, 1);
        const childDepth = parent.depth + 1;

        // Lush Foliage: Organically distributed leaf pairs and tip clusters
        const leaves = [];
        if (childDepth >= 2) {
          // Add 3 to 6 leaves per branch at varying branch ratios (depths 2-6)
          const leafCount = childDepth >= 4 ? (Math.random() < 0.7 ? 5 : 4) : (Math.random() < 0.5 ? 3 : 2);
          
          for (let l = 0; l < leafCount; l++) {
            const ratio = (l + 1) / (leafCount + 0.5);
            const branchPos = Math.min(1.0, Math.max(0.25, ratio + rand(-0.08, 0.08)));
            const side = l % 2 === 0 ? 1 : -1;
            
            leaves.push({
              branchPos,
              leafAngle: childAngle + side * rand(0.35, 0.85),
              length: rand(6.0, 11.5) * scaleFactor,
              width: rand(3.0, 5.5) * scaleFactor,
              colorSeed: rand(-0.08, 0.08),
              alpha: rand(0.72, 0.95),
            });
          }

          // Tip blossom cluster at the branch end
          if (childDepth >= 4) {
            leaves.push({
              branchPos: 1.0,
              leafAngle: childAngle + rand(-0.15, 0.15),
              length: rand(7.0, 12.0) * scaleFactor,
              width: rand(3.5, 6.0) * scaleFactor,
              colorSeed: 0,
              alpha: rand(0.85, 0.98),
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
          growthSpeed: GROWTH_SPEED_BASE * rand(1.0, 1.45) * (1 + parent.depth * 0.09),
          children: [],
          spawned: false,
          swayPhase: rand(0, Math.PI * 2),
          swayAmp: 0.0014 * (parent.depth + 1) * rand(0.7, 1.2),
          sway: 0,
          curvature: rand(-0.035, 0.035) * (1 + parent.depth * 0.1),
          parent: parent,
          leaves: leaves,
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

    function getBranchPointAt(branch, tProgress) {
      const angle = branch.angle + (branch.sway || 0);
      const len = branch.length * tProgress;
      const perpX = -Math.sin(angle);
      const perpY = Math.cos(angle);
      const curveOff = branch.curvature * len;
      return {
        x: branch.x0 + Math.cos(angle) * len + perpX * curveOff,
        y: branch.y0 + Math.sin(angle) * len + perpY * curveOff,
      };
    }

    function recalcPositionsAndSway(time) {
      const windTarget = mouseActive ? windForce * 0.03 : 0;
      const shakeVal = shakeAmount > 0.01 ? shakeAmount * 0.05 : 0;

      for (let i = 0; i < allBranches.length; i++) {
        const b = allBranches[i];
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

      const dark = isDarkRef.current;
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

      const normX = Math.max(0, Math.min(1, (x2 - W * 0.15) / (W * 0.7)));
      const depthT = b.depth / MAX_DEPTH;
      const gradColor = getGradientColor(normX, dark);

      // Deep sturdy trunk transitioning into smooth gradient branches
      let r, g, bb;
      if (b.depth === 0) {
        r = dark ? 49 : 30;
        g = dark ? 46 : 27;
        bb = dark ? 129 : 75;
      } else {
        const blend = depthT * 0.75;
        const trunkR = dark ? 49 : 30;
        const trunkG = dark ? 46 : 27;
        const trunkB = dark ? 129 : 75;
        r = Math.round(lerp(trunkR, gradColor.r, blend));
        g = Math.round(lerp(trunkG, gradColor.g, blend));
        bb = Math.round(lerp(trunkB, gradColor.b, blend));
      }

      const baseAlpha = b.depth <= 1 ? (dark ? 0.95 : 1.0)
                      : b.depth <= 3 ? lerp(dark ? 0.92 : 0.98, dark ? 0.82 : 0.92, depthT)
                      : lerp(dark ? 0.82 : 0.92, dark ? 0.55 : 0.75, (depthT - 0.5) * 2);

      const thickBase = b.thickness;
      const thickTaper = lerp(thickBase, thickBase * 0.35, progress);

      // Draw Branch Stroke
      drawCtx.beginPath();
      drawCtx.moveTo(x1, y1);
      drawCtx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x2, y2);
      drawCtx.strokeStyle = `rgba(${r}, ${g}, ${bb}, ${baseAlpha})`;
      drawCtx.lineWidth = thickTaper;
      drawCtx.lineCap = 'round';
      drawCtx.stroke();

      // Draw Lush Foliage Leaves (Fast, lightweight direct path drawing with pre-calculated RGB)
      if (b.leaves && b.leaves.length > 0 && b.growthProgress > 0.35) {
        for (let l = 0; l < b.leaves.length; l++) {
          const leaf = b.leaves[l];
          if (progress < leaf.branchPos) continue;

          const leafBloom = smoothstep(leaf.branchPos * 0.8, leaf.branchPos, progress);
          if (leafBloom <= 0.02) continue;

          const leafPt = getBranchPointAt(b, leaf.branchPos * progress);
          const leafNormX = Math.max(0, Math.min(1, (leafPt.x - W * 0.15) / (W * 0.7) + leaf.colorSeed));
          const leafColor = getGradientColor(leafNormX, dark);

          const curLen = leaf.length * leafBloom;
          const curWid = leaf.width * leafBloom;
          const leafAlpha = leaf.alpha * treeAlpha * leafBloom;

          drawCtx.save();
          drawCtx.translate(leafPt.x, leafPt.y);
          drawCtx.rotate(leaf.leafAngle + (b.sway || 0) * 0.5);

          // Fast organic leaf path
          drawCtx.beginPath();
          drawCtx.moveTo(0, 0);
          drawCtx.quadraticCurveTo(curWid, -curLen * 0.45, 0, -curLen);
          drawCtx.quadraticCurveTo(-curWid, -curLen * 0.45, 0, 0);

          drawCtx.fillStyle = `rgba(${leafColor.r}, ${leafColor.g}, ${leafColor.b}, ${leafAlpha * 0.88})`;
          drawCtx.fill();

          // Delicate luminous vein spine
          drawCtx.beginPath();
          drawCtx.moveTo(0, 0);
          drawCtx.lineTo(0, -curLen * 0.8);
          drawCtx.strokeStyle = `rgba(255, 255, 255, ${leafAlpha * 0.4})`;
          drawCtx.lineWidth = 0.65;
          drawCtx.stroke();

          drawCtx.restore();
        }
      }
    }

    function drawScene(time) {
      const dark = isDarkRef.current;
      ctx.clearRect(0, 0, W, H);

      // Soft ambient radiant canopy halo
      if (treeAlpha > 0.05) {
        const cx = W / 2, cy = H * 0.42;
        const radius = Math.min(W, H) * 0.48;
        const canopyGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        
        if (dark) {
          canopyGlow.addColorStop(0, `rgba(168, 85, 247, ${0.18 * treeAlpha})`);
          canopyGlow.addColorStop(0.45, `rgba(99, 102, 241, ${0.08 * treeAlpha})`);
          canopyGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          canopyGlow.addColorStop(0, `rgba(236, 72, 153, ${0.12 * treeAlpha})`);
          canopyGlow.addColorStop(0.4, `rgba(99, 102, 241, ${0.07 * treeAlpha})`);
          canopyGlow.addColorStop(0.8, `rgba(16, 185, 129, ${0.04 * treeAlpha})`);
          canopyGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }
        
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
      if (!isVisible) {
        // Skip rendering when off-screen to preserve 100% CPU/GPU performance
        animId = requestAnimationFrame(frame);
        return;
      }

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
      intersectionObserver.disconnect();
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
      className={`w-full h-[360px] sm:h-[440px] md:h-[500px] relative pointer-events-auto transition-all duration-500 will-change-transform ${className}`}
      style={{
        background: 'transparent',
        filter: isDark
          ? 'brightness(1.35) drop-shadow(0 0 20px rgba(168, 85, 247, 0.2))'
          : 'brightness(1.02) contrast(1.08) drop-shadow(0 4px 18px rgba(99, 102, 241, 0.12))',
        ...style
      }}
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
