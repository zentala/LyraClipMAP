# Walidacja formularzy w LyraClipMAP

## Wprowadzenie

W projekcie LyraClipMAP wykorzystujemy kombinację `vee-validate` i `yup` do walidacji formularzy. Ta dokumentacja opisuje, jak używać tych narzędzi w kontekście naszej aplikacji Vue.js.

## Biblioteki

- **[vee-validate](https://vee-validate.logaretm.com/v4/)** - Obsługa formularzy i walidacji dla Vue 3
- **[yup](https://github.com/jquense/yup)** - Biblioteka schema validation dla JavaScript

## Architektura walidacji formularzy

### Komponenty formularzy

Stworzyliśmy kilka komponentów bazowych do obsługi formularzy:

1. `ValidationForm` - Główny wrapper dla formularzy z walidacją
2. `FormField` - Komponent dla pól tekstowych (oparty na `v-text-field` z Vuetify)
3. `TextareaField` - Komponent dla pól wielowierszowych (oparty na `v-textarea` z Vuetify)
4. `SelectField` - Komponent dla list wyboru (oparty na `v-select` z Vuetify)
5. `CheckboxField` - Komponent dla pól wyboru (oparty na `v-checkbox` z Vuetify)

### Schematy walidacji

Schematy walidacji bazują na bibliotece `yup` i są zdefiniowane w pliku `src/utils/validation.ts`. Każdy schemat odpowiada określonemu typowi formularza, np. `songSchema`, `playlistSchema`, `userSchema`.

## Przykład użycia

### Podstawowy formularz z walidacją

```vue
<template>
  <ValidationForm
    :schema="songSchema"
    :initial-values="initialValues"
    :on-submit="handleSubmit"
    v-slot="{ errors, isSubmitting }"
  >
    <FormField
      name="title"
      label="Tytuł"
      placeholder="Wprowadź tytuł piosenki"
      :is-submitting="isSubmitting"
    />
    
    <FormField
      name="artist"
      label="Artysta"
      placeholder="Wprowadź nazwę artysty"
      :is-submitting="isSubmitting"
    />
    
    <v-btn type="submit" color="primary" :loading="isSubmitting">
      Zapisz
    </v-btn>
  </ValidationForm>
</template>

<script lang="ts" setup>
import { songSchema } from '@/utils/validation';
import ValidationForm from '@/components/forms/ValidationForm.vue';
import FormField from '@/components/forms/FormField.vue';

const initialValues = {
  title: '',
  artist: ''
};

const handleSubmit = async (values) => {
  console.log(values);
  // Zapisz dane
};
</script>
```

### Tworzenie własnych schematów walidacji

```typescript
import * as yup from 'yup';

// Schemat dla artysty
export const artistSchema = yup.object({
  name: yup.string()
    .required('Nazwa artysty jest wymagana')
    .min(2, 'Nazwa artysty musi mieć co najmniej 2 znaki')
    .max(100, 'Nazwa artysty nie może być dłuższa niż 100 znaków'),
  
  description: yup.string()
    .max(1000, 'Opis nie może być dłuższy niż 1000 znaków'),
  
  imageUrl: yup.string()
    .url('Podaj prawidłowy adres URL obrazu')
});
```

## Walidacja warunkowa

Vee-validate w połączeniu z Yup umożliwia wykonywanie walidacji warunkowej. Oto przykład:

```typescript
export const songSchema = yup.object({
  title: yup.string().required('Tytuł jest wymagany'),
  
  // Walidacja warunkowa
  youtubeUrl: yup.string()
    .when('hasYoutubeSource', {
      is: true,  // gdy hasYoutubeSource jest true
      then: (schema) => schema
        .required('Link YouTube jest wymagany')
        .matches(
          /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/,
          'Podaj prawidłowy link do YouTube'
        ),
      otherwise: (schema) => schema.optional()
    })
});
```

## Asynchroniczna walidacja

Yup obsługuje również asynchroniczną walidację, co przydaje się np. przy sprawdzaniu unikalności:

```typescript
export const userSchema = yup.object({
  email: yup.string()
    .required('Email jest wymagany')
    .email('Podaj prawidłowy adres email')
    .test(
      'email-unique',
      'Ten adres email jest już zajęty',
      async (value) => {
        // Sprawdź w API czy email jest unikalny
        const response = await checkEmailUnique(value);
        return response.isUnique;
      }
    )
});
```

## Obsługa błędów walidacji

W komponentach formularzy, błędy walidacji są automatycznie wyświetlane pod polami:

```vue
<FormField
  name="title"
  label="Tytuł"
  :error-messages="errors.title"
/>
```

## Stylowanie błędów walidacji

W naszym projekcie błędy walidacji są stylowane zgodnie z designem Vuetify:

- Pole z błędem otrzymuje klasę `.is-invalid` i jest podświetlane na czerwono
- Komunikat błędu pojawia się pod polem
- Pole, które przeszło walidację, otrzymuje klasę `.is-valid`

## Najlepsze praktyki

1. **Oddzielaj logikę walidacji od komponentów** - definiuj schematy w oddzielnych plikach
2. **Używaj walidacji po stronie klienta i serwera** - nie ufaj tylko walidacji po stronie klienta
3. **Grupuj powiązane walidacje** - twórz schematy dla powiązanych danych (np. formularz logowania)
4. **Używaj przetłumaczonych komunikatów błędów** - dla lepszego UX

## Kompleksowy przykład

Pełny przykład formularza z walidacją możesz znaleźć w komponencie `SongForm.vue`, który wykorzystuje wszystkie opisane tutaj techniki:

- Walidacja wymaganych pól
- Walidacja formatów (np. URL YouTube)
- Walidacja warunkowa
- Obsługa błędów
- Asynchroniczne operacje podczas przesyłania formularza

## Rozszerzanie systemu walidacji

Aby dodać nowe typy walidacji, możesz:

1. Rozszerzyć istniejące schematy w `validation.ts`
2. Utworzyć własne metody walidacyjne
3. Dodać własne komponenty formularzy dla specyficznych typów danych

## Testowanie walidacji

Zawsze testuj logikę walidacji, aby upewnić się, że działa poprawnie:

```typescript
import { describe, it, expect } from 'vitest';
import { songSchema } from '@/utils/validation';

describe('Song validation schema', () => {
  it('should validate a valid song', async () => {
    const validSong = {
      title: 'Test Song',
      artist: 'Test Artist'
    };
    
    await expect(songSchema.validate(validSong)).resolves.toBeTruthy();
  });
  
  it('should reject an invalid song', async () => {
    const invalidSong = {
      title: '',  // brak tytułu
      artist: 'Test Artist'
    };
    
    await expect(songSchema.validate(invalidSong)).rejects.toThrow();
  });
});
```