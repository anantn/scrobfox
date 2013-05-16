const {Cc, Ci} = require("chrome"); // Needed for anchoring panel correctly

const self = require("self");
const tabs = require("tabs");
const panel = require("panel");
const lastfm = require("lastfm");
const simple = require("simple-storage");

const sites = {
  /*"pandora": {
    include: "*.pandora.com",
    url: "http://www.pandora.com"
  },
  "amazon": {
    include: "https://www.amazon.com/gp/dmusic/*",
    url: "http://www.amazon.com/cloudplayer"
  },*/
  "google": {
    include: "https://play.google.com/music/*",
    url: "https://play.google.com/music"
  }
};

/* Panel */
var foxpan = panel.Panel({
  width: 300,
  height: 150,
  contentURL: self.data.url("panel.html"),
  contentScriptFile: self.data.url("panel.js")
});

/* Initialize sites and images */
foxpan.port.emit("initialize", sites);

/* Toolbarbutton */
var button = null;
var navBar = null;

(function() {
  let WM = Cc['@mozilla.org/appshell/window-mediator;1'].
         getService(Ci.nsIWindowMediator);
  let doc = WM.getMostRecentWindow("navigator:browser").document;

  navBar = doc.getElementById("nav-bar");
  if (!navBar) {
    console.log("Fatal error: navigation bar is missing");
    return;
  }

  button = doc.createElement("toolbarbutton");
  button.setAttribute("type", "button");
  button.setAttribute("class", "toolbarbutton-1");
  button.setAttribute("image", self.data.url("i/icon.png"));
  button.setAttribute("label", "Scrobfox");

  button.addEventListener("click", function() {
    foxpan.show(button);
  });

  navBar.appendChild(button);
})();

/* Handlers for events from panel contentScript */
foxpan.port.on("connect", function() {
  /* Authorize */
  foxpan.hide();
  lastfm.authorize(function(keys) {
    if (!keys) {
      simple.storage.lastfm = null;
      foxpan.port.emit("connection", "failed");
    } else {
      simple.storage.lastfm = keys;
      foxpan.port.emit("connection", simple.storage.lastfm.name);
      if (button) {
        foxpan.show(button);
      }
    }
  });
});

foxpan.port.on("launch", function(which) {
  if (!sites[which]) {
    console.log("Error: launch called for unknown site " + which);
    return;
  }
  foxpan.hide();
  tabs.open(sites[which].url)
});

/* Let's check if we have a last.fm username & auth on file */
if (!simple.storage.lastfm || !simple.storage.lastfm.name) {
  foxpan.port.emit("connection", "connect");
  if (button) {
    foxpan.show(button);
  }
} else {
  foxpan.port.emit("connection", simple.storage.lastfm.name);

  /* Scrobble functions */
  function scrobbleIt(song) {
    //console.log("Scrobbling " + JSON.stringify(song));
    lastfm.scrobble(song, simple.storage.lastfm.key);
  }
  function nowPlaying(song) {
    //console.log("Now playing " + JSON.stringify(song));
    lastfm.nowPlaying(song, simple.storage.lastfm.key);
    foxpan.port.emit("playing", song);
  }

  /* Setup engine */
  const engine = require("engine");
  engine.Init(scrobbleIt, nowPlaying, sites);
}

/* On unload, remember to remove the toolbar button */
exports.onUnload = function(reason) {
  if (navBar && button) {
    navBar.removeChild(button);
  }
};
