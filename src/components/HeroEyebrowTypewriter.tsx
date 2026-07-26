import { useEffect, useState } from "react";

const FULL_TEXT = "NowaWeb - strony internetowe";
const KEY_DELAYS = [44, 52, 48, 58, 46, 50] as const;

export default function HeroEyebrowTypewriter() {
  const [text, setText] = useState("");
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let cancelled = false;
    const timers = new Set<number>();

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const timer = window.setTimeout(() => {
          timers.delete(timer);
          resolve();
        }, ms);
        timers.add(timer);
      });

    const play = async () => {
      await wait(reduceMotion ? 80 : 140);

      for (let index = 0; index < FULL_TEXT.length && !cancelled; index += 1) {
        setText(FULL_TEXT.slice(0, index + 1));
        await wait(reduceMotion ? 32 : KEY_DELAYS[index % KEY_DELAYS.length]);
      }

      if (!cancelled) {
        await wait(reduceMotion ? 90 : 150);
        setComplete(true);
      }
    };

    void play();

    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <p className="eyebrow hero-eyebrow" data-typing-complete={complete ? "true" : "false"}>
      <span className="hero-eyebrow-accessible">{FULL_TEXT}</span>
      <span className="hero-eyebrow-animated" aria-hidden="true">
        <span data-hero-eyebrow-text>{text}</span>
        <span className="hero-eyebrow-cursor" data-hero-eyebrow-cursor />
      </span>
      <span className="hero-eyebrow-static" aria-hidden="true">
        {FULL_TEXT}
      </span>
    </p>
  );
}
