/* Render every slide to one PDF page (1600×900 px, vector). Usage: node tools/pdf.js [url] [out.pdf] */
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const url = process.argv[2] || 'file://' + path.resolve(__dirname, '../index.html');
  const out = process.argv[3] || path.resolve(__dirname, '../../export/Site_Analysis_PE_Faculty_Tehran.pdf');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
  await p.emulateMedia({ reducedMotion: 'reduce' });
  await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  const n = await p.$$eval('.slide', (s) => s.length);
  /* visit every slide so each composition is built and sized at scale 1 */
  for (let i = 0; i < n; i++) { await p.evaluate((i) => SA.go(i), i); await p.waitForTimeout(1500); }
  await p.evaluate(() => {
    document.querySelectorAll('.slide').forEach((sec) => sec._leave && sec._leave());
    document.querySelectorAll('.draw').forEach((e) => e.classList.add('on'));
    document.documentElement.classList.add('print-all'); document.body.classList.add('print-all');
  });
  await p.waitForTimeout(800);
  await p.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
  await p.evaluate(() => { SA.stageScale = 1; SA.maps.forEach((m) => m.refresh()); });
  await p.waitForTimeout(800);
  await p.evaluate(() => document.querySelectorAll('.slide').forEach((sec) => { sec.inert = false; }));
  await p.pdf({ path: out, width: '1600px', height: '900px', printBackground: true });
  console.log(n + ' slides → ' + out);
  await b.close();
  console.log(n + ' pages');
})();
