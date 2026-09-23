const fs = require('fs');

const screens = JSON.parse(fs.readFileSync('stitch_screens.json', 'utf8'))[0];

for (let i = 0; i < screens.length; i++) {
  const s = screens[i];
  console.log(`\n=== Screen ${i + 1}: ${s[8]} (${s[4]}) ===`);
  // Let's inspect fields that look like files or URLs
  function scan(val, path = '') {
    if (typeof val === 'string') {
      if (val.startsWith('http') || val.includes('.html') || val.includes('.svg') || val.includes('screenshot') || val.includes('<!DOCTYPE') || val.includes('<html')) {
        console.log(`  ${path}:`, val.slice(0, 150));
      }
    } else if (Array.isArray(val)) {
      val.forEach((item, idx) => scan(item, `${path}[${idx}]`));
    } else if (val && typeof val === 'object') {
      Object.entries(val).forEach(([k, v]) => scan(v, `${path}.${k}`));
    }
  }
  scan(s);
}
