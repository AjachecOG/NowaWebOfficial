import { chromium } from '@playwright/test';
const browser = await chromium.launch({channel:'chrome'});
try {
 const page = await browser.newPage({viewport:{width:1440,height:1000}});
 page.on('pageerror', e=>console.log('ERROR',e.message));
 await page.goto('http://127.0.0.1:4322/');
 await page.getByRole('button',{name:'Tylko niezbędne'}).click();
 await page.waitForTimeout(2500);
 await page.screenshot({path:'output/playwright/hero-final.png'});
 console.log('HERO',await page.locator('.paper-poland').evaluate(e=>({bounds:e.getBoundingClientRect().toJSON(), live:e.className, animations:e.getAnimations().length,hero:document.querySelector('.hero').getBoundingClientRect().toJSON()})));
 console.log('OVERFLOW',await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth})));
 const logo=page.locator('.paper-logo');
 const box=await logo.boundingBox();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);
 await page.waitForTimeout(350);
 console.log('HOVER',await logo.evaluate(e=>({hover:e.style.getPropertyValue('--hero-hover-y'),live:e.className,transform:getComputedStyle(e).transform})));
 await page.locator('.process-story').scrollIntoViewIfNeeded();
 await page.waitForTimeout(1000);
 const metrics=await page.locator('.process-story').evaluate(e=>({top:e.getBoundingClientRect().top+scrollY,height:e.offsetHeight}));
 for (const p of [0,.33,.66,1]) {
  await page.evaluate(({metrics,p})=>window.scrollTo({top:metrics.top-80+p*(metrics.height-innerHeight+80),behavior:'instant'}),{metrics,p});
  await page.waitForTimeout(1100);
  console.log('PROCESS',p,await page.locator('.process-story').evaluate(e=>({active:e.dataset.active,visible:e.dataset.storyVisible,sticky:e.querySelector('.process-story__sticky').getBoundingClientRect().top,card:e.querySelector('.process-story__card').style.cssText,animations:e.getAnimations({subtree:true}).filter(a=>a.playState==='running').length})));
 }
} finally {await browser.close();}
