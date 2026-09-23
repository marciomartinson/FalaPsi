const fs = require('fs');

const project = JSON.parse(fs.readFileSync('stitch_project.json', 'utf8'));
console.log('Project:', JSON.stringify(project).slice(0, 500));

const screens = JSON.parse(fs.readFileSync('stitch_screens.json', 'utf8'));
console.log('Screens type:', Array.isArray(screens), 'length:', screens.length);

// Let us inspect the screen objects
function analyze(obj, depth = 0) {
  if (depth > 4) return;
  if (Array.isArray(obj)) {
    console.log('  '.repeat(depth) + `Array(${obj.length})`);
    for (let i = 0; i < Math.min(obj.length, 5); i++) {
      if (typeof obj[i] === 'string' && obj[i].length > 80) {
        console.log('  '.repeat(depth + 1) + `[${i}]: string("${obj[i].slice(0, 80)}...")`);
      } else if (typeof obj[i] === 'object' && obj[i] !== null) {
        console.log('  '.repeat(depth + 1) + `[${i}]:`);
        analyze(obj[i], depth + 2);
      } else {
        console.log('  '.repeat(depth + 1) + `[${i}]:`, obj[i]);
      }
    }
  } else if (typeof obj === 'object' && obj !== null) {
    console.log('  '.repeat(depth) + 'Object keys:', Object.keys(obj));
  }
}

analyze(screens);
