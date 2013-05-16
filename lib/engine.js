
const data = require("self").data;
const pageMod = require("page-mod");

function Engine() {
  this._startedAt = 0;
  this._current = null;
}
Engine.prototype = {
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

    /* Update current song */
    this._current = song;
    this._startedAt = ctime;
    this._nowPlaying(this._cloneSong(song, ctime));
  },

  _cloneSong: function(song, time) {
    var obj = {
      title: song.title,
      artist: song.artist,
      startedAt: time
    };
    if (song.album) {
      obj.album = song.album;
    }
    return obj;
  },

  init: function(scrobble, nowplay, sites) {
    engine._scrobble = scrobble;
    engine._nowPlaying = nowplay;
    for (var site in sites) {
      pageMod.PageMod({
        include: sites[site].include,
        contentScriptFile: data.url("c/" + site + ".js"),
        onAttach: function(worker) {
          worker.on('message', function(msg) {
            engine._played(msg);
          });
        }
      });
    }
  }
};

var engine = new Engine();
exports.Init = engine.init;
