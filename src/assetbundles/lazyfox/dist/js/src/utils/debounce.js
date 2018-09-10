// http://modernjavascript.blogspot.de/2013/08/building-better-debounce.html
export function debounce(func) {
    // we need to save these in the closure
    var timeout, context, timestamp;
    var wait = 100;

    var exec = function() {
        timeout = null;
        func.call(context);
    };

    // this is where the magic happens
    var later = function() {
        // how long ago was the last call
        var last = (new Date()) - timestamp;

        // if the latest call was less that the wait period ago
        // then we reset the timeout to wait for the difference
        if (last < wait) {
            timeout = setTimeout(later, wait - last);
            // or if not we can null out the timer and run the latest
        } else {
        	if (window.requestIdleCallback) window.requestIdleCallback(exec);
            else exec();
        }
    };

    return function () {
        // save details of latest call
        context = this;
        timestamp = new Date();

        // we only need to set the timer now if one isn't already running
        if (!timeout) {
            timeout = setTimeout(later, wait);
        }
    }
}