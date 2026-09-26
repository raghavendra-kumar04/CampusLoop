import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Antigravity Interactive Particle Wave Grid
function ParticleWave() {
  const pointsRef = useRef();
  const geometryRef = useRef();

  // Define grid dimensions (70 x 50 = 3500 particles)
  const cols = 70;
  const rows = 50;
  const count = cols * rows;

  // Initial grid positions and base color array
  const [positions, colors, basePositions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const colsArr = new Float32Array(count * 3);
    const basePos = new Float32Array(count * 3);

    const c1 = new THREE.Color('#312e81'); // Deep Dark Indigo
    const c2 = new THREE.Color('#1e1b4b'); // Midnight Violet
    const c3 = new THREE.Color('#064e3b'); // Deep Dark Emerald

    let idx = 0;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        // Spread evenly across grid plane
        const x = (i / cols - 0.5) * 32;
        const z = (j / rows - 0.5) * 22;
        const y = 0;

        pos[idx * 3] = x;
        pos[idx * 3 + 1] = y;
        pos[idx * 3 + 2] = z;

        basePos[idx * 3] = x;
        basePos[idx * 3 + 1] = y;
        basePos[idx * 3 + 2] = z;

        // Color interpolation based on grid position
        const mixRatio = (i / cols + j / rows) * 0.5;
        const color = mixRatio < 0.5 ? c1.clone().lerp(c2, mixRatio * 2) : c2.clone().lerp(c3, (mixRatio - 0.5) * 2);

        colsArr[idx * 3] = color.r;
        colsArr[idx * 3 + 1] = color.g;
        colsArr[idx * 3 + 2] = color.b;

        idx++;
      }
    }

    return [pos, colsArr, basePos];
  }, [cols, rows, count]);

  // Smooth mouse position tracking
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useFrame((state) => {
    if (!geometryRef.current) return;

    const t = state.clock.getElapsedTime();
    const pointer = state.pointer; // Normalized [-1, 1]

    // Lerp mouse target
    mouseRef.current.targetX = pointer.x * 12;
    mouseRef.current.targetY = pointer.y * 8;
    mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
    mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

    const mx = mouseRef.current.x;
    const mz = -mouseRef.current.y;

    const posAttr = geometryRef.current.attributes.position;
    const posArray = posAttr.array;

    for (let i = 0; i < count; i++) {
      const x = basePositions[i * 3];
      const z = basePositions[i * 3 + 2];

      // Base undulating wave equation
      const baseWave = Math.sin(x * 0.35 + t * 1.8) * 0.45 + Math.cos(z * 0.4 + t * 1.4) * 0.35;

      // Distance to interactive mouse cursor
      const dx = x - mx;
      const dz = z - mz;
      const dist = Math.sqrt(dx * dx + dz * dz);

      // Interactive mouse ripple force (Antigravity ripple distortion)
      const rippleRange = 6.0;
      let mouseRipple = 0;

      if (dist < rippleRange) {
        const factor = (1 - dist / rippleRange);
        mouseRipple = Math.sin(dist * 2.2 - t * 5.0) * factor * 1.2;
      }

      // Update particle Y position dynamically
      posArray[i * 3 + 1] = baseWave + mouseRipple;
    }

    posAttr.needsUpdate = true;

    // Gentle overall tilt of the grid towards camera
    if (pointsRef.current) {
      pointsRef.current.rotation.x = -Math.PI / 5 + pointer.y * 0.08;
      pointsRef.current.rotation.y = pointer.x * 0.1;
    }
  });

  return (
    <points ref={pointsRef} position={[0, -1.8, -2]}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <PointMaterial
        transparent
        vertexColors
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.45}
        blending={THREE.NormalBlending}
      />
    </points>
  );

}

const Background3D = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Soft Ambient Radial Glow Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.18)_0%,rgba(56,189,248,0.08)_45%,transparent_75%)] pointer-events-none" />

      <Canvas
        camera={{ position: [0, 2, 10], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <ambientLight intensity={1} />
        <ParticleWave />
      </Canvas>
    </div>
  );
};

export default React.memo(Background3D);
