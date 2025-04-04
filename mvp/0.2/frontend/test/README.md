# Frontend Tests

Ten katalog zawiera testy dla aplikacji LyraClipMAP frontend.

## Struktura testów

Testy są podzielone na następujące kategorie:

- `unit/` - testy jednostkowe komponentów i funkcji
- `integration/` - testy integracyjne
- `e2e/` - testy end-to-end

## Uruchamianie testów

```bash
# Uruchom wszystkie testy
pnpm test

# Uruchom testy w trybie watch
pnpm test:watch

# Uruchom testy z pokryciem
pnpm test:cov

# Uruchom testy e2e
pnpm test:e2e
```

## Konfiguracja

Testy używają Vitest jako framework testowy. Konfiguracja znajduje się w pliku `vitest.config.ts`.

## Najlepsze praktyki

1. Każdy komponent powinien mieć swój plik testowy
2. Używaj mocków dla zewnętrznych zależności
3. Testuj zarówno pozytywne, jak i negatywne scenariusze
4. Używaj znaczników `@test` dla testów jednostkowych
5. Używaj znaczników `@e2e` dla testów e2e 