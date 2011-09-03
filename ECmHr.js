if (window.CavalryLogger) {
    CavalryLogger.start_js([ "ECmHr" ]);
}

function CIWebmailBootloader(a, b) {
    this.controllerFn = b;
    var c = Event.listen(a, "mouseover", function() {
        c.remove();
        this.bootload();
    }.bind(this));
    return this;
}

copy_properties(CIWebmailBootloader.prototype, {
    bootload: function(a) {
        Bootloader.loadComponents("contact-importer-webmail", function() {
            this.controller = this.controller || this.controllerFn();
            if (a) this.controller.onSubmit();
        }.bind(this));
    },
    onSubmit: function() {
        if (this.controller) {
            this.controller.onSubmit();
        } else this.bootload(true);
    }
});

onloadRegister(function() {
    Event.listen(document.documentElement, "submit", function(b) {
        var a = b.getTarget().getElementsByTagName("*");
        for (var c = 0; c < a.length; c++) if (a[c].getAttribute("required") && Input.isEmpty(a[c])) {
            a[c].focus();
            return false;
        }
    }, Event.Priority.URGENT);
});

function startMessagingNavCountUpdater(h) {
    var d;
    if (window.FutureSideNav) {
        d = FutureSideNav.getInstance().getNodeForKey("inbox");
    } else d = DOM.scry($("sideNav"), ".key-inbox")[0];
    if (!d) return;
    var c = DOM.scry(d, "span.count")[0];
    var b = DOM.scry(c, "span.countValue")[0];
    var a = new CounterDisplay("messages_unread", b, c, null, null, true);
    var f;
    if (window.FutureSideNav) {
        f = FutureSideNav.getInstance().getNodeForKey("other");
    } else f = DOM.scry(d, "li.key-other")[0];
    var g = DOM.scry(f, "span.count")[0];
    var e = DOM.scry(g, "span.countValue")[0];
    var i = DOM.scry(g, "span.maxCountIndicator")[0];
    (new CounterMaxDisplay("other_unseen", e, g, null, null, true)).setMaxCounter(h, i);
}

function CounterMaxDisplay() {
    this._maxValue = null;
    this._maxIndicatorNode = null;
    var a = [ this ].concat($A(arguments));
    return this.parent.construct.apply(this.parent, a);
}

Class.extend(CounterMaxDisplay, "CounterDisplay");

copy_properties(CounterMaxDisplay.prototype, {
    setMaxCounter: function(a, b) {
        this._maxValue = a;
        this._maxIndicatorNode = b;
    },
    paint: function() {
        var b = this._maxValue && this._count > this._maxValue;
        var a = b ? this._maxValue : this._count;
        if (this._maxIndicatorNode) {
            DOM.setContent(this._maxIndicatorNode, b ? "+" : "");
        } else if (b) a = a + "+";
        DOM.setContent(this._valueNode, a);
        this._toggleNodes();
    }
});

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