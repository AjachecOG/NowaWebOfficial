import { test, expect } from '@playwright/test';

test('contact uses the desktop width and its artwork stays animated', async ({page}) => {
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/kontakt/');
  await page.getByRole('button',{name:'Tylko niezbędne'}).click();
  const layout=page.locator('.contact-page__layout');
  expect((await layout.boundingBox())!.width).toBeGreaterThan(1100);
  await expect(page.locator('.contact-artwork')).toBeVisible();
  const letter=page.locator('.contact-artwork__letter');
  const before=await letter.evaluate(e=>getComputedStyle(e).translate);
  await page.waitForTimeout(450);
  expect(await letter.evaluate(e=>getComputedStyle(e).translate)).not.toBe(before);
  expect(await letter.evaluate(e=>getComputedStyle(e).animationPlayState)).toBe('running');
});

test('form errors explain the problem and clear after correction', async ({page}) => {
  await page.goto('/kontakt/');
  await page.getByRole('button',{name:'Tylko niezbędne'}).click();
  const name=page.locator('[name="name"]');
  await name.fill('   ');
  await name.blur();
  await expect(name).toHaveAttribute('aria-invalid','true');
  await expect(page.locator('#kontakt-name-error')).toHaveText('Podaj imię lub nazwę firmy.');
  await name.fill('Anna');
  await expect(page.locator('#kontakt-name-error')).toBeHidden();
  await page.locator('[name="email"]').fill('anna@example.com');
  await page.locator('[name="message"]').fill('Potrzebuję strony dla pracowni.');
  const phone=page.locator('[name="phone"]');
  await phone.fill('123');
  await phone.blur();
  await expect(phone).toHaveAttribute('aria-invalid','true');
  await phone.fill('+48 (794) 346-581');
  expect(await page.locator('form').evaluate((f:HTMLFormElement)=>f.checkValidity())).toBe(true);
  await phone.fill('');
  expect(await page.locator('form').evaluate((f:HTMLFormElement)=>f.checkValidity())).toBe(true);
});

test('mobile navigation works without JavaScript', async ({browser}) => {
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:4322/kontakt/');
  await page.getByRole('button',{name:'Menu',exact:true}).click();
  await page.getByRole('navigation',{name:'Menu mobilne'}).getByRole('link',{name:'Realizacje',exact:true}).click();
  await expect(page).toHaveURL(/\/realizacje\/$/);
  await expect(page.locator('h1')).toBeVisible();
  await context.close();
});

test('cookie settings can be reopened and restore keyboard focus', async ({page}) => {
  await page.goto('/kontakt/');
  await page.getByRole('button',{name:'Tylko niezbędne'}).click();
  const opener=page.getByRole('button',{name:'Ustawienia cookies'});
  await opener.click();
  await expect(page.getByRole('button',{name:'Tylko niezbędne'})).toBeFocused();
  await page.getByRole('button',{name:'Akceptuję',exact:true}).click();
  await expect(opener).toBeFocused();
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('nowaweb-cookie-consent')!).analytics)).toBe(true);
});

test('homepage typing, billboard and card interactions survive native initialization', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button',{name:'Tylko niezbędne'}).click();
  await expect(page.locator('[data-hero-eyebrow-text]')).toHaveText('NowaWeb - strony internetowe');
  await expect(page.locator('.paper-logo')).toHaveClass(/hero-motion-live/);
  const billboard=page.locator('[data-monitor-billboard]');
  await expect(billboard).toHaveAttribute('data-billboard-ready','true');
  await expect(billboard.locator('.monitor-state').nth(1)).toHaveClass(/is-active/);
  const trigger=page.locator('[data-service-card-trigger]').first();
  await trigger.scrollIntoViewIfNeeded();
  await page.keyboard.press('Tab');
  await trigger.focus();
  await expect(trigger).toHaveAttribute('aria-expanded','true');
  await page.keyboard.press('Escape');
  await expect(trigger).toHaveAttribute('aria-expanded','false');
});

test('brand card pauses outside the viewport and resumes when visible', async ({page}) => {
  await page.goto('/');
  const stage = page.locator('[data-brand-flip]');
  await stage.scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute('data-rotation-y', /-?\d/);

  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const card = stage.locator('[data-brand-flip-card]');
  const offscreenTransform = await card.evaluate((element: HTMLElement) => element.style.transform);
  await page.waitForTimeout(350);
  expect(await card.evaluate((element: HTMLElement) => element.style.transform)).toBe(offscreenTransform);

  await stage.scrollIntoViewIfNeeded();
  await expect.poll(() => card.evaluate((element: HTMLElement) => element.style.transform)).not.toBe(offscreenTransform);
});

test('billboard loads each later screen when it is needed', async ({page}) => {
  await page.goto('/');
  const frames = page.locator('[data-monitor-billboard] .monitor-state');
  await expect(frames).toHaveCount(3);
  await expect(frames.nth(0)).toHaveAttribute('src', /monitor-screen-1/);
  await expect(frames.nth(1)).not.toHaveAttribute('src', /monitor-screen-2/);
  await expect(frames.nth(2)).not.toHaveAttribute('src', /monitor-screen-3/);
  await expect(frames.nth(1)).toHaveClass(/is-active/, {timeout: 8000});
  expect(await frames.nth(1).evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
});
