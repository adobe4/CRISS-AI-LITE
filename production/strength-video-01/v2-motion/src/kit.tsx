import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing, random} from 'remotion';
import {getLength} from '@remotion/paths';

import {continueRender, delayRender} from 'remotion';
export const fontFamily = 'RobotoBlack';
if (typeof document !== 'undefined' && !(window as any).__fontLoaded) {
  (window as any).__fontLoaded = true;
  const h = delayRender('font', {timeoutInMilliseconds: 180000});
  const ff = new FontFace('RobotoBlack', `url(${staticFile('roboto900.woff2')}) format('woff2')`, {weight: '900'});
  ff.load().then((l) => { (document as any).fonts.add(l); continueRender(h); }).catch(() => continueRender(h));
}
export const FPS = 30;
export const INK = '#151311';
export const PAPER = '#efe8d7';
export const f = (s: number) => Math.round(s * FPS);
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

export const useT = () => useCurrentFrame() / FPS;

// ---------- background ----------
export const PaperBG: React.FC = () => (
  <AbsoluteFill>
    <Img src={staticFile('cut/paper.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  </AbsoluteFill>
);

export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.35}) => {
  const fr = useCurrentFrame();
  const i = Math.floor(fr / 2) % 6;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity, mixBlendMode: 'overlay'}}>
      <Img src={staticFile(`grain/g${i}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'auto'}} />
    </AbsoluteFill>
  );
};

// ---------- footage ----------
export const Footage: React.FC<{src: string; from: number; dur: number; scale?: number; origin?: string; push?: number; punchAt?: number[]; bright?: number}> = ({src, from, dur, scale = 1.2, origin = '50% 50%', push = 0.08, punchAt = [], bright = 1.05}) => {
  const fr = useCurrentFrame();
  const p = fr / (dur * FPS);
  let s = scale * (1 + push * p);
  for (const pa of punchAt) {
    const k = fr - f(pa);
    if (k >= 0) s *= 1 + 0.12 * Math.exp(-k / 5) + 0.04;
  }
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <OffthreadVideo src={staticFile(src)} startFrom={f(from)} muted
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s})`, transformOrigin: origin,
          filter: `grayscale(1) contrast(1.35) brightness(${bright})`}} />
      <AbsoluteFill style={{mixBlendMode: 'multiply', opacity: 0.7}}>
        <Img src={staticFile('cut/paper.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Flash: React.FC<{at: number[]}> = ({at}) => {
  const fr = useCurrentFrame();
  let o = 0;
  for (const a of at) { const k = fr - f(a); if (k >= 0 && k < 6) o = Math.max(o, 0.85 * (1 - k / 6)); }
  return <AbsoluteFill style={{background: PAPER, opacity: o}} />;
};

export const Shake: React.FC<{at: number[]; amp?: number; children: React.ReactNode}> = ({at, amp = 14, children}) => {
  const fr = useCurrentFrame();
  let x = 0, y = 0;
  for (const a of at) {
    const k = fr - f(a);
    if (k >= 0 && k < 10) { const d = amp * (1 - k / 10); x += (random(`x${a}${k}`) - 0.5) * 2 * d; y += (random(`y${a}${k}`) - 0.5) * 2 * d; }
  }
  return <AbsoluteFill style={{transform: `translate(${x}px, ${y}px)`}}>{children}</AbsoluteFill>;
};

// ---------- kinetic text ----------
export const Slam: React.FC<{lines: string[]; at: number; out: number; size?: number; color?: string; top?: number; shadow?: boolean}> = ({lines, at, out, size = 210, color = INK, top, shadow}) => {
  const fr = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (fr < f(at) || fr > f(out)) return null;
  return (
    <AbsoluteFill style={{justifyContent: top === undefined ? 'center' : 'flex-start', alignItems: 'center', paddingTop: top}}>
      {lines.map((l, i) => {
        const st = f(at) + i * 4;
        const sp = spring({frame: fr - st, fps, config: {damping: 13, stiffness: 220, mass: 0.7}});
        const sc = interpolate(sp, [0, 1], [2.1, 1]);
        const e1 = Math.max(st + 4, f(out) - 5), e2 = Math.max(e1 + 1, f(out));
        const o = interpolate(fr, [st, st + 3, e1, e2], [0, 1, 1, 0], clamp);
        const rot = interpolate(sp, [0, 1], [i % 2 ? 6 : -6, i % 2 ? 1.2 : -1.2]);
        return (
          <div key={i} style={{fontFamily, fontWeight: 900, fontSize: size, lineHeight: 0.92, color, letterSpacing: -2, textTransform: 'uppercase', opacity: o,
            transform: `scale(${sc}) rotate(${rot}deg)`, textShadow: shadow ? '0 10px 40px rgba(0,0,0,0.75), 0 2px 4px rgba(0,0,0,0.9)' : `0 0 18px ${PAPER}, 0 0 36px ${PAPER}, 0 0 60px ${PAPER}, 0 0 8px ${PAPER}`}}>{l}</div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- cut-out ----------
export type Key = {t: number; x: number; y: number; s?: number; r?: number; o?: number};
const lerpKeys = (keys: Key[], t: number) => {
  if (t <= keys[0].t) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t <= b.t) {
      const e = Easing.bezier(0.2, 0.9, 0.25, 1)((t - a.t) / (b.t - a.t));
      const L = (u?: number, v?: number, d = 1) => (u ?? d) + ((v ?? d) - (u ?? d)) * e;
      return {t, x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, s: L(a.s, b.s), r: L(a.r, b.r, 0), o: L(a.o, b.o)};
    }
  }
  return keys[keys.length - 1];
};
export const Cutout: React.FC<{src: string; h: number; keys: Key[]; walk?: number; breathe?: boolean; flip?: boolean}> = ({src, h, keys, walk = 0, breathe, flip}) => {
  const t = useT();
  if (t < keys[0].t) return null;
  const k = lerpKeys(keys, t);
  let y = k.y, r = k.r ?? 0, s = k.s ?? 1;
  if (walk) { y -= Math.abs(Math.sin(t * Math.PI * walk)) * 16; r += Math.sin(t * Math.PI * walk) * 2.2; }
  if (breathe) s *= 1 + 0.012 * Math.sin(t * 2.4);
  return (
    <Img src={staticFile(`cut/${src}.png`)} style={{position: 'absolute', height: h, left: k.x, top: y, opacity: k.o ?? 1,
      transform: `translate(-50%, -100%) scale(${flip ? -s : s}, ${s}) rotate(${r}deg)`, transformOrigin: '50% 100%',
      filter: 'drop-shadow(0 6px 6px rgba(40,30,15,0.25))'}} />
  );
};

// ---------- draw-on SVG ----------
export type SvgData = {W: number; H: number; paths: {d: string; tx: number; ty: number; len: number}[]};
export const DrawSvg: React.FC<{data: SvgData; cx: number; cy: number; h: number; start: number; end: number; fillAt?: number; ghost?: boolean; out?: number; raster?: string}> = ({data, cx, cy, h, start, end, fillAt, ghost, out, raster}) => {
  const t = useT();
  if (t < start) return null;
  const sc = h / data.H, w = data.W * sc;
  const p = interpolate(t, [start, end], [0, 1], clamp);
  const N = data.paths.length;
  const fillO = fillAt === undefined ? 0 : interpolate(t, [fillAt, fillAt + 0.35], [0, 1], clamp);
  const o = out === undefined ? 1 : interpolate(t, [out, out + 0.3], [1, 0], clamp);
  return (
    <>
    {raster && fillO > 0 ? <Img src={staticFile(`cut/full_${raster}.png`)} style={{position: 'absolute', left: cx - w / 2, top: cy - h / 2, width: w, height: h, opacity: fillO * o}} /> : null}
    <svg width={w} height={h} viewBox={`0 0 ${data.W} ${data.H}`} style={{position: 'absolute', left: cx - w / 2, top: cy - h / 2, opacity: o * (1 - fillO), overflow: 'visible'}}>
      {data.paths.map((pa, i) => {
        const st = (i / N) * 0.7;
        const lp = Math.min(1, Math.max(0, (p - st) / 0.3));
        if (lp <= 0) return null;
        return <path key={i} d={pa.d} transform={`translate(${pa.tx},${pa.ty})`} fill="none"
          stroke={INK} strokeWidth={ghost ? 1.6 : 1.3} strokeOpacity={ghost ? 0.75 : 1}
          strokeDasharray={pa.len} strokeDashoffset={pa.len * (1 - lp)} strokeLinecap="round" strokeLinejoin="round" />;
      })}
    </svg>
    </>
  );
};

// ---------- hand-drawn strokes ----------
export const Stroke: React.FC<{d: string; start: number; end: number; w?: number; out?: number; x?: number; y?: number}> = ({d, start, end, w = 12, out, x = 0, y = 0}) => {
  const t = useT();
  if (t < start) return null;
  const L = getLength(d);
  const p = interpolate(t, [start, end], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const o = out === undefined ? 1 : interpolate(t, [out, out + 0.3], [1, 0], clamp);
  return (
    <svg style={{position: 'absolute', left: x, top: y, overflow: 'visible', opacity: o}} width={10} height={10}>
      <path d={d} fill="none" stroke={INK} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={L} strokeDashoffset={L * (1 - p)} />
    </svg>
  );
};

export const scribblePath = (w: number, h: number, _n = 7, seed = 'a') => {
  const j = (k: string) => (random(seed + k) - 0.5) * 0.08;
  return `M ${w * (0.02 + j('a'))} ${h * (0.04 + j('b'))} Q ${w * (0.55 + j('c'))} ${h * (0.42 + j('d'))} ${w * (0.98 + j('e'))} ${h * (0.96 + j('f'))} ` +
    `M ${w * (0.96 + j('g'))} ${h * (0.06 + j('h'))} Q ${w * (0.42 + j('i'))} ${h * (0.55 + j('k'))} ${w * (0.04 + j('l'))} ${h * (0.94 + j('m'))}`;
};

// ---------- camera ----------
export type Cam = {t: number; x: number; y: number; z: number};
export const Camera: React.FC<{keys: Cam[]; children: React.ReactNode}> = ({keys, children}) => {
  const t = useT();
  let c = keys[0];
  if (t >= keys[keys.length - 1].t) c = keys[keys.length - 1];
  else for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t >= a.t && t < b.t) {
      // hold until 0.6s before b, then ease
      const mv = Math.min(0.6, b.t - a.t);
      const e = Easing.inOut(Easing.cubic)(Math.max(0, (t - (b.t - mv)) / mv));
      c = {t, x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, z: a.z + (b.z - a.z) * e};
      break;
    }
  }
  const dx = Math.sin(t * 0.35) * 10, dy = Math.cos(t * 0.27) * 6;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1, height: 1,
        transform: `translate(960px, 540px) scale(${c.z}) translate(${-c.x + dx}px, ${-c.y + dy}px)`, transformOrigin: '0 0'}}>
        {children}
      </div>
    </AbsoluteFill>
  );
};

// ---------- sfx ----------
export const Sfx: React.FC<{list: [number, string][]; vol?: number}> = ({list, vol = 0.05}) => (
  <>
    {list.map(([t, n], i) => (
      <Sequence key={i} from={f(t)}>
        <Audio src={staticFile(`sfx/${n}.mp3`)} volume={vol} />
      </Sequence>
    ))}
  </>
);
