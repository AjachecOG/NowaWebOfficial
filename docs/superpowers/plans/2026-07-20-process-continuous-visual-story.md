# Process Continuous Visual Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four generic process-card illustrations with four connected animated scenes that tell one story from client message to launch and support.

**Architecture:** Keep the existing `ProcessIsland` card stack, GSAP scroll engine, navigation, and responsive layout. Replace only `ProcessVisual` markup and its CSS; use the existing active-card state plus ScrollTrigger lifecycle attributes to start one CSS timeline at a time, while mobile, no-JavaScript, and reduced-motion views render complete static final frames.

**Tech Stack:** Astro, React, TypeScript, GSAP ScrollTrigger, CSS keyframes, Node static validation, Chrome DevTools Protocol runtime verification.

## Global Constraints

- Change only the visual panels inside the four process cards and code directly controlling their playback.
- Preserve card dimensions, titles, descriptions, icons, sticky scroll, stacked-card transforms, timeline navigation, colors, and corner-radius system.
- Add no raster assets, packages, or animation libraries.
- Use the exact conversation copy: `Potrzebuję strony, która nie znudzi ciekawskich.` and `Nowa strona już się robi.`
- Desktop and tablet play only the active scene once, then hold its final frame; revisiting a stage replays it.
- Mobile at 390 px and `prefers-reduced-motion: reduce` show complete static final frames with no scene animations.
- Keep visible scene copy as HTML text, with each entire visual remaining `aria-hidden="true"` because card titles and descriptions already carry the accessible meaning.
- All animation must use opacity and transform; do not introduce layout-changing animation.

---

## File Map

- `src/components/ProcessIsland.tsx`: owns the four scene markups and connects scene playback to the existing ScrollTrigger lifecycle.
- `src/components/ProcessIsland.css`: owns static final frames, shared story tokens, scene timelines, mobile layout, and reduced-motion fallbacks.
- `scripts/validate-process-story.mjs`: checks the source contract, exact copy, four connected scenes, playback hook, and removal of old placeholder graphics.
- `scripts/verify-process-story.mjs`: checks one-scene-at-a-time playback, replay on reverse navigation, static mobile/reduced-motion states, existing scroll behavior, and runtime errors.

### Task 1: Connected Scene Markup and Static Final Frames

**Files:**
- Modify: `scripts/validate-process-story.mjs`
- Modify: `src/components/ProcessIsland.tsx`
- Modify: `src/components/ProcessIsland.css`

**Interfaces:**
- Consumes: `ProcessVisual({ index }: { index: number })` and the existing four-entry `steps` array.
- Produces: four roots selected by `[data-process-scene="conversation|strategy|design|launch"]`, repeated continuity hooks `.story-brief-points` and `.story-page-shell`, and static final-frame CSS.

- [ ] **Step 1: Add a failing static contract for the new story**

Replace the old `micro visual per stage` and `animated micro visuals` checks in `scripts/validate-process-story.mjs` with:

```js
  ["four connected story scenes", (component.match(/data-process-scene=/g) ?? []).length === 4],
  ["conversation scene", component.includes('data-process-scene="conversation"')],
  ["strategy scene", component.includes('data-process-scene="strategy"')],
  ["design scene", component.includes('data-process-scene="design"')],
  ["launch scene", component.includes('data-process-scene="launch"')],
  ["exact client message", component.includes("Potrzebuję strony, która nie znudzi ciekawskich.")],
  ["exact studio reply", component.includes("Nowa strona już się robi.")],
  ["brief continuity", (component.match(/className="story-brief-points/g) ?? []).length === 2],
  ["page continuity", (component.match(/className="story-page-shell/g) ?? []).length === 3],
  ["old placeholder visuals removed", !/brief-bubble|wireframe-toolbar|design-canvas|launch-orbit/.test(component)],
  ["static scene finals", styles.includes(".story-scene__final")],
```

Also replace the old keyframe-name check with:

```js
  ["story motion contract", styles.includes("@keyframes story-message-in")],
```

- [ ] **Step 2: Run the validator and confirm the new contract fails**

Run: `npm run validate:process`

Expected: FAIL for the four scene names, exact messages, continuity hooks, old placeholder removal, static finals, and story keyframes.

- [ ] **Step 3: Replace `ProcessVisual` with the connected story markup**

Replace the complete `ProcessVisual` function in `src/components/ProcessIsland.tsx` with:

```tsx
function ProcessVisual({ index }: ProcessVisualProps) {
  if (index === 0) {
    return (
      <div className="process-visual story-scene story-scene--conversation" data-process-scene="conversation" aria-hidden="true">
        <div className="story-chat">
          <span className="story-message story-message--client">Potrzebuję strony, która nie znudzi ciekawskich.</span>
          <span className="story-typing"><i /><i /><i /></span>
          <span className="story-message story-message--studio">Nowa strona już się robi.</span>
        </div>
        <div className="story-brief-points story-scene__final">
          <span>Cel</span><span>Odbiorcy</span><span>Treści</span>
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="process-visual story-scene story-scene--strategy" data-process-scene="strategy" aria-hidden="true">
        <div className="story-brief-points story-brief-points--seed">
          <span>Cel</span><span>Odbiorcy</span><span>Treści</span>
        </div>
        <div className="story-sitemap">
          <span>Start</span><span>Oferta</span><span>Realizacje</span><span>Kontakt</span>
        </div>
        <div className="story-page-shell story-page-shell--wireframe story-scene__final">
          <span className="story-page-nav"><i /><i /><i /></span>
          <span className="story-page-hero"><b /><i /></span>
          <span className="story-page-grid"><i /><i /><i /></span>
          <span className="story-page-cta" />
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="process-visual story-scene story-scene--design" data-process-scene="design" aria-hidden="true">
        <div className="story-page-shell story-page-shell--designed story-scene__final">
          <span className="story-page-nav"><i /><i /><i /></span>
          <span className="story-page-hero"><b>Strona, która ciekawi.</b><i /></span>
          <span className="story-page-grid"><i /><i /><i /></span>
          <span className="story-page-cta" />
        </div>
        <span className="story-design-cursor" />
        <span className="story-code-check"><i /> wdrożone</span>
      </div>
    );
  }

  return (
    <div className="process-visual story-scene story-scene--launch" data-process-scene="launch" aria-hidden="true">
      <div className="story-browser story-scene__final">
        <span className="story-browser__bar"><i /><i /><i /><b>nowa-strona.pl</b></span>
        <div className="story-page-shell story-page-shell--live">
          <span className="story-page-nav"><i /><i /><i /></span>
          <span className="story-page-hero"><b>Strona, która ciekawi.</b><i /></span>
          <span className="story-page-grid"><i /><i /><i /></span>
          <span className="story-page-cta" />
        </div>
      </div>
      <div className="story-publish"><span /><b>100%</b></div>
      <span className="story-online"><i /> ONLINE</span>
      <span className="story-support">Jesteśmy obok.</span>
    </div>
  );
}
```

Delete the obsolete `microSelectors` block from `useGSAP`; the new scene timelines are owned by CSS and must not be scrubbed with card transforms.

- [ ] **Step 4: Replace the old illustration CSS with shared static scene styles**

In `src/components/ProcessIsland.css`, replace everything from `.process-visual {` through the final `.process-story__card.is-active .launch-status` rule. Keep the existing `.process-visual` outer border/background and introduce shared layout selectors for:

```css
.story-scene { overflow: hidden; padding: 20px; }
.story-scene__final { opacity: 1; transform: none; }
.story-chat { display: grid; gap: 10px; }
.story-message { max-width: 82%; padding: 10px 12px; border-radius: 12px; font-size: clamp(0.68rem, 0.85vw, 0.78rem); line-height: 1.35; }
.story-message--client { background: rgb(5 87 242 / 9%); color: var(--process-ink); border-bottom-left-radius: 4px; }
.story-message--studio { justify-self: end; background: rgb(255 92 53 / 12%); color: var(--process-ink); border-bottom-right-radius: 4px; }
.story-typing { justify-self: end; display: flex; gap: 4px; padding: 9px 12px; border-radius: 12px 12px 4px; background: rgb(255 92 53 / 10%); }
.story-typing i { width: 5px; height: 5px; border-radius: 50%; background: var(--process-orange); }
.story-brief-points { display: flex; gap: 7px; justify-content: center; margin-top: 14px; }
.story-brief-points span { padding: 6px 9px; border: 1px solid rgb(5 87 242 / 16%); border-radius: 7px; background: #fff; color: rgb(6 21 50 / 68%); font-size: 0.62rem; font-weight: 800; }
.story-brief-points--seed, .story-sitemap { opacity: 0; }
.story-sitemap { position: absolute; inset: 34px 26px auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px 10px; }
.story-sitemap::before { content: ""; position: absolute; left: 18%; right: 18%; top: 48%; height: 2px; z-index: -1; border-radius: 2px; background: var(--process-orange); opacity: 0.45; }
.story-sitemap span { padding: 6px; border: 1px solid rgb(5 87 242 / 18%); border-radius: 7px; background: #fff; color: rgb(6 21 50 / 65%); font-size: 0.58rem; font-weight: 800; text-align: center; }
.story-sitemap span:first-child { grid-column: 2; }
.story-page-shell { position: absolute; inset: 20px; display: grid; grid-template-rows: 22px 1fr 0.56fr; gap: 8px; padding: 9px; border: 1px solid rgb(5 87 242 / 17%); border-radius: 11px; background: #fff; }
.story-page-nav { display: flex; align-items: center; gap: 5px; border-radius: 6px; background: rgb(5 87 242 / 5%); padding: 0 7px; }
.story-page-nav i { width: 18px; height: 3px; border-radius: 4px; background: rgb(5 87 242 / 20%); }
.story-page-hero { display: grid; place-items: center; align-content: center; gap: 8px; border-radius: 7px; background: rgb(5 87 242 / 5%); }
.story-page-hero b { color: var(--process-ink); font-family: var(--display); font-size: 0.72rem; }
.story-page-hero i { width: 34%; height: 4px; border-radius: 4px; background: rgb(255 92 53 / 38%); }
.story-page-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.story-page-grid i { border-radius: 5px; background: rgb(5 87 242 / 8%); }
.story-page-cta { position: absolute; right: 18px; top: 15px; width: 24px; height: 7px; border-radius: 5px; background: var(--process-orange); }
.story-page-shell--designed, .story-page-shell--live { background: linear-gradient(145deg, #fff, #f6f9ff); box-shadow: 0 12px 30px rgb(5 87 242 / 10%); }
.story-page-shell--designed .story-page-nav, .story-page-shell--live .story-page-nav { background: var(--process-blue); }
.story-page-shell--designed .story-page-nav i, .story-page-shell--live .story-page-nav i { background: rgb(255 255 255 / 58%); }
.story-page-shell--designed .story-page-hero, .story-page-shell--live .story-page-hero { background: linear-gradient(135deg, rgb(5 87 242 / 13%), rgb(255 92 53 / 8%)); }
.story-design-cursor { position: absolute; left: 36%; top: 54%; width: 13px; height: 18px; border: solid var(--process-blue); border-width: 2px 0 0 2px; transform: rotate(-42deg); }
.story-code-check { position: absolute; right: 26px; bottom: 27px; padding: 6px 8px; border-radius: 7px; background: var(--process-ink); color: #fff; font-size: 0.58rem; font-weight: 800; }
.story-code-check i { display: inline-block; width: 5px; height: 5px; margin-right: 4px; border-radius: 50%; background: #42b878; }
.story-browser { position: absolute; inset: 20px 20px 68px; border: 1px solid rgb(5 87 242 / 18%); border-radius: 11px; background: #fff; overflow: hidden; }
.story-browser__bar { display: flex; align-items: center; gap: 4px; height: 22px; padding: 0 7px; background: rgb(5 87 242 / 6%); }
.story-browser__bar i { width: 4px; height: 4px; border-radius: 50%; background: rgb(5 87 242 / 25%); }
.story-browser__bar b { margin-left: 5px; color: rgb(6 21 50 / 50%); font-size: 0.48rem; font-weight: 700; }
.story-browser .story-page-shell { inset: 30px 8px 8px; }
.story-publish { position: absolute; left: 24px; right: 24px; bottom: 43px; display: flex; align-items: center; gap: 8px; }
.story-publish::before { content: ""; flex: 1; height: 4px; border-radius: 4px; background: rgb(5 87 242 / 10%); }
.story-publish span { position: absolute; left: 0; width: calc(100% - 34px); height: 4px; border-radius: 4px; background: var(--process-blue); }
.story-publish b { color: var(--process-blue); font-size: 0.58rem; }
.story-online { position: absolute; right: 24px; top: 30px; padding: 5px 7px; border-radius: 6px; background: #fff; color: rgb(6 21 50 / 68%); font-size: 0.52rem; font-weight: 900; letter-spacing: 0.08em; box-shadow: 0 5px 15px rgb(6 21 50 / 10%); }
.story-online i { display: inline-block; width: 5px; height: 5px; border-radius: 50%; background: #42b878; }
.story-support { position: absolute; right: 24px; bottom: 10px; padding: 6px 9px; border-radius: 9px 9px 3px; background: rgb(255 92 53 / 12%); color: var(--process-ink); font-size: 0.58rem; font-weight: 800; }
```

Add `@keyframes story-message-in` with a translate/opacity start and the current static styles as its final state so the validator has the motion contract; Task 2 will wire the complete timeline.

- [ ] **Step 5: Run the static validator and production build**

Run: `npm run validate:process`

Expected: every contract reports PASS.

Run: `npm run build`

Expected: Astro builds one page without TypeScript or bundling errors.

- [ ] **Step 6: Commit the connected static scenes**

```powershell
git add scripts/validate-process-story.mjs src/components/ProcessIsland.tsx src/components/ProcessIsland.css
git commit -m "feat: replace process placeholders with connected scenes"
```

### Task 2: Active-Card Playback and Replay

**Files:**
- Modify: `scripts/validate-process-story.mjs`
- Modify: `scripts/verify-process-story.mjs`
- Modify: `src/components/ProcessIsland.tsx`
- Modify: `src/components/ProcessIsland.css`

**Interfaces:**
- Consumes: existing `ScrollTrigger.create`, `.process-story__card.is-active`, and `[data-process-scene]` roots from Task 1.
- Produces: `data-story-visible="true"` on `.process-story`, one active CSS scene timeline, and replay when `is-active` returns to a card.

- [ ] **Step 1: Add failing source and browser checks for playback**

Add these static checks to `scripts/validate-process-story.mjs`:

```js
  ["scene visibility lifecycle", component.includes("story.dataset.storyVisible") && component.includes("delete story.dataset.storyVisible")],
  ["scene start callback", component.includes("onEnter:") && component.includes("onEnterBack:")],
  ["active-only scene selector", styles.includes('[data-story-visible="true"] .process-story__card.is-active')],
  ["old GSAP child animation block removed", !styles.includes('.process-story[data-motion="gsap"] .process-visual *')],
```

In `scripts/verify-process-story.mjs`, after the initial desktop scroll, record animation ownership:

```js
  const scenePlayback = await evaluate(client, `(async () => {
    const story = document.querySelector('.process-story');
    const scenes = Array.from(document.querySelectorAll('[data-process-scene]'));
    const counts = () => scenes.map((scene) => scene.getAnimations({ subtree: true }).filter((animation) => animation.playState === 'running').length);
    const initial = { visible: story.dataset.storyVisible, active: story.dataset.active, running: counts() };
    const top = story.getBoundingClientRect().top + window.scrollY - 80;
    const range = story.offsetHeight - window.innerHeight + 80;
    window.scrollTo({ top: top + range / 3, behavior: 'instant' });
    await new Promise((resolve) => setTimeout(resolve, 900));
    const second = { active: story.dataset.active, running: counts() };
    window.scrollTo({ top, behavior: 'instant' });
    await new Promise((resolve) => setTimeout(resolve, 900));
    const replay = { active: story.dataset.active, running: counts() };
    return { initial, second, replay };
  })()`);
```

Add exact ownership assertions:

```js
  const ownsPlayback = (sample, index) => (
    Number(sample.active) === index &&
    sample.running.filter((count) => count > 0).length === 1 &&
    sample.running[index] > 0
  );
  if (scenePlayback.initial.visible !== "true") failures.push("process scenes do not activate on entry");
  if (!ownsPlayback(scenePlayback.initial, 0)) failures.push("conversation does not own initial playback");
  if (!ownsPlayback(scenePlayback.second, 1)) failures.push("strategy does not own second-stage playback");
  if (!ownsPlayback(scenePlayback.replay, 0)) failures.push("conversation does not replay after reverse navigation");
```

Extend the existing `mobile` and `reduced` result objects with:

```js
sceneAnimationCount: Array.from(document.querySelectorAll('[data-process-scene]'))
  .flatMap((scene) => scene.getAnimations({ subtree: true })).length,
```

Add failures when either count is nonzero.

- [ ] **Step 2: Run both checks and confirm playback checks fail**

Run: `npm run validate:process`

Expected: FAIL for scene lifecycle, callbacks, active-only selector, and removal of the old GSAP child-animation block.

Run: `npm run verify:process`

Expected: FAIL because the new scenes do not yet start or replay from the active card.

- [ ] **Step 3: Connect scene visibility to ScrollTrigger**

In the existing desktop `ScrollTrigger.create` configuration in `ProcessIsland.tsx`, add:

```tsx
        onEnter: () => {
          story.dataset.storyVisible = "true";
        },
        onEnterBack: () => {
          story.dataset.storyVisible = "true";
        },
        onLeaveBack: () => {
          delete story.dataset.storyVisible;
        },
```

In the match-media cleanup, also execute `delete story.dataset.storyVisible;`. Do not add an observer or a global scroll listener.

- [ ] **Step 4: Implement the four one-shot CSS timelines**

Remove the existing rule that disables every animation below `.process-visual` when GSAP is active. Add active-only animation rules beneath the static scene CSS:

```css
@keyframes story-message-in { from { opacity: 0; transform: translateY(10px) scale(0.97); } to { opacity: 1; transform: none; } }
@keyframes story-typing-in { 0%, 100% { opacity: 0; } 15%, 78% { opacity: 1; } }
@keyframes story-dot { 0%, 60%, 100% { transform: translateY(0); opacity: 0.35; } 30% { transform: translateY(-3px); opacity: 1; } }
@keyframes story-stage-out { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateY(-8px) scale(0.97); } }
@keyframes story-stage-in { from { opacity: 0; transform: translateY(9px) scale(0.97); } to { opacity: 1; transform: none; } }
@keyframes story-map-sequence { 0%, 18% { opacity: 0; transform: translateY(9px) scale(0.97); } 30%, 66% { opacity: 1; transform: none; } 82%, 100% { opacity: 0; transform: translateY(-8px) scale(0.97); } }
@keyframes story-chat-lift { from { transform: translateY(0); } to { transform: translateY(-5px); } }
@keyframes story-route-in { from { opacity: 0; transform: scaleX(0); } to { opacity: 1; transform: scaleX(1); } }
@keyframes story-color-in { from { filter: saturate(0); } to { filter: saturate(1); } }
@keyframes story-cursor-pass { 0% { opacity: 0; transform: translate(-28px, 20px) rotate(-42deg); } 20%, 75% { opacity: 1; } 100% { opacity: 0; transform: translate(44px, -30px) rotate(-42deg); } }
@keyframes story-publish-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes story-support-in { from { opacity: 0; transform: translateY(7px) scale(0.96); } to { opacity: 1; transform: none; } }

.process-story[data-story-visible="true"] .process-story__card.is-active .story-message--client { animation: story-message-in 500ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-typing { animation: story-typing-in 1500ms 700ms both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-typing i { animation: story-dot 700ms 850ms ease-in-out 2; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-typing i:nth-child(2) { animation-delay: 960ms; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-typing i:nth-child(3) { animation-delay: 1070ms; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-message--studio { animation: story-message-in 500ms 2100ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--conversation .story-chat { animation: story-chat-lift 600ms 2900ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--conversation .story-brief-points { animation: story-stage-in 500ms 3100ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--strategy .story-brief-points--seed { animation: story-stage-out 450ms 650ms ease both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-sitemap { animation: story-map-sequence 3000ms 450ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-sitemap::before { animation: story-route-in 900ms 1350ms cubic-bezier(0.16, 1, 0.3, 1) both; transform-origin: left; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--strategy .story-page-shell { animation: story-stage-in 620ms 2700ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--design .story-page-shell { animation: story-stage-in 420ms both, story-color-in 1400ms 650ms ease both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-design-cursor { animation: story-cursor-pass 1600ms 1900ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-code-check { animation: story-support-in 460ms 3300ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-scene--launch .story-browser { animation: story-stage-in 450ms both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-publish span { animation: story-publish-fill 1700ms 650ms cubic-bezier(0.16, 1, 0.3, 1) both; transform-origin: left; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-publish b,
.process-story[data-story-visible="true"] .process-story__card.is-active .story-online { animation: story-support-in 400ms 2350ms both; }
.process-story[data-story-visible="true"] .process-story__card.is-active .story-support { animation: story-support-in 500ms 3200ms cubic-bezier(0.16, 1, 0.3, 1) both; }
```

Set initial `opacity: 0` only through animation fill modes or selectors under `[data-story-visible="true"]`; keep default styles as complete final frames for mobile, no-JavaScript, and reduced-motion modes.

- [ ] **Step 5: Add explicit mobile and reduced-motion final-frame rules**

Inside `@media (max-width: 760px)`, add compact scene sizing and disable scene animations:

```css
  .story-scene { padding: 16px; }
  .story-message { font-size: 0.68rem; }
  .story-page-shell { inset: 16px; }
  [data-process-scene] *, [data-process-scene] *::before, [data-process-scene] *::after { animation: none !important; transition: none !important; }
```

Inside `@media (prefers-reduced-motion: reduce)`, add the same animation/transition reset and preserve the existing gentle card-stack variables managed by GSAP.

- [ ] **Step 6: Run source, browser, and build verification**

Run: `npm run validate:process`

Expected: every contract reports PASS.

Run: `npm run verify:process`

Expected: the existing scroll checks pass; scene playback reports active ownership `0,1,0`; mobile and reduced-motion scene animation counts are zero; no runtime exceptions are reported.

Run: `npm run build`

Expected: Astro builds one page without TypeScript or bundling errors.

- [ ] **Step 7: Commit active scene playback**

```powershell
git add scripts/validate-process-story.mjs scripts/verify-process-story.mjs src/components/ProcessIsland.tsx src/components/ProcessIsland.css
git commit -m "feat: animate the continuous process story"
```

### Task 3: Visual QA and Regression Closure

**Files:**
- Verify: `src/components/ProcessIsland.tsx`
- Verify: `src/components/ProcessIsland.css`
- Verify: `scripts/validate-process-story.mjs`
- Verify: `scripts/verify-process-story.mjs`

**Interfaces:**
- Consumes: the complete connected-story implementation and its automated checks.
- Produces: desktop and mobile screenshots plus final evidence that existing card mechanics remain intact.

- [ ] **Step 1: Run the complete automated verification set**

```powershell
npm run validate:process
npm run verify:process
npm run build
git diff --check
```

Expected: all commands exit with code 0; the static validator prints only PASS lines; browser verification prints `Process story browser verification passed.`; Astro builds one page; no new whitespace errors appear in the four scoped implementation files.

- [ ] **Step 2: Capture the active process scene on desktop**

Start the existing local server and capture `http://127.0.0.1:4321/#proces` at 1440 by 1000 to `output/playwright/nowaweb-process-story-desktop.png` using the repository's existing Chrome/Playwright workflow.

Expected visual result: the outer card, left copy, number, timeline, and stack geometry match the current section; the right panel shows real message text and no placeholder line illustration.

- [ ] **Step 3: Capture the process cards on mobile**

Capture the process section at 390 px wide to `output/playwright/nowaweb-process-story-mobile.png`.

Expected visual result: cards remain in natural vertical flow; each panel shows a complete final frame; message text wraps inside its bubble; no horizontal overflow or overlapping content is visible.

- [ ] **Step 4: Inspect all four desktop stages and reverse playback**

Visit scroll progress `0`, `1/3`, `2/3`, and `1`, then reverse to `0`. Confirm the visual chain is brief points → sitemap/wireframe → designed page → browser/online/support, only the active scene moves, and returning to an earlier stage restarts that scene.

- [ ] **Step 5: Record final repository state**

Run: `git status --short`

Expected: the implementation commits contain only the two process source files and two process test files; unrelated pre-existing user changes remain untouched.
