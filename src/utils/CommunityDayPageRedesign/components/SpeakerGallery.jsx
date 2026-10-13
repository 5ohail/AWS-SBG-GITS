import React, { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import {
  speakerFragmentShader,
  speakerVertexShader,
} from "../shaders/speakerTransitionShader";

function ActiveSpeakerPlane({
  texture,
  nextTexture,
  progressRef,
  directionRef,
  parallaxRef,
  hoverRef,
  dragRef,
  onPointerOver,
  onPointerOut,
}) {
  const meshRef = useRef();
  const uniforms = useMemo(
    () => ({
      uCurrentTexture: { value: texture },
      uNextTexture: { value: nextTexture || texture },
      uProgress: { value: 0 },
      uDirection: { value: 1 },
      uDistortion: { value: 1.2 },
      uChromatic: { value: 1.4 },
      uGlitch: { value: 1 },
      uTime: { value: 0 },
      uParallax: { value: new THREE.Vector2(0, 0) },
      uHover: { value: 0 },
      uOpacity: { value: 1 },
      uIsActive: { value: 1 },
    }),
    [texture, nextTexture],
  );

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.uCurrentTexture.value = texture;
      meshRef.current.material.uniforms.uNextTexture.value =
        nextTexture || texture;
    }
  }, [texture, nextTexture]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uProgress.value = progressRef.current;
    material.uniforms.uDirection.value = directionRef.current;
    material.uniforms.uParallax.value.x = THREE.MathUtils.lerp(
      material.uniforms.uParallax.value.x,
      parallaxRef.current.x,
      0.08,
    );
    material.uniforms.uParallax.value.y = THREE.MathUtils.lerp(
      material.uniforms.uParallax.value.y,
      parallaxRef.current.y,
      0.08,
    );
    material.uniforms.uHover.value = THREE.MathUtils.lerp(
      material.uniforms.uHover.value,
      hoverRef.current ? 1 : 0,
      0.1,
    );

    const targetX = dragRef.current * 1.8;
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      targetX,
      0.15,
    );
    const targetScale = hoverRef.current ? 1.015 : 1;
    meshRef.current.scale.x = THREE.MathUtils.lerp(
      meshRef.current.scale.x,
      targetScale,
      0.1,
    );
    meshRef.current.scale.y = THREE.MathUtils.lerp(
      meshRef.current.scale.y,
      targetScale,
      0.1,
    );
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, 0, 0]}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <planeGeometry args={[2.85, 3.65, 32, 32]} />
      <shaderMaterial
        vertexShader={speakerVertexShader}
        fragmentShader={speakerFragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

function NeighborSpeakerPlane({ texture, positionX, dragRef, onClick }) {
  const meshRef = useRef();

  useFrame(() => {
    if (!meshRef.current) return;
    const targetX = positionX + dragRef.current * 1.4;
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      targetX,
      0.15,
    );
  });

  return (
    <mesh
      ref={meshRef}
      position={[positionX, 0, -0.4]}
      scale={[0.78, 0.78, 0.78]}
      onClick={onClick}
    >
      <planeGeometry args={[2.85, 3.65]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.38}
        color="#888888"
      />
    </mesh>
  );
}

function SpeakerGalleryScene({
  speakers,
  currentIndex,
  targetIndex,
  progressRef,
  directionRef,
  parallaxRef,
  hoverRef,
  dragRef,
  onPrev,
  onNext,
  onHoverChange,
}) {
  const imagePaths = useMemo(
    () => speakers.map((speaker) => speaker.image),
    [speakers],
  );
  const textures = useLoader(THREE.TextureLoader, imagePaths);

  useEffect(() => {
    textures.forEach((texture) => {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
    });
  }, [textures]);

  const count = speakers.length;
  const prevIndex = (currentIndex - 1 + count) % count;
  const nextIndex = (currentIndex + 1) % count;

  return (
    <group position={[0, 0, 0]}>
      <NeighborSpeakerPlane
        texture={textures[prevIndex]}
        positionX={-3.35}
        dragRef={dragRef}
        onClick={onPrev}
      />
      <ActiveSpeakerPlane
        texture={textures[currentIndex]}
        nextTexture={textures[targetIndex]}
        progressRef={progressRef}
        directionRef={directionRef}
        parallaxRef={parallaxRef}
        hoverRef={hoverRef}
        dragRef={dragRef}
        onPointerOver={() => onHoverChange(true)}
        onPointerOut={() => onHoverChange(false)}
      />
      <NeighborSpeakerPlane
        texture={textures[nextIndex]}
        positionX={3.35}
        dragRef={dragRef}
        onClick={onNext}
      />
    </group>
  );
}

export default function SpeakerGallery(props) {
  const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;

  return (
    <Canvas
      camera={{ position: [0, 0, 5.8], fov: 38 }}
      dpr={isSmallScreen ? 1 : [1, Math.min(window.devicePixelRatio, 2)]}
      gl={{
        antialias: !isSmallScreen,
        powerPreference: "high-performance",
        alpha: true,
      }}
    >
      <Suspense fallback={null}>
        <SpeakerGalleryScene {...props} />
      </Suspense>
    </Canvas>
  );
}
