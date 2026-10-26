import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {PaperBG, Grain, Footage, Flash, Shake, Slam, Cutout, DrawSvg, Stroke, scribblePath, Camera, Sfx, f, PAPER, INK, useT, fontFamily} from './kit';
import stopwatch from './svg_stopwatch.json';
import fibre from './svg_fibre.json';
import bbStand from './svg_bb_stand.json';
import normalGuy from './svg_normal_guy.json';

export const PILOT_LEN = 45.2;
export const PILOT_SFX_EXPORT = () => SFX;

// ---------------- footage montage (0 - 13s) ----------------
type Cut = {src: string; from: number; at: number; end: number; scale: number; origin: string; punch?: number[]; bright?: number};
const CUTS: Cut[] = [
  {src: 'stock/march1_480.webm', from: 41.0, at: 0.0, end: 1.04, scale: 1.35, origin: '35% 75%', bright: 1.35},
  {src: 'stock/march1_480.webm', from: 24.0, at: 1.04, end: 2.2, scale: 1.5, origin: '15% 95%', bright: 1.15},
  {src: 'stock/march1_480.webm', from: 38.0, at: 2.2, end: 3.56, scale: 1.3, origin: '35% 90%', bright: 1.15},
  {src: 'stock/march1_480.webm', from: 25.2, at: 3.56, end: 6.0, scale: 1.9, origin: '30% 85%', punch: [3.56, 4.74], bright: 1.15},
  {src: 'stock/deadlift.webm', from: 20.6, at: 6.0, end: 7.6, scale: 1.2, origin: '50% 60%'},
  {src: 'stock/deadlift.webm', from: 60.0, at: 7.6, end: 9.8, scale: 1.25, origin: '50% 70%', punch: [8.68, 8.92, 9.16]},
  {src: 'stock/sdc.webm', from: 26.2, at: 9.8, end: 13.2, scale: 1.25, origin: '45% 60%', punch: [10.46]},
];

const Montage: React.FC = () => (
  <AbsoluteFill>
    <Shake at={[1.04, 4.74, 8.68, 8.92, 9.16, 10.46]}>
      {CUTS.map((c, i) => (
        <Sequence key={i} from={f(c.at)} durationInFrames={f(c.end - c.at)}>
          <Footage src={c.src} from={c.from} dur={c.end - c.at} scale={c.scale} origin={c.origin} bright={c.bright} punchAt={(c.punch ?? []).map((p) => p - c.at)} />
        </Sequence>
      ))}
      <Slam lines={['70 KG']} at={1.04} out={2.18} size={260} color={PAPER} shadow />
      <Slam lines={['HALF HIS', 'BODY WEIGHT']} at={4.74} out={5.98} size={200} color={PAPER} shadow />
      <Slam lines={['×1']} at={8.68} out={8.91} size={300} color={PAPER} shadow />
      <Slam lines={['×2']} at={8.92} out={9.15} size={300} color={PAPER} shadow />
      <Slam lines={['×3']} at={9.16} out={9.78} size={300} color={PAPER} shadow />
      <Slam lines={['90 LB', 'SLED']} at={10.46} out={12.5} size={230} color={PAPER} shadow />
    </Shake>
    <Flash at={[0, 1.04, 2.2, 3.56, 6.0, 7.6, 9.8]} />
  </AbsoluteFill>
);

// torn paper sheet wiping over the footage
const PaperWipe: React.FC<{at: number}> = ({at}) => {
  const t = useT();
  const p = interpolate(t, [at, at + 0.55], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const x = 2000 - p * 2400;
  let pts = '';
  for (let i = 0; i <= 40; i++) pts += `${(random('tear' + i) * 60).toFixed(0)}px ${(i * 27).toFixed(0)}px, `;
  const clip = `polygon(${pts} 3000px 1080px, 3000px 0px)`;
  return (
    <AbsoluteFill style={{transform: `translateX(${x}px) rotate(${(1 - p) * 4}deg)`}}>
      <div style={{position: 'absolute', left: 0, top: -40, width: 3000, height: 1160, clipPath: clip, filter: 'drop-shadow(-12px 0 18px rgba(0,0,0,0.45))'}}>
        <Img src={staticFile('cut/paper.jpg')} style={{width: 3000, height: 1160, objectFit: 'cover'}} />
      </div>
    </AbsoluteFill>
  );
};

// ---------------- paper world (13s - 45s) ----------------
const S2 = 0, S3 = 1920, S4 = 3840, S5 = 5760, S6 = 7680;
const FLOOR = 930;

const stairs = (() => {
  let d = 'M 0 0';
  for (let i = 0; i < 5; i++) d += ` h 150 v -95`;
  return d + ' h 200';
})();

const Sweat: React.FC<{at: number; x: number; y: number}> = ({at, x, y}) => {
  const t = useT();
  if (t < at || t > at + 0.9) return null;
  const k = (t - at) / 0.9;
  return (
    <svg style={{position: 'absolute', left: x + k * 30, top: y + k * 120, opacity: 1 - k, overflow: 'visible'}} width={30} height={40}>
      <path d="M15 0 C 22 14, 28 22, 28 28 A 13 13 0 0 1 2 28 C 2 22, 8 14, 15 0 Z" fill={INK} />
    </svg>
  );
};

const Hand: React.FC<{cx: number; cy: number; r: number; start: number; stop: number}> = ({cx, cy, r, start, stop}) => {
  const t = useT();
  if (t < start) return null;
  const tt = Math.min(t, stop);
  const ang = (tt - start) * 300; // degrees
  return (
    <svg style={{position: 'absolute', left: cx - r, top: cy - r, overflow: 'visible'}} width={r * 2} height={r * 2}>
      <line x1={r} y1={r} x2={r} y2={r * 0.12} stroke={INK} strokeWidth={9} strokeLinecap="round" transform={`rotate(${ang} ${r} ${r})`} />
      <circle cx={r} cy={r} r={14} fill={INK} />
    </svg>
  );
};

const GridSquare: React.FC<{x: number; y: number; start: number; out: number}> = ({x, y, start, out}) => {
  const t = useT();
  if (t < start || t > out + 0.3) return null;
  const p = interpolate(t, [start, start + 0.4], [0, 1], {extrapolateRight: 'clamp'});
  const o = interpolate(t, [out, out + 0.3], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const s = 70;
  return (
    <svg style={{position: 'absolute', left: x - s / 2, top: y - s / 2, overflow: 'visible', opacity: o}} width={s} height={s}>
      <rect x={0} y={0} width={s} height={s} fill="none" stroke={INK} strokeWidth={5} strokeDasharray={4 * s} strokeDashoffset={4 * s * (1 - p)} />
    </svg>
  );
};

const World: React.FC = () => (
  <Camera keys={[
    {t: 0, x: S2 + 960, y: 540, z: 1},
    {t: 18.4, x: S3 + 960, y: 540, z: 1},
    {t: 20.4, x: S3 + 960, y: 540, z: 1},
    {t: 22.6, x: S3 + 1000, y: 430, z: 1},
    {t: 23.4, x: S4 + 960, y: 540, z: 1},
    {t: 28.8, x: S5 + 960, y: 540, z: 1},
    {t: 32.9, x: S5 + 760, y: 470, z: 2.6},
    {t: 34.0, x: S5 + 760, y: 470, z: 2.6},
    {t: 35.2, x: S5 + 960, y: 540, z: 1},
    {t: 38.5, x: S6 + 960, y: 540, z: 1},
  ]}>
    {/* scene 2: soldier vs ghost bodybuilder */}
    <Cutout src="soldier_stand" h={760} breathe keys={[{t: 13.4, x: S2 - 400, y: FLOOR, r: -8}, {t: 14.0, x: S2 + 560, y: FLOOR, r: 0}]} />
    <DrawSvg data={bbStand} cx={S2 + 1380} cy={FLOOR - 390} h={780} start={15.0} end={16.0} ghost out={17.2} />
    <Stroke d={scribblePath(560, 700, 9, 'x1')} x={S2 + 1100} y={FLOOR - 760} start={16.1} end={16.6} w={16} out={17.2} />

    {/* scene 3: bodybuilder up the stairs */}
    <Stroke d={stairs} x={S3 + 380} y={FLOOR} start={18.0} end={18.9} w={10} />
    <Cutout src="bb_bags" h={470} keys={[
      {t: 19.0, x: S3 - 300, y: FLOOR, r: -6},
      {t: 19.6, x: S3 + 300, y: FLOOR, r: 0},
      {t: 20.4, x: S3 + 300, y: FLOOR},
      {t: 20.9, x: S3 + 605, y: FLOOR - 95, r: 3},
      {t: 21.45, x: S3 + 755, y: FLOOR - 190, r: -2},
      {t: 22.0, x: S3 + 905, y: FLOOR - 285, r: 3},
      {t: 22.6, x: S3 + 1055, y: FLOOR - 380, r: -2},
    ]} />
    <Sweat at={20.65} x={S3 + 660} y={FLOOR - 95 - 420} />
    <Sweat at={21.25} x={S3 + 810} y={FLOOR - 190 - 420} />
    <Sweat at={21.85} x={S3 + 960} y={FLOOR - 285 - 420} />

    {/* scene 4: not genetics, not a pill */}
    <Cutout src="dna" h={620} keys={[{t: 24.6, x: S4 + 650, y: -200, r: -10}, {t: 25.0, x: S4 + 650, y: FLOOR - 40, r: -4}]} />
    <Stroke d={scribblePath(380, 560, 8, 'dna')} x={S4 + 460} y={FLOOR - 640} start={25.15} end={25.55} w={18} />
    <Cutout src="pill" h={380} keys={[{t: 26.0, x: S4 + 1300, y: -200, r: 14}, {t: 26.4, x: S4 + 1300, y: FLOOR - 120, r: 3}]} />
    <Stroke d={scribblePath(460, 340, 8, 'pill')} x={S4 + 1070} y={FLOOR - 480} start={27.05} end={27.45} w={18} />

    {/* scene 5: the fibre study */}
    <DrawSvg data={fibre} cx={S5 + 760} cy={500} h={720} start={28.4} end={30.3} fillAt={30.0} out={37.6} raster="fibre" />
    <Cutout src="magnifier" h={520} keys={[{t: 30.5, x: S5 + 1500, y: 1300, r: 25, o: 1}, {t: 31.0, x: S5 + 1020, y: 860, r: 0}, {t: 32.2, x: S5 + 1060, y: 880, r: 4}, {t: 32.5, x: S5 + 1700, y: 1400, r: 20, o: 0}]} />
    <GridSquare x={S5 + 760} y={470} start={32.7} out={34.4} />
    <DrawSvg data={normalGuy} cx={S5 + 1520} cy={560} h={760} start={35.0} end={36.2} fillAt={36.3} out={37.6} raster="normal_guy" />

    {/* scene 6: Rook and the carry test */}
    <Cutout src="rook_jugs" h={720} walk={2.2} keys={[{t: 39.6, x: S6 - 300, y: FLOOR}, {t: 41.3, x: S6 + 620, y: FLOOR}]} />
    <DrawSvg data={stopwatch} cx={S6 + 1320} cy={560} h={600} start={41.1} end={41.8} fillAt={41.75} raster="stopwatch" />
    <Hand cx={S6 + 1320} cy={600} r={175} start={41.8} stop={43.54} />
  </Camera>
);

const SFX: [number, string][] = [
  [0, 'deep_impact'], [0, 'shutter'], [1.04, 'wood_hit'], [2.2, 'whoosh_fast'], [3.56, 'zoom_impact'], [4.74, 'big_impact'],
  [6.0, 'shutter'], [6.0, 'swoosh_accent'], [7.6, 'zoom_impact'], [8.68, 'wood_hit'], [8.92, 'wood_hit'], [9.16, 'wood_hit'],
  [9.8, 'whoosh_cine'], [10.46, 'deep_impact'], [12.5, 'paper_slide'], [12.5, 'air_woosh'], [13.4, 'paper_quick'],
  [15.0, 'pencil'], [16.1, 'scribble'], [17.85, 'whoosh_fast'], [18.0, 'pencil_short'], [19.0, 'paper_slide'],
  [20.4, 'wood_hit'], [20.95, 'wood_hit'], [21.5, 'wood_hit'], [22.05, 'wood_hit'], [20.6, 'pop_whoosh'], [21.3, 'pop_whoosh'], [22.0, 'pop_whoosh'],
  [22.85, 'whoosh_fast'], [23.0, 'pencil_short'], [24.95, 'wood_hit'], [25.15, 'scribble'], [26.35, 'wood_hit'], [27.05, 'scribble'],
  [28.2, 'page_turn'], [28.25, 'whoosh_cine'], [28.4, 'pencil'], [29.6, 'pencil'], [30.5, 'swoosh_accent'], [31.42, 'heartbeat_impact'],
  [32.28, 'zoom_impact'], [32.6, 'pop_hard'], [34.62, 'air_woosh'], [35.0, 'pencil'], [36.3, 'pop_whoosh'], [37.9, 'whoosh_cine'],
  [39.6, 'paper_slide'], [41.1, 'pencil_short'], [41.44, 'wood_hit'], [41.8, 'tick_tock'], [43.54, 'deep_impact'],
];

export const Pilot: React.FC<{inFull?: boolean}> = ({inFull}) => {
  const t = useT();
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <PaperBG />
      <>
        <World />
        {/* screen-space words over the paper world */}
        <Slam lines={['NOT EVEN', 'CLOSE.']} at={16.08} out={17.7} size={150} top={70} />
        <Slam lines={['?']} at={22.96} out={24.45} size={560} />
        <Slam lines={['WEAKER.']} at={31.42} out={32.25} size={230} top={40} />
        <Slam lines={['PER MM²']} at={32.6} out={34.5} size={230} top={60} />
        <Slam lines={['THE CARRY', 'TEST']} at={41.44} out={45.2} size={170} top={50} />
      </>
      <Sequence durationInFrames={f(13.2)}>
        <Montage />
      </Sequence>
      <Sequence from={f(12.5)} durationInFrames={f(1.2)}>
        <PaperWipe at={0} />
      </Sequence>
      {inFull ? null : <><Grain opacity={t < 12.9 ? 0.55 : 0.3} /><Audio src={staticFile('narration-clean.mp3')} /></>}
      <Sfx list={SFX} />
    </AbsoluteFill>
  );
};
