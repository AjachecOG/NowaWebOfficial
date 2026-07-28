# Netlify Forms Security Hardening Design

**Goal:** Uprościć formularz kontaktowy do natywnego Netlify Forms z Akismet i honeypotem, usunąć pozorną ochronę klientowym Turnstile oraz wdrożyć bezpieczne poprawki z audytu.

## Decyzja architektoniczna

NowaWeb pozostaje przy statycznym formularzu Netlify Forms. Ochronę antyspamową zapewniają filtry Netlify (Akismet) i istniejący honeypot. Cloudflare Turnstile zostaje całkowicie usunięty z HTML, kodu klienta, zmiennych środowiskowych i dokumentacji, ponieważ bez własnego backendu wywołującego Siteverify nie chroni publicznego endpointu Netlify Forms.

Jeśli po uruchomieniu pojawi się mierzalny spam, kolejnym krokiem będzie wspierane przez Netlify reCAPTCHA 2. Własny backend Turnstile pozostaje poza zakresem tej zmiany.

## Zmiany w repo

- Zachować formularze `kontakt` i `kontakt-home`, `data-netlify`, ukryty `form-name` i honeypot.
- Usunąć `PUBLIC_TURNSTILE_SITE_KEY`, widget, loader i domenę Cloudflare z CSP.
- Zachować istniejące lokalne poprawki `inert`/`aria-hidden` formularza na stronie głównej.
- Dodać limity: nazwa 120, email 254, telefon 32, wiadomość 4000 znaków.
- Zastąpić wymaganą zgodę RODO niewymagającą checkboxa informacją o przetwarzaniu danych.
- Ujednolicić politykę prywatności z podstawą art. 6 ust. 1 lit. b/f i usunąć opis nieużywanego Turnstile.
- Włączyć egzekwowaną CSP z ograniczeniami `base-uri`, `object-src`, `frame-ancestors` i `form-action`.
- Serializować JSON-LD tak, aby znak `<` nie mógł zamknąć elementu `script`.
- Dodać test artefaktu builda i funkcji serializującej JSON, który wykryje regresję tych wymagań.

## Przepływ danych

Przeglądarka wysyła standardowy POST do Netlify Forms. Netlify rozpoznaje jeden z dwóch statycznych formularzy, stosuje własne filtrowanie spamu i zapisuje zweryfikowane zgłoszenie. Po poprawnym przetworzeniu użytkownik przechodzi na `/dziekujemy/`. Kod aplikacji nie wykonuje własnych żądań do zewnętrznych usług.

## Obsługa błędów i bezpieczeństwo

Walidacja HTML poprawia UX, ale nie jest traktowana jako kontrola serwerowa. Limity i honeypot ograniczają przypadkowe oraz proste automatyczne nadużycia; właściwe filtrowanie pozostaje po stronie Netlify. Powiadomienia, retencja i kontrolny POST wymagają konfiguracji operatora po deployu.

## Weryfikacja

- Test bezpieczeństwa musi najpierw nie przejść na obecnym artefakcie, a następnie przejść po implementacji.
- `npm run build` musi wygenerować siedem tras bez odwołań do Turnstile.
- `npm audit` musi raportować zero znanych podatności.
- Końcowy `git diff` musi zawierać wyłącznie zmiany związane z audytem oraz wcześniej istniejące zmiany użytkownika.

## Ograniczenia

- Bez commita, pushu i deployu.
- Bez zmian w panelach Netlify, Cloudflare, DNS i poczcie.
- Bez wysyłania formularza produkcyjnego.
