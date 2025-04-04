from flask import render_template, request, redirect, url_for, abort, flash
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
        
        # Extract YouTube info with enhanced data
        yt_info = extract_youtube_info(youtube_url)
        video_id = yt_info['video_id']
        
        # If title/artist not provided, try to use extracted info from YouTube
        if not title and 'song_title' in yt_info:
            title = yt_info['song_title']
        elif not title and 'title' in yt_info:
            title = yt_info['title']
            
        if not artist and 'artist' in yt_info:
            artist = yt_info['artist']
        elif not artist and 'channel_name' in yt_info:
            artist = yt_info['channel_name']
        
        # Default values if we still don't have title/artist
        title = title or "Unknown Title"
        artist = artist or "Unknown Artist"
        
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
        
@app.route('/edit/<int:song_id>', methods=['GET', 'POST'])
def edit_song(song_id):
    """Edit an existing song"""
    song = Song.query.get_or_404(song_id)
    
    if request.method == 'GET':
        # Get lyrics if available
        lyrics = ""
        for text in song.text_contents:
            if text.content_type == "lyrics":
                lyrics = text.content
                break
                
        # Get YouTube URL if available
        youtube_url = ""
        for source in song.audio_sources:
            if source.source_type == "youtube":
                youtube_url = source.url
                break
                
        return render_template('edit_song.html', song=song, lyrics=lyrics, youtube_url=youtube_url)
    
    try:
        # Update song data
        song.title = request.form.get('title', song.title)
        song.artist = request.form.get('artist', song.artist)
        
        # Update lyrics if provided
        new_lyrics = request.form.get('lyrics')
        if new_lyrics:
            # Check if lyrics already exist
            lyrics_exists = False
            for text in song.text_contents:
                if text.content_type == "lyrics":
                    text.content = new_lyrics
                    lyrics_exists = True
                    break
            
            # If no lyrics exist, create new
            if not lyrics_exists:
                lyrics_content = TextContent(
                    content=new_lyrics,
                    content_type="lyrics",
                    language="unknown"
                )
                song.text_contents.append(lyrics_content)
        
        # Update YouTube URL if provided
        new_youtube_url = request.form.get('youtube_url')
        if new_youtube_url:
            # Validate and process the URL
            try:
                yt_info = extract_youtube_info(new_youtube_url)
                
                # Check if YouTube source already exists
                yt_exists = False
                for source in song.audio_sources:
                    if source.source_type == "youtube":
                        source.url = new_youtube_url
                        yt_exists = True
                        break
                
                # If no YouTube source exists, create new
                if not yt_exists:
                    audio_source = AudioSource(
                        url=new_youtube_url,
                        source_type="youtube"
                    )
                    song.audio_sources.append(audio_source)
            except:
                # Invalid YouTube URL - ignore this update
                pass
        
        # Save changes
        db.session.commit()
        return redirect(url_for('view_song', song_id=song.id))
        
    except Exception as e:
        return str(e), 400

@app.route('/delete/<int:song_id>', methods=['POST'])
def delete_song(song_id):
    """Delete a song"""
    song = Song.query.get_or_404(song_id)
    
    try:
        db.session.delete(song)
        db.session.commit()
        return redirect(url_for('home'))
    except Exception as e:
        return str(e), 400
        
# Material Design UI Routes - Demo
@app.route('/material')
def material_home():
    """Home page with Material Design UI"""
    songs = Song.query.order_by(desc(Song.id)).all()
    return render_template('material_index.html', songs=songs)
    
@app.route('/material/song/<int:song_id>')
def material_view_song(song_id):
    """View a specific song with Material Design UI"""
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
    
    return render_template('material_song_detail.html', song=song, youtube_embed=youtube_embed)

@app.route('/material/add', methods=['GET', 'POST'])
def material_add_song():
    """Add new song page with Material Design UI"""
    if request.method == 'GET':
        return render_template('material_add_song.html')
    elif request.method == 'POST':
        # This is for AJAX preview requests
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            try:
                youtube_url = request.json.get('youtube_url')
                if not youtube_url:
                    return {"error": "No URL provided"}, 400
                
                # Extract info from YouTube
                video_info = extract_youtube_info(youtube_url)
                
                # Return the info as JSON
                return {
                    "success": True,
                    "video_id": video_info.get('video_id'),
                    "title": video_info.get('title'),
                    "song_title": video_info.get('song_title'),
                    "artist": video_info.get('artist'),
                    "thumbnail": video_info.get('thumbnail'),
                    "channel_name": video_info.get('channel_name'),
                    "description": video_info.get('description')
                }
            except Exception as e:
                return {"error": str(e)}, 400
        else:
            # Process normal form submission - use the regular add_song route
            return add_song()
