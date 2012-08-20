const data = require("self").data;
const pageMod = require("page-mod");

function Pandora() {
    this._startedAt = 0;
    this._current = null;
}
Pandora.prototype = {
    _played: function(song) {
        if (this._current && (this._current.title == song.title)) {
            /* Already playing */
            return;
        }

        var ctime = Math.round(Date.now() / 1000);

        /* First song since startup, or first song after an ad */
        if (!this._current) {
            this._startedAt = ctime;
        } else {
            /* New song was started, check if we should scrobble previous song */
            if (ctime - this._startedAt >= 60) {
                this._scrobble(this._cloneSong(this._current, this._startedAt));
            }
        }

        /* Update current song, but only if it's not an ad */
        if (song.title == "ad" || song.title == "audioad") {
            this._current = null;
        } else {
            this._current = song;
            this._startedAt = ctime;
            this._nowPlaying(this._cloneSong(song, ctime));
        }
    },

    _cloneSong: function(song, time) {
        return {
            title: song.title,
            artist: song.artist,
            album: song.album,
            startedAt: time
        };
    },

    init: function(scrobble, nowplay) {
        pandora._scrobble = scrobble;
        pandora._nowPlaying = nowplay;

        pageMod.PageMod({
            include: "*.pandora.com",
            contentScriptFile: data.url("c/pandora.js"),
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
