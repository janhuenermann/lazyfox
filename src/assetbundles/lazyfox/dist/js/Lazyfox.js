function debounce(func) {
  var timeout, timestamp;
  var wait = 99;

  var run = function run() {
    timeout = null;
    func();
  };

  var later = function later() {
    var last = Date.now() - timestamp;

    if (last < wait) {
      setTimeout(later, wait - last);
    } else {
      (requestIdleCallback || run)(run);
    }
  };

  return function () {
    timestamp = Date.now();

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

            _this.update(el, width);
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
var lazyfox = {
  autoSize: new autoSize()
};

function init(image) {
  image._lazyfox = true;
}

function present(image) {
  if (image.dataset.sizes == "auto") {
    lazyfox.autoSize.add(image);
  }

  image.srcset = image.dataset.srcset;
  image.src = image.dataset.src;
  delete image.dataset.srcset;
  delete image.dataset.src;

  function afterPresent() {
    image.parentNode.classList.remove("--not-loaded");
    setTimeout(function () {
      var placeholder = image.parentNode.querySelector(".--placeholder");
      placeholder.parentNode.removeChild(placeholder);
    }, 500);
    image.removeEventListener('load', afterPresent);
  }

  image.addEventListener('load', afterPresent, {
    once: true
  });
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
        if (images[i]._lazyfox) continue;
        observer.observe(images[i]._lazyfox);
      }
    }));
  }
}

document.addEventListener("DOMContentLoaded", kickstartLazyFox);
