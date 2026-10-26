import React from 'react';
import {Composition} from 'remotion';
import {Pilot, PILOT_LEN} from './Pilot';
import {Full, FULL_LEN} from './Full';
export const Root: React.FC = () => (
  <>
    <Composition id="Pilot" component={Pilot} durationInFrames={Math.round(PILOT_LEN * 30)} fps={30} width={1920} height={1080} />
    <Composition id="Full" component={Full} durationInFrames={Math.round(FULL_LEN * 30)} fps={30} width={1920} height={1080} />
  </>
);
