const fs = require('fs');

const raw = fs.readFileSync('stitch_tailwind_theme.json', 'utf8');
// evaluate as object
let theme;
eval('theme = ' + raw);
console.log('Colors:', Object.keys(theme.theme.extend.colors));
console.log('Sample color values:', {
  primary: theme.theme.extend.colors.primary,
  secondary: theme.theme.extend.colors.secondary,
  'secondary-container': theme.theme.extend.colors['secondary-container'],
  surface: theme.theme.extend.colors.surface,
  'surface-container': theme.theme.extend.colors['surface-container'],
  'surface-container-low': theme.theme.extend.colors['surface-container-low'],
  'surface-container-lowest': theme.theme.extend.colors['surface-container-lowest'],
  outline: theme.theme.extend.colors.outline,
  error: theme.theme.extend.colors.error,
});
console.log('Font families:', theme.theme.extend.fontFamily);
