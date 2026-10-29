/**
 * VYORA – HTML5 audio player
 * Preserves play/pause, next/prev, shuffle, repeat, seek, volume, queue.
 * Adds: persistent state, history tracking, Media Session (background where supported).
 */
const Player = {
  audio: null,
  queue: [],
  index: 0,
  shuffle: false,
  repeat: false, // false | 'one' | 'all'
  isPlaying: false,

  init() {
    this.audio = document.getElementById('audio');
    this.audio.volume = 0.8;

    this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
    this.audio.addEventListener('ended', () => this.onEnded());
    this.audio.addEventListener('loadedmetadata', () => this.onLoaded());
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      UI.updatePlayButton();
      this.persistState();
    });
    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      UI.updatePlayButton();
      this.persistState();
    });

    document.getElementById('btn-play').addEventListener('click', () => this.toggle());
    document.getElementById('btn-prev').addEventListener('click', () => this.prev());
    document.getElementById('btn-next').addEventListener('click', () => this.next());
    document.getElementById('btn-shuffle').addEventListener('click', () => this.toggleShuffle());
    document.getElementById('btn-repeat').addEventListener('click', () => this.toggleRepeat());
    document.getElementById('progress').addEventListener('input', (e) => this.seek(e.target.value));
    document.getElementById('volume').addEventListener('input', (e) => {
      this.audio.volume = e.target.value / 100;
      document.getElementById('btn-mute').textContent = this.audio.volume === 0 ? '🔇' : '🔊';
      this.persistState();
    });
    document.getElementById('btn-mute').addEventListener('click', () => this.toggleMute());
    document.getElementById('player-fav').addEventListener('click', () => {
      const t = this.current();
      if (t) {
        const on = Store.toggleFavorite(t.id);
        document.getElementById('player-fav').textContent = on ? '♥' : '♡';
        document.getElementById('player-fav').classList.toggle('active', on);
      }
    });
    document.getElementById('btn-queue').addEventListener('click', () => UI.toggleQueue());

    const addPl = document.getElementById('btn-add-playlist');
    if (addPl) addPl.addEventListener('click', () => {
      const t = this.current();
      if (t) UI.showAddToPlaylistModal(t.id);
    });
    const shareBtn = document.getElementById('btn-share');
    if (shareBtn) shareBtn.addEventListener('click', () => {
      const t = this.current();
      if (t) UI.shareTrack(t);
    });

    this.restoreState();
  },

  current() {
    return this.queue[this.index] || null;
  },

  playTrack(track, queue = null) {
    if (queue) {
      this.queue = queue.map(t => (typeof t === 'string' ? enrichTrack(getTrack(t)) : enrichTrack(t))).filter(Boolean);
      this.index = this.queue.findIndex(t => t.id === (track.id || track));
      if (this.index < 0) this.index = 0;
    } else {
      this.queue = [enrichTrack(track)].filter(Boolean);
      this.index = 0;
    }
    this.loadAndPlay();
  },

  playAlbumOrPlaylist(trackIds, startId = null) {
    const tracks = trackIds.map(id => enrichTrack(getTrack(id))).filter(Boolean);
    if (!tracks.length) return;
    this.queue = tracks;
    this.index = startId ? Math.max(0, tracks.findIndex(t => t.id === startId)) : 0;
    this.loadAndPlay();
  },

  loadAndPlay() {
    const t = this.current();
    if (!t) return;
    this.audio.src = t.audio;
    this.audio.play().catch(() => {});
    Store.addHistory(t.id);
    UI.updatePlayerUI(t);
    UI.renderQueue();
    this.updateMediaSession(t);
    this.persistState();
  },

  toggle() {
    if (!this.current()) return;
    if (this.audio.paused) this.audio.play().catch(() => {});
    else this.audio.pause();
  },

  next() {
    if (!this.queue.length) return;
    if (this.shuffle) {
      this.index = Math.floor(Math.random() * this.queue.length);
    } else {
      this.index = (this.index + 1) % this.queue.length;
    }
    this.loadAndPlay();
  },

  prev() {
    if (!this.queue.length) return;
    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }
    this.index = (this.index - 1 + this.queue.length) % this.queue.length;
    this.loadAndPlay();
  },

  seek(percent) {
    if (!this.audio.duration) return;
    this.audio.currentTime = (percent / 100) * this.audio.duration;
  },

  toggleShuffle() {
    this.shuffle = !this.shuffle;
    document.getElementById('btn-shuffle').style.color = this.shuffle ? 'var(--accent)' : '';
    this.persistState();
  },

  toggleRepeat() {
    if (!this.repeat) this.repeat = 'all';
    else if (this.repeat === 'all') this.repeat = 'one';
    else this.repeat = false;
    const btn = document.getElementById('btn-repeat');
    btn.style.color = this.repeat ? 'var(--accent)' : '';
    btn.title = this.repeat === 'one' ? 'Repeat One' : this.repeat === 'all' ? 'Repeat All' : 'Repeat';
    this.persistState();
  },

  toggleMute() {
    if (this.audio.volume > 0) {
      this._prevVol = this.audio.volume;
      this.audio.volume = 0;
      document.getElementById('volume').value = 0;
      document.getElementById('btn-mute').textContent = '🔇';
    } else {
      this.audio.volume = this._prevVol || 0.8;
      document.getElementById('volume').value = this.audio.volume * 100;
      document.getElementById('btn-mute').textContent = '🔊';
    }
    this.persistState();
  },

  onTimeUpdate() {
    if (!this.audio.duration) return;
    const pct = (this.audio.currentTime / this.audio.duration) * 100;
    document.getElementById('progress').value = pct;
    document.getElementById('time-current').textContent = formatDuration(this.audio.currentTime);
    const fp = document.getElementById('full-progress');
    if (fp) fp.value = pct;
    const ftc = document.getElementById('full-time-current');
    if (ftc) ftc.textContent = formatDuration(this.audio.currentTime);
  },

  onLoaded() {
    const d = formatDuration(this.audio.duration || 0);
    document.getElementById('time-total').textContent = d;
    const ftt = document.getElementById('full-time-total');
    if (ftt) ftt.textContent = d;
  },

  onEnded() {
    if (this.repeat === 'one') {
      this.audio.currentTime = 0;
      this.audio.play().catch(() => {});
    } else if (this.repeat === 'all' || this.index < this.queue.length - 1 || this.shuffle) {
      this.next();
    } else {
      this.isPlaying = false;
      UI.updatePlayButton();
    }
  },

  updateMediaSession(t) {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: t.title,
        artist: t.artistName,
        album: t.albumTitle,
      });
      navigator.mediaSession.setActionHandler('play', () => this.audio.play().catch(() => {}));
      navigator.mediaSession.setActionHandler('pause', () => this.audio.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.prev());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
    } catch (_) {}
  },

  persistState() {
    Store.savePlayerState({
      queueIds: this.queue.map(t => t.id),
      index: this.index,
      shuffle: this.shuffle,
      repeat: this.repeat,
      volume: this.audio ? this.audio.volume : 0.8,
    });
  },

  restoreState() {
    const s = Store.getPlayerState();
    if (!s || !s.queueIds || !s.queueIds.length) return;
    this.queue = s.queueIds.map(id => enrichTrack(getTrack(id))).filter(Boolean);
    this.index = Math.min(s.index || 0, Math.max(0, this.queue.length - 1));
    this.shuffle = !!s.shuffle;
    this.repeat = s.repeat || false;
    if (s.volume != null && this.audio) {
      this.audio.volume = s.volume;
      document.getElementById('volume').value = s.volume * 100;
    }
    document.getElementById('btn-shuffle').style.color = this.shuffle ? 'var(--accent)' : '';
    document.getElementById('btn-repeat').style.color = this.repeat ? 'var(--accent)' : '';
    const t = this.current();
    if (t) {
      this.audio.src = t.audio;
      UI.updatePlayerUI(t);
      UI.renderQueue();
    }
  },
};
