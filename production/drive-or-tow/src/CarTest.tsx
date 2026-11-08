import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Cluster, Verdict, Bill, XRay} from './car';
const S: React.FC<{i: number; children: React.ReactNode}> = ({i, children}) => <Sequence from={i * 150} durationInFrames={150}>{children}</Sequence>;
export const CarTest: React.FC = () => (
  <AbsoluteFill>
    <S i={0}><Cluster /></S>
    <S i={1}><Verdict active="careful" line={<>Slow, short drive to a shop only.<br />Shaking or smoke? <span style={{color: '#FF3B30'}}>Tow it.</span></>} /></S>
    <S i={2}><Bill highlight={1} rows={[{what: 'Read the code', lo: 0, hi: 20}, {what: 'Ignition coil', lo: 227, hi: 335}, {what: 'Spark plugs', lo: 264, hi: 390}, {what: 'Catalytic converter', lo: 900, hi: 3500}]} /></S>
    <S i={3}><XRay src="art/xray_cat.png" dur={5} hot={[{x: 800, y: 728, r: 110}]} /></S>
  </AbsoluteFill>
);
