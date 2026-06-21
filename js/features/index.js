// Feature registry. Each feature is a self-contained module that default-exports
// { id, mount?, read?, render?, restore? } and builds a web component from
// js/components.js. Order here is the order controls appear in the panel
// (after the core text, colour and speed controls).
import motion from './motion.js';
import rainbow from './rainbow.js';
import font from './font.js';
import size from './size.js';
import glow from './glow.js';
import brightness from './brightness.js';
import blink from './blink.js';
import dots from './dots.js';
import direction from './direction.js';
import pause from './pause.js';
import autorotate from './autorotate.js';
import mirror from './mirror.js';
import slots from './slots.js';
import exportVideo from './export.js';

export const features = [
  motion,
  rainbow,
  font,
  size,
  glow,
  brightness,
  blink,
  dots,
  direction,
  pause,
  autorotate,
  mirror,
  slots,
  exportVideo,
];
