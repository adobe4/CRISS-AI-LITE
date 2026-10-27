import React, {useMemo} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {AbsoluteFill, Img, interpolate, Easing, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Earth, Sun, Moon, Stars, NOISE} from './space';

const FPS = 30;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const io = Easing.bezier(0.45, 0, 0.25, 1);
export const lerp3 = (a: number[], b: number[], p: number) => new THREE.Vector3(a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p);

const Rig: React.FC<{pos: THREE.Vector3; look: THREE.Vector3; fov?: number; roll?: number}> = ({pos, look, fov = 35, roll = 0}) => {
  const {camera} = useThree();
  camera.position.copy(pos);
  camera.up.set(Math.sin(roll), Math.cos(roll), 0);
  camera.lookAt(look);
  (camera as THREE.PerspectiveCamera).fov = fov; (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  return null;
};

export const R3 = 2 / 3; // 3D render scale (720p), upscaled to 1080p
const Canvas3D: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {width, height} = useVideoConfig();
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: width * R3, height: height * R3, transform: `scale(${1 / R3})`, transformOrigin: '0 0'}}>
      <ThreeCanvas width={width * R3} height={height * R3} gl={{antialias: true}} camera={{position: [0, 0, 10], fov: 35, near: 0.05, far: 2000}}>
        <color attach="background" args={['#07060a']} />
        {children}
      </ThreeCanvas>
    </div>
  );
};

/* ---------- SHOT 1: drifting toward the Sun, it vanishes ---------- */
export const ShotSunVanish: React.FC<{vanishAt: number}> = ({vanishAt}) => {
  const t = useCurrentFrame() / FPS;
  const p = interpolate(t, [0, vanishAt], [0, 1], {...cl, easing: Easing.out(Easing.quad)});
  const cam = lerp3([2.6, 0.8, 16], [0.9, 0.25, 9.5], p);
  const flash = interpolate(t, [vanishAt - 0.06, vanishAt, vanishAt + 0.5], [0, 1, 0], cl);
  const on = t < vanishAt ? 1 : 0;
  const shake = t > vanishAt && t < vanishAt + 0.4 ? (random('s' + Math.floor(t * 60)) - 0.5) * 0.05 : 0;
  return (
    <AbsoluteFill>
      <Canvas3D>
        <Rig pos={cam.add(new THREE.Vector3(shake, shake, 0))} look={new THREE.Vector3(0, 0, 0)} fov={34} />
        <Stars n={9000} />
        <Sun pos={[0, 0, 0]} r={2.2 * (t < vanishAt ? 1 + 0.08 * interpolate(t, [vanishAt - 0.25, vanishAt], [0, 1], cl) : 1)} on={on} camPos={cam} />
      </Canvas3D>
      <AbsoluteFill style={{background: '#fffaf0', opacity: flash, mixBlendMode: 'screen'}} />
      {/* retinal afterimage */}
      <AbsoluteFill style={{opacity: interpolate(t, [vanishAt + 0.1, vanishAt + 2.2], [0.35, 0], cl), background: 'radial-gradient(circle at 50% 50%, rgba(239,233,223,0.0) 0, rgba(239,233,223,0.0) 13%, rgba(239,233,223,0.55) 15%, rgba(239,233,223,0.0) 22%)', filter: 'blur(6px)'}} />
    </AbsoluteFill>
  );
};

/* ---------- SHOT: Earth beauty, light still arriving ---------- */
export const ShotEarth: React.FC<{from: number[]; to: number[]; look?: number[]; dur: number; sunOn?: number; withMoon?: boolean; fov?: number}> = ({from, to, look = [0, 0, 0], dur, sunOn = 1, withMoon, fov = 32}) => {
  const t = useCurrentFrame() / FPS;
  const p = interpolate(t, [0, dur], [0, 1], {...cl, easing: io});
  const cam = lerp3(from, to, p);
  const sunPos = new THREE.Vector3(-60, 12, 40);
  return (
    <Canvas3D>
      <Rig pos={cam} look={new THREE.Vector3(...look)} fov={fov} />
      <Stars n={9000} />
      <Earth sunPos={sunPos} sunOn={sunOn} camPos={cam} spin={2.2} />
      {withMoon ? <Moon pos={[5.5, 1.1, -7]} r={0.27} sunPos={sunPos} sunOn={sunOn} /> : null}
    </Canvas3D>
  );
};

/* ---------- SHOT: light in transit (Sun -> Earth) ---------- */
const photonVert = `attribute float seed; uniform float t; uniform float launchEnd; uniform float speed; uniform float len; varying float vA;
void main(){ float born = seed*launchEnd; float x = (t-born)*speed; vA = step(0.,x)*step(x,len);
 float jitterY = fract(sin(seed*91.7)*437.1)-.5; float jitterZ = fract(sin(seed*13.3)*217.9)-.5;
 vec3 p = vec3(x, jitterY*0.55, jitterZ*0.55);
 vec4 mv = modelViewMatrix*vec4(p,1.); gl_PointSize = 9.0*(12./-mv.z); gl_Position = projectionMatrix*mv; }`;
const photonFrag = `varying float vA; void main(){ vec2 c=gl_PointCoord-.5; float d=length(c); float a=pow(smoothstep(.5,.0,d),2.2)*vA; gl_FragColor=vec4(vec3(1.,.97,.9)*a*2.2, 1.); }`;
export const ShotLightTrip: React.FC<{sunOffAt: number; dur: number; shift?: number; camFrom?: number[]; camTo?: number[]; look?: number[]; fov?: number; line?: boolean}> = ({sunOffAt, dur, shift = 0, camFrom = [-1, 3.2, 21], camTo = [1.2, 2.2, 19], look = [0, 0.2, 0], fov = 40, line = true}) => {
  const tl = useCurrentFrame() / FPS; const t = tl + shift;
  const L = 16; // Sun at x=-8, Earth at x=+8
  const speed = L / 5.2; // travel takes 5.2 s on screen
  const mat = useMemo(() => new THREE.ShaderMaterial({uniforms: {t: {value: 0}, launchEnd: {value: 1}, speed: {value: speed}, len: {value: L}}, vertexShader: photonVert, fragmentShader: photonFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, depthTest: false}), [speed]);
  const geo = useMemo(() => {
    const n = 5200; const g = new THREE.BufferGeometry(); const pos = new Float32Array(n * 3); const seed = new Float32Array(n);
    for (let i = 0; i < n; i++) seed[i] = i / n;
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('seed', new THREE.BufferAttribute(seed, 1)); return g;
  }, []);
  mat.uniforms.t.value = Math.max(0, t - 1.0); mat.uniforms.launchEnd.value = Math.max(0.01, sunOffAt - 1.0);
  const sunOn = t < sunOffAt ? 1 : interpolate(t, [sunOffAt, sunOffAt + 0.15], [1, 0], cl);
  const p = interpolate(tl, [0, dur], [0, 1], {...cl, easing: io});
  const cam = lerp3(camFrom, camTo, p);
  const sunPos = new THREE.Vector3(-8, 0, 0);
  // Earth is lit while photons still arrive: last photon arrives at sunOffAt + 5.2
  const earthLit = t < sunOffAt + 5.2 ? 1 : interpolate(t, [sunOffAt + 5.2, sunOffAt + 5.5], [1, 0.05], cl);
  return (
    <Canvas3D>
      <Rig pos={cam} look={new THREE.Vector3(...look)} fov={fov} />
      <Stars n={9000} />
      <Sun pos={[-8, 0, 0]} r={1.6} on={sunOn} camPos={cam} />
      <group position={[-8 + 1.65, 0, 0]}><points geometry={geo} material={mat} /></group>
      <Beam x0={-8 + 1.65} t={t} sunOffAt={sunOffAt} speed={speed} L={L - 1.65 - 1.2} />
      <Earth pos={[8, 0, 0]} r={1.15} sunPos={sunPos} sunOn={earthLit} camPos={cam} spin={2.4} ambient={0.06} />
      <GhostRing pos={[-8, 0, 0]} r={1.5} on={t > sunOffAt + 0.2 ? interpolate(t, [sunOffAt + 0.2, sunOffAt + 0.8], [0, 1], cl) : 0} cam={cam} />
      {line ? <DistanceLine on={interpolate(tl, [0.4, 1.4], [0, 1], cl)} /> : null}
    </Canvas3D>
  );
};

const beamFrag = `uniform float a0; uniform float a1; varying vec2 vUv; void main(){ float y=abs(vUv.y-.5)*2.; float core=exp(-y*y*18.); float x=vUv.x; float m=step(a0,x)*step(x,a1); gl_FragColor=vec4(vec3(1.,.96,.88)*core*m*.55,1.); }`;
const Beam: React.FC<{x0: number; t: number; sunOffAt: number; speed: number; L: number}> = ({x0, t, sunOffAt, speed, L}) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({uniforms: {a0: {value: 0}, a1: {value: 0}}, vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`, fragmentShader: beamFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending}), []);
  const head = Math.max(0, (t - 1.0) * speed) / L; const tail = Math.max(0, (t - sunOffAt) * speed) / L;
  mat.uniforms.a1.value = Math.min(1, head); mat.uniforms.a0.value = Math.min(1, tail);
  return <mesh position={[x0 + L / 2, 0, 0]} material={mat}><planeGeometry args={[L, 0.6]} /></mesh>;
};

const GhostRing: React.FC<{pos: [number, number, number]; r: number; on: number; cam: THREE.Vector3}> = ({pos, r, on, cam}) => {
  const geo = useMemo(() => { const pts: THREE.Vector3[] = []; for (let i = 0; i <= 128; i++) { const a = (i / 128) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0)); } return new THREE.BufferGeometry().setFromPoints(pts); }, [r]);
  const mat = useMemo(() => new THREE.LineDashedMaterial({color: '#EFE9DF', dashSize: 0.18, gapSize: 0.14, transparent: true}), []);
  const line = useMemo(() => { const l = new THREE.Line(geo, mat); l.computeLineDistances(); return l; }, [geo, mat]);
  mat.opacity = on * 0.8;
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), cam.clone().sub(new THREE.Vector3(...pos)).normalize());
  return <primitive object={line} position={pos} quaternion={q} />;
};

const DistanceLine: React.FC<{on: number}> = ({on}) => {
  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-6.2, -2.1, 0), new THREE.Vector3(6.7, -2.1, 0)]), []);
  const mat = useMemo(() => new THREE.LineDashedMaterial({color: '#EFE9DF', dashSize: 0.12, gapSize: 0.12, transparent: true}), []);
  const line = useMemo(() => { const l = new THREE.Line(geo, mat); l.computeLineDistances(); return l; }, [geo, mat]);
  mat.opacity = 0.45 * on;
  return <primitive object={line} />;
};

/* ---------- SHOT: space-time fabric, ripple of "news" ---------- */
const gridVert = `uniform float t; uniform float vanish; uniform float speed; varying float vD; varying float vFade;
float well(float r){ return -2.4*exp(-(r*r)/(2.*1.6*1.6)); }
void main(){ vec3 p=position; float r=length(p.xz);
 float y = well(r);
 if (t>vanish){ float front=(t-vanish)*speed; float inside=smoothstep(front+0.6, front-0.6, r); y = mix(y, 0., inside);
   y += 0.35*exp(-pow(r-front,2.)/0.35)*max(0.,1.-(t-vanish)/9.); }
 p.y=y; vD=y; vFade=smoothstep(26.,10.,r);
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }`;
const gridFrag = `varying float vD; varying float vFade; void main(){ gl_FragColor=vec4(vec3(.94,.91,.86), (.38+.5*smoothstep(0.,-2.4,vD))*vFade); }`;
export const ShotSpacetime: React.FC<{vanishAt: number; dur: number; earthOrbit?: boolean}> = ({vanishAt, dur}) => {
  const t = useCurrentFrame() / FPS;
  const mat = useMemo(() => new THREE.ShaderMaterial({uniforms: {t: {value: 0}, vanish: {value: 0}, speed: {value: 2.4}}, vertexShader: gridVert, fragmentShader: gridFrag, transparent: true, depthWrite: false}), []);
  const geo = useMemo(() => {
    const pts: number[] = []; const N = 60, S = 30, step = (2 * S) / N, sub = 6;
    for (let i = 0; i <= N; i++) { const a = -S + i * step; for (let j = 0; j < N * sub; j++) { const b0 = -S + (j / sub) * step, b1 = -S + ((j + 1) / sub) * step; pts.push(a, 0, b0, a, 0, b1, b0, 0, a, b1, 0, a); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); return g;
  }, []);
  mat.uniforms.t.value = t; mat.uniforms.vanish.value = vanishAt;
  const p = interpolate(t, [0, dur], [0, 1], {...cl, easing: io});
  const cam = lerp3([-1.5, 4.2, 13.5], [2.8, 3.0, 11.0], p);
  const sunOn = t < vanishAt ? 1 : interpolate(t, [vanishAt, vanishAt + 0.15], [1, 0], cl);
  // Earth keeps circling the dent until the ripple reaches its orbit (r=7)
  const orbitR = 7; const arrive = vanishAt + orbitR / 2.4;
  const ang = 0.35 * t + 0.6;
  let ex = Math.cos(ang) * orbitR, ez = Math.sin(ang) * orbitR;
  if (t > arrive) { const a0 = 0.35 * arrive + 0.6; const d = (t - arrive) * 0.18 * orbitR; ex = Math.cos(a0) * orbitR - Math.sin(a0) * d; ez = Math.sin(a0) * orbitR + Math.cos(a0) * d; }
  const r = Math.hypot(ex, ez); const ey = t > arrive + 0.8 ? 0 : -2.4 * Math.exp(-(r * r) / (2 * 1.6 * 1.6));
  return (
    <Canvas3D>
      <Rig pos={cam} look={new THREE.Vector3(0.6, -1.0, 0)} fov={42} />
      <Stars n={8000} />
      <lineSegments geometry={geo} material={mat} />
      <Sun pos={[0, -1.25, 0]} r={1.05} on={sunOn} camPos={cam} />
      <Earth pos={[ex, ey + 0.5, ez]} r={0.5} sunPos={new THREE.Vector3(0, -1.25, 0)} sunOn={1} camPos={cam} ambient={0.12} />
    </Canvas3D>
  );
};

/* ---------- SHOT: just stars (the beat after) ---------- */
export const ShotStars: React.FC<{dur: number}> = ({dur}) => {
  const t = useCurrentFrame() / FPS;
  const cam = lerp3([0, 0, 10], [0.4, 0.1, 9], t / dur);
  return (<Canvas3D><Rig pos={cam} look={new THREE.Vector3(0, 0, 0)} fov={40} /><Stars n={9000} /></Canvas3D>);
};
