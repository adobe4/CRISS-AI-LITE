import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, random, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Opening, OPEN_LEN} from './Opening';
import {ShotSpacetime} from './shots';
import {ShotMerger, ShotOrbit, ShotSwitch, ShotMoon, ShotJupiter, ShotRogue, ShotEarthHome, ShotBlackHole} from './shots2';
import {PlateScene, ParkScene} from './park';
import {Title, Lower, Accent, C, MONO, SANS, f, useT, Sfx} from './pro';

export const FILM_LEN = 324;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
const Cut: React.FC<{a: number; b: number; children: React.ReactNode}> = ({a, b, children}) => <Sequence from={f(a)} durationInFrames={f(b - a)}>{children}</Sequence>;

/** Plate with a slow push; x/y are plate-pixel focus points, z zoom. */
const Plate: React.FC<{src: string; dur: number; x0?: number; y0?: number; z0?: number; x1?: number; y1?: number; z1?: number; next?: {src: string; at: number; fade?: number}; night?: boolean; birds?: boolean; children?: React.ReactNode}> = ({src, dur, x0 = 688, y0 = 384, z0 = 1.0, x1, y1, z1 = 1.12, next, night = true, birds, children}) => (
  <AbsoluteFill>
    <PlateScene plate={src} dur={dur} night={night} birds={birds} next={next} cam={{from: {x: x0, y: y0, z: z0}, to: {x: x1 ?? x0, y: y1 ?? y0, z: z1}}} />
    {children}
  </AbsoluteFill>
);

/* ---------- atmosphere particles ---------- */
const Particles: React.FC<{n?: number; kind: 'snow' | 'motes' | 'bubbles'}> = ({n = 90, kind}) => {
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
const Odds: React.FC<{at: number; out: number; from: number; to: number}> = ({at, out, from, to}) => {
  const t = useT(); if (t < at || t > out) return null;
  const o = interpolate(t, [at, at + 0.3, out - 0.3, out], [0, 1, 1, 0], cl);
  const p = interpolate(t, [at + 0.35, at + 1.5], [0, 1], {...cl, easing: ease});
  const v = Math.round(from + (to - from) * p);
  const slide = interpolate(t, [at, at + 0.5], [60, 0], {...cl, easing: ease});
  const low = v <= 40;
  return (
    <div style={{position: 'absolute', left: 120, top: 240, width: 720, opacity: o, transform: `translateX(${-slide}px)`}}>
      <div style={{background: 'rgba(11,10,9,0.82)', padding: '38px 48px 46px', borderLeft: `10px solid ${C.red}`, boxShadow: '0 30px 80px rgba(0,0,0,0.5)'}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 46, letterSpacing: 8, color: C.dim, textTransform: 'uppercase'}}>Milo's survival odds</div>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 230, lineHeight: 1, color: low ? C.red : C.white, marginTop: 10}}>{v}%</div>
        <div style={{height: 22, background: 'rgba(239,233,223,0.16)', marginTop: 26}}>
          <div style={{height: '100%', width: `${v}%`, background: C.red}} />
        </div>
      </div>
    </div>
  );
};

/* ---------- temperature readout ---------- */
const Temp: React.FC<{at: number; out: number; from: number; to: number; label: string; ramp?: number}> = ({at, out, from, to, label, ramp = 3}) => {
  const t = useT(); if (t < at || t > out) return null;
  const o = interpolate(t, [at, at + 0.3, out - 0.3, out], [0, 1, 1, 0], cl);
  const v = Math.round(interpolate(t, [at + 0.3, at + 0.3 + ramp], [from, to], {...cl, easing: Easing.inOut(Easing.cubic)}));
  const fill = interpolate(v, [-80, 30], [0.04, 1], cl);
  return (
    <div style={{position: 'absolute', right: 120, top: 200, display: 'flex', alignItems: 'center', gap: 44, opacity: o, background: 'rgba(11,10,9,0.82)', padding: '40px 50px', borderRight: `10px solid ${C.red}`, boxShadow: '0 30px 80px rgba(0,0,0,0.5)'}}>
      <div style={{textAlign: 'right'}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 46, letterSpacing: 8, color: C.dim, textTransform: 'uppercase'}}>{label}</div>
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
const Side: React.FC<{lines: React.ReactNode[]; at: number; out: number; size?: number; kicker?: string; mono?: boolean}> = ({lines, at, out, size = 130, kicker, mono}) => {
  const fr = useCurrentFrame(); if (fr < f(at) || fr > f(out)) return null;
  const bar = interpolate(fr, [f(at), f(at) + 14], [0, 80], {...cl, easing: ease});
  return (
    <div style={{position: 'absolute', left: 120, top: 540, transform: 'translateY(-50%)', maxWidth: 820, textShadow: '0 4px 30px rgba(0,0,0,0.7)'}}>
      {kicker ? <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 14}}>
        <div style={{width: bar, height: 6, background: C.red}} />
        <SideLine text={kicker} start={f(at) + 3} end={f(out)} style={{whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 700, fontSize: 46, letterSpacing: 8, color: C.dim, textTransform: 'uppercase'}} />
      </div> : null}
      {lines.map((l, i) => <SideLine key={i} text={l} start={f(at) + 5 + i * 4} end={f(out)} style={{whiteSpace: 'nowrap', fontFamily: mono ? MONO : SANS, fontWeight: mono ? 700 : 800, fontSize: size, lineHeight: 1.04, letterSpacing: mono ? 0 : -2, color: C.white}} />)}
    </div>
  );
};

/* ---------- big figure ---------- */
const Figure: React.FC<{at: number; out: number; big: React.ReactNode; small: string; y?: number}> = ({at, out, big, small, y = 170}) => {
  const t = useT(); if (t < at || t > out) return null;
  const o = interpolate(t, [at, at + 0.35, out - 0.3, out], [0, 1, 1, 0], cl); const dy = interpolate(t, [at, at + 0.5], [24, 0], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: o, transform: `translateY(${dy}px)`, textShadow: '0 6px 30px rgba(0,0,0,0.75)'}}>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 130, color: C.white, letterSpacing: -1}}>{big}</div>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 48, letterSpacing: 9, color: C.dim, textTransform: 'uppercase', marginTop: 6}}>{small}</div>
    </div>
  );
};

/* ---------- chapter card (DAY 1, MONTH 2…) ---------- */
const Chapter: React.FC<{at: number; label: string; sub: string}> = ({at, label, sub}) => {
  const t = useT(); const out = at + 2.2; if (t < at || t > out) return null;
  const o = interpolate(t, [at, at + 0.2, out - 0.35, out], [0, 1, 1, 0], cl);
  const w = interpolate(t, [at, at + 0.6], [0, 520], {...cl, easing: ease});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: o, background: 'rgba(11,10,9,0.45)'}}>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 46, letterSpacing: 14, color: C.dim, textTransform: 'uppercase'}}>{sub}</div>
      <div style={{width: w, height: 6, background: C.red, margin: '22px 0 18px'}} />
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 210, letterSpacing: -4, color: C.white, lineHeight: 1}}>{label}</div>
    </AbsoluteFill>
  );
};

/* ---------- story clock: real seconds → story seconds since the Sun vanished ---------- */
const D = 86400, H = 3600;
const CLOCK: [number, number][] = [
  [45.3, 43.05], [74.7, 496], [78.7, 500], [142.5, 563.8], [159.4, H], [162.6, H + 3],
  [163.6, 6 * H], [204.0, 20 * H], [205.6, 6 * D + 10 * H], [224.6, 6.6 * D], [226.0, 59 * D + 4 * H], [259.6, 60 * D],
  [261.0, 365 * D + 2 * H], [299.0, 365.4 * D],
];
const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');
const StoryClock: React.FC = () => {
  const t = useT(); if (t < OPEN_LEN || t > 299.2) return null;
  const s = interpolate(t, CLOCK.map((c) => c[0]), CLOCK.map((c) => c[1]), cl);
  const d = Math.floor(s / D), h = (s % D) / H, m = (s % H) / 60, sec = s % 60;
  const blink = Math.floor(t * 2) % 2 === 0 ? 1 : 0.25;
  const o = interpolate(t, [299.0, 299.2], [1, 0], cl);
  return (
    <div style={{position: 'absolute', left: 90, top: 70, opacity: o}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: 7, color: C.dim, textShadow: '0 2px 16px rgba(0,0,0,0.8)'}}>
        <div style={{width: 22, height: 22, borderRadius: 11, background: C.red, opacity: blink}} /> SUN OFFLINE
      </div>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 72, color: C.white, marginTop: 4, textShadow: '0 2px 20px rgba(0,0,0,0.8)'}}>
        T+ {d > 0 ? `${d}D ` : ''}{pad(h)}:{pad(m)}:{pad(sec)}
      </div>
    </div>
  );
};

/* ---------- music: one track looped with a crossfade ---------- */
const MUSIC_LEN = 229.85, LOOP_AT = 214, LOOP_FROM = 48, XF = 12;
const FilmMusic: React.FC<{duck: [number, number][]; vol?: number}> = ({duck, vol = 0.11}) => {
  const dk = (t: number) => { let v = 1; for (const [a, b] of duck) v *= 1 - interpolate(t, [a, a + 0.1, b - 0.6, b], [0, 1, 1, 0], cl); return v; };
  return (<>
    <Audio src={staticFile('music.mp3')} endAt={f(MUSIC_LEN)} volume={(fr) => { const t = fr / 30; return vol * dk(t) * interpolate(t, [0, 2, LOOP_AT, LOOP_AT + XF], [0, 1, 1, 0], cl); }} />
    <Sequence from={f(LOOP_AT)}>
      <Audio src={staticFile('music.mp3')} startFrom={f(LOOP_FROM)} volume={(fr) => { const t = fr / 30 + LOOP_AT; return vol * dk(t) * interpolate(t, [LOOP_AT, LOOP_AT + XF, FILM_LEN - 4, FILM_LEN], [0, 1, 1, 0], cl); }} />
    </Sequence>
  </>);
};

const Grain: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity: 0.22, mixBlendMode: 'overlay'}}>
    <Img src={staticFile(`grain/g${Math.floor(useCurrentFrame() / 2) % 6}.png`)} style={{width: '100%', height: '100%'}} />
  </AbsoluteFill>
);

const BITE = 'art/park_milo_bite_patch.png', LOOK = 'art/park_milo_look_patch.png';

export const Film: React.FC = () => (
  <AbsoluteFill style={{background: C.bg}}>
    <Cut a={0} b={OPEN_LEN}><Opening audio={false} /></Cut>

    {/* ===== proof: gravity travels at light speed ===== */}
    <Cut a={45.3} b={50.0}><ShotMerger mergeAt={1.2} dur={4.7} /></Cut>
    <Cut a={50.0} b={51.9}><Plate src="art/observatory.png" dur={1.9} z0={1.05} z1={1.15} /></Cut>
    <Cut a={51.9} b={55.5}><Plate src="art/ligo.png" dur={3.6} z0={1.0} z1={1.14} /></Cut>
    <Cut a={55.5} b={63.2}><ShotSpacetime vanishAt={0.3} dur={7.7} /></Cut>
    <Cut a={63.2} b={67.7}><ShotOrbit dur={4.5} sunOn={0} camFrom={[0, 6, 10]} camTo={[3, 4, 8]} /></Cut>

    {/* ===== back in the park ===== */}
    <Cut a={67.7} b={72.0}><ParkScene plate="art/park_milo_eat.png" dur={4.3} birds patches={[{src: BITE, from: 0.5, to: 1.6}, {src: BITE, from: 2.6, to: 3.5}]} cam={{from: {x: 900, y: 400, z: 1.2}, to: {x: 960, y: 400, z: 1.38}}} /></Cut>
    <Cut a={72.0} b={75.7}><ShotMoon offAt={99} dur={3.7} /></Cut>
    <Cut a={75.7} b={78.0}><ParkScene plate="art/park_milo_eat.png" dur={2.3} patches={[{src: LOOK, from: 0, to: 2.4}]} cam={{from: {x: 1010, y: 390, z: 2.0}, to: {x: 1010, y: 385, z: 2.25}}} /></Cut>
    <Cut a={78.0} b={81.8}><ParkScene plate="art/park_milo_eat.png" dur={3.8} next={{src: 'art/park_night.png', at: 0.7, fade: 0.05}} cam={{from: {x: 760, y: 360, z: 1.0}, to: {x: 900, y: 380, z: 1.12}}} /></Cut>
    <Cut a={81.8} b={86.9}><ShotSwitch offAt={3.9} dur={5.1} /></Cut>
    <Cut a={86.9} b={94.1}><ParkScene plate="art/park_night_empty.png" dur={7.2} night cam={{from: {x: 688, y: 300, z: 1.25}, to: {x: 688, y: 420, z: 1.0}}} /></Cut>

    {/* ===== Earth lets go ===== */}
    <Cut a={94.1} b={107.1}><ShotOrbit dur={13} sunOn={0} leaveAt={1.7} camFrom={[0, 6.5, 10]} camTo={[5, 3.5, 8]} /></Cut>
    <Cut a={107.1} b={112.5}><ParkScene plate="art/park_night.png" dur={5.4} night cam={{from: {x: 980, y: 400, z: 1.5}, to: {x: 1000, y: 400, z: 1.75}}} /></Cut>
    <Cut a={112.5} b={126.5}><ShotMoon offAt={11.8} dur={14} /></Cut>
    <Cut a={126.5} b={131.0}><ParkScene plate="art/park_night.png" dur={4.5} night cam={{from: {x: 960, y: 390, z: 1.7}, to: {x: 960, y: 390, z: 1.85}}} /></Cut>
    <Cut a={131.0} b={142.5}><ParkScene plate="art/park_night_empty.png" dur={11.5} night cam={{from: {x: 688, y: 420, z: 1.1}, to: {x: 640, y: 200, z: 1.5}}} /></Cut>
    <Cut a={142.5} b={159.4}><ShotJupiter offAt={15.6} dur={16.9} /></Cut>
    <Cut a={159.4} b={163.0}><ParkScene plate="art/park_night.png" dur={3.6} night cam={{from: {x: 1000, y: 400, z: 1.3}, to: {x: 900, y: 380, z: 1.0}}} /></Cut>

    {/* ===== day one ===== */}
    <Cut a={163.0} b={174.8}><Plate src="art/birds_sleep.png" dur={11.8} z0={1.0} z1={1.2} /></Cut>
    <Cut a={174.8} b={184.4}><Plate src="art/plant_1.png" dur={9.6} z0={1.05} z1={1.2} next={{src: 'art/plant_2.png', at: 6.0, fade: 2.0}} /></Cut>
    <Cut a={184.4} b={197.0}><Plate src="art/oak_night.png" dur={12.6} y0={500} y1={300} z0={1.25} z1={1.05} /></Cut>
    <Cut a={197.0} b={204.9}><Plate src="art/deer_forest.png" dur={7.9} z0={1.0} z1={1.15} /></Cut>

    {/* ===== day seven: the freeze ===== */}
    <Cut a={204.9} b={219.1}><Plate src="art/park_night_empty.png" dur={14.2} z0={1.0} z1={1.15} next={{src: 'art/park_frozen.png', at: 4.5, fade: 4.0}}><Sequence from={f(6)}><Particles kind="snow" n={110} /></Sequence></Plate></Cut>
    <Cut a={219.1} b={225.1}><Plate src="art/beach_snow.png" dur={6} z0={1.0} z1={1.12}><Particles kind="snow" n={130} /></Plate></Cut>

    {/* ===== month two: the ocean ===== */}
    <Cut a={225.1} b={231.4}><Plate src="art/ocean_ice.png" dur={6.3} z0={1.0} z1={1.12}><Particles kind="snow" n={70} /></Plate></Cut>
    <Cut a={231.4} b={243.3}><Plate src="art/ocean_section.png" dur={11.9} y0={250} y1={520} z0={1.2} z1={1.3}><Particles kind="motes" n={120} /></Plate></Cut>
    <Cut a={243.3} b={260.3}><Plate src="art/vents.png" dur={17} z0={1.0} z1={1.25}><Particles kind="bubbles" n={70} /><Particles kind="motes" n={90} /></Plate></Cut>

    {/* ===== year one: rogue planet ===== */}
    <Cut a={260.3} b={277.7}><ShotRogue dur={17.4} /></Cut>
    <Cut a={277.7} b={288.2}><Plate src="art/shelter_milo.png" dur={10.5} z0={1.0} z1={1.18} /></Cut>
    <Cut a={288.2} b={299.4}><Plate src="art/greenhouse_milo.png" dur={11.2} z0={1.0} z1={1.2} /></Cut>
    <Cut a={299.4} b={304.3}><ParkScene plate="art/park_milo_eat.png" dur={4.9} birds cam={{from: {x: 960, y: 400, z: 1.4}, to: {x: 760, y: 380, z: 1.0}}} /></Cut>
    <Cut a={304.3} b={313.8}><ShotEarthHome dur={9.5} /></Cut>
    <Cut a={313.8} b={FILM_LEN}><ShotBlackHole dur={FILM_LEN - 313.8} miloFrom={0.8} /></Cut>

    {/* ===== typography ===== */}
    <Lower kicker="2017 · 130 million light-years away" head="Two dead stars collide" at={45.6} out={49.8} size={100} />
    <Lower kicker="Telescopes" head="caught the flash" at={50.1} out={51.8} />
    <Lower kicker="Detectors" head="caught the ripple" at={52.0} out={55.3} />
    <Figure at={55.7} out={59.0} big="< 2 SECONDS" small="apart" />
    <Figure at={58.2} out={61.0} big="130,000,000" small="years of travel" y={640} />
    <Title lines={['Gravity moves at', 'the speed of light.']} at={61.3} out={63.1} size={118} y={480} />
    <Lower kicker="For 8 minutes" head={<>Earth orbits <Accent>nothing</Accent></>} at={63.6} out={67.6} />
    <Odds at={69.3} out={72.0} from={100} to={100} />
    <Side lines={['Remember', 'the Moon.']} at={72.3} out={75.6} size={150} />
    <Lower kicker="Light arrives" head="12:08:20" at={75.8} out={77.9} mono size={170} />
    <Side lines={['Not slowly.', 'All at once.']} at={79.2} out={81.7} size={130} />
    <Side lines={['Like a', 'switch.']} at={84.8} out={86.8} size={150} />
    <Lower kicker="No sunlight" head={<>No <Accent>blue sky</Accent></>} at={91.9} out={94.0} />
    <Lower kicker="4.5 billion years" head="The pole is gone" at={97.3} out={101.4} />
    <Figure at={104.3} out={107.0} big="30 KM / SECOND" small="in a straight line" />
    <Side lines={['Milo feels', 'nothing.']} at={107.2} out={110.5} size={140} />
    <Lower kicker="The Moon is just" head="a mirror" at={118.9} out={123.9} />
    <Lower kicker="Then the mirror" head={<>goes <Accent red>blank</Accent></>} at={124.4} out={126.4} />
    <Odds at={126.6} out={130.8} from={100} to={90} />
    <Title lines={['Stars.', 'At noon.']} at={132.4} out={136.8} size={150} y={540} />
    <Side kicker="Still shining" lines={['Jupiter']} at={142.7} out={147.6} size={170} />
    <Side kicker="Last sunlight, reflected" lines={['30–60', 'minutes']} at={148.9} out={156.9} size={170} mono />
    <Lower kicker="Now it's just" head="Milo, the dark and a clock" at={159.5} out={162.9} size={96} />
    <Chapter at={163.0} label="DAY 1" sub="Sun offline" />
    <Title lines={['Silence.']} at={167.3} out={172.0} size={170} y={300} />
    <Title lines={['Forever.']} at={173.8} out={174.7} size={170} y={300} />
    <Lower kicker="No light" head="No food" at={180.1} out={184.2} size={140} />
    <Lower kicker="Big old trees" head="could last decades" at={191.8} out={196.8} />
    <Odds at={202.6} out={204.8} from={90} to={70} />
    <Chapter at={204.9} label="DAY 7" sub="Sun offline" />
    <Temp at={210.9} out={219.0} from={15} to={-18} label="Surface average" ramp={3.5} />
    <Lower kicker="Colder than" head="a freezer" at={217.5} out={219.0} />
    <Lower kicker="Everywhere" head="even here" at={219.3} out={222.7} size={130} />
    <Odds at={222.9} out={225.0} from={70} to={40} />
    <Chapter at={225.1} label="MONTH 2" sub="Sun offline" />
    <Lower kicker="Month two" head="The ocean freezes" at={227.4} out={231.2} />
    <Title lines={['Ice floats.']} at={231.5} out={234.2} size={160} y={250} />
    <Lower kicker="A lid of ice" head="keeps the deep ocean liquid" at={234.4} out={243.1} size={90} />
    <Lower kicker="Cracks in the sea floor" head="Hydrothermal vents" at={247.9} out={253.8} size={104} />
    <Lower kicker="Life down here" head={<>needs <Accent red>no sun</Accent></>} at={254.5} out={260.1} size={130} />
    <Chapter at={260.3} label="YEAR 1" sub="Sun offline" />
    <Temp at={262.4} out={270.0} from={-18} to={-73} label="Surface average" ramp={3.2} />
    <Lower kicker="Earth is now a" head={<><Accent red>rogue</Accent> planet</>} at={273.2} out={277.5} size={130} />
    <Lower kicker="Where heat rises" head="from underground" at={282.9} out={288.0} />
    <Title lines={['Not live well.', 'Survive.']} at={293.5} out={295.5} size={130} y={260} />
    <Odds at={295.6} out={299.3} from={40} to={5} />
    <Lower kicker="Unless he moved in" head="the first 8 minutes" at={300.2} out={304.2} />
    <Side kicker="8 minutes. Your move." lines={['Where would', 'you go?']} at={307.2} out={312.0} size={124} />
    <Lower kicker="Tell me in" head="the comments" at={312.1} out={313.7} />
    <Lower kicker="Next time" head="Into a black hole" at={314.2} out={318.6} size={130} />
    <Lower kicker="Milo has" head={<Accent red>one hour</Accent>} at={318.7} out={FILM_LEN - 0.2} size={150} />

    <StoryClock />
    <Grain />

    {/* ===== sound ===== */}
    <Audio src={staticFile('narration.mp3')} />
    <FilmMusic duck={[[2.2, 3.8], [77.8, 79.6], [85.5, 87.0], [124.1, 125.6], [157.9, 159.5]]} />
    <Sequence from={f(19.3)} durationInFrames={f(26)}><Audio src={staticFile('sfx2/space_drone.wav')} volume={0.05} /></Sequence>
    <Sequence from={f(94.1)} durationInFrames={f(13)}><Audio src={staticFile('sfx2/space_drone.wav')} volume={0.05} /></Sequence>
    <Sequence from={f(260.3)} durationInFrames={f(17.4)}><Audio src={staticFile('sfx2/space_drone.wav')} volume={0.05} /></Sequence>
    <Sfx list={[
      // opening
      [0.3, 'quindar_in'], [0.9, 'riser'], [2.25, 'sub_impact'], [2.25, 'crackle'],
      [3.7, 'whoosh_real'], [8.0, 'quindar_in'], [8.6, 'geiger'], [16.0, 'riser'], [17.0, 'sub_impact'],
      [19.3, 'quindar_out'], [29.7, 'sub_impact'], [31.2, 'whoosh_real'], [35.0, 'whoosh_real'], [36.7, 'quindar_in'], [43.2, 'riser'], [44.2, 'sub_impact'],
      // rest
      [46.5, 'sub_impact'], [46.5, 'crackle'], [55.5, 'whoosh_real'], [69.3, 'geiger'], [76.5, 'riser'], [78.7, 'sub_impact'],
      [85.7, 'sub_impact'], [94.1, 'whoosh_real'], [124.3, 'sub_impact'], [126.6, 'geiger'], [158.1, 'sub_impact'],
      [163.0, 'quindar_in'], [202.6, 'geiger'], [204.9, 'quindar_in'], [222.9, 'geiger'], [225.1, 'quindar_in'],
      [260.3, 'quindar_in'], [295.6, 'geiger'], [304.3, 'whoosh_real'], [313.8, 'riser'], [318.7, 'sub_impact'],
    ]} />
  </AbsoluteFill>
);
