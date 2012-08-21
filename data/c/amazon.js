
function sendCurrentSong() {
    var song = {};
    var details = amznMusic.widgets.player.getCurrent();

    if (!details || !details.title || !details.artistName) {
      return;
    }

    var song = { title: details.title, artist: details.artistName };
    if (details.albumName) {
      song.album = details.albumName;
    }
    self.postMessage(song);
}

var timeout = 2000;
function checkPlayer() {
    if (!amznMusic || !amznMusic.widgets.player.created) {
      timeout *= 2;
      setTimeout(checkPlayer, timeout);
      return;
    }

    var oldCallback = amznMusic.widgets.player.callback;
    amznMusic.widgets.player.callback = function(e) {
      if (e == "onPlay") {
        sendCurrentSong();
      }
      oldCallback(e);
    }
}

checkPlayer();
