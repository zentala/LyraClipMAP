# LyraClipMAP Technical Details

This document provides technical implementation details for the LyraClipMAP v0.2 TypeScript implementation. It serves as a reference for developers working on the project.

## Core Algorithms

### YouTube URL Processing

The YouTube URL processing algorithm extracts video IDs from various YouTube URL formats:

```typescript
export function cleanYoutubeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    
    // Only process YouTube URLs
    if (!['www.youtube.com', 'youtube.com', 'youtu.be'].includes(parsedUrl.hostname)) {
      return url;
    }
    
    // If it's a /watch URL, extract just the video ID and rebuild the URL
    if (['www.youtube.com', 'youtube.com'].includes(parsedUrl.hostname) && 
        parsedUrl.pathname === '/watch') {
      const params = new URLSearchParams(parsedUrl.search);
      const videoId = params.get('v');
      if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }
    
    // If it's a youtu.be URL, extract just the path and rebuild
    if (parsedUrl.hostname === 'youtu.be') {
      let videoId = parsedUrl.pathname.substring(1);
      if (videoId.includes('?')) {
        videoId = videoId.split('?')[0];
      }
      return `https://youtu.be/${videoId}`;
    }
  } catch (error) {
    console.error('Error cleaning YouTube URL:', error);
  }
  
  // If anything goes wrong, return the original URL
  return url;
}
```

### YouTube Metadata Extraction

The metadata extraction algorithm uses multiple approaches to get the most accurate information:

```typescript
export async function extractYoutubeInfo(url: string): Promise<YouTubeInfo> {
  // Clean up URL
  const cleanedUrl = cleanYoutubeUrl(url);
  const videoId = extractVideoId(cleanedUrl);
  
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }
  
  // First try the oEmbed endpoint
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await axios.get(oembedUrl);
    const data = response.data;
    
    // Extract artist and title from title string
    const { artist, title } = parseYoutubeTitle(data.title);
    
    // Get description from video info endpoint
    const description = await fetchYoutubeDescription(videoId);
    
    // Try to extract better artist/title from description
    let finalArtist = artist;
    let finalTitle = title;
    
    if (description) {
      const descInfo = extractInfoFromDescription(description);
      if (descInfo.artist && (artist === 'Unknown Artist' || descInfo.artist.includes(data.author_name))) {
        finalArtist = descInfo.artist;
      }
      
      if (descInfo.title && (title === 'Unknown Title' || title === data.title)) {
        finalTitle = descInfo.title;
      }
    }
    
    // Handle "Topic" channels
    if (data.author_name?.includes('- Topic') && finalArtist === 'Unknown Artist') {
      finalArtist = data.author_name.replace(' - Topic', '').trim();
    }
    
    return {
      videoId,
      title: data.title,
      description,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      channelName: data.author_name,
      artist: finalArtist,
      songTitle: finalTitle
    };
  } catch (error) {
    // Fallback to alternative method
    return fallbackYoutubeExtraction(videoId);
  }
}
```

### Artist and Title Extraction from Description

This algorithm parses YouTube descriptions to extract song and artist information:

```typescript
export function extractInfoFromDescription(description: string): { artist?: string; title?: string } {
  const result: { artist?: string; title?: string } = {};
  
  // Common patterns in descriptions
  const trackPatterns = [
    /Track\s*\d*\s*:\s*([^\n\r]+)/,  // "Track 06: Noce Szatana"
    /\bTrack\b\s*:\s*([^\n\r]+)/,    // "Track: Song Title" 
    /\bTitle\b\s*:\s*([^\n\r]+)/,    // "Title: Song Title"
    /\bSong\b\s*:\s*([^\n\r]+)/      // "Song: Song Title"
  ];
  
  const artistPatterns = [
    /Artist\s*:\s*(.+)/,       // "Artist: Kat"
    /Band\s*:\s*(.+)/,         // "Band: Kat"
    /by\s+(.+?)\s*$/,          // "by Kat"
    /^(.+?)\s*\((\d{4})\)/,     // "Kat (1986)"
    /^\s*([A-Za-z0-9\s&]+)\s*$/ // Stand-alone name like "Kat"
  ];
  
  // Process description line by line
  const lines = description.split('\n');
  
  // Pre-process concatenated descriptions
  const processedLines = preProcessDescription(description);
  
  // First pass: check for standalone artist names in first few lines
  const potentialArtists = findPotentialArtistNames(processedLines.slice(0, 5));
  if (potentialArtists.length > 0) {
    result.artist = potentialArtists[0];
  }
  
  // Apply pattern matching
  for (const line of processedLines) {
    // Look for track/title info
    if (!result.title) {
      for (const pattern of trackPatterns) {
        const match = line.match(pattern);
        if (match) {
          result.title = cleanTrackTitle(match[1]);
          break;
        }
      }
    }
    
    // Look for artist info
    if (!result.artist) {
      for (const pattern of artistPatterns) {
        const match = line.match(pattern);
        if (match) {
          result.artist = cleanArtistName(match[1]);
          break;
        }
      }
    }
    
    // Check for Artist - Title format
    if (!result.artist || !result.title) {
      const dashParts = line.split(' - ');
      if (dashParts.length === 2) {
        if (!result.artist) result.artist = dashParts[0].trim();
        if (!result.title) result.title = dashParts[1].trim();
      }
    }
    
    // If we have both, we can stop
    if (result.artist && result.title) break;
  }
  
  return result;
}
```

### Lyrics Search Algorithm

The lyrics search algorithm tries multiple sources in sequence until it finds lyrics:

```typescript
export async function searchForLyrics(artist: string, title: string): Promise<string | null> {
  // Try each source in sequence
  try {
    // Try tekstowo.pl first
    const tekstowoLyrics = await searchTekstowo(artist, title);
    if (tekstowoLyrics) {
      return tekstowoLyrics;
    }
    
    // Try Genius second
    const geniusLyrics = await searchGenius(artist, title);
    if (geniusLyrics) {
      return geniusLyrics;
    }
    
    // Try Musixmatch last
    const musixmatchLyrics = await searchMusixmatch(artist, title);
    if (musixmatchLyrics) {
      return musixmatchLyrics;
    }
    
    // No lyrics found
    return null;
  } catch (error) {
    console.error('Error searching for lyrics:', error);
    return null;
  }
}
```

### Tekstowo.pl Lyrics Search

```typescript
export async function searchTekstowo(artist: string, title: string): Promise<string | null> {
  // Build a direct URL pattern first (most reliable)
  const directUrlPattern = 
    `https://www.tekstowo.pl/piosenka,${artist.toLowerCase().replace(/ /g, '_')},${title.toLowerCase().replace(/ /g, '_')}.html`;
  
  try {
    // Try direct URL match
    const directResponse = await axios.get(directUrlPattern, { headers });
    
    if (directResponse.status === 200) {
      const $ = cheerio.load(directResponse.data);
      const lyricsDiv = $('.inner-text');
      
      if (lyricsDiv.length) {
        // Verify it's the right song by checking metadata
        const pageArtist = extractArtistFromTekstowo($);
        const pageTitle = extractTitleFromTekstowo($);
        
        const artistMatch = isArtistMatch(artist, pageArtist);
        const titleMatch = isTitleMatch(title, pageTitle);
        
        if (artistMatch || titleMatch) {
          return lyricsDiv.text().trim();
        }
      }
    }
    
    // Try search API
    const searchUrl = 
      `https://www.tekstowo.pl/szukaj,wykonawca,${encodeURIComponent(artist)},tytul,${encodeURIComponent(title)}.html`;
    
    const searchResponse = await axios.get(searchUrl, { headers });
    const $ = cheerio.load(searchResponse.data);
    
    // Find and score search results
    const results = findAndScoreSearchResults($, artist, title);
    
    if (results.length > 0) {
      // Get the highest scoring result
      const bestResult = results[0];
      const lyricsUrl = 'https://www.tekstowo.pl' + bestResult.href;
      
      // Get lyrics page
      const lyricsResponse = await axios.get(lyricsUrl, { headers });
      const lyrics$ = cheerio.load(lyricsResponse.data);
      
      const lyricsDiv = lyrics$('.inner-text');
      if (lyricsDiv.length) {
        return lyricsDiv.text().trim();
      }
    }
    
    // Fallback to Google search as last resort
    return await googleSearchTekstowo(artist, title);
    
  } catch (error) {
    console.error('Error searching tekstowo.pl:', error);
    return null;
  }
}
```

## API Endpoints

### Song Controller

```typescript
@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string
  ) {
    return this.songsService.findAll({ page, limit, search });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.songsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createSongDto: CreateSongDto, @Req() req) {
    return this.songsService.create(createSongDto, req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateSongDto: UpdateSongDto,
    @Req() req
  ) {
    return this.songsService.update(id, updateSongDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Req() req) {
    return this.songsService.remove(id, req.user.id);
  }

  @Post(':id/lyrics')
  @UseGuards(JwtAuthGuard)
  async addLyrics(
    @Param('id') id: string,
    @Body() addLyricsDto: AddLyricsDto,
    @Req() req
  ) {
    return this.songsService.addLyrics(id, addLyricsDto, req.user.id);
  }

  @Post('fetch-from-youtube')
  async fetchFromYoutube(@Body() fetchFromYoutubeDto: FetchFromYoutubeDto) {
    return this.songsService.fetchFromYoutube(fetchFromYoutubeDto.url);
  }

  @Post('search-lyrics')
  async searchLyrics(@Body() searchLyricsDto: SearchLyricsDto) {
    return this.songsService.searchLyrics(
      searchLyricsDto.artist,
      searchLyricsDto.title
    );
  }
}
```

### Lyrics Service

```typescript
@Injectable()
export class LyricsService {
  constructor(
    private readonly tekstowoService: TekstowoService,
    private readonly geniusService: GeniusService,
    private readonly musixmatchService: MusixmatchService,
    private readonly cacheManager: Cache
  ) {}

  async searchLyrics(artist: string, title: string): Promise<string | null> {
    // Try to get from cache first
    const cacheKey = `lyrics:${artist}:${title}`;
    const cachedLyrics = await this.cacheManager.get<string>(cacheKey);
    
    if (cachedLyrics) {
      return cachedLyrics;
    }
    
    // Try each source
    let lyrics: string | null = null;
    
    // Try tekstowo.pl
    lyrics = await this.tekstowoService.searchLyrics(artist, title);
    if (lyrics) {
      await this.cacheManager.set(cacheKey, lyrics, 60 * 60 * 24 * 7); // Cache for a week
      return lyrics;
    }
    
    // Try Genius
    lyrics = await this.geniusService.searchLyrics(artist, title);
    if (lyrics) {
      await this.cacheManager.set(cacheKey, lyrics, 60 * 60 * 24 * 7);
      return lyrics;
    }
    
    // Try Musixmatch
    lyrics = await this.musixmatchService.searchLyrics(artist, title);
    if (lyrics) {
      await this.cacheManager.set(cacheKey, lyrics, 60 * 60 * 24 * 7);
      return lyrics;
    }
    
    return null;
  }
}
```

## Database Schema (Prisma)

```prisma
model User {
  id          String      @id @default(cuid())
  email       String      @unique
  name        String?
  password    String
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  playlists   Playlist[]
  preferences UserPreferences?
}

model UserPreferences {
  id                  String  @id @default(cuid())
  userId              String  @unique
  preferredLyricsLang String?
  darkMode            Boolean @default(false)
  user                User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Song {
  id           String         @id @default(cuid())
  title        String
  artist       String
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  textContents TextContent[]
  audioSources AudioSource[]
  playlists    PlaylistSong[]
}

model TextContent {
  id            String          @id @default(cuid())
  content       String
  contentType   String // "lyrics", "translation", "transcription"
  language      String?
  songId        String
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  song          Song            @relation(fields: [songId], references: [id], onDelete: Cascade)
  timestamps    WordTimestamp[]
}

model AudioSource {
  id          String   @id @default(cuid())
  url         String
  sourceType  String // "youtube", "spotify", etc.
  songId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  song        Song     @relation(fields: [songId], references: [id], onDelete: Cascade)
}

model WordTimestamp {
  id            String      @id @default(cuid())
  word          String
  startTime     Float
  endTime       Float
  textContentId String
  textContent   TextContent @relation(fields: [textContentId], references: [id], onDelete: Cascade)
}

model Playlist {
  id          String         @id @default(cuid())
  name        String
  description String?
  userId      String
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  songs       PlaylistSong[]
}

model PlaylistSong {
  id         String   @id @default(cuid())
  playlistId String
  songId     String
  order      Int
  createdAt  DateTime @default(now())
  playlist   Playlist @relation(fields: [playlistId], references: [id], onDelete: Cascade)
  song       Song     @relation(fields: [songId], references: [id], onDelete: Cascade)

  @@unique([playlistId, songId])
}
```

## Frontend Components

### Song Detail Page

```tsx
export default function SongDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data: song, isLoading, error } = useSongQuery(id);
  const { data: currentUser } = useCurrentUser();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  if (!song) return <NotFound>Song not found</NotFound>;
  
  const lyrics = song.textContents.find(tc => tc.contentType === 'lyrics');
  const youtubeSource = song.audioSources.find(as => as.sourceType === 'youtube');
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900">{song.title}</h1>
            <p className="text-xl text-gray-600">by {song.artist}</p>
            
            {currentUser && (
              <div className="mt-4">
                <EditSongButton songId={song.id} />
                <AddToPlaylistButton songId={song.id} />
              </div>
            )}
            
            {youtubeSource && (
              <div className="mt-6">
                <YoutubeEmbed videoId={extractYoutubeId(youtubeSource.url)} />
              </div>
            )}
          </div>
        </div>
        
        {lyrics && (
          <div className="mt-6 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Lyrics</h2>
              <div className="whitespace-pre-wrap">{lyrics.content}</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
```

### Add Song Form

```tsx
export default function AddSongForm() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<YouTubePreview | null>(null);
  
  const router = useRouter();
  const addSongMutation = useAddSongMutation();
  
  const handleYoutubePreview = async () => {
    if (!youtubeUrl) return;
    
    setIsLoading(true);
    try {
      const data = await fetchYoutubePreview(youtubeUrl);
      setPreviewData(data);
      
      // Auto-fill form fields if they're empty
      if (!title && data.songTitle) setTitle(data.songTitle);
      if (!artist && data.artist) setArtist(data.artist);
      
    } catch (error) {
      toast.error('Failed to fetch YouTube preview');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const songData: CreateSongDto = {
        title: title || (previewData?.songTitle ?? 'Unknown Title'),
        artist: artist || (previewData?.artist ?? 'Unknown Artist'),
        audioSources: [{
          url: youtubeUrl,
          sourceType: 'youtube'
        }]
      };
      
      // Add lyrics if available
      if (lyrics) {
        songData.textContents = [{
          content: lyrics,
          contentType: 'lyrics',
          language: 'unknown'
        }];
      }
      
      const response = await addSongMutation.mutateAsync(songData);
      toast.success('Song added successfully!');
      router.push(`/songs/${response.id}`);
    } catch (error) {
      toast.error('Failed to add song');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900">Add New Song</h1>
      
      <div>
        <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700">
          YouTube URL
        </label>
        <div className="mt-1 flex space-x-2">
          <input
            type="text"
            id="youtube-url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="https://www.youtube.com/watch?v=..."
            required
          />
          <Button
            type="button"
            onClick={handleYoutubePreview}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? <Spinner size="sm" /> : 'Preview'}
          </Button>
        </div>
      </div>
      
      {previewData && (
        <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-md">
          {previewData.thumbnail && (
            <Image
              src={previewData.thumbnail}
              alt="Video thumbnail"
              width={120}
              height={90}
              className="rounded"
            />
          )}
          <div>
            <h3 className="font-medium">{previewData.title}</h3>
            <p className="text-sm text-gray-500">{previewData.channelName}</p>
          </div>
        </div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Song Title (optional - will try to detect)
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="Song Title"
        />
      </div>
      
      <div>
        <label htmlFor="artist" className="block text-sm font-medium text-gray-700">
          Artist Name (optional - will try to detect)
        </label>
        <input
          type="text"
          id="artist"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="Artist Name"
        />
      </div>
      
      <div>
        <label htmlFor="lyrics" className="block text-sm font-medium text-gray-700">
          Lyrics (optional - will try to find automatically)
        </label>
        <textarea
          id="lyrics"
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          rows={8}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="Paste lyrics here or leave empty to search automatically"
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Spinner /> : 'Add Song'}
      </Button>
    </form>
  );
}
```

## Performance Optimizations

### Caching External API Calls

```typescript
@Injectable()
export class YouTubeService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {}

  async extractYoutubeInfo(url: string): Promise<YouTubeInfo> {
    const videoId = this.extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }
    
    // Try to get from cache first
    const cacheKey = `youtube:info:${videoId}`;
    const cachedInfo = await this.cacheManager.get<YouTubeInfo>(cacheKey);
    
    if (cachedInfo) {
      return cachedInfo;
    }
    
    // Fetch from API if not in cache
    const info = await this.fetchYoutubeInfo(videoId);
    
    // Cache the result for 24 hours
    await this.cacheManager.set(cacheKey, info, 60 * 60 * 24);
    
    return info;
  }
  
  // ... implementation of extractVideoId and fetchYoutubeInfo
}
```

### Database Query Optimization

```typescript
@Injectable()
export class SongsRepository {
  constructor(private prisma: PrismaService) {}

  async findAllWithPagination(params: {
    page: number;
    limit: number;
    search?: string;
  }): Promise<PaginatedResult<Song>> {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;
    
    // Build the where clause
    const where: Prisma.SongWhereInput = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { artist: { contains: search, mode: 'insensitive' } },
        {
          textContents: {
            some: {
              content: { contains: search, mode: 'insensitive' }
            }
          }
        }
      ];
    }
    
    // Execute count query and data query in parallel
    const [total, songs] = await Promise.all([
      this.prisma.song.count({ where }),
      this.prisma.song.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          audioSources: {
            // Only fetch minimal info for the list
            select: {
              id: true,
              sourceType: true,
              url: true
            }
          },
          // Don't include textContents in the list for performance
          _count: {
            select: { textContents: true }
          }
        }
      })
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    return {
      data: songs,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }
  
  async findOneWithFullDetails(id: string): Promise<Song | null> {
    return this.prisma.song.findUnique({
      where: { id },
      include: {
        audioSources: true,
        textContents: true
      }
    });
  }
}
```

## Security Measures

### Password Hashing

```typescript
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(registerDto: RegisterDto): Promise<{ access_token: string }> {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    
    // Create user
    const user = await this.usersService.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
    });
    
    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
```

### JWT Authentication Guard

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication required');
    }
    return user;
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email };
  }
}
```

## Error Handling

### Global Exception Filter

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || message;
        code = (exceptionResponse as any).code || this.getErrorCodeFromStatus(status);
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        code = this.getErrorCodeFromStatus(status);
      }
    } else if (exception instanceof PrismaClientKnownRequestError) {
      // Handle Prisma errors
      status = HttpStatus.BAD_REQUEST;
      
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        message = 'Resource already exists';
        code = 'RESOURCE_CONFLICT';
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Resource not found';
        code = 'RESOURCE_NOT_FOUND';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }
    
    response.status(status).json({
      statusCode: status,
      message,
      code,
      timestamp: new Date().toISOString(),
    });
  }
  
  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      default:
        return 'INTERNAL_ERROR';
    }
  }
}
```

## Testing Strategy

### Unit Testing Example (Song Service)

```typescript
describe('SongsService', () => {
  let service: SongsService;
  let repository: MockType<SongsRepository>;
  let youtubeService: MockType<YouTubeService>;
  let lyricsService: MockType<LyricsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SongsService,
        {
          provide: SongsRepository,
          useFactory: mockSongsRepository,
        },
        {
          provide: YouTubeService,
          useFactory: mockYouTubeService,
        },
        {
          provide: LyricsService,
          useFactory: mockLyricsService,
        },
      ],
    }).compile();

    service = module.get<SongsService>(SongsService);
    repository = module.get(SongsRepository);
    youtubeService = module.get(YouTubeService);
    lyricsService = module.get(LyricsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated songs', async () => {
      const paginationParams = { page: 1, limit: 10 };
      const expectedResult = {
        data: [{ id: '1', title: 'Test Song', artist: 'Test Artist' }],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
      
      repository.findAllWithPagination.mockReturnValue(expectedResult);
      
      const result = await service.findAll(paginationParams);
      
      expect(repository.findAllWithPagination).toHaveBeenCalledWith(paginationParams);
      expect(result).toEqual(expectedResult);
    });
  });
  
  describe('fetchFromYoutube', () => {
    it('should extract info from YouTube URL', async () => {
      const youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const youtubeInfo = {
        videoId: 'dQw4w9WgXcQ',
        title: 'Rick Astley - Never Gonna Give You Up',
        artist: 'Rick Astley',
        songTitle: 'Never Gonna Give You Up',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        channelName: 'Rick Astley',
        description: 'Music video description',
      };
      
      youtubeService.extractYoutubeInfo.mockResolvedValue(youtubeInfo);
      
      const result = await service.fetchFromYoutube(youtubeUrl);
      
      expect(youtubeService.extractYoutubeInfo).toHaveBeenCalledWith(youtubeUrl);
      expect(result).toEqual(youtubeInfo);
    });
  });
});
```

### E2E Testing Example (Songs API)

```typescript
describe('Songs API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtToken: string;
  let testSong: Song;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new GlobalExceptionFilter());
    
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
    
    // Create a test user and get JWT token
    const user = await createTestUser(prisma);
    jwtToken = generateJwtToken(user);
    
    // Create a test song
    testSong = await createTestSong(prisma, user.id);
  });

  afterAll(async () => {
    await cleanupDatabase(prisma);
    await app.close();
    await prisma.$disconnect();
  });

  describe('GET /songs', () => {
    it('should return a list of songs', async () => {
      const response = await request(app.getHttpServer())
        .get('/songs')
        .expect(200);
      
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBeGreaterThan(0);
    });
    
    it('should filter songs by search term', async () => {
      const response = await request(app.getHttpServer())
        .get('/songs?search=test')
        .expect(200);
      
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].title).toContain('Test');
    });
  });
  
  describe('GET /songs/:id', () => {
    it('should return a song by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/songs/${testSong.id}`)
        .expect(200);
      
      expect(response.body.id).toBe(testSong.id);
      expect(response.body.title).toBe(testSong.title);
      expect(response.body.artist).toBe(testSong.artist);
      expect(response.body.audioSources).toBeDefined();
      expect(response.body.textContents).toBeDefined();
    });
    
    it('should return 404 for non-existent song', async () => {
      await request(app.getHttpServer())
        .get('/songs/non-existent-id')
        .expect(404);
    });
  });
});
```

## Frontend Tests with React Testing Library

```typescript
describe('SongDetail component', () => {
  beforeEach(() => {
    // Mock API responses
    server.use(
      rest.get('/api/songs/:id', (req, res, ctx) => {
        return res(
          ctx.json({
            id: '1',
            title: 'Test Song',
            artist: 'Test Artist',
            audioSources: [
              { id: '1', sourceType: 'youtube', url: 'https://youtube.com/watch?v=123456' }
            ],
            textContents: [
              { id: '1', contentType: 'lyrics', content: 'Test lyrics content', language: 'en' }
            ]
          })
        );
      })
    );
  });

  it('renders song details correctly', async () => {
    render(<SongDetail songId="1" />);
    
    // Check loading state
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Wait for data to load
    await waitForElementToBeRemoved(() => screen.getByTestId('loading-spinner'));
    
    // Check rendered content
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('by Test Artist')).toBeInTheDocument();
    expect(screen.getByText('Test lyrics content')).toBeInTheDocument();
    expect(screen.getByTestId('youtube-embed')).toBeInTheDocument();
  });
  
  it('shows error state when API fails', async () => {
    server.use(
      rest.get('/api/songs/:id', (req, res, ctx) => {
        return res(ctx.status(404));
      })
    );
    
    render(<SongDetail songId="1" />);
    
    await waitForElementToBeRemoved(() => screen.getByTestId('loading-spinner'));
    
    expect(screen.getByText(/not found/i)).toBeInTheDocument();
  });
});
```