if (window.CavalryLogger) {
    CavalryLogger.start_js([ "/yWIv" ]);
}

function motion_spawn_delete_dialog(c, b) {
    var a = {
        v: c,
        delete_dialog: true
    };
    if (b) a.parent_oid = b;
    (new AsyncRequest).setURI("/ajax/motion.php").setData(a).setHandler(function(d) {
        dialog_data = d.getPayload();
        _motion_show_delete_dialog(c, dialog_data.preview_content, dialog_data.success_content, b);
    }).send();
}

function _motion_show_delete_dialog(e, a, d, c) {
    var b = (new Dialog).setTitle(a.title).setBody(a.html).setButtons([ Dialog.newButton(a.verb.toLowerCase(), a.verb, "", function() {
        _motion_delete_video(e, d, c);
    }), Dialog.CANCEL ]).show();
}

function _motion_delete_video(d, c, b) {
    var a = {
        delete_video: true,
        v: d
    };
    if (b) a.parent_oid = b;
    (new AsyncRequest).setURI("/ajax/motion.php").setData(a).setHandler(function(f) {
        var e = Dialog.getCurrent();
        if (e) e.hide();
        (new Dialog).setTitle(c.title).setBody(c.html).show();
        goURI.bind(null, c.url).defer(2e3);
    }).send();
}

function motion_show_profile_video_dialog(d, a, c) {
    var b = (new Dialog).setTitle(a.title).setBody(a.html).setButtons([ Dialog.newButton("make-profile-video", _tx("Faire de cette vidéo ma vidéo de profil"), "", function() {
        _motion_set_profile_video(d, c);
    }), Dialog.CANCEL ]).show();
}

function _motion_set_profile_video(b, a) {
    (new AsyncRequest).setURI("/ajax/motion.php").setData({
        profile_video: 1,
        v: b
    }).setHandler(function(c) {
        goURI("/video/video.php?profile&v=" + b);
        return true;
    }).send();
}

function video_send_email_when_processed(c, b) {
    var a = {
        action: "set_send_email",
        video_id: c,
        send_email: b ? 1 : 0
    };
    (new AsyncRequest).setURI("/ajax/motion_upload.php").setData(a).setHandler(function(d) {
        $("notification_status").innerHTML = d.getPayload();
    }).send();
}

var recorder_dialog;

function fvr_submit_video_handler(a, b) {
    video_id = b.video_id;
    video_category = b.video_category;
    oid = b.parent_oid;
    if (!video_id) goURI("/video/editvideo.php?error");
    if (video_category == 2) {
        (new AsyncRequest).setURI("/ajax/motion.php").setData({
            obj_attach: 1,
            v: video_id,
            parent_oid: oid
        }).setHandler(function(c) {
            goURI("/video/editvideo.php?created&v=" + video_id + "&oid=" + oid);
        }).send();
    } else goURI("/video/editvideo.php?album&created&v=" + video_id);
}

function fvr_add_video_msg_inputs(a, c) {
    video_id = c.video_id;
    if (inboxAttachments.is_active) {
        var b = ge(inboxAttachments.edit_id);
    } else var b = ge(wallAttachments.edit_id);
    if (b) if (ge("video_msg_id")) {
        $("video_msg_id").value = video_id;
    } else {
        var e = document.createElement("input");
        e.name = "attachment[params][0]";
        e.id = "video_msg_id";
        e.value = video_id;
        e.type = "hidden";
        var d = document.createElement("input");
        d.name = "attachment[type]";
        d.id = "video_msg_share_type";
        d.value = 15;
        d.type = "hidden";
        b.appendChild(e);
        b.appendChild(d);
    }
}

function fvr_remove_video_msg_inputs(a, c) {
    if (inboxAttachments.is_active) {
        var b = ge(inboxAttachments.edit_id);
    } else var b = ge(wallAttachments.edit_id);
    if (b) {
        var d = ge("video_msg_id");
        if (d) {
            b.removeChild(d);
            var e = ge("video_msg_share_type");
            if (e) b.removeChild(e);
        }
    }
}

function motion_show_embed_video_dialog(b) {
    var a = (new AsyncRequest).setURI("/ajax/video/embed.php").setData({
        v: b
    });
    (new Dialog).setClassName("video_embed_dialog").setAsync(a).show();
}

function VideoRotate(b, a) {
    this.videoFbid = b;
    this.container = a;
    this.rotateButton = DOM.find(this.container, "span.rotateButtonActions");
    this.rotateMessage = DOM.find(this.container, "span.rotateWait");
}

copy_properties(VideoRotate.prototype, {
    motionRotate: function(a) {
        (new AsyncRequest).setURI("/ajax/motion.php").setData({
            v: this.videoFbid,
            rotate: a
        }).setFinallyHandler(function(b) {
            this.rotateMessage.style.display = "none";
            this.rotateButton.style.display = "";
        }.bind(this)).send();
        this.rotateButton.style.display = "none";
        this.rotateMessage.style.display = "";
    }
});