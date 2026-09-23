const fs = require('fs');

const html = fs.readFileSync('page.html', 'utf8');
const urls = html.match(/https?:\/\/[^"'\s]+/g) || [];
console.log('URLs in page:');
for (const u of new Set(urls)) {
  console.log('-', u);
}
