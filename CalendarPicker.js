if (window.CavalryLogger) {
    CavalryLogger.start_js([ "G4PSf" ]);
}

function preserve_children(c, b) {
    if (!c) return;
    b = b || [];
    var a = 0;
    var d;
    while (c.childNodes[a]) {
        d = c.childNodes[a];
        if (-1 == b.indexOf(d.getAttribute("id"))) {
            DOM.remove(d);
        } else a++;
    }
}

copy_properties(Date.prototype, {
    getMonthString: function() {
        switch (this.getMonth()) {
          case 0:
            return _tx("janvier");
            break;
          case 1:
            return _tx("février");
            break;
          case 2:
            return _tx("mars");
            break;
          case 3:
            return _tx("avril");
            break;
          case 4:
            return _tx("mai");
            break;
          case 5:
            return _tx("juin");
            break;
          case 6:
            return _tx("juillet");
            break;
          case 7:
            return _tx("août");
            break;
          case 8:
            return _tx("septembre");
            break;
          case 9:
            return _tx("octobre");
            break;
          case 10:
            return _tx("novembre");
            break;
          case 11:
            return _tx("décembre");
            break;
        }
    }
});

function CalendarPicker(a, d, c, b, f, e) {
    copy_properties(this, {
        textField: $(a + "_intl_field"),
        hiddenField: $(a + "_text_field"),
        prev: $(a + "_prev"),
        next: $(a + "_next"),
        calendarWrapper: $(a + "_calendar"),
        monthName: $(a + "_month_name"),
        dayTable: $(a + "_day_table"),
        time: ge(a + "_time"),
        limit: c,
        group_name: b,
        _events: {},
        _arbiter: new Arbiter,
        upperBound: e ? new Date(e * 1e3) : null
    });
    this.calendar_dow = f;
    this.reset(d);
    this.prev.onclick = bind(this, this._monthBackward);
    this.next.onclick = bind(this, this._monthForward);
    this.textField.onclick = bind(this, this.showCalendar);
    this.textField.onfocus = bind(this, this._textFieldFocus);
    this.textField.onkeyup = bind(this, this._textFieldKeyUp);
    this.textField.onblur = bind(this, this._textFieldBlur);
    Event.listen(document.body, "click", bind(this, this._bodyClick));
    this.textField.CalendarPicker = this;
    CalendarPicker.pickers.push(this);
    return this;
}

CalendarPicker.EVENT_SELECT = "CalendarPicker.events.select";

copy_properties(CalendarPicker.prototype, {
    showCalendar: function() {
        if (shown(this.calendarWrapper)) return;
        this.pickerMonth = this.month;
        this.pickerYear = this.year;
        for (var a = 0; a < CalendarPicker.pickers.length; a++) CalendarPicker.pickers[a].hideCalendar();
        CSS.addClass(this.calendarWrapper.parentNode, "dateselect_relative");
        this._redrawPicker();
        show(this.calendarWrapper);
        return this;
    },
    hideCalendar: function() {
        hide(this.calendarWrapper);
        if (this.calendarWrapper.parentNode) CSS.removeClass(this.calendarWrapper.parentNode, "dateselect_relative");
        return this;
    },
    getArbiter: function() {
        return this._arbiter;
    },
    setDate: function(c, b, a) {
        copy_properties(this, {
            date: a,
            month: b,
            year: c
        });
        this._update();
        return this;
    },
    getDate: function() {
        return new Date(this.year, this.month, this.date);
    },
    toString: function() {
        var a = "" + (this.month + 1) + "/" + this.date + "/" + this.year;
        if (this.time) a += " " + this.time.value;
        return a;
    },
    reset: function(b) {
        var a;
        if (typeof b == "object") {
            this.setDate(b.fullYear, b.month, b.day);
        } else {
            if (b === undefined) {
                a = new Date;
            } else a = new Date(b * 1e3);
            if (b > 0) {
                this.setDate(a.getFullYear(), a.getMonth(), a.getDate());
            } else this.setDate(0, 0, 0);
        }
        return this;
    },
    _getIntlValue: function() {
        var a = new Date;
        if (a.toDateString() == this.getDate().toDateString()) return _tx("Aujourd’hui");
        return _tx("{date}/{month}/{year}", {
            year: this.year,
            month: this.month + 1,
            date: this.date
        });
    },
    _update: function() {
        if (this.year + this.month + this.date == 0) {
            this.textField.value = "";
            this.hiddenField.value = "";
        } else {
            this.textField.value = this._getIntlValue();
            this.hiddenField.value = this.month + 1 + "/" + this.date + "/" + this.year;
        }
        for (var a = 0; a < CalendarPicker.pickers.length; a++) {
            var b = CalendarPicker.pickers[a];
            if (b == this || b.group_name != this.group_name) continue;
            switch (this.limit) {
              case CalendarPicker.limits.EARLIEST:
                if (new Date(b.year, b.month, b.date) < new Date(this.year, this.month, this.date)) b.setDate(this.year, this.month, this.date);
                break;
              case CalendarPicker.limits.LATEST:
                if (new Date(b.year, b.month, b.date) > new Date(this.year, this.month, this.date)) b.setDate(this.year, this.month, this.date);
                break;
            }
        }
    },
    _monthBackward: function() {
        if (this.pickerMonth == 0) {
            this.pickerYear--;
            this.pickerMonth = 12;
        }
        this.pickerMonth--;
        this._redrawPicker();
    },
    _monthForward: function() {
        if (this.pickerMonth == 11) {
            this.pickerYear++;
            this.pickerMonth = -1;
        }
        this.pickerMonth++;
        this._redrawPicker();
    },
    _daysInMonth: function(c, b) {
        var a = false;
        if (c % 4 == 0) if (c % 100 == 0) {
            if (c % 400 == 0) a = true;
        } else a = true;
        return b == 1 && a ? CalendarPicker.monthDays[b] + 1 : CalendarPicker.monthDays[b];
    },
    _redrawPicker: function() {
        DOM.setContent(this.monthName, HTML(_tx("{month} {year}", {
            month: (new Date(this.pickerYear, this.pickerMonth, 1)).getMonthString(),
            year: this.pickerYear
        })));
        preserve_children(this.dayTable);
        var b = 1;
        var c = this._daysInMonth(this.pickerYear, this.pickerMonth);
        var g = 6 - this.calendar_dow;
        var i = ((new Date(this.pickerYear, this.pickerMonth, 1)).getDay() + g) % 7;
        var d = false;
        while (b <= c) {
            var h = document.createElement("tr");
            for (var e = 0; e < 7 && b <= c; e++) {
                var a = document.createElement("td");
                a.setAttribute("width", "14%");
                if (d || (d = this._isPastUpperBound(this.pickerYear, this.pickerMonth, b))) {
                    CSS.addClass(a, "zombo_off");
                } else CSS.addClass(a, "zombo");
                var f = document.createElement("a");
                f.setAttribute("href", "#");
                a.appendChild(f);
                if (i != 0) {
                    i--;
                    CSS.addClass(a, "empty");
                } else {
                    DOM.setContent(f, "" + b);
                    if (!d) f.onmousedown = bind(this, this._cellClick, b);
                    if (this.year == this.pickerYear && this.month == this.pickerMonth && this.date == b) CSS.addClass(f, "selected");
                    b++;
                }
                h.appendChild(a);
            }
            this.dayTable.appendChild(h);
        }
    },
    _cellClick: function(a) {
        this.setDate(this.pickerYear, this.pickerMonth, a);
        this.hideCalendar();
        this._arbiter.inform(CalendarPicker.EVENT_SELECT, {
            sender: this
        }, Arbiter.BEHAVIOR_EVENT);
        return false;
    },
    _bodyClick: function(event) {
        var a = $E(event).getTarget();
        if (a != this.textField && !DOM.contains(this.calendarWrapper, a)) this.hideCalendar();
        this.ignoreBlurs = true;
        return true;
    },
    _textFieldBlur: function(event) {
        if (this.ignoreBlurs) {
            this.ignoreBlurs = false;
            return;
        }
        this.hideCalendar();
    },
    _textFieldFocus: function(event) {
        this.ignoreBlurs = false;
        var a = new Date(this.hiddenField.value);
        if (!+a) a = new Date;
        this.reset(+a / 1e3);
        this.showCalendar();
    },
    _textFieldKeyUp: function(event) {
        this.textField.value = this._getIntlValue();
    },
    _isPastUpperBound: function(c, b, a) {
        if (!this.upperBound) return false;
        return new Date(c, b, a) > this.upperBound;
    }
});

copy_properties(CalendarPicker, {
    pickers: [],
    monthDays: [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ],
    limits: {
        EARLIEST: -1,
        LATEST: 1
    }
});

var IntlDateFormats = {
    formats: {},
    setFormats: function(b, a) {
        IntlDateFormats.formats = a;
    },
    getFormat: function(a) {
        if (!(a in IntlDateFormats.formats)) {
            return a;
        } else return IntlDateFormats.formats[a];
    }
};

Date.format = function(b, c, d) {
    var a = c ? new Date(c * 1e3) : new Date;
    return a.format(b, d);
};

copy_properties(Date.prototype, {
    format: function(k, m) {
        if (!k) return "";
        var j = [], n = null, a = null;
        var d = m ? "getUTC" : "get", b = this[d + "Date"](), c = this[d + "Day"](), h = this[d + "Month"](), o = this[d + "FullYear"](), e = this[d + "Hours"](), g = this[d + "Minutes"](), l = this[d + "Seconds"](), i = this[d + "Milliseconds"]();
        for (var f = 0; f < k.length; f++) {
            a = k.charAt(f);
            if (a == "\\") {
                f++;
                j.push(k.charAt(f));
                continue;
            }
            switch (a) {
              case "d":
                n = this._formatPad(b);
                break;
              case "D":
                n = this._shortWeekdayNames[c];
                break;
              case "j":
                n = b;
                break;
              case "l":
                n = this._fullWeekdayNames[c];
                break;
              case "F":
                n = this._fullMonthNames[h];
                break;
              case "m":
                n = this._formatPad(h + 1);
                break;
              case "M":
                n = this._shortMonthNames[h];
                break;
              case "n":
                n = h + 1;
                break;
              case "Y":
                n = o;
                break;
              case "y":
                n = ("" + o).slice(2);
                break;
              case "a":
                n = e < 12 ? "am" : "pm";
                break;
              case "A":
                n = e < 12 ? "AM" : "PM";
                break;
              case "g":
                n = e == 0 || e == 12 ? 12 : e % 12;
                break;
              case "G":
                n = e;
                break;
              case "h":
                n = e == 0 || e == 12 ? 12 : this._formatPad(e % 12);
                break;
              case "H":
                n = this._formatPad(e);
                break;
              case "i":
                n = this._formatPad(g);
                break;
              case "s":
                n = this._formatPad(l);
                break;
              case "S":
                n = this._formatPad(i, 3);
                break;
              default:
                n = a;
            }
            j.push(n);
        }
        return j.join("");
    },
    _formatPad: function(b, a) {
        a = a || 2;
        b = "" + b;
        while (b.length < a) b = "0" + b;
        return b;
    },
    _shortWeekdayNames: [ _tx("dim"), _tx("lun"), _tx("mar"), _tx("mer"), _tx("jeu"), _tx("ven"), _tx("sam") ],
    _fullWeekdayNames: [ _tx("dimanche"), _tx("lundi"), _tx("mardi"), _tx("mercredi"), _tx("jeudi"), _tx("vendredi"), _tx("samedi") ],
    _shortMonthNames: [ _tx("jan"), _tx("fév"), _tx("mar"), _tx("avr"), _tx("mai"), _tx("jun"), _tx("juil"), _tx("aoû"), _tx("sep"), _tx("oct"), _tx("nov"), _tx("déc") ],
    _fullMonthNames: [ _tx("janvier"), _tx("février"), _tx("mars"), _tx("avril"), _tx("mai"), _tx("juin"), _tx("juillet"), _tx("août"), _tx("septembre"), _tx("octobre"), _tx("novembre"), _tx("décembre") ]
});

IntlDateFormats.setFormats("ca_ES", {
    "l, F j, Y": "l j F Y",
    "D M d, Y": "l j F Y",
    "l, F d, Y": "l j F Y",
    "l, M j, Y": "l j F Y",
    "D M j, y": "l j F Y",
    "F j, Y": "j F Y",
    "F jS, Y": "j F Y",
    "M j, Y": "j F Y",
    "M. d, Y": "j F Y",
    "F d, Y": "j F Y",
    "M d, Y": "j F Y",
    "D M d": "l j F",
    "l, F jS": "l j F",
    "l, M j": "l j F",
    "D M j": "l j F",
    "l, F j": "l j F",
    "l, F jS, g:ia": "l j F Y H:i",
    "g:iA, l M jS": "l j F Y H:i",
    "g:iA l, F jS": "l j F Y H:i",
    "l, M j, Y g:ia": "l j F Y H:i",
    "F j, Y @ g:i A": "j F Y H:i",
    "M j, Y g:i A": "j F Y H:i",
    "F j, Y g:i a": "j F Y H:i",
    "M d, Y g:ia": "j F Y H:i",
    "g:ia F jS, Y": "j F Y H:i",
    "H:I - M d, Y": "j F Y H:i",
    "M j, Y g:ia": "j F Y H:i",
    "M d, Y ga": "j F Y H",
    "g:ia, F jS": "j F H:i",
    "g:ia M jS": "j F H:i",
    "g:ia M j": "j F H:i",
    "F jS, g:ia": "j F H:i",
    "M jS, g:ia": "j F H:i",
    "F j": "j F",
    "F jS": "j F",
    "F g": "j F",
    "M j": "j F",
    "M d": "j F",
    "M. d": "j F",
    "M y": "j F",
    "F d": "j F",
    "F Y": "F Y",
    "M Y": "F Y",
    "D g:ia": "D H:i",
    "l g:ia": "l H:i",
    "Y-m-d": "d/m/Y",
    "y/m/d": "d/m/Y",
    "m/d/y": "d/m/Y",
    "m-d-y": "d/m/Y",
    "m/d/Y": "d/m/Y",
    "Y/m/d": "d/m/Y",
    "n/j/y": "d/m/Y",
    "m.d.y": "d/m/Y",
    "n/j": "d/m",
    n: "d/m",
    "m/d": "d/m",
    "n/j, g:ia": "d/m/Y H:i",
    "m/d/Y g:ia": "d/m/Y H:i",
    "m/d/y H:i:s": "d/m/Y H:i:s",
    "h:m:s m/d/Y": "d/m/Y H:i:s",
    "m/d/Y h:m": "d/m/Y H:i:s",
    "g:ia": "H:i",
    "g:i a": "H:i",
    "g A": "H:i",
    "h:i a": "H:i",
    "g:i A": "H:i",
    "g:sa": "H:i",
    "g:iA": "H:i",
    "g:i": "H:i",
    Y: "Y",
    j: "j",
    D: "D"
});

function Datepicker() {}

copy_properties(Datepicker, {
    datepickers: [],
    limits: {
        EARLIEST: -1,
        LATEST: 1
    }
});

Datepicker.prototype = {
    init: function(f, g, d, b, e, a, c) {
        this.root = f;
        this.timestamp = new Date(g);
        this.limit = d;
        this.groupName = b;
        this.offset = e;
        this.latestDate = c ? new Date(c) : null;
        this.earliestDate = a ? new Date(a) : null;
        this.calendarDate = new Date(g);
        this.dayTable = DOM.find(f, ".dayTable");
        this.hiddenField = DOM.find(f, ".hiddenField");
        this.textField = DOM.find(f, ".textField");
        this.timestamp.setHours(0, 0, 0, 0);
        if (this.earliestDate) this.earliestDate.setHours(0, 0, 0, 0);
        if (this.latestDate) this.latestDate.setHours(0, 0, 0, 0);
        Datepicker.datepickers.push(this);
        Event.listen(this.textField, "click", function() {
            Toggler.show(this.root);
            return false;
        }.bind(this));
        Toggler.listen("show", this.root, this.showCalendar.bind(this));
        Event.listen(this.root, "click", function(h) {
            var i = h.getTarget();
            if (Parent.byClass(i, "prevMonth")) {
                this.calendarDate.setMonth(this.calendarDate.getMonth() - 1, 1);
                this.draw();
            } else if (Parent.byClass(i, "nextMonth")) {
                this.calendarDate.setMonth(this.calendarDate.getMonth() + 1, 1);
                this.draw();
            } else if (CSS.hasClass(i, "dayCell")) {
                this.setDate(this.calendarDate.getFullYear(), this.calendarDate.getMonth(), DOM.getText(i), true);
                Toggler.hide(this.root);
            }
            h.kill();
        }.bind(this));
        Event.listen(this.textField, "keyup", function(i) {
            var j = Event.getKeyCode(i);
            if (j == KEYS.ESC || j == KEYS.RETURN) {
                Toggler.hide(this.root);
                return true;
            }
            Toggler.show(this.root);
            var l = this.textField.value.split("/");
            if (l.length == 3) {
                var k = parseInt(l[0], 10) - 1, h = parseInt(l[1], 10), m = parseInt(l[2], 10);
                if (m < 100 && m >= 0) m += Math.floor((new Date).getFullYear() / 100) * 100;
                if (m > 999 && k >= 0 && k < 12 && h > 0 && h <= (new Date(m, k + 1, 0)).getDate()) {
                    this.setDate(m, k, h, false);
                    this.calendarDate.setTime(this.timestamp.getTime());
                    this.draw();
                }
            }
        }.bind(this));
    },
    draw: function() {
        this.calendarDate.setDate(1);
        var b = 1;
        var c = (this.calendarDate.getDay() + this.offset) % 7;
        var e = (new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth() + 1, 0)).getDate();
        DOM.setContent(DOM.find(this.root, ".monthTitle"), this.calendarDate.format("F Y"));
        DOM.empty(this.dayTable);
        while (b <= e) {
            var f = $N("tr");
            for (var d = 0; d < 7 && b <= e; ++d) {
                var a = $N("td");
                if (c) {
                    --c;
                } else {
                    this.calendarDate.setDate(b);
                    if (!this.isInvalidDate(this.calendarDate)) {
                        CSS.addClass(a, "dayCell");
                        if (this.calendarDate.getTime() == this.timestamp.getTime()) CSS.addClass(a, "selected");
                    }
                    DOM.setContent(a, b);
                    ++b;
                }
                f.appendChild(a);
            }
            this.dayTable.appendChild(f);
        }
    },
    isInvalidDate: function(a) {
        return this.earliestDate && this.earliestDate > a || this.latestDate && this.latestDate < a;
    },
    setDate: function(h, e, a, g) {
        var f = new Date(h, e, a);
        if (this.isInvalidDate(f)) return false;
        this.timestamp = f;
        var b = e + 1 + "/" + a + "/" + h;
        if (g) this.textField.value = b;
        this.hiddenField.value = b;
        if (this.groupName) for (var d = 0; d < Datepicker.datepickers.length; ++d) {
            var c = Datepicker.datepickers[d];
            if (c.root != this.root && c.groupName == this.groupName) if (this.limit == Datepicker.limits.EARLIEST && c.timestamp < this.timestamp || this.limit == Datepicker.limits.LATEST && c.timestamp > this.timestamp || c.limit == Datepicker.limits.EARLIEST && c.timestamp > this.timestamp || c.limit == Datepicker.limits.LATEST && c.timestamp < this.timestamp) {
                c.textField.value = b;
                c.hiddenField.value = b;
                c.timestamp.setTime(f.getTime());
            }
        }
    },
    showCalendar: function() {
        this.calendarDate.setTime(this.timestamp.getTime());
        this.draw();
    }
};

function editor_two_level_change(b, d, e, c) {
    b = ge(b);
    d = ge(d);
    if (b && d) {
        d.options.length = 1;
        type_value = b.options[b.selectedIndex].value;
        if (type_value == "") type_value = -1;
        if (type_value >= 0) {
            index = 1;
            suboptions = e[type_value];
            if (typeof suboptions != "undefined") for (var a in suboptions) d.options[index++] = new Option(suboptions[a], a);
            if (c) if (c[type_value]) {
                d.options[0] = new Option(c[type_value], "");
                d.options[0].selected = true;
            } else {
                d.options[0] = new Option("---", "");
                d.options[0].selected = true;
            }
        }
        d.disabled = d.options.length <= 1;
    }
}

function editor_two_level_set_subselector(b, c) {
    b = ge(b);
    if (b) {
        opts = b.options;
        for (var a = 0; a < opts.length; a++) if (opts[a].value == c || c === null && opts[a].value == "") b.selectedIndex = a;
    }
}

function editor_network_change(c, b, a) {
    c = ge(c);
    if (c && c.value > 0) {
        show("display_network_message");
    } else hide("display_network_message");
}

function editor_rel_change(d, b, a) {
    d = ge(d);
    for (var c = 2; c <= 6; c++) if (c == d.value) {
        show(b + "_new_partner_" + c);
    } else hide(b + "_new_partner_" + c);
    if (d && ge(b + "_new_partner")) if (d.value >= 2 && d.value <= 6 || d.value >= 10 && d.value <= 11) {
        show(b + "_new_partner");
        editor_rel_anniv_show(b);
    } else {
        hide(b + "_new_partner");
        editor_rel_anniv_hide(b);
    }
    if (d && ge(b + "_rel_uncancel")) if (d.value >= 2 && d.value <= 6) {
        editor_rel_uncancel(d, b, d.value);
    } else editor_rel_cancel(d, b);
    _editor_rel_toggle_awaiting(d, b, a);
}

function rel_typeahead_onsubmit() {
    return false;
}

function rel_typeahead_onselect(a) {
    if (!a) return;
    $("new_partner").value = a.i;
    show($("relationship_warning"));
    DOM.setContent($("relationshipee"), a.t);
}

function _editor_rel_toggle_awaiting(c, b, a) {
    c = ge(c);
    if (c && ge(b + "_rel_required")) if (c.value == a) {
        hide(b + "_rel_required");
        show(b + "_rel_awaiting");
    } else {
        show(b + "_rel_required");
        hide(b + "_rel_awaiting");
    }
}

function editor_rel_cancel(b, a) {
    if (ge(a + "_rel_uncancel")) show(a + "_rel_uncancel");
    if (ge(a + "_rel_cancel")) hide(a + "_rel_cancel");
    b = ge(b);
    if (ge(b) && $(b).selectedIndex > 1) _editor_rel_set_value(b, 1);
    editor_rel_anniv_hide(a);
}

function editor_rel_anniv_show(a) {
    if (ge(a + "_rel_anniv")) CSS.show(ge(a + "_rel_anniv"));
}

function editor_rel_anniv_hide(a) {
    if (ge(a + "_rel_anniv")) CSS.hide(ge(a + "_rel_anniv"));
}

function editor_rel_cancel_new(e, d, c, f, b, a) {
    hide($("relationship_warning"));
    $("new_partner").value = "";
    $("relationship_typeahead").typeahead.clear();
    _editor_rel_set_value($(e), c);
    if (ge("anniversary_year")) {
        f = f ? f : -1;
        $("anniversary_year").value = f;
    }
    if (ge("anniversary_month")) {
        b = f ? f : -1;
        $("anniversary_month").value = b;
    }
    if (ge("anniversary_day")) {
        a = f ? f : -1;
        $("anniversary_day").value = a;
    }
    editor_rel_change($(e), d, c);
}

function editor_rel_uncancel(c, a, b) {
    if (ge(a + "_rel_uncancel")) hide(a + "_rel_uncancel");
    if (ge(a + "_rel_cancel")) show(a + "_rel_cancel");
    if (b == 4 || b == 5) {
        hide(a + "_rel_with");
        show(a + "_rel_to");
    } else if (b >= 2 && b <= 6) {
        show(a + "_rel_with");
        hide(a + "_rel_to");
    }
    if (ge(c) && $(c).selectedIndex <= 1) _editor_rel_set_value(c, b);
    editor_rel_anniv_show(a);
    _editor_rel_toggle_awaiting(c, a, b);
}

function editor_autocomplete_onselect(c) {
    var b = /(.*)_/.exec(this.obj.name);
    if (b) {
        var a = ge(b[1] + "_id");
        if (c) {
            a.value = c.i == null ? c.t : c.i;
        } else a.value = -1;
    }
}

function _editor_rel_set_value(b, c) {
    b = ge(b);
    if (b) {
        opts = b.options;
        opts_length = opts.length;
        for (var a = 0; a < opts_length; a++) if (opts[a].value == c || c === null && opts[a].value == "") b.selectedIndex = a;
    }
}

function enableDisable(a, b) {
    b = ge(b);
    if (b) {
        if (b.value) b.value = "";
        if (b.selectedIndex) b.selectedIndex = 0;
    }
}

function show_editor_error(a, b) {
    $("editor_error_text").innerHTML = a;
    $("editor_error_explanation").innerHTML = b;
    show("error");
}

function make_explanation_list(b, c) {
    var a = "";
    if (c == 1) {
        a = _tx("{thing-1} est nécessaire.", {
            "thing-1": b[0]
        });
    } else if (c == 2) {
        a = _tx("{thing-1} et {thing-2} sont demandés.", {
            "thing-1": b[0],
            "thing-2": b[1]
        });
    } else if (c == 3) {
        a = _tx("{thing-1}, {thing-2} et {thing-3} sont requis.", {
            "thing-1": b[0],
            "thing-2": b[1],
            "thing-3": b[2]
        });
    } else if (c == 4) {
        a = _tx("{thing-1}, {thing-2}, {thing-3} et {thing-4} sont requis.", {
            "thing-1": b[0],
            "thing-2": b[1],
            "thing-3": b[2],
            "thing-4": b[3]
        });
    } else if (c > 4) a = _tx("{thing-1}, {thing-2}, {thing-3} et {num} autres champs sont indispensables.", {
        "thing-1": b[0],
        "thing-2": b[1],
        "thing-3": b[2],
        num: c - 3
    });
    return a;
}

function TimeSpan(zb, y, za, z) {
    this.get_start_ts = function() {
        return j(s, p, v, q, r, o);
    };
    this.get_end_ts = function() {
        var ze = j(s, p, v, q, r, o);
        var zc = j(f, b, i, c, e, a);
        if (ze > zc && !(v && i)) {
            var zd = new Date;
            zd.setTime(zc);
            zd.setFullYear(zd.getFullYear() + 1);
            return zd.getTime();
        } else return zc;
    };
    var s = $(zb + "_month");
    var p = $(zb + "_day");
    var q = $(zb + "_hour");
    var v = ge(zb + "_year");
    var r = $(zb + "_min");
    var o = $(zb + "_ampm");
    var f = $(y + "_month");
    var b = $(y + "_day");
    var i = ge(y + "_year");
    var c = $(y + "_hour");
    var e = $(y + "_min");
    var a = $(y + "_ampm");
    var w = za * 6e4;
    var k = function() {
        var zf = i.options;
        var ze = [];
        for (var zd = 0; zd < zf.length; zd++) {
            var zc = zf[zd];
            if (zc.text != "Year:" && zc.value != "-1") ze.push(parseInt(zc.value));
        }
        ze = ze.sort();
        return ze[ze.length - 1];
    };
    var l = k();
    var x = function() {
        var zd = j(s, p, v, q, r, o);
        var zc = j(f, b, i, c, e, a);
        w = zc - zd;
    };
    var u = function() {
        if (z === true) m(s, p, v, q, r, o);
    };
    var h = function() {
        x();
    };
    var m = function() {
        var ze = j(s, p, v, q, r, o);
        var zd = ze + w;
        n(zd, f, b, i, c, e, a);
        var zf = i.options;
        var zc = new Date(zd);
        if (zc.getFullYear() > l) {
            zf.value = l;
            h();
        }
    };
    var j = function(zk, zd, zr, zi, zl, zc) {
        var zp = new Date;
        var zf = zp.getDate();
        var zg = zp.getMonth();
        var zh = zp.getFullYear();
        var zn = zk.value - 1;
        var ze = zd.value;
        var zj = 0;
        var zm = 0;
        if (zl) zm = zl.value;
        var zs;
        if (zi) zj = parseInt(zi.value);
        if (zc && zc.value != "") {
            if (zj == 12) zj = 0;
            if (zc.value == "pm") zj = zj + 12;
        }
        if (!zr) {
            if (zn < zg) {
                zs = zh + 1;
            } else if (zn == zg && ze < zf) {
                zs = zh + 1;
            } else zs = zh;
        } else zs = zr.value;
        var zo = new Date(zs, zn, ze, zj, zm, 0, 0);
        var zq = zo.getTime();
        return zq;
    };
    var n = function(zp, zf, zd, zq, ze, zg, zc) {
        var zi = new Date;
        zi.setTime(zp);
        var zo = zf.value;
        var zm = zi.getMonth() + 1;
        var zj = zi.getDate();
        var zk = zi.getHours();
        var zl = zi.getMinutes();
        var zn = zi.getFullYear();
        var zh;
        if (zc.value != "") {
            if (zk > 11) {
                zh = "pm";
                if (zk > 12) zk = zk - 12;
            } else {
                if (zk == 0) zk = 12;
                zh = "am";
            }
        } else zh = "";
        if (zl < 10) zl = "0" + zl;
        zf.value = zm;
        zd.value = zj;
        if (zq) zq.value = zn;
        ze.value = zk;
        zg.value = zl;
        zc.value = zh;
        if (zo != zm) editor_date_month_change(zf, zd, zq ? zq : false);
    };
    var t = function() {
        editor_date_month_change(s, p, v ? v : false);
        u();
        x();
    };
    var g = function() {
        editor_date_month_change(f, b, i ? i : false);
        h();
    };
    var d = function() {
        h();
        var zd = j(s, p, v, q, r, o);
        var zc = j(f, b, i, c, e, a);
        if (zc < zd) {
            var ze = 12 * 60 * 6e4;
            zc += parseInt((zd - zc + ze - 1) / ze) * ze;
            n(zc, f, b, i, c, e, a);
        }
    };
    s.onchange = t;
    p.onchange = u;
    if (v) v.onchange = u;
    q.onchange = u;
    r.onchange = u;
    o.onchange = u;
    f.onchange = g;
    b.onchange = h;
    if (i) i.onchange = h;
    c.onchange = d;
    e.onchange = h;
    a.onchange = h;
}

function calculate_integer_age(b, g) {
    var e = b.split("/");
    var d = parseInt(e[0], 10);
    var c = parseInt(e[1], 10);
    var f = parseInt(e[2], 10);
    var j = g.split("/");
    var i = parseInt(j[0], 10);
    var h = parseInt(j[1], 10);
    var k = parseInt(j[2], 10);
    var a = k - f - 1;
    if (d < i || d == i && c <= h) a++;
    return a;
}

function editor_date_month_change(e, b, g) {
    var e = ge(e);
    var b = ge(b);
    var g = g ? ge(g) : false;
    var c = parseInt(b.value);
    var h = false;
    if (g && g.value && g.value != -1) h = g.value;
    var f = _month_get_num_days(e.value, h);
    var a = b.options[0].value == -1 ? 1 : 0;
    for (var d = b.options.length; d > f + a; d--) DOM.remove(b.options[d - 1]);
    for (var d = b.options.length; d < f + a; d++) b.options[d] = new Option(d + (a ? 0 : 1), d + (a ? 0 : 1));
    if (f < c) {
        b.value = b.options.length;
        if (typeof b.onchange === "function") b.onchange();
    }
}

function _month_get_num_days(a, c) {
    var b;
    if (a == -1) return 31;
    b = new Date(c ? c : 1912, a, 0);
    return b.getDate();
}

function toggleEndWorkSpan(a) {
    if (shown(a + "_endspan")) {
        hide(a + "_endspan");
        show(a + "_present");
    } else {
        show(a + "_endspan");
        hide(a + "_present");
    }
}

function regionCountryChange(b, a, d, c) {
    switch (a) {
      case "326":
        show(d);
        $(b).innerHTML = c + _tx("Province");
        break;
      case "398":
        show(d);
        $(b).innerHTML = c + _tx("Etat");
        break;
      default:
        $(b).innerHTML = c + _tx("Pays");
        hide(d);
        break;
    }
}

function regionCountryChange_twoLabels(b, e, a, d, c) {
    show(b);
    $(b).innerHTML = c + _tx("Pays");
    switch (a) {
      case "326":
        show(d);
        show(e);
        $(e).innerHTML = c + _tx("Province");
        break;
      case "":
      case "398":
        show(d);
        show(e);
        $(e).innerHTML = c + _tx("Etat");
        break;
      default:
        $(e).innerHTML = c + _tx("Etat");
        $(d).disabled = true;
        break;
    }
}

function regionCountyChange_setUSifStateChosen(a, b) {
    region_select = ge(b);
    country_select = ge(a);
    if (region_select.value != "" && country_select.value == "") country_select.value = 398;
}

function regionCountryChange_restrictions(a, b) {
    country_select = ge(a);
    if (country_select.value == 398) {
        country_select.value = "";
    } else if (country_select.value == 326) {
        region_select = ge(b);
        if (region_select.value) country_select.value = "";
    }
}

function SelectGuestsButton() {}

SelectGuestsButton.prototype = {
    init: function(a, d, c, e, b) {
        this.button = a;
        this.invitees = d;
        this.emails = c;
        this.personalMsg = e;
        this.container = b;
        this.eventID = null;
        Event.listen(this.button, "click", this.showDialog.bind(this));
        Arbiter.subscribe("EventInviteDialog/close", this.hideDialog.bind(this));
        return this;
    },
    setEventID: function(a) {
        this.eventID = a;
        return this;
    },
    showDialog: function() {
        Dialog.bootstrap("/ajax/choose/", {
            type: "event",
            eid: this.eventID,
            invitees: this.invitees,
            emails: this.emails,
            invite_message: this.personalMsg
        }, false, "POST");
    },
    hideDialog: function(a, b) {
        this.invitees = [];
        var c = JSON.parse(b.profileChooserItems);
        var d;
        for (d in c) if (c.hasOwnProperty(d) && c[d]) this.invitees.push(d);
        this.emails = values(b.emails);
        this.personalMsg = b.invite_msg;
        var e = this.invitees.length + this.emails.length;
        Button.setLabel(this.button, e === 0 ? _tx("Sélectionner les invités") : _tx("Sélectionner plus d’invités ({num})", {
            num: e
        }));
        DOM.find(this.container, "input.invitees").value = this.invitees.join(",");
        DOM.find(this.container, "input.emails").value = this.emails.join(",");
        DOM.find(this.container, "input.message").value = this.personalMsg;
    }
};

function InsightsDateSelectorController() {}

InsightsDateSelectorController.prototype = {
    init: function(a) {
        this.buttons = a.buttons;
        this.visible = false;
        this.date_selector = $("insights_date_selector");
        this.custom_selector = $("date_custom_selector");
        this.img_a = $("date_toggle_img_a");
        this.img_b = $("date_toggle_img_b");
        Event.listen(document.body, "click", this.clickHandler.bind(this));
        Event.listen($("custom_apply"), "click", this.followLink.bind(this), Event.Priority.URGENT);
        for (var b = 0; b < this.buttons.length; b++) Event.listen($(this.buttons[b]), "click", this.followLink.bind(this), Event.Priority.URGENT);
    },
    clickHandler: function(event) {
        var a = $E(event).getTarget();
        var b = a.id;
        if (!DOM.contains(this.date_selector, a)) {
            this.visible = false;
            this._updateVisibility();
        } else if (b === "in_date_toggle" || b === "date_toggle") {
            this.visible = !this.visible;
            this._updateVisibility();
            return false;
        }
        return true;
    },
    _updateVisibility: function() {
        CSS.conditionShow(this.custom_selector, this.visible);
        CSS.conditionShow(this.img_a, !this.visible);
        CSS.conditionShow(this.img_b, this.visible);
    },
    followLink: function(event) {
        var f = $(event).getTarget();
        var d = $("custom_apply");
        var b = false;
        var a, e;
        for (e = 0; e < this.buttons.length; e++) {
            a = $(this.buttons[e]);
            if (DOM.contains(a, f)) {
                if (CSS.hasClass(f, "uiButtonDepressed")) return false;
                b = this.buttons[e];
            }
        }
        if (!b && !DOM.contains(d, f)) return true;
        for (e = 0; e < this.buttons.length; e++) if (this.buttons[e] !== b) {
            a = $(this.buttons[e]);
            CSS.removeClass(a, "uiButtonDepressed");
            CSS.addClass(a, "uiButtonDisabled");
        }
        CSS.show($("insights_date_loading"));
        CSS.addClass(f, "uiButtonDepressed");
        CSS.addClass(d, "uiButtonDepressed");
        if (!b) {
            var c = URI(d.href);
            c.addQueryData({
                start: $("start_text_field").value,
                end: $("end_text_field").value
            });
            d.href = c.toString();
        }
        return true;
    }
};