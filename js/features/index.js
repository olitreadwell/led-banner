// Feature registry. Each feature is a self-contained module that default-exports
// { id, mount?, read?, render?, restore? } and builds a web component from
// js/components.js. Order here is the order controls appear in the panel
// (after the core text, colour and speed controls).
import motion from './motion.js';
import font from './font.js';
import glow from './glow.js';
import blink from './blink.js';
import direction from './direction.js';
import mirror from './mirror.js';

export const features = [motion, font, glow, blink, direction, mirror];
