
var main = document.getElementById("container");
var mesg = document.getElementById("message");
var load = document.getElementById("loading");

self.port.on("connection", function(type) {
    switch (type) {
    case "none":
        var div = document.createElement("div");
        div.id = "connect";

        var wel = document.createElement("p");
        wel.class = "centered";
        wel.innerHTML = "Let's get you set up, shall we?";

        var but = document.createElement("input");
        but.id = "connector";
        but.type = "button";
        but.value = "Connect to Last.FM";
        but.onclick = function() {
            but.value = "Connecting...";
            but.disabled = true;
            self.port.emit("connect");
        };

        mesg.innerHTML = "";
        div.appendChild(wel);
        div.appendChild(but);
        load = main.replaceChild(div, load);
        break;
    
    case "failure":
        mesg.innerHTML = "Could not authenticate - Try again?";
        but.value = "Connect to Last.FM";
        but.disabled = false;
        break;

    default:
        main.innerHTML = "";
        
        var song = document.createElement("div");
        song.id = "song";
        song.appendChild(document.createTextNode("You're not playing any music!"));

        var connected = document.createElement("div");
        connected.id = "connected";
        var asicon = document.createElement("img");
        asicon.src = "http://cdn.last.fm/flatness/favicon.2.ico";
        connected.appendChild(asicon);
        connected.appendChild(document.createTextNode(" Connected as " + type));

        main.appendChild(song);
        main.appendChild(connected);
        break;
    }
});

