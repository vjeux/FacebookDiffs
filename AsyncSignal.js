if (window.CavalryLogger) {
    CavalryLogger.start_js([ "cXxlk" ]);
}

function object(b) {
    var a = new Function;
    a.prototype = b;
    return new a;
}

function is_scalar(a) {
    return /string|number|boolean/.test(typeof a);
}

function keys(c) {
    var b = [];
    for (var a in c) b.push(a);
    return b;
}

function values(b) {
    var c = [];
    for (var a in b) c.push(b[a]);
    return c;
}

function count(c) {
    var a = 0;
    for (var b in c) a++;
    return a;
}

function are_equal(a, b) {
    return JSON.stringify(a) == JSON.stringify(b);
}

function merge() {
    var b = {};
    for (var a = 0; a < arguments.length; a++) copy_properties(b, arguments[a]);
    return b;
}

Object.from = function(c, e) {
    var d = {};
    var b = hasArrayNature(e);
    if (typeof e == "undefined") e = true;
    for (var a = c.length; a--; ) d[c[a]] = b ? e[a] : e;
    return d;
};

function coalesce() {
    for (var a = 0; a < arguments.length; ++a) if (arguments[a] != null) return arguments[a];
    return null;
}

!function() {
    function a(b) {
        return function() {
            if (this === window) throw new TypeError;
            return b.apply(this, arguments);
        };
    }
    copy_properties(Array.prototype, {
        map: function(c, b) {
            if (this === window || typeof c != "function") throw new TypeError;
            var d;
            var e = this.length;
            var f = new Array(e);
            for (d = 0; d < e; ++d) if (d in this) f[d] = c.call(b, this[d], d, this);
            return f;
        },
        forEach: function(c, b) {
            this.map(c, b);
            return this;
        },
        filter: function(c, b) {
            c = c || function(h) {
                return h;
            };
            if (this === window || typeof c != "function") throw new TypeError;
            var d, g, e = this.length, f = [];
            for (d = 0; d < e; ++d) if (d in this) {
                g = this[d];
                if (c.call(b, g, d, this)) f.push(g);
            }
            return f;
        },
        every: function(d, c) {
            var b = this.filter(function() {
                return 1;
            });
            return this.filter(d, c).length == b.length;
        },
        some: function(c, b) {
            return this.filter(c, b).length > 0;
        },
        reduce: null,
        reduceRight: null,
        sort: a(Array.prototype.sort),
        reverse: a(Array.prototype.reverse),
        concat: a(Array.prototype.concat),
        slice: a(Array.prototype.slice),
        indexOf: a(Array.prototype.indexOf || function(d, b) {
            var c = this.length;
            b |= 0;
            if (b < 0) b += c;
            for (; b < c; b++) if (b in this && this[b] === d) return b;
            return -1;
        }),
        contains: function(b) {
            return this.indexOf(b) != -1;
        },
        remove: function(c) {
            var b = this.indexOf(c);
            if (b != -1) this.splice(b, 1);
        }
    });
    Array.prototype.each = Array.prototype.forEach;
    Array.prototype.clone = Array.prototype.slice;
}();

function muffinize(d) {
    var c = "a";
    var b = "d";
    var a = [ c, b ].join("");
    return d.replace(/muffin/g, a);
}

window.Util = window.Util || {
    warn: bagofholding,
    error: bagofholding,
    info: bagofholding,
    log: bagofholding,
    stack: bagofholding
};

if (typeof console == "undefined") console = {
    log: bagofholding
};

window.onloadRegister = function(a) {
    window.loaded ? _runHook(a) : _addHook("onloadhooks", a);
};

function onafterloadRegister(a) {
    window.afterloaded ? setTimeout(function() {
        _runHook(a);
    }, 0) : _addHook("onafterloadhooks", a);
}

function _onloadHook() {
    !window.loaded && window.CavalryLogger && CavalryLogger.getInstance().setTimeStamp("t_prehooks");
    _runHooks("onloadhooks");
    !window.loaded && window.CavalryLogger && CavalryLogger.getInstance().setTimeStamp("t_hooks");
    window.loaded = true;
    Arbiter.inform("uipage_onload", true, Arbiter.BEHAVIOR_STATE);
}

function _onafterloadHook() {
    _runHooks("onafterloadhooks");
    window.afterloaded = true;
}

function _runHook(b) {
    try {
        return b();
    } catch (a) {}
}

function _runHooks(b) {
    var d = b == "onbeforeleavehooks" || b == "onbeforeunloadhooks";
    var e = null;
    do {
        var a = window[b];
        if (!d) window[b] = null;
        if (!a) break;
        for (var c = 0; c < a.length; c++) if (d) {
            e = e || _runHook(a[c]);
        } else _runHook(a[c]);
        if (d) break;
    } while (window[b]);
    if (d && e) return e;
}

function keep_window_set_as_loaded() {
    if (window.loaded == false) {
        window.loaded = true;
        _runHooks("onloadhooks");
    }
    if (window.afterloaded == false) {
        window.afterloaded = true;
        _runHooks("onafterloadhooks");
    }
}

Arbiter.registerCallback(_onloadHook, [ OnloadEvent.ONLOAD_DOMCONTENT_CALLBACK, InitialJSLoader.INITIAL_JS_READY ]);

Arbiter.registerCallback(_onafterloadHook, [ OnloadEvent.ONLOAD_DOMCONTENT_CALLBACK, OnloadEvent.ONLOAD_CALLBACK, InitialJSLoader.INITIAL_JS_READY ]);

Arbiter.subscribe(OnloadEvent.ONBEFOREUNLOAD, function(b, a) {
    a.warn = _runHooks("onbeforeleavehooks") || _runHooks("onbeforeunloadhooks");
    if (!a.warn) {
        window.loaded = false;
        window.afterloaded = false;
    }
}, Arbiter.SUBSCRIBE_NEW);

Arbiter.subscribe(OnloadEvent.ONUNLOAD, function(b, a) {
    _runHooks("onunloadhooks");
}, Arbiter.SUBSCRIBE_NEW);

void 0;

function AsyncSignal(b, a) {
    this.data = a || {};
    if (window.Env && Env.tracking_domain && b.charAt(0) == "/") b = Env.tracking_domain + b;
    this.uri = b;
    this.handler = null;
}

AsyncSignal.prototype.setHandler = function(a) {
    this.handler = a;
    return this;
};

AsyncSignal.prototype.send = function() {
    var c = this.handler, b = this.data, g = this.uri, f = [], d = new Image, a = document.getElementById("post_form_id");
    b.asyncSignal = Math.floor(Math.random() * 1e4) + 1;
    if (a) b.post_form_id = a.value;
    if (window.Env) {
        b.__user = Env.user;
        if (Env.fb_isb) b.fb_isb = Env.fb_isb;
    }
    for (var e in b) f.push(encodeURIComponent(e) + "=" + encodeURIComponent(b[e]));
    if (g.indexOf("?") == -1) g += "?";
    g += f.join("&");
    if (c) d.onload = d.onerror = function(i, h) {
        return function() {
            h(i.height == 1);
        };
    }(d, c);
    d.src = g;
    return this;
};

function setCookie(a, b, d, e) {
    if (env_get("no_cookies") && a != "tpa") return;
    if (d) {
        var f = new Date;
        var c = new Date;
        c.setTime(f.getTime() + d);
    }
    document.cookie = a + "=" + encodeURIComponent(b) + "; " + (d ? "expires=" + c.toGMTString() + "; " : "") + "path=" + (e || "/") + "; domain=" + window.location.hostname.replace(/^.*(\.facebook\..*)$/i, "$1");
}

function clearCookie(a) {
    document.cookie = a + "=; expires=Sat, 01 Jan 2000 00:00:00 GMT; " + "path=/; domain=" + window.location.hostname.replace(/^.*(\.facebook\..*)$/i, "$1");
}

function getCookie(d) {
    var e = d + "=";
    var b = document.cookie.split(";");
    for (var c = 0; c < b.length; c++) {
        var a = b[c];
        while (a.charAt(0) == " ") a = a.substring(1, a.length);
        if (a.indexOf(e) == 0) return decodeURIComponent(a.substring(e.length, a.length));
    }
    return null;
}

function HTML(a) {
    if (a && a.__html) a = a.__html;
    if (this === window) {
        if (a instanceof HTML) return a;
        return new HTML(a);
    }
    this._content = a;
    this._defer = false;
    this._extra_action = "";
    this._nodes = null;
    this._inline_js = bagofholding;
    this._ie_clone_bug = false;
    return this;
}

HTML.isHTML = function(a) {
    return a && (a instanceof HTML || a.__html !== undefined);
};

HTML.replaceJSONWrapper = function(a) {
    return a && a.__html !== undefined ? new HTML(a.__html) : a;
};

copy_properties(HTML.prototype, {
    toString: function() {
        var a = this._content || "";
        if (this._extra_action) a += '<script type="text/javascript">' + this._extra_action + "</scr" + "ipt>";
        return a;
    },
    setAction: function(a) {
        this._extra_action = a;
        return this;
    },
    getAction: function() {
        this._fillCache();
        var a = function() {
            this._inline_js();
            eval_global(this._extra_action);
        }.bind(this);
        if (this.getDeferred()) {
            return a.defer.bind(a);
        } else return a;
    },
    setDeferred: function(a) {
        this._defer = !!a;
        return this;
    },
    getDeferred: function() {
        return this._defer;
    },
    getContent: function() {
        return this._content;
    },
    getNodes: function() {
        this._fillCache();
        return this._nodes;
    },
    getRootNode: function() {
        return this.getNodes()[0];
    },
    ieCloneBug: function() {
        this._fillCache();
        return this._ie_clone_bug;
    },
    _fillCache: function() {
        if (null !== this._nodes) return;
        var d = this._content;
        if (!d) {
            this._nodes = [];
            return;
        }
        d = d.replace(/(<(\w+)[^>]*?)\/>/g, function(l, m, n) {
            return n.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i) ? l : m + "></" + n + ">";
        });
        var h = d.trim().toLowerCase(), k = document.createElement("div"), b = false;
        var j = !h.indexOf("<opt") && [ 1, '<select multiple="multiple" class="__WRAPPER">', "</select>" ] || !h.indexOf("<leg") && [ 1, '<fieldset class="__WRAPPER">', "</fieldset>" ] || h.match(/^<(thead|tbody|tfoot|colg|cap)/) && [ 1, '<table class="__WRAPPER">', "</table>" ] || !h.indexOf("<tr") && [ 2, '<table><tbody class="__WRAPPER">', "</tbody></table>" ] || (!h.indexOf("<td") || !h.indexOf("<th")) && [ 3, '<table><tbody><tr class="__WRAPPER">', "</tr></tbody></table>" ] || !h.indexOf("<col") && [ 2, '<table><tbody></tbody><colgroup class="__WRAPPER">', "</colgroup></table>" ] || null;
        if (null === j) {
            k.className = "__WRAPPER";
            if (ua.ie()) {
                j = [ 0, '<span style="display:none">&nbsp;</span>', "" ];
                b = true;
            } else j = [ 0, "", "" ];
        }
        k.innerHTML = j[1] + d + j[2];
        while (j[0]--) k = k.lastChild;
        if (b) k.removeChild(k.firstChild);
        k.className != "__WRAPPER";
        if (0 !== k.getElementsByTagName("option").length || 0 !== k.getElementsByTagName("object").length) this._ie_clone_bug = true;
        if (ua.ie()) {
            var i;
            if (!h.indexOf("<table") && -1 == h.indexOf("<tbody")) {
                i = k.firstChild && k.firstChild.childNodes;
            } else if (j[1] == "<table>" && -1 == h.indexOf("<tbody")) {
                i = k.childNodes;
            } else i = [];
            for (var f = i.length - 1; f >= 0; --f) if (i[f].nodeName && i[f].nodeName.toLowerCase() == "tbody" && i[f].childNodes.length == 0) i[f].parentNode.removeChild(i[f]);
        }
        var g = k.getElementsByTagName("script");
        var a = [];
        for (var e = 0; e < g.length; e++) if (g[e].src) {
            a.push(Bootloader.requestResource.bind(Bootloader, "js", g[e].src));
        } else a.push(eval_global.bind(null, g[e].innerHTML));
        for (var e = g.length - 1; e >= 0; e--) g[e].parentNode.removeChild(g[e]);
        var c = function() {
            for (var l = 0; l < a.length; l++) a[l]();
        };
        this._nodes = $A(k.childNodes);
        this._inline_js = c;
    }
});

var DOM = {
    find: function(a, c) {
        var b = DOM.scry(a, c);
        return b[0];
    },
    scry: function(j, v) {
        if (!j) return [];
        var w = v.split(" ");
        var d = [ j ];
        var i = j === document;
        for (var m = 0; m < w.length; m++) {
            if (d.length == 0) break;
            if (w[m] == "") continue;
            var u = w[m];
            var s = [];
            var zd = false;
            if (u.charAt(0) == "^") if (m == 0) {
                zd = true;
                u = u.slice(1);
            } else return [];
            u = u.replace(/\./g, " .");
            u = u.replace(/\#/g, " #");
            u = u.replace(/\[/g, " [");
            var z = u.split(" ");
            var za = z[0] || "*";
            var n = z[1] && z[1].charAt(0) == "#";
            if (n) {
                var h = ge(z[1].slice(1), true);
                if (h && ("*" == za || h.tagName.toLowerCase() == za)) for (var q = 0; q < d.length; q++) if (zd && DOM.contains(h, d[q])) {
                    s = [ h ];
                    break;
                } else if (document == d[q] || DOM.contains(d[q], h)) {
                    s = [ h ];
                    break;
                }
            } else {
                var zc = [];
                var c = d.length;
                for (var o = 0; o < c; o++) {
                    if (zd) {
                        var k = [];
                        var g = d[o].parentNode;
                        var a = za == "*";
                        while (DOM.isNode(g, DOM.NODE_TYPES.ELEMENT)) {
                            if (a || g.tagName.toLowerCase() == za) k.push(g);
                            g = g.parentNode;
                        }
                    } else var k = d[o].getElementsByTagName(za);
                    var l = k.length;
                    for (var r = 0; r < l; r++) zc.push(k[r]);
                }
                for (var x = 1; x < z.length; x++) {
                    var y = z[x];
                    var p = y.charAt(0) == ".";
                    var e = y.substring(1);
                    for (var o = 0; o < zc.length; o++) {
                        var zb = zc[o];
                        if (!zb) continue;
                        if (p) {
                            if (!CSS.hasClass(zb, e)) delete zc[o];
                            continue;
                        } else {
                            var f = y.slice(1, y.length - 1);
                            if (f.indexOf("=") == -1) {
                                if (zb.getAttribute(f) === null) {
                                    delete zc[o];
                                    continue;
                                }
                            } else {
                                var t = f.split("=");
                                var b = t[0];
                                var ze = t[1];
                                ze = ze.slice(1, ze.length - 1);
                                if (zb.getAttribute(b) != ze) {
                                    delete zc[o];
                                    continue;
                                }
                            }
                        }
                    }
                }
                for (var o = 0; o < zc.length; o++) if (zc[o]) {
                    s.push(zc[o]);
                    if (zd) break;
                }
            }
            d = s;
        }
        return d;
    },
    getText: function() {
        var a = document.createElement("div"), b = a.textContent != null ? "textContent" : "innerText";
        return function(c) {
            if (!c) {
                return "";
            } else if (DOM.isNode(c, DOM.NODE_TYPES.TEXT)) {
                return c.data;
            } else return c[b];
        };
    }(),
    getSelection: function() {
        var b = window.getSelection, a = document.selection;
        if (b) {
            return b() + "";
        } else if (a) return a.createRange().text;
        return null;
    },
    create: function(c, a, b) {
        c = document.createElement(c);
        if (a) {
            a = copy_properties({}, a);
            if (a.style) {
                copy_properties(c.style, a.style);
                delete a.style;
            }
            for (var d in a) if (d.toLowerCase().indexOf("on") == 0) {
                if (!(typeof a[d] != "function")) if (window.Event && Event.listen) {
                    Event.listen(c, d.substr(2), a[d]);
                } else c[d] = a[d];
                delete a[d];
            }
            copy_properties(c, a);
        }
        if (b != undefined) DOM.setContent(c, b);
        return c;
    },
    prependContent: function(c, b) {
        if (!DOM.isNode(c)) throw new Error("DOM.prependContent: reference element is not a node");
        var a = function(d) {
            if (c.firstChild) {
                c.insertBefore(d, c.firstChild);
            } else c.appendChild(d);
        };
        return DOM._addContent(b, a, c);
    },
    insertAfter: function(c, b) {
        if (!DOM.isNode(c) || !c.parentNode) throw new Error("DOM.insertAfter: reference element is not a node");
        var a = function(d) {
            if (c.nextSibling) {
                c.parentNode.insertBefore(d, c.nextSibling);
            } else c.parentNode.appendChild(d);
        };
        return DOM._addContent(b, a, c.parentNode);
    },
    insertBefore: function(b, c) {
        if (!DOM.isNode(c) || !c.parentNode) throw new Error("DOM.insertBefore: reference element is not a node or " + "does not have a parent.");
        var a = function(d) {
            c.parentNode.insertBefore(d, c);
        };
        return DOM._addContent(b, a, c.parentNode);
    },
    setContent: function(b, a) {
        if (!DOM.isNode(b)) throw new Error("DOM.setContent: reference element is not a node");
        DOM.empty(b);
        return DOM.appendContent(b, a);
    },
    appendContent: function(c, b) {
        if (!DOM.isNode(c)) throw new Error("DOM.appendContent: reference element is not a node");
        var a = function(d) {
            c.appendChild(d);
        };
        return DOM._addContent(b, a, c);
    },
    replace: function(c, b) {
        if (!DOM.isNode(c) || !c.parentNode) throw new Error("DOM.replace: reference element must be a node with a" + " parent");
        var a = function(d) {
            c.parentNode.replaceChild(d, c);
        };
        return DOM._addContent(b, a, c.parentNode);
    },
    remove: function(a) {
        a = $(a);
        if (a.parentNode) a.parentNode.removeChild(a);
    },
    empty: function(a) {
        a = $(a);
        while (a.firstChild) DOM.remove(a.firstChild);
    },
    contains: function(b, a) {
        b = ge(b);
        a = ge(a);
        if (!b || !a) {
            return false;
        } else if (b === a) {
            return true;
        } else if (DOM.isNode(b, "#text")) {
            return false;
        } else if (DOM.isNode(a, "#text")) {
            return DOM.contains(b, a.parentNode);
        } else if (b.contains) {
            return b.contains(a);
        } else if (b.compareDocumentPosition) {
            return !!(b.compareDocumentPosition(a) & 16);
        } else return false;
    },
    getRootElement: function() {
        var a = null;
        if (window.Quickling && Quickling.isActive()) a = ge("content");
        return a || document.body;
    },
    isNode: function(d, e) {
        if (typeof Node == "undefined") Node = null;
        try {
            if (!d || !(Node != undefined && d instanceof Node || d.nodeName)) return false;
        } catch (a) {
            return false;
        }
        if (typeof e !== "undefined") {
            e = $A(e).map(function(g) {
                return (g + "").toUpperCase();
            });
            var c, f;
            try {
                c = (new String(d.nodeName)).toUpperCase();
                f = d.nodeType;
            } catch (a) {
                return false;
            }
            for (var b = 0; b < e.length; b++) try {
                if (c == e[b] || f == e[b]) return true;
            } catch (a) {}
            return false;
        }
        return true;
    },
    NODE_TYPES: {
        ELEMENT: 1,
        ATTRIBUTE: 2,
        TEXT: 3,
        CDATA_SECTION: 4,
        ENTITY_REFERENCE: 5,
        ENTITY: 6,
        PROCESSING_INSTRUCTION: 7,
        COMMENT: 8,
        DOCUMENT: 9,
        DOCUMENT_TYPE: 10,
        DOCUMENT_FRAGMENT: 11,
        NOTATION_NODE: 12
    },
    _addContent: function(d, a, m) {
        d = HTML.replaceJSONWrapper(d);
        if (d instanceof HTML && -1 == d.toString().indexOf("<scr" + "ipt") && "" == m.innerHTML) {
            var g = ua.ie();
            if (!g || g > 7 && !DOM.isNode(m, [ "table", "tbody", "thead", "tfoot", "tr", "select", "fieldset" ])) {
                var h = g ? '<em style="display:none;">&nbsp;</em>' : "";
                m.innerHTML = h + d;
                g && m.removeChild(m.firstChild);
                return $A(m.childNodes);
            }
        } else if (DOM.isNode(m, DOM.NODE_TYPES.TEXT)) {
            m.data = d;
            return [ d ];
        }
        var j, e = [], b = [];
        var f = document.createDocumentFragment();
        if (!(d instanceof Array)) d = [ d ];
        for (var i = 0; i < d.length; i++) {
            j = HTML.replaceJSONWrapper(d[i]);
            if (j instanceof HTML) {
                b.push(j.getAction());
                var l = j.getNodes(), c;
                for (var k = 0; k < l.length; k++) {
                    c = ua.safari() || ua.ie() && j.ieCloneBug() ? l[k] : l[k].cloneNode(true);
                    e.push(c);
                    f.appendChild(c);
                }
            } else if (is_scalar(j)) {
                var n = document.createTextNode(j);
                e.push(n);
                f.appendChild(n);
            } else if (DOM.isNode(j)) {
                e.push(j);
                f.appendChild(j);
            } else if (!(j instanceof Array)) j !== null;
        }
        a(f);
        for (var i = 0; i < b.length; i++) b[i]();
        return e;
    }
};

function $N(c, a, b) {
    if (typeof a != "object" || DOM.isNode(a) || a instanceof Array || HTML.isHTML(a)) {
        b = a;
        a = null;
    }
    return DOM.create(c, a, b);
}

function URI(a) {
    if (a === window) return;
    if (this === window) return new URI(a || window.location.href);
    this.parse(a || "");
}

copy_properties(URI, {
    getRequestURI: function(a, b) {
        a = a === undefined || a;
        if (a && window.PageTransitions && PageTransitions.isInitialized()) {
            return PageTransitions.getCurrentURI(!!b).getQualifiedURI();
        } else return new URI(window.location.href);
    },
    getMostRecentURI: function() {
        if (window.PageTransitions && PageTransitions.isInitialized()) {
            return PageTransitions.getMostRecentURI().getQualifiedURI();
        } else return new URI(window.location.href);
    },
    getNextURI: function() {
        if (window.PageTransitions && PageTransitions.isInitialized()) {
            return PageTransitions.getNextURI().getQualifiedURI();
        } else return new URI(window.location.href);
    },
    expression: /(((\w+):\/\/)([^\\\/:]*)(:(\d+))?)?([^#?]*)(\?([^#]*))?(#(.*))?/,
    arrayQueryExpression: /^(\w+)((?:\[\w*\])+)=?(.*)/,
    explodeQuery: function(g) {
        if (!g) return {};
        var h = {};
        g = g.replace(/%5B/ig, "[").replace(/%5D/ig, "]");
        g = g.split("&");
        for (var b = 0, d = g.length; b < d; b++) {
            var e = g[b].match(URI.arrayQueryExpression);
            if (!e) {
                var j = g[b].split("=");
                h[URI.decodeComponent(j[0])] = j[1] === undefined ? null : URI.decodeComponent(j[1]);
            } else {
                var c = e[2].split(/\]\[|\[|\]/).slice(0, -1);
                var f = e[1];
                var k = URI.decodeComponent(e[3] || "");
                c[0] = f;
                var i = h;
                for (var a = 0; a < c.length - 1; a++) if (c[a]) {
                    if (i[c[a]] === undefined) if (c[a + 1] && !c[a + 1].match(/\d+$/)) {
                        i[c[a]] = {};
                    } else i[c[a]] = [];
                    i = i[c[a]];
                } else {
                    if (c[a + 1] && !c[a + 1].match(/\d+$/)) {
                        i.push({});
                    } else i.push([]);
                    i = i[i.length - 1];
                }
                if (i instanceof Array && c[c.length - 1] == "") {
                    i.push(k);
                } else i[c[c.length - 1]] = k;
            }
        }
        return h;
    },
    implodeQuery: function(f, e, a) {
        e = e || "";
        if (a === undefined) a = true;
        var g = [];
        if (f === null || f === undefined) {
            g.push(a ? URI.encodeComponent(e) : e);
        } else if (f instanceof Array) {
            for (var c = 0; c < f.length; ++c) try {
                if (f[c] !== undefined) g.push(URI.implodeQuery(f[c], e ? e + "[" + c + "]" : c));
            } catch (b) {}
        } else if (typeof f == "object") {
            if (DOM.isNode(f)) {
                g.push("{node}");
            } else for (var d in f) try {
                if (f[d] !== undefined) g.push(URI.implodeQuery(f[d], e ? e + "[" + d + "]" : d));
            } catch (b) {}
        } else if (a) {
            g.push(URI.encodeComponent(e) + "=" + URI.encodeComponent(f));
        } else g.push(e + "=" + f);
        return g.join("&");
    },
    encodeComponent: function(d) {
        var c = String(d).split(/([\[\]])/);
        for (var a = 0, b = c.length; a < b; a += 2) c[a] = window.encodeURIComponent(c[a]);
        return c.join("");
    },
    decodeComponent: function(a) {
        return window.decodeURIComponent(a.replace(/\+/g, " "));
    }
});

copy_properties(URI.prototype, {
    parse: function(b) {
        var a = b.toString().match(URI.expression);
        copy_properties(this, {
            protocol: a[3] || "",
            domain: a[4] || "",
            port: a[6] || "",
            path: a[7] || "",
            query_s: a[9] || "",
            fragment: a[11] || ""
        });
        return this;
    },
    setProtocol: function(a) {
        this.protocol = a;
        return this;
    },
    getProtocol: function() {
        return this.protocol;
    },
    setQueryData: function(a) {
        this.query_s = URI.implodeQuery(a);
        return this;
    },
    addQueryData: function(a) {
        return this.setQueryData(copy_properties(this.getQueryData(), a));
    },
    removeQueryData: function(b) {
        if (!(b instanceof Array)) b = [ b ];
        var d = this.getQueryData();
        for (var a = 0, c = b.length; a < c; ++a) delete d[b[a]];
        return this.setQueryData(d);
    },
    getQueryData: function() {
        return URI.explodeQuery(this.query_s);
    },
    setFragment: function(a) {
        this.fragment = a;
        return this;
    },
    getFragment: function() {
        return this.fragment;
    },
    setDomain: function(a) {
        this.domain = a;
        return this;
    },
    getDomain: function() {
        return this.domain;
    },
    setPort: function(a) {
        this.port = a;
        return this;
    },
    getPort: function() {
        return this.port;
    },
    setPath: function(a) {
        this.path = a;
        return this;
    },
    getPath: function() {
        return this.path.replace(/^\/+/, "/");
    },
    toString: function() {
        var a = "";
        this.protocol && (a += this.protocol + "://");
        this.domain && (a += this.domain);
        this.port && (a += ":" + this.port);
        if (this.domain && !this.path) a += "/";
        this.path && (a += this.path);
        this.query_s && (a += "?" + this.query_s);
        this.fragment && (a += "#" + this.fragment);
        return a;
    },
    valueOf: function() {
        return this.toString();
    },
    isFacebookURI: function() {
        if (!URI._facebookURIRegex) URI._facebookURIRegex = new RegExp("(^|\\.)facebook\\.com([^.]*)$", "i");
        return !this.domain || URI._facebookURIRegex.test(this.domain);
    },
    isQuicklingEnabled: function() {
        return window.Quickling && Quickling.isActive() && Quickling.isPageActive(this);
    },
    getRegisteredDomain: function() {
        if (!this.domain) return "";
        if (!this.isFacebookURI()) return null;
        var b = this.domain.split(".");
        var a = b.indexOf("facebook");
        return b.slice(a).join(".");
    },
    getUnqualifiedURI: function() {
        return (new URI(this)).setProtocol(null).setDomain(null).setPort(null);
    },
    getQualifiedURI: function() {
        var b = new URI(this);
        if (!b.getDomain()) {
            var a = URI();
            b.setProtocol(a.getProtocol()).setDomain(a.getDomain()).setPort(a.getPort());
        }
        return b;
    },
    isSameOrigin: function(a) {
        var b = a || window.location.href;
        if (!(b instanceof URI)) b = new URI(b.toString());
        if (this.getProtocol() && this.getProtocol() != b.getProtocol()) return false;
        if (this.getDomain() && this.getDomain() != b.getDomain()) return false;
        return true;
    },
    go: function(a) {
        goURI(this, a);
    },
    setSubdomain: function(b) {
        var c = (new URI(this)).getQualifiedURI();
        var a = c.getDomain().split(".");
        if (a.length <= 2) {
            a.unshift(b);
        } else a[0] = b;
        return c.setDomain(a.join("."));
    },
    getSubdomain: function() {
        if (!this.getDomain()) return "";
        var a = this.getDomain().split(".");
        if (a.length <= 2) {
            return "";
        } else return a[0];
    },
    setSecure: function(a) {
        return this.setProtocol(a ? "https" : "http");
    },
    isSecure: function() {
        return this.getProtocol() == "https";
    }
});

function detect_broken_proxy_cache(d, a) {
    var b = getCookie(a);
    if (b != d && b != null && d != "0") {
        var c = {
            c: "si_detect_broken_proxy_cache",
            m: a + " " + d + " " + b
        };
        var e = (new URI("/common/scribe_endpoint.php")).getQualifiedURI().toString();
        (new AsyncSignal(e, c)).send();
    }
}

String.prototype.trim = function() {
    if (this == window) return null;
    return this.replace(/^\s*|\s*$/g, "");
};

function trim(b) {
    try {
        return String(b.toString()).trim();
    } catch (a) {
        return "";
    }
}

String.prototype.startsWith = function(a) {
    if (this == window) return null;
    return this.substring(0, a.length) == a;
};

String.prototype.endsWith = function(a) {
    if (this == window) return null;
    return this.length >= a.length && this.substring(this.length - a.length) == a;
};

String.prototype.hash32 = function() {
    var a = 2166136261;
    for (var b = 0, c = this.length; b < c; ++b) a = (a ^ this.charCodeAt(b)) * 16777619;
    a += a << 13;
    a ^= a >> 7;
    a += a << 3;
    a ^= a >> 17;
    a += a << 5;
    return (a | 0) + 2147483648;
};

String.prototype.split = function(a) {
    return function(h, e) {
        var b = "";
        if (h === null || e === null) {
            return [];
        } else if (typeof h == "string") {
            return a.call(this, h, e);
        } else if (h === undefined) {
            return [ this.toString() ];
        } else if (h instanceof RegExp) {
            if (!h._2 || !h._1) {
                b = h.toString().replace(/^[\S\s]+\//, "");
                if (!h._1) if (!h.global) {
                    h._1 = new RegExp(h.source, "g" + b);
                } else h._1 = 1;
            }
            separator1 = h._1 === 1 ? h : h._1;
            var i = h._2 ? h._2 : h._2 = new RegExp("^" + separator1.source + "$", b);
            if (e === undefined || e < 0) {
                e = false;
            } else {
                e = Math.floor(e);
                if (!e) return [];
            }
            var f, g = [], d = 0, c = 0;
            while ((e ? c++ <= e : true) && (f = separator1.exec(this))) {
                if (f[0].length === 0 && separator1.lastIndex > f.index) separator1.lastIndex--;
                if (separator1.lastIndex > d) {
                    if (f.length > 1) f[0].replace(i, function() {
                        for (var j = 1; j < arguments.length - 2; j++) if (arguments[j] === undefined) f[j] = undefined;
                    });
                    g = g.concat(this.substring(d, f.index), f.index === this.length ? [] : f.slice(1));
                    d = separator1.lastIndex;
                }
                if (f[0].length === 0) separator1.lastIndex++;
            }
            return d === this.length ? separator1.test("") ? g : g.concat("") : e ? g : g.concat(this.substring(d));
        } else return a.call(this, h, e);
    };
}(String.prototype.split);

add_properties("CSS", {
    shown: function(a) {
        return !CSS.hasClass(a, "hidden_elem");
    },
    toggle: function(a) {
        CSS.conditionShow(a, !CSS.shown(a));
    },
    setClass: function(b, a) {
        $(b).className = a || "";
        return b;
    },
    setStyle: function(a, b, c) {
        switch (b) {
          case "opacity":
            a.style.opacity = c;
            a.style.filter = c !== "" ? "alpha(opacity=" + c * 100 + ")" : "";
            break;
          case "float":
            a.style.cssFloat = a.style.styleFloat = c;
            break;
          default:
            b = b.replace(/-(.)/g, function(d, e) {
                return e.toUpperCase();
            });
            a.style[b] = c;
        }
        return a;
    },
    getStyle: function(b, d) {
        b = $(b);
        d = d.replace(/-(.)/g, function(e, f) {
            return f.toUpperCase();
        });
        function c(e) {
            return e.replace(/([A-Z])/g, "-$1").toLowerCase();
        }
        if (window.getComputedStyle) {
            var a = window.getComputedStyle(b, null);
            if (a) return a.getPropertyValue(c(d));
        }
        if (document.defaultView && document.defaultView.getComputedStyle) {
            var a = document.defaultView.getComputedStyle(b, null);
            if (a) return a.getPropertyValue(c(d));
            if (d == "display") return "none";
        }
        if (b.currentStyle) return b.currentStyle[d];
        return b.style[d];
    },
    getStyleFloat: function(a, b) {
        return parseFloat(CSS.getStyle(a, b), 10);
    },
    getOpacity: function(a) {
        a = $(a);
        var b = CSS.getStyle(a, "filter");
        var c = null;
        if (b && (c = /(\d+(?:\.\d+)?)/.exec(b))) {
            return parseFloat(c.pop()) / 100;
        } else if (b = CSS.getStyle(a, "opacity")) {
            return parseFloat(b);
        } else return 1;
    }
});

function intl_locale_is_rtl() {
    return "rtl" == CSS.getStyle(document.body, "direction");
}

DataStore = window.DataStore || {
    _storage: {},
    _elements: {},
    _tokenCounter: 1,
    _NOT_IN_DOM_CONST: 1,
    _getStorage: function(a) {
        var b;
        if (typeof a == "string") {
            b = "str_" + a;
        } else {
            b = "elem_" + (a.__FB_TOKEN || (a.__FB_TOKEN = [ DataStore._tokenCounter++ ]))[0];
            DataStore._elements[b] = a;
        }
        return DataStore._storage[b] || (DataStore._storage[b] = {});
    },
    _shouldDeleteData: function(a) {
        if (!a.nodeName) return false;
        try {
            if (null != a.offsetParent) return false;
        } catch (b) {}
        if (document.documentElement.contains) {
            return !document.documentElement.contains(a);
        } else return document.documentElement.compareDocumentPosition(a) & DataStore._NOT_IN_DOM_CONST;
    },
    set: function(c, b, d) {
        var a = DataStore._getStorage(c);
        a[b] = d;
        return c;
    },
    get: function(e, d, c) {
        var b = DataStore._getStorage(e), f = b[d];
        if (typeof f === "undefined" && e.getAttribute) {
            var a = e.getAttribute("data-" + d);
            f = null === a ? undefined : a;
        }
        if (c !== undefined && f === undefined) f = b[d] = c;
        return f;
    },
    remove: function(c, b) {
        var a = DataStore._getStorage(c), d = a[b];
        delete a[b];
        return d;
    },
    cleanup: function() {
        var b, a;
        for (b in DataStore._elements) {
            a = DataStore._elements[b];
            if (DataStore._shouldDeleteData(a)) {
                delete DataStore._storage[b];
                delete DataStore._elements[b];
            }
        }
    }
};

function DOMControl(a) {
    this.root = $(a);
    this.updating = false;
    DataStore.set(a, "DOMControl", this);
}

DOMControl.prototype = {
    getRoot: function() {
        return this.root;
    },
    beginUpdate: function() {
        if (this.updating) return false;
        this.updating = true;
        return true;
    },
    endUpdate: function() {
        this.updating = false;
    },
    update: function(a) {
        if (!this.beginUpdate()) return this;
        this.onupdate(a);
        this.endUpdate();
    },
    onupdate: function(a) {}
};

DOMControl.getInstance = function(a) {
    return DataStore.get(a, "DOMControl");
};

add_properties("CSS", {
    supportsBorderRadius: function() {
        var c = [ "KhtmlBorderRadius", "OBorderRadius", "MozBorderRadius", "WebkitBorderRadius", "msBorderRadius", "borderRadius" ];
        var d = false, a = document.createElement("div");
        for (var b = c.length; b >= 0; b--) if (d = a.style[c[b]] !== undefined) break;
        CSS.supportsBorderRadius = bagof(d);
        return d;
    }
});

add_properties("Input", {
    focus: function(a) {
        try {
            a.focus();
        } catch (b) {}
    },
    isEmpty: function(a) {
        return !/\S/.test(a.value || "") || CSS.hasClass(a, "DOMControl_placeholder");
    },
    getValue: function(a) {
        return Input.isEmpty(a) ? "" : a.value;
    },
    setValue: function(b, d) {
        CSS.removeClass(b, "DOMControl_placeholder");
        b.value = d || "";
        var c = b.getAttribute("maxlength");
        if (c > 0) Bootloader.loadComponents("maxlength-form-listener", function() {
            Input.enforceMaxLength(b, c);
        });
        var a = DOMControl.getInstance(b);
        a && a.resetHeight && a.resetHeight();
    },
    setPlaceholder: function(a, b) {
        a.setAttribute("title", b);
        a.setAttribute("placeholder", b);
        if (a == document.activeElement) return;
        if (Input.isEmpty(a)) {
            CSS.conditionClass(a, "DOMControl_placeholder", b);
            a.value = b || "";
        }
    },
    reset: function(a) {
        var b = a !== document.activeElement ? a.getAttribute("placeholder") || "" : "";
        a.value = b;
        CSS.conditionClass(a, "DOMControl_placeholder", b);
        a.style.height = "";
    },
    setSubmitOnEnter: function(a, b) {
        CSS.conditionClass(a, "enter_submit", b);
    },
    getSubmitOnEnter: function(a) {
        return CSS.hasClass(a, "enter_submit");
    }
});

Event.DATASTORE_KEY = "Event.listeners";

if (!Event.prototype) Event.prototype = {};

function $E(a) {
    a = a || window.event || {};
    if (!a._inherits_from_prototype) for (var c in Event.prototype) try {
        a[c] = Event.prototype[c];
    } catch (b) {}
    return a;
}

(function() {
    copy_properties(Event.prototype, {
        _inherits_from_prototype: true,
        stop: function() {
            this.cancelBubble = true;
            this.stopPropagation && this.stopPropagation();
            return this;
        },
        prevent: function() {
            this.returnValue = false;
            this.preventDefault && this.preventDefault();
            return this;
        },
        kill: function() {
            this.stop().prevent();
            return false;
        },
        getTarget: function() {
            var g = this.target || this.srcElement;
            return g ? $(g) : null;
        },
        getRelatedTarget: function() {
            var g = this.relatedTarget || (this.fromElement === this.srcElement ? this.toElement : this.fromElement);
            return g ? $(g) : null;
        },
        getModifiers: function() {
            var g = {
                control: !!this.ctrlKey,
                shift: !!this.shiftKey,
                alt: !!this.altKey,
                meta: !!this.metaKey
            };
            g.access = ua.osx() ? g.control : g.alt;
            g.any = g.control || g.shift || g.alt || g.meta;
            return g;
        }
    });
    copy_properties(Event, {
        listen: function(h, q, j, n) {
            if (typeof h == "string") h = $(h);
            if (typeof n == "undefined") n = Event.Priority.NORMAL;
            if (typeof q == "object") {
                var i = {};
                for (var p in q) i[p] = Event.listen(h, p, q[p], n);
                return i;
            }
            if (q.match(/^on/i)) throw new TypeError("Bad event name `" + event + "': use `click', not `onclick'.");
            q = q.toLowerCase();
            if (h.nodeName == "LABEL" && q == "click") {
                var m = h.getElementsByTagName("input");
                h = m.length == 1 ? m[0] : h;
            }
            var k = DataStore.get(h, b, {});
            if (f[q]) {
                var g = f[q];
                q = g.base;
                j = g.wrap(j);
            }
            a(h, q);
            var r = k[q];
            if (!(n in r)) r[n] = [];
            var l = r[n].length, o = new EventHandlerRef(j, r[n], l);
            r[n].push(o);
            return o;
        },
        stop: function(g) {
            return $E(g).stop();
        },
        prevent: function(g) {
            return $E(g).prevent();
        },
        kill: function(g) {
            return $E(g).kill();
        },
        getKeyCode: function(event) {
            event = $E(event);
            if (!event) return false;
            switch (event.keyCode) {
              case 63232:
                return 38;
              case 63233:
                return 40;
              case 63234:
                return 37;
              case 63235:
                return 39;
              case 63272:
              case 63273:
              case 63275:
                return null;
              case 63276:
                return 33;
              case 63277:
                return 34;
            }
            if (event.shiftKey) switch (event.keyCode) {
              case 33:
              case 34:
              case 37:
              case 38:
              case 39:
              case 40:
                return null;
            }
            return event.keyCode;
        },
        getPriorities: function() {
            if (!e) {
                var g = values(Event.Priority);
                g.sort(function(h, i) {
                    return h - i;
                });
                e = g;
            }
            return e;
        },
        __fire: function(g, i, event) {
            var h = Event.__getHandler(g, i);
            if (h) return h($E(event));
        },
        __getHandler: function(g, h) {
            return DataStore.get(g, Event.DATASTORE_KEY + h);
        }
    });
    var e = null, b = Event.DATASTORE_KEY;
    var c = function(g) {
        return function(h) {
            if (!DOM.contains(this, h.getRelatedTarget())) return g.call(this, h);
        };
    };
    var f = {
        mouseenter: {
            base: "mouseover",
            wrap: c
        },
        mouseleave: {
            base: "mouseout",
            wrap: c
        }
    };
    var a = function(g, m) {
        var h = "on" + m;
        var k = d.bind(g);
        var j = DataStore.get(g, b);
        if (m in j) return;
        j[m] = {};
        if (g.addEventListener) {
            g.addEventListener(m, k, false);
        } else if (g.attachEvent) g.attachEvent(h, k);
        DataStore.set(g, b + m, k);
        if (g[h]) {
            var l = g === document.documentElement ? Event.Priority._BUBBLE : Event.Priority.TRADITIONAL;
            var i = g[h];
            g[h] = null;
            Event.listen(g, m, i, l);
        }
        if (g.nodeName === "FORM" && m === "submit") Event.listen(g, m, Event.__bubbleSubmit.curry(g), Event.Priority._BUBBLE);
    };
    var d = function(event) {
        event = $E(event);
        var n = event.type;
        if (!DataStore.get(this, b)) throw new Error("Bad listenHandler context.");
        var o = DataStore.get(this, b)[n];
        if (!o) throw new Error("No registered handlers for `" + n + "'.");
        window.ArbiterMonitor && ArbiterMonitor.pause();
        if (n == "click") {
            var i = Parent.byTag(event.getTarget(), "a");
            user_action(i, "click", event);
        }
        var k = Event.getPriorities();
        for (var j = 0; j < k.length; j++) {
            var l = k[j];
            if (l in o) {
                var g = o[l];
                for (var h = 0; h < g.length; h++) {
                    if (!g[h]) continue;
                    var m = g[h].fire(this, event);
                    if (m === false) {
                        window.ArbiterMonitor && ArbiterMonitor.resume();
                        return event.kill();
                    } else if (event.cancelBubble) event.stop();
                }
            }
        }
        window.ArbiterMonitor && ArbiterMonitor.resume();
        return event.returnValue;
    };
})();

Event.Priority = {
    URGENT: -20,
    TRADITIONAL: -10,
    NORMAL: 0,
    _BUBBLE: 1e3
};

function EventHandlerRef(b, a, c) {
    this._handler = b;
    this._container = a;
    this._index = c;
}

EventHandlerRef.prototype = {
    remove: function() {
        delete this._handler;
        delete this._container[this._index];
    },
    fire: function(a, event) {
        return this._handler.call(a, event);
    }
};

function Vector2(b, c, a) {
    copy_properties(this, {
        x: parseFloat(b),
        y: parseFloat(c),
        domain: a || "pure"
    });
}

copy_properties(Vector2.prototype, {
    toString: function() {
        return "(" + this.x + ", " + this.y + ")";
    },
    add: function(c, d) {
        if (arguments.length == 1) {
            if (c.domain != "pure") c = c.convertTo(this.domain);
            return this.add(c.x, c.y);
        }
        var a = parseFloat(c);
        var b = parseFloat(d);
        return new Vector2(this.x + a, this.y + b, this.domain);
    },
    mul: function(a, b) {
        if (typeof b == "undefined") b = a;
        return new Vector2(this.x * a, this.y * b, this.domain);
    },
    sub: function(a, b) {
        if (arguments.length == 1) {
            return this.add(a.mul(-1));
        } else return this.add(-a, -b);
    },
    distanceTo: function(a) {
        return this.sub(a).magnitude();
    },
    magnitude: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    convertTo: function(a) {
        if (a != "pure" && a != "viewport" && a != "document") return new Vector2(0, 0);
        if (a == this.domain) return new Vector2(this.x, this.y, this.domain);
        if (a == "pure") return new Vector2(this.x, this.y);
        if (this.domain == "pure") return new Vector2(0, 0);
        var b = Vector2.getScrollPosition("document");
        var c = this.x, d = this.y;
        if (this.domain == "document") {
            c -= b.x;
            d -= b.y;
        } else {
            c += b.x;
            d += b.y;
        }
        return new Vector2(c, d, a);
    },
    setElementPosition: function(a) {
        var b = this.convertTo("document");
        a.style.left = parseInt(b.x) + "px";
        a.style.top = parseInt(b.y) + "px";
        return this;
    },
    setElementDimensions: function(a) {
        return this.setElementWidth(a).setElementHeight(a);
    },
    setElementWidth: function(a) {
        a.style.width = parseInt(this.x, 10) + "px";
        return this;
    },
    setElementHeight: function(a) {
        a.style.height = parseInt(this.y, 10) + "px";
        return this;
    },
    scrollElementBy: function(a) {
        if (a == document.body) {
            window.scrollBy(this.x, this.y);
        } else {
            a.scrollLeft += this.x;
            a.scrollTop += this.y;
        }
        return this;
    }
});

copy_properties(Vector2, {
    getEventPosition: function(b, a) {
        a = a || "document";
        b = $E(b);
        var d = b.pageX || b.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
        var e = b.pageY || b.clientY + (document.documentElement.scrollTop || document.body.scrollTop);
        var c = new Vector2(d, e, "document");
        return c.convertTo(a);
    },
    getScrollPosition: function(a) {
        a = a || "document";
        var b = document.body.scrollLeft || document.documentElement.scrollLeft;
        var c = document.body.scrollTop || document.documentElement.scrollTop;
        return (new Vector2(b, c, "document")).convertTo(a);
    },
    getElementPosition: function(c, b) {
        b = b || "document";
        if (!c) return;
        if (!("getBoundingClientRect" in c)) return new Vector2(0, 0, "document");
        var e = c.getBoundingClientRect(), a = document.documentElement, d = Math.round(e.left) - a.clientLeft, f = Math.round(e.top) - a.clientTop;
        return (new Vector2(d, f, "viewport")).convertTo(b);
    },
    getElementDimensions: function(a) {
        return new Vector2(a.offsetWidth || 0, a.offsetHeight || 0);
    },
    getViewportDimensions: function() {
        var a = window && window.innerWidth || document && document.documentElement && document.documentElement.clientWidth || document && document.body && document.body.clientWidth || 0;
        var b = window && window.innerHeight || document && document.documentElement && document.documentElement.clientHeight || document && document.body && document.body.clientHeight || 0;
        return new Vector2(a, b, "viewport");
    },
    getDocumentDimensions: function() {
        var a = document && document.documentElement && document.documentElement.scrollWidth || document && document.body && document.body.scrollWidth || 0;
        var b = document && document.documentElement && document.documentElement.scrollHeight || document && document.body && document.body.scrollHeight || 0;
        return new Vector2(a, b, "document");
    },
    deserialize: function(b) {
        var a = b.split(",");
        return new Vector2(a[0], a[1]);
    }
});

var operaIgnoreScroll = {
    table: true,
    "inline-table": true,
    inline: true
};

function elementX(a) {
    return Vector2.getElementPosition(a, "document").x;
}

function elementY(a) {
    return Vector2.getElementPosition(a, "document").y;
}

function animation(a) {
    if (a == undefined) return;
    if (this == window) {
        return new animation(a);
    } else {
        this.obj = a;
        this._reset_state();
        this.queue = [];
        this.last_attr = null;
    }
}

animation.resolution = 20;

animation.offset = 0;

animation.prototype._reset_state = function() {
    this.state = {
        attrs: {},
        duration: 500
    };
};

animation.prototype.stop = function() {
    this._reset_state();
    this.queue = [];
    return this;
};

animation.prototype._build_container = function() {
    if (this.container_div) {
        this._refresh_container();
        return;
    }
    if (this.obj.firstChild && this.obj.firstChild.__animation_refs) {
        this.container_div = this.obj.firstChild;
        this.container_div.__animation_refs++;
        this._refresh_container();
        return;
    }
    var b = document.createElement("div");
    b.style.padding = "0px";
    b.style.margin = "0px";
    b.style.border = "0px";
    b.__animation_refs = 1;
    var a = this.obj.childNodes;
    while (a.length) b.appendChild(a[0]);
    this.obj.appendChild(b);
    this._orig_overflow = this.obj.style.overflow;
    this.obj.style.overflow = "hidden";
    this.container_div = b;
    this._refresh_container();
};

animation.prototype._refresh_container = function() {
    this.container_div.style.height = "auto";
    this.container_div.style.width = "auto";
    this.container_div.style.height = this.container_div.offsetHeight + "px";
    this.container_div.style.width = this.container_div.offsetWidth + "px";
};

animation.prototype._destroy_container = function() {
    if (!this.container_div) return;
    if (!--this.container_div.__animation_refs) {
        var a = this.container_div.childNodes;
        while (a.length) this.obj.appendChild(a[0]);
        this.obj.removeChild(this.container_div);
    }
    this.container_div = null;
    this.obj.style.overflow = this._orig_overflow;
};

animation.ATTR_TO = 1;

animation.ATTR_BY = 2;

animation.ATTR_FROM = 3;

animation.prototype._attr = function(a, d, c) {
    a = a.replace(/-[a-z]/gi, function(e) {
        return e.substring(1).toUpperCase();
    });
    var b = false;
    switch (a) {
      case "background":
        this._attr("backgroundColor", d, c);
        return this;
      case "margin":
        d = animation.parse_group(d);
        this._attr("marginBottom", d[0], c);
        this._attr("marginLeft", d[1], c);
        this._attr("marginRight", d[2], c);
        this._attr("marginTop", d[3], c);
        return this;
      case "padding":
        d = animation.parse_group(d);
        this._attr("paddingBottom", d[0], c);
        this._attr("paddingLeft", d[1], c);
        this._attr("paddingRight", d[2], c);
        this._attr("paddingTop", d[3], c);
        return this;
      case "backgroundColor":
      case "borderColor":
      case "color":
        d = animation.parse_color(d);
        break;
      case "opacity":
        d = parseFloat(d, 10);
        break;
      case "height":
      case "width":
        if (d == "auto") {
            b = true;
        } else d = parseInt(d, 10);
        break;
      case "borderWidth":
      case "lineHeight":
      case "fontSize":
      case "marginBottom":
      case "marginLeft":
      case "marginRight":
      case "marginTop":
      case "paddingBottom":
      case "paddingLeft":
      case "paddingRight":
      case "paddingTop":
      case "bottom":
      case "left":
      case "right":
      case "top":
      case "scrollTop":
      case "scrollLeft":
        d = parseInt(d, 10);
        break;
      default:
        throw new Error(a + " is not a supported attribute!");
    }
    if (this.state.attrs[a] === undefined) this.state.attrs[a] = {};
    if (b) this.state.attrs[a].auto = true;
    switch (c) {
      case animation.ATTR_FROM:
        this.state.attrs[a].start = d;
        break;
      case animation.ATTR_BY:
        this.state.attrs[a].by = true;
      case animation.ATTR_TO:
        this.state.attrs[a].value = d;
        break;
    }
};

animation._get_box_width = function(c) {
    var d = parseInt(CSS.getStyle(c, "paddingLeft"), 10), e = parseInt(CSS.getStyle(c, "paddingRight"), 10), a = parseInt(CSS.getStyle(c, "borderLeftWidth"), 10), b = parseInt(CSS.getStyle(c, "borderRightWidth"), 10);
    return c.offsetWidth - (d ? d : 0) - (e ? e : 0) - (a ? a : 0) - (b ? b : 0);
};

animation._get_box_height = function(c) {
    var e = parseInt(CSS.getStyle(c, "paddingTop"), 10), d = parseInt(CSS.getStyle(c, "paddingBottom"), 10), a = parseInt(CSS.getStyle(c, "borderTopWidth"), 10), b = parseInt(CSS.getStyle(c, "borderBottomWidth"), 10);
    return c.offsetHeight - (e ? e : 0) - (d ? d : 0) - (a ? a : 0) - (b ? b : 0);
};

animation.prototype.to = function(a, b) {
    if (b === undefined) {
        this._attr(this.last_attr, a, animation.ATTR_TO);
    } else {
        this._attr(a, b, animation.ATTR_TO);
        this.last_attr = a;
    }
    return this;
};

animation.prototype.by = function(a, b) {
    if (b === undefined) {
        this._attr(this.last_attr, a, animation.ATTR_BY);
    } else {
        this._attr(a, b, animation.ATTR_BY);
        this.last_attr = a;
    }
    return this;
};

animation.prototype.from = function(a, b) {
    if (b === undefined) {
        this._attr(this.last_attr, a, animation.ATTR_FROM);
    } else {
        this._attr(a, b, animation.ATTR_FROM);
        this.last_attr = a;
    }
    return this;
};

animation.prototype.duration = function(a) {
    this.state.duration = a ? a : 0;
    return this;
};

animation.prototype.checkpoint = function(b, a) {
    if (b === undefined) b = 1;
    this.state.checkpoint = b;
    this.queue.push(this.state);
    this._reset_state();
    this.state.checkpointcb = a;
    return this;
};

animation.prototype.blind = function() {
    this.state.blind = true;
    return this;
};

animation.prototype.hide = function() {
    this.state.hide = true;
    return this;
};

animation.prototype.show = function() {
    this.state.show = true;
    return this;
};

animation.prototype.ease = function(a) {
    this.state.ease = a;
    return this;
};

animation.prototype.go = function() {
    var b = (new Date).getTime();
    this.queue.push(this.state);
    for (var a = 0; a < this.queue.length; a++) {
        this.queue[a].start = b - animation.offset;
        if (this.queue[a].checkpoint) b += this.queue[a].checkpoint * this.queue[a].duration;
    }
    animation.push(this);
    return this;
};

animation.prototype._show = function() {
    CSS.show(this.obj);
};

animation.prototype._hide = function() {
    CSS.hide(this.obj);
};

animation.prototype._frame = function(m) {
    var c = true;
    var l = false;
    var o = false;
    var n;
    function d(p) {
        return document.documentElement[p] || document.body[p];
    }
    for (var e = 0; e < this.queue.length; e++) {
        var b = this.queue[e];
        if (b.start > m) {
            c = false;
            continue;
        }
        if (b.checkpointcb) {
            this._callback(b.checkpointcb, m - b.start);
            b.checkpointcb = null;
        }
        if (b.started === undefined) {
            if (b.show) this._show();
            for (var a in b.attrs) {
                if (b.attrs[a].start !== undefined) continue;
                switch (a) {
                  case "backgroundColor":
                  case "borderColor":
                  case "color":
                    n = animation.parse_color(CSS.getStyle(this.obj, a == "borderColor" ? "borderLeftColor" : a));
                    if (b.attrs[a].by) {
                        b.attrs[a].value[0] = Math.min(255, Math.max(0, b.attrs[a].value[0] + n[0]));
                        b.attrs[a].value[1] = Math.min(255, Math.max(0, b.attrs[a].value[1] + n[1]));
                        b.attrs[a].value[2] = Math.min(255, Math.max(0, b.attrs[a].value[2] + n[2]));
                    }
                    break;
                  case "opacity":
                    n = CSS.getOpacity(this.obj);
                    if (b.attrs[a].by) b.attrs[a].value = Math.min(1, Math.max(0, b.attrs[a].value + n));
                    break;
                  case "height":
                    n = animation._get_box_height(this.obj);
                    if (b.attrs[a].by) b.attrs[a].value += n;
                    break;
                  case "width":
                    n = animation._get_box_width(this.obj);
                    if (b.attrs[a].by) b.attrs[a].value += n;
                    break;
                  case "scrollLeft":
                  case "scrollTop":
                    n = this.obj === document.body ? d(a) : this.obj[a];
                    if (b.attrs[a].by) b.attrs[a].value += n;
                    b["last" + a] = n;
                    break;
                  default:
                    n = parseInt(CSS.getStyle(this.obj, a), 10) || 0;
                    if (b.attrs[a].by) b.attrs[a].value += n;
                    break;
                }
                b.attrs[a].start = n;
            }
            if (b.attrs.height && b.attrs.height.auto || b.attrs.width && b.attrs.width.auto) {
                if (ua.firefox() < 3) o = true;
                this._destroy_container();
                for (var a in {
                    height: 1,
                    width: 1,
                    fontSize: 1,
                    borderLeftWidth: 1,
                    borderRightWidth: 1,
                    borderTopWidth: 1,
                    borderBottomWidth: 1,
                    paddingLeft: 1,
                    paddingRight: 1,
                    paddingTop: 1,
                    paddingBottom: 1
                }) if (b.attrs[a]) this.obj.style[a] = b.attrs[a].value + (typeof b.attrs[a].value == "number" ? "px" : "");
                if (b.attrs.height && b.attrs.height.auto) b.attrs.height.value = animation._get_box_height(this.obj);
                if (b.attrs.width && b.attrs.width.auto) b.attrs.width.value = animation._get_box_width(this.obj);
            }
            b.started = true;
            if (b.blind) this._build_container();
        }
        var i = (m - b.start) / b.duration;
        if (i >= 1) {
            i = 1;
            if (b.hide) this._hide();
        } else c = false;
        var k = b.ease ? b.ease(i) : i;
        if (!l && i != 1 && b.blind) l = true;
        if (o && this.obj.parentNode) {
            var j = this.obj.parentNode;
            var h = this.obj.nextSibling;
            j.removeChild(this.obj);
        }
        for (var a in b.attrs) switch (a) {
          case "backgroundColor":
          case "borderColor":
          case "color":
            this.obj.style[a] = "rgb(" + animation.calc_tween(k, b.attrs[a].start[0], b.attrs[a].value[0], true) + "," + animation.calc_tween(k, b.attrs[a].start[1], b.attrs[a].value[1], true) + "," + animation.calc_tween(k, b.attrs[a].start[2], b.attrs[a].value[2], true) + ")";
            break;
          case "opacity":
            CSS.setStyle(this.obj, "opacity", animation.calc_tween(k, b.attrs[a].start, b.attrs[a].value));
            break;
          case "height":
          case "width":
            this.obj.style[a] = k == 1 && b.attrs[a].auto ? "auto" : animation.calc_tween(k, b.attrs[a].start, b.attrs[a].value, true) + "px";
            break;
          case "scrollLeft":
          case "scrollTop":
            var f = this.obj === document.body;
            n = f ? d(a) : this.obj[a];
            if (b["last" + a] !== n) {
                delete b.attrs[a];
            } else {
                var g = animation.calc_tween(k, b.attrs[a].start, b.attrs[a].value, true);
                if (!f) {
                    g = this.obj[a] = g;
                } else {
                    if (a == "scrollLeft") {
                        window.scrollTo(g, d("scrollTop"));
                    } else window.scrollTo(d("scrollLeft"), g);
                    g = d(a);
                }
                b["last" + a] = g;
            }
            break;
          default:
            this.obj.style[a] = animation.calc_tween(k, b.attrs[a].start, b.attrs[a].value, true) + "px";
            break;
        }
        if (i == 1) {
            this.queue.splice(e--, 1);
            this._callback(b.ondone, m - b.start - b.duration);
        }
    }
    if (o) j[h ? "insertBefore" : "appendChild"](this.obj, h);
    if (!l && this.container_div) this._destroy_container();
    return !c;
};

animation.prototype.ondone = function(a) {
    this.state.ondone = a;
    return this;
};

animation.prototype._callback = function(a, b) {
    if (a) {
        animation.offset = b;
        a.call(this);
        animation.offset = 0;
    }
};

animation.calc_tween = function(a, b, c, d) {
    return (d ? parseInt : parseFloat)((c - b) * a + b, 10);
};

animation.parse_color = function(a) {
    var b = /^#([a-f0-9]{1,2})([a-f0-9]{1,2})([a-f0-9]{1,2})$/i.exec(a);
    if (b) {
        return [ parseInt(b[1].length == 1 ? b[1] + b[1] : b[1], 16), parseInt(b[2].length == 1 ? b[2] + b[2] : b[2], 16), parseInt(b[3].length == 1 ? b[3] + b[3] : b[3], 16) ];
    } else {
        var c = /^rgba? *\(([0-9]+), *([0-9]+), *([0-9]+)(?:, *([0-9]+))?\)$/.exec(a);
        if (c) {
            if (c[4] === "0") {
                return [ 255, 255, 255 ];
            } else return [ parseInt(c[1], 10), parseInt(c[2], 10), parseInt(c[3], 10) ];
        } else if (a == "transparent") {
            return [ 255, 255, 255 ];
        } else throw "Named color attributes are not supported.";
    }
};

animation.parse_group = function(a) {
    a = trim(a).split(/ +/);
    if (a.length == 4) {
        return a;
    } else if (a.length == 3) {
        return [ a[0], a[1], a[2], a[1] ];
    } else if (a.length == 2) {
        return [ a[0], a[1], a[0], a[1] ];
    } else return [ a[0], a[0], a[0], a[0] ];
};

animation.push = function(a) {
    if (!animation.active) animation.active = [];
    animation.active.push(a);
    if (animation.active.length === 1) {
        if (!animation.requestAnimationFrame) {
            var b = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
            if (b) animation.requestAnimationFrame = b.bind(window);
        }
        if (animation.requestAnimationFrame) {
            animation.requestAnimationFrame(animation._animate);
        } else animation.timeout = setInterval(animation._animate, animation.resolution, false);
    }
    animation._animate((new Date).getTime(), true);
};

animation._animate = function(d, c) {
    d = d || (new Date).getTime();
    for (var b = c === true ? animation.active.length - 1 : 0; b < animation.active.length; b++) try {
        if (!animation.active[b]._frame(d)) animation.active.splice(b--, 1);
    } catch (a) {
        animation.active.splice(b--, 1);
    }
    if (animation.active.length === 0) {
        if (animation.timeout) {
            clearInterval(animation.timeout);
            delete animation.timeout;
        }
    } else if (animation.requestAnimationFrame) animation.requestAnimationFrame(animation._animate);
};

animation.ease = {};

animation.ease.begin = function(a) {
    return Math.sin(Math.PI / 2 * (a - 1)) + 1;
};

animation.ease.end = function(a) {
    return Math.sin(.5 * Math.PI * a);
};

animation.ease.both = function(a) {
    return .5 * Math.sin(Math.PI * (a - .5)) + .5;
};

animation.prependInsert = function(b, a) {
    animation.insert(b, a, DOM.prependContent);
};

animation.appendInsert = function(b, a) {
    animation.insert(b, a, DOM.appendContent);
};

animation.insert = function(c, a, b) {
    CSS.setStyle(a, "opacity", 0);
    b(c, a);
    animation(a).from("opacity", 0).to("opacity", 1).duration(400).go();
};

var Button = function() {
    var b = "uiButtonDisabled";
    var a = "uiButtonDepressed";
    var d = "button:blocker";
    var c = "href";
    function e(j, i) {
        var h = DataStore.get(j, d);
        if (i) {
            if (h) {
                h.remove();
                DataStore.remove(j, d);
            }
        } else if (!h) DataStore.set(j, d, Event.listen(j, "click", bagof(false), Event.Priority.URGENT));
    }
    function f(h) {
        var i = Parent.byClass(h, "uiButton");
        if (!i) throw new Error("invalid use case");
        return i;
    }
    function g(h) {
        return DOM.isNode(h, "a");
    }
    return {
        getInputElement: function(h) {
            h = f(h);
            if (g(h)) throw new Error("invalid use case");
            return DOM.find(h, "input");
        },
        isEnabled: function(h) {
            return !CSS.hasClass(f(h), b);
        },
        setEnabled: function(k, h) {
            k = f(k);
            CSS.conditionClass(k, b, !h);
            if (g(k)) {
                var i = k.href;
                var l = DataStore.get(k, c, "#");
                if (h) {
                    if (!i) k.href = l;
                } else {
                    if (i && i !== l) DataStore.set(k, c, i);
                    k.removeAttribute("href");
                }
                e(k, h);
            } else {
                var j = Button.getInputElement(k);
                j.disabled = !h;
                e(j, h);
            }
        },
        setDepressed: function(i, h) {
            CSS.conditionClass(f(i), a, h);
        },
        isDepressed: function(h) {
            return CSS.hasClass(f(h), a);
        },
        setLabel: function(i, h) {
            i = f(i);
            if (g(i)) {
                var j = DOM.find(i, "span.uiButtonText");
                DOM.setContent(j, h);
            } else Button.getInputElement(i).value = h;
            CSS.conditionClass(i, "uiButtonNoText", !h);
        },
        setIcon: function(i, h) {
            if (!DOM.isNode(h)) return;
            CSS.addClass(h, "customimg");
            i = f(i);
            var j = DOM.scry(i, ".img")[0];
            if (j != h) if (j) {
                DOM.replace(j, h);
            } else DOM.prependContent(i, h);
        }
    };
}();

function show() {
    for (var b = 0; b < arguments.length; b++) {
        var a = ge(arguments[b]);
        if (a && a.style) a.style.display = "";
    }
    return false;
}

function hide() {
    for (var b = 0; b < arguments.length; b++) {
        var a = ge(arguments[b]);
        if (a && a.style) a.style.display = "none";
    }
    return false;
}

function shown(a) {
    a = ge(a);
    return a.style.display != "none" && !(a.style.display == "" && a.offsetWidth == 0);
}

function toggle() {
    for (var b = 0; b < arguments.length; b++) {
        var a = $(arguments[b]);
        a.style.display = CSS.getStyle(a, "display") == "block" ? "none" : "block";
    }
    return false;
}

function toggleDisplayNone() {
    for (var b = 0; b < arguments.length; b++) {
        var a = $(arguments[b]);
        if (shown(a)) {
            hide(a);
        } else show(a);
    }
    return false;
}

var KEYS = {
    BACKSPACE: 8,
    TAB: 9,
    RETURN: 13,
    ESC: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    DELETE: 46,
    COMMA: 188
};

var ErrorDialog = {
    showAsyncError: function(b) {
        try {
            return ErrorDialog.show(b.getErrorSummary(), b.getErrorDescription());
        } catch (a) {
            alert(b);
        }
    },
    show: function(d, c, b, a) {
        return (new Dialog).setTitle(d).setBody(c).setButtons([ Dialog.OK ]).setStackable(true).setModal(true).setHandler(b || bagofholding).setButtonsMessage(a || "").show();
    }
};

add_properties("Form", {
    getInputs: function(a) {
        a = a || document;
        return [].concat($A(DOM.scry(a, "input")), $A(DOM.scry(a, "select")), $A(DOM.scry(a, "textarea")), $A(DOM.scry(a, "button")));
    },
    getSelectValue: function(a) {
        return a.options[a.selectedIndex].value;
    },
    setSelectValue: function(b, c) {
        for (var a = 0; a < b.options.length; ++a) if (b.options[a].value == c) {
            b.selectedIndex = a;
            break;
        }
    },
    getRadioValue: function(b) {
        for (var a = 0; a < b.length; a++) if (b[a].checked) return b[a].value;
        return null;
    },
    getElements: function(a) {
        return $A(a.tagName == "FORM" ? a.elements : Form.getInputs(a));
    },
    getAttribute: function(b, a) {
        return (b.getAttributeNode(a) || {}).value || null;
    },
    setDisabled: function(b, a) {
        Form.getElements(b).forEach(function(c) {
            if (c.disabled != undefined) {
                var d = DataStore.get(c, "origDisabledState");
                if (a) {
                    if (d === undefined) DataStore.set(c, "origDisabledState", c.disabled);
                    c.disabled = a;
                } else {
                    if (d !== true) c.disabled = false;
                    DataStore.remove(c, "origDisabledState");
                }
            }
        });
    },
    bootstrap: function(d, e) {
        var f = (Form.getAttribute(d, "method") || "GET").toUpperCase();
        e = Parent.byTag(e, "button") || e;
        var g = DOMPath.findNodePath(d);
        var i = Parent.byClass(e, "stat_elem") || d;
        if (CSS.hasClass(i, "async_saving")) return;
        if (e && (e.form !== d || e.nodeName != "INPUT" && e.nodeName != "BUTTON" || e.type != "submit")) {
            var j = DOM.scry(d, ".enter_submit_target")[0];
            var b = e;
            j && (e = j);
        }
        var c = Form.serialize(d, e);
        Form.setDisabled(d, true);
        var a = Form.getAttribute(d, "ajaxify") || Form.getAttribute(d, "action");
        trackReferrer(d, a);
        var h = new AsyncRequest(a);
        h.setData(c).setNectarModuleDataSafe(d).setReadOnly(f == "GET").setMethod(f).setRelativeTo(d).setStatusElement(i).setHandler(function(k) {
            if (k.isReplay()) h.setRelativeTo(DOMPath.resolveNodePath(g));
        }).setFinallyHandler(Form.setDisabled.bind(null, d, false)).send();
    },
    serialize: function(b, c) {
        var a = {};
        Form.getElements(b).forEach(function(d) {
            if (d.name && !d.disabled && d.type != "submit") if (!d.type || (d.type == "radio" || d.type == "checkbox") && d.checked || d.type == "text" || d.type == "password" || d.type == "hidden" || d.tagName == "TEXTAREA") {
                var h;
                if (d.name == "post_form_id") h = Env.post_form_id;
                Form._serializeHelper(a, d.name, h || Input.getValue(d));
            } else if (d.tagName == "SELECT") for (var e = 0, f = d.options.length; e < f; ++e) {
                var g = d.options[e];
                if (g.selected) Form._serializeHelper(a, d.name, g.value);
            }
        });
        if (c && c.name && "submit" == c.type && DOM.contains(b, c) && DOM.isNode(c, [ "input", "button" ])) Form._serializeHelper(a, c.name, c.value);
        return Form._serializeFix(a);
    },
    _serializeHelper: function(a, d, e) {
        var c = /([^\]]+)\[([^\]]*)\](.*)/.exec(d);
        if (c) {
            a[c[1]] = a[c[1]] || {};
            if (c[2] == "") {
                var b = 0;
                while (a[c[1]][b] != undefined) b++;
            } else b = c[2];
            if (c[3] == "") {
                a[c[1]][b] = e;
            } else Form._serializeHelper(a[c[1]], b.concat(c[3]), e);
        } else a[d] = e;
    },
    _serializeFix: function(a) {
        var e = [];
        for (var b in a) {
            if (a instanceof Object) a[b] = Form._serializeFix(a[b]);
            e.push(b);
        }
        var d = 0, c = true;
        e.sort().each(function(g) {
            if (g != d++) c = false;
        });
        if (c) {
            var f = {};
            e.each(function(g) {
                f[g] = a[g];
            });
            return f;
        } else return a;
    },
    post: function(d, b, c) {
        var a = document.createElement("form");
        a.action = d.toString();
        a.method = "POST";
        a.style.display = "none";
        if (c) a.target = c;
        if (ge("post_form_id")) b.post_form_id = $("post_form_id").value;
        b.fb_dtsg = Env.fb_dtsg;
        b.post_form_id_source = "dynamic_post";
        Form.createHiddenInputs(b, a);
        DOM.getRootElement().appendChild(a);
        a.submit();
        return false;
    },
    createHiddenInputs: function(g, a, d, f) {
        d = d || {};
        var c;
        var h = URI.implodeQuery(g, "", false);
        var i = h.split("&");
        for (var b = 0; b < i.length; b++) if (i[b]) {
            var j = i[b].split("=");
            var e = j[0];
            var k = j[1];
            if (e === undefined || k === undefined) continue;
            k = URI.decodeComponent(k);
            if (d[e] && f) {
                d[e].value = k;
            } else {
                c = $N("input", {
                    type: "hidden",
                    name: e,
                    value: k
                });
                d[e] = c;
                a.appendChild(c);
            }
        }
        return d;
    },
    getFirstElement: function(b, f) {
        f = f || [ 'input[type="text"]', "textarea", 'input[type="password"]', 'input[type="button"]', 'input[type="submit"]' ];
        var e = [];
        for (var c = 0; c < f.length && e.length == 0; c++) e = DOM.scry(b, f[c]);
        if (e.length > 0) {
            var d = e[0];
            try {
                if (elementY(d) > 0 && elementX(d) > 0) return d;
            } catch (a) {}
        }
        return null;
    },
    focusFirst: function(b) {
        var a = Form.getFirstElement(b);
        if (a) {
            a.focus();
            return true;
        }
        return false;
    }
});

var DOMPath = {
    findNodePath: function(c, e) {
        e = e || [];
        if (c.id || !DOM.isNode(c.parentNode)) return {
            id: c.id,
            path: e.reverse()
        };
        var d = c.parentNode;
        var b = d.childNodes;
        for (var a = 0; a < b.length; ++a) if (b[a] === c) {
            e.push(a);
            return DOMPath.findNodePath(d, e);
        }
        return null;
    },
    resolveNodePath: function(a) {
        var b = ge(a.id) || document.documentElement;
        return DOMPath._resolveNodePathChildren(a.path, b, 0);
    },
    _resolveNodePathChildren: function(c, d, b) {
        if (b === c.length) return d;
        var a = d.childNodes[c[b]];
        if (!a) return null;
        return DOMPath._resolveNodePathChildren(c, a, b + 1);
    }
};

function Dialog(a) {
    this._show_loading = true;
    this._loading_was_shown = false;
    this._auto_focus = true;
    this._fade_enabled = true;
    this._onload_handlers = [];
    this._top = 125;
    this._uniqueID = "dialog_" + Dialog._globalCount++;
    this._content = null;
    this._obj = null;
    this._popup = null;
    this._overlay = null;
    this._shim = null;
    this._hidden_objects = [];
    this._causal_elem = null;
    this._previous_focus = null;
    if (a) this._setFromModel(a);
    Dialog._init();
}

Metaprototype.makeFinal(Dialog);

copy_properties(Dialog, {
    OK: {
        name: "ok",
        label: _tx("OK")
    },
    CANCEL: {
        name: "cancel",
        label: _tx("Annuler"),
        className: "inputaux"
    },
    CLOSE: {
        name: "close",
        label: _tx("Fermer")
    },
    NEXT: {
        name: "next",
        label: _tx("Suiv.")
    },
    SAVE: {
        name: "save",
        label: _tx("Enregistrer")
    },
    SUBMIT: {
        name: "submit",
        label: _tx("Envoyer")
    },
    CONFIRM: {
        name: "confirm",
        label: _tx("Confirmer")
    },
    DELETE: {
        name: "delete",
        label: _tx("Supprimer")
    },
    _globalCount: 0,
    _bottoms: [ 0 ],
    max_bottom: 0,
    _updateMaxBottom: function() {
        Dialog.max_bottom = Math.max.apply(Math, Dialog._bottoms);
    }
});

copy_properties(Dialog, {
    OK_AND_CANCEL: [ Dialog.OK, Dialog.CANCEL ],
    _STANDARD_BUTTONS: [ Dialog.OK, Dialog.CANCEL, Dialog.CLOSE, Dialog.SAVE, Dialog.SUBMIT, Dialog.CONFIRM, Dialog.DELETE ],
    SHOULD_HIDE_OBJECTS: !ua.windows(),
    _useCSSBorders: CSS.supportsBorderRadius() || ua.ie() <= 6,
    SIZE: {
        WIDE: 555,
        STANDARD: 445
    },
    _HALO_WIDTH: 10,
    _BORDER_WIDTH: 1,
    _PADDING_WIDTH: 10,
    _PAGE_MARGIN: 40,
    _stack: [],
    newButton: function(e, d, b, c) {
        var a = {
            name: e,
            label: d
        };
        if (b) a.className = b;
        if (c) a.handler = c;
        return a;
    },
    getCurrent: function() {
        var a = Dialog._stack;
        return a.length ? a[a.length - 1] : null;
    },
    bootstrap: function(i, a, f, d, e, c) {
        a = a || {};
        var j = c && c.rel == "dialog-pipe";
        copy_properties(a, (new URI(i)).getQueryData());
        d = d || (f ? "GET" : "POST");
        var h = Parent.byClass(c, "stat_elem") || c;
        if (h && CSS.hasClass(h, "async_saving")) return false;
        var g;
        if (j) {
            g = new AjaxPipeRequest;
        } else g = (new AsyncRequest).setReadOnly(!!f).setMethod(d).setRelativeTo(c).setStatusElement(h);
        g.setURI(i).setNectarModuleDataSafe(c).setData(a);
        var b = (new Dialog(e)).setCausalElement(c).setAsync(g, j);
        b.show();
        return false;
    },
    _init: function() {
        this._init = bagofholding;
        onleaveRegister(Dialog._tearDown.shield(null, false));
        Arbiter.subscribe("page_transition", Dialog._tearDown.shield(null, true));
        Event.listen(document.documentElement, "keydown", function(event) {
            if (Event.getKeyCode(event) == KEYS.ESC && !event.getModifiers().any) if (Dialog._escape()) event.kill();
        });
        Event.listen(window, "resize", function(event) {
            var a = Dialog.getCurrent();
            a && a._resetDialogObj();
        });
    },
    _basicMutator: function(a) {
        return function(b) {
            this[a] = b;
            this._dirty();
            return this;
        };
    },
    _findButton: function(a, c) {
        if (a) for (var b = 0; b < a.length; ++b) if (a[b].name == c) return a[b];
        return null;
    },
    _tearDown: function(b) {
        var c = Dialog._stack.clone();
        for (var a = c.length - 1; a >= 0; a--) if (!(b && c[a]._cross_transition)) c[a].hide();
    },
    _escape: function() {
        var d = Dialog.getCurrent();
        if (!d) return false;
        var e = d._semi_modal;
        var b = d._buttons;
        if (!b && !e) return false;
        if (e && !b) {
            d.hide();
            return true;
        }
        var a;
        var c = Dialog._findButton(b, "cancel");
        if (d._cancelHandler) {
            d.cancel();
            return true;
        } else if (c) {
            a = c;
        } else if (b.length == 1) {
            a = b[0];
        } else return false;
        d._handleButton(a);
        return true;
    },
    call_or_eval: function(obj, func, args) {
        if (!func) return undefined;
        args = args || {};
        if (typeof func == "string") {
            var params = keys(args).join(", ");
            func = eval("({f: function(" + params + ") { " + func + "}})").f;
        }
        return func.apply(obj, values(args));
    }
});

copy_properties(Dialog.prototype, {
    _cross_transition: false,
    _fixed: false,
    show: function(a) {
        Arbiter.inform("DialogShown");
        this._showing = true;
        if (a) {
            if (this._fade_enabled) CSS.setStyle(this._obj, "opacity", 1);
            this._obj.style.display = "";
        } else this._dirty();
        return this;
    },
    showLoading: function() {
        this._loading_was_shown = true;
        this._renderDialog($N("div", {
            className: "dialog_loading"
        }, _tx("Chargement...")));
        return this;
    },
    hide: function(a) {
        if (!this._showing) return this;
        Arbiter.inform("DialogHidden");
        this._showing = false;
        if (this._autohide_timeout) {
            clearTimeout(this._autohide_timeout);
            this._autohide_timeout = null;
        }
        if (this._fade_enabled && Dialog._stack.length <= 1) {
            this._fadeOut(a);
        } else this._hide(a);
        return this;
    },
    cancel: function() {
        if (!this._cancelHandler || this._cancelHandler() !== false) this.hide();
    },
    getRoot: function() {
        return this._obj;
    },
    getBody: function() {
        return DOM.scry(this._obj, "div.dialog_body")[0];
    },
    getButtonElement: function(a) {
        if (typeof a == "string") a = Dialog._findButton(this._buttons, a);
        if (!a || !a.name) return null;
        var b = DOM.scry(this._popup, "input");
        var c = function(d) {
            return d.name == a.name;
        };
        return b.filter(c)[0] || null;
    },
    getContentNode: function() {
        return DOM.find(this._content, "div.dialog_content");
    },
    getFormData: function() {
        return Form.serialize(this.getContentNode());
    },
    setAllowCrossPageTransition: function(a) {
        this._cross_transition = a;
        return this;
    },
    setShowing: function() {
        this.show();
        return this;
    },
    setHiding: function() {
        this.hide();
        return this;
    },
    setTitle: Dialog._basicMutator("_title"),
    setBody: Dialog._basicMutator("_body"),
    setExtraData: Dialog._basicMutator("_extra_data"),
    setReturnData: Dialog._basicMutator("_return_data"),
    setShowLoading: Dialog._basicMutator("_show_loading"),
    setFullBleed: Dialog._basicMutator("_full_bleed"),
    setImmediateRendering: function(a) {
        this._immediate_rendering = a;
        return this;
    },
    setCausalElement: function(a) {
        this._causal_elem = a;
        return this;
    },
    setUserData: Dialog._basicMutator("_user_data"),
    getUserData: function() {
        return this._user_data;
    },
    setAutohide: function(a) {
        if (a) {
            if (this._showing) {
                this._autohide_timeout = setTimeout(this.hide.shield(this), a);
            } else this._autohide = a;
        } else {
            this._autohide = null;
            if (this._autohide_timeout) {
                clearTimeout(this._autohide_timeout);
                this._autohide_timeout = null;
            }
        }
        return this;
    },
    setSummary: Dialog._basicMutator("_summary"),
    setButtons: function(a) {
        var c;
        if (!(a instanceof Array)) {
            c = $A(arguments);
        } else c = a;
        for (var d = 0; d < c.length; ++d) if (typeof c[d] == "string") {
            var b = Dialog._findButton(Dialog._STANDARD_BUTTONS, c[d]);
            c[d] = b;
        }
        this._buttons = c;
        this._updateButtons();
        return this;
    },
    setButtonsMessage: Dialog._basicMutator("_buttons_message"),
    setClickButtonOnEnter: function(b, a) {
        this._clickButtonOnEnter = a;
        this._clickButtonOnEnterInputName = b;
        return this;
    },
    setStackable: function(b, a) {
        this._is_stackable = b;
        this._shown_while_stacked = b && a;
        return this;
    },
    setHandler: function(a) {
        this._handler = a;
        return this;
    },
    setCancelHandler: function(a) {
        this._cancelHandler = Dialog.call_or_eval.bind(null, this, a);
        return this;
    },
    setCloseHandler: function(a) {
        this._close_handler = Dialog.call_or_eval.bind(null, this, a);
        return this;
    },
    clearHandler: function() {
        return this.setHandler(null);
    },
    setPostURI: function(b, a) {
        if (a === undefined) a = true;
        if (a) {
            this.setHandler(this._submitForm.bind(this, "POST", b));
        } else this.setHandler(function() {
            Form.post(b, this.getFormData());
            this.hide();
        }.bind(this));
        return this;
    },
    setGetURI: function(a) {
        this.setHandler(this._submitForm.bind(this, "GET", a));
        return this;
    },
    setModal: function(a) {
        this._modal = a;
        return this;
    },
    setSemiModal: function(a) {
        if (a) this.setModal(true);
        this._semi_modal = a;
        return this;
    },
    setWideDialog: Dialog._basicMutator("_wide_dialog"),
    setContentWidth: Dialog._basicMutator("_content_width"),
    setTitleLoading: function(b) {
        if (b === undefined) b = true;
        var a = DOM.find(this._popup, "h2.dialog_title");
        if (a) CSS.conditionClass(a, "loading", b);
        return this;
    },
    setSecure: Dialog._basicMutator("_secure"),
    setClassName: Dialog._basicMutator("_class_name"),
    setFadeEnabled: Dialog._basicMutator("_fade_enabled"),
    setFooter: Dialog._basicMutator("_footer"),
    setAutoFocus: Dialog._basicMutator("_auto_focus"),
    setTop: Dialog._basicMutator("_top"),
    setFixed: Dialog._basicMutator("_fixed"),
    onloadRegister: function(a) {
        $A(a).forEach(function(b) {
            if (typeof b == "string") b = new Function(b);
            this._onload_handlers.push(b.bind(this));
        }.bind(this));
        return this;
    },
    setAsyncURL: function(a) {
        return this.setAsync(new AsyncRequest(a));
    },
    setAsync: function(a, i) {
        var c = function(m) {
            if (this._async_request != a) return;
            this._async_request = null;
            var l = m.getPayload();
            var j = l;
            var k = function() {
                if (typeof j == "string") {
                    this.setBody(j);
                } else this._setFromModel(j);
                this._update(true);
            }.bind(this);
            if (i) {
                j = l.dialog;
                Bootloader.setResourceMap(l.resource_map);
                Bootloader.loadResources(l.css, k);
            } else k();
        }.bind(this);
        var b = a.getData();
        b.__d = 1;
        a.setData(b);
        var d = bind(this, "hide");
        var h;
        if (i) {
            a.setFirstResponseHandler(c);
            h = a.getAsyncRequest();
        } else {
            var f = a.getHandler() || bagofholding;
            a.setHandler(function(j) {
                f(j);
                c(j);
            });
            h = a;
        }
        var e = h.getErrorHandler() || bagofholding;
        var g = h.getTransportErrorHandler() || bagofholding;
        h.setAllowCrossPageTransition(this._cross_transition).setErrorHandler(function(j) {
            d(true);
            e(j);
        }).setTransportErrorHandler(function(j) {
            d(true);
            g(j);
        });
        a.send();
        this._async_request = a;
        this._dirty();
        return this;
    },
    _dirty: function() {
        if (!this._is_dirty) {
            this._is_dirty = true;
            if (this._immediate_rendering) {
                this._update();
            } else bind(this, "_update", false).defer();
        }
    },
    _format: function(a) {
        if (typeof a == "string") {
            a = HTML(a);
        } else a = HTML.replaceJSONWrapper(a);
        if (a instanceof HTML) a.setDeferred(true);
        return a;
    },
    _update: function(d) {
        if (!this._is_dirty && d !== true) return;
        this._is_dirty = false;
        if (!this._showing) return;
        if (this._autohide && !this._async_request && !this._autohide_timeout) this._autohide_timeout = setTimeout(bind(this, "hide"), this._autohide);
        if (!this._async_request || !this._show_loading) {
            if (this._loading_was_shown === true) {
                this._hide(true);
                this._loading_was_shown = false;
            }
            var b = [];
            if (this._summary) b.push($N("div", {
                className: "dialog_summary"
            }, this._format(this._summary)));
            b.push($N("div", {
                className: "dialog_body"
            }, this._format(this._body)));
            var a = this._getButtonContent();
            if (a.length) b.push($N("div", {
                className: "dialog_buttons clearfix"
            }, a));
            if (this._footer) b.push($N("div", {
                className: "dialog_footer"
            }, this._format(this._footer)));
            b = $N("div", {
                className: "dialog_content"
            }, b);
            if (this._title) {
                var g = $N("span", this._format(this._title));
                var h = $N("h2", {
                    className: "dialog_title",
                    id: "title_" + this._uniqueID
                }, g);
                CSS.conditionClass(h, "secure", this._secure);
                b = [ h, b ];
            } else {
                CSS.addClass(b, "dialog_content_titleless");
                b = [ b ];
            }
            this._renderDialog(b);
            CSS.conditionClass(this.getRoot(), "omitDialogFooter", !a.length);
            if (this._clickButtonOnEnterInputName && this._clickButtonOnEnter && ge(this._clickButtonOnEnterInputName)) Event.listen(ge(this._clickButtonOnEnterInputName), "keypress", function(i) {
                if (Event.getKeyCode(i) == KEYS.RETURN) this._handleButton(this._clickButtonOnEnter);
                return true;
            }.bind(this));
            for (var f = 0; f < this._onload_handlers.length; ++f) try {
                this._onload_handlers[f]();
            } catch (e) {}
            this._onload_handlers = [];
            this._previous_focus = document.activeElement;
            this._obj.focus();
        } else this.showLoading();
        var c = 2 * Dialog._BORDER_WIDTH;
        if (Dialog._useCSSBorders) c += 2 * Dialog._HALO_WIDTH;
        if (this._content_width) {
            c += this._content_width;
            if (!this._full_bleed) c += 2 * Dialog._PADDING_WIDTH;
        } else if (this._wide_dialog) {
            c += Dialog.SIZE.WIDE;
        } else c += Dialog.SIZE.STANDARD;
        this._popup.style.width = c + "px";
    },
    _updateButtons: function() {
        if (!this._showing) return;
        var b = this._getButtonContent();
        var c = null;
        if (!this.getRoot()) this._buildDialog();
        CSS.conditionClass(this.getRoot(), "omitDialogFooter", !b.length);
        if (b.length) c = $N("div", {
            className: "dialog_buttons clearfix"
        }, b);
        var d = DOM.scry(this._content, "div.dialog_buttons")[0] || null;
        if (!d) {
            if (!c) return;
            var a = this.getBody();
            if (a) DOM.insertAfter(a, c);
        } else if (c) {
            DOM.replace(d, c);
        } else DOM.remove(d);
    },
    _getButtonContent: function() {
        var c = [];
        if (this._buttons && this._buttons.length > 0 || this._buttons_message) {
            if (this._buttons_message) c.push($N("div", {
                className: "dialog_buttons_msg"
            }, this._format(this._buttons_message)));
            if (this._buttons) for (var f = 0; f < this._buttons.length; f++) {
                var b = this._buttons[f];
                var d = $N("input", {
                    type: "button",
                    name: b.name || "",
                    value: b.label
                });
                var e = $N("label", {
                    className: "uiButton uiButtonLarge uiButtonConfirm"
                }, d);
                if (b.className) {
                    b.className.split(/\s+/).each(function(g) {
                        CSS.addClass(e, g);
                    });
                    if (CSS.hasClass(e, "inputaux")) {
                        CSS.removeClass(e, "inputaux");
                        CSS.removeClass(e, "uiButtonConfirm");
                    }
                    if (CSS.hasClass(e, "uiButtonSpecial")) CSS.removeClass(e, "uiButtonConfirm");
                }
                if (b.icon) DOM.prependContent(e, $N("img", {
                    src: b.icon,
                    className: "img mrs"
                }));
                if (b.disabled) Button.setEnabled(e, false);
                Event.listen(d, "click", this._handleButton.bind(this, b.name));
                for (var a in b) if (a.indexOf("data-") === 0 && a.length > 5) d.setAttribute(a, b[a]);
                c.push(e);
            }
        }
        return c;
    },
    _renderDialog: function(c) {
        if (!this._obj) this._buildDialog();
        if (this._class_name) CSS.addClass(this._obj, this._class_name);
        CSS.conditionClass(this._obj, "full_bleed", this._full_bleed);
        if (typeof c == "string") c = HTML(c).setDeferred(this._immediate_rendering !== true);
        DOM.setContent(this._content, c);
        this._showDialog();
        if (this._auto_focus) {
            var d = Form.getFirstElement(this._content, [ 'input[type="text"]', "textarea", 'input[type="password"]' ]);
            if (d) Form.focusFirst.bind(this, this._content).defer();
            var b = Form.getFirstElement(this._content, [ 'input[type="button"]', 'input[type="submit"]' ]);
            if (b) this.setClickButtonOnEnter(this._uniqueID, b);
        }
        var a = Vector2.getElementDimensions(this._content).y + Vector2.getElementPosition(this._content).y;
        Dialog._bottoms.push(a);
        this._bottom = a;
        Dialog._updateMaxBottom();
        return this;
    },
    _buildDialog: function() {
        this._obj = $N("div", {
            className: "generic_dialog",
            tabIndex: "0"
        });
        this._obj.setAttribute("role", "alertdialog");
        this._obj.style.display = "none";
        document.body.appendChild(this._obj);
        if (!this._popup) this._popup = $N("div", {
            className: "generic_dialog_popup"
        });
        this._popup.style.left = this._popup.style.top = "";
        this._obj.appendChild(this._popup);
        if (ua.ie() < 7 && !this._shim) Bootloader.loadComponents("iframe-shim", function() {
            this._shim = new IframeShim(this._popup);
        });
        this._buildDialogContent();
    },
    _showDialog: function() {
        if (this._modal) {
            this._buildOverlay();
        } else if (this._overlay) {
            DOM.remove(this._overlay);
            this._overlay = null;
        }
        if (this._obj && this._obj.style.display) {
            this._obj.style.visibility = "hidden";
            this._obj.style.display = "";
            this.resetDialogPosition();
            this._obj.style.visibility = "";
            this._obj.dialog = this;
        } else this.resetDialogPosition();
        clearInterval(this.active_hiding);
        this.active_hiding = setInterval(this._activeResize.bind(this), 500);
        Arbiter.inform("new_layer");
        var c = Dialog._stack;
        if (c.length) {
            var a = c[c.length - 1];
            if (a != this && (!a._is_stackable || a._show_loading && a._loading_was_shown)) a._hide();
            for (var b = c.length - 1; b >= 0; b--) if (c[b] == this) {
                c.splice(b, 1);
            } else if (!c[b]._shown_while_stacked) c[b]._hide(true);
        }
        c.push(this);
        return this;
    },
    _updateShim: function() {
        return this._shim && this._shim.show();
    },
    _activeResize: function() {
        if (this.last_offset_height != this._content.offsetHeight) {
            this.last_offset_height = this._content.offsetHeight;
            this._updateShim();
        }
    },
    _buildDialogContent: function() {
        CSS.addClass(this._obj, "pop_dialog");
        if (intl_locale_is_rtl()) CSS.addClass(this._obj, "pop_dialog_rtl");
        var a;
        if (Dialog._useCSSBorders) {
            a = '<div class="pop_container_advanced">' + '<div class="pop_content" id="pop_content"></div>' + "</div>";
        } else a = '<div class="pop_container">' + '<div class="pop_verticalslab"></div>' + '<div class="pop_horizontalslab"></div>' + '<div class="pop_topleft"></div>' + '<div class="pop_topright"></div>' + '<div class="pop_bottomright"></div>' + '<div class="pop_bottomleft"></div>' + '<div class="pop_content pop_content_old" id="pop_content"></div>' + "</div>";
        DOM.setContent(this._popup, HTML(a));
        this._frame = DOM.find(this._popup, "div.pop_content");
        this._content = this._frame;
    },
    _buildOverlay: function() {
        if (this._overlay) return;
        this._overlay = $N("div", {
            className: "overlay"
        });
        if (this._semi_modal) Event.listen(this._obj, "click", function(a) {
            if (!DOM.contains(this._popup, event.getTarget())) this.hide();
        }.bind(this));
        if (ua.ie() < 7) this._overlay.style.height = Vector2.getDocumentDimensions().y + "px";
        this._obj.insertBefore(this._overlay, this._obj.firstChild);
    },
    resetDialogPosition: function() {
        if (!this._popup) return;
        this._resetDialogObj();
        this._updateShim();
    },
    _resetDialogObj: function() {
        var a = DOM.find(this._popup, "div.pop_content");
        var b = Vector2.getElementDimensions(a).y + 2 * Dialog._HALO_WIDTH;
        var g = Vector2.getViewportDimensions().y - 2 * Dialog._PAGE_MARGIN;
        var f = this._top;
        var e = Vector2.getScrollPosition().y;
        var c = g - b;
        if (c < 0) {
            f = Dialog._PAGE_MARGIN;
        } else if (f > c) f = Dialog._PAGE_MARGIN + Math.max(c, 0) / 2;
        if (!this._fixed) f += e;
        CSS.conditionClass(this._obj, "generic_dialog_fixed", this._fixed);
        var d = this._fixed && c < 0;
        CSS.conditionClass(this._obj, "generic_dialog_fixed_overflow", d);
        CSS.conditionClass(document.body, "generic_dialog_overflow_mode", d);
        CSS.setStyle(this._popup, "top", f + "px");
        if (this._fixed && f - Vector2.getElementPosition(this._popup, "viewport").y > 1) {
            f += e;
            CSS.setStyle(this._popup, "top", f + "px");
        }
    },
    _fadeOut: function(b) {
        if (!this._popup) return;
        try {
            animation(this._obj).duration(0).checkpoint().to("opacity", 0).hide().duration(250).ondone(this._hide.bind(this, b)).go();
        } catch (a) {
            this._hide(b);
        }
    },
    _hide: function(d) {
        if (this._obj) this._obj.style.display = "none";
        this._updateShim();
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        if (this._hidden_objects.length) {
            for (var b = 0, c = this._hidden_objects.length; b < c; b++) this._hidden_objects[b].style.visibility = "";
            this._hidden_objects = [];
        }
        clearInterval(this.active_hiding);
        if (this._bottom) {
            var a = Dialog._bottoms;
            a.splice(a.indexOf(this._bottom), 1);
            Dialog._updateMaxBottom();
        }
        if (this._previous_focus && document.activeElement && DOM.contains(this._obj, document.activeElement)) this._previous_focus.focus();
        if (d) return;
        this.destroy();
    },
    destroy: function() {
        if (Dialog._stack.length) {
            var b = Dialog._stack;
            for (var a = b.length - 1; a >= 0; a--) if (b[a] == this) {
                b.splice(a, 1);
                break;
            }
            if (b.length) b[b.length - 1]._showDialog();
        }
        if (this._obj) {
            DOM.remove(this._obj);
            this._obj = null;
            this._shim && this._shim.hide();
            this._shim = null;
        }
        if (this._close_handler) this._close_handler({
            return_data: this._return_data
        });
    },
    _handleButton: function(a) {
        if (typeof a == "string") a = Dialog._findButton(this._buttons, a);
        var b = Dialog.call_or_eval(a, a.handler);
        if (b === false) return;
        if (a.name == "cancel") {
            this.cancel();
        } else if (Dialog.call_or_eval(this, this._handler, {
            button: a
        }) !== false) this.hide();
    },
    _submitForm: function(d, e, b) {
        var c = this.getFormData();
        if (b) c[b.name] = b.label;
        if (this._extra_data) copy_properties(c, this._extra_data);
        var a = (new AsyncRequest).setURI(e).setData(c).setMethod(d).setNectarModuleDataSafe(this._causal_elem).setReadOnly(d == "GET");
        this.setAsync(a);
        return false;
    },
    _setFromModel: function(c) {
        var a = {};
        copy_properties(a, c);
        if (a.immediateRendering) {
            this.setImmediateRendering(a.immediateRendering);
            delete a.immediateRendering;
        }
        for (var d in a) {
            if (d == "onloadRegister") {
                this.onloadRegister(a[d]);
                continue;
            }
            var b = this["set" + d.substr(0, 1).toUpperCase() + d.substr(1)];
            b.apply(this, $A(a[d]));
        }
    },
    _updateBottom: function() {
        var a = Vector2.getElementDimensions(this._content).y + Vector2.getElementPosition(this._content).y;
        Dialog._bottoms[Dialog._bottoms.length - 1] = a;
        Dialog._updateMaxBottom();
    }
});

function AsyncRequest(uri) {
    var dispatchResponse = bind(this, function(asyncResponse) {
        try {
            this.clearStatusIndicator();
            if (!this.isRelevant()) {
                invokeErrorHandler(1010);
                return;
            }
            if (this.initialHandler(asyncResponse) !== false) {
                clearTimeout(this.timer);
                asyncResponse.jscc && invoke_callbacks([ asyncResponse.jscc ]);
                if (this.handler) try {
                    var suppress_onload = this.handler(asyncResponse);
                } catch (exception) {
                    asyncResponse.is_last && this.finallyHandler(asyncResponse);
                    throw exception;
                }
                if (suppress_onload !== AsyncRequest.suppressOnloadToken) {
                    var onload = asyncResponse.onload;
                    if (onload) for (var ii = 0; ii < onload.length; ii++) try {
                        (new Function(onload[ii])).apply(this);
                    } catch (exception) {}
                    if (this.lid && !asyncResponse.isReplay()) Arbiter.inform("tti_ajax", {
                        s: this.lid,
                        d: [ this._sendTimeStamp || 0, this._sendTimeStamp && this._responseTime ? this._responseTime - this._sendTimeStamp : 0 ]
                    }, Arbiter.BEHAVIOR_EVENT);
                    var onafterload = asyncResponse.onafterload;
                    if (onafterload) for (var ii = 0; ii < onafterload.length; ii++) try {
                        (new Function(onafterload[ii])).apply(this);
                    } catch (exception) {}
                }
                asyncResponse.is_last && this.finallyHandler(asyncResponse);
                var invalidate_cache = asyncResponse.invalidate_cache;
                if (!this.getOption("suppressCacheInvalidation") && invalidate_cache && invalidate_cache.length) Arbiter.inform(Arbiter.PAGECACHE_INVALIDATE, invalidate_cache);
            }
            if (asyncResponse.cacheObservation && typeof TabConsoleCacheobserver != "undefined" && TabConsoleCacheobserver.instance) TabConsoleCacheobserver.getInstance().addAsyncObservation(asyncResponse.cacheObservation);
        } catch (exception) {}
    });
    var replayResponses = bind(this, function() {
        if (is_empty(this._asyncResponses)) return;
        this.setNewSerial();
        for (var ii = 0; ii < this._asyncResponses.length; ++ii) {
            var r = this._asyncResponses[ii];
            invokeResponseHandler(r, true);
        }
    });
    var dispatchErrorResponse = bind(this, function(asyncResponse, isTransport) {
        try {
            this.clearStatusIndicator();
            var async_error = asyncResponse.getError();
            if (this._sendTimeStamp) {
                var _duration = +(new Date) - this._sendTimeStamp;
                var xfb_ip = this._xFbServer || "-";
                asyncResponse.logError("async_error", _duration + ":" + xfb_ip);
            } else asyncResponse.logError("async_error");
            if (!this.isRelevant() || async_error === 1010) return;
            if (async_error == 1357008 || async_error == 1357007 || async_error == 1442002 || async_error == 1357001) {
                var is_confirmation = false;
                if (async_error == 1357008 || async_error == 1357007) is_confirmation = true;
                var payload = asyncResponse.getPayload();
                this._displayServerDialog(payload.__dialog, is_confirmation);
            } else if (this.initialHandler(asyncResponse) !== false) {
                clearTimeout(this.timer);
                try {
                    if (isTransport) {
                        this.transportErrorHandler(asyncResponse);
                    } else this.errorHandler(asyncResponse);
                } catch (exception) {
                    this.finallyHandler(asyncResponse);
                    throw exception;
                }
                this.finallyHandler(asyncResponse);
            }
        } catch (exception) {}
    });
    var _interpretTransportResponse = bind(this, function() {
        if (this.getOption("suppressEvaluation")) {
            var r = new AsyncResponse(this, this.transport);
            return {
                asyncResponse: r
            };
        }
        var _sendError = function(p, error_code, str) {
            if (!window.send_error_signal) return;
            if (this._xFbServer) {
                error_code = "1008_" + error_code;
            } else error_code = "1012_" + error_code;
            send_error_signal("async_xport_resp", error_code + ":" + (this._xFbServer || "-") + ":" + p.getURI() + ":" + str.length + ":" + str.substr(0, 1600));
        };
        var shield = "for (;;);";
        var shieldlen = shield.length;
        var text = this.transport.responseText;
        if (text.length <= shieldlen) {
            _sendError(this, "empty", text);
            return {
                transportError: "Response too short on async to " + this.getURI()
            };
        }
        var offset = 0;
        while (text.charAt(offset) == " " || text.charAt(offset) == "\n") offset++;
        offset && text.substring(offset, offset + shieldlen) == shield;
        var safeResponse = text.substring(offset + shieldlen);
        try {
            var response = eval("(" + safeResponse + ")");
        } catch (exception) {
            _sendError(this, "excep", text);
            return {
                transportError: "eval() failed on async to " + this.getURI()
            };
        }
        return interpretResponse(response);
    });
    var interpretResponse = bind(this, function(response) {
        if (response.redirect) return {
            redirect: response.redirect
        };
        var r = new AsyncResponse(this);
        if (response.__ar != 1) {
            r.payload = response;
        } else {
            copy_properties(r, response);
            if (response.tplts) if (window.DynaTemplate) DynaTemplate.registerTemplates(response.tplts);
        }
        return {
            asyncResponse: r
        };
    });
    var invokeResponseHandler = bind(this, function(interp, is_replay) {
        if (typeof interp.redirect != "undefined") {
            (function() {
                this.setURI(interp.redirect).send();
            }).bind(this).defer();
            return;
        }
        if (this.handler || this.errorHandler || this.transportErrorHandler) if (typeof interp.asyncResponse != "undefined") {
            var r = interp.asyncResponse;
            r.setReplay(!!is_replay);
            if (!this.isRelevant()) {
                invokeErrorHandler(1010);
                return;
            }
            if (r.inlinejs) eval_global(r.inlinejs);
            if (r.lid) {
                this._responseTime = +(new Date);
                if (window.CavalryLogger) this.cavalry = CavalryLogger.getInstance(r.lid);
                this.lid = r.lid;
            }
            if (r.getError() && !r.getErrorIsWarning()) {
                var fn = dispatchErrorResponse;
            } else {
                var fn = dispatchResponse;
                if (this._replayable && !is_replay && !r.dontReplay) {
                    this._asyncResponses = this._asyncResponses || [];
                    this._asyncResponses.push(interp);
                }
            }
            Bootloader.setResourceMap(r.resource_map);
            if (r.bootloadable) Bootloader.enableBootload(r.bootloadable);
            fn = fn.shield(null, r);
            fn = fn.defer.bind(fn);
            var is_transitional = false;
            if (this.preBootloadHandler) is_transitional = this.preBootloadHandler(r);
            r.css = r.css || [];
            r.js = r.js || [];
            Bootloader.loadResources(r.css.concat(r.js), fn, is_transitional, this.getURI());
        } else if (typeof interp.transportError != "undefined") {
            if (this._xFbServer) {
                invokeErrorHandler(1008);
            } else invokeErrorHandler(1012);
        } else invokeErrorHandler(1007);
    });
    var invokeErrorHandler = bind(this, function(explicitError) {
        try {
            if (!window.loaded && !this.getOption("handleErrorAfterUnload")) return;
        } catch (ex) {
            return;
        }
        var r = new AsyncResponse(this);
        var err;
        try {
            err = explicitError || this.transport.status || 1004;
        } catch (ex) {
            err = 1005;
        }
        if (this._requestAborted) err = 1011;
        try {
            if (this.responseText == "") err = 1002;
        } catch (ignore) {}
        if (this.transportErrorHandler) {
            var desc, summary;
            var silent = true;
            if (false === navigator.onLine) {
                summary = _tx("Pas de connexion réseau");
                desc = _tx("Votre navigateur semble déconnecté. Veuillez vérifier votre connexion internet et recommencer.");
                err = 1006;
            } else if (err >= 300 && err <= 399) {
                summary = _tx("Redirection");
                desc = _tx("Votre accès à Facebook vient d’être redirigé ou bloqué par un tiers. Veuillez contacter votre fournisseur d’accès ou réactualisez la page.");
                redir_url = this.transport.getResponseHeader("Location");
                if (redir_url) goURI(redir_url, true);
                silent = true;
            } else {
                summary = _tx("Oups !");
                desc = _tx("Une erreur s'est produite. Nous tentons de la résoudre dans les plus brefs délais. Vous pourrez bientôt réessayer.");
            }
            !this.getOption("suppressErrorAlerts");
            copy_properties(r, {
                error: err,
                errorSummary: summary,
                errorDescription: desc,
                silentError: silent
            });
            dispatchErrorResponse(r, true);
        }
    });
    var handleResponse = function(response) {
        var asyncResponse = this.interpretResponse(response);
        this.invokeResponseHandler(asyncResponse);
    };
    var onStateChange = function() {
        try {
            if (this.transport.readyState == 4) {
                AsyncRequest._inflightPurge();
                try {
                    if (typeof this.transport.getResponseHeader != "undefined" && this.transport.getResponseHeader("X-FB-Server")) this._xFbServer = this.transport.getResponseHeader("X-FB-Server");
                } catch (ex) {}
                if (this.transport.status >= 200 && this.transport.status < 300) {
                    invokeResponseHandler(_interpretTransportResponse());
                } else if (ua.safari() && typeof this.transport.status == "undefined") {
                    invokeErrorHandler(1002);
                } else if (window.Env && window.Env.retry_ajax_on_network_error && this.transport.status in {
                    0: 1,
                    12029: 1,
                    12030: 1,
                    12031: 1,
                    12152: 1
                } && this.remainingRetries > 0) {
                    --this.remainingRetries;
                    delete this.transport;
                    this.send(true);
                    return;
                } else invokeErrorHandler();
                if (this.getOption("asynchronous") !== false) delete this.transport;
            }
        } catch (exception) {
            try {
                if (!window.loaded) return;
            } catch (ex) {
                return;
            }
            delete this.transport;
            if (this.remainingRetries > 0) {
                --this.remainingRetries;
                this.send(true);
            } else {
                !this.getOption("suppressErrorAlerts");
                if (window.send_error_signal) send_error_signal("async_xport_resp", "1007:" + (this._xFbServer || "-") + ":" + this.getURI() + ":" + exception.message);
                invokeErrorHandler(1007);
            }
        }
    };
    var onJSONPResponse = function(data, more_chunked_response) {
        var is_first = this.is_first === undefined;
        this.is_first = is_first;
        if (this.transportIframe && !more_chunked_response) {
            if (this.cavalry) this.cavalry.collectBrowserTiming(this.transportIframe.contentWindow);
            (function(x) {
                document.body.removeChild(x);
            }).bind(null, this.transportIframe).defer();
        }
        if (ua.ie() >= 9 && window.JSON) data = window.JSON.parse(window.JSON.stringify(data));
        var r = this.interpretResponse(data);
        r.asyncResponse.is_first = is_first;
        r.asyncResponse.is_last = !more_chunked_response;
        this.invokeResponseHandler(r);
        return more_chunked_response;
    };
    copy_properties(this, {
        onstatechange: onStateChange,
        onjsonpresponse: onJSONPResponse,
        replayResponses: replayResponses,
        invokeResponseHandler: invokeResponseHandler,
        interpretResponse: interpretResponse,
        handleResponse: handleResponse,
        transport: null,
        method: "POST",
        uri: "",
        timeout: null,
        timer: null,
        initialHandler: bagofholding,
        handler: null,
        errorHandler: null,
        transportErrorHandler: null,
        timeoutHandler: null,
        finallyHandler: bagofholding,
        serverDialogCancelHandler: bagofholding,
        relativeTo: null,
        statusElement: null,
        statusClass: "",
        data: {},
        context: {},
        readOnly: false,
        writeRequiredParams: [ "post_form_id" ],
        remainingRetries: 0,
        option: {
            asynchronous: true,
            suppressCacheInvalidation: false,
            suppressErrorHandlerWarning: false,
            suppressEvaluation: false,
            suppressErrorAlerts: false,
            retries: 0,
            jsonp: false,
            bundle: false,
            useIframeTransport: false,
            tfbEndpoint: true,
            handleErrorAfterUnload: false
        },
        _replayable: undefined,
        _replayKey: ""
    });
    this.errorHandler = AsyncResponse.defaultErrorHandler;
    this.transportErrorHandler = bind(this, "errorHandler");
    if (uri != undefined) this.setURI(uri);
    return this;
}

Arbiter.subscribe("page_transition", function(b, a) {
    AsyncRequest._id_threshold = a.id;
});

copy_properties(AsyncRequest, {
    receiveJSONPResponse: function(b, a, c) {
        if (this._JSONPReceivers[b]) {
            if (!this._JSONPReceivers[b](a, c)) delete this._JSONPReceivers[b];
        } else if (window.send_error_signal && !c) {
            var d = a.payload && a.payload.uri || "";
            send_error_signal("js_timeout_and_exception", "00002:WrongSessionID:error:" + b + ":" + d);
        }
    },
    _hasBundledRequest: function() {
        return AsyncRequest._allBundledRequests.length > 0;
    },
    stashBundledRequest: function() {
        var a = AsyncRequest._allBundledRequests;
        AsyncRequest._allBundledRequests = [];
        return a;
    },
    setBundledRequestProperties: function(b) {
        var c = null;
        if (b.stashedRequests) AsyncRequest._allBundledRequests = AsyncRequest._allBundledRequests.concat(b.stashedRequests);
        if (!AsyncRequest._hasBundledRequest()) {
            var a = b.callback;
            a && a();
        } else {
            copy_properties(AsyncRequest._bundledRequestProperties, b);
            if (b.start_immediately) c = AsyncRequest._sendBundledRequests();
        }
        return c;
    },
    _bundleRequest: function(b) {
        if (b.getOption("jsonp") || b.getOption("useIframeTransport")) {
            b.setOption("bundle", false);
            return false;
        } else if (!b.uri.isFacebookURI()) {
            b.setOption("bundle", false);
            return false;
        } else if (!b.getOption("asynchronous")) {
            b.setOption("bundle", false);
            return false;
        }
        var a = b.uri.getPath();
        if (!AsyncRequest._bundleTimer) AsyncRequest._bundleTimer = setTimeout(function() {
            AsyncRequest._sendBundledRequests();
        }, 0);
        AsyncRequest._allBundledRequests.push([ a, b ]);
        return true;
    },
    _sendBundledRequests: function() {
        clearTimeout(AsyncRequest._bundleTimer);
        AsyncRequest._bundleTimer = null;
        var a = AsyncRequest._allBundledRequests;
        AsyncRequest._allBundledRequests = [];
        var e = {};
        copy_properties(e, AsyncRequest._bundledRequestProperties);
        AsyncRequest._bundledRequestProperties = {};
        if (is_empty(e) && a.length == 1) {
            var g = a[0][1];
            g.setOption("bundle", false).send();
            return g;
        }
        var d = function() {
            e.callback && e.callback();
        };
        if (a.length === 0) {
            d();
            return null;
        }
        var b = [];
        for (var c = 0; c < a.length; c++) b.push([ a[c][0], URI.implodeQuery(a[c][1].data) ]);
        var f = {
            data: b
        };
        if (e.extra_data) copy_properties(f, e.extra_data);
        var g = new AsyncRequest;
        g.setURI("/ajax/proxy.php").setData(f).setMethod("POST").setInitialHandler(e.onInitialResponse || bagof(true)).setAllowCrossPageTransition(true).setHandler(function(l) {
            var k = l.getPayload();
            var n = k.responses;
            if (n.length != a.length) {
                return;
            } else for (var i = 0; i < a.length; i++) {
                var j = a[i][0];
                var m = a[i][1];
                m.id = this.id;
                if (n[i][0] != j) {
                    m.invokeResponseHandler({
                        transportError: "Wrong response order in bundled request to " + j
                    });
                    continue;
                }
                var h = m.interpretResponse(n[i][1]);
                m.invokeResponseHandler(h);
            }
        }).setTransportErrorHandler(function(m) {
            var k = [];
            var i = {
                transportError: m.errorDescription
            };
            for (var h = 0; h < a.length; h++) {
                var j = a[h][0];
                var l = a[h][1];
                k.push(j);
                l.id = this.id;
                l.invokeResponseHandler(i);
            }
        }).setFinallyHandler(function(h) {
            d();
        }).send();
        return g;
    },
    bootstrap: function(c, b, d) {
        var e = "GET";
        var f = true;
        var a = {};
        if (d || b && b.rel == "async-post") {
            e = "POST";
            f = false;
            if (c) {
                c = URI(c);
                a = c.getQueryData();
                c.setQueryData({});
            }
        }
        var g = Parent.byClass(b, "stat_elem") || b;
        if (g && CSS.hasClass(g, "async_saving")) return false;
        (new AsyncRequest(c)).setReadOnly(f).setMethod(e).setData(a).setNectarModuleDataSafe(b).setStatusElement(g).setRelativeTo(b).send();
        return false;
    },
    post: function(b, a) {
        (new AsyncRequest(b)).setReadOnly(false).setMethod("POST").setData(a).send();
        return false;
    },
    getLastId: function() {
        return AsyncRequest._last_id;
    },
    _JSONPReceivers: {},
    _allBundledRequests: [],
    _bundledRequestProperties: {},
    _bundleTimer: null,
    suppressOnloadToken: {},
    REPLAYABLE_AJAX: "ajax/replayable",
    _last_id: 2,
    _id_threshold: 2,
    _inflight: [],
    _inflightAdd: bagofholding,
    _inflightPurge: bagofholding,
    _inflightEnable: function() {
        if (ua.ie()) {
            copy_properties(AsyncRequest, {
                _inflightAdd: function(a) {
                    this._inflight.push(a);
                },
                _inflightPurge: function() {
                    AsyncRequest._inflight = AsyncRequest._inflight.filter(function(a) {
                        return a.transport && a.transport.readyState < 4;
                    });
                }
            });
            onunloadRegister(function() {
                AsyncRequest._inflight.each(function(a) {
                    if (a.transport && a.transport.readyState < 4) {
                        a.transport.abort();
                        delete a.transport;
                    }
                });
            });
        }
    }
});

copy_properties(AsyncRequest.prototype, {
    setMethod: function(a) {
        this.method = a.toString().toUpperCase();
        return this;
    },
    getMethod: function() {
        return this.method;
    },
    setData: function(a) {
        this.data = a;
        return this;
    },
    getData: function() {
        return this.data;
    },
    setContextData: function(b, c, a) {
        a = a === undefined ? true : a;
        if (a) this.context["_log_" + b] = c;
        return this;
    },
    setURI: function(a) {
        var b = URI(a);
        if (this.getOption("useIframeTransport") && !b.isFacebookURI()) return this;
        if (!this.getOption("jsonp") && !this.getOption("useIframeTransport") && !b.isSameOrigin()) return this;
        if (!a || b.toString() === "") {
            if (window.send_error_signal && window.get_error_stack) {
                send_error_signal("async_error", "1013:-:0:-:" + window.location.href);
                send_error_signal("async_xport_stack", "1013:" + window.location.href + "::" + get_error_stack());
            }
            return this;
        }
        this.uri = b;
        return this;
    },
    getURI: function() {
        return this.uri.toString();
    },
    setInitialHandler: function(a) {
        this.initialHandler = a;
        return this;
    },
    setHandler: function(a) {
        if (!(typeof a != "function")) this.handler = a;
        return this;
    },
    getHandler: function() {
        return this.handler;
    },
    setErrorHandler: function(a) {
        if (!(typeof a != "function")) this.errorHandler = a;
        return this;
    },
    setTransportErrorHandler: function(a) {
        this.transportErrorHandler = a;
        return this;
    },
    getErrorHandler: function() {
        return this.errorHandler;
    },
    getTransportErrorHandler: function() {
        return this.transportErrorHandler;
    },
    setTimeoutHandler: function(b, a) {
        if (!(typeof a != "function")) {
            this.timeout = b;
            this.timeoutHandler = a;
        }
        return this;
    },
    resetTimeout: function(b) {
        if (!(this.timeoutHandler === null)) if (b === null) {
            this.timeout = null;
            clearTimeout(this.timer);
            this.timer = null;
        } else {
            var a = !this._allowCrossPageTransition;
            this.timeout = b;
            clearTimeout(this.timer);
            this.timer = this._handleTimeout.bind(this).defer(this.timeout, a);
        }
        return this;
    },
    _handleTimeout: function() {
        this.abandon();
        this.timeoutHandler(this);
    },
    setNewSerial: function() {
        this.id = ++AsyncRequest._last_id;
        return this;
    },
    setFinallyHandler: function(a) {
        this.finallyHandler = a;
        return this;
    },
    setServerDialogCancelHandler: function(a) {
        this.serverDialogCancelHandler = a;
        return this;
    },
    setPreBootloadHandler: function(a) {
        this.preBootloadHandler = a;
        return this;
    },
    setReadOnly: function(a) {
        if (!(typeof a != "boolean")) this.readOnly = a;
        return this;
    },
    setFBMLForm: function() {
        this.writeRequiredParams = [ "fb_sig" ];
        return this;
    },
    getReadOnly: function() {
        return this.readOnly;
    },
    setRelativeTo: function(a) {
        this.relativeTo = a;
        return this;
    },
    getRelativeTo: function() {
        return this.relativeTo;
    },
    setStatusClass: function(a) {
        this.statusClass = a;
        return this;
    },
    setStatusElement: function(a) {
        this.statusElement = a;
        return this;
    },
    getStatusElement: function() {
        return ge(this.statusElement);
    },
    isRelevant: function() {
        if (this._allowCrossPageTransition) return true;
        if (!this.id) return true;
        return this.id > AsyncRequest._id_threshold;
    },
    clearStatusIndicator: function() {
        var a = this.getStatusElement();
        if (a) {
            CSS.removeClass(a, "async_saving");
            CSS.removeClass(a, this.statusClass);
        }
    },
    addStatusIndicator: function() {
        var a = this.getStatusElement();
        if (a) {
            CSS.addClass(a, "async_saving");
            CSS.addClass(a, this.statusClass);
        }
    },
    specifiesWriteRequiredParams: function() {
        return this.writeRequiredParams.every(function(a) {
            this.data[a] = this.data[a] || Env[a] || (ge(a) || {}).value;
            if (this.data[a] !== undefined) return true;
            return false;
        }, this);
    },
    setReplayable: function(b, a) {
        this._replayable = b;
        this._replayKey = a || "";
        return this;
    },
    setOption: function(a, b) {
        if (typeof this.option[a] != "undefined") this.option[a] = b;
        return this;
    },
    getOption: function(a) {
        typeof this.option[a] == "undefined";
        return this.option[a];
    },
    abort: function() {
        if (this.transport) {
            var a = this.getTransportErrorHandler();
            this.setOption("suppressErrorAlerts", true);
            this.setTransportErrorHandler(bagofholding);
            this._requestAborted = 1;
            this.transport.abort();
            this.setTransportErrorHandler(a);
        }
    },
    abandon: function() {
        clearTimeout(this.timer);
        this.setOption("suppressErrorAlerts", true).setHandler(bagofholding).setErrorHandler(bagofholding).setTransportErrorHandler(bagofholding);
        if (this.transport) {
            this._requestAborted = 1;
            this.transport.abort();
        }
    },
    setNectarData: function(a) {
        if (a) {
            if (this.data.nctr === undefined) this.data.nctr = {};
            copy_properties(this.data.nctr, a);
        }
        return this;
    },
    setNectarModuleDataSafe: function(a) {
        if (this.setNectarModuleData) this.setNectarModuleData(a);
        return this;
    },
    setNectarImpressionIdSafe: function() {
        if (this.setNectarImpressionId) this.setNectarImpressionId();
        return this;
    },
    setAllowCrossPageTransition: function(a) {
        this._allowCrossPageTransition = !!a;
        if (this.timer) this.resetTimeout(this.timeout);
        return this;
    },
    send: function(c) {
        c = c || false;
        if (!this.uri) return false;
        !this.errorHandler && !this.getOption("suppressErrorHandlerWarning");
        if (this.getOption("jsonp") && this.method != "GET") this.setMethod("GET");
        if (this.getOption("useIframeTransport") && this.method != "GET") this.setMethod("GET");
        this.timeoutHandler !== null && (this.getOption("jsonp") || this.getOption("useIframeTransport"));
        if (!this.getReadOnly()) {
            this.specifiesWriteRequiredParams();
            if (this.method != "POST") return false;
        }
        if (this.method == "POST" && this.getOption("tfbEndpoint")) {
            this.data.fb_dtsg = Env.fb_dtsg;
            this.data.lsd = getCookie("lsd");
        }
        this._replayable = !this.getReadOnly() && this._replayable !== false || this._replayable;
        if (this._replayable) Arbiter.inform(AsyncRequest.REPLAYABLE_AJAX, this);
        if (!is_empty(this.context) && this.getOption("tfbEndpoint")) {
            copy_properties(this.data, this.context);
            this.data.ajax_log = 1;
        }
        if (!this.getReadOnly() && this.getOption("tfbEndpoint") && this.method == "POST" && this.data.post_form_id_source === undefined) this.data.post_form_id_source = "AsyncRequest";
        if (window.Env) this.data.__user = Env.user;
        if (this.getOption("bundle") && AsyncRequest._bundleRequest(this)) return true;
        this.setNewSerial();
        if (this.getOption("tfbEndpoint")) {
            this.uri.addQueryData({
                __a: 1
            });
            if (Env.fb_isb) this.uri.addQueryData({
                fb_isb: Env.fb_isb
            });
        }
        this.finallyHandler = async_callback(this.finallyHandler, "final");
        var h, d;
        if (this.method == "GET") {
            h = this.uri.addQueryData(this.data).toString();
            d = "";
        } else {
            h = this.uri.toString();
            d = URI.implodeQuery(this.data);
        }
        if (this.getOption("jsonp") || this.getOption("useIframeTransport")) {
            h = this.uri.addQueryData({
                __a: this.id
            }).toString();
            AsyncRequest._JSONPReceivers[this.id] = async_callback(bind(this, "onjsonpresponse"), "json");
            if (this.getOption("jsonp")) {
                (function() {
                    document.body.appendChild($N("script", {
                        src: h,
                        type: "text/javascript"
                    }));
                }).bind(this).defer();
            } else {
                var e = {
                    position: "absolute",
                    top: "-9999999px",
                    width: "80px",
                    height: "80px"
                };
                this.transportIframe = $N("iframe", {
                    src: "javascript:''",
                    style: e
                });
                document.body.appendChild(this.transportIframe);
                this.transportIframe.src = h;
            }
            return true;
        }
        if (this.transport) return false;
        var g = null;
        try {
            g = new XMLHttpRequest;
        } catch (b) {}
        if (!g) try {
            g = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (b) {}
        if (!g) try {
            g = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (b) {}
        if (!g) return false;
        g.onreadystatechange = async_callback(bind(this, "onstatechange"), "xhr");
        if (!c) this.remainingRetries = this.getOption("retries");
        if (window.send_error_signal || window.ArbiterMonitor) this._sendTimeStamp = this._sendTimeStamp || +(new Date);
        this.transport = g;
        try {
            this.transport.open(this.method, h, this.getOption("asynchronous"));
        } catch (a) {
            return false;
        }
        var f = env_get("svn_rev");
        if (f) this.transport.setRequestHeader("X-SVN-Rev", String(f));
        if (this.method == "POST") this.transport.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        this.addStatusIndicator();
        this.transport.send(d);
        if (this.timeout !== null) this.resetTimeout(this.timeout);
        AsyncRequest._inflightAdd(this);
        return true;
    },
    _displayServerDialog: function(c, b) {
        var a = new Dialog(c);
        if (b) a.setHandler(this._displayConfirmationHandler.bind(this, a));
        a.setCancelHandler(function() {
            this.serverDialogCancelHandler.apply(this, arguments);
            this.finallyHandler.apply(this, arguments);
        }.bind(this)).setCloseHandler(this.finallyHandler.bind(this)).show();
    },
    _displayConfirmationHandler: function(a) {
        this.data.confirmed = 1;
        copy_properties(this.data, a.getFormData());
        this.send();
    }
});

function AsyncResponse(b, a) {
    copy_properties(this, {
        error: 0,
        errorSummary: null,
        errorDescription: null,
        onload: null,
        replay: false,
        payload: a || null,
        request: b || null,
        silentError: false,
        is_last: true
    });
    return this;
}

copy_properties(AsyncResponse, {
    defaultErrorHandler: function(b) {
        try {
            if (!b.silentError) {
                AsyncResponse.verboseErrorHandler(b);
            } else b.logErrorByGroup("silent", 10);
        } catch (a) {
            alert(b);
        }
    },
    verboseErrorHandler: function(b) {
        try {
            var summary = b.getErrorSummary();
            var desc = b.getErrorDescription();
            b.logErrorByGroup("popup", 10);
            if (b.silentError && desc == "") desc = _tx("Une erreur s'est produite. Nous tentons de la résoudre dans les plus brefs délais. Vous pourrez bientôt réessayer.");
            ErrorDialog.show(summary, desc);
        } catch (a) {
            alert(b);
        }
    }
});

copy_properties(AsyncResponse.prototype, {
    getRequest: function() {
        return this.request;
    },
    getPayload: function() {
        return this.payload;
    },
    getError: function() {
        return this.error;
    },
    getErrorSummary: function() {
        return this.errorSummary;
    },
    setErrorSummary: function(a) {
        a = a === undefined ? null : a;
        this.errorSummary = a;
        return this;
    },
    getErrorDescription: function() {
        return this.errorDescription;
    },
    getErrorIsWarning: function() {
        return this.errorIsWarning;
    },
    setReplay: function(a) {
        a = a === undefined ? true : a;
        this.replay = !!a;
        return this;
    },
    isReplay: function() {
        return this.replay;
    },
    logError: function(a, c) {
        if (window.send_error_signal) {
            c = c === undefined ? "" : ":" + c;
            var d = this.request.getURI();
            var b = this.error + ":" + (env_get("vip") || "-") + c + ":" + (d || "-");
            if (d && d.indexOf("scribe_endpoint.php") != -1) a = "async_error_double";
            send_error_signal(a, b);
        }
    },
    logErrorByGroup: function(b, a) {
        if (Math.floor(Math.random() * a) == 0) if (this.error == 1357010 || this.error < 15e3) {
            this.logError("async_error_oops_" + b);
        } else this.logError("async_error_logic_" + b);
    }
});

function UntrustedLink(a, d, b, c) {
    this.dom = a;
    this.url = a.href;
    this.hash = d;
    this.func_get_params = c || function() {
        return {};
    };
    Event.listen(this.dom, "click", this.onclick.bind(this));
    Event.listen(this.dom, "mousedown", this.onmousedown.bind(this));
    Event.listen(this.dom, "mouseup", this.onmouseup.bind(this));
    Event.listen(this.dom, "mouseout", this.onmouseout.bind(this));
    this.onmousedown($E(b));
}

UntrustedLink.bootstrap = function(a, d, b, c) {
    if (a.__untrusted) return;
    a.__untrusted = true;
    new UntrustedLink(a, d, b, c);
};

UntrustedLink.prototype.getRewrittenURI = function() {
    var a = copy_properties({
        u: this.url,
        h: this.hash
    }, this.func_get_params(this.dom));
    var b = new URI("/l.php");
    return b.setQueryData(a).setSubdomain("www").setProtocol("http");
};

UntrustedLink.prototype.onclick = function() {
    (function() {
        this.dom.href = this.url;
    }).bind(this).defer(100);
    this.dom.href = this.getRewrittenURI();
};

UntrustedLink.prototype.onmousedown = function(a) {
    if (a.button == 2) this.dom.href = this.getRewrittenURI();
};

UntrustedLink.prototype.onmouseup = function() {
    this.dom.href = this.getRewrittenURI();
};

UntrustedLink.prototype.onmouseout = function() {
    this.dom.href = this.url;
};

onloadRegister(function() {
    copy_properties(AsyncRequest.prototype, {
        setNectarModuleData: function(c) {
            if (this.method == "POST") {
                var d = Env.module;
                if (c && d === undefined) {
                    var b = {
                        fbpage_fan_confirm: 1
                    };
                    var e = null;
                    for (var a = c; a && a != document.body; a = a.parentNode) {
                        if (!a.id || typeof a.id !== "string") continue;
                        if (a.id.startsWith("pagelet_")) {
                            d = a.id;
                            break;
                        }
                        if (!e && b[a.id]) e = a.id;
                    }
                    if (d === undefined && e) d = e;
                }
                if (d !== undefined) {
                    if (this.data.nctr === undefined) this.data.nctr = {};
                    this.data.nctr._mod = d;
                }
            }
        },
        setNectarImpressionId: function() {
            if (this.method == "POST") {
                var a = env_get("impid");
                if (a !== undefined) {
                    if (this.data.nctr === undefined) this.data.nctr = {};
                    this.data.nctr._impid = a;
                }
            }
        }
    });
});

if (window == window.top) !function() {
    var a = function() {
        var b = 0;
        return function() {
            if (!b) {
                b = 1;
                setTimeout(function() {
                    b = 0;
                    var c = Vector2.getViewportDimensions();
                    setCookie("wd", c.x + "x" + c.y);
                    if (window.AsyncSignal && Math.random() < .01) (new AsyncSignal("/ajax/dimension_context.php", {
                        x: c.x,
                        y: c.y
                    })).send();
                }, 100);
            }
        };
    }();
    onloadRegister(a);
    onloadRegister(function() {
        Event.listen(window, "resize", a);
    });
    onloadRegister(function() {
        Event.listen(window, "focus", a);
    });
}();

onloadRegister(function() {
    Event.listen(document.documentElement, "keyup", function(event) {
        var c = event.getTarget();
        if (!DOM.isNode(c, [ "input", "textarea" ])) return;
        if (DOM.isNode(c, [ "input" ]) && c.type == "password") return;
        if (c.getAttribute("data-prevent-auto-flip")) return;
        var f = Input.getValue(c);
        var b = c.style && c.style.direction;
        if (!b) {
            for (var d = 0; d < f.length; d++) {
                var a = f.charCodeAt(d);
                if (a >= 48) {
                    var e = a >= 1470 && a <= 1920;
                    CSS.setStyle(c, "direction", e ? "rtl" : "ltr");
                    return;
                }
            }
        } else if (f.length === 0) CSS.setStyle(c, "direction", "");
    });
});

onloadRegister(function() {
    Event.listen(document.documentElement, "submit", function(b) {
        var a = b.getTarget().getElementsByTagName("*");
        for (var c = 0; c < a.length; c++) if (a[c].getAttribute("placeholder") && Input.isEmpty(a[c])) Input.setValue(a[c], "");
    });
});

window.__UIControllerRegistry = window.__UIControllerRegistry || {};