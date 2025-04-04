import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Song, TextContent, AudioSource, AudioAnalysis, LRCLine } from '@/types/index';
import { PlayerStore } from '@/types/store';
import axios from 'axios';

/**
 * Convert LRC format string to array of timed lines
 */
function parseLRC(lrcText: string): LRCLine[] {
  if (!lrcText) return [];
  
  const lines: LRCLine[] = [];
  // LRC format: [MM:SS.xx] lyrics text
  const regex = /\[(\d{2}):(\d{2})\.(\d{2})\](.*)/g;
  
  let previousTime = 0;
  lrcText.split('\n').forEach(line => {
    const match = regex.exec(line);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const centiseconds = parseInt(match[3]);
      const time = minutes * 60 + seconds + centiseconds / 100;
      const text = match[4].trim();
      
      // Set end time of previous line
      if (lines.length > 0) {
        lines[lines.length - 1].endTime = time;
      }
      
      lines.push({
        time,
        text,
        endTime: 0 // Will be set by the next line or at the end
      });
      
      previousTime = time;
    }
  });
  
  // Set end time for the last line (if any)
  if (lines.length > 0) {
    lines[lines.length - 1].endTime = previousTime + 5; // Assume 5 second duration for last line
  }
  
  return lines;
}

/**
 * Format time in seconds to MM:SS format
 */
function formatTime(timeInSeconds: number): string {
  if (isNaN(timeInSeconds)) return '00:00';
  
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export const usePlayerStore = defineStore('player', (): PlayerStore => {
  // State
  const currentSong = ref<Song | null>(null);
  const currentLyrics = ref<TextContent | null>(null);
  const currentTranslation = ref<TextContent | null>(null);
  const audioElement = ref<HTMLAudioElement | null>(null);
  const youtubePlayer = ref<any | null>(null);
  const playbackState = ref<'playing' | 'paused' | 'stopped' | 'loading' | 'error'>('stopped');
  const currentTime = ref(0);
  const duration = ref(0);
  const volume = ref(0.8);
  const muted = ref(false);
  const lyricsVisible = ref(true);
  const translationVisible = ref(false);
  const displayMode = ref<'scroll' | 'karaoke'>('scroll');
  const lyricsOptions = ref({
    displayMode: 'scroll',
    highlightColor: '#6200EA',
    fontSize: {
      normal: 16,
      highlight: 18
    },
    autoScroll: true,
    showTranslation: false
  });
  const queue = ref<Song[]>([]);
  const history = ref<Song[]>([]);
  const repeatMode = ref<'none' | 'one' | 'all'>('none');
  const shuffleMode = ref(false);
  const waveformData = ref<number[] | null>(null);
  const audioAnalysis = ref<AudioAnalysis | null>(null);
  
  // Getters
  const isPlaying = computed(() => playbackState.value === 'playing');
  
  const progress = computed(() => {
    if (!duration.value) return 0;
    return (currentTime.value / duration.value) * 100;
  });
  
  const formattedCurrentTime = computed(() => formatTime(currentTime.value));
  
  const formattedDuration = computed(() => formatTime(duration.value));
  
  const parsedLyrics = computed(() => {
    if (!currentLyrics.value?.content) return null;
    
    // Check if content is in LRC format or plain text
    if (currentLyrics.value.content.trim().startsWith('[')) {
      return parseLRC(currentLyrics.value.content);
    }
    
    // For plain text, create a simple array of lines without timing
    return currentLyrics.value.content
      .split('\n')
      .map((text, index) => ({ time: 0, text, endTime: 0 }));
  });
  
  const parsedTranslation = computed(() => {
    if (!currentTranslation.value?.content) return null;
    
    // Same logic as parsedLyrics
    if (currentTranslation.value.content.trim().startsWith('[')) {
      return parseLRC(currentTranslation.value.content);
    }
    
    return currentTranslation.value.content
      .split('\n')
      .map((text, index) => ({ time: 0, text, endTime: 0 }));
  });
  
  const currentLyricLine = computed(() => {
    if (!parsedLyrics.value || parsedLyrics.value.length === 0) return null;
    
    for (let i = parsedLyrics.value.length - 1; i >= 0; i--) {
      const line = parsedLyrics.value[i];
      if (line.time <= currentTime.value) {
        if (i === parsedLyrics.value.length - 1 || currentTime.value < parsedLyrics.value[i + 1].time) {
          return line;
        }
      }
    }
    
    return null;
  });
  
  const currentTranslationLine = computed(() => {
    if (!parsedTranslation.value || parsedTranslation.value.length === 0) return null;
    
    // Find the corresponding translation line with the same index as the current lyric line
    const currentIndex = parsedLyrics.value?.findIndex(
      line => line === currentLyricLine.value
    );
    
    if (currentIndex === -1 || currentIndex === undefined) return null;
    
    return parsedTranslation.value[currentIndex] || null;
  });
  
  const nextInQueue = computed(() => {
    if (queue.value.length === 0) return null;
    return queue.value[0];
  });
  
  // Actions
  const playSong = async (song: Song) => {
    try {
      currentSong.value = song;
      playbackState.value = 'loading';
      
      // Reset player state
      currentTime.value = 0;
      duration.value = 0;
      
      // Add to history
      if (currentSong.value) {
        history.value.unshift(currentSong.value);
        // Limit history to 20 songs
        if (history.value.length > 20) {
          history.value.pop();
        }
      }
      
      // Find the audio source to play
      const source = song.audioSources?.find(s => s.sourceType === 'YOUTUBE') || song.audioSources?.[0];
      
      if (!source) {
        playbackState.value = 'error';
        console.error('No audio source found for song:', song);
        return;
      }
      
      if (source.sourceType === 'YOUTUBE') {
        await playYouTube(extractYoutubeId(source.url));
      } else {
        // Play other types of audio
        await playAudio(source.url);
      }
      
      // Fetch lyrics
      await fetchLyrics(song.id);
      
      // Fetch waveform data if available
      if (source.waveformData) {
        waveformData.value = JSON.parse(source.waveformData);
      } else {
        waveformData.value = null;
        await fetchWaveformData(song.id);
      }
    } catch (error) {
      console.error('Error playing song:', error);
      playbackState.value = 'error';
    }
  };
  
  const playYouTube = async (videoId: string) => {
    try {
      // This would integrate with YouTube iframe API
      // In a real implementation, you would load the YouTube API and create a player
      // For this example, we'll simulate a playing YouTube video
      playbackState.value = 'playing';
      duration.value = 240; // Simulate 4 minutes duration
      
      // Start updating current time
      const intervalId = setInterval(() => {
        if (playbackState.value === 'playing') {
          currentTime.value += 0.25;
          if (currentTime.value >= duration.value) {
            clearInterval(intervalId);
            currentTime.value = 0;
            playbackState.value = 'stopped';
            next();
          }
        }
      }, 250);
      
      // Store the interval ID to clear it later
      youtubePlayer.value = { intervalId, videoId };
    } catch (error) {
      console.error('Error playing YouTube video:', error);
      playbackState.value = 'error';
    }
  };
  
  const playAudio = async (url: string) => {
    try {
      // Create audio element if it doesn't exist
      if (!audioElement.value) {
        audioElement.value = new Audio();
        
        // Add event listeners
        audioElement.value.addEventListener('play', () => {
          playbackState.value = 'playing';
        });
        
        audioElement.value.addEventListener('pause', () => {
          playbackState.value = 'paused';
        });
        
        audioElement.value.addEventListener('ended', () => {
          playbackState.value = 'stopped';
          next();
        });
        
        audioElement.value.addEventListener('timeupdate', () => {
          currentTime.value = audioElement.value?.currentTime || 0;
        });
        
        audioElement.value.addEventListener('durationchange', () => {
          duration.value = audioElement.value?.duration || 0;
        });
        
        audioElement.value.addEventListener('error', () => {
          playbackState.value = 'error';
        });
      }
      
      // Set source and load
      audioElement.value.src = url;
      audioElement.value.volume = volume.value;
      audioElement.value.load();
      
      // Play
      await audioElement.value.play();
      playbackState.value = 'playing';
    } catch (error) {
      console.error('Error playing audio:', error);
      playbackState.value = 'error';
    }
  };
  
  const togglePlay = () => {
    if (playbackState.value === 'playing') {
      pause();
    } else {
      play();
    }
  };
  
  const play = () => {
    if (!currentSong.value) return;
    
    if (audioElement.value) {
      audioElement.value.play();
    } else if (youtubePlayer.value) {
      // Resume YouTube player
      playbackState.value = 'playing';
    }
  };
  
  const pause = () => {
    if (audioElement.value) {
      audioElement.value.pause();
    } else if (youtubePlayer.value) {
      // Pause YouTube player
      playbackState.value = 'paused';
    }
  };
  
  const stop = () => {
    if (audioElement.value) {
      audioElement.value.pause();
      audioElement.value.currentTime = 0;
    } else if (youtubePlayer.value) {
      // Stop YouTube player
      playbackState.value = 'stopped';
      currentTime.value = 0;
      clearInterval(youtubePlayer.value.intervalId);
    }
    
    playbackState.value = 'stopped';
  };
  
  const seek = (time: number) => {
    if (audioElement.value) {
      audioElement.value.currentTime = time;
    } else if (youtubePlayer.value) {
      // Seek in YouTube player
      currentTime.value = time;
    }
  };
  
  const setVolume = (newVolume: number) => {
    volume.value = newVolume;
    
    if (audioElement.value) {
      audioElement.value.volume = newVolume;
    }
    
    // Also update YouTube player volume when implemented
  };
  
  const toggleMute = () => {
    muted.value = !muted.value;
    
    if (audioElement.value) {
      audioElement.value.muted = muted.value;
    }
    
    // Also update YouTube player mute when implemented
  };
  
  const next = () => {
    if (repeatMode.value === 'one') {
      // Replay the same song
      seek(0);
      play();
      return;
    }
    
    if (queue.value.length > 0) {
      const nextSong = queue.value.shift();
      if (nextSong) {
        playSong(nextSong);
      }
    } else if (repeatMode.value === 'all' && history.value.length > 0) {
      // Play the history again
      const historyCopy = [...history.value];
      queue.value = historyCopy.reverse();
      history.value = [];
      next();
    } else {
      stop();
    }
  };
  
  const previous = () => {
    // If we're more than 3 seconds into the song, restart it
    if (currentTime.value > 3) {
      seek(0);
      return;
    }
    
    // Otherwise, go to the previous song
    if (history.value.length > 0) {
      const prevSong = history.value.shift();
      if (prevSong) {
        // Add current song to front of queue
        if (currentSong.value) {
          queue.value.unshift(currentSong.value);
        }
        playSong(prevSong);
      }
    }
  };
  
  const toggleLyrics = () => {
    lyricsVisible.value = !lyricsVisible.value;
  };
  
  const toggleTranslation = () => {
    translationVisible.value = !translationVisible.value;
    lyricsOptions.value.showTranslation = translationVisible.value;
  };
  
  const setLyricsDisplayMode = (mode: 'scroll' | 'karaoke') => {
    displayMode.value = mode;
    lyricsOptions.value.displayMode = mode;
  };
  
  const addToQueue = (song: Song) => {
    queue.value.push(song);
  };
  
  const removeFromQueue = (index: number) => {
    if (index >= 0 && index < queue.value.length) {
      queue.value.splice(index, 1);
    }
  };
  
  const clearQueue = () => {
    queue.value = [];
  };
  
  const toggleRepeat = () => {
    const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode.value);
    const nextIndex = (currentIndex + 1) % modes.length;
    repeatMode.value = modes[nextIndex];
  };
  
  const toggleShuffle = () => {
    shuffleMode.value = !shuffleMode.value;
    
    if (shuffleMode.value && queue.value.length > 1) {
      // Shuffle the queue
      for (let i = queue.value.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue.value[i], queue.value[j]] = [queue.value[j], queue.value[i]];
      }
    }
  };
  
  const fetchLyrics = async (songId: string) => {
    try {
      // In a real implementation, this would call your API
      // For this example, we'll simulate API calls
      
      // Fetch lyrics
      const lyricsResponse = await axios.get(`/api/songs/${songId}/text-contents?type=LYRICS`);
      const lyrics = lyricsResponse.data[0] || null;
      currentLyrics.value = lyrics;
      
      // Fetch translation
      const translationResponse = await axios.get(`/api/songs/${songId}/text-contents?type=TRANSLATION`);
      const translation = translationResponse.data[0] || null;
      currentTranslation.value = translation;
    } catch (error) {
      console.error('Error fetching lyrics:', error);
      currentLyrics.value = null;
      currentTranslation.value = null;
    }
  };
  
  const fetchWaveformData = async (songId: string) => {
    try {
      // In a real implementation, this would call your API
      // For this example, we'll simulate API calls
      const response = await axios.get(`/api/songs/${songId}/waveform`);
      waveformData.value = response.data.peaks || null;
    } catch (error) {
      console.error('Error fetching waveform data:', error);
      waveformData.value = null;
    }
  };
  
  const fetchAudioAnalysis = async (songId: string) => {
    try {
      // In a real implementation, this would call your API
      // For this example, we'll simulate API calls
      const response = await axios.get(`/api/songs/${songId}/audio-analysis`);
      audioAnalysis.value = response.data;
    } catch (error) {
      console.error('Error fetching audio analysis:', error);
      audioAnalysis.value = null;
    }
  };
  
  // Helper functions
  const extractYoutubeId = (url: string): string => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : '';
  };
  
  return {
    // State
    currentSong,
    currentLyrics,
    currentTranslation,
    audioElement,
    youtubePlayer,
    playbackState,
    currentTime,
    duration,
    volume,
    muted,
    lyricsVisible,
    translationVisible,
    displayMode,
    lyricsOptions,
    queue,
    history,
    repeatMode,
    shuffleMode,
    waveformData,
    audioAnalysis,
    
    // Getters
    isPlaying,
    progress,
    formattedCurrentTime,
    formattedDuration,
    parsedLyrics,
    parsedTranslation,
    currentLyricLine,
    currentTranslationLine,
    nextInQueue,
    
    // Actions
    playSong,
    playYouTube,
    togglePlay,
    pause,
    stop,
    seek,
    setVolume,
    toggleMute,
    next,
    previous,
    toggleLyrics,
    toggleTranslation,
    setLyricsDisplayMode,
    addToQueue,
    removeFromQueue,
    clearQueue,
    toggleRepeat,
    toggleShuffle,
    fetchLyrics,
    fetchWaveformData,
    fetchAudioAnalysis
  };
});