const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('stitch_assets').filter(f => f.endsWith('.html'));

for (const file of files) {
  const content = fs.readFileSync(path.join('stitch_assets', file), 'utf8');
  const modals = content.match(/<div[^>]+id="modal-[^"]+"[\s\S]*?<\/div>\s*<\/div>/gi) || [];
  const fixedInsects = content.match(/<div[^>]+class="[^"]*fixed inset-0[^"]*"[\s\S]*?<\/div>/gi) || [];
  console.log(`\n${file}:`);
  console.log('Modals found:', modals.map(m => m.match(/id="([^"]+)"/)[1]));
  console.log('Fixed overlay count:', fixedInsects.length);
}
