import React from 'react';
import {AbsoluteFill, Img, Sequence, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {Camera, Cutout, DrawSvg, Stroke, scribblePath, Slam, Flash, Shake, Sfx, Win, WText, Pop, Footages, f, INK, PAPER, useT, fontFamily} from './kit';
import microscope from './svg_microscope.json';
import spine from './svg_spine.json';
import bodyNerves from './svg_body_nerves.json';
import engine from './svg_engine.json';
import mirror from './svg_mirror.json';
import fibreSingle from './svg_fibre_single.json';
import gear from './svg_gear.json';
import stopwatch from './svg_stopwatch.json';

const C = (i: number) => i * 2400; // scene base x
const FL = 930;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// scene start times (camera pans here)
const START = [45.2, 57.3, 69.0, 79.1, 93.2, 110.2, 126.5, 141.5, 163.1, 182.3, 206.6, 226.4, 245.7, 277.8, 311.0, 334.1, 345.3, 359.8, 377.0, 399.4];
const END = (i: number) => (i + 1 < START.length ? START[i + 1] + 0.6 : 408);

// ---------------- custom animated pieces ----------------
const PaperWipe: React.FC<{at: number}> = ({at}) => {
  const t = useT();
  if (t < at || t > at + 0.7) return null;
  const p = interpolate(t, [at, at + 0.6], [0, 1], cl);
  const x = 2000 - p * 2400;
  let pts = '';
  for (let i = 0; i <= 40; i++) pts += `${(random('tear' + i + at) * 60).toFixed(0)}px ${(i * 27).toFixed(0)}px, `;
  return (
    <AbsoluteFill style={{transform: `translateX(${x}px) rotate(${(1 - p) * 4}deg)`}}>
      <div style={{position: 'absolute', left: 0, top: -40, width: 3000, height: 1160, clipPath: `polygon(${pts} 3000px 1080px, 3000px 0px)`, filter: 'drop-shadow(-12px 0 18px rgba(0,0,0,0.45))'}}>
        <Img src={staticFile('cut/paper.jpg')} style={{width: 3000, height: 1160, objectFit: 'cover'}} />
      </div>
    </AbsoluteFill>
  );
};

const Balance: React.FC<{x: number; at: number; tiltAt: number}> = ({x, at, tiltAt}) => {
  const t = useT();
  if (t < at) return null;
  const p = interpolate(t, [at, at + 0.9], [0, 1], cl);
  const tilt = interpolate(t, [tiltAt, tiltAt + 0.6], [0, 9], {...cl});
  const wob = t > tiltAt ? Math.sin((t - tiltAt) * 9) * Math.exp(-(t - tiltAt) * 3) * 4 : 0;
  const L = 2000;
  return (
    <svg style={{position: 'absolute', left: x - 500, top: 260, overflow: 'visible'}} width={1000} height={700}>
      <g strokeDasharray={L} strokeDashoffset={L * (1 - p)} fill="none" stroke={INK} strokeLinecap="round" strokeLinejoin="round">
        <path d="M 500 120 L 500 660 M 380 660 L 620 660 M 430 660 L 500 600 L 570 660" strokeWidth={10} />
        <circle cx={500} cy={110} r={18} strokeWidth={8} />
        <g transform={`rotate(${tilt + wob} 500 120)`}>
          <path d="M 120 120 L 880 120" strokeWidth={12} />
          <path d="M 120 120 L 50 330 M 120 120 L 190 330 M 880 120 L 810 330 M 880 120 L 950 330" strokeWidth={4} />
          <path d="M 30 330 Q 120 400 210 330 Z M 790 330 Q 880 400 970 330 Z" strokeWidth={8} />
        </g>
      </g>
    </svg>
  );
};
// where the pans hang (follows the tilt)
const panY = (t: number, tiltAt: number, side: -1 | 1) => {
  const tilt = interpolate(t, [tiltAt, tiltAt + 0.6], [0, 9], cl);
  return Math.sin((tilt * Math.PI) / 180) * 380 * side;
};
const OnPan: React.FC<{src: string; at: number; x: number; side: -1 | 1; tiltAt: number; h: number}> = ({src, at, x, side, tiltAt, h}) => {
  const t = useT();
  return <Pop src={src} at={at} x={x} y={260 + 360 + panY(t, tiltAt, side)} h={h} drop />;
};

const Gears: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const t = useT();
  if (t < at) return null;
  const a = (t - at) * 40;
  const g = (cx: number, cy: number, s: number, dir: number, d: number) => (
    <Img src={staticFile('cut/gear.png')} style={{position: 'absolute', left: cx - s / 2, top: cy - s / 2, width: s, height: s,
      transform: `rotate(${dir * a + d}deg) scale(${interpolate(t, [at, at + 0.4], [0.2, 1], cl)})`}} />
  );
  return <>{g(x, y, 460, 1, 0)}{g(x + 395, y - 170, 330, -1.39, 12)}{g(x + 330, y + 270, 280, -1.64, 5)}</>;
};

const Workers: React.FC<{x: number; y: number; at: number; partial: number; sync: number; brainAt: number}> = ({x, y, at, partial, sync, brainAt}) => {
  const t = useT();
  if (t < at) return null;
  const N = 6;
  const p = interpolate(t, [at, at + 0.6], [0, 1], cl);
  const all = t >= brainAt + 1.3;
  const inSync = t >= sync;
  const rope = (inSync ? Math.sin(t * 5) * 18 : 0);
  return (
    <>
      <svg style={{position: 'absolute', left: x - 200, top: y - 300, overflow: 'visible'}} width={10} height={10}>
        <path d={`M 0 0 L ${N * 230 + 300} 0`} stroke={INK} strokeWidth={10} strokeDasharray={2000} strokeDashoffset={2000 * (1 - p)} transform={`translate(${rope} 0)`} />
      </svg>
      {Array.from({length: N}).map((_, i) => {
        if (t < at + 0.3 + i * 0.12) return null;
        const active = all || i < 2;
        const phase = inSync ? 0 : random('ph' + i) * 6;
        const pull = active && t > partial ? Math.sin(t * 5 + phase) * 22 : 0;
        return (
          <Img key={i} src={staticFile('cut/worker_pull.png')} style={{position: 'absolute', height: 380, left: x + i * 230 + pull + rope, top: y,
            transform: `translate(-50%, -100%) rotate(${active ? -4 : 6}deg)`, opacity: active ? 1 : 0.35, transformOrigin: '50% 100%'}} />
        );
      })}
    </>
  );
};

const Chart: React.FC<{x: number; y: number; at: number; c1: number; c2: number; band: number}> = ({x, y, at, c1, c2, band}) => {
  const t = useT();
  if (t < at) return null;
  const d = (a: number, b: number) => interpolate(t, [a, b], [0, 1], cl);
  const ax = 'M 0 0 L 0 520 L 900 520';
  const nerve = 'M 0 520 C 120 300, 220 210, 420 190 S 800 170, 900 165';
  const musc = 'M 0 520 C 300 515, 380 470, 520 360 S 780 180, 900 120';
  const L = 1400;
  return (
    <svg style={{position: 'absolute', left: x, top: y, overflow: 'visible'}} width={10} height={10}>
      <path d={ax} fill="none" stroke={INK} strokeWidth={8} strokeDasharray={L} strokeDashoffset={L * (1 - d(at, at + 0.7))} />
      <path d={nerve} fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - d(c1, c1 + 1.2))} />
      <path d={musc} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" strokeDasharray="18 14" opacity={d(c2, c2 + 0.2)} style={{clipPath: `inset(0 ${(1 - d(c2, c2 + 1.2)) * 100}% 0 0)`}} />
      <rect x={0} y={0} width={330} height={520} fill={INK} opacity={0.08 * d(band, band + 0.4)} />
      <path d="M 330 0 L 330 520" stroke={INK} strokeWidth={4} strokeDasharray="10 10" opacity={d(band, band + 0.3)} />
    </svg>
  );
};

const Gauge: React.FC<{x: number; y: number; at: number; val: number; swingAt: number}> = ({x, y, at, val, swingAt}) => {
  const t = useT();
  if (t < at) return null;
  const s = interpolate(t, [at, at + 0.3], [0.3, 1], cl);
  const v = interpolate(t, [swingAt, swingAt + 1.0], [0, val], cl) + (t > swingAt ? Math.sin((t - swingAt) * 12) * 3 * Math.exp(-(t - swingAt) * 2) : 0);
  const ang = -90 + v * 180;
  return (
    <svg style={{position: 'absolute', left: x - 130, top: y - 130, overflow: 'visible', transform: `scale(${s})`}} width={260} height={160}>
      <path d="M 10 130 A 120 120 0 0 1 250 130" fill={PAPER} stroke={INK} strokeWidth={8} />
      {Array.from({length: 9}).map((_, i) => { const a = Math.PI - (i / 8) * Math.PI; return <line key={i} x1={130 + Math.cos(a) * 100} y1={130 - Math.sin(a) * 100} x2={130 + Math.cos(a) * 118} y2={130 - Math.sin(a) * 118} stroke={INK} strokeWidth={5} />; })}
      <line x1={130} y1={130} x2={130} y2={30} stroke={INK} strokeWidth={8} strokeLinecap="round" transform={`rotate(${ang} 130 130)`} />
      <circle cx={130} cy={130} r={12} fill={INK} />
    </svg>
  );
};

const Cubes: React.FC<{x: number; y: number; at: number; growAt: number}> = ({x, y, at, growAt}) => {
  const t = useT();
  if (t < at) return null;
  const p = interpolate(t, [at, at + 0.8], [0, 1], cl);
  const g = interpolate(t, [growAt, growAt + 1.2], [1, 1.55], cl);
  const cube = (cx: number, s: number, dash: number) => {
    const o = s * 0.35;
    const d = `M ${cx} ${y} l ${s} 0 l 0 ${-s} l ${-s} 0 Z M ${cx} ${y - s} l ${o} ${-o} l ${s} 0 l ${-o} ${o} M ${cx + s} ${y} l ${o} ${-o} l 0 ${-s}`;
    return <path d={d} fill="none" stroke={INK} strokeWidth={9} strokeLinejoin="round" strokeDasharray={dash} strokeDashoffset={dash * (1 - p)} />;
  };
  return (
    <svg style={{position: 'absolute', left: x, top: 0, overflow: 'visible'}} width={10} height={10}>
      {cube(0, 160, 2000)}
      <g transform={`translate(560 ${y}) scale(${g}) translate(-560 ${-y})`}>{cube(560, 160, 2000)}</g>
    </svg>
  );
};

const DriftWords: React.FC<{x: number; y: number; at: number; apart: number; together: number}> = ({x, y, at, apart, together}) => {
  const t = useT();
  if (t < at || t > together + 2.2) return null;
  const sep = interpolate(t, [apart, apart + 0.9], [0, 220], cl) - interpolate(t, [together, together + 0.35], [0, 220], cl);
  const o = interpolate(t, [at, at + 0.2], [0, 1], cl);
  const shake = t > together && t < together + 0.4 ? Math.sin(t * 80) * 6 : 0;
  const st = (dx: number, rot: number): React.CSSProperties => ({position: 'absolute', left: x + dx + shake, top: y, transform: `translate(-50%,-50%)`, fontFamily, fontWeight: 900, fontSize: 130, color: INK, opacity: o, whiteSpace: 'nowrap', textShadow: `0 0 18px ${PAPER}`});
  return (<><div style={st(-300 - sep, 0)}>SIZE</div><div style={st(260 + sep, 0)}>STRENGTH</div></>);
};

const Sand: React.FC<{x: number; y: number; at: number; dur: number}> = ({x, y, at, dur}) => {
  const t = useT();
  if (t < at || t > at + dur + 0.6) return null;
  return (
    <svg style={{position: 'absolute', left: x, top: y, overflow: 'visible'}} width={10} height={10}>
      {Array.from({length: 70}).map((_, i) => {
        const st = at + random('s' + i) * dur;
        const k = (t - st) / 0.6;
        if (k < 0 || k > 1) return null;
        return <circle key={i} cx={(random('x' + i) - 0.5) * 50} cy={k * 300} r={4 + random('r' + i) * 4} fill={INK} />;
      })}
    </svg>
  );
};

const Tally: React.FC<{x: number; y: number; times: number[]}> = ({x, y, times}) => (
  <>{times.map((tt, i) => { const g = Math.floor(i / 5) * 300, k = i % 5;
    const d = k === 4 ? `M ${g - 25} 130 L ${g + 3 * 46 + 25} 20` : `M ${g + k * 46} 0 L ${g + k * 46 + 6} 150`;
    return <Stroke key={i} d={d} x={x} y={y} start={tt} end={tt + 0.18} w={12} />; })}</>
);

const Hand: React.FC<{cx: number; cy: number; r: number; start: number; stop: number}> = ({cx, cy, r, start, stop}) => {
  const t = useT();
  if (t < start) return null;
  const ang = (Math.min(t, stop) - start) * 300;
  return (
    <svg style={{position: 'absolute', left: cx - r, top: cy - r, overflow: 'visible'}} width={r * 2} height={r * 2}>
      <line x1={r} y1={r} x2={r} y2={r * 0.12} stroke={INK} strokeWidth={9} strokeLinecap="round" transform={`rotate(${ang} ${r} ${r})`} />
      <circle cx={r} cy={r} r={14} fill={INK} />
    </svg>
  );
};

const Jitter: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
  const fr = useCurrentFrame();
  const on = fr / 30 > at;
  const x = on ? (random('jx' + fr) - 0.5) * 6 : 0, y = on ? (random('jy' + fr) - 0.5) * 6 : 0;
  return <div style={{position: 'absolute', left: 0, top: 0, transform: `translate(${x}px, ${y}px)`}}>{children}</div>;
};

// ---------------- the world ----------------
const World: React.FC = () => {
  const keys = START.map((s, i) => ({t: s + 0.4, x: C(i) + 960, y: 540, z: 1}));
  // a few extra camera moves
  keys.splice(5, 0, {t: 101.6, x: C(4) + 960, y: 540, z: 1}, {t: 105.0, x: C(4) + 1450, y: 540, z: 1});
  keys.sort((a, b) => a.t - b.t);
  return (
    <Camera keys={[{t: 0, x: 960, y: 540, z: 1}, ...keys]}>
      {/* 0 · two kinds of strong */}
      <Win from={45} to={END(0)}>
        <WText lines={['THE IDEA']} at={45.5} out={47.8} x={C(0) + 960} y={480} size={190} />
        <Balance x={C(0) + 960} at={47.9} tiltAt={52.9} />
        <OnPan src="balloon_arm" at={50.7} x={C(0) + 960 - 380} side={-1} tiltAt={52.9} h={230} />
        <OnPan src="spring" at={52.4} x={C(0) + 960 + 380} side={1} tiltAt={52.9} h={190} />
        <WText lines={['SIZE']} at={51.0} out={57.2} x={C(0) + 560} y={180} size={150} />
        <WText lines={['FORCE']} at={52.9} out={57.2} x={C(0) + 1360} y={180} size={150} />
        <WText lines={['≠']} at={55.7} out={57.2} x={C(0) + 960} y={170} size={220} />
      </Win>
      {/* 1 · the bodybuilder */}
      <Win from={56.5} to={END(1)}>
        <Cutout src="bb_stand" h={780} keys={[{t: 57.4, x: C(1) + 2500, y: FL, r: 8}, {t: 58.0, x: C(1) + 700, y: FL, r: 0}, {t: 62.2, x: C(1) + 700, y: FL, s: 1}, {t: 62.8, x: C(1) + 700, y: FL, s: 1.08}, {t: 64.9, x: C(1) + 700, y: FL, s: 1.22}]} />
        <Tally x={C(1) + 1150} y={300} times={[59.4, 59.55, 59.7, 59.85, 60.0, 60.2, 60.35, 60.5, 60.65, 60.8]} />
        <WText lines={['SETS']} at={59.4} out={61.5} x={C(1) + 1450} y={560} size={130} />
        <WText lines={['PUMP']} at={62.2} out={64.0} x={C(1) + 1450} y={720} size={170} />
        <Pop src="trophy" at={65.8} x={C(1) + 1400} y={FL} h={520} drop />
      </Win>
      {/* 2 · the soldier's job */}
      <Win from={68.5} to={END(2)}>
        <Cutout src="soldier_crate" h={520} keys={[{t: 70.5, x: C(2) + 360, y: FL + 10}, {t: 70.7, x: C(2) + 360, y: FL}, {t: 71.4, x: C(2) + 360, y: FL - 30}]} />
        <WText lines={['LIFT']} at={70.7} out={73.9} x={C(2) + 360} y={260} size={140} />
        <Cutout src="soldier_walk" h={560} walk={2} keys={[{t: 71.6, x: C(2) + 700, y: FL}, {t: 73.4, x: C(2) + 1050, y: FL}, {t: 74.6, x: C(2) + 2700, y: FL}]} />
        <WText lines={['CARRY']} at={71.7} out={73.9} x={C(2) + 900} y={200} size={140} />
        <Cutout src="soldier_drag" h={420} keys={[{t: 72.9, x: C(2) + 1800, y: FL}, {t: 74.2, x: C(2) + 1560, y: FL}]} />
        <WText lines={['DRAG']} at={73.0} out={74.3} x={C(2) + 1550} y={330} size={140} />
        <Pop src="scorecards" at={74.6} x={C(2) + 960} y={700} h={420} out={77.6} />
        <Stroke d={scribblePath(520, 380, 7, 'sc')} x={C(2) + 700} y={300} start={75.5} end={75.9} w={18} out={77.6} />
        <Pop src="crate" at={77.7} x={C(2) + 960} y={FL - 60} h={300} bob={6} />
        <Stroke d="M 0 0 L 0 -200 M -40 -150 L 0 -200 L 40 -150" x={C(2) + 960} y={560} start={78.0} end={78.4} w={12} />
        <WText lines={['DID IT MOVE?']} at={77.8} out={79.4} x={C(2) + 960} y={190} size={150} />
      </Win>
      {/* 3 · the body is practical */}
      <Win from={78.5} to={END(3)}>
        <Win from={79} to={84.4}><Gears x={C(3) + 520} y={480} at={79.4} /></Win>
        <WText lines={['BRUTALLY', 'PRACTICAL']} at={80.2} out={84.2} x={C(3) + 1450} y={430} size={120} />
        <Cutout src="balloon_arm" h={260} keys={[{t: 84.5, x: C(3) + 600, y: FL - 50, s: 0.6}, {t: 86.0, x: C(3) + 600, y: FL - 50, s: 1.5}]} />
        <WText lines={['SIZE']} at={84.7} out={86.8} x={C(3) + 600} y={330} size={150} />
        <Cutout src="stone_carry" h={600} walk={1.6} keys={[{t: 86.9, x: C(3) + 1000, y: FL}, {t: 92.5, x: C(3) + 1700, y: FL}]} />
        <WText lines={['SOMETHING', 'DIFFERENT']} at={89.6} out={92.9} x={C(3) + 1250} y={230} size={120} />
      </Win>
      {/* 4 · Rook, day one */}
      <Win from={92.6} to={END(4)}>
        <Cutout src="rook_stand" h={700} breathe keys={[{t: 93.6, x: C(4) - 300, y: FL, r: -8}, {t: 94.3, x: C(4) + 700, y: FL}, {t: 99.0, x: C(4) + 700, y: FL, o: 1}, {t: 99.3, x: C(4) + 700, y: FL, o: 0}]} />
        <WText lines={['68 KG']} at={96.1} out={98.5} x={C(4) + 1200} y={420} size={170} />
        <Pop src="rice_bag" at={98.6} x={C(4) + 1150} y={FL} h={260} out={99.3} />
        <Sand x={C(4) + 700} y={160} at={99.6} dur={1.3} />
        <Cutout src="rook_backpack" h={700} walk={2} keys={[{t: 99.2, x: C(4) + 700, y: FL}, {t: 101.7, x: C(4) + 700, y: FL}, {t: 104.0, x: C(4) + 1350, y: FL, o: 1}, {t: 104.2, x: C(4) + 1380, y: FL, o: 0}]} />
        <WText lines={['10 KG']} at={99.8} out={101.6} x={C(4) + 1250} y={380} size={170} />
        <WText lines={['WEEK 1']} at={102.6} out={104.0} x={C(4) + 1300} y={110} size={150} />
        <Cutout src="rook_tired" h={700} walk={1.1} keys={[{t: 104.1, x: C(4) + 1380, y: FL}, {t: 109.8, x: C(4) + 1700, y: FL}]} />
        <WText lines={['SORE']} at={104.3} out={105.5} x={C(4) + 2050} y={330} size={150} />
        <WText lines={['SLOW']} at={105.6} out={106.6} x={C(4) + 2050} y={330} size={150} />
        <DrawSvg data={bodyNerves} cx={C(4) + 2100} cy={540} h={700} start={106.4} end={108.3} fillAt={108.4} raster="body_nerves" />
      </Win>
      {/* 5 · the 1979 study */}
      <Win from={109.6} to={END(5)}>
        <WText lines={['1979']} at={110.4} out={113.2} x={C(5) + 600} y={200} size={200} />
        <DrawSvg data={microscope} cx={C(5) + 560} cy={620} h={560} start={110.5} end={111.8} fillAt={111.9} raster="microscope" out={117.6} />
        <WText lines={['8 WEEKS']} at={117.0} out={119.6} x={C(5) + 1450} y={200} size={170} />
        <Chart x={C(5) + 900} y={340} at={118.0} c1={119.0} c2={124.6} band={120.7} />
        <WText lines={['WEEKS 3–5']} at={121.3} out={123.5} x={C(5) + 1065} y={290} size={90} />
        <WText lines={['NERVES']} at={123.6} out={126.4} x={C(5) + 1500} y={470} size={110} />
        <WText lines={['MUSCLE']} at={125.0} out={126.4} x={C(5) + 1650} y={790} size={90} />
      </Win>
      {/* 6 · team of workers */}
      <Win from={125.9} to={END(6)}>
        <Workers x={C(6) + 560} y={760} at={127.6} partial={129.3} sync={137.3} brainAt={134.2} />
        <Pop src="brain_foreman" at={134.3} x={C(6) + 230} y={760} h={360} bob={6} />
        <WText lines={['SAME TEAM.']} at={139.2} out={141.4} x={C(6) + 960} y={190} size={150} />
        <WText lines={['BETTER BOSS.']} at={140.2} out={141.4} x={C(6) + 960} y={340} size={150} />
      </Win>
      {/* 7 · week 3 and week 8 */}
      <Win from={140.9} to={END(7)}>
        <WText lines={['WEEK 3']} at={141.7} out={145.3} x={C(7) + 960} y={190} size={170} />
        <Cutout src="rook_backpack" h={640} walk={3.2} keys={[{t: 141.8, x: C(7) - 200, y: FL}, {t: 144.6, x: C(7) + 560, y: FL}, {t: 149.6, x: C(7) + 560, y: FL, o: 1}, {t: 149.8, x: C(7) + 560, y: FL, o: 0}]} />
        <DrawSvg data={mirror} cx={C(7) + 1020} cy={560} h={700} start={145.4} end={146.4} fillAt={146.4} raster="mirror" out={159.4} />
        <WText lines={['STRONGER', 'ANYWAY.']} at={147.8} out={149.7} x={C(7) + 1560} y={330} size={115} />
        <WText lines={['WEEK 8']} at={149.9} out={153.4} x={C(7) + 960} y={190} size={170} />
        <DrawSvg data={fibreSingle} cx={C(7) + 560} cy={620} h={360} start={151.1} end={152.6} fillAt={152.7} raster="fibre_single" out={159.4} />
        <Stroke d={scribblePath(520, 640, 7, 'mir')} x={C(7) + 890} y={240} start={157.0} end={157.4} w={18} out={159.4} />
        <WText lines={['FORCE']} at={158.6} out={159.8} x={C(7) + 560} y={360} size={170} />
      </Win>
      {/* 8 · the 2015 study */}
      <Win from={162.5} to={END(8)}>
        <WText lines={['2015']} at={166.4} out={170.4} x={C(8) + 960} y={190} size={200} />
        <Pop src="microscope" at={164.4} x={C(8) + 960} y={FL - 40} h={520} out={172.8} />
        <Pop src="bb_stand" at={173.6} x={C(8) + 480} y={FL - 230} h={560} />
        <Pop src="powerlifter" at={174.9} x={C(8) + 960} y={FL - 230} h={560} />
        <Pop src="normal_guy" at={176.5} x={C(8) + 1440} y={FL - 230} h={560} />
        <Pop src="fibre_single" at={178.9} x={C(8) + 480} y={FL + 20} h={120} sy={1.7} />
        <Pop src="fibre_single" at={179.2} x={C(8) + 960} y={FL + 20} h={120} />
        <Pop src="fibre_single" at={179.5} x={C(8) + 1440} y={FL + 20} h={120} sy={0.9} />
      </Win>
      {/* 9 · results */}
      <Win from={181.7} to={201.3}>
        <Pop src="fibre_single" at={182.5} x={C(9) + 420} y={760} h={120} sy={2.1} out={201.0} />
        <Pop src="fibre_single" at={182.6} x={C(9) + 960} y={760} h={120} out={201.0} />
        <Pop src="fibre_single" at={182.7} x={C(9) + 1500} y={760} h={120} sy={0.9} out={201.0} />
        <WText lines={['BIGGEST']} at={184.0} out={186.2} x={C(9) + 420} y={300} size={130} />
        <Gauge x={C(9) + 420} y={300} at={186.4} val={0.25} swingAt={187.3} />
        <Gauge x={C(9) + 960} y={300} at={186.6} val={0.92} swingAt={187.3} />
        <Gauge x={C(9) + 1500} y={300} at={186.8} val={0.55} swingAt={187.3} />
        <WText lines={['LAST.']} at={190.4} out={192.0} x={C(9) + 420} y={110} size={130} />
        <WText lines={['−62%']} at={193.2} out={197.6} x={C(9) + 690} y={500} size={220} />
        <WText lines={['−41%']} at={197.9} out={201.0} x={C(9) + 1230} y={500} size={220} />
      </Win>
      <Win from={202.0} to={END(9)}>
        <Jitter at={204.2}>
          <DrawSvg data={engine} cx={C(9) + 960} cy={560} h={640} start={202.5} end={203.7} fillAt={203.8} raster="engine" />
        </Jitter>
        <WText lines={['BIGGER ENGINE']} at={203.3} out={206.4} x={C(9) + 960} y={150} size={130} />
      </Win>
      {/* 10 · lifters & drift */}
      <Win from={206.0} to={END(10)}>
        <Pop src="squat_heavy" at={207.7} x={C(10) + 560} y={FL} h={600} out={218.3} />
        <Pop src="squat_light" at={208.3} x={C(10) + 1360} y={FL} h={560} out={218.3} />
        <WText lines={['MORE']} at={212.6} out={215.0} x={C(10) + 560} y={200} size={170} />
        <WText lines={['SAME THIGHS']} at={215.8} out={218.2} x={C(10) + 960} y={190} size={130} />
        <DriftWords x={C(10) + 960} y={540} at={218.6} apart={219.6} together={222.7} />
      </Win>
      {/* 11 · physics */}
      <Win from={225.8} to={END(11)}>
        <Pop src="armwrestle" at={226.5} x={C(11) + 960} y={FL} h={560} out={231.2} />
        <WText lines={['SIMPLE', 'PHYSICS']} at={229.8} out={231.3} x={C(11) + 960} y={200} size={130} />
        <Pop src="fibre" at={231.5} x={C(11) + 520} y={800} h={480} />
        <Stroke d="M -230 0 L 230 0 M -190 -30 L -230 0 L -190 30 M 190 -30 L 230 0 L 190 30" x={C(11) + 520} y={870} start={234.8} end={235.4} w={10} />
        <WText lines={['THICKNESS']} at={235.1} out={239.6} x={C(11) + 520} y={980} size={80} />
        <Cubes x={C(11) + 980} y={800} at={236.4} growAt={240.7} />
        <WText lines={['VOLUME']} at={238.7} out={245.4} x={C(11) + 1550} y={220} size={130} />
      </Win>
      {/* 12 · 1937 */}
      <Win from={245.1} to={262.4}>
        <WText lines={['1937']} at={246.5} out={250.0} x={C(12) + 960} y={190} size={200} />
        <Pop src="old_lifter" at={246.6} x={C(12) + 600} y={FL} h={440} />
        <Pop src="old_lifter" at={251.9} x={C(12) + 1350} y={FL} h={640} />
        <WText lines={['KILO FOR KILO']} at={256.9} out={261.4} x={C(12) + 960} y={130} size={110} />
        <WText lines={['★']} at={258.4} out={261.4} x={C(12) + 600} y={420} size={140} />
      </Win>
      {/* 13 · what the pack trains */}
      <Win from={277.2} to={END(13)}>
        <Pop src="soldier_walk" at={278.0} x={C(13) + 700} y={FL} h={760} />
        <WText lines={['LEGS']} at={282.4} out={289.0} x={C(13) + 1050} y={760} size={110} />
        <WText lines={['BACK']} at={283.4} out={289.0} x={C(13) + 260} y={260} size={110} />
        <DrawSvg data={spine} cx={C(13) + 1250} cy={500} h={640} start={284.4} end={285.8} fillAt={285.9} raster="spine" />
        <Pop src="hands_straps" at={287.1} x={C(13) + 1640} y={760} h={380} />
        <WText lines={['GRIP']} at={287.2} out={289.0} x={C(13) + 1640} y={300} size={130} />
      </Win>
      {/* 14 · copy-it routine: backpack walk */}
      <Win from={310.4} to={END(14)}>
        <Cutout src="rook_stand" h={680} breathe keys={[{t: 311.4, x: C(14) - 300, y: FL, r: -8}, {t: 312.0, x: C(14) + 500, y: FL}, {t: 323.4, x: C(14) + 500, y: FL, o: 1}, {t: 323.6, x: C(14) + 500, y: FL, o: 0}]} />
        <Pop src="balloon_arm" at={314.8} x={C(14) + 1300} y={700} h={260} out={317.0} />
        <Stroke d={scribblePath(360, 300, 7, 'bulk')} x={C(14) + 1120} y={420} start={315.4} end={315.8} w={16} out={317.0} />
        <WText lines={['THE COPY-IT', 'ROUTINE']} at={317.1} out={320.3} x={C(14) + 1300} y={360} size={120} />
        <WText lines={['3× A WEEK']} at={318.7} out={320.3} x={C(14) + 1300} y={620} size={110} />
        <WText lines={['1 · BACKPACK WALK']} at={320.6} out={327.6} x={C(14) + 960} y={130} size={110} />
        <Pop src="books" at={323.7} x={C(14) + 560} y={FL} h={260} out={327.8} drop />
        <Pop src="rice_bag" at={324.4} x={C(14) + 900} y={FL} h={300} out={327.8} drop />
        <WText lines={['~10% BODY WEIGHT']} at={325.6} out={327.8} x={C(14) + 1398} y={560} size={90} />
        <Cutout src="rook_backpack" h={640} walk={2} keys={[{t: 327.9, x: C(14) + 150, y: FL}, {t: 334.0, x: C(14) + 850, y: FL}]} />
        <WText lines={['20 MIN']} at={328.6} out={330.4} x={C(14) + 1500} y={300} size={160} />
        <WText lines={['+ WEIGHT']} at={330.8} out={334.0} x={C(14) + 1500} y={250} size={110} />
        <WText lines={['OR + TIME']} at={331.8} out={334.0} x={C(14) + 1500} y={390} size={110} />
        <WText lines={['NEVER BOTH']} at={332.9} out={334.0} x={C(14) + 1500} y={560} size={110} />
      </Win>
      {/* 15 · farmer carry */}
      <Win from={333.5} to={END(15)}>
        <WText lines={['2 · FARMER CARRY']} at={334.2} out={340.8} x={C(15) + 960} y={130} size={110} />
        <Cutout src="rook_jugs" h={660} walk={2} keys={[{t: 335.0, x: C(15) + 300, y: FL}, {t: 340.9, x: C(15) + 300, y: FL}, {t: 342.1, x: C(15) + 1500, y: FL}, {t: 342.6, x: C(15) + 1500, y: FL + 25}]} />
        <Stroke d="M 0 0 L 1300 0 M 0 -25 L 0 25 M 1300 -25 L 1300 25" x={C(15) + 260} y={FL + 60} start={340.9} end={342.1} w={8} />
        <WText lines={['30 M']} at={341.3} out={343.8} x={C(15) + 900} y={FL - 30} size={110} />
        <WText lines={['STAND TALL']} at={339.3} out={340.8} x={C(15) + 900} y={330} size={110} />
        <WText lines={['4 ROUNDS']} at={343.9} out={345.4} x={C(15) + 960} y={300} size={150} />
        <Tally x={C(15) + 860} y={450} times={[344.0, 344.2, 344.4, 344.6]} />
      </Win>
      {/* 16 · floor lift */}
      <Win from={344.7} to={END(16)}>
        <WText lines={['3 · FLOOR LIFT']} at={345.4} out={350.8} x={C(16) + 960} y={130} size={110} />
        <Cutout src="rook_lift" h={600} keys={[{t: 345.6, x: C(16) + 650, y: FL}, {t: 353.0, x: C(16) + 650, y: FL}, {t: 353.5, x: C(16) + 650, y: FL - 40}, {t: 354.1, x: C(16) + 650, y: FL}]} />
        <WText lines={['BACK FLAT']} at={351.9} out={354.2} x={C(16) + 1350} y={420} size={120} />
        <WText lines={['3 × 5']} at={354.4} out={357.2} x={C(16) + 1350} y={420} size={200} />
        <Stroke d="M 0 0 L 0 320" x={C(16) + 1250} y={560} start={357.4} end={357.8} w={14} />
        <Stroke d="M 0 0 C 110 90, 110 230, 0 320" x={C(16) + 1550} y={560} start={357.6} end={358.0} w={14} />
        <Stroke d={scribblePath(220, 340, 5, 'rnd')} x={C(16) + 1440} y={550} start={358.4} end={358.7} w={14} />
      </Win>
      {/* 17 · the grip test */}
      <Win from={359.2} to={END(17)}>
        <WText lines={['THE TEST']} at={360.1} out={363.4} x={C(17) + 960} y={170} size={170} />
        <Cutout src="rook_jugs" h={660} walk={2} keys={[{t: 361.9, x: C(17) - 200, y: FL}, {t: 366.0, x: C(17) + 560, y: FL}, {t: 371.4, x: C(17) + 560, y: FL, o: 1}, {t: 371.6, x: C(17) + 560, y: FL, o: 0}]} />
        <WText lines={['¼ BODY WEIGHT']} at={364.0} out={366.6} x={C(17) + 1300} y={350} size={110} />
        <Pop src="hands_handles" at={366.8} x={C(17) + 1350} y={760} h={360} out={368.1} />
        <DrawSvg data={stopwatch} cx={C(17) + 1350} cy={560} h={560} start={368.2} end={368.8} fillAt={368.75} raster="stopwatch" out={371.4} />
        <Win from={368.8} to={371.4}><Hand cx={C(17) + 1350} cy={598} r={165} start={368.8} stop={370.0} /></Win>
        <WText lines={['ROOK: 0:45']} at={369.9} out={371.4} x={C(17) + 1350} y={180} size={130} />
        <Pop src="rook_notebook" at={371.6} x={C(17) + 640} y={FL} h={520} />
        <WText lines={['COMMENT', 'YOUR TIME']} at={372.4} out={374.0} x={C(17) + 1350} y={420} size={130} />
        <WText lines={['4 WEEKS']} at={374.1} out={376.8} x={C(17) + 1350} y={420} size={170} />
      </Win>
      {/* 18 · close */}
      <Win from={376.4} to={END(18)}>
        <WText lines={['NOT MEDICAL', 'ADVICE']} at={380.6} out={384.6} x={C(18) + 960} y={420} size={130} />
        <Cutout src="soldier_walk" h={600} walk={2} keys={[{t: 385.6, x: C(18) - 200, y: FL}, {t: 391.0, x: C(18) + 700, y: FL}]} />
        <Cutout src="rook_backpack" h={600} walk={2.1} keys={[{t: 385.8, x: C(18) - 600, y: FL}, {t: 391.0, x: C(18) + 330, y: FL}]} />
        <WText lines={["IT'S A JOB."]} at={390.0} out={391.3} x={C(18) + 1368} y={330} size={140} />
        <DrawSvg data={bodyNerves} cx={C(18) + 1450} cy={540} h={760} start={391.5} end={393.3} fillAt={393.4} raster="body_nerves" out={397.2} />
        <WText lines={['NO DEAD', 'WEIGHT.']} at={397.6} out={399.4} x={C(18) + 1450} y={300} size={140} />
      </Win>
      {/* 19 · end card */}
      <Win from={398.8} to={410}>
        <Cutout src="rook_hang" h={760} keys={[{t: 399.6, x: C(19) + 1350, y: -100}, {t: 400.3, x: C(19) + 1350, y: FL - 40}]} />
        <WText lines={['NEXT:']} at={400.2} out={408} x={C(19) + 620} y={300} size={130} />
        <WText lines={['HANGING', 'EVERY DAY']} at={400.6} out={408} x={C(19) + 620} y={520} size={140} />
      </Win>
    </Camera>
  );
};

// ---------------- full-screen footage inserts ----------------
const FOOT = [
  {src: 'stock/bb_480.webm', from: 6.0, at: 66.2, end: 68.95, scale: 1.25},
  {src: 'stock/march2_480.webm', from: 20.0, at: 159.9, end: 161.5, scale: 1.25, bright: 1.15},
  {src: 'stock/march2_480.webm', from: 34.0, at: 161.5, end: 163.1, scale: 1.3, bright: 1.15},
  {src: 'stock/deadlift.webm', from: 21.4, at: 223.9, end: 224.65, scale: 1.25},
  {src: 'stock/sdc.webm', from: 78.0, at: 224.65, end: 225.45, scale: 1.25},
  {src: 'stock/march2_480.webm', from: 49.0, at: 225.45, end: 226.45, scale: 1.25, bright: 1.15},
  {src: 'stock/march2_480.webm', from: 44.0, at: 261.6, end: 265.4, scale: 1.25, bright: 1.15},
  {src: 'stock/march2_480.webm', from: 21.6, at: 265.4, end: 269.4, scale: 1.3, bright: 1.25},
  {src: 'stock/march2_480.webm', from: 34.0, at: 269.4, end: 273.0, scale: 1.3, bright: 1.15},
  {src: 'stock/march2_480.webm', from: 24.0, at: 273.0, end: 275.6, scale: 1.3, bright: 1.6},
  {src: 'stock/march2_480.webm', from: 49.5, at: 275.6, end: 277.9, scale: 1.25, bright: 1.15},
  {src: 'stock/deadlift.webm', from: 45.0, at: 289.8, end: 292.4, scale: 1.2},
  {src: 'stock/deadlift.webm', from: 24.0, at: 292.4, end: 296.3, scale: 1.2},
  {src: 'stock/deadlift.webm', from: 60.0, at: 296.3, end: 298.0, scale: 1.25},
  {src: 'stock/sdc.webm', from: 6.0, at: 298.0, end: 299.9, scale: 1.25},
  {src: 'stock/sdc.webm', from: 26.2, at: 299.9, end: 301.6, scale: 1.25},
  {src: 'stock/sdc.webm', from: 78.0, at: 301.6, end: 305.8, scale: 1.25},
  {src: 'stock/sdc.webm', from: 84.0, at: 305.8, end: 308.8, scale: 1.25},
  {src: 'stock/sdc.webm', from: 27.5, at: 308.8, end: 311.05, scale: 1.3},
];
const FOOT_TEXT: {lines: string[]; at: number; out: number; size?: number}[] = [
  {lines: ['HEAVY'], at: 224.0, out: 224.6, size: 240},
  {lines: ['PRACTICAL'], at: 224.7, out: 225.4, size: 220},
  {lines: ['OFTEN'], at: 225.5, out: 226.4, size: 240},
  {lines: ['US ARMY', 'INFANTRY SCHOOL'], at: 264.4, out: 267.4, size: 150},
  {lines: ['33 KG'], at: 267.7, out: 269.3, size: 260},
  {lines: ['≈ 45% OF', 'BODY WEIGHT'], at: 269.8, out: 272.9, size: 180},
  {lines: ['46 KG', 'ON AVERAGE'], at: 275.7, out: 277.8, size: 200},
  {lines: ['JUNE 2025'], at: 292.7, out: 294.4, size: 220},
  {lines: ['ARMY FITNESS', 'TEST'], at: 294.6, out: 296.2, size: 180},
  {lines: ['3-REP MAX', 'DEADLIFT'], at: 296.3, out: 297.9, size: 180},
  {lines: ['SPRINT · DRAG', '· CARRY'], at: 298.1, out: 299.8, size: 170},
  {lines: ['90 LB SLED'], at: 300.2, out: 301.5, size: 200},
  {lines: ['2 × 40 LB'], at: 302.2, out: 305.7, size: 220},
  {lines: ['CAN YOU', 'MOVE IT?'], at: 309.6, out: 311.0, size: 200},
];
const WIPES = [45.0, 68.85, 163.0, 226.35, 277.75, 310.95];

const SFX: [number, string][] = [
  ...WIPES.flatMap((w) => [[w, 'paper_slide'], [w, 'air_woosh']] as [number, string][]),
  ...START.slice(1).filter((s) => !WIPES.some((w) => Math.abs(w - s) < 1)).map((s) => [s - 0.15, 'whoosh_fast'] as [number, string]),
  ...FOOT.map((c) => [c.at, 'shutter'] as [number, string]),
  ...FOOT_TEXT.map((x) => [x.at, 'zoom_impact'] as [number, string]),
  // draws
  [47.9, 'pencil'], [106.4, 'pencil'], [110.5, 'pencil'], [118.0, 'pencil'], [119.0, 'pencil_short'], [145.4, 'pencil'], [151.1, 'pencil'],
  [234.8, 'pencil_short'], [236.4, 'pencil'], [282.3, 'pencil_short'], [283.3, 'pencil_short'], [284.4, 'pencil'], [340.9, 'pencil'],
  [351.9, 'pencil_short'], [357.4, 'pencil_short'], [368.2, 'pencil_short'], [391.5, 'pencil'], [59.4, 'pencil_short'], [344.0, 'pencil_short'],
  // drops & pops
  [50.9, 'wood_hit'], [52.6, 'wood_hit'], [52.9, 'swoosh_accent'], [65.9, 'wood_hit'], [74.6, 'pop_whoosh'], [77.7, 'wood_hit'],
  [98.6, 'pop_whoosh'], [99.6, 'paper_crinkle'], [134.3, 'pop_hard'], [164.4, 'pop_whoosh'], [173.6, 'pop_whoosh'], [174.9, 'pop_whoosh'], [176.5, 'pop_whoosh'],
  [178.9, 'pop_whoosh'], [186.4, 'knob_spin'], [207.7, 'pop_whoosh'], [208.3, 'pop_whoosh'], [226.5, 'wood_hit'], [231.5, 'pop_whoosh'], [246.6, 'pop_whoosh'], [251.9, 'pop_whoosh'],
  [287.1, 'pop_whoosh'], [314.8, 'pop_whoosh'], [323.8, 'wood_hit'], [324.5, 'wood_hit'], [366.8, 'pop_whoosh'], [371.6, 'pop_whoosh'], [399.7, 'whoosh_cine'],
  // scribbles
  [75.5, 'scribble'], [157.0, 'scribble'], [315.4, 'scribble'], [358.4, 'scribble'],
  // impacts on key words
  [55.7, 'zoom_impact'], [77.8, 'zoom_impact'], [96.1, 'wood_hit'], [102.6, 'wood_hit'], [110.4, 'deep_impact'], [117.0, 'wood_hit'], [139.2, 'wood_hit'], [140.2, 'wood_hit'],
  [141.7, 'wood_hit'], [149.9, 'wood_hit'], [166.4, 'deep_impact'], [190.4, 'heartbeat_impact'], [193.2, 'big_impact'], [197.9, 'zoom_impact'],
  [212.6, 'wood_hit'], [219.6, 'air_woosh'], [222.7, 'deep_impact'], [229.8, 'wood_hit'], [246.5, 'deep_impact'], [256.9, 'wood_hit'],
  [317.1, 'big_impact'], [320.6, 'wood_hit'], [328.6, 'wood_hit'], [332.9, 'zoom_impact'], [334.2, 'wood_hit'], [343.9, 'wood_hit'], [345.4, 'wood_hit'],
  [354.4, 'wood_hit'], [360.1, 'deep_impact'], [368.8, 'tick_tock'], [369.9, 'wood_hit'], [374.1, 'wood_hit'], [380.6, 'zoom_impact'], [397.6, 'deep_impact'], [400.6, 'big_impact'],
  // footsteps of the stair-like lift reps & rope pulls
  [137.3, 'swoosh_accent'], [137.9, 'swoosh_accent'], [353.0, 'wood_hit'],
];

export const Rest: React.FC = () => {
  const t = useT();
  if (t < 44.9) return null;
  return (
    <AbsoluteFill>
      {t >= 45.35 ? <World /> : null}
      <Shake at={FOOT_TEXT.map((x) => x.at)} amp={10}>
        <Footages list={FOOT} />
        {FOOT_TEXT.map((x, i) => <Slam key={i} lines={x.lines} at={x.at} out={x.out} size={x.size} color={PAPER} shadow />)}
      </Shake>
      <Flash at={FOOT.map((c) => c.at)} />
      {WIPES.map((w) => <PaperWipe key={w} at={w} />)}
    </AbsoluteFill>
  );
};
export const REST_SFX = SFX;
