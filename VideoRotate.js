if (window.CavalryLogger) {
    CavalryLogger.start_js([ "p41+w" ]);
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