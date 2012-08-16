
self.port.on("playing", function(song) {
    var sinfo = document.getElementById("info");
    sinfo.class = "songinfo";
    sinfo.innerHTML = '<span class="title">' + song.title + '</span><br/>';
    sinfo.innerHTML += '<span class="artist">by ' + song.artist;
});

self.port.on("connection", function(type) {
    switch (type) {
    case "connect":
        var but = document.getElementById("connector");
        but.onclick = function() {
            but.disabled = true;
            self.port.emit('connect');
        }
        break;

    case "failed":
        // edit connect message and stay at <div id="connect">
        var but = document.getElementById("connector");
        but.disabled = false;
        var mesg = document.getElementById("connector-message");
        mesg.innerHTML = "Could not authenticate - Try again?";
        break;

    default:
        // show <div id="default"> and append name
        document.getElementById("connect").style.display = "none";
        document.getElementById("default").style.display = "block";
        document.getElementById("pandora").onclick = function() {
            self.port.emit('launch', 'pandora');
        };
        var name = document.getElementById("connected");
        name.innerHTML += type;
        break;
    }
});

