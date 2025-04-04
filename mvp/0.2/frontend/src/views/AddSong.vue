<template>
  <div class="add-song">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">Dodaj nową piosenkę</h1>
        
        <SongForm
          :loading="loading"
          :show-cancel="true"
          @submit="handleSubmit"
          @cancel="goBack"
          @youtube-preview="handleYoutubePreview"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import SongForm from '@/components/forms/SongForm.vue';
import axios from 'axios';

// Router
const router = useRouter();

// State
const loading = ref(false);

// Methods
const handleSubmit = async (formData: any) => {
  loading.value = true;
  
  try {
    // In a real app, this would call your backend API
    console.log('Form data to submit:', formData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect to song list or detail page
    router.push('/songs');
  } catch (error) {
    console.error('Error adding song:', error);
  } finally {
    loading.value = false;
  }
};

const handleYoutubePreview = (previewData: any) => {
  console.log('YouTube preview data:', previewData);
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.add-song {
  max-width: 900px;
  margin: 0 auto;
}
</style>