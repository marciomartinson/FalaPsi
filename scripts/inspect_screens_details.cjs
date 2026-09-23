const fs = require('fs');

const screens = JSON.parse(fs.readFileSync('stitch_screens.json', 'utf8'));
const list = screens[0];

console.log(`Found ${list.length} screens:`);
for (let i = 0; i < list.length; i++) {
  const item = list[i];
  console.log(`\n================ SCREEN ${i + 1} ================`);
  console.log('Screen ID:', item[4]);
  // Look for title / name
  for (let j = 0; j < item.length; j++) {
    const val = item[j];
    if (typeof val === 'string' && val.length > 0 && val.length < 150) {
      console.log(`  field[${j}]:`, val);
    } else if (Array.isArray(val)) {
      console.log(`  field[${j}]: Array(${val.length})`);
    }
  }
}
