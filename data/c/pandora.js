
function sendCurrentSong() {
    var song = {
        title: document.querySelector('.playerBarSong').innerHTML,
        artist: document.querySelector('.playerBarArtist').innerHTML,
        album: document.querySelector('.playerBarAlbum').innerHTML
    };

    if (song.title == "ad" || song.title == "audioad") {
        return;
    }
    self.postMessage(song);
}

function setupObserver(bar) {
    var obs = new MutationObserver(function(mutations) {
        mutations.forEach(function(m) {
            if (m.target.className != 'playerBarSong') {
                return;
            }
            setTimeout(sendCurrentSong, 2000);
        });
    });
    obs.observe(bar, {subtree:true, childList:true});
}

var timeout = 2000;
function checkAndPost() {
    var bar = document.querySelector('.nowplaying');
    var song = document.querySelector('.playerBarSong');
    if (bar && song && song.innerHTML.trim()) {
        sendCurrentSong();
        setupObserver(bar);
        return;
    }
    timeout *= 2;
    setTimeout(checkAndPost, timeout);
}

checkAndPost();
