export function debounce(func) {
	var timeout, timestamp;
	var wait = 99;
	var run = function(){
		timeout = null;
		func();
	};

	var later = function() {
		var last = Date.now() - timestamp;
		if (last < wait) {
			setTimeout(later, wait - last);
		} else {
			(window.requestIdleCallback || run)(run);
		}
	};

	return function() {
		timestamp = Date.now();

		if (!timeout) {
			timeout = setTimeout(later, wait);
		}
	};
};