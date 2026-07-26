import { useEffect, useState } from "react";

const TYPO_TEXT = "Pracujemy zdalnie z firn";
const CORRECTION_TEXT = "mami z całej Polski.";
const COMPLETE_TEXT = "Pracujemy zdalnie z firmami z całej Polski.";
const KEY_DELAYS = [58, 72, 64, 82, 55, 68] as const;
const DELETE_RAMP = [180, 145, 112, 84, 62] as const;

export default function TypewriterStatement() {
  const [text, setText] = useState("");

  useEffect(() => {
    let cancelled = false;
    let timer = 0;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = window.setTimeout(resolve, ms);
      });

    const type = async (value: string) => {
      for (let index = 0; index < value.length && !cancelled; index += 1) {
        setText((current) => current + value[index]);
        await wait(KEY_DELAYS[index % KEY_DELAYS.length]);
      }
    };

    const erase = async (count: number, accelerating = false) => {
      for (let index = 0; index < count && !cancelled; index += 1) {
        setText((current) => current.slice(0, -1));
        await wait(accelerating ? DELETE_RAMP[index] ?? 28 : 150);
      }
    };

    const play = async () => {
      while (!cancelled) {
        setText("");
        await wait(420);
        await type(TYPO_TEXT);
        await wait(430);
        await erase(1);
        await wait(160);
        await type(CORRECTION_TEXT);
        await wait(1900);
        await erase(COMPLETE_TEXT.length, true);
        await wait(520);
      }
    };

    void play();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="typewriter-box" data-typewriter>
      <span className="typewriter-accessible">{COMPLETE_TEXT}</span>
      <p className="typewriter-line" aria-hidden="true">
        <span className="typewriter-prompt">&gt;</span>
        <span data-typewriter-text>{text}</span>
        <span className="typewriter-cursor" data-typewriter-cursor />
      </p>
    </div>
  );
}
