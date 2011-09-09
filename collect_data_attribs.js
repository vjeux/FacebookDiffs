if (window.CavalryLogger) {
    CavalryLogger.start_js([ "uKqhc" ]);
}

function collect_data_attribs(e, i) {
    var g = {};
    var d = {};
    var h = i.length;
    var f;
    for (f = 0; f < h; ++f) {
        g[i[f]] = {};
        d[i[f]] = "data-" + i[f];
    }
    while (e) {
        if (e.getAttribute) for (f = 0; f < h; ++f) {
            var c = e.getAttribute(d[i[f]]);
            if (c) {
                var b = JSON.parse(c);
                for (var a in b) if (g[i[f]][a] === undefined) g[i[f]][a] = b[a];
            }
        }
        e = e.parentNode;
    }
    return g;
}

function collect_data_attrib(a, b) {
    return collect_data_attribs(a, [ b ])[b];
}

if (window.Bootloader) {
    Bootloader.done([ "uKqhc" ]);
}