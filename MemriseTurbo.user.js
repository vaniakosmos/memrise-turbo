// ==UserScript==
// @name           Memrise Turbo
// @namespace      https://github.com/vaniakosmos
// @description    Makes Memrise faster
// @match          http://www.memrise.com/course/*/garden/*
// @match          http://www.memrise.com/garden/water/*
// @match          http://www.memrise.com/garden/review/*
// @version        0.1
// @updateURL      https://github.com/vaniakosmos/memrise-turbo/raw/master/MemriseTurbo.user.js
// @downloadURL    https://github.com/vaniakosmos/memrise-turbo/raw/master/MemriseTurbo.user.js
// @grant          none
// ==/UserScript==

var USE_TURBO = true;
var AUTO_MEME_CHOOSE = true;
var PLAY_FULL_AUDIO = true;
var DISABLE_PAUSE = true;
var DISABLE_TIMER = true;
var DISABLE_EXIT_PREVENT = true;


if (AUTO_MEME_CHOOSE) {
    var oldstart = MEMRISE.garden.feedback.start;
    MEMRISE.garden.feedback.start = function (){
        if (MEMRISE.garden.box.state === 'choosing-mem') {
            oldstart(1);
        }else{
            MEMRISE.garden.box.next_press();
        }
    };
}

if (USE_TURBO) {
    $('body').on('input', function(e) {
        try {
            if ($(e.target).is('input')) {
                var g = MEMRISE.garden;
                var b = g.box;
                var s = g.scoring.score_response(
                    b.$input.val(), b.thing, b.column_a, b.column_b);
                if (s === 1) {
                    MEMRISE.garden.box.check();
                }
            }
        } catch (err) {
            console.log('error - falling back to default behavior', err);
        }
    });
}

if (PLAY_FULL_AUDIO) {
    MEMRISE.audioPlayer.stop = $.noop;
    MEMRISE.audioPlayer.stopAfter = $.noop;
}

if (DISABLE_PAUSE) {
    MEMRISE.garden.pause = $.noop;
}

if (DISABLE_TIMER) {
    $("div.garden-timer div.txt").bind("DOMSubtreeModified", function() {
        MEMRISE.garden.timer.cancel();
    });
}

if (DISABLE_EXIT_PREVENT) {
    MEMRISE.garden.prevent_accidental_unloading = $.noop;
}
