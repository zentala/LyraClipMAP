from flask import render_template, request, redirect, url_for, abort
from sqlalchemy import or_, desc
from app import app, db
from app.models.models import Song, TextContent, AudioSource
from app.utils.helpers import (
    extract_youtube_info,
    get_youtube_embed_html,
    search_tekstowo,
    format_song_title,
    format_youtube_title
)

@app.route('/')
def home():
    """Home page with search functionality and song list"""
    songs = Song.query.order_by(desc(Song.id)).all()
    return render_template('index.html', songs=songs)

@app.route('/search', methods=['POST'])
def search():
    """Search for songs by lyrics"""
    query = request.form.get('query', '')
    results = Song.query.join(Song.text_contents).filter(
        or_(
            Song.title.ilike(f"%{query}%"),
            Song.artist.ilike(f"%{query}%"),
            TextContent.content.ilike(f"%{query}%")
        )
    ).distinct().all()
    
    return render_template('search_results.html', results=results, query=query)

@app.route('/song/<int:song_id>')
def view_song(song_id):
    """View a specific song with its lyrics and embedded YouTube player"""
    song = Song.query.get_or_404(song_id)
    
    # Get YouTube embed HTML if available
    youtube_embed = None
    for source in song.audio_sources:
        if source.source_type == "youtube":
            try:
                yt_info = extract_youtube_info(source.url)
                youtube_embed = get_youtube_embed_html(yt_info['video_id'])
                break
            except:
                continue
    
    return render_template('song_detail.html', song=song, youtube_embed=youtube_embed)

@app.route('/add', methods=['GET', 'POST'])
def add_song():
    """Add a new song form and handling"""
    if request.method == 'GET':
        return render_template('add_song.html')
    
    try:
        youtube_url = request.form['youtube_url']
        title = request.form.get('title')
        artist = request.form.get('artist')
        lyrics = request.form.get('lyrics')
        
        # Extract YouTube info
        yt_info = extract_youtube_info(youtube_url)
        video_id = yt_info['video_id']
        
        # If title/artist not provided, try to extract from YouTube title
        if not (title and artist):
            # Here you would normally get the YouTube video title
            # For now, we'll use placeholder logic
            if not title or not artist:
                artist = artist or "Unknown Artist"
                title = title or "Unknown Title"
        
        # Create the song
        song = Song(title=title, artist=artist)
        
        # Add lyrics - try to fetch from tekstowo.pl if not provided
        if not lyrics:
            lyrics = search_tekstowo(artist, title)
        
        if lyrics:
            lyrics_content = TextContent(
                content=lyrics,
                content_type="lyrics",
                language="unknown"
            )
            song.text_contents.append(lyrics_content)
        
        # Add YouTube link
        audio_source = AudioSource(
            url=youtube_url,
            source_type="youtube"
        )
        song.audio_sources.append(audio_source)
        
        # Save to database
        db.session.add(song)
        db.session.commit()
        
        return redirect(url_for('view_song', song_id=song.id))
        
    except Exception as e:
        return str(e), 400
