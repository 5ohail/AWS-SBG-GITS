export const glassVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPosition;
  varying vec2 vUv;
  
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScroll;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    
    // Subtle organic breathing animation
    float breath = sin(uTime * 0.8 + position.y * 1.5) * 0.02;
    transformed += normal * breath;

    // Subtle reaction to mouse displacement
    float mouseDist = length(uMouse);
    transformed.z += sin(uTime * 1.2 + position.x * 2.0) * (0.01 + mouseDist * 0.02);

    vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
    vWorldPosition = worldPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(cameraPosition - worldPosition.xyz);
    
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const glassFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScroll;
  uniform vec3 uColorTint;
  uniform float uDispersion;

  // Simple pseudo-noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);

    // Optical Fresnel calculation
    float NdotV = max(0.0, dot(normal, viewDir));
    float fresnel = pow(1.0 - NdotV, 3.2);
    float edgeGlow = pow(1.0 - NdotV, 5.0);

    // Refraction vectors with chromatic dispersion (separate R, G, B)
    float baseIor = 1.48;
    float disp = uDispersion * (1.0 + uScroll * 1.5);
    
    vec3 refractR = refract(-viewDir, normal, 1.0 / (baseIor - disp));
    vec3 refractG = refract(-viewDir, normal, 1.0 / baseIor);
    vec3 refractB = refract(-viewDir, normal, 1.0 / (baseIor + disp));

    // Internal sphere/cube coordinate mapping
    vec2 uvBase = vUv - vec2(0.5);
    // Mouse nudge
    uvBase += uMouse * 0.08;

    // Optical distortion curvature
    float r = length(uvBase);
    vec2 distortedUv = uvBase * (1.0 + 0.35 * r * r) + vec2(0.5);

    vec2 uvR = distortedUv + refractR.xy * 0.12;
    vec2 uvG = distortedUv + refractG.xy * 0.12;
    vec2 uvB = distortedUv + refractB.xy * 0.12;

    // Sample texture with chromatic dispersion
    float colR = texture2D(uTexture, clamp(uvR, 0.001, 0.999)).r;
    float colG = texture2D(uTexture, clamp(uvG, 0.001, 0.999)).g;
    float colB = texture2D(uTexture, clamp(uvB, 0.001, 0.999)).b;

    vec3 sceneColor = vec3(colR, colG, colB);

    // Warm Udaipur golden twilight accent
    vec3 warmAmber = vec3(1.0, 0.65, 0.18);
    vec3 cyanHighlight = vec3(0.3, 0.8, 1.0);
    
    // Prismatic spectral edge sheen
    vec3 spectralColor = 0.5 + 0.5 * cos(6.28318 * (fresnel * 1.8 + vec3(0.0, 0.33, 0.67)));

    // Specular highlight
    vec3 lightDir = normalize(vec3(0.8, 1.2, 1.5) + vec3(uMouse.x, uMouse.y, 0.0));
    vec3 halfVec = normalize(lightDir + viewDir);
    float spec = pow(max(0.0, dot(normal, halfVec)), 64.0);
    float wideSpec = pow(max(0.0, dot(normal, halfVec)), 16.0);

    // Subtle film grain
    float noise = (hash(gl_FragCoord.xy + uTime * 20.0) - 0.5) * 0.035;

    // Combine layers: Inner Udaipur scene + Prismatic dispersion + Fresnel + Specular
    vec3 finalColor = sceneColor;
    
    // Amplify golden palace lighting inside
    finalColor += warmAmber * smoothstep(0.4, 0.9, length(sceneColor)) * 0.45;
    
    // Add spectral dispersion on edges
    finalColor += spectralColor * fresnel * 0.65;
    
    // Add bright glass boundary reflections
    finalColor += vec3(1.0) * (spec * 1.4 + wideSpec * 0.3);
    finalColor += warmAmber * edgeGlow * 1.8;
    finalColor += cyanHighlight * pow(fresnel, 4.0) * 0.5;

    // Subtle noise
    finalColor += noise;

    // High transmission glass alpha: bevels/edges are more opaque & reflective, center reveals interior
    float alpha = clamp(0.72 + fresnel * 0.28 + spec * 0.4, 0.0, 1.0);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;
