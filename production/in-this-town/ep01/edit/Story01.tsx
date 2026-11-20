// In This Town · Episode 1 · Story 1 "Every Lie Turns You Grey" — 16:9 edit
import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, Easing, staticFile, useCurrentFrame, random} from 'remotion';
import WORDS from './words01.json';

const FPS = 30;
export const STORY01_LEN = 89.2; // seconds
const f = (s: number) => Math.round(s * FPS);
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.bezier(0.45, 0, 0.25, 1);

type Move = {z0: number; z1: number; x0?: number; x1?: number; y0?: number; y1?: number; ox?: number; oy?: number};
type Shot = {id: string; t0: number; t1: number; m: Move; clip?: {src: string; from: number}; snow?: boolean; shake?: number; children?: React.ReactNode};

// timings come from the narration word timestamps (story01_words.json)
const SHOTS: Shot[] = [
  {id: 'c1', t0: 0, t1: 2.92, m: {z0: 1, z1: 1}, clip: {src: 's01_c1.mp4', from: 0}},
  {id: '02', t0: 2.92, t1: 6.96, m: {z0: 1.04, z1: 1.16, ox: 50, oy: 45}},
  {id: '03', t0: 6.96, t1: 10.52, m: {z0: 1.18, z1: 1.04, ox: 50, oy: 35}},
  {id: '04', t0: 10.52, t1: 13.48, m: {z0: 1.08, z1: 1.2, ox: 40, oy: 40}},
  {id: '05', t0: 13.48, t1: 14.54, m: {z0: 1.05, z1: 1.14, ox: 40, oy: 50}},
  {id: '06', t0: 14.54, t1: 19.12, m: {z0: 1.02, z1: 1.1, x0: 0, x1: -2, ox: 50, oy: 40}},
  {id: '07', t0: 19.12, t1: 21.92, m: {z0: 1.12, z1: 1.02, ox: 32, oy: 40}},
  {id: '08', t0: 21.92, t1: 26.06, m: {z0: 1.0, z1: 1.14, ox: 28, oy: 45}},
  {id: '09', t0: 26.06, t1: 27.54, m: {z0: 1.04, z1: 1.12, ox: 45, oy: 45}},
  {id: '10', t0: 27.54, t1: 29.24, m: {z0: 1.1, z1: 1.02, ox: 60, oy: 50}},
  {id: '11', t0: 29.24, t1: 34.04, m: {z0: 1.02, z1: 1.14, ox: 35, oy: 40}},
  {id: '12', t0: 34.04, t1: 36.2, m: {z0: 1.12, z1: 1.04, ox: 48, oy: 45}},
  {id: '13', t0: 36.2, t1: 40.76, m: {z0: 1.0, z1: 1.18, ox: 66, oy: 55}, snow: true},
  {id: '14', t0: 40.76, t1: 46.56, m: {z0: 1.02, z1: 1.12, ox: 30, oy: 40}},
  {id: '15', t0: 46.56, t1: 49.9, m: {z0: 1.12, z1: 1.02, ox: 55, oy: 40}, snow: true},
  {id: '16', t0: 49.9, t1: 54.1, m: {z0: 1.0, z1: 1.14, ox: 72, oy: 35}},
  {id: '17', t0: 54.1, t1: 55.0, m: {z0: 1.0, z1: 1.04, ox: 30, oy: 40}},
  {id: 'c2', t0: 55.0, t1: 58.46, m: {z0: 1, z1: 1}, clip: {src: 's01_c2.mp4', from: 1.0}},
  {id: '18', t0: 58.46, t1: 61.08, m: {z0: 1.0, z1: 1.12, ox: 50, oy: 45}},
  {id: '19', t0: 61.08, t1: 63.96, m: {z0: 1.0, z1: 1.12, ox: 60, oy: 45}, snow: true},
  {id: '20', t0: 63.96, t1: 69.16, m: {z0: 1.0, z1: 1.16, ox: 62, oy: 40}, snow: true},
  {id: '21', t0: 69.16, t1: 69.78, m: {z0: 1.06, z1: 1.08, ox: 50, oy: 45}, shake: 14},
  {id: 'c3', t0: 69.78, t1: 77.78, m: {z0: 1, z1: 1}, clip: {src: 's01_c3.mp4', from: 0}},
  {id: '22', t0: 77.78, t1: 80.88, m: {z0: 1.12, z1: 1.02, ox: 40, oy: 50}, snow: true},
  {id: '23', t0: 80.88, t1: 84.72, m: {z0: 1.0, z1: 1.1, ox: 55, oy: 40}},
  {id: '24', t0: 84.72, t1: STORY01_LEN, m: {z0: 1.0, z1: 1.08, ox: 48, oy: 70}},
];

const Snow: React.FC<{seed: string}> = ({seed}) => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: 90}).map((_, i) => {
        const r = (k: number) => random(`${seed}-${i}-${k}`);
        const size = 3 + r(1) * 7; const speed = 1.2 + r(2) * 2.4;
        const y = ((r(3) * 1200 + fr * speed) % 1200) - 60;
        const x = (r(4) * 2000 + Math.sin(fr / 30 + r(5) * 6) * 30 + fr * 0.6) % 2000 - 40;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%', background: 'white', opacity: 0.5 + r(6) * 0.4, filter: size > 7 ? 'blur(1.5px)' : 'none'}} />;
      })}
    </AbsoluteFill>
  );
};

const Still: React.FC<{shot: Shot}> = ({shot}) => {
  const fr = useCurrentFrame(); const d = f(shot.t1 - shot.t0);
  const p = interpolate(fr, [0, d], [0, 1], {...cl, easing: ease});
  const m = shot.m;
  const z = m.z0 + (m.z1 - m.z0) * p;
  const x = (m.x0 ?? 0) + ((m.x1 ?? 0) - (m.x0 ?? 0)) * p;
  const y = (m.y0 ?? 0) + ((m.y1 ?? 0) - (m.y0 ?? 0)) * p;
  const sh = shot.shake ? interpolate(fr, [0, 12], [shot.shake, 0], cl) : 0;
  const sx = sh ? Math.sin(fr * 2.7) * sh : 0, sy = sh ? Math.cos(fr * 3.1) * sh : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <AbsoluteFill style={{transform: `translate(${x + sx}%, ${y}%) translateY(${sy}px) scale(${z})`, transformOrigin: `${m.ox ?? 50}% ${m.oy ?? 50}%`}}>
        <Img src={staticFile(`itt/s01_${shot.id}.jpg`)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        {shot.children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Clip: React.FC<{shot: Shot}> = ({shot}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <OffthreadVideo src={staticFile(`itt/${shot.clip!.src}`)} startFrom={f(shot.clip!.from)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  </AbsoluteFill>
);

// "MAYBE" written on the weatherman's blank card (positioned in % of the image)
const Maybe: React.FC = () => {
  const fr = useCurrentFrame();
  const pop = interpolate(fr, [f(1.9), f(2.15)], [0, 1], {...cl, easing: Easing.out(Easing.back(2))});
  return (
    <div style={{position: 'absolute', left: '56.5%', top: '53%', width: '20.5%', height: '25%', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${pop})`, opacity: pop}}>
      <div style={{fontFamily: "'Roboto Black', 'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 104, color: '#1b1b1b', letterSpacing: 2, transform: 'rotate(-3deg)'}}>MAYBE</div>
    </div>
  );
};

// big word captions: chunks of up to 3 words, break on punctuation
type W = {w: string; s: number; e: number};
const fix = (w: string) => w.replace(/gray/gi, (m) => (m[0] === 'G' ? 'Grey' : 'grey')).replace(/grayest/gi, 'greyest');
const chunks: {words: W[]; s: number; e: number}[] = (() => {
  const out: {words: W[]; s: number; e: number}[] = []; let cur: W[] = [];
  (WORDS as W[]).forEach((w, i) => {
    cur.push({...w, w: fix(w.w)});
    const punct = /[.,!?]$/.test(w.w);
    if (punct || cur.length >= 3 || i === WORDS.length - 1) { out.push({words: cur, s: cur[0].s, e: cur[cur.length - 1].e}); cur = []; }
  });
  out.forEach((c, i) => { const nxt = out[i + 1]; c.e = nxt ? Math.min(nxt.s, c.e + 0.6) : c.e + 1.2; });
  return out;
})();

const Captions: React.FC = () => {
  const fr = useCurrentFrame(); const t = fr / FPS;
  const c = chunks.find((k) => t >= k.s - 0.03 && t < k.e);
  if (!c) return null;
  const k = interpolate(t, [c.s - 0.03, c.s + 0.1], [0.85, 1], {...cl, easing: Easing.out(Easing.back(1.6))});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 92}}>
      <div style={{display: 'flex', gap: 26, transform: `scale(${k})`, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 118, lineHeight: 1, textTransform: 'uppercase', letterSpacing: 1}}>
        {c.words.map((w, i) => {
          const on = t >= w.s - 0.03;
          return <span key={i} style={{color: on ? (t < w.e + 0.05 ? '#FFD54A' : '#FFFFFF') : 'rgba(255,255,255,0.55)', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', textShadow: '0 8px 24px rgba(0,0,0,0.7)'}}>{w.w.replace(/[.,!?]+$/, '')}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};

const Flash: React.FC<{at: number; dur?: number; color?: string}> = ({at, dur = 0.35, color = 'white'}) => {
  const fr = useCurrentFrame();
  const o = interpolate(fr, [f(at), f(at) + 2, f(at + dur)], [0, 0.85, 0], cl);
  return <AbsoluteFill style={{background: color, opacity: o, pointerEvents: 'none'}} />;
};

const Sfx: React.FC<{src: string; at: number; vol?: number; dur?: number}> = ({src, at, vol = 0.025, dur}) => (
  <Sequence from={f(at)} durationInFrames={dur ? f(dur) : undefined}><Audio src={staticFile(`itt/${src}`)} volume={vol} /></Sequence>
);

export const Story01: React.FC = () => {
  const fr = useCurrentFrame();
  const fadeOut = interpolate(fr, [f(STORY01_LEN - 1.0), f(STORY01_LEN)], [0, 1], cl);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {SHOTS.map((s) => (
        <Sequence key={s.id} from={f(s.t0)} durationInFrames={f(s.t1) - f(s.t0)}>
          {s.clip ? <Clip shot={s} /> : <Still shot={{...s, children: s.id === '04' ? <Maybe /> : undefined}} />}
          {s.snow && <Snow seed={s.id} />}
        </Sequence>
      ))}
      <AbsoluteFill style={{boxShadow: 'inset 0 0 220px rgba(0,0,0,0.55)', pointerEvents: 'none'}} />
      <Flash at={69.16} />
      <Captions />
      <AbsoluteFill style={{background: '#000', opacity: fadeOut}} />
      {/* audio */}
      <Audio src={staticFile('itt/voice01.mp3')} volume={1} />
      <Sfx src="sub_impact.wav" at={9.5} />
      <Sfx src="whoosh_real.wav" at={19.0} />
      <Sfx src="wind.wav" at={36.2} dur={4.6} vol={0.02} />
      <Sfx src="wind.wav" at={46.56} dur={3.3} vol={0.02} />
      <Sfx src="crackle.wav" at={54.1} dur={4.3} />
      <Sfx src="sub_impact.wav" at={55.0} />
      <Sfx src="whoosh_real.wav" at={61.0} />
      <Sfx src="wind.wav" at={61.1} dur={8.0} vol={0.02} />
      <Sfx src="riser.wav" at={66.0} dur={3.2} />
      <Sfx src="sub_impact.wav" at={69.16} />
      <Sfx src="crackle.wav" at={69.2} dur={3.0} />
      <Sfx src="pop.wav" at={84.9} />
    </AbsoluteFill>
  );
};
