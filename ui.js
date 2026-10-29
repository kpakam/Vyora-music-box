/**
 * SonicWave – UI rendering layer
 * All pages, components, modals. Buttons either work locally or show a clear backend notice.
 */
const UI = {
  content: null,
  currentPage: 'home',

  init() {
    this.content = document.getElementById('content');
    this.bindNav();
    this.bindGlobal();
    Store.setTheme(Store.getTheme());
    this.updateUserChip();
    this.showAdminNav();
  },

  bindNav() {
    document.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const page = el.dataset.page;
        location.hash = page === 'home' ? '#/' : `#/${page}`;
      });
    });
    document.getElementById('menu-toggle')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });
    document.getElementById('create-playlist-btn')?.addEventListener('click', () => this.showCreatePlaylistModal());
    document.getElementById('user-chip')?.addEventListener('click', () => {
      location.hash = Store.isLoggedIn() ? '#/profile' : '#/auth';
    });
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      const next = Store.getTheme() === 'dark' ? 'light' : 'dark';
      Store.setTheme(next);
      document.getElementById('theme-toggle').textContent = next === 'dark' ? '🌙' : '☀️';
    });
    document.getElementById('theme-toggle').textContent = Store.getTheme() === 'dark' ? '🌙' : '☀️';

    document.getElementById('global-search')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = e.target.value.trim();
        if (q) location.hash = `#/discover?q=${encodeURIComponent(q)}`;
      }
    });

    document.getElementById('modal-close')?.addEventListener('click', () => this.closeModal());
    document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') this.closeModal();
    });
    document.getElementById('close-queue')?.addEventListener('click', () => this.toggleQueue(false));
  },

  bindGlobal() {
    this.content.addEventListener('click', (e) => {
      const playBtn = e.target.closest('[data-play]');
      if (playBtn) {
        e.stopPropagation();
        const id = playBtn.dataset.play;
        const track = enrichTrack(getTrack(id));
        if (track) {
          if (playBtn.dataset.context === 'album' || playBtn.dataset.context === 'playlist') {
            const ids = JSON.parse(playBtn.dataset.ids || '[]');
            Player.playAlbumOrPlaylist(ids, id);
          } else {
            Player.playTrack(track, CATALOG.tracks);
          }
        }
        return;
      }
      const favBtn = e.target.closest('[data-fav]');
      if (favBtn) {
        e.stopPropagation();
        const id = favBtn.dataset.fav;
        const on = Store.toggleFavorite(id);
        favBtn.textContent = on ? '♥' : '♡';
        favBtn.classList.toggle('active', on);
        return;
      }
      const card = e.target.closest('[data-nav]');
      if (card) location.hash = card.dataset.nav;
    });
  },

  setActiveNav(page) {
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });
    document.getElementById('sidebar')?.classList.remove('open');
  },

  updateUserChip() {
    const u = Store.getUser();
    const logged = Store.isLoggedIn();
    document.getElementById('user-name').textContent = logged ? (u.displayName || u.name) : 'Sign in';
    document.getElementById('user-avatar').textContent = logged ? (u.avatarInitial || 'U') : '?';
  },

  showAdminNav() {
    const u = Store.getUser();
    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = (Store.isLoggedIn() && u.isAdmin) ? '' : 'none';
    });
  },

  updatePlayerUI(track) {
    if (!track) return;
    document.getElementById('player-title').textContent = track.title;
    document.getElementById('player-artist').textContent = track.artistName;
    const art = document.getElementById('player-art');
    art.style.background = `linear-gradient(135deg, ${track.imageColor}, ${track.imageColor}99)`;
    art.textContent = '♪';
    const fav = document.getElementById('player-fav');
    const on = Store.isFavorite(track.id);
    fav.textContent = on ? '♥' : '♡';
    fav.classList.toggle('active', on);
    this.updatePlayButton();
  },

  updatePlayButton() {
    document.getElementById('btn-play').textContent = Player.isPlaying ? '⏸' : '▶';
  },

  artStyle(color) {
    return `background: linear-gradient(135deg, ${color}, ${color}aa);`;
  },

  renderQueue() {
    const list = document.getElementById('queue-list');
    if (!list) return;
    list.innerHTML = Player.queue.map((t, i) => `
      <div class="track-row ${i === Player.index ? 'playing' : ''}" data-play="${t.id}" style="grid-template-columns: 1fr 40px;">
        <div class="track-info">
          <div class="track-art placeholder-art" style="${this.artStyle(t.imageColor)}"></div>
          <div class="track-meta">
            <div class="track-title">${this.esc(t.title)}</div>
            <div class="track-artist">${this.esc(t.artistName)}</div>
          </div>
        </div>
        <span class="track-duration">${formatDuration(t.duration)}</span>
      </div>
    `).join('') || '<div class="empty">Queue is empty</div>';
  },

  toggleQueue(force) {
    const panel = document.getElementById('queue-panel');
    if (force === false) panel.classList.add('hidden');
    else panel.classList.toggle('hidden');
    this.renderQueue();
  },

  // ---------- HOME ----------
  renderHome() {
    this.setActiveNav('home');
    const recentIds = Store.getRecent();
    const recent = recentIds.map(id => enrichTrack(getTrack(id))).filter(Boolean);
    const topTracks = [...CATALOG.tracks].sort((a, b) => b.plays - a.plays).slice(0, 8).map(enrichTrack);
    const newReleases = [...CATALOG.albums].sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || '')).slice(0, 6);
    const trending = [...CATALOG.tracks].sort((a, b) => b.plays - a.plays).slice(0, 5).map(enrichTrack);
    const featured = CATALOG.albums[0];
    const charts = topTracks.slice(0, 10);

    this.content.innerHTML = `
      <h1 class="section-title">Good ${this.greeting()}</h1>
      <p class="text-muted mb-4" style="font-size:0.9rem;">VYORA · Music Without Borders.</p>
      <div class="ad-slot"><span>Ad placement (free tier) — premium removes ads · backend required</span></div>

      ${featured ? `
      <div class="hero featured-hero mb-4" data-nav="#/album/${featured.id}" style="cursor:pointer;">
        <div class="hero-art placeholder-art" style="${this.artStyle(featured.imageColor)}; font-size:3rem;">💿</div>
        <div class="hero-info">
          <div class="hero-type">Featured</div>
          <h2 class="hero-title" style="font-size:1.8rem;">${this.esc(featured.title)}</h2>
          <div class="hero-meta">${this.esc(getArtist(featured.artistId)?.name)} · ${featured.year}</div>
          <div class="hero-actions">
            <button class="btn btn-primary" data-play="${featured.tracks[0]}" data-context="album" data-ids='${JSON.stringify(featured.tracks)}'>▶ Play</button>
          </div>
        </div>
      </div>` : ''}

      <div class="section-header"><h2 class="section-title" style="font-size:1.15rem;">Genre shortcuts</h2></div>
      <div class="genre-row mb-4">
        ${GENRES.slice(0, 8).map(g => `
          <button class="genre-chip" data-nav="#/genre/${g.id}" style="--gcolor:${g.color}">${this.esc(g.name)}</button>
        `).join('')}
        <button class="genre-chip" data-nav="#/genres" style="--gcolor:#71717a">All →</button>
      </div>

      ${recent.length ? `
        <div class="section-header"><h2 class="section-title" style="font-size:1.15rem;">Continue listening</h2></div>
        <div class="track-list mb-4">${recent.slice(0, 5).map((t, i) => this.trackRow(t, i + 1)).join('')}</div>
      ` : ''}

      <div class="section-header"><h2 class="section-title" style="font-size:1.15rem;">Trending</h2></div>
      <div class="track-list mb-4">${trending.map((t, i) => this.trackRow(t, i + 1)).join('')}</div>

      <div class="section-header"><h2 class="section-title" style="font-size:1.15rem;">New releases</h2></div>
      <div class="grid mb-4">${newReleases.map(al => this.albumCard(al)).join('')}</div>

      <div class="section-header"><h2 class="section-title" style="font-size:1.15rem;">Popular artists</h2></div>
      <div class="grid mb-4">${CATALOG.artists.slice(0, 6).map(a => this.artistCard(a)).join('')}</div>

      <div class="section-header"><h2 class="section-title" style="font-size:1.15rem;">Popular albums</h2></div>
      <div class="grid mb-4">${CATALOG.albums.slice(0, 6).map(al => this.albumCard(al)).join('')}</div>

      <div class="section-header"><h2 class="section-title" style="font-size:1.15rem;">Charts</h2></div>
      <div class="track-list mb-4">${charts.map((t, i) => this.trackRow(t, i + 1)).join('')}</div>

      <div class="section-header"><h2 class="section-title" style="font-size:1.15rem;">Recommended</h2></div>
      <div class="track-list mb-4">${topTracks.slice(3, 8).map((t, i) => this.trackRow(t, i + 1)).join('')}</div>

      <div class="section-header"><h2 class="section-title" style="font-size:1.15rem;">Recently added</h2></div>
      <div class="grid">${newReleases.slice(0, 4).map(al => this.albumCard(al)).join('')}</div>
    `;
  },

  // ---------- SEARCH ----------
  renderSearch(query = '') {
    this.setActiveNav('search');
    const q = (query || '').toLowerCase().trim();
    if (q) Store.addRecentSearch(query.trim());

    let tracks = [], albums = [], artists = [], playlists = [], genres = [];
    if (q) {
      tracks = CATALOG.tracks.filter(t => {
        const e = enrichTrack(t);
        return e.title.toLowerCase().includes(q) || e.artistName.toLowerCase().includes(q) || e.albumTitle.toLowerCase().includes(q);
      }).map(enrichTrack);
      albums = CATALOG.albums.filter(a => a.title.toLowerCase().includes(q) || getArtist(a.artistId)?.name.toLowerCase().includes(q));
      artists = CATALOG.artists.filter(a => a.name.toLowerCase().includes(q));
      playlists = Store.getPlaylists().filter(p => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
      genres = GENRES.filter(g => g.name.toLowerCase().includes(q));
    }

    const recentSearches = Store.getRecentSearches();

    this.content.innerHTML = `
      <h1 class="section-title">Search</h1>
      <div class="search-bar mb-4" style="max-width:100%;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="search-input" placeholder="Songs, artists, albums, playlists, genres..." value="${this.esc(query)}" />
      </div>
      ${!q ? `
        <div class="empty">
          <div class="empty-icon">🔍</div>
          <p>Search for songs, artists, albums, playlists, or genres</p>
        </div>
        ${recentSearches.length ? `
          <h2 class="section-title" style="font-size:1.05rem;">Recent searches</h2>
          <div class="flex gap-2" style="flex-wrap:wrap;margin-bottom:16px;">
            ${recentSearches.map(s => `<button class="genre-chip" data-nav="#/discover?q=${encodeURIComponent(s)}" style="--gcolor:var(--accent)">${this.esc(s)}</button>`).join('')}
            <button class="btn btn-secondary" id="clear-searches" style="padding:6px 12px;font-size:0.8rem;">Clear</button>
          </div>
        ` : ''}
      ` : ''}
      ${genres.length ? `<h2 class="section-title" style="font-size:1.05rem;">Genres</h2><div class="genre-row mb-4">${genres.map(g => `<button class="genre-chip" data-nav="#/genre/${g.id}" style="--gcolor:${g.color}">${this.esc(g.name)}</button>`).join('')}</div>` : ''}
      ${artists.length ? `<h2 class="section-title" style="font-size:1.05rem;">Artists</h2><div class="grid mb-4">${artists.map(a => this.artistCard(a)).join('')}</div>` : ''}
      ${albums.length ? `<h2 class="section-title" style="font-size:1.05rem;">Albums</h2><div class="grid mb-4">${albums.map(a => this.albumCard(a)).join('')}</div>` : ''}
      ${playlists.length ? `<h2 class="section-title" style="font-size:1.05rem;">Playlists</h2><div class="grid mb-4">${playlists.map(p => this.playlistCard(p)).join('')}</div>` : ''}
      ${tracks.length ? `<h2 class="section-title" style="font-size:1.05rem;">Songs</h2><div class="track-list">${tracks.map((t, i) => this.trackRow(t, i + 1)).join('')}</div>` : ''}
      ${q && !tracks.length && !albums.length && !artists.length && !playlists.length && !genres.length ? `<div class="empty"><p>No results for "${this.esc(query)}"</p></div>` : ''}
    `;
    const input = document.getElementById('search-input');
    input?.focus();
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') location.hash = `#/discover?q=${encodeURIComponent(input.value.trim())}`;
    });
    document.getElementById('clear-searches')?.addEventListener('click', () => {
      Store.clearRecentSearches();
      this.renderSearch('');
    });
  },

  // ---------- LIBRARY ----------
  renderLibrary() {
    this.setActiveNav('library');
    const playlists = Store.getPlaylists();
    const recent = Store.getRecent().map(id => enrichTrack(getTrack(id))).filter(Boolean);
    const savedAlbums = Store.getSavedAlbums().map(id => getAlbum(id)).filter(Boolean);
    const history = Store.getHistory().slice(0, 20);

    this.content.innerHTML = `
      <h1 class="section-title">Your Library</h1>
      <div class="tabs">
        <button class="tab active" data-tab="playlists">Playlists</button>
        <button class="tab" data-tab="recent">Recently Played</button>
        <button class="tab" data-tab="albums">Saved Albums</button>
        <button class="tab" data-tab="history">History</button>
      </div>
      <div id="lib-content">
        <div class="grid">${playlists.map(p => this.playlistCard(p)).join('')}</div>
      </div>
    `;
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const c = document.getElementById('lib-content');
        if (tab.dataset.tab === 'playlists') {
          c.innerHTML = `<div class="grid">${Store.getPlaylists().map(p => this.playlistCard(p)).join('')}</div>`;
        } else if (tab.dataset.tab === 'recent') {
          c.innerHTML = recent.length
            ? `<div class="track-list">${recent.map((t, i) => this.trackRow(t, i + 1)).join('')}</div>`
            : `<div class="empty"><p>No recently played tracks</p></div>`;
        } else if (tab.dataset.tab === 'albums') {
          c.innerHTML = savedAlbums.length
            ? `<div class="grid">${savedAlbums.map(a => this.albumCard(a)).join('')}</div>`
            : `<div class="empty"><p>No saved albums yet</p></div>`;
        } else {
          c.innerHTML = history.length
            ? `<div class="track-list">${history.map((h, i) => {
                const t = enrichTrack(getTrack(h.trackId));
                if (!t) return '';
                return this.trackRow(t, i + 1) + `<div class="text-muted" style="font-size:0.75rem;padding:0 12px 8px;">Played ${h.playCount || 1}× · ${new Date(h.playedAt).toLocaleString()}</div>`;
              }).join('')}</div>`
            : `<div class="empty"><p>No listening history yet</p></div>`;
        }
      });
    });
  },

  // ---------- FAVORITES ----------
  renderFavorites() {
    this.setActiveNav('favorites');
    const ids = Store.getFavorites();
    const tracks = ids.map(id => enrichTrack(getTrack(id))).filter(Boolean);
    this.content.innerHTML = `
      <div class="hero">
        <div class="hero-art placeholder-art" style="background: linear-gradient(135deg, #ec4899, #8b5cf6); font-size:4rem;">♥</div>
        <div class="hero-info">
          <div class="hero-type">Playlist</div>
          <h1 class="hero-title">Liked Songs</h1>
          <div class="hero-meta">${tracks.length} songs</div>
          <div class="hero-actions">
            ${tracks.length ? `<button class="btn btn-primary" id="play-all-favs">▶ Play</button>
            <button class="btn btn-secondary" id="shuffle-favs">⇄ Shuffle</button>` : ''}
          </div>
        </div>
      </div>
      ${tracks.length
        ? `<div class="track-list">${tracks.map((t, i) => this.trackRow(t, i + 1, true)).join('')}</div>`
        : `<div class="empty"><div class="empty-icon">♡</div><p>Songs you like will appear here</p></div>`}
    `;
    document.getElementById('play-all-favs')?.addEventListener('click', () => Player.playAlbumOrPlaylist(ids));
    document.getElementById('shuffle-favs')?.addEventListener('click', () => {
      Player.shuffle = true;
      document.getElementById('btn-shuffle').style.color = 'var(--accent)';
      Player.playAlbumOrPlaylist(ids);
    });
  },

  // ---------- PLAYLISTS ----------
  renderPlaylists() {
    this.setActiveNav('playlists');
    const list = Store.getPlaylists();
    this.content.innerHTML = `
      <div class="section-header">
        <h1 class="section-title">Playlists</h1>
        <button class="btn btn-primary" id="new-pl-btn">+ New Playlist</button>
      </div>
      <div class="grid">${list.map(p => this.playlistCard(p)).join('')}</div>
    `;
    document.getElementById('new-pl-btn').addEventListener('click', () => this.showCreatePlaylistModal());
  },

  renderPlaylist(id) {
    this.setActiveNav('playlists');
    let pl = Store.getPlaylists().find(p => p.id === id);
    if (!pl) { this.content.innerHTML = '<div class="empty">Playlist not found</div>'; return; }
    if (pl.system && pl.name === 'Liked Songs') {
      pl = { ...pl, tracks: Store.getFavorites() };
    }
    const tracks = pl.tracks.map(tid => enrichTrack(getTrack(tid))).filter(Boolean);

    this.content.innerHTML = `
      <div class="hero">
        <div class="hero-art placeholder-art" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); font-size:3rem;">♫</div>
        <div class="hero-info">
          <div class="hero-type">Playlist ${pl.isPublic ? '· Public' : '· Private'}</div>
          <h1 class="hero-title">${this.esc(pl.name)}</h1>
          <div class="hero-meta">${this.esc(pl.description || '')} · ${tracks.length} songs</div>
          <div class="hero-actions">
            ${tracks.length ? `<button class="btn btn-primary" id="play-pl">▶ Play</button>
            <button class="btn btn-secondary" id="shuffle-pl">⇄ Shuffle</button>` : ''}
            ${!pl.system ? `
              <button class="btn btn-secondary" id="rename-pl">Rename</button>
              <button class="btn btn-secondary" id="toggle-public">${pl.isPublic ? 'Make Private' : 'Make Public'}</button>
              <button class="btn btn-secondary" id="share-pl">Share</button>
              <button class="btn btn-danger" id="del-pl">Delete</button>
            ` : ''}
          </div>
        </div>
      </div>
      ${tracks.length
        ? `<div class="track-list">${tracks.map((t, i) => this.trackRow(t, i + 1, !pl.system, pl.id)).join('')}</div>`
        : `<div class="empty"><p>This playlist is empty. Search and add songs!</p></div>`}
    `;
    document.getElementById('play-pl')?.addEventListener('click', () => Player.playAlbumOrPlaylist(pl.tracks));
    document.getElementById('shuffle-pl')?.addEventListener('click', () => {
      Player.shuffle = true;
      document.getElementById('btn-shuffle').style.color = 'var(--accent)';
      Player.playAlbumOrPlaylist(pl.tracks);
    });
    document.getElementById('del-pl')?.addEventListener('click', () => {
      if (confirm('Delete this playlist?')) {
        Store.deletePlaylist(id);
        location.hash = '#/playlists';
      }
    });
    document.getElementById('rename-pl')?.addEventListener('click', () => {
      const name = prompt('New name', pl.name);
      if (name && name.trim()) {
        Store.renamePlaylist(id, name.trim());
        this.renderPlaylist(id);
      }
    });
    document.getElementById('toggle-public')?.addEventListener('click', () => {
      Store.setPlaylistPublic(id, !pl.isPublic);
      this.renderPlaylist(id);
    });
    document.getElementById('share-pl')?.addEventListener('click', () => {
      const url = location.origin + location.pathname + '#/playlist/' + id;
      if (navigator.share) navigator.share({ title: pl.name, url }).catch(() => {});
      else { navigator.clipboard?.writeText(url); alert('Link copied: ' + url); }
    });
  },

  // ---------- ARTIST ----------
  renderArtist(id) {
    this.setActiveNav('home');
    const artist = getArtist(id);
    if (!artist) { this.content.innerHTML = '<div class="empty">Artist not found</div>'; return; }
    const albums = CATALOG.albums.filter(a => a.artistId === id && a.type !== 'ep');
    const eps = CATALOG.albums.filter(a => a.artistId === id && a.type === 'ep');
    const singles = []; // reserved for future singles model
    const tracks = CATALOG.tracks.filter(t => t.artistId === id).map(enrichTrack).sort((a, b) => b.plays - a.plays);
    const related = (artist.related || []).map(rid => getArtist(rid)).filter(Boolean);
    const following = Store.isFollowing(id);

    this.content.innerHTML = `
      <div class="hero">
        <div class="hero-art placeholder-art" style="${this.artStyle(artist.imageColor)}; border-radius:50%; font-size:4rem;">🎤</div>
        <div class="hero-info">
          <div class="hero-type">Artist</div>
          <h1 class="hero-title">${this.esc(artist.name)}</h1>
          <div class="hero-meta">${formatPlays(artist.monthlyListeners)} monthly listeners</div>
          <p class="text-muted mb-4" style="max-width:520px;">${this.esc(artist.bio)}</p>
          <div class="hero-actions">
            <button class="btn btn-primary" id="play-artist">▶ Play</button>
            <button class="btn btn-secondary" id="follow-artist">${following ? 'Following' : 'Follow'}</button>
          </div>
        </div>
      </div>
      <h2 class="section-title" style="font-size:1.15rem;">Popular</h2>
      <div class="track-list mb-4">${tracks.slice(0, 5).map((t, i) => this.trackRow(t, i + 1)).join('')}</div>
      ${albums.length ? `<h2 class="section-title" style="font-size:1.15rem;">Albums</h2><div class="grid mb-4">${albums.map(a => this.albumCard(a)).join('')}</div>` : ''}
      ${eps.length ? `<h2 class="section-title" style="font-size:1.15rem;">EPs</h2><div class="grid mb-4">${eps.map(a => this.albumCard(a)).join('')}</div>` : ''}
      ${related.length ? `<h2 class="section-title" style="font-size:1.15rem;">Related artists</h2><div class="grid">${related.map(a => this.artistCard(a)).join('')}</div>` : ''}
    `;
    document.getElementById('play-artist')?.addEventListener('click', () => Player.playAlbumOrPlaylist(tracks.map(t => t.id)));
    document.getElementById('follow-artist')?.addEventListener('click', (e) => {
      const on = Store.toggleFollow(id);
      e.target.textContent = on ? 'Following' : 'Follow';
    });
  },

  // ---------- ALBUM ----------
  renderAlbum(id) {
    this.setActiveNav('home');
    const album = getAlbum(id);
    if (!album) { this.content.innerHTML = '<div class="empty">Album not found</div>'; return; }
    const artist = getArtist(album.artistId);
    const tracks = album.tracks.map(tid => enrichTrack(getTrack(tid))).filter(Boolean);
    const saved = Store.isAlbumSaved(id);

    this.content.innerHTML = `
      <div class="hero">
        <div class="hero-art placeholder-art" style="${this.artStyle(album.imageColor)}; font-size:4rem;">💿</div>
        <div class="hero-info">
          <div class="hero-type">${(album.type || 'album').toUpperCase()}</div>
          <h1 class="hero-title">${this.esc(album.title)}</h1>
          <div class="hero-meta">
            <a href="#/artist/${album.artistId}" style="color:var(--text);text-decoration:none;font-weight:600;">${this.esc(artist?.name)}</a>
            · ${album.year} · ${tracks.length} songs
            ${album.releaseDate ? ` · Released ${album.releaseDate}` : ''}
          </div>
          <div class="hero-actions">
            <button class="btn btn-primary" id="play-album">▶ Play</button>
            <button class="btn btn-secondary" id="shuffle-album">⇄ Shuffle</button>
            <button class="btn btn-secondary" id="save-album">${saved ? 'Saved' : 'Save'}</button>
            <button class="btn btn-secondary" id="share-album">Share</button>
          </div>
        </div>
      </div>
      <div class="track-list">
        ${tracks.map((t, i) => this.trackRow(t, i + 1, false, null, album.tracks)).join('')}
      </div>
    `;
    document.getElementById('play-album')?.addEventListener('click', () => Player.playAlbumOrPlaylist(album.tracks));
    document.getElementById('shuffle-album')?.addEventListener('click', () => {
      Player.shuffle = true;
      document.getElementById('btn-shuffle').style.color = 'var(--accent)';
      Player.playAlbumOrPlaylist(album.tracks);
    });
    document.getElementById('save-album')?.addEventListener('click', (e) => {
      const on = Store.toggleSaveAlbum(id);
      e.target.textContent = on ? 'Saved' : 'Save';
    });
    document.getElementById('share-album')?.addEventListener('click', () => {
      const url = location.origin + location.pathname + '#/album/' + id;
      if (navigator.share) navigator.share({ title: album.title, url }).catch(() => {});
      else { navigator.clipboard?.writeText(url); alert('Link copied'); }
    });
  },

  // ---------- GENRES ----------
  renderGenres() {
    this.setActiveNav('home');
    this.content.innerHTML = `
      <h1 class="section-title">Genres</h1>
      <div class="grid">${GENRES.map(g => `
        <div class="card" data-nav="#/genre/${g.id}">
          <div class="card-art placeholder-art" style="background: linear-gradient(135deg, ${g.color}, ${g.color}88); font-size:1.5rem;">♪</div>
          <div class="card-title">${this.esc(g.name)}</div>
          <div class="card-sub">${this.esc(g.description)}</div>
        </div>
      `).join('')}</div>
    `;
  },

  renderGenre(id) {
    this.setActiveNav('home');
    const genre = getGenre(id);
    if (!genre) { this.content.innerHTML = '<div class="empty">Genre not found</div>'; return; }
    const tracks = tracksByGenre(id);
    const albums = albumsByGenre(id);
    const artists = artistsByGenre(id);

    this.content.innerHTML = `
      <div class="hero">
        <div class="hero-art placeholder-art" style="background: linear-gradient(135deg, ${genre.color}, ${genre.color}88); font-size:3rem;">♪</div>
        <div class="hero-info">
          <div class="hero-type">Genre</div>
          <h1 class="hero-title">${this.esc(genre.name)}</h1>
          <div class="hero-meta">${this.esc(genre.description)}</div>
          ${tracks.length ? `<div class="hero-actions"><button class="btn btn-primary" id="play-genre">▶ Play</button></div>` : ''}
        </div>
      </div>
      ${artists.length ? `<h2 class="section-title" style="font-size:1.15rem;">Artists</h2><div class="grid mb-4">${artists.map(a => this.artistCard(a)).join('')}</div>` : ''}
      ${albums.length ? `<h2 class="section-title" style="font-size:1.15rem;">Albums</h2><div class="grid mb-4">${albums.map(a => this.albumCard(a)).join('')}</div>` : ''}
      ${tracks.length ? `<h2 class="section-title" style="font-size:1.15rem;">Tracks</h2><div class="track-list">${tracks.map((t, i) => this.trackRow(t, i + 1)).join('')}</div>` : '<div class="empty"><p>No tracks in this genre yet</p></div>'}
    `;
    document.getElementById('play-genre')?.addEventListener('click', () => Player.playAlbumOrPlaylist(tracks.map(t => t.id)));
  },

  // ---------- AUTH ----------
  renderAuth() {
    this.setActiveNav('profile');
    this.content.innerHTML = `
      <h1 class="section-title">Account</h1>
      <div class="tabs">
        <button class="tab active" data-tab="login">Log in</button>
        <button class="tab" data-tab="signup">Sign up</button>
      </div>
      <div id="auth-form" class="stat-card" style="max-width:400px;">
        <label>Email</label>
        <input type="email" id="auth-email" placeholder="you@example.com" />
        <label>Password</label>
        <input type="password" id="auth-password" placeholder="••••••••" />
        <div class="modal-actions mt-4">
          <button class="btn btn-primary w-full" id="auth-submit">Log in</button>
        </div>
        <p class="text-muted mt-2" style="font-size:0.8rem;">Demo: any email/password works. Use email containing "admin" for admin access.</p>
      </div>
    `;
    let mode = 'login';
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        mode = tab.dataset.tab;
        const form = document.getElementById('auth-form');
        if (mode === 'signup') {
          form.innerHTML = `
            <label>Display name</label>
            <input type="text" id="auth-name" placeholder="Your name" />
            <label>Email</label>
            <input type="email" id="auth-email" placeholder="you@example.com" />
            <label>Password</label>
            <input type="password" id="auth-password" placeholder="••••••••" />
            <div class="modal-actions mt-4">
              <button class="btn btn-primary w-full" id="auth-submit">Sign up</button>
            </div>
            <p class="text-muted mt-2" style="font-size:0.8rem;">Local demo only. Real auth requires a backend.</p>
          `;
        } else {
          form.innerHTML = `
            <label>Email</label>
            <input type="email" id="auth-email" placeholder="you@example.com" />
            <label>Password</label>
            <input type="password" id="auth-password" placeholder="••••••••" />
            <div class="modal-actions mt-4">
              <button class="btn btn-primary w-full" id="auth-submit">Log in</button>
            </div>
            <p class="text-muted mt-2" style="font-size:0.8rem;">Demo: any email/password works. Use email containing "admin" for admin access.</p>
          `;
        }
        document.getElementById('auth-submit').onclick = doAuth;
      });
    });
    const doAuth = () => {
      const email = document.getElementById('auth-email')?.value.trim();
      const password = document.getElementById('auth-password')?.value;
      let res;
      if (mode === 'signup') {
        const name = document.getElementById('auth-name')?.value.trim();
        res = Store.signup(name, email, password);
      } else {
        res = Store.login(email, password);
      }
      if (!res.ok) { alert(res.error); return; }
      this.updateUserChip();
      this.showAdminNav();
      location.hash = '#/profile';
    };
    document.getElementById('auth-submit').onclick = doAuth;
  },

  // ---------- PROFILE ----------
  renderProfile() {
    this.setActiveNav('profile');
    if (!Store.isLoggedIn()) {
      this.renderAuth();
      return;
    }
    const u = Store.getUser();
    const favCount = Store.getFavorites().length;
    const followCount = Store.getFollows().length;
    const plCount = Store.getPlaylists().filter(p => !p.system).length;

    this.content.innerHTML = `
      <h1 class="section-title">Profile</h1>
      <div class="hero" style="align-items:center;">
        <div class="hero-art placeholder-art" style="border-radius:50%; background: linear-gradient(135deg, #8b5cf6, #ec4899); font-size:3rem;">${this.esc(u.avatarInitial)}</div>
        <div class="hero-info">
          <div class="hero-type">${(u.plan || 'free').toUpperCase()} · @${this.esc(u.username || 'user')}</div>
          <h1 class="hero-title">${this.esc(u.displayName || u.name)}</h1>
          <div class="hero-meta">${this.esc(u.email)} · Joined ${u.joined}</div>
          <div class="hero-meta mt-2">${favCount} liked · ${followCount} following · ${plCount} playlists</div>
          <div class="hero-actions mt-2">
            <button class="btn btn-secondary" id="logout-btn">Log out</button>
            ${u.plan === 'free' ? `<button class="btn btn-primary" id="premium-btn">Go Premium (coming soon)</button>` : ''}
          </div>
        </div>
      </div>
      <div class="stats-grid mb-4">
        <div class="stat-card"><div class="stat-value">${favCount}</div><div class="stat-label">Liked songs</div></div>
        <div class="stat-card"><div class="stat-value">${followCount}</div><div class="stat-label">Followed artists</div></div>
        <div class="stat-card"><div class="stat-value">${Store.getSavedAlbums().length}</div><div class="stat-label">Saved albums</div></div>
        <div class="stat-card"><div class="stat-value">${Store.getHistory().length}</div><div class="stat-label">History entries</div></div>
      </div>
      <div class="stat-card" style="max-width:480px;">
        <h3 style="margin-bottom:16px;">Edit Profile</h3>
        <label>Display Name</label>
        <input type="text" id="prof-name" value="${this.esc(u.displayName || u.name)}" />
        <label>Username</label>
        <input type="text" id="prof-username" value="${this.esc(u.username || '')}" />
        <label>Email</label>
        <input type="email" id="prof-email" value="${this.esc(u.email)}" />
        <label>Avatar Initial</label>
        <input type="text" id="prof-initial" value="${this.esc(u.avatarInitial)}" maxlength="2" />
        <label style="display:flex;align-items:center;gap:8px;margin-top:8px;">
          <input type="checkbox" id="prof-admin" ${u.isAdmin ? 'checked' : ''} style="width:auto;" />
          Admin privileges (demo toggle)
        </label>
        <div class="modal-actions mt-4">
          <button class="btn btn-primary" id="save-profile">Save Changes</button>
        </div>
      </div>
      <p class="text-muted mt-4" style="font-size:0.85rem;">Subscription & payment integration requires a secure backend. Premium features are UI-ready only.</p>
    `;
    document.getElementById('save-profile').addEventListener('click', () => {
      const updated = {
        ...u,
        displayName: document.getElementById('prof-name').value.trim() || u.displayName,
        username: document.getElementById('prof-username').value.trim() || u.username,
        email: document.getElementById('prof-email').value.trim() || u.email,
        avatarInitial: document.getElementById('prof-initial').value.trim() || 'U',
        isAdmin: document.getElementById('prof-admin').checked,
      };
      Store.setUser(updated);
      this.updateUserChip();
      this.showAdminNav();
      alert('Profile saved!');
    });
    document.getElementById('logout-btn')?.addEventListener('click', () => {
      Store.logout();
      this.updateUserChip();
      this.showAdminNav();
      location.hash = '#/auth';
    });
    document.getElementById('premium-btn')?.addEventListener('click', () => {
      alert('Premium subscriptions require a real payment backend. Not implemented in this demo.');
    });
  },

  // ---------- ADMIN ----------
  renderAdmin() {
    this.setActiveNav('admin');
    const u = Store.getUser();
    if (!Store.isLoggedIn() || !u.isAdmin) {
      this.content.innerHTML = '<div class="empty"><p>Access denied. Log in with an admin account (email containing "admin").</p></div>';
      return;
    }
    this.content.innerHTML = `
      <h1 class="section-title">Admin Dashboard</h1>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-value">${CATALOG.tracks.length}</div><div class="stat-label">Tracks</div></div>
        <div class="stat-card"><div class="stat-value">${CATALOG.artists.length}</div><div class="stat-label">Artists</div></div>
        <div class="stat-card"><div class="stat-value">${CATALOG.albums.length}</div><div class="stat-label">Albums</div></div>
        <div class="stat-card"><div class="stat-value">${GENRES.length}</div><div class="stat-label">Genres</div></div>
        <div class="stat-card"><div class="stat-value">${formatPlays(ANALYTICS.totalPlays)}</div><div class="stat-label">Total Plays (mock)</div></div>
        <div class="stat-card"><div class="stat-value">${formatPlays(ANALYTICS.uniqueListeners)}</div><div class="stat-label">Unique Listeners (mock)</div></div>
        <div class="stat-card"><div class="stat-value">${Store.getPlaylists().length}</div><div class="stat-label">Playlists</div></div>
        <div class="stat-card"><div class="stat-value">${ANALYTICS.playlistActivity}</div><div class="stat-label">Playlist Activity (mock)</div></div>
      </div>
      <div class="tabs">
        <button class="tab active" data-tab="tracks">Tracks</button>
        <button class="tab" data-tab="artists">Artists</button>
        <button class="tab" data-tab="albums">Albums</button>
        <button class="tab" data-tab="genres">Genres</button>
        <button class="tab" data-tab="analytics">Analytics</button>
        <button class="tab" data-tab="users">Users</button>
      </div>
      <div id="admin-table-wrap"></div>
      <p class="text-muted mt-4" style="font-size:0.85rem;">Manage / Reports / Featured content write actions require a secure backend. Tables are read-only mock data.</p>
    `;

    const renderTable = (type) => {
      const wrap = document.getElementById('admin-table-wrap');
      if (type === 'tracks') {
        wrap.innerHTML = `<table class="admin-table"><thead><tr><th>Title</th><th>Artist</th><th>Album</th><th>Duration</th><th>Plays</th><th>Status</th></tr></thead>
          <tbody>${CATALOG.tracks.map(t => {
            const e = enrichTrack(t);
            return `<tr><td>${this.esc(e.title)}</td><td>${this.esc(e.artistName)}</td><td>${this.esc(e.albumTitle)}</td><td>${formatDuration(e.duration)}</td><td>${formatPlays(e.plays)}</td><td>${e.status || 'published'}</td></tr>`;
          }).join('')}</tbody></table>`;
      } else if (type === 'artists') {
        wrap.innerHTML = `<table class="admin-table"><thead><tr><th>Name</th><th>Listeners</th><th>Albums</th></tr></thead>
          <tbody>${CATALOG.artists.map(a => {
            const albCount = CATALOG.albums.filter(al => al.artistId === a.id).length;
            return `<tr><td>${this.esc(a.name)}</td><td>${formatPlays(a.monthlyListeners)}</td><td>${albCount}</td></tr>`;
          }).join('')}</tbody></table>`;
      } else if (type === 'albums') {
        wrap.innerHTML = `<table class="admin-table"><thead><tr><th>Title</th><th>Artist</th><th>Year</th><th>Type</th><th>Tracks</th></tr></thead>
          <tbody>${CATALOG.albums.map(a => {
            const art = getArtist(a.artistId);
            return `<tr><td>${this.esc(a.title)}</td><td>${this.esc(art?.name)}</td><td>${a.year}</td><td>${a.type || 'album'}</td><td>${a.tracks.length}</td></tr>`;
          }).join('')}</tbody></table>`;
      } else if (type === 'genres') {
        wrap.innerHTML = `<table class="admin-table"><thead><tr><th>Name</th><th>Tracks</th><th>Description</th></tr></thead>
          <tbody>${GENRES.map(g => `<tr><td>${this.esc(g.name)}</td><td>${tracksByGenre(g.id).length}</td><td>${this.esc(g.description)}</td></tr>`).join('')}</tbody></table>`;
      } else if (type === 'analytics') {
        wrap.innerHTML = `
          <div class="stat-card mb-4">
            <h3>Most played songs (mock)</h3>
            <div class="track-list mt-2">${ANALYTICS.mostPlayedSongs.map((id, i) => {
              const t = enrichTrack(getTrack(id));
              return t ? this.trackRow(t, i + 1) : '';
            }).join('')}</div>
          </div>
          <div class="stat-card">
            <h3>Popular genres (mock)</h3>
            <div class="genre-row mt-2">${ANALYTICS.popularGenres.map(id => {
              const g = getGenre(id);
              return g ? `<button class="genre-chip" data-nav="#/genre/${g.id}" style="--gcolor:${g.color}">${this.esc(g.name)}</button>` : '';
            }).join('')}</div>
          </div>`;
      } else {
        wrap.innerHTML = `<div class="empty"><p>User management requires a real backend database. Current session user: ${this.esc(u.email)}</p></div>`;
      }
    };
    renderTable('tracks');
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderTable(tab.dataset.tab);
      });
    });
  },

  // ---------- COMPONENTS ----------
  albumCard(al) {
    const art = getArtist(al.artistId);
    return `
      <div class="card" data-nav="#/album/${al.id}">
        <div class="card-art placeholder-art" style="${this.artStyle(al.imageColor)}">
          💿
          <div class="play-overlay" data-play="${al.tracks[0]}" data-context="album" data-ids='${JSON.stringify(al.tracks)}'>▶</div>
        </div>
        <div class="card-title">${this.esc(al.title)}</div>
        <div class="card-sub">${this.esc(art?.name)} · ${al.year}</div>
      </div>`;
  },

  artistCard(a) {
    return `
      <div class="card" data-nav="#/artist/${a.id}">
        <div class="card-art placeholder-art" style="${this.artStyle(a.imageColor)}; border-radius:50%;">🎤</div>
        <div class="card-title">${this.esc(a.name)}</div>
        <div class="card-sub">${formatPlays(a.monthlyListeners)} listeners</div>
      </div>`;
  },

  playlistCard(p) {
    const count = p.system && p.name === 'Liked Songs' ? Store.getFavorites().length : p.tracks.length;
    const ids = p.system ? Store.getFavorites() : p.tracks;
    return `
      <div class="card" data-nav="#/playlist/${p.id}">
        <div class="card-art placeholder-art" style="background: linear-gradient(135deg, #6366f1, #8b5cf6);">
          ♫
          ${count ? `<div class="play-overlay" data-play="${ids[0]}" data-context="playlist" data-ids='${JSON.stringify(ids)}'>▶</div>` : ''}
        </div>
        <div class="card-title">${this.esc(p.name)}</div>
        <div class="card-sub">${count} songs ${p.isPublic ? '· Public' : ''}</div>
      </div>`;
  },

  trackRow(t, num, showRemove = false, playlistId = null, contextIds = null) {
    const fav = Store.isFavorite(t.id);
    const idsAttr = contextIds ? `data-context="album" data-ids='${JSON.stringify(contextIds)}'` : '';
    return `
      <div class="track-row ${Player.current()?.id === t.id ? 'playing' : ''}" data-play="${t.id}" ${idsAttr}>
        <div>
          <span class="track-num">${num}</span>
          <span class="track-play-icon">▶</span>
        </div>
        <div class="track-info">
          <div class="track-art placeholder-art" style="${this.artStyle(t.imageColor)}"></div>
          <div class="track-meta">
            <div class="track-title">${this.esc(t.title)}</div>
            <div class="track-artist">${this.esc(t.artistName)}</div>
          </div>
        </div>
        <div class="track-album">${this.esc(t.albumTitle)}</div>
        <div class="track-duration">${formatDuration(t.duration)}</div>
        <div class="track-actions">
          <button class="icon-btn ${fav ? 'active' : ''}" data-fav="${t.id}" title="Favorite">${fav ? '♥' : '♡'}</button>
          ${showRemove && playlistId ? `<button class="icon-btn" title="Remove" onclick="event.stopPropagation();Store.removeFromPlaylist('${playlistId}','${t.id}');UI.renderPlaylist('${playlistId}')">✕</button>` : ''}
          <button class="icon-btn" title="Add to playlist" onclick="event.stopPropagation();UI.showAddToPlaylistModal('${t.id}')">+</button>
        </div>
      </div>`;
  },

  showCreatePlaylistModal() {
    document.getElementById('modal-body').innerHTML = `
      <h2>Create Playlist</h2>
      <label>Name</label>
      <input type="text" id="pl-name" placeholder="My Playlist" />
      <label>Description (optional)</label>
      <textarea id="pl-desc" rows="2" placeholder="Add a description..."></textarea>
      <label style="display:flex;align-items:center;gap:8px;">
        <input type="checkbox" id="pl-public" style="width:auto;" /> Public playlist
      </label>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="cancel-pl">Cancel</button>
        <button class="btn btn-primary" id="save-pl">Create</button>
      </div>
    `;
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById('cancel-pl').onclick = () => this.closeModal();
    document.getElementById('save-pl').onclick = () => {
      const name = document.getElementById('pl-name').value.trim();
      if (!name) return alert('Name required');
      const pl = Store.createPlaylist(name, document.getElementById('pl-desc').value.trim(), document.getElementById('pl-public').checked);
      this.closeModal();
      location.hash = `#/playlist/${pl.id}`;
    };
  },

  showAddToPlaylistModal(trackId) {
    const lists = Store.getPlaylists().filter(p => !p.system || p.name !== 'Liked Songs');
    document.getElementById('modal-body').innerHTML = `
      <h2>Add to playlist</h2>
      ${lists.length ? lists.map(p => `
        <button class="btn btn-secondary w-full mb-2" style="margin-bottom:8px;text-align:left;" data-add-pl="${p.id}">${this.esc(p.name)} (${p.tracks.length})</button>
      `).join('') : '<p class="text-muted">No playlists yet. Create one first.</p>'}
      <div class="modal-actions mt-4">
        <button class="btn btn-secondary" id="cancel-add">Close</button>
      </div>
    `;
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById('cancel-add').onclick = () => this.closeModal();
    document.querySelectorAll('[data-add-pl]').forEach(btn => {
      btn.onclick = () => {
        Store.addToPlaylist(btn.dataset.addPl, trackId);
        this.closeModal();
        alert('Added to playlist');
      };
    });
  },

  shareTrack(t) {
    const url = location.origin + location.pathname + '#/album/' + t.albumId;
    const text = `${t.title} by ${t.artistName}`;
    if (navigator.share) {
      navigator.share({ title: text, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text + ' – ' + url);
      alert('Copied: ' + text);
    }
  },

  closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
  },

  greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 18) return 'afternoon';
    return 'evening';
  },

  esc(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  // ========== VYORA expansions ==========

  initFullPlayer() {
    const open = () => this.openFullPlayer();
    document.getElementById('player-open-full')?.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      if (Player.current()) open();
    });
    document.getElementById('full-player-close')?.addEventListener('click', () => this.closeFullPlayer());
    document.getElementById('full-play')?.addEventListener('click', () => Player.toggle());
    document.getElementById('full-prev')?.addEventListener('click', () => Player.prev());
    document.getElementById('full-next')?.addEventListener('click', () => Player.next());
    document.getElementById('full-shuffle')?.addEventListener('click', () => Player.toggleShuffle());
    document.getElementById('full-repeat')?.addEventListener('click', () => Player.toggleRepeat());
    document.getElementById('full-progress')?.addEventListener('input', (e) => Player.seek(e.target.value));
    document.getElementById('full-fav')?.addEventListener('click', () => {
      const t = Player.current();
      if (!t) return;
      const on = Store.toggleFavorite(t.id);
      document.getElementById('full-fav').textContent = on ? '♥' : '♡';
      document.getElementById('player-fav').textContent = on ? '♥' : '♡';
    });
    document.getElementById('full-add')?.addEventListener('click', () => {
      const t = Player.current();
      if (t) this.showAddToPlaylistModal(t.id);
    });
    document.getElementById('full-share')?.addEventListener('click', () => {
      const t = Player.current();
      if (t) this.shareTrack(t);
    });
    document.getElementById('full-queue')?.addEventListener('click', () => this.toggleQueue());
  },

  openFullPlayer() {
    const t = Player.current();
    if (!t) return;
    this.syncFullPlayer(t);
    document.getElementById('full-player')?.classList.remove('hidden');
  },

  closeFullPlayer() {
    document.getElementById('full-player')?.classList.add('hidden');
  },

  syncFullPlayer(t) {
    if (!t) return;
    const art = document.getElementById('full-player-art');
    if (art) {
      art.style.background = `linear-gradient(135deg, ${t.imageColor}, ${t.imageColor}99)`;
      art.textContent = '♪';
    }
    const title = document.getElementById('full-player-title');
    const artist = document.getElementById('full-player-artist');
    if (title) title.textContent = t.title;
    if (artist) artist.textContent = t.artistName;
    const fav = document.getElementById('full-fav');
    if (fav) {
      const on = Store.isFavorite(t.id);
      fav.textContent = on ? '♥' : '♡';
    }
    const fp = document.getElementById('full-play');
    if (fp) fp.textContent = Player.isPlaying ? '⏸' : '▶';
  },

  // Override update path: call after original updatePlayerUI via monkey-patch in init
  _origUpdatePlayerUI: null,

  renderDiscover(query = '') {
    this.setActiveNav('discover');
    // Reuse search UI but branded as Discover
    this.renderSearch(query);
    // Prepend discover header if empty search
    if (!query) {
      const extra = document.createElement('div');
      extra.innerHTML = `
        <h1 class="section-title">Discover</h1>
        <p class="text-muted mb-4">Explore songs, artists, albums, playlists & genres on VYORA.</p>
        <div class="section-header"><h2 class="section-title" style="font-size:1.1rem;">Trending searches</h2></div>
        <div class="genre-row mb-4">
          ${['Afrobeat', 'Amapiano', 'Luna', 'Nova', 'Chill', 'Gospel'].map(s =>
            `<button class="genre-chip" data-nav="#/discover?q=${encodeURIComponent(s)}" style="--gcolor:var(--accent)">${s}</button>`
          ).join('')}
        </div>
        <div class="section-header"><h2 class="section-title" style="font-size:1.1rem;">New releases</h2></div>
        <div class="grid mb-4">${[...CATALOG.albums].sort((a,b)=>(b.releaseDate||'').localeCompare(a.releaseDate||'')).slice(0,6).map(al => this.albumCard(al)).join('')}</div>
        <div class="section-header"><h2 class="section-title" style="font-size:1.1rem;">Recommended artists</h2></div>
        <div class="grid mb-4">${CATALOG.artists.slice(0,6).map(a => this.artistCard(a)).join('')}</div>
        <div class="section-header"><h2 class="section-title" style="font-size:1.1rem;">Charts snapshot</h2></div>
        <div class="track-list mb-4">${[...CATALOG.tracks].sort((a,b)=>b.plays-a.plays).slice(0,5).map((t,i)=>this.trackRow(enrichTrack(t),i+1)).join('')}</div>
      `;
      // Replace default empty search body
      this.content.innerHTML = '';
      this.content.appendChild(extra);
      // Re-bind search input area
      const searchBar = document.createElement('div');
      searchBar.className = 'search-bar mb-4';
      searchBar.style.maxWidth = '100%';
      searchBar.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="search-input" placeholder="Search VYORA…" value="" />
      `;
      this.content.insertBefore(searchBar, this.content.firstChild);
      document.getElementById('search-input')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') location.hash = `#/discover?q=${encodeURIComponent(e.target.value.trim())}`;
      });
    } else {
      // When querying, renderSearch already ran - retitle
      const h = this.content.querySelector('.section-title');
      if (h) h.textContent = 'Discover';
    }
  },

  async renderCharts() {
    this.setActiveNav('charts');
    const charts = await API.getCharts();
    this.content.innerHTML = `
      <h1 class="section-title">Charts</h1>
      <p class="text-muted mb-4" style="font-size:0.85rem;">${this.esc(charts.note)} Demo sample data only.</p>
      <div class="section-header"><h2 class="section-title" style="font-size:1.15rem;">Global Top Songs</h2></div>
      <div class="track-list mb-4">${charts.globalTop.slice(0, 15).map((t, i) => this.trackRow(t, i + 1)).join('')}</div>
      <div class="section-header"><h2 class="section-title" style="font-size:1.15rem;">Trending</h2></div>
      <div class="track-list mb-4">${charts.trending.map((t, i) => this.trackRow(t, i + 1)).join('')}</div>
      <div class="section-header"><h2 class="section-title" style="font-size:1.15rem;">Rising Artists</h2></div>
      <div class="grid mb-4">${charts.risingArtists.map(a => this.artistCard(a)).join('')}</div>
      <div class="section-header"><h2 class="section-title" style="font-size:1.15rem;">Popular Albums</h2></div>
      <div class="grid mb-4">${charts.popularAlbums.map(a => this.albumCard(a)).join('')}</div>
      <div class="section-header"><h2 class="section-title" style="font-size:1.15rem;">Genre charts</h2></div>
      <div class="genre-row">${GENRES.slice(0, 8).map(g =>
        `<button class="genre-chip" data-nav="#/genre/${g.id}" style="--gcolor:${g.color}">${this.esc(g.name)}</button>`
      ).join('')}</div>
    `;
  },

  async renderArtistPortal(artistId) {
    this.setActiveNav('artist-portal');
    const summary = await API.getArtistPortalSummary(artistId || CATALOG.artists[0].id);
    const a = summary.artist;
    this.content.innerHTML = `
      <h1 class="section-title">Artist Portal</h1>
      <p class="text-muted mb-4">Demo dashboard for artists. Uploads & royalties require a secure backend.</p>
      <div class="hero">
        <div class="hero-art placeholder-art" style="${this.artStyle(a.imageColor)}; border-radius:50%; font-size:3rem;">🎤</div>
        <div class="hero-info">
          <div class="hero-type">Artist account (demo)</div>
          <h1 class="hero-title">${this.esc(a.name)}</h1>
          <div class="hero-meta">${formatPlays(summary.listeners)} monthly listeners · ${formatPlays(summary.followers)} followers (est.)</div>
        </div>
      </div>
      <div class="stats-grid mb-4">
        <div class="stat-card"><div class="stat-value">${summary.trackCount}</div><div class="stat-label">Songs</div></div>
        <div class="stat-card"><div class="stat-value">${summary.albumCount}</div><div class="stat-label">Releases</div></div>
        <div class="stat-card"><div class="stat-value">${formatPlays(summary.streams)}</div><div class="stat-label">Streams (catalog)</div></div>
        <div class="stat-card"><div class="stat-value">—</div><div class="stat-label">Earnings</div></div>
      </div>
      <p class="text-muted mb-4" style="font-size:0.85rem;">${this.esc(summary.earningsNote)}</p>
      <div class="section-header">
        <h2 class="section-title" style="font-size:1.15rem;">Your releases</h2>
        <button class="btn btn-secondary" id="upload-placeholder">Upload song (backend)</button>
      </div>
      <div class="grid mb-4">${summary.albums.map(al => this.albumCard(al)).join('')}</div>
      <h2 class="section-title" style="font-size:1.15rem;">Your songs</h2>
      <div class="track-list">${summary.tracks.map((t, i) => this.trackRow(t, i + 1)).join('')}</div>
      <div class="ad-slot mt-4"><span>Premium artist tools & royalty reports — connect payment backend</span></div>
    `;
    document.getElementById('upload-placeholder')?.addEventListener('click', () => {
      alert('Music upload requires a legitimate backend with storage, rights verification, and license metadata. Not available in this local demo.');
    });
  },
};

// Patch updatePlayerUI to also sync full player & play button
(function patchPlayerUI() {
  const orig = UI.updatePlayerUI.bind(UI);
  UI.updatePlayerUI = function (track) {
    orig(track);
    UI.syncFullPlayer(track);
  };
  const origPlay = UI.updatePlayButton.bind(UI);
  UI.updatePlayButton = function () {
    origPlay();
    const fp = document.getElementById('full-play');
    if (fp) fp.textContent = Player.isPlaying ? '⏸' : '▶';
  };
})();
