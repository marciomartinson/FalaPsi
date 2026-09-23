const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('stitch_assets').filter(f => f.endsWith('.html'));

for (const file of files) {
  const content = fs.readFileSync(path.join('stitch_assets', file), 'utf8');
  console.log(`\n=================== FILE: ${file} (${content.length} chars) ===================`);
  
  // Title
  const title = content.match(/<title>([^<]+)<\/title>/i);
  console.log('Title:', title ? title[1] : 'none');
  
  // Look for any style or font imports
  const fonts = content.match(/fonts\.googleapis\.com[^\s"']+/g) || [];
  console.log('Fonts:', [...new Set(fonts)]);

  // Look for icons
  const icons = content.match(/material-symbols-outlined[^>]*>([^<]+)</g) || content.match(/material-icons[^>]*>([^<]+)</g) || [];
  console.log('Sample icons:', [...new Set(icons)].slice(0, 10));

  // Extract headings (h1, h2, h3)
  const headings = content.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi) || [];
  console.log('Headings:', headings.map(h => h.replace(/<[^>]+>/g, '').trim()).slice(0, 8));
}
