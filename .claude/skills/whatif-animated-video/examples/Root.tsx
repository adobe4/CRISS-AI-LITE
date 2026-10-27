import React from 'react';
import {Composition} from 'remotion';
import {Opening, OPEN_LEN} from './Opening';
import {Film, FILM_LEN} from './Film';
export const Root: React.FC = () => (<>
  <Composition id="Opening" component={Opening} durationInFrames={Math.round(OPEN_LEN * 30)} fps={30} width={1920} height={1080} />
  <Composition id="Film" component={Film} durationInFrames={Math.round(FILM_LEN * 30)} fps={30} width={1920} height={1080} />
</>);
