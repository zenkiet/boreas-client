/** Writes public/animations/bora.json (node scripts/bora-lottie.ts): a 120×120 comp, the rig at +10. */
import { writeFileSync } from 'node:fs';

type V = number[];
type Ease = 'out' | 'in' | 'inOut' | 'lin' | 'hold';
type Key = [frame: number, value: V | number, ease?: Ease];
type Track = Key[];

const FPS = 60;
const OFF = 10;
const at = (x: number, y: number): V => [x + OFF, y + OFF];

const EASE: Record<Exclude<Ease, 'hold'>, [number, number, number, number]> = {
  out: [0.2, 0, 0, 1],
  in: [0.4, 0, 1, 1],
  inOut: [0.42, 0, 0.58, 1],
  lin: [0, 0, 1, 1],
};

const SEGMENTS: [name: string, frames: number][] = [
  ['idle', 108],
  ['heads', 72],
  ['listen', 24],
  ['listen-loop', 108],
  ['think', 30],
  ['think-loop', 144],
  ['speak', 72],
  ['talk', 13],
  ['done', 72],
  ['sorry', 18],
  ['sleep', 18],
];
const START: Record<string, number> = {};
let cursor = 0;
for (const [name, frames] of SEGMENTS) {
  START[name] = cursor;
  cursor += frames;
}
const END = cursor;

function track(neutral: V | number, perSegment: Record<string, Track>): unknown {
  const keys: Key[] = [];
  for (const [name, frames] of SEGMENTS) {
    const local = perSegment[name] ?? [[0, neutral, 'hold']];
    const start = START[name];
    for (const [frame, value, ease] of local)
      keys.push([start + Math.min(frame, frames - 1), value, ease]);
    // Each segment's last frame holds its pose, so a one-shot ends still.
    const last = local[local.length - 1];
    keys.push([start + frames - 1, last[1], 'hold']);
  }
  if (keys.every(([, value]) => JSON.stringify(value) === JSON.stringify(neutral))) {
    return { a: 0, k: neutral };
  }
  const k = keys
    .sort((a, b) => a[0] - b[0])
    .filter((key, index, all) => index === 0 || key[0] !== all[index - 1][0])
    .map(([frame, value, ease], index, all) => {
      const s = Array.isArray(value) ? value : [value];
      if (index === all.length - 1) return { t: frame, s };
      if (ease === 'hold') return { t: frame, s, h: 1 };
      const [ox, oy, ix, iy] = EASE[ease ?? 'inOut'];
      const n = s.length;
      return {
        t: frame,
        s,
        o: { x: Array(n).fill(ox), y: Array(n).fill(oy) },
        i: { x: Array(n).fill(ix), y: Array(n).fill(iy) },
      };
    });
  return { a: 1, k };
}

const still = (value: V | number) => ({ a: 0, k: value });

const hex = (color: string): number[] => {
  const n = color.replace('#', '');
  const rgb = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  const alpha = n.length === 8 ? parseInt(n.slice(6, 8), 16) / 255 : 1;
  return [...rgb.map((c) => +c.toFixed(4)), +alpha.toFixed(3)];
};

/** Minimal SVG path (absolute M L H V C Q Z) to Lottie vertices with relative tangents. */
function path(d: string): unknown {
  const tokens = d.match(/[MLHVCQZ]|-?\d*\.?\d+/g) ?? [];
  const v: V[] = [];
  const inT: V[] = [];
  const outT: V[] = [];
  let i = 0;
  let cmd = '';
  let closed = false;
  let pen: V = [0, 0];
  const num = () => Number(tokens[i++]);
  const add = (point: V, tangentIn: V = [0, 0]) => {
    v.push(at(point[0], point[1]));
    inT.push(tangentIn);
    outT.push([0, 0]);
    pen = point;
  };
  while (i < tokens.length) {
    if (/[A-Z]/.test(tokens[i])) cmd = tokens[i++];
    if (cmd === 'Z') {
      closed = true;
      continue;
    }
    if (cmd === 'M' || cmd === 'L') add([num(), num()]);
    else if (cmd === 'H') add([num(), pen[1]]);
    else if (cmd === 'V') add([pen[0], num()]);
    else if (cmd === 'C' || cmd === 'Q') {
      let c1: V;
      let c2: V;
      let end: V;
      if (cmd === 'C') {
        c1 = [num(), num()];
        c2 = [num(), num()];
        end = [num(), num()];
      } else {
        const q: V = [num(), num()];
        end = [num(), num()];
        c1 = [pen[0] + (2 / 3) * (q[0] - pen[0]), pen[1] + (2 / 3) * (q[1] - pen[1])];
        c2 = [end[0] + (2 / 3) * (q[0] - end[0]), end[1] + (2 / 3) * (q[1] - end[1])];
      }
      outT[outT.length - 1] = [c1[0] - pen[0], c1[1] - pen[1]];
      add(end, [c2[0] - end[0], c2[1] - end[1]]);
    }
  }
  // A closed path that returns to its start: Lottie closes it itself.
  if (closed && v.length > 1 && v[0][0] === v[v.length - 1][0] && v[0][1] === v[v.length - 1][1]) {
    inT[0] = inT[inT.length - 1];
    v.pop();
    inT.pop();
    outT.pop();
  }
  return { ty: 'sh', ks: still({ i: inT, o: outT, v, c: closed }) };
}

const ellipse = (cx: number, cy: number, rx: number, ry: number) => ({
  ty: 'el',
  p: still(at(cx, cy)),
  s: still([rx * 2, ry * 2]),
  d: 1,
});

const fill = (color: string, opacity = 100) => {
  const [r, g, b, a] = hex(color);
  return { ty: 'fl', c: still([r, g, b, 1]), o: still(opacity * a), r: 1 };
};

function stops(list: [offset: number, color: string][]): unknown {
  const colors = list.flatMap(([offset, color]) => [offset, ...hex(color).slice(0, 3)]);
  const alphas = list.flatMap(([offset, color]) => [offset, hex(color)[3]]);
  const translucent = list.some(([, color]) => hex(color)[3] < 1);
  return { p: list.length, k: still(translucent ? [...colors, ...alphas] : colors) };
}

const radial = (list: [number, string][], cx: number, cy: number, r: number) => ({
  ty: 'gf',
  o: still(100),
  r: 1,
  g: stops(list),
  s: still(at(cx, cy)),
  e: still(at(cx + r, cy)),
  t: 2,
  h: still(0),
  a: still(0),
});

const linearFill = (list: [number, string][], from: V, to: V) => ({
  ty: 'gf',
  o: still(100),
  r: 1,
  g: stops(list),
  s: still(at(from[0], from[1])),
  e: still(at(to[0], to[1])),
  t: 1,
});

const stroke = (color: string, width: number, opacity = 100, dash?: [number, number, unknown]) => {
  const [r, g, b, a] = hex(color);
  return {
    ty: 'st',
    c: still([r, g, b, 1]),
    o: still(opacity * a),
    w: still(width),
    lc: 2,
    lj: 2,
    ml: 4,
    ...(dash && {
      d: [
        { n: 'd', nm: 'dash', v: still(dash[0]) },
        { n: 'g', nm: 'gap', v: still(dash[1]) },
        { n: 'o', nm: 'offset', v: dash[2] },
      ],
    }),
  };
};

const linearStroke = (list: [number, string][], from: V, to: V, width: number) => ({
  ty: 'gs',
  o: still(100),
  w: still(width),
  g: stops(list),
  s: still(at(from[0], from[1])),
  e: still(at(to[0], to[1])),
  t: 1,
  lc: 2,
  lj: 2,
  ml: 4,
});

/* Lottie paints a group's first item on top, so nested groups are reversed. */
function group(
  items: unknown[],
  tr: { pivot?: [number, number]; p?: unknown; s?: unknown; r?: unknown; o?: unknown } = {},
) {
  const pivot = at(...(tr.pivot ?? [50, 50]));
  return {
    ty: 'gr',
    it: [
      ...(items.every((item) => (item as { ty: string }).ty === 'gr')
        ? [...items].reverse()
        : items),
      {
        ty: 'tr',
        a: still(pivot),
        p: tr.p ?? still(pivot),
        s: tr.s ?? still([100, 100]),
        r: tr.r ?? still(0),
        o: tr.o ?? still(100),
        sk: still(0),
        sa: still(0),
      },
    ],
  };
}

function softEllipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  list: [number, string][],
  rotate = 0,
) {
  return group([ellipse(cx, cy, rx, rx), radial(list, cx, cy, rx)], {
    pivot: [cx, cy],
    s: still([100, (ry / rx) * 100]),
    r: still(rotate),
  });
}

let index = 0;
const layers: unknown[] = [];
function layer(
  name: string,
  shapes: unknown[],
  ks: { pivot?: [number, number]; p?: unknown; s?: unknown; r?: unknown; o?: unknown } = {},
  extra: Record<string, unknown> = {},
): number {
  index += 1;
  const pivot = at(...(ks.pivot ?? [50, 50]));
  layers.push({
    ddd: 0,
    ind: index,
    ty: shapes.length ? 4 : 3,
    nm: name,
    sr: 1,
    ks: {
      o: ks.o ?? still(100),
      r: ks.r ?? still(0),
      p: ks.p ?? still([...pivot, 0]),
      a: still([...pivot, 0]),
      s: ks.s ?? still([100, 100, 100]),
    },
    ao: 0,
    ...(shapes.length && { shapes: [...shapes].reverse() }),
    ip: 0,
    op: END,
    st: 0,
    bm: 0,
    ...extra,
  });
  return index;
}

const BODY =
  'M50 38C70 38 84.5 52.5 84.5 71C84.5 86 72 94 50 94C28 94 15.5 86 15.5 71C15.5 52.5 30 38 50 38Z';
const S3 = (x: number, y: number): V => [x, y, 100];
const P3 = (x: number, y: number): V => [...at(x, y), 0];

function only(...names: string[]): unknown {
  return track(0, Object.fromEntries(names.map((name) => [name, [[0, 100, 'hold']]])));
}

const bodyScale = track(S3(100, 100), {
  idle: [
    [0, S3(98, 102), 'out'],
    [21, S3(104, 96), 'out'],
    [32, S3(99, 101), 'inOut'],
    [42, S3(100, 100)],
  ],
  heads: hop(),
  done: hop(),
  think: [
    [0, S3(97, 104), 'out'],
    [12, S3(108, 92), 'out'],
    [21, S3(98, 102), 'inOut'],
    [30, S3(100, 100)],
  ],
  talk: [
    [0, S3(100, 100), 'out'],
    [5, S3(101.5, 98.5), 'inOut'],
    [12, S3(100, 100)],
  ],
});
function hop(): Track {
  return [
    [0, S3(100, 100), 'out'],
    [5, S3(107, 93), 'out'],
    [14, S3(95, 106), 'out'],
    [22, S3(100, 100), 'in'],
    [30, S3(96, 105), 'out'],
    [34, S3(107, 93), 'inOut'],
    [43, S3(98, 102), 'inOut'],
    [54, S3(100, 100)],
  ];
}
const lift = (y: number): V => P3(50, 94 + y);
const bodyPosition = track(P3(50, 94), {
  idle: [
    [0, lift(-3), 'out'],
    [21, lift(0)],
  ],
  heads: hopY(),
  done: hopY(),
  'listen-loop': floatY(108),
  'think-loop': floatY(144),
  speak: [
    [0, lift(0), 'inOut'],
    [36, lift(-2), 'inOut'],
    [71, lift(0)],
  ],
  talk: [
    [0, lift(0), 'out'],
    [5, lift(-1.6), 'inOut'],
    [12, lift(0)],
  ],
  think: [
    [0, lift(-5), 'out'],
    [12, lift(0)],
  ],
});
function hopY(): Track {
  return [
    [0, lift(0), 'out'],
    [5, lift(0), 'out'],
    [14, lift(-8), 'out'],
    [22, lift(-10.7), 'in'],
    [30, lift(-1), 'out'],
    [34, lift(0)],
  ];
}
function floatY(frames: number): Track {
  return [
    [0, lift(0), 'inOut'],
    [frames / 2, lift(-2.5), 'inOut'],
    [frames - 1, lift(0)],
  ];
}
const body = layer('body', [], { pivot: [50, 94], p: bodyPosition, s: bodyScale });
const child = { parent: body };

layer(
  'halo',
  [
    group([ellipse(50, 65, 39, 39), stroke('#5AB6FF', 7, 16)]),
    group([
      ellipse(50, 65, 39, 39),
      {
        ...linearStroke(
          [
            [0, '#22D3EE'],
            [0.5, '#5AB6FF'],
            [1, '#A78BFA'],
          ],
          [11, 26],
          [89, 104],
          2.8,
        ),
        d: [
          { n: 'd', nm: 'dash', v: still(52) },
          { n: 'g', nm: 'gap', v: still(30) },
          { n: 'd', nm: 'dash', v: still(34) },
          { n: 'g', nm: 'gap', v: still(50) },
        ],
      },
    ]),
  ],
  {
    pivot: [50, 65],
    o: only('think', 'think-loop'),
    r: track(0, {
      'think-loop': [
        [0, 0, 'lin'],
        [143, 357.5],
      ],
    }),
  },
  child,
);

for (const delay of [0, 54]) {
  const wave = (from: number): Track =>
    from === 0
      ? [
          [0, S3(78, 78), 'out'],
          [107, S3(132, 132)],
        ]
      : [
          [0, S3(105, 105), 'out'],
          [53, S3(132, 132), 'hold'],
          [54, S3(78, 78), 'out'],
          [107, S3(105, 105)],
        ];
  const fade = (from: number): Track =>
    from === 0
      ? [
          [0, 60, 'out'],
          [107, 0],
        ]
      : [
          [0, 30, 'out'],
          [53, 0, 'hold'],
          [54, 60, 'out'],
          [107, 30],
        ];
  layer(
    'ring',
    [group([ellipse(50, 65, 37, 37), stroke('#2096FF', 1.6)])],
    {
      pivot: [50, 65],
      s: track(S3(100, 100), { 'listen-loop': wave(delay) }),
      o: track(0, { listen: [[0, 0, 'hold']], 'listen-loop': fade(delay) }),
    },
    child,
  );
}

const tuftRotation = track(0, {
  idle: [
    [0, 0, 'inOut'],
    [32, -6, 'inOut'],
    [76, 7, 'inOut'],
    [107, 0],
  ],
  heads: perk(-10),
  listen: perk(-10),
  'listen-loop': [[0, -10, 'hold']],
  think: [
    [0, 0, 'out'],
    [29, -16],
  ],
  'think-loop': [
    [0, -16, 'inOut'],
    [36, 18, 'inOut'],
    [72, -16, 'inOut'],
    [108, 18, 'inOut'],
    [143, -16],
  ],
  speak: [
    [0, 0, 'inOut'],
    [22, -6, 'inOut'],
    [50, 7, 'inOut'],
    [71, 0],
  ],
  talk: [[0, -3, 'hold']],
  done: [
    [0, 0, 'inOut'],
    [22, -6, 'inOut'],
    [50, 7, 'inOut'],
    [71, 0],
  ],
});
function perk(rest: number): Track {
  return [
    [0, 0, 'inOut'],
    [29, rest + 9, 'inOut'],
    [50, rest - 4, 'inOut'],
    [71, rest],
  ];
}
const LOOK: Record<string, [number, number]> = {
  heads: [0, -0.7],
  listen: [0, -1],
  'listen-loop': [0, -1],
  think: [2.4, -2.3],
  'think-loop': [2.4, -2.3],
  speak: [1.3, 0.2],
  talk: [1.3, 0.2],
  done: [0, -0.6],
};
function look(factor: number, cx = 50, cy = 50): unknown {
  return track(
    at(cx, cy),
    Object.fromEntries(
      Object.entries(LOOK).map(([name, [x, y]]) => {
        const to = at(cx + x * factor, cy + y * factor);
        const glance =
          name.endsWith('-loop') || name === 'talk'
            ? [[0, to, 'hold'] as Key]
            : [[0, at(cx, cy), 'out'] as Key, [24, to] as Key];
        return [name, glance];
      }),
    ),
  );
}
layer(
  'curl',
  [
    group(
      [
        path(
          'M45.5 43.8C43.2 33.5 47.8 20.5 60 20.5C68.2 20.5 74.1 29.3 68.2 36C63.7 40.4 56.9 36.5 58.2 30.7C58.4 29.9 60.9 30.2 60.8 31.3C60.1 34.2 63.4 34.5 64.9 32.9C68 29.5 63.1 26.5 60 26.5C52.3 26.5 51.3 36.7 52.5 42.2Z',
        ),
        stroke('#0F6FE8', 2),
        fill('#1A7CF5'),
      ],
      { pivot: [50, 42] },
    ),
    group(
      [
        path(
          'M46.9 43.5C44.8 34.1 48.7 21.7 60 21.7C67.3 21.7 71.9 28.9 66.7 34.7C63.3 38.2 57.6 35.8 58.7 30.8C58.8 30.4 59.9 30.5 59.8 31.1C59 34.6 63.5 35.6 65.6 33.6C68.9 29.8 64.3 24.2 60 24.2C49.9 24.2 48.7 35 50.4 42.7Z',
        ),
        linearFill(
          [
            [0, '#3399FF'],
            [1, '#8FD3FF'],
          ],
          [47.2, 43.5],
          [61.7, 21.7],
        ),
      ],
      { pivot: [50, 42] },
    ),
    group(
      [
        path('M47.3 37.8C47.3 33.9 48.4 30 50.8 27C53 24.3 56.2 22.7 59.7 22.6'),
        stroke('#FFFFFFBF', 1.1),
      ],
      {
        pivot: [50, 42],
      },
    ),
  ],
  { pivot: [50, 42], r: tuftRotation, p: lookTrack3(-0.3, 50, 42) },
  child,
);
function lookTrack3(factor: number, cx: number, cy: number): unknown {
  const flat = look(factor, cx, cy) as { a: number; k: unknown };
  if (flat.a === 0) return still([...at(cx, cy), 0]);
  return {
    a: 1,
    k: (flat.k as { s: V }[]).map((key) => ({ ...key, s: [...key.s, 0] })),
  };
}

layer(
  'shell',
  [
    group([
      path(BODY),
      radial(
        [
          [0, '#B3E2FF'],
          [0.26, '#5BB6FF'],
          [0.58, '#1E8CFF'],
          [0.82, '#1670F5'],
          [1, '#2B52DE'],
        ],
        38.96,
        50.32,
        60,
      ),
    ]),
  ],
  {},
  child,
);

const clip = {
  hasMask: true,
  masksProperties: [
    {
      inv: false,
      mode: 'a',
      pt: (path(BODY) as { ks: unknown }).ks,
      o: still(100),
      x: still(0),
      nm: 'glass',
    },
  ],
};
layer(
  'inside',
  [
    softEllipse(50, 101, 38, 12, [
      [0.2, '#7FD3FF66'],
      [1, '#7FD3FF00'],
    ]),
    softEllipse(60, 80, 21, 12, [
      [0, '#49C6FF99'],
      [1, '#49C6FF00'],
    ]),
    softEllipse(48.8, 39, 4.2, 1.9, [
      [0, '#062A8C99'],
      [1, '#062A8C00'],
    ]),
    group([
      path(BODY),
      linearStroke(
        [
          [0.5, '#C6F6FF00'],
          [1, '#C6F6FFF2'],
        ],
        [22.4, 52],
        [81.05, 82.8],
        7.2,
      ),
    ]),
    group([
      path(BODY),
      linearStroke(
        [
          [0.3, '#1A84F5'],
          [1, '#0A6FE0'],
        ],
        [50, 38],
        [50, 94],
        4.4,
      ),
    ]),
    group(
      [
        group([path('M27.1 49.5C31.4 46 36.8 43.2 42.5 41.5'), stroke('#FFFFFFB3', 1.2)]),
        softEllipse(
          39.6,
          51.5,
          15,
          8,
          [
            [0, '#FFFFFFCC'],
            [1, '#FFFFFF00'],
          ],
          -35,
        ),
        group([ellipse(37.7, 48.6, 2.7, 1.5), fill('#FFFFFF')], {
          pivot: [37.7, 48.6],
          r: still(-35),
        }),
      ],
      { p: look(-0.4) },
    ),
  ],
  {},
  { ...child, ...clip },
);

const blush: Record<string, number> = {
  done: 85,
  speak: 90,
  talk: 80,
  heads: 50,
  sorry: 45,
  sleep: 45,
};
const cheekScale = track([100, 100], {
  speak: [
    [0, [100, 100], 'out'],
    [17, [134, 134], 'inOut'],
    [48, [100, 100]],
  ],
});
layer(
  'cheeks',
  [29.5, 70.5].map((x) =>
    group(
      [
        softEllipse(x, 76.5, 6.6, 3.9, [
          [0, '#FF8CC6E6'],
          [1, '#FF8CC600'],
        ]),
        softEllipse(x - 1.9, 75, 2.2, 1.2, [
          [0, '#FFFFFFCC'],
          [1, '#FFFFFF00'],
        ]),
      ],
      { pivot: [x, 76.5], s: cheekScale },
    ),
  ),
  {
    o: track(
      62,
      Object.fromEntries(
        SEGMENTS.map(([name]) => [
          name,
          [[0, blush[name.replace('-loop', '')] ?? 62, 'hold'] as Key],
        ]),
      ),
    ),
    p: lookTrack3(0.7, 50, 50),
  },
  child,
);

const blinkScale = track([100, 100], {
  idle: [
    [0, [100, 100], 'hold'],
    [98, [100, 100], 'inOut'],
    [102, [100, 10], 'inOut'],
    [107, [100, 100]],
  ],
  heads: widen(110),
  listen: widen(114),
  'listen-loop': [[0, [114, 114], 'hold']],
  'think-loop': [
    [0, [100, 100], 'hold'],
    [126, [100, 100], 'inOut'],
    [131, [100, 10], 'inOut'],
    [136, [100, 100]],
  ],
});
function widen(to: number): Track {
  return [
    [0, [100, 100], 'out'],
    [18, [to, to]],
  ];
}
const eye = (cx: number) =>
  group([
    ellipse(cx, 67, 4.5, 5.9),
    radial(
      [
        [0, '#4B8CF5'],
        [0.5, '#173A8A'],
        [1, '#07122C'],
      ],
      cx,
      70.3,
      7.2,
    ),
  ]);
const MOUTHS: Record<string, string> = {
  smile: 'M45.6 75.6Q50 79.6 54.4 75.6',
  soft: 'M47.2 76.4Q50 78.4 52.8 76.4',
  level: 'M46.6 77.2H53.4',
};
const MOUTH_OF: Record<string, string> = {
  heads: 'soft',
  listen: 'soft',
  'listen-loop': 'soft',
  think: 'o',
  'think-loop': 'o',
  speak: 'o',
  talk: 'o',
  sorry: 'level',
  sleep: 'soft',
};
const mouthOf = (name: string) => MOUTH_OF[name] ?? 'smile';
const showWhen = (test: (name: string) => boolean) =>
  track(
    0,
    Object.fromEntries(
      SEGMENTS.map(([name]) => [name, [[0, test(name) ? 100 : 0, 'hold'] as Key]]),
    ),
  );
layer(
  'face',
  [
    softEllipse(40.7, 68.3, 6.6, 8, [
      [0, '#062A8C4D'],
      [1, '#062A8C00'],
    ]),
    softEllipse(60.7, 68.3, 6.6, 8, [
      [0, '#062A8C4D'],
      [1, '#062A8C00'],
    ]),
    group(
      [
        eye(40),
        eye(60),
        group([ellipse(38.5, 64.3, 1.6, 1.6), ellipse(58.5, 64.3, 1.6, 1.6), fill('#FFFFFF')], {
          p: look(-0.3),
        }),
        group([
          ellipse(41.7, 70.3, 0.75, 0.75),
          ellipse(61.7, 70.3, 0.75, 0.75),
          fill('#FFFFFF', 80),
        ]),
      ],
      { pivot: [50, 67], s: blinkScale, o: showWhen((name) => name !== 'done') },
    ),
    group(
      [
        path('M35.5 68.5Q40 62.5 44.5 68.5'),
        path('M55.5 68.5Q60 62.5 64.5 68.5'),
        stroke('#0B1B3A', 2.4),
      ],
      {
        o: showWhen((name) => name === 'done'),
      },
    ),
    group([path('M56.2 56.4Q60.4 53.4 64.6 55.4'), stroke('#0B1B3A', 2.4)], {
      o: showWhen((name) => name.startsWith('think')),
    }),
    ...['smile', 'soft', 'level'].map((kind) =>
      group([path(MOUTHS[kind]), stroke('#0B1B3A', 2.4)], {
        pivot: [50, 76],
        o: showWhen((name) => mouthOf(name) === kind),
        s:
          kind === 'smile'
            ? track([100, 100], {
                done: [
                  [0, [100, 100], 'out'],
                  [18, [118, 118]],
                ],
              })
            : still([100, 100]),
      }),
    ),
    group([ellipse(50, 77.4, 2.7, 3.1), fill('#0B1B3A')], {
      pivot: [50, 77.4],
      o: showWhen((name) => mouthOf(name) === 'o'),
      s: track([100, 100], {
        think: [[0, [62, 62], 'hold']],
        'think-loop': [[0, [62, 62], 'hold']],
        speak: [[0, [90, 90], 'hold']],
        talk: [
          [0, [55, 40], 'out'],
          [5, [105, 120], 'inOut'],
          [12, [55, 40]],
        ],
      }),
    }),
  ],
  { p: lookTrack3(1, 50, 50) },
  child,
);

layer(
  'gust',
  [
    group([
      path('M86.5 60.5Q91.5 58.9 97 60.9'),
      path('M88.5 67.5Q92.5 66.5 96.5 67.8'),
      path('M86.5 74.5Q90 73.7 93.5 74.9'),
      stroke('#3A9DFF', 2.4, 100, [
        6,
        8,
        track(0, {
          speak: [
            [0, 0, 'lin'],
            [48, -28],
          ],
        }),
      ]),
    ]),
  ],
  {
    o: track(0, {
      speak: [
        [0, 0, 'out'],
        [7, 100, 'hold'],
        [34, 100, 'in'],
        [48, 0],
      ],
    }),
  },
  child,
);

const lottie = {
  v: '5.7.4',
  fr: FPS,
  ip: 0,
  op: END,
  w: 120,
  h: 120,
  nm: 'Bora',
  ddd: 0,
  assets: [],
  // Lottie paints its first layer on top.
  layers: layers.reverse(),
  markers: SEGMENTS.map(([name, frames]) => ({ tm: START[name], cm: name, dr: frames - 1 })),
};
writeFileSync(new URL('../public/animations/bora.json', import.meta.url), JSON.stringify(lottie));
console.log(`bora.json: ${END} frames, ${JSON.stringify(lottie).length} bytes`);
