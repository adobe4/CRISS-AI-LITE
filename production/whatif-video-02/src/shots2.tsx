import React, {useMemo} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {AbsoluteFill, Img, interpolate, Easing, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Earth, Sun, Moon, Jupiter, Stars, NOISE} from './space';
import {lerp3, R3} from './shots';

const FPS = 30;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const io = Easing.bezier(0.45, 0, 0.25, 1);

/** shift = lens shift as a fraction of frame width; positive moves the subject right (leaves room for words on the left). */
const Rig: React.FC<{pos: THREE.Vector3; look: THREE.Vector3; fov?: number; shift?: number}> = ({pos, look, fov = 35, shift = 0}) => {
  const {camera, size} = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  camera.position.copy(pos); camera.up.set(0, 1, 0); camera.lookAt(look);
  cam.fov = fov;
  if (shift) cam.setViewOffset(size.width, size.height, -shift * size.width, 0, size.width, size.height); else cam.clearViewOffset();
  cam.updateProjectionMatrix();
  return null;
};
export const Canvas3D: React.FC<{children: React.ReactNode}> = ({children}) => {
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

const Glow: React.FC<{pos: [number, number, number]; size: number; intensity?: number}> = ({pos, size, intensity = 1}) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({uniforms: {k: {value: 1}}, vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`, fragmentShader: `uniform float k; varying vec2 vUv; void main(){ float r=length(vUv*2.-1.); float g=(exp(-r*r*18.)*1.2+exp(-r*4.)*.35)*smoothstep(1.,.8,r)*k; gl_FragColor=vec4(vec3(1.,.97,.92)*g,1.); }`, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending}), []);
  mat.uniforms.k.value = intensity;
  const {camera} = useThree();
  return <mesh position={pos} material={mat} quaternion={camera.quaternion}><planeGeometry args={[size, size]} /></mesh>;
};

/* ---------- neutron-star merger on the space-time fabric ---------- */
const mVert = `uniform float t; uniform float merge; varying float vFade; varying float vH;
void main(){ vec3 p=position; float r=length(p.xz); float th=atan(p.z,p.x);
 float k=1.6, w=6.0;
 float amp = 0.55*exp(-r*0.09) * (t<merge ? smoothstep(0.,merge,t) : exp(-(t-merge)*0.9));
 float y = amp*sin(2.*th - k*r + w*t) * smoothstep(0.6,2.5,r);
 if (t>merge){ float front=(t-merge)*5.; y += 0.9*exp(-pow(r-front,2.)/0.6)*exp(-(t-merge)*0.25); }
 y += -1.2*exp(-(r*r)/2.0);
 p.y=y; vH=y; vFade=smoothstep(26.,8.,r);
 gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }`;
const mFrag = `varying float vFade; varying float vH; void main(){ gl_FragColor=vec4(vec3(.94,.91,.86),(.3+.6*abs(vH))*vFade); }`;
export const ShotMerger: React.FC<{mergeAt: number; dur: number}> = ({mergeAt, dur}) => {
  const t = useCurrentFrame() / FPS;
  const mat = useMemo(() => new THREE.ShaderMaterial({uniforms: {t: {value: 0}, merge: {value: 1}}, vertexShader: mVert, fragmentShader: mFrag, transparent: true, depthWrite: false}), []);
  const geo = useMemo(() => {
    const pts: number[] = []; const N = 64, S = 26, step = (2 * S) / N, sub = 6;
    for (let i = 0; i <= N; i++) { const a = -S + i * step; for (let j = 0; j < N * sub; j++) { const b0 = -S + (j / sub) * step, b1 = -S + ((j + 1) / sub) * step; pts.push(a, 0, b0, a, 0, b1, b0, 0, a, b1, 0, a); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); return g;
  }, []);
  mat.uniforms.t.value = t; mat.uniforms.merge.value = mergeAt;
  // inspiral: radius shrinks, angular speed rises
  const k = Math.min(1, t / mergeAt); const rad = 2.2 * Math.pow(1 - k, 0.6) + 0.02; const ang = 2.5 * t + 6 * Math.pow(k, 4);
  const merged = t >= mergeAt;
  const flash = merged ? interpolate(t, [mergeAt, mergeAt + 0.12, mergeAt + 2.5], [0, 1, 0.15], cl) : 0;
  const p = interpolate(t, [0, dur], [0, 1], {...cl, easing: io});
  const cam = lerp3([0, 7.5, 13], [0, 5.5, 10.5], p);
  return (
    <AbsoluteFill>
      <Canvas3D>
        <Rig pos={cam} look={new THREE.Vector3(0, -0.6, 0)} fov={42} />
        <Stars n={8000} />
        <lineSegments geometry={geo} material={mat} />
        {!merged ? <>
          <mesh position={[Math.cos(ang) * rad, 0, Math.sin(ang) * rad]}><sphereGeometry args={[0.16, 32, 32]} /><meshBasicMaterial color="#ffffff" /></mesh>
          <mesh position={[-Math.cos(ang) * rad, 0, -Math.sin(ang) * rad]}><sphereGeometry args={[0.16, 32, 32]} /><meshBasicMaterial color="#ffffff" /></mesh>
          <Glow pos={[Math.cos(ang) * rad, 0, Math.sin(ang) * rad]} size={1.6} />
          <Glow pos={[-Math.cos(ang) * rad, 0, -Math.sin(ang) * rad]} size={1.6} />
        </> : <Glow pos={[0, 0, 0]} size={2 + 14 * flash} intensity={0.6 + 2 * flash} />}
      </Canvas3D>
      <AbsoluteFill style={{background: '#fffaf0', opacity: merged ? interpolate(t, [mergeAt, mergeAt + 0.08, mergeAt + 0.5], [0, 0.85, 0], cl) : 0}} />
    </AbsoluteFill>
  );
};

/* ---------- orbit around a missing Sun; optional escape ---------- */
const dashedCircle = (r: number, seg = 256) => { const pts: THREE.Vector3[] = []; for (let i = 0; i <= seg; i++) { const a = (i / seg) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)); } return new THREE.BufferGeometry().setFromPoints(pts); };
const DashLine: React.FC<{geo: THREE.BufferGeometry; opacity: number; dash?: number; pos?: THREE.Vector3}> = ({geo, opacity, dash = 0.25, pos}) => {
  const mat = useMemo(() => new THREE.LineDashedMaterial({color: '#EFE9DF', dashSize: dash, gapSize: dash * 0.8, transparent: true}), [dash]);
  const line = useMemo(() => { const l = new THREE.Line(geo, mat); l.computeLineDistances(); return l; }, [geo, mat]);
  mat.opacity = opacity; if (pos) line.position.copy(pos); return <primitive object={line} />;
};
export const ShotOrbit: React.FC<{dur: number; sunOn?: number; leaveAt?: number; ghost?: boolean; camFrom?: number[]; camTo?: number[]}> = ({dur, sunOn = 1, leaveAt, ghost = true, camFrom = [0, 9, 16], camTo = [4, 6, 13]}) => {
  const t = useCurrentFrame() / FPS;
  const R = 6; const w = 0.22;
  const orbit = useMemo(() => dashedCircle(R), []);
  const ghostG = useMemo(() => dashedCircle(1.2, 96), []);
  const ringG = useMemo(() => dashedCircle(1.15, 96), []);
  const a0 = 0.4 + w * (leaveAt ?? t);
  let pos = new THREE.Vector3(Math.cos(0.4 + w * t) * R, 0, Math.sin(0.4 + w * t) * R);
  let escape: THREE.BufferGeometry | null = null;
  if (leaveAt !== undefined && t > leaveAt) {
    const start = new THREE.Vector3(Math.cos(a0) * R, 0, Math.sin(a0) * R);
    const dir = new THREE.Vector3(-Math.sin(a0), 0, Math.cos(a0));
    pos = start.clone().add(dir.multiplyScalar((t - leaveAt) * w * R));
    escape = new THREE.BufferGeometry().setFromPoints([start, pos]);
  }
  const p = interpolate(t, [0, dur], [0, 1], {...cl, easing: io});
  const cam = lerp3(camFrom, camTo, p).add(new THREE.Vector3(pos.x * 0.55, 0, pos.z * 0.55));
  const sunPos = new THREE.Vector3(0, 0, 0);
  return (
    <Canvas3D>
      <Rig pos={cam} look={new THREE.Vector3(pos.x * 0.6, 0, pos.z * 0.6)} fov={40} />
      <Stars n={9000} />
      <DashLine geo={orbit} opacity={0.35} />
      {ghost ? <DashLine geo={ghostG} opacity={0.75} dash={0.12} /> : null}
      {sunOn > 0 ? <Sun pos={[0, 0, 0]} r={1.2} on={sunOn} camPos={cam} /> : null}
      {escape ? <DashLine geo={escape} opacity={0.6} dash={0.18} /> : null}
      <Earth pos={pos.toArray() as [number, number, number]} r={0.75} sunPos={sunPos} sunOn={sunOn > 0 ? 1 : 0} camPos={cam} ambient={sunOn > 0 ? 0.18 : 0.5} spin={t * 0.3} />
      <DashLine geo={ringG} opacity={0.9} dash={0.08} pos={pos} />
    </Canvas3D>
  );
};

/* ---------- Earth's day side switching off ---------- */
export const ShotSwitch: React.FC<{offAt: number; dur: number}> = ({offAt, dur}) => {
  const t = useCurrentFrame() / FPS;
  const p = interpolate(t, [0, dur], [0, 1], {...cl, easing: io});
  const cam = lerp3([-1.6, 0.5, 4.6], [-1.2, 0.35, 4.0], p);
  const on = t < offAt ? 1 : interpolate(t, [offAt, offAt + 0.08], [1, 0], cl);
  return (
    <Canvas3D>
      <Rig pos={cam} look={new THREE.Vector3(0, 0, 0)} fov={34} shift={0.2} />
      <Stars n={9000} />
      <Earth sunPos={new THREE.Vector3(-60, 10, 30)} sunOn={on} camPos={cam} spin={1.4} ambient={0.025} />
    </Canvas3D>
  );
};

/* ---------- Moon close-up that goes dark ---------- */
export const ShotMoon: React.FC<{offAt: number; dur: number}> = ({offAt, dur}) => {
  const t = useCurrentFrame() / FPS;
  const p = interpolate(t, [0, dur], [0, 1], {...cl, easing: io});
  const cam = lerp3([0.7, 0.18, 5.2], [0.3, 0.06, 4.3], p);
  const on = t < offAt ? 1 : interpolate(t, [offAt, offAt + 0.1], [1, 0], cl);
  return (
    <Canvas3D>
      <Rig pos={cam} look={new THREE.Vector3(0, 0, 0)} fov={30} shift={0.2} />
      <Stars n={9000} />
      <Moon pos={[0, 0, 0]} r={0.9} sunPos={new THREE.Vector3(30, 8, 40)} sunOn={on} />
    </Canvas3D>
  );
};

/* ---------- Jupiter, the last lit thing ---------- */
export const ShotJupiter: React.FC<{offAt: number; dur: number}> = ({offAt, dur}) => {
  const t = useCurrentFrame() / FPS;
  const p = interpolate(t, [0, dur], [0, 1], {...cl, easing: io});
  const cam = lerp3([2.2, 0.6, 10], [1.2, 0.3, 6.6], p);
  const on = t < offAt ? 1 : interpolate(t, [offAt, offAt + 0.3], [1, 0], cl);
  return (
    <Canvas3D>
      <Rig pos={cam} look={new THREE.Vector3(0, 0, 0)} fov={32} shift={0.2} />
      <Stars n={9000} />
      <Jupiter pos={[0, 0, 0]} r={1.4} sunPos={new THREE.Vector3(-40, 5, 35)} sunOn={on} />
    </Canvas3D>
  );
};

/* ---------- frozen rogue Earth drifting ---------- */
export const ShotRogue: React.FC<{dur: number; freezeFrom?: number}> = ({dur, freezeFrom = 1}) => {
  const t = useCurrentFrame() / FPS;
  const p = interpolate(t, [0, dur], [0, 1], {...cl, easing: io});
  const cam = lerp3([3.8, 1.2, 7], [1.2, 0.4, 3.6], p);
  return (
    <Canvas3D>
      <Rig pos={cam} look={new THREE.Vector3(0, 0, 0)} fov={34} />
      <Stars n={11000} />
      <Earth sunPos={new THREE.Vector3(-20, 30, 10)} sunOn={0.22} freeze={freezeFrom} camPos={cam} spin={0.6} ambient={0.06} />
    </Canvas3D>
  );
};

/* ---------- pre-event Earth, warm and lit (for the question) ---------- */
export const ShotEarthHome: React.FC<{dur: number}> = ({dur}) => {
  const t = useCurrentFrame() / FPS;
  const p = interpolate(t, [0, dur], [0, 1], {...cl, easing: io});
  const cam = lerp3([0.2, 0.3, 4.6], [-0.5, 0.2, 4.0], p);
  return (
    <Canvas3D>
      <Rig pos={cam} look={new THREE.Vector3(0, 0, 0)} fov={34} shift={0.2} />
      <Stars n={9000} />
      <Earth sunPos={new THREE.Vector3(-40, 8, 60)} sunOn={1} camPos={cam} spin={3.4} />
    </Canvas3D>
  );
};

/* ---------- black hole (full-screen lensing shader) + Milo falling ---------- */
const bhFrag = `uniform float t; uniform vec2 res; varying vec2 vUv;
${NOISE}
float star(vec2 p){ vec2 g=floor(p); vec2 f=fract(p)-.5; float h=fract(sin(dot(g,vec2(12.9898,78.233)))*43758.5453); float d=length(f-vec2(h-.5,fract(h*13.)-.5)*.6); return smoothstep(.06,.0,d)*step(.82,h); }
void main(){
  vec2 uv=(vUv-.5)*vec2(res.x/res.y,1.);
  float r=length(uv); float rs=.13;
  // gravitational lensing of the background
  vec2 bent = uv + normalize(uv)*(rs*rs*1.6)/max(r,.001);
  vec3 col = vec3(star(bent*55.)+star(bent*90.+7.)*.6)*vec3(1.,.97,.93)*.9;
  // accretion disc (tilted ellipse) with swirling noise, Doppler-bright side
  vec2 d=uv; d.y/=.26; float dr=length(d); float ang=atan(d.y,d.x);
  float band=smoothstep(.17,.2,dr)*smoothstep(.62,.28,dr);
  float swirl=fbm(vec3(ang*3.-t*1.4, dr*9., t*.3));
  float dop=.55+.45*cos(ang);
  vec3 disc=vec3(1.,.95,.88)*band*(.4+.9*swirl)*dop*1.4;
  // part of the disc lensed over the top (photon arc)
  vec2 a=uv; a.y=(a.y-.012)/.95; float ar=length(a); float arc=smoothstep(.2,.19,abs(ar-.19))*.0;
  float upper=smoothstep(.02,.0,abs(length(uv*vec2(1.,1.25))-.19))*.9;
  float ring=smoothstep(.012,.0,abs(r-rs*1.25))*1.2;
  vec3 c=col+disc+vec3(1.,.96,.9)*(upper*smoothstep(-.02,.05,uv.y)+ring);
  // event horizon
  c*=smoothstep(rs*.98,rs*1.04,r);
  // front part of the disc passes in front of the horizon
  c+=disc*step(uv.y,0.)*(1.-smoothstep(rs*.98,rs*1.04,r));
  gl_FragColor=vec4(c,1.);
}`;
export const ShotBlackHole: React.FC<{dur: number; miloFrom?: number}> = ({dur, miloFrom = 1.0}) => {
  const t = useCurrentFrame() / FPS;
  const {width, height} = useVideoConfig();
  const mat = useMemo(() => new THREE.ShaderMaterial({uniforms: {t: {value: 0}, res: {value: new THREE.Vector2(16, 9)}}, vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position.xy,0.,1.);}`, fragmentShader: bhFrag, depthWrite: false}), []);
  mat.uniforms.t.value = t;
  const zoom = interpolate(t, [0, dur], [1.0, 1.35], {...cl, easing: io});
  const mp = interpolate(t, [miloFrom, dur - 0.5], [0, 1], {...cl, easing: Easing.in(Easing.cubic)});
  const mx = 0.18 + (0.5 - 0.18) * mp, my = 0.2 + (0.5 - 0.2) * mp; const ms = 1 - 0.95 * mp; const mr = -20 + 400 * mp;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <Canvas3D><mesh material={mat} frustumCulled={false}><planeGeometry args={[2, 2]} /></mesh></Canvas3D>
      </AbsoluteFill>
      {t > miloFrom ? <Img src={staticFile('art/milo_fall_cut.png')} style={{position: 'absolute', width: 520 * ms, left: width * mx - 260 * ms, top: height * my - 260 * ms, transform: `rotate(${mr}deg)`, opacity: interpolate(mp, [0, 0.05, 0.9, 1], [0, 1, 1, 0]), filter: `blur(${mp * 2}px)`}} /> : null}
    </AbsoluteFill>
  );
};
