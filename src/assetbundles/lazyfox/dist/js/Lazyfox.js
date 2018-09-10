function debounce(fn) {
  var active = false;
  return function () {
    if (active === false) {
      active = true;
      setTimeout(function () {
        fn();
        active = false;
      }, 200);
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

var _class = function () {
  function _class(elements, init, callback) {
    var _this = this;

    _classCallCheck(this, _class);

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

  _createClass(_class, [{
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
      return window.IntersectionObserver !== undefined;
    }
  }]);

  return _class;
}();

var _class$1 = function () {
  function _class(elements, init, callback) {
    var _this = this;

    _classCallCheck(this, _class);

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

  _createClass(_class, [{
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

  return _class;
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

function initImage(image) {
  image._lazyfox = true;
}

function loadImage(image) {
  image.srcset = image.dataset.srcset;
  image.src = image.dataset.src;
  delete image.dataset.srcset;
  delete image.dataset.src;

  function afterLoadImage() {
    image.parentNode.classList.remove("--not-loaded");
    setTimeout(function () {
      var placeholder = image.parentNode.querySelector(".--placeholder");
      placeholder.parentNode.removeChild(placeholder);
    }, 500);
    image.removeEventListener('load', afterLoadImage);
  }

  image.addEventListener('load', afterLoadImage, {
    once: true
  });
}

function kickstartLazyFox() {
  var images = document.querySelectorAll(".lazyfox img[data-src]");
  var imagesArr = [].slice.call(images);
  var observer = null;

  if (_class.isSupported()) {
    observer = new _class(imagesArr, initImage, loadImage);
  } else {
    observer = new _class$1(imagesArr, initImage, loadImage);
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
