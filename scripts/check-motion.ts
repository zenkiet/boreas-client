import assert from 'node:assert/strict';

import { E, S, coastFrames, digitDiff } from '../src/shared/ui/motion/motion.ts';

assert.deepEqual([S.feedback.duration, S.layout.duration, S.pop.duration], [383, 405, 583]);
assert.ok(Math.abs(E.decel(0.5) - 0.75) < 1e-6);
for (let a = 0; a < 360; a += 0.5) assert.ok(coastFrames(a).duration <= 1000);
assert.deepEqual(digitDiff('9', '10'), { dir: 1, changed: [1, 2] });
assert.deepEqual(digitDiff('10', '9'), { dir: -1, changed: [1, 2] });
assert.deepEqual(digitDiff('12', '13'), { dir: 1, changed: [1] });
assert.equal(digitDiff('99+', '100'), null);
console.log('motion: ok');
