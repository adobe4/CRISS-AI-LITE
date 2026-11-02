// Video 02 (black hole) 3D + motion-graphics shots. Palette: ink, bone, signal red, sage. No yellow/orange/blue.
import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {AbsoluteFill, Img, interpolate, Easing, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Canvas3D} from './shots2';
import {Stars, NOISE} from './space';

const FPS = 30;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const io = Easing.bezier(0.45, 0, 0.25, 1);
const useT = () => useCurrentFrame() / FPS;
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const BONE = '#EFE9DF', RED = '#FF2E3B', INK = '#0B0A09';

const Rig: React.FC<{pos: THREE.Vector3; look: THREE.Vector3; fov?: number; roll?: number}> = ({pos, look, fov = 35, roll = 0}) => {
  const {camera} = useThree();
  camera.position.copy(pos); camera.up.set(Math.sin(roll), Math.cos(roll), 0); camera.lookAt(look);
  const c = camera as THREE.PerspectiveCamera; c.fov = fov; c.updateProjectionMatrix();
  return null;
};

/* ======================= black hole sky (full-screen lensing shader) ======================= */
const skyFrag = `uniform float t; uniform float rs; uniform vec2 ctr; uniform float aspect; uniform float disc; uniform float ring;
uniform float rot; uniform float bright; uniform float glow; uniform float drift; varying vec2 vUv;
${NOISE}
float star(vec2 p, float th){ vec2 g=floor(p); vec2 f=fract(p)-.5; float h=fract(sin(dot(g,vec2(12.9898,78.233)))*43758.5453);
  vec2 o=vec2(fract(h*7.13),fract(h*3.71))-.5; float d=length(f-o*.7); return smoothstep(.09,.0,d)*step(th,h)*(.5+.5*fract(h*91.7)); }
vec3 sky(vec2 b){
  float c=cos(rot), s=sin(rot); b=mat2(c,-s,s,c)*b + vec2(drift,0.);
  float st=star(b*30.,.70)*1.1+star(b*55.+3.1,.74)*.85+star(b*95.+9.7,.78)*.6+star(b*170.+5.3,.82)*.45;
  float band=exp(-pow((b.y+.25*b.x+.08)*2.2,2.));
  float dust=fbm(vec3(b*2.6,1.7))*band;
  float lanes=smoothstep(.45,.75,fbm(vec3(b*5.,4.2)))*band;
  vec3 col=vec3(1.,.97,.93)*st*(.75+band*.8) + vec3(.62,.58,.52)*dust*.30 - vec3(.08)*lanes*band;
  return max(col,0.);
}
void main(){
  vec2 uv=(vUv-.5)*vec2(aspect,1.)-ctr; float r=length(uv)+1e-5;
  float thE=rs*1.6;
  vec2 beta=uv*(1.-thE*thE/(r*r));                     // thin-lens equation: two images + Einstein ring
  float mu=clamp(1./abs(1.-pow(thE/r,4.)),1.,5.);      // magnification brightens stars near the ring
  vec3 col=sky(beta); float lum=dot(col,vec3(.333)); col*=mix(1.,mu,.65*smoothstep(.12,.45,lum)); // only stars get magnified
  // accretion disc (optional, tilted, Doppler-bright on one side)
  vec3 front=vec3(0.);
  if(disc>0.){ vec2 d=uv/rs; d.y/=.24; float dr=length(d); float an=atan(d.y,d.x);
    float band=smoothstep(1.25,1.45,dr)*smoothstep(4.2,2.,dr);
    float sw=fbm(vec3(an*3.-t*1.2, dr*3., t*.25)); float dop=.55+.45*cos(an);
    vec3 dc=mix(vec3(1.,.95,.9),vec3(1.,.42,.42),smoothstep(1.9,3.6,dr)*.55)*band*(.35+.9*sw)*dop*1.3*disc;
    float lower=step(uv.y,0.); col+=dc*(1.-lower); front=dc*lower;
    float arc=exp(-pow((length(uv*vec2(1.,1.18))-rs*1.32)/(rs*.06),2.))*smoothstep(-rs*.2,rs*.3,uv.y)*disc*.9;
    col*=1.-band*.0;
    col+=vec3(1.,.96,.9)*arc;
  }
  col+=vec3(1.,.97,.92)*ring*exp(-pow((r-rs*1.035)/(rs*.018),2.));   // photon ring
  col+=vec3(.95,.9,.84)*ring*.25*exp(-pow((r-rs*1.06)/(rs*.08),2.));
  float hole=smoothstep(rs*.995,rs*1.012,r);
  col*=hole; col+=front;
  col+=vec3(.98,.95,.9)*glow*exp(-pow((r-rs*1.02)/(rs*.22),2.))*(.75+.25*fbm(vec3(uv*14.,t*.5)));  // Hawking glow: a soft warm rim
  col+=vec3(.98,.95,.9)*glow*.18*exp(-pow((r-rs)/(rs*1.2),2.));
  gl_FragColor=vec4(col*bright,1.);
}`;
export const BHSkyMesh: React.FC<{rs: number; ctr?: [number, number]; disc?: number; ring?: number; rot?: number; bright?: number; glow?: number; drift?: number}> = ({rs, ctr = [0, 0], disc = 0, ring = 0.9, rot = 0, bright = 1, glow = 0, drift = 0}) => {
  const t = useT(); const {width, height} = useVideoConfig();
  const mat = useMemo(() => new THREE.ShaderMaterial({uniforms: {t: {value: 0}, rs: {value: 0.1}, ctr: {value: new THREE.Vector2()}, aspect: {value: 16 / 9}, disc: {value: 0}, ring: {value: 1}, rot: {value: 0}, bright: {value: 1}, glow: {value: 0}, drift: {value: 0}},
    vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position.xy,0.9999,1.);}`, fragmentShader: skyFrag, depthWrite: false, depthTest: false}), []);
  const u = mat.uniforms; u.t.value = t; u.rs.value = rs; u.ctr.value.set(ctr[0], ctr[1]); u.aspect.value = width / height; u.disc.value = disc; u.ring.value = ring; u.rot.value = rot; u.bright.value = bright; u.glow.value = glow; u.drift.value = drift;
  return <mesh material={mat} frustumCulled={false} renderOrder={-10}><planeGeometry args={[2, 2]} /></mesh>;
};

/* ======================= ship, drone, station ======================= */
const Glow: React.FC<{pos: [number, number, number]; size: number; color?: string; k?: number}> = ({pos, size, color = RED, k = 1}) => {
  const {camera} = useThree();
  const mat = useMemo(() => new THREE.ShaderMaterial({uniforms: {k: {value: 1}, c: {value: new THREE.Color(color)}}, vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform float k; uniform vec3 c; varying vec2 vUv; void main(){ float r=length(vUv*2.-1.); float g=(exp(-r*r*14.)*1.3+exp(-r*4.5)*.35)*smoothstep(1.,.75,r)*k; gl_FragColor=vec4(c*g,1.); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending}), [color]);
  mat.uniforms.k.value = k;
  return <mesh position={pos} material={mat} quaternion={camera.quaternion}><planeGeometry args={[size, size]} /></mesh>;
};

/** Small research ship pointing along +x. beacon: 0..1 brightness; flame: 0..1 engine burn. */
export const Ship: React.FC<{pos?: [number, number, number]; rot?: [number, number, number]; scale?: number; beacon?: number; flame?: number}> = ({pos = [0, 0, 0], rot = [0, 0, 0], scale = 1, beacon = 1, flame = 0}) => {
  const t = useT();
  return (
    <group position={pos} rotation={rot} scale={scale}>
      <mesh rotation={[0, 0, -Math.PI / 2]}><capsuleGeometry args={[0.32, 1.3, 12, 32]} /><meshStandardMaterial color="#d6cfc3" roughness={0.55} metalness={0.25} /></mesh>
      {[-0.45, -0.1, 0.25].map((x) => <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, -Math.PI / 2]}><cylinderGeometry args={[0.328, 0.328, 0.05, 32]} /><meshStandardMaterial color="#3a3633" roughness={0.5} metalness={0.5} /></mesh>)}
      <mesh position={[0.75, 0, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.3, 0.42, 32]} /><meshStandardMaterial color="#d9d2c6" roughness={0.5} metalness={0.2} /></mesh>
      <mesh position={[-0.2, 0.52, 0]}><cylinderGeometry args={[0.012, 0.012, 0.42, 8]} /><meshStandardMaterial color="#8a847c" /></mesh>
      <mesh position={[-0.2, 0.74, 0]} rotation={[0.4, 0, 0]}><sphereGeometry args={[0.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2.6]} /><meshStandardMaterial color="#d9d2c6" side={THREE.DoubleSide} roughness={0.5} /></mesh>
      {[-1, 1].map((s) => <group key={'w' + s} position={[-0.35, 0, s * 0.95]}>
        <mesh><boxGeometry args={[0.7, 0.02, 1.0]} /><meshStandardMaterial color="#1c1b1a" roughness={0.3} metalness={0.7} /></mesh>
        {[-0.25, 0, 0.25].map((x) => <mesh key={x} position={[x, 0.012, 0]}><boxGeometry args={[0.012, 0.005, 0.98]} /><meshStandardMaterial color="#7D8F6E" /></mesh>)}
        <mesh position={[0, 0, -s * 0.55]}><boxGeometry args={[0.06, 0.06, 0.2]} /><meshStandardMaterial color="#8a847c" /></mesh>
      </group>)}
      <mesh position={[0.62, 0.12, 0]} rotation={[0, 0, -Math.PI / 2]}><sphereGeometry args={[0.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#141312" roughness={0.15} metalness={0.6} /></mesh>
      <mesh position={[-0.1, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.335, 0.035, 12, 48]} /><meshStandardMaterial color="#7D8F6E" roughness={0.6} /></mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[-0.55, 0, s * 0.42]} rotation={[0, 0, 0]}><boxGeometry args={[0.55, 0.05, 0.32]} /><meshStandardMaterial color="#2a2826" roughness={0.7} /></mesh>)}
      <mesh position={[-1.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.16, 0.26, 0.3, 24, 1, true]} /><meshStandardMaterial color="#3a3734" roughness={0.5} metalness={0.5} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0.05, 0.34, 0]}><sphereGeometry args={[0.055, 16, 12]} /><meshBasicMaterial color={new THREE.Color(RED).multiplyScalar(0.35 + 0.65 * beacon)} /></mesh>
      {beacon > 0.02 ? <Glow pos={[0.05, 0.36, 0]} size={1.4} k={beacon} /> : null}
      {flame > 0.01 ? <>
        <mesh position={[-1.45 - 0.5 * flame, 0, 0]} rotation={[0, 0, Math.PI / 2]}><coneGeometry args={[0.2, 0.9 + 1.2 * flame, 24, 1, true]} /><meshBasicMaterial color="#f4ece0" transparent opacity={0.55 * flame * (0.85 + 0.15 * Math.sin(t * 60))} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        <Glow pos={[-1.35, 0, 0]} size={2.4 * flame} color="#f4ece0" k={flame} />
      </> : null}
    </group>
  );
};
export const Drone: React.FC<{pos?: [number, number, number]; rot?: [number, number, number]; scale?: number; flame?: number}> = ({pos = [0, 0, 0], rot = [0, 0, 0], scale = 1, flame = 0}) => {
  const t = useT();
  return (
    <group position={pos} rotation={rot} scale={scale}>
      <mesh rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.22, 0.7, 6]} /><meshStandardMaterial color="#d9d2c6" roughness={0.5} metalness={0.3} /></mesh>
      <mesh position={[-0.4, 0, 0]}><boxGeometry args={[0.3, 0.28, 0.28]} /><meshStandardMaterial color="#2a2826" roughness={0.6} /></mesh>
      <mesh position={[-0.2, 0, 0]}><boxGeometry args={[0.08, 0.06, 0.95]} /><meshStandardMaterial color="#7D8F6E" roughness={0.6} /></mesh>
      <Glow pos={[0.36, 0, 0]} size={0.5} k={0.6 + 0.4 * Math.sin(t * 8)} />
      {flame > 0.01 ? <>
        <mesh position={[-0.75 - 0.4 * flame, 0, 0]} rotation={[0, 0, Math.PI / 2]}><coneGeometry args={[0.13, 0.6 + 1.1 * flame, 18, 1, true]} /><meshBasicMaterial color="#f4ece0" transparent opacity={0.6 * flame} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        <Glow pos={[-0.7, 0, 0]} size={1.8 * flame} color="#f4ece0" k={flame} />
      </> : null}
    </group>
  );
};
export const Station: React.FC<{pos?: [number, number, number]; rot?: [number, number, number]; scale?: number}> = ({pos = [0, 0, 0], rot = [0, 0, 0], scale = 1}) => {
  const t = useT();
  return (
    <group position={pos} rotation={rot} scale={scale}>
      <group rotation={[0, 0, t * 0.08]}>
        <mesh><torusGeometry args={[2.2, 0.3, 24, 96]} /><meshStandardMaterial color="#d9d2c6" roughness={0.6} metalness={0.25} /></mesh>
        {Array.from({length: 24}).map((_, i) => { const a = (i / 24) * Math.PI * 2; return <mesh key={'seg' + i} position={[Math.cos(a) * 2.2, Math.sin(a) * 2.2, 0]} rotation={[0, 0, a]}><boxGeometry args={[0.16, 0.5, 0.66]} /><meshStandardMaterial color={i % 2 ? '#bdb6ab' : '#9a948b'} roughness={0.6} metalness={0.3} /></mesh>; })}
        {Array.from({length: 36}).map((_, i) => { const a = (i / 36) * Math.PI * 2 + 0.05; return <mesh key={'win' + i} position={[Math.cos(a) * 2.2, Math.sin(a) * 2.2, 0.34]}><boxGeometry args={[0.1, 0.06, 0.02]} /><meshBasicMaterial color="#9fb08f" /></mesh>; })}
        {Array.from({length: 4}).map((_, i) => <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]} position={[0, 0, 0]}><boxGeometry args={[4.2, 0.16, 0.16]} /><meshStandardMaterial color="#8a847c" metalness={0.4} roughness={0.5} /></mesh>)}
        {Array.from({length: 12}).map((_, i) => { const a = (i / 12) * Math.PI * 2; return <Glow key={i} pos={[Math.cos(a) * 2.2, Math.sin(a) * 2.2, 0.3]} size={0.35} k={0.5 + 0.5 * (Math.floor(t * 1.2 + i) % 2)} />; })}
      </group>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.5, 0.5, 1.4, 32]} /><meshStandardMaterial color="#bfb8ad" roughness={0.6} metalness={0.3} /></mesh>
      <mesh position={[0, 0, 1.0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.03, 0.03, 0.9, 8]} /><meshStandardMaterial color="#8a847c" /></mesh>
      <Glow pos={[0, 0, 1.45]} size={0.4} k={0.5 + 0.5 * Math.sin(t * 3)} />
    </group>
  );
};
const Lights: React.FC<{dir?: [number, number, number]; k?: number}> = ({dir = [-3, 2, 4], k = 1}) => (<>
  <ambientLight intensity={0.18 * k} color="#d9d2c6" />
  <directionalLight position={dir} intensity={1.6 * k} color="#f2ebe0" />
  <directionalLight position={[3, -1, -3]} intensity={0.35 * k} color="#d9d2c6" />
</>);

/* ======================= shots ======================= */
/** Black hole sky with ship(s) in front. All values can animate via the a/b props over `dur`. */
export const ShotBH: React.FC<{dur: number; rs: [number, number]; ctr?: [[number, number], [number, number]]; disc?: number; rot?: [number, number]; ship?: {from: [number, number, number]; to: [number, number, number]; scale?: number; spin?: number; flame?: [number, number]}; drone?: {from: [number, number, number]; to: [number, number, number]; flame?: number; rotY?: [number, number]}; beaconHz?: number; beaconSlow?: boolean; bright?: [number, number]; glow?: [number, number]; ring?: number}> =
({dur, rs, ctr = [[0, 0], [0, 0]], disc = 0.55, rot = [0, 0.05], ship, drone, beaconHz = 1, bright = [1, 1], glow = [0, 0], ring = 0.9}) => {
  const t = useT(); const p = interpolate(t, [0, dur], [0, 1], {...cl, easing: io}); const pl = interpolate(t, [0, dur], [0, 1], cl);
  const beacon = Math.max(0, 1 - ((t * beaconHz) % 1) / 0.18);
  const sp = ship ? [lerp(ship.from[0], ship.to[0], pl), lerp(ship.from[1], ship.to[1], pl), lerp(ship.from[2], ship.to[2], pl)] as [number, number, number] : null;
  const dp = drone ? [lerp(drone.from[0], drone.to[0], pl), lerp(drone.from[1], drone.to[1], pl), lerp(drone.from[2], drone.to[2], pl)] as [number, number, number] : null;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Canvas3D>
        <Rig pos={new THREE.Vector3(0, 0, 10)} look={new THREE.Vector3(0, 0, 0)} fov={35} />
        <BHSkyMesh rs={lerp(rs[0], rs[1], p)} ctr={[lerp(ctr[0][0], ctr[1][0], p), lerp(ctr[0][1], ctr[1][1], p)]} disc={disc} rot={lerp(rot[0], rot[1], pl)} bright={lerp(bright[0], bright[1], pl)} glow={lerp(glow[0], glow[1], pl)} ring={ring} />
        <Lights />
        {sp && ship ? <Ship pos={sp} scale={ship.scale ?? 1} rot={[0.25 + t * (ship.spin ?? 0.05), -0.5 + t * (ship.spin ?? 0.05) * 0.6, 0.12]} beacon={beacon} flame={ship.flame ? lerp(ship.flame[0], ship.flame[1], pl) : 0} /> : null}
        {dp && drone ? <Drone pos={dp} rot={[0, drone.rotY ? lerp(drone.rotY[0], drone.rotY[1], p) : 0.4, 0.1]} scale={0.8} flame={drone.flame ?? 0} /> : null}
      </Canvas3D>
    </AbsoluteFill>
  );
};

/** Engines jam: close side view of the ship burning against its orbit, then sputtering out. */
export const ShotBurn: React.FC<{dur: number; dieAt: number}> = ({dur, dieAt}) => {
  const t = useT(); const p = interpolate(t, [0, dur], [0, 1], {...cl, easing: io});
  const sput = t > dieAt - 1.2 && t < dieAt ? (Math.sin(t * 37) > 0.2 ? 1 : 0.25) : 1;
  const flame = t < dieAt ? interpolate(t, [0, 0.4], [0.3, 1], cl) * sput : 0;
  const beacon = Math.max(0, 1 - (t % 1) / 0.18);
  const cam = new THREE.Vector3(lerp(-1.5, 1.2, p), lerp(0.7, 0.4, p), lerp(5.2, 4.4, p));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Canvas3D>
        <Rig pos={cam} look={new THREE.Vector3(-0.4, 0, 0)} fov={38} />
        <BHSkyMesh rs={0.16} ctr={[0.55, 0.12]} rot={t * 0.004} bright={0.9} />
        <Lights />
        <Ship pos={[0, 0, 0]} rot={[0.1, 0.35, 0.05]} beacon={t > dieAt ? beacon : 0.3} flame={flame} />
      </Canvas3D>
    </AbsoluteFill>
  );
};

/** Orbit diagram: circular orbit, burn kills the sideways speed, path bends into a straight drop. */
export const ShotOrbitDrop: React.FC<{dur: number; burnAt: number; burnLen: number}> = ({dur, burnAt, burnLen}) => {
  const t = useT();
  // integrate a 2D orbit (GM=1, r0=4) once; tangential speed is bled off during the burn
  const path = useMemo(() => {
    const pts: [number, number][] = []; let x = 4, y = 0, vx = 0, vy = 0.5; const dt = 1 / FPS; const om = 0.5 / 4;
    for (let f = 0; f < dur * FPS; f++) {
      const tt = f / FPS; const tSim = tt;
      if (tSim < burnAt) { const a = om * tSim; x = 4 * Math.cos(a); y = 4 * Math.sin(a); vx = -0.5 * Math.sin(a); vy = 0.5 * Math.cos(a); }
      else {
        const r = Math.hypot(x, y); const g = 1 / (r * r) * 0.95; let ax = -g * x / r, ay = -g * y / r;
        if (tSim < burnAt + burnLen) { const tx = -y / r, ty = x / r; const vt = vx * tx + vy * ty; ax -= tx * vt * 1.9; ay -= ty * vt * 1.9; }
        vx += ax * dt; vy += ay * dt; x += vx * dt; y += vy * dt;
        if (Math.hypot(x, y) < 0.55) { x = x * 0.55 / Math.hypot(x, y); y = y * 0.55 / Math.hypot(x, y); }
      }
      pts.push([x, y]);
    }
    return pts;
  }, [dur, burnAt, burnLen]);
  const f = Math.min(path.length - 1, Math.floor(t * FPS)); const [x, y] = path[f]; const [px, py] = path[Math.max(0, f - 1)];
  const orbit = useMemo(() => { const g = new THREE.BufferGeometry().setFromPoints(Array.from({length: 257}).map((_, i) => { const a = (i / 256) * Math.PI * 2; return new THREE.Vector3(4 * Math.cos(a), 0, 4 * Math.sin(a)); })); return g; }, []);
  const omat = useMemo(() => new THREE.LineDashedMaterial({color: BONE, dashSize: 0.18, gapSize: 0.14, transparent: true, opacity: 0.4}), []);
  const oline = useMemo(() => { const l = new THREE.Line(orbit, omat); l.computeLineDistances(); return l; }, [orbit, omat]);
  const vx = (x - px) * FPS, vy = (y - py) * FPS; const r = Math.hypot(x, y); const tx = -y / r, ty = x / r; const vt = Math.max(0, vx * tx + vy * ty);
  const burning = t > burnAt && t < burnAt + burnLen;
  const p = interpolate(t, [0, dur], [0, 1], {...cl, easing: io});
  const cam = new THREE.Vector3(lerp(1.4, 0.6, p), lerp(6.4, 5.0, p), lerp(5.6, 4.2, p));
  const head = Math.atan2(vy, vx);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Canvas3D>
        <Rig pos={cam} look={new THREE.Vector3(0.9, 0, 0.9)} fov={46} />
        <Stars n={7000} />
        <Lights dir={[2, 6, 3]} />
        <mesh><sphereGeometry args={[0.5, 48, 32]} /><meshBasicMaterial color="#000" /></mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.53, 0.012, 8, 96]} /><meshBasicMaterial color={BONE} transparent opacity={0.85} /></mesh>
        <Glow pos={[0, 0, 0]} size={2.2} color="#e9e2d6" k={0.35} />
        <primitive object={oline} />
        {f > 3 ? <mesh><tubeGeometry args={[new THREE.CatmullRomCurve3(path.slice(Math.max(0, f - 260), f + 1).filter((_, i, a) => i % 3 === 0 || i === a.length - 1).map(([a, b]) => new THREE.Vector3(a, 0, b))), 200, 0.035, 6, false]} /><meshBasicMaterial color={RED} /></mesh> : null}
        <group position={[x, 0, y]} rotation={[0, -head, 0]}>
          <Ship scale={0.32} beacon={Math.max(0, 1 - (t % 1) / 0.18)} flame={burning ? 1 : 0} rot={[0, Math.PI, 0]} />
        </group>
        {vt > 0.02 ? <arrowHelper args={[new THREE.Vector3(tx, 0, ty), new THREE.Vector3(x, 0.05, y), vt * 2.2, 0xefe9df, 0.18, 0.12]} /> : null}
      </Canvas3D>
    </AbsoluteFill>
  );
};

/** Ship coasting at speed: stars streak past (speed grows); optional drone far behind. */
export const ShotSpeed: React.FC<{dur: number; speed: [number, number]; drone?: boolean}> = ({dur, speed, drone}) => {
  const t = useT(); const fr = useCurrentFrame();
  const N = 1400;
  const base = useMemo(() => Array.from({length: N}).map((_, i) => [random('sx' + i) * 60 - 30, random('sy' + i) * 34 - 17, random('sz' + i) * 120]), []);
  const sp = lerp(speed[0], speed[1], interpolate(t, [0, dur], [0, 1], cl));
  const dist = useMemo(() => { let d = 0; const arr: number[] = []; for (let f = 0; f <= dur * FPS + 2; f++) { arr.push(d); d += lerp(speed[0], speed[1], f / (dur * FPS)) / FPS; } return arr; }, [dur, speed]);
  const travelled = dist[Math.min(dist.length - 1, fr)];
  const geo = new THREE.BufferGeometry(); const pos = new Float32Array(N * 6);
  base.forEach(([x, y, z], i) => { if (Math.hypot(x, y) < 2.5) { y += 5; } const zz = ((z + travelled) % 120) - 110; const L = Math.min(9, sp * 0.06); pos.set([x, y, zz, x, y, zz - L], i * 6); });
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const beacon = Math.max(0, 1 - (t % 1) / 0.18);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Canvas3D>
        <Rig pos={new THREE.Vector3(2.6 + Math.sin(t * 0.3) * 0.2, 1.1, 5.2)} look={new THREE.Vector3(-0.3, 0, -1)} fov={45} roll={0.05} />
        <lineSegments geometry={geo}><lineBasicMaterial color={BONE} transparent opacity={0.75} /></lineSegments>
        <Lights />
        <Ship pos={[0, 0, 0]} rot={[0.05, Math.PI / 2, 0.04 + Math.sin(t * 0.7) * 0.03]} beacon={beacon} />
        {drone ? <Drone pos={[-0.8, 0.6, 14 - t * 0.35]} rot={[0, Math.PI / 2, 0]} scale={0.7} flame={1} /> : null}
      </Canvas3D>
    </AbsoluteFill>
  );
};

/** Station with the drone launching (or the drone braking and turning away). */
export const ShotDrone: React.FC<{dur: number; mode: 'launch' | 'recall'}> = ({dur, mode}) => {
  const t = useT(); const p = interpolate(t, [0, dur], [0, 1], {...cl, easing: io});
  if (mode === 'launch') {
    const go = interpolate(t, [0.8, dur], [0, 1], {...cl, easing: Easing.in(Easing.cubic)});
    const cam = new THREE.Vector3(lerp(-3, -1.2, p), lerp(1.8, 1.2, p), lerp(11, 8.5, p));
    return (
      <AbsoluteFill style={{background: '#000'}}>
        <Canvas3D>
          <Rig pos={cam} look={new THREE.Vector3(1, 0, 0)} fov={40} />
          <BHSkyMesh rs={0.07} ctr={[0.55, 0.1]} rot={t * 0.003} bright={0.85} />
          <Lights />
          <Station pos={[-1.2, 0, -1]} rot={[0.5, 0.6, 0]} />
          <Drone pos={[0.6 + go * 16, 0.2 + go * 1.6, -0.6 - go * 4]} rot={[0, 0.25, 0.1]} flame={interpolate(t, [0.5, 0.9], [0, 1], cl)} />
        </Canvas3D>
      </AbsoluteFill>
    );
  }
  // recall: drone fires retro-thrust, turns around; Milo's beacon keeps falling toward the hole
  const turn = interpolate(t, [0.6, 2.4], [0, Math.PI], {...cl, easing: io});
  const back = interpolate(t, [2.2, dur], [0, 1], {...cl, easing: Easing.in(Easing.quad)});
  const shipFall = interpolate(t, [0, dur], [0, 1], cl);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Canvas3D>
        <Rig pos={new THREE.Vector3(-2.5, 1.2, 7.5)} look={new THREE.Vector3(1.2, 0, -2)} fov={40} />
        <BHSkyMesh rs={0.13} ctr={[0.42, 0.06]} rot={t * 0.003} bright={0.9} />
        <Lights />
        <Drone pos={[-0.5 - back * 5, 0, 0 + back * 4]} rot={[0, 0.3 + turn, 0.1]} flame={t > 0.3 ? 1 : 0} />
        <Ship pos={[3 + shipFall * 2.2, 0.4 - shipFall * 0.4, -6 - shipFall * 7]} scale={0.45} rot={[0.2, -0.8, 0.1]} beacon={Math.max(0, 1 - (t % 1) / 0.18)} />
      </Canvas3D>
    </AbsoluteFill>
  );
};

/* ======================= 2D motion graphics over the BH sky ======================= */
const toPx = (x: number, y: number, W: number, H: number) => [W / 2 + x * H, H / 2 - y * H]; // shader units (height=1) -> px

/** Light can orbit: a pulse of light goes around the photon sphere; the ship streaks past. */
export const ShotPhotonSphere: React.FC<{dur: number}> = ({dur}) => {
  const t = useT(); const {width: W, height: H} = useVideoConfig();
  const rs = 0.2; const R = rs * 1.5 * H; const [cx, cy] = toPx(0, 0, W, H);
  const a = t * 1.9; const tail = 2.4;
  const arcs = Array.from({length: 26}).map((_, i) => { const aa = a - (i / 26) * tail; return [cx + R * Math.cos(aa), cy + R * Math.sin(aa) * 0.35, 1 - i / 26] as const; });
  return (
    <AbsoluteFill>
      <ShotBH dur={dur} rs={[rs, rs * 1.05]} rot={[0, 0.03]} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <ellipse cx={cx} cy={cy} rx={R} ry={R * 0.35} fill="none" stroke={BONE} strokeOpacity={0.22} strokeWidth={2} strokeDasharray="6 10" />
        {arcs.map(([x, y, k], i) => <circle key={i} cx={x} cy={y} r={7 * k + 1} fill={BONE} opacity={0.9 * k} />)}
        <circle cx={arcs[0][0]} cy={arcs[0][1]} r={18} fill={BONE} opacity={0.35} style={{filter: 'blur(6px)'}} />
      </svg>
    </AbsoluteFill>
  );
};

/** Old light: pulses leave the ship near the horizon; each gap is longer and redder than the last. */
export const ShotOldLight: React.FC<{dur: number}> = ({dur}) => {
  const t = useT(); const {width: W, height: H} = useVideoConfig();
  const rs = 0.3; const [sx, sy] = toPx(-0.05, rs * 1.08, W, H);
  // emission times stretch out exponentially as seen from outside
  const emits = [0, 1, 2.1, 3.4, 5.0, 7.1, 9.9, 13.6].filter((e) => e < t);
  return (
    <AbsoluteFill>
      <ShotBH dur={dur} rs={[rs, rs]} ctr={[[0, -0.05], [0, -0.05]]} rot={[0, 0.01]} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {emits.map((e, i) => { const age = t - e; const rr = age * 260; const k = i / 7; const col = `rgb(${239},${Math.round(233 - 190 * k)},${Math.round(223 - 180 * k)})`; return <circle key={i} cx={sx} cy={sy} r={rr} fill="none" stroke={col} strokeWidth={6 - 4 * k} opacity={Math.max(0, 0.9 - age * 0.12) * (1 - 0.6 * k)} />; })}
        <circle cx={sx} cy={sy} r={9} fill={RED} opacity={Math.max(0.15, 1 - (t % 1.6) / 0.4) * interpolate(t, [0, dur], [1, 0.35], cl)} />
        <circle cx={sx} cy={sy} r={24} fill={RED} opacity={0.25 * interpolate(t, [0, dur], [1, 0.2], cl)} style={{filter: 'blur(8px)'}} />
      </svg>
    </AbsoluteFill>
  );
};

/** Inside the horizon: every path, every direction, curves into one point: the future. */
export const ShotFuture: React.FC<{dur: number}> = ({dur}) => {
  const t = useT(); const {width: W, height: H} = useVideoConfig();
  const cx = W / 2, cy = H * 0.5; const grow = interpolate(t, [0, dur], [0, 1], cl);
  const paths = Array.from({length: 40}).map((_, i) => {
    const a = (i / 40) * Math.PI * 2 + 0.07 * Math.sin(i * 3.1); const R = 1200;
    const x0 = cx + Math.cos(a) * R, y0 = cy + Math.sin(a) * R * 0.65; const bend = (random('b' + i) - 0.5) * 900;
    const mx = (x0 + cx) / 2 - Math.sin(a) * bend * 0.4, my = (y0 + cy) / 2 + Math.cos(a) * bend * 0.4;
    return `M ${x0} ${y0} Q ${mx} ${my} ${cx} ${cy}`;
  });
  return (
    <AbsoluteFill style={{background: '#050404'}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        {paths.map((d, i) => <path key={i} d={d} fill="none" stroke={BONE} strokeOpacity={0.16 + 0.22 * grow} strokeWidth={2} strokeDasharray="14 18" strokeDashoffset={-t * 90 - i * 7} />)}
        <circle cx={cx} cy={cy} r={6 + 10 * grow} fill={BONE} />
        <circle cx={cx} cy={cy} r={40 + 60 * grow} fill={BONE} opacity={0.12 + 0.12 * grow} style={{filter: 'blur(18px)'}} />
      </svg>
    </AbsoluteFill>
  );
};

/** Small, fierce black hole tearing a stylized falling figure into a thin strand (no gore). */
export const ShotSpaghetti: React.FC<{dur: number; stretchFrom: number}> = ({dur, stretchFrom}) => {
  const t = useT(); const {width: W, height: H} = useVideoConfig();
  const s = interpolate(t, [stretchFrom, dur], [0, 1], {...cl, easing: Easing.in(Easing.quad)});
  const x = lerp(W * 0.3, W * 0.47, s), y = lerp(H * 0.28, H * 0.43, s);
  return (
    <AbsoluteFill>
      <ShotBH dur={dur} rs={[0.07, 0.075]} ctr={[[0.12, -0.04], [0.12, -0.04]]} disc={1} ring={1.2} rot={[0, 0.02]} />
      <Img src={staticFile('art/milo_fall_cut.png')} style={{position: 'absolute', width: 300, left: x - 150, top: y - 130, transformOrigin: '60% 90%',
        transform: `rotate(${-35 + 10 * s}deg) scale(${1 - 0.75 * s}, ${1 + 3.2 * s})`, filter: `blur(${s * 3}px) grayscale(${0.4 * s})`, opacity: interpolate(s, [0, 0.85, 1], [1, 0.75, 0])}} />
    </AbsoluteFill>
  );
};
