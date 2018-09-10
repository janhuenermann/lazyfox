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
var mul_table = [512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];
var shg_table = [9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];

function getImageDataFromCanvas(canvas, top_x, top_y, width, height) {
  if (typeof canvas == 'string') var canvas = document.getElementById(canvas);else if (typeof HTMLCanvasElement !== 'undefined' && !canvas instanceof HTMLCanvasElement) return;
  var context = canvas.getContext('2d');
  var imageData;

  try {
    try {
      imageData = context.getImageData(top_x, top_y, width, height);
    } catch (e) {
      throw new Error("unable to access local image data: " + e);
      return;
    }
  } catch (e) {
    throw new Error("unable to access image data: " + e);
  }

  return imageData;
}
function processCanvasRGB(canvas, top_x, top_y, width, height, radius) {
  if (isNaN(radius) || radius < 1) return;
  radius |= 0;
  var imageData = getImageDataFromCanvas(canvas, top_x, top_y, width, height);
  imageData = processImageDataRGB(imageData, top_x, top_y, width, height, radius);
  canvas.getContext('2d').putImageData(imageData, top_x, top_y);
}
function processImageDataRGB(imageData, top_x, top_y, width, height, radius) {
  var pixels = imageData.data;
  var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, r_out_sum, g_out_sum, b_out_sum, r_in_sum, g_in_sum, b_in_sum, pr, pg, pb, rbs;
  var div = radius + radius + 1;
  var widthMinus1 = width - 1;
  var heightMinus1 = height - 1;
  var radiusPlus1 = radius + 1;
  var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
  var stackStart = new BlurStack();
  var stack = stackStart;

  for (i = 1; i < div; i++) {
    stack = stack.next = new BlurStack();
    if (i == radiusPlus1) var stackEnd = stack;
  }

  stack.next = stackStart;
  var stackIn = null;
  var stackOut = null;
  yw = yi = 0;
  var mul_sum = mul_table[radius];
  var shg_sum = shg_table[radius];

  for (y = 0; y < height; y++) {
    r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;
    r_out_sum = radiusPlus1 * (pr = pixels[yi]);
    g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
    b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
    r_sum += sumFactor * pr;
    g_sum += sumFactor * pg;
    b_sum += sumFactor * pb;
    stack = stackStart;

    for (i = 0; i < radiusPlus1; i++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack = stack.next;
    }

    for (i = 1; i < radiusPlus1; i++) {
      p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
      r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
      g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
      b_sum += (stack.b = pb = pixels[p + 2]) * rbs;
      r_in_sum += pr;
      g_in_sum += pg;
      b_in_sum += pb;
      stack = stack.next;
    }

    stackIn = stackStart;
    stackOut = stackEnd;

    for (x = 0; x < width; x++) {
      pixels[yi] = r_sum * mul_sum >> shg_sum;
      pixels[yi + 1] = g_sum * mul_sum >> shg_sum;
      pixels[yi + 2] = b_sum * mul_sum >> shg_sum;
      r_sum -= r_out_sum;
      g_sum -= g_out_sum;
      b_sum -= b_out_sum;
      r_out_sum -= stackIn.r;
      g_out_sum -= stackIn.g;
      b_out_sum -= stackIn.b;
      p = yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1) << 2;
      r_in_sum += stackIn.r = pixels[p];
      g_in_sum += stackIn.g = pixels[p + 1];
      b_in_sum += stackIn.b = pixels[p + 2];
      r_sum += r_in_sum;
      g_sum += g_in_sum;
      b_sum += b_in_sum;
      stackIn = stackIn.next;
      r_out_sum += pr = stackOut.r;
      g_out_sum += pg = stackOut.g;
      b_out_sum += pb = stackOut.b;
      r_in_sum -= pr;
      g_in_sum -= pg;
      b_in_sum -= pb;
      stackOut = stackOut.next;
      yi += 4;
    }

    yw += width;
  }

  for (x = 0; x < width; x++) {
    g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;
    yi = x << 2;
    r_out_sum = radiusPlus1 * (pr = pixels[yi]);
    g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
    b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
    r_sum += sumFactor * pr;
    g_sum += sumFactor * pg;
    b_sum += sumFactor * pb;
    stack = stackStart;

    for (i = 0; i < radiusPlus1; i++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack = stack.next;
    }

    yp = width;

    for (i = 1; i <= radius; i++) {
      yi = yp + x << 2;
      r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
      g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
      b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;
      r_in_sum += pr;
      g_in_sum += pg;
      b_in_sum += pb;
      stack = stack.next;

      if (i < heightMinus1) {
        yp += width;
      }
    }

    yi = x;
    stackIn = stackStart;
    stackOut = stackEnd;

    for (y = 0; y < height; y++) {
      p = yi << 2;
      pixels[p] = r_sum * mul_sum >> shg_sum;
      pixels[p + 1] = g_sum * mul_sum >> shg_sum;
      pixels[p + 2] = b_sum * mul_sum >> shg_sum;
      r_sum -= r_out_sum;
      g_sum -= g_out_sum;
      b_sum -= b_out_sum;
      r_out_sum -= stackIn.r;
      g_out_sum -= stackIn.g;
      b_out_sum -= stackIn.b;
      p = x + ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width << 2;
      r_sum += r_in_sum += stackIn.r = pixels[p];
      g_sum += g_in_sum += stackIn.g = pixels[p + 1];
      b_sum += b_in_sum += stackIn.b = pixels[p + 2];
      stackIn = stackIn.next;
      r_out_sum += pr = stackOut.r;
      g_out_sum += pg = stackOut.g;
      b_out_sum += pb = stackOut.b;
      r_in_sum -= pr;
      g_in_sum -= pg;
      b_in_sum -= pb;
      stackOut = stackOut.next;
      yi += width;
    }
  }

  return imageData;
}

function BlurStack() {
  this.r = 0;
  this.g = 0;
  this.b = 0;
  this.a = 0;
  this.next = null;
}

var radius = 20;
var scale = 10;
function activate(lf) {
  var canvas = document.createElement('canvas');
  canvas.classList.add('--placeholder');
  var ctx = canvas.getContext('2d');
  lf.container.insertBefore(canvas, lf.placeholder.nextSibling);
  var w = lf.placeholder.naturalWidth;
  var h = lf.placeholder.naturalHeight;
  canvas.width = w * scale;
  canvas.height = h * scale;
  ctx.drawImage(lf.placeholder, 0, 0, canvas.width, canvas.height);
  processCanvasRGB(canvas, 0, 0, canvas.width, canvas.height, radius);
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

        var canvas = _this2.container.getElementsByTag('canvas');

        for (var i = 0; i < canvas.length; i++) {
          _this2.container.removeChild(canvas[i]);
        }
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
