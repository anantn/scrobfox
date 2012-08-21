
function sendCurrentSong() {
    var song = {};
    var details = unsafeWindow.amznMusic.widgets.player.getCurrent();

    if (!details || !details.metadata.title || !details.metadata.artistName) {
      return;
    }

    var song = {
      title: details.metadata.title, artist: details.metadata.artistName
    };
    if (details.metadata.albumName) {
      song.album = details.metadata.albumName;
    }
    self.postMessage(song);
}

var timeout = 2000;
function checkPlayer() {
    if (!('amznMusic' in unsafeWindow) ||
        !unsafeWindow.amznMusic.widgets.player.created) {
      timeout *= 2;
      setTimeout(checkPlayer, timeout);
      return;
    }

    var oldCallback = unsafeWindow.amznMusic.widgets.player.callback;
    unsafeWindow.amznMusic.widgets.player.callback = function(e) {
      if (e == "onPlay") {
        sendCurrentSong();
      }
      oldCallback(e);
    }
}

checkPlayer();
