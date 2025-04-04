from app import db

# Association table for many-to-many relationship between Song and TextContent
song_text_association = db.Table(
    'song_text_association',
    db.Column('song_id', db.Integer, db.ForeignKey('songs.id')),
    db.Column('text_content_id', db.Integer, db.ForeignKey('text_contents.id'))
)

# Association table for many-to-many relationship between Song and AudioSource
song_audio_association = db.Table(
    'song_audio_association',
    db.Column('song_id', db.Integer, db.ForeignKey('songs.id')),
    db.Column('audio_source_id', db.Integer, db.ForeignKey('audio_sources.id'))
)

class Song(db.Model):
    """
    Represents a song in the database
    """
    __tablename__ = 'songs'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    artist = db.Column(db.String, nullable=False)
    
    # Relationships
    text_contents = db.relationship("TextContent", secondary=song_text_association, backref=db.backref("songs", lazy="dynamic"))
    audio_sources = db.relationship("AudioSource", secondary=song_audio_association, backref=db.backref("songs", lazy="dynamic"))
    
    def __repr__(self):
        return f"<Song(title='{self.title}', artist='{self.artist}')>"


class TextContent(db.Model):
    """
    Represents text content associated with a song (lyrics, translation, transcription, etc.)
    """
    __tablename__ = 'text_contents'
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)  # The actual text content
    content_type = db.Column(db.String, nullable=False)  # E.g., "lyrics", "translation", "transcription"
    language = db.Column(db.String)  # Language code (e.g., "en", "pl")
    
    # Relationship with WordTimestamp defined in that class
    
    def __repr__(self):
        return f"<TextContent(type='{self.content_type}', language='{self.language}')>"


class AudioSource(db.Model):
    """
    Represents an audio source for a song (YouTube link, local file, etc.)
    """
    __tablename__ = 'audio_sources'
    
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String, nullable=False)  # URL or path to the audio
    source_type = db.Column(db.String, nullable=False)  # E.g., "youtube", "mp3"
    
    def __repr__(self):
        return f"<AudioSource(type='{self.source_type}', url='{self.url}')>"


class WordTimestamp(db.Model):
    """
    Maps words to timestamps in the audio
    """
    __tablename__ = 'word_timestamps'
    
    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String, nullable=False)
    start_time = db.Column(db.Float, nullable=False)  # Start time in seconds
    end_time = db.Column(db.Float, nullable=False)    # End time in seconds
    text_content_id = db.Column(db.Integer, db.ForeignKey('text_contents.id'))
    
    # Relationships
    text_content = db.relationship("TextContent", backref=db.backref("timestamps", lazy="dynamic"))
    
    def __repr__(self):
        return f"<WordTimestamp(word='{self.word}', start_time={self.start_time}, end_time={self.end_time})>"


