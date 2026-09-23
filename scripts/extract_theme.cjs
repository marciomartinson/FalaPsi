const fs = require('fs');

const content = fs.readFileSync('stitch_assets/3_tela_4__revis_o_do_rascunho_cl_nico.html', 'utf8');
const match = content.match(/tailwind\.config\s*=\s*({[\s\S]*?});/);
if (match) {
  fs.writeFileSync('stitch_tailwind_theme.json', match[1]);
  console.log('Saved stitch_tailwind_theme.json');
} else {
  console.log('No tailwind config found');
}
