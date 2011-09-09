if (window.CavalryLogger) {
    CavalryLogger.start_js([ "LayX0" ]);
}

void 1;

window.__DEV__ = window.__DEV__ || 0;

if (!window.skipDomainLower && navigator && navigator.userAgent && document.domain.toLowerCase().match(/(^|\.)facebook\..*/) && !(parseInt((/Gecko\/([0-9]+)/.exec(navigator.userAgent) || []).pop(), 10) <= 20060508)) document.domain = window.location.hostname.replace(/^.*(facebook\..*)$/i, "$1");

window.onloadhooks = window.onloadhooks || [];

window.onloadRegister = window.onloadRegister || function(a) {
    onloadhooks.push(a);
};

window.onafterloadhooks = window.onafterloadhooks || [];

window.onafterloadRegister = window.onafterloadRegister || function(a) {
    onafterloadhooks.push(a);
};

function run_if_loaded(a, b) {
    return window.loaded && b.call(a);
}

function run_with(b, a, c) {
    Bootloader.loadComponents(a, bind(b, c));
    return false;
}

function wait_for_load(c, b, e) {
    e = bind(c, e, b);
    if (window.loaded) return e();
    switch ((b || event).type) {
      case "load":
      case "focus":
        onafterloadRegister(e);
        return;
      case "click":
        var d = c.style, a = document.body.style;
        d.cursor = a.cursor = "progress";
        onafterloadRegister(function() {
            d.cursor = a.cursor = "";
            if (c.tagName.toLowerCase() == "a") {
                if (false !== e() && c.href) window.location.href = c.href;
            } else if (c.click) c.click();
        });
        break;
    }
    return false;
}

function bind(d, c) {
    var a = Array.prototype.slice.call(arguments, 2);
    function b() {
        var f = d || (this == window ? false : this), e = a.concat(Array.prototype.slice.call(arguments));
        if (typeof c == "string") {
            if (f[c]) return f[c].apply(f, e);
        } else return c.apply(f, e);
    }
    return b;
}

var curry = bind(null, bind, null);

function env_get(a) {
    return window.Env && Env[a];
}

document.documentElement.className = document.documentElement.className.replace("no_js", "");

function hasArrayNature(a) {
    return !!a && (typeof a == "object" || typeof a == "function") && "length" in a && !("setInterval" in a) && (Object.prototype.toString.call(a) === "[object Array]" || "callee" in a || "item" in a);
}

function $A(b) {
    if (!hasArrayNature(b)) return [ b ];
    if (b.item) {
        var a = b.length, c = new Array(a);
        while (a--) c[a] = b[a];
        return c;
    }
    return Array.prototype.slice.call(b);
}

function eval_global(c) {
    if ("string" != typeof c) {
        throw new Error("JS sent to eval_global is not a string.  Only strings " + "are permitted.");
    } else if ("" == c) return;
    var d = document.createElement("script");
    d.type = "text/javascript";
    try {
        d.appendChild(document.createTextNode(c));
    } catch (a) {
        d.text = c;
    }
    var b = document.getElementsByTagName("head")[0] || document.documentElement;
    b.appendChild(d);
    b.removeChild(d);
}

function copy_properties(b, c) {
    b = b || {};
    c = c || {};
    for (var a in c) b[a] = c[a];
    if (c.hasOwnProperty && c.hasOwnProperty("toString") && typeof c.toString != "undefined" && b.toString !== c.toString) b.toString = c.toString;
    return b;
}

function add_properties(a, b) {
    return copy_properties(window[a] || (window[a] = {}), b);
}

function is_empty(b) {
    if (b instanceof Array) {
        return b.length == 0;
    } else if (b instanceof Object) {
        for (var a in b) return false;
        return true;
    } else return !b;
}

if (!window.async_callback) window.async_callback = function(a, b) {
    return a;
};

function Arbiter() {
    copy_properties(this, {
        _listeners: [],
        _events: {},
        _callbacks: {},
        _last_id: 1,
        _listen: {},
        _index: {}
    });
    copy_properties(this, Arbiter);
}

copy_properties(Arbiter, {
    SUBSCRIBE_NEW: "new",
    SUBSCRIBE_ALL: "all",
    BEHAVIOR_EVENT: "event",
    BEHAVIOR_PERSISTENT: "persistent",
    BEHAVIOR_STATE: "state",
    LIVEMESSAGE: "livemessage",
    BOOTLOAD: "bootload",
    FUNCTION_EXTENSION: "function_ext",
    CONTEXT_CHANGE: "ui/context-change",
    PAGECACHE_INVALIDATE: "pagecache/invalidate",
    NEW_NOTIFICATIONS: "chat/new_notifications",
    LIST_EDITOR_LISTS_CHANGED: "listeditor/friend_lists_changed",
    CAROUSEL_ROTATE: "carousel/rotate",
    subscribe: function(k, b, i) {
        if (!k || k.length == 0) return null;
        k = $A(k);
        var a = Arbiter._getInstance(this);
        a._listeners.push({
            callback: b,
            types: k
        });
        var h = a._listeners.length - 1;
        for (var d = 0; d < k.length; d++) if (a._index[k[d]]) {
            a._index[k[d]].push(h);
        } else a._index[k[d]] = [ h ];
        i = i || Arbiter.SUBSCRIBE_ALL;
        if (i == Arbiter.SUBSCRIBE_ALL) {
            var c, j, g;
            for (var e = 0; e < k.length; e++) {
                j = k[e];
                if (j in a._events) for (var f = 0; f < a._events[j].length; f++) {
                    c = a._events[j][f];
                    g = b.apply(null, [ j, c ]);
                    if (g === false) {
                        a._events[j].splice(f, 1);
                        f--;
                    }
                }
            }
        }
        return {
            subscriberID: h
        };
    },
    unsubscribe: function(e) {
        var a = Arbiter._getInstance(this);
        var c = a._listeners[e.subscriberID];
        if (!c) return;
        for (var d = 0; d < c.types.length; d++) {
            var f = c.types[d];
            if (a._index[f]) for (var b = 0; b < a._index[f].length; b++) if (a._index[f][b] == e.subscriberID) {
                a._index[f].splice(b, 1);
                if (a._index[f].length == 0) delete a._index[f];
                break;
            }
        }
        delete a._listeners[e.subscriberID];
    },
    inform: function(j, c, b) {
        var m = hasArrayNature(j);
        var l = $A(j);
        var a = Arbiter._getInstance(this);
        var i = {};
        b = b || Arbiter.BEHAVIOR_EVENT;
        for (var e = 0; e < l.length; e++) {
            var j = l[e], d = null;
            if (b == Arbiter.BEHAVIOR_PERSISTENT) {
                d = a._events.length;
                if (!(j in a._events)) a._events[j] = [];
                a._events[j].push(c);
                a._events[j]._stateful = false;
            } else if (b == Arbiter.BEHAVIOR_STATE) {
                d = 0;
                a._events[j] = [ c ];
                a._events[j]._stateful = true;
            } else if (j in a._events) a._events[j]._stateful = false;
            window.ArbiterMonitor && ArbiterMonitor.record("event", j, c, a);
            var h;
            if (a._index[j]) {
                var k = $A(a._index[j]);
                for (var f = 0; f < k.length; f++) {
                    var g = a._listeners[k[f]];
                    if (g) {
                        h = g.callback.apply(null, [ j, c ]);
                        if (h === false) {
                            if (d !== null) a._events[j].splice(d, 1);
                            break;
                        }
                    }
                }
            }
            a._updateCallbacks(j, c);
            window.ArbiterMonitor && ArbiterMonitor.record("done", j, c, a);
            i[j] = h;
        }
        return m ? i : i[l[0]];
    },
    query: function(b) {
        var a = Arbiter._getInstance(this);
        if (!(b in a._events)) return null;
        if (a._events[b].length) return a._events[b][0];
        return null;
    },
    _instance: null,
    _getInstance: function(a) {
        if (a instanceof Arbiter) return a;
        if (!Arbiter._instance) Arbiter._instance = new Arbiter;
        return Arbiter._instance;
    },
    registerCallback: function(b, d) {
        var h, c = 0, a = Arbiter._getInstance(this), g = false;
        if (typeof b == "function") {
            h = a._last_id;
            a._last_id++;
            g = true;
        } else {
            if (!a._callbacks[b]) return null;
            h = b;
        }
        if (hasArrayNature(d)) {
            var i = {};
            for (var f = 0; f < d.length; f++) i[d[f]] = 1;
            d = i;
        }
        for (var j in d) {
            try {
                if (a.query(j)) continue;
            } catch (e) {}
            c += d[j];
            if (a._listen[j] === undefined) a._listen[j] = {};
            a._listen[j][h] = (a._listen[j][h] || 0) + d[j];
        }
        if (c == 0 && g) {
            b();
            return null;
        }
        if (!g) {
            a._callbacks[h].depnum += c;
        } else a._callbacks[h] = {
            callback: async_callback(b, "arbiter"),
            depnum: c
        };
        return h;
    },
    _updateCallbacks: function(d, c) {
        if (c === null || !this._listen[d]) return;
        for (var b in this._listen[d]) {
            this._listen[d][b]--;
            if (this._listen[d][b] <= 0) delete this._listen[d][b];
            this._callbacks[b].depnum--;
            if (this._callbacks[b].depnum <= 0) {
                var a = this._callbacks[b].callback;
                delete this._callbacks[b];
                a();
            }
        }
    }
});

Function.prototype.deferUntil = function(a, h, b, i) {
    var f = a();
    if (f) {
        this(f);
        return null;
    }
    var e = this, d = null, g = +(new Date);
    var c = function() {
        f = a();
        if (!f) if (h && new Date - g >= h) {
            i && i();
        } else return;
        d && clearInterval(d);
        e(f);
    };
    d = setInterval(c, 20, b);
    return d;
};

var Bootloader = window.Bootloader || {
    configurePage: function(a) {
        var g = {};
        var f = Bootloader.resolveResources(a);
        var b;
        for (b = 0; b < f.length; b++) {
            g[f[b].src] = f[b];
            Bootloader.requested(f[b].name);
            Bootloader._startCSSPoll(f[b].name);
        }
        var d = document.getElementsByTagName("link");
        for (b = 0; b < d.length; ++b) {
            if (d[b].rel != "stylesheet") continue;
            for (var c in g) if (d[b].href.indexOf(c) !== -1) {
                var e = g[c].name;
                Bootloader._cssLinkMap[e] = {
                    link: d[b]
                };
                if (g[c].permanent) Bootloader._permanent[e] = true;
                delete g[c];
                break;
            }
        }
    },
    loadComponents: function(c, a) {
        if (!Bootloader._bootloadEnabled) {
            Bootloader._waitForBootloadEnabled.push([ c, a ]);
            return;
        }
        c = $A(c);
        var f = [];
        for (var d = 0; d < c.length; ++d) {
            if (!c[d]) continue;
            var b = Bootloader._componentMap[c[d]];
            if (!!b) for (var e = 0; e < b.length; ++e) f.push(b[e]);
        }
        Bootloader.loadResources(f, a);
    },
    loadResources: function(g, a, f, j) {
        var b;
        g = Bootloader.resolveResources($A(g));
        if (f) {
            var d = {};
            for (b = 0; b < g.length; ++b) d[g[b].name] = true;
            for (var c in Bootloader._requested) if (!(c in Bootloader._permanent) && !(c in d) && !(c in Bootloader._earlyResources)) Bootloader._unloadResource(c);
            Bootloader._earlyResources = {};
        }
        var k = [];
        var e = [];
        for (b = 0; b < g.length; ++b) {
            var h = g[b];
            if (h.permanent) Bootloader._permanent[h.name] = true;
            var i = Arbiter.BOOTLOAD + "/" + h.name;
            if (Arbiter.query(i) !== null) continue;
            if (!h.nonblocking) e.push(i);
            if (!Bootloader._requested[h.name]) {
                Bootloader.requested(h.name);
                k.push(h);
                window.CavalryLogger && CavalryLogger.getInstance().measureResources(h, j);
            }
        }
        if (a) a = Arbiter.registerCallback(a, e);
        for (b = 0; b < k.length; ++b) Bootloader.requestResource(k[b].type, k[b].src, k[b].name);
        return a;
    },
    requestResource: function(j, g, e) {
        var b = Bootloader.getHardpoint();
        if (j == "js") {
            var f = document.createElement("script");
            f.src = g;
            f.type = "text/javascript";
            f.async = true;
            var a = function() {
                Bootloader.done([ e ]);
            };
            f.onload = f.onerror = a;
            f.onreadystatechange = function() {
                if (this.readyState in {
                    loaded: 1,
                    complete: 1
                }) a();
            };
            b.appendChild(f);
        } else if (j == "css") {
            if (document.createStyleSheet) {
                var h = Bootloader._styleTags, i = -1;
                for (var c = 0; c < h.length; c++) if (h[c].imports.length < 25) {
                    i = c;
                    break;
                }
                if (i == -1) {
                    h.push(document.createStyleSheet());
                    i = h.length - 1;
                }
                h[i].addImport(g);
                Bootloader._cssLinkMap[e] = {
                    tagIdx: i,
                    href: g
                };
            } else {
                var d = document.createElement("link");
                d.rel = "stylesheet";
                d.type = "text/css";
                d.media = "all";
                d.href = g;
                Bootloader._cssLinkMap[e] = {
                    link: d
                };
                b.appendChild(d);
            }
            Bootloader._startCSSPoll(e);
        }
    },
    _activeCSSPolls: {},
    _expireTime: null,
    _runCSSPolls: function() {
        var e;
        var c = [];
        var f = +(new Date);
        if (f >= Bootloader._expireTime) {
            if (window.send_error_signal) if (Math.random() < .01) send_error_signal("js_timeout_and_exception", "00001:error:CSS timeout.");
            for (e in Bootloader._activeCSSPolls) c.push(e);
            Bootloader.done(c, true);
            Bootloader._activeCSSPolls = {};
        } else {
            var d = Bootloader._CSS_EXPECTED_HEIGHT;
            var a;
            for (e in Bootloader._activeCSSPolls) {
                var b = Bootloader._activeCSSPolls[e];
                var g = b.offsetHeight == d || b.currentStyle && b.currentStyle.height == d + "px" || window.getComputedStyle && (a = document.defaultView.getComputedStyle(b, null)) && a.getPropertyValue("height") == d + "px";
                if (g) {
                    c.push(e);
                    b.parentNode.removeChild(b);
                    delete Bootloader._activeCSSPolls[e];
                }
            }
            if (!is_empty(c)) {
                Bootloader.done(c, true);
                Bootloader._expireTime = f + Bootloader._CSS_POLL_EXPIRATION;
            }
        }
        return is_empty(Bootloader._activeCSSPolls);
    },
    _startCSSPoll: function(c) {
        var b = "bootloader_" + c.replace(/[^a-z0-9]/ig, "_");
        var a = bagofholding;
        (function() {
            var d = document.createElement("div");
            d.id = b;
            document.body.appendChild(d);
            Bootloader._expireTime = +(new Date) + Bootloader._CSS_POLL_EXPIRATION;
            var f = is_empty(Bootloader._activeCSSPolls);
            Bootloader._activeCSSPolls[c] = d;
            if (f) var e = setInterval(function() {
                if (Bootloader._runCSSPolls()) e && clearInterval(e);
            }, 20, false);
        }).deferUntil(function() {
            return document.body;
        }, 5e3, false, a.curry("Still no DOM"));
    },
    done: function(e, b) {
        Bootloader.requested(e);
        if (!b) {
            var d = {
                sender: this
            };
            Arbiter.inform(Arbiter.BOOTLOAD, d, Arbiter.BEHAVIOR_EVENT);
        }
        for (var a = 0; a < e.length; ++a) {
            var c = e[a];
            Arbiter.inform(Arbiter.BOOTLOAD + "/" + c, true, Arbiter.BEHAVIOR_STATE);
        }
    },
    requested: function(b) {
        b = $A(b);
        for (var a = 0; a < b.length; ++a) Bootloader._requested[b[a]] = true;
    },
    enableBootload: function(b) {
        for (var c in b) if (!Bootloader._componentMap[c]) Bootloader._componentMap[c] = b[c];
        if (!Bootloader._bootloadEnabled) {
            Bootloader._bootloadEnabled = true;
            var d = Bootloader._waitForBootloadEnabled;
            for (var a = 0; a < d.length; a++) Bootloader.loadComponents.apply(null, d[a]);
            Bootloader._waitForBootloadEnabled = [];
        }
    },
    _unloadResource: function(d) {
        if (d in Bootloader._cssLinkMap) {
            var b = Bootloader._cssLinkMap[d], c = b.link;
            if (c) {
                c.parentNode.removeChild(c);
            } else {
                var e = Bootloader._styleTags[b.tagIdx];
                for (var a = 0; a < e.imports.length; a++) if (e.imports[a].href == b.href) {
                    e.removeImport(a);
                    break;
                }
            }
            delete Bootloader._cssLinkMap[d];
            delete Bootloader._requested[d];
            Arbiter.inform(Arbiter.BOOTLOAD + "/" + d, null, Arbiter.BEHAVIOR_STATE);
        }
    },
    getHardpoint: function() {
        if (!Bootloader._hardpoint) {
            var b, a = document.getElementsByTagName("head");
            if (a.length) {
                b = a[0];
            } else b = document.body;
            Bootloader._hardpoint = b;
        }
        return Bootloader._hardpoint;
    },
    setResourceMap: function(b) {
        if (!b) return;
        for (var a in b) {
            if (!b[a].name) b[a].name = a;
            Bootloader._resources[a] = b[a];
        }
    },
    resolveResources: function(d, a) {
        if (!d) return [];
        var c = new Array(d.length);
        for (var b = 0; b < d.length; ++b) if (!d[b].type && d[b] in Bootloader._resources) {
            c[b] = Bootloader._resources[d[b]];
            if (a && a in c[b]) c[b] = c[b][a];
        } else c[b] = d[b];
        return c;
    },
    loadEarlyResources: function(c) {
        var a;
        Bootloader.setResourceMap(c);
        var b = [];
        for (a in c) b.push(Bootloader._resources[a]);
        Bootloader.loadResources(b);
        for (a in c) {
            var d = Bootloader._resources[a];
            if (!d.permanent) Bootloader._earlyResources[d.name] = d;
        }
    },
    isDisplayJS: function(a) {
        return Bootloader._resources[a].displayjs;
    },
    _requested: {},
    _permanent: {},
    _componentMap: {},
    _cssLinkMap: {},
    _styleTags: [],
    _hardpoint: null,
    _resources: {},
    _earlyResources: {},
    _bootloadEnabled: false,
    _waitForBootloadEnabled: [],
    _CSS_POLL_EXPIRATION: 5e3,
    _CSS_EXPECTED_HEIGHT: 42
};

(function() {
    if (window != window.top) return;
    var m = "_e_", o = (window.name || "").toString();
    o = o.length == 7 && m == o.substr(0, 3) ? o.substr(3) : (window.name = m + window._EagleEyeSeed).substr(3);
    var j = m + o + "_", g = (new Date(+(new Date) + 6048e5)).toGMTString(), e = window.location.hostname.replace(/^.*(facebook\..*)$/i, "$1"), f = "; expires=" + g + ";path=/; domain=" + e, d = 0, p = false, k, n = window._EagleEyeSessionStorage && window.sessionStorage, h = document.cookie.length, i = false, l = +(new Date);
    function c(q) {
        return j + d++ + "=" + encodeURIComponent(q) + f;
    }
    function a() {
        var q = [], r = false;
        this.isEmpty = function() {
            return !q.length;
        };
        this.enqueue = function(t, s) {
            if (s) {
                q.unshift(t);
            } else q.push(t);
        };
        this.dequeue = function() {
            q.shift();
        };
        this.peek = function() {
            return q[0];
        };
        this.clear = function(u) {
            h = Math.min(h, document.cookie.length);
            if (!i && new Date - l > 6e4) i = true;
            var s = !u && document.cookie.search(m) >= 0;
            var zd = !!(window.Env && Env.cookie_header_limit);
            var z = window.Env && Env.cookie_count_limit || 19;
            var za = window.Env && Env.cookie_header_limit || 3950;
            var x = z - 5;
            var y = za - 1e3;
            while (!this.isEmpty()) {
                var t = c(this.peek());
                if (zd && (t.length > za || i && t.length + h > za)) {
                    this.dequeue();
                    continue;
                }
                if ((s || zd) && (document.cookie.length + t.length > za || document.cookie.split(";").length > z)) break;
                document.cookie = t;
                s = true;
                this.dequeue();
            }
            if (u || !r && s && (!this.isEmpty() || document.cookie.length > y || document.cookie.split(";").length > x) && (p || window.Arbiter && window.OnloadEvent && Arbiter.query(OnloadEvent.ONLOAD))) {
                var zc = new Image, zb = this, v = window._EagleEyeDomain || window.Env && Env.tracking_domain || "";
                r = true;
                zc.onload = function() {
                    r = false;
                    zb.clear();
                };
                var w = window.Env && Env.fb_isb ? "&fb_isb=" + Env.fb_isb : "";
                var ze = window.Env ? "&__user=" + Env.user : "";
                zc.src = v + "/ajax/nectar.php?asyncSignal=" + (Math.floor(Math.random() * 1e4) + 1) + w + ze + "&" + (!u ? "" : "s=") + +(new Date);
            }
        };
    }
    k = new a;
    if (n) {
        var b = function() {
            var s = 0;
            var u = s;
            function r() {
                var w = sessionStorage.getItem("_e_ids");
                if (w) {
                    var v = (w + "").split(";");
                    if (v.length == 2) {
                        s = parseInt(v[0], 10);
                        u = parseInt(v[1], 10);
                    }
                }
            }
            function t() {
                var v = s + ";" + u;
                sessionStorage.setItem("_e_ids", v);
            }
            function q(v) {
                return "_e_" + (v !== undefined ? v : s++);
            }
            this.isEmpty = function() {
                return u === s;
            };
            this.enqueue = function(x, v) {
                var w = v ? q(--u) : q();
                sessionStorage.setItem(w, x);
                t();
            };
            this.dequeue = function() {
                this.isEmpty();
                sessionStorage.removeItem(q(u));
                u++;
                t();
            };
            this.peek = function() {
                var v = sessionStorage.getItem(q(u));
                return v ? v + "" : v;
            };
            this.clear = k.clear;
            r();
        };
        k = new b;
    }
    window.EagleEye = {
        log: function(t, q, r) {
            if (window.Env && Env.no_cookies) return;
            var u = [ o, +(new Date), t ].concat(q);
            u.push(u.length);
            function s() {
                var w = JSON.stringify(u);
                try {
                    k.enqueue(w, !!r);
                    k.clear(!!r);
                } catch (v) {
                    if (n && v.code === 1e3) {
                        k = new a;
                        n = false;
                        s();
                    }
                }
            }
            if (window.JSON) {
                s();
            } else if (window.Bootloader) Bootloader.loadComponents("json", s);
        },
        createLogger: function(s, q) {
            q = q === undefined ? 1 : q;
            var r = function(t, u) {
                if (r.enabled) EagleEye.log(s, t, u);
            };
            r.enabled = false;
            Bootloader.loadComponents("string-extensions", function() {
                r._key = (window.Env && Env.user || Math.random()) + s;
                r.enabled = r._key.hash32() % 65535 / 65535 <= q;
            });
            return r;
        },
        loaded: function() {
            p = true;
        }
    };
})();

var Mixins = {
    Arbiter: {
        _getArbiterInstance: function() {
            return this._arbiter || (this._arbiter = new Arbiter);
        },
        inform: function(c, b, a) {
            return this._getArbiterInstance().inform(c, b, a);
        },
        subscribe: function(c, a, b) {
            return this._getArbiterInstance().subscribe(c, a, b);
        },
        unsubscribe: function(a) {
            this._getArbiterInstance().unsubscribe(a);
        }
    }
};

Class = {
    extend: function(a, b) {
        if (!Metaprototype._arbiterHandle) Metaprototype._arbiterHandle = Arbiter.subscribe(Arbiter.BOOTLOAD, Metaprototype._onbootload.bind(Metaprototype));
        Metaprototype._queue(a, b);
    },
    mixin: function(c, b) {
        var a = Array.prototype.slice.call(arguments);
        a[0] = a[0].prototype;
        Function.mixin.apply(Function, a);
    }
};

function Metaprototype() {}

copy_properties(Metaprototype, {
    makeFinal: function(a) {},
    _pending: {},
    _queue: function(b, c) {
        b.__class_extending = true;
        var a = Arbiter.registerCallback(bind(Metaprototype, Metaprototype._apply, b, c), [ Arbiter.FUNCTION_EXTENSION + "/" + c, Arbiter.BOOTLOAD ]);
        if (a !== null) this._pending[c] = true;
    },
    _onbootload: function(b, a) {
        this._update();
    },
    _update: function() {
        for (var a in this._pending) if (!!window[a]) {
            delete this._pending[a];
            if (!window[a].__class_extending) {
                Arbiter.inform(Arbiter.FUNCTION_EXTENSION + "/" + a, true, Arbiter.BEHAVIOR_STATE);
            } else window[a].__class_name = a;
        }
    },
    _apply: function(a, c) {
        delete a.__class_extending;
        var d = __metaprototype(window[c], 0);
        var b = __metaprototype(a, d.prototype.__level + 1);
        b.parent = d;
        if (!!a.__class_name) Arbiter.inform(Arbiter.FUNCTION_EXTENSION + "/" + a.__class_name, true, Arbiter.BEHAVIOR_STATE);
    }
});

function __metaprototype(c, a) {
    if (c.__metaprototype) return c.__metaprototype;
    var b = new Function;
    b.construct = __metaprototype_construct;
    b.prototype.construct = __metaprototype_wrap(c, a, true);
    b.prototype.__level = a;
    b.base = c;
    c.prototype.parent = b;
    c.__metaprototype = b;
    return b;
}

function __metaprototype_construct(a) {
    __metaprototype_init(a.parent);
    var d = [];
    var c = a;
    while (c.parent) {
        var b = new c.parent;
        d.push(b);
        b.__instance = a;
        c = c.parent;
    }
    a.parent = d[1];
    d.reverse();
    d.pop();
    a.__parents = d;
    a.__instance = a;
    return a.parent.construct.apply(a.parent, arguments);
}

function __metaprototype_init(d) {
    if (d.initialized) return;
    var a = d.base.prototype;
    if (d.parent) {
        __metaprototype_init(d.parent);
        var e = d.parent.prototype;
        for (var b in e) if (b != "__level" && b != "construct" && a[b] === undefined) a[b] = d.prototype[b] = e[b];
    }
    d.initialized = true;
    var c = d.prototype.__level;
    for (var b in a) if (b != "parent") a[b] = d.prototype[b] = __metaprototype_wrap(a[b], c);
}

function __metaprototype_wrap(c, b, d) {
    if (typeof c != "function" || c.__prototyped) return c;
    var a = function() {
        var g = this.__instance;
        if (g) {
            var h = g.parent;
            g.parent = b ? g.__parents[b - 1] : null;
            var e = arguments;
            if (d) {
                e = [];
                for (var f = 1; f < arguments.length; f++) e.push(arguments[f]);
            }
            var i = c.apply(g, e);
            g.parent = h;
            return i;
        } else return c.apply(this, arguments);
    };
    a.__prototyped = true;
    return a;
}

Function.mixin = function() {
    for (var b = 1, a = arguments.length; b < a; ++b) copy_properties(arguments[0], Mixins[arguments[b]] || arguments[b]);
};

Function.prototype.bind = function(b) {
    var a = [ b, this ].concat(Array.prototype.slice.call(arguments, 1));
    return bind.apply(null, a);
};

Function.prototype.curry = Function.prototype.bind.bind(null, null);

Function.prototype.shield = function(b) {
    if (typeof this != "function") throw new TypeException;
    var a = this.bind.apply(this, $A(arguments));
    return function() {
        return a();
    };
};

Function.prototype.defer = function(b, a) {
    if (typeof this != "function") throw new TypeError;
    b = b || 0;
    return setTimeout(this, b, a);
};

Function.prototype.postpone = function(a) {
    if (this._postpone) {
        clearTimeout(this._postpone);
        delete this._postpone;
    }
    if (a != null && a >= 0) this._postpone = setTimeout(this, a);
};

Function.prototype.recur = function(b, a) {
    if (typeof this != "function") throw new TypeError;
    return setInterval(this, b, a);
};

function bagofholding() {}

function bagof(a) {
    return function() {
        return a;
    };
}

(function() {
    UserAction = function() {};
    copy_properties(UserAction.prototype, {
        add_event: bagofholding,
        add_data: bagofholding,
        set_ua_id: bagofholding,
        set_namespace: bagofholding
    });
})();

function set_ue_cookie(a) {
    if (!(window.Env && Env.no_cookies)) document.cookie = "act=" + encodeURIComponent(a) + "; path=/; domain=" + window.location.hostname.replace(/^.*(\.facebook\..*)$/i, "$1");
}

var user_action = function() {
    var l = !window.ArbiterMonitor ? "r" : "a", n = 0, m, e, f, o = 0, k, i, b, c, h = [ 0, 0, 0, 0 ], d = function() {
        if (!!i) {
            var q = {
                profile_minifeed: 1,
                info_tab: 1,
                gb_content_and_toolbar: 1,
                gb_muffin_area: 1,
                ego: 1,
                bookmarks_menu: 1,
                jewelBoxNotif: 1,
                jewelNotif: 1,
                BeeperBox: 1,
                navSearch: 1
            };
            for (var p = i; p && p != document.body; p = p.parentNode) {
                if (!p.id || typeof p.id !== "string") continue;
                if (p.id.substr(0, 8) == "pagelet_") return p.id.substr(8);
                if (p.id.substr(0, 8) == "box_app_") return p.id;
                if (q[p.id]) return p.id;
            }
        }
        return "-";
    }, g = function(q) {
        if (!ge("content")) return [ 0, 0, 0, 0 ];
        var p = $("content");
        var r = window.Vector2 ? Vector2.getEventPosition(q) : {
            x: 0,
            y: 0
        };
        return [ r.x, r.y, p.offsetLeft, p.clientWidth ];
    }, j = function() {
        n++;
        var r = o + "/" + n;
        set_ue_cookie(r);
        var q = {};
        if (window.collect_data_attribs) {
            q = collect_data_attribs(i, [ "ft", "gt" ]);
            copy_properties(q.ft, c.ft || {});
            copy_properties(q.gt, c.gt || {});
        }
        var p = [];
        if (l == "a") {
            ArbiterMonitor.initUE(r, [ (q && q.gt || {}).ua_id || "", i ]);
            f = ArbiterMonitor.getInternRef(i);
            p = ArbiterMonitor.getActFields();
        }
        window.EagleEye && EagleEye.log("act", [ o, n, e || "-", b, m || "-", f || d(i), l, window.URI ? URI.getRequestURI(true, true).getUnqualifiedURI().toString() : location.pathname + location.search + location.hash, q ].concat(h).concat(p));
        k = true;
    }, a = function(u, q, s, t, r) {
        if (!!s) {
            m = s.type;
            if (m == "click" && ge("content")) h = g(s);
            var p = 0;
            s.ctrlKey && (p += 1);
            s.shiftKey && (p += 2);
            s.altKey && (p += 4);
            s.metaKey && (p += 8);
            if (p) m += p;
        }
        if (!u && s) u = s.getTarget();
        if (!!u) {
            e = u.getAttribute && (u.getAttribute("ajaxify") || u.getAttribute("data-endpoint")) || u.action || u.href || u.name;
            i = u;
        }
        if (!!q && !b) b = q;
        if (!!r) c = r;
        if (t == "FORCE" || e) j();
    };
    return function(t, p, r, s, q) {
        var u = +(new Date);
        Bootloader.loadComponents("dom-collect", function() {
            if (u - o < 10) {
                !k && a(t, p, r, s, q);
                return;
            }
            if (s == "INDIRECT") return;
            m = e = f = i = b = null;
            c = {};
            k = false;
            o = u;
            a(t, p, r, s, q);
        });
        return new UserAction;
    };
}();

ge = $ = function(a) {
    return typeof a == "string" ? document.getElementById(a) : a;
};

CSS = window.CSS || {
    hasClass: function(b, a) {
        b = $(b);
        return (" " + b.className + " ").indexOf(" " + a + " ") > -1;
    },
    addClass: function(b, a) {
        b = $(b);
        if (a && !CSS.hasClass(b, a)) b.className = b.className + " " + a;
        return b;
    },
    removeClass: function(b, a) {
        b = $(b);
        b.className = b.className.replace(new RegExp("(^|\\s)" + a + "(?:\\s|$)", "g"), "$1");
        return b;
    },
    toggleClass: function(b, a) {
        return CSS.conditionClass(b, a, !CSS.hasClass(b, a));
    },
    conditionClass: function(c, b, a) {
        return (a ? CSS.addClass : CSS.removeClass)(c, b);
    },
    show: function(a) {
        CSS.removeClass(a, "hidden_elem");
    },
    hide: function(a) {
        CSS.addClass(a, "hidden_elem");
    },
    conditionShow: function(b, a) {
        CSS.conditionClass(b, "hidden_elem", !a);
    }
};

var Parent = {
    byTag: function(a, b) {
        b = b.toUpperCase();
        while (a && a.nodeName != b) a = a.parentNode;
        return a;
    },
    byClass: function(b, a) {
        while (b && !CSS.hasClass(b, a)) b = b.parentNode;
        return b;
    },
    byAttribute: function(b, a) {
        while (b && (!b.getAttribute || !b.getAttribute(a))) b = b.parentNode;
        return b;
    }
};

function trackReferrer(a, e) {
    a = Parent.byAttribute(a, "data-referrer");
    if (a) {
        var d = /^(?:(?:[^:\/?#]+):)?(?:\/\/(?:[^\/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?/.exec(e)[1] || "";
        if (!d) return;
        var c = d + "|" + a.getAttribute("data-referrer");
        var b = new Date;
        b.setTime((new Date).getTime() + 1e3);
        document.cookie = "x-src=" + encodeURIComponent(c) + "; " + "expires=" + b.toGMTString() + ";path=/; domain=" + window.location.hostname.replace(/^.*(\.facebook\..*)$/i, "$1");
    }
    return a;
}

!function() {
    if (window.__primer) return;
    window.__primer = true;
    var a = null;
    document.documentElement.onclick = function(d) {
        d = d || window.event;
        a = d.target || d.srcElement;
        var e = Parent.byTag(a, "A");
        if (!e) return;
        var b = e.getAttribute("ajaxify");
        var f = e.href;
        var i = b || f;
        i && user_action(e, "a", d);
        if (b && f && !/#$/.test(f)) {
            var g = d.which && d.which != 1;
            var h = d.altKey || d.ctrlKey || d.metaKey || d.shiftKey;
            if (g || h) return;
        }
        trackReferrer(e, i);
        var c = [ "dialog" ];
        switch (e.rel) {
          case "dialog-pipe":
            c.push("ajaxpipe");
          case "dialog":
          case "dialog-post":
            Bootloader.loadComponents(c, function() {
                Dialog.bootstrap(i, null, e.rel == "dialog", null, null, e);
            });
            break;
          case "async":
          case "async-post":
            Bootloader.loadComponents("async", function() {
                AsyncRequest.bootstrap(i, e);
            });
            break;
          case "theater":
            if (window.Env && Env.theater_ver == "2") {
                Bootloader.loadComponents("PhotoSnowbox", function() {
                    PhotoSnowbox.bootstrap(i, e);
                });
            } else Bootloader.loadComponents("PhotoTheater", function() {
                PhotoTheater.bootstrap(i, e);
            });
            break;
          case "toggle":
            CSS.toggleClass(e.parentNode, "openToggler");
            Bootloader.loadComponents("Toggler", function() {
                Toggler.bootstrap(e);
            });
            break;
          default:
            return;
        }
        return false;
    };
    document.documentElement.onsubmit = function(b) {
        b = b || window.event;
        var c = b.target || b.srcElement;
        if (c && c.nodeName == "FORM" && c.getAttribute("rel") == "async") {
            user_action(c, "f", b);
            var d = a;
            Bootloader.loadComponents("dom-form", function() {
                Form.bootstrap(c, d);
            });
            return false;
        }
    };
}();

var ua = {
    ie: function() {
        return ua._populate() || this._ie;
    },
    ie64: function() {
        return ua.ie() && this._win64;
    },
    firefox: function() {
        return ua._populate() || this._firefox;
    },
    opera: function() {
        return ua._populate() || this._opera;
    },
    safari: function() {
        return ua._populate() || this._safari;
    },
    chrome: function() {
        return ua._populate() || this._chrome;
    },
    windows: function() {
        return ua._populate() || this._windows;
    },
    osx: function() {
        return ua._populate() || this._osx;
    },
    linux: function() {
        return ua._populate() || this._linux;
    },
    iphone: function() {
        return ua._populate() || this._iphone;
    },
    _populated: false,
    _populate: function() {
        if (ua._populated) return;
        ua._populated = true;
        var d = navigator.userAgent;
        var a = /(?:MSIE.(\d+\.\d+))|(?:(?:Firefox|GranParadiso|Iceweasel).(\d+\.\d+))|(?:Opera(?:.+Version.|.)(\d+\.\d+))|(?:AppleWebKit.(\d+(?:\.\d+)?))/.exec(d);
        var c = /(Mac OS X)|(Windows)|(Linux)/.exec(d);
        var b = /\b(iPhone|iP[ao]d)/.exec(d);
        ua._win64 = !!/Win64/.exec(d);
        if (a) {
            ua._ie = a[1] ? parseFloat(a[1]) : NaN;
            if (ua._ie && document.documentMode) ua._ie = document.documentMode;
            ua._firefox = a[2] ? parseFloat(a[2]) : NaN;
            ua._opera = a[3] ? parseFloat(a[3]) : NaN;
            ua._safari = a[4] ? parseFloat(a[4]) : NaN;
            if (ua._safari) {
                a = /(?:Chrome\/(\d+\.\d+))/.exec(d);
                ua._chrome = a && a[1] ? parseFloat(a[1]) : NaN;
            } else ua._chrome = NaN;
        } else ua._ie = ua._firefox = ua._opera = ua._chrome = ua._safari = NaN;
        if (c) {
            if (c[1]) {
                var e = /(?:Mac OS X (\d+(?:[._]\d+)?))/.exec(d);
                ua._osx = e ? parseFloat(e[1].replace("_", ".")) : true;
            } else ua._osx = false;
            ua._windows = !!c[2];
            ua._linux = !!c[3];
        } else ua._osx = ua._windows = ua._linux = false;
        ua._iphone = b;
    }
};

OnloadEvent = {
    ONLOAD: "onload/onload",
    ONLOAD_CALLBACK: "onload/onload_callback",
    ONLOAD_DOMCONTENT: "onload/dom_content_ready",
    ONLOAD_DOMCONTENT_CALLBACK: "onload/domcontent_callback",
    ONBEFOREUNLOAD: "onload/beforeunload",
    ONUNLOAD: "onload/unload"
};

function _include_quickling_events_default() {
    return !window.loading_page_chrome;
}

function onbeforeunloadRegister(a, b) {
    if (b === undefined) b = _include_quickling_events_default();
    b ? _addHook("onbeforeleavehooks", a) : _addHook("onbeforeunloadhooks", a);
}

function onunloadRegister(a) {
    if (!window.onunload) window.onunload = function() {
        Arbiter.inform(OnloadEvent.ONUNLOAD, true, Arbiter.BEHAVIOR_STATE);
    };
    _addHook("onunloadhooks", a);
}

function onleaveRegister(a) {
    _addHook("onleavehooks", a);
}

function _addHook(b, a) {
    window[b] = (window[b] || []).concat(a);
}

function removeHook(a) {
    window[a] = [];
}

function _domcontentready() {
    Arbiter.inform(OnloadEvent.ONLOAD_DOMCONTENT, true, Arbiter.BEHAVIOR_STATE);
}

function _bootstrapEventHandlers() {
    var a = document, e = window;
    if (a.addEventListener) {
        if (ua.safari() < 525) {
            var d = setInterval(function() {
                if (/loaded|complete/.test(a.readyState)) {
                    _domcontentready();
                    clearInterval(d);
                }
            }, 10);
        } else a.addEventListener("DOMContentLoaded", _domcontentready, true);
    } else {
        var c = "javascript:void(0)";
        if (e.location.protocol == "https:") c = "//:";
        a.write("<script onreadystatechange=\"if (this.readyState=='complete') {" + 'this.parentNode.removeChild(this);_domcontentready();}" ' + 'defer="defer" src="' + c + '"></script>');
    }
    var b = e.onload;
    e.onload = function() {
        e.CavalryLogger && CavalryLogger.getInstance().setTimeStamp("t_layout");
        b && b();
        Arbiter.inform(OnloadEvent.ONLOAD, true, Arbiter.BEHAVIOR_STATE);
    };
    e.onbeforeunload = function() {
        var f = {};
        Arbiter.inform(OnloadEvent.ONBEFOREUNLOAD, f, Arbiter.BEHAVIOR_STATE);
        if (!f.warn) Arbiter.inform("onload/exit", true);
        return f.warn;
    };
}

onload_callback = Arbiter.registerCallback(function() {
    window.CavalryLogger && CavalryLogger.getInstance().setTimeStamp("t_onload");
    Arbiter.inform(OnloadEvent.ONLOAD_CALLBACK, true, Arbiter.BEHAVIOR_STATE);
}, [ OnloadEvent.ONLOAD ]);

domcontent_callback = Arbiter.registerCallback(function() {
    window.CavalryLogger && CavalryLogger.getInstance().setTimeStamp("t_domcontent");
    Arbiter.inform(OnloadEvent.ONLOAD_DOMCONTENT_CALLBACK, true, Arbiter.BEHAVIOR_STATE);
}, [ OnloadEvent.ONLOAD_DOMCONTENT ]);

if (!window._eventHandlersBootstrapped) {
    _eventHandlersBootstrapped = true;
    _bootstrapEventHandlers();
}

function tx(b, a) {
    if (typeof _string_table == "undefined") return;
    b = _string_table[b];
    return _tx(b, a);
}

function intl_ends_in_punct(a) {
    if (typeof a != "string") return false;
    return a.match(new RegExp(intl_ends_in_punct.punct_char_class + "[" + ')"' + "'" + "»" + "༻" + "༽" + "’" + "”" + "›" + "〉" + "》" + "」" + "』" + "】" + "〕" + "〗" + "〙" + "〛" + "〞" + "〟" + "﴿" + "＇" + "）" + "］" + "s" + "]*$"));
}

intl_ends_in_punct.punct_char_class = "[" + ".!?" + "。" + "！" + "？" + "।" + "…" + "ຯ" + "᠁" + "ฯ" + "．" + "]";

function intl_render_list_separator() {
    return _tx("{previous-items}, {next-items}", {
        "previous-items": "",
        "next-items": ""
    });
}

function intl_phonological_rules(g) {
    var e, d = g, f = window.intl_locale_rewrites, b, c;
    try {
        if (f) {
            var pats = [], reps = [];
            for (var p in f.patterns) {
                var pat = p, rep = f.patterns[p];
                for (b in f.meta) {
                    e = new RegExp(b.slice(1, -1), "g");
                    pat = pat.replace(e, f.meta[b]);
                    rep = rep.replace(e, f.meta[b]);
                }
                pats[pats.length] = pat;
                reps[reps.length] = rep;
            }
            for (var ii = 0; ii < pats.length; ii++) {
                e = new RegExp(pats[ii].slice(1, -1), "g");
                if (reps[ii] == "javascript") {
                    c = g.match(e);
                    b = c && c[0];
                    if (b) g = g.replace(e, b.slice(1).toLowerCase());
                } else g = g.replace(e, reps[ii]);
            }
        }
    } catch (a) {
        g = d;
    }
    e = new RegExp("", "g");
    g = g.replace(e, "");
    return g;
}

function _tx(e, a) {
    if (!a) return e;
    var d;
    for (var c in a) {
        if (intl_ends_in_punct(a[c])) {
            d = new RegExp("\\{" + c + "\\}" + intl_ends_in_punct.punct_char_class + "*", "g");
        } else d = new RegExp("\\{" + c + "\\}", "g");
        var b = "";
        if (a[c][0] != "~") b = "";
        e = e.replace(d, b + a[c] + b);
    }
    e = intl_phonological_rules(e);
    return e;
}

InitialJSLoader = {
    INITIAL_JS_READY: "BOOTLOAD/JSREADY",
    load: function(a) {
        InitialJSLoader.callback = Bootloader.loadResources(a, InitialJSLoader.callback);
    },
    callback: Arbiter.registerCallback(function() {
        Arbiter.inform(InitialJSLoader.INITIAL_JS_READY, true, Arbiter.BEHAVIOR_STATE);
    }, [ OnloadEvent.ONLOAD_DOMCONTENT_CALLBACK ])
};

function goURI(b, a) {
    b = b.toString();
    if (!a && window.PageTransitions && PageTransitions.isInitialized()) {
        PageTransitions.go(b);
    } else if (window.location.href == b) {
        window.location.reload();
    } else window.location.href = b;
}

function loadExternalJavascript(f, b, a) {
    if (f instanceof Array) {
        var e = f.shift(0);
        if (e) {
            loadExternalJavascript(e, function() {
                if (f.length) {
                    loadExternalJavascript(f, b, a);
                } else b && b();
            }, a);
        } else if (b) b();
    } else {
        var c = a ? document.body : document.getElementsByTagName("head")[0];
        var d = document.createElement("script");
        d.type = "text/javascript";
        d.src = f;
        if (b) {
            d.onerror = d.onload = b;
            d.onreadystatechange = function() {
                if (this.readyState == "complete" || this.readyState == "loaded") b();
            };
        }
        c.appendChild(d);
        return d;
    }
}

function invoke_callbacks(b, d) {
    if (b) for (var c = 0; c < b.length; c++) try {
        (new Function(b[c])).apply(d);
    } catch (a) {}
}

(function() {
    window.JSLogger = function(d) {
        this.cat = d;
        this._counts = {};
        return a.instances[d] || (a.instances[d] = this);
    };
    var a = JSLogger._ = {
        instances: {},
        backlog: [],
        stringify: function(e) {
            try {
                return JSON.stringify(e);
            } catch (d) {
                return '{"stringify_error": "' + d.message + '"}';
            }
        }
    };
    var c = [ "debug", "log", "warn", "error", "bump" ];
    for (var b = 0; b < c.length; b++) (function(d) {
        JSLogger.prototype[d] = function(event, e) {
            if (a.backlog.length < 100) a.backlog.push([ this.cat, d, event, a.stringify(e) ]);
        };
    })(c[b]);
})();

window.Event = window.Event || function() {};

Event.__inlineSubmit = function(b, event) {
    var a = Event.__getHandler && Event.__getHandler(b, "submit");
    return a ? null : Event.__bubbleSubmit(b, event);
};

Event.__bubbleSubmit = function(a, event) {
    if (document.documentElement.attachEvent) {
        var b;
        while (b !== false && (a = a.parentNode)) b = a.onsubmit ? a.onsubmit(event) : Event.__fire && Event.__fire(a, "submit", event);
        return b;
    }
};

(function() {
    var t = {}, r = {}, k = 0, s = this, h = "requireWhenReady", c = "exports", b = "dependencies", f = "module", j = "waiting", d = "factory", i = undefined, a = "define", e = "global", g = "require";
    function u(zb) {
        var zc = t[zb], w, za;
        if (!zc[c]) {
            var y = zc[c] = {}, z = zc[d];
            if (Object.prototype.toString.call(z) === "[object Function]") {
                var v = [], x = zc[b];
                for (za = 0; za < x.length; za++) {
                    w = x[za];
                    v.push(w === f ? zc : w === c ? y : u(w));
                }
                var zd = z.apply(s, v);
                if (zd) zc[c] = zd;
            } else zc[c] = z;
        }
        return zc[c];
    }
    function p(x, v, w, z) {
        if (v === i) {
            v = [];
            w = x;
            x = n();
        } else if (w === i) {
            w = v;
            v = x;
            x = n();
        }
        if (t[x]) return;
        var y = {
            id: x
        };
        y[d] = w;
        y[b] = v;
        y[h] = z;
        t[x] = y;
        l(x);
    }
    function q(x, v, w) {
        p(x, v, w, true);
    }
    function n() {
        return "__mod__" + k++;
    }
    function l(x) {
        var y = t[x];
        var z = 0;
        for (var w = 0; w < y[b].length; w++) {
            var v = y[b][w];
            if (!t[v] || t[v][j]) {
                r[v] || (r[v] = {});
                r[v][x] = 1;
                z++;
            }
        }
        y[j] = z;
        o(x);
    }
    function o(w) {
        var x = t[w];
        if (!x[j]) {
            if (x[h]) u(w);
            var y = r[w];
            if (y) {
                delete r[w];
                for (var v in y) {
                    t[v][j]--;
                    o(v);
                }
            }
        }
    }
    function m(w, v) {
        t[w] = {
            id: w
        };
        t[w][c] = v;
    }
    m(f, 0);
    m(c, 0);
    m(a, p);
    m(e, s);
    m(g, u);
    p.amd = {};
    s[a] = p;
    s[g] = u;
    s.defineAndRequire = q;
    s.__d = function(w, v) {
        p(w, [ e, f, g, c ], v);
    };
})();

JSCC = window.JSCC || function() {
    var a = {}, b = {};
    return {
        get: function(c) {
            if (c in a) {
                b[c] = a[c]();
                delete a[c];
                return b[c];
            } else return b[c];
        },
        init: function(c) {
            copy_properties(a, c);
        }
    };
}();

DynaTemplate = window.DynaTemplate || function() {
    var g = "[[", i = "\\[\\[", h = "\\]\\]";
    var l = {};
    var a = {};
    function d(n, m) {
        return m.indexOf(g + n) != -1;
    }
    function e(m) {
        return Object.prototype.toString.call(m) === "[object Array]";
    }
    function f(m) {
        return m && typeof m == "object";
    }
    function c(m) {
        switch (m) {
          case "&":
            return "&amp;";
          case '"':
            return "&quot;";
          case "'":
            return "&#39;";
          case "<":
            return "&lt;";
          case ">":
            return "&gt;";
          default:
            return m;
        }
    }
    function b(m) {
        m = String(m === null ? "" : m);
        return m.replace(/&(?!\w+;)|["'<>]/g, c);
    }
    function j(n) {
        for (var m in n) {
            var o = n[m];
            a[o[0]] = o[1];
            l[m] = o[1];
        }
    }
    function k(p, m) {
        if (p.charAt(0) == "@") return k(a[p.substring(1)], m);
        if (d("#", p) || d("^", p)) {
            var o = new RegExp(i + "(\\^|\\#)\\s*(.+)\\s*" + h + "\n*([\\s\\S]+?)" + i + "\\/\\s*\\2\\s*" + h + "\\s*", "mg");
            p = p.replace(o, function(q, v, t, r) {
                var w = m[t];
                w = w && w.__html !== undefined ? w.__html : w;
                if (v == "^") {
                    if (!w || e(w) && w.length === 0) {
                        return k(r, m);
                    } else return "";
                } else if (v == "#") {
                    if (e(w)) {
                        var u = [];
                        for (var s = 0; s < w.length; s++) u.push(k(r, w[s]));
                        return u.join("");
                    } else if (f(w)) {
                        return k(r, w);
                    } else if (!(typeof w == "function")) if (w) return k(r, m);
                    return "";
                }
            });
        }
        if (!d("", p)) return p;
        var n = new RegExp(i + "(>|\\[|&)?([^\\/#\\^]+?)\\1?" + h + "+", "g");
        return p.replace(n, function(q, s, r) {
            r = r.replace(/^\s*|\s*$/g, "");
            var t = m[r];
            if (!t || t instanceof Array && t.length === 0) return "";
            switch (s) {
              case ">":
                if (t[0].charAt(0) == "@") {
                    return k(t[0], t[1]);
                } else if (!(t[0] in l)) return "";
                return k(l[t[0]], t[1]);
              case "&":
              default:
                if (window.HTML && t instanceof HTML) return t.toString();
                return t.__html !== undefined ? t.__html : b(t);
            }
        });
    }
    return {
        registerTemplates: j,
        renderToHtml: k
    };
}();

function BigPipe(a) {
    copy_properties(this, {
        arbiter: Arbiter,
        rootNodeID: "content",
        lid: 0,
        isAjax: false,
        isReplay: false,
        rrEnabled: true,
        domContentCallback: domcontent_callback,
        onloadCallback: onload_callback,
        domContentEvt: OnloadEvent.ONLOAD_DOMCONTENT_CALLBACK,
        onloadEvt: OnloadEvent.ONLOAD_CALLBACK,
        forceFinish: false,
        _phaseDoneCallbacks: [],
        _currentPhase: 0,
        _lastPhase: -1,
        _cached_pagelets: {}
    });
    copy_properties(this, a);
    this._cavalry = this.lid && window.CavalryLogger ? CavalryLogger.getInstance(this.lid) : null;
    this._inst = this._cavalry && (window._pagelet_profile || this._cavalry.isPageletProfiler());
    BigPipe._current_instance = this;
    if (env_get("tti_vision") == 1) (new TTIVisualizer(this)).init();
    this.arbiter.registerCallback(this.domContentCallback, [ "pagelet_displayed_all" ]);
    this.arbiter.inform("phase_begin_0", true, Arbiter.BEHAVIOR_STATE);
    this._inst && this._cavalry.setTimeStamp("t_phase_begin_0");
    this.onloadCallback = this.arbiter.registerCallback(this.onloadCallback, [ "pagelet_displayed_all" ]);
}

copy_properties(BigPipe.prototype, {
    _ct: function(a) {
        return !a || "length" in a && a.length === 0 ? {} : a;
    },
    _displayPagelet: function(e) {
        if (this._inst) this._cavalry.onPageletEvent("display_start", e.id);
        e.content = this._ct(e.content);
        var d = true;
        for (var c in e.content) {
            if (e.append) {
                if (e.append === "bigpipe_root") {
                    target_id = this.rootNodeID;
                } else target_id = e.append;
            } else target_id = c;
            var b = document.getElementById(target_id), a = e.content[c];
            if (b) {
                if (a) {
                    if (typeof a != "string") a = DynaTemplate.renderToHtml(a[0], a[1]);
                    if (!e.append && e.has_inline_js) {
                        if (window.DOM && window.HTML) {
                            DOM.setContent(b, HTML(a));
                        } else {
                            d = false;
                            Bootloader.loadComponents("dom", function() {
                                DOM.setContent(b, HTML(a));
                                this.arbiter.inform(e.id + "_displayed", true, Arbiter.BEHAVIOR_STATE);
                            }.bind(this));
                        }
                    } else if (e.append || ua.ie() < 8) {
                        if (!e.append) while (b.firstChild) b.removeChild(b.firstChild);
                        this._appendNodes(b, a);
                    } else b.innerHTML = a;
                }
                if (this._inst) this._cavalry.onPageletEvent("display", e.id);
                b.setAttribute("data-referrer", b.getAttribute("data-referrer") || target_id);
            }
        }
        if (d) this.arbiter.inform(e.id + "_displayed", true, Arbiter.BEHAVIOR_STATE);
        if (e.cache_hit && env_get("pc_debug") == 1) $(e.id).style.border = "1px red solid";
    },
    _appendNodes: function(a, d) {
        var e = document.createElement("div");
        var c = ua.ie() < 7;
        if (c) a.appendChild(e);
        e.innerHTML = d;
        var b = document.createDocumentFragment();
        while (e.firstChild) b.appendChild(e.firstChild);
        a.appendChild(b);
        if (c) a.removeChild(e);
    },
    _downloadJsForPagelet: function(a) {
        Bootloader.loadResources(a.js || [], bind(this, function() {
            if (this._inst) this._cavalry.onPageletEvent("jsdone", a.id);
            a.requires = a.requires || [];
            if (!this.isAjax || a.phase >= 1) a.requires.push("uipage_onload");
            var c = bind(this, function() {
                if (!this._isRelevant()) return;
                invoke_callbacks(a.onload);
                if (this._inst) this._cavalry.onPageletEvent("onload", a.id);
                this.arbiter.inform("pagelet_onload", true, Arbiter.BEHAVIOR_EVENT);
                a.provides && this.arbiter.inform(a.provides, true, Arbiter.BEHAVIOR_STATE);
            });
            var b = bind(this, function() {
                this._isRelevant() && invoke_callbacks(a.onafterload);
            });
            this.arbiter.registerCallback(c, a.requires);
            this.arbiter.registerCallback(b, [ this.onloadEvt ]);
        }), false, a.id);
    },
    _downloadCssAndDisplayPagelet: function(c) {
        if (this._inst) this._cavalry.onPageletEvent("css", c.id);
        var b = bind(this, function() {
            var d = c.display_dependency || [];
            var f = [];
            for (var e = 0; e < d.length; e++) f.push(d[e] + "_displayed");
            this.arbiter.registerCallback(this._displayPagelet.bind(this, c), f);
        });
        var a = c.css || [];
        if (this.isReplay) {
            Bootloader.loadResources(a, null, false, c.id);
            b();
        } else Bootloader.loadResources(a, b, false, c.id);
        if (this._inst) this._cavalry.onPageletEvent("css_end", c.id);
    },
    _downloadAndScheduleDisplayJS: function(d) {
        var c = d.js || [];
        var a = [];
        for (var b = 0; b < c.length; b++) if (Bootloader.isDisplayJS(c[b])) a.push(c[b]);
        Bootloader.loadResources(a, bind(this, function() {
            if (d.ondisplay && d.ondisplay.length) this.arbiter.registerCallback(function() {
                invoke_callbacks(d.ondisplay);
            }, [ d.id + "_displayed" ]);
        }));
    },
    onPageletArrive: function(a) {
        if (this._inst) this._cavalry.onPageletEvent("arrive", a.id);
        var b = a.phase;
        if (!this._phaseDoneCallbacks[b]) this._phaseDoneCallbacks[b] = this.arbiter.registerCallback(this._onPhaseDone.bind(this), [ "phase_complete_" + b ]);
        this.arbiter.registerCallback(this._phaseDoneCallbacks[b], [ a.id + "_displayed" ]);
        if (a.cacheable) {
            if (a.cache_hit) {
                Arbiter.registerCallback(function() {
                    this.processPagelet(this.loadFromCache(a));
                }.bind(this), [ "pagelet_cache_loaded" ]);
            } else {
                PageletCache.write(a);
                this.processPagelet(a);
            }
        } else this.processPagelet(a);
        if (this._inst) this._cavalry.onPageletEvent("arrive_end", a.id);
    },
    processPagelet: function(b) {
        var c = b.phase;
        if (b.page_cache) this._cached_pagelets["id_" + b.id] = b;
        if (b.the_end) this._lastPhase = b.phase;
        if (b.tti_phase !== undefined) this._ttiPhase = b.tti_phase;
        b.jscc && invoke_callbacks([ b.jscc ]);
        b.tplts && DynaTemplate.registerTemplates(b.tplts);
        Bootloader.setResourceMap(b.resource_map);
        Bootloader.enableBootload(this._ct(b.bootloadable));
        var d = "phase_begin_" + c;
        this.arbiter.registerCallback(this._downloadCssAndDisplayPagelet.bind(this, b), [ d ]);
        this.arbiter.registerCallback(this._downloadAndScheduleDisplayJS.bind(this, b), [ d ]);
        var a;
        if (!this.jsNonBlock) {
            a = this.domContentEvt;
        } else a = b.id + "_displayed";
        this.arbiter.registerCallback(this.onloadCallback, [ "pagelet_onload" ]);
        this.arbiter.registerCallback(this._downloadJsForPagelet.bind(this, b), [ a ]);
        b.is_last && this.arbiter.inform("phase_complete_" + c, true, Arbiter.BEHAVIOR_STATE);
        b.invalidate_cache && b.invalidate_cache.length && Arbiter.inform(Arbiter.PAGECACHE_INVALIDATE, b.invalidate_cache);
    },
    _onPhaseDone: function() {
        if (this._currentPhase === this._ttiPhase && this.rrEnabled) {
            this.arbiter.inform("tti_bigpipe", {
                s: this.lid
            }, Arbiter.BEHAVIOR_EVENT);
            this._cavalry && this._cavalry.setTTIPhase(this._ttiPhase).measurePageLoad(true);
        }
        var b = this._currentPhase + 1;
        var a = bind(this, function() {
            this._inst && this._cavalry.setTimeStamp("t_phase_begin_" + b);
            this.arbiter.inform("phase_begin_" + b, true, Arbiter.BEHAVIOR_STATE);
        });
        if (this._currentPhase === this._lastPhase && this._isRelevant()) this.arbiter.inform("pagelet_displayed_all", true, Arbiter.BEHAVIOR_STATE);
        this._currentPhase++;
        if (this.isReplay) {
            a();
        } else if (ua.ie()) {
            setTimeout(a, 20);
        } else a();
    },
    _isRelevant: function() {
        return this == BigPipe._current_instance || this.isReplay || this.jsNonBlock || this.forceFinish;
    },
    getAllCachedPagelets: function() {
        return this._cached_pagelets;
    }
});

function namespace(e, f) {
    var d = e.split("."), a = 0, b = d.length, c = f || window;
    for (; a < b; a++) {
        if (!c[d[a]]) c[d[a]] = {};
        c = c[d[a]];
    }
    return c;
}

function incorporate_fragment(a) {
    var c = /^(?:(?:[^:\/?#]+):)?(?:\/\/(?:[^\/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?/;
    var b = "";
    a.href.replace(c, function(d, g, h, f) {
        var e, i;
        e = i = g + (h ? "?" + h : "");
        if (f) {
            f = f.replace(/^(!|%21)/, "");
            if (f.charAt(0) == "/") e = f.replace(/^\/+/, "/");
        }
        if (e != i) {
            if (window._script_path) document.cookie = "rdir=" + window._script_path + "; path=/; domain=" + window.location.hostname.replace(/^.*(\.facebook\..*)$/i, "$1");
            window.location.replace(b + e);
        }
    });
}

if (window._script_path !== undefined) incorporate_fragment(window.location);

!function() {
    var b = document.documentElement;
    var a = function(c) {
        c = c || window.event;
        var d = c.target || c.srcElement;
        var f = d.getAttribute("placeholder");
        if (f) {
            var e = Parent.byClass(d, "focus_target");
            if ("focus" == c.type || "focusin" == c.type) {
                if (d.value == f && CSS.hasClass(d, "DOMControl_placeholder")) {
                    d.value = "";
                    CSS.removeClass(d, "DOMControl_placeholder");
                }
                if (e) {
                    CSS.addClass(e, "child_is_active");
                    CSS.addClass(e, "child_is_focused");
                    CSS.addClass(e, "child_was_focused");
                    Arbiter.inform("reflow");
                }
            } else {
                if (d.value == "") {
                    CSS.addClass(d, "DOMControl_placeholder");
                    d.value = f;
                    e && CSS.removeClass(e, "child_is_active");
                    d.style.direction = "";
                }
                e && CSS.removeClass(e, "child_is_focused");
            }
        }
    };
    if (b.addEventListener) {
        b.addEventListener("focus", a, true);
        b.addEventListener("blur", a, true);
    } else b.onfocusin = b.onfocusout = a;
}();

document.documentElement.onkeydown = function(a) {
    a = a || window.event;
    var b = a.target || a.srcElement;
    var c = a.keyCode == 13 && !a.altKey && !a.ctrlKey && !a.metaKey && !a.shiftKey && CSS.hasClass(b, "enter_submit");
    if (c) {
        Bootloader.loadComponents([ "dom", "input-methods" ], function() {
            if (!Input.isEmpty(b)) {
                var d = DOM.scry(b.form, ".enter_submit_target")[0] || DOM.scry(b.form, '[type="submit"]')[0];
                d && d.click();
            }
        });
        return false;
    }
};

function fc_click(a, b) {
    user_action(a, "ufi");
    fc_expand(a, b);
}

function fc_expand(a, b) {
    var c = Parent.byTag(a, "form");
    fc_uncollapse(c);
    CSS.removeClass(c, "hidden_add_comment");
    if (b !== false) (c.add_comment_text_text || c.add_comment_text).focus();
    return false;
}

function fc_uncollapse(a) {
    CSS.removeClass(a, "collapsed_comments");
}