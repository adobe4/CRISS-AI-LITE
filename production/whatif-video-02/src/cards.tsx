import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, random, staticFile, useCurrentFrame, Easing} from 'remotion';
import {PlateScene} from './park';
import {C, MONO, SANS, f, useT} from './pro';
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.bezier(0.2, 0.8, 0.2, 1);

/** Plate with a slow push; x/y are plate-pixel focus points, z zoom. */
export const Plate: React.FC<{src: string; dur: number; x0?: number; y0?: number; z0?: number; x1?: number; y1?: number; z1?: number; next?: {src: string; at: number; fade?: number}; night?: boolean; birds?: boolean; children?: React.ReactNode}> = ({src, dur, x0 = 688, y0 = 384, z0 = 1.0, x1, y1, z1 = 1.12, next, night = true, birds, children}) => (
  <AbsoluteFill>
    <PlateScene plate={src} dur={dur} night={night} birds={birds} next={next} cam={{from: {x: x0, y: y0, z: z0}, to: {x: x1 ?? x0, y: y1 ?? y0, z: z1}}} />
    {children}
  </AbsoluteFill>
);

/* ---------- atmosphere particles ---------- */
export const Particles: React.FC<{n?: number; kind: 'snow' | 'motes' | 'bubbles'}> = ({n = 90, kind}) => {
  const t = useT();
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: n}).map((_, i) => {
        const z = 0.3 + random('pz' + i) * 0.7; const sp = (kind === 'snow' ? 70 : kind === 'bubbles' ? -60 : -14) * z;
        const x = (random('px' + i) * 2100 - 90 + Math.sin(t * 0.6 + i) * 30 * z) % 2100;
        const y = (((random('py' + i) * 1180 + t * sp) % 1180) + 1180) % 1180 - 50;
        const r = (kind === 'snow' ? 3.2 : kind === 'bubbles' ? 2.6 : 1.8) * z * (0.7 + random('pr' + i) * 0.6);
        return <circle key={i} cx={x} cy={y} r={r} fill={kind === 'bubbles' ? 'none' : C.white} stroke={kind === 'bubbles' ? C.white : 'none'} strokeWidth={1.2} opacity={(kind === 'snow' ? 0.75 : 0.45) * z} />;
      })}
    </svg>
  );
};

/* ---------- Survival Odds meter ---------- */
export const Odds: React.FC<{at: number; out: number; from: number; to: number}> = ({at, out, from, to}) => {
  const t = useT(); if (t < at || t > out) return null;
  const o = interpolate(t, [at, at + 0.3, out - 0.3, out], [0, 1, 1, 0], cl);
  const p = interpolate(t, [at + 0.35, at + 1.5], [0, 1], {...cl, easing: ease});
  const v = Math.round(from + (to - from) * p);
  const slide = interpolate(t, [at, at + 0.5], [60, 0], {...cl, easing: ease});
  const low = v <= 40;
  return (
    <div style={{position: 'absolute', left: 120, bottom: 120, width: 880, opacity: o, transform: `translateX(${-slide}px)`}}>
      <div style={{background: 'rgba(11,10,9,0.82)', padding: '38px 48px 46px', borderLeft: `10px solid ${C.red}`, boxShadow: '0 30px 80px rgba(0,0,0,0.5)'}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 84, letterSpacing: 2, color: C.white, textTransform: 'uppercase', whiteSpace: 'nowrap', lineHeight: 1}}>Survival odds</div>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 230, lineHeight: 1, color: low ? C.red : C.white, marginTop: 10}}>{v}%</div>
        <div style={{height: 22, background: 'rgba(239,233,223,0.16)', marginTop: 26}}>
          <div style={{height: '100%', width: `${v}%`, background: C.red}} />
        </div>
      </div>
    </div>
  );
};

/* ---------- temperature readout ---------- */
export const Temp: React.FC<{at: number; out: number; from: number; to: number; label: string; ramp?: number}> = ({at, out, from, to, label, ramp = 3}) => {
  const t = useT(); if (t < at || t > out) return null;
  const o = interpolate(t, [at, at + 0.3, out - 0.3, out], [0, 1, 1, 0], cl);
  const v = Math.round(interpolate(t, [at + 0.3, at + 0.3 + ramp], [from, to], {...cl, easing: Easing.inOut(Easing.cubic)}));
  const fill = interpolate(v, [-80, 30], [0.04, 1], cl);
  return (
    <div style={{position: 'absolute', right: 120, top: 200, display: 'flex', alignItems: 'center', gap: 44, opacity: o, background: 'rgba(11,10,9,0.82)', padding: '40px 50px', borderRight: `10px solid ${C.red}`, boxShadow: '0 30px 80px rgba(0,0,0,0.5)'}}>
      <div style={{textAlign: 'right'}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 84, letterSpacing: 2, color: C.white, textTransform: 'uppercase', whiteSpace: 'nowrap', lineHeight: 1}}>{label}</div>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 210, lineHeight: 1, color: C.white}}>{v > 0 ? '+' : v < 0 ? '−' : ''}{Math.abs(v)}°C</div>
      </div>
      <div style={{width: 46, height: 300, borderRadius: 23, border: `5px solid ${C.white}`, position: 'relative', background: 'rgba(11,10,9,0.6)', overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 6, right: 6, bottom: 6, height: `calc(${fill * 100}% - 12px)`, borderRadius: 14, background: C.red}} />
      </div>
    </div>
  );
};

/* ---------- side statement: left-aligned, vertically centred, for frames whose subject sits right ---------- */
const SideLine: React.FC<{text: React.ReactNode; start: number; end: number; style: React.CSSProperties}> = ({text, start, end, style}) => {
  const fr = useCurrentFrame();
  const inP = interpolate(fr, [start, start + 16], [0, 1], {...cl, easing: ease});
  const outP = interpolate(fr, [end - 10, end], [0, 1], {...cl, easing: Easing.in(Easing.quad)});
  return <div style={{overflow: 'hidden', paddingBottom: 8}}><div style={{transform: `translateY(${(1 - inP) * 110 - outP * 30}%)`, opacity: 1 - outP, ...style}}>{text}</div></div>;
};
export const Side: React.FC<{lines: React.ReactNode[]; at: number; out: number; size?: number; kicker?: string; mono?: boolean}> = ({lines, at, out, size = 130, kicker, mono}) => {
  const fr = useCurrentFrame(); if (fr < f(at) || fr > f(out)) return null;
  const bar = interpolate(fr, [f(at), f(at) + 14], [0, 80], {...cl, easing: ease});
  return (
    <div style={{position: 'absolute', left: 120, top: 540, transform: 'translateY(-50%)', maxWidth: 820, textShadow: '0 4px 30px rgba(0,0,0,0.7)'}}>
      {kicker ? <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 14}}>
        <div style={{width: bar, height: 6, background: C.red}} />
        <SideLine text={kicker} start={f(at) + 3} end={f(out)} style={{whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 800, fontSize: 84, letterSpacing: 2, color: C.white, textTransform: 'uppercase'}} />
      </div> : null}
      {lines.map((l, i) => <SideLine key={i} text={l} start={f(at) + 5 + i * 4} end={f(out)} style={{whiteSpace: 'nowrap', fontFamily: mono ? MONO : SANS, fontWeight: mono ? 700 : 800, fontSize: size, lineHeight: 1.04, letterSpacing: mono ? 0 : -2, color: C.white}} />)}
    </div>
  );
};

/* ---------- big figure ---------- */
export const Figure: React.FC<{at: number; out: number; big: React.ReactNode; small: string; y?: number}> = ({at, out, big, small, y = 170}) => {
  const t = useT(); if (t < at || t > out) return null;
  const o = interpolate(t, [at, at + 0.35, out - 0.3, out], [0, 1, 1, 0], cl); const dy = interpolate(t, [at, at + 0.5], [24, 0], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: o, transform: `translateY(${dy}px)`, textShadow: '0 6px 30px rgba(0,0,0,0.75)'}}>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 130, color: C.white, letterSpacing: -1}}>{big}</div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 84, letterSpacing: 2, color: C.white, textTransform: 'uppercase', marginTop: 6}}>{small}</div>
    </div>
  );
};

/* ---------- chapter card (DAY 1, MONTH 2…) ---------- */
export const Chapter: React.FC<{at: number; label: string; sub: string}> = ({at, label, sub}) => {
  const t = useT(); const out = at + 1.5; if (t < at || t > out) return null;
  const o = interpolate(t, [at, at + 0.2, out - 0.35, out], [0, 1, 1, 0], cl);
  const w = interpolate(t, [at, at + 0.6], [0, 520], {...cl, easing: ease});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: o, background: C.bg}}>
      <div style={{width: w, height: 6, background: C.red, margin: '22px 0 18px'}} />
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 210, letterSpacing: -4, color: C.white, lineHeight: 1}}>{label}</div>
    </AbsoluteFill>
  );
};

export const Grain: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity: 0.22, mixBlendMode: 'overlay'}}>
    <Img src={staticFile(`grain/g${Math.floor(useCurrentFrame() / 2) % 6}.png`)} style={{width: '100%', height: '100%'}} />
  </AbsoluteFill>
);
export const Cut: React.FC<{a: number; b: number; children: React.ReactNode}> = ({a, b, children}) => <Sequence from={f(a)} durationInFrames={f(b - a)}>{children}</Sequence>;

/** One music track looped with a crossfade, ducked under the big hits. */
export const LoopMusic: React.FC<{src: string; len: number; total: number; loops: [number, number][]; duck?: [number, number][]; vol?: number; xf?: number}> = ({src, len, total, loops, duck = [], vol = 0.11, xf = 10}) => {
  const dk = (t: number) => { let v = 1; for (const [a, b] of duck) v *= 1 - interpolate(t, [a, a + 0.1, b - 0.6, b], [0, 1, 1, 0], cl); return v; };
  // loops: [startInFilm, startInTrack]; each instance fades in over xf and out when the next one starts
  return (<>{loops.map(([at, from], i) => {
    const end = i + 1 < loops.length ? loops[i + 1][0] + xf : total;
    return <Sequence key={i} from={f(at)} durationInFrames={f(Math.min(end, at + len - from) - at)}>
      <Audio src={staticFile(src)} startFrom={f(from)} volume={(fr) => { const t = fr / 30 + at; return vol * dk(t) * interpolate(t, [at, at + (i ? xf : 2), end - (i + 1 < loops.length ? xf : 4), end], [0, 1, 1, 0], cl); }} />
    </Sequence>;
  })}</>);
};
