// "Mission control documentary" toolkit for the What If channel.
import React from 'react';
import {AbsoluteFill, Easing, Img, OffthreadVideo, Sequence, Audio, interpolate, random, staticFile, useCurrentFrame} from 'remotion';

export const FPS = 30;
export const f = (s: number) => Math.round(s * FPS);
export const useT = () => useCurrentFrame() / FPS;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.bezier(0.2, 0.8, 0.2, 1);

export const C = {bg: '#0B0A09', white: '#EFE9DF', dim: 'rgba(239,233,223,0.62)', accent: '#EFE9DF', red: '#FF2E3B', line: 'rgba(239,233,223,0.18)'};
export const SANS = 'Inter, sans-serif';
export const MONO = "'Roboto Mono', monospace";

// ---------- footage with a cinematic grade ----------
export const Shot: React.FC<{src: string; from: number; dur: number; scale?: number; origin?: string; push?: number; sat?: number; bright?: number; mono?: boolean; cutRight?: number; shiftX?: number}> = ({src, from, dur, scale = 1.1, origin = '50% 50%', push = 0.06, sat = 0.8, bright = 0.95, mono, cutRight, shiftX = 0}) => {
  const fr = useCurrentFrame();
  const p = fr / (dur * FPS);
  const s = scale * (1 + push * p);
  const fin = interpolate(fr, [0, 5], [0, 1], cl);
  const filter = mono ? `grayscale(1) contrast(1.35) brightness(${bright})` : `grayscale(0.82) sepia(0.12) contrast(1.18) brightness(${bright})`;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden', opacity: fin}}>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${shiftX}px) scale(${s})`, transformOrigin: origin}}>
        <OffthreadVideo src={staticFile(src)} startFrom={f(from)} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter}} />
        {cutRight ? <div style={{position: 'absolute', inset: 0, background: `linear-gradient(90deg, rgba(0,0,0,0) ${cutRight - 2}%, #000 ${cutRight}%)`}} /> : null}
      </div>
      <AbsoluteFill style={{background: 'rgba(11,10,9,0.18)'}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 260px rgba(0,0,0,0.75)'}} />
    </AbsoluteFill>
  );
};

// ---------- space background with stars + faint grid ----------
export const SpaceBG: React.FC<{grid?: boolean; stars?: number}> = ({grid = true, stars = 160}) => {
  const t = useT();
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #1a1815 0%, ${C.bg} 72%)`}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {grid ? Array.from({length: 25}).map((_, i) => <line key={'v' + i} x1={i * 80} y1={0} x2={i * 80} y2={1080} stroke={C.white} strokeOpacity={0.035} strokeWidth={1} />) : null}
        {grid ? Array.from({length: 14}).map((_, i) => <line key={'h' + i} x1={0} y1={i * 80} x2={1920} y2={i * 80} stroke={C.white} strokeOpacity={0.035} strokeWidth={1} />) : null}
        {Array.from({length: stars}).map((_, i) => (
          <circle key={i} cx={random('x' + i) * 1920} cy={random('y' + i) * 1080} r={0.6 + random('r' + i) * 1.6} fill={C.white} opacity={(0.25 + random('o' + i) * 0.6) * (0.75 + 0.25 * Math.sin(t * 2 + i))} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- text system (mask reveal, strict grid) ----------
const Line: React.FC<{text: React.ReactNode; start: number; end: number; style: React.CSSProperties}> = ({text, start, end, style}) => {
  const fr = useCurrentFrame();
  const inP = interpolate(fr, [start, start + 16], [0, 1], {...cl, easing: ease});
  const outP = interpolate(fr, [end - 10, end], [0, 1], {...cl, easing: Easing.in(Easing.quad)});
  return (
    <div style={{overflow: 'hidden', paddingBottom: 6}}>
      <div style={{transform: `translateY(${(1 - inP) * 110 - outP * 30}%)`, opacity: 1 - outP, ...style}}>{text}</div>
    </div>
  );
};

/** Centered statement: big, clean, left-aligned block centered on screen. */
export const Title: React.FC<{lines: React.ReactNode[]; at: number; out: number; size?: number; y?: number}> = ({lines, at, out, size = 130, y = 540}) => {
  const fr = useCurrentFrame();
  if (fr < f(at) || fr > f(out)) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', textShadow: '0 4px 30px rgba(0,0,0,0.6)'}}>
      {lines.map((l, i) => (
        <Line key={i} text={l} start={f(at) + i * 4} end={f(out)} style={{fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 1.05, letterSpacing: -2, color: C.white, textAlign: 'center'}} />
      ))}
    </div>
  );
};

/** Lower third: accent kicker + headline, always at the same left margin. */
export const Lower: React.FC<{kicker: string; head: React.ReactNode; at: number; out: number; mono?: boolean; size?: number}> = ({kicker, head, at, out, mono, size = 112}) => {
  const fr = useCurrentFrame();
  if (fr < f(at) || fr > f(out)) return null;
  const bar = interpolate(fr, [f(at), f(at) + 14], [0, 80], {...cl, easing: ease});
  return (
    <div style={{position: 'absolute', left: 120, bottom: 120, textShadow: '0 4px 28px rgba(0,0,0,0.8)'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 10}}>
        <div style={{width: bar, height: 6, background: C.white}} />
        <Line text={kicker} start={f(at) + 3} end={f(out)} style={{fontFamily: SANS, fontWeight: 700, fontSize: 46, letterSpacing: 8, color: C.dim, textTransform: 'uppercase'}} />
      </div>
      <Line text={head} start={f(at) + 6} end={f(out)} style={{fontFamily: mono ? MONO : SANS, fontWeight: mono ? 700 : 800, fontSize: size, letterSpacing: mono ? 0 : -1.5, color: C.white, lineHeight: 1.05}} />
    </div>
  );
};

export const Accent: React.FC<{children: React.ReactNode; red?: boolean}> = ({children, red}) => red ? <span style={{color: C.red}}>{children}</span> : <span style={{color: C.bg, background: C.white, padding: '0 14px', marginLeft: 4}}>{children}</span>;

// ---------- HUD: mission clock ----------
const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');
export const HudClock: React.FC<{from: number; map?: (t: number) => number; until?: number}> = ({from, map, until = 1e9}) => {
  const t = useT();
  if (t < from || t > until) return null;
  const story = map ? map(t) : t - from;
  const d = Math.floor(story / 86400), h = (story % 86400) / 3600, m = (story % 3600) / 60, s = story % 60;
  const o = interpolate(t, [from, from + 0.4], [0, 1], cl);
  const blink = Math.floor(t * 2) % 2 === 0 ? 1 : 0.25;
  return (
    <div style={{position: 'absolute', left: 90, top: 70, opacity: o}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: 7, color: C.dim}}>
        <div style={{width: 22, height: 22, borderRadius: 11, background: C.red, opacity: blink}} /> SUN OFFLINE
      </div>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 72, color: C.white, marginTop: 4}}>
        T+ {d > 0 ? `${d}D ` : ''}{pad(h)}:{pad(m)}:{pad(s)}
      </div>
    </div>
  );
};

// ---------- stick-man Milo ----------
// Angles in degrees. Limb angles are measured from straight DOWN, positive = toward the facing direction.
// Arm/leg second angle is RELATIVE to the first segment. lean: torso tilt forward (+) / back (-). head: tilt forward (+) / back (-).
export type Pose = {lean: number; head: number; aL: number; eL: number; aR: number; eR: number; hL: number; kL: number; hR: number; kR: number; seat?: boolean};
const L = {torso: 118, neck: 12, headR: 30, upper: 60, fore: 56, thigh: 72, shin: 72};
const rad = (d: number) => (d * Math.PI) / 180;
const down = (x: number, y: number, ang: number, len: number) => [x + Math.sin(rad(ang)) * len, y + Math.cos(rad(ang)) * len] as const;
const up = (x: number, y: number, ang: number, len: number) => [x + Math.sin(rad(ang)) * len, y - Math.cos(rad(ang)) * len] as const;

export const pose = (name: string, t: number): Pose => {
  const base: Pose = {lean: 0, head: 0, aL: 6, eL: 4, aR: -6, eR: 4, hL: 3, kL: 0, hR: -3, kR: 0};
  if (name === 'sitEat') { const b = Math.max(0, Math.sin(t * 2.4)); return {lean: 4, head: 6, aL: 35, eL: 45, aR: 25 + b * 20, eR: 125 + b * 20, hL: 90, kL: -90, hR: 86, kR: -86, seat: true}; }
  if (name === 'sit') return {lean: 2, head: 0, aL: 30, eL: 40, aR: 35, eR: 45, hL: 90, kL: -90, hR: 86, kR: -86, seat: true};
  if (name === 'sitLookUp') return {lean: -6, head: -40, aL: 20, eL: 20, aR: 25, eR: 25, hL: 90, kL: -90, hR: 86, kR: -86, seat: true};
  if (name === 'lookUp') return {...base, lean: -5, head: -45};
  if (name === 'walk') { const c = Math.sin(t * 6); return {lean: 4, head: 0, aL: 28 * c, eL: 22, aR: -28 * c, eR: 22, hL: 26 * c, kL: -Math.max(0, 40 * -c), hR: -26 * c, kR: -Math.max(0, 40 * c)}; }
  if (name === 'shiver') { const j = Math.sin(t * 45) * 2.5; return {...base, lean: 8 + j, head: 10, aL: 40, eL: 120, aR: 40, eR: 120}; }
  if (name === 'fall') { const w = Math.sin(t * 3); return {lean: 0, head: 15, aL: 140 + w * 15, eL: 20, aR: -140 - w * 15, eR: -20, hL: 35, kL: -30 * w, hR: -35, kR: 30 * w}; }
  return base;
};

/** x,y = ground point under the hips (standing) or under the seat front edge (sitting). facing 1 = right. */
export const StickMan: React.FC<{x: number; y: number; s?: number; p: Pose; facing?: number; rot?: number; opacity?: number; pack?: boolean}> = ({x, y, s = 1, p, facing = 1, rot = 0, opacity = 1, pack = true}) => {
  const hip = [0, p.seat ? -L.shin : -(L.thigh + L.shin)] as const;
  const neck = up(hip[0], hip[1], p.lean, L.torso);
  const head = up(neck[0], neck[1], p.lean + p.head, L.neck + L.headR);
  const sh = down(neck[0], neck[1], p.lean + 180, -8);
  const limb = (o: readonly [number, number], a1: number, a2: number, l1: number, l2: number) => { const m = down(o[0], o[1], a1, l1); const e = down(m[0], m[1], a1 + a2, l2); return `M ${o[0]} ${o[1]} L ${m[0]} ${m[1]} L ${e[0]} ${e[1]}`; };
  const st = {fill: 'none', stroke: C.white, strokeWidth: 9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const mid = [(hip[0] + neck[0]) / 2, (hip[1] + neck[1]) / 2];
  const nose = up(head[0], head[1], p.lean + p.head + 90, L.headR + 8);
  const noseIn = up(head[0], head[1], p.lean + p.head + 90, L.headR - 2);
  return (
    <svg style={{position: 'absolute', left: x, top: y, overflow: 'visible', opacity, filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.85))'}} width={1} height={1}>
      <g transform={`rotate(${rot}) scale(${s * facing} ${s})`}>
        {pack ? <rect x={mid[0] - 40} y={mid[1] - 42} width={30} height={72} rx={11} fill="rgba(5,7,13,0.35)" stroke={C.white} strokeWidth={7} transform={`rotate(${p.lean} ${mid[0]} ${mid[1]})`} /> : null}
        <path d={limb(hip, p.hR, p.kR, L.thigh, L.shin)} {...st} opacity={0.8} />
        <path d={limb(sh, p.aR, p.eR, L.upper, L.fore)} {...st} opacity={0.8} />
        <line x1={hip[0]} y1={hip[1]} x2={neck[0]} y2={neck[1]} {...st} />
        <path d={limb(hip, p.hL, p.kL, L.thigh, L.shin)} {...st} />
        <path d={limb(sh, p.aL, p.eL, L.upper, L.fore)} {...st} />
        <circle cx={head[0]} cy={head[1]} r={L.headR} fill="rgba(5,7,13,0.35)" stroke={C.white} strokeWidth={8} />
        <line x1={noseIn[0]} y1={noseIn[1]} x2={nose[0]} y2={nose[1]} {...st} strokeWidth={7} />
      </g>
    </svg>
  );
};

/** Park bench; x,y = ground under the seat front edge (same anchor as a sitting StickMan). */
export const Bench: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <svg style={{position: 'absolute', left: x, top: y, overflow: 'visible', filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.85))'}} width={1} height={1}>
    <g transform={`scale(${s})`} stroke={C.white} strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.55}>
      <path d={`M -95 ${-L.shin} L 45 ${-L.shin} M -85 ${-L.shin} L -85 0 M 35 ${-L.shin} L 35 0 M -88 ${-L.shin} L -110 ${-L.shin - 95} M -112 ${-L.shin - 95} L -112 ${-L.shin - 95}`} />
    </g>
  </svg>
);

// ---------- vector bodies ----------
export const SunVec: React.FC<{x: number; y: number; r: number; o?: number; ghost?: number}> = ({x, y, r, o = 1, ghost = 0}) => {
  const t = useT();
  const pulse = 1 + 0.02 * Math.sin(t * 2);
  return (
    <svg style={{position: 'absolute', left: x - r * 3, top: y - r * 3, overflow: 'visible'}} width={r * 6} height={r * 6}>
      <defs>
        <radialGradient id="sg"><stop offset="0%" stopColor="#ffffff" /><stop offset="55%" stopColor={C.white} stopOpacity={0.6} /><stop offset="100%" stopColor={C.white} stopOpacity={0} /></radialGradient>
      </defs>
      <circle cx={r * 3} cy={r * 3} r={r * 2.6 * pulse} fill="url(#sg)" opacity={0.35 * o} />
      <circle cx={r * 3} cy={r * 3} r={r} fill="#fff" opacity={o} />
      <circle cx={r * 3} cy={r * 3} r={r} fill="none" stroke={C.white} strokeWidth={3} strokeDasharray="10 12" opacity={ghost} />
    </svg>
  );
};

export const EarthVec: React.FC<{x: number; y: number; r: number; o?: number}> = ({x, y, r, o = 1}) => {
  const t = useT();
  const sp = (t * 12) % 30;
  return (
    <svg style={{position: 'absolute', left: x - r * 2, top: y - r * 2, overflow: 'visible', opacity: o}} width={r * 4} height={r * 4}>
      <defs><clipPath id={`ec${Math.round(r)}`}><circle cx={r * 2} cy={r * 2} r={r} /></clipPath></defs>
      <circle cx={r * 2} cy={r * 2} r={r} fill={C.bg} stroke={C.white} strokeWidth={Math.max(2, r / 16)} />
      <g clipPath={`url(#ec${Math.round(r)})`} stroke={C.white} strokeWidth={Math.max(1, r / 34)} fill="none" opacity={0.55}>
        {[-60, -30, 0, 30, 60].map((lat) => <ellipse key={lat} cx={r * 2} cy={r * 2 + Math.sin((lat * Math.PI) / 180) * r} rx={Math.cos((lat * Math.PI) / 180) * r} ry={Math.cos((lat * Math.PI) / 180) * r * 0.18} />)}
        {[0, 30, 60, 90, 120, 150].map((lon) => { const a2 = ((lon + sp) * Math.PI) / 180; return <ellipse key={lon} cx={r * 2} cy={r * 2} rx={Math.abs(Math.cos(a2)) * r} ry={r} />; })}
      </g>
    </svg>
  );
};

export const Music: React.FC<{src: string; vol?: number; duck?: [number, number][]; total: number}> = ({src, vol = 0.12, duck = [], total}) => (
  <Audio src={staticFile(src)} volume={(fr) => {
    const t = fr / FPS;
    let v = vol * interpolate(t, [0, 2, total - 3, total], [0, 1, 1, 0], cl);
    for (const [a, b] of duck) v *= 1 - interpolate(t, [a, a + 0.1, b - 0.6, b], [0, 1, 1, 0], cl);
    return v;
  }} />
);

export const Sfx: React.FC<{list: [number, string][]; vol?: number}> = ({list, vol = 0.05}) => (
  <>{list.map(([t, n], i) => <Sequence key={i} from={f(t)}><Audio src={staticFile(n.includes('.') ? `sfx2/${n}` : `sfx2/${n}.wav`)} volume={vol} /></Sequence>)}</>
);
