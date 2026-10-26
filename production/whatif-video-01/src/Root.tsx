import React from 'react';
import {Composition} from 'remotion';
import {SunVideo, SUN_LEN} from './Sun';
export const Root: React.FC = () => (
  <Composition id="Full" component={SunVideo} durationInFrames={Math.round(SUN_LEN * 30)} fps={30} width={1920} height={1080} />
);
