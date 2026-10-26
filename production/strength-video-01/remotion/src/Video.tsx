import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import shots from './shots.json';
import captions from './captions.json';

export const FPS = 30;
const AUDIO_END = 399.36;
export const TOTAL = AUDIO_END + 7.5;
const FADE = 0.4;
const PAPER = '#efe6d2';
const INK = '#1c1a17';
const COPPER = '#c8643c';
const FONT = 'Roboto, "Helvetica Neue", Arial, sans-serif';

type Shot = {id: string; t: number; mode: string; rook: boolean; prompt: string; text: string[]};
const S = shots as Shot[];

const Still: React.FC<{shot: Shot; idx: number; dur: number}> = ({shot, idx, dur}) => {
  const f = useCurrentFrame();
  const total = dur * FPS;
  const p = f / total;
  const zoomIn = idx % 2 === 0;
  const scale = zoomIn ? 1.0 + 0.07 * p : 1.07 - 0.07 * p;
  const dir = [[-1, 0], [1, 0], [0, -1], [0, 1]][idx % 4];
  const tx = dir[0] * 25 * (p - 0.5);
  const ty = dir[1] * 15 * (p - 0.5);
  const opacity = interpolate(f, [0, FADE * FPS], [idx === 0 ? 1 : 0, 1], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity}}>
      <Img src={staticFile(`img/${shot.id}.png`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale}) translate(${tx}px, ${ty}px)`}} />
    </AbsoluteFill>
  );
};

const Card: React.FC<{text: string; i: number; dur: number}> = ({text, i, dur}) => {
  const f = useCurrentFrame();
  const inF = 0.35 * FPS + i * 0.5 * FPS;
  const outF = dur * FPS - 0.3 * FPS;
  const o = interpolate(f, [inF, inF + 8, outF - 8, outF], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const x = interpolate(f, [inF, inF + 10], [-30, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <div style={{opacity: o, transform: `translateX(${x}px)`, display: 'flex', alignItems: 'stretch', marginBottom: 14}}>
      <div style={{width: 10, background: COPPER}} />
      <div style={{background: 'rgba(28,26,23,0.88)', color: PAPER, fontFamily: FONT, fontWeight: 700, fontSize: 40, padding: '14px 26px', letterSpacing: 0.3}}>{text}</div>
    </div>
  );
};

const Caption: React.FC<{text: string}> = ({text}) => (
  <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 70}}>
    <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 50, color: '#fffaf0', textAlign: 'center', maxWidth: 1500,
      textShadow: '0 0 6px #000, 0 3px 10px rgba(0,0,0,0.9), 0 0 2px #000', WebkitTextStroke: '1px rgba(0,0,0,0.8)'}}>{text}</div>
  </AbsoluteFill>
);

export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cap = (captions as {s: number; e: number; text: string}[]).find((c) => t >= c.s && t < c.e);
  return (
    <AbsoluteFill style={{background: PAPER}}>
      {S.map((s, i) => {
        const start = s.t;
        const end = i + 1 < S.length ? S[i + 1].t + FADE : TOTAL;
        const dur = end - start;
        return (
          <Sequence key={s.id} from={Math.round(start * FPS)} durationInFrames={Math.round(dur * FPS)}>
            <Still shot={s} idx={i} dur={dur} />
            <AbsoluteFill style={{padding: '60px 70px', alignItems: 'flex-start'}}>
              {s.text.map((tx, j) => <Card key={j} text={tx} i={j} dur={Math.min(dur - FADE, 6)} />)}
            </AbsoluteFill>
          </Sequence>
        );
      })}
      <AbsoluteFill style={{pointerEvents: 'none', boxShadow: 'inset 0 0 220px rgba(40,25,10,0.45)'}} />
      {cap && t < AUDIO_END ? <Caption text={cap.text} /> : null}
      <Audio src={staticFile('narration-clean.mp3')} />
    </AbsoluteFill>
  );
};
