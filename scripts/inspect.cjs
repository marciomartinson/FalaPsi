const fs = require('fs');

async function main() {
  const res = await fetch("https://stitch.withgoogle.com/projects/11725044996838075730", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9,pt;q=0.8"
    }
  });
  const html = await res.text();
  console.log("HTML length:", html.length);
  fs.writeFileSync("page.html", html);

  // Check all script src in page.html
  const scripts = [...html.matchAll(/src="([^"]+)"/g)].map(m => m[1]);
  console.log("Script sources:", scripts);
}

main().catch(console.error);
