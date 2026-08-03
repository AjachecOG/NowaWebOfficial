import { useEffect, useState } from "react";

const STORAGE_KEY = "nowaweb-cookie-consent";

type Consent = {
  version: 1;
  essential: true;
  analytics: boolean;
  updatedAt: string;
};

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Consent;
    if (parsed?.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeConsent(analytics: boolean) {
  const value: Consent = {
    version: 1,
    essential: true,
    analytics,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("nowaweb:cookie-consent", { detail: value }));
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!readConsent()) setOpen(true);

    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-open-cookie-settings]")) {
        event.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, []);

  if (!open) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-labelledby="cookie-banner-title" aria-modal="false">
      <div className="cookie-banner__copy">
        <p id="cookie-banner-title" className="cookie-banner__title">
          Pliki cookies
        </p>
        <p>
          Używamy niezbędnych zapisów w przeglądarce, żeby zapamiętać Twój wybór.
          Nie ładujemy teraz narzędzi analitycznych. Jeśli je dodamy, włączymy je
          dopiero po zgodzie. Szczegóły:{" "}
          <a href="/polityka-cookies/">polityka cookies</a> i{" "}
          <a href="/polityka-prywatnosci/">polityka prywatności</a>.
        </p>
      </div>
      <div className="cookie-banner__actions">
        <button
          type="button"
          className="button secondary cookie-banner__btn"
          onClick={() => {
            writeConsent(false);
            setOpen(false);
          }}
        >
          Tylko niezbędne
        </button>
        <button
          type="button"
          className="button primary cookie-banner__btn"
          onClick={() => {
            writeConsent(true);
            setOpen(false);
          }}
        >
          Akceptuję
        </button>
      </div>
    </div>
  );
}
