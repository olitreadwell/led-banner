// Named colour presets — quick "looks pro" themes inspired by real LED/sign
// apps. Clicking a preset sets the core fg + bg colours and re-applies, so the
// banner and theme update live. This feature drives the existing fg/bg controls
// rather than owning its own setting, so it has no read/render/restore/defaults.

// label → foreground + background. Edit here to add or tweak a look.
const PRESETS = [
  { name: 'Night', fg: '#ffffff', bg: '#000000' },
  { name: 'Chalk', fg: '#f5f5f0', bg: '#0b3d2e' },
  { name: 'Club', fg: '#ff00d4', bg: '#000000' },
  { name: 'Amber', fg: '#ffb000', bg: '#000000' },
  { name: 'Ice', fg: '#00e5ff', bg: '#001018' },
];

export default {
  id: 'presets',
  mount(ctx) {
    const row = ctx.addRow('Presets');

    const segment = document.createElement('div');
    segment.className = 'segment';

    for (const preset of PRESETS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = preset.name;
      btn.title = `${preset.name}: ${preset.fg} on ${preset.bg}`;
      btn.setAttribute('aria-label', `Apply ${preset.name} preset`);
      btn.addEventListener('click', () => {
        ctx.$('fg').value = preset.fg;
        ctx.$('bg').value = preset.bg;
        ctx.requestApply();
      });
      segment.appendChild(btn);
    }

    row.appendChild(segment);
  },
};
