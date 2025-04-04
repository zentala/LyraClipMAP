<template>
  <div class="edit-song">
    <v-row>
      <v-col cols="12">
        <v-btn class="mb-4" variant="text" prepend-icon="mdi-arrow-left" @click="goBack">Powrót</v-btn>
        
        <h1 class="text-h4 mb-6">Edytuj piosenkę</h1>
        
        <template v-if="loading">
          <v-skeleton-loader type="card" />
        </template>
        
        <template v-else-if="error">
          <v-alert type="error" title="Błąd" :text="error" />
        </template>
        
        <template v-else-if="song">
          <SongForm
            :initial-values="formInitialValues"
            :loading="saving"
            submit-text="Zapisz zmiany"
            :show-cancel="true"
            @submit="handleSubmit"
            @cancel="goBack"
            @youtube-preview="handleYoutubePreview"
          />
        </template>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SongForm from '@/components/forms/SongForm.vue';
import { Song } from '@/types/index';
import axios from 'axios';

// Route and router
const route = useRoute();
const router = useRouter();

// State
const song = ref<Song | null>(null);
const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);

// Computed
const songId = computed(() => route.params.id as string);

const formInitialValues = computed(() => {
  if (!song.value) return {};
  
  const lyrics = song.value.textContents?.find(content => content.contentType === 'LYRICS')?.content || '';
  const youtubeSource = song.value.audioSources?.find(source => source.sourceType === 'YOUTUBE');
  
  return {
    title: song.value.title,
    artist: song.value.artist?.name || '',
    youtubeUrl: youtubeSource?.url || '',
    description: song.value.description || '',
    lyrics
  };
});

// Methods
const fetchSong = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // In a real app, this would call your backend API
    const response = await axios.get(`/api/songs/${songId.value}`);
    song.value = response.data;
  } catch (err) {
    console.error('Error fetching song:', err);
    error.value = 'Nie udało się pobrać danych piosenki.';
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async (formData: any) => {
  if (!song.value) return;
  
  saving.value = true;
  error.value = null;
  
  try {
    // In a real app, this would call your backend API
    console.log('Form data to submit:', formData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect to song detail page
    router.push(`/songs/${songId.value}`);
  } catch (err) {
    console.error('Error updating song:', err);
    error.value = 'Nie udało się zapisać zmian.';
  } finally {
    saving.value = false;
  }
};

const handleYoutubePreview = (previewData: any) => {
  console.log('YouTube preview data:', previewData);
};

const goBack = () => {
  router.back();
};

// Lifecycle hooks
onMounted(() => {
  fetchSong();
});
</script>

<style scoped>
.edit-song {
  max-width: 900px;
  margin: 0 auto;
}
</style>