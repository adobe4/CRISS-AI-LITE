// "Drive or Tow" design system: night instrument cluster + x-ray garage. All text is big (labels >= 72px).
import React from 'react';
import {AbsoluteFill, Img, interpolate, Easing, staticFile, useCurrentFrame} from 'remotion';

export const K = {glass: '#07080A', panel: '#0E1014', line: 'rgba(232,236,239,0.14)', white: '#E8ECEF', dim: 'rgba(232,236,239,0.55)',
  amber: '#FFA31A', red: '#FF3B30', green: '#34C759'};
export const DISPLAY = "'Barlow Condensed', 'Arial Narrow', sans-serif";
export const BODY = 'Inter, sans-serif';
const FPS = 30;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
const useT = () => useCurrentFrame() / FPS;

/** ISO-style check-engine glyph. */
const EngineGlyph: React.FC<{size: number; color: string; glow: number}> = ({size, color, glow}) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 100 70" style={{filter: `drop-shadow(0 0 ${18 * glow}px ${color}) drop-shadow(0 0 ${6 * glow}px ${color})`, opacity: 0.25 + 0.75 * glow}}>
    <path d="M18 22 h10 v-8 h22 v8 h12 l8 8 h8 v-6 h8 v26 h-8 v-6 h-8 l-8 10 h-34 l-6 -8 h-8 v8 h-6 v-26 h6 v8 h4 z" fill="none" stroke={color} strokeWidth={6} strokeLinejoin="round" />
    <path d="M34 14 v-6 h18 v6" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" />
  </svg>
);

const Gauge: React.FC<{cx: number; cy: number; r: number; value: number; max: number; label: string; ticks: number}> = ({cx, cy, r, value, max, label, ticks}) => {
  const a0 = -225, a1 = 45; const ang = (v: number) => ((a0 + (a1 - a0) * (v / max)) * Math.PI) / 180;
  const na = ang(value);
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={K.panel} stroke={K.line} strokeWidth={3} />
      {Array.from({length: ticks + 1}).map((_, i) => { const a = ang((i / ticks) * max); const big = i % 2 === 0;
        return <line key={i} x1={cx + Math.cos(a) * (r - 18)} y1={cy + Math.sin(a) * (r - 18)} x2={cx + Math.cos(a) * (r - (big ? 52 : 36))} y2={cy + Math.sin(a) * (r - (big ? 52 : 36))} stroke={K.white} strokeOpacity={big ? 0.9 : 0.45} strokeWidth={big ? 6 : 3} />; })}
      {Array.from({length: ticks / 2 + 1}).map((_, i) => { const v = (i * 2 / ticks) * max; const a = ang(v);
        return <text key={'t' + i} x={cx + Math.cos(a) * (r - 92)} y={cy + Math.sin(a) * (r - 92) + 16} textAnchor="middle" fontFamily={DISPLAY} fontWeight={600} fontSize={44} fill={K.white} fillOpacity={0.8}>{Math.round(v)}</text>; })}
      <line x1={cx} y1={cy} x2={cx + Math.cos(na) * (r - 40)} y2={cy + Math.sin(na) * (r - 40)} stroke={K.red} strokeWidth={9} strokeLinecap="round" style={{filter: `drop-shadow(0 0 8px ${K.red})`}} />
      <circle cx={cx} cy={cy} r={22} fill={K.glass} stroke={K.white} strokeOpacity={0.4} strokeWidth={3} />
      <text x={cx} y={cy + r * 0.52} textAnchor="middle" fontFamily={DISPLAY} fontWeight={600} fontSize={40} letterSpacing={6} fill={K.dim}>{label}</text>
    </g>
  );
};

/** Opening shot: the cluster at night, the check-engine lamp starts flashing. */
export const Cluster: React.FC<{flashFrom?: number; rpmShake?: boolean}> = ({flashFrom = 1.2, rpmShake = true}) => {
  const t = useT();
  const on = t < flashFrom ? 0 : (Math.floor((t - flashFrom) * 2.2) % 2 === 0 ? 1 : 0.08);
  const rpm = 2.1 + (rpmShake && t > flashFrom ? Math.sin(t * 23) * 0.18 + Math.sin(t * 7.3) * 0.12 : 0);
  const push = interpolate(t, [0, 6], [1.0, 1.08], {...cl, easing: ease});
  return (
    <AbsoluteFill style={{background: K.glass, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${push})`}}>
        <svg width={1920} height={1080} viewBox="0 0 1920 1080">
          <defs><radialGradient id="vig" cx="50%" cy="55%" r="65%"><stop offset="60%" stopColor="#000" stopOpacity={0} /><stop offset="100%" stopColor="#000" stopOpacity={0.85} /></radialGradient></defs>
          <Gauge cx={470} cy={560} r={330} value={38 + Math.sin(t * 0.8) * 2} max={140} label="MPH" ticks={14} />
          <Gauge cx={1450} cy={560} r={330} value={rpm} max={8} label="RPM ×1000" ticks={8} />
          <rect x={0} y={0} width={1920} height={1080} fill="url(#vig)" />
        </svg>
        <div style={{position: 'absolute', left: 960 - 160, top: 300, width: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 60}}>
          <EngineGlyph size={240} color={K.amber} glow={on} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: K.amber, opacity: on * 0.05, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};

/** The signature verdict: DRIVE / CAREFUL / TOW. */
export const Verdict: React.FC<{active: 'drive' | 'careful' | 'tow'; line: React.ReactNode; at?: number}> = ({active, line, at = 0.2}) => {
  const t = useT();
  const items = [{k: 'drive', label: 'DRIVE', c: K.green}, {k: 'careful', label: 'CAREFUL', c: K.amber}, {k: 'tow', label: 'TOW', c: K.red}] as const;
  return (
    <AbsoluteFill style={{background: K.glass, alignItems: 'center', justifyContent: 'center', gap: 70}}>
      <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, letterSpacing: 10, color: K.dim}}>THE VERDICT</div>
      <div style={{display: 'flex', gap: 48}}>
        {items.map((it, i) => {
          const lit = it.k === active; const p = interpolate(t, [at + 0.25 * i, at + 0.25 * i + 0.3], [0, 1], {...cl, easing: ease});
          const glow = lit ? interpolate(t, [at + 1.0, at + 1.3], [0, 1], cl) : 0;
          return (
            <div key={it.k} style={{width: 480, height: 300, borderRadius: 28, border: `5px solid ${lit ? it.c : K.line}`, background: lit ? `${it.c}22` : K.panel,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, opacity: p * (lit ? 1 : 0.45), transform: `translateY(${(1 - p) * 30}px)`,
              boxShadow: lit ? `0 0 ${80 * glow}px ${it.c}88` : 'none'}}>
              <div style={{width: 64, height: 64, borderRadius: 32, background: it.c, opacity: lit ? 0.4 + 0.6 * glow : 0.25, boxShadow: lit ? `0 0 ${40 * glow}px ${it.c}` : 'none'}} />
              <div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 120, lineHeight: 1, color: lit ? K.white : K.dim}}>{it.label}</div>
            </div>
          );
        })}
      </div>
      <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 92, color: K.white, textAlign: 'center', lineHeight: 1.05, maxWidth: 1600, opacity: interpolate(t, [at + 1.3, at + 1.7], [0, 1], cl)}}>{line}</div>
    </AbsoluteFill>
  );
};

/** The repair bill, cheapest first. Bars on a log scale so $0 and $3,500 both read. */
export type BillRow = {what: string; lo: number; hi: number; note?: string};
export const Bill: React.FC<{rows: BillRow[]; highlight?: number; at?: number}> = ({rows, highlight = -1, at = 0.2}) => {
  const t = useT();
  const sc = (v: number) => Math.log10(Math.max(1, v) + 1) / Math.log10(4000);
  return (
    <AbsoluteFill style={{background: K.glass, paddingLeft: 140, paddingRight: 140, justifyContent: 'center', gap: 34}}>
      <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, letterSpacing: 10, color: K.dim}}>THE BILL · CHEAPEST FIRST</div>
      {rows.map((r, i) => {
        const p = interpolate(t, [at + i * 0.35, at + i * 0.35 + 0.6], [0, 1], {...cl, easing: ease});
        const hot = i === rows.length - 1; const col = hot ? K.red : i === highlight ? K.amber : K.white;
        return (
          <div key={i} style={{display: 'grid', gridTemplateColumns: '700px 1fr 520px', alignItems: 'center', gap: 40, opacity: p}}>
            <div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, color: col, lineHeight: 1}}>{i + 1}. {r.what}</div>
            <div style={{position: 'relative', height: 40}}>
              <div style={{position: 'absolute', left: 0, top: 2, height: 36, width: `${p * sc(r.hi) * 100}%`, background: `${col}33`, borderRadius: 6}} />
              <div style={{position: 'absolute', left: `${p * sc(r.lo) * 100}%`, top: 2, height: 36, width: `${p * Math.max(0.015, sc(r.hi) - sc(r.lo)) * 100}%`, background: col, borderRadius: 6, boxShadow: hot ? `0 0 24px ${K.red}` : 'none'}} />
            </div>
            <div style={{textAlign: 'right', fontFamily: DISPLAY, fontWeight: 800, fontSize: 84, lineHeight: 1, color: col, fontVariantNumeric: 'tabular-nums'}}>${r.lo.toLocaleString()}–${r.hi.toLocaleString()}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** X-ray plate with a slow push and a pulsing hot spot (x,y in output px). */
export const XRay: React.FC<{src: string; dur: number; hot?: {x: number; y: number; r: number; color?: string}[]; z0?: number; z1?: number; fx?: number; fy?: number}> = ({src, dur, hot = [], z0 = 1.0, z1 = 1.1, fx = 50, fy = 50}) => {
  const t = useT(); const z = interpolate(t, [0, dur], [z0, z1], {...cl, easing: Easing.bezier(0.45, 0, 0.25, 1)});
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: `${fx}% ${fy}%`}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        {hot.map((h, i) => <div key={i} style={{position: 'absolute', left: h.x - h.r, top: h.y - h.r, width: h.r * 2, height: h.r * 2, borderRadius: '50%',
          background: `radial-gradient(circle, ${h.color ?? K.red}aa 0%, ${h.color ?? K.red}00 70%)`, opacity: 0.55 + 0.45 * Math.sin(t * 5 + i), mixBlendMode: 'screen'}} />)}
      </AbsoluteFill>
      <AbsoluteFill style={{boxShadow: 'inset 0 0 260px rgba(0,0,0,0.85)'}} />
    </AbsoluteFill>
  );
};
