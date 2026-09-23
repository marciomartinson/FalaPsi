const fs = require('fs');

const js = fs.readFileSync('/tmp/oxe1Cc.js', 'utf8');
console.log('oxe1Cc length:', js.length);

// Find API endpoints or RPC calls
const endpoints = js.match(/https?:\/\/[^\s"'\)]+/g) || [];
console.log('Endpoints:', [...new Set(endpoints)].slice(0, 30));

// Find string literals mentioning project or screen or prompt or canvas
const literals = js.match(/"([^"\\]|\\.)*"/g) || [];
const matched = literals
  .map(s => s.slice(1, -1))
  .filter(s => /project|screen|canvas|stitch|nemo|template|device/i.test(s));

console.log('Filtered string literals count:', matched.length);
console.log('Sample matched literals:', [...new Set(matched)].slice(0, 50));
