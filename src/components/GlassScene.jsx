import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import CrystalObject from './CrystalObject';
import { usePerformance } from '../context/PerformanceContext';

function StudioLighting() {
  return (
    <>
      <ambientLight intensity={0.45} color="#FFFFFF" />

      {/* Primary Studio Key Light (Upper Right Front) */}
      <directionalLight
        position={[3.5, 4.5, 3.5]}
        intensity={2.6}
        color="#FFFFFF"
      />

      {/* Studio Rim Light for crisp optical bevel glints */}
      <directionalLight
        position={[-3.5, 2.0, -1.5]}
        intensity={2.0}
        color="#FFFFFF"
      />

      {/* Front Specular Glint Light */}
      <directionalLight
        position={[0.0, -2.5, 3.0]}
        intensity={1.2}
        color="#FFFFFF"
      />

      {/* Fill Light (Twilight blue atmospheric fill) */}
      <pointLight
        position={[1.5, 3.0, 2.5]}
        intensity={0.8}
        color="#D8E6FF"
      />

      {/* Signature AWS Orange Rim Light */}
      <directionalLight
        position={[-2.5, -1.5, -2.0]}
        intensity={1.2}
        color="#FF9900"
      />
    </>
  );
}

export default function GlassScene({ mouse, scrollProgress }) {
  const { pixelRatio, isDocumentVisible, tier } = usePerformance();

  // If document is hidden, don't run heavy Canvas execution
  if (!isDocumentVisible) {
    return null;
  }

  return (
    <div
      id="hero-3d-canvas-wrap"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
        overflow: 'hidden'
      }}
    >
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 0, 5.0], fov: 38 }}
        dpr={pixelRatio}
        gl={{
          antialias: tier !== 'low',
          alpha: true,
          powerPreference: tier === 'low' ? 'low-power' : 'high-performance'
        }}
      >
        <StudioLighting />
        <Suspense fallback={null}>
          <CrystalObject mouse={mouse} scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
