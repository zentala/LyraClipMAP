<?xml version="1.0" encoding="UTF-8"?>
<UIComponent id="floating_player_v2">
  <Name>Immersive Floating Music Player</Name>
  <Description>
    Redesigned immersive music player with waveform, karaoke lyrics, translation toggle, dynamic colors and mini visualizer.
  </Description>

  <Design>
    <FloatingContainer
      position="bottom"
      width="100%"
      elevation="3"
      padding="16px 24px"
      borderRadius="top"
      backgroundGradient="linear-gradient(to right, #2c003e, #000000)">

      <Row align="center" spacing="20px">
        <!-- Album Art -->
        <Thumbnail src="song.thumbnailUrl" size="large" borderRadius="lg" shadow="true" />

        <!-- Song Info and Karaoke Line -->
        <Column grow="1" spacing="6px">
          <Text fontSize="subtitle-1" fontWeight="bold" color="#FFFFFF">{{ song.title }}</Text>
          <Text fontSize="caption" color="#AAAAAA">{{ song.artist }}</Text>
          
          <!-- Karaoke Line -->
          <SynchronizedLyricLine animated="true" transition="glow">
            <Word repeat="currentLyricWords.length" class="karaoke-word" highlight="isHighlighted(wordIndex)">
              {{ word.text }}
            </Word>
          </SynchronizedLyricLine>

          <!-- Translated Line -->
          <Text fontSize="caption" fontStyle="italic" color="#888888" condition="showTranslation">
            {{ translatedLine }}
          </Text>
        </Column>

        <!-- Waveform Progress -->
        <Column width="240px">
          <WaveformBar peaks="song.waveformPeaks" progress="progress" duration="duration" color="accent" height="40px" />
          <Text fontSize="caption" color="#BBBBBB" textAlign="center">
            {{ formatTime(progress) }} / {{ formatTime(duration) }}
          </Text>
        </Column>

        <!-- Playback Controls -->
        <PlaybackControls>
          <IconButton icon="skip-previous" action="previousSong" />
          <IconButton icon="play-pause" action="togglePlay" primary="true" />
          <IconButton icon="skip-next" action="nextSong" />
        </PlaybackControls>

        <!-- Mini Visualizer -->
        <AudioVisualizer type="ring" color="#BB86FC" size="32px" />

        <!-- Extra Toggles -->
        <ToggleGroup>
          <ToggleButton icon="text" tooltip="Toggle Lyrics View" />
          <ToggleButton icon="translate" tooltip="Toggle Translation" />
          <ToggleButton icon="fullscreen" tooltip="Expand Player" />
        </ToggleGroup>
      </Row>
    </FloatingContainer>
  </Design>
</UIComponent>
