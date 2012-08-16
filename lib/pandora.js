const data = require("self").data;
const pageMod = require("page-mod");

function Pandora() {
    this._startedAt = 0; // milliseconds
    this._current = null;
}
Pandora.prototype = {
    _played: function(song) {
        if (this._current == song) {
            return;
        }
        
        /* New song was started */
        var ctime = Date.now() / 1000;
        song.started = this._startedAt;

        if (ctime - song.started >= 60) {
            /* Song was played for more than 60 seconds */
            this._scrobble(song);
        }

        /* Update current song */
        this._current = song;
        this._startedAt = ctime;
        this._nowPlaying(song);
    },

    init: function(scrobble, nowplay) {
        pandora._scrobble = scrobble;
        pandora._nowPlaying = nowplay;

        pageMod.PageMod({
            include: "*.pandora.com",
            contentScript: "(function() {" +
                "var bar = document.querySelector('.nowplaying');" +
                "var obs = new MutationObserver(function(mutations) {" +
                "    mutations.forEach(function(m) {" +
                "        var set = {title:null, artist:null, album:null};" +
                "        switch (m.target.className) {" +
                "            case '.playerBarSong':" +
                "                set.title = m.target.title;" +
                "                break;" +
                "            case '.playerBarArtist':" +
                "                set.artist = m.target.artist;" +
                "                break;" +
                "            case '.playerBarAlbum':" +
                "                set.album = m.target.album;" +
                "                break;" +
                "        }" +
                "        if (set.title && set.artist && set.album) {" +
                "           postMessage(set);" +
                "        }" +
                "    });" +
                "});" +
                "obs.observe(bar, {subtree:true, childList:true});" +
                "})();",
            onAttach: function(worker) {
                worker.on('message', function(msg) {
                    pandora._played(msg);
                });
            }
        });
    }
};

var pandora = new Pandora();
exports.Init = pandora.init;
