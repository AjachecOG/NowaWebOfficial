import { test, expect } from '@playwright/test';
const routes = ['/', '/strony-internetowe-dla-firm/', '/landing-page/', '/modernizacja-stron/', '/opieka-nad-strona/', '/o-nas/', '/cennik/', '/realizacje/', '/realizacje/cakepops/', '/realizacje/new-york-rolls/', '/realizacje/atmo-vision/', '/kontakt/', '/polityka-cookies/', '/polityka-prywatnosci/', '/regulamin/'];

for (const width of [390, 1440]) {
  test(`all pages render at ${width}px without script errors, missing images or horizontal overflow`, async ({page}) => {
    await page.setViewportSize({width, height: 900});
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), route).toBeTruthy();
      const images = page.locator('img');
      for (let i = 0; i < await images.count(); i++) {
        const img = images.nth(i);
        // Lazy images load only when reached. Hidden/decorative layers are covered by build asset checks.
        if (await img.isVisible()) { await img.scrollIntoViewIfNeeded(); await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBeTruthy(); }
      }
      expect(errors, `${route}: ${errors.join('; ')}`).toEqual([]);
    }
  });
}

test('service offer captions are actually visible and clickable without flipping cards', async ({page}) => {
  await page.setViewportSize({width: 1440, height: 1000});
  await page.goto('/');
  await page.getByRole('button', {name:'Tylko niezbędne'}).click();
  await page.locator('.service-board').scrollIntoViewIfNeeded();
  expect(await page.locator('.service-card--image').first().evaluate(card => {
    const caption = card.querySelector('.seo-service-caption')!.getBoundingClientRect();
    return caption.bottom <= card.getBoundingClientRect().bottom + 1;
  }), 'Caption must fit in the visible card, not be scrolled into its clipped area').toBeTruthy();
  const caption = page.locator('.seo-service-caption a').first();
  await caption.scrollIntoViewIfNeeded();
  await expect(caption).toBeVisible();
  await caption.click({timeout: 7000});
  await expect(page).toHaveURL(/\/strony-internetowe-dla-firm\/$/);
});

test('mobile menu reaches final links in landscape and restores keyboard focus', async ({page}) => {
  await page.setViewportSize({width: 667, height: 375});
  await page.goto('/kontakt/');
  await page.getByRole('button', {name:'Tylko niezbędne'}).click();
  await page.getByRole('button', {name:'Menu', exact:true}).click();
  const panel = page.locator('.mobile-nav__panel');
  const bounds = await panel.boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(375);
  const last = panel.getByRole('link', {name:'Kontakt', exact:true});
  await last.scrollIntoViewIfNeeded();
  await last.click();
  await page.getByRole('button', {name:'Menu', exact:true}).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', {name:'Menu', exact:true})).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});

test('FAQ answers work with JavaScript disabled', async ({browser}) => {
  const context = await browser.newContext({javaScriptEnabled:false});
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322/landing-page/');
  const question = page.locator('.seo-faq details').first();
  await question.locator('summary').click();
  await expect(question).toHaveAttribute('open','');
  await expect(question.locator('p')).toBeVisible();
  await context.close();
});

test('carousel changes project, its link follows selection, and home contact opens', async ({page}) => {
  await page.goto('/');
  await page.getByRole('button', {name:'Tylko niezbędne'}).click();
  const stage = page.locator('.portfolio-carousel__stage');
  await stage.scrollIntoViewIfNeeded();
  await expect(page.locator('astro-island[component-url*="PortfolioCarousel"]')).not.toHaveAttribute('ssr', '');
  await expect(page.locator('.seo-project-link')).toHaveAttribute('href','/realizacje/new-york-rolls/');
  await stage.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.seo-project-link')).toHaveAttribute('href','/realizacje/atmo-vision/');
  await page.locator('[data-open-contact-form]').click();
  await expect(page.locator('#cta-contact-form input[name="name"]')).toBeVisible();
});

test('contact form enforces validity and submits its expected payload locally', async ({page}) => {
  await page.goto('/kontakt/');
  await page.getByRole('button', {name:'Tylko niezbędne'}).click();
  const form = page.locator('form[name="kontakt"]');
  await form.getByRole('button', {name:'Wyślij zapytanie'}).click();
  expect(await form.evaluate((el: HTMLFormElement) => el.checkValidity())).toBe(false);
  await form.locator('[name="name"]').fill('Test lokalny NowaWeb');
  await form.locator('[name="email"]').fill('test@example.com');
  await form.locator('[name="phone"]').fill('123');
  await form.locator('[name="message"]').fill('Test lokalny — nie wysyłać do firmy.');
  expect(await form.evaluate((el: HTMLFormElement) => el.checkValidity())).toBe(false);
  await form.locator('[name="phone"]').fill('+48 794 346 581');
  expect(await form.evaluate((el: HTMLFormElement) => el.checkValidity())).toBe(true);
  let body = '';
  await page.route('**/dziekujemy/', async route => {
    body = route.request().postData() || '';
    await route.fulfill({status:200, contentType:'text/html', body:'<h1>Odebrano lokalnie</h1>'});
  });
  await form.getByRole('button', {name:'Wyślij zapytanie'}).click();
  await expect(page.getByRole('heading', {name:'Odebrano lokalnie'})).toBeVisible();
  expect(new URLSearchParams(body).get('form-name')).toBe('kontakt');
  expect(new URLSearchParams(body).get('email')).toBe('test@example.com');
});

test('hero artwork stays inside desktop viewport without a clipping section', async ({page}) => {
  for (const width of [1280, 1440, 1920]) {
    await page.setViewportSize({width,height:1000});
    await page.goto('/');
    await expect(page.locator('.paper-poland')).toHaveClass(/hero-motion-live/);
    expect(await page.locator('.hero').evaluate(e=>getComputedStyle(e).overflow)).toBe('visible');
    const bounds = await page.locator('.paper-poland').boundingBox();
    expect(bounds!.x + bounds!.width, `artwork at ${width}`).toBeLessThanOrEqual(width);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
  }
});

test('process scroll animation keeps its scene on screen through all stages', async ({page}) => {
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/');
  await page.getByRole('button',{name:'Tylko niezbędne'}).click();
  const story=page.locator('.process-story');
  await story.scrollIntoViewIfNeeded();
  await expect(story).toHaveAttribute('data-motion','gsap');
  const metrics=await story.evaluate(e=>({top:e.getBoundingClientRect().top+scrollY,height:(e as HTMLElement).offsetHeight}));
  for(let i=0;i<4;i++) {
    await page.evaluate(({metrics,i})=>window.scrollTo({top:metrics.top-80+i/3*(metrics.height-innerHeight+80),behavior:'instant'}),{metrics,i});
    await expect(story).toHaveAttribute('data-active',String(i));
    const top=await page.locator('.process-story__sticky').evaluate(e=>e.getBoundingClientRect().top);
    expect(top).toBeGreaterThanOrEqual(70);
    expect(top).toBeLessThanOrEqual(120);
  }
});

test('new layouts fit narrow phones and tablets', async ({page}) => {
  for (const width of [320, 768, 1024]) {
    await page.setViewportSize({width, height:900});
    for (const route of routes.slice(1,12)) {
      await page.goto(route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width}: ${route}`).toBeTruthy();
    }
  }
});

test('service scope spotlight uses even padding and lights one row at a time', async ({page}) => {
  await page.setViewportSize({width: 1440, height: 900});
  await page.goto('/landing-page/');
  const cookies = page.getByRole('button', {name: 'Tylko niezbędne'});
  if (await cookies.isVisible()) await cookies.click();
  await expect(page.locator('.service-scope.spotlight')).toHaveClass(/is-ready/);
  const articles = page.locator('.service-scope article');
  await expect(articles).toHaveCount(4);
  const paddings = await articles.evaluateAll((els) => els.map((el) => {
    const cs = getComputedStyle(el);
    return {top: cs.paddingTop, bottom: cs.paddingBottom};
  }));
  expect(new Set(paddings.map((p) => p.top)).size, 'padding-top must match on every row').toBe(1);
  expect(new Set(paddings.map((p) => p.bottom)).size, 'padding-bottom must match on every row').toBe(1);
  expect(paddings[0].top, 'highlight box must have equal inset above and below the copy').toBe(paddings[0].bottom);
  for (let i = 0; i < 4; i++) {
    await articles.nth(i).evaluate((el) => {
      const line = innerHeight * 0.46;
      const r = el.getBoundingClientRect();
      window.scrollTo({top: scrollY + r.top + r.height / 2 - line, behavior: 'instant'});
    });
    await expect.poll(() => articles.nth(i).evaluate((el) => el.classList.contains('is-current'))).toBeTruthy();
    expect(await articles.evaluateAll((els) => els.filter((el) => el.classList.contains('is-current')).length)).toBe(1);
  }
});

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`existing process stages respond to keyboard with ${reducedMotion}`, async ({page}) => {
    await page.emulateMedia({reducedMotion});
    await page.setViewportSize({width:1440,height:1000});
    await page.goto('/');
    await page.getByRole('button', {name:'Tylko niezbędne'}).click();
    const story = page.locator('.process-story');
    await story.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    const steps = page.locator('.process-story__nav-item');
    await expect(steps).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await steps.nth(i).focus();
      await expect(story).toHaveAttribute('data-active', String(i));
      await expect(page.locator('.process-story__card').nth(i)).toHaveAttribute('aria-pressed','true');
    }
  });
}
