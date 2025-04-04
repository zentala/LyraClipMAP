# LyraClipMAP Ubiquitous Language

This document defines the ubiquitous language for the LyraClipMAP project, providing a consistent terminology that bridges business and technical domains. These terms and concepts are used consistently throughout documentation, codebase, UI, and team communications to ensure a shared understanding.

## Core Concepts

### Song
A musical composition, the central entity in our system. A song has metadata such as title, artist, and duration, and can be associated with multiple types of content (lyrics, translations) and audio sources.

**Context:** A Song exists as a metadata entity even if it has no attached audio or lyrics yet - it's the central organizing entity.

**Example Usage:** "The user added a new Song from YouTube," "The Library contains 500 Songs."

### Artist
The creator or performer of songs. Artists have a name and may have additional metadata like biography or image.

**Context:** Artists can have multiple songs in the system, and we track them as separate entities for organization.

**Example Usage:** "Songs are categorized by Artist," "The user can browse their library by Artist."

### TextContent
A text associated with a song, which can be of different types (lyrics, translation, transcription, etc.) in a specific language.

**Context:** A single song can have multiple TextContent items (original lyrics, translations to different languages, transcriptions for spoken content).

**Example Usage:** "The system automatically fetches the TextContent when adding a song," "The user can edit the TextContent to correct lyrics."

### AudioSource
A source for playing the song's audio, which can come from different platforms (YouTube, Spotify, local file, etc.)

**Context:** A song can have multiple AudioSources - e.g., both a YouTube link and a local MP3 file.

**Example Usage:** "The player can switch between different AudioSources for the same song," "The system extracts metadata from the AudioSource."

### Lyrics
The textual representation of the words in a song, a specific type of TextContent.

**Context:** Lyrics are central to the app's functionality, and can exist in synchronized or unsynchronized form.

**Example Usage:** "The app displays Lyrics while playing the song," "The user can search Songs by Lyrics."

### Synchronized Lyrics
Lyrics with timing information that allows them to be displayed in sync with the audio playback.

**Context:** Synchronized Lyrics enable karaoke-style display and are created through the LRC Editor.

**Example Usage:** "The Synchronized Lyrics highlight each line as it's being sung," "The user created Synchronized Lyrics using the editor."

### LRC Format
A file format for storing synchronized lyrics with timestamps for each line.

**Context:** LRC is the standard format we use for storing and exchanging synchronized lyrics.

**Example Usage:** "The system can import and export in LRC Format," "The editor generates an LRC Format file."

### WordTimestamp
A timestamp associated with a specific word in the lyrics, enabling word-by-word synchronization.

**Context:** WordTimestamps provide more granular synchronization than line-based timestamps.

**Example Usage:** "Advanced karaoke mode uses WordTimestamps to highlight each word," "The editor can generate WordTimestamps automatically or manually."

### Playlist
A user-created collection of songs arranged in a specific order.

**Context:** Playlists are user-organization tools that can be public or private.

**Example Usage:** "The user added the song to their 'Workout' Playlist," "The system suggests songs for Playlists based on similarity."

## UI Components

### WavePlayer
A component that displays an audio waveform visualization and provides playback controls.

**Context:** The WavePlayer is used for visualizing audio and synchronized lyrics.

**Example Usage:** "The WavePlayer shows audio intensity throughout the song," "The user can click on the WavePlayer to seek to a specific position."

### LyricsDisplay
A component that shows lyrics in various modes (scroll, karaoke) with optional translation display.

**Context:** The LyricsDisplay is the main way users interact with synchronized lyrics.

**Example Usage:** "The LyricsDisplay follows along with the current playback position," "The user toggled the LyricsDisplay to karaoke mode."

### SongCard
A UI component that displays a song's thumbnail, title, artist, and action buttons.

**Context:** SongCards are used throughout the interface to represent songs in lists and grids.

**Example Usage:** "The home screen displays recently added songs as SongCards," "The user can play a song directly from its SongCard."

## Feature Concepts

### Lyrics Synchronization
The process of adding timing information to lyrics to align them with audio playback.

**Context:** Lyrics Synchronization is a key feature of the application, enabling karaoke-style lyric display.

**Example Usage:** "The editor provides tools for manual Lyrics Synchronization," "The system attempts automatic Lyrics Synchronization based on audio analysis."

### Auto-Synchronization
The automatic generation of synchronized lyrics using audio analysis and natural language processing.

**Context:** Auto-Synchronization is an advanced feature that tries to save users time.

**Example Usage:** "Auto-Synchronization works best with clear vocals," "The system offers different methods of Auto-Synchronization."

### Lyrics Search
The ability to search for songs based on their lyric content.

**Context:** Lyrics Search is a key discovery feature of the application.

**Example Usage:** "Lyrics Search allows finding songs containing specific phrases," "The search engine indexes all TextContent for Lyrics Search."

### Multi-Source Integration
The ability to integrate content from multiple external platforms (YouTube, Spotify, etc.)

**Context:** Multi-Source Integration allows users to use their preferred platforms.

**Example Usage:** "Multi-Source Integration lets users add songs from various services," "The player handles Multi-Source Integration seamlessly."

### Karaoke Mode
A display mode where lyrics are highlighted in sync with the music for sing-along purposes.

**Context:** Karaoke Mode is a primary user experience feature.

**Example Usage:** "Karaoke Mode highlights each line or word as it's sung," "Users can customize the appearance of Karaoke Mode."

## Technical Concepts

### LRC Editor
The tool within the application for creating and editing synchronized lyrics.

**Context:** The LRC Editor is a key tool for creating the synchronized content.

**Example Usage:** "The LRC Editor allows placing timestamps on each line," "The advanced LRC Editor supports word-level synchronization."

### Waveform
A visual representation of audio amplitude over time.

**Context:** Waveforms help users visualize audio and place timestamps accurately.

**Example Usage:** "The Waveform shows peaks during chorus sections," "Users can see the Waveform to identify specific moments in a song."

### Source Type
The categorization of where audio or content originated from (YouTube, Spotify, local file, etc.)

**Context:** Source Types affect how content is fetched, displayed and processed.

**Example Usage:** "The player behavior changes based on Source Type," "YouTube is the most common Source Type for casual users."

### Content Type
The categorization of textual content (lyrics, translation, transcription, etc.)

**Context:** Content Types distinguish between different textual representations of a song.

**Example Usage:** "The system supports multiple Content Types per song," "Users can toggle between different Content Types."

### Audio Analysis
The process of analyzing audio to extract features like beat timing, intensity, and vocal sections.

**Context:** Audio Analysis enables advanced features like auto-synchronization.

**Example Usage:** "Audio Analysis helps identify chorus sections," "The system performs Audio Analysis in the background after adding a song."

### YouTube Integration
The specific implementation of fetching and playing content from YouTube.

**Context:** YouTube Integration is a primary content source for the application.

**Example Usage:** "YouTube Integration extracts video metadata automatically," "The player uses YouTube Integration to stream audio."

## State Management Concepts

### Player State
The current state of audio playback, including current song, playback position, and user preferences.

**Context:** Player State is managed globally and affects multiple components.

**Example Usage:** "Components react to changes in Player State," "The mini player displays the current Player State."

### Playlist Queue
The ordered list of songs scheduled for playback after the current song.

**Context:** The Playlist Queue determines what plays next and allows users to plan their listening.

**Example Usage:** "The user added three songs to the Playlist Queue," "Songs from a Playlist are added to the Playlist Queue when played."

### Lyrics State
The current state of lyrics display, including position, synchronization status, and display preferences.

**Context:** Lyrics State is synchronized with Player State but has its own properties.

**Example Usage:** "The LyricsDisplay component subscribes to changes in Lyrics State," "User preferences for lyrics are stored in Lyrics State."

## User Interaction Concepts

### Lyrics Navigation
The ability to navigate through a song by clicking on specific lyrics.

**Context:** Lyrics Navigation provides interactive seeking through content.

**Example Usage:** "Users can jump to a specific verse using Lyrics Navigation," "Lyrics Navigation works in both scroll and karaoke modes."

### Audio Source Switching
The ability to change between different audio sources for the same song.

**Context:** Audio Source Switching lets users choose their preferred playback method.

**Example Usage:** "The user performed Audio Source Switching from YouTube to Spotify," "Audio Source Switching maintains playback position."

### Lyrics Editing
The process of modifying lyric content (text or synchronization) within the application.

**Context:** Lyrics Editing allows users to correct or improve content.

**Example Usage:** "The user performed Lyrics Editing to fix a typo," "Lyrics Editing supports both full-text and line-by-line modes."

## Repository & Library Concepts

### Song Library
The user's entire collection of songs in the application.

**Context:** The Song Library is the main content repository for the application.

**Example Usage:** "The user can browse or search their Song Library," "The Song Library supports various organization methods."

### Playlist Collection
The set of all user-created playlists.

**Context:** The Playlist Collection represents user-organized content.

**Example Usage:** "The user can browse their Playlist Collection," "The Playlist Collection appears in the sidebar."

### Recent Songs
Songs that were recently added to the library or played.

**Context:** Recent Songs provide quick access to new or frequently used content.

**Example Usage:** "Recent Songs appear on the dashboard," "The user continued listening from their Recent Songs."

### Popular Songs
Songs that are frequently played or added to playlists.

**Context:** Popular Songs represent user engagement metrics.

**Example Usage:** "The dashboard shows Popular Songs based on play count," "Recommendations include Popular Songs from the library."