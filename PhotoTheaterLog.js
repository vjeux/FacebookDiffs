if (window.CavalryLogger) {
    CavalryLogger.start_js([ "chq0B" ]);
}

function PhotoTheaterLog() {}

copy_properties(PhotoTheaterLog, {
    UNKNOWN: 0,
    ESC: 1,
    X: 2,
    OUTSIDE: 3,
    UNLOAD: 4,
    NAVIGATE: 5,
    AGGREGATE: 6,
    AGGREGATION_COUNT: 20,
    set: null,
    time: null,
    views: 0,
    fbidList: [],
    width: 0,
    height: 0,
    first: false,
    last: false,
    logIds: false,
    initLogging: function() {
        this.set = null;
        this.time = new Date;
        this.views = 1;
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
    addPhotoView: function(a) {
        if (this.logIds && this.views >= this.AGGREGATION_COUNT) this.logPhotoViews(this.AGGREGATE);
        this.views++;
        this.addPhotoFbid(a);
    },
    addPhotoFbid: function(a) {
        if (this.logIds && a) this.fbidList.push(a);
    },
    logPhotoViews: function(a) {
        if (this.views) {
            var c = Vector2.getViewportDimensions();
            if (a != this.AGGREGATE) this.last = true;
            var b = {
                set: this.set,
                time: new Date - this.time,
                views: this.views,
                fbids: this.fbidList,
                width: c.x || this.width,
                height: c.y || this.height,
                first: this.first,
                last: this.last,
                close: a ? a : this.UNKNOWN
            };
            (new AsyncRequest).setURI("/ajax/photos/theater/session_logging.php").setAllowCrossPageTransition(true).setOption("asynchronous", a != PhotoSnowboxLog.UNLOAD).setOption("suppressCacheInvalidation", true).setOption("suppressErrorHandlerWarning", true).setData(b).send();
            this.views = 0;
            this.fbidList = [];
            this.first = false;
            if (this.last) {
                this.set = null;
                this.logIds = false;
            }
        }
    }
});

onunloadRegister(function() {
    PhotoTheaterLog.logPhotoViews(PhotoTheaterLog.UNLOAD);
});

var PhotoTheater = {
    OPEN: "PhotoTheater.OPEN",
    CLOSE: "PhotoTheater.CLOSE",
    PAGE: "PhotoTheater.PAGE",
    RESET_HELP: "PhotoTheater.RESET_HELP",
    GO: "PhotoTheater.GO",
    DATA_CHANGE: "PhotoTheater.DATA_CHANGE",
    BUCKET_SIZE: 15,
    BUFFER_PERCENT: 1 / 3,
    PRELOAD_BUFFER: 5,
    ADS_REFRESH_RATE: 3e4,
    LOADING_IMAGE: "/images/loaders/indicator_black.gif",
    LOADING_TIMEOUT: 500,
    SIZES: {
        NORMAL: "n"
    },
    MIN_TAG_DISTANCE: 83,
    IMG_MAX_HEIGHT: 720,
    IMG_MIN_HEIGHT: 500,
    STAGE_CHROME: 150,
    STAGE_CHROME_NARROWER: 100,
    STAGE_CHROME_NARROWEST: 88,
    stageChrome: 0,
    bootstrap: function(b, a) {
        this.loading && CSS.removeClass(this.loading, "loading");
        CSS.addClass(this.loading = a, "loading");
        Arbiter.inform(PhotoTheater.GO, b, Arbiter.BEHAVIOR_STATE);
        this.loadIfUninitialized();
        Bootloader.loadComponents([ "TagTokenizer", "TagToken", "PhotoTag", "PhotoTagger" ]);
    },
    loadImageOnMouseDown: function(event) {
        var a = Parent.byTag(event.getTarget(), "a");
        if (a && a.getAttribute("rel") == "theater") {
            var c = URI(a.getAttribute("ajaxify")).getQueryData();
            if (c.src) {
                var b = new Image;
                b.src = c.src;
            }
        }
    },
    loadIfUninitialized: function() {
        if (this.root) return;
        (new AsyncRequest).setURI("/ajax/photos/theater/init.php").setMethod("GET").setAllowCrossPageTransition(true).setReadOnly(true).send();
    },
    init: function(a) {
        var b = ge("fbPhotoTheater");
        if (!b) {
            b = DOM.appendContent(document.body, a)[0];
            this.initialLoad = false;
        }
        if (this.root == b) return;
        this.initializeNodes(b);
        if (!this.subscription) {
            LinkController.registerHandler(this.handleNavigateAway.bind(this), LinkController.TARGETS | LinkController.MODIFIERS);
            Event.listen(document.documentElement, "mousedown", this.loadImageOnMouseDown.bind(this));
            this.subscription = Arbiter.subscribe(PhotoTheater.GO, function(c, d) {
                CSS.removeClass(this.loading, "loading");
                this.open(d);
            }.bind(this));
        }
        PageTransitions.registerHandler(this.openHandler.bind(this));
    },
    initializeNodes: function(a) {
        this.root = a;
        this.container = DOM.find(a, "div.container");
        this.positioner = DOM.find(a, "div.positioner");
        this.infoWrapper = DOM.find(a, "div.photoInfoWrapper");
        this.stageWrapper = DOM.find(a, "div.stageWrapper");
        this.videoStage = DOM.find(this.stageWrapper, "div.videoStage");
        this.stage = DOM.find(this.stageWrapper, "div.stage");
        this.errorBox = DOM.find(this.stageWrapper, "div.stageError");
        this.stageActions = DOM.find(a, "div.stageActions");
        this.prevPager = DOM.find(this.stageActions, "a.prev");
        this.nextPager = DOM.find(this.stageActions, "a.next");
        this.buttonActions = DOM.find(this.stageActions, "div.fbPhotoTheaterButtons");
        this.stageChrome = this.STAGE_CHROME;
        if (CSS.hasClass(a, "narrowerWhiteBar")) {
            this.stageChrome = this.STAGE_CHROME_NARROWER;
        } else if (CSS.hasClass(a, "narrowestWhiteBar")) this.stageChrome = this.STAGE_CHROME_NARROWEST;
        Event.listen(this.root, "click", this.closeListener.bind(this));
    },
    getRoot: function() {
        return this.root;
    },
    openHandler: function(a) {
        if (this.isOpen || a.getPath() != "/photo.php" || a.getQueryData().closeTheater || a.getQueryData().permPage || a.getQueryData().makeprofile) return false;
        this.open(a);
        PageTransitions.transitionComplete();
        return true;
    },
    open: function(a) {
        Bootloader.loadComponents("fb-photos-theater-css", function() {
            this._open(a);
        }.bind(this));
    },
    _open: function(d) {
        var a = URI(d).getQueryData();
        var c = a.src;
        this.urlEntryCount = 1;
        this.hasSrc = !!c;
        if (c) delete a.src;
        if (!this.initialLoad) {
            a.firstLoad = true;
            this.initialLoad = true;
        }
        this.isOpen = true;
        this.refreshOnClose = false;
        this.hilitedTag = null;
        this.createLoader(c, a);
        this.stageHandlers = [ Event.listen(window, "resize", this.adjustForResize.bind(this)), Event.listen(this.buttonActions, "click", this.buttonListener.bind(this)) ];
        var b = $("fbPhotoTheaterUfi");
        if (b) this.stageHandlers.push(Event.listen(b, "click", function(event) {
            if (Parent.byClass(event.getTarget(), "like_link")) CSS.toggleClass(DOM.find(this.buttonActions, "a.likeButton"), "viewerLikesThis");
        }.bind(this)));
        PageTransitions.registerHandler(function(e) {
            if (this.isOpen && this.urlEntryCount == 1 && !e.getQueryData().makeprofile) {
                this.close();
                return true;
            }
            return false;
        }.bind(this));
        this.startingURI = URI.getMostRecentURI().addQueryData({
            closeTheater: 1
        }).getUnqualifiedURI();
        KeyEventController.registerKey("ESCAPE", this.closeListener.bind(this));
        this.initLoader();
        PhotoTheaterLog.initLogging();
        if (ua.firefox()) (function() {
            DOM.scry(document, "div.swfObject").each(function(g) {
                var h = g.getAttribute("data-swfid");
                if (h && window[h]) {
                    var f = window[h];
                    f.addParam("autostart", "false");
                    f.addParam("autoplay", "false");
                    f.addParam("play", "false");
                    f.addVariable("video_autoplay", "0");
                    f.addVariable("autoplay", "0");
                    f.addVariable("play", "0");
                    var e = URI(f.getAttribute("swf"));
                    e.addQueryData({
                        autoplay: "0"
                    });
                    e.setPath(e.getPath().replace("autoplay=1", "autoplay=0"));
                    f.setAttribute("swf", e.toString());
                    f.write(g);
                }
            });
        }).bind(this).defer();
        CSS.addClass(document.documentElement, "theaterMode");
        CSS.show(this.root);
        Arbiter.inform("new_layer");
        Arbiter.inform(PhotoTheater.OPEN);
        (function() {
            this.adjustForResize();
            this.adjustForChromeBug(true);
            if (ua.ie()) {
                this.container.focus();
            } else this.root.focus();
        }).bind(this).defer();
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
    returnToStartingURI: function(b, a) {
        if (!b) if (a) {
            this.squashNextTransition(goURI.curry(a));
        } else this.squashNextTransition();
        if (this.urlEntryCount < window.history.length) {
            window.history.go(-1 * this.urlEntryCount);
        } else goURI(PhotoTheater.startingURI);
    },
    squashNextTransition: function(a) {
        this.squashNext = true;
        PageTransitions.registerHandler(function(b) {
            if (PhotoTheater.squashNext) {
                PhotoTheater.squashNext = false;
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
            if (!this.closingAction) this.closingAction = PhotoTheaterLog.NAVIGATE;
            this.close();
            this.returnToStartingURI(false, a);
            return false;
        }
        return true;
    },
    closeListener: function(event) {
        if (this.isOpen && !(window.Dialog && Dialog.getCurrent())) {
            var b = event.getTarget();
            var a = Parent.byClass(b, "closeTheater");
            if (b == this.root || b == this.container || b == this.positioner || b == this.infoWrapper || a) {
                if (a) {
                    this.closingAction = PhotoTheaterLog.X;
                } else this.closingAction = PhotoTheaterLog.OUTSIDE;
                this.closeHandler();
                Event.kill(event);
            } else if (Event.getKeyCode(event) == KEYS.ESC) {
                this.closingAction = PhotoTheaterLog.ESC;
                Event.kill(event);
                this.closeHandler();
            }
        }
    },
    close: function() {
        if (this.isOpen) {
            this.isOpen = false;
            CSS.hide(this.errorBox);
            KeyEventController.getInstance().resetHandlers();
            this.destroy();
            CSS.removeClass(document.documentElement, "theaterMode");
            this.switchImage(this.LOADING_IMAGE, false);
            CSS.removeClass(this.stageWrapper, "showVideo");
            DOM.empty(this.videoStage);
            this.recacheData();
            PhotoTheaterLog.logPhotoViews(this.closingAction);
            var a = this.closingAction === PhotoTheaterLog.NAVIGATE;
            this.closingAction = null;
            DOM.empty(DOM.find(this.root, "div.fbPhotoTheaterEgo"));
            PageTransitions.registerHandler(this.openHandler.bind(this));
            Arbiter.inform(PhotoTheater.CLOSE, a);
            this.root.setAttribute("aria-busy", "true");
        }
    },
    createLoader: function(a, b) {
        this.image = DOM.find(this.root, "img.spotlight");
        this.loadQuery = b;
        if (a) (function() {
            this.switchImage(a, false);
        }).bind(this).defer();
        CSS.hide(this.stageActions);
    },
    initLoader: function() {
        this.loaded = false;
        this.cache = {
            image: [],
            extra: [],
            html: [],
            error: []
        };
        this.permalinkMap = {};
        this.lastAdsLoad = 0;
        this.dataLoadTimer = null;
        this.imageLoadingTimer = null;
        this.loadingStates = {
            image: false,
            html: false
        };
        this.uncachedCount = null;
        this.loadingRange = {
            start: null,
            end: null
        };
        this.fetchInitialData();
        this.adjustMagicStageLineHeight();
        this.setLoadingState("html", true);
        PageTransitions.registerHandler(this.transitionHandler.bind(this));
    },
    fetchInitialData: function() {
        (new AsyncRequest).setURI("/ajax/photos/theater/load.php").setMethod("GET").setReadOnly(true).setAllowCrossPageTransition(true).setData(this.loadQuery).setHandler(this.storeFromResponse.bind(this)).send();
    },
    initialLoadResponse: function(a) {
        if (this.loaded) return;
        this.loaded = true;
        this.total = a.total;
        this.canPage = this.total > 1;
        this.position = a.position;
        this.photoSetQuery = a.query;
        this.loadingRange = {
            start: this.position,
            end: this.position
        };
        PhotoTheaterLog.setPhotoSet(this.photoSetQuery.set);
        PhotoTheaterLog.setLogFbids(a.logids);
        PhotoTheaterLog.addPhotoFbid(a.fbid);
        this.uncachedCount = this.total - 1;
        if (this.canPage) {
            if (!this.pageHandlers) {
                var c = {
                    mouseout: this.mouseOutListener.bind(this),
                    mousemove: this.mouseMoveListener.bind(this),
                    click: this.pageListener.bind(this)
                };
                this.pageHandlers = values(Event.listen(this.container, c));
                KeyEventController.registerKey("LEFT", this.pageListener.bind(this));
                KeyEventController.registerKey("RIGHT", this.pageListener.bind(this));
            }
            var b = 5;
            this.calculateNewRangeAndFetchIfNeccessary(b);
        } else if (this.pageHandlers) this.pageHandlers.each(function(d) {
            d.remove();
        });
        this.adjustForChromeBug.bind(this).defer();
        CSS.conditionClass(this.stageActions, "hidePagers", !this.canPage);
        CSS.show(this.stageActions);
        this.root.setAttribute("aria-busy", "false");
    },
    adjustMagicStageLineHeight: function() {
        var a = Math.min(this.IMG_MAX_HEIGHT, Math.max(this.IMG_MIN_HEIGHT, Vector2.getViewportDimensions().y - this.stageChrome));
        if (ua.ie() == 7) this.stageWrapper.style.height = a + "px";
        this.stage.style.lineHeight = a + "px";
        this.videoStage.style.lineHeight = a + "px";
        if (this.image.offsetHeight) {
            var b = Vector2.getElementPosition;
            var c = Math.floor(b(this.image).y - b(this.stage).y - 1 - (this.stage.offsetHeight - this.image.offsetHeight) / 2);
            if (c) CSS.setStyle(this.stage, "marginTop", -c + "px");
        }
    },
    adjustForResize: function() {
        var a = Vector2.getViewportDimensions();
        CSS.conditionClass(document.body, "tinyScreen", a.x <= 981);
        if (ua.ie() < 9) CSS.conditionClass(this.stageWrapper, "stageWrapperIEFix", a.y - this.stageChrome < this.IMG_MIN_HEIGHT);
        this.revertChromeBugFix();
        this.adjustMagicStageLineHeight();
        this.adjustForNewData();
    },
    adjustForNewData: function() {
        if (ua.firefox() || ua.ie()) {
            var c = DOM.scry(this.root, "div.tagsWrapper")[0];
            var a = Vector2.getElementDimensions(this.image);
            if (c) {
                c.style.width = a.x + "px";
                if (ua.ie() <= 7) {
                    var b = DOM.scry(this.root, "div.tagContainer")[0];
                    if (b) CSS.conditionClass(c, "ie7VerticalFix", Vector2.getElementDimensions(b).y > a.y);
                }
            }
        }
    },
    adjustForChromeBug: function(a) {
        if (ua.chrome()) if (a) {
            this.stage.style.width = "960px";
        } else {
            var b = Vector2.getElementDimensions(this.image).x;
            this.stage.style.width = b ? b + "px" : "auto";
        }
    },
    revertChromeBugFix: function() {
        if (ua.chrome()) this.stage.style.width = "auto";
    },
    checkToLoadAds: function() {
        if (this.noAds) return;
        var a = +(new Date);
        if (a - this.lastAdsLoad > this.ADS_REFRESH_RATE) {
            UIPagelet.loadFromEndpoint("WebEgoPane", "fbPhotoTheaterEgo", {
                pid: 13,
                data: []
            }, {
                crossPage: true
            });
            this.lastAdsLoad = a;
        }
    },
    setLoadingState: function(b, a) {
        this.loadingStates[b] = a;
        if (b == "image") {
            if (this.imageLoadingTimer) {
                clearTimeout(this.imageLoadingTimer);
                this.imageLoadingTimer = null;
            }
            if (a) this.imageLoadingTimer = setTimeout(this.imageLoadingTimeout.bind(this), this.LOADING_TIMEOUT);
            CSS.conditionClass(this.root, "imageLoading", a);
        } else {
            CSS.conditionClass(this.root, "dataLoading", a);
            this.infoWrapper.setAttribute("aria-busy", a ? "true" : "false");
        }
    },
    destroy: function() {
        this.stageHandlers.each(function(a) {
            a.remove();
        });
        if (this.pageHandlers) {
            this.pageHandlers.each(function(a) {
                a.remove();
            });
            this.pageHandlers = null;
        }
    },
    checkState: function(a) {
        if (a != "error" && !this.loadingStates[a]) return;
        if (a == "image") {
            if (this.cache.image[this.position]) {
                if (this.cache.image[this.position].url) {
                    this.switchImage(this.cache.image[this.position].url, true);
                } else if (this.cache.image[this.position].video) this.switchVideo(this.cache.image[this.position].video, true);
                this.setLoadingState(a, false);
            }
        } else if (a == "html") {
            if (this.cache.html[this.position]) {
                this.swapData();
                this.setLoadingState(a, false);
            }
        } else if (this.cache.error[this.position]) {
            CSS.hide(this.image);
            CSS.show(this.errorBox);
        }
    },
    buttonListener: function(event) {
        var a = event.getTarget();
        if (Parent.byClass(a, "likeButton")) {
            DOM.find($("fbPhotoTheaterUfi"), "button.like_link").click();
        } else if (Parent.byClass(a, "commentButton")) {
            DOM.find(this.root, "div.commentBox textarea").focus();
            this.root.scrollTop = this.root.scrollHeight;
        } else if (Parent.byClass(a, "rotateRight")) {
            this.rotate("right");
        } else if (Parent.byClass(a, "rotateLeft")) this.rotate("left");
    },
    rotate: function(b) {
        var c = this.cache.image[this.position];
        var a = {
            fbid: c.info.fbid,
            position: this.position
        };
        a[b] = 1;
        a.cs_ver = PhotosConst.VIEWER_THEATER;
        this.setLoadingState("image", true);
        var d = c.url;
        c.url = this.LOADING_IMAGE;
        var e = this.position;
        (new AsyncRequest("/ajax/photos/photo/rotate/")).setMethod("POST").setAllowCrossPageTransition(true).setReadOnly(false).setData(a).setHandler(this.rotationComplete.bind(this, e)).setErrorHandler(this.rotationError.bind(this, e, d)).send();
    },
    rotationComplete: function(b, c) {
        this.storeFromResponse(c);
        var a = this.cache.image[b];
        a.url = c.getPayload().new_urls[this.SIZES.NORMAL];
        if (b == this.position) {
            this.setLoadingState("image", false);
            this.swapData();
            this.switchImage(a.url);
        }
        this.refreshOnClose = true;
    },
    rotationError: function(b, c, d) {
        var a = this.cache.image[b];
        a.url = c;
        if (b == this.position) {
            this.switchImage(a.url);
            this.setLoadingState("image", false);
            AsyncResponse.defaultErrorHandler(d);
        }
    },
    saveTagComplete: function(b) {
        this.refreshOnClose = true;
        this.storeFromResponse(b);
        var a = b.getPayload();
        if ("data" in a && this.position in a.data) this.swapData();
    },
    mouseOutListener: function(event) {
        var d = event.getTarget();
        var a = event.getRelatedTarget();
        var b = Parent.byClass(d, "stageActions");
        var c = Parent.byClass(d, "stageWrapper");
        var e = Parent.byClass(a, "stageActions");
        var f = Parent.byClass(a, "stageWrapper");
        if (c && !e || b && !f) {
            CSS.removeClass(this.prevPager, "hover");
            CSS.removeClass(this.nextPager, "hover");
            this.unhiliteCurrentTag();
        }
    },
    mouseMoveListener: function(event) {
        var c = event.getTarget();
        var b = Parent.byClass(c, "stageActions") || Parent.byClass(c, "stageWrapper");
        if (!b) return;
        var a = c == this.prevPager;
        CSS.conditionClass(this.prevPager, "hover", a);
        CSS.conditionClass(this.nextPager, "hover", !a);
        this.hiliteTagsOnMouseMove(event);
    },
    unhiliteCurrentTag: function() {
        if (!this.hilitedTag) return;
        if (ge(this.hilitedTag)) CSS.removeClass($(this.hilitedTag), "hover");
        this.hilitedTag = null;
    },
    hiliteTagsOnMouseMove: function(event) {
        if (!this.cache.extra[this.position] || this.getVideoOnStage()) return;
        var d = Vector2.getEventPosition(event);
        var b = Vector2.getElementPosition(this.image);
        var a = Vector2.getElementDimensions(this.image);
        var e = this.cache.extra[this.position].dimensions;
        var f = a.x / e.x;
        var c = PhotosUtils.getNearestBox(d, b, e, f, PhotoTheater.MIN_TAG_DISTANCE * f, this.cache.extra[this.position].tagRects);
        if (!c) this.unhiliteCurrentTag();
        if (c && this.hilitedTag != c) {
            this.unhiliteCurrentTag();
            this.hilitedTag = c;
            CSS.addClass($(this.hilitedTag), "hover");
        }
    },
    getVideoOnStage: function() {
        return this.position && this.cache.image[this.position] && this.cache.image[this.position].video;
    },
    pageListener: function(event) {
        var a = Event.getKeyCode(event) || event.getTarget();
        var c = a == this.nextPager || a == KEYS.RIGHT || !CSS.hasClass(this.root, "taggingMode") && a == this.stageActions || !this.getVideoOnStage() && DOM.isNode(a) && Parent.byClass(a, "stageWrapper");
        var b = a == this.prevPager || a == KEYS.LEFT;
        if (c) {
            this.page(1);
        } else if (b) this.page(-1);
    },
    page: function(d, c) {
        if (!d || !this.canPage || !this.loaded) return;
        this.unhiliteCurrentTag();
        var e = this.getVideoOnStage();
        if (e) this.switchVideo(e, false);
        Arbiter.inform(PhotoTheater.PAGE);
        this.recacheData();
        this.position = this.calculatePosition(d);
        if (this.checkErrorAt(this.position)) {
            CSS.hide(this.image);
            CSS.show(this.errorBox);
        } else {
            var b = this.cache.image[this.position];
            if (b) {
                if (b.url) {
                    this.switchImage(b.url, true);
                } else if (b.video) this.switchVideo(b.video, true);
                if (!c) {
                    this.replaceUrl = true;
                    this.urlEntryCount++;
                    goURI(b.info.permalink);
                }
            } else this.setLoadingState("image", true);
            var a = this.cache.html[this.position];
            if (a) {
                this.swapData();
            } else this.setLoadingState("html", true);
        }
        this.revertChromeBugFix();
        this.loadMoreIfNeccessary(d > 0);
        this.checkToLoadAds();
    },
    checkErrorAt: function(a) {
        if (this.cache.error[a] && !(this.cache.image[a] && this.cache.html[a])) {
            return true;
        } else if (this.cache.image[a] && this.cache.html[a]) this.cache.error[a] = false;
        return false;
    },
    goToPosition: function(c) {
        if (c > this.total || c < 1) c = this.total;
        var b = 0;
        var a = 0;
        if (c > this.position) {
            b = c - this.position;
            a = this.position + this.total - c;
        } else {
            b = this.total - this.position + c;
            a = this.position - c;
        }
        this.page(b < a ? b : a * -1, true);
    },
    transitionHandler: function(b) {
        if (b.getQueryData().closeTheater || b.getQueryData().permPage) return false;
        if (this.replaceUrl) {
            this.replaceUrl = false;
            PageTransitions.transitionComplete();
            return true;
        }
        if (b.getQueryData().makeprofile) {
            this.close();
            return false;
        }
        var a = this.permalinkMap[b.getUnqualifiedURI().toString()];
        if (a) {
            this.goToPosition(a);
            PageTransitions.transitionComplete();
            return true;
        }
        return false;
    },
    recacheData: function() {
        if (!this.loadingStates.html) {
            var a = this.cache.html[this.position];
            for (var b in a) {
                a[b] = $A($(b).childNodes);
                DOM.empty($(b));
            }
        }
    },
    switchImage: function(d, c) {
        CSS.hide(this.errorBox);
        clearTimeout(this.imageRefreshTimer);
        if (this.imageLoadingTimer) {
            clearTimeout(this.imageLoadingTimer);
            this.imageLoadingTimer = null;
        }
        var a = this.cache && this.cache.image[this.position];
        if (a && d != this.LOADING_IMAGE) PhotoTheaterLog.addPhotoView(a.info.fbid);
        var b = $N("img", {
            className: "spotlight",
            alt: ""
        });
        b.setAttribute("aria-describedby", "fbPhotoTheaterCaption");
        b.setAttribute("aria-busy", "true");
        if (d != this.LOADING_IMAGE) {
            this.imageRefreshTimer = setTimeout(this.reloadIfTimeOut.bind(this), 2e3);
            b.onload = async_callback(function() {
                clearTimeout(this.imageRefreshTimer);
                this.image.setAttribute("aria-busy", "false");
            }.bind(this), "photo_theater");
        }
        b.src = d;
        this.useImage(b, false);
        if (c) this.preloadImages();
    },
    switchVideo: function(c, a) {
        var b = "swf_" + c;
        if (a) {
            CSS.addClass(this.stageWrapper, "showVideo");
            this.videoStage.id = c;
            if (window[b] && !ge(b)) window[b].write(c);
        } else {
            this.videoStage.id = "fbVideoStage";
            window[b].addVariable("video_autoplay", 0);
            DOM.empty(this.videoStage);
            CSS.removeClass(this.stageWrapper, "showVideo");
        }
    },
    useImage: function(b, a) {
        if (a && image_has_loaded(this.image)) return;
        DOM.replace(this.image, b);
        this.image = b;
    },
    setErrorBoxContent: function(a) {
        DOM.setContent(this.errorBox, a);
    },
    reloadIfTimeOut: function() {
        if (!image_has_loaded(this.image)) {
            var a = $N("img", {
                className: "spotlight"
            });
            a.src = this.image.src;
            Event.listen(a, "load", this.useImage.bind(this, a, true));
        }
    },
    imageLoadingTimeout: function() {
        if (this.loadingStates.image) this.switchImage(this.LOADING_IMAGE, false);
    },
    preloadImages: function() {
        var d, c;
        var e = this.total;
        var b = this.cache.image;
        var a = this.PRELOAD_BUFFER;
        if (e > a * 2) {
            d = this.calculatePosition(a * -1);
            c = this.calculatePosition(a);
        } else {
            d = 1;
            c = e;
        }
        while (d != c) {
            if (b[d] && !b[d].resource && b[d].url) {
                b[d].resource = new Image;
                b[d].resource.src = b[d].url;
            }
            d = d % e + 1;
        }
    },
    calculatePosition: function(a, b) {
        var c = this.total;
        b = b || this.position;
        while (a < 0) a += c;
        return (b + a) % c || c;
    },
    swapData: function() {
        if (this.dataLoadTimer) {
            this.setLoadingState("html", true);
            clearTimeout(this.dataLoadTimer);
            this.dataLoadTimer = setTimeout(this.clearTimer.bind(this, true), 100);
            return;
        }
        var a, b = this.cache.html[this.position];
        if (b) {
            for (var c in b) {
                a = ge(c);
                a && DOM.setContent(a, b[c]);
            }
            (new PhotoInlineCaptionEditor("center_stage")).init(DOM.find($("fbPhotoTheaterCaption"), "div.fbPhotoInlineCaptionEditor"));
            Arbiter.inform(PhotoTheater.DATA_CHANGE, this.cache.image[this.position].info, Arbiter.BEHAVIOR_STATE);
            this.setLoadingState("html", false);
            this.dataLoadTimer = setTimeout(this.clearTimer.bind(this, false), 100);
        }
        this.adjustForNewData();
    },
    clearTimer: function(a) {
        this.dataLoadTimer = false;
        a && this.swapData();
    },
    loadMoreIfNeccessary: function(c) {
        var d = c ? 1 : -1;
        var b = this.BUFFER_PERCENT;
        var a = this.BUCKET_SIZE;
        var f = Math.ceil(a * b);
        var e = this.calculatePosition(Math.min(f, this.uncachedCount) * d);
        if (!this.isInLoadingRange(e) || !this.isInLoadingRange(this.position)) this.calculateNewRangeAndFetchIfNeccessary(a * d);
    },
    isInLoadingRange: function(a) {
        rangeStart = this.loadingRange.start;
        rangeEnd = this.loadingRange.end;
        if (rangeStart <= rangeEnd) {
            return rangeStart <= a && a <= rangeEnd;
        } else return a <= rangeEnd || rangeStart <= a;
    },
    calculateNewRangeAndFetchIfNeccessary: function(a) {
        if (this.uncachedCount === 0 || a === 0) return;
        var b, c, d = this.loadingRange;
        a = a > 0 ? Math.min(this.uncachedCount, a) : Math.max(-1 * this.uncachedCount, a);
        if (a > 0) {
            b = this.calculatePosition(1, d.end);
            c = this.calculatePosition(a, d.end);
        } else {
            b = this.calculatePosition(a, d.start);
            c = this.calculatePosition(-1, d.start);
        }
        if (this.isInLoadingRange(b)) return;
        if (a > 0) {
            d.end = c;
        } else d.start = b;
        this.fetch(b, c);
    },
    fetch: function(b, c) {
        if (!this.canPage) return;
        this.uncachedCount -= b > c ? this.total - b + c + 1 : c - b + 1;
        var a = copy_properties({
            start: b,
            end: c,
            total: this.total
        }, this.photoSetQuery);
        UIPagelet.loadFromEndpoint("PhotoTheaterPagelet", null, a, {
            usePipe: true,
            jsNonblock: true,
            crossPage: true
        });
    },
    storeFromResponse: function(b) {
        if (!this.isOpen) return;
        var a = b.getPayload();
        this.storeFromData(a);
    },
    storeFromData: function(h) {
        var b = h.error;
        if (b) {
            this.processErrorResult(b);
            this.checkState("error");
            return;
        }
        var f = h.init;
        var e = h.image;
        var a = h.data;
        if (f) {
            this.initialLoadResponse(f);
            this.replaceUrl = true;
            goURI(e[this.position].info.permalink);
            this.noAds = f.noads;
        }
        this.checkToLoadAds();
        if (e) {
            for (var d in e) {
                this.cache.image[d] = e[d];
                this.permalinkMap[URI(e[d].info.permalink).getUnqualifiedURI().toString()] = d;
            }
            this.checkState("image");
            if (!this.hasSrc) {
                if (this.cache.image[this.position].url) {
                    this.switchImage(this.cache.image[this.position].url);
                } else if (this.cache.image[this.position].video) this.switchVideo(this.cache.image[this.position].video, true);
                this.hasSrc = true;
            }
        }
        if (a) {
            for (var g in a) {
                if (!this.cache.html[g]) this.cache.html[g] = {};
                for (var c in a[g].html) this.cache.html[g][c] = HTML(a[g].html[c]).getNodes();
                if (!("extra" in a[g])) {
                    this.cache.extra[g] = null;
                    continue;
                }
                this.cache.extra[g] = {
                    tagRects: {},
                    dimensions: null
                };
                if (a[g].extra.dimensions) this.cache.extra[g].dimensions = Vector2.deserialize(a[g].extra.dimensions);
                if (a[g].extra.tagRects) for (var i in a[g].extra.tagRects) if (a[g].extra.tagRects[i]) this.cache.extra[g].tagRects[i] = Rect.deserialize(a[g].extra.tagRects[i]);
            }
            this.checkState("html");
        }
    },
    processErrorResult: function(a) {
        if (!(a.start || a.end)) {
            CSS.hide(this.image);
            CSS.show(this.errorBox);
        } else {
            var b = a.start;
            var e = a.end;
            if (b < e) {
                for (var c = b; c <= e; c++) this.setErrorAt(c);
            } else {
                for (var c = 1; c <= e; c++) this.setErrorAt(c);
                for (var d = b; d <= a.total; d++) this.setErrorAt(d);
            }
        }
    },
    setErrorAt: function(a) {
        if (!(this.cache.image[a] && this.cache.html[a])) this.cache.error[a] = true;
    },
    deletePhoto: function(a) {
        this.closeRefresh();
    },
    closeRefresh: function() {
        this.refreshOnClose = true;
        this.closeHandler();
    }
};