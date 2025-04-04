<template>
  <ValidationForm
    :schema="songSchema"
    :initial-values="initialFormValues"
    :on-submit="handleSubmit"
    v-slot="{ errors, isSubmitting }"
  >
    <v-card class="song-form">
      <v-card-title>{{ submitText || (isEditMode ? 'Edytuj piosenkę' : 'Dodaj nową piosenkę') }}</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <FormField
              name="title"
              label="Tytuł"
              placeholder="Wprowadź tytuł piosenki"
              prepend-inner-icon="mdi-music-note"
              :is-submitting="isSubmitting || loading"
            />
          </v-col>
          
          <v-col cols="12" md="6">
            <FormField
              name="artist"
              label="Artysta"
              placeholder="Wprowadź nazwę artysty"
              prepend-inner-icon="mdi-account-music"
              :is-submitting="isSubmitting || loading"
            />
          </v-col>
          
          <v-col cols="12">
            <FormField
              name="youtubeUrl"
              label="Link YouTube"
              placeholder="https://youtube.com/watch?v=..."
              hint="Wklej link do YouTube, aby automatycznie pobrać dane"
              prepend-inner-icon="mdi-youtube"
              :is-submitting="isSubmitting || loading"
              @update:model-value="onYoutubeUrlChange"
            >
              <template v-slot:append>
                <v-tooltip location="bottom" text="Sprawdź link">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      variant="text"
                      :disabled="!hasValidYoutubeUrl || isSubmitting || loading || youtubePreviewLoading"
                      :loading="youtubePreviewLoading"
                      @click="fetchYoutubePreview"
                    >
                      <v-icon>mdi-link-variant-check</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </template>
            </FormField>
          </v-col>
          
          <v-col cols="12" v-if="youtubePreview">
            <v-card variant="outlined" class="my-2">
              <v-row no-gutters>
                <v-col cols="12" sm="4" md="3">
                  <v-img
                    :src="youtubePreview.thumbnail || ''"
                    height="100"
                    cover
                    class="rounded-l"
                  ></v-img>
                </v-col>
                <v-col cols="12" sm="8" md="9">
                  <v-card-text>
                    <div class="text-subtitle-1">{{ youtubePreview.title }}</div>
                    <div class="text-caption text-grey">{{ youtubePreview.channelName }}</div>
                    <v-btn
                      size="small"
                      variant="text"
                      color="primary"
                      class="mt-2"
                      @click="applyYoutubeData"
                    >
                      Zastosuj te dane
                    </v-btn>
                  </v-card-text>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
          
          <v-col cols="12">
            <TextareaField
              name="description"
              label="Opis"
              placeholder="Wprowadź opis piosenki (opcjonalnie)"
              rows="3"
              auto-grow
              :is-submitting="isSubmitting || loading"
            />
          </v-col>
          
          <v-col cols="12">
            <TextareaField
              name="lyrics"
              label="Tekst piosenki"
              placeholder="Wprowadź tekst piosenki (opcjonalnie)"
              rows="10"
              auto-grow
              :is-submitting="isSubmitting || loading"
            />
          </v-col>
          
          <v-col cols="12">
            <v-alert
              v-if="formError"
              type="error"
              title="Błąd"
              text="formError"
              class="mb-4"
            />
          </v-col>
        </v-row>
      </v-card-text>
      
      <v-divider />
      
      <v-card-actions>
        <v-spacer />
        <v-btn
          v-if="showCancel"
          variant="text"
          :disabled="isSubmitting || loading"
          @click="$emit('cancel')"
        >
          Anuluj
        </v-btn>
        <v-btn
          color="primary"
          type="submit"
          :loading="isSubmitting || loading"
        >
          {{ submitText || (isEditMode ? 'Zapisz zmiany' : 'Dodaj piosenkę') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </ValidationForm>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import ValidationForm from '@/components/forms/ValidationForm.vue';
import FormField from '@/components/forms/FormField.vue';
import TextareaField from '@/components/forms/TextareaField.vue';
import { songSchema, extractYoutubeVideoId, isValidYoutubeUrl } from '@/utils/validation';
import { SongFormProps, SongFormEmits } from '@/types/components';
import axios from 'axios';

const props = defineProps<SongFormProps>();
const emit = defineEmits<SongFormEmits>();

// Local state
const youtubePreview = ref<any>(null);
const youtubePreviewLoading = ref(false);
const youtubeUrl = ref(props.initialValues?.youtubeUrl || '');
const formError = ref<string | null>(null);

// Computed
const isEditMode = computed(() => !!props.initialValues?.title || !!props.initialValues?.artist);

const hasValidYoutubeUrl = computed(() => {
  return isValidYoutubeUrl(youtubeUrl.value);
});

const initialFormValues = computed(() => {
  return {
    title: props.initialValues?.title || '',
    artist: props.initialValues?.artist || '',
    youtubeUrl: props.initialValues?.youtubeUrl || '',
    description: props.initialValues?.description || '',
    lyrics: props.initialValues?.lyrics || '',
    hasYoutubeUrl: !!props.initialValues?.youtubeUrl
  };
});

// Methods
const handleSubmit = async (values: any) => {
  formError.value = null;
  
  try {
    // Prepare form data
    const formData = {
      title: values.title,
      artist: values.artist,
      youtubeUrl: values.youtubeUrl,
      lyrics: values.lyrics,
      description: values.description
    };
    
    // Submit the form
    emit('submit', formData);
  } catch (error) {
    console.error('Form submission error:', error);
    formError.value = 'Wystąpił błąd podczas zapisywania danych.';
  }
};

const onYoutubeUrlChange = (value: string) => {
  youtubeUrl.value = value;
};

const fetchYoutubePreview = async () => {
  if (!hasValidYoutubeUrl.value || youtubePreviewLoading.value) return;
  
  youtubePreviewLoading.value = true;
  
  try {
    // For demo purposes, we'll simulate an API call
    // In a real app, this would call your backend API
    const response = await axios.get(`/api/youtube-info?url=${encodeURIComponent(youtubeUrl.value)}`);
    youtubePreview.value = response.data;
    
    // Emit the preview event
    emit('youtube-preview', youtubePreview.value);
  } catch (error) {
    console.error('Error fetching YouTube preview:', error);
    youtubePreview.value = null;
  } finally {
    youtubePreviewLoading.value = false;
  }
};

const applyYoutubeData = () => {
  if (!youtubePreview.value) return;
  
  // This would update the form field values using vee-validate's setFieldValue
  // In a real implementation, you would need access to setFieldValue or a form ref
  // For this example, we'll just show a mock implementation
  console.log('Applying YouTube data to form', youtubePreview.value);
};

// Watchers
watch(() => props.initialValues, (newValues) => {
  if (newValues?.youtubeUrl) {
    youtubeUrl.value = newValues.youtubeUrl;
  }
}, { immediate: true });
</script>

<style scoped>
.song-form {
  max-width: 900px;
  margin: 0 auto;
}
</style>