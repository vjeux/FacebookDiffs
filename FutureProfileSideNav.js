if (window.CavalryLogger) {
    CavalryLogger.start_js([ "7UzVi" ]);
}

function FutureProfileSideNav() {
    this.parent.construct(this);
}

Class.extend(FutureProfileSideNav, "FutureSideNav");

FutureProfileSideNav.prototype = {
    init: function() {
        this.parent.init.apply(this, arguments);
        this.ajaxPipe = true;
        this.altKeyParam = "v";
        this.sidecol = false;
    },
    _constructItem: function(a, b) {
        return new FutureProfileSideNavItem(a, b);
    },
    _doPageTransition: function(a, b) {
        if (!this._profileChanged(b) && !this._scopeChanged(a)) return this.parent._doPageTransition(a, b);
    },
    _profileChanged: function(c) {
        var b = c.getQueryData();
        var a = this.uri.getQueryData();
        return b.id !== a.id || b.viewas !== a.viewas || b.and !== a.and;
    },
    _scopeChanged: function(a) {
        return !this.selected || a.layoutType !== this.selected.layoutType;
    },
    _getKey: function(a) {
        return this.parent._getKey(a) || a[this.altKeyParam];
    }
};

function FutureProfileSideNavItem(a, b) {
    this.parent.construct(this, a, b);
    this.layoutType = a.layouttype;
}

Class.extend(FutureProfileSideNavItem, "FutureSideNavItem");

function KeyEventController() {
    this.handlers = {};
    document.onkeyup = this.onkeyevent.bind(this, "onkeyup");
    document.onkeydown = this.onkeyevent.bind(this, "onkeydown");
    document.onkeypress = this.onkeyevent.bind(this, "onkeypress");
}

copy_properties(KeyEventController, {
    instance: null,
    getInstance: function() {
        return KeyEventController.instance || (KeyEventController.instance = new KeyEventController);
    },
    defaultFilter: function(event, a) {
        event = $E(event);
        return KeyEventController.filterEventTypes(event, a) && KeyEventController.filterEventTargets(event, a) && KeyEventController.filterEventModifiers(event, a);
    },
    filterEventTypes: function(event, a) {
        if (a === "onkeydown") return true;
        return false;
    },
    filterEventTargets: function(event, b) {
        var a = event.getTarget();
        return !DOM.isNode(a, KeyEventController._interactiveElements) || a.type in KeyEventController._uninterestingTypes || DOM.isNode(a, [ "input", "textarea" ]) && a.value.length === 0 && event.keyCode in KeyEventController._controlKeys;
    },
    filterEventModifiers: function(event, a) {
        if (event.ctrlKey || event.altKey || event.metaKey || event.repeat) return false;
        return true;
    },
    registerKey: function(f, a, d, g) {
        if (d === undefined) d = KeyEventController.defaultFilter;
        var b = KeyEventController.getInstance();
        var c = b.mapKey(f);
        if (is_empty(b.handlers)) onleaveRegister(b.resetHandlers.bind(b));
        for (var e = 0; e < c.length; e++) {
            f = c[e];
            if (!b.handlers[f] || g) b.handlers[f] = [];
            b.handlers[f].push({
                callback: a,
                filter: d
            });
        }
    },
    keyCodeMap: {
        BACKSPACE: [ 8 ],
        TAB: [ 9 ],
        RETURN: [ 13 ],
        ESCAPE: [ 27 ],
        LEFT: [ 37, 63234 ],
        UP: [ 38, 63232 ],
        RIGHT: [ 39, 63235 ],
        DOWN: [ 40, 63233 ],
        DELETE: [ 46 ],
        COMMA: [ 188 ],
        PERIOD: [ 190 ],
        "`": [ 192 ],
        "[": [ 219 ],
        "]": [ 221 ]
    },
    _interactiveElements: [ "input", "select", "textarea", "object", "embed" ],
    _uninterestingTypes: {
        checkbox: 1,
        radio: 1,
        submit: 1
    },
    _controlKeys: {
        8: 1,
        9: 1,
        13: 1,
        27: 1,
        37: 1,
        63234: 1,
        38: 1,
        63232: 1,
        39: 1,
        63235: 1,
        40: 1,
        63233: 1,
        46: 1
    }
});

copy_properties(KeyEventController.prototype, {
    mapKey: function(a) {
        if (typeof a == "number") return [ 48 + a, 96 + a ];
        var b = KeyEventController.keyCodeMap[a.toUpperCase()];
        if (b) return b;
        return [ a.toUpperCase().charCodeAt(0) ];
    },
    onkeyevent: function(i, c) {
        c = $E(c);
        var d = null;
        var g = this.handlers[c.keyCode];
        var b, f, a;
        if (g) for (var h = 0; h < g.length; h++) {
            b = g[h].callback;
            f = g[h].filter;
            try {
                if (!f || f(c, i)) {
                    a = b(c, i);
                    if (a === false) return Event.kill(c);
                }
            } catch (e) {}
        }
        return true;
    },
    resetHandlers: function() {
        this.handlers = {};
    }
});

function OnVisible(b, c, f, a, d) {
    d = d || {};
    this.buffer = coalesce(a, 300);
    this.lastY = Vector2.getScrollPosition().y;
    this.lastTime = +(new Date);
    var e = function() {
        this.targetY = Vector2.getElementPosition(b).y;
        var l = Vector2.getScrollPosition().y;
        var j = Vector2.getViewportDimensions().y;
        var k = l + j + this.buffer;
        var i = !f || Vector2.getScrollPosition().y - this.buffer < this.targetY + Vector2.getElementDimensions(b).y;
        if (i && k > this.targetY) {
            this.remove();
            if (d.detect_speed) {
                var g = l - this.lastY;
                var h = g / (+(new Date) - this.lastTime + 1);
                if (h > j / 100 || k >= Vector2.getDocumentDimensions().y && g > 1e3) return true;
            }
            c();
        }
        if (d.detect_speed) {
            this.lastY = l;
            this.lastTime = +(new Date);
        }
        return true;
    }.bind(this);
    this.scrollListener = Event.listen(window, "scroll", e);
    this.resizeListener = Event.listen(window, "resize", e);
    e();
    onleaveRegister(this.remove.bind(this));
}

copy_properties(OnVisible.prototype, {
    remove: function() {
        if (this.scrollListener) {
            this.scrollListener.remove();
            this.resizeListener.remove();
            this.scrollListener = this.resizeListener = null;
        }
    }
});

var PhotosConst = {
    VIEWER_PERMALINK: 0,
    VIEWER_THEATER: 1,
    VIEWER_SNOWBOX: 2,
    inCenterStage: function(a) {
        return a == PhotosConst.VIEWER_THEATER || a == PhotosConst.VIEWER_SNOWBOX;
    },
    SIZE_NORMAL: "n"
};

var PhotoInlineCaptionEditor = function(a) {
    this.instanceId = a;
    PhotoInlineCaptionEditor.instances[a] = this;
};

copy_properties(PhotoInlineCaptionEditor, {
    instances: {},
    getInstance: function(a) {
        return this.instances[a];
    }
});

PhotoInlineCaptionEditor.prototype = {
    init: function(a) {
        this.element = a;
        Event.listen(a, "click", this.handleClick.bind(this));
        var b = DOM.scry(a, 'input[name="caption_id"]');
        if (b.length) b[0].value = this.instanceId;
        this.inputStr = "";
        var c = DOM.scry(this.element, "textarea.fbPhotoCaptionInput")[0];
        if (c) this.inputStr = Input.getValue(c);
    },
    handleClick: function(event) {
        var a = event.getTarget();
        if (Parent.byClass(a, "editIcon") || Parent.byClass(a, "noCaption")) {
            this.toggleEditDescription(true);
        } else if (Parent.byClass(a, "cancelEdit")) {
            Input.setValue(DOM.find(this.element, "textarea.fbPhotoCaptionInput"), this.inputStr);
            this.toggleEditDescription(false);
        }
    },
    setCaption: function(a) {
        DOM.setContent(DOM.find(this.element, ".fbPhotoCaptionText"), a);
        this.toggleEditDescription(false);
        this.inputStr = Input.getValue(DOM.find(this.element, "textarea.fbPhotoCaptionInput"));
    },
    getCaption: function() {
        return DOM.getText(DOM.find(this.element, ".fbPhotoCaptionText"));
    },
    toggleEditDescription: function(c) {
        if (!c) DOM.find(this.element, "textarea.fbPhotoCaptionInput").blur();
        CSS.conditionClass(this.element, "fbPhotoInlineCaptionEditorEditMode", !!c);
        if (c) {
            var b = DOM.find(this.element, "textarea.fbPhotoCaptionInput");
            var a = DOMControl.getInstance(b);
            a && a.update();
            b.focus();
        } else CSS.conditionClass(DOM.find(this.element, ".noCaption"), "hidden_elem", this.getCaption().length);
    }
};

function PhotosTaggingWaterfall(a) {
    PhotosTaggingWaterfall._queueName = a || PhotosTaggingWaterfall._queueName;
}

copy_properties(PhotosTaggingWaterfall, {
    BEGIN: "begin",
    TAG_FACE: "tag_face",
    ADD_NAME: "add_name",
    TAG_CONFIRMED: "tag_confirmed",
    FINISH: "finish",
    TYPE_NAME: "type_name",
    SELECT_NAME: "select_name",
    _queueName: null,
    sendSignal: function(b, a) {
        (new AsyncSignal("/ajax/photos/tag_waterfall.php", {
            data: JSON.stringify(b)
        })).setHandler(a).send();
    }
});

function photos_viewer_version() {
    if (CSS.hasClass(document.documentElement, "theaterMode")) {
        if (window.Env) {
            if (Env.theater_ver === "2") {
                return PhotosConst.VIEWER_SNOWBOX;
            } else return PhotosConst.VIEWER_THEATER;
        } else if (ge("fbPhotoSnowbox") !== null) {
            return PhotosConst.VIEWER_SNOWBOX;
        } else return PhotosConst.VIEWER_THEATER;
    } else return PhotosConst.VIEWER_PERMALINK;
}

function PhotoTagger(a) {
    this.version = a;
    PhotoTagger.instances[a] = this;
}

PhotoTagger.instances = {};

PhotoTagger.ACTIVATE_TAGGING = "PhotoTagger.ACTIVATE_TAGGING";

PhotoTagger.getInstance = function(a) {
    return PhotoTagger.instances[a];
};

PhotoTagger.getCurrentInstance = function() {
    return PhotoTagger.getInstance(photos_viewer_version());
};

copy_properties(PhotoTagger.prototype, {
    TAG_BOX_SIZE: 100,
    datasources: {},
    photoData: {},
    elemNames: {
        1: {
            tagger: "div.theaterTagger",
            addTagLink: "div.fbPhotosTheaterActions",
            overlayActions: "div.fbPhotoTheaterButtons",
            tagAction: "fbPhotosTheaterActionsTag",
            image: "div.stage img"
        },
        2: {
            tagger: "div.snowboxTagger",
            addTagLink: "div.fbPhotosPhotoActions",
            overlayActions: "div.fbPhotosPhotoButtons",
            tagAction: "fbPhotosPhotoActionsTag",
            image: "div.stage img"
        }
    },
    init: function(b, c) {
        this.root = b;
        this.tokenizer = c;
        this._qn = null;
        this.typeahead = c.getTypeahead();
        this.clickState = DOM.find(this.root, "div.stageActions");
        this.tagger = DOM.find(this.clickState, this.elemNames[this.version].tagger);
        this.faceBox = DOM.find(this.tagger, "div.faceBox");
        this.addTagLink = DOM.find(this.root, this.elemNames[this.version].addTagLink);
        this.overlayActions = DOM.find(this.root, this.elemNames[this.version].overlayActions);
        this.setupHandlers();
        (new AsyncRequest).setURI("/ajax/photos/theater/tags_init.php").setData({
            owner: this.photoData.owner
        }).setOption("retries", 1).setHandler(function(d) {
            this.typeahead.getView().setSuggestions(d.getPayload().taggees);
        }.bind(this)).send();
        var a = this.typeahead.subscribe("activity", function(d, e) {
            if (e && !e.activity) {
                this.updateWithSuggestions();
                this.typeahead.unsubscribe(a);
                this.typeahead.subscribe("focus", this.updateWithSuggestions.bind(this));
                this.tokenizer.subscribe("removeToken", this.updateWithSuggestions.bind(this));
                this.tokenizer.subscribe("addToken", this.addSuggestion.bind(this));
                this.typeahead.subscribe("respond", function(f, g) {
                    if (g && !g.results.length) this.updateWithSuggestions();
                }.bind(this));
            }
        }.bind(this));
        this.setDataSource(this.typeahead.getData());
        return this;
    },
    setupHandlers: function() {
        this.handlers = [ Event.listen(this.clickState, "click", this.addTag.bind(this)), Event.listen(window, "resize", this.hideTagger.bind(this)), Event.listen(this.addTagLink, "click", this.checkActions.bind(this)), Event.listen(this.overlayActions, "click", this.checkActions.bind(this)) ];
        if (this.version == PhotosConst.VIEWER_THEATER) {
            this.subscriptions = [ Arbiter.subscribe(PhotoTheater.PAGE, this.restartTagging.bind(this)), Arbiter.subscribe(PhotoTheater.DATA_CHANGE, this.setPhotoData.bind(this)), Arbiter.subscribe(PhotoTheater.CLOSE, this.deactivateTagging.bind(this)) ];
        } else if (this.version == PhotosConst.VIEWER_SNOWBOX) this.subscriptions = [ Arbiter.subscribe(PhotoSnowbox.PAGE, this.restartTagging.bind(this)), Arbiter.subscribe(PhotoSnowbox.DATA_CHANGE, this.setPhotoData.bind(this)), Arbiter.subscribe(PhotoSnowbox.CLOSE, this.deactivateTagging.bind(this)) ];
        this.tokenizer.subscribe("addToken", this.saveTag.bind(this));
        this.tokenizer.subscribe("removeToken", this.removeTag.bind(this));
        this.tokenizer.subscribe("markTagAsSpam", this.markTagAsSpam.bind(this));
    },
    getTaggingSource: function() {
        if (this.version == PhotosConst.VIEWER_SNOWBOX) {
            return "snowbox";
        } else if (this.version == PhotosConst.VIEWER_THEATER) {
            return "center_stage";
        } else return null;
    },
    updateWithSuggestions: function(a, c) {
        var e = this.typeahead.getData().buildUids(" ", this.typeahead.getView().getSuggestions(), this.typeahead.getCore().getExclusions());
        if (!e.length) return;
        var d = this.typeahead.getData().respond("", e);
        for (var b = 0; b < d.length; b++) d[b].index = -1e3 + b;
    },
    addSuggestion: function(a, b) {
        var c = b.info && b.info.uid;
        if (c) this.typeahead.getView().addSuggestion(c);
    },
    setQueueName: function(a) {
        this._qn = a;
        return this;
    },
    _sendWaterfallLogSignal: function(a) {
        PhotosTaggingWaterfall.sendSignal({
            qn: this._qn,
            source: this.getTaggingSource(),
            step: a,
            pid: this.photoData.pid
        });
    },
    _bumpQueueName: function() {
        if (this._qn) this._qn += 1;
    },
    activateTagging: function() {
        Arbiter.inform(PhotoTagger.ACTIVATE_TAGGING);
        if (this.getDataSource()) {
            this.dataSourceFetched(this.getDataSource());
        } else (new AsyncRequest("/ajax/photos/theater/fetch_datasource.php")).setData({
            fbid: this.photoData.fbid,
            version: this.version
        }).send();
    },
    restartTagging: function() {
        this.hideTagger();
        if (this.taggingMode === true) this.activateTagging();
    },
    getDataSource: function() {
        return this.datasources[this.getDataSourceKey()];
    },
    getDataSourceKey: function() {
        if (this.photoData.ownertype == "user" && !this.photoData.obj_id) return "friends";
        return this.photoData.obj_id || this.photoData.owner;
    },
    setDataSource: function(a) {
        if (this.typeahead.getData() != a) this.typeahead.swapData(a);
        this.datasources[this.getDataSourceKey()] = a;
    },
    dataSourceFetched: function(a) {
        this.taggingMode = true;
        CSS.addClass(this.root, "taggingMode");
        this._bumpQueueName();
        this._sendWaterfallLogSignal(PhotosTaggingWaterfall.BEGIN);
        this.setDataSource(a);
    },
    deactivateTagging: function() {
        if (this.taggingMode === true) this._sendWaterfallLogSignal(PhotosTaggingWaterfall.FINISH);
        this.taggingMode = false;
        this.hideTagger();
        CSS.removeClass(this.root, "taggingMode");
    },
    checkActions: function(event) {
        var a = event.getTarget();
        if (Parent.byClass(a, this.elemNames[this.version].tagAction)) this.taggingMode ? this.deactivateTagging() : this.activateTagging();
    },
    hideTagger: function() {
        CSS.hide(this.tagger);
    },
    showTagger: function() {
        CSS.show(this.tagger);
        var a = DOM.find(this.tagger, "input.textInput");
        Input.reset(a);
        a.focus();
        this.updateWithSuggestions();
    },
    addTag: function(event) {
        var l = event.getTarget();
        if (!this.taggingMode || Parent.byClass(l, "fbPhotosPhotoButtons") || Parent.byClass(l, "photoTagTypeahead")) return;
        var h = DOM.find(this.root, this.elemNames[this.version].image);
        var b = Vector2.getEventPosition(event);
        var a = {
            x: this.TAG_BOX_SIZE / 2,
            y: this.TAG_BOX_SIZE / 2
        };
        var j = Vector2.getElementPosition(h);
        var i = Vector2.getElementDimensions(h);
        var k = b.sub(j);
        var d = new Vector2(event.offsetX || event.layerX, event.offsetY || event.layerY, "document");
        for (var e in d) {
            if (b[e] < j[e] || b[e] > j[e] + i[e]) {
                this.hideTagger();
                return;
            }
            if (k[e] < this.TAG_BOX_SIZE / 2) {
                a[e] = k[e];
            } else if (i[e] < k[e] + this.TAG_BOX_SIZE / 2) a[e] = this.TAG_BOX_SIZE - (i[e] - k[e]);
        }
        if (this.onRelativePositionTarget(l)) {
            var g = 1;
            if (ua.ie()) g = 5;
            var c = {
                x: a.x - d.x - g,
                y: a.y - d.y - g
            };
            var m = this.getRelativeTargetPos(l);
            var f = new Vector2(m.left.substr(0, m.left.length - 2) - 0, m.top.substr(0, m.top.length - 2) - 0, "document");
            f.sub(c.x, c.y).setElementPosition(this.tagger);
        } else d.sub(a.x, a.y).setElementPosition(this.tagger);
        this.showTagger();
        this.clickPoint = {
            x: k.x / i.x,
            y: k.y / i.y
        };
        this._sendWaterfallLogSignal(PhotosTaggingWaterfall.TAG_FACE);
    },
    onRelativePositionTarget: function(a) {
        return a == this.faceBox;
    },
    getRelativeTargetPos: function(a) {
        return this.tagger.style;
    },
    saveTag: function(a, b) {
        (new AsyncRequest).setURI("/ajax/photo_tagging_ajax.php").setMethod("POST").setData({
            cs_ver: this.version,
            pid: this.photoData.pid,
            id: this.photoData.owner,
            subject: b.isFreeform() ? "" : b.getValue(),
            name: b.getText(),
            action: "add",
            x: this.clickPoint.x * 100,
            y: this.clickPoint.y * 100,
            source: this.getTaggingSource(),
            qn: this._qn,
            position: this.getPosition()
        }).setAllowCrossPageTransition(true).setHandler(this.tagsChangeHandler.bind(this)).setErrorHandler(this.checkError.bind(this, b)).send();
        this.hideTagger();
    },
    getPosition: function() {
        var a = this.getPhotoViewerObj();
        return a && a.position;
    },
    getPhotoViewerObj: function() {
        if (this.version == PhotosConst.VIEWER_THEATER) {
            return window.PhotoTheater;
        } else if (this.version == PhotosConst.VIEWER_SNOWBOX) return window.PhotoSnowbox;
        return null;
    },
    tagsChangeHandler: function(b) {
        var a = this.getPhotoViewerObj();
        if (a && a.isOpen) a.saveTagComplete(b);
    },
    checkError: function(b, a) {
        if (a.getPayload() && a.getPayload().clear_tag) {
            b.already_untagged = true;
            this.tokenizer.removeToken(b);
        }
        ErrorDialog.showAsyncError(a);
    },
    removeTag: function(a, c) {
        if (c.already_untagged) return;
        var b = "remove";
        if (DOM.scry(c.element, "a.pending")[0]) b = "retract";
        if (c.blockUser) b = "remove_block";
        (new AsyncRequest).setURI("/ajax/photo_tagging_ajax.php").setMethod("POST").setData({
            cs_ver: this.version,
            pid: this.photoData.pid,
            id: this.photoData.owner,
            subject: c.isFreeform() ? "" : c.getInfo().uid,
            position: this.getPosition(),
            name: c.getInfo().text,
            action: b,
            source: this.getTaggingSource()
        }).setHandler(this.tagsChangeHandler.bind(this)).setAllowCrossPageTransition(true).send();
    },
    removeTagByID: function(b) {
        var c = this.tokenizer.tokens;
        for (var a = 0; a < c.length; a++) if (c[a].info.uid == b) return this.removeTag(null, c[a]);
    },
    setPhotoData: function(a, b) {
        this.photoData = b;
        return this;
    },
    markTagAsSpam: function(a, b) {
        (new AsyncRequest).setURI("/ajax/photo_tagging_ajax.php").setMethod("POST").setData({
            cs_ver: this.version,
            pid: this.photoData.pid,
            id: this.photoData.owner,
            subject: b,
            action: "mark_as_spam",
            source: this.getTaggingSource()
        }).send();
    }
});

function PhotoSnowboxLog() {}

copy_properties(PhotoSnowboxLog, {
    UNKNOWN: 0,
    ESC: 1,
    X: 2,
    OUTSIDE: 3,
    UNLOAD: 4,
    NAVIGATE: 5,
    AGGREGATE: 6,
    AGGREGATION_COUNT: 20,
    set: null,
    stopWatch: null,
    time: null,
    views: 0,
    fbidList: [],
    setSize: 0,
    loadedCount: 0,
    waitForLoadCount: 0,
    width: 0,
    height: 0,
    first: false,
    last: false,
    logIds: false,
    initLogging: function() {
        this.set = null;
        this.time = new Date;
        this.views = 0;
        this.first = true;
        this.last = false;
        this.logIds = false;
        var a = Vector2.getViewportDimensions();
        this.width = a.x;
        this.height = a.y;
    },
    setLogFbids: function(a) {
        this.logIds = a;
    },
    setPhotoSet: function(a) {
        this.set = a;
    },
    setStopWatchData: function(a) {
        this.stopWatch = [ a.begin, a.showFrame, a.showNormal, a.fetchInit, a.showUfi, a.secondBatch ];
    },
    addPhotoView: function(a) {
        if (this.logIds && this.views >= this.AGGREGATION_COUNT) this.logPhotoViews(this.AGGREGATE);
        this.views++;
        if (a) this.fbidList.push([ a.fbid, a.owner, +(new Date) ]);
    },
    logPhotoViews: function(a) {
        if (this.views) {
            var c = Vector2.getViewportDimensions();
            if (a != this.AGGREGATE) this.last = true;
            var d = keys(Object.from(this.fbidList)).length;
            var b = {
                set: this.set,
                time: new Date - this.time,
                views: this.views,
                fbids: this.logIds ? this.fbidList : [],
                setSize: this.setSize,
                loadedCount: this.loadedCount,
                waitForLoadCount: this.waitForLoadCount,
                uniqueViews: d,
                width: c.x || this.width,
                height: c.y || this.height,
                first: this.first,
                last: this.last,
                perf: this.stopWatch,
                close: a ? a : this.UNKNOWN
            };
            (new AsyncRequest).setURI("/ajax/photos/snowbox/session_logging.php").setAllowCrossPageTransition(true).setOption("asynchronous", a != PhotoSnowboxLog.UNLOAD).setOption("suppressCacheInvalidation", true).setOption("suppressErrorHandlerWarning", true).setData(b).send();
            this.views = 0;
            this.fbidList = [];
            this.first = false;
            if (this.last) {
                this.set = null;
                this.logIds = false;
            }
        }
    },
    setLoadedPhotosCount: function(a) {
        this.loadedCount = a;
    },
    setSetSize: function(a) {
        this.setSize = a;
    },
    setWaitForLoadCount: function(a) {
        this.waitForLoadCount = a;
    }
});

onunloadRegister(function() {
    PhotoSnowboxLog.logPhotoViews(PhotoSnowboxLog.UNLOAD);
});

function PhotosUtils() {}

PhotosUtils.getNearestBox = function(e, l, k, j, c, a) {
    var f = e.sub(l);
    var d = k.magnitude();
    var g = null;
    for (var b in a) {
        var h = a[b];
        var i = new Rect(h.t / 100 * k.y * j, h.r / 100 * k.x * j, h.b / 100 * k.y * j, h.l / 100 * k.x * j);
        var m = i.getCenter().sub(f);
        if (Math.abs(m.x) <= c && Math.abs(m.y) <= c && m.magnitude() <= d) {
            d = m.magnitude();
            g = b;
            if (0 === d) break;
        }
    }
    return g;
};

function PhotoStreamCache() {}

copy_properties(PhotoStreamCache, {
    ERROR: "error",
    HTML: "html",
    IMAGE_DATA: "image",
    EXTRA: "extra",
    PRELOAD_BUFFER: 5,
    BUFFER_SIZE: 4,
    INIT_BUCKET_SIZE: 5,
    FULL_BUCKET_SIZE: 15,
    ERROR_ID: -1
});

copy_properties(PhotoStreamCache.prototype, {
    init: function(a) {
        this.version = a;
        this.bufferSize = PhotoStreamCache.BUFFER_SIZE;
        this.initBucketSize = PhotoStreamCache.INIT_BUCKET_SIZE;
        this.fullBucketSize = PhotoStreamCache.FULL_BUCKET_SIZE;
        this.initError = false;
        this.isActive = true;
        this.leftLock = false;
        this.rightLock = false;
        this.reset();
    },
    reset: function() {
        this.cache = {
            image: {},
            extra: {},
            html: {}
        };
        this.fbidList = [];
        this.loaded = false;
        this.allLoaded = false;
        this.permalinkMap = {};
        this.position = 0;
        this.totalCount = null;
        this.firstCursor = null;
        this.firstCursorIndex = null;
    },
    destroy: function() {
        this.reset();
        this.isActive = false;
    },
    isLoaded: function() {
        return this.loaded;
    },
    canPage: function() {
        if (this.totalCount !== null) return this.totalCount > 1;
        return this.getLength() > 1;
    },
    errorInCurrent: function() {
        if (this.initError) {
            return true;
        } else if (!this.isLoaded()) return false;
        return this.checkErrorAt(this.getCursor());
    },
    getLength: function() {
        return this.fbidList.length;
    },
    getPhotoSet: function() {
        return this.photoSetQuery.set;
    },
    getCurrentImageData: function() {
        return this.getImageData(this.getCursor());
    },
    getImageData: function(a) {
        return this.getCacheContent(a, PhotoStreamCache.IMAGE_DATA);
    },
    getCurrentHtml: function() {
        return this.getCacheContent(this.getCursor(), PhotoStreamCache.HTML);
    },
    getCurrentExtraData: function() {
        return this.getCacheContent(this.getCursor(), PhotoStreamCache.EXTRA);
    },
    getCacheContent: function(a, b) {
        if (!a || a === PhotoStreamCache.ERROR_ID) return null;
        return this.cache[b][a];
    },
    getCursorPos: function() {
        return this.position;
    },
    getCursor: function() {
        if (this.position >= 0 && this.position < this.getLength()) return this.fbidList[this.position];
        return null;
    },
    getCursorForURI: function(a) {
        return this.permalinkMap[a];
    },
    calculatePositionForMovement: function(a) {
        var b = this.position + a;
        if (this.allLoaded) {
            var c = this.getLength();
            b = (c + b % c) % c;
        }
        return b;
    },
    isValidMovement: function(a) {
        if (!this.isLoaded() || !this.canPage()) return false;
        var b = this.calculatePositionForMovement(a);
        return this.getCursor() > 0 || b >= 0 && b < this.getLength();
    },
    moveCursor: function(a) {
        if (!this.isValidMovement(a)) return;
        this.position = this.calculatePositionForMovement(a);
        if (a !== 0) this.loadMoreIfNeccessary(a > 0);
    },
    checkErrorAt: function(a) {
        if (!this.isLoaded()) return false;
        if (a === PhotoStreamCache.ERROR_ID) return true;
        return false;
    },
    getRelativeMovement: function(a) {
        for (var b = 0; b < this.getLength(); b++) if (this.fbidList[b] === a) return b - this.position;
        return null;
    },
    preloadImages: function() {
        var e, c;
        var f = this.getLength();
        var b = this.cache.image;
        var a = PhotoStreamCache.PRELOAD_BUFFER;
        if (f > a * 2) {
            e = (this.position + f - a % f) % f;
            c = (this.position + a) % f;
        } else {
            e = 0;
            c = f - 1;
        }
        while (e != c) {
            var d = this.fbidList[e];
            if (b[d] && !b[d].resource && b[d].url) {
                b[d].resource = new Image;
                b[d].resource.src = b[d].url;
            }
            e = (e + 1) % f;
        }
    },
    loadMoreIfNeccessary: function(c) {
        if (this.allLoaded || c && this.rightLock || !c && this.leftLock) return;
        var d = c ? 1 : -1;
        var a = this.fullBucketSize * d;
        var b = this.position + this.bufferSize * d;
        if (b < 0 && !this.checkErrorAt(this.getEndCursor(false))) {
            this.leftLock = true;
            this.fetch(this.fullBucketSize, false);
        } else if (b > this.getLength() && !this.checkErrorAt(this.getEndCursor(true))) {
            this.rightLock = true;
            this.fetch(this.fullBucketSize, true);
        }
    },
    getEndCursor: function(a) {
        return a ? this.fbidList[this.getLength() - 1] : this.fbidList[0];
    },
    calculateRelativeIndex: function(c, a, d) {
        if (!this.totalCount) return null;
        var b = this.fbidList.indexOf(a);
        var e = this.fbidList.indexOf(d);
        if (b === -1 || e === -1) return null;
        var f = e - b;
        return (c + f + this.totalCount) % this.totalCount;
    },
    fetch: function(a, d) {
        var c = this.getEndCursor(d);
        var b = copy_properties({
            cursor: c,
            version: this.version,
            end: this.getEndCursor(!d),
            fetchSize: d ? a : -1 * a
        }, this.photoSetQuery);
        if (this.totalCount && this.firstCursorIndex !== null) {
            b.total = this.totalCount;
            b.cursorIndex = this.calculateRelativeIndex(this.firstCursorIndex, this.firstCursor, c);
        }
        UIPagelet.loadFromEndpoint("PhotoViewerPagelet", null, b, {
            usePipe: true,
            jsNonblock: true,
            crossPage: true
        });
    },
    storeToCache: function(a) {
        var b = {};
        if (!this.isActive) return b;
        if ("error" in a) {
            this.processErrorResult(a.error);
            b.error = true;
            return b;
        }
        if ("init" in a) {
            this.processInitResult(a.init);
            b.init = {
                logids: a.init.logids,
                fbid: a.init.fbid
            };
        }
        if ("image" in a) {
            this.processImageResult(a.image);
            b.image = true;
        }
        if ("data" in a) {
            this.processDataResult(a.data);
            b.data = true;
        }
        return b;
    },
    processInitResult: function(a) {
        if (this.loaded) return;
        this.loaded = true;
        this.photoSetQuery = a.query;
        if (a.bufferSize) this.bufferSize = a.bufferSize;
        if (a.initBucketSize) this.initBucketSize = a.initBucketSize;
        if (a.fullBucketSize) this.fullBucketSize = a.fullBucketSize;
        this.fbidList.push(a.fbid);
        this.firstCursor = a.fbid;
        if ("initIndex" in a && "totalCount" in a) {
            this.firstCursorIndex = a.initIndex;
            this.totalCount = a.totalCount;
        }
        this.rightLock = true;
        this.fetch(this.initBucketSize, true);
    },
    processImageResult: function(b) {
        for (var a in b) {
            this.cache.image[a] = b[a];
            if (b[a].dimensions) this.cache.image[a].dimensions = Vector2.deserialize(b[a].dimensions);
            this.permalinkMap[URI(b[a].info.permalink).getUnqualifiedURI().toString()] = a;
        }
    },
    attachToFbidsList: function(d, e, a) {
        if (this.allLoaded) return;
        if (e === -1) {
            for (var b = d.length - 1; b >= 0; b--) {
                this.fbidList.unshift(d[b]);
                this.position++;
            }
            this.leftLock = false;
        } else {
            for (var c = 0; c < d.length; c++) this.fbidList.push(d[c]);
            this.rightLock = false;
        }
        if (a) this.setAllLoaded();
    },
    setAllLoaded: function() {
        this.allLoaded = true;
        if (this.getCursor() === null) this.position = this.calculatePositionForMovement(0);
    },
    processDataResult: function(a) {
        for (var b in a) {
            if (!this.cache.html[b]) this.cache.html[b] = {};
            for (var d in a[b].html) {
                var c = HTML(a[b].html[d]).getRootNode();
                this.cache.html[b][d] = $A(c.childNodes);
            }
            if (!("extra" in a[b])) {
                this.cache.extra[b] = null;
                continue;
            }
            this.cache.extra[b] = {
                tagRects: {}
            };
            if (a[b].extra.tagRects) for (var e in a[b].extra.tagRects) if (a[b].extra.tagRects[e]) this.cache.extra[b].tagRects[e] = Rect.deserialize(a[b].extra.tagRects[e]);
        }
    },
    processErrorResult: function(b) {
        if (!this.isLoaded()) {
            this.initError = true;
            return;
        }
        var c = b.side;
        var a = [ PhotoStreamCache.ERROR_ID ];
        this.attachToFbidsList(a, c);
    },
    setTotalCount: function(a) {
        this.totalCount = a;
    },
    setFirstCursorIndex: function(a) {
        this.firstCursorIndex = a;
    }
});

function PhotoInlineEditor(a) {
    this.version = a;
    PhotoInlineEditor.instances[a] = this;
}

PhotoInlineEditor.CANCEL_INLINE_EDITING = "CANCEL_INLINE_EDITING";

PhotoInlineEditor.instances = {};

PhotoInlineEditor.getInstance = function(a) {
    return PhotoInlineEditor.instances[a];
};

copy_properties(PhotoInlineEditor.prototype, {
    cancel: function(a) {
        var b = Parent.byClass(a, "photoUfiContainer");
        if (!b) return;
        this.setVisible(b, ".fbPhotosPhotoCaption", true);
        this.setVisible(b, ".fbPhotoTagList", true);
        this.setVisible(b, ".fbPhotosPhotoEdit", true);
        this.setVisible(b, ".fbPhotosPhotoDisabledEdit", false);
        this.setVisible(b, ".fbPhotoInlineEditor", false);
        Arbiter.unsubscribe(this.arbiterToken);
        Arbiter.inform(PhotoInlineEditor.CANCEL_INLINE_EDITING);
    },
    setVisible: function(c, a, d) {
        var b = DOM.scry(c, a)[0];
        b && CSS[d ? "show" : "hide"](b);
    },
    subscribeCancel: function(a) {
        var b = [ PhotoSnowbox.PAGE, PhotoSnowbox.CLOSE, PhotoSnowbox.OPEN, PhotoTagger.ACTIVATE_TAGGING ];
        this.arbiterToken = Arbiter.subscribe(b, this.cancel.bind(this, a), Arbiter.SUBSCRIBE_NEW);
    }
});

var PhotoSnowbox = {
    STATE_ERROR: "error",
    STATE_HTML: "html",
    STATE_IMAGE_PIXELS: "image_pixels",
    STATE_IMAGE_DATA: "image",
    CLOSE: "PhotoSnowbox.CLOSE",
    DATA_CHANGE: "PhotoSnowbox.DATA_CHANGE",
    GO: "PhotoSnowbox.GO",
    OPEN: "PhotoSnowbox.OPEN",
    PAGE: "PhotoSnowbox.PAGE",
    RESET_HELP: "PhotoSnowbox.RESET_HELP",
    LOADING_TIMEOUT: 2e3,
    STAGE_MAX: {
        x: 960,
        y: 960
    },
    STAGE_MIN: {
        x: 720,
        y: 402
    },
    STAGE_CHROME: {
        x: 225,
        y: 117
    },
    MIN_TAG_DISTANCE: 83,
    switchTimer: null,
    imageRefreshTimer: null,
    imageLoadingTimer: null,
    lastPage: 0,
    currentMinSize: null,
    normalSize: null,
    thumbSrc: null,
    stopWatch: {
        begin: null,
        showFrame: null,
        showNormal: null,
        fetchInit: null,
        showUfi: null,
        secondBatch: null
    },
    bootstrap: function(b, a) {
        if (this.isOpen) return;
        this.stopWatch.begin = +(new Date);
        this.returningToStart = false;
        this.loading && CSS.removeClass(this.loading, "loading");
        if (a) {
            CSS.addClass(this.loading = a, "loading");
            this.getThumbAndSize(a);
        } else this.loading = null;
        Arbiter.inform(PhotoSnowbox.GO, b, Arbiter.BEHAVIOR_STATE);
        this.loadFrameIfUninitialized();
    },
    getThumbAndSize: function(b) {
        this.normalSize = null;
        this.thumbSrc = null;
        var e = URI(b.getAttribute("ajaxify")).getQueryData();
        if (!e.size) return;
        var a = Vector2.deserialize(e.size);
        if (!a.x || !a.y) return;
        this.normalSize = a;
        if (!CSS.hasClass(b, "uiMediaThumb") && !CSS.hasClass(b, "uiPhotoThumb")) return;
        var d = DOM.scry(b, "img")[0];
        var c = DOM.scry(b, "i")[0];
        if (d) {
            thumbSrc = d.src;
        } else if (c) {
            thumbSrc = CSS.getStyle(c, "backgroundImage").replace(/.*url\("?([^"]*)"?\).*/, "$1");
        } else return;
        this.thumbSrc = thumbSrc;
    },
    loadFrameIfUninitialized: function() {
        if (this.root) return;
        (new AsyncRequest("/ajax/photos/snowbox/init.php")).setAllowCrossPageTransition(true).setMethod("GET").setReadOnly(true).send();
    },
    init: function(a) {
        var b = ge("fbPhotoSnowbox");
        if (!b) {
            b = DOM.appendContent(document.body, a)[0];
            this.initialLoad = false;
        }
        if (this.root == b) return;
        this.initializeNodes(b);
        if (!this.subscription) {
            LinkController.registerHandler(this.handleNavigateAway.bind(this), LinkController.TARGETS | LinkController.MODIFIERS);
            this.subscription = Arbiter.subscribe(PhotoSnowbox.GO, function(c, d) {
                this.openExplicitly = true;
                this.loading && CSS.removeClass(this.loading, "loading");
                this.open(d);
            }.bind(this));
        }
        this.returningToStart = false;
        PageTransitions.registerHandler(this.openHandler.bind(this));
    },
    initializeNodes: function(a) {
        this.root = a;
        this.closeTheater = DOM.find(a, "a.closeTheater");
        this.container = DOM.find(a, "div.container");
        this.infoWrapper = DOM.find(a, "div.photoInfoWrapper");
        this.stageWrapper = DOM.find(a, "div.stageWrapper");
        this.errorBox = DOM.find(this.stageWrapper, "div.stageError");
        this.image = DOM.find(this.stageWrapper, "img.spotlight");
        this.pivotBar = DOM.find(this.stageWrapper, "div.pivotWrapper");
        this.stage = DOM.find(this.stageWrapper, "div.stage");
        this.videoStage = DOM.find(this.stageWrapper, "div.videoStage");
        this.stagePagers = DOM.find(a, "div.stagePagers");
        this.stageActions = DOM.find(a, "div.stageActions");
        this.buttonActions = DOM.find(this.stageActions, "div.fbPhotosPhotoButtons");
        this.actionList = ge("fbPhotoSnowboxActions");
        Event.listen(this.root, "click", this.closeListener.bind(this));
    },
    getRoot: function() {
        return this.root;
    },
    openHandler: function(a) {
        if (this.isOpen || a.getPath() != "/photo.php" || this.returningToStart || a.getQueryData().closeTheater || a.getQueryData().permPage || a.getQueryData().makeprofile) return false;
        this.open(a);
        this._uriStack.push(URI(a).getQualifiedURI().toString());
        PageTransitions.transitionComplete();
        return true;
    },
    open: function(c) {
        var a = URI(c).getQueryData();
        var b = a.src;
        if (b) delete a.src;
        this._uriStack = [];
        if (!this.initialLoad) {
            a.firstLoad = true;
            this.initialLoad = true;
        }
        this.loadQuery = a;
        this.isOpen = true;
        this.refreshOnClose = false;
        this.hilitedTag = null;
        this.secondBatchArrived = false;
        this.loadingStates = {
            image: false,
            html: false
        };
        this.stream = new PhotoStreamCache;
        this.stream.init(PhotosConst.VIEWER_SNOWBOX);
        this.fetchInitialData();
        this.setLoadingState(PhotoSnowbox.STATE_HTML, true);
        KeyEventController.registerKey("ESCAPE", this.closeListener.bind(this));
        Bootloader.loadComponents([ "fb-photos-photo-css", "fb-photos-snowbox-css" ], function() {
            this._open(c, b);
        }.bind(this));
    },
    _open: function(d, c) {
        this.createLoader(c);
        CSS.addClass(document.documentElement, "theaterMode");
        CSS.show(this.root);
        this.stopWatch.showFrame = +(new Date);
        Arbiter.inform("new_layer");
        Arbiter.inform(PhotoSnowbox.OPEN);
        Bootloader.loadComponents([ "hovercard-core", "live-js", "photocrop2", "PhotoTag", "PhotoTagger", "TagToken", "TagTokenizer", "ui-ufi-css" ]);
        this.stageHandlers = [ Event.listen(window, "resize", this.adjustForResize.bind(this)), Event.listen(this.stageWrapper, "click", this.buttonListener.bind(this)), Event.listen(this.stageWrapper, "dragstart", Event.kill), Event.listen(this.stageWrapper, "selectstart", Event.kill), Event.listen(this.actionList, "click", this.rotateListener.bind(this)) ];
        var a = ge("fbPhotoSnowboxFeedback");
        if (a) this.stageHandlers.push(Event.listen(a, "click", function(event) {
            if (Parent.byClass(event.getTarget(), "like_link")) CSS.toggleClass(DOM.find(this.buttonActions, "div.likeCommentGroup"), "viewerLikesThis");
        }.bind(this)));
        var b = ge("fbPhotoSnowboxOnProfile");
        if (b) this.stageHandlers.push(Event.listen(b, "click", function(event) {
            if (Parent.byClass(event.getTarget(), "fbPhotoRemoveFromProfileLink")) this.refreshOnClose = true;
        }.bind(this)));
        PageTransitions.registerHandler(function(e) {
            if (this.isOpen && !e.getQueryData().makeprofile) {
                this.close();
                return true;
            }
            return false;
        }.bind(this));
        this.startingURI = URI.getMostRecentURI().addQueryData({
            closeTheater: 1
        }).getUnqualifiedURI();
        if (!c) this.setLoadingState(PhotoSnowbox.STATE_IMAGE_DATA, true);
        PageTransitions.registerHandler(this.transitionHandler.bind(this));
        PhotoSnowboxLog.initLogging();
        ua.firefox() && this.turnFlashAutoplayOff.defer();
        (function() {
            this.adjustForResize();
            if (ua.ie()) {
                this.container.focus();
            } else this.root.focus();
        }).bind(this).defer();
    },
    getStream: function() {
        return this.stream;
    },
    fetchInitialData: function() {
        this.stopWatch.fetchInit = +(new Date);
        (new AsyncRequest("/ajax/photos/snowbox/load.php")).setAllowCrossPageTransition(true).setData(this.loadQuery).setHandler(this.storeFromResponse.bind(this)).setMethod("GET").setReadOnly(true).send();
    },
    turnFlashAutoplayOff: function() {
        DOM.scry(document, "div.swfObject").each(function(d) {
            var b = d.getAttribute("data-swfid");
            if (b && window[b]) {
                var c = window[b];
                c.addParam("autostart", "false");
                c.addParam("autoplay", "false");
                c.addParam("play", "false");
                c.addVariable("video_autoplay", "0");
                c.addVariable("autoplay", "0");
                c.addVariable("play", "0");
                var a = URI(c.getAttribute("swf"));
                a.addQueryData({
                    autoplay: "0"
                });
                a.setPath(a.getPath().replace("autoplay=1", "autoplay=0"));
                c.setAttribute("swf", a.toString());
                c.write(d);
            }
        });
    },
    closeHandler: function() {
        if (!this.isOpen) return;
        if (URI.getMostRecentURI().addQueryData({
            closeTheater: 1
        }).getUnqualifiedURI().toString() == this.startingURI.toString()) {
            this.close();
            return;
        }
        this.close();
        this.returnToStartingURI(this.refreshOnClose);
    },
    returnToStartingURI: function(c, a) {
        if (!c) if (a) {
            this.squashNextTransition(goURI.curry(a));
        } else this.squashNextTransition();
        var f = this._uriStack.length;
        if (f < window.history.length) {
            window.history.go(-f);
        } else {
            this.returningToStart = true;
            var d = Arbiter.subscribe("page_transition", function() {
                this.returningToStart = false;
                Arbiter.unsubscribe(d);
            });
            var e = PhotoSnowbox.startingURI;
            var b = (new URI(e)).removeQueryData("closeTheater");
            if (e.getQueryData().sk == "approve" && e.getPath() == "/profile.php") {
                b.removeQueryData("highlight");
                b.removeQueryData("notif_t");
            }
            goURI(b);
        }
    },
    squashNextTransition: function(a) {
        this.squashNext = true;
        PageTransitions.registerHandler(function(b) {
            if (PhotoSnowbox.squashNext) {
                PhotoSnowbox.squashNext = false;
                if (a) a.defer();
                PageTransitions.transitionComplete();
                return true;
            }
            return false;
        });
    },
    handleNavigateAway: function(b) {
        var a = _computeRelativeURI(window.PageTransitions._most_recent_uri.getQualifiedURI(), b.getAttribute("href"));
        if (this.isOpen && a instanceof URI && a.getUnqualifiedURI().toString() != this.startingURI.toString() && a.getPath() != "/photo.php") {
            if (!this.closingAction) this.closingAction = PhotoSnowboxLog.NAVIGATE;
            this.close();
            this.returnToStartingURI(false, a);
            return false;
        }
        return true;
    },
    closeListener: function(event) {
        if (this.isOpen && !(window.Dialog && Dialog.getCurrent())) {
            var c = event.getTarget();
            var a = Parent.byClass(c, "closeTheater");
            var b = a || c == this.root || c == this.infoWrapper;
            if (b) {
                if (a) {
                    this.closingAction = PhotoSnowboxLog.X;
                } else this.closingAction = PhotoSnowboxLog.OUTSIDE;
                Event.kill(event);
                this.closeHandler();
            } else if (Event.getKeyCode(event) == KEYS.ESC) {
                this.closingAction = PhotoSnowboxLog.ESC;
                Event.kill(event);
                this.closeHandler();
            }
        }
    },
    close: function() {
        if (!this.isOpen) return;
        CSS.hide(this.root);
        CSS.removeClass(document.documentElement, "theaterMode");
        CSS.removeClass(this.root, "dataLoaded");
        this.openExplicitly = false;
        this.closeCleanup.bind(this).defer();
    },
    closeCleanup: function() {
        KeyEventController.getInstance().resetHandlers();
        PhotoSnowboxLog.setLoadedPhotosCount(this.stream.getLength());
        PhotoSnowboxLog.setWaitForLoadCount(this.waitForLoadCount);
        PhotoSnowboxLog.setStopWatchData(this.stopWatch);
        PhotoSnowboxLog.logPhotoViews(this.closingAction);
        this.destroy();
        CSS.hide(this.errorBox);
        CSS.hide(this.image);
        this.normalSize = null;
        this.thumbSrc = null;
        CSS.removeClass(this.stageWrapper, "showVideo");
        DOM.empty(this.videoStage);
        this.currentMinSize = null;
        this.pinPagers = false;
        this.recacheData();
        this.stream.destroy();
        var a = this.closingAction === PhotoSnowboxLog.NAVIGATE;
        this.closingAction = null;
        PageTransitions.registerHandler(this.openHandler.bind(this));
        Arbiter.inform(PhotoSnowbox.CLOSE, a);
        this.root.setAttribute("aria-busy", "true");
        this.isOpen = false;
    },
    createLoader: function(b) {
        if (this.thumbSrc !== null && this.normalSize !== null) {
            var a = this.getMaxImageSize(this.normalSize);
            this.useImage($N("img", {
                className: "spotlight",
                alt: "",
                src: this.thumbSrc,
                style: {
                    width: a.x + "px",
                    height: a.y + "px"
                }
            }), a, false);
        }
        this.setLoadingState(this.STATE_IMAGE_PIXELS, true);
        if (b) (function() {
            var c = new Image;
            c.onload = async_callback(function() {
                if (!this.stream || !this.stream.errorInCurrent()) {
                    this.switchImage(b, this.normalSize);
                    this.stopWatch.showNormal = +(new Date);
                }
            }.bind(this), "photo_theater");
            c.src = b;
        }).bind(this).defer();
        CSS.hide(this.stageActions);
        CSS.hide(this.stagePagers);
    },
    initDataFetched: function(a) {
        PhotoSnowboxLog.setPhotoSet(this.stream.getPhotoSet());
        PhotoSnowboxLog.setLogFbids(a.logids);
        PhotoSnowboxLog.addPhotoView(this.stream.getCurrentImageData().info);
        this.position = this.stream.getCursor();
        var b = {
            click: this.pageListener.bind(this),
            mouseleave: this.mouseLeaveListener.bind(this),
            mousemove: this.mouseMoveListener.bind(this)
        };
        if (!this.pageHandlers) {
            this.pageHandlers = values(Event.listen(this.root, b));
            KeyEventController.registerKey("LEFT", this.pageListener.bind(this));
            KeyEventController.registerKey("RIGHT", this.pageListener.bind(this));
        }
        CSS.show(this.stageActions);
        this.root.setAttribute("aria-busy", "false");
    },
    adjustForResize: function() {
        this.currentMinSize = null;
        this.pinPagers = false;
        this.adjustStageSize();
        this.adjustForNewData();
    },
    getMaxImageSize: function(c) {
        var f = Vector2.getViewportDimensions();
        var e = f.sub(new Vector2(PhotoSnowbox.STAGE_CHROME.x, PhotoSnowbox.STAGE_CHROME.y));
        var a = new Vector2(Math.min(c.x, e.x, PhotoSnowbox.STAGE_MAX.x), Math.min(c.y, e.y, PhotoSnowbox.STAGE_MAX.y));
        if (a.x === 0 && a.y === 0) return new Vector2(0, 0);
        var d = c.x / c.y;
        var b = a.x / a.y;
        if (b < d) return new Vector2(a.x, Math.round(a.x / d));
        return new Vector2(Math.round(a.y * d), a.y);
    },
    adjustStageSize: function(c) {
        var a;
        var b = this.stream && this.stream.getCurrentImageData();
        if (c) {
            a = c;
        } else if (b && b.dimensions) {
            a = b.dimensions;
        } else if (this.image && this.image.src && image_has_loaded(this.image)) {
            a = Vector2.getElementDimensions(this.image);
        } else return;
        var d = this.getMaxImageSize(a);
        if (!this.currentMinSize) {
            this.currentMinSize = new Vector2(Math.max(d.x, PhotoSnowbox.STAGE_MIN.x), Math.max(d.y, PhotoSnowbox.STAGE_MIN.y));
        } else this.currentMinSize = new Vector2(Math.max(d.x, this.currentMinSize.x), Math.max(d.y, PhotoSnowbox.STAGE_MIN.y));
        CSS.setStyle(this.container, "width", this.currentMinSize.x + "px");
        CSS.setStyle(this.stageWrapper, "height", this.currentMinSize.y + "px");
        CSS.setStyle(this.stage, "lineHeight", this.currentMinSize.y + "px");
        CSS.setStyle(this.videoStage, "lineHeight", this.currentMinSize.y + "px");
        if (!this.pinPagers) CSS.setStyle(this.stagePagers, "height", this.currentMinSize.y / 2 + "px");
        this.pinPagers = true;
    },
    adjustForNewData: function() {
        if (!this.image) return;
        var c = DOM.scry(this.stage, "div.tagsWrapper")[0];
        var a = Vector2.getElementDimensions(this.image);
        if (c) {
            CSS.setStyle(c, "width", a.x + "px");
            CSS.setStyle(c, "height", a.y + "px");
            if (ua.ie() <= 7) {
                var b = DOM.scry(this.root, "div.tagContainer")[0];
                if (b) CSS.conditionClass(c, "ie7VerticalFix", Vector2.getElementDimensions(b).y > a.y);
            }
        }
    },
    setLoadingState: function(b, a) {
        switch (b) {
          case PhotoSnowbox.STATE_IMAGE_PIXELS:
            CSS.conditionClass(this.root, "imagePixelsLoading", a);
            break;
          case PhotoSnowbox.STATE_IMAGE_DATA:
            this.loadingStates[b] = a;
            CSS.conditionClass(this.root, "imageLoading", a);
            break;
          case PhotoSnowbox.STATE_HTML:
            this.loadingStates[b] = a;
            CSS.conditionClass(this.root, "dataLoading", a);
            CSS.conditionClass(this.root, "dataLoaded", !a);
            this.infoWrapper.setAttribute("aria-busy", a ? "true" : "false");
            break;
        }
    },
    destroy: function() {
        this.stageHandlers.each(function(b) {
            b.remove();
        });
        if (this.pageHandlers) {
            this.pageHandlers.each(function(b) {
                b.remove();
            });
            this.pageHandlers = null;
        }
        for (var a in this.stopWatch) this.stopWatch[a] = null;
    },
    checkState: function(b) {
        if (b != PhotoSnowbox.STATE_ERROR && !this.loadingStates[b]) return;
        switch (b) {
          case PhotoSnowbox.STATE_IMAGE_DATA:
            var a = this.stream.getCurrentImageData();
            if (a) {
                if (a.url) {
                    this.switchImage(a.url, null, true);
                } else if (a.video) this.switchVideo(a.video, true);
                this.setLoadingState(b, false);
            }
            break;
          case PhotoSnowbox.STATE_HTML:
            if (this.stream.getCurrentHtml()) {
                this.swapData();
                this.setLoadingState(b, false);
            }
            break;
          default:
            if (this.stream.errorInCurrent()) {
                CSS.hide(this.image);
                CSS.show(this.errorBox);
            }
            break;
        }
    },
    buttonListener: function(event) {
        var b = event.getTarget();
        var a = +(new Date);
        if (a - this.lastPage < 350) {
            if (Parent.byClass(b, "tagApproveIgnore")) Event.kill(event);
            return;
        }
        if (Parent.byClass(b, "likeButton")) {
            DOM.find($("fbPhotoSnowboxFeedback"), "button.like_link").click();
        } else if (Parent.byClass(b, "commentButton")) {
            DOM.find(this.root, "div.commentBox textarea").focus();
            this.root.scrollTop = this.root.scrollHeight;
        } else if (Parent.byClass(b, "tagApproveIgnore")) this.updateTagBox(event, b);
    },
    rotateListener: function(event) {
        var a = event.getTarget();
        if (Parent.byClass(a, "rotateRight")) {
            this.rotate("right");
        } else if (Parent.byClass(a, "rotateLeft")) this.rotate("left");
    },
    updateTagBox: function(event, c) {
        var a;
        if (Parent.byClass(c, "approveTag")) {
            a = true;
        } else if (Parent.byClass(c, "ignoreTag")) {
            a = false;
        } else return;
        this.unhiliteAllTags();
        var b = Parent.byClass(c, "tagBoxPending");
        CSS.addClass(b, "tagBox tagBoxPendingResponse");
        CSS.removeClass(b, "tagBoxPending");
        CSS.hide(DOM.find(b, "span.tagForm"));
        if (a) {
            CSS.show(DOM.find(b, "span.tagApproved"));
        } else CSS.show(DOM.find(b, "span.tagIgnored"));
    },
    rotate: function(c) {
        var d = this.stream.getCursor();
        if (this.getVideoOnStage()) {
            var b = c == "left" ? 270 : 90;
            Bootloader.loadComponents([ "video-rotate-snowbox" ], (new VideoRotate(d, this.actionList)).motionRotate(b));
            return;
        }
        var a = {
            fbid: d,
            cs_ver: PhotosConst.VIEWER_SNOWBOX
        };
        a[c] = 1;
        this.setLoadingState(PhotoSnowbox.STATE_IMAGE_DATA, true);
        this.setLoadingState(this.STATE_IMAGE_PIXELS, true);
        CSS.hide(this.image);
        (new AsyncRequest("/ajax/photos/photo/rotate/")).setAllowCrossPageTransition(true).setData(a).setErrorHandler(this.rotationError.bind(this, d)).setHandler(this.rotationComplete.bind(this, d)).setMethod("POST").setReadOnly(false).send();
    },
    rotationComplete: function(a, b) {
        this.storeResponseForRotate(a, b);
        if (a == this.stream.getCursor()) {
            this.setLoadingState(PhotoSnowbox.STATE_IMAGE_DATA, false);
            this.switchImage(this.stream.getCurrentImageData().url);
            this.swapData();
        }
        this.refreshOnClose = true;
    },
    storeResponseForRotate: function(a, c) {
        this.storeFromResponse(c);
        var b = this.stream.getImageData(a);
        b.url = c.getPayload().new_urls[PhotosConst.SIZE_NORMAL];
        b.dimensions = Vector2.deserialize(c.getPayload().dimensions);
    },
    rotationError: function(a, b) {
        if (a == this.stream.getCursor()) {
            this.setLoadingState(PhotoSnowbox.STATE_IMAGE_DATA, false);
            this.switchImage(this.stream.getCurrentImageData().url);
            AsyncResponse.defaultErrorHandler(b);
        }
    },
    saveTagComplete: function(a) {
        this.saveTagsFromPayload(a.getPayload());
    },
    saveTagsFromPayload: function(a) {
        this.refreshOnClose = true;
        this.storeFromData(a);
        if ("data" in a && this.stream.getCursor() in a.data) this.swapData();
    },
    mouseLeaveListener: function(event) {
        this.unhiliteAllTags();
        this.hiliteLeftmostPendingTag();
    },
    mouseMoveListener: function(event) {
        var b = event.getTarget();
        var a = Parent.byClass(b, "stageActions") || Parent.byClass(b, "stageWrapper");
        if (!a) CSS.hide(this.pivotBar);
        if (this.hasPivotData() && !this.loadingStates.html) CSS.show(this.pivotBar);
        this.hiliteTagsOnMouseMove(event);
    },
    hasPivotData: function() {
        var a = this.stream.getCurrentHtml();
        return a && a.fbPhotoSnowboxPivots;
    },
    unhiliteAllTags: function() {
        DOM.scry(this.stage, "div.tagsWrapper div.hover").each(function(a) {
            CSS.removeClass(a, "hover");
        });
        this.hilitedTag = null;
    },
    switchHilitedTags: function(b) {
        if (this.switchTimer !== null) {
            clearTimeout(this.switchTimer);
            this.switchTimer = null;
        }
        var a = ge(this.hilitedTag);
        a && CSS.removeClass(a, "hover");
        this.unhiliteAllTags();
        if (b) {
            this.hilitedTag = b;
            CSS.addClass($(this.hilitedTag), "hover");
        }
    },
    hiliteLeftmostPendingTag: function() {
        var a = ge(this.hilitedTag);
        if (a && CSS.hasClass(a, "tagBoxPending")) return;
        var b = DOM.scry(this.stage, "div.tagsWrapper div.tagBoxPending")[0];
        if (b) this.switchHilitedTags(b.id);
    },
    hiliteTagsOnMouseMove: function(event) {
        if (!this.stream.getCurrentExtraData() || this.getVideoOnStage()) return;
        if (this.switchTimer !== null) return;
        var i = Parent.byClass(event.getTarget(), "tagBoxPending");
        var d = this.hilitedTag && CSS.hasClass($(this.hilitedTag), "tagBoxPending");
        var l = !this.hilitedTag && i || !d && i;
        if (l) {
            this.switchHilitedTags(i.id);
            return;
        }
        if (i && i.id == this.hilitedTag) return;
        var a = 250;
        var h = Vector2.getEventPosition(event);
        var f = Vector2.getElementPosition(this.image);
        var e = Vector2.getElementDimensions(this.image);
        var j = this.stream.getCurrentImageData().dimensions;
        var k = e.x / j.x;
        var g = PhotosUtils.getNearestBox(h, f, j, k, PhotoSnowbox.MIN_TAG_DISTANCE * k, this.stream.getCurrentExtraData().tagRects);
        if (!g) {
            if (!d) {
                this.unhiliteAllTags();
                this.hiliteLeftmostPendingTag();
            }
            return;
        }
        var b = null;
        if (d) {
            var c = {};
            c[this.hilitedTag] = this.stream.getCurrentExtraData().tagRects[this.hilitedTag];
            b = PhotosUtils.getNearestBox(h, f, j, k, PhotoSnowbox.MIN_TAG_DISTANCE * k, c);
        }
        if (b !== null && d) return;
        if (this.hilitedTag != g) if (d) {
            this.switchTimer = this.switchHilitedTags.bind(this, g).defer(a);
        } else this.switchHilitedTags(g);
    },
    getVideoOnStage: function() {
        var a = this.stream && this.stream.getCurrentImageData();
        return a && a.video;
    },
    shouldGoForward: function(a, c) {
        var d = a == KEYS.RIGHT || Parent.byClass(c, "next");
        if (d) return true;
        var b = this.getVideoOnStage() || CSS.hasClass(this.root, "taggingMode") || Parent.byClass(c, "tagBoxPending") || Parent.byClass(c, "tagBoxPendingResponse");
        if (b) return false;
        return DOM.isNode(c) && Parent.byClass(c, "stage");
    },
    pageListener: function(event) {
        var a = Event.getKeyCode(event);
        var b = event.getTarget();
        if (a == KEYS.LEFT || Parent.byClass(b, "prev")) {
            this.page(-1);
            user_action(b, "a", event);
            return;
        }
        if (this.shouldGoForward(a, b)) {
            this.page(1);
            user_action(b, "a", event);
        }
    },
    page: function(c, b) {
        if (!this.stream.isValidMovement(c)) return;
        this.lastPage = +(new Date);
        this.unhiliteAllTags();
        var d = this.getVideoOnStage();
        if (d) this.switchVideo(d, false);
        Arbiter.inform(PhotoSnowbox.PAGE);
        this.recacheData();
        this.stream.moveCursor(c);
        CSS.hide(this.image);
        if (this.stream.errorInCurrent()) {
            this.setLoadingState(PhotoSnowbox.STATE_HTML, true);
            CSS.show(this.errorBox);
            return;
        }
        var a = this.stream.getCurrentImageData();
        if (a) {
            if (a.url) {
                this.switchImage(a.url, null, true);
            } else if (a.video) this.switchVideo(a.video, true);
            if (!b) {
                this.replaceUrl = true;
                goURI(a.info.permalink);
            }
        } else {
            this.waitForLoadCount++;
            this.setLoadingState(PhotoSnowbox.STATE_IMAGE_PIXELS, true);
            this.setLoadingState(PhotoSnowbox.STATE_IMAGE_DATA, true);
        }
        if (this.stream.getCurrentHtml()) {
            this.swapData();
        } else this.setLoadingState(PhotoSnowbox.STATE_HTML, true);
        this.hiliteLeftmostPendingTag();
    },
    transitionHandler: function(c) {
        if (c.getQueryData().closeTheater || c.getQueryData().permPage || this.returningToStart) return false;
        if (this.replaceUrl) {
            this.replaceUrl = false;
            this._uriStack.push(c.getQualifiedURI().toString());
            PageTransitions.transitionComplete();
            return true;
        }
        if (c.getQueryData().makeprofile) {
            this.close();
            return false;
        }
        var d = this._uriStack.length;
        if (d >= 2 && this._uriStack[d - 2] == c.getQualifiedURI().toString()) this._uriStack.pop();
        var a = this.stream.getCursorForURI(c.getUnqualifiedURI().toString());
        if (a) {
            var b = this.stream.getRelativeMovement(a);
            this.page(b, true);
            PageTransitions.transitionComplete();
            return true;
        }
        return false;
    },
    recacheData: function() {
        if (!this.loadingStates.html) {
            var a = this.stream.getCurrentHtml();
            for (var b in a) {
                a[b] = $A($(b).childNodes);
                DOM.empty($(b));
            }
        }
    },
    reloadIfTimeout: function() {
        if (!image_has_loaded(this.image)) {
            var a = this.makeNewImage(this.image.src, true);
            Event.listen(a, "load", this.useImage.bind(this, a, null, true));
        }
    },
    useImage: function(c, a, b) {
        if (b && image_has_loaded(this.image)) return;
        DOM.replace(this.image, c);
        this.image = c;
        this.adjustStageSize(a);
    },
    makeNewImage: function(c, a) {
        if (this.imageLoadingTimer) {
            clearTimeout(this.imageLoadingTimer);
            this.imageLoadingTimer = null;
        } else if (!a) this.imageRefreshTimer = setTimeout(this.reloadIfTimeout.bind(this), PhotoSnowbox.LOADING_TIMEOUT);
        var b = $N("img", {
            className: "spotlight",
            alt: ""
        });
        b.setAttribute("aria-describedby", "fbPhotosSnowboxCaption");
        b.setAttribute("aria-busy", "true");
        Event.listen(b, "load", async_callback(function() {
            clearTimeout(this.imageRefreshTimer);
            this.image.setAttribute("aria-busy", "false");
            this.setLoadingState(this.STATE_IMAGE_PIXELS, false);
            (function() {
                this.adjustStageSize();
                this.adjustForNewData();
            }).bind(this).defer();
        }.bind(this), "photo_theater"));
        b.src = c;
        return b;
    },
    switchImage: function(d, b, c) {
        CSS.hide(this.image);
        CSS.hide(this.errorBox);
        this.setLoadingState(this.STATE_IMAGE_PIXELS, true);
        var a = this.stream && this.stream.getCurrentImageData();
        if (a) PhotoSnowboxLog.addPhotoView(a.info);
        this.useImage(this.makeNewImage(d, false), b, false);
        if (c) this.stream.preloadImages();
    },
    switchVideo: function(c, a) {
        var b = "swf_" + c;
        if (a) {
            CSS.addClass(this.stageWrapper, "showVideo");
            this.videoStage.id = c;
            if (window[b] && !ge(b)) window[b].write(c);
            this.adjustStageSizeForVideo.bind(this, b).defer();
        } else {
            this.videoStage.id = "fbVideoStage";
            window[b] && window[b].addVariable("video_autoplay", 0);
            this.videoLoadTimer && clearTimeout(this.videoLoadTimer);
            DOM.empty(this.videoStage);
            CSS.removeClass(this.stageWrapper, "showVideo");
        }
    },
    checkVideoStatus: function(a) {
        if (this.videoLoadTimer) clearTimeout(this.videoLoadTimer);
        video = this.getVideoOnStage();
        if (!video) {
            return;
        } else {
            currentSwfID = "swf_" + video;
            if (a !== currentSwfID) return;
            this.adjustStageSizeForVideo(a);
        }
    },
    adjustStageSizeForVideo: function(a) {
        var b = ge(a);
        if (!b) {
            this.videoLoadTimer = setTimeout(this.checkVideoStatus.bind(this, a), 200);
        } else this.adjustStageSize(new Vector2(b.width, b.height));
    },
    setErrorBoxContent: function(a) {
        DOM.setContent(this.errorBox, a);
    },
    swapData: function() {
        var b, c = this.stream.getCurrentHtml();
        if (c) {
            this.setLoadingState(PhotoSnowbox.STATE_HTML, false);
            for (var d in c) {
                b = ge(d);
                b && DOM.setContent(b, c[d]);
            }
            var a = DOM.scry($("fbPhotoSnowboxCaption"), "div.fbPhotoInlineCaptionEditor");
            if (a.length) (new PhotoInlineCaptionEditor("snowbox")).init(a[0]);
            Arbiter.inform(PhotoSnowbox.DATA_CHANGE, this.stream.getCurrentImageData().info, Arbiter.BEHAVIOR_STATE);
            this.position = this.stream.getCursor();
            if (ge(this.hilitedTag)) {
                CSS.addClass($(this.hilitedTag), "hover");
            } else this.hiliteLeftmostPendingTag();
        }
        this.adjustForNewData();
    },
    updateTotalCount: function(c, b, a) {
        element = ge("fbPhotoSnowboxpositionAndCount");
        element && DOM.setContent(element, a);
        this.stream.setTotalCount(c);
        this.stream.setFirstCursorIndex(b);
    },
    addPhotoFbids: function(b, c, a) {
        var d = this.stream.getCursor() === null;
        this.stream.attachToFbidsList(b, c, a);
        if (a && d) this.page(0);
    },
    storeFromResponse: function(a) {
        this.storeFromData(a.getPayload());
    },
    storeFromData: function(a) {
        if (!this.isOpen) return;
        var b = this.stream.storeToCache(a);
        if ("error" in b) {
            this.checkState(PhotoSnowbox.STATE_ERROR);
            return;
        }
        if ("init" in b) {
            this.initDataFetched(b.init);
            if (this.openExplicitly) {
                this.replaceUrl = true;
                goURI(this.stream.getCurrentImageData().info.permalink);
            }
            CSS.conditionShow(this.stagePagers, this.stream.canPage());
            this.stopWatch.showUfi = +(new Date);
        } else if (!this.secondBatchArrived) {
            CSS.conditionShow(this.stagePagers, this.stream.canPage());
            this.secondBatchArrived = true;
            this.stopWatch.secondBatch = +(new Date);
        }
        if ("image" in b) this.checkState(PhotoSnowbox.STATE_IMAGE_DATA);
        if ("data" in b) this.checkState(PhotoSnowbox.STATE_HTML);
    },
    deletePhoto: function(a) {
        this.closeRefresh();
    },
    closeRefresh: function() {
        this.refreshOnClose = true;
        this.closeHandler();
    }
};

var ComposerAudienceSelector = function() {
    var b = {};
    var a = {};
    onloadRegister(function() {
        Selector.subscribe("select", function(c, d) {
            if (!CSS.hasClass(d.selector, "composerAudienceSelector")) return;
            var e = DOM.find(d.option, "a").getAttribute("data-type");
            if (!CSS.hasClass(d.option, "groupOption")) Arbiter.inform("ComposerAudienceSelector/nongroup");
            if (!CSS.hasClass(d.option, "specialOption")) return;
            if (CSS.hasClass(d.option, "moreOption")) {
                CSS.addClass(d.selector, e);
                CSS.addClass(d.selector, "showSecondaryOptions");
                return false;
            } else if (CSS.hasClass(d.option, "returnOption")) {
                CSS.removeClass(d.selector, "showSecondaryOptions");
                CSS.removeClass(d.selector, "friendList");
                return false;
            } else if (e == "group") Arbiter.inform("ComposerAudienceSelector/group", {
                group: Selector.getOptionValue(d.option)
            });
        });
        Arbiter.subscribe("CustomPrivacyOption/update", function(c, d) {
            if (CSS.hasClass(d.selector, "composerAudienceSelector")) Arbiter.inform("ComposerAudienceSelector/nongroup");
        });
        Selector.subscribe("close", function(c, d) {
            if (!CSS.hasClass(d.selector, "composerAudienceSelector")) return;
            var e = Selector.getSelectedOptions(d.selector)[0];
            CSS.conditionClass(d.selector, "showSecondaryGroups", CSS.hasClass(e, "secondaryGroup"));
        });
    });
    return {
        syncSelector: function(e) {
            b[e] && Selector.setSelected(e, b[e]);
            if (b[e] == PrivacyBaseValue.CUSTOM && a[e]) {
                var c = Selector.getOption(e, PrivacyBaseValue.CUSTOM + "");
                var d = a[e];
                (function() {
                    CustomPrivacyOption.update(c.id, d.data, d.audience, d.tooltip);
                }).defer();
            }
        }
    };
}();

function CustomPrivacyOption() {}

copy_properties(CustomPrivacyOption, {
    _instances: {},
    _states: {},
    update: function(c, b, a, e) {
        var d = CustomPrivacyOption._instances[c];
        d._updateSelector(a, e)._update(b, a);
        CustomPrivacyOption._states[c] = {
            data: b,
            audience: a,
            tooltip: e
        };
        Arbiter.inform("Form/change", {
            node: d._container
        });
    },
    getState: function(a) {
        return CustomPrivacyOption._states[a] || {};
    }
});

CustomPrivacyOption.prototype = {
    init: function(d, c, b, e, a) {
        (function() {
            var g = $(d);
            CustomPrivacyOption._instances[d] = this;
            this._selector = Parent.byClass(g, "uiSelector");
            this._container = DOM.scry(g, ".customPrivacyInputs")[0];
            this._id = c;
            this._privacyData = {};
            var f = Form.serialize(this._container);
            if (f.audience) this._privacyData = f.audience[c];
            Event.listen(g, "click", function(h) {
                var i = (new AsyncRequest("/ajax/privacy/custom_dialog/")).setData({
                    option_id: d,
                    id: this._id,
                    privacy_data: this._privacyData,
                    explain_tags: b,
                    autosave: a
                });
                (new Dialog).setAsync(i).setModal(true).show();
            }.bind(this));
            Selector.listen(this._selector, "select", function(h) {
                if (h.option._id != this._id) {
                    CustomPrivacyOption._states[this._id] = {};
                    this._clear();
                }
            }.bind(this));
            if (e) Selector.setButtonTooltip(this._selector, e);
        }).bind(this).defer();
    },
    _updateSelector: function(c, b) {
        var a = Selector.getOption(this._selector, c) || Selector.getOption(this._selector, PrivacyBaseValue.CUSTOM + "");
        Arbiter.inform("CustomPrivacyOption/update", {
            selector: this._selector,
            option: a,
            tooltip: b
        });
        return this;
    },
    _clear: function() {
        this._privacyData = {};
        this._container && DOM.empty(this._container);
    },
    _update: function(b, a) {
        this._clear();
        this._privacyData = copy_properties({}, b);
        var c = a == PrivacyBaseValue.CUSTOM || !Selector.getOption(this._selector, a);
        if (this._container && c) {
            var d = this._selector.getAttribute("data-name").slice(0, -"[value]".length);
            var e = {};
            e[d] = b;
            Form.createHiddenInputs(e, this._container, null, true);
        }
        return this;
    }
};

function FriendsPrivacyOption() {}

FriendsPrivacyOption.prototype = {
    init: function(a, b) {
        this._selector = Parent.byClass(a, "composerAudienceSelector");
        if (!this._selector) return;
        this._elem = a;
        this._hasRestricted = b;
        this._plusLabel = DOM.find(a, ".plusLabel");
        this._tags = [];
        this._recalculateTooltipAndLabel();
        this._updateSelector();
        Arbiter.subscribe("Composer/changedtags", function(c, d) {
            this._tags = d.withTags.map(function(g) {
                return g.getText();
            });
            var f = d.withTags.map(function(g) {
                return g.getValue();
            });
            for (var e in d.mention) if (d.mention[e].type == "user") {
                this._tags.push(d.mention[e].text);
                f.push(d.mention[e].uid);
            }
            if (this._recalculateTooltipAndLabel() && this._updateSelector()) Arbiter.inform("FriendsPrivacyOption/changed", f);
        }.bind(this));
        Selector.listen(this._selector, "change", this._updateSelector.bind(this));
    },
    _recalculateTooltipAndLabel: function() {
        var a = this._tags.length, b = this._tooltip;
        if (a > 2) {
            this._tooltip = this._hasRestricted ? _tx("Vos amis et les amis des personnes identifiées ; sauf : Restreint") : _tx("Vos amis et les amis des personnes identifiées");
        } else if (a == 2) {
            if (this._hasRestricted) {
                this._tooltip = _tx("Vos amis, les amis de {user} et les amis de {user2} ; sauf : Restreint", {
                    user: this._tags[0],
                    user2: this._tags[1]
                });
            } else this._tooltip = _tx("Vos amis, ceux de {user} et de {user2}", {
                user: this._tags[0],
                user2: this._tags[1]
            });
        } else if (a == 1) {
            if (this._hasRestricted) {
                this._tooltip = _tx("Vos amis et les amis de {user} ; sauf : Restreint", {
                    user: this._tags[0]
                });
            } else this._tooltip = _tx("Vos amis et ceux de {user}", {
                user: this._tags[0]
            });
        } else this._tooltip = this._hasRestricted ? _tx("Vos amis ; sauf : Restreint") : _tx("Vos amis");
        CSS.conditionShow(this._plusLabel, this._tags.length);
        return b != this._tooltip;
    },
    _updateSelector: function() {
        if (!Selector.isOptionSelected(this._elem)) return false;
        var a = this._elem.getAttribute("data-label");
        if (this._tags.length) a += " (+)";
        Selector.setButtonLabel(this._selector, a);
        Selector.setButtonTooltip(this._selector, this._tooltip);
        return true;
    }
};

function MetaComposerEdDialog() {}

MetaComposerEdDialog.prototype = {
    init: function(c, d) {
        this._dialog = c;
        var b = Arbiter.subscribe("FriendsPrivacyOption/changed", function(f, g) {
            if (Parent.byClass(c.getContext(), "hidden_elem")) return;
            this._async && this._async.abort();
            this._async = new AsyncRequest("/ajax/composer/audience_education");
            this._async.setData({
                ids: g,
                num: d
            }).setHandler(this._handler.bind(this)).send();
        }.bind(this));
        var a = DOM.find(c.getContext(), ".composerAudienceSelector");
        Selector.listen(a, "open", this._killAnim.bind(this));
        var e = Arbiter.subscribe("page_transition", function(f, g) {
            Arbiter.unsubscribe(e);
            Arbiter.unsubscribe(b);
        }, Arbiter.SUBSCRIBE_NEW);
    },
    _handler: function(c) {
        var d = c.payload;
        if (!d) return;
        var a = this._dialog.getContent();
        DOM.setContent(a, HTML(d));
        this._dialog.setDestroyOnHide(false).show();
        var b = Parent.byClass(a, "metaComposerUserEd");
        if (this._anim) {
            this._anim.stop();
            this._anim = animation(b);
        } else this._anim = animation(b).from("opacity", 0);
        this._anim.by("opacity", 1).checkpoint().duration(3e3).checkpoint().to("opacity", 0).checkpoint().ondone(this._killAnim.bind(this)).go();
    },
    _killAnim: function() {
        if (this._anim) {
            this._anim.stop();
            this._dialog.hide(false);
            this._anim = null;
        }
    }
};

function StreamProfileComposer() {}

StreamProfileComposer.prototype = {
    init: function(a) {
        var b = $(a);
        Arbiter.subscribe("composer/publish", function(event, c) {
            if (c.streamStory) animation.prependInsert(b, c.streamStory);
        });
    }
};