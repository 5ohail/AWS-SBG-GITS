import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { refractionLensVertexShader, refractionLensFragmentShader } from '../shaders/refractionLensShader';

// Generate a soft circular pure white glowing texture for crystal starlight particles
function createCircleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.3, 'rgba(240, 245, 255, 0.8)');
  grad.addColorStop(0.7, 'rgba(200, 220, 255, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 7-Color Spectral Rainbow Reflection Sweep (Cube's Diffracted Light Reflection)
function SpectralReflectionSweep() {
  const sweepRef = useRef();
  const matRef = useRef();

  const curve = useMemo(() => {
    const points = [];
    const count = 120;
    const radiusX = 2.25;
    const radiusY = 1.35;
    for (let i = 0; i <= count; i++) {
      const theta = (i / count) * Math.PI * 2;
      const x = Math.cos(theta) * radiusX;
      const y = Math.sin(theta) * radiusY;
      const z = Math.sin(theta * 2.0) * 0.44;
      points.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(points, true);
  }, []);

  const tubeGeo = useMemo(() => {
    return new THREE.TubeGeometry(curve, 100, 0.009, 8, true);
  }, [curve]);

  const haloGeo = useMemo(() => {
    return new THREE.TubeGeometry(curve, 100, 0.022, 8, true);
  }, [curve]);

  // Shader that sweeps through the 7 rainbow colors (ROYGBIV) along the curve
  const spectralShader = useMemo(() => ({
    vertexShader: `
      varying float vUvX;
      void main() {
        vUvX = uv.x;
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying float vUvX;
      uniform float uTime;
      uniform float uIntensity;

      // 7 spectral rainbow colors: Red -> Orange -> Yellow -> Green -> Blue -> Indigo -> Violet
      vec3 getSpectral7(float p) {
        p = fract(p) * 6.0;
        if (p < 1.0) return mix(vec3(1.0, 0.06, 0.06), vec3(1.0, 0.52, 0.0), p);
        else if (p < 2.0) return mix(vec3(1.0, 0.52, 0.0), vec3(1.0, 0.95, 0.05), p - 1.0);
        else if (p < 3.0) return mix(vec3(1.0, 0.95, 0.05), vec3(0.05, 0.95, 0.25), p - 2.0);
        else if (p < 4.0) return mix(vec3(0.05, 0.95, 0.25), vec3(0.0, 0.72, 1.0), p - 3.0);
        else if (p < 5.0) return mix(vec3(0.0, 0.72, 1.0), vec3(0.28, 0.12, 0.95), p - 4.0);
        else return mix(vec3(0.28, 0.12, 0.95), vec3(0.75, 0.05, 0.88), p - 5.0);
      }

      void main() {
        vec3 rainbow = getSpectral7(vUvX - uTime * 0.03);
        gl_FragColor = vec4(rainbow * uIntensity, 0.92);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 1.2 }
    }
  }), []);

  const haloShader = useMemo(() => ({
    vertexShader: spectralShader.vertexShader,
    fragmentShader: `
      varying float vUvX;
      uniform float uTime;
      
      vec3 getSpectral7(float p) {
        p = fract(p) * 6.0;
        if (p < 1.0) return mix(vec3(1.0, 0.06, 0.06), vec3(1.0, 0.52, 0.0), p);
        else if (p < 2.0) return mix(vec3(1.0, 0.52, 0.0), vec3(1.0, 0.95, 0.05), p - 1.0);
        else if (p < 3.0) return mix(vec3(1.0, 0.95, 0.05), vec3(0.05, 0.95, 0.25), p - 2.0);
        else if (p < 4.0) return mix(vec3(0.05, 0.95, 0.25), vec3(0.0, 0.72, 1.0), p - 3.0);
        else if (p < 5.0) return mix(vec3(0.0, 0.72, 1.0), vec3(0.28, 0.12, 0.95), p - 4.0);
        else return mix(vec3(0.28, 0.12, 0.95), vec3(0.75, 0.05, 0.88), p - 5.0);
      }

      void main() {
        vec3 rainbow = getSpectral7(vUvX - uTime * 0.03);
        gl_FragColor = vec4(rainbow, 0.28);
      }
    `,
    uniforms: {
      uTime: { value: 0 }
    }
  }), [spectralShader.vertexShader]);

  useFrame((state, delta) => {
    if (sweepRef.current) {
      sweepRef.current.rotation.z += delta * 0.12;
      sweepRef.current.rotation.x = 0.38 + Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
      sweepRef.current.rotation.y = -0.28 + Math.cos(state.clock.elapsedTime * 0.3) * 0.05;
    }
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <group ref={sweepRef} position={[0, 0, 0]}>
      {/* Primary 7-color diffracted light beam */}
      <mesh geometry={tubeGeo}>
        <shaderMaterial
          ref={matRef}
          vertexShader={spectralShader.vertexShader}
          fragmentShader={spectralShader.fragmentShader}
          uniforms={spectralShader.uniforms}
          transparent={true}
        />
      </mesh>
      {/* Soft ambient 7-color spectral dispersion halo */}
      <mesh geometry={haloGeo}>
        <shaderMaterial
          vertexShader={haloShader.vertexShader}
          fragmentShader={haloShader.fragmentShader}
          uniforms={haloShader.uniforms}
          transparent={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// Low-density floating pure white starlight particles
function SubtleParticles({ mouse }) {
  const pointsRef = useRef();
  const count = 16;

  const particleTexture = useMemo(() => createCircleTexture(), []);

  const [positions, origPositions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const orig = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 5.0 + 0.2;
      const y = (Math.random() - 0.5) * 3.8;
      const z = (Math.random() - 0.5) * 2.5;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      orig[i * 3] = x;
      orig[i * 3 + 1] = y;
      orig[i * 3 + 2] = z;
    }
    return [pos, orig];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const arr = posAttr.array;
    const t = state.clock.elapsedTime;

    const mx = (mouse?.current?.x ?? 0) * 3.5;
    const my = (mouse?.current?.y ?? 0) * 2.8;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      let ox = origPositions[idx] + Math.sin(t * 0.3 + i) * 0.05;
      let oy = origPositions[idx + 1] + Math.cos(t * 0.25 + i * 1.3) * 0.05;
      let oz = origPositions[idx + 2];

      const dx = arr[idx] - mx;
      const dy = arr[idx + 1] - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 1.5) {
        const force = (1.5 - dist) * 0.03;
        arr[idx] += (dx / dist) * force;
        arr[idx + 1] += (dy / dist) * force;
      } else {
        arr[idx] += (ox - arr[idx]) * 0.03;
        arr[idx + 1] += (oy - arr[idx + 1]) * 0.03;
        arr[idx + 2] += (oz - arr[idx + 2]) * 0.03;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        map={particleTexture}
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Deep atmospheric background layer (darkened heavily outside the cube: RGB ~ 0-4%)
function DarkenedBackgroundPlane({ texture, bgScale = 1.85 }) {
  const bgMat = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uCubeScreenCenter: { value: new THREE.Vector2(0.62, 0.50) },
        uScale: { value: bgScale }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform vec2 uCubeScreenCenter;
        uniform float uScale;

        void main() {
          vec2 uvScaled = (vUv - vec2(0.5)) * uScale + vec2(0.5);
          vec3 col = texture2D(uTexture, clamp(uvScaled, 0.0, 1.0)).rgb;
          float d = distance(vUv, vec2(0.65, 0.45));
          float vignette = smoothstep(0.45, 0.15, d) * 0.035;
          gl_FragColor = vec4(col * vignette, 1.0);
        }
      `,
      depthWrite: false
    });
  }, [texture, bgScale]);

  return (
    <mesh position={[0, 0, -2.8]}>
      <planeGeometry args={[14, 8]} />
      <primitive object={bgMat} attach="material" />
    </mesh>
  );
}

// The Clear Optical Glass Cube with 7-Color Light Diffraction
export default function CrystalObject({ mouse, scrollProgress }) {
  const cubeGroupRef = useRef();
  const shaderMatRef = useRef();
  const { size, viewport } = useThree();

  // Load Udaipur Palace Night texture as the background environment
  const backgroundTexture = useLoader(THREE.TextureLoader, '/assets/udaipur_palace.webp');
  backgroundTexture.wrapS = THREE.ClampToEdgeWrapping;
  backgroundTexture.wrapT = THREE.ClampToEdgeWrapping;
  backgroundTexture.minFilter = THREE.LinearFilter;
  backgroundTexture.magFilter = THREE.LinearFilter;

  // True 3D Cube geometry (equal dimensions: 2.1 x 2.1 x 2.1) with more rounded bevel edges
  const roundedCubeGeo = useMemo(() => {
    return new RoundedBoxGeometry(2.1, 2.1, 2.1, 20, 0.28);
  }, []);

  // Bevel highlight edges tracking the rounded cube contours
  const edgeGeo = useMemo(() => {
    return new THREE.EdgesGeometry(roundedCubeGeo, 28);
  }, [roundedCubeGeo]);

  // Physical inertia rotation state
  const rotationState = useRef({
    // Initial rotation: x = -0.42, y = 0.62, z = 0.18
    rotX: -0.42,
    rotY: 0.62,
    rotZ: 0.18,
    velX: 0,
    velY: 0,
    isDragging: false,
    lastPointerX: 0,
    lastPointerY: 0
  });

  // Attach pointer drag with physics inertia
  useEffect(() => {
    const handlePointerDown = (e) => {
      if (e.clientX > window.innerWidth * 0.35) {
        rotationState.current.isDragging = true;
        rotationState.current.lastPointerX = e.clientX;
        rotationState.current.lastPointerY = e.clientY;
        rotationState.current.velX = 0;
        rotationState.current.velY = 0;
      }
    };

    const handlePointerMove = (e) => {
      if (rotationState.current.isDragging) {
        const deltaX = (e.clientX - rotationState.current.lastPointerX) * 0.006;
        const deltaY = (e.clientY - rotationState.current.lastPointerY) * 0.006;

        rotationState.current.rotY += deltaX;
        rotationState.current.rotX += deltaY;

        rotationState.current.velY = deltaX;
        rotationState.current.velX = deltaY;

        rotationState.current.lastPointerX = e.clientX;
        rotationState.current.lastPointerY = e.clientY;
      }
    };

    const handlePointerUp = () => {
      rotationState.current.isDragging = false;
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  // Custom Shader Uniforms (Completely clear, no orange tint, really low refraction, 7-color light diffraction)
  const uniforms = useMemo(() => ({
    uBackground: { value: backgroundTexture },
    uResolution: { value: new THREE.Vector2(size.width * viewport.dpr, size.height * viewport.dpr) },
    uIOR: { value: 1.48 },
    uRefractionStrength: { value: 0.04 },
    uChromaticAberration: { value: 0.005 },
    uFresnelPower: { value: 4.0 },
    uOpacity: { value: 0.96 },
    uTime: { value: 0 },
    uCubeScreenCenter: { value: new THREE.Vector2(0.62, 0.50) },
    uBgScale: { value: 1.85 },
    uBgOffset: { value: new THREE.Vector2(0.5, 0.48) }
  }), [backgroundTexture, size.width, size.height, viewport.dpr]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const currentScroll = scrollProgress ? scrollProgress.current : 0;
    const rot = rotationState.current;

    if (shaderMatRef.current) {
      shaderMatRef.current.uniforms.uTime.value = t;
      shaderMatRef.current.uniforms.uResolution.value.set(
        state.size.width * state.viewport.dpr,
        state.size.height * state.viewport.dpr
      );
      shaderMatRef.current.uniforms.uRefractionStrength.value = 0.04 + currentScroll * 0.02;
    }

    if (!rot.isDragging) {
      // Idle continuous slow rotation
      rot.rotY += 0.0028 * (delta * 60);
      rot.rotX += 0.0010 * (delta * 60);

      // Dampen drag velocity: velocity *= Math.pow(0.94, delta * 60)
      rot.velX *= Math.pow(0.94, delta * 60);
      rot.velY *= Math.pow(0.94, delta * 60);

      rot.rotX += rot.velX;
      rot.rotY += rot.velY;
    }

    if (cubeGroupRef.current) {
      const mx = mouse?.current?.x ?? 0;
      const my = mouse?.current?.y ?? 0;
      const hoverTiltX = my * 0.12 - currentScroll * 0.25;
      const hoverTiltY = mx * 0.18 + currentScroll * 0.35;

      cubeGroupRef.current.rotation.x = rot.rotX + hoverTiltX;
      cubeGroupRef.current.rotation.y = rot.rotY + hoverTiltY;
      cubeGroupRef.current.rotation.z = rot.rotZ;

      const floatY = Math.sin(t * 0.6) * 0.04 + (my * 0.05) - currentScroll * 1.1;
      const floatZ = currentScroll * 1.2;

      cubeGroupRef.current.position.y = THREE.MathUtils.lerp(cubeGroupRef.current.position.y, 0.05 + floatY, 0.05);
      cubeGroupRef.current.position.z = THREE.MathUtils.lerp(cubeGroupRef.current.position.z, floatZ, 0.05);
    }
  });

  return (
    // Situated in the CENTER-RIGHT area ([1.05, 0.05, 0])
    <group position={[1.05, 0.05, 0]}>
      {/* Background darkened plane outside the cube */}
      <DarkenedBackgroundPlane texture={backgroundTexture} bgScale={1.85} />

      {/* Floating Network Node Particles (Pure White Starlight) */}
      <SubtleParticles mouse={mouse} />

      {/* Cube's 7-Color Spectral Rainbow Reflection Sweep (Diffracted Light Path) */}
      <SpectralReflectionSweep />

      {/* Main Clear Optical Glass Cube with 7-Color Light Diffraction */}
      <group ref={cubeGroupRef} position={[0, 0.05, 0]}>

        {/* Core Clear Glass Cube with 7-Color Light Diffraction Shader */}
        <mesh geometry={roundedCubeGeo}>
          <shaderMaterial
            ref={shaderMatRef}
            vertexShader={refractionLensVertexShader}
            fragmentShader={refractionLensFragmentShader}
            uniforms={uniforms}
            transparent={true}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Outer Clear Glass Surface Sheen (Pure white specular reflections, crystal clear) */}
        <mesh geometry={roundedCubeGeo} scale={[1.006, 1.006, 1.006]}>
          <meshPhysicalMaterial
            color="#FFFFFF"
            transparent={true}
            opacity={0.20}
            roughness={0.02}
            metalness={0.04}
            transmission={0.98}
            ior={1.15}
            thickness={0.2}
            clearcoat={1.0}
            clearcoatRoughness={0.01}
            specularIntensity={2.2}
            specularColor="#FFFFFF"
            depthWrite={false}
          />
        </mesh>

        {/* Studio White Bevel Facet Edges */}
        <lineSegments geometry={edgeGeo}>
          <lineBasicMaterial color="#FFFFFF" transparent opacity={0.65} linewidth={1} />
        </lineSegments>
      </group>
    </group>
  );
}
