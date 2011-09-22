if (window.CavalryLogger) {
    CavalryLogger.start_js([ "6/rff" ]);
}

add_properties("Hovercard", {
    ARROW_LEFT_OFFSET: 32,
    RESERVED_WIDTH: 297,
    RESERVED_HEIGHT: 237,
    cache: {},
    contextElem: null,
    fetchDelay: 150,
    showDelay: 700,
    loadingDelay: 1e3,
    hideDelay: 250,
    fetchTimer: null,
    showTimer: null,
    loadingTimer: null,
    hideTimer: null,
    build: function() {
        this.build = bagofholding;
        var c = $N("div", {
            className: "arrow"
        }, $N("i"));
        this.loading = $N("div", {
            className: "loading"
        }, _tx("Chargement..."));
        this.stage = $N("div", {
            className: "stage"
        });
        this.preload = $N("div", {
            id: "hovercardPreload"
        }, this.loading);
        this.overlay = $N("div", {
            className: "HovercardOverlay"
        });
        this.container = $N("div", {
            className: "hovercard clearfix"
        }, [ this.stage, c ]);
        Event.listen(this.container, "mouseleave", bind(this, "hide", false));
        Event.listen(this.container, "mouseenter", function() {
            clearTimeout(this.hideTimer);
        }.bind(this));
        Event.listen(window, "scroll", bind(this, "hide", true));
        var a = null;
        var b = [];
        Arbiter.subscribe("Overlay/show", function(d, e) {
            var f = e.overlay;
            if (f.getContext) if (DOM.contains(this.container, f.getContext())) {
                while (b.length) a.unsubscribe(b.pop());
                a = f;
                b = [ f.subscribe("mouseenter", function() {
                    clearTimeout(this.hideTimer);
                }.bind(this)), f.subscribe("mouseleave", bind(this, "hide", false)) ];
            }
        }.bind(this));
        Arbiter.subscribe("Overlay/hide", function(d, e) {
            if (a === e.overlay) {
                while (b.length) a.unsubscribe(b.pop());
                a = null;
            }
        }.bind(this));
        Arbiter.subscribe("page_transition", function() {
            this.abort();
            this.dirtyAll();
        }.bind(this), Arbiter.SUBSCRIBE_NEW);
        Arbiter.subscribe("layer_shown", function(d, e) {
            e.type != "Hovercard" && e.type != "Overlay" && this.abort();
        }.bind(this), Arbiter.SUBSCRIBE_NEW);
        document.body.appendChild(this.preload);
    },
    process: function(b) {
        var d = Event.listen(b, "mouseout", function() {
            clearTimeout(this.fetchTimer);
            clearTimeout(this.showTimer);
            d.remove();
            this.hide();
        }.bind(this));
        if (!this.active.moveToken) this.active.moveToken = Event.listen(b, "mousemove", function(event) {
            this.active.pos = Vector2.getEventPosition(event);
        }.bind(this));
        clearTimeout(this.fetchTimer);
        clearTimeout(this.showTimer);
        clearTimeout(this.hideTimer);
        var a = this.fetchDelay;
        var c = this.contextElem ? this.hideDelay : this.showDelay;
        if (b.getAttribute("data-hovercard-instant")) a = c = 50;
        this.fetchTimer = setTimeout(this.fetch.bind(this, b), a);
        this.showTimer = setTimeout(this.show.bind(this, b), c);
    },
    show: function(c, b) {
        this.build();
        if (this.active.node != c) return;
        var a;
        if (this.cache[this.getEndpoint(c)]) {
            a = this.cache[this.getEndpoint(c)];
        } else if (b) {
            a = {
                content: "",
                node: this.loading
            };
        } else {
            var d = this.contextElem ? this.hideDelay : this.showDelay;
            this.loadingTimer = setTimeout(this.show.bind(this, c, true), this.loadingDelay - d);
        }
        a && this.update(a);
    },
    hide: function(a) {
        if (!this.contextElem) return;
        if (a) {
            Arbiter.inform("layer_hidden", {
                type: "Hovercard"
            });
            Arbiter.inform("Hovercard/hide", {
                node: this.contextElem
            });
            if (this.stage && this.stage.firstChild) this.preload.appendChild(this.stage.firstChild);
            var b = this.container && this.container.parentNode;
            b && b.removeChild(this.container);
            this.contextElem = null;
        } else this.hideTimer = setTimeout(this.hide.bind(this, true), this.hideDelay);
    },
    abort: function() {
        this.hide(true);
        clearTimeout(this.showTimer);
        clearTimeout(this.loadingTimer);
    },
    update: function(a) {
        var g = this.contextElem;
        var f = this.stage.firstChild;
        var h = f === this.loading;
        if (f) this.preload.appendChild(f);
        var b = a.node;
        var c = b && b.getAttribute("data-hovercard-layout");
        this.container.className = "hovercard";
        c && CSS.addClass(this.container, c);
        var d = this.active.node;
        var e = d != g && !h;
        if (e) (function() {
            (new AsyncSignal("/ajax/hovercard/shown.php")).send();
            report_data("himp", {
                ft: {
                    evt: 39
                }
            });
        }).defer();
        this.stage.appendChild(b);
        this.position(d, d.getAttribute("data-hovercard-fixed"));
        this.overlay.appendChild(this.container);
        document.body.appendChild(this.overlay);
        this.contextElem = d;
        if (e) {
            if (g) {
                Arbiter.inform("Hovercard/hide", {
                    node: g
                });
            } else Arbiter.inform("layer_shown", {
                type: "Hovercard"
            });
            Arbiter.inform("Hovercard/show", {
                node: d
            });
        }
    },
    position: function(f, e) {
        if (!this.wCheck && e) {
            this.wCheck = $N("div", {
                className: "HovercardWidthCheck"
            });
            document.body.appendChild(this.wCheck);
        }
        var h;
        var c = this.wCheck && e ? this.wCheck.offsetWidth : 0;
        var b = this.getBounds(f);
        var i = b.getPositionVector().convertTo("viewport");
        var a = i.y < this.RESERVED_HEIGHT;
        var j = Vector2.getViewportDimensions();
        var g = (c || j.x) < this.RESERVED_WIDTH + b.l;
        var d = g ? c - b.r : b.l;
        if (b.w() < 2 * this.ARROW_LEFT_OFFSET) d += b.w() / 2 - this.ARROW_LEFT_OFFSET;
        if (a) {
            h = e ? i.y + b.h() : b.b;
        } else h = e ? j.y - i.y : -b.t;
        CSS.conditionClass(this.container, "HovercardFromRight", g);
        CSS.conditionClass(this.container, "HovercardBelow", a);
        CSS.conditionClass(this.container, "HovercardFixed", e);
        CSS.setStyle(this.container, g ? "right" : "left", d + "px");
        CSS.setStyle(this.container, g ? "left" : "right", "auto");
        CSS.setStyle(this.container, a ? "top" : "bottom", h + "px");
        CSS.setStyle(this.container, a ? "bottom" : "top", "auto");
    },
    getBounds: function(e) {
        var a = this.active.pos;
        var h = e.getClientRects();
        if (!a || h.length === 0) return Rect.getElementBounds(e);
        var b;
        var c = false;
        for (var d = 0; d < h.length; d++) {
            var g = (new Rect(Math.round(h[d].top), Math.round(h[d].right), Math.round(h[d].bottom), Math.round(h[d].left), "viewport")).convertTo("document");
            var f = g.getPositionVector();
            var i = f.add(g.getDimensionVector());
            if (!b || f.x <= b.l && f.y > b.t) {
                if (c) break;
                b = new Rect(f.y, i.x, i.y, f.x, "document");
            } else {
                b.t = Math.min(b.t, f.y);
                b.b = Math.max(b.b, i.y);
                b.r = i.x;
            }
            if (g.contains(a)) c = true;
        }
        return b;
    },
    fetch: function(d, a) {
        a = typeof a === "function" ? a : bagofholding;
        if (d.id && this.cache[d.id] != null) return a();
        var b = this.getEndpoint(d);
        if (this.cache[b] != null) return a();
        this.setFetchInProgress(b);
        var c = function() {
            this.dirty(b);
            this.abort();
        }.bind(this);
        (new AsyncRequest(b)).setMethod("GET").setReadOnly(true).setHandler(function(f) {
            var e = f.getPayload();
            if (!e || !e.content) {
                c();
                return;
            }
            e.node = HTML(e.content).getRootNode();
            delete e.content;
            this.setCache(b, e);
        }.bind(this)).setErrorHandler(c).setTransportErrorHandler(c).setFinallyHandler(a).send();
    },
    setFetchInProgress: function(a) {
        this.cache[a] = false;
    },
    setCache: function(b, a) {
        this.build();
        this.cache[b] = a;
        if (this.active.endpoint == b && this.contextElem) {
            this.update(a);
        } else DOM.appendContent(this.preload, a.node);
    },
    contains: function(a) {
        return DOM.contains(this.stage, a);
    },
    dirty: function(b) {
        var a = this.cache[b];
        var c = a.node;
        var d = c && c.parentNode;
        d && d.removeChild(c);
        delete this.cache[b];
    },
    dirtyAll: function() {
        for (var b in this.cache) {
            var a = this.cache[b];
            a && !a.cachepermanently && this.dirty(b);
        }
    }
});

var HovercardLoader = {
    loadAll: function(a) {
        a = $(a || "content");
        var e = {};
        var g = {};
        var c = DOM.scry(a, "a[data-hovercard]");
        for (var f = 0; f < c.length; f++) {
            var d = c[f].getAttribute("data-hovercard");
            if (Hovercard.cache[d] == null) {
                var b = URI(d).getQueryData();
                if (b.id) {
                    e[d] = b.id;
                    if (b.type) g[b.id] = b.type;
                }
            }
        }
        if (!is_empty(e)) this._multifetch(e, g);
    },
    _multifetch: function(b, e) {
        var f = [];
        var g = {};
        for (var a in b) {
            var d = b[a];
            f.push(d);
            g[d] = a;
            Hovercard.setFetchInProgress(a);
        }
        var c = function() {
            keys(b).each(Hovercard.dirty.bind(Hovercard));
        };
        (new AsyncRequest("/ajax/hovercard/multifetch.php")).setData({
            ids: f,
            id_type_map: e
        }).setHandler(function(j) {
            var i = j.getPayload();
            for (var h in g) if (i[h]) Hovercard.setCache(g[h], {
                node: HTML(i[h]).getRootNode()
            });
        }).setErrorHandler(c).setTransportErrorHandler(c).send();
    }
};