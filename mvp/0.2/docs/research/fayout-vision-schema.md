Super. Stworzę teraz wspólny szkielet playera — zestaw bazowych komponentów UI (waveform, karaoke PL/ENG, metadane, progres, glow, animacje), który będzie można wbudować we wszystkie wizje jak Mood, Parallax, Presenter itd.

Zaraz to przygotuję jako nową kanwę, gotową do rozwijania poszczególnych wariantów.

# Unified Fullscreen Music Lyrics Player UI Layout Schema

## Overview and Key Components
This XML schema represents a **common base layout** for a fullscreen music lyrics playback UI. It is designed to be modular and extensible, serving as the foundation for various themes or modes (e.g. mood-based visuals, duet mode, tooltips, presenter view). The layout includes all essential components for a karaoke-style lyrics experience in fullscreen, such as: 

- **Central Lyric Line (Primary Language):** The current lyric line in the song’s original language, displayed prominently in a large font.  
- **Translated Sub-Caption:** The current lyric translated (if available) in a smaller, all-caps font, shown below the main line.  
- **Contextual Previous/Next Lines:** The lines immediately before and after the current lyric, displayed in a dimmed style for context.  
- **Song Title and Artist Name:** Displayed on the screen (e.g. at the top or bottom) to identify the track.  
- **Waveform Visualizer (Audio-Only Mode):** An audio waveform bar or visualization that highlights the portion of the song currently playing (used when no music video or canvas is present).  
- **Progress Bar with Time Markers:** A seek bar showing song progress, with tick markers (for lyric timestamps or sections) and labels for elapsed and remaining time.  
- **Ambient Background Layer:** An optional background layer for ambient animations, videos, or visualizations (such as blurred album art or dynamic patterns) behind the lyrics.  
- **Theme Overlay Container:** A dedicated space for additional animated themes or overlays (parallax effects, mood-based color filters, duet indicators, etc.) that can wrap or augment the base layout.

Each section of the UI is defined separately to ensure clarity and reusability. This modular design allows other themes to **extend or wrap** the base layout easily – for example, adding duet-specific elements or presenter notes – without altering the core structure. Below, each section of the XML layout is detailed, followed by the complete XML layout structure.

## Lyrics Display Section (Karaoke Lines)
This section contains the lyrics text elements. It centers on the **current lyric line** in the primary language, flanked by the previous and next lines for context. The current line is styled to be **large and prominent**, while the previous and next lines are **smaller and dimmed** (often semi-transparent or a lighter color) to indicate they are context. Directly below the current line, the **translated lyric** (if available) is shown in a smaller font, typically **all uppercase** to distinguish it from the original text. This translation provides meaning without overshadowing the original lyric. All these text elements are typically center-aligned on the screen. For example, in the XML below, we use a `LyricsContainer` with four text fields: one each for previous, current, translation, and next lines.

## Song Information Section (Title & Artist)
The song’s title and artist are displayed to provide context about the track. This section can be positioned at the top or bottom of the screen. In our base layout, a `SongInfoContainer` holds two text elements: `SongTitle` and `ArtistName`. These are usually styled in a smaller, unobtrusive font (since the focus is on the lyrics) and may be semi-transparent or placed out of the way (for instance, top-center or bottom-left of the screen). This ensures the info is available at a glance without distracting from the singing.

## Waveform Visualizer Section (Optional) 
For audio tracks without an accompanying video or canvas, the UI can display a **waveform visualizer** as a background or footer element. In this layout, a `WaveformVisualizer` component represents the song’s waveform timeline. It highlights the current playback position in sync with the music – for example, the portion of the waveform corresponding to the current lyric might be colored or glowing. This provides a dynamic visual cue of the music’s energy and timing. The waveform element is optional and can be hidden when a music video or other visual content is playing. In the XML, it is included as a distinct element (which could be a custom view drawing the waveform), positioned, for example, just above the progress bar or as a subtle backdrop behind the lyrics.

## Playback Progress and Timing Section
This section contains controls and indicators for song playback progress:
- A **progress bar** (seek bar) that spans across the bottom (or top) of the screen, showing how far along the song is. The progress bar includes **markers** – small tick marks or indicators – that denote specific timings, such as the start of verses or choruses, or timestamps of each lyric line. These markers help users anticipate upcoming lines or sections.
- **Time elapsed and remaining** labels, typically placed at the left and right ends of the progress bar. These update in real-time to show the current play time and the time left in the song.
  
All of these are wrapped in a `ProgressBarContainer` for easy management. The user can potentially interact with the progress bar to seek through the song. The markers on the bar align with lyric timings, which is useful in a karaoke context (some implementations even allow clicking lyrics to jump to that time, syncing the progress bar accordingly). The XML snippet will show a `ProgressBar` element with child markers and two text elements for the time displays.

## Ambient Background Layer
To enhance the visual experience, a `BackgroundLayer` is defined for ambient visuals. This could hold a static blurred album cover, a looping video, or an abstract animation that **reacts to the music’s mood**. It sits behind all text and UI elements. By isolating the background in its own container, we can easily swap in different background effects or disable it for clarity. For instance, a theme might insert a dynamic color-changing animation or a video wallpaper in this layer. In the XML, `BackgroundLayer` (or `AmbientBackground`) would be the first element (so it’s rendered at the back), and might contain an image or a video element as a child.

## Theme Overlay Container
At the top of the stacking order, the layout provides a `ThemeOverlay` container. This is initially empty in the base schema, but it exists for **themes or modes to inject additional UI elements** on top of the base display. Because it’s layered above everything, it’s ideal for effects like **parallax overlays**, where graphical elements move over the lyrics, or for **mood filters** (e.g. a semi-transparent tint for a sad song), or interactive overlays like tooltips on certain lines. In a duet theme, this overlay layer could display indicators for which singer’s turn it is, or even split the screen with additional graphics. The overlay container ensures that adding these elements doesn’t require modifying the base structure – the theme simply adds children to `ThemeOverlay` or adjusts its properties.

## Modular Extensibility for Themes
This base layout is intentionally designed to be **wrapped or extended**. Other themes can reuse it by including this XML structure and then building on it:
- **Wrapping:** A theme can wrap the entire base in an additional layout or background. For example, a “duet” theme might wrap the base layout in a split-screen container to position two lyric columns side by side.
- **Extending:** A theme can add or modify elements via the defined containers. Because each section (lyrics, info, background, overlay, etc.) has a clear ID and structure, a theme can target them. For instance, Apple’s karaoke feature (Apple Music Sing) supports multiple lyric views without a complete redesign – it can show duet lyrics on opposite sides of the screen using the same underlying layout ([Apple introduces Apple Music Sing - Apple](https://www.apple.com/newsroom/2022/12/apple-introduces-apple-music-sing/#:~:text=vocals%5E%7B1%7D%20and%20real,for%20anyone%20to%20participate%2C%20however)) ([Apple introduces Apple Music Sing - Apple](https://www.apple.com/newsroom/2022/12/apple-introduces-apple-music-sing/#:~:text=,easy%20to%20sing%20along%20to)). In our case, a duet theme could utilize two instances of the Lyrics Display section (or two sets of text fields within it) and leverage the `ThemeOverlay` or additional styling to align one singer’s lyrics left and the other’s right ([Apple introduces Apple Music Sing - Apple](https://www.apple.com/newsroom/2022/12/apple-introduces-apple-music-sing/#:~:text=,easy%20to%20sing%20along%20to)). Similarly, a “presenter” theme might add a small overlay above the lyrics (via `ThemeOverlay`) with contextual info or cues, and a “mood” theme might replace the `BackgroundLayer` content with more vivid visuals.

By keeping the base XML organized and each functional group separated, we make it easy to replace or augment parts of the UI. Now, here is the **complete XML layout structure** incorporating all the above sections:

```xml
<FullscreenLyricsLayout xmlns:android="http://schemas.android.com/apk/res/android"
                        android:id="@+id/fullscreen_player"
                        android:layout_width="match_parent"
                        android:layout_height="match_parent"
                        android:orientation="vertical"
                        android:background="@android:color/black">
    <!-- Background/Ambient Visual Layer -->
    <FrameLayout android:id="@+id/backgroundLayer"
                 android:layout_width="match_parent"
                 android:layout_height="match_parent"
                 android:layout_gravity="center">
        <!-- Example background content: could be an ImageView or VideoView for album art or animations -->
        <ImageView android:id="@+id/bgImage"
                   android:layout_width="match_parent"
                   android:layout_height="match_parent"
                   android:scaleType="centerCrop"
                   android:visibility="visible"
                   android:src="@drawable/album_art_blur" />
        <!-- Additional animated visuals can be added here by themes (e.g., particle effects, videos) -->
    </FrameLayout>

    <!-- Main Lyrics Display Container (central area) -->
    <LinearLayout android:id="@+id/lyricsContainer"
                  android:layout_width="match_parent"
                  android:layout_height="wrap_content"
                  android:orientation="vertical"
                  android:gravity="center"
                  android:layout_gravity="center">
        <!-- Previous line (dimmed context) -->
        <TextView android:id="@+id/lyricPrevious"
                  android:layout_width="wrap_content"
                  android:layout_height="wrap_content"
                  android:text="...previous lyric line..."
                  android:textSize="18sp"
                  android:textColor="#80FFFFFF" <!-- semi-transparent white -->
                  android:gravity="center"
                  android:padding="8dp"/>
        <!-- Current lyric line (primary language, prominent) -->
        <TextView android:id="@+id/lyricCurrent"
                  android:layout_width="wrap_content"
                  android:layout_height="wrap_content"
                  android:text="...current lyric line..."
                  android:textSize="32sp"
                  android:textColor="#FFFFFFFF" <!-- solid white -->
                  android:textStyle="bold"
                  android:gravity="center"
                  android:padding="8dp"/>
        <!-- Translated sub-caption (smaller, all caps) -->
        <TextView android:id="@+id/lyricTranslation"
                  android:layout_width="wrap_content"
                  android:layout_height="wrap_content"
                  android:text="...TRANSLATED LYRIC LINE..."
                  android:textAllCaps="true"
                  android:textSize="16sp"
                  android:textColor="#CCFFFFFF" <!-- slightly translucent white -->
                  android:gravity="center"
                  android:padding="4dp"/>
        <!-- Next line (dimmed context) -->
        <TextView android:id="@+id/lyricNext"
                  android:layout_width="wrap_content"
                  android:layout_height="wrap_content"
                  android:text="...next lyric line..."
                  android:textSize="18sp"
                  android:textColor="#80FFFFFF"
                  android:gravity="center"
                  android:padding="8dp"/>
    </LinearLayout>

    <!-- Song Info Section (title and artist) -->
    <LinearLayout android:id="@+id/songInfoContainer"
                  android:layout_width="match_parent"
                  android:layout_height="wrap_content"
                  android:orientation="vertical"
                  android:padding="16dp"
                  android:layout_gravity="top|center_horizontal"
                  android:gravity="center_horizontal">
        <TextView android:id="@+id/songTitle"
                  android:layout_width="wrap_content"
                  android:layout_height="wrap_content"
                  android:text="Song Title"
                  android:textSize="14sp"
                  android:textColor="#CCFFFFFF"
                  android:gravity="center"/>
        <TextView android:id="@+id/artistName"
                  android:layout_width="wrap_content"
                  android:layout_height="wrap_content"
                  android:text="Artist Name"
                  android:textSize="14sp"
                  android:textColor="#80FFFFFF"
                  android:gravity="center"/>
    </LinearLayout>

    <!-- Waveform Visualizer (shown if no video is present) -->
    <View android:id="@+id/waveformVisualizer"
          android:layout_width="match_parent"
          android:layout_height="48dp"
          android:layout_marginTop="16dp"
          android:layout_marginBottom="8dp"
          android:visibility="gone" <!-- set to visible when active -->
          android:contentDescription="Audio Waveform Visualization">
        <!-- This could be a custom view that draws the waveform and highlight -->
    </View>

    <!-- Playback Progress Bar and Time Indicators -->
    <LinearLayout android:id="@+id/progressBarContainer"
                  android:layout_width="match_parent"
                  android:layout_height="wrap_content"
                  android:orientation="horizontal"
                  android:padding="16dp"
                  android:layout_gravity="bottom"
                  android:gravity="center_vertical">
        <!-- Elapsed time label -->
        <TextView android:id="@+id/timeElapsed"
                  android:layout_width="wrap_content"
                  android:layout_height="wrap_content"
                  android:text="0:00"
                  android:textSize="12sp"
                  android:textColor="#CCFFFFFF"
                  android:paddingEnd="8dp"/>
        <!-- Progress bar with markers -->
        <FrameLayout android:id="@+id/progressBar"
                     android:layout_width="0dp"
                     android:layout_height="4dp"
                     android:layout_weight="1"
                     android:background="#FFFFFFFF">
            <!-- Example markers as small vertical lines along the progress bar -->
            <View android:layout_width="2dp"
                  android:layout_height="8dp"
                  android:layout_gravity="left"
                  android:layout_marginStart="25%"  <!-- marker at 25% of song -->
                  android:background="#FFFF00" />   <!-- yellow marker -->
            <View android:layout_width="2dp"
                  android:layout_height="8dp"
                  android:layout_gravity="left"
                  android:layout_marginStart="50%"  <!-- marker at 50% (mid) -->
                  android:background="#FFFF00" />
            <View android:layout_width="2dp"
                  android:layout_height="8dp"
                  android:layout_gravity="left"
                  android:layout_marginStart="75%"  <!-- marker at 75% -->
                  android:background="#FFFF00" />
            <!-- (Markers could also be drawn by a custom progress bar view instead of manual Views) -->
        </FrameLayout>
        <!-- Remaining time label -->
        <TextView android:id="@+id/timeRemaining"
                  android:layout_width="wrap_content"
                  android:layout_height="wrap_content"
                  android:text="-3:45"
                  android:textSize="12sp"
                  android:textColor="#CCFFFFFF"
                  android:paddingStart="8dp"/>
    </LinearLayout>

    <!-- Theme Overlay Layer (for additional overlays/behaviors by themes) -->
    <FrameLayout android:id="@+id/themeOverlay"
                 android:layout_width="match_parent"
                 android:layout_height="match_parent"
                 android:layout_gravity="center">
        <!-- Theme-specific elements can be dynamically added here. 
             E.g., duet indicators, extra graphics, tooltip popups, etc. -->
    </FrameLayout>
</FullscreenLyricsLayout>
```

In this XML schema, each section is clearly separated and labeled (via IDs and comments) to facilitate reuse and extension:
- The **BackgroundLayer** is the base for any visual backdrop.
- The **lyricsContainer** holds all lyric lines (previous, current, translation, next).
- The **songInfoContainer** groups the title and artist.
- The **waveformVisualizer** provides an optional audio-reactive visual.
- The **progressBarContainer** bundles the progress bar and timing.
- The **themeOverlay** is an empty top layer for future enhancements.

A theme designer can take this base layout and **modify or augment** it: for example, replacing `bgImage` in `backgroundLayer` with a video, or adding styled text bubbles into `themeOverlay` for a sing-along guide. The goal is that all fullscreen lyric visualizations share this common skeleton, ensuring consistency while allowing rich, theme-specific customization on top of it. ([Apple introduces Apple Music Sing - Apple](https://www.apple.com/newsroom/2022/12/apple-introduces-apple-music-sing/#:~:text=vocals%5E%7B1%7D%20and%20real,for%20anyone%20to%20participate%2C%20however)) ([Apple introduces Apple Music Sing - Apple](https://www.apple.com/newsroom/2022/12/apple-introduces-apple-music-sing/#:~:text=,easy%20to%20sing%20along%20to))

