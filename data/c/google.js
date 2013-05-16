
function sendCurrentSong() {
  var artist = document.querySelector(".player-artist-album-wrapper");
  var song = {
    title: document.querySelector("#playerSongTitle").childNodes[0].innerHTML,
    artist: artist.childNodes[0].innerHTML,
    album: artist.childNodes[2].innerHTML
  };
  self.postMessage(song);
}

var bar = document.querySelector("#playerSongInfo");
var obs = new MutationObserver(function(mutations) {
  if (mutations.length && mutations.length > 0) {
    sendCurrentSong();
  }
});

obs.observe(bar, {childList: true, subtree: true});
