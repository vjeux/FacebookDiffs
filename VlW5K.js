if (window.CavalryLogger) {
    CavalryLogger.start_js([ "VlW5K" ]);
}

function ContextualDialog(b) {
    var a = new Dialog;
    copy_properties(a, ContextualDialog.prototype);
    a._setFromModel(b);
    return a;
}

ContextualDialog.prototype = {
    setContext: function(a) {
        this._context = a;
        this._dirty();
        return this;
    },
    _buildDialogContent: function() {
        Bootloader.loadComponents("contextual-dialog-css", function() {
            CSS.addClass(this._obj, "contextual_dialog");
            this._content = this._frame = $N("div", {
                className: "contextual_dialog_content"
            });
            this._arrow = $N("div", {
                className: "arrow"
            });
            DOM.setContent(this._popup, [ this._content, this._arrow ]);
        }.bind(this));
    },
    _resetDialogObj: function() {
        if (!this._context) return;
        var g = Vector2.getElementPosition(this._context);
        var k = this._context.offsetWidth, h = this._context.offsetHeight;
        var l = g.x, m = g.y + h;
        var i = Vector2.getViewportDimensions().x;
        var j = Vector2.getScrollPosition().x;
        var e = Vector2.getDocumentDimensions().x;
        var d = Vector2.getElementDimensions(this._popup).x;
        var f = 0;
        var c;
        if (k < 64) {
            c = l + k / 2;
        } else c = l + 32;
        if (e > 0 && e < d) {
            f = -l;
        } else {
            if (i > 0 && l + d > j + i) {
                f = j + i - d - l;
                if (l + f < j) f = j - l;
            }
            if (e > 0 && l + d > e) f = e - d - l;
        }
        l += f;
        if (c - l < 32) {
            l = c - 32;
            if (l < 0) l = 0;
        }
        var b = Vector2.getElementDimensions(this._arrow).x;
        var a = c - l - b / 2;
        if (a < 0) a = 0;
        if (a > d - 32) a = d - 32;
        CSS.setStyle(this._arrow, "marginLeft", a + "px");
        (new Vector2(l, m, "document")).setElementPosition(this._popup);
    },
    _renderDialog: function(a) {
        if (window != top) this._auto_focus = false;
        Dialog.prototype._renderDialog.call(this, a);
    }
};

function captchaRefresh(d, e, f, a, b) {
    var c = {
        new_captcha_type: d,
        id: f,
        t_auth_token: a
    };
    c.skipped_captcha_data = $("captcha_persist_data").value;
    if (e) c.registration_page = true;
    (new AsyncRequest).setURI("/captcha/refresh_ajax.php").setMethod("GET").setReadOnly(true).setData(c).setStatusElement("captcha_throbber").setHandler(function(i) {
        var g = ge("captcha");
        var h = ge("captcha_error_msg");
        if (g) DOM.setContent(g, HTML(i.getPayload().captcha));
        if (b && h) hide(h);
    }).send();
}

function tfbcaptcha_whats_this(a) {
    (new ContextualDialog).setContext(a).setTitle(_tx("Vérification de sécurité")).setBody('<div class="tfbcaptcha_whats_this_popup">' + _tx("Il s’agit d’une procédure de sécurité standard que nous utilisons pour empêcher la création de faux comptes pour envoyer des messages indésirables aux utilisateurs.") + "</div>").setButtons(Dialog.OK).show();
}