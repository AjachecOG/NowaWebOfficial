# Plan zmian: AI-generic copy → naturalniejszy głos NowaWeb

**Status wdrożenia copy (2026-07-25):** fazy 1–5 AI-generic **wdrożone**.

**Status production readiness:** patrz `docs/superpowers/plans/2026-07-25-production-readiness.md`

**Weryfikacja copy:**
- Fazy marketingowe + prawne em-dashe wdrożone wcześniej tego dnia.


**Cel:** Usunąć em-dashe marketingowe, triady, punchline’y i filler agencyjny — bez zmiany struktury sekcji ani layoutu.

**Źródło:** `docs/audits/ai-generic-audit-2026-07-25.json`

**Zasady przepisania:**
- Em-dash `—` w marketingu → `.` / `:` / nawias / dwa zdania
- Triady „A, B i C” → jedno konkretne zdanie
- „Mniej X. Więcej Y.” → jeden fakt
- Bez pustych słów: *profesjonalnie, realnie, z myślą o, dzięki temu, jasna ścieżka*

**Poza zakresem na start:** strony prawne (RODO / cookies / regulamin) — faza opcjonalna na końcu.

---

## Faza 1 — Szybkie typograficzne + CTA (wysoki wpływ, mało ryzyka)

| ID | Plik | Z | Na |
|---|---|---|---|
| EM-001 | `src/pages/index.astro` | `Umów rozmowę — krótkie zapytanie` | `Umów rozmowę: krótkie zapytanie` |
| EM-002 | `src/pages/kontakt.astro` (meta) | `Napisz do NowaWeb — opowiedz o marce i co strona ma dowieźć.` | `Napisz do NowaWeb. Opisz markę i cel strony.` |
| EM-003 | `src/pages/kontakt.astro` | `Dziękujemy — wiadomość poszła. Odpiszemy na podany email.` | `Dziękujemy. Wiadomość poszła. Odpiszemy na podany email.` |
| AF-004 | `src/pages/index.astro` (CTA) | `…co strona ma realnie dowieźć.` | `…czego oczekujesz od strony.` |
| SC-002 | `src/pages/index.astro` | `Stwórzmy stronę, która zrobi świetne pierwsze wrażenie` | `Zróbmy stronę, która zbiera zapytania` |
| SC-003 | `src/pages/kontakt.astro` | `Stwórzmy stronę, która zrobi dobre pierwsze wrażenie` | `Zróbmy stronę, która zbiera zapytania` *(ujednolicone z SC-002)* |
| SC-001 | `src/pages/index.astro` (karty usług) | `Porozmawiajmy` | `Napisz o projekcie` |
| AF-008 | `src/pages/index.astro` (`<title>`) | `NowaWeb - profesjonalne strony internetowe` | `NowaWeb \| Strony firmowe bez WordPressa` |

**Weryfikacja:** odśwież `/` i `/kontakt`, sprawdź formularz CTA + komunikat sukcesu (`?wyslano=1`).

---

## Faza 2 — Hero + manifesto (głos marki)

| ID | Plik | Z | Na |
|---|---|---|---|
| AF-001 + TR-001 + AF-002 | `src/pages/index.astro` (lead) | `Projektujemy szybkie strony dla firm, które chcą wyglądać profesjonalnie i działać bez technologicznego chaosu. Zdalnie, precyzyjnie i z myślą o wyniku.` | `Projektujemy lekkie strony firmowe: czytelna oferta, szybkie ładowanie, stały kontakt po starcie. Pracujemy zdalnie z firmami z całej Polski.` |
| CO-001 + AF-003 + TR-002 | `src/pages/index.astro` (manifesto) | `Nie sprzedajemy gotowego motywu. Budujemy stronę jak system komunikacji: najpierw cel i struktura, potem wygląd, wdrożenie i wsparcie. Dzięki temu całość jest szybka, spójna i łatwa do rozwijania.` | `Zaczynamy od celu i struktury, potem projekt i wdrożenie. Bez gotowego motywu WordPress — strona ma być szybka i prosta do rozwijania.` |
| AF-010 | `src/pages/index.astro` (H2) | `Stabilność spotyka kreatywność` | `Spokojny proces. Wyrazisty efekt.` *(albo konkretniej: `Strona pod markę, nie pod motyw`)* |
| TR-003 / TR-004 | `index.astro` + `BaseLayout.astro` (meta description) | `…projektuje szybkie, estetyczne i stabilne strony internetowe dla firm z całej Polski.` | `…projektuje lekkie strony firmowe dla marek z całej Polski — bez WordPressa i zbędnych wtyczek.` |
| CO-002 | `src/pages/index.astro` (comparison intro) | `WordPress bywa dobry. My wybieramy lżejszą ścieżkę dla firm, które chcą strony szybkiej, prostej w utrzymaniu i projektowanej pod markę.` | `WordPress ciągnie za sobą motyw, wtyczki i utrzymanie. My budujemy lekką stronę pod Twoją markę — szybszą i prostszą w opiece.` |

**Weryfikacja:** hero + sekcja „O nas” + intro porównania; title/description w `<head>`.

---

## Faza 3 — ComparisonReveal (punchline’y)

Plik: `src/components/ComparisonReveal.tsx`

### Szybkość

| Pole | Z | Na |
|---|---|---|
| `nowawebTitle` | `Lekka od pierwszej linii.` | `Tylko kod, którego potrzebujesz.` |
| `nowawebVerdictTitle` | `Szybkość, która sprzedaje.` | `Szybka strona trudniej traci uwagę.` |
| `nowawebVerdictDetail` | `Lekki kod pomaga zamienić uwagę w kontakt, zanim klient zdąży odejść.` | `Mniej skryptów = szybsze ładowanie i większa szansa na zapytanie.` |
| `wordpressTitle` | `Więcej warstw. Mniej tempa.` | `Motyw i wtyczki dokładają ciężar.` |
| `wordpressDetail` | *(zostaje OK)* `Motyw i wtyczki dokładają kolejne skrypty i ciężar.` | — |
| `wordpressVerdictTitle` | `Klient nie będzie czekał.` | `Wolna strona gubi klienta.` |

### Koszty

| Pole | Z | Na |
|---|---|---|
| `nowawebTitle` | `Zakres, który da się przewidzieć.` | `Zakres ustalony przed startem.` |
| `nowawebVerdictTitle` | `Płacisz za efekt, nie poprawki.` | `Płacisz za ustalony zakres.` |
| `wordpressTitle` | `Dodatki mnożą kolejne koszty.` | `Licencje i dodatki rosną z czasem.` |
| `wordpressVerdictTitle` | `Tani start. Drogie utrzymanie.` | `Tani start, potem stałe koszty.` |

### Bezpieczeństwo

| Pole | Z | Na |
|---|---|---|
| `nowawebTitle` | `Mniej punktów wejścia.` | `Bez stosu wtyczek do łatania.` |
| `nowawebVerdictTitle` | `Mniej luk. Więcej spokoju.` | `Prostsza architektura, mniej awarii.` |
| `wordpressVerdictTitle` | `Każdy dodatek to kolejne ryzyko.` | `Każda wtyczka to kolejny punkt ryzyka.` |

### Wygląd

| Pole | Z | Na |
|---|---|---|
| `nowawebVerdictTitle` | `Marka, której nie da się pomylić.` | `Wygląda jak Twoja firma, nie jak szablon.` |
| `wordpressTitle` | `Szablon prowadzi markę.` | `Gotowy motyw dyktuje układ.` |
| `wordpressVerdictTitle` | `Szablon nie buduje przewagi.` | `Szablon wygląda jak tysiąc innych stron.` |

### Wsparcie

| Pole | Z | Na |
|---|---|---|
| `nowawebVerdictTitle` | `Jedna odpowiedzialność. Szybka decyzja.` | `Jeden kontakt zna cały projekt.` |
| `wordpressVerdictTitle` | `Problem krąży. Rachunek zostaje.` | `Hosting zrzuca na motyw, motyw na wtyczkę.` |

**Weryfikacja:** przełącz wszystkie 5 kryteriów w sekcji porównania.

---

## Faza 4 — Usługi, proces, wsparcie, portfolio

### Usługi (`src/pages/index.astro` — tablica `services`)

| ID | Z | Na |
|---|---|---|
| AF-007 | `Kompletna strona, która porządkuje ofertę i buduje wiarygodność.` | `Strona firmowa: oferta, referencje i jasny kontakt.` |
| AF-005 | `Jedna kampania, jedna decyzja i jasna ścieżka do działania.` | `Landing pod jedną kampanię i jedno CTA.` |
| — | `Zwięzła prezentacja firmy bez zbędnych zakładek i rozpraszaczy.` | `Jedna strona z najważniejszymi informacjami i kontaktem.` |
| CO-003 | `Nowa jakość bez burzenia wszystkiego od zera.` | `Odświeżamy wygląd i strukturę na bazie obecnej strony.` |
| — | `Treść i układ, które odpowiadają na pytania klienta.` | `Teksty i układ pod pytania, które klient i tak zada.` |
| — | `Stałe wsparcie po publikacji, gdy strona rośnie razem z firmą.` | `Opieka po starcie: treści, poprawki i kolejne sekcje.` |
| TR-005 | `Każda sekcja ma swoje zadanie: wyjaśnić, uspokoić, pokazać wartość i poprowadzić do kontaktu.` | `Układ prowadzący od oferty do kontaktu — bez zbędnych zakładek.` |

### Proces

| ID | Plik | Z | Na |
|---|---|---|---|
| TR-006 | `index.astro` | `Prosty rytm, jasne decyzje i etapowe dowożenie zamiast chaosu.` | `Cztery etapy, ustalony zakres i stały kontakt.` |
| AF-009 | `ProcessIsland.tsx` | `Tworzymy dopracowany wygląd oraz szybką, stabilną stronę.` | `Projekt i kod pod Twoją ofertę — bez zbędnych wtyczek.` |
| — | `ProcessIsland.tsx` | `Publikujemy stronę, dbamy o opiekę i dalszy rozwój.` | `Publikujemy stronę i zostajemy przy opiece oraz rozwoju.` |
| EL-002 | `ProcessIsland.tsx` | `Odpędzamy negatywne opinie…` | `Filtrujemy zbędny szum` |
| EL-003 | `ProcessIsland.tsx` | `Przyciągamy właściwych klientów…` | `Ustawiamy ścieżkę do kontaktu` |
| EL-004 | `ProcessIsland.tsx` | `Dopinamy ostatnie szczegóły…` | `Sprawdzamy ostatnie elementy` |
| EL-001 | `ProcessIsland.tsx` | `Publikowanie…` | `Publikowanie` *(bez ellipsis; stan i tak widać ze spinnera)* |

### Wsparcie + portfolio + CTA końcówka

| ID | Plik | Z | Na |
|---|---|---|---|
| TR-007 | `index.astro` | `Pomagamy ją utrzymać, rozwijać i poprawiać, kiedy zmieniają się cele albo oferta.` | `Aktualizujemy treści, pilnujemy stabilności i dodajemy sekcje, gdy oferta się zmienia.` |
| AF-006 | `index.astro` | `Masz jasną ścieżkę kontaktu i szybką reakcję na drobne sprawy.` | `Masz bezpośredni kontakt i szybką reakcję na drobne sprawy.` |
| — | `index.astro` | `Pilnujemy bezpieczeństwa, wydajności i stabilności strony.` | `Pilnujemy aktualizacji, wydajności i działania strony.` |
| PP-009 | `index.astro` | `Trzy marki. Każda z własnym charakterem.` | `Trzy projekty. Trzy różne branże i decyzje.` |
| — | `index.astro` | `…trzy różne odpowiedzi projektowe stworzone dla trzech różnych odbiorców.` | `…trzy różne projekty dla trzech różnych odbiorców.` |
| TR-008 | `index.astro` | `Zaproponujemy kierunek, strukturę i sensowny plan działania.` | `Powiemy, co zbudować najpierw i ile to zajmie.` |

**Weryfikacja:** karty usług (przód/tył), 4 etapy procesu + statusy launch, 3 karty wsparcia, intro portfolio, CTA.

---

## Faza 5 (opcjonalna) — Strony prawne

Tylko jeśli chcesz spójność typografii w całym serwisie. W PL em-dash w RODO jest akceptowalny.

**Reguła zamiany:** `etykieta — wyjaśnienie` → `etykieta: wyjaśnienie`  
**Parenthetical:** `i — po zgodzie — prowadzić` → `i (po zgodzie) prowadzić`

Pliki: `polityka-prywatnosci.astro`, `polityka-cookies.astro`, `regulamin.astro`.

---

## Kolejność wdrożenia

1. Faza 1 (15–20 min) — em-dashe + CTA + title  
2. Faza 2 (20–30 min) — hero / manifesto / meta  
3. Faza 3 (30–40 min) — ComparisonReveal  
4. Faza 4 (30–40 min) — usługi / proces / wsparcie / portfolio  
5. Faza 5 — tylko na życzenie  

Po każdej fazie: `npm run dev` → szybki pass wizualny sekcji, których dotyczy copy.

---

## Czego NIE ruszamy w tym planie

- Layout, CSS, animacje, karuzela (poza tekstami nazw statusów procesu)
- Lucide icons / struktura sekcji
- Dane firmy w `site.ts`
- Cudzysłowy polskie `„…”` w tekstach prawnych
- Separator `·` w stopce
