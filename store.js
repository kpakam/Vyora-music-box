/**
 * VYORA – Local persistence layer
 * Maps cleanly to future backend tables:
 * users, favorites, follows, playlists, playlist_tracks,
 * listening_history, play_counts, saved_albums, recent_searches
 */
const Store = {
  KEYS: {
    favorites: 'sw_favorites',
    playlists: 'sw_playlists',
    user: 'sw_user',
    session: 'sw_session',
    recent: 'sw_recent',
    history: 'sw_history',
    theme: 'sw_theme',
    follows: 'sw_follows',
    savedAlbums: 'sw_saved_albums',
    recentSearches: 'sw_recent_searches',
    playerState: 'sw_player_state',
    playCounts: 'sw_play_counts',
  },

  get(key, fallback) {
    try {
      const raw = localStorage.getItem(this.KEYS[key] || key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    localStorage.setItem(this.KEYS[key] || key, JSON.stringify(value));
  },

  isLoggedIn() {
    return !!this.get('session', null);
  },

  getUser() {
    return this.get('user', {
      id: 'u_guest',
      username: 'guest',
      displayName: 'Guest User',
      email: 'guest@vyora.app',
      avatarInitial: 'G',
      isAdmin: true,
      plan: 'free',
      joined: '2025-01-15',
      followedArtists: [],
      savedAlbums: [],
    });
  },

  setUser(user) {
    this.set('user', user);
  },

  login(email, password) {
    if (!email || !password) return { ok: false, error: 'Email and password required' };
    const user = {
      id: 'u_' + Date.now(),
      username: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, ''),
      displayName: email.split('@')[0],
      email,
      avatarInitial: email[0].toUpperCase(),
      isAdmin: email.includes('admin'),
      plan: 'free',
      joined: new Date().toISOString().slice(0, 10),
      followedArtists: this.get('follows', []),
      savedAlbums: this.get('savedAlbums', []),
    };
    this.setUser(user);
    this.set('session', { userId: user.id, at: Date.now() });
    return { ok: true, user };
  },

  signup(displayName, email, password) {
    if (!displayName || !email || !password) return { ok: false, error: 'All fields required' };
    if (password.length < 4) return { ok: false, error: 'Password must be at least 4 characters (demo)' };
    const res = this.login(email, password);
    if (res.ok) {
      res.user.displayName = displayName;
      res.user.avatarInitial = displayName[0].toUpperCase();
      this.setUser(res.user);
    }
    return res;
  },

  logout() {
    this.set('session', null);
  },

  getFavorites() {
    return this.get('favorites', []);
  },
  isFavorite(trackId) {
    return this.getFavorites().includes(trackId);
  },
  toggleFavorite(trackId) {
    let favs = this.getFavorites();
    if (favs.includes(trackId)) favs = favs.filter(id => id !== trackId);
    else favs.push(trackId);
    this.set('favorites', favs);
    return favs.includes(trackId);
  },

  getFollows() {
    return this.get('follows', []);
  },
  isFollowing(artistId) {
    return this.getFollows().includes(artistId);
  },
  toggleFollow(artistId) {
    let list = this.getFollows();
    if (list.includes(artistId)) list = list.filter(id => id !== artistId);
    else list.push(artistId);
    this.set('follows', list);
    const u = this.getUser();
    u.followedArtists = list;
    this.setUser(u);
    return list.includes(artistId);
  },

  getSavedAlbums() {
    return this.get('savedAlbums', []);
  },
  isAlbumSaved(albumId) {
    return this.getSavedAlbums().includes(albumId);
  },
  toggleSaveAlbum(albumId) {
    let list = this.getSavedAlbums();
    if (list.includes(albumId)) list = list.filter(id => id !== albumId);
    else list.push(albumId);
    this.set('savedAlbums', list);
    return list.includes(albumId);
  },

  getPlaylists() {
    return this.get('playlists', [
      { id: 'pl1', name: 'Liked Songs', description: 'Your favorites', tracks: [], system: true, isPublic: false, ownerId: 'system' },
      { id: 'pl2', name: 'Chill Mix', description: 'Relaxing vibes', tracks: ['t8', 't9', 't12'], system: false, isPublic: true, ownerId: 'u_guest', createdAt: '2025-06-01' },
    ]);
  },
  savePlaylists(list) {
    this.set('playlists', list);
  },
  createPlaylist(name, description = '', isPublic = false) {
    const list = this.getPlaylists();
    const u = this.getUser();
    const pl = {
      id: 'pl' + Date.now(),
      name,
      description,
      tracks: [],
      system: false,
      isPublic: !!isPublic,
      ownerId: u.id,
      createdAt: new Date().toISOString(),
    };
    list.push(pl);
    this.savePlaylists(list);
    return pl;
  },
  renamePlaylist(playlistId, name) {
    const list = this.getPlaylists();
    const pl = list.find(p => p.id === playlistId);
    if (pl && !pl.system) {
      pl.name = name;
      this.savePlaylists(list);
    }
  },
  setPlaylistPublic(playlistId, isPublic) {
    const list = this.getPlaylists();
    const pl = list.find(p => p.id === playlistId);
    if (pl && !pl.system) {
      pl.isPublic = !!isPublic;
      this.savePlaylists(list);
    }
  },
  addToPlaylist(playlistId, trackId) {
    const list = this.getPlaylists();
    const pl = list.find(p => p.id === playlistId);
    if (pl && !pl.tracks.includes(trackId)) {
      pl.tracks.push(trackId);
      this.savePlaylists(list);
    }
  },
  removeFromPlaylist(playlistId, trackId) {
    const list = this.getPlaylists();
    const pl = list.find(p => p.id === playlistId);
    if (pl) {
      pl.tracks = pl.tracks.filter(id => id !== trackId);
      this.savePlaylists(list);
    }
  },
  reorderPlaylistTracks(playlistId, fromIdx, toIdx) {
    const list = this.getPlaylists();
    const pl = list.find(p => p.id === playlistId);
    if (!pl || fromIdx === toIdx) return;
    const arr = pl.tracks.slice();
    const [item] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, item);
    pl.tracks = arr;
    this.savePlaylists(list);
  },
  deletePlaylist(playlistId) {
    const list = this.getPlaylists().filter(p => p.id !== playlistId || p.system);
    this.savePlaylists(list);
  },

  getHistory() {
    return this.get('history', []);
  },
  addHistory(trackId) {
    let history = this.getHistory();
    const existing = history.find(h => h.trackId === trackId);
    if (existing) {
      existing.playCount = (existing.playCount || 1) + 1;
      existing.playedAt = new Date().toISOString();
      history = [existing, ...history.filter(h => h.trackId !== trackId)];
    } else {
      history.unshift({ trackId, playedAt: new Date().toISOString(), playCount: 1 });
    }
    this.set('history', history.slice(0, 100));
    let recent = this.get('recent', []);
    recent = [trackId, ...recent.filter(id => id !== trackId)].slice(0, 30);
    this.set('recent', recent);
    const counts = this.get('playCounts', {});
    counts[trackId] = (counts[trackId] || 0) + 1;
    this.set('playCounts', counts);
  },
  getRecent() {
    return this.get('recent', []);
  },
  getPlayCount(trackId) {
    return (this.get('playCounts', {})[trackId]) || 0;
  },

  getRecentSearches() {
    return this.get('recentSearches', []);
  },
  addRecentSearch(q) {
    if (!q || !q.trim()) return;
    let list = this.getRecentSearches().filter(s => s.toLowerCase() !== q.toLowerCase());
    list.unshift(q.trim());
    this.set('recentSearches', list.slice(0, 10));
  },
  clearRecentSearches() {
    this.set('recentSearches', []);
  },

  savePlayerState(state) {
    this.set('playerState', state);
  },
  getPlayerState() {
    return this.get('playerState', null);
  },

  getTheme() {
    return this.get('theme', 'dark');
  },
  setTheme(theme) {
    this.set('theme', theme);
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : '');
  },
};
