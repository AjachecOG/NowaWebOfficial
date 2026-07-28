# Brand Logo Ice Momentum Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the two-sided NowaWeb brand card preserve smooth horizontal momentum and settle softly on the nearest readable face.

**Architecture:** Keep the interaction inside the existing `BrandFlipCard` React component. Convert horizontal angular velocity to degrees per second, advance it with requestAnimationFrame delta time, apply exponential drag during free spin, and switch to a damped spring only after the spin becomes slow. Extend the existing CDP browser verification to observe velocity, continued travel, reversal, and final 180-degree settling.

**Tech Stack:** Astro, React, TypeScript, browser Pointer Events, requestAnimationFrame, Node.js CDP verification.

## Global Constraints

- Do not add dependencies.
- Do not change the card artwork, DOM structure, CSS, vertical tilt range, idle lift, glint, shadow, section layout, or mobile dimensions.
- Horizontal motion must be delta-time based and remain bounded to `540deg/s`.
- Free-spin damping must be exponential and preserve the current direction.
- Face snapping must start only after at least `360ms` without pointer input and below `24deg/s`.
- Settling must finish on a multiple of `180deg` without visible oscillation.
- Preserve the user's unrelated working-tree changes and do not stage them.

---

## File Structure

- Modify `src/components/BrandFlipCard.tsx`: own pointer sampling, time-based horizontal velocity, free-spin drag, late face snap, and diagnostic `data-velocity-y` output.
- Modify `scripts/verify-motion.mjs`: drive the existing card through a fast right gesture and a reverse gesture, sample its motion, and verify final settling while retaining the current asset, transform, glint, and mobile checks.

No new runtime module is needed: the physics has one consumer and extracting it would add an unnecessary interface.

### Task 1: Specify inertial travel and settling in the browser test

**Files:**
- Modify: `scripts/verify-motion.mjs:190-233`
- Modify: `scripts/verify-motion.mjs:338-349`

**Interfaces:**
- Consumes: `[data-brand-flip]`, `data-flip-direction`, `data-rotation-y`, and the new `data-velocity-y` diagnostic value.
- Produces: regression checks for decaying same-direction velocity, continued coast, reverse impulse, and final 180-degree alignment.

- [ ] **Step 1: Replace the current single delayed samples with a motion trace**

Replace the `flipRight` / `flipLeft` interaction block with:

```js
  let flipRight = null;
  let flipLeft = null;
  let flipSettled = null;
  if (!flipInitial.missing) {
    await client.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: flipInitial.x,
      y: flipInitial.y,
    });
    await delay(20);
    await client.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: flipInitial.x + 160,
      y: flipInitial.y,
    });

    flipRight = await evaluate(
      client,
      `(async () => {
        const stage = document.querySelector('[data-brand-flip]');
        const card = document.querySelector('[data-brand-flip-card]');
        const read = () => ({
          rotation: Number(stage.dataset.rotationY),
          velocity: Number(stage.dataset.velocityY),
        });
        const samples = [];
        for (const wait of [80, 260, 420]) {
          await new Promise((resolve) => setTimeout(resolve, wait));
          samples.push(read());
        }
        return {
          direction: stage.dataset.flipDirection,
          samples,
          transform: getComputedStyle(card).transform,
        };
      })()`,
    );

    await client.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: flipInitial.x - 160,
      y: flipInitial.y,
    });
    await delay(140);
    flipLeft = await evaluate(
      client,
      `(() => {
        const stage = document.querySelector('[data-brand-flip]');
        return {
          direction: stage.dataset.flipDirection,
          rotation: Number(stage.dataset.rotationY),
          velocity: Number(stage.dataset.velocityY),
        };
      })()`,
    );

    await delay(3600);
    flipSettled = await evaluate(
      client,
      `(() => {
        const stage = document.querySelector('[data-brand-flip]');
        return {
          rotation: Number(stage.dataset.rotationY),
          velocity: Number(stage.dataset.velocityY),
        };
      })()`,
    );
  }
```

- [ ] **Step 2: Replace the old intensity assertions with explicit momentum assertions**

Replace the old `flipRight` and `flipLeft` assertions with:

```js
    const rightSamples = flipRight?.samples ?? [];
    const rightMotionIsFinite = rightSamples.every(
      (sample) => Number.isFinite(sample.rotation) && Number.isFinite(sample.velocity),
    );
    const [rightEarly, rightMiddle, rightLate] = rightSamples;

    if (
      flipRight?.direction !== "right" ||
      rightSamples.length !== 3 ||
      !rightMotionIsFinite ||
      flipRight.transform === "none"
    ) {
      failures.push("right pointer impulse does not expose a valid motion trace");
    } else {
      if (
        !(rightEarly.velocity > rightMiddle.velocity &&
          rightMiddle.velocity > rightLate.velocity &&
          rightLate.velocity > 0)
      ) {
        failures.push("rightward momentum does not decay smoothly while preserving direction");
      }
      if (
        !(rightEarly.rotation < rightMiddle.rotation &&
          rightMiddle.rotation < rightLate.rotation &&
          rightLate.rotation - rightEarly.rotation > 55)
      ) {
        failures.push("brand card does not continue coasting after the pointer impulse");
      }
    }
    if (flipLeft?.direction !== "left" || !(flipLeft.velocity < 0)) {
      failures.push("left pointer impulse does not reverse the card momentum");
    }
    const settledRemainder = Math.abs(
      ((flipSettled?.rotation ?? Number.NaN) % 180 + 180) % 180,
    );
    const settledFaceError = Math.min(settledRemainder, 180 - settledRemainder);
    if (
      !Number.isFinite(flipSettled?.rotation) ||
      !Number.isFinite(flipSettled?.velocity) ||
      settledFaceError > 0.3 ||
      Math.abs(flipSettled.velocity) > 1
    ) {
      failures.push("brand card does not settle cleanly on a readable face");
    }
```

- [ ] **Step 3: Run the verification against the current implementation and confirm the new contract fails**

In one terminal, run:

```powershell
npm run dev
```

In a second terminal, run:

```powershell
node scripts/verify-motion.mjs
```

Expected: failure containing `right pointer impulse does not expose a valid motion trace`, because the current component does not provide `data-velocity-y`.

### Task 2: Implement frame-rate-independent ice momentum

**Files:**
- Modify: `src/components/BrandFlipCard.tsx:3-119`
- Test: `scripts/verify-motion.mjs`

**Interfaces:**
- Consumes: browser `PointerEvent.clientX`, `performance.now()`, and requestAnimationFrame timestamps.
- Produces: `data-rotation-y` in degrees, `data-velocity-y` in degrees per second, and the existing `data-flip-direction` / `data-dragging` states.

- [ ] **Step 1: Add named physics constants next to `clamp`**

Add:

```ts
const MAX_FRAME_SECONDS = 0.05;
const MIN_POINTER_SAMPLE_SECONDS = 1 / 120;
const MAX_POINTER_SAMPLE_SECONDS = 0.05;
const POINTER_TO_ANGULAR_VELOCITY = 0.12;
const POINTER_VELOCITY_BLEND = 0.65;
const MAX_Y_VELOCITY = 540;
const FREE_SPIN_DRAG = 1.55;
const SNAP_DELAY_MS = 360;
const SNAP_START_VELOCITY = 24;
const SNAP_STIFFNESS = 30;
const SNAP_DAMPING = 11;
const SNAP_POSITION_EPSILON = 0.08;
const SNAP_VELOCITY_EPSILON = 0.8;
```

- [ ] **Step 2: Track frame time, pointer sample time, and a stable snap target**

Immediately after the existing state variables, use:

```ts
    let lastPointerX: number | null = null;
    let lastPointerY: number | null = null;
    let lastPointerAt = performance.now();
    let lastPointerSampleAt = lastPointerAt;
    let lastFrameAt = lastPointerAt;
    let snapTargetY: number | null = null;
```

Update `setPointerOrigin` so the activity and sample clocks share one timestamp:

```ts
    const setPointerOrigin = (event: PointerEvent) => {
      const now = performance.now();
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      lastPointerAt = now;
      lastPointerSampleAt = now;
      snapTargetY = null;
    };
```

- [ ] **Step 3: Derive horizontal angular velocity from pointer speed**

Replace `handlePointerMove` with:

```ts
    const handlePointerMove = (event: PointerEvent) => {
      if (lastPointerX === null || lastPointerY === null) {
        setPointerOrigin(event);
        return;
      }

      const now = performance.now();
      const deltaX = event.clientX - lastPointerX;
      const deltaY = event.clientY - lastPointerY;
      const sampleSeconds = clamp(
        (now - lastPointerSampleAt) / 1000,
        MIN_POINTER_SAMPLE_SECONDS,
        MAX_POINTER_SAMPLE_SECONDS,
      );

      if (Math.abs(deltaX) > 0.5) {
        const pointerAngularVelocity =
          (deltaX / sampleSeconds) * POINTER_TO_ANGULAR_VELOCITY;
        velocityY = clamp(
          velocityY * (1 - POINTER_VELOCITY_BLEND) +
            pointerAngularVelocity * POINTER_VELOCITY_BLEND,
          -MAX_Y_VELOCITY,
          MAX_Y_VELOCITY,
        );
        stage.dataset.flipDirection = deltaX > 0 ? "right" : "left";
      }

      velocityX = clamp(velocityX - deltaY * 0.022, -1.5, 1.5);
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      lastPointerAt = now;
      lastPointerSampleAt = now;
      snapTargetY = null;
    };
```

This preserves slow precision because slow pointer motion yields a low angular velocity, while the maximum prevents an abrupt or unreadable spin.

- [ ] **Step 4: Replace per-frame Y damping with delta-time drag and late spring settling**

Replace the beginning of `render`, through the current snap block, with:

```ts
    const render = (now: number) => {
      const deltaSeconds = clamp((now - lastFrameAt) / 1000, 0, MAX_FRAME_SECONDS);
      const frameScale = deltaSeconds * 60;
      lastFrameAt = now;

      rotationY += velocityY * deltaSeconds;
      rotationX += velocityX * frameScale;
      velocityX += -rotationX * 0.018 * frameScale;
      velocityX *= Math.pow(0.78, frameScale);
      rotationX = clamp(rotationX, -6, 6);

      if (
        snapTargetY === null &&
        Math.abs(velocityY) < SNAP_START_VELOCITY &&
        now - lastPointerAt > SNAP_DELAY_MS
      ) {
        snapTargetY = Math.round(rotationY / 180) * 180;
      }

      if (snapTargetY === null) {
        velocityY *= Math.exp(-FREE_SPIN_DRAG * deltaSeconds);
      } else {
        const displacement = snapTargetY - rotationY;
        const acceleration =
          displacement * SNAP_STIFFNESS - velocityY * SNAP_DAMPING;
        velocityY += acceleration * deltaSeconds;

        if (
          Math.abs(displacement) < SNAP_POSITION_EPSILON &&
          Math.abs(velocityY) < SNAP_VELOCITY_EPSILON
        ) {
          rotationY = snapTargetY;
          velocityY = 0;
        }
      }
```

Keep the existing transform, shadow, light, and idle rendering below this block. Change the idle velocity comparison from `0.28` to `18`, since Y velocity is now degrees per second:

```ts
      const isIdle = now - lastPointerAt > 1200 && Math.abs(velocityY) < 18;
```

- [ ] **Step 5: Expose the velocity diagnostic used by the regression test**

After assigning `stage.dataset.rotationY`, add:

```ts
      stage.dataset.velocityY = velocityY.toFixed(2);
```

Initialize it with the other stage data:

```ts
    stage.dataset.velocityY = "0";
```

- [ ] **Step 6: Run the focused browser verification**

With `npm run dev` still running, run:

```powershell
node scripts/verify-motion.mjs
```

Expected: `Motion verification passed.` The trace must show monotonically decreasing positive velocity after the right impulse, more than `55deg` of continued travel, a negative velocity after the left impulse, and a final face error no greater than `0.3deg`.

- [ ] **Step 7: Run TypeScript and production build checks**

Run:

```powershell
npx tsc --noEmit --pretty false
npm run build
git diff --check -- src/components/BrandFlipCard.tsx scripts/verify-motion.mjs
```

Expected: TypeScript exits `0` with no output; Astro reports a successful build; `git diff --check` reports no whitespace errors.

### Task 3: Visually verify the final motion without broad tuning

**Files:**
- Verify: `src/components/BrandFlipCard.tsx`
- Verify: `src/styles/global.css:1860-1960`
- Test: `scripts/verify-motion.mjs`

**Interfaces:**
- Consumes: the completed card motion from Task 2.
- Produces: visual confirmation that the physics change does not alter composition, card faces, lighting, or mobile containment.

- [ ] **Step 1: Capture desktop and mobile states**

With the dev server running, execute:

```powershell
$env:CAPTURE_FLIP = "1"
node scripts/verify-motion.mjs
Remove-Item Env:CAPTURE_FLIP
npx playwright screenshot --browser=chromium --viewport-size="390,1000" http://127.0.0.1:4321 output/playwright/brand-flip-mobile.png
```

Expected: `Motion verification passed.` and screenshots are written beneath `output/playwright/`.

- [ ] **Step 2: Inspect interaction at slow and fast pointer speeds**

In the browser:

1. Move slowly across the card and confirm it turns precisely without jumping.
2. Flick quickly to the right and confirm it coasts for more than one second without reversing direction.
3. Flick left while it is coasting right and confirm the movement changes direction smoothly.
4. Stop interacting and confirm the nearest full face settles without repeated wobble.
5. Repeat at a narrow mobile viewport and confirm vertical page scrolling still works outside the horizontal gesture.

- [ ] **Step 3: Permit only bounded physics tuning if visual inspection exposes a mismatch**

Adjust only these constants in `BrandFlipCard.tsx`, and rerun Steps 1-2 after each change:

- `POINTER_TO_ANGULAR_VELOCITY` for gesture sensitivity;
- `FREE_SPIN_DRAG` for coast duration;
- `SNAP_START_VELOCITY` for the handoff point;
- `SNAP_STIFFNESS` and `SNAP_DAMPING` together for final settling.

Do not alter CSS or unrelated animation code.

- [ ] **Step 4: Run final verification and report the exact working-tree scope**

Run:

```powershell
node scripts/verify-motion.mjs
npx tsc --noEmit --pretty false
npm run build
git diff --check -- src/components/BrandFlipCard.tsx scripts/verify-motion.mjs
git status --short
```

Expected: motion verification, TypeScript, build, and whitespace checks all pass. `git status` may still show the user's pre-existing files, but this implementation must modify only `src/components/BrandFlipCard.tsx` and `scripts/verify-motion.mjs`.

- [ ] **Step 5: Do not create an implementation commit from the dirty worktree**

Both implementation files were already untracked before this task and belong to a larger in-progress change. Report the modified files and verification results, but do not stage or commit the implementation unless the user separately authorizes committing those complete pre-existing files.
