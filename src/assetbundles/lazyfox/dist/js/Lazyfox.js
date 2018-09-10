'use strict';

// http://modernjavascript.blogspot.de/2013/08/building-better-debounce.html
function debounce(func) {
  // we need to save these in the closure
  var timeout, context, timestamp;
  var wait = 100;

  var exec = function exec() {
    timeout = null;
    func.call(context);
  }; // this is where the magic happens


  var later = function later() {
    // how long ago was the last call
    var last = new Date() - timestamp; // if the latest call was less that the wait period ago
    // then we reset the timeout to wait for the difference

    if (last < wait) {
      timeout = setTimeout(later, wait - last); // or if not we can null out the timer and run the latest
    } else {
      if (window.requestIdleCallback) window.requestIdleCallback(exec);else exec();
    }
  };

  return function () {
    // save details of latest call
    context = this;
    timestamp = new Date(); // we only need to set the timer now if one isn't already running

    if (!timeout) {
      timeout = setTimeout(later, wait);
    }
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var _default =
/*#__PURE__*/
function () {
  function _default(elements, init, callback) {
    var _this = this;

    _classCallCheck(this, _default);

    this.callback = callback;
    this.init = init;
    this.observer = new IntersectionObserver(function (entries) {
      return _this.update(entries);
    }, {
      threshold: 0.0
    });

    for (var i = 0; i < elements.length; i++) {
      this.observe(elements[i]);
    }
  }

  _createClass(_default, [{
    key: "observe",
    value: function observe(el) {
      if (this.init) this.init(el);
      this.observer.observe(el);
    }
  }, {
    key: "update",
    value: function update(entries) {
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];

        if (entry.isIntersecting) {
          this.callback(entry.target);
          this.observer.unobserve(entry.target);
        }
      }
    }
  }], [{
    key: "isSupported",
    value: function isSupported() {
      return "IntersectionObserver" in window;
    }
  }]);

  return _default;
}();

var _default$1 =
/*#__PURE__*/
function () {
  function _default(elements, init, callback) {
    var _this = this;

    _classCallCheck(this, _default);

    this._elements = [];
    this._running = false;
    this.callback = callback;
    this.init = init;
    this.checker = debounce(function () {
      return _this.update();
    });

    for (var i = 0; i < elements.length; i++) {
      this.observe(elements[i]);
    }
  }

  _createClass(_default, [{
    key: "_startObserving",
    value: function _startObserving() {
      if (this._running) return;
      document.addEventListener("scroll", this.checker);
      window.addEventListener("resize", this.checker);
      window.addEventListener("orientationchange", this.checker);
      this.checker();
      this._running = true;
    }
  }, {
    key: "_stopObserving",
    value: function _stopObserving() {
      this._running = false;
      document.removeEventListener("scroll", this.checker);
      window.removeEventListener("resize", this.checker);
      window.removeEventListener("orientationchange", this.checker);
    }
  }, {
    key: "observe",
    value: function observe(element) {
      if (this.init) this.init(element);

      this._elements.push(element);

      if (this._elements.length === 1) {
        this._startObserving();
      }
    }
  }, {
    key: "update",
    value: function update() {
      var _this2 = this;

      this._elements = this._elements.filter(function (el) {
        if (el.getBoundingClientRect().top <= window.innerHeight && el.getBoundingClientRect().bottom >= 0 && getComputedStyle(el).display !== "none") {
          _this2.callback(el);

          return false;
        }

        return true;
      }); // clean-up

      if (this._elements.length === 0) {
        this._stopObserving();
      }
    }
  }]);

  return _default;
}();

var autoSize =
/*#__PURE__*/
function () {
  function autoSize() {
    var _this = this;

    _classCallCheck(this, autoSize);

    if ("ResizeObserver" in window) {
      // This is great news!
      this.resizeObserver = new ResizeObserver(function (entries) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = entries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var entry = _step.value;
            var width = entry.contentRect.width;
            var el = entry.target;
            el.autoSizeUpdate(width);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      });
    } else {
      var debouncedResize = debounce(function () {
        return _this.resize();
      });
      window.addEventListener("resize", debouncedResize);
    }

    this.elements = [];
  }

  _createClass(autoSize, [{
    key: "add",
    value: function add(el) {
      var sources = [el];

      if (el.parentNode.tagName == "picture") {
        sources = sources.concat(el.getElementsByTagName("source"));
      }

      el._imageSources = sources; // initial set

      this.update(el);

      if (this.resizeObserver) {
        this.resizeObserver.observe(el);
      }

      this.elements.push(el);
      el.autoSizeUpdate = debounce(this.update.bind(this, el));
    }
  }, {
    key: "update",
    value: function update(el, width) {
      width = width || autoSize.getOffsetWidth(el);

      for (var i = 0; i < el._imageSources.length; i++) {
        el._imageSources[i].setAttribute("sizes", width + "px");
      }
    }
  }, {
    key: "resize",
    value: function resize() {
      for (var i = 0; i < this.elements.length; i++) {
        this.update(this.elements[i]);
      }
    } // Traverses up the DOM until it finds a reasonable sized element.

  }], [{
    key: "getOffsetWidth",
    value: function getOffsetWidth(el) {
      var width;

      do {
        width = el.offsetWidth;
        el = el.parentNode;
      } while (width < 10 && el);

      return width;
    }
  }]);

  return autoSize;
}();

/*
    StackBlur - a fast almost Gaussian Blur For Canvas

    Version:     0.5
    Author:        Mario Klingemann
    Contact:     mario@quasimondo.com
    Website:    http://www.quasimondo.com/StackBlurForCanvas
    Twitter:    @quasimondo

    In case you find this class useful - especially in commercial projects -
    I am not totally unhappy for a small donation to my PayPal account
    mario@quasimondo.de

    Or support me on flattr:
    https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript

    Copyright (c) 2010 Mario Klingemann

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.
    */

var radius = 20;
var scale = 10;
function activate(lf) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  lf.container.insertBefore(canvas, lf.placeholder.nextSibling);
  var w = lf.placeholder.naturalWidth;
  var h = lf.placeholder.naturalHeight;
  canvas.width = w * scale;
  canvas.height = h * scale;
  ctx.drawImage(lf.placeholder, 0, 0, canvas.width, canvas.height);
  undefined(canvas, 0, 0, canvas.width, canvas.height, radius);
}

var lazyfox =
/*#__PURE__*/
function () {
  function lazyfox(el) {
    _classCallCheck(this, lazyfox);

    this.container = el.parentNode;
    this.placeholder = this.container.querySelector('.--placeholder');
    this.type = this.container.dataset.type;
    this.image = el;
    this.sizer = this.container.querySelector(".--sizer");
    this.done = false;
    el._lf = el.lazyfox = this;
  }

  _createClass(lazyfox, [{
    key: "activate",
    value: function activate$$1(autoSize) {
      this.container.classList.add('--activated');
      this.autoSize = autoSize;

      switch (this.type) {
        case 'blurred':
          activate(this);
          break;

        default:
          break;
      }
    }
  }, {
    key: "present",
    value: function present() {
      var _this = this;

      if (this.image.dataset.sizes == "auto") {
        this.autoSize.add(this.image);
        delete this.image.dataset.sizes;
      } else {
        this.image.sizes = this.image.dataset.sizes;
        delete this.image.dataset.sizes;
      }

      this.image.srcset = this.image.dataset.srcset;
      this.image.src = this.image.dataset.src;
      delete this.image.dataset.srcset;
      delete this.image.dataset.src;
      this.image.addEventListener('load', function () {
        return _this.cleanup();
      }, {
        once: true
      });
    }
  }, {
    key: "cleanup",
    value: function cleanup() {
      var _this2 = this;

      if (this.done) return;
      this.container.classList.remove("--not-loaded");
      setTimeout(function () {
        _this2.container.removeChild(_this2.placeholder);

        _this2.container.classList.remove('--sized');

        _this2.container.classList.remove('--activated');

        _this2.container.removeChild(_this2.sizer);
      }, 500);
      this.done = true;
    }
  }]);

  return lazyfox;
}();

/**
 * lazyfox plugin for Craft CMS
 *
 * lazyfox JS
 *
 * @author    Jan Hünermann
 * @copyright Copyright (c) 2018 Jan Hünermann
 * @link      janhuenermann.com
 * @package   Lazyfox
 * @since     0.0.1
 */
var autoSizeInst = new autoSize();

function init(image) {
  image._lf = new lazyfox(image);

  image._lf.activate(autoSizeInst);
}

function present(image) {
  image._lf.present();
}

function kickstartLazyFox() {
  var images = document.querySelectorAll(".lazyfox img[data-src]");
  var imagesArr = [].slice.call(images);
  var observer = null;

  if (_default.isSupported()) {
    observer = new _default(imagesArr, init, present);
  } else {
    observer = new _default$1(imagesArr, init, present);
  }

  if (window.MutationObserver) {
    new window.MutationObserver(debounce(function () {
      for (var i = 0; i < images.length; i++) {
        // skip already observed images
        if (images[i]._lf) continue;
        observer.observe(images[i]);
      }
    }));
  }
}

document.addEventListener("DOMContentLoaded", kickstartLazyFox);
