// What If 02: "You Have 1 Hour Before Falling Into a Black Hole". Times are absolute seconds in the narration.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, random, staticFile, useCurrentFrame, Easing} from 'remotion';
import {ShotBH, ShotBurn, ShotOrbitDrop, ShotSpeed, ShotDrone, ShotPhotonSphere, ShotOldLight, ShotFuture, ShotSpaghetti} from './bh';
import {Plate, Odds, Chapter, Grain, Cut} from './cards';
import {C, MONO, SANS, f, useT, Sfx, Lower} from './pro';

export const FILM2_LEN = 438;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
const A = (n: string) => `art/${n}.png`;

/** Bottom-left number card (same family as the odds card). */
const NumCard: React.FC<{at: number; out: number; label: string; children: React.ReactNode}> = ({at, out, label, children}) => {
  const t = useT(); if (t < at || t > out) return null;
  const o = interpolate(t, [at, at + 0.3, out - 0.3, out], [0, 1, 1, 0], cl); const slide = interpolate(t, [at, at + 0.5], [60, 0], {...cl, easing: ease});
  return (
    <div style={{position: 'absolute', left: 120, bottom: 120, opacity: o, transform: `translateX(${-slide}px)`}}>
      <div style={{background: 'rgba(11,10,9,0.82)', padding: '34px 48px 40px', borderLeft: `10px solid ${C.red}`, boxShadow: '0 30px 80px rgba(0,0,0,0.5)'}}>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 84, letterSpacing: 2, color: C.white, textTransform: 'uppercase', whiteSpace: 'nowrap', lineHeight: 1}}>{label}</div>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 200, lineHeight: 1, color: C.white, marginTop: 10, whiteSpace: 'nowrap'}}>{children}</div>
      </div>
    </div>
  );
};
const Countdown: React.FC<{start: number; from: number}> = ({start, from}) => {
  const t = useT(); const left = Math.max(0, from - (t - start));
  return <>{String(Math.floor(left / 60)).padStart(2, '0')}:{String(Math.floor(left % 60)).padStart(2, '0')}</>;
};

/** Nia's monitor: Milo's beacon blinking slower and redder, the ship fading. x,y = screen-space px of the ship on the monitor. */
const FrozenFeed: React.FC<{from: [number, number]; to: [number, number]; dur: number}> = ({from, to, dur}) => {
  const t = useT(); const p = interpolate(t, [0, dur], [0, 1], cl);
  const q = interpolate(t, [0, dur], [0, 1], {...cl, easing: Easing.bezier(0.45, 0, 0.25, 1)}); const x = from[0] + (to[0] - from[0]) * q, y = from[1] + (to[1] - from[1]) * q;
  // blink period grows exponentially: 1 s → ~6 s
  const period = Math.exp(p * 1.8); let ph = 0; for (let k = 0, tt = 0; tt <= t; k++) { ph = t - tt; tt += Math.exp((tt / dur) * 1.8); }
  const on = Math.max(0, 1 - ph / (0.25 * period));
  const g = Math.round(46 + 140 * (1 - p)); const fade = 1 - 0.75 * p;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <circle cx={x} cy={y} r={34} fill={`rgb(255,${g},${Math.round(59 * (1 - p))})`} opacity={0.35 * on * fade} style={{filter: 'blur(10px)'}} />
      <circle cx={x} cy={y} r={9} fill={`rgb(255,${g},${Math.round(59 * (1 - p))})`} opacity={(0.25 + 0.75 * on) * fade} />
    </svg>
  );
};

/** After the end: faint traces drifting out of the place where the hole evaporated; one red one comes toward us. */
const ShotTrace: React.FC<{dur: number; flashAt: number}> = ({dur, flashAt}) => {
  const t = useT(); const fr = useCurrentFrame();
  const flash = interpolate(t, [flashAt - 0.05, flashAt, flashAt + 1.6], [0, 1, 0], cl);
  const age = Math.max(0, t - flashAt);
  return (
    <AbsoluteFill style={{background: '#050404'}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 160}).map((_, i) => <circle key={'s' + i} cx={random('tx' + i) * 1920} cy={random('ty' + i) * 1080} r={0.6 + random('tr' + i) * 1.2} fill={C.white} opacity={0.08 + 0.12 * random('to' + i)} />)}
        {t < flashAt ? <circle cx={960} cy={540} r={3 + 2 * Math.sin(t * 6)} fill={C.white} opacity={0.8} /> : null}
        {Array.from({length: 70}).map((_, i) => { const a = random('a' + i) * Math.PI * 2, sp = 40 + random('v' + i) * 260; const d = age * sp * (0.6 + 0.4 * Math.exp(-age * 0.2));
          return age > 0 ? <circle key={i} cx={960 + Math.cos(a) * d} cy={540 + Math.sin(a) * d * 0.8} r={1.5 + random('r' + i) * 2} fill={C.white} opacity={Math.max(0, 0.7 - age * 0.04)} /> : null; })}
        {age > 2 ? (() => { const k = interpolate(age, [2, dur - flashAt], [0, 1], cl); const x = 960 + 140 * k + 30 * Math.sin(age * 0.7), y = 540 + 90 * k; const r = 4 + 26 * k * k;
          return <><circle cx={x} cy={y} r={r * 3} fill={C.red} opacity={0.18} style={{filter: 'blur(14px)'}} /><circle cx={x} cy={y} r={r} fill={C.red} opacity={0.85} /></>; })() : null}
      </svg>
      <AbsoluteFill style={{background: '#fffaf0', opacity: flash * 0.6}} />
    </AbsoluteFill>
  );
};

/** Drone leaving the painted station: a bright engine dot with a fading trail, accelerating toward the hole. */
const DroneStreak: React.FC<{dur: number; igniteAt: number}> = ({dur, igniteAt}) => {
  const t = useT(); if (t < igniteAt - 0.4) return null;
  const go = (tt: number) => Math.pow(Math.max(0, tt - igniteAt) / (dur - igniteAt), 2.2);
  const P = (k: number) => [850 + k * 640, 440 - k * 110] as const;   // station hub → toward the black hole (shrinking with distance)
  const [x, y] = P(go(t)); const ign = interpolate(t, [igniteAt - 0.4, igniteAt, igniteAt + 0.3], [0, 1.6, 1], cl);
  const trail = Array.from({length: 22}).map((_, i) => P(go(t - i * 0.05)));
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      {trail.map(([a, b], i) => <circle key={i} cx={a} cy={b} r={Math.max(1, (14 - i * 0.6) * (1 - 0.6 * go(t)))} fill="#f4ece0" opacity={0.55 * (1 - i / 22) * ign} />)}
      <circle cx={x} cy={y} r={70 * ign * (1 - 0.6 * go(t))} fill="#f4ece0" opacity={0.4} style={{filter: 'blur(16px)'}} />
      <circle cx={x} cy={y} r={14 * (1 - 0.6 * go(t))} fill="#ffffff" opacity={ign} />
      <circle cx={x + 6} cy={y - 4} r={4} fill={C.red} opacity={0.6 + 0.4 * Math.sin(t * 9)} />
    </svg>
  );
};

const Black: React.FC = () => <AbsoluteFill style={{background: '#000'}} />;
const Flash: React.FC<{at: number}> = ({at}) => { const t = useT(); return <AbsoluteFill style={{background: '#fffaf0', opacity: interpolate(t, [at - 0.3, at, at + 0.05], [0, 1, 0], cl)}} />; };

export const Film2: React.FC = () => (
  <AbsoluteFill style={{background: C.bg}}>
    {/* ===== hook and setup ===== */}
    <Cut a={0} b={6.9}><ShotBH dur={6.9} rs={[0.15, 0.175]} ctr={[[0.3, 0.06], [0.27, 0.06]]} ship={{from: [-1.4, -0.35, 4.2], to: [-1.1, -0.45, 4.6], scale: 0.85, spin: 0.04}} /></Cut>
    <Cut a={6.9} b={12.0}><Plate src={A('cockpit_milo')} dur={5.1} z0={1.0} z1={1.1} /></Cut>
    <Cut a={12.0} b={16.6}><ShotBH dur={4.6} rs={[0.08, 0.1]} ctr={[[0.1, 0.02], [0.08, 0.02]]} rot={[0, 0.03]} ship={{from: [-2.6, 0.8, 2], to: [-2.2, 0.7, 2.2], scale: 0.3}} /></Cut>
    <Cut a={16.6} b={24.0}><ShotBurn dur={7.4} dieAt={5.9} /></Cut>
    <Cut a={24.0} b={33.4}><ShotOrbitDrop dur={9.4} burnAt={0.6} burnLen={3.2} /></Cut>
    <Cut a={33.4} b={39.9}><Plate src={A('cockpit_tap')} dur={6.5} z0={1.05} z1={1.16} /></Cut>
    <Cut a={39.9} b={42.8}><ShotBH dur={2.9} rs={[0.1, 0.11]} ctr={[[0.5, 0.1], [0.5, 0.1]]} ship={{from: [-0.2, -0.1, 6.6], to: [-0.1, -0.1, 6.8], scale: 1.1, spin: 0.02}} /></Cut>
    <Cut a={42.8} b={51.0}><ShotBH dur={8.2} rs={[0.085, 0.11]} ctr={[[0.2, 0.05], [0.18, 0.05]]} rot={[0, 0.04]} ship={{from: [-2.8, -1.0, 1], to: [-2.4, -0.95, 1.1], scale: 0.4}} /></Cut>
    <Cut a={51.0} b={61.4}><Plate src={A('cockpit_milo')} dur={10.4} x0={760} z0={1.15} z1={1.32} /></Cut>
    <Cut a={61.4} b={67.9}><ShotBH dur={6.5} rs={[0.2, 0.4]} rot={[0, 0.05]} ring={1.1} /></Cut>
    <Cut a={67.9} b={71.6}><Plate src={A('cockpit_milo')} dur={3.7} x0={900} z0={1.12} z1={1.18} /></Cut>
    <Cut a={71.6} b={75.4}><Plate src={A('station_ext')} dur={3.8} z0={1.0} z1={1.12} /></Cut>
    <Cut a={75.4} b={81.0}><Plate src={A('control_nia')} dur={5.6} z0={1.0} z1={1.12} /></Cut>
    <Cut a={81.0} b={85.6}><Plate src={A('nia_close')} dur={4.6} z0={1.0} z1={1.08} /></Cut>
    <Cut a={85.6} b={92.0}><Plate src={A('station_ext')} dur={6.4} x0={600} y0={400} z0={1.12} z1={1.08}><DroneStreak dur={6.4} igniteAt={1.2} /></Plate></Cut>

    {/* ===== free fall, tidal forces ===== */}
    <Cut a={92.0} b={99.8}><ShotBH dur={7.8} rs={[0.14, 0.17]} ctr={[[0.32, 0.08], [0.3, 0.08]]} rot={[0, 0.03]} ship={{from: [-0.9, -0.3, 5.4], to: [-0.8, -0.35, 5.6], scale: 0.9, spin: 0.015}} /></Cut>
    <Cut a={99.8} b={110.7}><Plate src={A('cockpit_float')} dur={10.9} z0={1.0} z1={1.14} /></Cut>
    <Cut a={110.7} b={125.0}><ShotBH dur={14.3} rs={[0.06, 0.08]} disc={1} ring={1.2} rot={[0, 0.05]} /></Cut>
    <Cut a={125.0} b={131.4}><ShotSpaghetti dur={6.4} stretchFrom={0.8} /></Cut>
    <Cut a={131.4} b={138.4}><ShotBH dur={7} rs={[0.36, 0.42]} ctr={[[0.1, -0.05], [0.1, -0.05]]} rot={[0, 0.02]} ship={{from: [-2.2, -1.1, 2], to: [-2.0, -1.15, 2.1], scale: 0.35}} /></Cut>
    <Cut a={138.4} b={140.6}><ShotBH dur={2.2} rs={[0.07, 0.072]} disc={1} ring={1.2} rot={[0.05, 0.06]} /></Cut>

    {/* ===== the rescue ===== */}
    <Cut a={140.6} b={151.9}><ShotSpeed dur={11.3} speed={[18, 60]} drone /></Cut>
    <Cut a={151.9} b={158.6}><Plate src={A('cockpit_listen')} dur={6.7} z0={1.05} z1={1.15} /></Cut>
    <Cut a={158.6} b={165.0}><Plate src={A('nia_close')} dur={6.4} z0={1.08} z1={1.18} /></Cut>
    <Cut a={165.0} b={174.5}><ShotSpeed dur={9.5} speed={[70, 150]} drone /></Cut>
    <Cut a={174.5} b={181.3}><Plate src={A('control_nia')} dur={6.8} x0={560} z0={1.25} z1={1.35} /></Cut>
    <Cut a={181.3} b={188.2}><Plate src={A('nia_recall')} dur={6.9} z0={1.0} z1={1.12} /></Cut>
    <Cut a={188.2} b={191.6}><ShotDrone dur={3.4} mode="recall" /></Cut>
    <Cut a={191.6} b={193.6}><Plate src={A('cockpit_listen')} dur={2} x0={900} z0={1.06} z1={1.1} /></Cut>

    {/* ===== the sky breaks ===== */}
    <Cut a={195.1} b={205.5}><ShotBH dur={10.4} rs={[0.12, 0.22]} rot={[0, 0.07]} ring={1} /></Cut>
    <Cut a={205.5} b={215.7}><ShotBH dur={10.2} rs={[0.24, 0.32]} ctr={[[-0.25, 0.04], [-0.2, 0.04]]} rot={[0.1, 0.2]} ring={1.1} /></Cut>
    <Cut a={217.2} b={235.0}><ShotPhotonSphere dur={17.8} /></Cut>

    {/* ===== what Nia sees ===== */}
    <Cut a={235.0} b={241.0}><Plate src={A('control_nia')} dur={6} z0={1.0} z1={1.1} /></Cut>
    <Cut a={241.0} b={260.0}><Plate src={A('nia_screen')} dur={19} x0={752} y0={355} z0={1.0} z1={1.2}><FrozenFeed from={[1049, 495]} to={[960, 540]} dur={19} /></Plate></Cut>
    <Cut a={260.0} b={268.4}><Plate src={A('nia_close')} dur={8.4} z0={1.12} z1={1.25} /></Cut>
    <Cut a={268.4} b={280.6}><ShotOldLight dur={12.2} /></Cut>

    {/* ===== crossing ===== */}
    <Cut a={280.6} b={285.3}><ShotBH dur={4.7} rs={[0.34, 0.5]} rot={[0, 0.02]} ship={{from: [-0.15, 0.55, 3], to: [0.05, 0.05, -2], scale: 0.7, spin: 0.01}} /></Cut>
    <Cut a={285.3} b={292.0}><Plate src={A('cockpit_milo')} dur={6.7} x0={900} z0={1.25} z1={1.35} /></Cut>
    <Cut a={292.0} b={306.6}><ShotBH dur={14.6} rs={[0.55, 0.62]} bright={[0.7, 0.35]} rot={[0, 0.02]} ship={{from: [-0.7, -0.3, 5.2], to: [-0.6, -0.35, 5.6], scale: 0.85, spin: 0.01}} /></Cut>
    <Cut a={306.6} b={319.5}><ShotFuture dur={12.9} /></Cut>
    <Cut a={319.5} b={326.0}><Plate src={A('cockpit_tap')} dur={6.5} z0={1.15} z1={1.25} /></Cut>
    <Cut a={326.0} b={333.9}><ShotBurn dur={7.9} dieAt={99} /></Cut>
    <Cut a={333.9} b={343.4}><ShotBH dur={9.5} rs={[0.6, 0.66]} bright={[0.35, 0.25]} ship={{from: [-0.3, -0.2, 6.4], to: [-0.25, -0.2, 6.6], scale: 1.0, spin: 0.01}} /></Cut>
    <Cut a={343.4} b={355.3}><Plate src={A('cockpit_lookback')} dur={11.9} z0={1.0} z1={1.15} /></Cut>
    <Cut a={355.3} b={367.4}><Plate src={A('cockpit_record')} dur={12.1} z0={1.0} z1={1.2} /></Cut>
    <Cut a={367.4} b={373.8}><ShotFuture dur={6.4} /><Flash at={6.3} /></Cut>
    <Cut a={373.8} b={375.6}><Black /></Cut>

    {/* ===== Hawking and the trace ===== */}
    <Cut a={375.6} b={392.4}><ShotBH dur={16.8} rs={[0.26, 0.012]} disc={0} glow={[0, 1]} bright={[1, 0.1]} rot={[0, 0.1]} ring={0.9} /></Cut>
    <Cut a={392.4} b={417.0}><ShotTrace dur={24.6} flashAt={1.6} /></Cut>
    <Cut a={417.0} b={431.8}><Plate src={A('flashback')} dur={14.8} z0={1.0} z1={1.15} night={false} /></Cut>
    <Cut a={431.8} b={FILM2_LEN}><Plate src={A('empty_city')} dur={FILM2_LEN - 431.8} z0={1.0} z1={1.1} night={false} /></Cut>

    {/* ===== cards (text is rare) ===== */}
    <NumCard at={55.0} out={61.2} label="Horizon in"><Countdown start={55.0} from={59 * 60 + 30} /></NumCard>
    <Odds at={68.9} out={71.5} from={12} to={12} />
    <Odds at={89.0} out={91.9} from={12} to={61} />
    <NumCard at={146.2} out={151.6} label="Speed">20,000 KM/S</NumCard>
    <Odds at={189.8} out={193.4} from={61} to={0} />
    <Chapter at={140.6} label="MINUTE 20" sub="" />
    <Chapter at={193.6} label="MINUTE 40" sub="" />
    <Chapter at={215.7} label="MINUTE 59" sub="" />
    <Odds at={413.8} out={416.9} from={0} to={0} />
    <Lower kicker="Next time" head="The last person on Earth" at={432.2} out={FILM2_LEN - 0.2} size={120} />

    <Grain />

    {/* ===== sound ===== */}
    <Audio src={staticFile('narration.mp3')} />
    {/* no music: the owner adds his own */}
    {[[0, 16.6], [92.0, 99.8], [195.1, 235.0], [268.4, 285.3], [292, 343.4], [375.6, 417]].map(([a, b], i) => (
      <Sequence key={i} from={f(a)} durationInFrames={f(b - a)}><Audio src={staticFile('sfx2/space_drone.wav')} volume={0.02} loop /></Sequence>
    ))}
    <Sfx vol={0.025} list={[
      [0.2, 'riser'], [17.3, 'crackle'], [22.4, 'sub_impact'], [32.1, 'sub_impact'], [40.1, 'quindar_in'],
      [61.6, 'sub_impact'], [69.0, 'geiger'], [86.8, 'whoosh_real'], [89.2, 'geiger'],
      [125.6, 'crackle'], [140.6, 'quindar_in'], [154.6, 'quindar_in'], [188.4, 'whoosh_real'], [190.0, 'geiger'],
      [193.6, 'quindar_in'], [215.7, 'quindar_in'], [279.0, 'riser'], [283.2, 'sub_impact'], [326.2, 'crackle'],
      [373.7, 'sub_impact'], [394.0, 'whoosh_real'], [413.9, 'geiger'], [431.8, 'whoosh_real'],
    ]} />
  </AbsoluteFill>
);
