# Split Process Conversation Reply Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single NowaWeb reply in the first process scene with “Nowa strona?”, a three-dot typing indicator, and “Już się robi!”.

**Architecture:** Keep the existing timer-owned `ConversationVisual` lifecycle and add separate state for the first reply, typing indicator, and final reply. Render the indicator and final reply in one stable grid slot so the replacement does not move surrounding content; expose focused `data-*` hooks for runtime verification.

**Tech Stack:** Astro, React, TypeScript, CSS, Node source validator, Chrome DevTools Protocol browser verifier.

## Global Constraints

- Exact client copy: `Potrzebuję strony, która nie znudzi ciekawskich.`
- Exact first NowaWeb reply: `Nowa strona?`
- Exact final NowaWeb reply: `Już się robi!`
- The typing indicator is three sequentially pulsing dots and does not pulse under `prefers-reduced-motion: reduce`.
- Re-entering the conversation scene restarts the sequence and leaving it clears pending timers.
- Do not change the other three process scenes, scrolling behavior, or stage navigation.

---

### Task 1: Split and animate the NowaWeb reply

**Files:**
- Modify: `scripts/validate-process-story.mjs`
- Modify: `scripts/verify-process-story.mjs`
- Modify: `src/components/ProcessIsland.tsx`
- Modify: `src/components/ProcessIsland.css`

**Interfaces:**
- Consumes: existing `ConversationVisual({ playing }: { playing: boolean })`, `wait(ms)`, `type(message, update, delays)`, and the `playing` cleanup lifecycle.
- Produces: `[data-conversation-studio-question]`, `[data-conversation-typing]`, and `[data-conversation-studio-answer]` browser hooks.

- [x] **Step 1: Write failing source and browser contracts**

Replace the old single-reply source assertion with exact split-reply and indicator assertions:

```js
["exact first studio reply", component.includes('const STUDIO_QUESTION = "Nowa strona?"')],
["exact final studio reply", component.includes('const STUDIO_ANSWER = "Już się robi!"')],
["studio typing indicator", component.includes("data-conversation-typing") && (component.match(/<i \/>/g) ?? []).length >= 3],
["stable reply slot", component.includes("story-reply-slot") && styles.includes("grid-area: 1 / 1")],
```

Extend `conversationFrame()` in the browser verifier to return:

```js
const questionText = scenes[0].querySelector('[data-conversation-studio-question]')?.textContent ?? '';
const answerText = scenes[0].querySelector('[data-conversation-studio-answer]')?.textContent ?? '';
const typingVisible = scenes[0].querySelector('[data-conversation-typing]')?.dataset.messageVisible === 'true';
return { clientText, clientExpected, questionText, answerText, typingVisible };
```

Sample the conversation after the first reply, while the indicator is visible, and after completion. Assert that the first reply equals `Nowa strona?`, the intermediate sample has `typingVisible === true` with an empty final answer, and the complete sample equals `Już się robi!` with `typingVisible === false`.

- [x] **Step 2: Run the source contract and confirm RED**

Run: `npm run validate:process`

Expected: FAIL for the new first reply, final reply, typing indicator, and stable reply slot checks because the existing component still has one reply.

- [x] **Step 3: Implement the minimal React state sequence**

Use separate constants and state:

```tsx
const STUDIO_QUESTION = "Nowa strona?";
const STUDIO_ANSWER = "Już się robi!";

const [studioQuestion, setStudioQuestion] = useState("");
const [studioAnswer, setStudioAnswer] = useState("");
const [questionVisible, setQuestionVisible] = useState(false);
const [typingVisible, setTypingVisible] = useState(false);
const [answerVisible, setAnswerVisible] = useState(false);
```

After the client typing finishes, wait 520 ms, show the question, wait 180 ms, and type it with `STUDIO_KEY_DELAYS`. Wait 260 ms, show the indicator for 960 ms, hide it, wait 120 ms, then show and type the answer with `STUDIO_KEY_DELAYS`. Reset every state value before playback and retain the existing timer cancellation cleanup.

Render the first reply and a stable replacement slot:

```tsx
<span className="story-message story-message--studio" data-message-visible={questionVisible ? "true" : "false"}>
  <span data-conversation-studio-question>{studioQuestion}</span>
</span>
<span className="story-reply-slot">
  <span className="story-typing-indicator" data-conversation-typing data-message-visible={typingVisible ? "true" : "false"}>
    <i /><i /><i />
  </span>
  <span className="story-message story-message--studio story-message--answer" data-message-visible={answerVisible ? "true" : "false"}>
    <span data-conversation-studio-answer>{studioAnswer}</span>
  </span>
</span>
```

- [x] **Step 4: Add the stable slot and dot animation styles**

```css
.story-reply-slot {
  display: grid;
  justify-items: end;
  min-height: 48px;
}

.story-reply-slot > * { grid-area: 1 / 1; }

.story-typing-indicator {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  align-self: start;
  padding: 14px 16px;
  border-radius: 16px 16px 4px 16px;
  background: rgb(255 92 53 / 12%);
  opacity: 0;
}

.story-typing-indicator[data-message-visible="true"] { opacity: 1; }
.story-typing-indicator i { animation: story-typing-dot 720ms ease-in-out infinite alternate; }
.story-typing-indicator i:nth-child(2) { animation-delay: 120ms; }
.story-typing-indicator i:nth-child(3) { animation-delay: 240ms; }
```

Define `@keyframes story-typing-dot` using opacity and vertical translation. Under `prefers-reduced-motion: reduce`, set `.story-typing-indicator i { animation: none; }`.

- [x] **Step 5: Run focused verification and confirm GREEN**

Run: `npm run validate:process`

Expected: every source contract prints `PASS` and the command exits 0.

Run: `npm run verify:process`

Expected: `Process story browser verification passed.` and the command exits 0.

- [x] **Step 6: Review the feature diff without staging unrelated work**

```bash
git diff --check -- scripts/validate-process-story.mjs scripts/verify-process-story.mjs src/components/ProcessIsland.tsx src/components/ProcessIsland.css
```

Expected: exit 0. Leave the feature unstaged because these files contained unrelated user changes before this task.

### Task 2: Build and visual regression check

**Files:**
- Verify: `src/components/ProcessIsland.tsx`
- Verify: `src/components/ProcessIsland.css`

**Interfaces:**
- Consumes: the complete conversation sequence from Task 1.
- Produces: verified desktop and mobile layouts with no chat overflow or reply-slot jump.

- [x] **Step 1: Run the production build**

Run: `npm run build`

Expected: Astro reports a successful build and exits 0.

- [x] **Step 2: Inspect desktop and mobile conversation states**

Open `http://127.0.0.1:4321/#proces` at desktop and mobile widths. Confirm the first answer stays visible, the three-dot bubble is right-aligned, the final answer replaces it without moving the first bubble, and neither width overflows the card.

- [x] **Step 3: Re-run final focused checks**

Run: `npm run validate:process`

Run: `npm run verify:process`

Expected: both commands exit 0 with no failures.
