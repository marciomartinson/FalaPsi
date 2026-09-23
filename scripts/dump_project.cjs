const https = require('https');
const fs = require('fs');

async function callRpc(rpcId, payload) {
  const reqData = `f.req=${encodeURIComponent(JSON.stringify([[[rpcId, JSON.stringify(payload), null, 'generic']]]))}`;
  
  return new Promise((resolve, reject) => {
    const req = https.request('https://stitch.withgoogle.com/_/Nemo/data/batchexecute?rpcids=' + rpcId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          // batchexecute response format: )]}' \n [ [ "wrb.fr", rpcId, "json_string", ... ] ]
          const clean = body.replace(/^\)\]\}'/, '').trim();
          const parsed = JSON.parse(clean);
          for (const item of parsed) {
            if (item[0] === 'wrb.fr' && item[1] === rpcId) {
              const inner = JSON.parse(item[2]);
              return resolve(inner);
            }
          }
          resolve(parsed);
        } catch (e) {
          resolve({ error: e.message, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.write(reqData);
    req.end();
  });
}

async function dump() {
  const projectId = '11725044996838075730';
  const parent = `projects/${projectId}`;

  console.log('Fetching GetProject...');
  const project = await callRpc('eW2RYb', [parent]);
  fs.writeFileSync('stitch_project.json', JSON.stringify(project, null, 2));

  console.log('Fetching ListScreens...');
  const screens = await callRpc('ErneX', [parent]);
  fs.writeFileSync('stitch_screens.json', JSON.stringify(screens, null, 2));

  console.log('Done dumping project and screens!');
}

dump().catch(console.error);
