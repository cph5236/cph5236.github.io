// Checks the GitHub Pages redirect stubs: node tools/test_redirect.js
const fs = require('fs');
const cases = [
  ['/', '', '', 'https://hanlinsoftware.com/'],
  ['/ApiBuilder/api-builder.html', '?x=1', '#y', 'https://hanlinsoftware.com/ApiBuilder/api-builder.html?x=1#y'],
  ['/cv.pdf', '', '', 'https://hanlinsoftware.com/cv.pdf'],
  ['/', '', '#projects', 'https://hanlinsoftware.com/about/#projects'],
  ['/index.html', '', '#skills', 'https://hanlinsoftware.com/about/#skills'],
  ['/', '', '#about', 'https://hanlinsoftware.com/about/#about'],
];
let failed = 0;
for (const file of ['index.html', '404.html']) {
  const script = fs.readFileSync(file, 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
  for (const [pathname, search, hash, want] of cases) {
    let got;
    const location = { pathname, search, hash, replace: u => { got = u; } };
    new Function('location', script)(location);
    const ok = got === want;
    if (!ok) failed++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${file} ${pathname}${search}${hash} -> ${got}${ok ? '' : ' (want ' + want + ')'}`);
  }
}
process.exit(failed ? 1 : 0);
