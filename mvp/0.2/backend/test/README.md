# Backend Tests

Ten katalog zawiera testy end-to-end (e2e) dla aplikacji LyraClipMAP.

## Struktura testów

- `auth.e2e-spec.ts` - testy autentykacji i autoryzacji
- `lyrics.e2e-spec.ts` - testy funkcjonalności związanej z tekstami piosenek
- `text-content.e2e-spec.ts` - testy zarządzania zawartością tekstową

## Uruchamianie testów

```bash
# Uruchom wszystkie testy e2e
pnpm test:e2e

# Uruchom testy w trybie watch
pnpm test:e2e:watch

# Uruchom testy z pokryciem
pnpm test:e2e:cov
```

## Konfiguracja

Testy e2e używają konfiguracji z pliku `jest-e2e.json`. Upewnij się, że masz skonfigurowane odpowiednie zmienne środowiskowe w pliku `.env.test`.

## Najlepsze praktyki

1. Każdy test powinien być niezależny od innych
2. Używaj fabryk i helperów do tworzenia danych testowych
3. Czyść dane testowe po każdym teście
4. Testuj zarówno pozytywne, jak i negatywne scenariusze
5. Używaj znaczników `@e2e` dla testów e2e 