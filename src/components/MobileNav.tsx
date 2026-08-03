import { useEffect, useId, useState } from "react";

const links = [
  { href: "/#onas", label: "O nas" },
  { href: "/#uslugi", label: "Usługi" },
  { href: "/#proces", label: "Proces" },
  { href: "/#projekty", label: "Projekty" },
  { href: "/kontakt/", label: "Kontakt" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="mobile-nav">
      <button
        type="button"
        className="mobile-nav__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Zamknij" : "Menu"}
      </button>
      <div
        id={panelId}
        className="mobile-nav__panel"
        hidden={!open}
        data-open={open ? "true" : "false"}
      >
        <nav aria-label="Menu mobilne">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
