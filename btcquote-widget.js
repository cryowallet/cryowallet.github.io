@@ -0,0 +1,817 @@
/*! BTCQuote 0.1.0 */
var BTCQuote = function () {
	var self = this;

	self._dataNames = ['last', 'bid', 'ask'];
	self._elements = {};
	self._data = {};
	self._history = [];

	self.initialize = function () {
		if (!self.isLoaded()) return;

		self._widget = document.getElementById("btc-quote");
		if (self._widget === null) {
			throw 'Please include a tag with the ID "btc-quote"';
		}

		self.createWidget();

		self.BTCRef = new Firebase("https://publicdata-bitcoin.firebaseio.com/");
		self.BTCRef.child("last").on("value", self.receiveBTCData);
		self.BTCRef.child("bid").on("value", self.receiveBTCData);
		self.BTCRef.child("ask").on("value", self.receiveBTCData);
	};

	self.addScript = function (src, callback) {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');

		script.onload = function () {
			callback(src);
		};

		// For older browsers from http://stackoverflow.com/a/6806773/1570248
		script.onreadystatechange = function() {
			var r = script.readyState;
			if (r === 'loaded' || r === 'complete') {
				callback(src);
				script.onreadystatechange = null;
			}
		};

		script.type = 'text/javascript';
		script.src = src;
		head.appendChild(script);
	};

	self.receiveBTCData = function (snapshot) {
		var name = snapshot.name();
		var value = parseFloat(snapshot.val());
		var oldValue = parseFloat(self._data[name]); 

		self.updateData(name, self.formatFloat(value));
		self.updateWidget();
		
		if (name == "last") {
			self.updateHistory(value);
			self.updateColor(oldValue, parseFloat(value));
		}

		if (self._data.bid && self._data.ask && self._data.last) {
			self.removeClassToElement(self._elements.slider, "btc-is-loading");
		}
	};

	self.isLoaded = function () {
		return window.Firebase !== null;
	};

	self.updateColor = function (oldPrice, newPrice) {
		if (newPrice < oldPrice) {
			self.addClassToElement(self._elements.lastWrapper, "btc-red");
		}else if (newPrice > oldPrice) {
			self.addClassToElement(self._elements.lastWrapper, "btc-green");
		}else{
			self.resetColor();
		}

		setTimeout(function () {
			self.resetColor();
		}, 2000);
	};

	self.updateData = function (name, value) {
		self._data[name] = value;
	};

	self.updateWidget = function () {
		for (var nameIndex=0; nameIndex<self._dataNames.length; nameIndex++) {
			var name = self._dataNames[nameIndex];
			var value = self._data[name]? self._data[name]:"";
			self._elements[name].innerHTML = value;
		}
	};

	self.createWidget = function () {
		self._widget.innerHTML = self._template;
		self._elements.bid = document.getElementById("btc-bid-field");
		self._elements.ask = document.getElementById("btc-ask-field");
		self._elements.last = document.getElementById("btc-last-field");
		self._elements.lastWrapper = document.getElementById("btc-last-wrapper");
		self._elements.slider = document.getElementById("btc-slider");

		self._elements.last.innerHTML = 0;

		if (!self.isOldBrowser) {
			new Odometer({el: self._elements.last, format: 'ddddd.dd'});
		}
	};

	self.updateHistory = function (value) {
		if (self._history.length === 0) {
			for (var i=0; i<50; i++) {
				self._history.push(value);
			}
		}
		self._history.push(value);
	};

	self.formatFloat = function (number) {
		var split = number.toString().split('.');
		var decimal = (split[1] !== undefined? split[1] : '') + (new Array(3-(split[1] !== undefined? split[1].length : 0))).join('0');
		return split[0] + '.' + decimal;
	};

	self.resetColor = function () {
		self.removeClassToElement(self._elements.lastWrapper, "btc-green");
		self.removeClassToElement(self._elements.lastWrapper, "btc-red");
	};

	// (add|remove)ClassFromElement from http://stackoverflow.com/a/6787464/1570248
	self.addClassToElement = function(el, className){
		el.className += ' '+className;   
	};

	self.removeClassToElement = function(el, className){
		var elClass = ' '+el.className+' ';
		while(elClass.indexOf(' '+className+' ') != -1)
			elClass = elClass.replace(' '+className+' ', '');
		el.className = elClass;
	};

	// Very vaguely determine if this is an older browser
	self.isOldBrowser = document.addEventListener === undefined;

	if (!self.isOldBrowser) {
		// 
(function() {
  var COUNT_FRAMERATE, COUNT_MS_PER_FRAME, DIGIT_FORMAT, DIGIT_HTML, DIGIT_SPEEDBOOST, DURATION, FORMAT_MARK_HTML, FORMAT_PARSER, FRAMERATE, FRAMES_PER_VALUE, MS_PER_FRAME, MutationObserver, Odometer, RIBBON_HTML, TRANSITION_END_EVENTS, TRANSITION_SUPPORT, VALUE_HTML, addClass, createFromHTML, fractionalPart, now, removeClass, requestAnimationFrame, round, transitionCheckStyles, trigger, wrapJQuery, _jQueryWrapped, _old, _ref, _ref1,
    __slice = [].slice;

  VALUE_HTML = '<span class="odometer-value"></span>';

  RIBBON_HTML = '<span class="odometer-ribbon"><span class="odometer-ribbon-inner">' + VALUE_HTML + '</span></span>';

  DIGIT_HTML = '<span class="odometer-digit"><span class="odometer-digit-spacer">8</span><span class="odometer-digit-inner">' + RIBBON_HTML + '</span></span>';

  FORMAT_MARK_HTML = '<span class="odometer-formatting-mark"></span>';

  DIGIT_FORMAT = '(,ddd).dd';

  FORMAT_PARSER = /^\(?([^)]*)\)?(?:(.)(d+))?$/;

  FRAMERATE = 30;

  DURATION = 2000;

  COUNT_FRAMERATE = 20;

  FRAMES_PER_VALUE = 2;

  DIGIT_SPEEDBOOST = .5;

  MS_PER_FRAME = 1000 / FRAMERATE;

  COUNT_MS_PER_FRAME = 1000 / COUNT_FRAMERATE;

  TRANSITION_END_EVENTS = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd';

  transitionCheckStyles = document.createElement('div').style;

  TRANSITION_SUPPORT = (transitionCheckStyles.transition != null) || (transitionCheckStyles.webkitTransition != null) || (transitionCheckStyles.mozTransition != null) || (transitionCheckStyles.oTransition != null);

  requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

  MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

  createFromHTML = function(html) {
    var el;
    el = document.createElement('div');
    el.innerHTML = html;
    return el.children[0];
  };

  removeClass = function(el, name) {
    return el.className = el.className.replace(new RegExp("(^| )" + (name.split(' ').join('|')) + "( |$)", 'gi'), ' ');
  };

  addClass = function(el, name) {
    removeClass(el, name);
    return el.className += " " + name;
  };

  trigger = function(el, name) {
    var evt;
    if (document.createEvent != null) {
      evt = document.createEvent('HTMLEvents');
      evt.initEvent(name, true, true);
      return el.dispatchEvent(evt);
    }
  };

  now = function() {
    var _ref, _ref1;
    return (_ref = (_ref1 = window.performance) != null ? typeof _ref1.now === "function" ? _ref1.now() : void 0 : void 0) != null ? _ref : +(new Date);
  };

  round = function(val, precision) {
    if (precision == null) {
      precision = 0;
    }
    if (!precision) {
      return Math.round(val);
    }
    val *= Math.pow(10, precision);
    val += 0.5;
    val = Math.floor(val);
    return val /= Math.pow(10, precision);
  };

  fractionalPart = function(val) {
    return val - round(val);
  };

  _jQueryWrapped = false;

  (wrapJQuery = function() {
    var property, _i, _len, _ref, _results;
    if (_jQueryWrapped) {
      return;
    }
    if (window.jQuery != null) {
      _jQueryWrapped = true;
      _ref = ['html', 'text'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        property = _ref[_i];
        _results.push((function(property) {
          var old;
          old = window.jQuery.fn[property];
          return window.jQuery.fn[property] = function(val) {
            var _ref1;
            if ((val == null) || (((_ref1 = this[0]) != null ? _ref1.odometer : void 0) == null)) {
              return old.apply(this, arguments);
            }
            return this[0].odometer.update(val);
          };
        })(property));
      }
      return _results;
    }
  })();

  setTimeout(wrapJQuery, 0);

  Odometer = (function() {
    function Odometer(options) {
      var e, k, property, v, _base, _i, _len, _ref, _ref1, _ref2,
        _this = this;
      this.options = options;
      this.el = this.options.el;
      if (this.el.odometer != null) {
        return this.el.odometer;
      }
      this.el.odometer = this;
      _ref = Odometer.options;
      for (k in _ref) {
        v = _ref[k];
        if (this.options[k] == null) {
          this.options[k] = v;
        }
      }
      if ((_base = this.options).duration == null) {
        _base.duration = DURATION;
      }
      this.MAX_VALUES = ((this.options.duration / MS_PER_FRAME) / FRAMES_PER_VALUE) | 0;
      this.resetFormat();
      this.value = this.cleanValue((_ref1 = this.options.value) != null ? _ref1 : '');
      this.renderInside();
      this.render();
      try {
        _ref2 = ['innerHTML', 'innerText', 'textContent'];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          property = _ref2[_i];
          if (this.el[property] != null) {
            (function(property) {
              return Object.defineProperty(_this.el, property, {
                get: function() {
                  var _ref3;
                  if (property === 'innerHTML') {
                    return _this.inside.outerHTML;
                  } else {
                    return (_ref3 = _this.inside.innerText) != null ? _ref3 : _this.inside.textContent;
                  }
                },
                set: function(val) {
                  return _this.update(val);
                }
              });
            })(property);
          }
        }
      } catch (_error) {
        e = _error;
        this.watchForMutations();
      }
      this;
    }

    Odometer.prototype.renderInside = function() {
      this.inside = document.createElement('div');
      this.inside.className = 'odometer-inside';
      this.el.innerHTML = '';
      return this.el.appendChild(this.inside);
    };

    Odometer.prototype.watchForMutations = function() {
      var e,
        _this = this;
      if (MutationObserver == null) {
        return;
      }
      try {
        if (this.observer == null) {
          this.observer = new MutationObserver(function(mutations) {
            var newVal;
            newVal = _this.el.innerText;
            _this.renderInside();
            _this.render(_this.value);
            return _this.update(newVal);
          });
        }
        this.watchMutations = true;
        return this.startWatchingMutations();
      } catch (_error) {
        e = _error;
      }
    };

    Odometer.prototype.startWatchingMutations = function() {
      if (this.watchMutations) {
        return this.observer.observe(this.el, {
          childList: true
        });
      }
    };

    Odometer.prototype.stopWatchingMutations = function() {
      var _ref;
      return (_ref = this.observer) != null ? _ref.disconnect() : void 0;
    };

    Odometer.prototype.cleanValue = function(val) {
      var badChars, regex;
      if (typeof val === 'string') {
        badChars = '.,';
        if (this.format.radix) {
          badChars = badChars.replace(this.format.radix, '');
        }
        regex = new RegExp("[" + badChars + "\s]", 'g');
        val = parseFloat(val.replace(regex, ''), 10) || 0;
      }
      return round(val, this.format.precision);
    };

    Odometer.prototype.bindTransitionEnd = function() {
      var event, renderEnqueued, _i, _len, _ref, _results,
        _this = this;
      if (this.transitionEndBound) {
        return;
      }
      this.transitionEndBound = true;
      renderEnqueued = false;
      _ref = TRANSITION_END_EVENTS.split(' ');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        event = _ref[_i];
        _results.push(this.el.addEventListener(event, function() {
          if (renderEnqueued) {
            return true;
          }
          renderEnqueued = true;
          setTimeout(function() {
            _this.render();
            renderEnqueued = false;
            return trigger(_this.el, 'odometerdone');
          }, 0);
          return true;
        }, false));
      }
      return _results;
    };

    Odometer.prototype.resetFormat = function() {
      var format, fractional, parsed, precision, radix, repeating, _ref, _ref1;
      format = (_ref = this.options.format) != null ? _ref : DIGIT_FORMAT;
      format || (format = 'd');
      parsed = FORMAT_PARSER.exec(format);
      if (!parsed) {
        throw new Error("Odometer: Unparsable digit format");
      }
      _ref1 = parsed.slice(1, 4), repeating = _ref1[0], radix = _ref1[1], fractional = _ref1[2];
      precision = (fractional != null ? fractional.length : void 0) || 0;
      return this.format = {
        repeating: repeating,
        radix: radix,
        precision: precision
      };
    };

    Odometer.prototype.render = function(value) {
      var classes, cls, digit, match, newClasses, theme, wholePart, _i, _j, _len, _len1, _ref;
      if (value == null) {
        value = this.value;
      }
      this.stopWatchingMutations();
      this.resetFormat();
      this.inside.innerHTML = '';
      theme = this.options.theme;
      classes = this.el.className.split(' ');
      newClasses = [];
      for (_i = 0, _len = classes.length; _i < _len; _i++) {
        cls = classes[_i];
        if (!cls.length) {
          continue;
        }
        if (match = /^odometer-theme-(.+)$/.exec(cls)) {
          theme = match[1];
          continue;
        }
        if (/^odometer(-|$)/.test(cls)) {
          continue;
        }
        newClasses.push(cls);
      }
      newClasses.push('odometer');
      if (!TRANSITION_SUPPORT) {
        newClasses.push('odometer-no-transitions');
      }
      if (theme) {
        newClasses.push("odometer-theme-" + theme);
      } else {
        newClasses.push("odometer-auto-theme");
      }
      this.el.className = newClasses.join(' ');
      this.ribbons = {};
      this.digits = [];
      wholePart = !this.format.precision || !fractionalPart(value) || false;
      _ref = value.toString().split('').reverse();
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        digit = _ref[_j];
        if (digit === this.format.radix) {
          wholePart = true;
        }
        this.addDigit(digit, wholePart);
      }
      return this.startWatchingMutations();
    };

    Odometer.prototype.update = function(newValue) {
      var diff,
        _this = this;
      newValue = this.cleanValue(newValue);
      if (!(diff = newValue - this.value)) {
        return;
      }
      removeClass(this.el, 'odometer-animating-up odometer-animating-down odometer-animating');
      if (diff > 0) {
        addClass(this.el, 'odometer-animating-up');
      } else {
        addClass(this.el, 'odometer-animating-down');
      }
      this.stopWatchingMutations();
      this.animate(newValue);
      this.startWatchingMutations();
      setTimeout(function() {
        _this.el.offsetHeight;
        return addClass(_this.el, 'odometer-animating');
      }, 0);
      return this.value = newValue;
    };

    Odometer.prototype.renderDigit = function() {
      return createFromHTML(DIGIT_HTML);
    };

    Odometer.prototype.insertDigit = function(digit, before) {
      if (before != null) {
        return this.inside.insertBefore(digit, before);
      } else if (!this.inside.children.length) {
        return this.inside.appendChild(digit);
      } else {
        return this.inside.insertBefore(digit, this.inside.children[0]);
      }
    };

    Odometer.prototype.addSpacer = function(chr, before, extraClasses) {
      var spacer;
      spacer = createFromHTML(FORMAT_MARK_HTML);
      spacer.innerHTML = chr;
      if (extraClasses) {
        addClass(spacer, extraClasses);
      }
      return this.insertDigit(spacer, before);
    };

    Odometer.prototype.addDigit = function(value, repeating) {
      var chr, digit, resetted;
      if (repeating == null) {
        repeating = true;
      }
      if (value === '-') {
        return this.addSpacer(value, null, 'odometer-negation-mark');
      }
      if (value === this.format.radix) {
        return this.addSpacer(value, null, 'odometer-radix-mark');
      }
      if (repeating) {
        resetted = false;
        while (true) {
          if (!this.format.repeating.length) {
            if (resetted) {
              throw new Error("Bad odometer format without digits");
            }
            this.resetFormat();
            resetted = true;
          }
          chr = this.format.repeating[this.format.repeating.length - 1];
          this.format.repeating = this.format.repeating.substring(0, this.format.repeating.length - 1);
          if (chr === 'd') {
            break;
          }
          this.addSpacer(chr);
        }
      }
      digit = this.renderDigit();
      digit.querySelector('.odometer-value').innerHTML = value;
      this.digits.push(digit);
      return this.insertDigit(digit);
    };

    Odometer.prototype.animate = function(newValue) {
      if (!TRANSITION_SUPPORT || this.options.animation === 'count') {
        return this.animateCount(newValue);
      } else {
        return this.animateSlide(newValue);
      }
    };

    Odometer.prototype.animateCount = function(newValue) {
      var cur, diff, last, start, tick,
        _this = this;
      if (!(diff = +newValue - this.value)) {
        return;
      }
      start = last = now();
      cur = this.value;
      return (tick = function() {
        var delta, dist, fraction;
        if ((now() - start) > _this.options.duration) {
          _this.value = newValue;
          _this.render();
          trigger(_this.el, 'odometerdone');
          return;
        }
        delta = now() - last;
        if (delta > COUNT_MS_PER_FRAME) {
          last = now();
          fraction = delta / _this.options.duration;
          dist = diff * fraction;
          cur += dist;
          _this.render(Math.round(cur));
        }
        if (requestAnimationFrame != null) {
          return requestAnimationFrame(tick);
        } else {
          return setTimeout(tick, COUNT_MS_PER_FRAME);
        }
      })();
    };

    Odometer.prototype.getDigitCount = function() {
      var i, max, value, values, _i, _len;
      values = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (i = _i = 0, _len = values.length; _i < _len; i = ++_i) {
        value = values[i];
        values[i] = Math.abs(value);
      }
      max = Math.max.apply(Math, values);
      return Math.ceil(Math.log(max + 1) / Math.log(10));
    };

    Odometer.prototype.getFractionalDigitCount = function() {
      var i, parser, parts, value, values, _i, _len;
      values = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      parser = /^\d*\.(\d*?)0*$/;
      for (i = _i = 0, _len = values.length; _i < _len; i = ++_i) {
        value = values[i];
        values[i] = value.toString();
        parts = parser.exec(values[i]);
        if (parts == null) {
          values[i] = 0;
        } else {
          values[i] = parts[1].length;
        }
      }
      return Math.max.apply(Math, values);
    };

    Odometer.prototype.resetDigits = function() {
      this.digits = [];
      this.ribbons = [];
      this.inside.innerHTML = '';
      return this.resetFormat();
    };

    Odometer.prototype.animateSlide = function(newValue) {
      var boosted, cur, diff, digitCount, digits, dist, end, fractionalCount, frame, frames, i, incr, j, mark, numEl, oldValue, start, _base, _i, _j, _k, _l, _len, _len1, _len2, _m, _ref, _results;
      oldValue = this.value;
      fractionalCount = this.getFractionalDigitCount(oldValue, newValue);
      if (fractionalCount) {
        newValue = newValue * Math.pow(10, fractionalCount);
        oldValue = oldValue * Math.pow(10, fractionalCount);
      }
      if (!(diff = newValue - oldValue)) {
        return;
      }
      this.bindTransitionEnd();
      digitCount = this.getDigitCount(oldValue, newValue);
      digits = [];
      boosted = 0;
      for (i = _i = 0; 0 <= digitCount ? _i < digitCount : _i > digitCount; i = 0 <= digitCount ? ++_i : --_i) {
        start = Math.floor(oldValue / Math.pow(10, digitCount - i - 1));
        end = Math.floor(newValue / Math.pow(10, digitCount - i - 1));
        dist = end - start;
        if (Math.abs(dist) > this.MAX_VALUES) {
          frames = [];
          incr = dist / (this.MAX_VALUES + this.MAX_VALUES * boosted * DIGIT_SPEEDBOOST);
          cur = start;
          while ((dist > 0 && cur < end) || (dist < 0 && cur > end)) {
            frames.push(Math.round(cur));
            cur += incr;
          }
          if (frames[frames.length - 1] !== end) {
            frames.push(end);
          }
          boosted++;
        } else {
          frames = (function() {
            _results = [];
            for (var _j = start; start <= end ? _j <= end : _j >= end; start <= end ? _j++ : _j--){ _results.push(_j); }
            return _results;
          }).apply(this);
        }
        for (i = _k = 0, _len = frames.length; _k < _len; i = ++_k) {
          frame = frames[i];
          frames[i] = Math.abs(frame % 10);
        }
        digits.push(frames);
      }
      this.resetDigits();
      _ref = digits.reverse();
      for (i = _l = 0, _len1 = _ref.length; _l < _len1; i = ++_l) {
        frames = _ref[i];
        if (!this.digits[i]) {
          this.addDigit(' ', i >= fractionalCount);
        }
        if ((_base = this.ribbons)[i] == null) {
          _base[i] = this.digits[i].querySelector('.odometer-ribbon-inner');
        }
        this.ribbons[i].innerHTML = '';
        if (diff < 0) {
          frames = frames.reverse();
        }
        for (j = _m = 0, _len2 = frames.length; _m < _len2; j = ++_m) {
          frame = frames[j];
          numEl = document.createElement('div');
          numEl.className = 'odometer-value';
          numEl.innerHTML = frame;
          this.ribbons[i].appendChild(numEl);
          if (j === frames.length - 1) {
            addClass(numEl, 'odometer-last-value');
          }
          if (j === 0) {
            addClass(numEl, 'odometer-first-value');
          }
        }
      }
      mark = this.inside.querySelector('.odometer-radix-mark');
      if (mark != null) {
        mark.parent.removeChild(mark);
      }
      if (fractionalCount) {
        return this.addSpacer(this.format.radix, this.digits[fractionalCount - 1], 'odometer-radix-mark');
      }
    };

    return Odometer;

  })();

  Odometer.options = (_ref = window.odometerOptions) != null ? _ref : {};

  setTimeout(function() {
    var k, v, _base, _ref1, _results;
    if (window.odometerOptions) {
      _ref1 = window.odometerOptions;
      _results = [];
      for (k in _ref1) {
        v = _ref1[k];
        _results.push((_base = Odometer.options)[k] != null ? (_base = Odometer.options)[k] : _base[k] = v);
      }
      return _results;
    }
  }, 0);

  Odometer.init = function() {
    var el, elements, _i, _len, _ref1, _results;
    if (document.querySelectorAll == null) {
      return;
    }
    elements = document.querySelectorAll(Odometer.options.selector || '.odometer');
    _results = [];
    for (_i = 0, _len = elements.length; _i < _len; _i++) {
      el = elements[_i];
      _results.push(el.odometer = new Odometer({
        el: el,
        value: (_ref1 = el.innerText) != null ? _ref1 : el.textContent
      }));
    }
    return _results;
  };

  if ((((_ref1 = document.documentElement) != null ? _ref1.doScroll : void 0) != null) && (document.createEventObject != null)) {
    _old = document.onreadystatechange;
    document.onreadystatechange = function() {
      if (document.readyState === 'complete' && Odometer.options.auto !== false) {
        Odometer.init();
      }
      return _old != null ? _old.apply(this, arguments) : void 0;
    };
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      if (Odometer.options.auto !== false) {
        return Odometer.init();
      }
    }, false);
  }

  window.Odometer = Odometer;

}).call(this);

	}

	// Initialize widget by loading Firebase.js
	self.addScript('https://cdn.firebase.com/v0/firebase.js', self.initialize);

	// Template/Image data
	var BITCOIN_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAA4CAYAAACohjseAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAxMC8wOC8xM5fRr+oAAAAfdEVYdFNvZnR3YXJlAE1hY3JvbWVkaWEgRmlyZXdvcmtzIDi1aNJ4AAAHq3ByVld4nO2beWgcVRzHd9qZcWc6m/2nUA/8WUUhRSyS9caICCKKiiAqBPFADFJEigdikVIN4oF4IB4Rz3r0sqexTducxrYhLCG2JD1ID3urpSrV4l8+v3Pum7eTOTbpDOK+4bvZJtv9vd/v83u/d8zu0D89v+Xm5+Yzs5UZazcfymVWxpNWVi6x9lbWjsccay2x1ly5vVRuz5Vbc3h1XFmtqelv1tx8mpVKf7I5c06x2bN/Z7NmnWSFwq9s+vRjLJc7Ah2CDkD7o...(line truncated)...
	var BACKGROUND_GRADIENT = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAA8KCgsLCw8MDA8WDw0PFhkTDw8TGR4XFxcXFx4eFxoaGhoXHh0iIyQjIh0sLC8vLCw7Ojo6Ozs7Ozs7Ozs7Ozv/2wBDARAPDxESERYSEhYXEhQSFx0YGBgYHScdHR0dHScuJCAgICAkLiotJycnLSozMy4uMzM7Ozo7Ozs7Ozs7Ozs7Ozv/wgARCABGAAEDAREAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAIG/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEAMQAAAB0IJJJJAB/8QAFBABAAAAAAAAAAAAAAAAAAAAMP/aAAgBAQABBQIf/8QAFBEBAAAAAAAAAAAAAAAAAAAAMP/aAAgBAwEBPwEf/8QAFBEBAAAAAAAAAAAAAAAAAAAAMP/aAAgBAgEBPwEf/8QAF...(line truncated)...

	self._template = [
		'<style>',
			'#btc-last-wrapper {transition: 0.2s linear color; -o-transition: 0.2s linear color; -moz-transition: 0.2s linear color; -webkit-transition: 0.2s linear color; color: #4B4B4B;}',
			'#btc-last-wrapper.btc-red {color: red;}', 
			'#btc-last-wrapper.btc-green {color: green;}',
			'#btc-slider {transition: 0.1s ease-in top; -o-transition: 0.1s ease-in top; -moz-transition: 0.1s ease-in top; -webkit-transition: 0.1s ease-in top; top: 0px; position: relative;}',
			'#btc-slider.btc-is-loading {top: -72px;}',
			'.odometer .odometer-inside {position: relative; top: -5px;}',
			'.odometer.odometer-auto-theme, .odometer.odometer-theme-minimal { display: -moz-inline-stack; display: inline-block; vertical-align: middle; *vertical-align: auto; zoom: 1; *display: inline; position: relative; }',
			'.odometer.odometer-auto-theme .odometer-digit, .odometer.odometer-theme-minimal .odometer-digit { display: -moz-inline-stack; display: inline-block; vertical-align: middle; *vertical-align: auto; zoom: 1; *display: inline; position: relative; }',
			'.odometer.odometer-auto-theme .odometer-digit .odometer-digit-spacer, .odometer.odometer-theme-minimal .odometer-digit .odometer-digit-spacer { display: -moz-inline-stack; display: inline-block; vertical-align: middle; *vertical-align: auto; zoom: 1; *display: inline; visibility: hidden; }',
			'.odometer.odometer-auto-theme .odometer-digit .odometer-digit-inner, .odometer.odometer-theme-minimal .odometer-digit .odometer-digit-inner { text-align: left; display: block; position: absolute; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden; }',
			'.odometer.odometer-auto-theme .odometer-digit .odometer-ribbon, .odometer.odometer-theme-minimal .odometer-digit .odometer-ribbon { display: block; }',
			'.odometer.odometer-auto-theme .odometer-digit .odometer-ribbon-inner, .odometer.odometer-theme-minimal .odometer-digit .odometer-ribbon-inner { display: block; }',
			'.odometer.odometer-auto-theme .odometer-digit .odometer-value, .odometer.odometer-theme-minimal .odometer-digit .odometer-value { display: block; }',
			'.odometer.odometer-auto-theme .odometer-digit .odometer-value.odometer-last-value, .odometer.odometer-theme-minimal .odometer-digit .odometer-value.odometer-last-value { position: absolute; }',
			'.odometer.odometer-auto-theme.odometer-animating-up .odometer-ribbon-inner, .odometer.odometer-theme-minimal.odometer-animating-up .odometer-ribbon-inner { -webkit-transition: -webkit-transform 2s; -moz-transition: -moz-transform 2s; -ms-transition: -ms-transform 2s; -o-transition: -o-transform 2s; transition: transform 2s; }',
			'.odometer.odometer-auto-theme.odometer-animating-up.odometer-animating .odometer-ribbon-inner, .odometer.odometer-theme-minimal.odometer-animating-up.odometer-animating .odometer-ribbon-inner { -webkit-transform: translateY(-100%); -moz-transform: translateY(-100%); -ms-transform: translateY(-100%); -o-transform: translateY(-100%); transform: translateY(-100%); }',
			'.odometer.odometer-auto-theme.odometer-animating-down .odometer-ribbon-inner, .odometer.odometer-theme-minimal.odometer-animating-down .odometer-ribbon-inner { -webkit-transform: translateY(-100%); -moz-transform: translateY(-100%); -ms-transform: translateY(-100%); -o-transform: translateY(-100%); transform: translateY(-100%); }',
			'.odometer.odometer-auto-theme.odometer-animating-down.odometer-animating .odometer-ribbon-inner, .odometer.odometer-theme-minimal.odometer-animating-down.odometer-animating .odometer-ribbon-inner { -webkit-transition: -webkit-transform 2s; -moz-transition: -moz-transform 2s; -ms-transition: -ms-transform 2s; -o-transition: -o-transform 2s; -o-transition: -o-transform 2s; transition: transform 2s; -webkit-transform: translateY(0); -moz-transform: translateY(0); -ms-transform: translateY(0); -o-transform:...(line truncated)...
		'</style>',
		'<div class="btc-box" style="height: 71px; width: 212px; font-size: 12px; font-family: Arial; position: relative; overflow:hidden; border-radius: 4px; border: 0px solid #D6D4D7;">',
			'<div class="btc-is-loading" id="btc-slider">',
				'<div class="btc-box" style="height: 71px; width: 212px; font-size: 12px; line-height: 1;">',
					
					'<div id="btc-last-wrapper" style="position: absolute; font-weight: bold; top: 8px; height: 38px; line-height: 30px; width: 140px; text-align: left; font-size: 30px;">',
						'$<span class="odometer" id="btc-last-field" style="padding-top: 4px;"></span>',
					'</div>',
					'<div class="btc-hides" style="position: absolute; left: 0px; top: 40px; margin-right: 10px;">',
						'<span style="font-size: 10px; color: #999; width: 150px;">Bid: ',
							'<b style="font-weight: bold; font-size: 10px; color: #999;">$</b><b id="btc-bid-field" style="font-weight: bold; font-size: 10px; color: #999;"></b>',
						'</span>',
						'<span style="font-size: 10px; color: #999; margin-left: 2px;">Ask: ',
							'<b style="font-weight: bold; font-size: 10px; color: #999;">$</b><b id="btc-ask-field" style="font-weight: bold; font-size: 10px; color: #999;"></b>',
						'</span>',
						
					'</div>',
				'</div>',
				'<div class="btc-box" style="height: 71px; width: 212px; font-size: 12px; text-align: center; line-height: 70px; color: #aaa; font-size: 14px;">Loading...</div>',
			'</div>',
		'</div>'
	].join('\n');
};

var _bq = new BTCQuote();

