import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {PaperBG, Grain, Footage, Flash, Shake, Slam, Cutout, DrawSvg, Stroke, Camera, Sfx, Win, WText, Pop, f, INK, PAPER, useT, fontFamily} from './kit';
import clock from './svg_clock.json';
import thermometer from './svg_thermometer.json';
import telescope from './svg_telescope.json';
import bigTree from './svg_big_tree.json';
import handMirror from './svg_hand_mirror.json';
import vent from './svg_vent.json';

export const SUN_LEN = 327;
const C = (i: number) => i * 2400;
const FL = 930;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const START = [19.3, 35.0, 63.2, 76.9, 94.0, 112.5, 131.1, 163.0, 204.9, 225.1, 260.3, 277.7, 304.3];
const END = (i: number) => (i + 1 < START.length ? START[i + 1] + 0.6 : SUN_LEN + 1);

// ---------- pieces ----------
const PaperWipe: React.FC<{at: number}> = ({at}) => {
  const t = useT();
  if (t < at || t > at + 0.7) return null;
  const p = interpolate(t, [at, at + 0.6], [0, 1], cl);
  let pts = '';
  for (let i = 0; i <= 40; i++) pts += `${(random('tear' + i + at) * 60).toFixed(0)}px ${(i * 27).toFixed(0)}px, `;
  return (
    <AbsoluteFill style={{transform: `translateX(${2000 - p * 2400}px) rotate(${(1 - p) * 4}deg)`}}>
      <div style={{position: 'absolute', left: 0, top: -40, width: 3000, height: 1160, clipPath: `polygon(${pts} 3000px 1080px, 3000px 0px)`, filter: 'drop-shadow(-12px 0 18px rgba(0,0,0,0.8))'}}>
        <Img src={staticFile('cut/paper.jpg')} style={{width: 3000, height: 1160, objectFit: 'cover'}} />
      </div>
    </AbsoluteFill>
  );
};

const Black: React.FC<{from: number; to: number}> = ({from, to}) => {
  const t = useT();
  if (t < from || t > to) return null;
  return <AbsoluteFill style={{background: '#000'}} />;
};

const SunDraw: React.FC<{x: number; y: number; r: number; at: number; goneAt: number}> = ({x, y, r, at, goneAt}) => {
  const t = useT();
  if (t < at) return null;
  const p = interpolate(t, [at, at + 0.8], [0, 1], cl);
  const g = interpolate(t, [goneAt, goneAt + 0.4], [0, 1], cl);
  const L = 2 * Math.PI * r;
  return (
    <svg style={{position: 'absolute', left: x - r - 80, top: y - r - 80, overflow: 'visible'}} width={2 * r + 160} height={2 * r + 160}>
      <circle cx={r + 80} cy={r + 80} r={r} fill={INK} fillOpacity={0.9 * p * (1 - g)} stroke={INK} strokeWidth={8} strokeDasharray={g > 0 ? '22 18' : `${L}`} strokeDashoffset={g > 0 ? 0 : L * (1 - p)} />
      {Array.from({length: 12}).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={r + 80 + Math.cos(a) * (r + 20)} y1={r + 80 + Math.sin(a) * (r + 20)} x2={r + 80 + Math.cos(a) * (r + 60)} y2={r + 80 + Math.sin(a) * (r + 60)} stroke={INK} strokeWidth={8} strokeLinecap="round" opacity={p * (1 - g)} />;
      })}
    </svg>
  );
};

const Traveler: React.FC<{x0: number; y0: number; x1: number; y1: number; t0: number; t1: number; r?: number}> = ({x0, y0, x1, y1, t0, t1, r = 16}) => {
  const t = useT();
  if (t < t0 || t > t1 + 0.4) return null;
  const p = interpolate(t, [t0, t1], [0, 1], cl);
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={10} height={10}>
      <line x1={x0} y1={y0} x2={x0 + (x1 - x0) * p} y2={y0 + (y1 - y0) * p} stroke={INK} strokeWidth={4} strokeDasharray="10 14" opacity={0.7} />
      <circle cx={x0 + (x1 - x0) * p} cy={y0 + (y1 - y0) * p} r={r} fill={INK} />
      <circle cx={x0 + (x1 - x0) * p} cy={y0 + (y1 - y0) * p} r={r * 2.4} fill={INK} opacity={0.15} />
    </svg>
  );
};

const Binary: React.FC<{x: number; y: number; at: number; hit: number}> = ({x, y, at, hit}) => {
  const t = useT();
  if (t < at) return null;
  const k = Math.min(1, (t - at) / (hit - at));
  const rad = 260 * (1 - k) + 6;
  const ang = (t - at) * (2 + k * 14);
  const merged = t >= hit;
  const ring = (d: number) => {
    const q = (t - hit - d) / 2.4;
    if (q < 0 || q > 1) return null;
    return <circle key={d} cx={0} cy={0} r={40 + q * 900} fill="none" stroke={INK} strokeWidth={6} opacity={1 - q} />;
  };
  return (
    <svg style={{position: 'absolute', left: x, top: y, overflow: 'visible'}} width={10} height={10}>
      {!merged ? <>
        <circle cx={Math.cos(ang) * rad} cy={Math.sin(ang) * rad * 0.5} r={34} fill={INK} />
        <circle cx={-Math.cos(ang) * rad} cy={-Math.sin(ang) * rad * 0.5} r={34} fill={INK} />
      </> : <circle cx={0} cy={0} r={interpolate(t, [hit, hit + 0.3, hit + 1.2], [10, 120, 46], cl)} fill={INK} />}
      {merged ? [0, 0.35, 0.7].map(ring) : null}
    </svg>
  );
};

const Orbit: React.FC<{cx: number; cy: number; r: number; at: number; leaveAt?: number}> = ({cx, cy, r, at, leaveAt}) => {
  const t = useT();
  if (t < at) return null;
  const p = interpolate(t, [at, at + 0.9], [0, 1], cl);
  const leaving = leaveAt !== undefined && t > leaveAt;
  const a0 = -Math.PI / 2 + ((leaveAt ?? t) - at) * 0.5;
  const a = leaving ? a0 : -Math.PI / 2 + (t - at) * 0.5;
  let ex = cx + Math.cos(a) * r, ey = cy + Math.sin(a) * r;
  if (leaving) { const d = (t - (leaveAt as number)) * 55; ex += -Math.sin(a0) * d; ey += Math.cos(a0) * d; }
  const L = 2 * Math.PI * r;
  return (
    <>
      <svg style={{position: 'absolute', left: cx - r, top: cy - r, overflow: 'visible'}} width={2 * r} height={2 * r}>
        <circle cx={r} cy={r} r={r} fill="none" stroke={INK} strokeWidth={4} strokeDasharray="8 16" opacity={0.6 * p} />
        <circle cx={r} cy={r} r={110} fill="none" stroke={INK} strokeWidth={7} strokeDasharray="22 18" strokeDashoffset={L * 0} opacity={p} />
      </svg>
      {leaving ? <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={10} height={10}>
        <line x1={cx + Math.cos(a0) * r} y1={cy + Math.sin(a0) * r} x2={ex} y2={ey} stroke={INK} strokeWidth={5} strokeDasharray="14 12" opacity={0.7} />
      </svg> : null}
      <Img src={staticFile('cut/earth.png')} style={{position: 'absolute', left: ex - 80, top: ey - 80, width: 160, height: 160, opacity: p}} />
    </>
  );
};

const SkyLight: React.FC<{until: number; from: number; x: number}> = ({until, from, x}) => {
  const t = useT();
  if (t < from || t > until) return null;
  return <div style={{position: 'absolute', left: x - 400, top: -200, width: 2800, height: 900, background: `linear-gradient(${INK}, rgba(236,232,222,0.55))`}} />;
};

const StarField: React.FC<{x: number; w: number; at: number; n?: number; out?: number}> = ({x, w, at, n = 140, out}) => {
  const t = useT();
  if (t < at) return null;
  const o = out === undefined ? 1 : interpolate(t, [out, out + 0.5], [1, 0], cl);
  return (
    <svg style={{position: 'absolute', left: x, top: 0, overflow: 'visible', opacity: o}} width={w} height={1080}>
      {Array.from({length: n}).map((_, i) => {
        const st = at + random('st' + i) * 2.5;
        if (t < st) return null;
        const tw = 0.6 + 0.4 * Math.sin(t * 3 + i);
        return <circle key={i} cx={random('sx' + i) * w} cy={random('sy' + i) * 760} r={1.5 + random('sr' + i) * 3.5} fill={INK} opacity={tw * interpolate(t, [st, st + 0.3], [0, 1], cl)} />;
      })}
    </svg>
  );
};

const BrightStar: React.FC<{x: number; y: number; at: number; out: number}> = ({x, y, at, out}) => {
  const t = useT();
  if (t < at || t > out + 0.6) return null;
  const o = interpolate(t, [at, at + 0.4, out, out + 0.6], [0, 1, 1, 0], cl);
  const s = 1 + 0.15 * Math.sin(t * 4);
  return (
    <svg style={{position: 'absolute', left: x - 120, top: y - 120, overflow: 'visible', opacity: o, transform: `scale(${s})`}} width={240} height={240}>
      <circle cx={120} cy={120} r={90} fill={INK} opacity={0.12} />
      <circle cx={120} cy={120} r={46} fill={INK} opacity={0.25} />
      <circle cx={120} cy={120} r={22} fill={INK} />
      <path d="M120 10 L120 230 M10 120 L230 120" stroke={INK} strokeWidth={5} />
    </svg>
  );
};

const Mercury: React.FC<{x: number; yTop: number; yBot: number; at: number; fall: number; dur: number}> = ({x, yTop, yBot, at, fall, dur}) => {
  const t = useT();
  if (t < at) return null;
  const lvl = interpolate(t, [fall, fall + dur], [0.85, 0.18], cl);
  const y = yBot - (yBot - yTop) * lvl;
  return <div style={{position: 'absolute', left: x - 9, top: y, width: 18, height: yBot - y, background: INK, borderRadius: 9}} />;
};

const Snow: React.FC<{x: number; w: number; at: number; out: number}> = ({x, w, at, out}) => {
  const t = useT();
  if (t < at || t > out) return null;
  return (
    <svg style={{position: 'absolute', left: x, top: 0, overflow: 'visible'}} width={w} height={1080}>
      {Array.from({length: 90}).map((_, i) => {
        const sp = 90 + random('vs' + i) * 120;
        const y = ((t - at) * sp + random('y0' + i) * 1100) % 1100 - 20;
        const xx = random('x0' + i) * w + Math.sin(t * 1.5 + i) * 18;
        return <circle key={i} cx={xx} cy={y} r={3 + random('r' + i) * 4} fill={INK} opacity={0.85} />;
      })}
    </svg>
  );
};

const Ocean: React.FC<{x: number; at: number; iceAt: number}> = ({x, at, iceAt}) => {
  const t = useT();
  if (t < at) return null;
  const p = interpolate(t, [at, at + 0.8], [0, 1], cl);
  const ice = interpolate(t, [iceAt, iceAt + 3], [0, 80], cl);
  const waves = Array.from({length: 6}).map((_, k) => {
    let d = `M 0 ${470 + k * 90}`;
    for (let i = 0; i <= 40; i++) d += ` L ${i * 50} ${470 + k * 90 + Math.sin(i * 0.6 + t * 1.6 + k) * 10}`;
    return <path key={k} d={d} fill="none" stroke={INK} strokeWidth={3} opacity={0.35 * p} />;
  });
  return (
    <svg style={{position: 'absolute', left: x, top: 0, overflow: 'visible'}} width={2000} height={1080}>
      <line x1={0} y1={380} x2={2000} y2={380} stroke={INK} strokeWidth={6} opacity={p} />
      <rect x={0} y={380} width={2000} height={ice} fill={INK} opacity={0.92} />
      {waves}
    </svg>
  );
};

const Smoke: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const t = useT();
  if (t < at) return null;
  return (
    <svg style={{position: 'absolute', left: x, top: y, overflow: 'visible'}} width={10} height={10}>
      {Array.from({length: 26}).map((_, i) => {
        const q = ((t - at) * 0.5 + random('q' + i)) % 1;
        return <circle key={i} cx={Math.sin(q * 6 + i) * 30 * q} cy={-q * 380} r={10 + q * 40} fill={INK} opacity={(1 - q) * 0.25} />;
      })}
    </svg>
  );
};

const BlackHole: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const t = useT();
  if (t < at) return null;
  const s = interpolate(t, [at, at + 0.8], [0.2, 1], cl);
  const rot = (t - at) * 60;
  return (
    <svg style={{position: 'absolute', left: x - 520, top: y - 520, overflow: 'visible', transform: `scale(${s})`}} width={1040} height={1040}>
      <g transform={`rotate(${rot} 520 520)`}>
        {Array.from({length: 9}).map((_, i) => (
          <ellipse key={i} cx={520} cy={520} rx={160 + i * 40} ry={(160 + i * 40) * 0.42} fill="none" stroke={INK} strokeWidth={6 - i * 0.5} strokeDasharray={`${120 - i * 8} ${40 + i * 6}`} opacity={0.9 - i * 0.08} transform={`rotate(${i * 9} 520 520)`} />
        ))}
      </g>
      <circle cx={520} cy={520} r={130} fill="#000" />
      <circle cx={520} cy={520} r={138} fill="none" stroke={INK} strokeWidth={6} />
    </svg>
  );
};

// big survival odds meter (screen space)
const ODDS: {at: number; out: number; from: number; to: number}[] = [
  {at: 69.3, out: 77.4, from: 0, to: 100},
  {at: 126.5, out: 130.6, from: 100, to: 90},
  {at: 202.6, out: 204.8, from: 90, to: 70},
  {at: 222.9, out: 225.0, from: 70, to: 40},
  {at: 295.6, out: 303.8, from: 40, to: 5},
];
const OddsMeter: React.FC = () => {
  const t = useT();
  const o = ODDS.find((x) => t >= x.at && t <= x.out + 0.3);
  if (!o) return null;
  const v = Math.round(interpolate(t, [o.at + 0.2, o.at + 1.4], [o.from, o.to], cl));
  const op = interpolate(t, [o.at, o.at + 0.25, o.out, o.out + 0.3], [0, 1, 1, 0], cl);
  const shake = t > o.at + 1.4 && t < o.at + 1.8 ? Math.sin(t * 90) * 6 : 0;
  return (
    <div style={{position: 'absolute', right: 60, top: 50, width: 760, opacity: op, transform: `translateX(${shake}px)`, textAlign: 'right'}}>
      <div style={{fontFamily, fontWeight: 900, fontSize: 90, color: INK, letterSpacing: 0, textShadow: `0 0 16px ${PAPER}`}}>SURVIVAL ODDS</div>
      <div style={{fontFamily, fontWeight: 900, fontSize: 170, lineHeight: 1, color: INK, textShadow: `0 0 20px ${PAPER}`}}>{v}%</div>
      <div style={{marginTop: 14, height: 34, border: `5px solid ${INK}`, borderRadius: 6}}>
        <div style={{width: `${v}%`, height: '100%', background: INK}} />
      </div>
    </div>
  );
};

// ---------- world ----------
const World: React.FC = () => {
  const keys = START.map((s, i) => ({t: s + 0.4, x: C(i) + 960, y: 540, z: 1}));
  return (
    <Camera keys={[{t: 0, x: 960, y: 540, z: 1}, ...keys]}>
      {/* 0 · light takes 8:20 */}
      <Win from={19} to={END(0)}>
        <SunDraw x={C(0) + 380} y={460} r={170} at={19.6} goneAt={29.8} />
        <Pop src="earth" at={20.3} x={C(0) + 1600} y={420} h={200} />
        <Traveler x0={C(0) + 560} y0={460} x1={C(0) + 1490} y1={330} t0={21.7} t1={25.2} />
        <WText lines={['8 MIN 20 SEC']} at={22.3} out={26.2} x={C(0) + 1000} y={190} size={130} />
        <Cutout src="milo_lookup" h={420} keys={[{t: 26.4, x: C(0) + 2400, y: FL}, {t: 27.0, x: C(0) + 1600, y: FL}]} />
        <Cutout src="envelope" h={170} keys={[{t: 31.4, x: C(0) + 450, y: 560, r: -10}, {t: 34.3, x: C(0) + 1380, y: 720, r: 5}]} />
        <WText lines={['STILL IN THE MAIL']} at={33.6} out={35.2} x={C(0) + 900} y={190} size={120} />
      </Win>
      {/* 1 · gravity is in the mail too */}
      <Win from={34.4} to={END(1)}>
        <Pop src="envelope" at={36.6} x={C(1) + 960} y={640} h={240} out={43.4} />
        <WText lines={['GRAVITY']} at={37.3} out={43.4} x={C(1) + 960} y={230} size={170} />
        <WText lines={['HOW FAST?']} at={41.7} out={43.6} x={C(1) + 960} y={820} size={120} />
        <WText lines={['2017']} at={44.4} out={49.6} x={C(1) + 960} y={170} size={170} />
        <Binary x={C(1) + 960} y={560} at={45.6} hit={46.6} />
        <DrawSvg data={telescope} cx={C(1) + 420} cy={640} h={460} start={50.0} end={50.9} fillAt={51.0} raster="telescope" />
        <WText lines={['LIGHT']} at={51.3} out={62.8} x={C(1) + 420} y={320} size={120} />
        <Stroke d="M 0 0 L 0 -340 M 0 0 L 440 0 M -24 -340 L 24 -340 M 440 -24 L 440 24" x={C(1) + 1300} y={820} start={52.3} end={53.1} w={14} />
        <WText lines={['RIPPLE']} at={54.3} out={62.8} x={C(1) + 1520} y={320} size={120} />
        <WText lines={['< 2 SECONDS']} at={55.9} out={58.3} x={C(1) + 960} y={170} size={130} />
        <WText lines={['130 MILLION YEARS']} at={58.5} out={61.0} x={C(1) + 960} y={170} size={110} />
        <WText lines={['GRAVITY = LIGHT SPEED']} at={61.2} out={63.4} x={C(1) + 960} y={170} size={100} />
      </Win>
      {/* 2 · orbiting nothing */}
      <Win from={62.6} to={END(2)}>
        <Orbit cx={C(2) + 820} cy={540} r={330} at={63.3} />
        <WText lines={["A SUN THAT", "DOESN'T EXIST"]} at={65.2} out={67.6} x={C(2) + 820} y={540} size={70} />
        <Pop src="milo_bench" at={67.7} x={C(2) + 1560} y={FL} h={400} />
        <Pop src="moon" at={73.4} x={C(2) + 260} y={330} h={170} />
        <Stroke d="M -130 0 A 130 130 0 1 0 130 0 A 130 130 0 1 0 -130 0" x={C(2) + 260} y={245} start={73.7} end={74.3} w={7} />
        <WText lines={['REMEMBER', 'THE MOON']} at={73.2} out={75.5} x={C(2) + 640} y={210} size={90} />
        <WText lines={['12:08:20']} at={75.7} out={77.2} x={C(2) + 700} y={200} size={150} />
      </Win>
      {/* 3 · the sky goes out */}
      <Win from={76.3} to={END(3)}>
        <SkyLight x={C(3)} from={76.3} until={78.6} />
        <StarField x={C(3)} w={2200} at={78.8} />
        <Pop src="milo_lookup" at={77.0} x={C(3) + 960} y={FL} h={560} />
        <WText lines={['NOT A SUNSET.']} at={79.6} out={81.6} x={C(3) + 960} y={170} size={130} />
        <WText lines={['ALL AT ONCE.']} at={82.2} out={84.6} x={C(3) + 960} y={170} size={130} />
        <Pop src="switch" at={85.3} x={C(3) + 1550} y={760} h={360} />
        <WText lines={['BLUE SKY', '= SUNLIGHT']} at={88.4} out={91.7} x={C(3) + 420} y={300} size={100} />
        <WText lines={['NO SUNLIGHT.', 'NO BLUE.']} at={91.9} out={94.4} x={C(3) + 960} y={190} size={110} />
      </Win>
      {/* 4 · Earth lets go */}
      <Win from={93.4} to={END(4)}>
        <StarField x={C(4)} w={2200} at={93.6} n={80} />
        <Orbit cx={C(4) + 700} cy={560} r={300} at={94.2} leaveAt={96.2} />
        <WText lines={['4.5 BILLION YEARS']} at={98.9} out={101.5} x={C(4) + 960} y={150} size={100} />
        <WText lines={['30 KM EVERY SECOND']} at={104.7} out={107.6} x={C(4) + 960} y={170} size={110} />
        <WText lines={['NO SHAKING.', 'NO WIND.']} at={108.6} out={112.4} x={C(4) + 960} y={170} size={110} />
      </Win>
      {/* 5 · the Moon goes dark */}
      <Win from={111.9} to={END(5)}>
        <StarField x={C(5)} w={2200} at={112.0} n={80} />
        <Cutout src="moon" h={460} keys={[{t: 112.6, x: C(5) + 1300, y: 760, o: 1}, {t: 115.3, x: C(5) + 1300, y: 760, o: 1}, {t: 116.0, x: C(5) + 1300, y: 760, o: 0.1}]} />
        <WText lines={['1 SECOND LATER']} at={113.4} out={115.2} x={C(5) + 960} y={150} size={110} />
        <DrawSvg data={handMirror} cx={C(5) + 480} cy={560} h={560} start={117.3} end={118.4} fillAt={118.5} raster="hand_mirror" out={125.0} />
        <WText lines={['A MIRROR']} at={119.2} out={124.2} x={C(5) + 480} y={180} size={120} />
        <WText lines={['BLANK.']} at={125.3} out={126.4} x={C(5) + 960} y={170} size={150} />
      </Win>
      {/* 6 · stars at noon + Jupiter */}
      <Win from={130.5} to={END(6)}>
        <StarField x={C(6)} w={2200} at={132.4} n={220} />
        <Pop src="milo_lookup" at={131.3} x={C(6) + 420} y={FL} h={540} />
        <WText lines={['STARS AT NOON']} at={133.6} out={136.6} x={C(6) + 1150} y={190} size={120} />
        <BrightStar x={C(6) + 1400} y={330} at={140.2} out={157.6} />
        <WText lines={['JUPITER']} at={142.5} out={143.0} x={C(6) + 1400} y={540} size={120} />
        <WText lines={['30–60 MIN']} at={149.7} out={153.4} x={C(6) + 1150} y={600} size={140} />
        <WText lines={['THE LAST', 'SUNLIGHT']} at={151.6} out={157.0} x={C(6) + 1150} y={850} size={90} />
        <DrawSvg data={clock} cx={C(6) + 1350} cy={560} h={460} start={161.9} end={162.6} fillAt={162.7} raster="clock" />
      </Win>
      {/* 7 · day one */}
      <Win from={162.4} to={END(7)}>
        <WText lines={['DAY 1']} at={163.0} out={166.6} x={C(7) + 960} y={170} size={170} />
        <Pop src="birds_branch" at={167.6} x={C(7) + 520} y={560} h={300} out={174.4} />
        <WText lines={['SILENCE.']} at={167.7} out={171.4} x={C(7) + 1300} y={420} size={140} />
        <WText lines={['FOREVER.']} at={173.8} out={174.6} x={C(7) + 1300} y={420} size={140} />
        <Cutout src="plant" h={420} keys={[{t: 174.8, x: C(7) + 520, y: FL, s: 1, r: 0}, {t: 182.0, x: C(7) + 520, y: FL, s: 1, r: 0}, {t: 183.4, x: C(7) + 520, y: FL, s: 0.75, r: 22, o: 0.35}, {t: 185.8, x: C(7) + 520, y: FL, s: 0.75, r: 22, o: 0}]} />
        <WText lines={['NO LIGHT.', 'NO FOOD.']} at={180.1} out={183.6} x={C(7) + 1250} y={420} size={120} />
        <DrawSvg data={bigTree} cx={C(7) + 1400} cy={560} h={640} start={186.1} end={187.6} fillAt={187.7} raster="big_tree" out={196.6} />
        <WText lines={['DECADES']} at={194.1} out={196.5} x={C(7) + 700} y={300} size={150} />
        <Cutout src="deer" h={380} keys={[{t: 197.0, x: C(7) + 700, y: FL}, {t: 200.0, x: C(7) + 700, y: FL, o: 1}, {t: 201.9, x: C(7) + 700, y: FL, o: 0}]} />
      </Win>
      {/* 8 · day seven */}
      <Win from={204.3} to={END(8)}>
        <WText lines={['DAY 7']} at={205.0} out={210.6} x={C(8) + 960} y={170} size={170} />
        <DrawSvg data={thermometer} cx={C(8) + 480} cy={560} h={720} start={205.6} end={206.6} fillAt={206.7} raster="thermometer" />
        <Mercury x={C(8) + 482} yTop={290} yBot={820} at={206.7} fall={210.9} dur={5.4} />
        <WText lines={['−18°C']} at={215.5} out={219.0} x={C(8) + 1100} y={440} size={220} />
        <Pop src="freezer" at={217.5} x={C(8) + 1550} y={FL} h={420} out={220.0} />
        <Snow x={C(8)} w={2200} at={219.1} out={225.5} />
        <WText lines={['EVERYWHERE.']} at={219.1} out={222.6} x={C(8) + 960} y={190} size={150} />
        <Pop src="palm" at={220.3} x={C(8) + 1550} y={FL} h={520} />
      </Win>
      {/* 9 · the ocean */}
      <Win from={224.5} to={END(9)}>
        <WText lines={['MONTH 2']} at={225.1} out={227.2} x={C(9) + 960} y={170} size={160} />
        <Ocean x={C(9) - 40} at={226.4} iceAt={227.4} />
        <WText lines={['ICE = BLANKET']} at={232.5} out={237.0} x={C(9) + 960} y={190} size={130} />
        <WText lines={['STILL LIQUID']} at={237.7} out={243.0} x={C(9) + 960} y={640} size={120} />
        <DrawSvg data={vent} cx={C(9) + 1400} cy={790} h={420} start={246.6} end={247.8} fillAt={247.9} raster="vent" />
        <Smoke x={C(9) + 1440} y={620} at={248.0} />
        <Pop src="tubeworms" at={252.6} x={C(9) + 760} y={1000} h={240} />
        <WText lines={['NO SUN NEEDED']} at={256.1} out={260.2} x={C(9) + 960} y={190} size={120} />
      </Win>
      {/* 10 · year one */}
      <Win from={259.7} to={END(10)}>
        <StarField x={C(10)} w={2200} at={260.2} n={200} />
        <WText lines={['YEAR 1']} at={260.3} out={263.6} x={C(10) + 960} y={170} size={170} />
        <WText lines={['−73°C']} at={264.1} out={269.0} x={C(10) + 960} y={540} size={260} />
        <Cutout src="earth" h={260} keys={[{t: 269.2, x: C(10) + 200, y: 760}, {t: 278.0, x: C(10) + 1700, y: 640}]} />
        <WText lines={['ROGUE PLANET']} at={274.1} out={277.6} x={C(10) + 960} y={190} size={130} />
      </Win>
      {/* 11 · where is Milo */}
      <Win from={277.1} to={END(11)}>
        <WText lines={['WHERE IS MILO?']} at={277.8} out={282.6} x={C(11) + 960} y={170} size={130} />
        <Cutout src="milo_walk" h={540} walk={2} keys={[{t: 278.4, x: C(11) - 200, y: FL}, {t: 282.6, x: C(11) + 960, y: FL, o: 1}, {t: 287.3, x: C(11) + 960, y: FL, o: 0}]} />
        <Pop src="hut" at={287.5} x={C(11) + 560} y={FL} h={460} />
        <Pop src="growlamps" at={289.6} x={C(11) + 1400} y={FL} h={400} />
        <WText lines={['SURVIVE.']} at={294.6} out={299.0} x={C(11) + 620} y={390} size={180} />
        <WText lines={['THE FIRST', '8 MINUTES']} at={300.2} out={304.2} x={C(11) + 620} y={400} size={120} />
      </Win>
      {/* 12 · the question + next time */}
      <Win from={303.7} to={SUN_LEN + 1}>
        <StarField x={C(12)} w={2200} at={304.0} n={160} />
        <WText lines={['WHERE WOULD', 'YOU GO?']} at={305.4} out={313.6} x={C(12) + 960} y={500} size={170} />
        <BlackHole x={C(12) + 1150} y={560} at={314.0} />
        <Cutout src="milo_fall" h={300} keys={[{t: 315.2, x: C(12) + 300, y: 300, r: -20, s: 1}, {t: 319.0, x: C(12) + 1100, y: 640, r: 340, s: 0.35}, {t: 320.0, x: C(12) + 1150, y: 600, r: 400, s: 0.05, o: 0}]} />
        <WText lines={['NEXT:', 'THE BLACK HOLE']} at={317.4} out={SUN_LEN} x={C(12) + 520} y={300} size={110} />
      </Win>
    </Camera>
  );
};

// ---------- cold open footage + inserts ----------
const FOOT = [
  {src: 'stock/sun.webm', from: 40, at: 0.0, end: 2.95, scale: 2.1, origin: '12% 55%', bright: 0.95},
  {src: 'stock/park.webm', from: 25, at: 3.7, end: 5.8, scale: 1.8, origin: '50% 0%', bright: 1.0},
  {src: 'stock/park.webm', from: 22, at: 5.8, end: 8.0, scale: 2.2, origin: '80% 0%', bright: 0.85},
  {src: 'stock/earth.webm', from: 0, at: 8.0, end: 13.0, scale: 1.25, origin: '30% 60%', bright: 1.0},
  {src: 'stock/earth.webm', from: 6, at: 13.0, end: 16.1, scale: 1.6, origin: '20% 70%', bright: 1.0},
  {src: 'stock/sun.webm', from: 110, at: 16.1, end: 17.4, scale: 2.1, origin: '12% 55%', bright: 0.95},
  {src: 'stock/jupiter.webm', from: 24, at: 143.0, end: 148.3, scale: 1.2, origin: '50% 50%', bright: 1.1},
  {src: 'stock/lava.webm', from: 20, at: 283.0, end: 287.1, scale: 1.35, origin: '60% 30%', bright: 1.05},
];
const FOOT_TEXT = [
  {lines: ['12:00'], at: 0.7, out: 2.9, size: 260},
  {lines: ['8:20'], at: 8.6, out: 11.9, size: 300},
  {lines: ['NOTHING', 'CHANGES'], at: 11.2, out: 12.9, size: 170},
  {lines: ['ALREADY', 'GONE.'], at: 17.1, out: 19.2, size: 230},
  {lines: ['JUPITER'], at: 143.0, out: 145.0, size: 220},
  {lines: ['HEAT FROM', 'BELOW'], at: 285.6, out: 287.0, size: 180},
];
const WIPES = [19.2, 148.2, 287.0];

const SFX: [number, string][] = [
  [0, 'deep_impact'], [0, 'shutter'], [0.7, 'wood_hit'], [2.95, 'big_impact'], [3.7, 'shutter'], [5.8, 'swoosh_accent'], [8.0, 'whoosh_cine'], [8.6, 'zoom_impact'],
  [11.2, 'wood_hit'], [13.0, 'shutter'], [16.1, 'whoosh_fast'], [17.4, 'heartbeat_impact'], [17.1, 'zoom_impact'],
  ...WIPES.flatMap((w) => [[w, 'paper_slide'], [w, 'air_woosh']] as [number, string][]),
  ...START.slice(1).filter((s) => !WIPES.some((w) => Math.abs(w - s) < 1)).map((s) => [s - 0.15, 'whoosh_fast'] as [number, string]),
  [143.0, 'shutter'], [283.0, 'shutter'], [285.6, 'zoom_impact'],
  [19.6, 'pencil'], [20.3, 'pop_whoosh'], [21.7, 'sweep_small'], [22.3, 'wood_hit'], [26.4, 'paper_slide'], [29.8, 'scribble'], [31.4, 'whoosh_cine'], [33.6, 'wood_hit'],
  [36.6, 'pop_whoosh'], [37.3, 'wood_hit'], [44.4, 'deep_impact'], [45.6, 'whoosh_fast'], [46.6, 'big_impact'], [50.0, 'pencil'], [52.3, 'pencil_short'],
  [55.9, 'zoom_impact'], [58.5, 'wood_hit'], [61.2, 'zoom_impact'], [63.3, 'pencil'], [67.7, 'pop_whoosh'], [73.4, 'pop_whoosh'], [73.7, 'pencil_short'],
  [75.7, 'tick_tock'], [78.2, 'deep_impact'], [78.2, 'shutter'], [79.6, 'wood_hit'], [82.2, 'wood_hit'], [85.3, 'pop_hard'], [86.0, 'shutter'],
  [91.9, 'wood_hit'], [96.2, 'whoosh_cine'], [98.9, 'wood_hit'], [104.7, 'zoom_impact'], [108.6, 'wood_hit'], [115.3, 'heartbeat_impact'], [117.3, 'pencil'],
  [125.3, 'wood_hit'], [131.3, 'pop_whoosh'], [132.4, 'sweep_small'], [140.2, 'pop_hard'], [149.7, 'wood_hit'], [157.6, 'heartbeat_impact'], [161.9, 'pencil_short'], [162.4, 'tick_tock'],
  [163.0, 'deep_impact'], [167.6, 'pop_whoosh'], [174.8, 'pop_whoosh'], [180.1, 'wood_hit'], [182.0, 'paper_crinkle'], [186.1, 'pencil'], [194.1, 'wood_hit'], [197.0, 'pop_whoosh'],
  [205.0, 'deep_impact'], [205.6, 'pencil'], [210.9, 'knob_spin'], [215.5, 'big_impact'], [217.5, 'pop_whoosh'], [219.1, 'air_woosh'], [220.3, 'pop_whoosh'],
  [225.1, 'wood_hit'], [227.4, 'paper_crinkle'], [232.5, 'wood_hit'], [237.7, 'wood_hit'], [246.6, 'pencil'], [252.6, 'pop_whoosh'], [256.1, 'zoom_impact'],
  [260.3, 'deep_impact'], [264.1, 'big_impact'], [274.1, 'wood_hit'], [277.8, 'wood_hit'], [287.5, 'pop_whoosh'], [289.6, 'pop_whoosh'], [294.6, 'deep_impact'],
  [300.2, 'wood_hit'], [305.4, 'big_impact'], [314.0, 'whoosh_cine'], [315.2, 'air_woosh'], [317.4, 'deep_impact'],
  ...ODDS.map((o) => [o.at + 1.4, 'heartbeat_impact'] as [number, string]),
];

export const SunVideo: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <PaperBG />
      {t >= 19.0 ? <World /> : null}
      <OddsMeter />
      <Shake at={[...FOOT_TEXT.map((x) => x.at), 2.95, 17.4]} amp={12}>
        {FOOT.map((c, i) => (
          <Sequence key={i} from={f(c.at)} durationInFrames={Math.max(1, f(c.end - c.at))}>
            <Footage src={c.src} from={c.from} dur={c.end - c.at} scale={c.scale} origin={c.origin} bright={c.bright} punchAt={i === 0 ? [0.7, 2.0] : i === 3 ? [8.6 - 8.0] : []} />
          </Sequence>
        ))}
        <Black from={2.95} to={3.7} />
        <Black from={17.4} to={19.4} />
        {FOOT_TEXT.map((x, i) => <Slam key={i} lines={x.lines} at={x.at} out={x.out} size={x.size} color={INK} shadow />)}
      </Shake>
      <Flash at={[0, 3.7, 5.8, 8.0, 13.0, 16.1, 143.0, 283.0]} />
      {WIPES.map((w) => <PaperWipe key={w} at={w} />)}
      <Grain opacity={t < 19.3 ? 0.55 : 0.4} />
      <Audio src={staticFile('narration.mp3')} />
      <Sfx list={SFX} />
    </AbsoluteFill>
  );
};
