if (window.CavalryLogger) {
    CavalryLogger.start_js([ "ZQXFg" ]);
}

var Registration = function() {
    return {
        captchaPaneShown: false,
        errorField: null,
        loggingEndpoint: "/ajax/register/logging.php",
        hasLoggedFocused: false,
        init: function(a, c, d, b, e) {
            this.confirmationNode = a;
            this.regFormName = d;
            this.logFocusName = b;
            this.validationEndpoint = e;
            this.tosContainerNode = $("tos_container");
            this.regPagesMsgNode = $("reg_pages_msg");
            this.captchaButtonsNode = ge("captcha_buttons");
        },
        validateForm: function() {
            var a = Form.serialize($(this.regFormName));
            if (!this.captchaPaneShown) a.ignore = "captcha|pc";
            if (this.errorField && ge(this.errorField)) $(this.errorField).setAttribute("title", "");
            show("async_status");
            show("captcha_async_status");
            (new AsyncRequest).setOption("jsonp", true).setURI(this.validationEndpoint).setData(a).setReadOnly(true).setHandler(this.handleResponse.bind(this)).send();
        },
        handleResponse: function(a) {
            hide("async_status");
            hide("captcha_async_status");
            var b = a.getPayload();
            if (b.redirect) {
                show("captcha_async_status");
                goURI(b.redirect);
            } else if (b.field_validation_succeeded) {
                this.handleFieldValidationSucceeded(b);
            } else if (b.bad_captcha) {
                this.handleBadCaptcha(b);
            } else if (b.need_pc) {
                this.handleNeedPC(b);
            } else if (b.tooyoung) {
                this.handleTooYoung(b);
            } else if (b.registration_succeeded) {
                this.handleRegistrationSucceeded(b);
            } else this.handleValidationError(b);
        },
        handleValidationError: function(a) {
            this.showValidationError(a.field, a.error);
        },
        handleRegistrationSucceeded: function(c) {
            var b = $("confirmation_email_form");
            var a = $("confirmation_email");
            a.value = c.email;
            b.submit();
        },
        handleBadCaptcha: function(a) {
            DOM.setContent($("outer_captcha_box"), HTML(a.html));
            this.showCaptchaPane();
            this.showValidationError("captcha_response", a.error);
        },
        handleNeedPC: function(a) {
            DOM.setContent($("outer_captcha_box"), HTML(a.html));
            this.showCaptchaPane();
            this.showValidationError("pc", a.error);
        },
        handleFieldValidationSucceeded: function(a) {
            this.hideValidationError();
            this.showCaptchaPane();
            if (a.show_captcha_interstitial) RegistrationInterstitialCaptcha.show();
        },
        handleTooYoung: function(a) {
            DOM.setContent($(this.confirmationNode), HTML(a.html));
        },
        showCaptchaPane: function() {
            hide("reg_form_box");
            if (RegUtil.captcha_class == "ReCaptchaCaptcha" || RegUtil.captcha_class == "JPPhoneCaptcha") create_captcha(RegUtil.recaptcha_public_key);
            show("reg_captcha");
            CSS.show(this.tosContainerNode);
            hide(this.regPagesMsgNode);
            show(this.captchaButtonsNode);
            try {
                ge("captcha_response").focus();
            } catch (a) {}
            this.captchaPaneShown = true;
        },
        hideCaptcha: function() {
            hide("reg_captcha");
            CSS.hide(this.tosContainerNode);
            hide(this.captchaButtonsNode);
            this.hideValidationError();
            this.captchaPaneShown = false;
        },
        showValidationError: function(a, c) {
            CSS.hide(this.regPagesMsgNode);
            this.hideValidationError();
            var d = $("reg_error");
            var e = $("reg_error_inner");
            if (!a) a = ge("name") ? "name" : "firstname";
            this.errorField = a;
            try {
                $(a).setAttribute("title", c);
                $(a).focus();
            } catch (b) {}
            DOM.setContent(e, HTML(c));
            CSS.setStyle(d, "opacity", 0);
            animation(d).show().to("height", "auto").duration(100).checkpoint().from("opacity", 0).to("opacity", 1).duration(400).go();
        },
        hideValidationError: function() {
            if (CSS.shown($("reg_error")) && CSS.getOpacity($("reg_error")) > 0) CSS.hide($("reg_error"));
        },
        showRegistrationPane: function() {
            show("reg_form_box");
            show(this.regPagesMsgNode);
        },
        logFormFocus: function() {
            if (this.hasLoggedFocused) return;
            this.logAction(this.logFocusName);
            this.hasLoggedFocused = true;
        },
        logAction: function(a) {
            var c = "";
            if (ge("reg_instance")) c = $("reg_instance").value;
            var b = {
                action: a,
                reg_instance: c
            };
            (new AsyncSignal(this.loggingEndpoint, b)).send();
        },
        hide_captcha: function() {
            this.hideCaptcha();
        },
        show_reg_form: function() {
            this.showRegistrationPane();
        },
        getInstance: function() {
            return this;
        }
    };
}();