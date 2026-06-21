// Feature registry. Each feature is a self-contained module under this folder
// that default-exports { id, defaults?, mount?, read?, render?, restore? }.
// Adding a feature = one import line + one array entry, so parallel work on
// separate feature files merges cleanly. Order here is the order controls
// appear in the panel.
export const features = [];
