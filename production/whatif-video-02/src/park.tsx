import React from 'react';
import {AbsoluteFill, Img, interpolate, Easing, random, staticFile, useCurrentFrame} from 'remotion';

const FPS = 30;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const io = Easing.bezier(0.45, 0, 0.25, 1);

// plate is 1376x768; we render it 1920 wide (scale 1.395)
const PW = 1376, PH = 768;

type Patch = {src: string; from: number; to: number};
/** Painted park plate with a cinematic camera, wind in the canopy, flying birds and pose patches for Milo. */
export const PlateScene: React.FC<{
  plate: string; dur: number; patches?: Patch[];
  cam: {from: {x: number; y: number; z: number}; to: {x: number; y: number; z: number}}; // x,y: plate-pixel focus point, z: zoom
  birds?: boolean; wind?: boolean; night?: boolean; next?: {src: string; at: number; fade?: number}; tint?: string;
}> = ({plate, dur, patches = [], cam, birds, wind = false, night, next, tint}) => {
  const fr = useCurrentFrame(); const t = fr / FPS;
  const p = interpolate(t, [0, dur], [0, 1], {...cl, easing: io});
  const z = cam.from.z + (cam.to.z - cam.from.z) * p;
  const fx = cam.from.x + (cam.to.x - cam.from.x) * p, fy = cam.from.y + (cam.to.y - cam.from.y) * p;
  const base = 1920 / PW; const s = base * z;
  // keep frame covered
  let left = 960 - fx * s, top = 540 - fy * s;
  left = Math.min(0, Math.max(1920 - PW * s, left)); top = Math.min(0, Math.max(1080 - PH * s, top));
  const breathe = 1 + 0.003 * Math.sin(t * 1.6);
  const windT = t * 0.35;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left, top, width: PW * s, height: PH * s, transform: `scale(${breathe})`, transformOrigin: `${fx * s}px ${fy * s}px`}}>
        <Img src={staticFile(plate)} style={{position: 'absolute', width: '100%', height: '100%'}} />
        {wind ? (
          <div style={{position: 'absolute', inset: 0, WebkitMaskImage: `url(${staticFile('art/canopy_alpha.png')})`, WebkitMaskSize: '100% 100%', transformOrigin: '50% 70%', transform: `translate(${Math.sin(windT * 2.1) * 2.2 * s}px, ${Math.cos(windT * 1.7) * 1.1 * s}px) skewX(${Math.sin(windT * 1.3) * 0.35}deg)`}}>
            <Img src={staticFile(plate)} style={{width: '100%', height: '100%'}} />
          </div>
        ) : null}
        {next ? <Img src={staticFile(next.src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: interpolate(t, [next.at, next.at + (next.fade ?? 0.08)], [0, 1], cl)}} /> : null}
        {patches.map((pt, i) => {
          const o = interpolate(t, [pt.from - 0.06, pt.from, pt.to - 0.06, pt.to], [0, 1, 1, 0], cl);
          return o > 0 ? <Img key={i} src={staticFile(pt.src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: o}} /> : null;
        })}
        {birds ? <Birds t={t} w={PW * s} h={PH * s} s={s} /> : null}
      </div>
      {/* light & lens: soft glare breathing from the sun corner */}
      {!night ? <AbsoluteFill style={{background: 'radial-gradient(circle at 22% 10%, rgba(255,250,236,0.35), rgba(255,250,236,0) 45%)', opacity: 0.75 + 0.25 * Math.sin(t * 0.8), mixBlendMode: 'screen'}} /> : null}
      {tint ? <AbsoluteFill style={{background: tint}} /> : null}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,6,4,0) 52%, rgba(8,6,4,0.62) 100%), linear-gradient(90deg, rgba(8,6,4,0.35) 0%, rgba(8,6,4,0) 45%)'}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 320px rgba(8,6,4,0.55)'}} />
    </AbsoluteFill>
  );
};

const Birds: React.FC<{t: number; w: number; h: number; s: number}> = ({t, w, h, s}) => (
  <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 7}).map((_, i) => {
      const sp = 70 + random('bs' + i) * 40;
      const x = (420 + i * 22 + t * sp) * s, y = (215 + random('by' + i) * 60 + Math.sin(t * 1.3 + i) * 6) * s;
      const flap = Math.sin(t * (10 + i) + i * 2) * 5 * s * 0.5; const sz = (5 + random('bz' + i) * 3) * s * 0.55;
      return <path key={i} d={`M ${x - sz} ${y - flap} Q ${x - sz / 2} ${y - 1} ${x} ${y} Q ${x + sz / 2} ${y - 1} ${x + sz} ${y - flap}`} fill="none" stroke="#2a2723" strokeWidth={1.6 * s * 0.6} strokeLinecap="round" opacity={0.85} />;
    })}
  </svg>
);

/** Painted object flying across with motion blur. */
export const FlyingArt: React.FC<{src: string; from: [number, number]; to: [number, number]; dur: number; w: number; rot?: [number, number]}> = ({src, from, to, dur, w, rot = [-8, 6]}) => {
  const t = useCurrentFrame() / FPS;
  const p = interpolate(t, [0, dur], [0, 1], {...cl, easing: Easing.bezier(0.3, 0, 0.2, 1)});
  const x = from[0] + (to[0] - from[0]) * p, y = from[1] + (to[1] - from[1]) * p - Math.sin(p * Math.PI) * 140;
  const v = Math.abs(Math.cos(p * Math.PI)) ;
  return (
    <Img src={staticFile(src)} style={{position: 'absolute', width: w, left: x - w / 2, top: y - w * 0.4, transform: `rotate(${rot[0] + (rot[1] - rot[0]) * p}deg)`, filter: `blur(${(1 - v) * 0 + v * 1.5}px) drop-shadow(0 30px 40px rgba(0,0,0,0.55))`}} />
  );
};

export const ParkScene: typeof PlateScene = (p) => <PlateScene wind {...p} />;
