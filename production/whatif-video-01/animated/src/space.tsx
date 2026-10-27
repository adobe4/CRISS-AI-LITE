import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useCurrentFrame, staticFile, continueRender, delayRender} from 'remotion';

export const PAL = {ink: '#0B0A09', bone: '#EFE9DF', red: '#FF2E3B', sage: '#7D8F6E', slate: '#2E3438'};

// ---------- texture loading that blocks the render until ready ----------
const cache = new Map<string, THREE.Texture>();
export const useTex = (path: string) => {
  return useMemo(() => {
    if (cache.has(path)) return cache.get(path)!;
    const h = delayRender('tex ' + path, {timeoutInMilliseconds: 120000});
    const t = new THREE.TextureLoader().load(staticFile(path), () => continueRender(h), undefined, () => continueRender(h));
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    cache.set(path, t);
    return t;
  }, [path]);
};

// ---------- noise GLSL ----------
export const NOISE = `
float h3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int k=0;k<4;k++){s+=a*n3(p);p*=2.03;a*=.5;}return s;}
`;

// ---------- EARTH ----------
const earthVert = `varying vec2 vUv; varying vec3 vN; varying vec3 vW; void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal); vec4 w=modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`;
const earthFrag = `uniform sampler2D day; uniform sampler2D frozen; uniform sampler2D clouds; uniform sampler2D oceanM;
uniform vec3 sunDir; uniform float sunOn; uniform float freeze; uniform float cloudShift; uniform vec3 camPos; uniform float ambient;
varying vec2 vUv; varying vec3 vN; varying vec3 vW;
void main(){
  vec3 N=normalize(vN); vec3 L=normalize(sunDir); vec3 V=normalize(camPos-vW);
  vec3 base=mix(texture2D(day,vUv).rgb, texture2D(frozen,vUv).rgb, freeze);
  float cl=texture2D(clouds,vUv+vec2(cloudShift,0.)).r; cl=cl*(1.-freeze*.6);
  base=mix(base, vec3(.95,.93,.9), cl*.82);
  float d=dot(N,L); float lit=smoothstep(-.08,.25,d)*sunOn;
  float oc=texture2D(oceanM,vUv).r*(1.-freeze)*(1.-cl);
  vec3 H=normalize(L+V); float spec=pow(max(dot(N,H),0.),60.)*oc*.6*sunOn;
  vec3 col=base*(ambient+lit*1.05)+spec*vec3(1.,.96,.9);
  float rim=pow(1.-max(dot(N,V),0.),3.);
  col+=vec3(.95,.88,.78)*rim*(.12+.55*smoothstep(-.2,.4,d)*sunOn);
  gl_FragColor=vec4(col,1.);
}`;
const atmoFrag = `uniform vec3 sunDir; uniform float sunOn; uniform vec3 camPos; varying vec3 vN; varying vec3 vW;
void main(){ vec3 N=normalize(vN); vec3 V=normalize(camPos-vW); float mu=dot(N,V);
 float edge=smoothstep(0.,.35,mu)*pow(1.-mu,3.);
 float d=dot(N,normalize(sunDir)); float a=edge*(.05+1.4*smoothstep(-.25,.45,d)*sunOn);
 gl_FragColor=vec4(vec3(.99,.93,.85)*a,a); }`;

export const Earth: React.FC<{pos?: [number, number, number]; r?: number; spin?: number; sunPos: THREE.Vector3; sunOn: number; freeze?: number; camPos: THREE.Vector3; tilt?: number; ambient?: number}> = ({pos = [0, 0, 0], r = 1, spin = 0, sunPos, sunOn, freeze = 0, camPos, tilt = 0.41, ambient = 0.035}) => {
  const fr = useCurrentFrame();
  const day = useTex('tex/earth_day.jpg'), frozen = useTex('tex/earth_frozen.jpg'), clouds = useTex('tex/earth_clouds.png'), oceanM = useTex('tex/earth_ocean_mask.png');
  const mat = useMemo(() => new THREE.ShaderMaterial({uniforms: {day: {value: day}, frozen: {value: frozen}, clouds: {value: clouds}, oceanM: {value: oceanM}, sunDir: {value: new THREE.Vector3()}, sunOn: {value: 1}, freeze: {value: 0}, cloudShift: {value: 0}, camPos: {value: new THREE.Vector3()}, ambient: {value: 0.03}}, vertexShader: earthVert, fragmentShader: earthFrag}), [day, frozen, clouds, oceanM]);
  const atmo = useMemo(() => new THREE.ShaderMaterial({uniforms: {sunDir: {value: new THREE.Vector3()}, sunOn: {value: 1}, camPos: {value: new THREE.Vector3()}}, vertexShader: earthVert, fragmentShader: atmoFrag, transparent: true, side: THREE.FrontSide, depthWrite: false, blending: THREE.AdditiveBlending}), []);
  const p = new THREE.Vector3(...pos);
  const sd = sunPos.clone().sub(p).normalize();
  for (const m of [mat, atmo]) { m.uniforms.sunDir.value.copy(sd); m.uniforms.sunOn.value = sunOn; m.uniforms.camPos.value.copy(camPos); }
  mat.uniforms.freeze.value = freeze; mat.uniforms.cloudShift.value = fr * 0.00012; mat.uniforms.ambient.value = ambient;
  return (
    <group position={pos} rotation={[0, 0, tilt]}>
      <mesh rotation={[0, spin + fr * 0.0012, 0]} material={mat}><sphereGeometry args={[r, 160, 160]} /></mesh>
      <mesh material={atmo} scale={1.025}><sphereGeometry args={[r, 96, 96]} /></mesh>
    </group>
  );
};

// ---------- SUN ----------
const sunFrag = `uniform float t; uniform float on; varying vec2 vUv; varying vec3 vN; varying vec3 vW; uniform vec3 camPos;
${NOISE}
void main(){ vec3 N=normalize(vN); vec3 V=normalize(camPos-vW); float mu=max(dot(N,V),0.);
 vec3 p=N*5.; float g=fbm(p+vec3(t*.04,t*.03,0.)); float gr=fbm(p*14.+vec3(0.,t*.25,t*.12));
 float limb=.55+.45*pow(mu,.6);
 vec3 hot=vec3(1.,.995,.98), warm=vec3(1.,.93,.82);
 vec3 c=mix(warm,hot,smoothstep(.2,1.,mu))*(.93+.07*g)*(.95+.08*gr)*limb;
 gl_FragColor=vec4(c*on*1.25,1.); }`;
const coronaFrag = `uniform float t; uniform float on; varying vec2 vUv;
${NOISE}
void main(){ vec2 q=vUv*2.-1.; float r=length(q); float a=atan(q.y,q.x);
 float rays=fbm(vec3(a*3.,r*2.-t*.15,t*.05))*.6+.4;
 float e=max(r-.22,0.); float glow=exp(-e*14.)*1.0 + exp(-e*4.5)*.42*rays + exp(-e*1.8)*.10; glow*=smoothstep(1.,.75,r);
 glow*=smoothstep(.215,.225,r*1.0);
 gl_FragColor=vec4(vec3(1.,.93,.82)*glow*on, glow*on); }`;
export const Sun: React.FC<{pos: [number, number, number]; r?: number; on: number; camPos: THREE.Vector3}> = ({pos, r = 3, on, camPos}) => {
  const fr = useCurrentFrame();
  const mat = useMemo(() => new THREE.ShaderMaterial({uniforms: {t: {value: 0}, on: {value: 1}, camPos: {value: new THREE.Vector3()}}, vertexShader: earthVert, fragmentShader: sunFrag}), []);
  const cor = useMemo(() => new THREE.ShaderMaterial({uniforms: {t: {value: 0}, on: {value: 1}}, vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`, fragmentShader: coronaFrag, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending}), []);
  mat.uniforms.t.value = fr / 30; mat.uniforms.on.value = on; mat.uniforms.camPos.value.copy(camPos);
  cor.uniforms.t.value = fr / 30; cor.uniforms.on.value = on;
  // corona billboard faces camera
  const dir = camPos.clone().sub(new THREE.Vector3(...pos)).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
  if (on <= 0.001) return null;
  return (
    <group position={pos}>
      <mesh material={mat}><sphereGeometry args={[r, 128, 128]} /></mesh>
      <mesh material={cor} quaternion={q}><planeGeometry args={[r * 9, r * 9]} /></mesh>
    </group>
  );
};

// ---------- MOON ----------
const moonFrag = `uniform sampler2D map; uniform vec3 sunDir; uniform float sunOn; varying vec2 vUv; varying vec3 vN;
void main(){ vec3 N=normalize(vN); float d=max(dot(N,normalize(sunDir)),0.); vec3 c=texture2D(map,vUv).rgb; gl_FragColor=vec4(c*(.012+1.1*pow(d,.8)*sunOn),1.); }`;
export const Moon: React.FC<{pos: [number, number, number]; r?: number; sunPos: THREE.Vector3; sunOn: number}> = ({pos, r = 0.27, sunPos, sunOn}) => {
  const map = useTex('tex/moon.jpg');
  const mat = useMemo(() => new THREE.ShaderMaterial({uniforms: {map: {value: map}, sunDir: {value: new THREE.Vector3()}, sunOn: {value: 1}}, vertexShader: earthVert, fragmentShader: moonFrag}), [map]);
  mat.uniforms.sunDir.value.copy(sunPos.clone().sub(new THREE.Vector3(...pos)).normalize()); mat.uniforms.sunOn.value = sunOn;
  return <mesh position={pos} material={mat}><sphereGeometry args={[r, 96, 96]} /></mesh>;
};

// ---------- JUPITER (procedural bands) ----------
const jupFrag = `uniform float t; uniform vec3 sunDir; uniform float sunOn; varying vec2 vUv; varying vec3 vN;
${NOISE}
void main(){ vec3 N=normalize(vN); float lat=vUv.y;
 float w=fbm(vec3(vUv.x*8.+t*.02, lat*30., 1.))*.08;
 float b=sin((lat+w)*58.)*.5+.5; float b2=sin((lat+w*1.5)*23.+1.3)*.5+.5;
 vec3 c1=vec3(.86,.80,.70), c2=vec3(.62,.52,.42), c3=vec3(.93,.90,.84);
 vec3 c=mix(mix(c1,c2,b),c3,b2*.5);
 vec2 sp=vec2(.62,.36); float spot=smoothstep(.06,.0,length((vUv-sp)*vec2(1.,2.2)));
 c=mix(c,vec3(.72,.38,.33),spot*.8);
 float d=max(dot(N,normalize(sunDir)),0.);
 gl_FragColor=vec4(c*(.015+1.05*pow(d,.7)*sunOn),1.); }`;
export const Jupiter: React.FC<{pos: [number, number, number]; r?: number; sunPos: THREE.Vector3; sunOn: number}> = ({pos, r = 1, sunPos, sunOn}) => {
  const fr = useCurrentFrame();
  const mat = useMemo(() => new THREE.ShaderMaterial({uniforms: {t: {value: 0}, sunDir: {value: new THREE.Vector3()}, sunOn: {value: 1}}, vertexShader: earthVert, fragmentShader: jupFrag}), []);
  mat.uniforms.t.value = fr / 30; mat.uniforms.sunDir.value.copy(sunPos.clone().sub(new THREE.Vector3(...pos)).normalize()); mat.uniforms.sunOn.value = sunOn;
  return <mesh position={pos} rotation={[0.05, fr * 0.003, 0]} material={mat}><sphereGeometry args={[r, 128, 128]} /></mesh>;
};

// ---------- STARS ----------
export const Stars: React.FC<{n?: number; radius?: number; size?: number; opacity?: number; seed?: number}> = ({n = 6000, radius = 400, size = 1.4, opacity = 1, seed = 1}) => {
  const geo = useMemo(() => {
    let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const g = new THREE.BufferGeometry(); const pos = new Float32Array(n * 3); const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, rr = radius * (0.7 + 0.3 * rnd());
      const sq = Math.sqrt(1 - u * u); pos[i * 3] = rr * sq * Math.cos(th); pos[i * 3 + 1] = rr * u; pos[i * 3 + 2] = rr * sq * Math.sin(th);
      const b = 0.35 + 0.65 * Math.pow(rnd(), 3); const warm = rnd() < 0.15 ? 0.9 : 1; col[i * 3] = b; col[i * 3 + 1] = b * 0.97; col[i * 3 + 2] = b * 0.93 * warm;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g;
  }, [n, radius, seed]);
  return <points geometry={geo}><pointsMaterial size={size} vertexColors sizeAttenuation={false} transparent opacity={opacity} depthWrite={false} /></points>;
};
