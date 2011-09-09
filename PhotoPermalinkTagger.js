if (window.CavalryLogger) {
    CavalryLogger.start_js([ "zqnvc" ]);
}

var PhotoPermalink = {
    PAGE: "PhotoPermalink.PAGE",
    DATA_CHANGE: "PhotoPermalink.DATA_CHANGE",
    STATE_ERROR: "error",
    STATE_HTML: "html",
    STATE_IMAGE_DATA: "image",
    MIN_TAG_DISTANCE: 80,
    init: function() {
        this.stream = new PhotoStreamCache;
        this.stream.init(PhotosConst.VIEWER_PERMALINK);
        this.reset();
        this.root = $("fbPhotoPageContainer");
        this.header = $("fbPhotoPageHeader");
        this.stageWrapper = ge("photoborder");
        this.videoStage = DOM.find(this.stageWrapper, "div.videoStage");
        this.buttonActions = DOM.find(this.root, "div.stageButtons");
        this.feedback = ge("fbPhotoPageFeedback");
        this.image = ge("fbPhotoImage");
        this.errorBox = ge("fbPhotoPageError");
        this.actionList = ge("fbPhotoPageActions");
        this.loadingStates = {
            image: false,
            html: false
        };
        this.unhiliteTimer = null;
        var a = {
            mouseout: this.mouseOutListener.bind(this),
            mousemove: this.mouseMoveListener.bind(this)
        };
        this.pageHandlers = values(Event.listen(this.root, a));
        this.pageHandlers.push(Event.listen(this.stageWrapper, "click", this.stageClickListener.bind(this)), Event.listen(this.stageWrapper, "dragstart", this.killDrag.bind(this)), Event.listen(this.stageWrapper, "selectstart", this.killDrag.bind(this)), Event.listen(this.buttonActions, "click", this.buttonListener.bind(this)), Event.listen(this.actionList, "click", this.rotateListener.bind(this)), Event.listen(this.feedback, "click", function(event) {
            if (Parent.byClass(event.getTarget(), "like_link")) CSS.toggleClass(DOM.find(this.buttonActions, "div.likeCommentGroup"), "viewerLikesThis");
        }.bind(this)));
        PageTransitions.registerHandler(this.transitionHandler.bind(this));
        this.setLoadingState(PhotoPermalink.STATE_HTML, true);
        KeyEventController.registerKey("LEFT", this.goNav.bind(this, "prev"));
        KeyEventController.registerKey("RIGHT", this.goNav.bind(this, "next"));
        this.hiliteLeftmostPendingTag();
    },
    getRoot: function() {
        return this.root;
    },
    updateTags: function(a) {
        this.saveTagsFromPayload(a.getPayload());
    },
    saveTagsFromPayload: function(a) {
        this.storeFromData(a);
        if ("data" in a && this.stream.getCursor() in a.data) this.swapData();
    },
    goNav: function(c, event) {
        var a = Event.getKeyCode(event) || event.getTarget();
        if (this.theaterModeOn()) return true;
        var b = Parent.byClass(a, "stageWrapper") && !Parent.byClass(a, "tagBoxPending") && !Parent.byClass(a, "tagBoxPendingResponse");
        if (b && CSS.hasClass(this.root, "taggingMode")) return false;
        if (a == KEYS.LEFT || b && c == "prev") {
            this.page(-1);
        } else if (a == KEYS.RIGHT || b && c == "next") this.page(1);
        return false;
    },
    theaterModeOn: function() {
        return CSS.hasClass(document.documentElement, "theaterMode");
    },
    pagerClick: function(a) {
        if (this.theaterModeOn()) return true;
        if (a == "prev") {
            this.page(-1);
        } else if (a == "next") this.page(1);
        return false;
    },
    setLoadingState: function(b, a) {
        switch (b) {
          case PhotoPermalink.STATE_IMAGE_DATA:
            this.loadingStates[b] = a;
            CSS.conditionClass(this.root, "imageLoading", a);
            break;
          case PhotoPermalink.STATE_HTML:
            this.loadingStates[b] = a;
            CSS.conditionClass(this.root, "dataLoading", a);
            break;
        }
    },
    checkState: function(b) {
        if (b != PhotoPermalink.STATE_ERROR && !this.loadingStates[b]) return;
        switch (b) {
          case PhotoPermalink.STATE_IMAGE_DATA:
            var a = this.stream.getCurrentImageData();
            if (a) {
                if (a.url) {
                    this.switchImage(a.url, true);
                } else if (a.video) this.switchVideo(a.video, true);
                this.setLoadingState(b, false);
            }
            break;
          case PhotoPermalink.STATE_HTML:
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
    hiliteLeftmostPendingTag: function() {
        var a = ge(this.hilitedTag);
        if (a && CSS.hasClass(a, "tagBoxPending")) return;
        var b = DOM.scry(this.root, "div.tagsWrapper div.tagBoxPending")[0];
        if (b) this.switchHilitedTags(b.id);
    },
    page: function(b) {
        if (!this.stream.isValidMovement(b)) return;
        this.unhiliteAllTags();
        var c = this.getVideoOnStage();
        if (c) this.switchVideo(c, false);
        Arbiter.inform(PhotoPermalink.PAGE);
        this.recacheData();
        this.stream.moveCursor(b);
        CSS.hide(this.image);
        if (this.stream.errorInCurrent()) {
            this.setLoadingState(PhotoPermalink.STATE_HTML, true);
            CSS.show(this.errorBox);
        } else {
            var a = this.stream.getCurrentImageData();
            if (a) {
                if (a.url) {
                    this.switchImage(a.url, true);
                } else if (a.video) this.switchVideo(a.video, true);
                goURI(a.info.permalink);
            } else {
                this.waitForLoadCount++;
                this.setLoadingState(PhotoPermalink.STATE_IMAGE_DATA, true);
            }
            if (this.stream.getCurrentHtml()) {
                this.swapData();
            } else this.setLoadingState(PhotoPermalink.STATE_HTML, true);
        }
        this.hiliteLeftmostPendingTag();
    },
    transitionHandler: function(a) {
        if (a.getPath() == "/photo.php") if (a.getQueryData().permPage) {
            PageTransitions.transitionComplete();
            return true;
        } else if (!this.theaterModeOn() && a.getQueryData().makeprofile && a.getQueryData().fbid == this.stream.getCursor() && !this.getVideoOnStage()) {
            Bootloader.loadComponents([ "photocrop2" ], PhotoCropper.start.bind(PhotoCropper));
            PageTransitions.transitionComplete();
            return true;
        }
    },
    recacheData: function() {
        if (!this.loadingStates.html) {
            var a = this.stream.getCurrentHtml();
            for (var b in a) {
                a[b] = $A($(b).childNodes);
                if (b !== "fbPhotoPageHeader") DOM.empty($(b));
            }
        }
    },
    getCurrentPhotoInfo: function() {
        var a = this.stream.getCurrentImageData();
        return a && a.info;
    },
    getVideoOnStage: function() {
        var a = this.stream.getCurrentImageData();
        return a && a.video;
    },
    switchImage: function(d, c) {
        CSS.hide(this.image);
        CSS.hide(this.errorBox);
        var a = this.stream && this.stream.getCurrentImageData();
        var b = $N("img", {
            id: "fbPhotoImage",
            className: "fbPhotoImage",
            alt: "",
            src: d
        });
        DOM.replace(this.image, b);
        this.image = b;
        if (c) this.stream.preloadImages();
    },
    switchVideo: function(c, a) {
        var b = "swf_" + c;
        if (a) {
            CSS.addClass(this.stageWrapper, "showVideo");
            this.videoStage.id = c;
            if (window[b] && !ge(b)) window[b].write(c);
        } else {
            this.videoStage.id = "fbPageVideoStage";
            window[b].addVariable("video_autoplay", 0);
            DOM.empty(this.videoStage);
            CSS.removeClass(this.stageWrapper, "showVideo");
        }
    },
    swapData: function() {
        if (this.dataLoadTimer) {
            this.setLoadingState(PhotoPermalink.STATE_HTML, true);
            clearTimeout(this.dataLoadTimer);
            this.dataLoadTimer = setTimeout(this.clearTimer.bind(this, true), 100);
            return;
        }
        var b, c = this.stream.getCurrentHtml();
        if (c) {
            for (var d in c) {
                b = ge(d);
                b && DOM.setContent(b, c[d]);
            }
            var a = DOM.scry($("fbPhotoPageCaption"), "div.fbPhotoInlineCaptionEditor");
            if (a.length) (new PhotoInlineCaptionEditor("permalink")).init(a[0]);
            Arbiter.inform(PhotoPermalink.DATA_CHANGE, this.stream.getCurrentImageData().info, Arbiter.BEHAVIOR_STATE);
            this.position = this.stream.getCursor();
            this.setLoadingState(PhotoPermalink.STATE_HTML, false);
            this.dataLoadTimer = setTimeout(this.clearTimer.bind(this, false), 100);
            if (ge(this.hilitedTag)) {
                CSS.addClass($(this.hilitedTag), "hover");
            } else this.hiliteLeftmostPendingTag();
        }
        this.adjustForNewData();
    },
    clearTimer: function(a) {
        this.dataLoadTimer = false;
        a && this.swapData();
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
    fetchInitBucket: function(a) {
        if (!this.stream.isLoaded()) return;
        this.stream.fetch(a, true);
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
        var b = this.stream.storeToCache(a);
        if ("error" in b) {
            this.checkState(PhotoPermalink.STATE_ERROR);
            return;
        }
        if ("image" in b) this.checkState(PhotoPermalink.STATE_IMAGE_DATA);
        if ("data" in b) this.checkState(PhotoPermalink.STATE_HTML);
    },
    setErrorBoxContent: function(a) {
        DOM.setContent(this.errorBox, a);
    },
    buttonListener: function(event) {
        var a = event.getTarget();
        if (Parent.byClass(a, "likeButton")) {
            DOM.find($("fbPhotoPageFeedback"), "button.like_link").click();
        } else if (Parent.byClass(a, "commentButton")) {
            DOM.find(this.root, "div.commentBox textarea").focus();
            this.root.scrollTop = this.root.scrollHeight;
        }
    },
    rotateListener: function(event) {
        var a = event.getTarget();
        if (Parent.byClass(a, "rotateRight")) {
            this.rotate("right");
        } else if (Parent.byClass(a, "rotateLeft")) this.rotate("left");
    },
    stageClickListener: function(event) {
        var a = event.getTarget();
        if (Parent.byClass(a, "tagApproveIgnore")) {
            this.updateTagBox(event, a);
        } else if (Parent.byClass(a, "videoStage")) {
            return true;
        } else this.goNav("next", event);
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
            cs_ver: PhotosConst.VIEWER_PERMALINK
        };
        a[c] = 1;
        this.setLoadingState(PhotoPermalink.STATE_IMAGE_DATA, true);
        CSS.hide(this.image);
        (new AsyncRequest("/ajax/photos/photo/rotate/")).setMethod("POST").setAllowCrossPageTransition(true).setReadOnly(false).setData(a).setHandler(this.storeResponseForRotate.bind(this, d)).send();
    },
    storeResponseForRotate: function(a, c) {
        this.storeFromResponse(c);
        var b = this.stream.getImageData(a);
        b.url = c.getPayload().new_urls[PhotosConst.SIZE_NORMAL];
        b.dimensions = Vector2.deserialize(c.getPayload().dimensions);
        if (a == this.stream.getCursor()) {
            this.setLoadingState(PhotoPermalink.STATE_IMAGE_DATA, false);
            this.switchImage(this.stream.getCurrentImageData().url);
            this.swapData();
        }
    },
    mouseOutListener: function(event) {
        var d = event.getTarget();
        var a = event.getRelatedTarget();
        var b = Parent.byClass(d, "stageActions");
        var c = Parent.byClass(d, "stageWrapper");
        var e = Parent.byClass(a, "stageActions");
        var f = Parent.byClass(a, "stageWrapper");
        var g = !f && c && !e || b && !f;
        if (g) this.unhiliteAllTags(true);
    },
    mouseMoveListener: function(event) {
        var a = event.getTarget();
        if (!Parent.byClass(a, "stageActions") && !Parent.byClass(a, "stageWrapper")) return;
        this.hiliteTagsOnMouseMove(event);
    },
    unhiliteAllTags: function(a, event) {
        DOM.scry(this.stageWrapper, "div.tagsWrapper div.hover").each(function(b) {
            if (a && CSS.hasClass(b, "tagBoxPending")) return;
            CSS.removeClass(b, "hover");
        });
        if (a) return;
        if (this.unhiliteTimer !== null) {
            clearTimeout(this.unhiliteTimer);
            this.unhiliteTimer = null;
        }
        this.hilitedTag = null;
    },
    switchHilitedTags: function(a) {
        this.unhiliteAllTags();
        if (a) {
            this.hilitedTag = a;
            CSS.addClass($(this.hilitedTag), "hover");
        }
    },
    hiliteTagsOnMouseMove: function(event) {
        if (!this.stream.getCurrentExtraData() || this.getVideoOnStage()) return;
        if (this.unhiliteTimer !== null) return;
        var j = Parent.byClass(event.getTarget(), "tagBoxPending");
        var d = this.hilitedTag && CSS.hasClass($(this.hilitedTag), "tagBoxPending");
        var k = !this.hilitedTag && j || !d && j;
        if (k) {
            this.switchHilitedTags(j.id);
            return;
        }
        if (j && j.id == this.hilitedTag) return;
        var a = 250;
        var e = ge("fbPhotoImage");
        var i = Vector2.getEventPosition(event);
        var g = Vector2.getElementPosition(e);
        var f = Vector2.getElementDimensions(e);
        var l = this.stream.getCurrentExtraData().tagRects;
        var h = PhotosUtils.getNearestBox(i, g, f, 1, PhotoPermalink.MIN_TAG_DISTANCE, l);
        if (!h) {
            if (!d) this.unhiliteAllTags();
            return;
        }
        var b = null;
        if (d) {
            var c = {};
            c[this.hilitedTag] = this.stream.getCurrentExtraData().tagRects[this.hilitedTag];
            b = PhotosUtils.getNearestBox(i, g, f, 1, PhotoPermalink.MIN_TAG_DISTANCE, c);
        }
        if (b !== null && d) return;
        if (this.hilitedTag != h) if (d) {
            this.unhiliteTimer = this.unhiliteAllTags.bind(this, false, event).defer(a);
        } else this.switchHilitedTags(h);
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
    killDrag: function() {
        if (CSS.hasClass(this.root, "taggingMode")) return false;
    },
    reset: function() {
        if (this.pageHandlers) {
            this.pageHandlers.each(function(a) {
                a.remove();
            });
            this.pageHandlers = null;
        }
        KeyEventController.getInstance().resetHandlers();
    }
};

var PhotoCropper = {
    init: function(c, b) {
        if (this.photocrop) this.destroy();
        this.root = c;
        this.options = b || {};
        var a = DOM.scry(this.root, "a.fbPhotoActionsCrop");
        if (a.length === 0) return;
        var d = this.start.bind(this);
        Event.listen(a[0], "click", function() {
            Bootloader.loadComponents("photocrop2", d);
            return false;
        });
        Arbiter.subscribe(PhotoPermalink.PAGE, this.cancel.bind(this), Arbiter.SUBSCRIBE_NEW);
    },
    start: function() {
        if (this.photocrop) return;
        CSS.addClass(this.root, "croppingMode");
        var d = DOM.find(this.root, "img.fbPhotoImage");
        var b = DOM.find(this.root, "a.doneCroppingLink");
        var a = DOM.find(this.root, "a.cancelCroppingLink");
        this.wrapper = $N("div");
        CSS.addClass(this.wrapper, "stageCropper");
        DOM.find(this.root, ".stageWrapper").appendChild(this.wrapper);
        this.wrapper.style.marginTop = d.parentNode.style.marginTop;
        Event.listen(this.wrapper, "click", this.cancel.bind(this));
        Event.listen(b, "click", this.done.bind(this));
        Event.listen(a, "click", this.cancel.bind(this));
        var c = {
            target: this.wrapper,
            min_width: this.options.min_width
        };
        this.photocrop = new Photocrop(d, c);
        return false;
    },
    done: function() {
        var c = PhotoPermalink.getCurrentPhotoInfo();
        var e = this.options.uid;
        var b = DOM.find(this.root, "a.fbPhotoActionsCrop");
        if (CSS.hasClass(b, "makePageProfile")) e = c.owner;
        var a = this.destroy();
        var d = copy_properties({
            pid: c.pid,
            owner: c.owner,
            id: e,
            "return": "profile.php?id=" + e,
            error_return: "photo.php?pid=" + c.pid + "&id=" + c.owner
        }, a);
        Form.post("/crop_profile_pic.php", d);
        return false;
    },
    cancel: function() {
        this.destroy();
        return false;
    },
    destroy: function() {
        if (this.photocrop) {
            CSS.removeClass(this.root, "croppingMode");
            DOM.remove(this.wrapper);
            var a = this.photocrop.done();
            this.photocrop = null;
            return a;
        }
    }
};

function PhotoPermalinkTagger(b, a) {
    this.parent.construct(this, b);
    this.photoData = a;
}

Class.extend(PhotoPermalinkTagger, "PhotoTagger");

copy_properties(PhotoPermalinkTagger.prototype, {
    elemNames: {
        0: {
            tagger: "div.photoPermalinkTagger",
            addTagLink: "div.fbPhotosPhotoActions",
            overlayActions: "div.fbPhotosPhotoButtons",
            tagboxContainer: "fbPhotoPageTagBoxes",
            tagAction: "fbPhotosPhotoActionsTag",
            image: "img#fbPhotoImage"
        }
    },
    setupHandlers: function() {
        var b = $("imagestage");
        var a = $("fbPhotoPageTagBoxes");
        this.handlers = [ Event.listen(b, "click", this.addTag.bind(this)), Event.listen(a, "click", this.addTag.bind(this)), Event.listen(this.addTagLink, "click", this.checkActions.bind(this)), Event.listen(this.overlayActions, "click", this.checkActions.bind(this)) ];
        this.subscriptions = [ Arbiter.subscribe(PhotoPermalink.PAGE, this.restartTagging.bind(this)), Arbiter.subscribe(PhotoPermalink.DATA_CHANGE, this.setPhotoData.bind(this)) ];
        this.tokenizer.subscribe("addToken", this.saveTag.bind(this));
        this.tokenizer.subscribe("removeToken", this.removeTag.bind(this));
        this.tokenizer.subscribe("markTagAsSpam", this.markTagAsSpam.bind(this));
    },
    onRelativePositionTarget: function(a) {
        return a == this.faceBox || Parent.byClass(a, "tagBox");
    },
    getRelativeTargetPos: function(b) {
        if (b == this.faceBox) {
            return this.tagger.style;
        } else {
            var a = Parent.byClass(b, "tagBox");
            return a.style;
        }
    },
    getTaggingSource: function() {
        return "permalink";
    },
    getPosition: function() {
        return this.photoData.fbid;
    },
    getPhotoViewerObj: function() {
        return window.PhotoPermalink;
    },
    tagsChangeHandler: function(b) {
        var a = this.getPhotoViewerObj();
        a && a.updateTags(b);
    },
    setDataForTokenizer: function() {
        this.tokenizer.setup(null, this.photoData);
        return this;
    }
});

function PhotoTags(b, a, c) {
    this.tagTargets = b;
    this.tagBox = a;
    this.version = c || PhotosConst.VIEWER_PERMALINK;
    this.handlers = [];
    this.tagTargets.each(function(d) {
        this.handlers.push(Event.listen(d, {
            mouseover: this.showTag.bind(this),
            mouseout: this.hideTags.bind(this)
        }));
    }.bind(this));
    this.subscriptions = [];
    if (this.version == PhotosConst.VIEWER_THEATER) {
        this.subscriptions.push(Arbiter.subscribe(PhotoTheater.PAGE, this.hideTags.bind(this)));
    } else if (this.version == PhotosConst.VIEWER_SNOWBOX) this.subscriptions.push(Arbiter.subscribe(PhotoSnowbox.PAGE, this.hideTags.bind(this)));
}

PhotoTags.prototype = {
    showTag: function(event) {
        var g = event.getTarget(), d = CSS.hasClass(g, "taggee"), c = CSS.hasClass(g, "uiProfilePhotoMedium"), f = null;
        if (d) {
            f = g.getAttribute("data-tag");
        } else if (c) {
            var b = Parent.byTag(g, "a");
            f = b && b.getAttribute("data-tag");
        }
        var e = this.version == PhotosConst.VIEWER_PERMALINK ? "perm:tag:" + f : "tag:" + f;
        var a = e && ge(e);
        if (a) {
            CSS.addClass(a, "showTag");
            CSS.addClass(this.tagBox, "showingTag");
        }
    },
    hideTags: function() {
        CSS.removeClass(this.tagBox, "showingTag");
        DOM.scry(this.tagBox, "div.showTag").each(function(a) {
            CSS.removeClass(a, "showTag");
        });
    },
    destroy: function() {
        for (var a in this.handlers) this.handlers[a].remove();
        this.subscriptions.each(Arbiter.unsubscribe.bind(Arbiter));
    }
};

function Token(a, b) {
    this.info = a;
    this.paramName = b;
}

Token.prototype = {
    getInfo: function() {
        return this.info;
    },
    getText: function() {
        return this.info.text;
    },
    getValue: function() {
        return this.info.uid;
    },
    isFreeform: function() {
        return !!this.info.freeform;
    },
    getElement: function() {
        if (!this.element) this.setElement(this.createElement());
        return this.element;
    },
    setElement: function(a) {
        DataStore.set(a, "Token", this);
        this.element = a;
        return this;
    },
    isRemovable: function() {
        return CSS.hasClass(this.element, "removable");
    },
    createElement: function() {
        var b = this.paramName;
        var d = this.getText();
        var f = this.getValue();
        var c = $N("a", {
            href: "#",
            title: _tx("Retirer {item}", {
                item: d
            }),
            className: "remove uiCloseButton uiCloseButtonSmall"
        });
        var g = $N("input", {
            type: "hidden",
            value: f,
            name: b + "[]",
            autocomplete: "off"
        });
        var e = $N("input", {
            type: "hidden",
            value: d,
            name: "text_" + b + "[]",
            autocomplete: "off"
        });
        var a = $N("span", {
            title: d,
            className: "removable uiToken"
        }, [ d, g, e, c ]);
        return a;
    }
};

function TagToken(b, a) {
    this.existing = a;
    this.parent.construct(this, b, "tag");
    this.byowner = true;
    this.hasWithTag = false;
    this.isFirstVisible = false;
}

Class.extend(TagToken, "Token");

TagToken.prototype = {
    createElement: function() {
        var a = this.isFreeform();
        var b = $N("input", {
            type: "hidden",
            value: a ? "" : this.getValue(),
            name: this.paramName + "[]",
            autocomplete: "off"
        });
        var d = $N("span", {
            className: "separator"
        }, ", ");
        var e = $N(a ? "span" : "a", {
            className: "taggee",
            "data-tag": this.getValue()
        }, this.getText());
        if (!a) e.href = this.getInfo().path;
        var c = [ " (" ];
        c.push($N("a", {
            className: "remove"
        }, _tx("retirer l’identification")));
        c.push(")");
        c = $N("span", {}, c);
        var f = $N("span", {
            className: "tagItem" + (this.existing.length > 1 ? "" : " first")
        }, [ d, b, e, c ]);
        CSS.conditionShow(f, this.byowner && !this.hasWithTag);
        CSS.conditionClass(f, "firstVisibleTag", this.isFirstVisible);
        return f;
    },
    setIsByOwner: function(a) {
        this.byowner = a;
        return this;
    },
    setHasWithTag: function(a) {
        this.hasWithTag = a;
        return this;
    },
    setIsFirstVisibleTag: function(a) {
        this.isFirstVisible = a;
        return this;
    }
};

function Tokenizer(a, b) {
    this.element = a;
    this.typeahead = b;
    this.input = b.getCore().getElement();
    DataStore.set(this.element, "Tokenizer", this);
}

Tokenizer.getInstance = function(a) {
    var b = Parent.byClass(a, "uiTokenizer");
    return b ? DataStore.get(b, "Tokenizer") : null;
};

Class.mixin(Tokenizer, "Arbiter", {
    inline: false,
    maxTokens: null,
    excludeDuplicates: true,
    placeholder: "",
    init: function(d, c, a, b) {
        this.init = bagofholding;
        this.tokenarea = d;
        this.paramName = c;
        this.placeholder = this.input.getAttribute("data-placeholder") || "";
        copy_properties(this, b || {});
        this.initEvents();
        this.initTypeahead();
        this.reset(a);
        this.initBehaviors();
        Arbiter.inform("Tokenizer/init", this, Arbiter.BEHAVIOR_PERSISTENT);
    },
    reset: function(a) {
        this.tokens = [];
        this.unique = {};
        if (a) {
            this.populate(a);
        } else DOM.empty(this.tokenarea);
        this.updateTokenarea();
    },
    populate: function(a) {
        var b = [];
        this.tokens = this.getTokenElements().map(function(c, d) {
            var e = a[d];
            b.push(this._tokenKey(e));
            return this.createToken(e, c);
        }, this);
        this.unique = Object.from(b, this.tokens);
    },
    getElement: function() {
        return this.element;
    },
    getTypeahead: function() {
        return this.typeahead;
    },
    getInput: function() {
        return this.input;
    },
    initBehaviors: function() {
        for (var b in this.behaviors || {}) {
            var a = window.TokenizerBehaviors && TokenizerBehaviors[b];
            a.call(null, this, this.behaviors[b]);
        }
    },
    initTypeahead: function() {
        var a = this.typeahead.getCore();
        a.resetOnSelect = true;
        a.setValueOnSelect = false;
        a.preventFocusChangeOnTab = true;
        this.typeahead.subscribe("select", function(b, c) {
            var d = c.selected;
            if ("uid" in d) {
                this.updateInput();
                this.addToken(this.createToken(d));
            }
        }.bind(this));
        this.typeahead.subscribe("blur", this.handleBlur.bind(this));
    },
    handleBlur: function(event) {
        this.inform("blur", {
            event: event
        });
        this.updatePlaceholder();
    },
    initEvents: function() {
        var a = this.handleEvents.bind(this);
        var b = ua.firefox() < 4 ? "keypress" : "keydown";
        Event.listen(this.tokenarea, {
            click: a,
            keydown: a
        });
        Event.listen(this.input, "paste", this.paste.bind(this));
        Event.listen(this.input, b, this.keydown.bind(this));
    },
    handleEvents: function(event) {
        var b = event.getTarget();
        var a = b && this.getTokenElementFromTarget(b);
        if (!a) return;
        if (event.type != "keydown" || Event.getKeyCode(event) == KEYS.RETURN) this.processEvents(event, b, a);
    },
    processEvents: function(event, c, a) {
        if (Parent.byClass(c, "remove")) {
            var b = a.nextSibling;
            b = b && DOM.scry(a.nextSibling, ".remove")[0];
            var d = this.getTokenFromElement(a);
            d = this.addTokenData(d, c);
            this.removeToken(d);
            this.focusOnTokenRemoval(event, b);
            event.kill();
        }
    },
    focusOnTokenRemoval: function(event, a) {
        Input.focus(event.type == "keydown" && a || this.input);
    },
    addTokenData: function(b, a) {
        return b;
    },
    keydown: function(event) {
        this.inform("keydown", {
            event: event
        });
        var a = Event.getKeyCode(event);
        var b = this.input;
        if (this.inline && a == KEYS.BACKSPACE && Input.isEmpty(b)) {
            var c = this.getLastToken();
            if (c && c.isRemovable()) this.removeToken(c);
        }
        this.updateInput();
    },
    paste: function(event) {
        this.inform("paste", {
            event: event
        });
        this.updateInput(true);
    },
    focusInput: function() {
        Input.focus(this.input);
    },
    updateInput: function(b) {
        if (!this.inline) return;
        var a = this.input;
        setTimeout(function() {
            a.size = a.value.length || 1;
            if (b) a.value = a.value;
        }, 20);
    },
    updatePlaceholder: function() {
        if (!this.inline || this.stickyPlaceholder) return;
        var a = !this.tokens.length;
        this.input.size = a ? this.placeholder.length * 2 || 1 : 1;
        Input.setPlaceholder(this.input, a ? this.placeholder : "");
    },
    getToken: function(a) {
        return this.unique[a] || null;
    },
    getTokens: function() {
        return this.tokens;
    },
    getTokenElements: function() {
        return DOM.scry(this.tokenarea, "span.uiToken");
    },
    getTokenElementFromTarget: function(a) {
        return Parent.byClass(a, "uiToken");
    },
    getTokenFromElement: function(a) {
        return DataStore.get(a, "Token");
    },
    getTokenValues: function() {
        return this.tokens.map(function(a) {
            return a.getValue();
        });
    },
    getFirstToken: function() {
        return this.tokens[0] || null;
    },
    getLastToken: function() {
        return this.tokens[this.tokens.length - 1] || null;
    },
    hasMaxTokens: function() {
        return this.maxTokens && this.maxTokens <= this.tokens.length;
    },
    createToken: function(b, a) {
        var c = this.getToken(this._tokenKey(b));
        c = c || new Token(b, this.paramName);
        a && c.setElement(a);
        return c;
    },
    addToken: function(b) {
        if (this.hasMaxTokens()) return;
        var a = this._tokenKey(b.getInfo());
        if (a in this.unique) return;
        this.unique[a] = b;
        this.tokens.push(b);
        this.insertToken(b);
        this.updateTokenarea();
        this.inform("addToken", b);
        Arbiter.inform("Form/change", {
            node: this.element
        });
    },
    insertToken: function(a) {
        DOM.appendContent(this.tokenarea, a.getElement());
    },
    removeToken: function(b) {
        if (!b) return;
        var a = this.tokens.indexOf(b);
        if (a < 0) return;
        this.tokens.splice(this.tokens.indexOf(b), 1);
        delete this.unique[this._tokenKey(b.getInfo())];
        DOM.remove(b.getElement());
        this.updateTokenarea();
        this.inform("removeToken", b);
        Arbiter.inform("Form/change", {
            node: this.element
        });
    },
    removeAllTokens: function() {
        this.reset();
        this.inform("removeAllTokens");
    },
    updateTokenarea: function() {
        var a = this.getTokenValues();
        this.updateTokenareaVisibility();
        this.excludeDuplicates && this.typeahead.getCore().setExclusions(a);
        this.typeahead.getCore().setEnabled(!this.hasMaxTokens());
        this.updatePlaceholder();
    },
    updateTokenareaVisibility: function() {
        CSS.conditionShow(this.tokenarea, this.tokens.length !== 0);
    },
    _tokenKey: function(a) {
        return a.uid + (a.freeform ? ":" : "");
    }
});

function TagTypeaheadView(a, b) {
    this.parent.construct(this, a, b);
    this.hintText = b.hintText;
    this.origAutoSelect = b.autoSelect;
    this.setSuggestions(b.suggestions);
}

Class.extend(TagTypeaheadView, "TypeaheadView");

TagTypeaheadView.prototype = {
    buildResults: function(b) {
        if (!this.value) b.unshift({
            subtext: this.hintText,
            type: "hintText"
        });
        var a = this.parent.buildResults(b);
        if (!this.value) b.shift();
        return a;
    },
    render: function(c, a, b) {
        this.autoSelect = this.origAutoSelect && c.length;
        this.disableAutoSelect = c.length === 0;
        this.parent.render(c, a, b);
    },
    getItems: function() {
        var a = this.parent.getItems();
        if (!this.value) a.shift();
        return a;
    },
    getSuggestions: function() {
        return this.suggestions;
    },
    setSuggestions: function(a) {
        this.suggestions = a || [];
        this.visible = !!this.suggestions;
    },
    addSuggestion: function(a) {
        this.suggestions.unshift(a);
    }
};

function TagTokenizer(e, a, b, d) {
    this.parent.construct(this, b, d);
    this.version = e;
    this.appphoto = a;
    var c;
    if (this.version == PhotosConst.VIEWER_PERMALINK) {
        c = PhotoPermalink.DATA_CHANGE;
    } else if (this.version == PhotosConst.VIEWER_THEATER) {
        c = PhotoTheater.DATA_CHANGE;
    } else if (this.version == PhotosConst.VIEWER_SNOWBOX) c = PhotoSnowbox.DATA_CHANGE;
    Arbiter.subscribe(c, this.setup.bind(this), Arbiter.SUBSCRIBE_NEW);
    Arbiter.subscribe(PhotoInlineEditor.CANCEL_INLINE_EDITING, this.updateTokenareaVisibility.bind(this), Arbiter.SUBSCRIBE_NEW);
}

Class.extend(TagTokenizer, "Tokenizer");

TagTokenizer.prototype = {
    setup: function(a, b) {
        this.appphoto = b.byapp;
        this.byowner = b.isowner;
        return this.reset();
    },
    reset: function() {
        var a = this.getTokenElements().map(this.getTokenDataFromTag.bind(this));
        this.withTagKeys = {};
        var b = this.getWithTagTokenElements().map(function(c) {
            return this._tokenKey(this.getTokenDataFromTag(c));
        }.bind(this));
        this.withTagKeys = Object.from(b);
        Input.reset(this.input);
        return this.parent.reset(a);
    },
    processEvents: function(event, b, a) {
        if (Parent.byClass(b, "remove")) {
            var c = this.getTokenFromElement(a);
            c = this.addTokenData(c, b);
            this.removeToken(c);
            event.kill();
        }
    },
    addToken: function(b) {
        if (this.hasMaxTokens()) return;
        var a = this._tokenKey(b.getInfo());
        if (a in this.unique) return;
        this.unique[a] = b;
        this.tokens.push(b);
        this.inform("addToken", b);
        Arbiter.inform("Form/change", {
            node: this.element
        });
    },
    removeToken: function(a) {
        if (this.appphoto) {
            return this.replaceToken(a);
        } else {
            this.inform("removeToken", a);
            Arbiter.inform("Form/change", {
                node: this.element
            });
        }
    },
    addTokenData: function(b, a) {
        if (Parent.byClass(a, "blockuser")) b.blockUser = true;
        return b;
    },
    getTokenDataFromTag: function(a) {
        return {
            uid: DOM.find(a, "input").value,
            text: DOM.getText(DOM.find(a, ".taggee"))
        };
    },
    getTokenElementFromTarget: function(a) {
        return Parent.byClass(a, "tagItem");
    },
    getTokenElements: function() {
        return DOM.scry(this.tokenarea, "span.tagItem").filter(this.filterNonTokenElements.bind(this));
    },
    getWithTagTokenElements: function() {
        return DOM.scry(this.tokenarea, "span.withTagItem");
    },
    filterNonTokenElements: function(a) {
        return !CSS.hasClass(a, "markasspam") && !CSS.hasClass(a, "reported") && !CSS.hasClass(a, "withTagItem");
    },
    createToken: function(b, a) {
        var c = this.getToken(this._tokenKey(b));
        c = c || new TagToken(b, this.tokens);
        if (c) c.setIsByOwner(this.byowner).setHasWithTag(this.withTagKeys[this._tokenKey(b)]).setIsFirstVisibleTag(this.byowner && !CSS.shown(this.tokenarea));
        a && c.setElement(a);
        return c;
    },
    updateTokenareaVisibility: function() {
        visibleTokens = this.getTokenElements().filter(function(a) {
            return CSS.shown(a);
        });
        withTagTokens = this.getWithTagTokenElements();
        CSS.conditionShow(this.tokenarea, visibleTokens.length !== 0 || withTagTokens.length !== 0);
    },
    replaceToken: function(e) {
        if (!e) return;
        var b = this.tokens.indexOf(e);
        if (b < 0) return;
        this.tokens.splice(this.tokens.indexOf(e), 1);
        delete this.unique[this._tokenKey(e.getInfo())];
        var a = ge("tagspam" + e.getValue());
        a && DOM.remove(a);
        var c = [ " [", _tx("Identification retirée."), " " ];
        c.push($N("a", {
            onclick: this.markAsSpam.bind(this, e.getValue())
        }, _tx("Marquer l’identification comme indésirable")));
        c.push("] ");
        var d = $N("span", {
            className: "fbPhotosTaglistTag tagItem markasspam",
            id: "tagspam" + e.getValue()
        }, c);
        DOM.replace(e.getElement(), d);
        this.updateTokenarea();
        this.inform("removeToken", e);
        Arbiter.inform("Form/change", {
            node: this.element
        });
    },
    markAsSpam: function(d) {
        var a = ge("tagspam" + d);
        var b = [ " [", _tx("Identification signalée"), "] " ];
        var c = $N("span", {
            className: "fbPhotosTaglistTag tagItem reported",
            id: "tagspam" + d
        }, b);
        DOM.replace(a, c);
        this.inform("markTagAsSpam", d);
    }
};

add_properties("TokenizerBehaviors", {
    freeform: function(f, b) {
        var d = b.tokenize_on_blur !== false;
        var e = b.tokenize_on_paste !== false;
        var c = b.matcher && new RegExp(b.matcher, "i");
        function a(event) {
            var h = Input.getValue(f.getInput()).trim();
            if (h && (!c || c.test(h))) {
                var g = {
                    uid: h,
                    text: h,
                    freeform: true
                };
                f.addToken(f.createToken(g));
                if (event) {
                    f.getTypeahead().getCore().afterSelect();
                    event.kill();
                }
            }
        }
        f.subscribe("keydown", function(g, i) {
            var event = i.event;
            var h = Event.getKeyCode(event);
            if (h == KEYS.COMMA || h == KEYS.RETURN) {
                var j = f.getTypeahead().getView();
                if (j.getSelection()) {
                    j.select();
                    event.kill();
                } else a(event);
            }
        });
        f.subscribe("paste", function(g, h) {
            if (e) a.bind(null, h.event).defer(20);
        });
        f.subscribe("blur", function(g, h) {
            if (d) a();
            f.getTypeahead().getCore().reset();
        });
    }
});

add_properties("TypeaheadBehaviors", {
    hintText: function(a) {
        a.getCore().resetOnKeyup = false;
    }
});