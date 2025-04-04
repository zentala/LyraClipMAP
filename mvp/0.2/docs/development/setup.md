# Konfiguracja środowiska

## Wersja dokumentu: 0.2.0

## Wymagania systemowe

### Backend
- Node.js >= 18
- PostgreSQL >= 14
- pnpm >= 8
- Docker (opcjonalnie)

### Frontend
- Node.js >= 18
- pnpm >= 8
- Modern browser (Chrome, Firefox, Safari, Edge)

## Instalacja

### 1. Backend

```bash
# Instalacja zależności
cd backend
pnpm install

# Konfiguracja bazy danych
cp .env.example .env
# Edytuj .env z odpowiednimi wartościami

# Migracja bazy danych
pnpm prisma migrate dev

# Uruchomienie serwera deweloperskiego
pnpm start:dev
```

### 2. Frontend

```bash
# Instalacja zależności
cd frontend
pnpm install

# Uruchomienie serwera deweloperskiego
pnpm dev
```

## Konfiguracja bazy danych

### PostgreSQL
1. Instalacja PostgreSQL
2. Utworzenie bazy danych
3. Konfiguracja użytkownika
4. Ustawienie zmiennych środowiskowych

### Prisma
1. Inicjalizacja Prisma
2. Konfiguracja połączenia
3. Generowanie klienta
4. Migracje

## Testy

### Backend
```bash
# Testy jednostkowe
pnpm test

# Testy z pokryciem
pnpm test:cov

# Testy e2e
pnpm test:e2e
```

### Frontend
```bash
# Testy jednostkowe
pnpm test

# Testy z pokryciem
pnpm test:cov
```

## Deployment

### Backend
1. Build aplikacji
2. Konfiguracja środowiska produkcyjnego
3. Migracja bazy danych
4. Uruchomienie serwera

### Frontend
1. Build aplikacji
2. Konfiguracja środowiska produkcyjnego
3. Deploy do serwera statycznego

## Rozwiązywanie problemów

### Typowe problemy
1. Problemy z połączeniem do bazy danych
2. Problemy z zależnościami
3. Problemy z konfiguracją środowiska

### Logi
- Backend: `backend/logs/`
- Frontend: `frontend/logs/` 