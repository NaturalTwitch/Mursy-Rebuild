module.exports = function urlVerifier(input) {
    try {
        const url = new URL(input);

        if (url.hostname.includes('spotify.com')) {
            if (url.pathname.startsWith('/track/')) {
                return 'SPOTIFY_TRACK';
            } else if (url.pathname.startsWith('/playlist/')) {
                return 'SPOTIFY_PLAYLIST';
            }
        } else {
            return 'UNKNOWN';
        }
    } catch (error) {
        return false;
    }
};
