if (window.CavalryLogger) {
    CavalryLogger.start_js([ "iVV76" ]);
}

create_captcha = window.create_captcha || function(b) {
    var a = {};
    if (Env.recaptcha_focus_on_load) a.callback = Recaptcha.focus_response_field;
    setTimeout(function() {
        Recaptcha.create(b, "captcha", a);
    }, 0);
};

function m_create_audio_captcha(a) {
    window.Env = {};
    setTimeout(function() {
        m_create_audio_captcha_helper(a, "captcha", {});
    }, 0);
}

function m_create_audio_captcha_helper(c, a, b) {
    Recaptcha._init_options(b);
    Recaptcha.audio_only = true;
    Recaptcha._call_challenge(c);
}

function recaptcha_log_action(a) {
    (new AsyncRequest).setURI("/ajax/captcha/recaptcha_log_actions.php").setData({
        action: a,
        ua: navigator.userAgent,
        location: window.location.href
    }).setMethod("GET").setReadOnly(true).send();
}

var RecaptchaOptions;

var RecaptchaDefaultOptions = {
    tabindex: 0,
    callback: null
};

var Recaptcha = {
    widget: null,
    timer_id: -1,
    fail_timer_id: -1,
    type: "image",
    ajax_verify_cb: null,
    audio_only: false,
    $: function(a) {
        if (typeof a == "string") {
            return document.getElementById(a);
        } else return a;
    },
    create: function(c, a, b) {
        Recaptcha.destroy();
        if (a) Recaptcha.widget = Recaptcha.$(a);
        Recaptcha._init_options(b);
        Recaptcha._call_challenge(c);
    },
    destroy: function() {
        var a = Recaptcha.$("recaptcha_challenge_field");
        if (a) a.parentNode.removeChild(a);
        if (Recaptcha.timer_id != -1) clearInterval(Recaptcha.timer_id);
        Recaptcha.timer_id = -1;
        var b = Recaptcha.$("recaptcha_image");
        if (b) b.innerHTML = "";
        if (Recaptcha.widget) {
            Recaptcha.widget.style.display = "none";
            Recaptcha.widget = null;
        }
    },
    focus_response_field: function() {
        var a = Recaptcha.$;
        var b = a("captcha_response");
        try {
            b.focus();
        } catch (c) {}
    },
    get_challenge: function() {
        if (typeof RecaptchaState == "undefined") return null;
        return RecaptchaState.challenge;
    },
    get_response: function() {
        var a = Recaptcha.$;
        var b = a("captcha_response");
        if (!b) return null;
        return b.value;
    },
    ajax_verify: function(a) {
        Recaptcha.ajax_verify_cb = a;
        var b = Recaptcha._get_api_server() + "/ajaxverify" + "?c=" + encodeURIComponent(Recaptcha.get_challenge()) + "&response=" + encodeURIComponent(Recaptcha.get_response());
        Recaptcha._add_script(b);
    },
    _ajax_verify_callback: function(a) {
        Recaptcha.ajax_verify_cb(a);
    },
    _get_api_server: function() {
        var a = window.location.protocol;
        var b;
        if (typeof _RecaptchaOverrideApiServer != "undefined") {
            b = _RecaptchaOverrideApiServer;
        } else b = "www.google.com";
        return a + "//" + b;
    },
    _call_challenge: function(a) {
        if (!Recaptcha.audio_only) Recaptcha.fail_timer_id = setTimeout(Recaptcha.fail_timer_id == -1 ? "recaptcha_log_action('timeout'); create_captcha();" : "create_captcha();", 15e3);
        var b = Recaptcha._get_api_server() + "/recaptcha/api/challenge?k=" + a + "&ajax=1&xcachestop=" + Math.random();
        if ($("extra_challenge_params") != null) b += "&" + $("extra_challenge_params").value;
        Recaptcha._add_script(b);
    },
    _add_script: function(a) {
        Bootloader.requestResource("js", a);
    },
    _init_options: function(b) {
        var a = RecaptchaDefaultOptions;
        var d = b || {};
        for (var c in d) a[c] = d[c];
        RecaptchaOptions = a;
    },
    challenge_callback: function() {
        if (!Recaptcha.audio_only) {
            clearTimeout(Recaptcha.fail_timer_id);
            Recaptcha._reset_timer();
        }
        var a = Recaptcha.widget;
        if (window.addEventListener) window.addEventListener("unload", function(d) {
            Recaptcha.destroy();
        }, false);
        if (Recaptcha._is_ie() && window.attachEvent) window.attachEvent("onbeforeunload", function() {});
        if (navigator.userAgent.indexOf("KHTML") > 0) {
            var b = document.createElement("iframe");
            b.src = "about:blank";
            b.style.height = "0px";
            b.style.width = "0px";
            b.style.visibility = "hidden";
            b.style.border = "none";
            var c = document.createTextNode("This frame prevents back/forward cache problems in Safari.");
            b.appendChild(c);
            document.body.appendChild(b);
        }
        Recaptcha._finish_widget();
        if (Recaptcha.audio_only) Recaptcha.switch_type("audio");
        recaptcha_log_action("shown");
    },
    _finish_widget: function() {
        var a = Recaptcha.$;
        var c = RecaptchaState;
        var b = RecaptchaOptions;
        var d = document.createElement("input");
        d.type = "password";
        d.setAttribute("autocomplete", "off");
        d.style.display = "none";
        d.name = "recaptcha_challenge_field";
        d.id = "recaptcha_challenge_field";
        a("captcha_response").parentNode.insertBefore(d, a("captcha_response"));
        a("captcha_response").setAttribute("autocomplete", "off");
        a("recaptcha_image").style.width = "300px";
        a("recaptcha_image").style.height = "57px";
        Recaptcha.should_focus = false;
        if (!Recaptcha.audio_only) {
            Recaptcha._set_challenge(c.challenge, "image");
        } else Recaptcha._set_challenge(c.challenge, "audio");
        if (b.tabindex) a("captcha_response").tabIndex = b.tabindex;
        if (Recaptcha.widget) Recaptcha.widget.style.display = "";
        if (b.callback) b.callback();
        a("recaptcha_loading").style.display = "none";
    },
    switch_type: function(b) {
        var a = Recaptcha;
        a.type = b;
        $("recaptcha_type").value = b;
        a.reload(a.type == "audio" ? "a" : "v");
    },
    reload: function(d) {
        var b = Recaptcha;
        var a = b.$;
        var c = RecaptchaState;
        if (typeof d == "undefined") d = "r";
        var e = c.server + "reload?c=" + c.challenge + "&k=" + c.site + "&reason=" + d + "&type=" + b.type + "&lang=" + Env.recaptcha_lang;
        if (a("extra_challenge_params") != null) e += "&" + a("extra_challenge_params").value;
        b.should_focus = d != "t";
        b._add_script(e);
    },
    finish_reload: function(a, b) {
        RecaptchaState.is_incorrect = false;
        Recaptcha._set_challenge(a, b);
    },
    _set_challenge: function(e, f) {
        var b = Recaptcha;
        var c = RecaptchaState;
        var a = b.$;
        c.challenge = e;
        b.type = f;
        a("recaptcha_challenge_field").value = c.challenge;
        a("recaptcha_challenge_field").defaultValue = c.challenge;
        a("recaptcha_image").innerHtml = "";
        if (f == "audio") {
            a("recaptcha_image").innerHTML = Recaptcha.getAudioCaptchaHtml();
        } else if (f == "image") {
            var d = c.server + "image?c=" + c.challenge;
            a("recaptcha_image").innerHTML = "<img style='display:block;' height='57' width='300' src='" + d + "'/>";
        }
        Recaptcha._css_toggle("recaptcha_had_incorrect_sol", "recaptcha_nothad_incorrect_sol", c.is_incorrect);
        Recaptcha._css_toggle("recaptcha_is_showing_audio", "recaptcha_isnot_showing_audio", f == "audio");
        b._clear_input();
        if (b.should_focus) b.focus_response_field();
        b._reset_timer();
    },
    _reset_timer: function() {
        var a = RecaptchaState;
        clearInterval(Recaptcha.timer_id);
        Recaptcha.timer_id = setInterval("Recaptcha.reload('t');", (a.timeout - 60 * 5) * 1e3);
    },
    _clear_input: function() {
        var a = Recaptcha.$("captcha_response");
        a.value = "";
    },
    _displayerror: function(b) {
        var a = Recaptcha.$;
        DOM.empty("recaptcha_image");
        a("recaptcha_image").appendChild(document.createTextNode(b));
    },
    reloaderror: function(a) {
        Recaptcha._displayerror(a);
    },
    _is_ie: function() {
        return navigator.userAgent.indexOf("MSIE") > 0 && !window.opera;
    },
    _css_toggle: function(b, a, e) {
        var d = Recaptcha.widget;
        if (!d) d = document.body;
        var c = d.className;
        c = c.replace(new RegExp("(^|\\s+)" + b + "(\\s+|$)"), " ");
        c = c.replace(new RegExp("(^|\\s+)" + a + "(\\s+|$)"), " ");
        c += " " + (e ? b : a);
        CSS.setClass(d, c);
    },
    playAgain: function() {
        var a = Recaptcha.$;
        a("recaptcha_image").innerHTML = Recaptcha.getAudioCaptchaHtml();
    },
    getAudioCaptchaHtml: function() {
        var b = Recaptcha;
        var c = RecaptchaState;
        var a = Recaptcha.$;
        var f = c.server + "image?c=" + c.challenge;
        if (f.indexOf("https://") == 0) f = "http://" + f.substring(8);
        var g = c.server + "/img/audiocaptcha.swf?v2";
        var e;
        if (b._is_ie()) {
            e = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" id="audiocaptcha" width="0" height="0" codebase="https://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab"><param name="movie" value="' + g + '" /><param name="quality" value="high" /><param name="bgcolor" value="#869ca7" /><param name="allowScriptAccess" value="always" /></object><br/>';
        } else e = '<embed src="' + g + '" quality="high" bgcolor="#869ca7" width="0" height="0" name="audiocaptcha" align="middle" play="true" loop="false" quality="high" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://get.adobe.com/flashplayer" url="' + g + '"></embed> ';
        var d = (Recaptcha.checkFlashVer() ? '<br/><a class="recaptcha_audio_cant_hear_link" href="#" onclick="Recaptcha.playAgain(); return false;">' + _tx("Lire de nouveau") + "</a>" : "") + '<br/><a class="recaptcha_audio_cant_hear_link" target="_blank" href="' + f + '">' + _tx("Vous n’entendez rien ?") + "</a>";
        return e + d;
    },
    gethttpwavurl: function() {
        var a = RecaptchaState;
        if (Recaptcha.type == "audio") {
            var b = a.server + "image?c=" + a.challenge;
            if (b.indexOf("https://") == 0) b = "http://" + b.substring(8);
            return b;
        }
        return "";
    },
    checkFlashVer: function() {
        var e = navigator.appVersion.indexOf("MSIE") != -1 ? true : false;
        var g = navigator.appVersion.toLowerCase().indexOf("win") != -1 ? true : false;
        var f = navigator.userAgent.indexOf("Opera") != -1 ? true : false;
        var d = -1;
        if (navigator.plugins != null && navigator.plugins.length > 0) {
            if (navigator.plugins["Shockwave Flash 2.0"] || navigator.plugins["Shockwave Flash"]) {
                var h = navigator.plugins["Shockwave Flash 2.0"] ? " 2.0" : "";
                var c = navigator.plugins["Shockwave Flash" + h].description;
                var a = c.split(" ");
                var i = a[2].split(".");
                d = i[0];
            }
        } else if (e && g && !f) try {
            var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
            var flashVerStr = axo.GetVariable("$version");
            d = flashVerStr.split(" ")[1].split(",")[0];
        } catch (b) {}
        return d >= 9;
    },
    getlang: function() {
        return Env.recaptcha_lang;
    }
};

function captcha_whatsthis(a) {
    var b = "<a onclick=\"window.open('http://www.google.com/recaptcha/help','recaptcha_popup','width=460,height=570,location=no,menubar=no,status=no,toolbar=no,scrollbars=yes,resizable=yes')\">" + "ReCaptcha</a>";
    (new ContextualDialog).setContext(a).setTitle(_tx("Vérification de sécurité")).setBody('<div class="captcha_popup" style="padding: 5px;">' + _tx("Il s’agit d’une procédure de sécurité standard que nous utilisons pour empêcher la création de faux comptes pour envoyer des messages indésirables aux utilisateurs.") + "<br/><br/>" + _tx("Nos captchas sont fournis par {provider_link}.", {
        provider_link: b
    }) + "</div>").setButtons(Dialog.OK).show();
}

(function() {
    var a = "facebook.desktopplugin";
    FbDesktopDetect = {
        mimeType: "application/x-facebook-desktop-1",
        isPluginInstalled: function() {
            var f = null;
            if (window.ActiveXObject) {
                try {
                    f = new ActiveXObject(a);
                    if (f) return true;
                } catch (b) {}
            } else if (navigator.plugins) {
                navigator.plugins.refresh(false);
                for (var c = 0, d = navigator.plugins.length; c < d; c++) {
                    f = navigator.plugins[c];
                    var e = f[0];
                    if (e && e.type === this.mimeType) return true;
                }
            }
            return false;
        }
    };
})();

(function() {
    FbDesktopPlugin = {
        getPlugin: function() {
            if (!this._plugin) if (FbDesktopDetect.isPluginInstalled()) {
                var a = DOM.create("div");
                document.body.appendChild(a);
                DOM.setContent(a, HTML('<object id="kiwi_plugin" ' + 'type="' + FbDesktopDetect.mimeType + '" width="0" height="0">' + "</object>"));
                this._plugin = $("kiwi_plugin");
            }
            return this._plugin;
        },
        logout: function(b) {
            b = b || "0";
            var a = this.getPlugin();
            if (a) a.logout(b);
        },
        transferAuthToken: function(b) {
            if (b && b.length > 0) {
                var a = this.getPlugin();
                if (a) a.setAccessToken(b);
            }
        }
    };
})();

function intl_set_xmode(a) {
    (new AsyncRequest).setURI("/ajax/intl/save_xmode.php").setData({
        xmode: a
    }).setHandler(function() {
        document.location.reload();
    }).send();
}

function intl_set_cmode(a) {
    (new AsyncRequest).setURI("/ajax/intl/save_xmode.php").setData({
        cmode: a
    }).setHandler(function() {
        document.location.reload();
    }).send();
}

function intl_set_vmode(a) {
    (new AsyncRequest).setURI("/ajax/intl/save_xmode.php").setData({
        vmode: a
    }).setHandler(function() {
        document.location.reload();
    }).send();
}

function intl_set_amode(a) {
    (new AsyncRequest).setURI("/ajax/intl/save_xmode.php").setData({
        amode: a,
        app: false
    }).setHandler(function() {
        document.location.reload();
    }).send();
}

function intl_set_locale(c, d, b, a) {
    if (!b) var b = c.options[c.selectedIndex].value;
    intl_save_locale(b, true, null, d, a);
}

function intl_save_locale(b, d, c, e, a) {
    (new AsyncRequest).setURI("/ajax/intl/save_locale.php").setData({
        aloc: b,
        source: e,
        app_only: a
    }).setHandler(function(f) {
        if (d) {
            document.location.reload();
        } else goURI(c);
    }).send();
}

function intl_set_cookie_locale(a, b) {
    setCookie("locale", a, 7 * 24 * 36e5);
    goURI(b);
}

function FormTypeABTester(t) {
    var g = 16;
    var h = 32;
    var a = 65;
    var i = 90;
    var j = 48;
    var b = 57;
    var c = 58;
    var d = 63;
    var e = 91;
    var f = 94;
    var s = 0;
    var v = 0;
    var z = 0;
    var y = 0;
    var n = [];
    var o = null;
    var k = [];
    var r = [];
    var q = [];
    var p = [];
    for (var l = 0; l < 10; l++) {
        k.push(0);
        r.push(0);
    }
    for (var m = 0; m < 10; m++) {
        r.push(0);
        q.push(0);
        p.push(0);
    }
    var w = function(za) {
        var zd = window.event ? (new Date).getTime() : za.timeStamp;
        var zb = window.event ? window.event.keyCode : za.which;
        zb %= 128;
        if (zb >= a && zb <= i || zb == h) {
            s++;
        } else if (zb >= j && zb <= b) {
            v++;
        } else if (zb >= c && zb <= d || zb >= e && zb <= f) {
            z++;
        } else y++;
        n[zb] = zd;
        if (o) {
            var zc = zd - o;
            if (zc >= 0 && (zb >= a && zb <= i || zb == h)) if (zc < 400) {
                r[Math.floor(zc / 20)]++;
            } else if (zc < 1e3) {
                q[Math.floor((zc - 400) / 60)]++;
            } else if (zc < 3e3) p[Math.floor((zc - 1e3) / 200)]++;
        }
        o = zd;
    };
    var x = function(zb) {
        var zd = window.event ? (new Date).getTime() : zb.timeStamp;
        var zc = window.event ? window.event.keyCode : zb.which;
        var za = zd - n[zc % 128];
        if (za >= 50 && za < 250) k[Math.floor((za - 50) / 20)]++;
    };
    var u = function(za) {
        var zc = Math.max.apply(Math, za);
        var zb = [];
        za.each(function(zd) {
            zb.push(Math.floor(zd * 63 / (zc || 1)));
        });
        return zb;
    };
    this.getDataVect = function() {
        var za = r.concat(q, p);
        return u(za).concat(u(k), [ s / 2, v / 2, z / 2, y / 2 ]);
    };
    this.getData = function() {
        return Base64.encodeNums(this.getDataVect());
    };
    Event.listen(t, {
        keyup: x.bind(this),
        keydown: w.bind(this)
    });
}

function startFormTypeABTester(a) {
    a.ab_tester = new FormTypeABTester(document);
}

function setFormTypeABTest(a) {
    a.ab_test_data.value = a.ab_tester.getData();
    return true;
}

var RegistrationBootloader = function() {
    return {
        init: function(a, c, d, b, e) {
            this.confirmationNode = a;
            this.redirectConfirmation = c;
            this.regFormName = d;
            this.logFocusName = b;
            this.validationEndpoint = e;
            this.regForm = ge(d);
            if (this.regForm) {
                this.regForm.onclick = this.bootload.bind(this);
                this.regForm.onkeypress = this.bootload.bind(this);
            }
        },
        bootload: function(a, b) {
            if (this.regForm) {
                this.regForm.onclick = null;
                this.regForm.onkeypress = null;
            }
            Bootloader.loadComponents([ "registration" ], function() {
                Registration.getInstance().init(this.confirmationNode, this.redirectConfirmation, this.regFormName, this.logFocusName, this.validationEndpoint);
                if (b) Registration.getInstance().validateForm();
                Registration.getInstance().logFormFocus();
            }.bind(this));
        },
        bootloadAndValidate: function() {
            this.bootload(null, true);
        }
    };
}();

function useragent() {
    var b = {
        ffid: typeof Env.ffid == "undefined" ? 0 : Env.ffid,
        ffid1: typeof Env.ffid1 == "undefined" ? 0 : Env.ffid1,
        ffid2: typeof Env.ffid2 == "undefined" ? 0 : Env.ffid2,
        ffid3: typeof Env.ffid3 == "undefined" ? 0 : Env.ffid3,
        ffid4: typeof Env.ffid4 == "undefined" ? 0 : Env.ffid4
    };
    var e = "facebook";
    if (!(new RegExp("(^|\\.)" + e + "\\.com$", "i")).test(document.location.hostname)) {
        b.qp = document.location;
    } else {
        var d = ge("login_form");
        if (d && d.action) {
            var g = d.action.split("?")[0].split("#")[0];
            var a = 65535;
            for (var c = 0; c < g.length; c++) {
                var h = (a >> 8 ^ g.charCodeAt(c)) & 255;
                h ^= h >> 4;
                a = (a << 8 ^ h << 12 ^ h << 5 ^ h) & 65535;
            }
            if (Env.ffver && Env.ffver != a) b.qm = d.action;
        }
    }
    if (b.qp || b.qm) {
        var f = document.location.protocol + "//www." + e + ".com/ajax/ua_callback.php";
        if (document.referrer) b.qr1 = document.referrer;
        Bootloader.loadComponents("async-signal", function() {
            (new AsyncSignal(f, b)).send();
        });
    }
}