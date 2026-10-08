export const refractionLensVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    // Normal in world space
    vNormal = normalize(mat3(modelMatrix) * normal);
    
    // Direction from fragment to camera in world space
    vViewDir = normalize(cameraPosition - worldPosition.xyz);
    
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const refractionLensFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  uniform sampler2D uBackground;
  uniform vec2 uResolution;
  uniform float uIOR;
  uniform float uRefractionStrength;
  uniform float uChromaticAberration;
  uniform float uFresnelPower;
  uniform float uOpacity;
  uniform float uTime;
  uniform vec2 uCubeScreenCenter;
  uniform float uBgScale;
  uniform vec2 uBgOffset;
  uniform float uIsLight; // 0.0 = Dark Mode, 1.0 = Light Mode (smoothly interpolated)

  // Authentic 7-color spectral diffraction function (Newton's Rainbow: ROYGBIV)
  // Red -> Orange -> Yellow -> Green -> Blue -> Indigo -> Violet
  vec3 getSpectral7(float phase) {
    float p = fract(phase) * 6.0;
    if (p < 1.0) {
      return mix(vec3(1.0, 0.05, 0.05), vec3(1.0, 0.52, 0.0), p);
    } else if (p < 2.0) {
      return mix(vec3(1.0, 0.52, 0.0), vec3(1.0, 0.95, 0.05), p - 1.0);
    } else if (p < 3.0) {
      return mix(vec3(1.0, 0.95, 0.05), vec3(0.05, 0.95, 0.25), p - 2.0);
    } else if (p < 4.0) {
      return mix(vec3(0.05, 0.95, 0.25), vec3(0.0, 0.72, 1.0), p - 3.0);
    } else if (p < 5.0) {
      return mix(vec3(0.0, 0.72, 1.0), vec3(0.28, 0.12, 0.95), p - 4.0);
    } else {
      return mix(vec3(0.28, 0.12, 0.95), vec3(0.75, 0.05, 0.88), p - 5.0);
    }
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewDir);

    // Screen UV of current fragment [0.0, 1.0]
    vec2 screenUV = gl_FragCoord.xy / uResolution;

    // Aspect ratio correction
    float aspect = uResolution.x / uResolution.y;

    // Center background mapping behind the glass cube
    vec2 bgCenter = uCubeScreenCenter;
    vec2 offsetFromCenter = screenUV - bgCenter;
    vec2 bgUV = offsetFromCenter * vec2(1.0, 1.0 / aspect) * uBgScale + uBgOffset;

    // Multi-wavelength chromatic dispersion (R, G, B channels split through pure optical glass)
    float iorR = uIOR - uChromaticAberration;
    float iorG = uIOR;
    float iorB = uIOR + uChromaticAberration;

    vec3 refractR = refract(-V, N, 1.0 / iorR);
    vec3 refractG = refract(-V, N, 1.0 / iorG);
    vec3 refractB = refract(-V, N, 1.0 / iorB);

    if (length(refractR) < 0.01) refractR = reflect(-V, N);
    if (length(refractG) < 0.01) refractG = reflect(-V, N);
    if (length(refractB) < 0.01) refractB = reflect(-V, N);

    // Displace background sampling coordinates through surface normals
    float strength = uRefractionStrength;
    vec2 uvR = bgUV + refractR.xy * strength;
    vec2 uvG = bgUV + refractG.xy * strength;
    vec2 uvB = bgUV + refractB.xy * strength;

    // Minimal optical lens curvature
    float distFromAxis = length(vUv - vec2(0.5));
    float barrel = 1.0 + 0.03 * distFromAxis * distFromAxis;
    uvR = (uvR - vec2(0.5)) * barrel + vec2(0.5);
    uvG = (uvG - vec2(0.5)) * barrel + vec2(0.5);
    uvB = (uvB - vec2(0.5)) * barrel + vec2(0.5);

    // Sample background texture
    float colR = texture2D(uBackground, clamp(uvR, 0.001, 0.999)).r;
    float colG = texture2D(uBackground, clamp(uvG, 0.001, 0.999)).g;
    float colB = texture2D(uBackground, clamp(uvB, 0.001, 0.999)).b;

    vec3 rawPalace = vec3(colR, colG, colB);

    // =========================================================================
    // COLOR GRADING & ENVIRONMENT ILLUMINATION ACROSS MODES
    // Section 15 & 16:
    // Dark Mode: Deep atmospheric reflections, white highlights, orange rim.
    // Light Mode: Clear architectural optical glass, slightly increased exposure,
    // lifted deep blacks, preserved warm palace lighting & blue shadows.
    // =========================================================================
    vec3 darkGrading = rawPalace;

    // Light Mode photographic treatment:
    // - Lift deep blacks and shadows gently (pow 0.86)
    // - Boost exposure by ~15%
    // - Preserve golden palace lamps & Mewari architectural warmth
    vec3 liftedPalace = pow(rawPalace, vec3(0.86)) * 1.15;
    vec3 warmPalaceAccent = vec3(1.0, 0.68, 0.24) * smoothstep(0.35, 0.85, length(rawPalace)) * 0.18;
    vec3 lightGrading = liftedPalace + warmPalaceAccent;

    // Seamlessly interpolate between Dark Mode and Light Mode internal grading
    vec3 clearGlassColor = mix(darkGrading, lightGrading, uIsLight);

    // Optical Fresnel Calculation
    float NdotV = max(0.0, dot(N, V));
    float fresnelPower = mix(uFresnelPower, 3.4, uIsLight);
    float fresnel = pow(1.0 - NdotV, fresnelPower);
    float edgeSheen = pow(1.0 - NdotV, 5.2);

    // Dynamic studio key light:
    // Pure white key directional light from upper-right front
    vec3 whiteLightDir = normalize(vec3(0.65, 1.25, 1.35));
    vec3 halfKey = normalize(whiteLightDir + V);
    float keySpec = pow(max(0.0, dot(N, halfKey)), 95.0);
    float broadSpec = pow(max(0.0, dot(N, halfKey)), 24.0);

    // Secondary rim light from left
    vec3 rimLightDir = normalize(vec3(-1.1, 0.2, -0.6));
    vec3 halfRim = normalize(rimLightDir + V);
    float rimSpec = pow(max(0.0, dot(N, halfRim)), 45.0);

    // 7-color spectral diffraction on facet bevels
    float diffractionPhase = dot(N, whiteLightDir) * 2.8 + fresnel * 3.4 + dot(N, V) * 1.6;
    vec3 spectral7 = getSpectral7(diffractionPhase);

    // Reflection strength: Dark = 0.90, Light = 1.15 (Section 15)
    float reflectionStrength = mix(0.90, 1.15, uIsLight);

    // Composite clear optical glass
    vec3 color = clearGlassColor;

    // 1. Spectral dispersion at facet boundaries
    // In Light mode, keep spectral diffraction crisp and refined (optical editorial feel)
    float spectralIntensity = mix(0.85, 0.65, uIsLight);
    color += spectral7 * fresnel * spectralIntensity * reflectionStrength;
    color += spectral7 * edgeSheen * mix(1.25, 0.95, uIsLight) * reflectionStrength;

    // 2. Pure brilliant white specular core with prismatic halo
    float specBrightness = mix(1.9, 2.25, uIsLight);
    color += mix(vec3(1.0, 1.0, 1.0), spectral7, mix(0.70, 0.40, uIsLight)) * keySpec * specBrightness;
    color += vec3(1.0, 1.0, 1.0) * broadSpec * mix(0.22, 0.32, uIsLight);

    // 3. Crisp white & subtle AWS orange rim specular highlight
    vec3 awsOrangeGlint = vec3(1.0, 0.60, 0.0);
    vec3 rimHighlight = mix(vec3(1.0, 1.0, 1.0), awsOrangeGlint, mix(0.12, 0.28, uIsLight));
    color += rimHighlight * rimSpec * mix(0.9, 1.1, uIsLight);

    // 4. In Light Mode: Add soft architectural glass ambient depth
    // Gives the cube substantial presence and depth on a warm light background without turning opaque
    if (uIsLight > 0.01) {
      float centerClear = 1.0 - fresnel;
      vec3 subtleAmbientReflect = vec3(0.98, 0.97, 0.95) * fresnel * 0.22 * uIsLight;
      color += subtleAmbientReflect;
    }

    // High transmission clear glass alpha: transparent center, reflective grazing bevels
    float baseAlpha = mix(0.96, 0.92, uIsLight);
    float alpha = clamp(baseAlpha * (0.88 + fresnel * 0.12 + keySpec * 0.35), 0.0, 1.0);

    gl_FragColor = vec4(color, alpha);
  }
`;
