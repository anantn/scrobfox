const pageMod = require("page-mod");

function Pandora() {
    this._playedFor = 0; // seconds
    this._timestamp = 0; // milliseconds
    this._current = null;
}
Pandora.prototype = {
    _played: function(song) {
        if (!this._current || this._current != song) {
            /* New song was started */
            this._current = song;
            this._playedFor = 0;
            this._timestamp = Date.now();
            this._nowPlaying(song);
        } else if (this._current == song) {
            /* Song was paused, now resuming */
            this._timestamp = Date.now();
        }
    },

    _paused: function(song) {
        this._playedFor += (Date.now() - this._timestamp) / 1000;
    },

    _ended: function(song) {
        /* Entire track was played, scrobble it if longer than 60 seconds */
        this._playedFor += (Date.now() - this._timestamp) / 1000;
        if (this._playedFor >= 60) {
            this._scrobble({
                'title': song.title,
                'artist': song.artist,
                'started': Math.round(Date.now() / 1000 - this._playedFor)
            });
        }
        this._playedFor = 0;
        this._current = null;
        this._timestamp = 0;
    },

    init: function(scrobble, nowplay) {
        pandora._scrobble = scrobble;
        pandora._nowPlaying = nowplay;

        pageMod.PageMod({
            include: "*.pandora.com",
            contentScript: "function setupHandler() { " +
                "if (!window.Pandora) { " +
                "   setTimeout(setupHandler, 1000); return; " +
                "} " +
                "Pandora.setEventHandler('SongPlayed', function(song) {" +
                "   self.postMessage({ " +
                "       'type':'played', " +
                "       'title':song.songName, " +
                "       'artist':song.artistName " +
                "   }); " +
                "}); " +
                "Pandora.setEventHandler('SongPaused', function(song) {" +
                "   self.postMessage({ " +
                "       'type':'paused', " +
                "       'title':song.songName, " +
                "       'artist':song.artistName " +
                "   }); " +
                "}); " +
                "Pandora.setEventHandler('SongEnded', function(song) {" +
                "   self.postMessage({ " +
                "       'type':'ended', " +
                "       'title':song.songName, " +
                "       'artist':song.artistName " +
                "   }); " +
                "}); " +
                "} setupHandler(); ",
            onAttach: function(worker) {
                worker.on('message', function(msg) {
                    pandora['_' + msg.type](msg);
                });
            }
        });
    }
};

var pandora = new Pandora();
exports.Init = pandora.init;

