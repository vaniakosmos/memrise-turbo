// ==UserScript==
// @name           Memrise Turbo
// @namespace      https://github.com/vaniakosmos
// @description    Makes Memrise faster
// @match          https://www.memrise.com/course/*/garden/*
// @match          https://www.memrise.com/garden/water/*
// @match          https://www.memrise.com/garden/review/*
// @version        0.2
// @updateURL      https://github.com/vaniakosmos/memrise-turbo/raw/master/MemriseTurbo.user.js
// @downloadURL    https://github.com/vaniakosmos/memrise-turbo/raw/master/MemriseTurbo.user.js
// @grant          none
// ==/UserScript==


$(function() {
    const localStorageIdentifier = "memrise-turbo";
    const localStorageObject = JSON.parse(localStorage.getItem(localStorageIdentifier)) || {};

    const option = {
        use_turbo: true,
        auto_meme_choose: true,
        play_full_audio: true,
        disable_pause: true,
        disable_timer: true,
        disable_exit_prevent: true,
        focus_review_btn: true
    };

    const $body = $('body');

    $body.append(`<div class="modal fade" id="turbo-modal" tabindex="-1" role="dialog">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <button type="button" class="close" data-dismiss="modal"><span>×</span></button>
                                <h1 class="modal-title" id="all-typing-modal-label">MTurbo Settings</h1>
                            </div>
                            <div class="modal-body">
                                <div>
                                    <input class="turbo-setting" id="include-turbo" type="checkbox">
                                    <label for="include-turbo">Use Turbo</label>
                                    <em style="font-size:85%">Immediately switch to the next item after typing current item correctly</em>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`);

    $('#left-area').append('<a data-toggle="modal" data-target="#turbo-modal">Memrise Turbo Settings</a>');

    $('#turbo-modal').on('shown.bs.modal', function() {
        $(document).off('focusin.modal'); //enable focus events on modal
    });

    $('.turbo-setting')
        .prop('checked', function(){ return localStorageObject[$(this).attr('id')] !== false; }) //all options true by default
        .css({
            "vertical-align": "top",
            "float": "left",
            "margin-right": "5px"
        })
        .change(function(e){
            localStorageObject[e.target.id] = $(this).is(':checked');
            localStorage.setItem(localStorageIdentifier, JSON.stringify(localStorageObject));
            console.log(localStorageObject);
        });

    MEMRISE.garden.boxes.load = (function() {
        const cached_function = MEMRISE.garden.boxes.load;
        return function() {
            return cached_function.apply(this, arguments);
        };
    }());

    if (option.auto_meme_choose) {
        const oldstart = MEMRISE.garden.feedback.start;
        MEMRISE.garden.feedback.start = function (){
            if (MEMRISE.garden.box.state === 'choosing-mem') {
                oldstart(1);
            }else{
                MEMRISE.garden.box.next_press();
            }
        };
    }

    if (option.use_turbo) {
        $body.on('input', function(e) {
            try {
                if ($(e.target).is('input')) {
                    const g = MEMRISE.garden;
                    const b = g.box;
                    const s = g.scoring.score_response(
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

    if (option.play_full_audio) {
        MEMRISE.audioPlayer.stop = $.noop;
        MEMRISE.audioPlayer.stopAfter = $.noop;
    }

    if (option.disable_pause) {
        MEMRISE.garden.pause = $.noop;
    }

    if (option.disable_timer) {
        $("div.garden-timer div.txt").bind("DOMSubtreeModified", function() {
            MEMRISE.garden.timer.cancel();
        });
    }

    if (option.disable_exit_prevent) {
        MEMRISE.garden.prevent_accidental_unloading = $.noop;
    }

    if (option.focus_review_btn) {
        $body.bind("DOMSubtreeModified",function(){
            $('.review_btn').focus();
        });
    }
});
