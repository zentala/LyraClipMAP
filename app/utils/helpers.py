import re
import requests
from urllib.parse import urlparse, parse_qs
from bs4 import BeautifulSoup
from typing import Optional, Dict, Tuple

def extract_youtube_info(url: str) -> Dict[str, str]:
    """
    Extract video ID and other info from YouTube URL
    Returns dict with 'video_id', 'title' (if available)
    """
    # Extract video ID from different YouTube URL formats
    parsed_url = urlparse(url)
    if parsed_url.hostname in ('www.youtube.com', 'youtube.com'):
        if parsed_url.path == '/watch':
            query = parse_qs(parsed_url.query)
            return {'video_id': query['v'][0]}
        elif parsed_url.path.startswith(('/embed/', '/v/')):
            return {'video_id': parsed_url.path.split('/')[2]}
    elif parsed_url.hostname == 'youtu.be':
        return {'video_id': parsed_url.path[1:]}
    
    raise ValueError("Invalid YouTube URL")

def get_youtube_embed_html(video_id: str) -> str:
    """Generate YouTube embed HTML code"""
    return f'''
    <div class="video-container">
        <iframe 
            width="560" 
            height="315" 
            src="https://www.youtube.com/embed/{video_id}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    </div>
    '''

def search_tekstowo(artist: str, title: str) -> Optional[str]:
    """
    Search for lyrics on tekstowo.pl
    Returns lyrics text if found, None otherwise
    """
    # Format search query
    search_query = f"{artist} {title}".replace(" ", "+")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        # Search on Google
        search_url = f"https://www.google.com/search?q=site:tekstowo.pl+{search_query}"
        response = requests.get(search_url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find first tekstowo.pl result
        for link in soup.find_all('a'):
            href = link.get('href')
            if href and 'tekstowo.pl' in href and 'text' in href:
                # Extract actual URL from Google redirect
                tekstowo_url = href.split('&')[0].replace('/url?q=', '')
                
                # Get lyrics page
                lyrics_response = requests.get(tekstowo_url, headers=headers)
                lyrics_soup = BeautifulSoup(lyrics_response.text, 'html.parser')
                
                # Find lyrics text
                lyrics_div = lyrics_soup.find('div', {'class': 'inner-text'})
                if lyrics_div:
                    return lyrics_div.get_text(strip=True)
    except Exception as e:
        print(f"Error searching tekstowo.pl: {e}")
    
    return None

def format_song_title(artist: str, title: str) -> str:
    """Format song title for display"""
    return f"{artist} - {title}"

def format_youtube_title(youtube_title: str) -> Tuple[str, str]:
    """
    Try to extract artist and title from YouTube video title
    Returns tuple of (artist, title)
    """
    # Common patterns for YouTube music titles
    patterns = [
        r'^(.+?)\s*[-–]\s*(.+?)(?:\s*\(.*?\))*$',  # Artist - Title (optional stuff)
        r'^(.+?)\s*"(.+?)"',  # Artist "Title"
        r'^(.+?)\s*:\s*(.+?)$',  # Artist: Title
    ]
    
    for pattern in patterns:
        match = re.match(pattern, youtube_title)
        if match:
            return match.group(1).strip(), match.group(2).strip()
    
    # If no pattern matches, return original as title with unknown artist
    return "Unknown Artist", youtube_title.strip()
