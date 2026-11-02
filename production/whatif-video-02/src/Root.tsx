import React from 'react';
import {Composition} from 'remotion';
import {Film2, FILM2_LEN} from './Film2';
export const Root: React.FC = () => (<Composition id="Film2" component={Film2} durationInFrames={Math.round(FILM2_LEN * 30)} fps={30} width={1920} height={1080} />);
