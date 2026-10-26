import React from 'react';
import {Composition} from 'remotion';
import {Video, FPS, TOTAL} from './Video';
export const RemotionRoot: React.FC = () => (
  <Composition id="Video" component={Video} durationInFrames={Math.round(TOTAL * FPS)} fps={FPS} width={1920} height={1080} />
);
