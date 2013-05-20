
self.port.on("initialize", function(sites) {
  for (var site in sites) {
    var img = document.createElement("img");
    img.src = "i/" + site + ".png";
    img.id = site;
    img.onclick = (function(s) {
      return function() {
        self.port.emit("launch", s);
      }
    })(site);
    document.getElementById("launchers").appendChild(img);
  }
});

self.port.on("playing", function(song) {
  var sinfo = document.getElementById("info");
  sinfo.class = "songinfo";

  var spanTitle = document.createElement("span");
  spanTitle.class = "title";
  spanTitle.appendChild(document.createTextNode(song.title));

  var spanArtist = document.createElement("span");
  spanArtist.class = "artist";
  spanArtist.appendChild(document.createTextNode(song.artist));

  sinfo.innerHTML = "";
  sinfo.appendChild(spanTitle);
  sinfo.appendChild(document.createElement("br"));
  sinfo.appendChild(spanArtist);
});

self.port.on("connection", function(type) {
  switch (type) {
  case "connect":
    var but = document.getElementById("connector");
    but.onclick = function() {
      but.disabled = true;
      self.port.emit("connect");
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
    var name = document.getElementById("connected");
    name.innerHTML += type;
    break;
  }
});

