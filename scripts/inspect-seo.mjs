import { chromium } from '@playwright/test';
const b = await chromium.launch({channel: 'chrome', headless: true});
try {
  const page = await b.newPage({viewport:{width:1440,height:1000}});
  await page.goto('http://127.0.0.1:4322/');
  await page.waitForLoadState('networkidle');
  console.log('OVERFLOW', await page.evaluate(() => ({width:innerWidth, scroll:document.documentElement.scrollWidth, elements:[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,cls:e.className,rect:e.getBoundingClientRect().toJSON()})).filter(e=>e.rect.right>innerWidth+2 && e.rect.width>0).slice(0,20)})));
  await page.getByRole('button',{name:'Tylko niezbędne'}).click();
  await page.locator('.service-board').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  console.log('CARD', await page.locator('.service-card--image').first().evaluate(e=>({overflow:getComputedStyle(e).overflow,card:e.getBoundingClientRect().toJSON(),caption:e.querySelector('.seo-service-caption').getBoundingClientRect().toJSON()})));
  await page.screenshot({path:'output/playwright/services-board.png'});
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.screenshot({path:'output/playwright/footer.png'});
  for (const [route,name] of [['/strony-internetowe-dla-firm/','service'],['/realizacje/cakepops/','case'],['/o-nas/','about'],['/cennik/','pricing']]) {
    await page.goto('http://127.0.0.1:4322'+route); await page.screenshot({path:`output/playwright/${name}-desktop.png`,fullPage:true});
    await page.setViewportSize({width:390,height:844});await page.screenshot({path:`output/playwright/${name}-mobile.png`,fullPage:true});await page.setViewportSize({width:1440,height:1000});
  }
} finally { await b.close(); }
