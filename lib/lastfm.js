const tabs = require("tabs");
const {Cc, Ci} = require("chrome"); // Needed for MD5
const request = require("request");

var api_key = "6e91b4d40c233852d6174e300ece1930";
var api_secret = "";
var api_base = "http://ws.audioscrobbler.com/2.0/";
var api_auth = "http://www.last.fm/api/auth/";

function LFMRequest() {
    this._uri = api_base;
}
LFMRequest.prototype = {
    _method: function(m) {
        this._params["method"] = m;
        this._params["api_key"] = api_key;
    },

    _makeSig: function() {
        let sig = "";
        let keys = Object.keys(this._params);
        keys.sort();

        for (let i = 0; i < keys.length; i++) {
            sig = sig + keys[i] + this._params[keys[i]];
        }
        sig += api_secret;

        let conv = Cc["@mozilla.org/intl/scriptableunicodeconverter"].
                    createInstance(Ci.nsIScriptableUnicodeConverter);
        conv.charset = "UTF-8";

        let data = conv.convertToByteArray(sig, {});
        let hasher = Cc["@mozilla.org/security/hash;1"].
                      createInstance(Ci.nsICryptoHash);
        hasher.init(hasher.MD5);
        hasher.update(data, data.length);

        let hash = hasher.finish(false);
        function toHexString(charCode) {
            return ("0" + charCode.toString(16)).slice(-2);
        }
        
        let hexed = [toHexString(hash.charCodeAt(i)) for (i in hash)].join("");
        return hexed;
    },

    _doCall: function(cb) {
        this._uri += "?";
        for (let prop in this._params) {
            this._uri = this._uri + prop + "=" + this._params[prop] + "&";
        }
        this._uri = this._uri + "api_sig=" + this._makeSig();

        /* We were including format=json before forming the signature, but
         * last.fm doesn't like it :( */
        this._uri += "&format=json";

        let req = request.Request({
            url: this._uri,
            onComplete: function(response) {
                cb(response.json);
            }
        });
        req.get();
    },

    getToken: function(cb) {
        this._params = {};
        this._method("auth.gettoken");
        this._doCall(function(result) {
            cb(result.token);
        });
    },

    getSession: function(token, cb) {
        this._params = {};
        this._method("auth.getsession");
        this._params["token"] = token;
        this._doCall(function(result) {
            if ("error" in result) {
                cb(false);
            } else {
                cb(result.session);
            }
        });
    }
};

function authorize(cb) {
    /* Get an auth token */
    let treq = new LFMRequest();
    treq.getToken(function(token) {
        /* Request auth from user */
        let uri = api_auth + "?api_key=" + api_key + "&token=" + token;
        tabs.open(uri);
        tabs.on("ready", function(tab) {
            if (tab.url != "http://www.last.fm/api/grantaccess") return;

            /* Verify the auth token by fetching a session token */
            tab.close();
            let sreq = new LFMRequest();
            sreq.getSession(token, function(key) {
                if (!key) cb(false);
                else cb(key);
            });
        });
    });
}

exports.authorize = authorize;
