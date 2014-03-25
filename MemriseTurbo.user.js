// ==UserScript==
// @name           Memrise Turbo
// @description    Makes Memrise faster
// @match          http://www.memrise.com/course/*/garden/*
// @match          http://www.memrise.com/garden/water/*
// @version        0.0.1
// @updateURL      
// @downloadURL    
// @grant          none
// ==/UserScript==

var onLoad = function($) {
	var get_question = function() {
		return $('.qquestion')[0].childNodes[0].nodeValue.trim();
	};

	var things, thingusers;
	var get_things = function() {
		if (things === undefined) {
			things     = MEMRISE.garden.things;
			thingusers = MEMRISE.garden.thingusers._list;
		}
	};

	MEMRISE.garden.feedback.start = function (){ MEMRISE.garden.box.next_press(); };

	var get_thinguser = function(id) {
		return thingusers.filter(function(e) {
			return e.thing_id === id;
		})[0];
	};

	var get_thing_by_q = function(str) {
		get_things();

		for (var id in things) {
			var thing = things[id];
			var thinguser = get_thinguser(thing.id);
			if (thinguser) {
				// Get the 'question' for the current `thing` based on the
				// column_b from `thinguser` for this particular `thing.
				// Compare the `question` with the given question str and if
				// they match, we can pick the current `thing`.
				//
				// Sometimes the 'question' seems to have trailing
				// whitespace, perhaps because they are written by users who
				// may accidentally put spaces in the end
				var question = thing.columns[thinguser.column_b].val;
				if ($.trim(question) === $.trim(str)) {
					return {
						answer   : thing.columns[thinguser.column_a].val,
						question : thing.columns[thinguser.column_b].val
					};
				}
			}
		}
	};

	var levenshtein = MEMRISE.garden.scoring.levenshtein;

	var compare = function(a, b) {
		a = $.trim(a.toLowerCase());
		b = $.trim(b.toLowerCase());

		return levenshtein(a, b).distance;
	};

	var check_answer = function(input) {
		var q = get_question();

		var given    = $(input).val();
		var correct  = get_thing_by_q(q).answer;
		var dist = compare(given, correct);

		if (dist === 0) {
			return true;
		}

		return false;
	};

	var setup = function() {
		var handlers = [];
		var keydowns = $._data($('body').get(0), 'events').keydown;

		for (var i = keydowns.length - 1; i >= 0; i--){
			handlers.push(keydowns[i]);
		}

		var trigger = function(event) {
			if ($(event.target).is('textarea'))
				return;

			for (var i = handlers.length - 1; i >= 0; i--) {
				handlers[i].handler(event);
			}
		};

		$('body').on('keyup', function(e) {
			try {
				var copytyping = $('.garden-box').hasClass('copytyping');
				if (!copytyping && $(e.target).is('input')) {
					if (check_answer(e.target)) {
						MEMRISE.garden.box.check();
					}
				}

			} catch (err) {
				console.log('error - falling back to default behavior', err);
			}
		});
	};

	var ready = function(f) {
		$._data($('body').get(0), 'events') ? f() : setTimeout(ready, 9, f);
	};

	ready(setup);
};

var injectWithJQ = function(f) {
	var script = document.createElement('script');
	script.textContent = '$(' + f.toString() + '($));';
	document.body.appendChild(script);
};

injectWithJQ(onLoad);
