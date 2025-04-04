import re
import requests
from urllib.parse import urlparse, parse_qs
from bs4 import BeautifulSoup
from typing import Optional, Dict, Tuple

def extract_youtube_info(url: str) -> Dict[str, str]:
    """
    Extract video ID and other info from YouTube URL
    Returns dict with video details
    """
    # Extract video ID from different YouTube URL formats
    parsed_url = urlparse(url)
    video_id = None
    
    if parsed_url.hostname in ('www.youtube.com', 'youtube.com'):
        if parsed_url.path == '/watch':
            query = parse_qs(parsed_url.query)
            if 'v' in query:
                video_id = query['v'][0]
                # Remove any additional parameters if present
                if '&' in video_id:
                    video_id = video_id.split('&')[0]
        elif parsed_url.path.startswith(('/embed/', '/v/')):
            video_id = parsed_url.path.split('/')[2]
            # Remove any additional parameters if present
            if '?' in video_id:
                video_id = video_id.split('?')[0]
    elif parsed_url.hostname == 'youtu.be':
        video_id = parsed_url.path[1:]
        # Remove any additional parameters if present
        if '?' in video_id:
            video_id = video_id.split('?')[0]
    
    # Debug output
    print(f"URL: {url}, Parsed video_id: {video_id}")
    
    if not video_id:
        raise ValueError("Invalid YouTube URL")
    
    # Try to use oembed endpoint to get structured data (no API key needed)
    # This is one of the most reliable methods without using the official API
    try:
        oembed_url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        oembed_response = requests.get(oembed_url, headers=headers)
        if oembed_response.status_code == 200:
            oembed_data = oembed_response.json()
            title = oembed_data.get('title')
            channel_name = oembed_data.get('author_name')
            thumbnail = f"https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg"  # High quality thumbnail
            
            # Extract artist and song title using the format_youtube_title function
            artist, song_title = format_youtube_title(title) if title else ("Unknown Artist", "Unknown Title")
            
            # Get description using video info endpoint
            try:
                info_url = f"https://www.youtube.com/get_video_info?video_id={video_id}"
                info_response = requests.get(info_url, headers=headers)
                if info_response.status_code == 200:
                    from urllib.parse import parse_qs
                    info_data = parse_qs(info_response.text)
                    # Extract description if available
                    if 'player_response' in info_data:
                        import json
                        player_response = json.loads(info_data['player_response'][0])
                        video_details = player_response.get('videoDetails', {})
                        description = video_details.get('shortDescription', '')
                    else:
                        description = ""
                else:
                    description = ""
            except:
                description = ""
            
            return {
                'video_id': video_id,
                'title': title,
                'description': description,
                'thumbnail': thumbnail,
                'channel_name': channel_name,
                'artist': artist,
                'song_title': song_title
            }
    
    except Exception as e:
        print(f"Error fetching from oembed: {e}")
    
    # Fallback: Try to scrape the info from the page if oembed fails
    try:
        # Get YouTube page content
        response = requests.get(f"https://www.youtube.com/watch?v={video_id}", headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract title (usually in the title tag)
        title = soup.find('title').text.replace(' - YouTube', '').strip() if soup.find('title') else None
        
        # Extract metadata from meta tags
        meta_tags = soup.find_all('meta')
        description = None
        thumbnail = None
        channel_name = None
        
        for tag in meta_tags:
            if tag.get('property') == 'og:description':
                description = tag.get('content')
            elif tag.get('property') == 'og:image':
                thumbnail = tag.get('content')
            elif tag.get('name') == 'author':
                channel_name = tag.get('content')
        
        # Extract artist and song title using the format_youtube_title function
        artist, song_title = format_youtube_title(title) if title else ("Unknown Artist", "Unknown Title")
        
        # Try to extract channel name from JSON-LD data
        script_tags = soup.find_all('script', {'type': 'application/ld+json'})
        for script in script_tags:
            try:
                import json
                data = json.loads(script.string)
                if isinstance(data, dict) and 'author' in data:
                    if isinstance(data['author'], dict) and 'name' in data['author']:
                        channel_name = data['author']['name']
            except:
                pass
        
        # Return all gathered information
        return {
            'video_id': video_id,
            'title': title,
            'description': description,
            'thumbnail': thumbnail or f"https://i.ytimg.com/vi/{video_id}/mqdefault.jpg",
            'channel_name': channel_name,
            'artist': artist,
            'song_title': song_title
        }
    except Exception as e:
        print(f"Error fetching YouTube info: {e}")
        # Return just the video ID if we couldn't fetch additional info
        return {
            'video_id': video_id,
            'title': "Unknown Title",
            'channel_name': "Unknown Channel",
            'thumbnail': f"https://i.ytimg.com/vi/{video_id}/mqdefault.jpg"
        }

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
