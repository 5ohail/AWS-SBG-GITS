export const speakerVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float uTime;
  uniform float uProgress;
  uniform float uDirection;
  uniform float uDistortion;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Subtle physical stretch / bend during transition peak
    float transPhase = sin(uProgress * 3.14159265);
    float bend = sin(uv.y * 3.14159265) * transPhase * uDistortion * 0.15;
    pos.x -= bend * uDirection;
    pos.z -= abs(bend) * 0.3;

    vPosition = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const speakerFragmentShader = `
  varying vec2 vUv;
  varying vec3 vPosition;

  uniform sampler2D uCurrentTexture;
  uniform sampler2D uNextTexture;
  uniform float uProgress;
  uniform float uDirection;
  uniform float uDistortion;
  uniform float uChromatic;
  uniform float uGlitch;
  uniform float uTime;
  uniform vec2 uParallax;
  uniform float uHover;
  uniform float uOpacity;
  uniform float uIsActive; // 1.0 if center active, 0.0 if side neighbor

  // Pseudo-random noise for subtle film grain
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 uv = vUv;

    // Apply subtle mouse parallax on active card
    uv += uParallax * 0.02 * uIsActive;

    // Transition peak factor: 0.0 at rest, 1.0 at midpoint (progress = 0.5)
    float transPhase = sin(uProgress * 3.14159265);

    // 1. Horizontal wave displacement during transition
    float wave = sin(uv.y * 14.0 + uTime * 4.0) * uDistortion * transPhase * 0.035 * uDirection;

    // 2. Deterministic horizontal glitch bands (80-200ms active window during transition)
    float sliceIndex = floor(uv.y * 22.0);
    float sliceSeed = hash(vec2(sliceIndex, floor(uTime * 12.0)));
    float isGlitch = step(0.72, sliceSeed) * transPhase * uGlitch;
    float sliceShift = (sliceSeed - 0.5) * 0.05 * isGlitch * uDirection;

    // Displaced UVs
    vec2 uvDist = uv + vec2(wave + sliceShift, 0.0);

    // Slide UVs for current and next textures
    vec2 uvCurrent = uvDist + vec2(-uDirection * uProgress * 0.45, 0.0);
    vec2 uvNext = uvDist + vec2(uDirection * (1.0 - uProgress) * 0.45, 0.0);

    // Keep UVs in [0.001, 0.999]
    uvCurrent = clamp(uvCurrent, 0.001, 0.999);
    uvNext = clamp(uvNext, 0.001, 0.999);

    // 3. Chromatic Aberration (R separates left, B separates right during transition only)
    float chromaOffset = uChromatic * transPhase * 0.032 * uIsActive;

    // Sample Current Texture with RGB split
    float r1 = texture2D(uCurrentTexture, clamp(uvCurrent + vec2(chromaOffset, 0.0), 0.001, 0.999)).r;
    float g1 = texture2D(uCurrentTexture, uvCurrent).g;
    float b1 = texture2D(uCurrentTexture, clamp(uvCurrent - vec2(chromaOffset, 0.0), 0.001, 0.999)).b;
    vec3 colCurrent = vec3(r1, g1, b1);

    // Sample Next Texture with RGB split
    float r2 = texture2D(uNextTexture, clamp(uvNext + vec2(chromaOffset, 0.0), 0.001, 0.999)).r;
    float g2 = texture2D(uNextTexture, uvNext).g;
    float b2 = texture2D(uNextTexture, clamp(uvNext - vec2(chromaOffset, 0.0), 0.001, 0.999)).b;
    vec3 colNext = vec3(r2, g2, b2);

    // Smooth transition blend between textures
    float blendFactor = smoothstep(0.32, 0.68, uProgress);
    vec3 color = mix(colCurrent, colNext, blendFactor);

    // 4. Color Grading: Preserve natural facial tones with deep architectural contrast
    color = pow(color, vec3(1.05)); // subtle contrast punch

    // 5. Delicate Film Grain
    float grain = hash(uv * 2.5 + fract(uTime * 0.05));
    color += (grain - 0.5) * 0.022;

    // 6. Architectural Vignette: soft darkening toward frame edges
    float distFromCenter = distance(vUv, vec2(0.5));
    float vignette = smoothstep(0.72, 0.28, distFromCenter);
    color = mix(color * 0.65, color, vignette);

    // Dark bottom gradient for legible integration with text / background
    float bottomVignette = smoothstep(0.0, 0.35, vUv.y);
    color *= mix(0.55, 1.0, bottomVignette);

    // If neighboring slide, apply atmospheric ambient dimming
    if (uIsActive < 0.5) {
      color *= 0.55;
    }

    // Hover subtle highlight
    color += vec3(0.04, 0.03, 0.01) * uHover * uIsActive;

    gl_FragColor = vec4(color, uOpacity);
  }
`;
