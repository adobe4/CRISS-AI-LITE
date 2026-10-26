import React from 'react';
import {Composition} from 'remotion';
import {Pilot, PILOT_LEN} from './Pilot';
export const Root: React.FC = () => (
  <Composition id="Pilot" component={Pilot} durationInFrames={Math.round(PILOT_LEN * 30)} fps={30} width={1920} height={1080} />
);
