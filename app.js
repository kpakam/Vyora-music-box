/**
 * VYORA – Hash router + bootstrap
 */
function parseHash() {
  const hash = location.hash.slice(1) || '/';
  const [path, query] = hash.split('?');
  const parts = path.split('/').filter(Boolean);
  const params = {};
  if (query) {
    query.split('&').forEach(p => {
      const [k, v] = p.split('=');
      params[k] = decodeURIComponent(v || '');
    });
  }
  return { parts, params, path: '/' + parts.join('/') };
}

function route() {
  const { parts, params } = parseHash();
  const page = parts[0] || 'home';

  switch (page) {
    case 'home':
    case '':
      UI.renderHome();
      break;
    case 'discover':
    case 'search':
      UI.renderDiscover(params.q || '');
      break;
    case 'charts':
      UI.renderCharts();
      break;
    case 'library':
      UI.renderLibrary();
      break;
    case 'favorites':
      UI.renderFavorites();
      break;
    case 'playlists':
      UI.renderPlaylists();
      break;
    case 'playlist':
      UI.renderPlaylist(parts[1]);
      break;
    case 'artist':
      UI.renderArtist(parts[1]);
      break;
    case 'album':
      UI.renderAlbum(parts[1]);
      break;
    case 'genre':
      UI.renderGenre(parts[1]);
      break;
    case 'genres':
      UI.renderGenres();
      break;
    case 'artist-portal':
      UI.renderArtistPortal(parts[1]);
      break;
    case 'profile':
      UI.renderProfile();
      break;
    case 'auth':
      UI.renderAuth();
      break;
    case 'admin':
      UI.renderAdmin();
      break;
    default:
      UI.renderHome();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  UI.init();
  Player.init();
  UI.initFullPlayer();
  window.addEventListener('hashchange', route);
  route();
});
