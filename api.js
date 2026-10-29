/**
 * VYORA – API / Service abstraction layer
 * ---------------------------------------
 * Frontend must not depend on localStorage directly for domain ops.
 * Store is used only as a development fallback adapter.
 *
 * Future: set window.VYORA_API_BASE = 'https://api.vyora.app/v1'
 * and implement fetch-based methods. Never put secret keys here.
 */
const API = {
  // Environment config (public only)
  config: {
    baseUrl: (typeof window !== 'undefined' && window.VYORA_API_BASE) || null,
    useLocalFallback: true,
    appName: 'VYORA',
    tagline: 'Music Without Borders.',
  },

  async _local(fn) {
    if (!this.config.useLocalFallback) throw new Error('API offline and no local fallback');
    return fn();
  },

  // ---- Auth ----
  async login(email, password) {
    return this._local(() => Store.login(email, password));
  },
  async signup(displayName, email, password) {
    return this._local(() => Store.signup(displayName, email, password));
  },
  async logout() {
    return this._local(() => { Store.logout(); return { ok: true }; });
  },
  async getSession() {
    return this._local(() => ({
      loggedIn: Store.isLoggedIn(),
      user: Store.getUser(),
    }));
  },

  // ---- Catalog ----
  async getTracks() {
    return this._local(() => CATALOG.tracks.map(enrichTrack));
  },
  async getTrack(id) {
    return this._local(() => enrichTrack(getTrack(id)));
  },
  async getArtists() {
    return this._local(() => CATALOG.artists);
  },
  async getArtist(id) {
    return this._local(() => getArtist(id));
  },
  async getAlbums() {
    return this._local(() => CATALOG.albums.map(enrichAlbum));
  },
  async getAlbum(id) {
    return this._local(() => enrichAlbum(getAlbum(id)));
  },
  async getGenres() {
    return this._local(() => GENRES);
  },
  async getGenre(id) {
    return this._local(() => getGenre(id));
  },

  // ---- Search ----
  async search(q) {
    return this._local(() => {
      const query = (q || '').toLowerCase().trim();
      if (!query) return { tracks: [], artists: [], albums: [], playlists: [], genres: [] };
      Store.addRecentSearch(q.trim());
      return {
        tracks: CATALOG.tracks.filter(t => {
          const e = enrichTrack(t);
          return e.title.toLowerCase().includes(query) || e.artistName.toLowerCase().includes(query) || e.albumTitle.toLowerCase().includes(query);
        }).map(enrichTrack),
        artists: CATALOG.artists.filter(a => a.name.toLowerCase().includes(query)),
        albums: CATALOG.albums.filter(a => a.title.toLowerCase().includes(query) || (getArtist(a.artistId)?.name || '').toLowerCase().includes(query)),
        playlists: Store.getPlaylists().filter(p => p.name.toLowerCase().includes(query) || (p.description || '').toLowerCase().includes(query)),
        genres: GENRES.filter(g => g.name.toLowerCase().includes(query)),
      };
    });
  },

  // ---- Charts / Discover (mock sample data – not real-world stats) ----
  async getCharts() {
    return this._local(() => {
      const top = [...CATALOG.tracks].sort((a, b) => b.plays - a.plays).slice(0, 20).map(enrichTrack);
      return {
        globalTop: top,
        trending: top.slice(0, 10),
        mostPlayed: top.slice(0, 10),
        risingArtists: [...CATALOG.artists].sort((a, b) => b.monthlyListeners - a.monthlyListeners).slice(0, 8),
        popularAlbums: [...CATALOG.albums].sort((a, b) => (b.year || 0) - (a.year || 0)).slice(0, 8).map(enrichAlbum),
        note: 'Sample/demo chart data for prototype only.',
      };
    });
  },

  async getAnalytics() {
    return this._local(() => ({ ...ANALYTICS, note: 'Mock analytics for prototype only.' }));
  },

  // ---- User library ----
  async getFavorites() {
    return this._local(() => Store.getFavorites().map(id => enrichTrack(getTrack(id))).filter(Boolean));
  },
  async toggleFavorite(trackId) {
    return this._local(() => ({ favorited: Store.toggleFavorite(trackId) }));
  },
  async getPlaylists() {
    return this._local(() => Store.getPlaylists());
  },
  async createPlaylist(name, description, isPublic) {
    return this._local(() => Store.createPlaylist(name, description, isPublic));
  },
  async getHistory() {
    return this._local(() => Store.getHistory());
  },
  async getFollows() {
    return this._local(() => Store.getFollows());
  },
  async toggleFollow(artistId) {
    return this._local(() => ({ following: Store.toggleFollow(artistId) }));
  },

  // ---- Artist portal (demo – upload requires backend) ----
  async getArtistPortalSummary(artistId) {
    return this._local(() => {
      const artist = getArtist(artistId) || CATALOG.artists[0];
      const tracks = CATALOG.tracks.filter(t => t.artistId === artist.id);
      const albums = CATALOG.albums.filter(a => a.artistId === artist.id);
      return {
        artist,
        trackCount: tracks.length,
        albumCount: albums.length,
        streams: tracks.reduce((s, t) => s + (t.plays || 0), 0),
        listeners: artist.monthlyListeners || 0,
        followers: Math.floor((artist.monthlyListeners || 0) * 0.12),
        // earnings intentionally omitted / not faked as real money
        earningsNote: 'Royalty reporting requires a legitimate payment backend. No fake balances shown.',
        tracks: tracks.map(enrichTrack),
        albums: albums.map(enrichAlbum),
      };
    });
  },
};
