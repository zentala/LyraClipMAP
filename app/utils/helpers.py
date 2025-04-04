import re
import requests
import urllib.parse
from bs4 import BeautifulSoup
from typing import Optional, Dict, Tuple

def extract_youtube_info(url: str) -> Dict[str, str]:
    """
    Extract video ID and other info from YouTube URL
    Returns dict with video details
    """
    # Extract video ID from different YouTube URL formats
    parsed_url = urllib.parse.urlparse(url)
    video_id = None
    
    if parsed_url.hostname in ('www.youtube.com', 'youtube.com'):
        if parsed_url.path == '/watch':
            query = urllib.parse.parse_qs(parsed_url.query)
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
                    info_data = urllib.parse.parse_qs(info_response.text)
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

def search_for_lyrics(artist: str, title: str) -> Optional[str]:
    """
    Search for lyrics using multiple sources
    Returns lyrics text if found, None otherwise
    """
    print(f"\n=========== LYRICS SEARCH ===========")
    print(f"Starting lyrics search for: '{artist}' - '{title}'")
    print(f"======================================\n")
    
    # Try different sources in order of reliability
    print(f"[1/3] Trying tekstowo.pl...")
    lyrics = search_tekstowo(artist, title)
    if lyrics:
        print(f"SUCCESS! Found lyrics on tekstowo.pl ({len(lyrics)} chars)")
        print(f"Sample: '{lyrics[:100]}...'")
        return lyrics
    else:
        print(f"Failed to find lyrics on tekstowo.pl")
    
    print(f"\n[2/3] Trying Genius...")
    lyrics = search_genius(artist, title)
    if lyrics:
        print(f"SUCCESS! Found lyrics on Genius ({len(lyrics)} chars)")
        print(f"Sample: '{lyrics[:100]}...'")
        return lyrics
    else:
        print(f"Failed to find lyrics on Genius")
    
    print(f"\n[3/3] Trying Musixmatch...")
    lyrics = search_musixmatch(artist, title)
    if lyrics:
        print(f"SUCCESS! Found lyrics on Musixmatch ({len(lyrics)} chars)")
        print(f"Sample: '{lyrics[:100]}...'")
        return lyrics
    else:
        print(f"Failed to find lyrics on Musixmatch")
    
    print(f"\n❌ All sources failed. No lyrics found for '{artist}' - '{title}'")
    return None
    
def search_tekstowo(artist: str, title: str) -> Optional[str]:
    """
    Search for lyrics on tekstowo.pl
    Returns lyrics text if found, None otherwise
    """
    print(f"🔍 Detailed search on tekstowo.pl:")
    print(f"   Artist: '{artist}'")
    print(f"   Title: '{title}'")
    
    # Format search query
    search_query = f"{artist} {title}".replace(" ", "+")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        # Try exact match first (direct URL pattern)
        direct_url_pattern = f"https://www.tekstowo.pl/piosenka,{artist.lower().replace(' ', '_')},{title.lower().replace(' ', '_')}.html"
        print(f"   Attempting direct URL match: {direct_url_pattern}")
        
        try:
            direct_response = requests.get(direct_url_pattern, headers=headers)
            print(f"   Direct URL response status: {direct_response.status_code}")
            
            if direct_response.status_code == 200:
                direct_soup = BeautifulSoup(direct_response.text, 'html.parser')
                
                # Check if we got a lyrics page or a search results page
                lyrics_div = direct_soup.find('div', {'class': 'inner-text'})
                if lyrics_div:
                    # Get the actual artist and title from the page
                    song_info_div = direct_soup.find('div', {'id': 'song-info'})
                    actual_artist = None
                    actual_title = None
                    
                    if song_info_div:
                        artist_elem = song_info_div.find('a', {'class': 'artist'})
                        if artist_elem:
                            actual_artist = artist_elem.text.strip()
                        
                        title_elem = song_info_div.find('h1')
                        if title_elem:
                            actual_title = title_elem.text.strip()
                    
                    print(f"   Direct URL match - Artist: '{actual_artist}', Title: '{actual_title}'")
                    
                    # If we have a match, return the lyrics
                    lyrics = lyrics_div.get_text(strip=True)
                    print(f"   ✅ SUCCESS via direct URL match! Found lyrics: {len(lyrics)} characters")
                    return lyrics
        except Exception as direct_url_error:
            print(f"   ⚠️ Error trying direct URL: {direct_url_error}")
        
        # Try direct search on tekstowo.pl
        tekstowo_search_url = f"https://www.tekstowo.pl/szukaj,wykonawca,{artist.replace(' ', '+')},tytul,{title.replace(' ', '+')}.html"
        print(f"   Direct search URL: {tekstowo_search_url}")
        
        search_response = requests.get(tekstowo_search_url, headers=headers)
        print(f"   Search response status: {search_response.status_code}")
        
        search_soup = BeautifulSoup(search_response.text, 'html.parser')
        
        # Look for search results - specifically looking for results that match our search terms
        all_result_links = search_soup.select('.content a.title')
        print(f"   Found {len(all_result_links)} total direct search results")
        
        # Filter results to find more accurate matches
        filtered_results = []
        for link in all_result_links:
            result_title = link.text.strip()
            result_href = link.get('href')
            result_artist = None
            
            # Try to get artist from parent elements
            parent_box = link.find_parent('div', class_='box-przeboje')
            if parent_box:
                artist_link = parent_box.select_one('a.artyst')
                if artist_link:
                    result_artist = artist_link.text.strip()
            
            # Print all results for debugging
            print(f"   Result: '{result_title}' - Artist: '{result_artist}'")
            
            # If we found an artist match, prioritize it
            if result_artist and result_artist.lower() == artist.lower():
                # This is a direct match for our artist, add it with high priority
                filtered_results.insert(0, {
                    'title': result_title,
                    'href': result_href,
                    'artist': result_artist,
                    'score': 100  # Highest priority
                })
            # If title contains our search title, add it
            elif title.lower() in result_title.lower():
                filtered_results.append({
                    'title': result_title,
                    'href': result_href,
                    'artist': result_artist,
                    'score': 50
                })
            # Otherwise, add it with low priority
            else:
                filtered_results.append({
                    'title': result_title,
                    'href': result_href,
                    'artist': result_artist,
                    'score': 10
                })
        
        print(f"   Found {len(filtered_results)} filtered results")
        
        if filtered_results:
            # Sort by score (highest first)
            filtered_results.sort(key=lambda x: x['score'], reverse=True)
            
            # Get the highest scoring result
            best_result = filtered_results[0]
            result_title = best_result['title']
            result_url = "https://www.tekstowo.pl" + best_result['href']
            print(f"   Best match: '{result_title}' (score: {best_result['score']}) at {result_url}")
            
            # Get lyrics page
            lyrics_response = requests.get(result_url, headers=headers)
            print(f"   Lyrics page response status: {lyrics_response.status_code}")
            
            lyrics_soup = BeautifulSoup(lyrics_response.text, 'html.parser')
            
            # Find lyrics text
            lyrics_div = lyrics_soup.find('div', {'class': 'inner-text'})
            if lyrics_div:
                lyrics = lyrics_div.get_text(strip=True)
                
                # Verify if it's a reasonable match by checking the page metadata
                song_info_div = lyrics_soup.find('div', {'id': 'song-info'})
                actual_artist = None
                actual_title = None
                
                if song_info_div:
                    artist_elem = song_info_div.find('a', {'class': 'artist'})
                    if artist_elem:
                        actual_artist = artist_elem.text.strip()
                    
                    title_elem = song_info_div.find('h1')
                    if title_elem:
                        actual_title = title_elem.text.strip()
                
                print(f"   Page metadata - Artist: '{actual_artist}', Title: '{actual_title}'")
                
                # Validate the match
                artist_match = actual_artist and (
                    actual_artist.lower() == artist.lower() or 
                    artist.lower() in actual_artist.lower() or 
                    actual_artist.lower() in artist.lower()
                )
                
                title_match = actual_title and (
                    actual_title.lower() == title.lower() or
                    title.lower() in actual_title.lower() or
                    actual_title.lower() in title.lower()
                )
                
                if artist_match or title_match:
                    print(f"   ✅ SUCCESS via direct search! Found lyrics: {len(lyrics)} characters")
                    if actual_artist and actual_artist != artist:
                        print(f"   ℹ️ Note: Found lyrics for artist '{actual_artist}' instead of '{artist}'")
                    if actual_title and actual_title != title:
                        print(f"   ℹ️ Note: Found lyrics for title '{actual_title}' instead of '{title}'")
                    return lyrics
                else:
                    print(f"   ⚠️ Found lyrics but metadata doesn't match our search. Continuing search...")
            else:
                print(f"   ❌ Found result page but no lyrics div found")
        else:
            print(f"   ❌ No direct search results found")
    
        # Fallback: Search on Google
        search_url = f"https://www.google.com/search?q=site:tekstowo.pl+{search_query}"
        print(f"   Fallback: Google search URL: {search_url}")
        
        response = requests.get(search_url, headers=headers)
        print(f"   Google search response status: {response.status_code}")
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find first tekstowo.pl result
        google_results = []
        for link in soup.find_all('a'):
            href = link.get('href')
            if href and 'tekstowo.pl' in href and 'text' in href:
                google_results.append(href)
        
        print(f"   Found {len(google_results)} Google search results for tekstowo.pl")
        
        if google_results:
            # Extract actual URL from Google redirect
            tekstowo_url = google_results[0].split('&')[0].replace('/url?q=', '')
            print(f"   First Google result URL: {tekstowo_url}")
            
            # Get lyrics page
            lyrics_response = requests.get(tekstowo_url, headers=headers)
            print(f"   Lyrics page response status (via Google): {lyrics_response.status_code}")
            
            lyrics_soup = BeautifulSoup(lyrics_response.text, 'html.parser')
            
            # Find lyrics text
            lyrics_div = lyrics_soup.find('div', {'class': 'inner-text'})
            if lyrics_div:
                lyrics = lyrics_div.get_text(strip=True)
                
                # Verify if it's a reasonable match by checking the page metadata
                song_info_div = lyrics_soup.find('div', {'id': 'song-info'})
                actual_artist = None
                actual_title = None
                
                if song_info_div:
                    artist_elem = song_info_div.find('a', {'class': 'artist'})
                    if artist_elem:
                        actual_artist = artist_elem.text.strip()
                    
                    title_elem = song_info_div.find('h1')
                    if title_elem:
                        actual_title = title_elem.text.strip()
                
                print(f"   Page metadata (Google search) - Artist: '{actual_artist}', Title: '{actual_title}'")
                
                # Validate the match
                artist_match = actual_artist and (
                    actual_artist.lower() == artist.lower() or 
                    artist.lower() in actual_artist.lower() or 
                    actual_artist.lower() in artist.lower()
                )
                
                title_match = actual_title and (
                    actual_title.lower() == title.lower() or
                    title.lower() in actual_title.lower() or
                    actual_title.lower() in title.lower()
                )
                
                if artist_match or title_match:
                    print(f"   ✅ SUCCESS via Google! Found lyrics: {len(lyrics)} characters")
                    if actual_artist and actual_artist != artist:
                        print(f"   ℹ️ Note: Found lyrics for artist '{actual_artist}' instead of '{artist}'")
                    if actual_title and actual_title != title:
                        print(f"   ℹ️ Note: Found lyrics for title '{actual_title}' instead of '{title}'")
                    return lyrics
                else:
                    print(f"   ⚠️ Found lyrics via Google but metadata doesn't match our search.")
            else:
                print(f"   ❌ Found result page via Google but no lyrics div found")
    except Exception as e:
        import traceback
        print(f"   ❌ ERROR searching tekstowo.pl: {e}")
        print(traceback.format_exc())
    
    print("   ❌ No lyrics found on tekstowo.pl after all attempts")
    return None
    
def search_genius(artist: str, title: str) -> Optional[str]:
    """
    Search for lyrics on Genius
    Returns lyrics text if found, None otherwise
    """
    print(f"🔍 Detailed search on Genius:")
    print(f"   Artist: '{artist}'")
    print(f"   Title: '{title}'")
    
    # Format search query
    search_query = f"{artist} {title} lyrics".replace(" ", "+")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        # Search on Google
        search_url = f"https://www.google.com/search?q=site:genius.com+{search_query}"
        print(f"   Google search URL: {search_url}")
        
        response = requests.get(search_url, headers=headers)
        print(f"   Google search response status: {response.status_code}")
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find first genius.com result
        genius_results = []
        for link in soup.find_all('a'):
            href = link.get('href')
            if href and 'genius.com' in href and ('/lyrics/' in href or '-lyrics' in href):
                genius_results.append(href)
                
        print(f"   Found {len(genius_results)} Google search results for Genius")
        
        if genius_results:
            # Extract actual URL from Google redirect
            genius_url = genius_results[0].split('&')[0].replace('/url?q=', '')
            print(f"   First Genius result URL: {genius_url}")
            
            # Get lyrics page
            lyrics_response = requests.get(genius_url, headers=headers)
            print(f"   Lyrics page response status: {lyrics_response.status_code}")
            
            lyrics_soup = BeautifulSoup(lyrics_response.text, 'html.parser')
            
            # Try to get the song title from Genius page
            song_title_element = lyrics_soup.select_one('h1')
            if song_title_element:
                song_title = song_title_element.text.strip()
                print(f"   Song title on Genius: '{song_title}'")
            
            # Try to get the artist from Genius page
            artist_element = lyrics_soup.select_one('a[href*="/artists/"]')
            if artist_element:
                artist_name = artist_element.text.strip()
                print(f"   Artist on Genius: '{artist_name}'")
                
            # Find lyrics text - Genius stores lyrics in multiple divs with class 'Lyrics__Container'
            print(f"   Trying to find lyrics with class 'Lyrics__Container'...")
            lyrics_divs = lyrics_soup.find_all('div', {'class': 'Lyrics__Container'})
            if lyrics_divs:
                lyrics = ''
                for div in lyrics_divs:
                    lyrics += div.get_text() + '\n'
                print(f"   ✅ SUCCESS! Found lyrics with class selector: {len(lyrics)} characters")
                return lyrics
            
            # Try alternative selectors if the standard one fails
            print(f"   Trying alternative selector '[data-lyrics-container=\"true\"]'...")
            lyrics_div = lyrics_soup.select_one('[data-lyrics-container="true"]')
            if lyrics_div:
                lyrics = lyrics_div.get_text()
                print(f"   ✅ SUCCESS! Found lyrics with data attribute selector: {len(lyrics)} characters")
                return lyrics
            
            # Try more generic selectors if all else fails
            print(f"   Trying more generic selectors...")
            potential_lyrics_containers = [
                lyrics_soup.select('.lyrics'),
                lyrics_soup.select('.song_body-lyrics'),
                lyrics_soup.select('.song-lyrics'),
            ]
            
            for container_list in potential_lyrics_containers:
                if container_list:
                    lyrics = ''
                    for container in container_list:
                        lyrics += container.get_text() + '\n'
                    print(f"   ✅ SUCCESS! Found lyrics with generic selector: {len(lyrics)} characters")
                    return lyrics
            
            print(f"   ❌ Found Genius page but could not locate lyrics with any selector")
        else:
            print(f"   ❌ No Genius results found on Google")
                    
    except Exception as e:
        import traceback
        print(f"   ❌ ERROR searching Genius: {e}")
        print(traceback.format_exc())
    
    print("   ❌ No lyrics found on Genius after all attempts")
    return None
    
def search_musixmatch(artist: str, title: str) -> Optional[str]:
    """
    Search for lyrics on Musixmatch
    Returns lyrics text if found, None otherwise
    """
    print(f"🔍 Detailed search on Musixmatch:")
    print(f"   Artist: '{artist}'")
    print(f"   Title: '{title}'")
    
    # Format search query
    search_query = f"{artist} {title} lyrics".replace(" ", "+")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        # Try direct search first
        direct_url = f"https://www.musixmatch.com/search/{search_query.replace('+', '%20')}"
        print(f"   Direct search URL: {direct_url}")
        
        try:
            direct_response = requests.get(direct_url, headers=headers)
            print(f"   Direct search response status: {direct_response.status_code}")
            
            direct_soup = BeautifulSoup(direct_response.text, 'html.parser')
            
            # Try to find the first search result
            search_results = direct_soup.select('.title')
            print(f"   Found {len(search_results)} direct search results")
            
            if search_results and len(search_results) > 0:
                # Get the first result href
                result_link = None
                for result in search_results:
                    parent = result.parent
                    if parent and parent.name == 'a' and 'href' in parent.attrs:
                        result_link = parent['href']
                        break
                
                if result_link:
                    result_url = f"https://www.musixmatch.com{result_link}"
                    print(f"   First result URL: {result_url}")
                    
                    # Get lyrics page
                    lyrics_response = requests.get(result_url, headers=headers)
                    print(f"   Lyrics page response status: {lyrics_response.status_code}")
                    
                    lyrics_soup = BeautifulSoup(lyrics_response.text, 'html.parser')
                    
                    # Try to get actual song title and artist
                    song_header = lyrics_soup.select_one('.mxm-track-title h1')
                    if song_header:
                        print(f"   Song title on page: '{song_header.text.strip()}'")
                    
                    artist_header = lyrics_soup.select_one('.mxm-track-title h2 a')
                    if artist_header:
                        print(f"   Artist on page: '{artist_header.text.strip()}'")
                    
                    # Search for lyrics using various selectors
                    print(f"   Searching for lyrics content in page...")
                    
                    # Try primary selector
                    lyrics_divs = lyrics_soup.find_all('span', {'class': 'lyrics__content__ok'})
                    if lyrics_divs:
                        lyrics = ''
                        for div in lyrics_divs:
                            lyrics += div.get_text() + '\n'
                        print(f"   ✅ SUCCESS! Found lyrics with primary selector: {len(lyrics)} characters")
                        return lyrics
                        
                    # Try alternative selectors
                    lyrics_divs = lyrics_soup.select('.mxm-lyrics__content span')
                    if lyrics_divs:
                        lyrics = ''
                        for div in lyrics_divs:
                            lyrics += div.get_text() + '\n'
                        print(f"   ✅ SUCCESS! Found lyrics with secondary selector: {len(lyrics)} characters")
                        return lyrics
                    
                    # Try more generic content
                    lyrics_content = lyrics_soup.select_one('.mxm-lyrics__content')
                    if lyrics_content:
                        lyrics = lyrics_content.get_text()
                        print(f"   ✅ SUCCESS! Found lyrics with generic content selector: {len(lyrics)} characters")
                        return lyrics
                    
                    print(f"   ❌ Found lyrics page but could not extract lyrics content")
                else:
                    print(f"   ❌ Found search results but could not extract result link")
            else:
                print(f"   ❌ No direct search results found")
        except Exception as direct_error:
            print(f"   ⚠️ Error in direct search: {direct_error}")
                
        # Fallback: Search on Google
        search_url = f"https://www.google.com/search?q=site:musixmatch.com+{search_query}"
        print(f"   Google search URL: {search_url}")
        
        response = requests.get(search_url, headers=headers)
        print(f"   Google search response status: {response.status_code}")
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find first musixmatch.com result
        musixmatch_results = []
        for link in soup.find_all('a'):
            href = link.get('href')
            if href and 'musixmatch.com' in href and '/lyrics/' in href:
                musixmatch_results.append(href)
        
        print(f"   Found {len(musixmatch_results)} Google search results for Musixmatch")
        
        if musixmatch_results:
            # Extract actual URL from Google redirect
            musixmatch_url = musixmatch_results[0].split('&')[0].replace('/url?q=', '')
            print(f"   First Google result URL: {musixmatch_url}")
            
            # Get lyrics page
            lyrics_response = requests.get(musixmatch_url, headers=headers)
            print(f"   Lyrics page response status (via Google): {lyrics_response.status_code}")
            
            lyrics_soup = BeautifulSoup(lyrics_response.text, 'html.parser')
            
            # Find lyrics text
            lyrics_divs = lyrics_soup.find_all('span', {'class': 'lyrics__content__ok'})
            if lyrics_divs:
                lyrics = ''
                for div in lyrics_divs:
                    lyrics += div.get_text() + '\n'
                print(f"   ✅ SUCCESS via Google! Found lyrics: {len(lyrics)} characters")
                return lyrics
                
            # Try alternative selectors
            lyrics_divs = lyrics_soup.select('.mxm-lyrics__content span')
            if lyrics_divs:
                lyrics = ''
                for div in lyrics_divs:
                    lyrics += div.get_text() + '\n'
                print(f"   ✅ SUCCESS via Google (alt method)! Found lyrics: {len(lyrics)} characters")
                return lyrics
            
            print(f"   ❌ Found result page via Google but no lyrics content found")
        else:
            print(f"   ❌ No Musixmatch results found on Google")
            
    except Exception as e:
        import traceback
        print(f"   ❌ ERROR searching Musixmatch: {e}")
        print(traceback.format_exc())
    
    print("   ❌ No lyrics found on Musixmatch after all attempts")
    return None

def format_song_title(artist: str, title: str) -> str:
    """Format song title for display"""
    return f"{artist} - {title}"

def format_youtube_title(youtube_title: str) -> Tuple[str, str]:
    """
    Try to extract artist and title from YouTube video title
    Returns tuple of (artist, title)
    """
    print(f"\n🔍 Analyzing YouTube title: '{youtube_title}'")
    
    # If the title ends with "- Topic", it's likely from YouTube Music
    # and the format is likely "Song Name - Artist Name - Topic"
    if youtube_title.endswith(" - Topic"):
        # This is a "- Topic" format which is an artist channel
        artist_name = youtube_title.replace(" - Topic", "").strip()
        print(f"  ✅ Detected 'Topic' channel format! Artist: '{artist_name}'")
        return artist_name, youtube_title  # We'll try to get the song title elsewhere
    
    # Common patterns for YouTube music titles
    patterns = [
        r'^(.+?)\s*[-–]\s*(.+?)(?:\s*\(.*?\))*$',  # Artist - Title (optional stuff) 
        r'^(.+?)\s*"(.+?)"',  # Artist "Title"
        r'^(.+?)\s*:\s*(.+?)$',  # Artist: Title
    ]
    
    pattern_names = [
        "ARTIST - TITLE (optional stuff)",
        "ARTIST \"TITLE\"",
        "ARTIST: TITLE"
    ]
    
    for i, pattern in enumerate(patterns):
        print(f"  Trying pattern: {pattern_names[i]}")
        match = re.match(pattern, youtube_title)
        if match:
            artist = match.group(1).strip()
            title = match.group(2).strip()
            print(f"  ✅ Pattern matched! Artist: '{artist}', Title: '{title}'")
            return artist, title
        else:
            print(f"  ❌ Pattern did not match")
    
    # Special case for "Topic" channels which are official artist channels
    if " - Topic" in youtube_title:
        print(f"  Trying special case for Topic channel in title")
        parts = youtube_title.split(" - ")
        print(f"  Split parts: {parts}")
        
        if len(parts) >= 2:
            # Last part before "- Topic" is usually the artist
            artist_parts = []
            for i in range(len(parts)-1, -1, -1):
                if parts[i] == "Topic":
                    if i > 0:
                        artist_parts.append(parts[i-1])
                        break
            
            if artist_parts:
                artist = " ".join(artist_parts)
                # The first part is usually the title
                title = parts[0]
                print(f"  ✅ Topic special case matched! Artist: '{artist}', Title: '{title}'")
                return artist, title
    
    # If no pattern matches, return original as title with unknown artist
    print(f"  ❌ No patterns matched. Using fallback: Artist='Unknown Artist', Title='{youtube_title.strip()}'")
    return "Unknown Artist", youtube_title.strip()
