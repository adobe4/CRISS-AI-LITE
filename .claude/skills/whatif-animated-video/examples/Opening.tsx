import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {ShotSunVanish, ShotEarth, ShotLightTrip, ShotSpacetime} from './shots';
import {ParkScene, FlyingArt} from './park';
import {Title, Lower, Accent, HudClock, Music, Sfx, C, MONO, SANS, f, useT} from './pro';

export const OPEN_LEN = 45.3;
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const Cut: React.FC<{a: number; b: number; children: React.ReactNode}> = ({a, b, children}) => <Sequence from={f(a)} durationInFrames={f(b - a)}>{children}</Sequence>;

const Countdown: React.FC<{from: number; secs: number}> = ({from, secs}) => {
  const t = useT(); const left = Math.max(0, secs - (t - from));
  return <>{String(Math.floor(left / 60)).padStart(2, '0')}:{String(Math.floor(left % 60)).padStart(2, '0')}</>;
};

const Figure: React.FC<{at: number; out: number; big: React.ReactNode; small: string; y?: number}> = ({at, out, big, small, y = 150}) => {
  const t = useT(); if (t < at || t > out) return null;
  const o = interpolate(t, [at, at + 0.35, out - 0.3, out], [0, 1, 1, 0], cl); const dy = interpolate(t, [at, at + 0.5], [24, 0], cl);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: o, transform: `translateY(${dy}px)`, textShadow: '0 6px 30px rgba(0,0,0,0.7)'}}>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 110, color: C.white, letterSpacing: -1}}>{big}</div>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 44, letterSpacing: 9, color: C.dim, textTransform: 'uppercase', marginTop: 6}}>{small}</div>
    </div>
  );
};

const TransitTimer: React.FC<{start: number; dur: number}> = ({start, dur}) => {
  const t = useT(); const p = interpolate(t, [start, start + dur], [0, 500], cl);
  return <>{String(Math.floor(p / 60)).padStart(2, '0')}:{String(Math.floor(p % 60)).padStart(2, '0')}</>;
};

export const Opening: React.FC<{audio?: boolean}> = ({audio = true}) => {
  const t = useT();
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Cut a={0} b={3.7}><ShotSunVanish vanishAt={2.25} /></Cut>
      <Cut a={3.7} b={8.0}><ParkScene plate="art/park_milo_eat.png" dur={4.3} birds patches={[{src: 'art/park_milo_bite_patch.png', from: 0.55, to: 1.75}]} cam={{from: {x: 700, y: 400, z: 1.0}, to: {x: 930, y: 420, z: 1.16}}} /></Cut>
      <Cut a={8.0} b={13.0}><ShotEarth from={[1.2, 0.7, 4.6]} to={[-0.2, 0.35, 3.15]} dur={5} /></Cut>
      <Cut a={13.0} b={14.4}><ParkScene plate="art/park_milo_eat.png" dur={1.4} patches={[{src: 'art/park_milo_look_patch.png', from: 0.0, to: 1.5}]} cam={{from: {x: 1010, y: 395, z: 2.15}, to: {x: 1010, y: 385, z: 2.3}}} /></Cut>
      <Cut a={14.4} b={16.1}><ShotEarth from={[0.8, 0.4, 5.5]} to={[2.2, 1.0, 12]} look={[0.6, 0, -1]} dur={1.7} withMoon /></Cut>
      <Cut a={16.1} b={19.3}><ParkScene plate="art/park_milo_eat.png" dur={3.2} patches={[{src: 'art/park_milo_bite_patch.png', from: 0.6, to: 1.9}]} cam={{from: {x: 960, y: 380, z: 1.55}, to: {x: 1000, y: 380, z: 1.75}}} /></Cut>
      <Cut a={19.3} b={35.0}><ShotLightTrip sunOffAt={10.4} dur={15.7} /></Cut>
      <Cut a={31.2} b={34.6}><FlyingArt src="art/envelope.png" from={[-200, 640]} to={[1500, 520]} dur={3.4} w={300} /></Cut>
      <Cut a={35.0} b={OPEN_LEN}><ShotSpacetime vanishAt={1.7} dur={10.3} /></Cut>

      {/* ---- typography ---- */}


      {/* film finish */}
      <AbsoluteFill style={{pointerEvents: 'none', opacity: 0.22, mixBlendMode: 'overlay'}}>
        <Img src={staticFile(`grain/g${Math.floor(useCurrentFrame() / 2) % 6}.png`)} style={{width: '100%', height: '100%'}} />
      </AbsoluteFill>

      {audio ? <>
      <Audio src={staticFile('narration.mp3')} endAt={f(OPEN_LEN)} />
      <Music src="music.mp3" vol={0.11} duck={[[2.2, 3.8]]} total={OPEN_LEN} />
      <Sequence from={f(19.3)}><Audio src={staticFile('sfx2/space_drone.wav')} volume={0.05} /></Sequence>
      <Sfx list={[
        [0.3, 'quindar_in'], [0.9, 'riser'], [2.25, 'sub_impact'], [2.25, 'crackle'],
        [3.7, 'whoosh_real'], [8.0, 'quindar_in'], [8.6, 'geiger'], [16.0, 'riser'], [17.0, 'sub_impact'],
        [19.3, 'quindar_out'], [29.7, 'sub_impact'], [31.2, 'whoosh_real'], [35.0, 'whoosh_real'], [36.7, 'quindar_in'], [43.2, 'riser'], [44.2, 'sub_impact'],
      ]} />
      </> : null}
    </AbsoluteFill>
  );
};
