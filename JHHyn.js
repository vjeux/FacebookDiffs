if (window.CavalryLogger) {
    CavalryLogger.start_js([ "JHHyn" ]);
}

function Photocrop(b, a) {
    this.photo = b;
    copy_properties(this, copy_properties({
        target: this.photo.parentNode,
        width: 200,
        height: 200,
        min_width: 100,
        min_height: 100,
        center_x: this.photo.offsetWidth / 2,
        center_y: this.photo.offsetHeight / 2
    }, a));
    var c = this.center_x - this.width / 2;
    var d = this.center_y - this.height / 2;
    this.box = [ d, c + this.width, d + this.height, c ];
    CSS.addClass(this.target, "photocrop");
    [ "bg", "wrapper", "viewport" ].each(function(e) {
        this[e] = $N("div");
        CSS.addClass(this[e], e);
    }.bind(this));
    this.highlight = $N("img", {
        src: b.src
    });
    CSS.addClass(this.highlight, "highlight");
    this.target.appendChild(this.bg);
    this.target.appendChild(this.wrapper);
    this.wrapper.appendChild(this.highlight);
    this.wrapper.appendChild(this.viewport);
    [ "ne", "nw", "sw", "se" ].each(function(e) {
        var f = $N("div");
        CSS.addClass(f, e);
        this.viewport.appendChild(f);
    }.bind(this));
    Event.listen(this.viewport, {
        mousedown: this.mousedown.bind(this),
        dragstart: Event.kill,
        selectstart: Event.kill,
        click: Event.stop
    });
    Event.listen(document, {
        mousemove: this.mousemove.bind(this),
        mouseup: this.mouseup.bind(this)
    });
    [ this.bg, this.wrapper ].each(function(e) {
        e.style.width = b.offsetWidth + "px";
        e.style.height = b.offsetHeight + "px";
        e.style.top = b.offsetTop + "px";
        e.style.left = b.offsetLeft + "px";
    });
    this.redraw();
}

Photocrop.prototype.redraw = function() {
    this.highlight.style.clip = "rect(" + this.box.join("px ") + "px)";
    this.viewport.style.top = this.box[0] + "px";
    this.viewport.style.left = this.box[3] + "px";
    this.viewport.style.height = this.box[2] - this.box[0] + "px";
    this.viewport.style.width = this.box[1] - this.box[3] + "px";
};

Photocrop.prototype.done = function() {
    [ this.bg, this.wrapper ].each(DOM.remove);
    CSS.removeClass(this.target, "photocrop");
    var a = this.box.map(Math.round);
    return {
        x: a[3],
        y: a[0],
        width: a[1] - a[3],
        height: a[2] - a[0]
    };
};

Photocrop.prototype.mousedown = function(a) {
    this.mouseTarget = a.getTarget();
    this.pos = Vector2.getEventPosition(a);
    CSS.addClass(document.body, "draggingMode");
    return false;
};

Photocrop.prototype.mousemove = function(d) {
    if (!this.mouseTarget) return;
    var c = Vector2.getEventPosition(d).sub(this.pos);
    function b(j, k, i) {
        return Math.max(j, Math.min(i, k));
    }
    var a = this.box, g = this.min_width, f = this.min_height;
    var h = this.wrapper.offsetWidth, e = this.wrapper.offsetHeight;
    if (this.mouseTarget == this.viewport) {
        c.x = b(-a[3], c.x, h - a[1]);
        c.y = b(-a[0], c.y, e - a[2]);
        a[0] += c.y;
        a[1] += c.x;
        a[2] += c.y;
        a[3] += c.x;
    } else if (CSS.hasClass(this.mouseTarget, "ne")) {
        a[1] += c.x = b(a[3] + g - a[1], c.x, h - a[1]);
        a[0] += c.y = b(-a[0], c.y, a[2] - f - a[0]);
    } else if (CSS.hasClass(this.mouseTarget, "nw")) {
        a[3] += c.x = b(-a[3], c.x, a[1] - g - a[3]);
        a[0] += c.y = b(-a[0], c.y, a[2] - f - a[0]);
    } else if (CSS.hasClass(this.mouseTarget, "se")) {
        a[1] += c.x = b(a[3] + g - a[1], c.x, h - a[1]);
        a[2] += c.y = b(a[0] + f - a[2], c.y, e - a[2]);
    } else if (CSS.hasClass(this.mouseTarget, "sw")) {
        a[3] += c.x = b(-a[3], c.x, a[1] - g - a[3]);
        a[2] += c.y = b(a[0] + f - a[2], c.y, e - a[2]);
    }
    this.redraw();
    this.pos = this.pos.add(c);
    return false;
};

Photocrop.prototype.mouseup = function(a) {
    this.mouseTarget = null;
    CSS.removeClass(document.body, "draggingMode");
};