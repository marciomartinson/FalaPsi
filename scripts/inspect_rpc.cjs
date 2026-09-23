const fs = require('fs');

const js = fs.readFileSync('/tmp/oxe1Cc.js', 'utf8');

function findContext(str, radius = 400) {
  let idx = 0;
  while ((idx = js.indexOf(str, idx)) !== -1) {
    console.log(`=== Context for ${str} at ${idx} ===`);
    console.log(js.slice(Math.max(0, idx - 200), Math.min(js.length, idx + radius)));
    idx += str.length + 10;
  }
}

console.log('Finding ExportToAis:');
findContext('ExportToAis');

console.log('Finding GetProject:');
findContext('/AppCompanionAgentService.GetProject');

console.log('Finding ListScreens:');
findContext('/AppCompanionAgentService.ListScreens');
