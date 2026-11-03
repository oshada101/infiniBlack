/**
 * The prism field: the loader's five colours as a slow, living fluid, drawn
 * with one WebGL fragment shader into a canvas. It is the hero's subject and
 * is only ever seen through the diamond aperture that clips its canvas.
 *
 * Rendered at CSS-pixel resolution, not device resolution — the field is all
 * soft gradient, so a retina screen gains nothing from four times the pixels,
 * and the grain reads better slightly enlarged anyway.
 *
 * Returns a stop function. Falls back to doing nothing (the caller's CSS
 * gradient shows instead) when WebGL is unavailable.
 */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;

// 3D simplex noise — Ashima Arts / Stefan Gustavson, MIT
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float fbm(vec3 p) {
  float s = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    s += a * snoise(p);
    p = p * 2.03 + vec3(1.7, -2.3, 0.0);
    a *= 0.45;
  }
  return s;
}

// the loader's five hues, as a loop: blue, purple, magenta, coral, orange
vec3 ramp(float t) {
  vec3 c0 = vec3(0.247, 0.420, 1.000); // #3f6bff
  vec3 c1 = vec3(0.604, 0.361, 1.000); // #9a5cff
  vec3 c2 = vec3(1.000, 0.247, 0.604); // #ff3f9a
  vec3 c3 = vec3(1.000, 0.416, 0.216); // #ff6a37
  vec3 c4 = vec3(1.000, 0.604, 0.180); // #ff9a2e
  t = fract(t) * 5.0;
  float f = fract(t);
  f = f * f * (3.0 - 2.0 * f);
  if (t < 1.0) return mix(c0, c1, f);
  if (t < 2.0) return mix(c1, c2, f);
  if (t < 3.0) return mix(c2, c3, f);
  if (t < 4.0) return mix(c3, c4, f);
  return mix(c4, c0, f);
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  // height-normalised, so the field keeps its scale whatever the aspect
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime * 0.05;

  // the pointer leans on the field, never drags it
  p += uPointer * 0.08;

  // two rounds of domain warping at low frequency: big, slow folds, the
  // loader's gooey blobs grown up rather than marble
  vec2 q = vec2(
    fbm(vec3(p * 0.7, t)),
    fbm(vec3(p * 0.7 + vec2(5.2, 1.3), t + 3.1))
  );
  vec2 r = vec2(
    fbm(vec3(p * 0.9 + 1.6 * q + vec2(1.7, 9.2), t * 1.3)),
    fbm(vec3(p * 0.9 + 1.6 * q + vec2(8.3, 2.8), t * 1.3 + 7.0))
  );
  float f = fbm(vec3(p * 0.7 + 1.7 * r, t * 0.8));

  vec3 col = ramp(0.42 + f * 0.75 + r.x * 0.45 + p.y * 0.18);

  // folds: the field darkens a little where it turns away, lifts where it
  // faces you, so it reads as a surface rather than a gradient
  float fold = smoothstep(-0.6, 0.7, f + 0.25 * length(r));
  col *= 0.8 + 0.3 * fold;
  col = mix(col, vec3(1.0, 0.94, 0.9), pow(smoothstep(0.4, 1.0, fold), 4.0) * 0.18);

  col += (hash(gl_FragCoord.xy + fract(uTime * 7.0) * 91.0) - 0.5) * 0.04;
  gl_FragColor = vec4(col, 1.0);
}
`;

export interface PrismField {
  /** begin the motion; a no-op if already running or built still */
  start: () => void;
  /** hold the current frame; start() picks up again from it */
  pause: () => void;
  stop: () => void;
}

export function prismField(
  canvas: HTMLCanvasElement,
  {
    animate = true,
    autoplay = true,
    pointerTarget,
  }: {
    animate?: boolean;
    /** false: draw the first frame and wait for start(). Anything hidden at
        load (behind the curtain) shouldn't spend frames nobody can see. */
    autoplay?: boolean;
    pointerTarget?: HTMLElement;
  } = {},
): PrismField | null {
  // failIfMajorPerformanceCaveat: refuse a software renderer. There the
  // shader costs seconds of main thread — enough to hold the curtain shut —
  // and the CSS gradient under the canvas is the better fallback.
  const gl = canvas.getContext('webgl', {
    antialias: false,
    alpha: false,
    premultipliedAlpha: false,
    failIfMajorPerformanceCaveat: true,
  });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn('[prism-field]', gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  };

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;

  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  // one triangle that covers the viewport
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uPointer = gl.getUniformLocation(prog, 'uPointer');

  const resize = () => {
    const w = Math.max(1, Math.round(canvas.clientWidth));
    const h = Math.max(1, Math.round(canvas.clientHeight));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, w, h);
  };

  // a fixed starting point, so the first frame is always a good one
  const T0 = 14;
  let elapsed = 0;
  let last = performance.now();
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  const draw = () => {
    gl.uniform1f(uTime, T0 + elapsed);
    gl.uniform2f(uPointer, pointer.x, pointer.y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const ro = new ResizeObserver(() => { resize(); if (!animate) draw(); });
  ro.observe(canvas);
  resize();
  draw();

  if (!animate) return { start: () => {}, pause: () => {}, stop: () => ro.disconnect() };

  const onPointer = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    // -1..1 across the aperture, clamped so a far-off cursor can't yank it
    pointer.tx = Math.max(-1.5, Math.min(1.5, ((e.clientX - r.left) / r.width - 0.5) * 2));
    pointer.ty = Math.max(-1.5, Math.min(1.5, -((e.clientY - r.top) / r.height - 0.5) * 2));
  };
  (pointerTarget ?? window).addEventListener('pointermove', onPointer as EventListener, { passive: true });

  let visible = true;
  let running = autoplay;
  let raf = 0;
  const loop = (now: number) => {
    raf = 0;
    // cap the step, so a long-hidden tab doesn't jump the field forward
    elapsed += Math.min(0.05, (now - last) / 1000);
    last = now;
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    draw();
    schedule();
  };
  const schedule = () => {
    if (running && !raf && visible && !document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  };

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  });
  io.observe(canvas);
  const onVis = () => schedule();
  document.addEventListener('visibilitychange', onVis);
  schedule();

  return {
    start: () => {
      running = true;
      schedule();
    },
    pause: () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    },
    stop: () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      (pointerTarget ?? window).removeEventListener('pointermove', onPointer as EventListener);
    },
  };
}
