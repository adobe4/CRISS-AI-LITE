import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const times = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const composition = await selectComposition({serveUrl, id: process.env.COMP || 'Opening', browserExecutable, chromiumOptions: {gl: 'swangle'}});
for (const t of times) {
  await renderStill({composition, serveUrl, output: `stills/s${t}.jpg`, frame: Math.round(t * 30), imageFormat: 'jpeg', scale: 0.5, browserExecutable, chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 120000});
  console.log('ok', t);
}
