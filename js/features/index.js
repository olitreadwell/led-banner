// Feature registry. Each feature is a self-contained module under this folder
// that default-exports { id, defaults?, mount?, read?, render?, restore? }.
// Adding a feature = one import line + one array entry, so parallel work on
// separate feature files merges cleanly. Order here is the order controls
// appear in the panel.
import presets from './presets.js';
import motion from './motion.js';
import glow from './glow.js';
import direction from './direction.js';
import mirror from './mirror.js';
import blink from './blink.js';

export const features = [presets, motion, glow, direction, mirror, blink];
