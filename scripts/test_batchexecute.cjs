const https = require('https');

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
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(reqData);
    req.end();
  });
}

async function test() {
  const projectId = '11725044996838075730';
  const parent = `projects/${projectId}`;

  console.log('Testing GetProject eW2RYb with [parent]:');
  const res1 = await callRpc('eW2RYb', [parent]);
  console.log('Status:', res1.status);
  console.log('Response sample:', res1.body.slice(0, 500));

  console.log('Testing GetProject eW2RYb with [projectId]:');
  const res2 = await callRpc('eW2RYb', [projectId]);
  console.log('Status:', res2.status);
  console.log('Response sample:', res2.body.slice(0, 500));

  console.log('Testing ListScreens ErneX with [parent]:');
  const res3 = await callRpc('ErneX', [parent]);
  console.log('Status:', res3.status);
  console.log('Response sample:', res3.body.slice(0, 500));

  console.log('Testing ExportToAis ZUuvRd:');
  const res4 = await callRpc('ZUuvRd', [parent]);
  console.log('Status:', res4.status);
  console.log('Response sample:', res4.body.slice(0, 500));
}

test().catch(console.error);
