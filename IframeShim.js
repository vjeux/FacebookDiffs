if (window.CavalryLogger) {
    CavalryLogger.start_js([ "YxBS7" ]);
}

function IframeShim(a) {
    this._element = a;
    this._shim = null;
}

IframeShim.prototype = {
    show: function() {
        this._shim || this._buildShim();
        return this._updatePosition();
    },
    hide: function() {
        if (this._shim) {
            DOM.remove(this._shim);
            this._shim = null;
        }
        return this;
    },
    _buildShim: function() {
        this._shim = $N("iframe", {
            frameBorder: 0,
            scrolling: "no",
            src: "about:blank",
            style: {
                position: "absolute",
                filter: "progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)"
            }
        });
        DOM.prependContent(document.body, this._shim);
    },
    _updatePosition: function() {
        var a = Rect(this._element);
        a.getPositionVector().setElementPosition(this._shim);
        a.getDimensionVector().setElementDimensions(this._shim);
    }
};

add_properties("TypeaheadBehaviors", {
    ie6Hacks: function(a) {
        a.subscribe("init", function() {
            var b = new IframeShim(a.getView().getElement());
            a.subscribe([ "reset", "blur" ], b.hide.bind(b));
            a.subscribe([ "render", "focus" ], b.show.bind(b));
        });
    }
});