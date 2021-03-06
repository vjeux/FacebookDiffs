if (window.CavalryLogger) {
    CavalryLogger.start_js([ "ZOAqd" ]);
}

if (!this.JSON) this.JSON = function() {
    function f(n) {
        return n < 10 ? "0" + n : n;
    }
    Date.prototype.toJSON = function() {
        return this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z";
    };
    var m = {
        "\b": "\\b",
        "\t": "\\t",
        "\n": "\\n",
        "\f": "\\f",
        "\r": "\\r",
        '"': '\\"',
        "\\": "\\\\"
    };
    function stringify(value, whitelist) {
        var a, i, k, l, v;
        switch (typeof value) {
          case "string":
            return (new RegExp('[ -\\\\"]')).test(value) ? '"' + value.replace(/[\x00-\x1f\\"]/g, function(a) {
                var c = m[a];
                if (c) return c;
                c = a.charCodeAt();
                return "\\u00" + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
            }) + '"' : '"' + value + '"';
          case "number":
            return isFinite(value) ? String(value) : "null";
          case "boolean":
            return String(value);
          case "null":
            return "null";
          case "object":
            if (!value) return "null";
            if ("nodeName" in value) return null;
            if (typeof value.toJSON === "function") return stringify(value.toJSON());
            a = [];
            if (typeof value.length === "number" && !propertyIsEnumerable(value, "length")) {
                l = value.length;
                for (i = 0; i < l; i += 1) a.push(stringify(value[i], whitelist) || "null");
                return "[" + a.join(",") + "]";
            }
            if (whitelist) {
                l = whitelist.length;
                for (i = 0; i < l; i += 1) {
                    k = whitelist[i];
                    if (typeof k === "string") {
                        v = stringify(value[k], whitelist);
                        if (v) a.push(stringify(k) + ":" + v);
                    }
                }
            } else for (k in value) if (typeof k === "string") {
                v = stringify(value[k], whitelist);
                if (v) a.push(stringify(k) + ":" + v);
            }
            return "{" + a.join(",") + "}";
        }
    }
    return {
        stringify: stringify,
        parse: function(text, filter) {
            var j;
            function walk(k, v) {
                var i, n;
                if (v && typeof v === "object") for (i in v) if (Object.prototype.hasOwnProperty.apply(v, [ i ])) {
                    n = walk(i, v[i]);
                    if (n !== undefined) v[i] = n;
                }
                return filter(k, v);
            }
            if (text && /^[\],:{}\s]*$/.test(text.replace(/\\./g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(:?[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
                j = eval("(" + text + ")");
                return typeof filter === "function" ? walk("", j) : j;
            }
            throw new SyntaxError("decodeJSON");
        }
    };
}();

function propertyIsEnumerable(a, b) {
    if (a.propertyIsEnumerable) return a.propertyIsEnumerable(b);
    for (var c in a) if (c == b) return true;
    return false;
}

function EmuController(a, b) {
    this.impression = b;
    this.containerId = a;
    DataStore.set($(a), "emuController", this);
    return this;
}

copy_properties(EmuController, {
    fromContainer: function(a) {
        var b = ge(a);
        if (!b) return null;
        return DataStore.get(b, "emuController");
    },
    getEventClass: function(a) {
        return "emuEvent" + String(a).trim();
    }
});

copy_properties(EmuController.prototype, {
    EVENT_HANDLER_PATH: "/ajax/emu/end.php",
    CLICK: 1,
    FAN: "fad_fan",
    event: function(c, b, d, a) {
        var e = {
            eid: this.impression,
            f: 0,
            ui: this.containerId,
            en: c,
            a: 1
        };
        if (b) e.ed = JSON.stringify(b);
        if (!a) var a = bagofholding;
        var f = (new AsyncRequest).setURI(this.EVENT_HANDLER_PATH).setData(e).setErrorHandler(a);
        if (d) f.setHandler(d);
        f.send();
    },
    redirect: function() {
        var a = {
            eid: this.impression,
            f: 0,
            ui: this.containerId,
            en: this.CLICK,
            a: 0,
            sig: Math.floor(Math.random() * 65535) + 65536
        };
        var b = new URI(this.EVENT_HANDLER_PATH);
        b.setQueryData(a);
        goURI(b);
    }
});

var ShortClickHandlers = {
    EVENT_NAME_CAME_BACK: "cameback",
    onclicked: function(a) {
        if (this.onsite) return;
        if (a.button !== 0 || a.getModifiers().any) return;
        this.click_ts = +(new Date);
        if (this.listeners !== undefined) for (var b in this.listeners) this.listeners[b].remove();
        this.listeners = {
            focus: Event.listen(window, "focus", ShortClickHandlers.oncameback.bind(this))
        };
    },
    oncameback: function(c) {
        var b = +(new Date) - this.click_ts;
        this.listeners[c.type].remove();
        var a = {
            click_ts: this.click_ts,
            length: b,
            trigger: c.type
        };
        this.sendData(ShortClickHandlers.EVENT_NAME_CAME_BACK, a);
    }
};

function EmuTracker(a, c) {
    this.base = EmuController.fromContainer(a);
    !this.base;
    this.onsite = c;
    var b = DOM.scry($(a), "a." + EmuController.getEventClass(EmuTracker.EVENT_CLICK));
    b.each(function(d) {
        Event.listen(d, "click", ShortClickHandlers.onclicked.bind(this));
    }.bind(this));
    return this;
}

copy_properties(EmuTracker, {
    EVENT_CLICK: 1
});

copy_properties(EmuTracker.prototype, {
    sendData: function(b, a) {
        this.base.event(b, a);
    }
});

(function() {
    if (!window.channel) {
        window.channel = {};
    } else if (channel.OK) return;
    var a = "presence/";
    copy_properties(channel, {
        ON_CONNECT: a + "connect",
        ON_IDLE: a + "idle",
        ON_SHUTDOWN: a + "shutdown",
        ON_INVALID_HISTORY: a + "invalid_history",
        ON_CONFIG: a + "config",
        OK: "ok",
        ERROR: "error",
        ERROR_CONN: "error_conn",
        ERROR_MAX: "error_max",
        ERROR_MISSING: "error_missing",
        ERROR_MSG_TYPE: "error_msg_type",
        ERROR_REFRESH: "error_refresh",
        ERROR_SHUTDOWN: "error_shutdown",
        ERROR_DOS: "error_dos",
        HINT_AUTH: "shutdown auth",
        HINT_CONN: "shutdown conn",
        HINT_MAINT: "shutdown maint",
        reason_Unknown: 0,
        reason_AsyncError: 1,
        reason_TooLong: 2,
        reason_Refresh: 3,
        reason_RefreshDelay: 4,
        reason_UIRestart: 5,
        reason_NeedSeq: 6,
        reason_PrevFailed: 7,
        reason_IFrameLoadGiveUp: 8,
        reason_IFrameLoadRetry: 9,
        reason_IFrameLoadRetryWorked: 10,
        reason_PageTransitionRetry: 11,
        reason_IFrameLoadMaxSubdomain: 12,
        reason_NoChannelInfo: 13,
        reason_NoChannelHost: 14,
        reason_ChannelUnknown: 100,
        reason_ChannelNoCUser: 101,
        reason_ChannelInvalidCUser: 102,
        reason_ChannelInvalidChanstr: 103,
        reason_ChannelChDistribTimeout: 104,
        reason_ChannelGetChannelOther: 105,
        reason_ChannelNodeShutdown: 106,
        reason_ChannelTermination: 107,
        reason_ChannelUserMismatch: 108,
        reason_ChannelUserMismatchShady: 109,
        reason_ChannelBadXs: 110,
        reason_ChannelSeqNeg: 111,
        reason_ChannelSeqTooBig: 112,
        reason_ChannelSeqTooSmall: 113,
        reason_ChannelUnexpectedJoin: 114,
        reason_ChannelInvalidXsCookie: 115,
        reason_ChannelRelocate: 116,
        reason_ChannelWrongPartition: 117,
        getArbiterType: function(b) {
            return a + "message:" + b;
        }
    });
})();

(function() {
    if (window.channel_cookie) return;
    window.channel_cookie = {
        subdomainIndex: null,
        init: function() {
            var a = presenceCookieManager.getSubCookie("ch");
            this.retryInterval = presenceCookieManager.getSubCookie("ri") || 0;
            if (!channel.getConfig("nosubdomain")) {
                this.subdomainIndex = 0;
                if (a && a.sub) {
                    for (var b = 0; b < a.sub.length; b++) if (!a.sub[b]) {
                        this.subdomainIndex = b;
                        break;
                    }
                    if (b == a.sub.length) if (b == channel_manager.MAX_SUBDOMAINS && URI().isSecure()) {
                        this.subdomainIndex = null;
                        presence.error("channel: iframe max subdomains reached");
                        channel_manager._sendIframeError(ChannelRebuildReasons.IFrameLoadMaxSubdomain);
                    } else this.subdomainIndex = a.sub.length;
                }
            }
            presenceCookieManager.register("ch", this.getInfo.bind(this));
            var c = function() {
                this._clearSubdomain = true;
                presenceCookieManager.setCheckUserCookie(true);
                presence.doSync(true);
            }.bind(this);
            if (typeof window.onpageshow != "undefined") {
                Event.listen(window, "pagehide", c);
            } else onunloadRegister(c);
        },
        getInfo: function() {
            var b = {};
            var c = channel.getConfig("host");
            var e = channel.getConfig("port");
            if (c) {
                if (null !== this.subdomainIndex) {
                    var a = presenceCookieManager.getSubCookie("ch");
                    var f = a && a.sub ? a.sub : [];
                    var d = f.length;
                    f[this.subdomainIndex] = this._clearSubdomain ? 0 : 1;
                    b.sub = f.map(function(g) {
                        return g ? 1 : 0;
                    });
                }
                b[channel.getConfig("user_channel")] = channel.getConfig("seq", 0);
            }
            b.ri = this.retryInterval;
            return b;
        }
    };
})();

(function() {
    if (!window.channel) {
        window.channel = {};
    } else if (channel.init) return;
    copy_properties(channel, {
        inner: function() {
            return this.manager.transport._iframe.contentWindow.transport;
        },
        _sitevars: {},
        _config: {
            userActive: new Date | 0,
            sessionID: (Math.random() * 2147483648 | 0).toString(16)
        },
        init: function() {
            channel_cookie.init();
            this._config.subdomainIndex = channel_cookie.subdomainIndex;
            this.log = bind(this, "_log", "log");
            this.error = bind(this, "_log", "error");
            this.warn = bind(this, "_log", "warn");
            if (typeof UserActivity != "undefined") UserActivity.subscribe(function() {
                this._config.userActive = (new Date).getTime();
            }.bind(this));
        },
        _log: function(b, c) {
            var d = this.manager && this.manager.transport;
            var a = "channel2:" + (d ? d.logName + ":" : "");
            if (b == "log") {
                return false;
            } else if (b == "warn") {
                return presence.warn(a + c);
            } else if (b == "error") return presence.error(a + c);
        },
        log: function(a) {
            this._log("log", a);
        },
        warn: function(a) {
            this._log("warn", a);
        },
        error: function(a) {
            this._log("error", a);
        },
        configure: function() {
            $A(arguments).each(copy_properties.bind(null, this._config));
            Arbiter.inform(channel.ON_CONFIG, this);
        },
        getConfig: function(b, a) {
            return b in this._config ? this._config[b] : a;
        }
    });
})();

var DOMScroll = {
    getScrollState: function() {
        var d = Vector2.getViewportDimensions();
        var a = Vector2.getDocumentDimensions();
        var b = a.x > d.x;
        var c = a.y > d.y;
        b += 0;
        c += 0;
        return new Vector2(b, c);
    },
    _scrollbarSize: null,
    _initScrollbarSize: function() {
        var a = $N("p");
        a.style.width = "100%";
        a.style.height = "200px";
        var b = $N("div");
        b.style.position = "absolute";
        b.style.top = "0px";
        b.style.left = "0px";
        b.style.visibility = "hidden";
        b.style.width = "200px";
        b.style.height = "150px";
        b.style.overflow = "hidden";
        b.appendChild(a);
        document.body.appendChild(b);
        var c = a.offsetWidth;
        b.style.overflow = "scroll";
        var d = a.offsetWidth;
        if (c == d) d = b.clientWidth;
        document.body.removeChild(b);
        DOMScroll._scrollbarSize = c - d;
        if (DOMScroll._scrollbarSize < 5) DOMScroll._scrollbarSize = 15;
    },
    getScrollbarSize: function() {
        if (DOMScroll._scrollbarSize === null) DOMScroll._initScrollbarSize();
        return DOMScroll._scrollbarSize;
    },
    scrollTo: function(e, a, d, b, c) {
        if (typeof a == "undefined" || a === true) a = 750;
        if (!(e instanceof Vector2)) {
            var f = Vector2.getScrollPosition().x;
            var g = Vector2.getElementPosition($(e)).y;
            g = g - Math.min(0, Math.max(Vector2.getViewportDimensions().y / 3, 100));
            e = new Vector2(f, g, "document");
        }
        if (d) {
            e.y -= Vector2.getViewportDimensions().y / 2;
        } else if (b) {
            e.y -= Vector2.getViewportDimensions().y;
            e.y += b;
        }
        e = e.convertTo("document");
        if (a) {
            Bootloader.loadComponents("animation", function() {
                var h = document.body;
                animation(h).to("scrollTop", e.y).to("scrollLeft", e.x).ease(animation.ease.end).duration(a).ondone(c).go();
            });
        } else if (window.scrollTo) {
            window.scrollTo(e.x, e.y);
            c && c.call(this);
        }
    }
};

function AjaxPipeRequest(b, a) {
    this._uri = b;
    this._query_data = a;
    this._request = new AsyncRequest;
    this._canvas_id = null;
    this._allow_cross_page_transition = true;
    this._replayable = false;
}

copy_properties(AjaxPipeRequest.prototype, {
    setCanvasId: function(a) {
        this._canvas_id = a;
        return this;
    },
    setURI: function(a) {
        this._uri = a;
        return this;
    },
    setData: function(a) {
        this._query_data = a;
        return this;
    },
    getData: function(a) {
        return this._query_data;
    },
    setAllowCrossPageTransition: function(a) {
        this._allow_cross_page_transition = a;
        return this;
    },
    setAppend: function(a) {
        this._append = a;
        return this;
    },
    send: function() {
        this._request.setOption("useIframeTransport", true).setURI(this._uri).setData(copy_properties({
            ajaxpipe: 1
        }, this._query_data)).setPreBootloadHandler(this._preBootloadHandler.bind(this)).setInitialHandler(this._onInitialResponse.bind(this)).setHandler(this._onResponse.bind(this)).setReplayable(this._replayable).setMethod("GET").setReadOnly(true).setAllowCrossPageTransition(this._allow_cross_page_transition);
        AjaxPipeRequest._current_request = this._request;
        this._request.send();
        return this;
    },
    _preBootloadFirstResponse: function(a) {
        return false;
    },
    _fireDomContentCallback: function() {
        this._arbiter.inform("ajaxpipe/domcontent_callback", true, Arbiter.BEHAVIOR_STATE);
    },
    _fireOnloadCallback: function() {
        this._arbiter.inform("ajaxpipe/onload_callback", true, Arbiter.BEHAVIOR_STATE);
    },
    _isRelevant: function(a) {
        return this._request == AjaxPipeRequest._current_request || a.isReplay() || this._jsNonBlock;
    },
    _preBootloadHandler: function(b) {
        var a = b.getPayload();
        if (!a || a.redirect || !this._isRelevant(b)) return false;
        var c = false;
        if (b.is_first) {
            !this._append && AjaxPipeRequest.clearCanvas(this._canvas_id, this._constHeight);
            this._arbiter = new Arbiter;
            c = this._preBootloadFirstResponse(b);
            this.pipe = new BigPipe({
                arbiter: this._arbiter,
                rootNodeID: this._canvas_id,
                lid: this._request.lid,
                rrEnabled: b.payload.roadrunner_enabled,
                isAjax: true,
                domContentCallback: this._fireDomContentCallback.bind(this),
                onloadCallback: this._fireOnloadCallback.bind(this),
                domContentEvt: "ajaxpipe/domcontent_callback",
                onloadEvt: "ajaxpipe/onload_callback",
                isReplay: b.isReplay(),
                jsNonBlock: this._jsNonBlock
            });
        }
        return c;
    },
    _redirect: function(a) {
        return false;
    },
    _versionCheck: function(a) {
        return true;
    },
    _onInitialResponse: function(b) {
        var a = b.getPayload();
        if (!this._isRelevant(b)) return false;
        if (!a) return true;
        if (this._redirect(a) || !this._versionCheck(a)) return false;
        return true;
    },
    _processFirstResponse: function(b) {
        var a = b.getPayload();
        if (ge(this._canvas_id) && a.canvas_class !== null) CSS.setClass(this._canvas_id, a.canvas_class);
    },
    setFirstResponseCallback: function(a) {
        this._firstResponseCallback = a;
        return this;
    },
    setFirstResponseHandler: function(a) {
        this._processFirstResponse = a;
        return this;
    },
    _onResponse: function(b) {
        var a = b.payload;
        if (!this._isRelevant(b)) return AsyncRequest.suppressOnloadToken;
        if (b.is_first) {
            this._processFirstResponse(b);
            this._firstResponseCallback && this._firstResponseCallback();
            a.provides = a.provides || [];
            a.provides.push("uipage_onload");
            if (this._append) a.append = this._canvas_id;
        }
        if (a) {
            if ("content" in a.content && this._canvas_id !== null && this._canvas_id != "content") {
                a.content[this._canvas_id] = a.content.content;
                delete a.content.content;
            }
            this.pipe.onPageletArrive(a);
        }
        if (b.is_last) AjaxPipeRequest.restoreCanvas(this._canvas_id, this._constHeight);
        return AsyncRequest.suppressOnloadToken;
    },
    setNectarModuleDataSafe: function(a) {
        this._request.setNectarModuleDataSafe(a);
        return this;
    },
    setFinallyHandler: function(a) {
        this._request.setFinallyHandler(a);
        return this;
    },
    setErrorHandler: function(a) {
        this._request.setErrorHandler(a);
        return this;
    },
    abort: function() {
        this._request.abort();
        if (AjaxPipeRequest._current_request == this._request) AjaxPipeRequest._current_request = null;
        this._request = null;
        return this;
    },
    setReplayable: function(a) {
        this._replayable = a;
        return this;
    },
    setJSNonBlock: function(a) {
        this._jsNonBlock = a;
        return this;
    },
    setConstHeight: function(a) {
        this._constHeight = a;
        return this;
    },
    getAsyncRequest: function() {
        return this._request;
    }
});

copy_properties(AjaxPipeRequest, {
    clearCanvas: function(a, b) {
        var c = ge(a);
        if (c) {
            if (!b) c.style.minHeight = "600px";
            DOM.empty(c);
        }
    },
    restoreCanvas: function(a, b) {
        var c = ge(a);
        if (c) if (!b) c.style.minHeight = "100px";
    },
    getCurrentRequest: function() {
        return AjaxPipeRequest._current_request;
    },
    setCurrentRequest: function(a) {
        AjaxPipeRequest._current_request = a;
    },
    isActiveOnPage: function(a) {
        return env_get("ajaxpipe_enabled");
    }
});

function ElementController() {
    this.handlers = [ [], [] ];
}

copy_properties(ElementController, {
    ALL: 1,
    TARGETS: 2,
    MODIFIERS: 4,
    BUTTONS: 8
});

ElementController.prototype = {
    initialize: function() {
        this.initialize = bagofholding;
        onloadRegister(this.register.bind(this));
    },
    handle: function(e, event, a) {
        a = a || bagof(true);
        var b = this.handlers[0].concat(this.handlers[1]);
        for (var c = 0, d = b.length; c < d; c++) if (a(b[c].filters, e, event) && b[c].callback(e, event) === false) return event.kill();
    },
    _registerHandler: function(b, a, c, d) {
        this.initialize();
        b[d ? "unshift" : "push"]({
            callback: a,
            filters: c || 0
        });
    },
    registerHandler: function(a, b, c) {
        this._registerHandler(this.handlers[0], a, b, c);
    },
    registerFallbackHandler: function(a, b, c) {
        this._registerHandler(this.handlers[1], a, b, c);
    }
};

var LinkController = new ElementController;

copy_properties(LinkController, {
    key: "LinkControllerHandler",
    register: function() {
        Event.listen(document.documentElement, "mousedown", this.handler.bind(this));
        Event.listen(document.documentElement, "keydown", this.handler.bind(this));
    },
    handler: function(event) {
        var b = Parent.byTag(event.getTarget(), "a");
        var a = b && b.getAttribute("href", 2);
        if (!a || b.rel || !this.usesWebProtocol(a) || DataStore.get(b, this.key)) return;
        DataStore.set(b, this.key, Event.listen(b, "click", function(event) {
            if (a.charAt(a.length - 1) == "#") {
                event.prevent();
                return;
            }
            trackReferrer(b, a);
            this.handle(b, event, this.filter);
        }.bind(this)));
    },
    filter: function(a, b, event) {
        if (a & ElementController.ALL) return true;
        if (!(a & ElementController.TARGETS) && b.target || !(a & ElementController.MODIFIERS) && event.getModifiers().any || !(a & ElementController.BUTTONS) && ua.safari() >= 525 && event.which != 1) return false;
        return true;
    },
    usesWebProtocol: function(a) {
        var b = a.match(/^(\w+):/);
        return !b || b[1].match(/^http/i);
    }
});

var FormController = new ElementController;

copy_properties(FormController, {
    register: function() {
        Event.listen(document.documentElement, "submit", this.handler.bind(this));
    },
    handler: function(event) {
        var a = event.getTarget();
        if ((a.getAttributeNode("rel") || {}).value) return;
        user_action(a, "form", event);
        return this.handle(a, event);
    }
});

var HistoryManager = window.HistoryManager || {
    _IFRAME_BASE_URI: "http://static.ak.facebook.com/common/history_manager.php",
    history: null,
    current: 0,
    fragment: null,
    _setIframeSrcFragment: function(b) {
        b = b.toString();
        var a = HistoryManager.history.length - 1;
        HistoryManager.iframe.src = HistoryManager._IFRAME_BASE_URI + "?|index=" + a + "#" + encodeURIComponent(b);
        return HistoryManager;
    },
    getIframeSrcFragment: function() {
        return decodeURIComponent(URI(HistoryManager.iframe.contentWindow.document.location.href).getFragment());
    },
    nextframe: function(a, b) {
        if (b) {
            HistoryManager._setIframeSrcFragment(a);
            return;
        }
        if (a !== undefined) {
            HistoryManager.iframeQueue.push(a);
        } else {
            HistoryManager.iframeQueue.splice(0, 1);
            HistoryManager.iframeTimeout = null;
            HistoryManager.checkURI();
        }
        if (HistoryManager.iframeQueue.length && !HistoryManager.iframeTimeout) {
            var c = HistoryManager.iframeQueue[0];
            HistoryManager.iframeTimeout = setTimeout(function() {
                HistoryManager._setIframeSrcFragment(c);
            }, 100, false);
        }
    },
    isInitialized: function() {
        return !!HistoryManager._initialized;
    },
    init: function() {
        if (!env_get("ALLOW_TRANSITION_IN_IFRAME") && window != window.top) return;
        if (HistoryManager._initialized) return HistoryManager;
        var b = URI();
        var a = b.getFragment() || "";
        if (a.charAt(0) === "!") {
            a = a.substr(1);
            b.setFragment(a);
        }
        if (URI.getRequestURI(false).getProtocol().toLowerCase() == "https") HistoryManager._IFRAME_BASE_URI = "https://s-static.ak.facebook.com/common/history_manager.php";
        copy_properties(HistoryManager, {
            _initialized: true,
            fragment: a,
            orig_fragment: a,
            history: [ b ],
            callbacks: [],
            lastChanged: (new Date).getTime(),
            canonical: URI("#"),
            fragmentTimeout: null,
            user: 0,
            iframeTimeout: null,
            iframeQueue: [],
            enabled: true,
            debug: bagofholding
        });
        if (window.history && history.pushState) {
            this.lastURI = document.URL;
            window.history.replaceState(this.lastURI, null);
            Event.listen(window, "popstate", function(c) {
                if (c && c.state && HistoryManager.lastURI != c.state) {
                    HistoryManager.lastURI = c.state;
                    HistoryManager.lastChanged = +(new Date);
                    HistoryManager.notify(URI(c.state).getUnqualifiedURI().toString());
                }
            }.bind(HistoryManager));
            if (ua.safari() < 534 || ua.chrome() <= 13) {
                setInterval(HistoryManager.checkURI, 42, false);
                HistoryManager._updateRefererURI(this.lastURI);
            }
            return HistoryManager;
        }
        HistoryManager._updateRefererURI(URI.getRequestURI(false));
        if (ua.safari() < 500 || ua.firefox() < 2) {
            HistoryManager.enabled = false;
            return HistoryManager;
        }
        if (ua.ie() < 8) {
            HistoryManager.iframe = document.createElement("iframe");
            copy_properties(HistoryManager.iframe.style, {
                width: "0",
                height: "0",
                frameborder: "0",
                left: "0",
                top: "0",
                position: "absolute"
            });
            onloadRegister(function() {
                HistoryManager._setIframeSrcFragment(a);
                document.body.insertBefore(HistoryManager.iframe, document.body.firstChild);
            });
        } else if ("onhashchange" in window) {
            Event.listen(window, "hashchange", function() {
                HistoryManager.checkURI.bind(HistoryManager).defer();
            });
        } else setInterval(HistoryManager.checkURI, 42, false);
        return HistoryManager;
    },
    registerURIHandler: function(a) {
        HistoryManager.callbacks.push(a);
        return HistoryManager;
    },
    setCanonicalLocation: function(a) {
        HistoryManager.canonical = URI(a);
        return HistoryManager;
    },
    notify: function(c) {
        if (c == HistoryManager.orig_fragment) c = HistoryManager.canonical.getFragment();
        for (var b = 0; b < HistoryManager.callbacks.length; b++) try {
            if (HistoryManager.callbacks[b](c)) return true;
        } catch (a) {}
        return false;
    },
    checkURI: function() {
        if ((new Date).getTime() - HistoryManager.lastChanged < 400) return;
        if (window.history && history.pushState) {
            var d = URI(document.URL).removeQueryData("ref").toString();
            var c = URI(HistoryManager.lastURI).removeQueryData("ref").toString();
            if (d != c) {
                HistoryManager.lastChanged = +(new Date);
                HistoryManager.lastURI = d;
                if (ua.safari() < 534) HistoryManager._updateRefererURI(d);
                HistoryManager.notify(URI(d).getUnqualifiedURI().toString());
            }
            return;
        }
        if (ua.ie() < 8 && HistoryManager.iframeQueue.length) return;
        if (ua.safari() && window.history.length == 200) {
            if (!HistoryManager.warned) HistoryManager.warned = true;
            return;
        }
        var a = URI().getFragment();
        if (a.charAt(0) == "!") a = a.substr(1);
        if (ua.ie() < 8) a = HistoryManager.getIframeSrcFragment();
        a = a.replace(/%23/g, "#");
        if (a != HistoryManager.fragment.replace(/%23/g, "#")) {
            HistoryManager.debug([ a, " vs ", HistoryManager.fragment, "whl: ", window.history.length, "QHL: ", HistoryManager.history.length ].join(" "));
            for (var b = HistoryManager.history.length - 1; b >= 0; --b) if (HistoryManager.history[b].getFragment().replace(/%23/g, "#") == a) break;
            ++HistoryManager.user;
            if (b >= 0) {
                HistoryManager.go(b - HistoryManager.current);
            } else HistoryManager.go("#" + a);
            --HistoryManager.user;
        }
    },
    _updateRefererURI: function(e) {
        e = e.toString();
        if (e.charAt(0) != "/" && e.indexOf("//") == -1) return;
        var d = new URI(window.location);
        if (d.isFacebookURI()) {
            var a = d.getPath() + window.location.search;
        } else var a = "";
        var c = URI(e).getQualifiedURI().setFragment(a).toString();
        var b = 2048;
        if (c.length > b) c = c.substring(0, b) + "...";
        setCookie("x-referer", c);
    },
    go: function(c, e, f) {
        if (window.history && history.pushState) {
            e || typeof c == "number";
            var h = URI(c).removeQueryData("ref").toString();
            HistoryManager.lastChanged = +(new Date);
            this.lastURI = h;
            if (f) {
                window.history.replaceState(c, null, h);
            } else window.history.pushState(c, null, h);
            if (ua.safari() < 534) HistoryManager._updateRefererURI(c);
            return false;
        }
        HistoryManager.debug("go: " + c);
        if (e === undefined) e = true;
        if (!HistoryManager.enabled) if (!e) return false;
        if (typeof c == "number") {
            if (!c) return false;
            var b = c + HistoryManager.current;
            var d = Math.max(0, Math.min(HistoryManager.history.length - 1, b));
            HistoryManager.current = d;
            b = HistoryManager.history[d].getFragment() || HistoryManager.orig_fragment;
            b = URI(b).removeQueryData("ref").getUnqualifiedURI().toString();
            HistoryManager.fragment = b;
            HistoryManager.lastChanged = (new Date).getTime();
            if (ua.ie() < 8) {
                if (HistoryManager.fragmentTimeout) clearTimeout(HistoryManager.fragmentTimeout);
                HistoryManager._temporary_fragment = b;
                HistoryManager.fragmentTimeout = setTimeout(function() {
                    window.location.hash = "#!" + b;
                    delete HistoryManager._temporary_fragment;
                }, 750, false);
                if (!HistoryManager.user) HistoryManager.nextframe(b, f);
            } else if (!HistoryManager.user) go_or_replace(window.location, window.location.href.split("#")[0] + "#!" + b, f);
            if (e) HistoryManager.notify(b);
            HistoryManager._updateRefererURI(b);
            return false;
        }
        c = URI(c);
        if (c.getDomain() == URI().getDomain()) c = URI("#" + c.getUnqualifiedURI());
        var a = HistoryManager.history[HistoryManager.current].getFragment();
        var g = c.getFragment();
        if (g == a || a == HistoryManager.orig_fragment && g == HistoryManager.canonical.getFragment()) {
            if (e) HistoryManager.notify(g);
            HistoryManager._updateRefererURI(g);
            return false;
        }
        if (f) HistoryManager.current--;
        var i = HistoryManager.history.length - HistoryManager.current - 1;
        HistoryManager.history.splice(HistoryManager.current + 1, i);
        HistoryManager.history.push(URI(c));
        return HistoryManager.go(1, e, f);
    },
    getCurrentFragment: function() {
        var a = HistoryManager._temporary_fragment !== undefined ? HistoryManager._temporary_fragment : URI.getRequestURI(false).getFragment();
        return a == HistoryManager.orig_fragment ? HistoryManager.canonical.getFragment() : a;
    }
};

var PageTransitions = window.PageTransitions || {
    _transition_handlers: [],
    _scroll_positions: {},
    _scroll_locked: false,
    isInitialized: function() {
        return !!PageTransitions._initialized;
    },
    _init: function() {
        if (!env_get("ALLOW_TRANSITION_IN_IFRAME") && window != window.top) return;
        if (PageTransitions._initialized) return PageTransitions;
        PageTransitions._initialized = true;
        var d = URI.getRequestURI(false);
        var a = d.getUnqualifiedURI();
        var e = URI(a).setFragment(null);
        var c = a.getFragment();
        if (c.charAt(0) === "!" && e.toString() === c.substr(1)) a = e;
        copy_properties(PageTransitions, {
            _current_uri: a,
            _most_recent_uri: a,
            _next_uri: a
        });
        var b;
        if (d.getFragment().startsWith("/")) {
            b = d.getFragment();
        } else b = a;
        HistoryManager.init().setCanonicalLocation("#" + b).registerURIHandler(PageTransitions._historyManagerHandler);
        LinkController.registerFallbackHandler(PageTransitions._rewriteHref, LinkController.TARGETS | LinkController.MODIFIERS);
        LinkController.registerFallbackHandler(PageTransitions._onlinkclick);
        FormController.registerFallbackHandler(PageTransitions._onformsubmit);
        Event.listen(window, "scroll", function() {
            if (!PageTransitions._scroll_locked) PageTransitions._scroll_positions[PageTransitions._current_uri] = Vector2.getScrollPosition();
        });
        return PageTransitions;
    },
    registerHandler: function(b, a) {
        PageTransitions._init();
        a = a || 5;
        if (!PageTransitions._transition_handlers[a]) PageTransitions._transition_handlers[a] = [];
        PageTransitions._transition_handlers[a].push(b);
    },
    getCurrentURI: function(a) {
        if (!PageTransitions._current_uri && !a) return new URI(PageTransitions._most_recent_uri);
        return new URI(PageTransitions._current_uri);
    },
    getMostRecentURI: function() {
        return new URI(PageTransitions._most_recent_uri);
    },
    getNextURI: function() {
        return new URI(PageTransitions._next_uri);
    },
    _rewriteHref: function(a) {
        var c = a.getAttribute("href");
        var b = _computeRelativeURI(PageTransitions._most_recent_uri.getQualifiedURI(), c).toString();
        if (c != b) a.setAttribute("href", b);
    },
    _onlinkclick: function(a) {
        _BusyUIManager.lookBusy(a);
        PageTransitions.go(a.getAttribute("href"));
        return false;
    },
    _onformsubmit: function(a) {
        var c = new URI(Form.getAttribute(a, "action") || ""), b = _computeRelativeURI(PageTransitions._most_recent_uri, c);
        a.setAttribute("action", b.toString());
        if ((Form.getAttribute(a, "method") || "GET").toUpperCase() === "GET") {
            PageTransitions.go(b.addQueryData(Form.serialize(a)));
            return false;
        }
    },
    go: function(d, b) {
        var a = (new URI(d)).removeQueryData("quickling").getQualifiedURI();
        var c = a.getUnqualifiedURI();
        delete PageTransitions._scroll_positions[c];
        !b && user_action({
            href: a.toString()
        }, "uri", null, "INDIRECT");
        _BusyUIManager.lookBusy();
        PageTransitions._loadPage(a, function(e) {
            if (e) {
                HistoryManager.go(a.toString(), false, b);
            } else go_or_replace(window.location, a, b);
        });
    },
    _historyManagerHandler: function(a) {
        if (a.charAt(0) != "/") return false;
        user_action({
            href: a
        }, "h", null);
        PageTransitions._loadPage(new URI(a), function(b) {
            if (!b) go_or_replace(window.location, a, true);
        });
        return true;
    },
    _loadPage: function(e, c) {
        if (URI(e).getFragment() && are_equal(URI(e).setFragment(null).getQualifiedURI(), URI(PageTransitions._current_uri).setFragment(null).getQualifiedURI())) {
            PageTransitions._current_uri = PageTransitions._most_recent_uri = e;
            PageTransitions.restoreScrollPosition();
            _BusyUIManager.stopLookingBusy();
            return;
        }
        var d = PageTransitions._scroll_positions[PageTransitions._current_uri];
        PageTransitions._current_uri = null;
        PageTransitions._next_uri = e;
        if (d) DOMScroll.scrollTo(d, false);
        var b = function() {
            PageTransitions._scroll_locked = true;
            var f = PageTransitions._handleTransition(e);
            c && c(f);
        };
        var a = _runHooks("onbeforeleavehooks");
        if (a) {
            _BusyUIManager.stopLookingBusy();
            PageTransitions._warnBeforeLeaving(a, b);
        } else b();
    },
    _handleTransition: function(g) {
        window.onbeforeleavehooks = undefined;
        _BusyUIManager.lookBusy();
        if (!g.isSameOrigin()) return false;
        var f = window.AsyncRequest && AsyncRequest.getLastId();
        Arbiter.inform("pre_page_transition", {
            from: PageTransitions.getMostRecentURI(),
            to: g
        });
        for (var c = PageTransitions._transition_handlers.length - 1; c >= 0; --c) {
            var b = PageTransitions._transition_handlers[c];
            if (!b) continue;
            for (var d = b.length - 1; d >= 0; --d) if (b[d](g) === true) {
                var e = {
                    sender: this,
                    uri: g,
                    id: f
                };
                try {
                    Arbiter.inform("page_transition", e);
                } catch (a) {}
                return true;
            } else b.splice(d, 1);
        }
        return false;
    },
    unifyURI: function() {
        PageTransitions._current_uri = PageTransitions._most_recent_uri = PageTransitions._next_uri;
    },
    transitionComplete: function(a) {
        PageTransitions._executeCompletionCallback();
        _BusyUIManager.stopLookingBusy();
        PageTransitions.unifyURI();
        if (!a) PageTransitions.restoreScrollPosition();
        try {
            if (document.activeElement && document.activeElement.nodeName === "A") document.activeElement.blur();
        } catch (b) {}
    },
    _executeCompletionCallback: function() {
        if (PageTransitions._completionCallback) PageTransitions._completionCallback();
        PageTransitions._completionCallback = null;
    },
    setCompletionCallback: function(a) {
        PageTransitions._completionCallback = a;
    },
    _warnBeforeLeaving: function(b, a) {
        (new Dialog).setTitle(_tx("Souhaitez-vous vraiment quitter cette page ?")).setBody(htmlize(b)).setButtons([ {
            name: "leave_page",
            label: _tx("Quitter cette page"),
            handler: a
        }, {
            name: "continue_editing",
            label: _tx("Rester sur cette page"),
            className: "inputaux"
        } ]).setModal(true).show();
    },
    restoreScrollPosition: function() {
        PageTransitions._scroll_locked = false;
        var c = PageTransitions._current_uri;
        var e = PageTransitions._scroll_positions[c];
        if (e) {
            DOMScroll.scrollTo(e, false);
            return;
        }
        function d(f) {
            return (f || null) && (DOM.scry(document.body, "a[name='" + escape_js_quotes(f) + "']")[0] || ge(f));
        }
        var a = d(URI(c).getFragment());
        if (a) {
            var b = Vector2.getElementPosition(a);
            b.x = 0;
            DOMScroll.scrollTo(b);
        }
    }
};

function _computeRelativeURI(d, b) {
    var e = new URI, c = b;
    d = new URI(d);
    b = new URI(b);
    if (b.getDomain() && !b.isFacebookURI()) return c;
    var f = d;
    var a = [ "Protocol", "Domain", "Port", "Path", "QueryData", "Fragment" ];
    a.forEach(function(h) {
        var g = h == "Path" && f === d;
        if (g) e.setPath(_computeRelativePath(d.getPath(), b.getPath()));
        if (!is_empty(b["get" + h]())) f = b;
        if (!g) e["set" + h](f["get" + h]());
    });
    return e;
}

function _computeRelativePath(b, a) {
    if (!a) return b;
    if (a.charAt(0) == "/") return a;
    var c = b.split("/").slice(0, -1);
    c[0] !== "";
    a.split("/").forEach(function(d) {
        if (!(d == ".")) if (d == "..") {
            if (c.length > 1) c = c.slice(0, -1);
        } else c.push(d);
    });
    return c.join("/");
}

function go_or_replace(a, d, c) {
    var e = new URI(d);
    if (a.pathname == "/" && e.getPath() != "/" && e.isQuicklingEnabled()) {
        var b = a.search ? {} : {
            q: ""
        };
        e = (new URI).setPath("/").setQueryData(b).setFragment(e.getUnqualifiedURI()).toString();
        d = e.toString();
    }
    if (c && !(ua.ie() < 8)) {
        a.replace(d);
    } else if (a.href == d) {
        a.reload();
    } else a.href = d;
}

var _BusyUIManager = window._BusyUIManager || {
    _looking_busy: false,
    _original_cursors: [],
    lookBusy: function(a) {
        if (a) _BusyUIManager._giveProgressCursor(a);
        if (_BusyUIManager._looking_busy) return;
        _BusyUIManager._looking_busy = true;
        _BusyUIManager._giveProgressCursor(document.body);
    },
    stopLookingBusy: function() {
        if (!_BusyUIManager._looking_busy) return;
        _BusyUIManager._looking_busy = false;
        while (_BusyUIManager._original_cursors.length) {
            var c = _BusyUIManager._original_cursors.pop();
            var b = c[0];
            var a = c[1];
            if (b.style) b.style.cursor = a || "";
        }
    },
    _giveProgressCursor: function(a) {
        if (!ua.safari()) {
            _BusyUIManager._original_cursors.push([ a, a.style.cursor ]);
            a.style.cursor = "progress";
        }
    }
};

var NavigationMessage = {
    NAVIGATION_BEGIN: "NavigationMessage/navigationBegin",
    NAVIGATION_SELECT: "NavigationMessage/navigationSelect",
    NAVIGATION_FIRST_RESPONSE: "NavigationMessage/navigationFirstResponse",
    NAVIGATION_COMPLETED: "NavigationMessage/navigationCompleted",
    NAVIGATION_FAILED: "NavigationMessage/navigationFailed",
    NAVIGATION_COUNT_UPDATE: "NavigationMessage/navigationCount",
    NAVIGATION_FAVORITE_UPDATE: "NavigationMessage/navigationFavoriteUpdate",
    NAVIGATION_ITEM_REMOVED: "NavigationMessage/navigationItemRemoved",
    NAVIGATION_ITEM_HIDDEN: "NavigationMessage/navigationItemHidden",
    INTERNAL_LOADING_BEGIN: "NavigationMessage/internalLoadingBegin",
    INTERNAL_LOADING_COMPLETED: "NavigationMessage/internalLoadingCompleted"
};

function AsyncLayout() {}

AsyncLayout.prototype = {
    init: function(b, a, c, d) {
        this.canvas_id = b.id;
        if (a) this.auxiliary_id = a.id;
        if (c) this.header_id = c.id;
        if (d) this.toolbar_id = d.id;
        this.waitingForAux = false;
        PageTransitions.registerHandler(this.catchPageTransition.bind(this));
        this.subscription = Arbiter.subscribe(NavigationMessage.NAVIGATION_BEGIN, this.onNavigate.bind(this));
        return this;
    },
    catchPageTransition: function(a) {
        Arbiter.unsubscribe(this.subscription);
        return false;
    },
    getCanvasID: function(a) {
        return this.customCanvasID ? this.customCanvasID : a.sidecol ? "contentCol" : "contentArea";
    },
    onNavigate: function(c, a) {
        var d = a.useAjaxPipe && AjaxPipeRequest.isActiveOnPage(a.params.endpoint);
        a = a.params;
        if (a.endpoint) {
            if (this.request) {
                this.request.setFinallyHandler(bagofholding);
                this.request.abort();
            }
            if (this.sideRequest) this.sideRequest.abort();
            if (d) {
                this.request = (new AjaxPipeRequest).setURI(a.endpoint).setData(a).setCanvasId(this.getCanvasID(a)).setFinallyHandler(this.finallyHandler.bind(this)).setErrorHandler(this.errorHandler.bind(this)).setFirstResponseCallback(this.firstResponseCallback.bind(this)).send();
            } else {
                a.handled = true;
                this.waitingForAux = a.sidecol;
                var e = !!a.iframe;
                var b = (new AsyncRequest).setOption("useIframeTransport", e).setURI(new URI(a.endpoint)).setReadOnly(true).setMethod("GET").setData(a).setHandler(this.onResponse.bind(this)).setErrorHandler(this.errorHandler.bind(this)).setFinallyHandler(this.finallyHandler.bind(this));
                this.request = b;
                b.send();
            }
        }
    },
    onSideResponse: function(b) {
        var a = b.getPayload();
        if (a && this.auxiliary_id) this.receivedAux(a);
    },
    receivedAux: function(a) {
        !this.waitingForAux;
        this.waitingForAux = false;
        DOM.setContent($(this.auxiliary_id), HTML(a));
    },
    onResponse: function(e) {
        var d = e.getPayload();
        if (d.redirect) {
            goURI(d.redirect);
        } else {
            var c = d.html || d;
            DOM.setContent($(this.canvas_id), HTML(c));
            if (d.side_html && this.auxiliary_id) this.receivedAux(d.side_html);
            if (this.header_id && !d.keep_header) {
                var b = $(this.header_id);
                DOM.setContent(b, HTML(d.header_html || ""));
                CSS.conditionShow(b, d.header_html);
            }
            if (d.toolbar_html && this.toolbar_id) DOM.setContent($(this.toolbar_id), HTML(d.toolbar_html));
            if (d.js) (new Function(d.js))();
            CSS.conditionClass("contentCol", "hasRightCol", this.auxiliary_id && !d.noRightSide);
            var f = ge("rightCol");
            if (f && d.noRightSide) DOM.empty(f);
        }
        var a = e.getRequest().getData();
        Arbiter.inform(NavigationMessage.NAVIGATION_COMPLETED, a.key);
    },
    errorHandler: function(a) {
        AsyncResponse.verboseErrorHandler(a);
        Arbiter.inform(NavigationMessage.NAVIGATION_FAILED);
        this.request = null;
    },
    firstResponseCallback: function(a) {
        Arbiter.inform(NavigationMessage.NAVIGATION_FIRST_RESPONSE);
    },
    finallyHandler: function(a) {
        this.request = null;
        PageTransitions.transitionComplete(true);
        Arbiter.inform(NavigationMessage.NAVIGATION_COMPLETED);
    }
};

function adjustImage(e, g) {
    if (!g) {
        var a = e.parentNode;
        while (a.parentNode && (CSS.getStyle(a, "display") != "block" || a.offsetWidth == 0)) a = a.parentNode;
        g = a.offsetWidth;
    }
    var c = e.offsetWidth;
    if (c == 0) {
        var d = e.nextSibling, f = e.parentNode;
        document.body.appendChild(e);
        c = e.offsetWidth;
        if (d) {
            f.insertBefore(e, d);
        } else f.appendChild(e);
    }
    if (c > g) try {
        if (ua.ie() < 8) {
            var img_div = document.createElement("div");
            img_div.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + e.src.replace('"', "%22") + '", sizingMethod="scale")';
            img_div.style.width = g + "px";
            img_div.style.height = Math.floor(g / e.offsetWidth * e.offsetHeight) + "px";
            if (e.parentNode.tagName == "A") img_div.style.cursor = "pointer";
            e.parentNode.insertBefore(img_div, e);
            e.parentNode.removeChild(e);
        } else throw 1;
    } catch (b) {
        e.style.width = g + "px";
    }
    CSS.removeClass(e, "img_loading");
}

function imageConstrainSize(e, b, c, d) {
    var a = new Image;
    a.onload = function() {
        if (a.width > 0 && a.height > 0) {
            var k = a.width;
            var h = a.height;
            if (k > b || h > c) {
                var g = c / b;
                var f = h / k;
                if (f > g) {
                    k = k * (c / h);
                    h = c;
                } else {
                    h = h * (b / k);
                    k = b;
                }
            }
            var j = ge(d);
            if (j) {
                var i = document.createElement("img");
                i.src = e;
                i.width = k;
                i.height = h;
                j.parentNode.insertBefore(i, j);
                j.parentNode.removeChild(j);
            }
        }
    };
    a.src = e;
}

function image_has_loaded(a) {
    if (a.naturalWidth !== undefined) {
        return a.complete && a.width != 0;
    } else if (a.height == 20 && a.width == 20 && a.complete) {
        return false;
    } else if (a.complete === undefined && ua.safari() < 500) {
        var b = new Image;
        b.src = a.src;
        return b.complete;
    }
    return a.complete;
}

function image_has_failed(a) {
    if (a.complete == null && a.width == 20 && a.height == 20 || a.mimeType != null && a.complete && a.mimeType == "" || a.naturalHeight != null && a.complete && a.naturalHeight == 0) return true;
}

add_properties("Input", {
    getSelection: function(b) {
        if (!document.selection) return {
            start: b.selectionStart,
            end: b.selectionEnd
        };
        var d = document.selection.createRange();
        if (d.parentElement() !== b) return {
            start: 0,
            end: 0
        };
        var c = b.value.length;
        if (b.tagName == "INPUT") {
            return {
                start: -d.moveStart("character", -c),
                end: -d.moveEnd("character", -c)
            };
        } else {
            var e = d.duplicate();
            e.moveToElementText(b);
            e.setEndPoint("StartToEnd", d);
            var a = c - e.text.length;
            e.setEndPoint("StartToStart", d);
            return {
                start: c - e.text.length,
                end: a
            };
        }
    },
    setSelection: function(d, f, c) {
        if (typeof c == "undefined") c = f;
        if (document.selection) {
            if (d.tagName == "TEXTAREA") {
                var a = (d.value.slice(0, f).match(/\r/g) || []).length;
                var b = (d.value.slice(f, c).match(/\r/g) || []).length;
                f -= a;
                c -= a + b;
            }
            var e = d.createTextRange();
            e.collapse(true);
            e.moveStart("character", f);
            e.moveEnd("character", c - f);
            e.select();
        } else {
            d.selectionStart = f;
            d.selectionEnd = Math.min(c, d.value.length);
            Input.focus(d);
        }
    }
});

add_properties("Input", {
    enforceMaxLength: function(c, e) {
        var i = Input.getValue(c);
        var d = i.length;
        var f = d - e;
        if (f > 0) {
            var g;
            var a;
            try {
                g = Input.getSelection(c);
                a = g.end;
            } catch (b) {
                g = null;
                a = 0;
            }
            if (a >= f) d = a;
            var h = d - f;
            if (h && (i.charCodeAt(h - 1) & 64512) === 55296) h--;
            a = Math.min(a, h);
            Input.setValue(c, i.slice(0, h) + i.slice(d));
            if (g) Input.setSelection(c, Math.min(g.start, a), a);
        }
    }
});

onloadRegister(function() {
    function a(event) {
        var b = event.getTarget();
        var c = parseInt(b.getAttribute("maxlength"), 10);
        if (c > 0 && DOM.isNode(b, [ "input", "textarea" ])) Input.enforceMaxLength.bind(Input, b, c).defer();
    }
    Event.listen(document.documentElement, {
        keydown: a,
        paste: a
    });
});

add_properties("Input", {
    setMaxLength: function(a, b) {
        if (b > 0) {
            a.setAttribute("maxlength", b);
            Input.enforceMaxLength(a, b);
        } else a.removeAttribute("maxlength");
    }
});

function TextInputControl(b) {
    this.parent.construct(this, b);
    var a = this.getRoot();
    var c = function() {
        this.update.bind(this).defer();
    }.bind(this);
    Event.listen(a, {
        keydown: c,
        paste: c
    });
}

Class.extend(TextInputControl, "DOMControl");

TextInputControl.prototype = {
    setMaxLength: function(a) {
        Input.setMaxLength(this.getRoot(), a);
        return this;
    },
    getValue: function() {
        return Input.getValue(this.getRoot());
    },
    isEmpty: function() {
        return Input.isEmpty(this.getRoot());
    },
    setValue: function(a) {
        Input.setValue(this.getRoot(), a);
        this.update();
        return this;
    },
    clear: function() {
        return this.setValue("");
    },
    setPlaceholderText: function(a) {
        Input.setPlaceholder(this.getRoot(), a);
        return this;
    }
};

function TextMetrics(a) {
    this._node = a;
    var b = this._shadow = $N("textarea", {
        className: "textMetrics"
    });
    var c = [ "fontSize", "fontStyle", "fontWeight", "fontFamily", "lineHeight", "wordWrap" ];
    c.each(function(d) {
        CSS.setStyle(b, d, CSS.getStyle(a, d));
    });
    document.body.appendChild(b);
}

TextMetrics.prototype = {
    measure: function() {
        var a = this._node;
        var b = this._shadow;
        var c = a.clientWidth - CSS.getStyleFloat(a, "paddingLeft") - CSS.getStyleFloat(a, "paddingRight");
        CSS.setStyle(b, "width", c + "px");
        b.value = a.value + "...";
        return {
            width: b.scrollWidth,
            height: b.scrollHeight
        };
    },
    destroy: function() {
        DOM.remove(this._shadow);
    }
};

function TextAreaControl(a) {
    this.autogrow = false;
    this.parent.construct(this, a);
    this.width = null;
    Event.listen(a, {
        focus: this._handleFocus.bind(this)
    });
}

Class.extend(TextAreaControl, "TextInputControl");

Class.mixin(TextAreaControl, "Arbiter", {
    setAutogrow: function(a) {
        this.autogrow = a;
        return this;
    },
    onupdate: function() {
        this.parent.onupdate();
        if (this.autogrow) {
            var d = this.getRoot();
            if (!this.metrics) this.metrics = new TextMetrics(d);
            if (typeof this.minHeight === "undefined") {
                var c = CSS.getStyleFloat(d, "height");
                this.minHeight = c > 0 ? c : d.offsetHeight - 8;
            }
            if (typeof this.isBorderBox === "undefined") if (CSS.getStyle(d, "box-sizing") == "border-box" || CSS.getStyle(d, "-moz-box-sizing") == "border-box" || CSS.getStyle(d, "-webkit-box-sizing") == "border-box") {
                this.isBorderBox = true;
                this.borderBoxOffset = CSS.getStyleFloat(d, "padding-top") + CSS.getStyleFloat(d, "padding-bottom") + CSS.getStyleFloat(d, "border-top-width") + CSS.getStyleFloat(d, "border-bottom-width");
            } else this.isBorderBox = false;
            var b = this.metrics.measure();
            var a = Math.max(this.minHeight, b.height);
            if (this.isBorderBox) a += this.borderBoxOffset;
            if (a != this.height) {
                CSS.setStyle(d, "height", a + "px");
                this.height = a;
                Arbiter.inform("reflow");
                this.inform("resize");
            }
        } else if (this.metrics) {
            this.metrics.destroy();
            this.metrics = null;
        }
    },
    resetHeight: function() {
        this.height = -1;
        this.update();
    },
    _handleFocus: function() {
        this.width = null;
    }
});

function URLScraper(a) {
    this.input = a;
    this.enable();
}

Class.mixin(URLScraper, "Arbiter", {
    reset: function() {
        this.lastMatch = null;
    },
    enable: function() {
        if (this.events) return;
        var a = function(b) {
            setTimeout(this.check.bind(this, b), 30);
        };
        this.events = Event.listen(this.input, {
            paste: a.bind(this, false),
            keydown: a.bind(this, true)
        });
    },
    disable: function() {
        if (!this.events) return;
        for (var event in this.events) this.events[event].remove();
        this.events = null;
    },
    check: function(b) {
        var c = this.input.value;
        if (b && URLScraper.trigger(c)) return;
        var a = URLScraper.match(c);
        if (a && a != this.lastMatch) {
            this.lastMatch = a;
            this.inform("match", {
                url: a
            });
        }
    }
});

(function() {
    var a = "!\"#%&'()*,-./:;<>?@[\\]^_`{|}", q = " -⁯«»";
    var n = "(?:(?:ht|f)tps?)://", f = "(?:(?:\\d{1,3}[.]){3}\\d{1,3})", r = "(?:\\b)www\\d{0,3}[.]", i = "[^\\s" + a + q + "]", g = "(?:(?:[.:\\-_%@]|" + i + ")*" + i + ")", o = "(?:[.][a-z]{2,4})", m = "(?::\\d+){0,1}", c = "(?=[/?#])";
    var e = "(?:" + "(?:" + n + g + m + ")|" + "(?:" + f + m + ")|" + "(?:" + r + g + o + m + ")|" + "(?:" + g + o + m + c + ")" + ")";
    var d = "[/#?]", b = "\\([^\\s()<>]+\\)", k = "[^\\s()<>" + q + "]+", j = "[^\\s" + a + q + "]";
    var l = "(?:" + "(?:" + d + ")" + "(?:" + "(?:" + b + "|" + k + ")*" + "(?:" + b + "|" + j + ")" + ")*" + ")*";
    var h = new RegExp("(" + "(?:" + e + ")" + "(?:" + l + ")" + ")", "im");
    var p = /[\s'";]/;
    URLScraper.match = function(s) {
        return (h.exec(s) || [])[1] || null;
    };
    URLScraper.trigger = function(s) {
        return !p.test(s.charAt(s.length - 1));
    };
})();

function rand32() {
    return Math.floor(Math.random() * 4294967295);
}

function verifyNumber(a) {
    if (typeof a == "undefined" || isNaN(a) || a == Number.POSITIVE_INFINITY || a == Number.NEGATIVE_INFINITY) a = 0;
    return a;
}

function mod(a, b) {
    var c = a % b;
    if (c * b < 0) c += b;
    return c;
}

function Rect(e, d, a, c, b) {
    if (this === window) {
        if (e instanceof Rect) return e;
        if (e instanceof Vector2) return new Rect(e.y, e.x, e.y, e.x, e.domain);
        return Rect.getElementBounds($(e));
    }
    copy_properties(this, {
        t: e,
        r: d,
        b: a,
        l: c,
        domain: b || "pure"
    });
}

copy_properties(Rect.prototype, {
    w: function() {
        return this.r - this.l;
    },
    h: function() {
        return this.b - this.t;
    },
    toString: function() {
        return "((" + this.l + ", " + this.t + "), (" + this.r + ", " + this.b + "))";
    },
    contains: function(b) {
        b = Rect(b).convertTo(this.domain);
        var a = this;
        return a.l <= b.l && a.r >= b.r && a.t <= b.t && a.b >= b.b;
    },
    add: function(c, d) {
        if (arguments.length == 1) {
            if (c.domain != "pure") c = c.convertTo(this.domain);
            return this.add(c.x, c.y);
        }
        var a = parseFloat(c);
        var b = parseFloat(d);
        return new Rect(this.t + b, this.r + a, this.b + b, this.l + a, this.domain);
    },
    sub: function(a, b) {
        if (arguments.length == 1) {
            return this.add(a.mul(-1));
        } else return this.add(-a, -b);
    },
    boundWithin: function(a) {
        var b = 0, c = 0;
        if (this.l < a.l) {
            b = a.l - this.l;
        } else if (this.r > a.r) b = a.r - this.r;
        if (this.t < a.t) {
            c = a.t - this.t;
        } else if (this.b > a.b) c = a.b - this.b;
        return this.add(b, c);
    },
    getCenter: function() {
        return new Vector2(this.l + this.w() / 2, this.t + this.h() / 2, this.domain);
    },
    pad: function(b, a) {
        return new Rect(b.t - a, b.r + a, b.b + a, b.l - a, b.domain);
    },
    getPositionVector: function() {
        return new Vector2(this.l, this.t, this.domain);
    },
    getDimensionVector: function() {
        return new Vector2(this.w(), this.h(), "pure");
    },
    convertTo: function(a) {
        if (this.domain == a) return this;
        if (a == "pure") return new Rect(this.t, this.r, this.b, this.l, "pure");
        if (this.domain == "pure") return new Rect(0, 0, 0, 0);
        var b = (new Vector2(this.l, this.t, this.domain)).convertTo(a);
        return new Rect(b.y, b.x + this.w(), b.y + this.h(), b.x, a);
    }
});

copy_properties(Rect, {
    deserialize: function(b) {
        var a = b.split(":");
        return new Rect(a[1], a[2], a[3], a[0]);
    },
    newFromVectors: function(b, a) {
        return new Rect(b.y, b.x + a.x, b.y + a.y, b.x, b.domain);
    },
    getElementBounds: function(a) {
        return Rect.newFromVectors(Vector2.getElementPosition(a), Vector2.getElementDimensions(a));
    },
    getViewportBounds: function() {
        return Rect.newFromVectors(Vector2.getScrollPosition(), Vector2.getViewportDimensions());
    },
    minimumBoundingBox: function(d) {
        var a = new Rect(Math.min(), Math.max(), Math.max(), Math.min());
        var c;
        for (var b = 0; b < d.length; b++) {
            c = d[b];
            a.t = Math.min(a.t, c.t);
            a.r = Math.max(a.r, c.r);
            a.b = Math.max(a.b, c.b);
            a.l = Math.min(a.l, c.l);
        }
        return a;
    }
});

function htmlspecialchars(a) {
    if (typeof a == "undefined" || a === null || !a.toString) return "";
    if (a === false) {
        return "0";
    } else if (a === true) return "1";
    return a.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function htmlize(a) {
    return htmlspecialchars(a).replace(/\n/g, "<br />");
}

function escape_js_quotes(a) {
    if (typeof a == "undefined" || !a.toString) return "";
    return a.toString().replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/"/g, "\\x22").replace(/'/g, "\\'").replace(/</g, "\\x3c").replace(/>/g, "\\x3e").replace(/&/g, "\\x26");
}

function html_hyperlink(g, h, i, e) {
    if (typeof g === "undefined" || !g.toString) return "";
    if (typeof h !== "function") h = htmlize;
    if (typeof i !== "function") i = htmlize;
    var g = g.toString();
    var f = [];
    var b;
    while (b = URLScraper.match(g)) {
        var d = g.indexOf(b);
        if (d >= 0) f.push(h(g.substring(0, d)));
        var a = i(b);
        var c = b.replace(/"/g, "%22");
        if (!/^[a-z][a-z0-9\-+.]+:\/\//i.test(b)) c = "http://" + c;
        f.push('<a target="_blank" rel="nofollow" href="' + c + '"');
        if (e) f.push(" onmousedown=\"UntrustedLink.bootstrap(this, '" + Env.lhsh + "', event)\"");
        f.push(">" + a + "</a>");
        g = g.substring(d + b.length);
    }
    g && f.push(h(g));
    return f.join("");
}

function nl2br(a) {
    if (typeof a == "undefined" || !a.toString) return "";
    return a.toString().replace(/\n/g, "<br />");
}

function is_email(a) {
    return /^([\w!.%+\-])+@([\w\-])+(?:\.[\w\-]+)+$/.test(a);
}

add_properties("Hovercard", {
    active: {},
    init: function() {
        if (ua.ie() < 7) return;
        Event.listen(document.documentElement, "mouseover", this.handle.bind(this));
    },
    handle: function(event) {
        var a = Parent.byTag(event.getTarget(), "a");
        if ((a || !this.isShowing) && this.setActive(a)) {
            (this.process || this.bootload).call(this, a);
            event.stop();
        }
    },
    bootload: function(a) {
        this.bootload = bagofholding;
        Bootloader.loadComponents([ "hovercard-core" ], function() {
            if (a == this.active.node) this.process(a);
        }.bind(this));
    },
    getEndpoint: function(a) {
        return a.getAttribute("data-hovercard");
    },
    isActive: function(a) {
        return a && this.isShowing && this.active.node == a;
    },
    getActive: function() {
        return this.isShowing && this.active.node;
    },
    setActive: function(b) {
        if (!this.isActive(b)) {
            var a;
            if (!b || !(a = this.getEndpoint(b))) {
                this.active = {};
                return false;
            }
            if (this.active.node != b) {
                this.active.moveToken && this.active.moveToken.remove();
                this.active = {
                    node: b,
                    endpoint: a,
                    pos: null
                };
            }
        }
        return true;
    }
});

onloadRegister(Hovercard.init.bind(Hovercard));

var DocumentTitle = window.DocumentTitle || function(g) {
    var a = 1500;
    var f = [];
    var e = 0;
    var c = null;
    var d = true;
    function b() {
        if (f.length > 0) {
            if (d) {
                DocumentTitle.set(f[e].title, true);
                e = ++e % f.length;
                d = false;
            } else DocumentTitle.reset();
        } else {
            clearInterval(c);
            c = null;
            DocumentTitle.reset();
        }
    }
    return {
        get: function() {
            return g;
        },
        set: function(h, i) {
            document.title = h;
            if (!i) {
                g = h;
                Arbiter.inform("update_title", h);
            }
        },
        reset: function() {
            DocumentTitle.set(DocumentTitle.get(), true);
            d = true;
        },
        blink: function(i) {
            var h = {
                title: i
            };
            f.push(h);
            if (c === null) c = setInterval(b, a);
            return {
                stop: function() {
                    var j = f.indexOf(h);
                    if (j >= 0) {
                        f.splice(j, 1);
                        if (e > j) e--;
                    }
                }
            };
        }
    };
}(document.title);

function Poller(c, b, a) {
    this._clearOnQuicklingEvent = !a;
    this._requestCallback = b;
    this.setTimePeriod(c);
}

Poller.MIN_TIME_PERIOD = 2e3;

copy_properties(Poller.prototype, {
    stop: function() {
        clearTimeout(this._token);
        this._token = null;
        this._cancelRequest();
    },
    scheduleRequest: function() {
        this.stop();
        if (this._timePeriod) this._token = this._makeRequest.bind(this).defer(this._timePeriod, this._clearOnQuicklingEvent);
    },
    requestNow: function() {
        this.stop();
        this._makeRequest();
    },
    _timePeriod: null,
    setTimePeriod: function(a) {
        a = a || null;
        if (a && (isNaN(a) || a < Poller.MIN_TIME_PERIOD)) return;
        if (a && this._timePeriod == null) this._token = this._makeRequest.bind(this).defer(a, this._clearOnQuicklingEvents);
        this._timePeriod = a;
    },
    _makeRequest: function() {
        this._cancelRequest();
        if (!this._isLoadUser()) return;
        var b = new AsyncRequest;
        var a = true;
        b.setInitialHandler(function() {
            return a;
        });
        this._cancelRequest = function() {
            a = false;
        };
        b.setFinallyHandler(this.scheduleRequest.bind(this));
        b.setInitialHandler = bagofholding;
        b.setFinallyHandler = bagofholding;
        this._requestCallback(b);
        if (a) b.send();
    },
    _isLoadUser: function() {
        return Env.user == getCookie("c_user");
    },
    _cancelRequest: bagofholding,
    getTimePeriod: function() {
        return this._timePeriod;
    }
});

function XHPTemplate(a) {
    this.model = a;
}

XHPTemplate.prototype = {
    render: function() {
        if (HTML.isHTML(this.model)) this.model = DOM.setContent(document.createDocumentFragment(), this.model)[0];
        return this.model.cloneNode(true);
    }
};

(function() {
    var a = "XHPTemplate:nodes";
    copy_properties(XHPTemplate, {
        getNode: function(c, b) {
            return XHPTemplate.getNodes(c)[b];
        },
        getNodes: function(e) {
            var d = DataStore.get(e, a);
            if (!d) {
                d = {};
                var f = DOM.scry(e, "[data-jsid]");
                f.push(e);
                var b = f.length;
                while (b--) {
                    var c = f[b];
                    d[c.getAttribute("data-jsid")] = c;
                    c.removeAttribute("data-jsid");
                }
                DataStore.set(e, a, d);
            }
            return d;
        }
    });
})();

UserActivity = window.UserActivity || {
    SIGNAL: "useractivity/activity",
    _lastActive: +(new Date),
    _listeners: null,
    DEFAULT_IDLE_MS: 5e3,
    EVENT_INTERVAL_MS: 500,
    onActivity: function(event) {
        UserActivity._listeners.forEach(function(a) {
            a.remove();
        });
        UserActivity._listeners = null;
        UserActivity._lastActive = +(new Date);
        setTimeout(UserActivity.listen, UserActivity.EVENT_INTERVAL_MS);
        Arbiter.inform(UserActivity.SIGNAL, event);
    },
    listen: function() {
        if (UserActivity._listeners) return;
        UserActivity._listeners = [ Event.listen(document.body, "mouseover", UserActivity.onActivity), Event.listen(document.body, "keydown", UserActivity.onActivity), Event.listen(document.body, "click", UserActivity.onActivity) ];
    },
    subscribeOnce: function(a) {
        var b = UserActivity.subscribe(function() {
            UserActivity.unsubscribe(b);
            a();
        });
    },
    subscribe: function(a) {
        UserActivity.listen();
        return Arbiter.subscribe(UserActivity.SIGNAL, a, Arbiter.SUBSCRIBE_NEW);
    },
    unsubscribe: function(a) {
        Arbiter.unsubscribe(a);
    },
    isActive: function(a) {
        return new Date - UserActivity._lastActive < (a || UserActivity.DEFAULT_IDLE_MS);
    }
};

onloadRegister(UserActivity.listen);

var Menu = function() {
    var i = "menu:mouseover";
    var a = null;
    function b(k) {
        return Parent.byClass(k, "uiMenu");
    }
    function c(k) {
        return Parent.byClass(k, "uiMenuItem");
    }
    function d(k) {
        if (document.activeElement) {
            var l = c(document.activeElement);
            return k.indexOf(l);
        }
        return -1;
    }
    function e(k) {
        return DOM.find(k, "a.itemAnchor");
    }
    function f(k) {
        return CSS.hasClass(k, "checked");
    }
    function g(k) {
        return !CSS.hasClass(k, "disabled");
    }
    function h(event) {
        var k = document.activeElement;
        if (!k || !Parent.byClass(k, "uiMenu") || !DOM.isNode(k, [ "input", "textarea" ])) {
            var l = c(event.getTarget());
            l && Menu.focusItem(l);
        }
    }
    function j(k) {
        Menu.inform("select", {
            menu: b(k),
            item: k
        });
    }
    onloadRegister(function() {
        var k = {};
        k.click = function(event) {
            var n = c(event.getTarget());
            if (n && g(n)) {
                j(n);
                var l = e(n);
                var m = l.href;
                var o = l.getAttribute("rel");
                return o && o !== "ignore" || m && m.charAt(m.length - 1) !== "#";
            }
        };
        k.keydown = function(event) {
            var u = event.getTarget();
            if (!a || DOM.isNode(u, [ "input", "textarea" ])) return;
            var q = Event.getKeyCode(event);
            switch (q) {
              case KEYS.UP:
              case KEYS.DOWN:
                var m = Menu.getEnabledItems(a);
                var o = d(m);
                Menu.focusItem(m[o + (q === KEYS.UP ? -1 : 1)]);
                return false;
              case KEYS.SPACE:
                var t = c(u);
                if (t) {
                    j(t);
                    event.prevent();
                }
                break;
              default:
                var l = String.fromCharCode(q).toLowerCase();
                var p = Menu.getEnabledItems(a);
                var o = d(p);
                var n = o;
                var r = p.length;
                while (~o && (n = ++n % r) !== o || !~o && ++n < r) {
                    var s = Menu.getItemLabel(p[n]);
                    if (s && s.charAt(0).toLowerCase() === l) {
                        Menu.focusItem(p[n]);
                        return false;
                    }
                }
            }
        };
        Event.listen(document.body, k);
    });
    return copy_properties(new Arbiter, {
        focusItem: function(k) {
            if (k && g(k)) {
                this._removeSelected(b(k));
                CSS.addClass(k, "selected");
                e(k).focus();
            }
        },
        getEnabledItems: function(k) {
            return Menu.getItems(k).filter(g);
        },
        getCheckedItems: function(k) {
            return Menu.getItems(k).filter(f);
        },
        getItems: function(k) {
            return DOM.scry(k, "li.uiMenuItem");
        },
        getItemLabel: function(k) {
            return k.getAttribute("data-label", 2) || "";
        },
        isItemChecked: function(k) {
            return CSS.hasClass(k, "checked");
        },
        register: function(k, l) {
            k = b(k);
            if (!DataStore.get(k, i)) DataStore.set(k, i, Event.listen(k, "mouseover", h));
            if (l !== false) a = k;
        },
        setItemEnabled: function(l, k) {
            if (!k && !DOM.scry(l, "span.disabledAnchor")[0]) DOM.appendContent(l, $N("span", {
                className: DOM.find(l, "a").className + " disabledAnchor"
            }, HTML(e(l).innerHTML)));
            CSS.conditionClass(l, "disabled", !k);
        },
        toggleItem: function(l) {
            var k = !Menu.isItemChecked(l);
            CSS.conditionClass(l, "checked", k);
            e(l).setAttribute("aria-checked", k);
        },
        unregister: function(l) {
            l = b(l);
            var k = DataStore.remove(l, i);
            k && k.remove();
            a = null;
            this._removeSelected(l);
        },
        _removeSelected: function(k) {
            Menu.getItems(k).filter(function(l) {
                return CSS.hasClass(l, "selected");
            }).each(function(l) {
                CSS.removeClass(l, "selected");
            });
        }
    });
}();

function Overlay() {}

!function() {
    var a = null;
    function b(d, e) {
        var c;
        d.subscribe("show", function() {
            c = Event.listen(document.documentElement, "keydown", function(event) {
                if (event.keyCode == KEYS.ESC && (document.activeElement == document.body || DOM.contains(e, document.activeElement))) d.hide();
            });
        });
        d.subscribe("hide", function() {
            c.remove();
            c = null;
        });
    }
    copy_properties(Overlay, {
        getInstance: function(c) {
            var d = Parent.byClass(c, "uiOverlay");
            return d ? DataStore.get(d, "overlay") : null;
        }
    });
    Class.mixin(Overlay, "Arbiter", {
        _root: null,
        _transitionSubscription: null,
        _hideOnSubmit: false,
        _hideOnSuccess: true,
        _fadeOnShow: true,
        _fadeOnHide: true,
        destroyOnHide: true,
        init: function(c) {
            this._transitionSubscription = Arbiter.subscribe("page_transition", this.hide.bind(this, true, false), Arbiter.SUBSCRIBE_NEW);
            this._root = HTML(c).getRootNode();
            this._arrow = DOM.scry(this._root, ".uiOverlayArrow")[0] || null;
            this._overlay = DOM.scry(this._root, "div.uiOverlay")[0] || this._root;
            CSS.hide(this._root);
            DOM.appendContent(document.body, this._root);
            DataStore.set(this._overlay, "overlay", this);
            var d = DataStore.get(this._overlay, "width");
            d && this.setWidth(d);
            this.setHideOnSubmit(DataStore.get(this._overlay, "hideonsubmit") == "true");
            this.setHideOnSuccess(DataStore.get(this._overlay, "hideonsuccess") != "false");
            this.setFadeOnShow(DataStore.get(this._overlay, "fadeonshow") != "false");
            this.setFadeOnHide(DataStore.get(this._overlay, "fadeonhide") != "false");
            this.setHideOnBlur(DataStore.get(this._overlay, "hideonblur") == "true");
            this.setDestroyOnHide(DataStore.get(this._overlay, "destroyonhide") != "false");
            this.setFixed(DataStore.get(this._overlay, "fixed") == "true");
            Event.listen(this._overlay, {
                click: this.click.bind(this),
                submit: this.submit.bind(this),
                mouseenter: this._onMouseEnter.bind(this),
                mouseleave: this._onMouseLeave.bind(this)
            });
            Arbiter.subscribe("Hovercard/show", this._onHovercardShow.bind(this));
            Arbiter.subscribe("Hovercard/hide", this._onHovercardHide.bind(this));
            b(this, this._root);
            return this;
        },
        setHideOnBlur: function(d) {
            var c;
            function g() {
                c && c.remove();
                c = null;
            }
            if (!d && this._hideOnBlurToken) {
                g();
                this.unsubscribe(this._hideOnBlurToken);
                this._hideOnBlurToken = null;
            } else if (d && !this._hideOnBlurToken) {
                var e = this;
                var f = function() {
                    (function() {
                        c = Event.listen(document.documentElement, "click", function(event) {
                            if (!DOM.contains(e._overlay, event.getTarget())) e.setFadeOnHide(false).hide();
                        });
                    }).defer();
                };
                this.subscribe("hide", g);
                this._hideOnBlurToken = this.subscribe("show", f);
                this._shown && f.call(this);
            }
            return this;
        },
        setDestroyOnHide: function(c) {
            this.destroyOnHide = c;
            return this;
        },
        setHideOnSubmit: function(c) {
            this._hideOnSubmit = c;
            return this;
        },
        setHideOnSuccess: function(c) {
            this._hideOnSuccess = c;
            return this;
        },
        setFadeOnShow: function(c) {
            this._fadeOnShow = c;
            return this;
        },
        setFadeOnHide: function(c) {
            this._fadeOnHide = c;
            return this;
        },
        setWidth: function(c) {
            this.width = parseInt(c, 10);
            return this;
        },
        setFixed: function(c) {
            this.fixed = c;
            return this;
        },
        show: function() {
            if (!this._shown) {
                CSS.show(this._root);
                CSS.setStyle(this._overlay, "opacity", 0);
                DOM.appendContent(document.body, this._root);
                this.updatePosition();
                if (this._fadeOnShow !== false) {
                    animation(this._overlay).from("opacity", 0).to("opacity", 1).duration(100).ondone(CSS.setStyle.curry(this._overlay, "opacity", "")).go();
                } else CSS.setStyle(this._overlay, "opacity", "");
                this._shown = true;
                Arbiter.inform("Overlay/show", {
                    overlay: this
                });
                this.inform("show");
            }
            return this;
        },
        updatePosition: function() {
            if (this.width) CSS.setStyle(this._overlay, "width", this.width + "px");
        },
        hide: function() {
            if (!this._shown || this.inform("beforehide") === false) return;
            this._shown = false;
            var c = function() {
                if (this._root) {
                    DOM.remove(this._root);
                    CSS.setStyle(this._overlay, "opacity", "");
                }
                Arbiter.inform("Overlay/hide", {
                    overlay: this
                });
                this.inform("hide");
                this.destroyOnHide && this.destroy();
            }.bind(this);
            if (this._fadeOnHide !== false) {
                animation(this._overlay).from("opacity", 1).to("opacity", 0).duration(250).ondone(c).go();
            } else c();
        },
        destroy: function() {
            Arbiter.unsubscribe(this._transitionSubscription);
            DOM.remove(this._root);
            DataStore.remove(this._root, "overlay");
            this._root = null;
        },
        click: function(d) {
            var e = d.getTarget();
            var c = Parent.byTag(e, "input") || Parent.byTag(e, "button") || Parent.byTag(e, "a");
            if (c) {
                a = c;
                if (CSS.hasClass(c, "uiOverlayCancelButton")) {
                    if (this.inform("cancel") !== false) this.hide();
                    d.prevent();
                }
            }
        },
        submit: function(e) {
            var f = e.getTarget();
            if (this.inform("submit") === false) {
                e.kill();
                return;
            }
            var g = function() {
                if (this.inform("success") !== false && this._hideOnSuccess) this.hide();
            }.bind(this);
            if (Form.getAttribute(f, "rel") === "async") {
                var h = (Form.getAttribute(f, "method") || "GET").toUpperCase();
                var d = Form.serialize(f, a);
                Form.setDisabled(f, true);
                var i = Parent.byClass(a, "stat_elem") || f;
                var c = Form.getAttribute(f, "ajaxify") || Form.getAttribute(f, "action");
                var g = function() {
                    if (this.inform("success") !== false && this._hideOnSuccess) this.hide();
                }.bind(this);
                if (this._hideOnSubmit) {
                    g();
                    g = bagofholding;
                }
                (new AsyncRequest(c)).setData(d).setNectarModuleDataSafe(f).setReadOnly(h == "GET").setMethod(h).setStatusElement(i).setRelativeTo(f).setHandler(g).setErrorHandler(function(j) {
                    if (this.inform("error", {
                        response: j
                    }) !== false) AsyncResponse.defaultErrorHandler(j);
                }.bind(this)).setFinallyHandler(Form.setDisabled.bind(null, f, false)).send();
                e.kill();
            } else g();
        },
        _onMouseEnter: function() {
            this._fireMouseLeaveOnHovercardHide = false;
            if (!this._layerHovercard) this.inform("mouseenter");
        },
        _onMouseLeave: function() {
            if (!this._layerHovercard) this.inform("mouseleave");
            this._fireMouseLeaveOnHovercardHide = !!this._layerHovercard;
        },
        _onHovercardShow: function(c, d) {
            var e = d.hovercard;
            if (DOM.contains(this._root, e.getActive())) this._layerHovercard = e;
        },
        _onHovercardHide: function(c, d) {
            if (this._layerHovercard === d.hovercard) {
                this._layerHovercard = null;
                if (this._fireMouseLeaveOnHovercardHide) this._onMouseLeave();
            }
        }
    });
}();

function ContextualDialogX() {
    this.parent.construct(this);
    return this;
}

Class.extend(ContextualDialogX, "Overlay");

copy_properties(ContextualDialogX, {
    ARROW_INSET: 22,
    VARROW_HEIGHT: 16,
    TOP_MARGIN: 8,
    BOTTOM_MARGIN: 30,
    HALO_WIDTH: 0,
    getInstance: function(b) {
        var a = DataStore.get(b, "ContextualDialogX");
        return a || Overlay.getInstance(b);
    }
});

ContextualDialogX.prototype = {
    _scrollListener: null,
    init: function(c) {
        this.parent.init(c);
        var b = DataStore.get.curry(this._root);
        this.setAlignH(b("alignh", "left"));
        this.setOffsetX(b("offsetx", 0));
        this.setOffsetY(b("offsety", 0));
        this.setPosition(b("position"));
        var a = b("context");
        if (a) {
            this.setContext($(a));
        } else {
            a = b("contextselector");
            if (a) this.setContext(DOM.find(document, a));
        }
        this._content = DOM.scry(this._root, ".uiContextualDialogContent")[0];
        var e = null;
        var d = null;
        this.subscribe("show", function() {
            var f = this.updatePosition.shield(this);
            e = Event.listen(window, "resize", f);
            d = Arbiter.subscribe("reflow", f);
            this._setupScrollListener(this._scrollParent);
        }.bind(this));
        this.subscribe("hide", function() {
            e.remove();
            Arbiter.unsubscribe(d);
            this._teardownScrollListener();
        }.bind(this));
    },
    setAlignH: function(a) {
        this.alignH = a;
        return this;
    },
    getContent: function() {
        return this._content;
    },
    getContext: function() {
        return this.context;
    },
    setContext: function(a) {
        a = $(a);
        if (this.context && this.context != a) DataStore.remove(this.context, "ContextualDialogX");
        this.context = a;
        var b = Parent.byClass(a, "fbPhotoSnowbox");
        if (b) b.appendChild(this._root);
        if (this._scrollListener && this._scrollParent !== b) {
            this._teardownScrollListener();
            this._setupScrollListener(b);
        }
        this._scrollParent = b;
        DataStore.set(this.context, "ContextualDialogX", this);
        return this;
    },
    listen: function(b, a) {
        return Event.listen(this._root, b, a);
    },
    setFixed: function(a) {
        CSS.conditionClass(this._root, "uiContextualDialogFixed", a);
        return this.parent.setFixed(a);
    },
    setOffsetX: function(a) {
        this.offsetX = parseInt(a, 10) || 0;
        return this;
    },
    setOffsetY: function(a) {
        this.offsetY = parseInt(a, 10) || 0;
        return this;
    },
    setPosition: function(a) {
        this.position = a;
        return this;
    },
    updatePosition: function() {
        if (!this.context) return this;
        this.parent.updatePosition();
        var c = this.fixed ? "viewport" : "document";
        var g = Vector2.getElementPosition(this.context, c);
        var h = this._scrollParent;
        if (h) g = g.sub(Vector2.getElementPosition(h, "document")).add(h.scrollLeft, h.scrollTop);
        var a = Vector2.getElementDimensions(this.context);
        var k = this.position == "above" || this.position == "below";
        var d = intl_locale_is_rtl();
        if (d != (this.position == "right")) g = g.add(a.x, 0);
        if (this.position == "below") g = g.add(0, a.y);
        var f = new Vector2(0, 0);
        var b = this.width + 2 * ContextualDialogX.HALO_WIDTH;
        if (k && this.alignH == "center") {
            f = f.add((a.x - b) / 2, 0);
        } else {
            f = f.sub(k ? ContextualDialogX.HALO_WIDTH : 0, k ? 0 : ContextualDialogX.HALO_WIDTH);
            var j = k ? a.x : a.y;
            var e = 2 * (ContextualDialogX.ARROW_INSET + ContextualDialogX.HALO_WIDTH);
            if (j < e) {
                var i = j / 2 - ContextualDialogX.ARROW_INSET;
                f = f.add(k ? i : 0, k ? 0 : i);
            }
        }
        if (k && this.alignH == "right") f = f.mul(-1, 1).add(a.x - b, 0);
        f = f.add(this.offsetX, this.offsetY);
        if (d) f = f.mul(-1, 1);
        g = g.add(f);
        if (this.fixed) g = new Vector2(g.x, g.y, "document");
        g.setElementPosition(this._root);
        this._adjustVerticalPosition();
        return this;
    },
    scrollTo: function() {
        if (this.context) Bootloader.loadComponents("dom-scroll", function() {
            DOMScroll.scrollTo(this.context, true, true);
        }.bind(this));
    },
    destroy: function() {
        this.context && DataStore.remove(this.context, "ContextualDialogX");
        this.parent.destroy();
    },
    _adjustVerticalPosition: function() {
        if (this.position != "left" && this.position != "right") return;
        var c = Vector2.getElementPosition(this._root, "viewport").y;
        var a = Vector2.getElementDimensions(this._overlay).y;
        var e = Vector2.getViewportDimensions().y;
        var d = ContextualDialogX.TOP_MARGIN;
        var b = Math.min(Math.max(0, c + a + ContextualDialogX.BOTTOM_MARGIN - e), Math.max(-d, c - d), a - 2 * ContextualDialogX.ARROW_INSET - 2 * ContextualDialogX.HALO_WIDTH);
        CSS.setStyle(this._overlay, "top", -1 * b + "px");
        CSS.setStyle(this._arrow, "marginTop", b + "px");
    },
    _setupScrollListener: function(a) {
        this._scrollListener = Event.listen(a || window, "scroll", this._adjustVerticalPosition.shield(this));
    },
    _teardownScrollListener: function() {
        this._scrollListener.remove();
        this._scrollListener = null;
    }
};

function Toggler() {
    this.init();
}

(function() {
    var e = [];
    var c;
    function d() {
        d = bagofholding;
        Event.listen(document.documentElement, "click", function(event) {
            var f = event.getTarget();
            e.each(function(g) {
                g.active && !g.sticky && !DOM.contains(g.getActive(), f) && !g.inTargetFlyout(f) && !g.inTargetContextualDialog(f) && g.inActiveDialog() && g.hide();
            });
        }, Event.Priority.URGENT);
    }
    function a(g, f) {
        if (g instanceof Toggler) return g;
        return Toggler.getInstance(f);
    }
    function b(g) {
        var f = DOM.scry(g, 'a[rel="toggle"]');
        if (f.length > 0 && f[0].getAttribute("data-target")) return ge(f[0].getAttribute("data-target"));
    }
    Class.mixin(Toggler, "Arbiter", {
        init: function() {
            this.active = null;
            this.togglers = {};
            this.setSticky(false);
            e.push(this);
            this.subscribe([ "show", "hide" ], Toggler.inform.bind(Toggler));
            d();
        },
        show: function(h) {
            var f = a(this, h);
            var i = f.active;
            if (h !== i) {
                i && f.hide();
                f.active = h;
                CSS.addClass(h, "openToggler");
                var g = DOM.scry(h, 'a[rel="toggle"]');
                if (g.length > 0 && g[0].getAttribute("data-target")) CSS.removeClass(ge(g[0].getAttribute("data-target")), "toggleTargetClosed");
                DOM.appendContent(h, f.getToggler("next"));
                DOM.prependContent(h, f.getToggler("prev"));
                f.inform("show", f);
            }
        },
        hide: function(i) {
            var g = a(this, i);
            var f = g.active;
            if (f && (!i || i === f)) {
                CSS.removeClass(f, "openToggler");
                var h = DOM.scry(f, 'a[rel="toggle"]');
                if (h.length > 0 && h[0].getAttribute("data-target")) CSS.addClass(ge(h[0].getAttribute("data-target")), "toggleTargetClosed");
                values(g.togglers).each(DOM.remove);
                g.inform("hide", g);
                g.active = null;
            }
        },
        toggle: function(g) {
            var f = a(this, g);
            if (f.active === g) {
                f.hide();
            } else f.show(g);
        },
        getActive: function() {
            return a(this).active;
        },
        inTargetFlyout: function(g) {
            var f = b(this.getActive());
            return f && DOM.contains(f, g);
        },
        inTargetContextualDialog: function(i) {
            var h = b(this.getActive());
            var g = ContextualDialogX.getInstance(i);
            var f = g && g.getContext();
            return h && f && DOM.contains(h, f);
        },
        inActiveDialog: function() {
            var f = Dialog.getCurrent();
            return !f || DOM.contains(f.getRoot(), this.getActive());
        },
        getToggler: function(g) {
            var f = a(this);
            if (!f.togglers[g]) f.togglers[g] = $N("button", {
                className: "hideToggler",
                onfocus: function() {
                    var h = DOM.scry(f.active, 'a[rel="toggle"]')[0];
                    h && h.focus();
                    f.hide();
                }
            });
            return this.togglers[g];
        },
        setSticky: function(g) {
            var f = a(this);
            g = g !== false;
            if (g !== f.sticky) {
                f.sticky = g;
                if (g) {
                    f._pt && Arbiter.unsubscribe(f._pt);
                } else f._pt = Arbiter.subscribe("page_transition", f.hide.bind(f, null));
            }
            return f;
        }
    });
    copy_properties(Toggler, Toggler.prototype);
    copy_properties(Toggler, {
        bootstrap: function(f) {
            var g = f.parentNode;
            Toggler.getInstance(g).toggle(g);
        },
        createInstance: function(g) {
            var f = (new Toggler).setSticky(true);
            DataStore.set(g, "toggler", f);
            return f;
        },
        getInstance: function(g) {
            while (g) {
                var f = DataStore.get(g, "toggler");
                if (f) return f;
                if (CSS.hasClass(g, "uiToggleContext")) return Toggler.createInstance(g);
                g = g.parentNode;
            }
            return c = c || new Toggler;
        },
        listen: function(h, g, f) {
            return Toggler.subscribe($A(h), function(j, i) {
                if (i.getActive() === g) return f(j, i);
            });
        },
        subscribe: function(f) {
            return function(h, g) {
                h = $A(h);
                if (h.contains("show")) e.each(function(i) {
                    if (i.getActive()) g.curry("show", i).defer();
                });
                return f(h, g);
            };
        }(Toggler.subscribe.bind(Toggler))
    });
})();

var TooltipLink = {
    setTooltipText: function(a, b) {
        TooltipLink.setTooltipEnabled(a, b !== null && b !== "");
        a = Parent.byClass(a, "uiTooltip");
        if (a) DOM.setContent(DOM.find(a, "span.uiTooltipText"), b);
    },
    setTooltipEnabled: function(b, a) {
        b = Parent.byClass(b, "uiTooltip");
        b && CSS.conditionClass(b, "uiTooltipDisabled", !a);
    }
};

var Selector = function() {
    var a;
    var i = false;
    function b(k) {
        return Parent.byClass(k, "uiSelector");
    }
    function c(k) {
        return Parent.byClass(k, "uiSelectorButton");
    }
    function e(k) {
        return DOM.scry(k, "select")[0];
    }
    function d(k) {
        return DOM.find(k, "div.uiSelectorMenuWrapper");
    }
    function f() {
        f = bagofholding;
        Menu.subscribe("select", function(k, m) {
            if (!a || !m || m.menu !== Selector.getSelectorMenu(a)) return;
            var n = g(a);
            var p = h(m.item);
            if (p) {
                var l = a;
                var o = Selector.isOptionSelected(m.item);
                var q = Selector.inform("select", {
                    selector: l,
                    option: m.item
                });
                if (q === false) return;
                if (n || !o) {
                    Selector.setSelected(l, Selector.getOptionValue(m.item), !o);
                    Selector.inform("toggle", {
                        selector: l,
                        option: m.item
                    });
                    Selector.inform("change", {
                        selector: l
                    });
                    Arbiter.inform("Form/change", {
                        node: l
                    });
                    if (j(l)) DataStore.set(l, "dirty", true);
                }
            }
            if (!n || !p) a && Selector.toggle(a);
        });
    }
    function g(k) {
        return !!k.getAttribute("data-multiple");
    }
    function h(k) {
        return CSS.hasClass(k, "uiSelectorOption");
    }
    function j(k) {
        return !!k.getAttribute("data-autosubmit");
    }
    onloadRegister(function() {
        var k = {};
        k.keydown = function(event) {
            var m = event.getTarget();
            if (DOM.isNode(m, [ "input", "textarea" ])) return;
            switch (Event.getKeyCode(event)) {
              case KEYS.DOWN:
              case KEYS.SPACE:
              case KEYS.UP:
                i = true;
                if (c(m)) {
                    var l = b(m);
                    Selector.toggle(l);
                    return false;
                }
                break;
              case KEYS.ESC:
                i = true;
                if (a) {
                    Selector.toggle(a);
                    return false;
                }
                break;
              case KEYS.RETURN:
                i = true;
                break;
            }
        };
        k.keyup = function() {
            !function() {
                i = false;
            }.defer();
        };
        Event.listen(document.body, k);
        Toggler.subscribe([ "show", "hide" ], function(s, r) {
            var o = b(r.getActive());
            if (o) {
                f();
                var l = Selector.getSelectorButton(o);
                var m = Selector.getSelectorMenu(o);
                var p = s === "show";
                if (p) {
                    a = o;
                    if (CSS.hasClass(l, "uiButtonDisabled")) {
                        Selector.setEnabled(o, false);
                        return false;
                    }
                    m = m || Selector.loadMenu(o);
                    if (m) {
                        Menu.register(m);
                        if (i) {
                            var n = Menu.getCheckedItems(m);
                            if (!n.length) n = Menu.getEnabledItems(m);
                            Menu.focusItem(n[0]);
                        }
                    }
                } else {
                    a = null;
                    m && Menu.unregister(m);
                    i && l.focus();
                    if (j(o) && DataStore.get(o, "dirty")) {
                        var q = DOM.scry(o, "input.submitButton")[0];
                        q && q.click();
                        DataStore.remove(o, "dirty");
                    }
                }
                CSS.conditionClass(Selector.getSelectorButton(o), "selected", p);
                Selector.inform(p ? "open" : "close", {
                    selector: o
                });
            }
        });
    });
    return copy_properties(new Arbiter, {
        attachMenu: function(o, k, m) {
            o = b(o);
            if (o) {
                a && Menu.unregister(Selector.getSelectorMenu(a));
                DOM.setContent(d(o), k);
                a && Menu.register(Selector.getSelectorMenu(o));
                if (m) {
                    var l = o.getAttribute("data-name");
                    l && m.setAttribute("name", l);
                    if (!g(o)) m.setAttribute("multiple", false);
                    var n = e(o);
                    if (n) {
                        DOM.replace(n, m);
                    } else DOM.insertAfter(o.firstChild, m);
                }
                return true;
            }
        },
        getOption: function(m, n) {
            var l = Selector.getOptions(m), k = l.length;
            while (k--) if (n === Selector.getOptionValue(l[k])) return l[k];
            return null;
        },
        getOptions: function(l) {
            var k = Menu.getItems(Selector.getSelectorMenu(l));
            return k.filter(h);
        },
        getEnabledOptions: function(l) {
            var k = Menu.getEnabledItems(Selector.getSelectorMenu(l));
            return k.filter(h);
        },
        getSelectedOptions: function(k) {
            return Menu.getCheckedItems(Selector.getSelectorMenu(k));
        },
        getOptionText: function(k) {
            return Menu.getItemLabel(k);
        },
        getOptionValue: function(l) {
            var n = b(l);
            var m = e(n);
            var k = Selector.getOptions(n).indexOf(l);
            return k >= 0 ? m.options[k + 1].value : "";
        },
        getSelectorButton: function(k) {
            return DOM.find(k, "a.uiSelectorButton");
        },
        getSelectorMenu: function(k) {
            return DOM.scry(k, "div.uiSelectorMenu")[0];
        },
        getValue: function(o) {
            var m = e(o);
            if (!m) return null;
            if (!g(o)) return m.value;
            var p = [];
            var l = m.options;
            for (var k = 1, n = l.length; k < n; k++) if (l[k].selected) p.push(l[k].value);
            return p;
        },
        isOptionSelected: function(k) {
            return Menu.isItemChecked(k);
        },
        listen: function(l, m, k) {
            return this.subscribe(m, function(o, n) {
                if (n.selector === l) return k(n, o);
            });
        },
        loadMenu: function(n) {
            var m = Selector.getSelectorMenu(n);
            if (!m) {
                var l = Selector.getSelectorButton(n);
                var k = l.getAttribute("ajaxify");
                if (k) {
                    var o = HTML('<div class="uiSelectorMenuWrapper uiToggleFlyout">' + '<div class="uiMenu uiSelectorMenu loading">' + '<ul class="uiMenuInner">' + "<li><span></span></li>" + "</ul>" + "</div>" + "</div>");
                    DOM.appendContent(l.parentNode, o);
                    Bootloader.loadComponents("async", function() {
                        AsyncRequest.bootstrap(k, l);
                    });
                    m = Selector.getSelectorMenu(n);
                    l.removeAttribute("onmouseover");
                }
            }
            return m;
        },
        setButtonLabel: function(n, l) {
            var k = Selector.getSelectorButton(n);
            var m = parseInt(k.getAttribute("data-length"), 10);
            l = l || k.getAttribute("data-label") || "";
            Button.setLabel(k, l);
            if (typeof l === "string") {
                CSS.conditionClass(k, "uiSelectorBigButtonLabel", l.length > m);
                if (m && l.length > m) {
                    k.setAttribute("title", l);
                } else k.removeAttribute("title");
            }
        },
        setButtonTooltip: function(m, l) {
            var k = Selector.getSelectorButton(m);
            TooltipLink.setTooltipText(k, l || k.getAttribute("data-tooltip") || "");
        },
        setEnabled: function(l, k) {
            if (!k && a && b(l) === a) Selector.toggle(l);
            Button.setEnabled(Selector.getSelectorButton(l), k);
        },
        setOptionEnabled: function(l, k) {
            Menu.setItemEnabled(l, k);
        },
        setSelected: function(o, p, m) {
            m = m !== false;
            var l = Selector.getOption(o, p);
            if (!l) return;
            var k = Selector.isOptionSelected(l);
            if (m !== k) {
                if (!g(o) && !k) {
                    var n = Selector.getSelectedOptions(o)[0];
                    n && Menu.toggleItem(n);
                }
                Menu.toggleItem(l);
                Selector.updateSelector(o);
            }
        },
        toggle: function(k) {
            Toggler.toggle(DOM.scry(b(k), "div.wrap")[0]);
        },
        updateSelector: function(u) {
            var r = Selector.getOptions(u);
            var t = Selector.getSelectedOptions(u);
            var o = e(u).options;
            var q = [];
            var w = [];
            for (var n = 0, p = r.length; n < p; n++) {
                var s = t.contains(r[n]);
                o[n + 1].selected = s;
                if (s) {
                    var v = Selector.getOptionText(r[n]);
                    q.push(v);
                    w.push(r[n].getAttribute("data-tooltip") || v);
                }
            }
            o[0].selected = !t.length;
            var l = CSS.hasClass(u, "uiSelectorDynamicLabel");
            var m = CSS.hasClass(u, "uiSelectorDynamicTooltip");
            if (l || m) {
                if (g(u)) {
                    var k = Selector.getSelectorButton(u);
                    q = q.join(k.getAttribute("data-delimiter"));
                    w = w.join(k.getAttribute("data-delimiter"));
                }
                l && Selector.setButtonLabel(u, q);
                m && Selector.setButtonTooltip(u, w);
            }
        }
    });
}();

var DynamicIconSelector = function() {
    onloadRegister(function() {
        Selector.subscribe("change", function(a, b) {
            var c = b.selector;
            if (CSS.hasClass(c, "dynamicIconSelector")) DynamicIconSelector.swapIcon(c);
        });
    });
    return {
        swapIcon: function(e) {
            var d = Selector.getSelectedOptions(e)[0];
            var c = d && DOM.scry(d, ".itemIcon")[0];
            var a = Selector.getSelectorButton(e);
            if (c) {
                Button.setIcon(a, c.cloneNode(true));
            } else {
                var b = DOM.scry(a, ".img")[0];
                b && DOM.remove(b);
            }
            CSS.conditionClass(a, "uiSelectorChevronOnly", !c);
        }
    };
}();

var PrivacyBaseValue = {
    FRIENDS_MINUS_ACQUAINTANCES: 127,
    FACEBOOK_EMPLOYEES: 112,
    CUSTOM: 111,
    OPEN: 100,
    EVERYONE: 80,
    NETWORKS_FRIENDS_OF_FRIENDS: 60,
    NETWORKS_FRIENDS: 55,
    FRIENDS_OF_FRIENDS: 50,
    ALL_FRIENDS: 40,
    SELF: 10,
    NOBODY: 0
};

var PrivacyFriendsValue = {
    EVERYONE: 80,
    NETWORKS_FRIENDS: 55,
    FRIENDS_OF_FRIENDS: 50,
    ALL_FRIENDS: 40,
    SOME_FRIENDS: 30,
    SELF: 10,
    NO_FRIENDS: 0
};

var PrivacySpecialPreset = {
    ONLY_CORP_NETWORK: 200,
    COLLEGE_NETWORK_FRIENDS_OF_FRIENDS: 201,
    COLLEGE_NETWORK_FRIENDS: 202
};

var PrivacyNetworkTypes = {
    TYPE_COLLEGE: 1,
    TYPE_HS: 2,
    TYPE_CORP: 3,
    TYPE_GEO: 4,
    TYPE_MANAGED: 14,
    TYPE_TEST: 50
};

var PrivacyNetworksAll = 1;

copy_properties(PrivacyBaseValue, PrivacySpecialPreset);

function PrivacyModel() {
    this.value = PrivacyBaseValue.ALL_FRIENDS;
    this.friends = PrivacyFriendsValue.NO_FRIENDS;
    this.networks = [];
    this.objects = [];
    this.lists = [];
    this.lists_x = [];
    this.list_anon = 0;
    this.ids_anon = [];
    this.list_x_anon = 0;
    this.ids_x_anon = [];
    this.tdata = {};
    return this;
}

copy_properties(PrivacyModel.prototype, {
    init: function(k, a, h, i, f, g, d, b, e, c, j) {
        this.value = k;
        this.friends = a;
        this.networks = h.clone();
        this.objects = i.clone();
        this.lists = f.clone();
        this.lists_x = g.clone();
        this.list_anon = d;
        this.ids_anon = b.clone();
        this.list_x_anon = e;
        this.ids_x_anon = c.clone();
        j = j || {};
        copy_properties(this.tdata, j);
    },
    clone: function() {
        var a = new PrivacyModel;
        a.init(this.value, this.friends, this.networks, this.objects, this.lists, this.lists_x, this.list_anon, this.ids_anon, this.list_x_anon, this.ids_x_anon, this.tdata);
        return a;
    },
    getData: function() {
        var b = [ "value", "friends", "networks", "objects", "lists", "lists_x", "list_anon", "ids_anon", "list_x_anon", "ids_x_anon" ];
        var d = {};
        for (var c = 0; c < b.length; ++c) {
            var a = b[c];
            d[a] = this[a];
        }
        return d;
    }
});

var AudienceSelector = function() {
    onloadRegister(function() {
        Selector.subscribe("select", function(a, b) {
            if (!CSS.hasClass(b.selector, "audienceSelector")) return;
            var e = Selector.getOptionValue(b.option);
            if (e == PrivacyBaseValue.CUSTOM) {
                Selector.toggle(b.selector);
                return false;
            }
            if (CSS.hasClass(b.selector, "dataTooltip")) {
                var c = DOM.find(b.option, ".itemAnchor").getAttribute("data-tooltip");
                Selector.setButtonTooltip(b.selector, c || null);
            }
            if (!CSS.hasClass(b.option, "specialOption")) return;
            var d = DOM.find(b.option, "a").getAttribute("data-type");
            if (CSS.hasClass(b.option, "moreOption")) {
                CSS.addClass(b.selector, d);
                CSS.addClass(b.selector, "showSecondaryOptions");
                return false;
            } else if (CSS.hasClass(b.option, "returnOption")) {
                CSS.removeClass(b.selector, "showSecondaryOptions");
                CSS.removeClass(b.selector, "friendList");
                return false;
            }
        });
        Arbiter.subscribe("CustomPrivacyOption/update", function(a, b) {
            if (!CSS.hasClass(b.selector, "audienceSelector")) return;
            Selector.setSelected(b.selector, Selector.getOptionValue(b.option));
            DynamicIconSelector.swapIcon(b.selector);
            TooltipLink.setTooltipText(Selector.getSelectorButton(b.selector), b.tooltip);
        });
    });
}();

var TypeaheadUtil = function() {
    var b = /[ ]+/g;
    var c = /[^ ]+/g;
    var a = /[.,+*?$|#{}()\^\-\[\]\\\/!@%'"~=<>_:;\u2010\u2011\u2012\u2013\u2014\u2015\u30fb]/g;
    var d = {};
    var q = {
        a: "а à á â ã ä å",
        b: "б",
        c: "ц ç č",
        d: "д ð ď đ",
        e: "э е è é ê ë ě",
        f: "ф",
        g: "г ğ",
        h: "х ħ",
        i: "и ì í î ï ı",
        j: "й",
        k: "к ĸ",
        l: "л ľ ĺ ŀ ł",
        m: "м",
        n: "н ñ ň ŉ ŋ",
        o: "о ø ö õ ô ó ò",
        p: "п",
        r: "р ř ŕ",
        s: "с ş š ſ",
        t: "т ť ŧ þ",
        u: "у ю ü û ú ù ů",
        v: "в",
        y: "ы ÿ ý",
        z: "з ž",
        ae: "æ",
        oe: "œ",
        ts: "ц",
        ch: "ч",
        ij: "ĳ",
        sh: "ш",
        ss: "ß",
        ya: "я"
    };
    for (var l in q) {
        var f = q[l].split(" ");
        for (var h = 0; h < f.length; h++) d[f[h]] = l;
    }
    var o = {};
    function e(r) {
        return r ? r.replace(a, " ") : "";
    }
    function g(u) {
        u = ("" + u).toLowerCase();
        var t = "";
        var r = "";
        for (var s = u.length; s--; ) {
            r = u.charAt(s);
            t = (d[r] || r) + t;
        }
        return t.replace(b, " ");
    }
    function p(s) {
        var t = [];
        var r = c.exec(s);
        while (r) {
            r = r[0];
            t.push(r);
            r = c.exec(s);
        }
        return t;
    }
    function n(t) {
        t = "" + t;
        if (!o.hasOwnProperty(t)) {
            var s = g(t);
            var r = e(s);
            o[t] = {
                value: t,
                flatValue: s,
                tokens: p(r),
                isPrefixQuery: r && !r.endsWith(" ")
            };
        }
        return o[t];
    }
    function j(u, x, s) {
        var w = n(x);
        var t = n(s).tokens;
        var r = {};
        var v = w.isPrefixQuery && u ? w.tokens.length - 1 : null;
        return w.tokens.every(function(za, z) {
            for (var y = 0; y < t.length; ++y) {
                var zb = t[y];
                if (!r[y] && (zb == za || z === v && zb.indexOf(za) === 0)) return r[y] = true;
            }
            return false;
        });
    }
    var i = j.curry(false);
    var k = j.curry(true);
    var m = {
        parse: n,
        isExactMatch: i,
        isQueryMatch: k
    };
    return m;
}();

add_properties("TypeaheadBehaviors", {
    buildBestAvailableNames: function(a) {
        var b = a.getView();
        b.subscribe("beforeRender", function(c, e) {
            for (var d = 0; d < e.results.length; ++d) {
                if (e.results[d].localized_text == null) continue;
                if (TypeaheadUtil.isQueryMatch(e.value, e.results[d].localized_text)) {
                    e.results[d].text = e.results[d].localized_text;
                } else e.results[d].text = e.results[d].additional_text;
            }
        });
    }
});

function useFacebookReferer(b, a) {
    var d = false;
    function e() {
        if (d) return;
        d = true;
        b.contentWindow.document.body.style.margin = 0;
        a();
    }
    var c = (URI().isSecure() ? "https://s-static.ak.facebook.com" : "http://static.ak.facebook.com") + "/common/referer_frame.php";
    Event.listen(b, "load", e);
    b.src = c;
}

function useFacebookRefererHtml(b, a) {
    useFacebookReferer(b, function() {
        b.contentWindow.document.body.innerHTML = a;
    });
}

if (typeof deconcept == "undefined") var deconcept = {};

if (typeof deconcept.util == "undefined") deconcept.util = {};

if (typeof deconcept.SWFObjectUtil == "undefined") deconcept.SWFObjectUtil = {};

deconcept.SWFObject = function(h, d, j, c, i, a, f, l, g, b) {
    if (!document.getElementById) return;
    this.DETECT_KEY = b ? b : "detectflash";
    this.skipDetect = deconcept.util.getRequestParameter(this.DETECT_KEY);
    this.params = {};
    this.variables = {};
    this.attributes = [];
    this.fallback_html = "";
    this.fallback_js_fcn = function() {};
    if (h) this.setAttribute("swf", h);
    if (d) this.setAttribute("id", d);
    if (j) this.setAttribute("width", j);
    if (c) this.setAttribute("height", c);
    this.installedVer = deconcept.SWFObjectUtil.getPlayerVersion();
    if (i) {
        if (!(i instanceof Array)) i = [ i ];
        var k;
        i.each(function(n) {
            k = new deconcept.PlayerVersion(n.toString().split("."));
            if (k.major == this.installedVer.major) {
                this.setAttribute("version", k);
                return;
            } else if (!this.getAttribute("version") || k.major < this.getAttribute("version").major) this.setAttribute("version", k);
        }.bind(this));
    }
    if (!window.opera && document.all && this.installedVer.major > 7) if (!deconcept.unloadSet) {
        deconcept.SWFObjectUtil.prepUnload = function() {
            __flash_unloadHandler = function() {};
            __flash_savedUnloadHandler = function() {};
            window.attachEvent("onunload", deconcept.SWFObjectUtil.cleanupSWFs);
        };
        window.attachEvent("onbeforeunload", deconcept.SWFObjectUtil.prepUnload);
        deconcept.unloadSet = true;
    }
    if (a) this.addParam("bgcolor", a);
    var e = f ? f : "high";
    this.addParam("quality", e);
    this.setAttribute("useExpressInstall", false);
    this.setAttribute("doExpressInstall", false);
    var m = l ? l : window.location;
    this.setAttribute("xiRedirectUrl", m);
    this.setAttribute("redirectUrl", "");
    if (g) this.setAttribute("redirectUrl", g);
    this.setAttribute("useIframe", false);
};

deconcept.SWFObject.ieWorkaroundApplied = false;

deconcept.SWFObject.ensureIEWorkaroundAttached = function() {
    if (!deconcept.SWFObject.ieWorkaroundApplied && document.attachEvent) {
        deconcept.SWFObject.ieWorkaroundApplied = true;
        document.attachEvent("onpropertychange", deconcept.SWFObject.onDocumentPropertyChange);
    }
};

deconcept.SWFObject.onDocumentPropertyChange = function(event) {
    if (event.propertyName == "title") {
        var a = document.title;
        if (a != null && a.indexOf("#!") != -1) {
            a = a.substring(0, a.indexOf("#!"));
            document.title = a;
        }
    }
};

deconcept.SWFObject.prototype = {
    useExpressInstall: function(a) {
        this.xiSWFPath = !a ? "/swf/expressinstall.swf" : a;
        this.setAttribute("useExpressInstall", true);
    },
    setAttribute: function(a, b) {
        this.attributes[a] = b;
    },
    getAttribute: function(a) {
        return this.attributes[a] || "";
    },
    addParam: function(a, b) {
        this.params[a] = b;
    },
    getParams: function() {
        return this.params;
    },
    addVariable: function(a, b) {
        this.variables[a] = b;
    },
    getVariable: function(a) {
        return this.variables[a] || "";
    },
    getVariables: function() {
        return this.variables;
    },
    getVariablePairs: function() {
        var b = [];
        var a;
        var c = this.getVariables();
        for (a in c) b[b.length] = a + "=" + c[a];
        return b;
    },
    getSWFHTML: function() {
        var d = "";
        if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) {
            if (this.getAttribute("doExpressInstall")) {
                this.addVariable("MMplayerType", "PlugIn");
                this.setAttribute("swf", this.xiSWFPath);
            }
            d = '<embed type="application/x-shockwave-flash" src="' + htmlspecialchars(this.getAttribute("swf")) + '" width="' + htmlspecialchars(this.getAttribute("width")) + '" height="' + htmlspecialchars(this.getAttribute("height")) + '" style="' + htmlspecialchars(this.getAttribute("style") || "") + '"';
            d += ' id="' + htmlspecialchars(this.getAttribute("id")) + '" name="' + htmlspecialchars(this.getAttribute("id")) + '" ';
            var c = this.getParams();
            for (var a in c) d += htmlspecialchars(a) + '="' + htmlspecialchars(c[a]) + '" ';
            var b = this.getVariablePairs().join("&");
            if (b.length > 0) d += 'flashvars="' + b + '"';
            d += "/>";
        } else {
            if (this.getAttribute("doExpressInstall")) {
                this.addVariable("MMplayerType", "ActiveX");
                this.setAttribute("swf", this.xiSWFPath);
            }
            d = '<object id="' + this.getAttribute("id") + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="' + this.getAttribute("width") + '" height="' + this.getAttribute("height") + '" style="' + (this.getAttribute("style") || "") + '">';
            d += '<param name="movie" value="' + this.getAttribute("swf") + '" />';
            var c = this.getParams();
            for (var a in c) d += '<param name="' + a + '" value="' + c[a] + '" />';
            var b = this.getVariablePairs().join("&");
            if (b.length > 0) d += '<param name="flashvars" value="' + b + '" />';
            d += "</object>";
        }
        return d;
    },
    write: function(a) {
        if (this.getAttribute("useExpressInstall")) {
            var b = new deconcept.PlayerVersion([ 6, 0, 65 ]);
            if (this.installedVer.versionIsValid(b) && !this.installedVer.versionIsValid(this.getAttribute("version"))) {
                this.setAttribute("doExpressInstall", true);
                this.addVariable("MMredirectURL", escape(this.getAttribute("xiRedirectUrl")));
                document.title = document.title.slice(0, 47) + " - Flash Player Installation";
                this.addVariable("MMdoctitle", document.title);
            }
        }
        var c = typeof a == "string" ? document.getElementById(a) : a;
        if (!c) return false;
        CSS.addClass(c, "swfObject");
        c.setAttribute("data-swfid", this.getAttribute("id"));
        if (this.skipDetect || this.getAttribute("doExpressInstall") || this.installedVer.versionIsValid(this.getAttribute("version"))) {
            if (!this.getAttribute("useIframe")) {
                deconcept.SWFObject.ensureIEWorkaroundAttached();
                c.innerHTML = this.getSWFHTML();
            } else this._createIframe(c);
            return true;
        } else {
            if (this.getAttribute("redirectUrl") != "") document.location.replace(this.getAttribute("redirectUrl"));
            need_version = this.getAttribute("version").major + "." + this.getAttribute("version").minor + "." + this.getAttribute("version").rev;
            have_version = this.installedVer.major + "." + this.installedVer.minor + "." + this.installedVer.rev;
            this.fallback_js_fcn(have_version, need_version);
            c.innerHTML = this.fallback_html;
        }
        return false;
    },
    _createIframe: function(b) {
        var a = $N("iframe", {
            width: this.getAttribute("width"),
            height: this.getAttribute("height"),
            frameBorder: 0
        });
        DOM.empty(b);
        b.appendChild(a);
        useFacebookRefererHtml.bind(null, a, this.getSWFHTML()).defer();
    }
};

deconcept.SWFObjectUtil.getPlayerVersion = function() {
    var a = new deconcept.PlayerVersion([ 0, 0, 0 ]);
    if (navigator.plugins && navigator.mimeTypes.length) {
        for (var f = 0; f < navigator.plugins.length; f++) try {
            var x = navigator.plugins[f];
            if (x.name == "Shockwave Flash") {
                PlayerVersion_tmp = new deconcept.PlayerVersion(x.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s+(r|d)|\s+b[0-9]+)/, ".").split("."));
                if (typeof a == "undefined" || PlayerVersion_tmp.major > a.major || PlayerVersion_tmp.major == a.major && (PlayerVersion_tmp.minor > a.minor || PlayerVersion_tmp.minor == a.minor && PlayerVersion_tmp.rev > a.rev)) a = PlayerVersion_tmp;
            }
        } catch (e) {}
    } else if (navigator.userAgent && navigator.userAgent.indexOf("Windows CE") >= 0) {
        var b = 1;
        var c = 3;
        while (b) try {
            c++;
            b = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + c);
            a = new deconcept.PlayerVersion([ c, 0, 0 ]);
        } catch (d) {
            b = null;
        }
    } else {
        try {
            var b = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
        } catch (d) {
            try {
                var b = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
                a = new deconcept.PlayerVersion([ 6, 0, 21 ]);
                b.AllowScriptAccess = "always";
            } catch (d) {
                if (a.major == 6) return a;
            }
            try {
                b = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
            } catch (d) {}
        }
        if (b != null) a = new deconcept.PlayerVersion(b.GetVariable("$version").split(" ")[1].split(","));
    }
    return a;
};

deconcept.PlayerVersion = function(a) {
    this.major = a[0] != null ? parseInt(a[0]) : 0;
    this.minor = a[1] != null ? parseInt(a[1]) : 0;
    this.rev = a[2] != null ? parseInt(a[2]) : 0;
};

deconcept.PlayerVersion.prototype.versionIsValid = function(a) {
    if (this.major < a.major) return false;
    if (this.major > a.major) return true;
    if (this.minor < a.minor) return false;
    if (this.minor > a.minor) return true;
    if (this.rev < a.rev) return false;
    return true;
};

deconcept.util = {
    getRequestParameter: function(c) {
        var d = document.location.search || document.location.hash;
        if (c == null) return d;
        if (d) {
            var b = d.substring(1).split("&");
            for (var a = 0; a < b.length; a++) if (b[a].substring(0, b[a].indexOf("=")) == c) return b[a].substring(b[a].indexOf("=") + 1);
        }
        return "";
    }
};

deconcept.SWFObjectUtil.cleanupSWFs = function() {
    var b = document.getElementsByTagName("OBJECT");
    for (var a = b.length - 1; a >= 0; a--) {
        b[a].style.display = "none";
        for (var c in b[a]) if (typeof b[a][c] == "function") b[a][c] = function() {};
    }
};

if (!document.getElementById && document.all) document.getElementById = function(a) {
    return document.all[a];
};

var getQueryParamValue = deconcept.util.getRequestParameter;

var FlashObject = deconcept.SWFObject;

var SWFObject = deconcept.SWFObject;

function spawn_flash_update_dialog() {
    (new AsyncRequest).setURI("/ajax/flash_update_dialog.php").setMethod("GET").setReadOnly(true).send();
}

function setFlashFallback(d, g) {
    var b = ge(d);
    var a = deconcept.SWFObjectUtil.getPlayerVersion();
    var e;
    g.each(function(h) {
        h = new deconcept.PlayerVersion(h.toString().split("."));
        if (h.major == a.major) {
            e = h;
            return;
        } else if (typeof e == "undefined" || h.major < e.major) e = h;
    }.bind(this));
    if (b && a.major > 0) {
        var c = a.major + "." + a.minor + "." + a.rev;
        var f = e.major + "." + e.minor + "." + e.rev;
        b.innerHTML = _tx("Flash {required-version} est indispensable pour visualiser ce contenu. Votre version actuelle est {current-version}. Veuillez télécharger la dernière version de Flash Player.", {
            "required-version": f,
            "current-version": c
        });
    }
}

function getFlashPlayer() {
    goURI("http://get.adobe.com/flashplayer");
    return false;
}

function showFlashErrorDialog(b, a) {
    Bootloader.loadComponents("error-dialog", function() {
        ErrorDialog.show(b, a);
    });
}

var UFIOptimistic = {
    COMMENT_SEND_EVENT: "ufi/comment",
    _commentSeqNo: 0,
    init: function(a) {
        this._commentTemplate = a;
        if (!this._loaded) {
            Event.listen(document.documentElement, "click", this._clickHandler.bind(this), Event.Priority.URGENT);
            this._loaded = true;
        }
    },
    _clickHandler: function(event) {
        var i = event.getTarget();
        var l = i.name == "comment" && i.parentNode && Parent.byClass(i, "optimistic_submit");
        if (!l) return true;
        var e = i.form;
        var k = DOM.find(e, "textarea");
        if (Input.isEmpty(k)) return true;
        fc_uncollapse(e);
        var a = this._commentTemplate.render();
        var j = XHPTemplate.getNode(a, "text");
        DOM.setContent(j, HTML(htmlize(trim(k.value))));
        var c = DOM.scry(e, "ul.commentList")[0];
        if (!c) return true;
        CSS.show(c.parentNode);
        c.appendChild(a);
        var b = c.lastChild;
        var g = rand32();
        b.id = "optimistic_comment_" + g + "_" + this._commentSeqNo++;
        var d = Form.serialize(e);
        d.comment_replace = b.id;
        d.comment = 1;
        function h() {
            (new AsyncRequest(Form.getAttribute(e, "action"))).setData(d).setRelativeTo(e).setErrorHandler(function(m) {
                CSS.addClass(b, "uiUfiCommentFailed");
                AsyncResponse.defaultErrorHandler(m);
            }).send();
        }
        Event.listen(XHPTemplate.getNode(a, "retry_link"), "click", h);
        h();
        k.value = k.style.height = "";
        k.focus();
        var f = window.MentionsInput && MentionsInput.getInstance(k);
        f && f.reset();
        Arbiter.inform(UFIOptimistic.COMMENT_SEND_EVENT, {
            form: e
        });
        return false;
    }
};

onloadRegister(function() {
    Selector.subscribe("close", function(a, b) {
        if (CSS.hasClass(b.selector, "commentHideSelector")) {
            var c = Selector.getValue(b.selector);
            c && Selector.setSelected.curry(b.selector, c, false).defer();
        }
    });
});

function UIPagelet(c, d, a, b) {
    this._id = c || null;
    this._element = ge(c || $N("div"));
    this._src = d || null;
    this._context_data = a || {};
    this._data = b || {};
    this._handler = bagofholding;
    this._request = null;
    this._use_ajaxpipe = false;
    this._is_bundle = true;
    this._allow_cross_page_transition = false;
    this._append = false;
    return this;
}

UIPagelet.loadFromEndpoint = function(c, g, a, d) {
    d = d || {};
    var b = "/ajax/pagelet/generic.php/";
    if (d.intern) b = "/intern" + b;
    var f = (b + c).replace(/\/+/g, "/");
    if (d.subdomain) f = URI(f).setSubdomain(d.subdomain);
    var e = (new UIPagelet(g, f, a)).setUseAjaxPipe(d.usePipe).setBundleOption(c.substring(0, 8) != "/intern/" && d.bundle !== false).setReplayable(d.replayable).setAppend(d.append).setJSNonBlock(d.jsNonblock).setConstHeight(d.constHeight).setAllowCrossPageTransition(d.crossPage);
    d.handler && e.setHandler(d.handler);
    e.go();
};

copy_properties(UIPagelet.prototype, {
    getElement: function(a) {
        a = a || false;
        if (a) this._element = ge(this._id);
        return this._element;
    },
    setHandler: function(a) {
        this._handler = a;
        return this;
    },
    go: function(b, a) {
        if (arguments.length >= 2 || typeof b == "string") {
            this._src = b;
            this._data = a || {};
        } else if (arguments.length == 1) this._data = b;
        this.refresh();
        return this;
    },
    setAllowCrossPageTransition: function(a) {
        this._allow_cross_page_transition = a;
        return this;
    },
    setBundleOption: function(a) {
        this._is_bundle = a;
        return this;
    },
    refresh: function(b) {
        var a = function(d) {
            this._request = null;
            if (b && this._id) this._element = ge(this._id);
            var c = HTML(d.getPayload());
            if (this._append) {
                DOM.appendContent(this._element, c);
            } else DOM.setContent(this._element, c);
            this._handler();
        }.bind(this);
        if (this._use_ajaxpipe) {
            this._request = new AjaxPipeRequest;
            this._request.setCanvasId(this._id).setAppend(this._append).setConstHeight(this._constHeight).setJSNonBlock(this._jsNonblock);
        } else this._request = (new AsyncRequest).setMethod("GET").setReadOnly(true).setOption("bundle", this._is_bundle).setHandler(a);
        this._request.setURI(this._src).setReplayable(this._replayable).setAllowCrossPageTransition(this._allow_cross_page_transition).setData({
            data: JSON.stringify(merge(this._context_data, this._data))
        }).send();
        return this;
    },
    cancel: function() {
        if (this._request) this._request.abort();
    },
    setUseAjaxPipe: function(a) {
        this._use_ajaxpipe = !!a;
        return this;
    },
    setReplayable: function(a) {
        this._replayable = !!a;
        return this;
    },
    setAppend: function(a) {
        this._append = !!a;
        return this;
    },
    setJSNonBlock: function(a) {
        this._jsNonblock = !!a;
        return this;
    },
    setConstHeight: function(a) {
        this._constHeight = !!a;
        return this;
    }
});

(function() {
    var b = 1, a = 2;
    var g = {};
    var f = function() {
        var k = DOM.scry(this.root, "span.linkAttachment")[0];
        if (!k && this.isMetaComposer) k = DOM.scry(this.root, "span.attachmentAcceptsLink")[0];
        if (!k) return;
        var j = Parent.byTag(k, "form");
        this.scraper = new URLScraper(this.input);
        this.scraper.subscribe("match", function(l, m) {
            if (this.isMetaComposer) {
                j.action = "/ajax/metacomposer/attachment/link/" + "scraper.php?scrape_url=" + encodeURIComponent(m.url);
            } else {
                CSS.show(k);
                j.action = "/ajax/composer/attachment/link/scraper.php?scrape_url=" + encodeURIComponent(m.url);
            }
            j.xhpc.value = k.id;
            j.xhpc.disabled = false;
            j.xhpc.click();
        }.bind(this));
        this.isMetaComposer && this.scraper.check();
    };
    var e = function() {
        var k = this.form.xhpc_targetid;
        var l = k.value;
        var j = Arbiter.subscribe("ComposerAudienceSelector/group", function(n, o) {
            k.value = o.group;
        });
        var m = Arbiter.subscribe("ComposerAudienceSelector/nongroup", function() {
            k.value = l;
        });
        onunloadRegister(Arbiter.unsubscribe.curry(j));
        onunloadRegister(Arbiter.unsubscribe.curry(m));
    };
    var h = function(event, j) {
        j = j || {};
        j.evt = event;
        j.flowID = this.flowID;
        j.context = this.form.xhpc_context.value;
        j.target = this.form.action.split("/").pop();
        j = {
            data: JSON.stringify(j)
        };
        (new AsyncSignal("/ajax/composer/logging.php", j)).send();
    };
    var d = function(j) {
        this.flowID = (new Date).getTime().toString() + (rand32() + 1);
        this._logged_short = this._logged_long = false;
        if (j) return;
        Event.listen(this.input, "keypress", function() {
            var k = Input.getValue(this.input).length;
            if (!this._logged_short && k >= 2) {
                h.call(this, "typing", {
                    extra: "short"
                });
                this._logged_short = true;
                return;
            }
            if (!this._logged_long && k >= 15) {
                h.call(this, "typing", {
                    extra: "long"
                });
                this._logged_long = true;
            }
        }.bind(this));
    };
    var c = function(j) {
        if (this.inform("submit") === false) {
            j.kill();
            return false;
        }
        h.call(this, "publish");
        if (this.submitHandler) return (new Function(this.submitHandler)).apply(this.form);
    };
    var i = function() {
        var j = this.privacyCallout;
        if (!j) return;
        if (this.privacy.offsetWidth) {
            j.setDestroyOnHide(true);
            j.show();
        } else {
            j.setDestroyOnHide(false);
            j.hide();
        }
    };
    window.Composer = function(m, l, k, j) {
        g[m.id] = this;
        this.root = m;
        this.resetCfg = l;
        this.dataSource = j;
        this.lazyEndpoint = this.resetCfg && this.resetCfg.lazyEndpoint;
        Bootloader.loadComponents("dom", function() {
            this.focus = DOM.find(m, "div.focus_target");
            this.form = DOM.find(m, "form.attachmentForm");
            this.content = DOM.find(m, "div.attachmentContent");
            this.isMetaComposer = k;
            if (this.isMetaComposer) {
                this.messageBox = DOM.find(m, "div.uiMetaComposerMessageBox");
                this.metaArea = DOM.find(m, "div.attachmentMetaArea");
                this.bottomArea = DOM.find(m, "div.attachmentBottomArea");
                this.barArea = DOM.find(m, "div.attachmentBarArea");
                this.blurb = DOM.find(m, "div.uiMetaComposerMessageBox div.textBlurb");
                this.input = DOM.find(m, "div.uiMetaComposerMessageBox textarea.input");
                this.button = DOM.find(m, "div.uiMetaComposerMessageBox label.submitBtn");
                this.privacy = DOM.find(m, "div.uiMetaComposerMessageBox li.privacyWidget");
            } else {
                this.blurb = DOM.find(m, "div.uiComposerMessageBox div.textBlurb");
                this.input = DOM.find(m, "div.uiComposerMessageBox textarea.input");
                this.button = DOM.find(m, "div.uiComposerMessageBox label.submitBtn");
                this.privacy = DOM.find(m, "div.uiComposerMessageBox li.privacyWidget");
            }
            Event.listen(this.form, "submit", c.bind(this));
            if (this.isMetaComposer) {
                Event.listen(this.input, "focus", this.onFocus.bind(this));
                if (Parent.byClass(this.input, "child_was_focused")) this.onFocus.bind(this).defer();
            }
            Arbiter.inform("xhpc/construct/" + m.id, this, Arbiter.BEHAVIOR_STATE);
        }.bind(this));
    };
    Class.mixin(Composer, "Arbiter", {
        init: function(j) {
            this.mentionsInput = j;
            if (this.mentionsInput) {
                this.mentionsInput.subscribe("init", function() {
                    var k = this.mentionsInput.getTypeahead().getView();
                    k.subscribe([ "reset", "render" ], function(l) {
                        CSS.conditionClass(this.root, "uiComposerMention", l == "render");
                    }.bind(this));
                }.bind(this));
                this.mentionsInput.subscribe("update", function(l, k) {
                    Arbiter.inform("Composer/mentions", keys(k.mentioned));
                });
            }
            f.call(this);
            d.call(this);
            if (this.isMetaComposer) e.call(this);
            this.inform("init", null, Arbiter.BEHAVIOR_PERSISTENT);
        },
        initPrivacyEducation: function(l, q, j, k) {
            if (j) {
                this.privacyCallout = j;
                if (!CSS.hasClass(this.focus, "child_was_focused")) var o = Event.listen(this.input, "focus", function() {
                    o.remove();
                    i.call(this);
                }.bind(this));
                var p = q.subscribe("menuActivated", function() {
                    q.unsubscribe(p);
                    if (this.privacyCallout) Button.getInputElement(k).click();
                }.bind(this));
                j.subscribe("submit", function() {
                    this.privacyCallout = null;
                }.bind(this));
                i.call(this);
            }
            if (l.warnChange) var m = q.subscribe("privacyChanged", function(s, r) {
                q.unsubscribe(m);
                Bootloader.loadComponents("dialog", function() {
                    Dialog.bootstrap("/ajax/privacy/change_default_dialog.php", {
                        privacy_data: r,
                        autosave: true
                    });
                });
            });
            if (l.warnEveryone) var n = this.subscribe("submit", function() {
                if (q.isEveryonePrivacy()) {
                    var r = "/ajax/privacy/confirm_everyone_dialog.php";
                    Bootloader.loadComponents([ "async", "dialog" ], function() {
                        (new Dialog).setAsync(new AsyncRequest(r)).setHandler(function() {
                            this.unsubscribe(n);
                            (new AsyncRequest("/ajax/privacy/save_composer_data.php")).setData({
                                seen_everyone: true
                            }).send();
                            Button.getInputElement(this.button).click();
                        }.bind(this)).show();
                    }.bind(this));
                    return false;
                }
            }.bind(this));
        },
        setBlurb: function(j) {
            DOM.setContent(this.blurb, j);
        },
        setEnabled: function(j) {
            Button.setEnabled(this.button, j);
        },
        setLoading: function(j) {
            CSS.conditionClass(this.root, "async_saving", !!j);
        },
        setContentVisible: function(j) {
            CSS.conditionClass(this.root, "uiComposerHideContent", !j);
        },
        setMessageBoxVisible: function(j) {
            CSS.conditionClass(this.root, "uiComposerHideMessageBox", !j);
        },
        setInputVisible: function(j) {
            CSS.conditionClass(this.root, "uiComposerHideInput", !j);
        },
        setTopicTaggerVisible: function(j) {
            CSS.conditionClass(this.root, "uiTagComposerHidden", !j);
        },
        mutate: function(l) {
            var k = ge(l.xhpc);
            if (k) {
                var m = DOM.scry(this.root, ".uiComposerAttachmentSelected")[0];
                if (l.confirmAugmentation && m !== k) return;
                m && CSS.removeClass(m, "uiComposerAttachmentSelected");
                CSS.addClass(k, "uiComposerAttachmentSelected");
                if (!l.disableCache) Event.listen(k, "click", function(n) {
                    $E(n).stop();
                    l.disableCache = true;
                    this.mutate(l);
                }.bind(this));
            }
            if (!l.keepContentAreas) {
                this.setContentVisible(false);
                DOM.empty(this.content);
                if (this.isMetaComposer) {
                    this.mentionsInput && this.mentionsInput.setAuxContent(null);
                    DOM.empty(this.metaArea);
                    DOM.empty(this.bottomArea);
                    DOM.empty(this.barArea);
                }
            }
            if (l.content) {
                DOM.setContent(this.content, HTML(l.content));
                this.setContentVisible(true);
            }
            if (this.isMetaComposer) {
                l.metaContent && DOM.setContent(this.metaArea, HTML(l.metaContent));
                l.bottomContent && DOM.setContent(this.bottomArea, HTML(l.bottomContent));
                l.barContent && DOM.setContent(this.barArea, HTML(l.barContent));
            }
            this.setMessageBoxVisible(!l.messageBoxHidden);
            CSS.conditionClass(this.root, "uiComposerWhiteMessageBox", !l.messageBoxHidden && !l.inputHidden && !l.content);
            this.setInputVisible(!l.inputHidden);
            CSS.conditionShow(this.privacy, !l.privacyWidgetHidden);
            Input.setPlaceholder(this.input, l.placeholder);
            Button.setLabel(this.button, l.buttonLabel);
            this.setBlurb(HTML(l.blurb));
            if (!this.isMetaComposer) CSS.conditionClass(DOM.scry(this.form, ".uiComposerMessageBox")[0], "uiCheckinComposer", l.placeVisible);
            if (l.autoscrape) {
                this.scraper && this.scraper.enable();
            } else this.scraper && this.scraper.disable();
            this.setEnabled(!l.disabled);
            this.setTopicTaggerVisible(!l.hideTopicTagger);
            this.form.setAttribute("action", l.endpoint);
            if (l.formType == b) {
                this.form.setAttribute("rel", "async");
            } else this.form.removeAttribute("rel");
            if (l.formType == a) {
                this.form.target = l.iframeName;
                this.form.enctype = this.form.encoding = "multipart/form-data";
            } else {
                this.form.removeAttribute("target");
                this.form.removeAttribute("enctype");
                this.form.removeAttribute("encoding");
            }
            this.submitHandler = l.submitHandler;
            i.call(this);
            this.lazyEndpoint = l.lazyEndpoint;
            l.attachmentJS && (new Function(l.attachmentJS)).apply(this);
            CSS.addClass(this.root, "uiComposerInteracted");
            CSS.addClass(this.root, "uiComposerOpen");
            if (l.messageBoxFocused) {
                var j = document.activeElement;
                if (j === document.body || Parent.byClass(j, "attachmentLink")) this.focusInput.bind(this).defer();
            }
        },
        reset: function(k, j) {
            if (!k) {
                Input.reset(this.input);
                this.mentionsInput && this.mentionsInput.reset();
            }
            if (this.isMetaComposer) {
                DOM.empty(this.metaArea);
                DOM.empty(this.bottomArea);
                DOM.empty(this.barArea);
            }
            if (this.resetCfg) {
                this.mutate(this.resetCfg);
            } else {
                var l = DOM.scry(this.root, ".uiComposerAttachmentSelected")[0];
                if (l) CSS.removeClass(l, "uiComposerAttachmentSelected");
            }
            CSS.removeClass(this.root, "uiComposerInteracted");
            CSS.setClass(this.focus, "focus_target");
            this.setLoading(false);
            d.call(this, true);
            if (j) {
                var m = DOM.scry(this.root, ".widget")[0];
                m && DOM.replace(m, j);
            }
            Arbiter.inform("composer/reset");
        },
        onFocus: function() {
            if (this.lazyEndpoint) {
                var j = DOM.find(this.root, "form.attachmentSelectForm");
                var l = new URI(this.lazyEndpoint);
                l.setQueryData({
                    isAugmentation: true
                });
                j.action = l.toString();
                var k = DOM.scry(this.root, ".uiComposerAttachmentSelected")[0];
                j.xhpc.value = k && k.id;
                j.xhpc.click();
                CSS.removeClass.curry(this.root, "async_saving").defer();
            }
        },
        focusInput: function() {
            Input.focus(this.input);
        },
        getInput: function() {
            return this.input;
        },
        updateDataSourceToken: function(j) {
            if (this.dataSource) this.dataSource.updateToken(j);
        }
    });
    copy_properties(Composer, {
        publish: function(k, j) {
            j = j || {};
            j.composer = Composer.getInstance($(k));
            j.composer.reset(false, j.audienceMarkup);
            j.audienceMarkup = null;
            if (j.streamMarkup) j.streamStory = HTML(j.streamMarkup).getRootNode();
            Arbiter.inform("composer/publish", j);
        },
        getInstance: function(j) {
            var k = Parent.byClass($(j), "uiComposer");
            return k ? g[k.id] : null;
        }
    });
    Arbiter.inform("ComposerJSLoaded", null, Arbiter.BEHAVIOR_PERSISTENT);
})();

function MetaComposerMessageBox() {}

MetaComposerMessageBox.prototype = {
    init: function(b, a) {
        this.inputContainer = DOM.scry(b, "div.inputContainer")[0];
        this.textInput = DOM.scry(b, "textarea.mentionsTextarea")[0];
        this.metaArea = DOM.scry(b, "div.attachmentMetaArea")[0];
        this.bottomArea = DOM.scry(b, "div.attachmentBottomArea")[0];
        this.barArea = DOM.scry(b, "div.attachmentBarArea")[0];
        Event.listen(this.inputContainer, "click", function(c) {
            var d = c.getTarget();
            if (!DOM.contains(this.metaArea, d) && d !== this.textInput) this.textInput.focus();
        }.bind(this));
    }
};

function MentionsInput(a) {
    DataStore.set(a, "MentionsInput", this);
    this._root = a;
}

MentionsInput.getInstance = function(a) {
    var b = Parent.byClass(a, "uiMentionsInput");
    return b ? DataStore.get(b, "MentionsInput") : null;
};

(function() {
    var a = "@\\uff20";
    var e = ".,+*?$|#{}()\\^\\-\\[\\]\\\\/!@%&'\"~=<>_:;";
    var d = "\\b[A-Z][^ A-Z" + e + "]";
    var c = "(?:[" + a + "]([^" + a + e + "]{0,20}))";
    var b = "(?:(?:" + d + "+)|" + c + ")";
    var f = "(?:" + d + "{4,})";
    MentionsInput.prototype = {
        _matcher: new RegExp(c + "$"),
        _autoMatcher: new RegExp(b + "$"),
        _userMatcher: new RegExp(f + "$")
    };
})();

Class.mixin(MentionsInput, "Arbiter", {
    init: function(a, b) {
        this.init = bagofholding;
        this._initialized = true;
        this._typeahead = Typeahead.getInstance(DOM.find(this._root, ".mentionsTypeahead"));
        this._highlighter = DOM.find(this._root, ".highlighter");
        this._highlighterInner = this._highlighter.firstChild;
        this._highlighterContent = DOM.find(this._root, ".highlighterContent");
        this._hiddenInput = DOM.find(this._root, ".mentionsHidden");
        this._input = this._typeahead.getCore().getElement();
        this._placeholder = this._input.getAttribute("placeholder");
        this._maxMentions = a.max || 6;
        if (ua.firefox() < 4) {
            this._input.blur();
            setTimeout(function() {
                this._input.focus();
            }.bind(this));
        }
        if (!this._hiddenInput.name) {
            var c = this._input.name;
            this._input.name = c + "_text";
            this._hiddenInput.name = c;
        }
        this._initEvents();
        this._initTypeahead();
        this.reset(b);
        this.inform("init", null, Arbiter.BEHAVIOR_STATE);
    },
    reset: function(b) {
        if (!this._initialized) return;
        this._mentioned = {};
        this._numMentioned = 0;
        this._filterData = null;
        this._hiddenInput && (this._hiddenInput.value = "");
        this._highlighterContent && DOM.empty(this._highlighterContent);
        this._highlighterAuxContent && DOM.remove(this._highlighterAuxContent);
        this._highlighterAuxContent = null;
        Input.setPlaceholder(this._input, this._placeholder);
        CSS.setStyle(this._typeahead.getElement(), "height", "auto");
        if (b) {
            Input.setValue(this._input, b.flattened);
            for (var a in b.mention_data) this._addToken({
                uid: a,
                text: b.mention_data[a],
                type: "unknown"
            });
        }
        this._updateTypeahead();
        this._update();
    },
    getRawValue: function() {
        return Input.getValue(this._hiddenInput);
    },
    getTypeahead: function() {
        return this._typeahead;
    },
    _initEvents: function() {
        var c = this._update.bind(this);
        var a = c.defer.bind(c, 20);
        var b = {
            change: c,
            keydown: a,
            focus: this._updateWidth.bind(this)
        };
        if (ua.firefox()) b.keyup = c;
        if (ua.firefox() < 4) {
            b.keypress = b.keydown;
            delete b.keydown;
        }
        Event.listen(this._input, b);
    },
    _initTypeahead: function() {
        this._typeahead.subscribe("select", function(c, d) {
            var e = d.selected;
            this._addToken({
                uid: e.uid,
                text: e.text,
                type: e.type
            });
            this.updateValue();
        }.bind(this));
        var a = this._input;
        var b = null;
        this._typeahead.subscribe("render", function(event) {
            if (b === null) {
                b = Input.getSubmitOnEnter(a);
                Input.setSubmitOnEnter(a, false);
            }
        });
        this._typeahead.subscribe("reset", function(event) {
            if (b !== null) {
                Input.setSubmitOnEnter(a, b);
                b = null;
            }
        });
        this._typeahead.subscribe("query", function() {
            this._filterData = null;
        }.bind(this));
        this._typeahead.getCore().suffix = "";
        this._typeahead.getData().setFilter(this._filterResults.bind(this));
    },
    _filterResults: function(d) {
        if (this._filterData === null) {
            var a = Input.getSelection(this._input).start || 0;
            for (var c = 0; c < this._offsets.length; c++) {
                var e = this._offsets[c];
                if (a > e[0] && a <= e[1]) {
                    this._filterData = {
                        caretIsInsideMention: true
                    };
                    return false;
                }
            }
            var b = this._typeahead.getCore();
            this._filterData = {
                value: b.getValue(),
                rawValue: b.getRawValue()
            };
        }
        if (this._filterData.caretIsInsideMention) return false;
        if (this._matcher.test(this._filterData.rawValue)) return true;
        if (d.type != "user" && !d.auto) return false;
        if (this._userMatcher.test(this._filterData.value)) return true;
        return TypeaheadUtil.isExactMatch(this._filterData.value, this._typeahead.getData().getTextToIndex(d));
    },
    _addToken: function(a) {
        this._mentioned[a.uid] = a;
        this._numMentioned++;
        this._updateTypeahead();
    },
    _removeToken: function(a) {
        delete this._mentioned[a];
        this._numMentioned--;
        this._updateTypeahead();
    },
    _reduceToken: function(f, d) {
        var e = d.split(" ");
        var b = [];
        for (var a = 0; a < e.length; a++) if (f.indexOf(e[a]) != -1) b.push(e[a]);
        e = b;
        for (a = 1; a < e.length; a++) for (var c = 1; c < e[a - 1].length + 1; c++) if (f.indexOf(e[a - 1].substr(0, c) + e[a]) != -1) e.splice(a - 1, 1);
        while (f.indexOf(e.join(" ")) == -1) e.splice(0, 1);
        return e.join(" ");
    },
    _update: function() {
        var a = Input.getValue(this._input);
        if (a == this._value) return;
        this._value = a;
        this._updateTokens();
        this.updateValue();
    },
    _updateTokens: function() {
        var e = Input.getValue(this._input);
        for (var d in this._mentioned) {
            var a = this._mentioned[d];
            var c = a.text;
            var b;
            if (a.type == "user" && (b = this._reduceToken(e, c)) !== "") {
                a.text = b;
            } else if (!c || e.indexOf(c) == -1 || typeof c !== "string") this._removeToken(d);
        }
    },
    updateValue: function() {
        var f = Input.getValue(this._input);
        var b = this._mentioned;
        var c = [];
        var a, d, e;
        for (e in b) {
            d = b[e].text;
            f = f.replace(d, function(g, h) {
                c.push([ h, h + d.length ]);
                return d;
            });
        }
        for (e in b) {
            d = b[e].text;
            f = f.replace(d, "@[" + e + ":]");
        }
        a = htmlize(f);
        for (e in b) {
            d = b[e].text;
            a = a.replace("@[" + e + ":]", "<b>" + htmlize(d) + "</b>");
            f = f.replace("@[" + e + ":]", "@[" + e + ":" + d + "]");
        }
        if (ua.ie()) a = a.replace(/ {2}/g, "&nbsp; ");
        this._offsets = c;
        this._hiddenInput.value = f;
        DOM.setContent(this._highlighterContent, HTML(a));
        this._updateHeight();
    },
    _updateWidth: function() {
        var a = CSS.getStyleFloat.curry(this._input);
        var b = this._input.offsetWidth - a("paddingLeft") - a("paddingRight") - a("borderLeftWidth") - a("borderRightWidth");
        if (ua.firefox()) b -= 2;
        if (ua.ie() <= 7) {
            b -= CSS.getStyleFloat(this._highlighterInner, "paddingLeft");
            this._highlighter.style.zoom = 1;
        }
        this._highlighterInner.style.width = Math.max(b, 0) + "px";
    },
    _updateHeight: function() {
        if (this._highlighterAuxContent) {
            var a = this._highlighter.offsetHeight;
            var b = this._typeahead.getElement();
            if (a > b.offsetHeight) {
                CSS.setStyle(b, "height", a + "px");
                Arbiter.inform("reflow");
            }
        }
    },
    _updateTypeahead: function() {
        var a = this._typeahead.getCore();
        var b = null;
        if (!this._maxMentions || this._numMentioned < this._maxMentions) b = this._autoMatcher;
        a.matcher = b;
        a.setExclusions(keys(this._mentioned));
        this.inform("update", {
            mentioned: this._mentioned
        });
    },
    setAuxContent: function(a) {
        if (this._highlighterContent) {
            if (!this._highlighterAuxContent) {
                this._highlighterAuxContent = $N("span", {
                    className: "highlighterAuxContent"
                });
                DOM.insertAfter(this._highlighterContent, this._highlighterAuxContent);
            }
            DOM.setContent(this._highlighterAuxContent, a);
            if (a) {
                Input.setPlaceholder(this._input, "");
            } else Input.setPlaceholder(this._input, this._placeholder);
            this._updateHeight();
        }
    },
    addMention: function(a) {
        var b = Input.getValue(this._input);
        Input.setValue(this._input, b + " " + a.text);
        this._mentioned[a.uid] = a;
        this._update();
    },
    getMentions: function() {
        return this._mentioned;
    }
});

var TooltipLinkLoader = {
    load: function(b, a) {
        a.onmouseover = bagofholding;
        (new AsyncRequest).setURI(b).setHandler(function(c) {
            TooltipLink.setTooltipText(a, HTML(c.getPayload()));
        }).setErrorHandler(bagofholding).send();
    }
};

function FutureSideNav() {
    FutureSideNav.instance && FutureSideNav.instance.uninstall();
    FutureSideNav.instance = this;
}

FutureSideNav.instance = null;

FutureSideNav.getInstance = function() {
    return FutureSideNav.instance || new FutureSideNav;
};

FutureSideNav.prototype = {
    init: function(c, b, a) {
        this.root = c;
        this.items = {};
        this.sections = {};
        this.editor = null;
        this.editing = false;
        this.selected = null;
        this.loading = null;
        this.keyParam = "sk";
        this.defaultKey = b;
        this.uri = URI.getRequestURI();
        this.ajaxPipe = a;
        this.ajaxPipeEndpoints = {};
        this.sidecol = true;
        this._installed = true;
        this._handlePageTransitions = true;
        PageTransitions.registerHandler(function(d) {
            return this._handlePageTransitions && this.handlePageTransition(d);
        }.bind(this));
        this._eventHandlers = [];
        this._arbiterSubscriptions = [ Arbiter.subscribe(NavigationMessage.NAVIGATION_COMPLETED, this.navigationComplete.bind(this)), Arbiter.subscribe(NavigationMessage.NAVIGATION_FAILED, this.navigationFailed.bind(this)), Arbiter.subscribe(NavigationMessage.NAVIGATION_COUNT_UPDATE, this.navigationCountUpdate.bind(this)), Arbiter.subscribe(NavigationMessage.NAVIGATION_SELECT, this.navigationSelect.bind(this)), Arbiter.subscribe(PresenceMessage.getArbiterMessageType("nav_count"), this.navigationCountUpdateFromPresence.bind(this)) ];
        this._explicitHover = [];
        this._ensureHover("sideNavItem");
        this._eventHandlers.push(Event.listen(window, "resize", this._handleResize.bind(this)));
        this._checkNarrow();
        window.Selector && this._arbiterSubscriptions.push(Selector.subscribe([ "open", "close" ], function(f, d) {
            var e = Parent.byClass(d.selector, "sideNavItem");
            e && CSS.conditionClass(e, "editMenuOpened", f === "open");
        }));
        onleaveRegister(this.uninstall.bind(this));
    },
    _handleResize: function() {
        var a;
        return function() {
            a && clearTimeout(a);
            a = this._checkNarrow.bind(this).defer(200);
        };
    }(),
    _checkNarrow: function() {
        CSS.conditionClass(this.root, "uiNarrowSideNav", Vector2.getElementPosition(this.root).x < 20);
    },
    _ensureHover: function(a) {
        if (ua.ie() < 8) Bootloader.loadComponents("explicit-hover", function() {
            this._explicitHover.push(new ExplicitHover(this.root, a));
        }.bind(this));
    },
    uninstall: function() {
        if (this._installed) {
            this._installed = false;
            this._handlePageTransitions = false;
            this._arbiterSubscriptions.forEach(Arbiter.unsubscribe);
            this._eventHandlers.forEach(function(a) {
                a.remove();
            });
            this._explicitHover.forEach(function(a) {
                a.uninstall();
            });
        }
    },
    initSection: function(b, a) {
        this._initItems(a);
        this._initSection(b);
    },
    addItem: function(a, b) {
        this._initItem(a, b);
    },
    _initItems: function(b) {
        var a = function(c, e) {
            var d = this._initItem(c, e);
            $(c.children).forEach(function(f) {
                a(f, d);
            });
        }.bind(this);
        $A(b).forEach(function(c) {
            a(c, null);
        });
    },
    _initItem: function(a, d) {
        var b = this.items[a.id] = this._constructItem(a, d);
        if (b.equals(this.selected) || a.selected) this.setSelected(b);
        var c = b.getLinkNode();
        c && this._eventHandlers.push(Event.listen(c, "click", function(event) {
            return !this.editing;
        }.bind(this)));
        return b;
    },
    _initSection: function(a) {
        var b = this.sections[a.id] = this._constructSection(a);
        this._eventHandlers.push(Event.listen(b.node, "click", this.handleSectionClick.bind(this, b)));
        DOM.scry(b.node, "div.bookmarksMenuButton").forEach(CSS.show);
        return b;
    },
    _constructItem: function(a, b) {
        return new FutureSideNavItem(a, b);
    },
    _constructSection: function(a) {
        return new FutureSideNavSection(a);
    },
    handleSectionClick: function(c, event) {
        var b = this._getEventTarget(event, "a");
        var a = this._getItemForNode(b);
        if (!b) {
            return;
        } else if (CSS.hasClass(b.parentNode, "uiMenuItem")) {
            this._handleMenuClick(c, a, b.parentNode, event);
        } else this._handleLinkClick(c, b, event);
    },
    _getEventTarget: function(event, a) {
        var b = event.getTarget();
        if (b.tagName !== a.toUpperCase()) {
            return Parent.byTag(b, a);
        } else return b;
    },
    _handleMenuClick: function(c, a, b, event) {
        if (CSS.hasClass(b, "rearrange")) this.beginEdit(c);
    },
    _handleLinkClick: function(b, a, event) {
        if (CSS.hasClass(a, "navEditDone")) {
            this.editing ? this.endEdit() : this.beginEdit(b);
            event.kill();
        }
    },
    getItem: function(a) {
        if (this._isCurrentPath(a)) {
            return this._getItemForKey(this._getKey(a.getQueryData()) || this.defaultKey);
        } else return this._getItemForPath(a.getPath());
    },
    getNodeForKey: function(b) {
        var a = this._getItemForKey(b);
        if (a) return a.node;
    },
    _isCurrentPath: function(a) {
        return a.getDomain() === this.uri.getDomain() && a.getPath() === this.uri.getPath();
    },
    _getKey: function(a) {
        return a[this.keyParam];
    },
    _getItemForNode: function(a) {
        a = Parent.byClass(a, "sideNavItem");
        return a && this.items[a.id];
    },
    _getItemForKey: function(a) {
        return this._findItem(function(b) {
            return b.matchKey(a);
        });
    },
    _getItemForPath: function(a) {
        return this._findItem(function(b) {
            return b.matchPath(a);
        });
    },
    _findItem: function(a) {
        for (var b in this.items) if (a(this.items[b])) return this.items[b];
    },
    removeItem: function(a) {
        if (a && this.items[a.id]) {
            DOM.remove(a.node);
            delete this.items[a.id];
            if (a.getTop().equals(this.selected && this.selected.getTop())) goURI(URI.getRequestURI(), true);
        }
    },
    removeItemByKey: function(a) {
        this.removeItem(this._getItemForKey(a));
    },
    moveItem: function(d, b, c) {
        var a = DOM.find(d.node, "ul.uiSideNav");
        (c ? DOM.prependContent : DOM.appendContent)(a, b.node);
    },
    setLoading: function(a) {
        this.loading && this.loading.hideLoading();
        this.loading = a;
        this.loading && this.loading.showLoading();
    },
    setSelected: function(a) {
        this.setLoading(null);
        if (this.selected) {
            this.selected.hideSelected();
            this.selected.getTop().hideChildren();
        }
        this.selected = a;
        if (this.selected) {
            this.selected.showSelected();
            this.selected.getTop().showChildren();
        }
    },
    handlePageTransition: function(c) {
        var a = this.getItem(c);
        var b = a && a.endpoint && this._doPageTransition(a, c);
        if (b && Arbiter.inform("sidenav/scrolltop") !== false) DOMScroll.scrollTo(document.documentElement, false);
        return b;
    },
    _doPageTransition: function(a, b) {
        this.setLoading(a);
        this._sendPageTransition(a.endpoint, copy_properties(this._getTransitionData(a, b), b.getQueryData()));
        return true;
    },
    _sendPageTransition: function(b, a) {
        a.endpoint = b;
        Arbiter.inform(NavigationMessage.NAVIGATION_BEGIN, {
            useAjaxPipe: this._useAjaxPipe(b),
            params: a
        });
    },
    _getTransitionData: function(b, c) {
        var a = {};
        a.sidecol = this.sidecol;
        a.path = c.getPath();
        a[this.keyParam] = b.textKey;
        a.key = b.textKey;
        return a;
    },
    _useAjaxPipe: function(a) {
        return this.ajaxPipe || this.ajaxPipeEndpoints[a];
    },
    navigationComplete: function() {
        this.loading && this.setSelected(this.loading);
    },
    navigationFailed: function() {
        this.setLoading(null);
    },
    navigationSelect: function(c, a) {
        var b = this._getItemForKey(this._getKey(a));
        if (a.asLoading) {
            this.setLoading(b);
        } else this.setSelected(b);
    },
    navigationCountUpdate: function(c, a) {
        var b = this._getItemForKey(a && a.key);
        if (b) if (typeof a.count !== "undefined") {
            b.setCount(a.count, a.hide);
        } else if (typeof a.increment !== "undefined") b.incrementCount(a.increment, a.hide);
    },
    navigationCountUpdateFromPresence: function(b, a) {
        a = a.obj;
        if (a && a.class_name && CSS.hasClass(this.root, a.class_name)) this.navigationCountUpdate(b, a);
    },
    beginEdit: function(a) {
        if (!this.editing) {
            this.editing = true;
            CSS.addClass(this.root, "editMode");
            this._updateTrackingData();
            Bootloader.loadComponents("sortable-side-nav-js", this._initEditor.bind(this, a));
        }
    },
    endEdit: function() {
        if (this.editing) {
            CSS.removeClass(this.root, "editMode");
            this.editor.endEdit();
            this.editor = null;
            this.editing = false;
            this._updateTrackingData();
        }
    },
    _updateTrackingData: function(a) {
        var c = this.root.getAttribute("data-gt") || "{}";
        try {
            c = JSON.parse(c);
            if (this.editing) {
                c.editing = true;
            } else delete c.editing;
            this.root.setAttribute("data-gt", JSON.stringify(c));
        } catch (b) {}
    },
    _initEditor: function(a) {
        this.editor = a.getEditor();
        this.editor.beginEdit();
    }
};

function FutureSideNavSection(a) {
    this.id = a.id;
    this.node = this.node || $(a.id);
    this.editEndpoint = a.editEndpoint;
}

FutureSideNavSection.prototype = {
    equals: function(a) {
        return a && a.id === this.id;
    },
    getEditor: function() {
        return new SortableSideNav(DOM.find(this.node, "ul.uiSideNav"), this.editEndpoint);
    }
};

function FutureSideNavItem(a, c) {
    this.id = a.id;
    this.up = c;
    this.endpoint = a.endpoint;
    this.type = a.type;
    this.node = a.node || $(a.id);
    this.paths = a.path ? $A(a.path) : [];
    this.keys = a.key ? $A(a.key) : [];
    var b = this._findKeys(this.keys);
    this.numericKey = b.numeric || this.keys[0];
    this.textKey = b.text || this.keys[0];
    this._pathPattern = this._buildRegex(this.paths);
    this._keyPattern = this._buildRegex(this.keys);
    this.hideLoading();
    this.hideSelected();
}

FutureSideNavItem.prototype = {
    equals: function(a) {
        return a && a.id === this.id;
    },
    getLinkNode: function() {
        return DOM.scry(this.node, "a.item")[0] || DOM.scry(this.node, "a.subitem")[0];
    },
    matchPath: function(a) {
        return this._matchInput(this._pathPattern, a);
    },
    matchKey: function(a) {
        return this._matchInput(this._keyPattern, a);
    },
    _matchInput: function(c, a) {
        var b = c && c.exec(a);
        return b && b.slice(1);
    },
    getTop: function() {
        return this.isTop() ? this : this.up.getTop();
    },
    isTop: function(a) {
        return !this.up;
    },
    setCount: function(a, b) {
        return this._updateCount(a, true);
    },
    incrementCount: function(a, b) {
        return this._updateCount(a, false);
    },
    _updateCount: function(a, h, e) {
        var c = DOM.scry(this.node, "span.count")[0];
        var d = c && DOM.scry(c, "span.countValue")[0];
        if (d) {
            var b = h ? 0 : parseInt(DOM.getText(d), 10);
            var i = Math.max(0, b + a);
            var f = this.isTop() ? "hidden" : "hiddenSubitem";
            DOM.setContent(d, i);
            e && CSS.conditionClass(this.node, f, !i);
            CSS.conditionClass(c, "hidden_elem", !i);
            if (this.isTop()) {
                var g = DOM.scry(this.node, "div.linkWrap")[0];
                if (g) {
                    CSS.conditionClass(g, "noCount", !i);
                    CSS.conditionClass(g, "hasCount", i);
                }
            }
        }
    },
    showLoading: function() {
        CSS.addClass(this.node, "loading");
    },
    hideLoading: function() {
        CSS.removeClass(this.node, "loading");
    },
    showSelected: function() {
        CSS.addClass(this.node, "selectedItem");
        CSS.hasClass(this.node, "hider") && CSS.addClass(this._getExpanderParent(), "expandedMode");
    },
    hideSelected: function() {
        CSS.removeClass(this.node, "selectedItem");
    },
    showChildren: function() {
        CSS.addClass(this.node, "open");
    },
    hideChildren: function() {
        CSS.removeClass(this.node, "open");
    },
    _getExpanderParent: function() {
        return Parent.byClass(this.node, "expandableSideNav");
    },
    _buildRegex: function(a) {
        if (a.length) {
            var b = a.map(function(c) {
                if (typeof c === "string") {
                    return c.replace(/([^a-z0-9_])/ig, "\\$1");
                } else if (c.regex) return c.regex;
            });
            return new RegExp("^(?:" + b.join("|") + ")$");
        }
    },
    _findKeys: function(c) {
        var e = /^(app|group|fl)_/;
        var a = {};
        for (var b = 0; b < c.length; b++) {
            var d = e.test(c[b]);
            if (d && !a.numeric) {
                a.numeric = c[b];
            } else if (!d && !a.text) a.text = c[b];
            if (a.numeric && a.text) break;
        }
        return a;
    }
};

function DataSource(a) {
    this._maxResults = a.maxResults || 10;
    this.token = a.token;
    this.queryData = a.queryData || {};
    this.queryEndpoint = a.queryEndpoint || "";
    this.bootstrapData = a.bootstrapData || {};
    this.bootstrapEndpoint = a.bootstrapEndpoint || "";
    this._exclusions = a.exclusions || [];
    this._indexedFields = a.indexedFields || [ "text", "tokens" ];
    this._minExactMatchLength = 4;
}

Class.mixin(DataSource, "Arbiter", {
    events: [ "activity", "query", "respond" ],
    init: function() {
        this.init = bagofholding;
        this._fields = Object.from(this._indexedFields);
        this._activeQueries = 0;
        this.dirty();
    },
    dirty: function() {
        this.value = "";
        this._bootstrapped = false;
        this._data = {};
        this.localCache = {};
        this.queryCache = {};
    },
    bootstrap: function() {
        if (this._bootstrapped) return;
        this.fetch(this.bootstrapEndpoint, this.bootstrapData, {
            token: this.token
        });
        this._bootstrapped = true;
    },
    query: function(f, c, a) {
        this.inform("beforeQuery", {
            value: f
        });
        var e = this.buildUids(f, [], a);
        var d = this.respond(f, e);
        this.value = f;
        this.inform("query", {
            value: f,
            results: d
        });
        var b = TypeaheadUtil.parse(f).flatValue;
        if (c || !b || !this.queryEndpoint || this.getQueryCache().hasOwnProperty(b) || !this.shouldFetchMoreResults(d)) return false;
        this.inform("queryEndpoint", {
            value: f
        });
        this.fetch(this.queryEndpoint, this.getQueryData(f, e), {
            value: f,
            exclusions: a
        });
        return true;
    },
    shouldFetchMoreResults: function(a) {
        return a.length < this._maxResults;
    },
    getQueryData: function(c, b) {
        var a = copy_properties({
            value: c
        }, this.queryData || {});
        b = b || [];
        if (b.length) a.existing_ids = b.join(",");
        return a;
    },
    setQueryData: function(a, b) {
        if (b) this.queryData = {};
        copy_properties(this.queryData, a);
        return this;
    },
    getExclusions: function() {
        return $A(this._exclusions);
    },
    setExclusions: function(a) {
        this._exclusions = a || [];
    },
    setFilter: function(a) {
        this.filter = a;
    },
    respond: function(d, c, a) {
        var b = this.buildData(c);
        this.inform("respond", {
            value: d,
            results: b,
            isAsync: !!a
        });
        return b;
    },
    asyncErrorHandler: bagofholding,
    fetch: function(c, b, d) {
        if (!c) return;
        var a = (new AsyncRequest).setURI(c).setData(b).setMethod("GET").setReadOnly(true).setHandler(function(e) {
            this.fetchHandler(e, d || {});
        }.bind(this)).setFinallyHandler(function() {
            this._activeQueries--;
            if (!this._activeQueries) this.inform("activity", {
                activity: false
            });
        }.bind(this));
        a.setErrorHandler(this.asyncErrorHandler);
        this.inform("beforeFetch", {
            request: a
        });
        a.send();
        if (!this._activeQueries) this.inform("activity", {
            activity: true
        });
        this._activeQueries++;
    },
    fetchHandler: function(d, c) {
        var e = c.value;
        var b = c.exclusions;
        if (!e && c.replaceCache) this.localCache = {};
        this.addEntries(d.getPayload().entries, e);
        this.inform("fetchComplete", {
            response: d,
            value: e
        });
        this.respond(e, this.buildUids(e, [], b), true);
        if (!e && c.token && d.getPayload().token !== c.token) {
            var a = copy_properties({}, this.bootstrapData);
            a.token = this.token;
            this.fetch(this.bootstrapEndpoint, a, {
                replaceCache: true
            });
        }
    },
    addEntries: function(b, e) {
        var c = this.processEntries($A(b || []), e);
        var a = this.buildUids(e, c);
        if (e) {
            var d = this.getQueryCache();
            d[TypeaheadUtil.parse(e).flatValue] = a;
        } else this.fillCache(a);
    },
    processEntries: function(a, b) {
        return a.map(function(e, d) {
            var f = e.uid = e.uid + "";
            var c = this.getEntry(f);
            if (!c) {
                c = e;
                c.query = b;
                this.setEntry(f, c);
            } else copy_properties(c, e);
            c.index === undefined && (c.index = d);
            return f;
        }, this);
    },
    getAllEntries: function() {
        return this._data || {};
    },
    getEntry: function(a) {
        return this._data[a] || null;
    },
    setEntry: function(b, a) {
        this._data[b] = a;
    },
    fillCache: function(b) {
        var a = this.localCache;
        b.each(function(g) {
            var d = this.getEntry(g);
            if (!d) return;
            d.bootstrapped = true;
            var f = TypeaheadUtil.parse(this.getTextToIndex(d)).tokens;
            for (var c = 0, e = f.length; c < e; ++c) {
                var h = f[c];
                if (!a.hasOwnProperty(h)) a[h] = {};
                a[h][g] = true;
            }
        }, this);
    },
    getTextToIndex: function(c) {
        if (c.textToIndex) return c.textToIndex;
        var d = [];
        for (var b in this._fields) {
            var a = c[b];
            if (a) d.push(a.join ? a.join(" ") : a);
        }
        return c.textToIndex = d.join(" ");
    },
    mergeUids: function(a, c, b, e) {
        var d = function(f, g) {
            return this.getEntry(f).index - this.getEntry(g).index;
        }.bind(this);
        return a.sort(d).concat(c, b);
    },
    buildUids: function(h, d, a) {
        if (!d) d = [];
        if (!h) return d;
        if (!a) a = [];
        var b = this.buildCacheResults(h, this.localCache);
        var f = this.buildQueryResults(h);
        var e = this.mergeUids(b, f, d, h);
        var g = Object.from(a.concat(this._exclusions));
        var c = e.filter(function(i) {
            if (g.hasOwnProperty(i) || !this.getEntry(i)) return false;
            if (this.filter && !this.filter(this.getEntry(i))) return false;
            return g[i] = true;
        }, this);
        return this.uidsIncludingExact(h, c, g);
    },
    uidsIncludingExact: function(g, d, f) {
        var e = d.length;
        if (g.length < this._minExactMatchLength || e <= this._maxResults) return d;
        for (var c = 0; c < e; ++c) {
            var a = this.getEntry(d[c]);
            a.text_lower || (a.text_lower = a.text.toLowerCase());
            if (a.text_lower === TypeaheadUtil.parse(g).flatValue) {
                if (c >= this._maxResults) {
                    var b = d.splice(c, 1);
                    d.splice(this._maxResults - 1, 0, b);
                }
                break;
            }
        }
        return d;
    },
    buildData: function(d) {
        var c = [];
        var b = Math.min(d.length, this._maxResults);
        for (var a = 0; a < b; ++a) c.push(this.getEntry(d[a]));
        return c;
    },
    findQueryCache: function(e) {
        var b = 0;
        var a = null;
        var d = this.getQueryCache();
        for (var c in d) if (e.indexOf(c) == 0 && c.length > b) {
            b = c.length;
            a = c;
        }
        return d[a] || [];
    },
    buildQueryResults: function(c) {
        var a = TypeaheadUtil.parse(c).flatValue;
        var b = this.findQueryCache(a);
        if (this.getQueryCache().hasOwnProperty(a)) return b;
        return this.filterQueryResults(c, b);
    },
    filterQueryResults: function(b, a) {
        return a.filter(function(c) {
            return TypeaheadUtil.isQueryMatch(b, this.getTextToIndex(this.getEntry(c)));
        }, this);
    },
    buildCacheResults: function(m, a) {
        var i = TypeaheadUtil.parse(m);
        var g = i.tokens.length;
        var h = i.isPrefixQuery ? g - 1 : null;
        var d = {};
        var l = {};
        var e = [];
        for (var c = 0; c < g; ++c) {
            var j = i.tokens[c];
            for (var f in a) if (!d.hasOwnProperty(f) && (f === j || h === c && f.indexOf(j) === 0)) {
                d[f] = true;
                for (var k in a[f]) if (c === 0 || l.hasOwnProperty(k) && l[k] == c) l[k] = c + 1;
            }
        }
        for (var b in l) if (l[b] == g) e.push(b);
        return e;
    },
    getQueryCache: function() {
        return this.queryCache;
    },
    setMaxResults: function(a) {
        this._maxResults = a;
        this.value && this.respond(this.value, this.buildUids(this.value));
    },
    updateToken: function(a) {
        this.token = a;
        this.dirty();
        return this;
    }
});

function Typeahead(b, d, a, c) {
    this.args = {
        data: b,
        view: d,
        core: a
    };
    DataStore.set(c, "Typeahead", this);
    this.element = c;
}

Typeahead.getInstance = function(a) {
    var b = Parent.byClass(a, "uiTypeahead");
    return b ? DataStore.get(b, "Typeahead") : null;
};

Class.mixin(Typeahead, "Arbiter", {
    init: function(a) {
        this.init = bagofholding;
        this.getCore();
        this.proxyEvents();
        this.initBehaviors(a || []);
        this.inform("init", this);
        this.data.bootstrap();
        this.core.focus();
    },
    getData: function() {
        if (!this.data) {
            var a = this.args.data;
            this.data = a;
            this.data.init();
        }
        return this.data;
    },
    getView: function() {
        if (!this.view) {
            var a = this.args.view;
            var b = ge(a.node_id);
            if (!b) {
                b = $N("div", {
                    className: "uiTypeaheadView"
                });
                DOM.appendContent(this.element, b);
            }
            this.view = new window[a.ctor](b, a.options || {});
            this.view.init();
        }
        return this.view;
    },
    getCore: function() {
        if (!this.core) {
            var a = this.args.core;
            this.core = new window[a.ctor](a.options || {});
            this.core.init(this.getData(), this.getView(), this.getElement());
        }
        return this.core;
    },
    getElement: function() {
        return this.element;
    },
    swapData: function(b) {
        var a = this.core;
        this.data = this.args.data = b;
        b.init();
        if (a) {
            a.data = b;
            a.initData();
            a.reset();
        }
        b.bootstrap();
        return b;
    },
    proxyEvents: function() {
        [ this.data, this.view, this.core ].each(function(a) {
            a.subscribe(a.events, this.inform.bind(this));
        }, this);
    },
    initBehaviors: function(a) {
        if (window.TypeaheadBehaviors) a.each(function(b) {
            (TypeaheadBehaviors[b] || bagofholding)(this);
        }, this);
    }
});

function TypeaheadCore(a) {
    copy_properties(this, a);
}

Class.mixin(TypeaheadCore, "Arbiter", {
    events: [ "blur", "focus", "unselect" ],
    keepFocused: true,
    resetOnSelect: false,
    resetOnKeyup: true,
    setValueOnSelect: false,
    queryTimeout: 250,
    preventFocusChangeOnTab: false,
    init: function(b, d, c) {
        this.init = bagofholding;
        this.data = b;
        this.view = d;
        this.root = c;
        this.element = DOM.find(c, ".textInput");
        var a = DOM.scry(this.element, "input")[0];
        if (a) this.element = a;
        this.inputWrap = DOM.find(c, "div.wrap");
        this.hiddenInput = DOM.find(c, "input.hiddenInput");
        this.value = "";
        this.selectedText = null;
        if (this.setValueOnSelect && CSS.hasClass(this.inputWrap, "selected")) this.selectedText = this.getValue();
        this.initView();
        this.initData();
        this.initEvents();
        this.initToggle();
        this._exclusions = [];
    },
    initView: function() {
        this.view.subscribe("highlight", function() {
            this.element.focus();
        }.bind(this));
        this.view.subscribe("select", function(a, b) {
            this.select(b.selected);
        }.bind(this));
        this.view.subscribe("afterSelect", function() {
            this.afterSelect();
        }.bind(this));
    },
    initData: function() {
        this.data.subscribe("respond", function(a, b) {
            if (b.forceDisplay || b.value == this.getValue() && !this.element.disabled) this.view.render(b.value, b.results, b.isAsync);
        }.bind(this));
        this.data.subscribe("activity", function(a, b) {
            this.fetching = b.activity;
            if (!this.fetching) this.nextQuery && this.performQuery();
        }.bind(this));
    },
    initEvents: function() {
        Event.listen(this.view.getElement(), {
            mouseup: this.viewMouseup.bind(this),
            mousedown: this.viewMousedown.bind(this)
        });
        var a = {
            blur: bind(this, "blur"),
            focus: bind(this, "focus"),
            click: bind(this, "click"),
            keyup: bind(this, "keyup"),
            keydown: bind(this, "keydown")
        };
        if (ua.firefox()) a.text = a.keyup;
        if (ua.firefox() < 4) {
            a.keypress = a.keydown;
            delete a.keydown;
        }
        Event.listen(this.element, a);
        Event.listen(this.element, "keypress", this.keypress.bind(this));
    },
    initToggle: function() {
        var b = this.root.parentNode;
        var d = CSS.getStyle(b, "position") != "static" ? b : this.root;
        var c = this.view;
        var a = "uiTypeaheadFocused";
        this.subscribe("focus", function() {
            c.show();
            CSS.addClass(d, a);
        });
        this.subscribe("blur", function() {
            c.hide();
            CSS.removeClass(d, a);
        });
    },
    viewMousedown: function() {
        this.selecting = true;
    },
    viewMouseup: function() {
        this.selecting = false;
    },
    blur: function() {
        if (this.selecting) {
            this.selecting = false;
            return;
        }
        this.inform("blur");
    },
    click: function() {
        this.element.select();
    },
    focus: function() {
        this.checkValue();
        this.inform("focus");
    },
    keyup: function() {
        if (this.resetOnKeyup && !this.getValue()) this.view.reset();
        this.checkValue();
    },
    keydown: function(event) {
        if (!this.view.isVisible() || this.view.isEmpty()) {
            this.checkValue.bind(this).defer();
            return;
        }
        switch (Event.getKeyCode(event)) {
          case KEYS.TAB:
            this.handleTab(event);
            return;
          case KEYS.UP:
            this.view.prev();
            break;
          case KEYS.DOWN:
            this.view.next();
            break;
          case KEYS.ESC:
            this.view.reset();
            break;
          default:
            this.checkValue.bind(this).defer();
            return;
        }
        event.kill();
    },
    keypress: function(event) {
        if (this.view.getSelection() && Event.getKeyCode(event) == KEYS.RETURN) {
            this.view.select();
            event.kill();
        }
    },
    handleTab: function(event) {
        this.view.select();
        this.preventFocusChangeOnTab && event.kill();
    },
    select: function(a) {
        if (a && this.setValueOnSelect) {
            this.setValue(a.text);
            this.setHiddenValue(a.uid);
            this.selectedText = a.text;
            CSS.addClass(this.inputWrap, "selected");
        }
    },
    afterSelect: function() {
        this.resetOnSelect ? this.reset() : this.view.reset();
        this.keepFocused ? this.element.focus() : this.element.blur();
    },
    unselect: function() {
        if (this.setValueOnSelect) {
            this.selectedText = null;
            CSS.removeClass(this.inputWrap, "selected");
        }
        this.setHiddenValue();
        this.inform("unselect", this);
    },
    setEnabled: function(b) {
        var a = b === false;
        this.element.disabled = a;
        CSS.conditionClass(this.root, "uiTypeaheadDisabled", a);
    },
    reset: function() {
        this.unselect();
        this.setValue();
        !this.keepFocused && Input.reset(this.element);
        this.view.reset();
        this.inform("reset");
    },
    getElement: function() {
        return this.element;
    },
    setExclusions: function(a) {
        this._exclusions = a;
    },
    getExclusions: function() {
        return this._exclusions;
    },
    setValue: function(a) {
        this.value = this.nextQuery = a || "";
        Input.setValue(this.element, this.value);
    },
    setHiddenValue: function(a) {
        this.hiddenInput.value = a || a === 0 ? a : "";
        Arbiter.inform("Form/change", {
            node: this.hiddenInput
        });
    },
    getValue: function() {
        return Input.getValue(this.element);
    },
    getHiddenValue: function() {
        return this.hiddenInput.value || "";
    },
    checkValue: function() {
        var c = this.getValue();
        if (c == this.value) return;
        if (this.selectedText && this.selectedText != c) this.unselect();
        var b = +(new Date);
        var a = b - this.time;
        this.time = b;
        this.value = this.nextQuery = c;
        this.performQuery(a);
    },
    performQuery: function(a) {
        if (this.selectedText) return;
        a = a || 0;
        if (this.fetching && a < this.queryTimeout) {
            this.data.query(this.nextQuery, true, this._exclusions);
        } else {
            this.data.query(this.nextQuery, false, this._exclusions);
            this.nextQuery = null;
        }
    }
});

function TypeaheadAreaCore(a) {
    this.parent.construct(this, a);
    this.matcher = new RegExp(this.matcher + "$");
    this.preventFocusChangeOnTab = true;
}

Class.extend(TypeaheadAreaCore, "TypeaheadCore");

TypeaheadAreaCore.prototype = {
    prefix: "",
    suffix: ", ",
    matcher: "\\b[^,]*",
    click: bagofholding,
    select: function(a) {
        this.parent.select(a);
        var e = this.element.value;
        var d = this.prefix + a.text + this.suffix;
        this.expandBounds(e, d);
        var b = e.substring(0, this.start);
        var c = e.substring(this.end);
        this.element.value = b + d + c;
        Input.setSelection(this.element, b.length + d.length);
    },
    expandBounds: function(g, f) {
        g = g.toLowerCase().trim();
        f = f.toLowerCase();
        var b, e, c, d;
        var a = /\s/;
        e = g.substring(this.start, this.end);
        c = f.indexOf(e);
        b = this.start;
        while (b >= 0 && c >= 0) {
            d = g.charAt(b - 1);
            if (!d || a.test(d)) this.start = b;
            e = d + e;
            c = f.indexOf(e);
            b--;
        }
        e = g.substring(this.start, this.end);
        c = f.indexOf(e);
        b = this.end;
        while (b <= g.length && c >= 0) {
            d = g.charAt(b);
            if (!d || a.test(d)) this.end = b;
            e = e + d;
            c = f.indexOf(e);
            b++;
        }
    },
    getRawValue: function() {
        var a = Input.getSelection(this.element).start || 0;
        return this.parent.getValue().substring(0, a);
    },
    getValue: function() {
        var a = this.matcher && this.matcher.exec(this.getRawValue());
        if (!a) return "";
        this.start = a.index;
        this.end = a.index + a[0].length;
        return a[1] || a[0];
    }
};

function TypeaheadView(a, b) {
    this.element = this.content = $(a);
    copy_properties(this, b);
}

Class.mixin(TypeaheadView, "Arbiter", {
    events: [ "highlight", "render", "reset", "select" ],
    renderer: "basic",
    autoSelect: false,
    init: function() {
        this.init = bagofholding;
        this.initializeEvents();
        this.reset();
    },
    initializeEvents: function() {
        Event.listen(this.element, {
            mouseup: this.mouseup.bind(this),
            mouseover: this.mouseover.bind(this)
        });
    },
    getElement: function() {
        return this.element;
    },
    mouseup: function(event) {
        this.select(true);
        event.kill();
    },
    mouseover: function(event) {
        if (this.visible) this.highlight(this.getIndex(event));
    },
    reset: function(a) {
        if (!a) this.disableAutoSelect = false;
        this.index = -1;
        this.items = [];
        this.results = [];
        this.value = "";
        this.content.innerHTML = "";
        this.inform("reset");
        return this;
    },
    getIndex: function(event) {
        return this.items.indexOf(Parent.byTag(event.getTarget(), "li"));
    },
    getSelection: function() {
        var a = this.results[this.index] || null;
        return this.visible ? a : null;
    },
    isEmpty: function() {
        return !this.results.length;
    },
    isVisible: function() {
        return this.visible;
    },
    show: function() {
        CSS.show(this.element);
        this.visible = true;
        return this;
    },
    hide: function() {
        CSS.hide(this.element);
        this.visible = false;
        return this;
    },
    render: function(h, e, f) {
        this.value = h;
        if (!e.length) {
            this.reset(true);
            return;
        }
        var c = {
            results: e,
            value: h
        };
        this.inform("beforeRender", c);
        e = c.results;
        var d = this.getDefaultIndex(e);
        if (this.index > 0 && this.index !== this.getDefaultIndex(this.results)) {
            var a = this.results[this.index];
            for (var b = 0, g = e.length; b < g; ++b) if (a.uid == e[b].uid) {
                d = b;
                break;
            }
        }
        this.results = e;
        DOM.setContent(this.content, this.buildResults(e));
        this.items = this.getItems();
        this.highlight(d, false);
        this.inform("render", e);
    },
    getItems: function() {
        return DOM.scry(this.content, "li");
    },
    buildResults: function(d) {
        var c;
        var a = null;
        if (typeof this.renderer == "function") {
            c = this.renderer;
        } else {
            c = TypeaheadRenderers[this.renderer];
            a = this.renderer;
        }
        c = c.bind(this);
        var b = d.map(function(e, f) {
            return e.node || c(e, f);
        });
        return $N("ul", {
            className: a
        }, b);
    },
    getDefaultIndex: function(b) {
        var a = this.autoSelect && !this.disableAutoSelect;
        return this.index < 0 && !a ? -1 : 0;
    },
    next: function() {
        this.highlight(this.index + 1);
    },
    prev: function() {
        this.highlight(this.index - 1);
    },
    highlight: function(a, b) {
        this.selected && CSS.removeClass(this.selected, "selected");
        if (a > this.items.length - 1) {
            a = -1;
        } else if (a < -1) a = this.items.length - 1;
        if (a >= 0 && a < this.items.length) {
            this.selected = this.items[a];
            CSS.addClass(this.selected, "selected");
        }
        this.index = a;
        this.disableAutoSelect = a == -1;
        if (b !== false) this.inform("highlight", {
            index: a,
            selected: this.results[a]
        });
    },
    select: function(a) {
        var b = this.index;
        var c = this.results[b];
        if (c) {
            this.inform("select", {
                index: b,
                clicked: !!a,
                selected: c
            });
            this.inform("afterSelect");
        }
    }
});

add_properties("TypeaheadBehaviors", {
    hoistFriends: function(a) {
        var b = a.getView();
        b.subscribe("beforeRender", function(c, f) {
            var g = [];
            var d = [];
            for (var e = 0; e < f.results.length; ++e) {
                var h = f.results[e];
                if (h.type == "user" && h.bootstrapped) {
                    d.push(h);
                } else g.push(h);
            }
            f.results = d.concat(g);
        });
    }
});

add_properties("TypeaheadRenderers", {
    compact: function(c, d) {
        var e = [];
        var f = c.photo;
        if (f) {
            if (f instanceof Array) {
                f = $N("span", {
                    className: "splitpics clearfix"
                }, [ $N("span", {
                    className: "splitpic leftpic"
                }, [ $N("img", {
                    alt: "",
                    src: f[0]
                }) ]), $N("span", {
                    className: "splitpic"
                }, [ $N("img", {
                    alt: "",
                    src: f[1]
                }) ]) ]);
            } else f = $N("img", {
                alt: "",
                src: f
            });
            e.push(f);
        }
        if (c.text) e.push($N("span", {
            className: "text"
        }, [ c.text ]));
        var g = c.subtext;
        var a = c.category;
        if (g || a) {
            var b = [];
            g && b.push(g);
            g && a && b.push(" · ");
            a && b.push(a);
            e.push($N("span", {
                className: "subtext"
            }, b));
        }
        return $N("li", {
            className: c.type || ""
        }, e);
    }
});