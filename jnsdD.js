if (window.CavalryLogger) {
    CavalryLogger.start_js([ "jnsdD" ]);
}

PresenceMessage = {
    STARTED: "presence/started",
    SHUTDOWN: "presence/shutdown",
    RESTARTED: "presence/restarted",
    WINDOW_RESIZED: "presence/window-resized",
    TAB_CLOSED: "presence/tab-closed",
    TAB_OPENED: "presence/tab-opened",
    PRESENCE_UPDATER_READY: "presence/updater-ready",
    getAppMessageType: function(a, b) {
        return "presence/app_message:" + a + ":" + b;
    },
    getArbiterMessageType: function(a) {
        return "presence/message:" + a;
    }
};

Dcode = function() {
    var a, d = {}, b = {
        _: "%",
        A: "%2",
        B: "000",
        C: "%7d",
        D: "%7b%22",
        E: "%2c%22",
        F: "%22%3a",
        G: "%2c%22ut%22%3a1",
        H: "%2c%22bls%22%3a",
        I: "%2c%22n%22%3a%22%",
        J: "%22%3a%7b%22i%22%3a0%7d",
        K: "%2c%22pt%22%3a0%2c%22vis%22%3a",
        L: "%2c%22ch%22%3a%7b%22h%22%3a%22",
        M: "%7b%22v%22%3a2%2c%22time%22%3a1",
        N: ".channel%22%2c%22sub%22%3a%5b",
        O: "%2c%22sb%22%3a1%2c%22t%22%3a%5b",
        P: "%2c%22ud%22%3a100%2c%22lc%22%3a0",
        Q: "%5d%2c%22f%22%3anull%2c%22uct%22%3a",
        R: ".channel%22%2c%22sub%22%3a%5b1%5d",
        S: "%22%2c%22m%22%3a0%7d%2c%7b%22i%22%3a",
        T: "%2c%22blc%22%3a1%2c%22snd%22%3a1%2c%22ct%22%3a",
        U: "%2c%22blc%22%3a0%2c%22snd%22%3a1%2c%22ct%22%3a",
        V: "%2c%22blc%22%3a0%2c%22snd%22%3a0%2c%22ct%22%3a",
        W: "%2c%22s%22%3a0%2c%22blo%22%3a0%7d%2c%22bl%22%3a%7b%22ac%22%3a",
        X: "%2c%22ri%22%3a0%7d%2c%22state%22%3a%7b%22p%22%3a0%2c%22ut%22%3a1",
        Y: "%2c%22pt%22%3a0%2c%22vis%22%3a1%2c%22bls%22%3a0%2c%22blc%22%3a0%2c%22snd%22%3a1%2c%22ct%22%3a",
        Z: "%2c%22sb%22%3a1%2c%22t%22%3a%5b%5d%2c%22f%22%3anull%2c%22uct%22%3a0%2c%22s%22%3a0%2c%22blo%22%3a0%7d%2c%22bl%22%3a%7b%22ac%22%3a"
    };
    function c() {
        var f = [];
        for (var e in b) {
            d[b[e]] = e;
            f.push(b[e]);
        }
        f.reverse();
        a = new RegExp(f.join("|"), "g");
    }
    return {
        encode: function(e) {
            c();
            return encodeURIComponent(e).replace(/([_A-Z])|%../g, function(g, f) {
                return f ? "%" + f.charCodeAt(0).toString(16) : g;
            }).toLowerCase().replace(a, function(f) {
                return d[f];
            });
        },
        decode: function(e) {
            return decodeURIComponent(e.replace(/[_A-Z]/g, function(f) {
                return b[f];
            }));
        }
    };
}();

Dcode_deprecated = function() {
    var a, d = {}, b = {
        _: "%",
        A: "%22%3a",
        B: "%2c%22",
        C: "%2c%22sb%22%3a1%2c%22t%22%3a%7b%7d%2c%22f%22%3anull%2c%22uct%22%3a0%2c%22s%22%3a0%7d%2c%22bl%22%3a%7b%22ac%22%3a",
        D: "%7b%22",
        E: "%2c%22pt%22%3a0%2c%22vis%22%3a1%2c%22bls%22%3a0%2c%22blc%22%3a0%2c%22snd%22%3a1%2c%22blo%22%3a0%2c%22bvt%22%3a",
        F: "ri%22%3a0%7d%2c%22state%22%3a%7b%22p%22%3a0%2c%22ut%22%3a1",
        G: "%2c%22ch%22%3a%7b%22h%22%3a%22channel",
        H: "%22%2c%22p%22%3a80%2c%22sub%22%3a%5b",
        I: "%7d%7d",
        J: "%7b%22v%22%3a2%2c%22time%22%3a1",
        K: "%2c%22lc%22%3a1%2c%22cvr%22%3a%7b%22r%22%3a1%2c%22ts%22%3a1",
        L: "%5d%2c%22p%5f",
        M: "%22%3a0%2c%22",
        N: "%22%3a%7b%22i%22%3a0%2c%22all%46lids%22%3a%5bnull%5d",
        O: "0000",
        P: "%22%3a1",
        Q: "%7d",
        R: "%2c%22pt%22%3a0%2c%22vis%22%3a0%2c%22bls%22%3a0%2c%22blc%22%3a0%2c%22snd%22%3a1%2c%22blo%22%3a0%2c%22bvt%22%3a0%2c%22ct%22%3a0%2c%22sb%22%3a1%2c%22t%22%3a%7b%7d%2c%22f%22%3anull%2c%22uct%22%3a0%2c%22s%22%3a0%7d%2c2bl%22%3a%7b%22ac%22%3a0%2c%22ut",
        S: "%22%3a%7b%22ol%22%3a%2d1%2c%22exp%22%3a1",
        T: "fl%22%3a%5b%22%2d1%22%5d%2c%22all%46lids%22%3a%5b%22%2d1%22%5d",
        U: "ud%22%3a900%2c%22lc%22%3a0%2c%22cvr%22%3a%7b",
        V: "%2c%22ut%22%3a1",
        W: "%2c%22pt%22%3a0%2c%22vis%22%3a1%2c%22bls",
        X: "%2c%22lc%22%3a1%2c%22cvr%22%3a%7b%22r%22%3a0%2e",
        Y: "%22%3a%7b%22n%22%3a%22%",
        Z: "%2c%22ud%22%3a"
    };
    function c() {
        var f = [];
        for (var e in b) {
            d[b[e]] = e;
            f.push(b[e]);
        }
        f.reverse();
        a = new RegExp(f.join("|"), "g");
    }
    return {
        encode: function(e) {
            c();
            return encodeURIComponent(e).replace(/([_A-Z])|%../g, function(g, f) {
                return f ? "%" + f.charCodeAt(0).toString(16) : g;
            }).toLowerCase().replace(a, function(f) {
                return d[f];
            });
        },
        decode: function(e) {
            return decodeURIComponent(e.replace(/[_A-Z]/g, function(f) {
                return b[f];
            }));
        }
    };
}();

function CookieManager(b, a) {
    this.version = b;
    this.cookieName = "presence";
    this.dictEncode = a;
    this.storers = {};
    this.requireUserCookie = false;
    Arbiter.inform("presence-cookie-manager/initialized", this, Arbiter.BEHAVIOR_PERSISTENT);
}

CookieManager.prototype = {
    register: function(b, a) {
        this.storers[b] = a;
    },
    store: function() {
        var a = this._getCookie();
        if (a && a.v && this.version < a.v) {
            presence.versionShutdown();
            return;
        }
        var b = {
            v: this.version,
            time: parseInt(presence.getTime() * .001)
        };
        for (var d in this.storers) b[d] = this.storers[d]();
        var c = JSON.stringify(b);
        if (this.dictEncode) c = "E" + Dcode.encode(c);
        if (!this.requireUserCookie || presence.hasUserCookie(false)) setCookie(this.cookieName, c, null);
    },
    clear: function() {
        clearCookie(this.cookieName);
    },
    _getCookie: function() {
        try {
            var data = getCookie(this.cookieName);
            if (this.lastD === data) {
                return this.lastV;
            } else {
                this.lastD = data;
                this.lastV = null;
            }
            if (data && data.charAt(0) == "E") {
                data = Dcode.decode(data.substring(1));
            } else if (data && data.charAt(0) == "D") data = Dcode_deprecated.decode(data.substring(1));
            if (data) {
                this.lastV = JSON.parse(data);
                return this.lastV;
            }
        } catch (a) {}
        return null;
    },
    getSubCookie: function(b) {
        var a = this._getCookie();
        if (!a) return null;
        return a[b];
    },
    setCheckUserCookie: function(a) {
        this.requireUserCookie = a;
    }
};