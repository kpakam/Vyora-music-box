/**
 * VYORA – Catalog & domain models
 * ------------------------------------
 * Database-ready shapes for future backend (users, artists, songs, albums,
 * genres, playlists, playlist_tracks, favorites, follows, listening_history,
 * play_counts, admin_users).
 *
 * All audio URLs are demo/sample only (SoundHelix). Do not use commercial
 * copyrighted tracks without proper licensing.
 */

// ---- Genres (data-driven; add more by extending this array) ----
const GENRES = [
  { id: 'g_afrobeat', name: 'Afrobeat', color: '#f59e0b', description: 'High-energy African rhythms and brass.' },
  { id: 'g_afropop', name: 'Afropop', color: '#ef4444', description: 'Contemporary African pop fusion.' },
  { id: 'g_amapiano', name: 'Amapiano', color: '#8b5cf6', description: 'South African house with log drums and soulful keys.' },
  { id: 'g_hiphop', name: 'Hip-Hop', color: '#22c55e', description: 'Beats, bars, and culture.' },
  { id: 'g_rnb', name: 'R&B', color: '#ec4899', description: 'Smooth vocals and groove.' },
  { id: 'g_gospel', name: 'Gospel', color: '#3b82f6', description: 'Faith-driven music and choir energy.' },
  { id: 'g_reggae', name: 'Reggae', color: '#16a34a', description: 'Caribbean roots and riddims.' },
  { id: 'g_dancehall', name: 'Dancehall', color: '#eab308', description: 'Up-tempo Jamaican dance music.' },
  { id: 'g_pop', name: 'Pop', color: '#06b6d4', description: 'Catchy, mainstream anthems.' },
  { id: 'g_instrumental', name: 'Instrumental', color: '#64748b', description: 'Focus, study, and pure melody.' },
  { id: 'g_international', name: 'International', color: '#a855f7', description: 'Global sounds beyond borders.' },
  { id: 'g_electronic', name: 'Electronic', color: '#7c3aed', description: 'Synths, beats, and sound design.' },
];

// ---- Catalog (demo content) ----
const CATALOG = {
  artists: [
    { id: 'a1', name: 'Luna Eclipse', bio: 'Atmospheric electronic and dream-pop producer known for ethereal soundscapes.', monthlyListeners: 1240000, imageColor: '#7c3aed', genres: ['g_electronic', 'g_pop'], related: ['a5', 'a3'] },
    { id: 'a2', name: 'The Midnight Riders', bio: 'Indie rock band blending classic riffs with modern production.', monthlyListeners: 890000, imageColor: '#dc2626', genres: ['g_pop', 'g_international'], related: ['a4'] },
    { id: 'a3', name: 'Nova Beats', bio: 'Hip-hop and lo-fi beats creator. Chill vibes for study and night drives.', monthlyListeners: 2100000, imageColor: '#059669', genres: ['g_hiphop', 'g_instrumental'], related: ['a1', 'a5'] },
    { id: 'a4', name: 'Aurora Vale', bio: 'Singer-songwriter with folk roots and cinematic arrangements.', monthlyListeners: 560000, imageColor: '#2563eb', genres: ['g_pop', 'g_gospel'], related: ['a2'] },
    { id: 'a5', name: 'Pulse Circuit', bio: 'Synthwave and retro-futuristic electronic music.', monthlyListeners: 980000, imageColor: '#db2777', genres: ['g_electronic', 'g_instrumental'], related: ['a1', 'a3'] },
    { id: 'a6', name: 'Lagos Heat', bio: 'Afrobeats collective bringing West African energy to the global stage.', monthlyListeners: 3200000, imageColor: '#f59e0b', genres: ['g_afrobeat', 'g_afropop'], related: ['a7'] },
    { id: 'a7', name: 'Joburg Keys', bio: 'Amapiano producer and DJ from Johannesburg.', monthlyListeners: 1800000, imageColor: '#8b5cf6', genres: ['g_amapiano', 'g_afropop'], related: ['a6'] },
  ],

  albums: [
    { id: 'al1', title: 'Neon Dreams', artistId: 'a1', year: 2024, releaseDate: '2024-03-12', type: 'album', tracks: ['t1', 't2', 't3', 't4'], imageColor: '#7c3aed', genreIds: ['g_electronic'] },
    { id: 'al2', title: 'Highway Ghosts', artistId: 'a2', year: 2023, releaseDate: '2023-09-01', type: 'album', tracks: ['t5', 't6', 't7'], imageColor: '#dc2626', genreIds: ['g_pop'] },
    { id: 'al3', title: 'Late Night Loops', artistId: 'a3', year: 2025, releaseDate: '2025-01-20', type: 'album', tracks: ['t8', 't9', 't10', 't11'], imageColor: '#059669', genreIds: ['g_hiphop', 'g_instrumental'] },
    { id: 'al4', title: 'Whispering Pines', artistId: 'a4', year: 2024, releaseDate: '2024-06-15', type: 'album', tracks: ['t12', 't13'], imageColor: '#2563eb', genreIds: ['g_pop'] },
    { id: 'al5', title: 'Chrome Horizon', artistId: 'a5', year: 2023, releaseDate: '2023-11-08', type: 'album', tracks: ['t14', 't15', 't16'], imageColor: '#db2777', genreIds: ['g_electronic'] },
    { id: 'al6', title: 'Starlight Sessions', artistId: 'a1', year: 2022, releaseDate: '2022-08-22', type: 'ep', tracks: ['t17', 't18'], imageColor: '#a855f7', genreIds: ['g_electronic'] },
    { id: 'al7', title: 'Sun City Nights', artistId: 'a6', year: 2024, releaseDate: '2024-07-04', type: 'album', tracks: ['t19', 't20', 't21'], imageColor: '#f59e0b', genreIds: ['g_afrobeat', 'g_afropop'] },
    { id: 'al8', title: 'Log Drum Dreams', artistId: 'a7', year: 2025, releaseDate: '2025-02-14', type: 'ep', tracks: ['t22', 't23'], imageColor: '#8b5cf6', genreIds: ['g_amapiano'] },
  ],

  // Demo audio only – SoundHelix samples. license/status ready for real uploads later.
  tracks: [
    { id: 't1', title: 'Midnight Pulse', artistId: 'a1', albumId: 'al1', duration: 214, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', plays: 4200000, genreIds: ['g_electronic'], releaseDate: '2024-03-12', license: 'demo', status: 'published' },
    { id: 't2', title: 'Glass Skies', artistId: 'a1', albumId: 'al1', duration: 198, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', plays: 3100000, genreIds: ['g_electronic'], releaseDate: '2024-03-12', license: 'demo', status: 'published' },
    { id: 't3', title: 'Echo Chamber', artistId: 'a1', albumId: 'al1', duration: 245, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', plays: 2800000, genreIds: ['g_electronic'], releaseDate: '2024-03-12', license: 'demo', status: 'published' },
    { id: 't4', title: 'Velvet Static', artistId: 'a1', albumId: 'al1', duration: 187, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', plays: 1900000, genreIds: ['g_electronic', 'g_pop'], releaseDate: '2024-03-12', license: 'demo', status: 'published' },
    { id: 't5', title: 'Dusty Roads', artistId: 'a2', albumId: 'al2', duration: 232, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', plays: 1500000, genreIds: ['g_pop'], releaseDate: '2023-09-01', license: 'demo', status: 'published' },
    { id: 't6', title: 'Last Call', artistId: 'a2', albumId: 'al2', duration: 201, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', plays: 980000, genreIds: ['g_pop'], releaseDate: '2023-09-01', license: 'demo', status: 'published' },
    { id: 't7', title: 'Neon Signs', artistId: 'a2', albumId: 'al2', duration: 256, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', plays: 1200000, genreIds: ['g_pop', 'g_international'], releaseDate: '2023-09-01', license: 'demo', status: 'published' },
    { id: 't8', title: 'Coffee Shop', artistId: 'a3', albumId: 'al3', duration: 176, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', plays: 5600000, genreIds: ['g_hiphop', 'g_instrumental'], releaseDate: '2025-01-20', license: 'demo', status: 'published' },
    { id: 't9', title: 'Rainy Window', artistId: 'a3', albumId: 'al3', duration: 192, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', plays: 4100000, genreIds: ['g_instrumental'], releaseDate: '2025-01-20', license: 'demo', status: 'published' },
    { id: 't10', title: '2AM Drive', artistId: 'a3', albumId: 'al3', duration: 205, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', plays: 3800000, genreIds: ['g_hiphop'], releaseDate: '2025-01-20', license: 'demo', status: 'published' },
    { id: 't11', title: 'Soft Focus', artistId: 'a3', albumId: 'al3', duration: 168, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', plays: 2900000, genreIds: ['g_instrumental'], releaseDate: '2025-01-20', license: 'demo', status: 'published' },
    { id: 't12', title: 'River Song', artistId: 'a4', albumId: 'al4', duration: 223, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', plays: 870000, genreIds: ['g_pop', 'g_gospel'], releaseDate: '2024-06-15', license: 'demo', status: 'published' },
    { id: 't13', title: 'Old Photographs', artistId: 'a4', albumId: 'al4', duration: 241, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', plays: 650000, genreIds: ['g_pop'], releaseDate: '2024-06-15', license: 'demo', status: 'published' },
    { id: 't14', title: 'Retro Future', artistId: 'a5', albumId: 'al5', duration: 210, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', plays: 2100000, genreIds: ['g_electronic'], releaseDate: '2023-11-08', license: 'demo', status: 'published' },
    { id: 't15', title: 'Grid Runner', artistId: 'a5', albumId: 'al5', duration: 195, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', plays: 1800000, genreIds: ['g_electronic', 'g_instrumental'], releaseDate: '2023-11-08', license: 'demo', status: 'published' },
    { id: 't16', title: 'Sunset Protocol', artistId: 'a5', albumId: 'al5', duration: 228, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', plays: 1400000, genreIds: ['g_electronic'], releaseDate: '2023-11-08', license: 'demo', status: 'published' },
    { id: 't17', title: 'Orbit', artistId: 'a1', albumId: 'al6', duration: 203, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', plays: 950000, genreIds: ['g_electronic'], releaseDate: '2022-08-22', license: 'demo', status: 'published' },
    { id: 't18', title: 'Fading Signal', artistId: 'a1', albumId: 'al6', duration: 217, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', plays: 720000, genreIds: ['g_electronic'], releaseDate: '2022-08-22', license: 'demo', status: 'published' },
    { id: 't19', title: 'Market Square', artistId: 'a6', albumId: 'al7', duration: 198, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', plays: 8900000, genreIds: ['g_afrobeat', 'g_afropop'], releaseDate: '2024-07-04', license: 'demo', status: 'published' },
    { id: 't20', title: 'Palm Wine', artistId: 'a6', albumId: 'al7', duration: 212, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', plays: 6200000, genreIds: ['g_afropop'], releaseDate: '2024-07-04', license: 'demo', status: 'published' },
    { id: 't21', title: 'Coastline', artistId: 'a6', albumId: 'al7', duration: 205, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', plays: 4100000, genreIds: ['g_afrobeat'], releaseDate: '2024-07-04', license: 'demo', status: 'published' },
    { id: 't22', title: 'Amapiano Sunrise', artistId: 'a7', albumId: 'al8', duration: 240, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', plays: 7500000, genreIds: ['g_amapiano'], releaseDate: '2025-02-14', license: 'demo', status: 'published' },
    { id: 't23', title: 'Township Glow', artistId: 'a7', albumId: 'al8', duration: 228, audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', plays: 5300000, genreIds: ['g_amapiano', 'g_afropop'], releaseDate: '2025-02-14', license: 'demo', status: 'published' },
  ],
};

// ---- Mock analytics (replace with backend metrics later) ----
const ANALYTICS = {
  totalPlays: 78400000,
  uniqueListeners: 1250000,
  dailyPlays: [42000, 51000, 48000, 62000, 71000, 68000, 55000],
  weeklyPlays: 397000,
  monthlyPlays: 1680000,
  mostPlayedSongs: ['t19', 't22', 't8', 't20', 't1'],
  mostFollowedArtists: ['a6', 'a3', 'a7', 'a1', 'a5'],
  popularGenres: ['g_afrobeat', 'g_amapiano', 'g_hiphop', 'g_electronic', 'g_afropop'],
  playlistActivity: 12400,
};

// ---- Helpers ----
function getArtist(id) { return CATALOG.artists.find(a => a.id === id); }
function getAlbum(id) { return CATALOG.albums.find(a => a.id === id); }
function getTrack(id) { return CATALOG.tracks.find(t => t.id === id); }
function getGenre(id) { return GENRES.find(g => g.id === id); }

function enrichTrack(t) {
  if (!t) return null;
  const raw = typeof t === 'string' ? getTrack(t) : t;
  if (!raw) return null;
  const artist = getArtist(raw.artistId);
  const album = getAlbum(raw.albumId);
  return {
    ...raw,
    artistName: artist?.name || 'Unknown',
    albumTitle: album?.title || 'Unknown',
    imageColor: album?.imageColor || artist?.imageColor || '#7c3aed',
  };
}

function enrichAlbum(al) {
  if (!al) return null;
  const artist = getArtist(al.artistId);
  return { ...al, artistName: artist?.name || 'Unknown' };
}

function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatPlays(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return String(n);
}

function tracksByGenre(genreId) {
  return CATALOG.tracks.filter(t => (t.genreIds || []).includes(genreId)).map(enrichTrack);
}

function albumsByGenre(genreId) {
  return CATALOG.albums.filter(a => (a.genreIds || []).includes(genreId)).map(enrichAlbum);
}

function artistsByGenre(genreId) {
  return CATALOG.artists.filter(a => (a.genres || []).includes(genreId));
}
