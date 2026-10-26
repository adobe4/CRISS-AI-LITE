import fs from 'fs';
import {getLength} from '@remotion/paths';
const names = process.argv.slice(2);
for (const n of names) {
  const s = fs.readFileSync(`${process.env.SVG_DIR || '../svg'}/${n}.svg`, 'utf8');
  const W = +s.match(/width="(\d+)"/)[1], H = +s.match(/height="(\d+)"/)[1];
  const out = [];
  for (const m of s.matchAll(/<path d="([^"]+)"[^>]*?(?:transform="translate\(([-\d.]+),([-\d.]+)\)")?\s*\/>/g)) {
    const tx = +(m[2] || 0), ty = +(m[3] || 0);
    const subs = m[1].trim().split(/(?=M)/).map((x) => x.trim()).filter(Boolean);
    for (const d of subs) {
      let len = 0; try { len = getLength(d); } catch (e) { continue; }
      if (len < 6) continue;
      const mm = d.match(/^M\s*([-\d.]+)[ ,]+([-\d.]+)/);
      out.push({d, tx, ty, len: Math.round(len), y: ty + (mm ? +mm[2] : 0), x: tx + (mm ? +mm[1] : 0)});
    }
  }
  out.sort((a, b) => (a.y - b.y) || (a.x - b.x));
  fs.writeFileSync(`src/svg_${n}.json`, JSON.stringify({W, H, paths: out.map(({d, tx, ty, len}) => ({d, tx, ty, len}))}));
  console.log(n, out.length, 'subpaths', Math.round(fs.statSync(`src/svg_${n}.json`).size / 1024), 'KB');
}
