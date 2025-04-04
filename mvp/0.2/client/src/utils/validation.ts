/**
 * Utility functions for form validation with vee-validate and yup
 */
import * as yup from 'yup';

// Common validation schemas
export const songSchema = yup.object({
  title: yup.string()
    .required('Tytuł jest wymagany')
    .min(2, 'Tytuł musi mieć co najmniej 2 znaki')
    .max(100, 'Tytuł nie może być dłuższy niż 100 znaków'),
  
  artist: yup.string()
    .required('Artysta jest wymagany')
    .min(2, 'Nazwa artysty musi mieć co najmniej 2 znaki')
    .max(100, 'Nazwa artysty nie może być dłuższa niż 100 znaków'),
  
  youtubeUrl: yup.string()
    .when('hasYoutubeUrl', {
      is: true,
      then: (schema) => schema.required('Link YouTube jest wymagany')
        .matches(
          /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/,
          'Podaj prawidłowy link do YouTube'
        ),
      otherwise: (schema) => schema.optional()
    }),
  
  description: yup.string()
    .max(1000, 'Opis nie może być dłuższy niż 1000 znaków'),
  
  lyrics: yup.string()
    .max(10000, 'Tekst piosenki nie może być dłuższy niż 10000 znaków')
});

export const playlistSchema = yup.object({
  name: yup.string()
    .required('Nazwa playlisty jest wymagana')
    .min(2, 'Nazwa playlisty musi mieć co najmniej 2 znaki')
    .max(100, 'Nazwa playlisty nie może być dłuższa niż 100 znaków'),
  
  description: yup.string()
    .max(500, 'Opis nie może być dłuższy niż 500 znaków'),
  
  isPublic: yup.boolean()
});

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

export const userSchema = yup.object({
  name: yup.string()
    .required('Imię jest wymagane')
    .min(2, 'Imię musi mieć co najmniej 2 znaki')
    .max(100, 'Imię nie może być dłuższe niż 100 znaków'),
  
  email: yup.string()
    .required('Email jest wymagany')
    .email('Podaj prawidłowy adres email'),
  
  password: yup.string()
    .required('Hasło jest wymagane')
    .min(8, 'Hasło musi mieć co najmniej 8 znaków')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
      'Hasło musi zawierać co najmniej jedną dużą literę, jedną małą literę i jedną cyfrę'
    ),
  
  confirmPassword: yup.string()
    .required('Potwierdzenie hasła jest wymagane')
    .oneOf([yup.ref('password')], 'Hasła nie są identyczne')
});

export const loginSchema = yup.object({
  email: yup.string()
    .required('Email jest wymagany')
    .email('Podaj prawidłowy adres email'),
  
  password: yup.string()
    .required('Hasło jest wymagane')
});

export const lyricsSchema = yup.object({
  content: yup.string()
    .required('Tekst jest wymagany')
    .min(10, 'Tekst musi mieć co najmniej 10 znaków'),
  
  language: yup.string()
    .required('Język jest wymagany')
});

// YouTube URL validation
export const isValidYoutubeUrl = (url: string): boolean => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})$/;
  return youtubeRegex.test(url);
};

// Extract YouTube video ID from URL
export const extractYoutubeVideoId = (url: string): string | null => {
  if (!isValidYoutubeUrl(url)) return null;
  
  const regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regex);
  
  return (match && match[2].length === 11) ? match[2] : null;
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};