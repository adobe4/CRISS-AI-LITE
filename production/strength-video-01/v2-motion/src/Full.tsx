import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {PaperBG, Grain, Sfx, PAPER, useT, f} from './kit';
import {Pilot} from './Pilot';
import {Rest, REST_SFX} from './Rest';

export const FULL_LEN = 407.5;
export const Full: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <PaperBG />
      <Sequence durationInFrames={f(45.8)}>
        <Pilot inFull />
      </Sequence>
      <Rest />
      <Grain opacity={t < 12.9 ? 0.55 : 0.3} />
      <Audio src={staticFile('narration-clean.mp3')} />
      <Sfx list={REST_SFX} />
    </AbsoluteFill>
  );
};
