# LyraClipMAP

> **Your music map – with lyrics, emotion, and control.**

## 📦 Overview
**LyraClipMAP** is an intelligent app for working with music and lyrics. It allows you to:

- Search songs by text fragments (even if you don't know the title)
- See the structure of a track as a visual map
- Synchronize lyrics with audio and highlight emotional moments
- Clip and tag audio segments for later playback or sharing
- Create collections and storyboards from chosen parts of songs

## 🎯 Core Features (MVP)

1. **🔍 Lyrics Search**  
   – Find songs by words, lines, or emotional themes.

2. **📈 Visual Track Map (ClipMAP)**  
   – Shows loudness, tempo, mood, and lyrics over time.

3. **✂️ Clipping and Tagging**  
   – Mark segments, name them, add notes or color tags.

4. **🎶 Audio-Lyrics Sync**  
   – Karaoke-style sync, automatic or manual.

5. **📁 Clip Collections & Playlists**  
   – Build emotional stories from your favorite parts.

6. **📤 Export / Share**  
   – Share clips and maps with others.

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Installation & Running

**Method 1: Using Python directly**
```bash
# 1. Clone the repository
git clone https://github.com/zentala/LyraClipMAP.git
cd LyraClipMAP

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the application
PYTHONPATH=/path/to/LyraClipMAP python3 app/main.py

# 4. Open your browser and navigate to http://localhost:8000
```

**Method 2: Using virtual environment (recommended)**
```bash
# 1. Clone the repository
git clone https://github.com/zentala/LyraClipMAP.git
cd LyraClipMAP

# 2. Create and activate virtual environment
# On Ubuntu/Debian, you may need to install: sudo apt install python3-venv
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the application
python -m app.main

# 5. Open your browser and navigate to http://localhost:8000
```

## 🧰 Current Functionality

- Add songs with YouTube URLs (e.g., https://www.youtube.com/watch?v=PR_eYLKPmko)
- Auto-fetch lyrics from tekstowo.pl
- Search through lyrics, song titles, and artists
- View songs with embedded YouTube players

## 📊 Database Structure

- **Songs**: Titles and artists
- **Text Content**: Lyrics, translations (with language tags)
- **Audio Sources**: YouTube links (expandable to other sources)
- **Word Timestamps**: For future word-level synchronization

## 🖼️ User Flow

1. **Home**
   - 🔍 Search bar
   - 🎧 Recently played
   - 📂 User collections

2. **Track View**
   - 🧠 Audio map with lyrics, waveform, emotion colors
   - 🎤 Synced lyrics display
   - ✂️ Clipping tool

3. **Clip Editor**
   - Title, tags, color, note
   - 🎚️ Length & cut options
   - ⏳ Time markers and mood labels

4. **Collection / Storyboard**
   - 📋 Clip list with descriptions
   - ▶️ Play montage mode
   - 📤 Export options

## 🌱 Future Development

- Word-to-timestamp mapping using auto-transcription
- Support for more lyrics sources
- Better YouTube title parsing
- Multiple audio source types
- AI-powered tagging of emotion and lyrical themes
- Community: shared clips and collaborative maps
- Compare versions: covers, remixes, and live edits
- Export to TikTok / Instagram / Reels
- Expand to podcasts and spoken word content

## 📝 License
[MIT](LICENSE)

## 📧 Contact
Your Name – [@yourhandle](https://twitter.com/yourhandle) – your.email@example.com

Project Link: [https://github.com/zentala/LyraClipMAP](https://github.com/zentala/LyraClipMAP)