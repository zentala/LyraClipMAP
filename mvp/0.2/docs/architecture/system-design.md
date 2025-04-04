# Projekt systemu

## Wersja dokumentu: 0.2.0

## Architektura systemu

### Backend (NestJS)
- Modułowa architektura
- REST API
- JWT autentykacja
- Prisma ORM
- PostgreSQL
- Testy jednostkowe i integracyjne

### Frontend (React)
- Komponentowa architektura
- TypeScript
- Material-UI
- Redux dla zarządzania stanem
- Testy jednostkowe

### Integracje
- Spotify API
- System wizualizacji audio
- System konwersji tekstu do LRC

## Przepływ danych

### Autentykacja
1. Rejestracja użytkownika
2. Logowanie
3. Zarządzanie tokenami JWT
4. Odświeżanie tokenów

### Zarządzanie danymi
1. Import utworów ze Spotify
2. Konwersja tekstu do formatu LRC
3. Generowanie wizualizacji
4. Zarządzanie playlistami

## Bezpieczeństwo
- Szyfrowanie haseł
- Walidacja danych wejściowych
- Rate limiting
- CORS
- Bezpieczne przechowywanie tokenów

## Skalowalność
- Modułowa architektura
- Caching
- Optymalizacja zapytań do bazy danych
- Asynchroniczne przetwarzanie

## Monitoring
- Logi aplikacji
- Metryki wydajności
- Alerty
- Tracing 