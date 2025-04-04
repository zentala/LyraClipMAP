# LyraClipMAP API Documentation

## Overview

The LyraClipMAP API is built using NestJS and provides a comprehensive set of endpoints for managing a music library with synchronized lyrics. This document provides an overview of the available endpoints and their functionality.

## Base URL

All API endpoints are prefixed with `/api`.

## Authentication

Most endpoints require authentication using JSON Web Tokens (JWT). To authenticate:

1. Obtain a token by sending a POST request to `/api/auth/login` with valid credentials
2. Include the token in the Authorization header of subsequent requests:
   ```
   Authorization: Bearer <your_token>
   ```

## API Resources

### Authentication

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| /auth/register | POST | Register a new user | No |
| /auth/login | POST | Login with email and password | No |
| /auth/refresh | POST | Refresh access token | No |
| /auth/me | GET | Get current user information | Yes |

### Users

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| /users/{id}/preferences | GET | Get user preferences | Yes |
| /users/{id}/preferences | PUT | Update user preferences | Yes |

### Songs

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| /songs | GET | Get a list of songs with filtering and pagination | No |
| /songs | POST | Create a new song | Yes |
| /songs/{id} | GET | Get a specific song by ID | No |
| /songs/{id} | PUT | Update a song | Yes |
| /songs/{id} | DELETE | Delete a song | Yes |
| /songs/{id}/like | POST | Add a song to liked songs | Yes |
| /songs/{id}/like | DELETE | Remove a song from liked songs | Yes |
| /songs/{songId}/text-contents | GET | Get all text contents for a song | No |

### Artists

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| /artists | GET | Get a list of artists with filtering and pagination | No |
| /artists | POST | Create a new artist | Yes |
| /artists/{id} | GET | Get a specific artist by ID | No |
| /artists/{id} | PUT | Update an artist | Yes |
| /artists/{id}/songs | GET | Get songs by an artist | No |
| /artists/{id}/like | POST | Add an artist to liked artists | Yes |
| /artists/{id}/like | DELETE | Remove an artist from liked artists | Yes |

### Playlists

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| /playlists | GET | Get a list of playlists | Yes |
| /playlists | POST | Create a new playlist | Yes |
| /playlists/{id} | GET | Get a specific playlist by ID | No* |
| /playlists/{id} | PUT | Update a playlist | Yes |
| /playlists/{id} | DELETE | Delete a playlist | Yes |
| /playlists/{id}/songs | GET | Get songs in a playlist | No* |
| /playlists/{id}/songs | POST | Add a song to a playlist | Yes |
| /playlists/{playlistId}/songs/{songId} | DELETE | Remove a song from a playlist | Yes |

*Private playlists require authentication

### Text Contents

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| /text-contents | POST | Create a new text content | Yes |
| /text-contents/{id} | GET | Get a specific text content by ID | No |
| /text-contents/{id} | PUT | Update a text content | Yes |
| /text-contents/{id} | DELETE | Delete a text content | Yes |

### YouTube Integration

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| /youtube/info | GET | Get information about a YouTube video | No |

### Lyrics

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| /lyrics/search | GET | Search for lyrics from external sources | No |
| /lyrics/generate-lrc | POST | Generate LRC format synchronized lyrics | Yes |

### Clips (Song Segments)

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| /clips | GET | Get a list of clips, optionally filtered by song | No |
| /clips | POST | Create a new clip | Yes |
| /clips/{id} | GET | Get a specific clip by ID | No |
| /clips/{id} | PUT | Update a clip | Yes |
| /clips/{id} | DELETE | Delete a clip | Yes |

### Visualizations (AI-Generated Imagery)

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| /visualizations | GET | Get a list of visualizations, optionally filtered by song or clip | No |
| /visualizations | POST | Create a new visualization | Yes |
| /visualizations/{id} | GET | Get a specific visualization by ID | No |
| /visualizations/{id} | PUT | Update a visualization | Yes |
| /visualizations/{id} | DELETE | Delete a visualization | Yes |
| /visualizations/{id}/generate | POST | Generate a visualization using AI | Yes |
| /visualizations/reference-images | GET | Get reference images for visualization | No |
| /visualizations/reference-images | POST | Create a new reference image | Yes |

### Uploads

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| /uploads | GET | Get a list of uploads | Yes |
| /uploads | POST | Upload a file | Yes |
| /uploads/{id} | GET | Get a specific upload by ID | No |
| /uploads/{id} | DELETE | Delete an upload | Yes |

### Tags

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| /tags | GET | Get a list of tags, optionally filtered by category | No |
| /tags | POST | Create a new tag | Yes |
| /tags/songs/{songId} | POST | Add a tag to a song | Yes |
| /tags/songs/{songId}/{tagId} | DELETE | Remove a tag from a song | Yes |
| /tags/songs/{songId} | GET | Get tags for a song | No |
| /tags/analysis/songs/{songId} | GET | Analyze song sentiment and energy | No |

### Spotify Integration

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| /spotify/search | GET | Search for tracks on Spotify | No |
| /spotify/tracks/{id} | GET | Get details for a Spotify track | No |
| /spotify/import | POST | Import a track from Spotify | Yes |
| /spotify/recommendations | GET | Get recommendations based on seed tracks | No |
| /spotify/audio-features/{id} | GET | Get audio features for a Spotify track | No |

## Request & Response Examples

### Authentication

#### Register a new user

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

Response:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cl9z8v4jt0000abcd1234wxyz",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": null,
    "createdAt": "2023-07-21T12:34:56.789Z",
    "updatedAt": "2023-07-21T12:34:56.789Z"
  }
}
```

### Songs

#### Get a list of songs

```http
GET /api/songs?page=1&limit=10&search=love&sortBy=createdAt&sortOrder=desc
```

Response:

```json
{
  "data": [
    {
      "id": "cl9z8v4jt0001abcd1234wxyz",
      "title": "Love Story",
      "artistId": "cl9z8v4jt0002abcd1234wxyz",
      "description": "A beautiful love song",
      "duration": 235,
      "thumbnailUrl": "https://example.com/thumbnail.jpg",
      "createdAt": "2023-07-21T12:34:56.789Z",
      "updatedAt": "2023-07-21T12:34:56.789Z",
      "artist": {
        "id": "cl9z8v4jt0002abcd1234wxyz",
        "name": "Taylor Swift",
        "imageUrl": "https://example.com/artist.jpg"
      },
      "audioSources": [
        {
          "id": "cl9z8v4jt0003abcd1234wxyz",
          "songId": "cl9z8v4jt0001abcd1234wxyz",
          "url": "https://youtube.com/watch?v=8xg3vE8Ie_E",
          "sourceType": "YOUTUBE",
          "isMain": true
        }
      ],
      "textContents": [
        {
          "id": "cl9z8v4jt0004abcd1234wxyz",
          "songId": "cl9z8v4jt0001abcd1234wxyz",
          "contentType": "LYRICS",
          "language": "EN"
        }
      ],
      "isLiked": true,
      "likeCount": 42
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### Create a new song

```http
POST /api/songs
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "title": "Love Story",
  "artistId": "cl9z8v4jt0002abcd1234wxyz",
  "description": "A beautiful love song",
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "audioSources": [
    {
      "url": "https://youtube.com/watch?v=8xg3vE8Ie_E",
      "sourceType": "YOUTUBE",
      "isMain": true
    }
  ]
}
```

### Playlists

#### Create a new playlist

```http
POST /api/playlists
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "name": "My Favorite Songs",
  "description": "A collection of my favorite songs",
  "isPublic": true,
  "songIds": ["cl9z8v4jt0001abcd1234wxyz"]
}
```

### Lyrics

#### Search for lyrics

```http
GET /api/lyrics/search?artist=Taylor%20Swift&title=Love%20Story
```

Response:

```json
[
  {
    "source": "genius",
    "url": "https://genius.com/Taylor-swift-love-story-lyrics",
    "artist": "Taylor Swift",
    "title": "Love Story",
    "content": "We were both young when I first saw you...",
    "confidence": 0.95
  },
  {
    "source": "musixmatch",
    "url": "https://www.musixmatch.com/lyrics/Taylor-Swift/Love-Story",
    "artist": "Taylor Swift",
    "title": "Love Story",
    "content": "We were both young when I first saw you...",
    "confidence": 0.92
  }
]
```

### Clips

#### Create a new clip

```http
POST /api/clips
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "songId": "cl9z8v4jt0001abcd1234wxyz",
  "name": "Chorus",
  "description": "The chorus of Love Story",
  "startTime": 64.5,
  "endTime": 94.2
}
```

Response:

```json
{
  "id": "cl9z8v4jt0005abcd1234wxyz",
  "songId": "cl9z8v4jt0001abcd1234wxyz",
  "name": "Chorus",
  "description": "The chorus of Love Story",
  "startTime": 64.5,
  "endTime": 94.2,
  "createdAt": "2023-07-21T12:34:56.789Z",
  "updatedAt": "2023-07-21T12:34:56.789Z"
}
```

### Visualizations

#### Create a visualization with word-image mappings

```http
POST /api/visualizations
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "songId": "cl9z8v4jt0001abcd1234wxyz",
  "name": "Love Story Visuals",
  "description": "Visualization for Love Story lyrics",
  "prompt": "Create a romantic castle scene with fantasy elements",
  "visualizationType": "ANIMATION",
  "wordImageMappings": [
    {
      "wordTimestampId": "cl9z8v4jt0006abcd1234wxyz",
      "referenceImageId": "cl9z8v4jt0007abcd1234wxyz",
      "timestamp": 65.2
    },
    {
      "wordTimestampId": "cl9z8v4jt0008abcd1234wxyz",
      "referenceImageId": "cl9z8v4jt0009abcd1234wxyz",
      "timestamp": 68.7
    }
  ]
}
```

#### Generate a visualization

```http
POST /api/visualizations/cl9z8v4jt0010abcd1234wxyz/generate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Response:

```json
{
  "id": "cl9z8v4jt0010abcd1234wxyz",
  "status": "GENERATING",
  "message": "Visualization generation started. This process may take several minutes."
}
```

### Uploads

#### Upload an audio file

```http
POST /api/uploads
Content-Type: multipart/form-data
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

file: [binary file data]
purpose: "AUDIO"
songId: "cl9z8v4jt0001abcd1234wxyz"
```

Response:

```json
{
  "id": "cl9z8v4jt0011abcd1234wxyz",
  "filename": "0ae93c7f-eb70-4d5c-9a6d-8547aa39e1de.mp3",
  "originalName": "love_story.mp3",
  "mimeType": "audio/mpeg",
  "size": 4285691,
  "path": "uploads/audio/0ae93c7f-eb70-4d5c-9a6d-8547aa39e1de.mp3",
  "url": "http://localhost:3000/uploads/audio/0ae93c7f-eb70-4d5c-9a6d-8547aa39e1de.mp3",
  "purpose": "AUDIO",
  "songId": "cl9z8v4jt0001abcd1234wxyz",
  "uploaderId": "cl9z8v4jt0000abcd1234wxyz",
  "createdAt": "2023-07-21T12:34:56.789Z"
}
```

### Tags

#### Add a tag to a song

```http
POST /api/tags/songs/cl9z8v4jt0001abcd1234wxyz
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "tagId": "cl9z8v4jt0012abcd1234wxyz",
  "value": 0.85
}
```

Response:

```json
{
  "songId": "cl9z8v4jt0001abcd1234wxyz",
  "tagId": "cl9z8v4jt0012abcd1234wxyz",
  "value": 0.85,
  "addedAt": "2023-07-21T12:34:56.789Z",
  "tag": {
    "id": "cl9z8v4jt0012abcd1234wxyz",
    "name": "romantic",
    "category": "THEME"
  }
}
```

### Spotify Integration

#### Search for tracks on Spotify

```http
GET /api/spotify/search?query=Taylor%20Swift%20Love%20Story&type=track&limit=5
```

Response:

```json
{
  "tracks": [
    {
      "id": "4cOdK2wGLETKBW3PvgPWqT",
      "name": "Love Story",
      "artists": [
        {
          "id": "06HL4z0CvFAxyc27GXpf02",
          "name": "Taylor Swift"
        }
      ],
      "album": "Fearless (Taylor's Version)",
      "albumImageUrl": "https://i.scdn.co/image/ab67616d0000b273a5a7eb5bfbaf20973e023f0e",
      "durationMs": 235733,
      "previewUrl": "https://p.scdn.co/mp3-preview/f83df3f6ab8ee277d6acb28ac4822562c7aa6e2e"
    }
  ]
}
```

#### Import a track from Spotify

```http
POST /api/spotify/import
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "trackId": "4cOdK2wGLETKBW3PvgPWqT",
  "fetchLyrics": true,
  "fetchAudioFeatures": true
}
```

Response:

```json
{
  "id": "cl9z8v4jt0013abcd1234wxyz",
  "title": "Love Story",
  "artist": {
    "id": "cl9z8v4jt0014abcd1234wxyz",
    "name": "Taylor Swift"
  },
  "spotifyId": "4cOdK2wGLETKBW3PvgPWqT",
  "audioSources": [
    {
      "id": "cl9z8v4jt0015abcd1234wxyz",
      "sourceType": "SPOTIFY",
      "url": "spotify:track:4cOdK2wGLETKBW3PvgPWqT",
      "isMain": true
    }
  ],
  "textContents": [
    {
      "id": "cl9z8v4jt0016abcd1234wxyz",
      "contentType": "LYRICS",
      "language": "EN",
      "source": "genius"
    }
  ],
  "tags": [
    {
      "tagId": "cl9z8v4jt0017abcd1234wxyz",
      "name": "country pop",
      "category": "GENRE"
    },
    {
      "tagId": "cl9z8v4jt0018abcd1234wxyz",
      "name": "energy",
      "category": "ENERGY",
      "value": 0.67
    }
  ]
}
```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests:

- 200: OK - The request was successful
- 201: Created - A new resource was created
- 204: No Content - The request was successful, but there is no content to return
- 400: Bad Request - The request was invalid
- 401: Unauthorized - Authentication is required or credentials are invalid
- 403: Forbidden - The authenticated user doesn't have permission
- 404: Not Found - The requested resource doesn't exist
- 409: Conflict - The request conflicts with the current state
- 422: Unprocessable Entity - The request was well-formed but contained invalid parameters
- 500: Internal Server Error - Something went wrong on the server

Error responses include:

```json
{
  "statusCode": 400,
  "message": "Error message describing what went wrong",
  "code": "ERROR_CODE",
  "timestamp": "2023-07-21T12:34:56.789Z"
}
```

## Pagination

Endpoints that return lists of resources support pagination using the following query parameters:

- `page`: The page number to fetch (default: 1)
- `limit`: The number of items per page (default: 10)

Paginated responses include a `meta` object with pagination information:

```json
{
  "data": [...],
  "meta": {
    "total": 100,     // Total number of items
    "page": 1,        // Current page
    "limit": 10,      // Items per page
    "totalPages": 10, // Total number of pages
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Filtering and Sorting

Many endpoints support filtering and sorting through query parameters. Common parameters include:

- `search`: A search term to filter results
- `sortBy`: The field to sort by
- `sortOrder`: The sort direction (`asc` or `desc`)

Specific endpoints may support additional filtering parameters. Refer to the Swagger documentation for details.

## API Documentation

Detailed API documentation is available in the Swagger format. You can access the Swagger UI at `/api-docs` when the application is running.