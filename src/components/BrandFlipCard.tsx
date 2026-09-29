import { useEffect, useRef } from "react";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const MAX_FRAME_SECONDS = 0.05;
const MIN_POINTER_SAMPLE_SECONDS = 1 / 120;
const MAX_POINTER_SAMPLE_SECONDS = 0.05;
const POINTER_TO_ANGULAR_VELOCITY = 0.32;
const POINTER_VELOCITY_BLEND = 0.65;
const MAX_Y_VELOCITY = 540;
const FREE_SPIN_DRAG = 1.55;
const SNAP_DELAY_MS = 360;
const SNAP_START_VELOCITY = 24;
const SNAP_STIFFNESS = 30;
const SNAP_DAMPING = 11;
const SNAP_POSITION_EPSILON = 0.08;
const SNAP_VELOCITY_EPSILON = 0.8;

export default function BrandFlipCard() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const card = cardRef.current;
    if (!stage || !card) return;

    let frame = 0;
    let rotationX = 0;
    let rotationY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let lastPointerX: number | null = null;
    let lastPointerY: number | null = null;
    let lastPointerAt = performance.now();
    let lastPointerSampleAt = lastPointerAt;
    let lastFrameAt = lastPointerAt;
    let snapTargetY: number | null = null;
    let inViewport = false;

    const setPointerOrigin = (event: PointerEvent) => {
      const now = performance.now();
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      lastPointerAt = now;
      lastPointerSampleAt = now;
      snapTargetY = null;
    };

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

    const handlePointerLeave = () => {
      lastPointerX = null;
      lastPointerY = null;
    };

    const handlePointerDown = (event: PointerEvent) => {
      stage.setPointerCapture?.(event.pointerId);
      setPointerOrigin(event);
      stage.dataset.dragging = "true";
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (stage.hasPointerCapture?.(event.pointerId)) {
        stage.releasePointerCapture(event.pointerId);
      }
      stage.dataset.dragging = "false";
      handlePointerLeave();
    };

    const stopLoop = () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    };

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
        const acceleration = displacement * SNAP_STIFFNESS - velocityY * SNAP_DAMPING;
        velocityY += acceleration * deltaSeconds;

        if (
          Math.abs(displacement) < SNAP_POSITION_EPSILON &&
          Math.abs(velocityY) < SNAP_VELOCITY_EPSILON
        ) {
          rotationY = snapTargetY;
          velocityY = 0;
        }
      }

      const isIdle = now - lastPointerAt > 1200 && Math.abs(velocityY) < 18;
      const idleTiltX = isIdle ? Math.sin(now * 0.0011) * 0.45 : 0;
      const idleTiltY = isIdle ? Math.sin(now * 0.00082) * 0.7 : 0;
      const idleLift = isIdle ? Math.sin(now * 0.00135) : 0;
      const renderedY = rotationY + idleTiltY;

      card.style.transform = `translate3d(0, ${idleLift.toFixed(2)}px, 0) rotateX(${(
        rotationX + idleTiltX
      ).toFixed(2)}deg) rotateY(${renderedY.toFixed(2)}deg)`;
      stage.style.setProperty(
        "--flip-shadow-x",
        `${(Math.sin((renderedY * Math.PI) / 180) * 8).toFixed(2)}px`,
      );
      stage.style.setProperty(
        "--flip-shadow-scale",
        `${(0.78 + Math.abs(Math.cos((renderedY * Math.PI) / 180)) * 0.22).toFixed(3)}`,
      );
      stage.style.setProperty(
        "--flip-light",
        `${(47 + Math.sin((renderedY * Math.PI) / 180) * 18).toFixed(1)}%`,
      );
      stage.dataset.rotationY = rotationY.toFixed(2);
      stage.dataset.velocityY = velocityY.toFixed(2);

      frame = window.requestAnimationFrame(render);
    };

    const startLoop = () => {
      if (frame || !inViewport || document.hidden) return;
      lastFrameAt = performance.now();
      frame = window.requestAnimationFrame(render);
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      inViewport = Boolean(entry?.isIntersecting);
      if (inViewport) startLoop();
      else stopLoop();
    }, { rootMargin: "80px" });
    const handleVisibilityChange = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };

    stage.dataset.flipDirection = "idle";
    stage.dataset.dragging = "false";
    stage.dataset.rotationY = "0";
    stage.dataset.velocityY = "0";
    stage.addEventListener("pointerenter", setPointerOrigin);
    stage.addEventListener("pointermove", handlePointerMove);
    stage.addEventListener("pointerleave", handlePointerLeave);
    stage.addEventListener("pointerdown", handlePointerDown);
    stage.addEventListener("pointerup", handlePointerUp);
    stage.addEventListener("pointercancel", handlePointerUp);
    visibilityObserver.observe(stage);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Seed a gentle spin so the logo is obviously alive on first paint.
    velocityY = 42;

    return () => {
      stopLoop();
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stage.removeEventListener("pointerenter", setPointerOrigin);
      stage.removeEventListener("pointermove", handlePointerMove);
      stage.removeEventListener("pointerleave", handlePointerLeave);
      stage.removeEventListener("pointerdown", handlePointerDown);
      stage.removeEventListener("pointerup", handlePointerUp);
      stage.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  return (
    <div className="brand-flip" data-brand-flip ref={stageRef} aria-hidden="true">
      <div className="brand-flip-anchor">
        <span className="brand-flip-shadow" />
        <div className="brand-flip-card" data-brand-flip-card ref={cardRef}>
          <span className="brand-flip-paper-edge" />
          <figure className="brand-flip-face brand-flip-front" data-brand-flip-face="front">
            <img
              src="/assets/nowaweb/hero/logo-card-cutout.webp"
              srcSet="/assets/nowaweb/hero/logo-card-cutout-420.webp 420w, /assets/nowaweb/hero/logo-card-cutout.webp 700w"
              sizes="200px"
              width={700}
              height={875}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <span className="brand-flip-glint" />
          </figure>
          <figure className="brand-flip-face brand-flip-back" data-brand-flip-face="back">
            <img
              src="/assets/nowaweb/hero/poster-cutout.webp"
              srcSet="/assets/nowaweb/hero/poster-cutout-420.webp 420w, /assets/nowaweb/hero/poster-cutout.webp 700w"
              sizes="200px"
              width={700}
              height={875}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <span className="brand-flip-glint" />
          </figure>
        </div>
      </div>
    </div>
  );
}
