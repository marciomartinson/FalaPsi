const fs = require('fs');
const path = require('path');

const screens = JSON.parse(fs.readFileSync('stitch_screens.json', 'utf8'))[0];
const outDir = path.resolve('stitch_assets');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function download(url, dest) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`Failed to fetch ${url}: status ${res.status}`);
      return false;
    }
    const buf = await res.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buf));
    console.log(`Saved ${dest} (${buf.byteLength} bytes)`);
    return true;
  } catch (e) {
    console.error(`Error downloading ${dest}:`, e.message);
    return false;
  }
}

async function run() {
  for (let i = 0; i < screens.length; i++) {
    const s = screens[i];
    const id = s[4];
    const name = s[8] || `screen_${i}`;
    const safeName = name.replace(/[^a-zA-Z0-9_\-]/g, '_').toLowerCase();
    
    console.log(`\nProcessing screen ${i}: ${name}`);
    const screenshotUrl = s[0] && s[0][2];
    const htmlUrl = s[1] && s[1][2];

    if (screenshotUrl) {
      await download(screenshotUrl, path.join(outDir, `${i}_${safeName}_screenshot.png`));
    }
    if (htmlUrl) {
      await download(htmlUrl, path.join(outDir, `${i}_${safeName}.html`));
    }
  }
}

run().catch(console.error);
