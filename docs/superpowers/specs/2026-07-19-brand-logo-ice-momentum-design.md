# Płynny obrót logo NowaWeb — projekt

## Cel

Nadać obracanej karcie z logo NowaWeb wyraźną, płynną bezwładność. Po szybkim geście karta ma długo zachowywać pęd „jak na lodzie”, a po wyhamowaniu miękko ustawiać najbliższą pełną stronę, dzięki czemu logo lub grafika na odwrocie pozostają czytelne.

## Zakres

Zmiana obejmuje wyłącznie fizykę interakcji w `BrandFlipCard.tsx` oraz testy tej interakcji. Wygląd karty, jej dwie strony, pionowy przechył, bezczynnościowe unoszenie, połysk, cień i układ sekcji pozostają bez zmian.

## Model ruchu

- Prędkość obrotowa osi Y jest wyliczana z poziomej prędkości wskaźnika, z uwzględnieniem czasu pomiędzy zdarzeniami.
- Animacja używa czasu pomiędzy klatkami, dzięki czemu zachowuje podobne tempo na ekranach o różnej częstotliwości odświeżania.
- Podczas swobodnego ruchu działa łagodne, wykładnicze tłumienie. Karta zachowuje kierunek i stopniowo wytraca pęd bez nagłego hamowania.
- Maksymalna prędkość pozostaje ograniczona, aby nawet bardzo gwałtowny gest nie powodował nieczytelnego lub niekomfortowego obrotu.
- Przyciąganie do najbliższej wielokrotności 180 stopni włącza się dopiero po krótkiej przerwie od ostatniego ruchu i po spadku prędkości poniżej niskiego progu.
- Końcowe ustawienie wykorzystuje tłumiony ruch sprężynowy bez widocznego drgania. Przyciąganie nie może odwrócić jeszcze wyraźnego pędu karty.

## Pozostałe osie i stany

Pionowy przechył osi X zachowuje obecne ograniczenie i stabilizację. Stan przeciągania, kierunek ostatniego impulsu oraz dane diagnostyczne pozostają dostępne w atrybutach `data-*`. Po osiągnięciu celu prędkość zostaje wyzerowana, aby uniknąć mikrodrgań. Obsługa `pointercancel` oraz opuszczenia obszaru nadal bezpiecznie kończy gest.

## Kryteria akceptacji

1. Szybki ruch poziomy powoduje dłuższy obrót po zakończeniu gestu niż obecnie, bez skokowej zmiany prędkości.
2. Wolny gest daje precyzyjny, spokojny obrót i nie generuje nadmiernego pędu.
3. Karta zachowuje kierunek podczas swobodnego wyhamowania.
4. Po spadku prędkości karta łagodnie ustawia się przodem lub tyłem, czyli na wielokrotności 180 stopni.
5. Ruch zachowuje porównywalne tempo przy 60 i 120 klatkach na sekundę.
6. Szybki gest w przeciwną stronę prawidłowo odwraca pęd.
7. Obecne dwie strony, przechył pionowy, cień, połysk i zachowanie na urządzeniach mobilnych nie ulegają regresji.

## Weryfikacja

Test ruchu zostanie rozszerzony o próbki obrotu i prędkości po impulsie, kontrolę stopniowego wyhamowania oraz końcowego ustawienia na wielokrotności 180 stopni. Istniejące kontrole obu stron karty, zmiany kierunku, transformacji 3D i szerokości mobilnej pozostaną aktywne. Na końcu zostaną uruchomione testy projektu i produkcyjny build.
