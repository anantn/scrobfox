const {Cc, Ci} = require("chrome"); // Needed for anchoring panel correctly

const self = require("self");
const panel = require("panel");
const lastfm = require("lastfm");
const widgets = require("widget");
const simple = require("simple-storage");


var foxpan = panel.Panel({
    width: 300,
    height: 150,
    contentURL: self.data.url("panel.html"),
    contentScriptFile: self.data.url("panel.js")
});

var widget = widgets.Widget({
    id: "scrobfox",
    label: "Scrobfox",
    panel: foxpan,
    contentURL: self.data.url("icon.png")
});

/* Handlers for events from panel contentScript */
foxpan.port.on("connect", function() {
    /* Authorize */
    foxpan.hide();
    lastfm.authorize(function(keys) {
        if (!keys) {
            foxpan.port.emit("connection", "failed");
        } else {
            simple.storage.lastfm = keys;
            foxpan.port.emit("connection", simple.storage.lastfm.name);

            /* Calling show without an anchor shows the panel in the middle */
            let WM = Cc['@mozilla.org/appshell/window-mediator;1'].
                        getService(Ci.nsIWindowMediator);
            let doc = WM.getMostRecentWindow("navigator:browser").document;
            let bar = doc.getElementById("widget:" + self.id + "-scrobfox");
            foxpan.show(bar);
        }
    });
});

/* Let's check if we have a last.fm username & auth on file */
if (!simple.storage.lastfm || !simple.storage.lastfm.name) {
    foxpan.port.emit("connection", "none");
} else {
    foxpan.port.emit("connection", simple.storage.lastfm.name);
}

